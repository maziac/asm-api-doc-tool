




/**
 * The main program.
 */
class Startup {

    /// String containing all whitespaces.
    protected static whiteSpaces = ' \t\n\r';

    /// The disassembler instance.
    protected static listfile: ListFile;

 
    /**
     * Main function. Called on startup.
     */
    public static main(): number {
  
        // Get arguments
        const args = process.argv.splice(2);

        // Check for help
        if(args.length == 0) {
            //this.printHelp();
            return 0;
        }

        // Get filename 
        let filename = args[0];
        this.listfile = new ListFile(filename);

        // Loop all exports
        const exports = this.listfile.getExports();

        // Get all (export) labels
        const hierarchy = this.listfile.getLabels(exports);

        // Write the html output
        const html = new html(hierarchy);

        return 0;
    }

}