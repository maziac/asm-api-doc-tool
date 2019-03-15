

import * as assert from 'assert';
import { HierarchyEntry } from '../src/hierarchyentry';

suite('HierarchyEntry', () => {
    const h = HierarchyEntry as any;

    suite('getSingleDescription', () => {

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

});