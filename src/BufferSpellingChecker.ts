import * as natural from "natural";
import * as regexHelper from "./regex-helper";
import { SpellingManager } from "./SpellingManager";
import { TokenStatus } from "./TokenStatus";

/**
 * Checks the contents of a buffer against a spelling manager, producing a
 * tokenized list and the check status for each one.
 */
export class BufferSpellingChecker {
    public tokenizer: natural.Tokenizer;
    private spellingManager: SpellingManager;

    constructor(
        // Save the member variables.
        spellingManager: SpellingManager,
        tokenizer: natural.Tokenizer = null) {

        // We weren't provided a tokenizer, we create a 'best guess' one that
        // handles most of the conditions. This attempts to include Unicode
        // breaks also to identify those words. We also avoid punctuation only
        // elements but do include punctuation inside a word so we can treat
        // "didn't" as a single word.
        if (!tokenizer) {
            tokenizer = new natural.RegexpTokenizer({
                pattern: regexHelper.wordTokenzier,
            });
        }

        this.spellingManager = spellingManager;
        this.tokenizer = tokenizer;
    }

    public check(buffer: string): TokenStatus[] {
        // If we have a blank or empty string, then just return an empty list.
        if (!buffer || buffer.trim() === "") {
            return new Array<TokenStatus>();
        }

        // Since we have useful values, we need to now tokenize them. This
        // doesn't give us positional information, but we'll build that up as we
        // figure out the spelling status.
        let startSearch = 0;
        const tokens = this.tokenizer.tokenize(buffer);
        const results = new Array<TokenStatus>();

        for (const token of tokens) {
            // If we don't have at least one character, skip it.
            if (!regexHelper.isWord.test(token)) {
                continue;
            }

            // Figure out where this token appears in the buffer.
            const tokenIndex = buffer.indexOf(token, startSearch);

            if (tokenIndex < 0) {
                // We should never get to this.
                throw new Error("Cannot find token '"
                    + token
                    + "' starting at position "
                    + startSearch
                    + "}.");
            }

            startSearch = tokenIndex + token.length;

            // Figure out the spelling status.
            const checkStatus = this.spellingManager.check(token);

            // Build up the token status.
            const tokenStatus: TokenStatus = {
                end: tokenIndex + token.length,
                start: tokenIndex,
                status: checkStatus,
                token,
            };
            results.push(tokenStatus);
        }

        // Return the results, which includes all tokens.
        return results;
    }
}
