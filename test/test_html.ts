

import * as assert from 'assert';
import { Html } from '../src/html';
//import { ListFile } from '../src/listfile';
import { HierarchyEntry } from '../src/hierarchyentry';
import * as path from 'path';
const fs = require('fs-extra');


suite('Html', () => {

    suite('getTocHtml', () => {
 
        test('A few labels', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '', 3) as any;

            // Setup some hierarchy
            h.lineNumber = 1;
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h.elements.set("b", h11);
            h.elements.set("c", h12);
            const h121 = new HierarchyEntry();
            h12.elements.set("d", h121);
            const h111 = new HierarchyEntry();
            h11.elements.set("a", h111);
            
            // Execute
            const r = html.getTocHtml();

            // Check
            const lines = r.split('\n');
            assert.equal(lines[0], '<a class="TOC_undefined" href="contents.html#b" target="contents">b</a><br>');
            assert.equal(lines[1], '<a class="TOC_undefined" href="contents.html#b.a" target="contents">b.a</a><br>');
            assert.equal(lines[3], '<a class="TOC_undefined" href="contents.html#c" target="contents">c</a><br>');
            assert.equal(lines[4], '<a class="TOC_undefined" href="contents.html#c.d" target="contents">c.d</a><br>');
            done();
        });
    });


    suite('getContentsHtml', () => {
 
        test('A few labels', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '', 3) as any;

            // Setup some hierarchy
            h.lineNumber = 1;
            const h11 = new HierarchyEntry('h11');
            const h12 = new HierarchyEntry('h12');
            h.elements.set("b", h11);
            h.elements.set("c", h12);
            const h121 = new HierarchyEntry('h121');
            h12.elements.set("d", h121);
            const h111 = new HierarchyEntry('h111');
            h11.elements.set("a", h111);
            // Descriptions
            h111.description = 'descr111';
            h12.description = 'descr12'
            
            // Execute
            const r = html.getContentsHtml();

            // Check
            const lines = r.split('\n');
            assert.equal(lines[1], '<h1 class="undefined" id="b">h11:</h1>');
            assert.equal(lines[3], '<h1 class="undefined" id="b.a">h111:</h1>');
            assert.equal(lines[4], '<pre><code>descr111</code></pre>');

            assert.equal(lines[6], '<h1 class="undefined" id="c">h12:</h1>');
            assert.equal(lines[7], '<pre><code>descr12</code></pre>');
            assert.equal(lines[9], '<h1 class="undefined" id="c.d">h121:</h1>');
            
            done();
        });
    });


    suite('writeFiles', () => {
        const dir = "out/tmp";
 
        test('Write 4 files', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '', 3) as any;

            // Setup some hierarchy
            h.lineNumber = 1;
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h.elements.set("b", h11);
            h.elements.set("c", h12);
            const h121 = new HierarchyEntry();
            h12.elements.set("d", h121);
            const h111 = new HierarchyEntry();
            h11.elements.set("a", h111);
            // Descriptions
            h111.description = 'descr111';
            h12.description = 'descr12'

            // Remove tmp dir
            fs.removeSync(dir);
    
            // Execute
            html.writeFiles(dir);

            // Check that the 3 files exist (not the contents)
            const pathCss = path.join(dir, 'stylesheet.css');
            assert.ok(fs.exists(pathCss));
            const pathMain = path.join(dir, 'index.html');
            assert.ok(fs.exists(pathMain));
            const pathToc = path.join(dir, 'toc.html');
            assert.ok(fs.exists(pathToc));
            const pathContents = path.join(dir, 'contents.html');
            assert.ok(fs.exists(pathContents));
            
            done();
        });
    });


    suite('escapeHtml', () => {
  
        test('Escaping', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '', 3);
            let r;

            r = html.escapeHtml('');
            assert.equal(r, '');

            r = html.escapeHtml('& < > "');
            assert.equal(r, '&amp; &lt; &gt; &#34;');
            
            done();
        });
    });



});