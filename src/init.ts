/// <reference path="../typings/main.d.ts"/>
import * as natural from "natural";

/**
* The various states of checking a token.
*/
export enum TokenCheckStatus {
    Unknown,
    Correct,
    Incorrect
}

/**
* Describes a single token within a given text along with its positioning
* information.
*/
export interface TokenStatus {
    start: number;
    end: number;
    token: string;
    status: TokenCheckStatus;
}

/**
* Defines the common functionality for the various spelling managers.
*/
export abstract class SpellingManager {
    /**
    * Adds a word to the spelling manager.
    */
    public add(token: string): void { }

    /**
    * Check to see if a token is correct.
    */
    public isCorrect(token: string): boolean {
        return this.check(token) === TokenCheckStatus.Correct;
    }

    /**
    * Checks the token to determine if it is correct or incorrect.
    */
    public check(token: string): TokenCheckStatus {
        return TokenCheckStatus.Unknown;
    }
}

/**
* A token-based spelling manager that uses non-processed list of words to provides
* correctness testing and suggestions. This has both case-sensitive and -insensitive
* methods along with suggestions that are capitalized based on the incorrect word.
*/
export class TokenSpellingManager extends SpellingManager {
    public sensitive: any = {};
    public insensitive: any = {};

    /**
    * Adds a word to the manager. If the word is in all lowercase, then it is added as
    * a case insensitive word, otherwise it is added as a case sensitive result.
    */
    public add(token: string): void {
        if (token && token.trim() !== "") {
            // If we have at least one uppercase character, we are considered
            // case sensitive. We don't test for lowercase because we want to
            // ignore things like single quotes for posessives or contractions.
            if (/[A-Z]/.test(token)) {
                this.addCaseSensitive(token);
            } else {
                this.addCaseInsensitive(token);
            }
        }
    }

    /**
    * Adds a case-sensitive token, if it hasn't already been added.
    *
    * There is no check to see if this token is already in the case-insensitive
    * list.
    */
    public addCaseSensitive(token: string): void {
        if (token && token.trim() !== "") {
            this.sensitive[token] = true;
        }
    }

    /**
    * Adds a case-insensitive token, if it hasn't already been added.
    *
    * There is no check to see if this token is already in the case-sensitive
    * list.
    */
    public addCaseInsensitive(token: string): void {
        if (token && token.trim() !== "") {
            this.insensitive[token] = true;
        }
    }

    /**
    * Checks the token to determine if it is correct or incorrect.
    */
    public check(token: string): TokenCheckStatus {
        if (token in this.sensitive) return TokenCheckStatus.Correct;
        if (token.toLowerCase() in this.insensitive) return TokenCheckStatus.Correct;
        return TokenCheckStatus.Unknown;
    }

    /**
    * Removes tokens, if it has been added.
    */
    public remove(token: string): void {
        if (token && token.trim() !== "") {
            this.removeCaseSensitive(token);
            this.removeCaseInsensitive(token.toLowerCase());
        }
    }

    /**
    * Removes a case-sensitive token, if it has been added.
    */
    public removeCaseSensitive(token: string): void {
        if (token && token.trim() !== "") {
            delete this.sensitive[token];
        }
    }

    /**
    * Removes a case-insensitive token, if it has been added.
    */
    public removeCaseInsensitive(token: string): void {
        if (token && token.trim() !== "") {
            delete this.insensitive[token];
        }
    }
}

/**
* Checks the contents of a buffer against a spelling manager, producing a
* tokenized list and the check status for each one.
*/
export class BufferSpellingChecker {
    constructor(spellingManager: SpellingManager, tokenizer: natural.Tokenizer = null) {
        if (!tokenizer) {
            tokenizer = new natural.RegexpTokenizer({ pattern: /(\w+(?:\'\w+)?)/ });
        }

        this.spellingManager = spellingManager;
        this.tokenizer = tokenizer;
    }

    private spellingManager: SpellingManager;
    private tokenizer: natural.Tokenizer;

    public check(buffer: string): TokenStatus[] {
        // If we have a blank or empty string, then just return an empty list.
        if (!buffer || buffer.trim() === "") return new Array<TokenStatus>();

        // Since we have useful values, we need to now tokenize them. This
        // doesn't give us positional information, but we'll build that up as we
        // figure out the spelling status.
        let startSearch = 0;
        let tokens = this.tokenizer.tokenize(buffer);
        let results = new Array<TokenStatus>();

        for (let token of tokens) {
            // If we don't have at least one character, skip it.
            if (!/\w/.test(token)) continue;

            // Figure out where this token appears in the buffer.
            let tokenIndex = buffer.indexOf(token, startSearch);

            if (tokenIndex < 0) {
                // We should never get to this.
                throw new Error(`Cannot find token '${token}' starting at position ${startSearch}.`);
            }

            startSearch = tokenIndex + token.length;

            // Figure out the spelling status.
            let checkStatus = this.spellingManager.check(token);

            // Build up the token status.
            let tokenStatus: TokenStatus = {
                token: token,
                start: tokenIndex,
                end: tokenIndex + token.length,
                status: checkStatus
            };
            results.push(tokenStatus);
        }

        // Return the results, which includes all tokens.
        return results;
    }
}
