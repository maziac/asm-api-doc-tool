import { readFileSync } from 'fs';
import { HierarchyEntry } from './hierarchyentry';




/**
 * Class to represent the list file.
 */
export class LabelsFile {
    /// All the lines of text read from the file.
    public lines: Array<string>;

    /**
     * Reads the labels file.
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
     * @return A hierarchy with 
     */
    public getExports(): HierarchyEntry {
        // Create map
        const hierarchyMap = new HierarchyEntry();
        // Parse all lines
        for(const line of this.lines) {
            // Parsing: A list file line looks like this: 
            // "math.udiv_hl_e: EQU 0x00000059"
            const match = /^(\w[\w\.]*):?\s*equ\s+(.*)/i.exec(line);
            if(match) {
                // Get label
                const label = match[1];
                // Divide dots and put all parts in an own map
                const labelParts = label.split('.');
                let map = hierarchyMap;
                let subLabel;
                for(const part of labelParts) {
                    subLabel = (subLabel) ? subLabel+'.'+part : part;
                    // Check if label already exists in map
                    let nextMap = map.elements.get(part);
                    if(!nextMap) {
                        // Create new entry 
                        nextMap = new HierarchyEntry(subLabel);
                        map.elements.set(part, nextMap);
                    }
                    // Next
                    map = nextMap;
                }
                // Add value to last map
                const value = parseInt(match[2]);
                map.labelValue = value;
            }
        }

        // Return
        return hierarchyMap;
    }

}

