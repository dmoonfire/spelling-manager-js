import * as expect from "expect";
import * as path from "path";
import { BufferSpellingChecker, TokenSpellingManager, TokenCheckStatus } from "../index";

describe(path.basename(__filename), function() {
    it("an English sentence", () => {
        let spell = new TokenSpellingManager();
        let checker = new BufferSpellingChecker(spell);
        let results = checker.tokenizer.tokenize("I like cheese.");

        expect(results).toEqual([
            "I",
            "like",
            "cheese",
            ".",
        ]);
    });

    it("an English sentence with contraction", () => {
        let spell = new TokenSpellingManager();
        let checker = new BufferSpellingChecker(spell);
        let results = checker.tokenizer.tokenize("I don't cheese.");

        expect(results).toEqual([
            "I",
            "don't",
            "cheese",
            ".",
        ]);
    });

    it("a mostly English phrase with an accent", () => {
        let spell = new TokenSpellingManager();
        let checker = new BufferSpellingChecker(spell);
        let results = checker.tokenizer.tokenize("Rutejìmo's heart slammed");

        expect(results).toEqual([
            "Rutejìmo's",
            "heart",
            "slammed",
        ]);
    });

    it("a Japanese sentence", () => {
        let spell = new TokenSpellingManager();
        let checker = new BufferSpellingChecker(spell);
        let results = checker.tokenizer.tokenize("私 は チーズ が 好き です。");

        expect(results).toEqual([
            "私",
            "は",
            "チーズ",
            "が",
            "好き",
            "です",
            "。",
        ]);
    });
});
