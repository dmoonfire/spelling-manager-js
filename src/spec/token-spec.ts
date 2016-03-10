/// <reference path="../../typings/main.d.ts"/>
/// <reference path="../init.ts"/>
import { TokenSpellingManager } from "../init";

describe("adding words", function() {
    it("add sensitive", function() {
        let spell = new TokenSpellingManager();
        spell.addCaseSensitive("Word");
        expect(spell.sensitive).toEqual({ "Word": true });
        expect(spell.insensitive).toEqual({});
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
