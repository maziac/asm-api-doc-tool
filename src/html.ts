import { HierarchyEntry, LabelType } from './hierarchyentry';
import * as util from 'util';
import * as path from 'path';
const fs = require('fs-extra');

/// The main html file.
const htmlMain = 'index.html';

/// The table of contents, i.e. the links to all labels.
const htmlToc = 'toc.html';

/// The contents, i.e. all labels with descriptions.
const htmlContents = 'contents.html';
    
/// The main html file.
const htmlCss = 'stylesheet.css';


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

    /// The title to be used for the output.
    protected title: string;

    /// The number of spaces for a tab.
    protected tabSpacesCount = 3;

    /**
     * Receives the hierarchy of all labels.
     * @param hierarchy
     * @param title The title of the html page.
     * @param tabSpacesCount The number of spaces for a tab.
     */
    constructor(hierarchy: HierarchyEntry, title: string, tabSpacesCount: number) {
        this.hierarchy = hierarchy;
        this.title = title;
        this.tabSpacesCount = tabSpacesCount;
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
            // Check if we need to add a vertical space
            const count = label.split('.').length-1;    // Number of '.' in label
            if(lastNumberOfDots > count) {
                // Add a vertical space
                toc += '<br>\n';
            }
            lastNumberOfDots = count;
            // Write link
            toc += '<a class="TOC_' + LabelType[entry.labelType] + '" href="' + htmlContents + '#' + label + '" target="contents">' + label + '</a><br>\n';
        });

        return toc;
    }


    /**
     * Returns the contents for the contents.html.
     * I.e. all labels with anchors and descriptions.
     */
    protected getContentsHtml() {
        //const tab = '&nbsp;'.repeat(this.tabSpacesCount);
        const tab = ' '.repeat(this.tabSpacesCount);
        // Loop over all labels
        let contents = '';
        let lastNumberOfDots = 0;
        let lastMainModule;
        let lastLabelType = LabelType.UNKNOWN;
        this.hierarchy.iterate( (label, entry) => {
            const labelSplit = label.split('.');
            const mainModule = labelSplit[0];
            labelSplit.pop();
            const count = labelSplit.length;    // Number of '.' in label
             // Check if we need to add a vertical space
            if(lastNumberOfDots < count) {
                // Add a vertical space
                contents += '<br>\n';
            }
            lastNumberOfDots = count;
            // Check if we need to add a horizontal line
            if(
                mainModule != lastMainModule 
                || 
                (entry.labelType != lastLabelType 
                    && entry.labelType == LabelType.MODULE)) {
                contents += '<br><hr><br>\n'; 
                lastMainModule = mainModule;
                lastLabelType = entry.labelType;
            }
        
            // Get sectionClass
            const labelType = LabelType[entry.labelType];
            // Write title and anchor
            const hDepth = 1; //count+1;
            contents += '<h' + hDepth + ' class="' + labelType + '" id="' + label + '">' + entry.printLabel + ':</h' + hDepth + '>\n';
            // Write description
            if (entry.description) {
                //    let descr = entry.description.replace(/\n/g, '<br>\n');
                //    descr = descr.replace(/ /g, '&nbsp;');
                //    descr = descr.replace(/\t/g, tab);
                //    contents += descr + '<br><br>\n\n';
                const descr = entry.description.replace(/\t/g, tab);
                const escaped = this.escapeHtml(descr);
                const link = escaped.replace(/(https?:\/\/[a-z0-9.\/?=_-]*)/i, '<a href="$1">$1</a>');
                contents += '<pre class="DESCRIPTION"><code>' + link + '</code></pre>\n<br>\n';
            }
        });
        
        return contents;
    }
 
    
    /**
     * Writes the 3 html files to disk.
     */
    public writeFiles(dir: string) {
        // Create contents for files.
        const stylesheetCss = `
        .MODULE {
            color: black;
        }
        .CODE {
            color: darkblue;
        }
        .DATA {
            color: green;
        }
        .CONST {
            color: purple;
        }

        .MODULE::before, .CODE::before, .CONST::before, .DATA::before {
            content: attr(class);
            color: white;
            background-color: black;
            font-size: small;
            margin-right: 1em;
            position: relative;
            top: -1em;
            border-radius: 0.25em;
            padding: 0.15em;
        }

        .UNKNOWN::before {
            content: "";
        }
        .CONST::before {
            background-color: purple;
        }
        
        .CODE::before {
            background-color: darkblue;
        }
        
        .DATA::before {
            background-color: green;
        }
        
        .TOC_MODULE {
            color: black;
        }
        .TOC_CODE {
            color: darkblue;
        }
        .TOC_DATA {
            color: green;
        }
        .TOC_CONST {
            color: purple;
        }

        .DESCRIPTION {
            font-size: large;
            font: arial;
        }
        `;

        const formatMain = `
        <!DOCTYPE html>
		<html lang="en">
        <head>
          <link rel="stylesheet" href="${htmlCss}">
          <meta charset="UTF-8">
          <title>%s</title>
        </head>
        <body>

          <iframe id="toc" src="toc.html" style="display:block; float:left; width:20%; height:100vh;"></iframe>

          <iframe id="contents" name="contents" src="contents.html" style="display:block; float:left; width:79%; height:100vh;"></iframe>

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
            <link rel="stylesheet" href="${htmlCss}">
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
            <link rel="stylesheet" href="${htmlCss}">
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
        const pathCss = path.join(dir, htmlCss);
        fs.writeFileSync(pathCss, stylesheetCss);
        const pathMain = path.join(dir, htmlMain);
        fs.writeFileSync(pathMain, fMain);
        const pathToc = path.join(dir, htmlToc);
        fs.writeFileSync(pathToc, fToc);
        const pathContents = path.join(dir, htmlContents);
        fs.writeFileSync(pathContents, fContents);
    }


    /**
     * Escapes the given text.
     * @param text Text to 'escape'.
     * @return the escaped text.
     */
    public escapeHtml(text: string) {
        var f = function(tag) {
            var charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            };
            return charsToReplace[tag];
        }
        return text.replace(/[&<>"']/g, f);    
    }
}
