

import * as assert from 'assert';
import { HierarchyEntry, LabelType } from '../src/hierarchyentry';
const fs = require('fs-extra');



suite('HierarchyEntry', () => {

    suite('getSingleDescription', () => {
        const h = HierarchyEntry as any;

        test('Simple', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "; D1",
                "012345678901234567890123" + "label:"
            ];
            const result = h.getSingleDescription(1, lines, 3);
            assert.equal(result, " D1", "Expected description wrong.");
            done();
        });

        test('1 empty line', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "; D1",
                "012345678901234567890123" + "  ",
                "012345678901234567890123" + "label:"
            ];
            const result = h.getSingleDescription(2, lines, 3);
            assert.equal(result, " D1", "Expected description wrong.");
            done();
        });

        test('More empty lines', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "; D1",
                "012345678901234567890123" + "", 
                "012345678901234567890123" + "", 
                "012345678901234567890123" + "",
                "012345678901234567890123" + "label:"
            ];
            
            const r1 = h.getSingleDescription(4, lines, 2);
            assert.equal(r1, undefined, "No description expected.");

            const r2 = h.getSingleDescription(4, lines, 3);
            assert.equal(r2, " D1", "Description expected.");
            done();
        });

        test('No description at start', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "",
                "012345678901234567890123" + "label:"
            ];
            const result = h.getSingleDescription(1, lines, 3);
            assert.equal(result, undefined, "No description expected.");
            done();
        });

        test('First line', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "label:"
            ];
            const result = h.getSingleDescription(0, lines, 3);
            assert.equal(result, undefined, "No description expected.");
            done();
        });

        test('Several description lines', (done) => {
            // Data
            const lines = [
                "012345678901234567890123" + "; not part of description",
                "012345678901234567890123" + "",
                "012345678901234567890123" + "; D1",
                "012345678901234567890123" + ";  D2",
                "012345678901234567890123" + ";D3",
                "012345678901234567890123" + "label:"
            ];
            const result = h.getSingleDescription(5, lines, 3);
            assert.equal( result, " D1\n  D2\nD3", "Expected description wrong.");
            done();
        });

    });



    suite('setDescriptions', () => {
         test('2 hierarchy descriptions', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [1];
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h1.elements.set("l11", h11);
            h1.elements.set("l12", h12);
            h11.lineNumbers = [3];
            h12.lineNumbers = [5];
            
            // Lines
            const lines = [
                "012345678901234567890123" + "; H1",
                "012345678901234567890123" + "l1:",
                "012345678901234567890123" + "; H11",
                "012345678901234567890123" + "l11:",
                "012345678901234567890123" + "; H12",
                "012345678901234567890123" + "l12:",
            ];
            h1.setDescriptions(lines, 3);
            assert.equal(h1.description, " H1", "Expected description wrong.");
            assert.equal(h1.elements.get('l11').description, " H11", "Expected description wrong.");
            assert.equal(h1.elements.get('l12').description, " H12", "Expected description wrong.");
            done();
        });

        test('After-comments', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [1];
            
            // Lines
            const lines = [
                "012345678901234567890123" + "; H1",
                "012345678901234567890123" + "l1: ;AC1",
                "012345678901234567890123" + "  defb 0 ;AC2",
                "012345678901234567890123" + ""
            ];
            h1.setDescriptions(lines, 1);
            assert.equal(h1.description, "AC1\nAC2", "Expected description wrong.");
            done();
        });

        test('EQU label', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [1];
            h1.labelValue = 54;
            h1.printLabel = "l1";
            
            // Lines
            const lines = [
                "012345678901234567890123" + "; H1",
                "012345678901234567890123" + "l1: ;AC1",
                "012345678901234567890123" + "  equ LBLA-LBLB ;AC2",
                "012345678901234567890123" + ""
            ];
            h1.setDescriptions(lines, 1);
            assert.equal(h1.printLabel, "l1 = 0x0036 (54)");
            done();
        });

        test('After-comments higher pritority', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [1];
            
            // Lines
            const lines = [
                "012345678901234567890123" + "; Above",
                "012345678901234567890123" + "l1:  ; After"
            ];
            h1.setDescriptions(lines, 1);
            assert.equal(h1.description, " After");
            done();
        });

        test('Multiple above-comments', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [1, 4];
            
            // Lines
            const lines = [
                "012345678901234567890123" + "; MOD1 A",
                "012345678901234567890123" + " MODULE m1 ",
                "012345678901234567890123" + " ENDMODULE",
                "012345678901234567890123" + " ; MOD1 B",
                "012345678901234567890123" + " MODULE m1",
                "012345678901234567890123" + " ENDMODULE",
            ];
            h1.setDescriptions(lines, 1);
            assert.equal(h1.description, " MOD1 A\n\n MOD1 B");
            done();
        });

        test('Multiple after-comments', (done) => {
            // Data
            const h1 = new HierarchyEntry() as any;
            h1.lineNumbers = [0, 2];
            
            // Lines
            const lines = [
                "012345678901234567890123" + " MODULE m1 ; MOD1 A",
                "012345678901234567890123" + " ENDMODULE",
                "012345678901234567890123" + " MODULE m1 ; MOD1 B",
                "012345678901234567890123" + " ENDMODULE",
            ];
            h1.setDescriptions(lines, 1);
            assert.equal(h1.description, " MOD1 A\n\n MOD1 B");
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
            assert.equal(r1, h11, "Wrong entry.");
            const r2 = h1.getEntry("l12");
            assert.equal(r2, h12, "Wrong entry.");
            const r3 = h1.getEntry("notavailable");
            assert.equal(r3, undefined, "Wrong entry.");
            const r4 = h1.getEntry("l12.l1");
            assert.equal(r4, h121, "Wrong entry.");
            const r5 = h1.getEntry("l12.l1.notavailable");
            assert.equal(r5, undefined, "Wrong entry.");
            const r6 = h1.getEntry("l12.notavailable.lend");
            assert.equal(r6, undefined, "Wrong entry.");
            done();
        });

    });


    suite('iterate', () => {
        const h1 = new HierarchyEntry() as any;

        test('through hierarchies', (done) => {
            // Data
            h1.lineNumber = 1;
            const h11 = new HierarchyEntry();
            const h12 = new HierarchyEntry();
            h1.elements.set("b", h11);
            h1.elements.set("c", h12);
            const h121 = new HierarchyEntry();
            h12.elements.set("d", h121);
            const h111 = new HierarchyEntry();
            h11.elements.set("a", h111);
            
            const labels = new Array<string>();
            const entries = new Array<HierarchyEntry>();
            h1.iterate((label: string, entry: HierarchyEntry) => {
                labels.push(label);
                entries.push(entry);
            });

            // Check order
            assert.equal(labels[0], 'b');
            assert.equal(entries[0], h11);
            assert.equal(labels[1], 'b.a');
            assert.equal(entries[1], h111);
            assert.equal(labels[2], 'c');
            assert.equal(entries[2], h12);
            assert.equal(labels[3], 'c.d');
            assert.equal(entries[3], h121);
            done();
        });

    });


    suite('getLabelType', () => {
        const h = new HierarchyEntry() as any;

        test('Const/EQU', (done) => {
            let r;
            r = h.getLabelType(" equ 7");
            assert.equal(r, LabelType.CONST);
            r = h.getLabelType("     EQU  ZMAX*8   ; afffaf a");
            assert.equal(r, LabelType.CONST);
            r = h.getLabelType("EQU");
            assert.equal(r, LabelType.CODE);    // We need to decide for something. "EQU" was placed at the label location so we assume CODE.
            r = h.getLabelType("label: equ 7");
            assert.equal(r, LabelType.CONST);
            r = h.getLabelType("label     EQU  ZMAX*8   ; afffaf a");
            done();
        });

        test('Data', (done) => {
            let r;
            r = h.getLabelType(" defb  5");
            assert.equal(r, LabelType.DATA);
            r = h.getLabelType("     DEFW 1234    ; afffaf a");
            assert.equal(r, LabelType.DATA);
            r = h.getLabelType("defw    768");
            assert.equal(r, LabelType.CODE);   // defw is label and 768 is code, i.e. "everything else is code"
            r = h.getLabelType(" defs 100");
            assert.equal(r, LabelType.DATA);
            r = h.getLabelType("label defb 5, 7, 9, 7");
            assert.equal(r, LabelType.DATA);
            r = h.getLabelType("label: defw 0, 1, 2, 4 ; comment ");
            assert.equal(r, LabelType.DATA);
            done();
        });

        test('Code', (done) => {
            let r;
            r = h.getLabelType(" ld a,5");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("     NEXTREG 3,4    ; afffaf a");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("EQU");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("label: ld a,5");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("label NEXTREG 3,4    ; bafffaf a");
            assert.equal(r, LabelType.CODE);
            done();
        });

        test('Invalid', (done) => {
            let r;
            r = h.getLabelType(undefined);
            assert.equal(r, LabelType.UNKNOWN);
            r = h.getLabelType("     NEXTREG 3,4    ; afffaf a");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("EQU");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("label: ld a,5");
            assert.equal(r, LabelType.CODE);
            r = h.getLabelType("label NEXTREG 3,4    ; bafffaf a");
            assert.equal(r, LabelType.CODE);
            done();
        });
    
    });


    suite('stripAfterComments', () => {
        const h = new HierarchyEntry() as any;

        test('All empty', (done) => {
            let r;
            r = h.stripAfterComments([]);
            assert.equal(r, undefined);
            r = h.stripAfterComments([""]);
            assert.equal(r, undefined);
            r = h.stripAfterComments(["", "", ""]);
            assert.equal(r, undefined);
            r = h.stripAfterComments(["aff: f  ", "  ffff", " "]);
            assert.equal(r, undefined);
            done();
        });

        test('Single line', (done) => {
            let r;
            r = h.stripAfterComments(["l1: ld a,5 ; My comment"]);
            assert.equal(r, " My comment");
            r = h.stripAfterComments(["l1 ld a,5 ; My comment"]);
            assert.equal(r, " My comment");
            r = h.stripAfterComments(["l1:;My comment"]);
            assert.equal(r, "My comment");
            r = h.stripAfterComments(["l1 ;My comment"]);
            assert.equal(r, "My comment");
            done();
        });

        test('Two lines', (done) => {
            let r;
            r = h.stripAfterComments(["l1:;Comment1", ";Comment2"]);
            assert.equal(r, "Comment1\nComment2");
            r = h.stripAfterComments(["l1:;Comment1", " defb 7;Comment2"]);
            assert.equal(r, "Comment1\nComment2");
            done();
        });

        test('Multiple lines', (done) => {
            let r;
            r = h.stripAfterComments(["l1:;Comment1", ";Comment2", ";Comment3"]);
            assert.equal(r, "Comment1\nComment2\nComment3");
            r = h.stripAfterComments(["l1:;Comment1", " ld a,9", " ;Comment3"]);
            assert.equal(r, "Comment1");
            r = h.stripAfterComments(["l1:;Comment1", "", " equ 8 ;Comment3"]);
            assert.equal(r, "Comment1");
            done();
        });
    });


    suite('getLinesUntilNextCmd', () => {
        const h = new HierarchyEntry() as any;

        test('No comments', (done) => {
            let r;
            r = h.getLinesUntilNextCmd(0, []);
            assert.equal(r.length, 0);
            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + ""
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "");

            r = h.getLinesUntilNextCmd(1, [
                "012345678901234567890123" + "", 
                "012345678901234567890123" + "", 
                "012345678901234567890123" + ""]);
            assert.equal(r.length, 2);
            assert.equal(r[0], "");
            assert.equal(r[1], "");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "aff: f  ", 
                "012345678901234567890123" + "  ffff", 
                "012345678901234567890123" + " "]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "aff: f  ");
            done();
        });

        test('Single line', (done) => {
            let r;
            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label: ld a,5"
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label: ld a,5");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label ld a,5 ; comment a b "
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label ld a,5 ; comment a b ");
            
            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label:"
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label:");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label "
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label ");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label: ;comm"
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label: ;comm");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label     ; comment a b "
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label     ; comment a b ");
            
            done();
        });

        test('Two lines', (done) => {
            let r;
            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label:",
                "012345678901234567890123" + " ld a,5   ; comm"
            ]);
            assert.equal(r.length, 2);
            assert.equal(r[0], "label:");
            assert.equal(r[1], " ld a,5   ; comm");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label: ;comm1",
                "012345678901234567890123" + " ld a,5   ;comm2"
            ]);
            assert.equal(r.length, 2);
            assert.equal(r[0], "label: ;comm1");
            assert.equal(r[1], " ld a,5   ;comm2");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label: ;comm1",
                "012345678901234567890123" + " ld a,5"
            ]);
            assert.equal(r.length, 2);
            assert.equal(r[0], "label: ;comm1");
            assert.equal(r[1], " ld a,5");

            r = h.getLinesUntilNextCmd(0, [
                "012345678901234567890123" + "label: ;comm1",
                "012345678901234567890123" + "l2: ;comm2"
            ]);
            assert.equal(r.length, 1);
            assert.equal(r[0], "label: ;comm1");

            done();
        });
    });


    suite('writeLabelsWithCommentsRecursively', () => {

        test('No children, no label', (done) => {
            const h = new HierarchyEntry() as any;
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, '');
            done();
        });

        test('No children, no labelValue', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, '');
            done();
        });

        test('No children, with labelValue, no description', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.labelValue = 0xFFFF;
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, 'label: EQU 0xFFFF\n\n');
            done();
        });

        test('No children, with labelValue, small value', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.labelValue = 0x0F;
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, 'label: EQU 0x000F\n\n');
            done();
        });

        test('No children, with labelValue, big value', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.labelValue = 0x8FFFF;
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, 'label: EQU 0x8FFFF\n\n');
            done();
        });

        test('No children, with labelValue + description', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.labelValue = 0x1111;
            h.description = "MyDescL1\nMyDescL2";
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, ';MyDescL1\n;MyDescL2\nlabel: EQU 0x1111\n\n');
            done();
        });

        test('Children, with labelValue + description', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.labelValue = 0x1111;
            h.description = "MyDescL1";
            const h2 = new HierarchyEntry() as any;
            h2.label = 'label2';
            h2.labelValue = 0x2222;
            h.elements.set(h2.label, h2);
            const h3 = new HierarchyEntry() as any;
            h3.label = 'label3';
            h3.labelValue = 0x3333;
            h3.description = "MyDescL3";
            h.elements.set(h3.label, h3);
            const r = h.writeLabelsWithCommentsRecursively();
            assert.equal(r, ';MyDescL1\nlabel: EQU 0x1111\n\nlabel2: EQU 0x2222\n\n;MyDescL3\nlabel3: EQU 0x3333\n\n');
            done();
        });

    });


    suite('writeLabelsWithComments', () => {
  
        test('Module, Children, with and without description', (done) => {
            const h = new HierarchyEntry() as any;
            h.label = 'label';
            h.description = "Not seen";
            const h2 = new HierarchyEntry() as any;
            h2.label = 'mod1';
            h2.description = "Not seen";
            h.elements.set(h2.label, h2);
            const h3 = new HierarchyEntry() as any;
            h3.label = 'mod2';
            h3.description = "Not seen";
            h.elements.set(h3.label, h3);
            const h21 = new HierarchyEntry() as any;
            h21.label = 'mod1.l1';
            h21.labelValue = 0x2121;
            h21.description = "MyDescL11";
            h2.elements.set(h21.label, h21);
            const h31 = new HierarchyEntry() as any;
            h31.label = 'mod2.l2';
            h31.labelValue = 0x2222;
            h3.elements.set(h31.label, h31);
            const h32 = new HierarchyEntry() as any;
            h32.label = 'mod2.l3';
            h32.labelValue = 0x2323;
            h32.description = "MyDescL23";
            h3.elements.set(h32.label, h32);
            
            // Write file
            const fname = 'out/tmp/test.labels'
            h.writeLabelsWithComments(fname);

            // Read file 
            const text = fs.readFileSync(fname, 'utf8');
            
            assert.equal(text, ';MyDescL11\nmod1.l1: EQU 0x2121\n\nmod2.l2: EQU 0x2222\n\n;MyDescL23\nmod2.l3: EQU 0x2323\n\n');
            
            done();
        });

    });

    suite('getHexString', () => {
  
        test('undefined', (done) => {
            const r = (HierarchyEntry as any).getHexString(undefined, 3);
            assert.equal(r, '???');
            done();
        });
  
        test('small value', (done) => {
            const r = (HierarchyEntry as any).getHexString(0xF1, 2);
            assert.equal(r, 'F1');
            done();
        });
  
        test('big value', (done) => {
            const r = (HierarchyEntry as any).getHexString(0x01F4, 4);
            assert.equal(r, '01F4');
            done();
        });
  
        test('bigger value', (done) => {
            const r = (HierarchyEntry as any).getHexString(0x12222, 4);
            assert.equal(r, '12222');
            done();
        });

    });


    suite('getDecimal', () => {
  
        test('Positive number', (done) => {
            const r = (HierarchyEntry as any).getDecimal(5);
            assert.equal(r, 5);
            done();
        });

        test('Negative numbers', (done) => {
            let r = (HierarchyEntry as any).getDecimal(0x800000);
            assert.equal(r, -0x800000);
            r = (HierarchyEntry as any).getDecimal(0xFFFFFF);
            assert.equal(r, -1);
            done();
        });
    });

});