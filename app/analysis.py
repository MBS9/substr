from collections import Counter
import os
from compare_text import common_substring_levenshtein
from jinja2 import Template
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

LevenshteinDistances = TypedDict('LevenshteinDistances', {'startA': int, 'startB': int, 'ratio': float, 'len': int, 'endA': int, 'endB': int})
Result = TypedDict('Result', {'str1': LevenshteinDistances, 'str2': LevenshteinDistances, 'cosine': float})

MAX_SUBSTRING = int(os.getenv('MAX_SUBSTRINGS', '100'))

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


def analyse_data(textA: str, textB: str, minLen: int, ratio: float, resp: Template):
    base = Counter(textA + textB)
    ## SET ALL THE BASE VALUES TO 0
    for k in base.keys():
        base[k] = 0
    levenshteinDistances = np.array(common_substring_levenshtein(textA, textB, minLen, ratio), ndmin=2, dtype=np.int64)
    if len(levenshteinDistances) > MAX_SUBSTRING:
        raise ValueError(f'{len(levenshteinDistances)} substrings is too many. Please increase the minLen or increase the ratio')

    result: list[Result] = []

    sliceListInA = levenshteinDistances[:,OUTPUT_KEYS.START_A]
    sliceListEndinA = levenshteinDistances[:,OUTPUT_KEYS.END_A]
    argSort = sliceListInA.argsort()
    sliceListInA = sliceListInA[argSort]
    sliceListEndinA = sliceListEndinA[argSort]

    sliceListInB = levenshteinDistances[: ,OUTPUT_KEYS.START_B]
    sliceListEndinB = levenshteinDistances[: ,OUTPUT_KEYS.END_B]
    argSort = np.argsort(sliceListInB)
    sliceListInB = sliceListInB[argSort]
    sliceListEndinB = sliceListEndinB[argSort]

    for elem in levenshteinDistances:
        for elem2 in levenshteinDistances:
            if (elem[OUTPUT_KEYS.END_A] >= elem2[OUTPUT_KEYS.START_A]
                or elem[OUTPUT_KEYS.END_B] >= elem2[OUTPUT_KEYS.START_B]): continue

            a = textA[elem[OUTPUT_KEYS.END_A]: elem2[OUTPUT_KEYS.START_A]]
            b = textB[elem[OUTPUT_KEYS.END_B]: elem2[OUTPUT_KEYS.START_B]]
            ## if a == '' or b == '': continue
            result.append(
                {'str1': elem,
                 'str2': elem2,
                 'cosine': cosineSimilarity(a, b, base)})

    logging.info(f"""Number of substrings: {
            len(levenshteinDistances)
        }. Length of textA: {
            len(textA)
        }. Length of textB: {len(textB)}.""")
    return resp.render(textA=textA, textB=textB,
                       sliceListInA=sliceListInA,
                       sliceListEndinA=sliceListEndinA,
                       sliceListInB=sliceListInB,
                       sliceListEndinB=sliceListEndinB,
                       result=result)
