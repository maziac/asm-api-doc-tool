import { readFileSync } from 'fs';



/**
 * The elements for the hierarchy map.
 * E.g. text.layer2.print_string, text.ula.print_string, text.layer2.print_char,  will become:
 * text - layer2 - print_string
 *     +- ula - print_string
 *           +- print_char
 */
class HierarchyEntry {
    /// The line number of the label. Could be -1 if it does not exist.
    public lineNumber: number;

    /// The elements included in an entry. E.g. we are at MODULE level and the
    /// elements are the subroutines. Could be an empty map.
    public elements: Map<string,HierarchyEntry>;

    /**
     * Initializes the entry.
     */
    constructor() {
        this.lineNumber = -1;   // undefined
        this.elements = new Map<string,HierarchyEntry>();
    }


    /**
     * Searches the hierarchy from top entry to bottom for a given label.
     * @param label E.g. 'text.ula.print_string"
     * @return The corresponding hierarchy element or undefined if not found.
     */
    getEntry(label: string): HierarchyEntry {

    }
}


/**
 * Class to represent the list file.
 */
class ListFile {
    protected lines: Array<string>;

    /**
     * Reads the list file.
     * @param filename 
     */
    constructor(filename: string) {
        this.lines = readFileSync(filename).toString().split('\n');
		
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
        let lineNumber = 0;
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
                // Add line number to leaf (subroutine)
                map.lineNumber = lineNumber;
                // Next
                lineNumber ++;
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
    public getLabels(exports: HierarchyEntry) {
        // Parse all lines
        let lineNumber = 0;
        let module = '';
        for(const line of this.lines) {
            // sjasmplus allows for fix parsing so we simply drop all characters in front of the label.
            const remaningLine = line.substr(34);

            // Parsing: We are looking for MODULE.
            // A list file line with a label looks like this: 
            // "  10+ 0A80                  MODULE text "
            const moduleMatch = /^\s+module\s+([\w.]+)/i.exec(remaningLine);
            if(moduleMatch) {
                // Remove all spaces from the label.
                const relModule = moduleMatch[1];  // e.g. "text"
                // Add relative module
                module += '.' + relModule;
                // Next line 
                continue;
            }

            // Parsing: We are looking for ENDMODULE.
            // A list file line with a label looks like this: 
            // " 335+ 0B55                  ENDMODULE "
            const endmoduleMatch = /^\s+endmodule\W/i.exec(remaningLine);
            if(endmoduleMatch) {
                // Remove last relative module
                const k = module.lastIndexOf('.');
                module = module.substr(0,k);
                // Next line 
                continue;
            }

            // Parsing: We are looking for labels.
            // A list file line with a label looks like this: 
            // "  76+ 0A8E              ula.print_char: "
            const labelMatch = /^([\w.]+):?\s*(;.*)?$/i.exec(remaningLine);
            if(labelMatch) {
                // Remove all spaces from the label.
                const relLabel = labelMatch[1];  // e.g. "ula.print.char"
                // Add module
                const label = module + '.' + relLabel;
                // Search for label in exports
                const entry = exports.getEntry(label);
                // Add line number
                entry.lineNumber = lineNumber;
                // Next
                lineNumber ++;
           }
        }
    }
}

