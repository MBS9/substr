from compare_text import common_substring_levenshtein

def analyse_data(text1, text2, minLen, ratio):
    return common_substring_levenshtein(text1, text2, minLen, ratio)