import compare_text

print(compare_text.common_substring('kkagbkkhcd', 'agbrkkhcd', 2))
print(compare_text.common_substring_levenshtein('kkagbkkhcdhguz', 
                                                  'agbrkkhcdzgzu', 2, 0.8))

print(compare_text.common_substring_levenshtein('xhello world abcdefghijklmnopqrstuvwxyz', 
                                                  'yhello world abcdefghijklmnopqrstuvwxyz', 3, 0.9))

## Know issue: if there are two strings like '222222222222222' and '2222222222222222', it will output repeating looking substrings
## Same with 'ab ab ab ab ab' and 'ab ab ab ab ab ab'. It will output 'ab' and 'ab' as common substrings, despite them being part of the larger common substring 'ab ab ab ab ab'.

print(compare_text.common_substring('ab ab ab ab ab ab','ab ab ab ab ab ab', 3))
