from compare_text import common_substring_levenshtein

def analyse_data(text1: str, text2: str, minLen: int, ratio: float):
    text1 = text1.replace('\n', '').replace('\r', '')
    text2 = text2.replace('\n', '').replace('\r', '')
    return common_substring_levenshtein(text1, text2, minLen, ratio)
