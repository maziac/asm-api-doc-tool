
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
    public getEntry(label: string): HierarchyEntry|undefined {
        // Split the label into parts
        const labelParts = label.split('.');
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
        const entry = this.elements.get(label);
        if(!entry)
            return undefined;
        return entry.getEntry(remaining);
    }
}
