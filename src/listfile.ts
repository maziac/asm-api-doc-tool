import { readFileSync } from 'fs';
import { HierarchyEntry, LabelType } from './hierarchyentry';




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
        let structs: Array<string> = [];
        
        for(const line of this.lines) {
            lineNumber ++;

            // Skip file openend/closed (include) files.
            if(line.startsWith('#'))
                continue;

            // sjasmplus allows for fix parsing so we simply drop all characters in front of the label.
            // "   4+ 0B55              ; The main game loop."
            //  0123456789012345678901234
            const remaningLine = ListFile.getMainLine(line);

            // Skip line if too short
            if(remaningLine.length == 0)
                continue;
                
            // Skip ~ lines (but not STRUCTs)
            if(line[11] == '~' && structs.length == 0)
                continue;

            // Parsing: We are looking for MODULE.
            // A list file line with a label looks like this: 
            // "  10+ 0A80                  MODULE text "
            const moduleMatch = /^\s+module\s+([\w.]+)/i.exec(remaningLine);
            if(moduleMatch) {
                // Get module.
                const relModule = moduleMatch[1];  // e.g. "text"
                // Add relative module
                modules.push(relModule);
                // Search for label in exports
                const moduleLabel = modules.join('.');
                const entry = exports.getEntry(moduleLabel);
                if(entry) {
                    // Add type
                    entry.labelType = LabelType.MODULE;
                    // Add line number
                    entry.lineNumbers.push(lineNumber);
                }
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

            // Parsing: We are looking for STRUCT.
            // A list file line with a label looks like this: 
            // " 335+ 0B55                  ENDMODULE "
            const structMatch = /^\s+struct\s+([\w.]+)$/i.exec(remaningLine);
            if(structMatch) {
                // Get struct name.
                const structName = structMatch[1];  // e.g. "ATTRIBS"
                // Add name
                structs.push(structName);
                // Next line 
                continue;
            }

            // Parsing: We are looking for STRUCT.
            // A list file line with a label looks like this: 
            // " 335+ 0B55                  ENDMODULE "
            const endStructMatch = /^\s+ends\s*$/i.exec(remaningLine);
            if(endStructMatch) {
                // Remove 
                structs.pop();
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
                let label = '';
                if(modules.length > 0)
                    label += modules.join('.') + '.';
                if(structs.length > 0)
                    label += structs.join('.') + '.';
                label += relLabel;
                // Search for label in exports
                const entry = exports.getEntry(label);
                // Check if label should be exported
                if(entry) {
                    // Add line number
                    entry.lineNumbers.push(lineNumber);
                    // If it is a struct component then the label is a const.
                    if(structs.length > 0) {
                        entry.labelType = LabelType.CONST;
                    }
                }
            }
        }
    }

}

