import * as natural from "natural";
import { SpellingManager } from "./SpellingManager";
import { TokenCheckStatus } from "./TokenCheckStatus";

/**
 * A token-based spelling manager that uses non-processed list of words to
 * provides correctness testing and suggestions. This has both case-sensitive
 * and -insensitive methods along with suggestions that are capitalized based
 * on the incorrect word.
 */
export class TokenSpellingManager extends SpellingManager {
    public maximumDistance: number = 0.9;
    public sensitive: any = {};
    public insensitive: any = {};

    /**
     * Adds a word to the manager. If the word is in all lowercase, then it is
     * added as a case insensitive word, otherwise it is added as a case
     * sensitive result. If a token starts with "!", then it is automatically
     * case-sensitive.
     */
    public add(token: string|string[]): void {
        // If we aren't an array, then wrap it in an array.
        let tokens: string[];

        if (typeof token === "string") {
            tokens = [<string> token];
        } else {
            tokens = <string[]> token;
        }

        // Loop through all the tokens and add each one.
        for (let t of tokens) {
            if (t && t.trim() !== "") {
                // If we have at least one uppercase character, we are
                // considered case sensitive. We don't test for lowercase
                // because we want to ignore things like single quotes for
                // posessives or contractions.
                if (/[A-Z]/.test(t)) {
                    this.addCaseSensitive(t);
                } else if (/^!/.test(t)) {
                    this.addCaseSensitive(t.substring(1));
                } else {
                    this.addCaseInsensitive(t);
                }
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
        if (token in this.sensitive) {
            return TokenCheckStatus.Correct;
        }

        if (token.toLowerCase() in this.insensitive) {
            return TokenCheckStatus.Correct;
        }

        return TokenCheckStatus.Unknown;
    }

    /**
     * Lists all of the words in a combined list appropriate for adding back
     * into the manager.
     */
    public list(): string[] {
        // Gather up the list of sensitive items, prefixing with "!" for those
        // which would normally be in the case-insensitive list if they were
        // re-add()ed.
        let list = new Array<string>();

        for (let token in this.sensitive) {
            if (token === token.toLowerCase()) {
                list.push("!" + token);
            } else {
                list.push(token);
            }
        }

        // Add in the insensitive items.
        for (let token in this.insensitive) {
            list.push(token);
        }

        // Sort the results because we always produce sorted results. Then
        // return it.
        list.sort();
        return list;
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
        if (!input || input.trim().length === 0) {
            return [];
        }

        // Gather up all the suggestions from the case-sensitive list.
        let weights: any = [];

        for (let token in this.sensitive) {
            let distance = natural.JaroWinklerDistance(input, token);

            if (distance >= this.maximumDistance) {
                weights.push({ distance: distance, token: token });
            }
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
            } else if (/^[A-Z]/.test(input)) {
                test = test.charAt(0).toUpperCase() + test.slice(1);
            }

            // Figure out the distance as above.
            let distance = natural.JaroWinklerDistance(input, test);

            if (distance >= this.maximumDistance) {
                weights.push({ distance: distance, token: test });
            }
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
