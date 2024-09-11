import compare_text

def test_common_substring_levenshtein(stringA, stringB):
    results = compare_text.common_substring_levenshtein(stringA, stringB, 3, 0.7, 100, 0)
    for result in results:
        print(stringA[result[0]:result[1]])
        print(stringB[result[2]:result[3]])
        print(result)

test_common_substring_levenshtein('abcdzefg', 'abcdefg')

#print(compare_text.common_substring_levenshtein('xhello world abcdefghijklmnopqrstuvwxyz', 
#                                                  'yhello world abcdefghijklmnopqrstuvwxyz', 3, 0.9, 100, 0))
#
#print(compare_text.common_substring_levenshtein('Galileo Night', 
#                                                  'nt to explain', 3, 1, 100, 1))
#
### Know issue: if there are two strings like '222222222222222' and '2222222222222222', it will output repeating looking substrings
### Same with 'ab ab ab ab ab' and 'ab ab ab ab ab ab'. It will output 'ab' and 'ab' as common substrings, despite them being part of the larger common substring 'ab ab ab ab ab'.
#
### This happens if the same sequence is repeated adjacently to each other
### So like this: "subtring substring substring substring" and "substring substring substring substring substring"
### Since in the actual usage, this is not very commonly used, I will leave it as is for now.
#
#print(compare_text.common_substring_levenshtein('ab ab ab ab ab ab','ab ab ab ab ab ab', 3, 1, 100, 0))
#