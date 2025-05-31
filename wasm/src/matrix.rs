use std::cmp::min;

use crate::{synonyms::Token, utils::*};

pub fn find_levenshtein_matches(
    a: &[Token],
    b: &[Token],
    min_len: usize,
    ratio: f32,
    max_substrings: usize,
    max_strikes: usize
) -> Vec<SubstringResult> {
    let mut ret: Vec<SubstringResult> = Vec::new();
    let mut l: EfficientMatrix<MatrixElement> =
        EfficientMatrix::new(MatrixElement { len: 0 }, b.len()+1);
    // There is a bug where the last element must be different from other last elements, or the last substring will be ignored
    for (mut i, c) in a.into_iter().enumerate() {
        for (mut j, d) in b.into_iter().enumerate() {
            l[i][j].zero();
            if c == d {
                if i == 0 || j == 0 {
                    l[i][j].len = 1;
                } else {
                    l[i][j].len = l[i - 1][j - 1].len + 1;
                }
            } else {
                if i == 0 || j == 0 {
                    continue;
                }
                // We don't check the single character
                let mut len = l[i - 1][j - 1].len;
                if len == 0 {
                    continue;
                };
                
                i = min(i, a.len() - 1);
                j = min(j, b.len() - 1);

                // Calculate the edit ratio
                let mut diffirent = levenshtein_edit_distance(
                    &a[(i - l[i - 1][j - 1].len)..(i + 1)],
                    &b[(j - l[i - 1][j - 1].len)..(j + 1)],
                );
                len += 1;
                let mut edit_ratio = ((len - diffirent) as f32) / (len as f32);

                // If it is more then the set value, and we are not yet at the end of the string, continue
                if edit_ratio > ratio && j < b.len() - 1 {
                    l[i][j].len = len;
                    continue;
                }

                // Calculate the edit ratio for the returning string
                len -= 1;
                diffirent = levenshtein_edit_distance(
                    &a[(i - l[i - 1][j - 1].len)..(i)],
                    &b[(j - l[i - 1][j - 1].len)..(j)],
                );
                edit_ratio = ((len - diffirent) as f32) / (len as f32);

                if len >= min_len { // Possibly use 1 instead of minLen here? If so, we need to check this constraint later...
                    // We don't need the -1 because the range is exclusive on the right side
                    // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                    ret.push(SubstringResult {
                        start_a: i - len,
                        end_a: i,
                        start_b: j - len,
                        end_b: j,
                        len,
                        edit_ratio,
                    });
                    if ret.len() >= max_substrings {
                        alert("Too many matches found, limiting the amount returned!");
                        return ret;
                    }
                }
            }
        }
    }
    expand_matches_left_and_right(
        ret.as_mut_slice(),
        a,
        b,
        ratio,
        max_strikes,
    );
    ret
}
