# Find substring

Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring

Returns index of substring and substrings of length at least min

Does not return overlapping substrings

## Installing

Python extension module:

```shell
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
pip install .
```

## API

****

### **common_substring**

`common_substring` finds substrings which exists in both texts. 

**Call Signature:** `common_substring(textA, textB, minStringLength)`

**Returns**: A tupple of form `(startingIndexInTextA, startingIndexInTextB, substring)`

**Same as** `common_substring_levenshtein` with `edit_ratio=1`

****

### **common_substring_levenshtein**

`common_substring_levenshtein` finds substrings which exists in both texts, and have at least a certain degree of Levenshtein edit ratio similarity. 

**Call Signature:** `common_substring_levenshtein(textA, textB, minStringLength, editRatio)`

**Returns**: A tupple of form `(startingIndexInTextA, startingIndexInTextB, substring, editRatio)`

****

Example below:

```python

from compare_text import common_substring, common_substring_levenshtein
print(common_substring(textA, textB, 2))
print(common_substring_levenshtein(textA, textB, 2, 0.8))
```

Outputs:

```
[(0, 4, 'kk'), (2, 0, 'agb'), (5, 4, 'kk'), (16, 6, 'hcd'), (23, 22, 'hello')]
[(0, 4, 1.0, 'kk'), (2, 0, 1.0, 'agb'), (5, 4, 1.0, 'kk'), (16, 6, 1.0, 'hcd'), (23, 22, 1.0, 'hello')]
```
