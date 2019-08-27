import * as expect from "expect";
import * as path from "path";
import { BufferSpellingChecker, TokenCheckStatus, TokenSpellingManager } from "../index";

describe(path.basename(__filename), function() {
    it("single valid word among three", function() {
        let spell = new TokenSpellingManager();
        spell.add("like");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("I LIKE CHEESE.");

        expect(results).toEqual([
            { token: "I", start: 0, end: 1, status: TokenCheckStatus.Unknown },
            { token: "LIKE", start: 2, end: 6, status: TokenCheckStatus.Correct },
            { token: "CHEESE", start: 7, end: 13, status: TokenCheckStatus.Unknown }
        ]);
    });

    it("single valid Japanese word", function() {
        let spell = new TokenSpellingManager();
        spell.add("こんいちば");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("こんいちば");

        expect(results).toEqual([
            { token: "こんいちば", start: 0, end: 5, status: TokenCheckStatus.Correct },
        ]);
    });

    it("single valid Hindi word", function() {
        let spell = new TokenSpellingManager();
        spell.add("नमस्ते");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("नमस्ते");

        expect(results).toEqual([
            { token: "नमस्ते", start: 0, end: 6, status: TokenCheckStatus.Correct },
        ]);
    });

    it("single valid Hindi word among three", function() {
        let spell = new TokenSpellingManager();
        spell.add("नमस्ते");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("नमी नमस्ते नम्र");

        expect(results).toEqual([
            { token: "नमी", start: 0, end: 3, status: TokenCheckStatus.Unknown },
            { token: "नमस्ते", start: 4, end: 10, status: TokenCheckStatus.Correct },
            { token: "नम्र", start: 11, end: 15, status: TokenCheckStatus.Unknown },
        ]);
    });

    it("single valid Russian word", function() {
        let spell = new TokenSpellingManager();
        spell.add("здравствуйте");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("здравствуйте");

        expect(results).toEqual([
            { token: "здравствуйте", start: 0, end: 12, status: TokenCheckStatus.Correct },
        ]);
    });

    it("single valid Russian word among three", function() {
        let spell = new TokenSpellingManager();
        spell.add("здравствуйте");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("сыр здравствуйте приятный");

        expect(results).toEqual([
            { token: "сыр", start: 0, end: 3, status: TokenCheckStatus.Unknown },
            { token: "здравствуйте", start: 4, end: 16, status: TokenCheckStatus.Correct },
            { token: "приятный", start: 17, end: 25, status: TokenCheckStatus.Unknown },
        ]);
    });

    it("single valid Greek word", function() {
        let spell = new TokenSpellingManager();
        spell.add("γειά");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("γειά");

        results = checker.check("γειά");

        expect(results).toEqual([
            { token: "γειά", start: 0, end: 4, status: TokenCheckStatus.Correct },
        ]);
    });

    it("single valid Greek word among two", function() {
        let spell = new TokenSpellingManager();
        spell.add("γειά");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("γειά σου");

        results = checker.check("γειά σου");

        expect(results).toEqual([
            { token: "γειά", start: 0, end: 4, status: TokenCheckStatus.Correct },
            { token: "σου", start: 5, end: 8, status: TokenCheckStatus.Unknown },
        ]);
    });
});
