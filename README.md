# Comparing texts

## Setup

```shell
docker rmi ghcr.io/mbs9/substr-analyzer:latest
docker run -e NO_CAPTCHA=1 -e RECAPTCHA_SECRET=NA -p 8080:8080 --rm ghcr.io/mbs9/substr-analyzer:latest
```

Then go to [this URL](https://mbs9.github.io/substr/run)and enjoy!

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

The algorithm will assume some the existance of some simple utility functions, these are:

```
Notation:
<Algorithm name> (<parameters>): <algorithm discription>

Levenshtein Edit ratio (l, d): returns (l-d)/d
```

### The algorithm

This uses a modified version of the longest common substring algorithm.

It takes two inputs: `ratio` and `minLen`.

The concept is built around a table: the letters of Text A in the rows, and the leeters of text B in the columns.

For example is "ABCDEF" is text A and "FABCDFE" is text B, the table would look like this:

|   | A | B | C | D | E | E |
|---|---|---|---|---|---|---|
| F |   |   |   |   |   |   |
| A |   |   |   |   |   |   |
| B |   |   |   |   |   |   |
| C |   |   |   |   |   |   |
| D |   |   |   |   |   |   |
| F |   |   |   |   |   |   |
| E |   |   |   |   |   |   |

In the elements of each cell contains two natural numbers: l and d.

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
- if the levenshtein edit ratio of `(l+1, d+1)` from the `i-1`, `j-1` cell is less or equal to `ratio` and `l` is greater or equal to `minLen`, then declare the substring of length `l` and end position in text A and B to be `i-1` and `j-1` respectively to be a match. 

```

At the end, the table may look something like this (with `ratio=0.5` and `minLen=3`):

|   | A   | B   | C   | D   | E   | F   |
|---|-----|-----|-----|-----|-----|-----|
| F | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 |
| A | 1,0 | 0,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| B | 0,0 | 2,0 | 0,0 | 0,0 | 0,0 | 0,0 |
| C | 0,0 | 0,0 | 3,0 | 0,0 | 0,0 | 0,0 |
| D | 0,0 | 0,0 | 0,0 | 4,0 | 0,0 | 0,0 |
| F | 0,0 | 0,0 | 0,0 | 0,0 | 4,1 | 1,0 |
| E | 0,0 | 0,0 | 0,0 | 0,0 | 1,0 | 4,2 |

The only match would be between index 0 to 5 of text A and 1 to 6 of text B.

Hopefully the match is visible across the diagonal.
