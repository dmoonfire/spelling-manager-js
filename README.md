# Spelling Manager (Javascript)

A library that provides a framework for creating and using spelling checkers. This is a composite-based system where individual components can be combined together to provide the spelling checking on larger text strings.

## Usage

Here are some basic examples of usage using ES6 module syntax.

```javascript
import { BufferSpellingChecker, TokenSpellingManager, TokenCheckStatus } from "spelling-manager";
// var spelling = require("spelling-manager");

var spell = new TokenSpellingManager();
spell.add("like"); // Adds a case-insensitive token.
spell.add("I"); // Adds a case-sensitive token.
spell.remove("I"); // Removes the token.

var checker = new BufferSpellingChecker(spell);
var results = checker.check("I like cheese.");

console.log(results);
//[ { token: 'I', start: 0, end: 1, status: 0 },
//  { token: 'like', start: 2, end: 6, status: 1 },
//  { token: 'cheese', start: 7, end: 13, status: 0 } ]
console.log(results[0].status === TokenCheckStatus.Unknown);
//true
console.log(results[1].status === TokenCheckStatus.Correct);
//true
console.log(results[2].status === TokenCheckStatus.Incorrect);
//false

var results2 = checker.check("I LIKE CHEESE.");

console.log(results);
//[ { token: 'I', start: 0, end: 1, status: 0 },
//  { token: 'LIKE', start: 2, end: 6, status: 1 },
//  { token: 'CHEESE', start: 7, end: 13, status: 0 } ]
```

A [natural](https://github.com/NaturalNode/natural) tokenizer can be provided if the input buffer should be split in a different manner. The default tokenizer splits on words and single quotes, so "James'" will be "James" and "Mary's" will result in "Mary's".

```javascript
import * as natural from "natural";
import { BufferSpellingChecker, TokenSpellingManager } from "spelling-manager";
// var spelling = require("spelling-manager");

var tokenizer = new natural.TreebankWordTokenizer();
var spell = new TokenSpellingManager();
var checker = new BufferSpellingChecker(spell, tokenizer);
```

## Building and Tests

To build the library:

```sh
npm run build
```

To test the library:

```sh
npm test
```

## License

MIT
