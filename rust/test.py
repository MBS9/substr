import compare_text

print(compare_text.common_substring('kkagbkkhcd', 'agbrkkhcd', 2))
print(compare_text.common_substring_levenshtein('kkagbkkhcdhguz', 
                                                  'agbrkkhcdzgzu', 2, 0.8))
