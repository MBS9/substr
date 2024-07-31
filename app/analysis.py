from compare_text import common_substring_levenshtein
import numpy as np
import pandas as pd
import tracemalloc

def cosineSimilarity(strA: str, strB: str, base: pd.Series):
  a = pd.Series(list(strA)).value_counts()
  b = pd.Series(list(strB)).value_counts()
  a = a.add(base, fill_value=0)
  b = b.add(base, fill_value=0)
  dot = np.dot(a, b)
  A = np.square(a).sum()
  B = np.square(b).sum()
  cosine = dot/np.sqrt(A*B)
  return cosine


def analyse_data(textA: str, textB: str, minLen: int, ratio: float):
    tracemalloc.start()
    base = pd.Series(0, index=pd.Index(list(textA+textB)).unique())
    levenshteinDistances = pd.DataFrame(common_substring_levenshtein(textA, textB, minLen, ratio),
                                        columns=['startA', 'startB', 'ratio', 'substringA', 'substringB'])
    levenshteinDistances['endA'] = levenshteinDistances['startA'] + levenshteinDistances['substringA'].str.len()
    levenshteinDistances['endB'] = levenshteinDistances['startB'] + levenshteinDistances['substringB'].str.len()
    result = []
    for i, elem in levenshteinDistances.iterrows():
        for j, elem2 in levenshteinDistances.iterrows():
            ## if elem['endA'] >= elem2['startA'] or elem['endB'] >= elem2['startB']: continue
            a = textA[elem['endA']: elem2['startA']]
            b = textB[elem['endB']: elem2['startB']]
            if a == '' or b == '': continue
            result.append(
                [a, b, elem.to_dict(),
                 elem2.to_dict(), cosineSimilarity(a, b, base)])
    ret =  pd.DataFrame(result, columns=['betweenInA', 'betweenInB', 'str1', 'str2', 'cosine']).to_dict('records')
    print('MEMORY USAGE: CURRENT, PEAK')
    print(tracemalloc.get_traced_memory())
    print(tracemalloc.stop())
    return ret
