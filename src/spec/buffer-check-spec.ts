/// <reference path="../../typings/main.d.ts"/>
/// <reference path="../init.ts"/>
import { BufferSpellingChecker, TokenSpellingManager, TokenCheckStatus } from "../init";

describe("simple positive check", function() {
    it("single valid word", function() {
        let spell = new TokenSpellingManager();
        spell.add("like");

        let checker = new BufferSpellingChecker(spell);
        let results = checker.check("I like cheese.");

        results = checker.check("I LIKE CHEESE.");

        expect(results).toEqual([
            { token: 'I', start: 0, end: 1, status: TokenCheckStatus.Unknown },
            { token: 'LIKE', start: 2, end: 6, status: TokenCheckStatus.Correct },
            { token: 'CHEESE', start: 7, end: 13, status: TokenCheckStatus.Unknown }
        ]);
    });
});
