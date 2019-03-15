

import * as assert from 'assert';
import { HierarchyEntry } from '../src/hierarchyentry';
import { stringify } from 'querystring';

suite('HierarchyEntry', () => {

    suite('getSingleDescription', () => {
        const h = HierarchyEntry as any;

        test('Simple', (done) => {
            // Data
            const lines = [
                "; D1",
                "label:"
            ];
            const result = h.getSingleDescription(1, lines);
            assert.equal( result, " D1", "Expected description wrong.");
            done();
        });

        test('Empty line', (done) => {
            // Data
            const lines = [
                "; D1",
                "  ",
                "label:"
            ];
            const result = h.getSingleDescription(2, lines);
            assert.equal( result, " D1", "Expected description wrong.");
            done();
        });

        test('Too many empty lines', (done) => {
            // Data
            const lines = [
                "; D1",
                "", "", "",
                "label:"
            ];
            const result = h.getSingleDescription(4, lines);
            assert.equal( result, undefined, "No description expected.");
            done();
        });

        test('No description at start', (done) => {
            // Data
            const lines = [
                "",
                "label:"
            ];
            const result = h.getSingleDescription(1, lines);
            assert.equal( result, undefined, "No description expected.");
            done();
        });

        test('First line', (done) => {
            // Data
            const lines = [
                "label:"
            ];
            const result = h.getSingleDescription(0, lines);
            assert.equal( result, undefined, "No description expected.");
            done();
        });

        test('Several description lines', (done) => {
            // Data
            const lines = [
                "; not part of description",
                "",
                "; D1",
                ";  D2",
                ";D3",
                "label:"
            ];
            const result = h.getSingleDescription(5, lines);
            assert.equal( result, " D1\n  D2\nD3", "Expected description wrong.");
            done();
        });

    });



    suite('getDescriptions', () => {
        const h1 = new HierarchyEntry() as any;

        test('2 hierarchy descriptions', (done) => {
            // Data
            h1.lineNumber = 1;
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h1.elements.set("l11", h11);
            h1.elements.set("l12", h12);
            h11.lineNumber = 3;
            h12.lineNumber = 5;
            
            // Lines
            const lines = [
                "; H1",
                "l1:",
                "; H11",
                "l11:",
                "; H12",
                "l12:",
            ];
            h1.getDescriptions(lines);
            assert.equal( h1.description, " H1", "Expected description wrong.");
            assert.equal( h1.elements.get('l11').description, " H11", "Expected description wrong.");
            assert.equal( h1.elements.get('l12').description, " H12", "Expected description wrong.");
            done();
        });

    });



    suite('getEntry', () => {
        const h1 = new HierarchyEntry() as any;

        test('3 hierarchies', (done) => {
            // Data
            h1.lineNumber = 1;
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h1.elements.set("l11", h11);
            h1.elements.set("l12", h12);
            const h121 = new HierarchyEntry();
            h12.elements.set("l1", h121);
            
            const r1 = h1.getEntry("l11");
            assert.equal( r1, h11, "Wrong entry.");
            const r2 = h1.getEntry("l12");
            assert.equal( r2, h12, "Wrong entry.");
            const r3 = h1.getEntry("notavailable");
            assert.equal( r3, undefined, "Wrong entry.");
            const r4 = h1.getEntry("l12.l1");
            assert.equal( r4, h121, "Wrong entry.");
            const r5 = h1.getEntry("l12.l1.notavailable");
            assert.equal( r5, undefined, "Wrong entry.");
            const r6 = h1.getEntry("l12.notavailable.lend");
            assert.equal( r6, undefined, "Wrong entry.");
            done();
        });

    });

});