import { writeFileSync } from 'fs';
import { HierarchyEntry } from './hierarchyentry';
import * as util from 'util';


/**
 * Creates the html output.
 * Basically writes 3 files / 2 frames.
 * Left iframe:
 *  - For navigation
 *  - Contains all export labels.
 * Right iframe:
 *  - Contains all export labels with description.
 * main.html:
 *  - Creates the 2 iframes.
 * If link is clicked in left (navigation) frame the description
 * is shown in the right frame. 
 */
export class Html {
    /// Used to store the labels.
    protected hierarchy: HierarchyEntry;


    /**
     * Receives the hierarchy of all labels.
     * @param hierarchy
     */
    constructor(hierarchy: HierarchyEntry) {
		this.hierarchy = hierarchy;
    }


    /**
     * Returns the contents for the main.html which creates the 2 iframes.
     */
    protected getMainHtml() {
        return `
        <!DOCTYPE html>
		<html lang="en">
		<head>
          <meta charset="UTF-8">
          <title>Titel</title>
          <style>
           .menu {
              float:left;
              width:20%;
              height:80%;
            }
            .mainContent {
              float:left;
              width:75%;
              height:80%;
            }
          </style>
        </head>
        <body>
          <iframe class="toc" src="toc.html"></iframe>
          <iframe class="content" src="content.html"></iframe>
        </body>
        </html>
        `;
    }


    /**
     * Returns the contents for the toc.html.
     * I.e. all the 'exports' labels with links into the 'content'
     * iframe.
     */
    protected getTocHtml() {
        const main = `
        <!DOCTYPE html>
		<html lang="en">
		<head>
            <meta charset="UTF-8">
        </head>
        <body>
        %s
        </body>
        </html>
        `;

        // Loop over all labels
        let content = '';
        let lastNumberOfDots = 0;
        this.hierarchy.iterate( (label, entry) => {
            // Check for description
            if(entry.description) {
                // Check if we need to add a vertical space
                const count = label.chars().filter((ch: string) => ch == '.').count();
                if(lastNumberOfDots != count) {
                    // Add a vertical space
                    content += '<br>\n'
                    lastNumberOfDots = count;
                }
                // Write link
                content += '<a href="">' + label + '</a><br>\n';
            }
        });

    }
}
