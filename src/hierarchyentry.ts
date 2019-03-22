import { ListFile } from './listfile';


/**
 * Enum used for the labels to distinguish code from
 * data and const (equ) labels.
 */
export enum LabelType {
    UNKNOWN,
    MODULE,
    CODE,
    DATA,
    CONST
};


/**
 * The elements for the hierarchy map.
 * E.g. text.layer2.print_string, text.ula.print_string, text.layer2.print_char,  will become:
 * text - layer2 - print_string
 *     +- ula - print_string
 *           +- print_char
 */
export class HierarchyEntry {
    
    /// The line number(s) of the label. Is empty if it does not exist.
    /// Module labels can have several entries.
    public lineNumbers: Array<number>;

    /// The elements included in an entry. E.g. we are at MODULE level and the
    /// elements are the subroutines. Could be an empty map.
    public elements: Map<string,HierarchyEntry>;

    /// The descriptions of the sub routines.
    public description: string|undefined;

    /// The type of the label (code, data or const).
    public labelType: LabelType;

    /// The line that should be printed. Normally the label itself, but 
    /// e.g. for const it also includes the constant data.
    public printLabel: string;

    /// The value of the label. Either its address or real value (EQU).
    /// -1 = not used.
    public labelValue: number;


    /**
     * Initializes the entry.
     * @param label E.g. "sprite.move"
     */
    constructor(label?: string) {
        this.lineNumbers = [];   // empty/undefined
        this.elements = new Map<string,HierarchyEntry>();
        this.description = undefined;
        this.printLabel = label as any;
        this.labelValue = -1;    // Not used
        this.labelType = LabelType.UNKNOWN;
    }


    /**
     * Searches the hierarchy from top entry to bottom for a given label.
     * @param label E.g. 'text.ula.print_string"
     * @return The corresponding hierarchy element or undefined if not found.
     */
    public getEntry(label: string): HierarchyEntry|undefined {
        // Split first part
        const k = label.indexOf('.');
        if(k < 0) {
            // End found
            return this.elements.get(label);
        }
        const first = label.substr(0, k);
        // Get the rest
        const remaining = label.substr(k+1);
        // Get the part iteratively
        const entry = this.elements.get(first);
        if(!entry)
            return undefined;
        return entry.getEntry(remaining);
    }


    /**
     * For all entries with line numbers the description is extracted 
     * from the file.
     * I.e. the comment lines above the label are used.
     * @param lines All lines of the file.
     * @param maxEmptyLines The max number of empty lines before a label.
     */
    public setDescriptions(lines: Array<string>, maxEmptyLines: number) {
        // Check if any line number
        if(this.lineNumbers.length > 0) {
            // Check type of description (after-comment, lines-before-comment) and type of label (code, data, const/equ)
            let afterComments;
            let linesUntilNextCmd;
            for(const lineNumber of this.lineNumbers) {
                linesUntilNextCmd = this.getLinesUntilNextCmd(lineNumber, lines)
                const stripped = this.stripAfterComments(linesUntilNextCmd);
                if(stripped) {
                    if(afterComments)
                        afterComments += '\n\n' + stripped;
                    else 
                        afterComments = stripped;
                }
            }
            if(afterComments) {
                // Use after-comment as description.
                this.description = afterComments;
            }
            else {
                // Check description above current line
                for(const lineNumber of this.lineNumbers) {
                    const descr = HierarchyEntry.getSingleDescription(lineNumber, lines, maxEmptyLines);
                    if(descr) {
                        if(this.description)
                            this.description += '\n\n' + descr;
                        else
                            this.description = descr; 
                    }
                }
            }

            // Check if type already known
            if(this.labelType == LabelType.UNKNOWN) {
                // Check the type
                const len = linesUntilNextCmd.length;
                this.labelType = this.getLabelType(linesUntilNextCmd[len-1]);

                // Change the printed label if it is a EQU
                if(this.labelType == LabelType.CONST) {
                    let hexString = this.labelValue.toString(16).toUpperCase();
                    hexString = "0".repeat(4-hexString.length) + hexString; 
                    this.printLabel += ' = 0x' + hexString + ' (' + this.labelValue + ')';
                }
            }
        }

        // Iteratively dive into the sub labels
        for(const [, entry] of this.elements) {
            entry.setDescriptions(lines, maxEmptyLines);
        }
    }


    /**
     * Retrieves the description/the comments above a label
     * And strips the comments.
     * @param lineNumber The line number of the label. The description is 
     * above. Starts at 0.
     * @param lines All lines of the file.
     * @param maxEmptyLines The max number of empty lines before a label.
     * @returns The string with the description (multi-line) or undefined if
     * no description found or lineNumber < 0.
     */
    protected static getSingleDescription(lineNumber: number, lines: Array<string>, maxEmptyLines: number): string|undefined {
         // Check area above label for comments.

        // First skip empty lines
        let k = lineNumber;
        while(true) {
            k --;
            if(k < 0)
                return undefined; // Already at start of file -> no description text
            const line = ListFile.getMainLine(lines[k]);
            const match = /^\s*$/.exec(line);
            if(!match)
                break;  // Non-empty line found.
            // Check if too many empty lines
            if(lineNumber-k > maxEmptyLines)
                return undefined; // Give up if too many empty lines
        }
        // k now points to first non-empty line above the label.

        // Now take all lines that start with a comment as consecutive description.
       const descr = new Array<string>();
       for(; k>=0; k--) {
            const line = ListFile.getMainLine(lines[k]);
            const match = /^\s*;(.*)/.exec(line);
            if(!match)
                break;  // Line that is no comment-line found
            // Add match to description
            const comment = match[1];
            descr.unshift(comment);
        }

        // Use description
        return descr.join('\n');
    }



    /**
     * Iterates the complete hierarchy and calls the given handler
     * for each element.
     * @param enterHandler(label, entry) Called on every new element.
     * @param exitHandler(label, entry) Called when the element is "left".
     * @param prevLabel The label from the previous iteration. Not intended to be set by
     * the caller of this function but used in iteration.
     */
    public iterate(enterHandler: (label: string, entry: HierarchyEntry) => void, exitHandler = (label: string, entry: HierarchyEntry) => {}, prevLabel = '') {
        // Call handler for all elements.
        for(const [label,entry] of this.elements) {
            // Create complete label
            let totalLabel = label;
            if(prevLabel.length > 0)
                totalLabel = prevLabel + '.' + totalLabel;
            // Call handlers and call recursively
            enterHandler(totalLabel, entry);
            entry.iterate(enterHandler, exitHandler, totalLabel);
            exitHandler(totalLabel, entry);
        }
    }


    /**
     * Returns all lines starting at line number until a line is found
     * that is not only a comment line or empty.
     * The lines are stripped for the first 24 characters.
     * @param lineNumber The line number to  start searching from.
     * @param lines All truncated lines.
     * @return An array with lines. 1rst line contains the label, last 
     * line contains the command (opcode or defb/w or equ). All lines may
     * contain comments.
     */
    protected getLinesUntilNextCmd(lineNumber: number, lines: Array<string>): Array<string> {
        const resultLines: Array<string> = [];
        // Safety check
        const len = lines.length;
        if(lineNumber >= len || lineNumber < 0)
            return resultLines;
        // Check first line
        const firstLine = ListFile.getMainLine(lines[lineNumber])
        resultLines.push(firstLine);
        const matchFirstLine = /^\w[\w\.]*:?\s+[^;\s]+/.exec(firstLine);
        if(matchFirstLine)
            return resultLines;
        // Loop other lines
        for(let k=lineNumber+1; k<len; k++) {
            const line = ListFile.getMainLine(lines[k])
            // Check if it starts with a label
            const match2 = /^[\w\.]+/.exec(line);
            if(match2) 
                break;
            // Add current line    
            resultLines.push(line);
            // Check for command
            const match = /^\s*[^;\s]+/.exec(line);
            if(match)
                break;
        }
        return resultLines;
    }


    /**
     * Strips off the comments in all lines of the array and returns 
     * one string with all lines.
     * Returns as soon as one line without comments is found.
     * @param linesUntilNextCmd Array of already truncated lines.
     * @return A string that contains all comments (without ;) or undefined 
     * if no comments have been found.
     */
    protected stripAfterComments(linesUntilNextCmd: Array<string>): string|undefined {
        let allComments = '';
        for(const line of linesUntilNextCmd) {
            const match = /^[^;]*;(.*)/.exec(line);
            if(!match) 
                break;
            allComments += match[1] + '\n';
        }
        // Check if comment contains only spaces and new lines.
        let trim = allComments.replace(/\n/g, '');
        trim = trim.replace(/\s/g, '');
        trim = trim.trim();
        if(trim.length == 0) 
            return undefined;
        // Strip last newline
        allComments = allComments.substr(0, allComments.length-1);
        return allComments;
    }


    /**
     * Tries to interprete the command used in the line and returns its type, e.g. code, data or const.
     * @param line A (truncated) line from the list file. Should contain "def,db,dw,equ" or an opcode
     * @return 
     */
    protected getLabelType(line: string): LabelType {
        if(!line)
            return LabelType.UNKNOWN;
        const match = /^((\w[\w\.]*):?)?\s*([^;\s]*)/.exec(line);
        if(!match) 
            return LabelType.UNKNOWN;

        // Check command
        const found = match[3].toLowerCase();
        if(found == 'equ')  
            return LabelType.CONST;
        if(found.startsWith('def')
            || found == 'db' 
            || found == 'dw'
            || found == 'byte'
            || found == 'word')   return LabelType.DATA;
        // Everything else is code
        return LabelType.CODE;
    }
}
