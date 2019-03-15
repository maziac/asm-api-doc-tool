

import * as assert from 'assert';
import { ListFile } from '../src/listfile';


suite('ListFile', () => {

    suite('constructor', () => {

        test('File reading', (done) => {
            const lf = new ListFile('test/data/lf1.list')
            assert.equal(lf.lines.length, 3, "Expected number of lines wrong.");
            assert.equal(lf.lines[0], "L0", "Expected line wrong.");
            assert.equal(lf.lines[1], "L1", "Expected line wrong.");
            assert.equal(lf.lines[2], "L2", "Expected line wrong.");
            done();
        });

    });

    suite('getExports', () => {
 
        test('Hierarchy', (done) => {
            const lf = new ListFile('test/data/lf_exports.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const r = lf.getExports();
            assert.equal( r.elements.get('c'), undefined);
            const ra = r.elements.get('a') as any;
            assert.notEqual( ra, undefined);
            assert.notEqual( ra.elements.get('a1'), undefined);
            assert.notEqual( ra.elements.get('a2'), undefined);
            const rab = ra.elements.get('b') as any;
            assert.notEqual( rab.elements.get('a11'), undefined);
            assert.notEqual( rab.elements.get('a12'), undefined);
            const rac = ra.elements.get('c') as any;
            assert.notEqual( rac.elements.get('a11'), undefined);
            assert.equal( rac.elements.get('a12'), undefined);
            const rb = r.elements.get('b') as any;
            assert.notEqual( rb, undefined);
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