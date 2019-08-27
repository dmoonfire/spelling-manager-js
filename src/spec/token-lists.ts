import * as expect from "expect";
import * as path from "path";
import { TokenSpellingManager } from "../index";

describe(path.basename(__filename), function() {
    describe("listing words", function() {
        it("simple list", function() {
            let spell = new TokenSpellingManager();
            spell.add(["a", "z", "!b", "y"]);
            let list = spell.list();
            expect(list).toEqual(["!b", "a", "y", "z"]);
        });
    });

    describe("adding words", function() {
        it("add sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            expect(spell.sensitive).toEqual({ "Word": true });
            expect(spell.insensitive).toEqual({});
        });
        it("add lowercase sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.add("!word");
            expect(spell.sensitive).toEqual({ "word": true });
            expect(spell.insensitive).toEqual({});
        });
        it("add array", function() {
            let spell = new TokenSpellingManager();
            spell.add(["!word", "cheese"]);
            expect(spell.sensitive).toEqual({ "word": true });
            expect(spell.insensitive).toEqual({ "cheese": true });
        });
        it("add sensitive as add", function() {
            let spell = new TokenSpellingManager();
            spell.add("Word");
            expect(spell.sensitive).toEqual({ "Word": true });
            expect(spell.insensitive).toEqual({});
        });
        it("add sensitive twice", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            spell.addCaseSensitive("Word");
            expect(spell.sensitive).toEqual({ "Word": true });
            expect(spell.insensitive).toEqual({});
        });
    });

    describe("checking words", function() {
        it("check sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            expect(spell.isCorrect("Word")).toEqual(true);
        });
        it("check sensitive as insensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            expect(spell.isCorrect("word")).toEqual(false);
        });
    });

    describe("removing words", function() {
        it("add and remove sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            spell.removeCaseSensitive("Word");
            expect(spell.sensitive).toEqual({});
            expect(spell.insensitive).toEqual({});
        });

        it("remove non-existing sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.removeCaseSensitive("Word");
            expect(spell.sensitive).toEqual({});
            expect(spell.insensitive).toEqual({});
        });
    });

    describe("suggesting words", function() {
        it("suggest case sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            spell.addCaseSensitive("Work");

            let suggestions = spell.suggest("Wrd");
            expect(suggestions).toEqual(["Word"]);
        });
        it("suggest case sensitive lowercase and uppercase", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            spell.addCaseSensitive("word");

            let suggestions = spell.suggest("Wrd");
            expect(suggestions).toEqual(["word", "Word"]);
        });

        it("suggest case sensitive", function() {
            let spell = new TokenSpellingManager();
            spell.addCaseSensitive("Word");
            spell.addCaseSensitive("Work");

            let suggestions = spell.suggest("Wor");
            expect(suggestions).toEqual(["Word", "Work"]);
        });

        it("suggest insensitive", function() {
            let spell = new TokenSpellingManager();
            spell.add("worth");
            spell.add("word");

            let suggestions = spell.suggest("wor");
            expect(suggestions).toEqual(["worth", "word"]);
        });

        it("suggest insensitive", function() {
            let spell = new TokenSpellingManager();
            spell.add("worth");
            spell.add("word");

            let suggestions = spell.suggest("Wor");
            expect(suggestions).toEqual(["Worth", "Word"]);
        });

        it("suggest insensitive", function() {
            let spell = new TokenSpellingManager();
            spell.add("worth");
            spell.add("word");

            let suggestions = spell.suggest("WOR");
            expect(suggestions).toEqual(["WORTH", "WORD"]);
        });
    });
});
