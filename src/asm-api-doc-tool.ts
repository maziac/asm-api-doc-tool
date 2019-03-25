import { ListFile } from './listfile';
import { LabelsFile } from './labelsfile';
import { Html } from './html';
const pckg = require('../../package.json');
                     



/**
 * The main program.
 */
class Startup {

    /// String containing all whitespaces.
    protected static whiteSpaces = ' \t\n\r';

    /// The disassembler instance.
    protected static listfile: ListFile;

    /// The title to be used for the output.
    protected static title = '';

    /// The input list file.
    protected static listFileName: string;

    /// The input labels file.
    protected static labelsFileName: string;

    /// The output directory.
    protected static outDir: string;

    /// Output labels file name (the labels + comments)
    protected static outLabelsFileName: string;

    /// The number of spaces for a tab.
    protected static tabSpacesCount = 3;

    /// The max number of empty lines before a label.
    protected static maxEmptyLines = 0;

    /**
     * Main function. Called on startup.
     */
    public static main(): number {
  
        // Get arguments
        const args = process.argv.splice(2);
        this.processArgs(args);

        // Get filename 
        const listfile = new ListFile(this.listFileName);

        // Loop all exports
        const labelsfile = new LabelsFile(this.labelsFileName);
        const exports = labelsfile.getExports();

        // Get the line numbers for all (export) labels
        listfile.addLineNumbers(exports);

        // Get the text descriptions.
        exports.setDescriptions(listfile.lines, this.maxEmptyLines);

        // Write the output labels file with the comments
        if(this.outLabelsFileName)
            exports.writeLabelsWithComments(this.outLabelsFileName);

        // Write the html output
        if(this.outDir) {
            const html = new Html(exports, this.title, this.tabSpacesCount);
            html.writeFiles(this.outDir);
        }
        return 0;
    }


    /**
     * Processes the command line arguments or the arguments read from a file.
     * @param args List of arguments.
     */
    protected static processArgs(args: Array<string>) {
        // Iterate all arguments
        let arg;
        while(arg = args.shift()) {
            // Check option
            switch(arg) {
                // Help
                case '--help':
                case '-help':
                case '-h':
                    this.printHelp();
                    process.exit(0);
                    break;

                // Version
                case '--version':
                case '-version':
                case '-v':
                    console.log('Version: ' + pckg.version);
                    process.exit(0);
                    break;

                // Title
                case '--title':
                    this.title = args.shift() as string;
                    if(!this.title) {
                        throw arg + ': Expected a title.';
                    }
                    break;

                // List file name
                case '--list':
                    this.listFileName = args.shift() as string;
                    if(!this.listFileName) {
                        throw arg + ': Expected a list file name.';
                    }
                    break;

                // Labels file name- This file includes the to be documentd labels.
                case '--labels':
                    this.labelsFileName = args.shift() as string;
                    if(!this.labelsFileName) {
                        throw arg + ': Expected a labels file name.';
                    }
                    break;

                // Output directory
                case '--out':
                    this.outDir = args.shift() as string;
                    if(!this.outDir) {
                        throw arg + ': Expected an output directory name.';
                    }
                    break;

                // Output labels file name (the labels + comments)
                case '--outlabels':
                    this.outLabelsFileName = args.shift() as string;
                    if(!this.outLabelsFileName) {
                        throw arg + ': Expected an output labels file name.';
                    }
                    break;

                // Tabs
                case '--tab':
                this.tabSpacesCount = parseInt(args.shift() as string);
                    if(isNaN(this.tabSpacesCount)) {
                        throw arg + ': Expected number of spaces for a tab.';
                    }   break;

                // Number of allowed max. emptylines above a label.
                case '--max-empty-lines':
                    this.maxEmptyLines = parseInt(args.shift() as string);
                    if(isNaN(this.maxEmptyLines)) {
                        throw arg + ': Expected maximum number of empty lines above a comment.';
                    }
                    break;

                default:
                    throw "Unknown argument: '" + arg + "'";
            }
        }

        // Print help if no filename or output directory given
        if(!this.listFileName || !(this.outDir || this.outLabelsFileName)) {
            this.printHelp();
            process.exit(1);
        }
    }


    /**
     * Prints command line help.
     */
    protected static printHelp() {
        console.log(`
This simple documentation tool for assembler files takes the comments above labels, extracts them and generates a html output which is easy to navigate.
You can decide what sub routines will be documented. Only labels which are marked with EXPORT are extracted.
In order for this to work you need a list file that was generated by sjasmplus.

Example usage:
$ sjasmplus-api-doc-tool -title "My Great Library API" --list my_great_lib.list --labels my_great_lib.labels

General usage:
sjasmplus-api-doc-tool [options] --list <list-file-name> --labels <labels-file-name> --out <dir> [-outlabels <output-labels-file-name>]
Options:
    -h|-help|--help: Prints this help.
    -v|-version|--version: Prints the version number.
    --title <title>: Add the <title> to the generated html file.
    --list <list-file-name>: The list file. Output from sjasmplus.
        Typically generated with the sjasmplus argument "--lst="
    --labels <labels-file-name>: The labels file. Output from sjasmplus.
        Typically generated with the sjasmplus argument "--exp="
    --out <dir>: The output directory. The html files are written
        here. If it does not exist it is created.
    --outlabels <output-labels-file-name>: The output filename for a labels file that contains
        the same labels as in <labels-file-name> but including the found comments.
        This is useful if the labels file should serve as input in other assembler projects.
        The comments above the labels make it possible to show the documentation when hovering
        in an IDE like vscode.
        Is optional.
    --tab <count-spaces>: The number of spaces to use for a tab.
        Default is ${this.tabSpacesCount}.
    --max-empty-lines: The maximum allowed number of empty    
        lines before a comment. If there are more empty lines
        between comment and label the comment is not 
        associated with the label.
        Default is ${this.maxEmptyLines}.
`);
    }

}

Startup.main();
