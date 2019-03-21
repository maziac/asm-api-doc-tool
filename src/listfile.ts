import { readFileSync } from 'fs';
import { HierarchyEntry } from './hierarchyentry';




/**
 * Class to represent the list file.
 */
export class ListFile {
    /// All the lines of text read from the file.
    public lines: Array<string>;

    /**
     * Reads the list file.
     * @param filename 
     */
    constructor(filename: string) {
        this.lines = readFileSync(filename).toString().split('\n');	
    }


    /**
     * Returns the main line. I.e. strips the line number address and bytes.
     * @param line The original line.
     */
    public static getMainLine(line: string): string {
        console.log('getMainLine line=' + line);

        const mainLine = line.substr(24);
        return mainLine;
    }


    /**
     * Returns an array with all labels that are in the exports
     * map.
     * @return A list of strings that contains all labels.
     */
    public addLineNumbers(exports: HierarchyEntry) {
        // Parse all lines
        let lineNumber = -1;
        let modules: Array<string> = [];
        for(const line of this.lines) {
            lineNumber ++;

            // Skip file openend/closed (include) files.
            if(line.startsWith('#'))
                continue;

            // sjasmplus allows for fix parsing so we simply drop all characters in front of the label.
            // "   4+ 0B55              ; The main game loop."
            //  0123456789012345678901234
            const remaningLine = ListFile.getMainLine(line);

            // Parsing: We are looking for MODULE.
            // A list file line with a label looks like this: 
            // "  10+ 0A80                  MODULE text "
            const moduleMatch = /^\s+module\s+([\w.]+)/i.exec(remaningLine);
            if(moduleMatch) {
                // Remove all spaces from the label.
                const relModule = moduleMatch[1];  // e.g. "text"
                // Add relative module
                modules.push(relModule);
                // Next line 
                continue;
            }

            // Parsing: We are looking for ENDMODULE.
            // A list file line with a label looks like this: 
            // " 335+ 0B55                  ENDMODULE "
            const endmoduleMatch = /^\s+endmodule\s*$/i.exec(remaningLine);
            if(endmoduleMatch) {
                // Remove last relative module
                modules.pop();
                // Next line 
                continue;
            }

            // Parsing: We are looking for labels. Local labels are omitted.
            // A list file line with a label looks like this: 
            // "  76+ 0A8E              ula.print_char: "
            const labelMatch = /^(\w[\w\.]*):?\s*(.*)/i.exec(remaningLine);
            if(labelMatch) {
                // Remove all spaces from the label.
                const relLabel = labelMatch[1];  // e.g. "ula.print.char"
                // Add module
                let label = relLabel;
                if(modules.length > 0)
                    label = modules.join('.') + '.' + label;
                // Search for label in exports
                const entry = exports.getEntry(label);
                // Check if label should be exported
                if(entry) {
                    // Add line number
                    entry.lineNumber = lineNumber;
                }
            }
        }
    }

}

