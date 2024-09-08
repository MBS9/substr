# Comparing texts

## Setup

```shell
docker rmi ghcr.io/mbs9/substr-analyzer:latest
docker run -e NO_CAPTCHA=1 -e RECAPTCHA_SECRET=NA -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

Then go to [this URL](https://mbs9.github.io/substr/run) and enjoy!

## Technical Setup

The `rust` directory contains the Rust extension module

The `app` directory contains the Python web app.

First, go to the `app` directory, and setup the `.env` file.

Then:

```shell
docker build -t string_compare .
docker run --rm -p 8080:8080 string_compare
```

Then go to `http://localhost:8080/`

Or from pre-built container

```shell
docker run --env-file ./app/.env -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

Or

```shell
docker run -e NO_CAPTCHA=1 -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

## The algorithm

### Utility Functions

The algorithm will assume the existance of some simple utility functions, these are:

```
Notation:
<Algorithm name> (<parameters>): <algorithm discription>

Levenshtein Edit ratio (l, d): returns (l-d)/d
Dot Product (vectorA, vectorB): returns the dot product of vectorA and vectorB. By dot product, we refer to multiplying the corresponding element of each vector, and summing the results.
```

### The string matching algorithm

This uses a modified version of the longest common substring algorithm.

It takes three inputs: `ratio`, `minLen`, and `maxStrikes`.

The concept is built around a table: the letters of Text A in the rows, and the letters of text B in the columns.

For example if "ABCDEFZ" is text A and "FABCDFEY" is text B, then the table would look like this:

|   | A | B | C | D | E | E | Z |
|---|---|---|---|---|---|---|---|
| F |   |   |   |   |   |   |   |
| A |   |   |   |   |   |   |   |
| B |   |   |   |   |   |   |   |
| C |   |   |   |   |   |   |   |
| D |   |   |   |   |   |   |   |
| F |   |   |   |   |   |   |   |
| E |   |   |   |   |   |   |   |
| Y |   |   |   |   |   |   |   |

The elements of each cell contains two natural numbers: l and d.

In this document, we will represent these two values inside the tables like this: l, d. For example, if a table cell contains `5, 2` that means `l=5` and `d=2`.

Initially all cells are initialized to `0, 0`.

The algorithm will start traversing the table row-by-row, from top-to-buttom and left-to-right.

In each cell, it will look at the corresponding letter from text A and text B, and apply the below:

```

Suppose the cell is in the ith row and jth column.

If the corresponding letter from text A matches the letter from text B:
- and `i` or `j` is 1, it will insert 0, 0 into the cell.
- and `i` and `j` is not 1, it will copy `l` and `d` from the `i-1` row and `j-1` column incrementing `l` by one.

If the corresponding letter from text A does not match the letter from text B:
- if levenshtein edit ratio of `(l+1, d+1)` from the `i-1`, `j-1` cell is greater then `ratio`, set the current cell to be `(l+1, d+1)`.
- if the levenshtein edit ratio of `(l+1, d+1)` from the `i-1`, `j-1` cell is less or equal to `ratio` and `l` is greater or equal to `minLen`, then declare the substring of length `l` and end position in text A and B to be `i-1` and `j-1` respectively to be a match. Content of the cell is left 0,0 .
- if neither of the above match, the cell content is left 0,0.

```

At the end, the table may look something like this (with `ratio=0.6` and `minLen=3`):

|   | A   | B   | C   | D   | E   | F   | Z   |
|---|-----|-----|-----|-----|-----|-----|-----|
| F | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 | 0,0 |
| A | 1,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| B | 0,0 | 2,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| C | 0,0 | 0,0 | 3,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| D | 0,0 | 0,0 | 0,0 | 4,0 | 0,0 | 0,0 | 0,0 |
| F | 0,0 | 0,0 | 0,0 | 0,0 | 5,1 | 1,0 | 0,0 |
| E | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 | 6,2 | 0,0 |
| Y | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |

The only match would be between index 0 to 6 of text A and 1 to 6 of text B.

Hopefully the match is visible across the diagonal.

Once these initial matches are identified, the algorithm continues by trying to expand the matches. It looks at the next characters after the end of the string, and observes that if it includes some of the next `maxStrike` characters, whether the Levenshtein edit ratio goes above `ratio`. If it goes above, then it looks at the next `maxStrike` characters.

#### Memory

Building this table can be memory intensive. To help with this, this implementation only stores the last 2 rows, and rest are discarded. This ensures that uneeded data is not stored.

#### Known issues

If both text A and text B contain the same repeating pattern adjacently (e.g.: `textA=textB='AB AB AB AB'`), the algorithm will identify this pattern multiple times, even though they are part of a greater substring.

That is for `textA=textB='AB AB AB AB'`, the algorithm would output:
- `'AB AB AB AB'` - this is correct
- `'AB AB AB'` - this is unecessary - it is already contained in the above substring
- `'AB AB'` - this is unecessary - it is already contained in the above substring
- `'AB'` - this is unecessary - it is already contained in the above substring

### The cosine similarity

Once the similar substrings have been identified, the algorithm applies the below algorithm to substrings that are between (sandwiched) by the matched substrings.

So that is, the algorithm will apply the below algorithm to an array of string pairs. These pairs contain the sandwiched substrings from both text A and B. If there is a match (we will denote this match as M1) and another match (which we will denote as M2), the algorithm would extract the substring sandwiched by M1 and M2 from both text A and B.

For each of these sandwiched pairs, it will find the set of all characters that appear in the pair.

For example if a pair is `abcd` and `cdef`, then the set would contain `abcdef`.

Second it builds an array from this set. That is, `abcdef` would become `[a, b, c, d, e, f]`.

It then builds a vector for both strings, where the nth element of the vector represents the frequency of the character at position n of the array in the string. It would build this vector for each string in the pair. So two vectors per pair.

It then calculates the dot product of the two vectors, and divides it by the square root of the dot product of the vectors with themselves.

That is, the formula is (`dot(A, B)` represents the dot products of vector A and B):

`dot(vecA, vecB)/sqrt(dot(vecA, vecA) * dot(vecB, vecB))` where `vecA` and `vecB` are vectors from the sandwiched pairs from textA and textB respectively.

The result of this is the cosine similarity of the two vectors.

### The output

Finally, the algorithm returns the substrings that where matched (together with their ratio), and the sandwiched substrings (together with their cosine similarities).
