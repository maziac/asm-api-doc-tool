import { HierarchyEntry } from './hierarchyentry';
import * as util from 'util';
import * as path from 'path';
const fs = require('fs-extra');

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

    // The title to be used for the output.
    protected title: string;

    /**
     * Receives the hierarchy of all labels.
     * @param hierarchy
     * @param title The title of the html page.
     */
    constructor(hierarchy: HierarchyEntry, title: string) {
        this.hierarchy = hierarchy;
        this.title = title;
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
          <title>%s</title>
        </head>
        <body>

          <iframe id="toc" src="toc.html" style="display:block; float:left; width:20%; height:100vh;"></iframe>

          <iframe id="contents" name="contents" src="contents.html" style="display:block; float:left; width:79%; height:100vh;"></iframe>

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
                if(lastNumberOfDots < count) {
                    // Add a vertical space
                    toc += '<br>\n';
                }
                lastNumberOfDots = count;
            }
            // Write link
            toc += '<a href="' + htmlContents + '#' + label + '" target="contents">' + label + '</a><br>\n';
        });

        return toc;
    }


    /**
     * Returns the contents for the contents.html.
     * I.e. all labels with anchors and descriptions.
     */
    protected getContentsHtml() {
        const tab = '&nbsp;'.repeat(3);
        // Loop over all labels
        let contents = '';
        let lastNumberOfDots = 0;
        this.hierarchy.iterate( (label, entry) => {
            const count = label.split('.').length-1;    // Number of '.' in label
            // Check for description
            if(entry.description) {
                // Check if we need to add a vertical space
                if(lastNumberOfDots < count) {
                    // Add a vertical space
                    contents += '<br>\n';
                }
                lastNumberOfDots = count;
            }
            // Write title and anchor
            const hDepth = count+1;
            contents += '<h' + hDepth + ' id="' + label + '">' + label + '</h' + hDepth + '>\n';
            // Write description
            if (entry.description) {
                let descr = entry.description.replace(/\n/g, '<br>\n');
                descr = descr.replace(/ /g, '&nbsp;');
                descr = descr.replace(/\t/g, tab);
                contents += descr + '\n\n';
        });
        
        return contents;
    }
 
    
    /**
     * Writes the 3 html files to disk.
     */
    public writeFiles(dir: string) {
        // Create contents for files.

        const formatMain = `
        <!DOCTYPE html>
		<html lang="en">
		<head>
          <meta charset="UTF-8">
          <title>%s</title>
        </head>
        <body>

          <iframe id="toc" src="toc.html" style="display:block; float:left; width:20%; height:100vh;"></iframe>

          <iframe id="contents" name="contents" src="contents.html" style="display:block; float:left; width:75%; height:100vh;"></iframe>

        </body>
        </html>
        `;
        // Create string
        const fMain = util.format(formatMain, this.title);

        // TOC
        const formatToc = `
        <!DOCTYPE html>
		<html lang="en">
        <head>
            <title>TOC</title>
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
            <title>Contents</title>
            <meta charset="UTF-8">
        </head>
        <body>
        %s
        </body>
        </html>
        `;
        // Create string
        const contents = this.getContentsHtml();
        const fContents = util.format(formatContents, contents);

        // Create dir
        fs.mkdirpSync(dir);

        // Write files.
        const pathMain = path.join(dir, htmlMain);
        fs.writeFileSync(pathMain, fMain);
        const pathToc = path.join(dir, htmlToc);
        fs.writeFileSync(pathToc, fToc);
        const pathContents = path.join(dir, htmlContents);
        fs.writeFileSync(pathContents, fContents);
    }
}
