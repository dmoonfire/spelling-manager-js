/**
 * This module encapsulates the RegExp building used throughout the entire
 * library. It supports not only the basic ASCII searching for words but also
 * includes Unicode processing to make it more useful for more users.
 */

import * as XRegExp from "xregexp";

// tslint:disable-next-line
// https://stackoverflow.com/questions/4304928/unicode-equivalents-for-w-and-b-in-java-regular-expressions
// In the above link, there is a discussion of the Unicode-version of \w, \W,
// and other characters. XRegExp has a limitation that it can't handle the
// nested character range `[...[\p{In...}&&\p{So}]]`, so we don't use that.
//
// http://www.regular-expressions.info/unicode.html
// This link talks about the various groups and codes we use. Below are the
// ones we mostly expect to use.
//
// \p{L} - Letters
// \p{M} - Marks (accents, combining characters, etc.)
// \p{N} - Numbers
//   \p{Nd} - Obvious digits
//   \p{Nl} - Numbers that look like letters (roman numbers)
//   \p{No} - Superscript and subscript numbers
// \p{P} or \p{Punctuation}: any kind of punctuation character.
//   \p{Pd} - any kind of hyphen or dash.
//   \p{Ps} - any kind of opening bracket.
//   \p{Pe} - any kind of closing bracket.
//   \p{Pi} - any kind of opening quote.
//   \p{Pf} - any kind of closing quote.
//   \p{Pc} - a punctuation character such as an underscore that connects words.
//   \p{Po} - any kind of punctuation character that is not a dash, bracket,
const char =
  "(?:[\\p{L}\\p{M}\\p{Nd}\\p{Nl}\\p{Pc}]|" +
  "(?=\\p{InEnclosedAlphanumerics})\\p{So})";

// The important part is also handling puncutation in the middle of the word for
// things like contractions. There isn't a Unicode pattern for these, so we
// keep a list of characters that can be used as such. (This also handles those
// sci-fi and fantasy writers who love having apostrophes in the middle of
// names).
const innerWordPunctuation = "['\\u{2019}]";

/**
 * This regular expression is used to break a buffer down into its component
 * parts. It works mostly on word boundaries but also returns "don't" as a
 * single word instead of three components (["don", "'", "t"]). The capture
 * group used with this query will be the words split apart and passed into
 * the check() method.
 */
export let wordTokenzier = XRegExp(
    "("
    + char
    + "+(?:"
    + innerWordPunctuation
    + char
    + "+)?)");

/**
 * A regular expression that indicates there is a significant word in the given
 * token. This is used to avoid passing puncutation sequences into the
 * check() method.
 */
export let isWord = XRegExp(char);
