

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
            const html = new Html(h, '') as any;

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
            assert.equal(lines[0], '<a href="contents.html#b" target="contents">b</a><br>');
            assert.equal(lines[1], '<a href="contents.html#b.a" target="contents">b.a</a><br>');
            assert.equal(lines[2], '<a href="contents.html#c" target="contents">c</a><br>');
            assert.equal(lines[3], '<a href="contents.html#c.d" target="contents">c.d</a><br>');
            done();
        });
    });


    suite('getContentsHtml', () => {
 
        test('A few labels', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '') as any;

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
            
            // Execute
            const r = html.getContentsHtml();

            // Check
            const lines = r.split('\n');
            assert.equal(lines[0], '<h1 id="b">b</h1>');
            assert.equal(lines[2], '<h2 id="b.a">b.a</h2>');
            assert.equal(lines[3], 'descr111');

            assert.equal(lines[5], '<h1 id="c">c</h1>');
            assert.equal(lines[6], 'descr12');
            assert.equal(lines[8], '<h2 id="c.d">c.d</h2>');
            
            done();
        });
    });


    suite('writeFiles', () => {
        const dir = "out/tmp";
 
        test('A few labels', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h, '') as any;

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
            const pathMain = path.join(dir, 'index.html');
            assert.ok(fs.exists(pathMain));
            const pathToc = path.join(dir, 'toc.html');
            assert.ok(fs.exists(pathToc));
            const pathContents = path.join(dir, 'contents.html');
            assert.ok(fs.exists(pathContents));
            
            done();
        });
    });



});