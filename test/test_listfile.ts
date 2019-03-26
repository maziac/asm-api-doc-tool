

import * as assert from 'assert';
import { ListFile } from '../src/listfile';
import { LabelsFile } from '../src/labelsfile';


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


    suite('addLineNumbers', () => {

        test('All exports found', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers.list', 24)
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal(r1.lineNumbers[0], 1);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal(r2.lineNumbers[0], 3);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal(r3.lineNumbers[0], 5);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal(r4.lineNumbers[0], 7);
            const r5 = e.getEntry('b') as any;
            assert.equal(r5.lineNumbers[0], 9);
            
            done();
        });

        test('Non existing export', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers2.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers2.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('c') as any;
            assert.equal(r1.lineNumbers.length, 0);
            
            done();
        });

        test('Simple module', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_module1.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers_module1.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const rm = e.getEntry('a') as any;
            assert.equal(rm.lineNumbers[0], 0);
            assert.equal(rm.lineNumbers[1], 11);
            const r1 = e.getEntry('a.b1') as any;
            assert.equal(r1.lineNumbers[0], 2);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal(r2.lineNumbers[0], 4);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal(r3.lineNumbers[0], 6);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal(r4.lineNumbers[0], 8);
            const r5 = e.getEntry('b') as any;
            assert.equal(r5.lineNumbers[0], 10);
            
            done();
        });

        test('Multiple modules', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_module2.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers_module2.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal(r1.lineNumbers[0], 2);
            const r2 = e.getEntry('a.x.b2') as any;
            assert.equal(r2.lineNumbers[0], 5);
            const r3 = e.getEntry('a.x.b1.c1') as any;
            assert.equal(r3.lineNumbers[0], 7);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal(r4.lineNumbers[0], 10);
            const r5 = e.getEntry('y.b') as any;
            assert.equal(r5.lineNumbers[0], 13);
            
            done();
        });

        test('Struct', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_struct1.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers_struct1.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.s.c') as any;
            assert.equal(r1.lineNumbers[0], 2);
            const r2 = e.getEntry('a.s.d') as any;
            assert.equal(r2.lineNumbers[0], 4);
            const r3 = e.getEntry('a.s.e') as any;
            assert.equal(r3.lineNumbers[0], 5);
            
            done();
        });

        test('IF', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers_if1.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers_if1.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b') as any;
            assert.equal(r1.lineNumbers.length, 0);
            const r2 = e.getEntry('b') as any;
            assert.equal(r2.lineNumbers[0], 3);
            const r3 = e.getEntry('c') as any;
            assert.equal(r3.lineNumbers.length, 0);
            
            done();
        });

        test('Skip #-lines', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers3.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers3.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal(r1.lineNumbers[0], 1);
            const r2 = e.getEntry('a.b2') as any;
            assert.equal(r2.lineNumbers[0], 3);
            const r3 = e.getEntry('a.b1.c1') as any;
            assert.equal(r3.lineNumbers[0], 7);
            const r4 = e.getEntry('a.b3.c1') as any;
            assert.equal(r4.lineNumbers[0], 11);
            const r5 = e.getEntry('b') as any;
            assert.equal(r5.lineNumbers[0], 13);
            
            done();
        });

        test('Skip short lines', (done) => {
            const lf = new ListFile('test/data/lf_addlinenumbers4.list')
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");
            const lb = new LabelsFile('test/data/lf_addlinenumbers4.labels')
            assert.notEqual(lb.lines.length, 0, "File contains no lines.");

            const e = lb.getExports();
            lf.addLineNumbers(e);

            const r1 = e.getEntry('a.b1') as any;
            assert.equal(r1.lineNumbers[0], 2);
            
            done();
        });

    });

});