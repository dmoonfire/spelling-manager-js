import { TokenCheckStatus } from "./TokenCheckStatus";

/**
 * Defines the common functionality for the various spelling managers.
 */
export abstract class SpellingManager {
    /**
     * Adds a word to the spelling manager.
     */
    public add(token: string): void {
        // We don't have default functionality for adding.
    }

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
