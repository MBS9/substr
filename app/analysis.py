from collections import Counter
import os
from compare_text import common_substring_levenshtein
import numpy as np
import pandas as pd
import logging

MAX_SUBSTRING = int(os.getenv('MAX_SUBSTRINGS', '100'))

def cosineSimilarity(strA: str, strB: str, base: Counter[str]):
  a = Counter(strA)
  b = Counter(strB)
  a.update(base)
  b.update(base)
  
  keys = base.keys()
  
  a_vec = np.array([a[k] for k in keys])
  b_vec = np.array([b[k] for k in keys])
  print(a_vec, b_vec)
  
  dot = np.dot(a_vec, b_vec)
  A = np.dot(a_vec, a_vec)
  B = np.dot(b_vec, b_vec)

  cosine = dot/np.sqrt(A*B)

  return cosine


def analyse_data(textA: str, textB: str, minLen: int, ratio: float):
    base = Counter(textA + textB)
    ## SET ALL THE BASE VALUES TO 0
    for k in base.keys():
        base[k] = 0
    print(base)
    levenshteinDistances = pd.DataFrame(common_substring_levenshtein(textA, textB, minLen, ratio),
                                        columns=['startA', 'startB', 'ratio', 'substringA', 'substringB'])
    if len(levenshteinDistances.index) > MAX_SUBSTRING:
        raise ValueError(f'{len(levenshteinDistances.index)} substrings is too many. Please increase the minLen or increase the ratio')
    levenshteinDistances['endA'] = levenshteinDistances['startA'] + levenshteinDistances['substringA'].str.len()
    levenshteinDistances['endB'] = levenshteinDistances['startB'] + levenshteinDistances['substringB'].str.len()
    result = []
    for i, elem in levenshteinDistances.iterrows():
        for j, elem2 in levenshteinDistances.iterrows():
            if elem['endA'] >= elem2['startA'] or elem['endB'] >= elem2['startB']: continue
            a = textA[elem['endA']: elem2['startA']]
            b = textB[elem['endB']: elem2['startB']]
            ## if a == '' or b == '': continue
            result.append(
                {'betweenInA': a,
                 'betweenInB': b,
                 'str1': elem.to_dict(),
                 'str2': elem2.to_dict(),
                 'cosine': cosineSimilarity(a, b, base)})

    logging.info(f"""Number of substrings: {
            len(levenshteinDistances.index)
        }. Length of textA: {
            len(textA)
        }. Length of textB: {len(textB)}.""")
    return result
