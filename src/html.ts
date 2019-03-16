import { writeFileSync } from 'fs';
import { HierarchyEntry } from './hierarchyentry';
import * as util from 'util';


/// The main html file.
const htmlMain = 'index.html';

/// The table of contents, i.e. the links to all labels.
const htmlToc = 'toc.html';

/// The contents, i.e. all labels with descriptions.
const htmlContents = 'contents.html';
    

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
     * Returns the toc.html. Table of contents.
     * I.e. all the 'exports' labels with links into the 'content'
     * iframe.
     */
    protected getTocHtml() {
        // Loop over all labels
        let toc = '';
        let lastNumberOfDots = 0;
        this.hierarchy.iterate( (label, entry) => {
            // Check for description
            if(entry.description) {
                // Check if we need to add a vertical space
                const count = label.split('.').length-1;    // Number of '.' in label
                if(lastNumberOfDots != count) {
                    // Add a vertical space
                    toc += '<br>\n'
                    lastNumberOfDots = count;
                }
            }
            // Write link
            toc += '<a href="' + htmlContents + '#' + label + '">' + label + '</a><br>\n';
        });

        return toc;
    }


    /**
     * Returns the contents for the contents.html.
     * I.e. all labels with anchors and descriptions.
     */
    protected getContentsHtml() {
        // Loop over all labels
        let contents = '';
        let lastNumberOfDots = 0;
        this.hierarchy.iterate( (label, entry) => {
            // Check for description
            if(entry.description) {
                // Check if we need to add a vertical space
                const count = label.split('.').length-1;    // Number of '.' in label
                if(lastNumberOfDots != count) {
                    // Add a vertical space
                    contents += '<br>\n'
                    lastNumberOfDots = count;
                }
                // Write title and anchor
                const hDepth = count+1;
                contents += '<h' + hDepth + ' id="' + label + '">' + label + '</h' + hDepth + '>\n';
                // Write description
                if (entry.description)
                    contents += entry.description + '\n\n';
            }
        });
        
        return contents;
    }
 
    
    /**
     * Writes the 3 html files to disk.
     */
    public writeFiles() {

        // TOC
        const formatToc = `
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
        // Create string
        const toc = this.getTocHtml();
        const fToc = util.format(formatToc, toc);

        // Contents
        const formatContents = `
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
        // Create string
        const contents = this.getTocHtml();
        const fContents = util.format(formatContents, contents);

    }
}
