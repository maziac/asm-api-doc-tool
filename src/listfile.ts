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
        const mainLine = line.substr(24);
        return mainLine;
    }


    /**
     * Returns all labels with line numbers that are included in the
     * 'exports'.
     * Parses the list file lines, searches for "EXPORT" and creates a hierarchy map out of it.
     * The map is a map-of-maps.
     * E.g. text.layer2.print_string, text.ula.print_string, text.layer2.print_char,  will become:
     * text - layer2 - print_string
     *     +- ula - print_string
     *           +- print_char
     * @param exports Contains all labels that should be returned.
     * @return A label / line number relationship. Not all entries in the map will contain line numbers.
     * Only the leafs (i.e. subroutines).
     */
    public getExports(): HierarchyEntry {
        // Create map
        const hierarchyMap = new HierarchyEntry();
        // Parse all lines
        for(const line of this.lines) {
            // Parsing: A list file line looks like this: 
            // "  76  2621                  EXPORT text.ula.print_string "
            const match = /^\s*[0-9]+[\s+]+[0-9a-f]+\s+export\s+([^;]*?)(;.*)?$/i.exec(line);
            if(match) {
                // Remove spaces from the label.
                const rawLabel = match[1];
                //const label = rawLabel.replace(/\s/g,'');
                const label = rawLabel.trim();
                // Divide dots and put all parts in an own map
                const labelParts = label.split('.');
                let map = hierarchyMap;
                for(const part of labelParts) {
                    // Check if label already exists in map
                    let nextMap = map.elements.get(part);
                    if(!nextMap) {
                        // Create new entry 
                        nextMap = new HierarchyEntry();
                        map.elements.set(part, nextMap);
                    }
                    // Next
                    map = nextMap;
                }
            }
        }

        // Return
        return hierarchyMap;
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

