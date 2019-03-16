

import * as assert from 'assert';
import { Html } from '../src/html';
import { ListFile } from '../src/listfile';
import { HierarchyEntry } from '../src/hierarchyentry';


suite('Html', () => {

    suite('getMainHtml', () => {
 
        test('Simple', (done) => {
            const html = new Html(new HierarchyEntry()) as any;
            const res = html.getMainHtml();
            assert.notEqual(res, undefined);
            done();
        });
    });


    suite('getTocHtml', () => {
 
        test('A few labels', (done) => {
            const h = new HierarchyEntry()
            const html = new Html(h) as any;

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
            assert.equal(lines[0], '<a href="contents.html#b">b</a><br>');
            assert.equal(lines[1], '<a href="contents.html#b.a">b.a</a><br>');
            assert.equal(lines[2], '<a href="contents.html#c">c</a><br>');
            assert.equal(lines[3], '<a href="contents.html#c.d">c.d</a><br>');
            done();
        });
    });


    suite('addLineNumbers', () => {

        test('All exports found', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const e = lf.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal( r1.lineNumber, 1);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal( r2.lineNumber, 3);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal( r3.lineNumber, 5);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal( r4.lineNumber, 7);
            const r5 = e.getEntry('b') as any;
            assert.equal( r5.lineNumber, 9);
            
            done();
        });

        test('Non existing export', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers2.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const e = lf.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('c') as any;
            assert.equal( r1.lineNumber, -1);
            
            done();
        });

        test('Simple module', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_module1.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const e = lf.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal( r1.lineNumber, 2);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal( r2.lineNumber, 4);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal( r3.lineNumber, 6);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal( r4.lineNumber, 8);
            const r5 = e.getEntry('b') as any;
            assert.equal( r5.lineNumber, 10);
            
            done();
        });

        test('Multiple modules', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_module2.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const e = lf.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal( r1.lineNumber, 2);
            const r2 = e.getEntry('a.x.b2') as any;
            assert.equal( r2.lineNumber, 5);
            const r3 = e.getEntry('a.x.b1.c1') as any;
            assert.equal( r3.lineNumber, 7);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal( r4.lineNumber,10);
            const r5 = e.getEntry('y.b') as any;
            assert.equal( r5.lineNumber, 13);
            
            done();
        });

        test('Skip #-lines', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers3.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const e = lf.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal( r1.lineNumber, 1);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal( r2.lineNumber, 3);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal( r3.lineNumber, 7);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal( r4.lineNumber, 11);
            const r5 = e.getEntry('b') as any;
            assert.equal( r5.lineNumber, 13);
            
            done();
        });

    });

});