import * as natural from "natural";
import { SpellingManager } from "./SpellingManager";
import { TokenStatus } from "./TokenStatus";

/**
 * Checks the contents of a buffer against a spelling manager, producing a
 * tokenized list and the check status for each one.
 */
export class BufferSpellingChecker {
    private spellingManager: SpellingManager;
    private tokenizer: natural.Tokenizer;

    constructor(
        spellingManager: SpellingManager,
        tokenizer: natural.Tokenizer = null) {
        if (!tokenizer) {
            tokenizer = new natural.RegexpTokenizer({
                pattern: /(\w+(?:\'\w+)?)/,
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
        let tokens = this.tokenizer.tokenize(buffer);
        let results = new Array<TokenStatus>();

        for (let token of tokens) {
            // If we don't have at least one character, skip it.
            if (!/\w/.test(token)) {
                continue;
            }

            // Figure out where this token appears in the buffer.
            let tokenIndex = buffer.indexOf(token, startSearch);

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
            let checkStatus = this.spellingManager.check(token);

            // Build up the token status.
            let tokenStatus: TokenStatus = {
                end: tokenIndex + token.length,
                start: tokenIndex,
                status: checkStatus,
                token: token,
            };
            results.push(tokenStatus);
        }

        // Return the results, which includes all tokens.
        return results;
    }
}
