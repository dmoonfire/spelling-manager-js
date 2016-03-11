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

    /**
    * Gives a suggestion for a token, sorted by likelyhood with the first item
    * in the resulting array being the most likely.
    */
    public suggest(token: string): string[] {
        return [];
    }
}

/**
* A token-based spelling manager that uses non-processed list of words to provides
* correctness testing and suggestions. This has both case-sensitive and -insensitive
* methods along with suggestions that are capitalized based on the incorrect word.
*/
export class TokenSpellingManager extends SpellingManager {
    public maximumDistance: number = 0.9;
    public sensitive: any = {};
    public insensitive: any = {};

    /**
    * Adds a word to the manager. If the word is in all lowercase, then it is added as
    * a case insensitive word, otherwise it is added as a case sensitive result.
    * If a token starts with "!", then it is automatically case-sensitive.
    */
    public add(token: string): void {
        if (token && token.trim() !== "") {
            // If we have at least one uppercase character, we are considered
            // case sensitive. We don't test for lowercase because we want to
            // ignore things like single quotes for posessives or contractions.
            if (/[A-Z]/.test(token)) {
                this.addCaseSensitive(token);
            } else if (/^!/.test(token)) {
                this.addCaseSensitive(token.substring(1));
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
            this.insensitive[token.toLowerCase()] = true;
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

    /**
    * Gives a suggestion for a token, sorted by likelyhood with the first item
    * in the resulting array being the most likely.
    */
    public suggest(input: string): string[] {
        // If the input is blank or null, then we don't have a suggestion.
        if (!input || input.trim().length === 0) return [];

        // Gather up all the suggestions from the case-sensitive list.
        let weights: any = [];

        for (let token in this.sensitive) {
            let distance = natural.JaroWinklerDistance(input, token);
            if (distance >= this.maximumDistance)
                weights.push({ token: token, distance: distance });
        }

        // Also gather up the weights from the insensitive list. When we go
        // through this one, we try to find the "best" approach which means if
        // the input is all uppercase, then we compare that. Otherwise, we try
        // initial capital, and finally we see if lowercase would work better.
        for (let token in this.insensitive) {
            // Figure out the best approah.
            let test: string = token;

            if (/[A-Z].*[A-Z]/.test(input)) {
                test = test.toUpperCase();
            }
            else if (/^[A-Z]/.test(input)) {
                test = test.charAt(0).toUpperCase() + test.slice(1);
            }

            // Figure out the distance as above.
            let distance = natural.JaroWinklerDistance(input, test);
            if (distance >= this.maximumDistance)
                weights.push({ token: test, distance: distance });
        }

        // Sort the list based on the distances. This will have the first key
        // be the highest distance.
        let keys = Object.keys(weights).sort(function(key1, key2) {
            let value1 = weights[key1];
            let value2 = weights[key2];
            if (value1.distance !== value2.distance) {
                return value1.distance - value2.distance;
            }
            return value1.token.localeCompare(value2.token);
        });

        // Go through the resulting items and pull out an ordered list.
        let results: string[] = [];

        for (let key of keys) {
            results.push(weights[key].token);
        }

        return results;
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
