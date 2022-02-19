

import * as assert from 'assert';
import { LabelsFile } from '../src/labelsfile';


suite('LabelsFile', () => {

    suite('constructor', () => {

        test('File reading', (done) => {
            const lf = new LabelsFile('test/data/lf_exports.labels');
            assert.equal(lf.lines.length, 7, "Expected number of lines wrong.");
            assert.equal(lf.lines[0], "a.a1: EQU 0x000000EB", "Expected line wrong.");
            done();
        });

    });


    suite('getExports', () => {
 
        test('Hierarchy', (done) => {
            const lf = new LabelsFile('test/data/lf_exports.labels');
            assert.notEqual(lf.lines.length, 0, "File contains no lines.");

            const r = lf.getExports();
            assert.equal(r.elements.get('c'), undefined);
            const ra = r.elements.get('a') as any;
            assert.notEqual(ra, undefined);
            
            const a_a1 = ra.elements.get('a1');
            assert.notEqual(a_a1, undefined);
            assert.equal(a_a1.labelValue, 0xEB);
            
            const a_a2 = ra.elements.get('a2');
            assert.notEqual(a_a2, undefined);
            assert.equal(a_a2.labelValue, 1);

            const rab = ra.elements.get('b') as any;
            
            const a_b_a11 = rab.elements.get('a11');
            assert.notEqual(a_b_a11, undefined);
            assert.equal(a_b_a11.labelValue, 2);

            const a_b_a12 = rab.elements.get('a12');
            assert.notEqual(a_b_a12, undefined);
            assert.equal(a_b_a12.labelValue, 3);

            const rac = ra.elements.get('c') as any;

            const a_c_a11 = rac.elements.get('a11');
            assert.notEqual(a_c_a11, undefined);
            assert.equal(a_c_a11.labelValue, 4);
            
            assert.equal(rac.elements.get('a12'), undefined);
            
            const rb = r.elements.get('b') as any;
            assert.notEqual(rb, undefined);
            assert.equal(rb.labelValue, 5);

            done();
        });
    });

    suite('parseValue', () => {
 
        test('Several values', (done) => {
            const lf = new LabelsFile('test/data/lf_exports.labels') as any; // Doesn't matter which file

            let r = lf.parseValue("15");
            assert.equal(r, 15);

            r = lf.parseValue("-15");
            assert.equal(r, -15);

            r = lf.parseValue("0xFF");
            assert.equal(r, 0xFF);

            r = lf.parseValue("$AA");
            assert.equal(r, 0xAA);

            done();
        });
    });
});