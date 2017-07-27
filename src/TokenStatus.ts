import { TokenCheckStatus } from "./TokenCheckStatus";

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
