from collections import Counter
import json
import os
from compare_text import common_substring_levenshtein
import numpy as np
import logging
from typing import TypedDict

class OUTPUT_KEYS:
    START_A = 0
    END_A = 1
    START_B = 2
    END_B = 3
    LEN = 4
    RATIO = 5


Result = TypedDict('Result',
                   {'a': tuple[int, int],
                    'b': tuple[int, int],
                    'similarity': float,
                    'match': bool})

MAX_SUBSTRING = int(os.getenv('MAX_SUBSTRINGS', '100'))

def listSlice(xs, start):
    for i in range(start, len(xs)):
        yield xs[i]

def cosineSimilarity(strA: str, strB: str, base: Counter[str]):
  a = Counter(strA)
  b = Counter(strB)
  a.update(base)
  b.update(base)
  
  keys = base.keys()
  
  a_vec = np.array([a[k] for k in keys])
  b_vec = np.array([b[k] for k in keys])
  
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
    levenshteinDistances: list[tuple[int, int, int, int, int, float]] = common_substring_levenshtein(textA, textB, minLen, ratio)
    if len(levenshteinDistances) > MAX_SUBSTRING:
        raise ValueError(f'{len(levenshteinDistances)} substrings is too many. Please increase the minLen or increase the ratio')

    result: list[Result] = []

    for i, elem in enumerate(levenshteinDistances):
        result.append({
            'a': (elem[OUTPUT_KEYS.START_A], elem[OUTPUT_KEYS.END_A]),
            'b': (elem[OUTPUT_KEYS.START_B], elem[OUTPUT_KEYS.END_B]),
            'similarity': elem[OUTPUT_KEYS.RATIO],
            'match': True
        })
        for elem2 in listSlice(levenshteinDistances, i + 1):
            if (elem[OUTPUT_KEYS.END_A] >= elem2[OUTPUT_KEYS.START_A]
                or elem[OUTPUT_KEYS.END_B] >= elem2[OUTPUT_KEYS.START_B]): continue

            a = textA[elem[OUTPUT_KEYS.END_A]: elem2[OUTPUT_KEYS.START_A]]
            b = textB[elem[OUTPUT_KEYS.END_B]: elem2[OUTPUT_KEYS.START_B]]
            ## if a == '' or b == '': continue
            result.append(
                {'a': (elem[OUTPUT_KEYS.END_A], elem2[OUTPUT_KEYS.START_A]),
                 'b': (elem[OUTPUT_KEYS.END_B], elem2[OUTPUT_KEYS.START_B]),
                 'similarity': cosineSimilarity(a, b, base),
                 'match': False})

    logging.info(f"""Number of substrings: {
            len(levenshteinDistances)
        }. Length of textA: {
            len(textA)
        }. Length of textB: {len(textB)}.""")
    return json.dumps({'pairs': result})
