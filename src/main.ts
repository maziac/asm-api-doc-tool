import { ListFile } from './listfile';
import { Html } from './html';




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
        this.listfile.getLabels(exports);

        // Write the html output
        const html = new Html(hierarchy);

        return 0;
    }

}