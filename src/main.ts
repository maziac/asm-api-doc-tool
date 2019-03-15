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
        const 
        args = process.argv.splice(2);

        // Check for help
        if(args.length == 0) {
            //this.printHelp();
            return 0;
        }

        // Get filename 
        let filename = args[0];
        const listfile = new ListFile(filename);

        // Loop all exports
        const exports = listfile.getExports();

        // Get the line numbers for all (export) labels
        listfile.addLineNumbers(exports);

        // Get the text descriptions.
        exports.getDescriptions(listfile.lines);
        
        // Write the html output
        const html = new Html(exports);

        return 0;
    }

}