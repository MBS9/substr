extern crate wasm_bindgen;
use std::collections::{HashMap, HashSet};
use std::panic::{self, PanicHookInfo};
use std::{
    cmp::min,
    cmp::max,
    ops::{Index, IndexMut},
};
use wasm_bindgen::prelude::*;

struct MatrixElement {
    len: usize,
}

impl std::clone::Clone for MatrixElement {
    fn clone(&self) -> Self {
        MatrixElement {
            len: self.len,        }
    }
}

impl MatrixElement {
    fn zero(&mut self) {
        self.len = 0;
    }
}

// Efficient matrix implementation - only stores last 2 rows to save memory
struct EfficientMatrix<T> {
    row_len: usize,
    data: Vec<T>,
}

impl<T: std::clone::Clone> EfficientMatrix<T> {
    fn new(inital: T, row_len: usize) -> Self {
        EfficientMatrix {
            row_len,
            data: vec![inital; 2 * row_len],
        }
    }
}

impl<T> Index<usize> for EfficientMatrix<T> {
    type Output = [T];

    fn index(&self, index: usize) -> &[T] {
        let base = (index % 2) * self.row_len;
        &self.data[base..][..self.row_len]
    }
}

impl<T> IndexMut<usize> for EfficientMatrix<T> {
    fn index_mut(&mut self, index: usize) -> &mut [T] {
        let base = (index % 2) * self.row_len;
        &mut self.data[base..][..self.row_len]
    }
}

fn levenshtein_edit_distance(a_chars: &[char], b_chars: &[char]) -> usize {
    let mut l = EfficientMatrix::new(0, b_chars.len() + 1);

    for j in 0..(b_chars.len() + 1) {
        l[0][j] = j;
    }
    for i in 1..(a_chars.len() + 1) {
        l[i][0] = i;
        for j in 1..(b_chars.len() + 1) {
            if a_chars[i - 1] == b_chars[j - 1] {
                l[i][j] = l[i - 1][j - 1];
            } else {
                l[i][j] = min(l[i - 1][j], min(l[i][j - 1], l[i - 1][j - 1])) + 1;
            }
        }
    }
    l[a_chars.len()][b_chars.len()]
}

fn cosine_similarity(str_a: &[char], str_b: &[char]) -> f32 {
    // Find the frequency of each unicode character in the string
    let mut a: HashMap<char, u32> = HashMap::new();
    let mut b: HashMap<char, u32> = HashMap::new();
    for c in str_a {
        *a.entry(*c).or_insert(0) += 1;
    }
    for c in str_b {
        *b.entry(*c).or_insert(0) += 1;
    }
    let mut dot_product = 0;
    let mut norm_a = 0;
    let mut norm_b = 0;
    let all_keys = a
        .keys()
        .chain(b.keys())
        .collect::<HashSet<&char>>()
        .into_iter();
    for i in all_keys {
        let a_freq = *a.get(i).unwrap_or(&0);
        let b_freq = *b.get(i).unwrap_or(&0);
        dot_product += a_freq * b_freq;
        norm_a += a_freq * a_freq;
        norm_b += b_freq * b_freq;
    }
    let similarity = (dot_product as f32) / ((norm_a * norm_b) as f32).sqrt();
    similarity
}

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub struct SubstringResult {
    start_a: usize,
    end_a: usize,
    start_b: usize,
    end_b: usize,
    len: usize,
    edit_ratio: f32,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Substring {
    pub start: usize,
    pub end: usize,
}

#[wasm_bindgen]
pub struct Result {
    pub a: Substring,
    pub b: Substring,
    pub similarity: f32,
    pub levenshteinMatch: bool,
}

fn recompute_ratio(
    a: &[char],
    b: &[char],
    start_a: usize,
    new_end_a: usize,
    start_b: usize,
    new_end_b: usize,
    new_len: usize,
) -> f32 {
    let edit_distance = levenshtein_edit_distance(&a[start_a..new_end_a], &b[start_b..new_end_b]);
    (edit_distance as f32) / (new_len as f32)
}

// Helper function to expand matches
fn expand_matches(
    a: &[char],
    b: &[char],
    start_a: usize,
    start_b: usize,
    new_end_a: &mut usize,
    new_end_b: &mut usize,
    new_len: &mut usize,
    ratio: f32,
    max_strike: usize,
    ret: &mut SubstringResult,
    expand_a: bool,
    expand_b: bool,
) {
    let mut strike = 0;
    while strike < max_strike {
        if expand_a {
            *new_end_a += 1;
            *new_len += 1;
        }
        if expand_b {
            *new_end_b += 1;
            if !expand_a {
                *new_len += 1;
            }
        }
        if *new_end_a < a.len() && *new_end_b < b.len() {
            let new_ratio =
                recompute_ratio(a, b, start_a, *new_end_a, start_b, *new_end_b, *new_len);
            if new_ratio < ratio {
                strike += 1;
            } else {
                strike = 0;
                if expand_a {
                    ret.end_a = *new_end_a;
                }
                if expand_b {
                    ret.end_b = *new_end_b;
                }
                ret.len = *new_len;
                ret.edit_ratio = new_ratio;
            }
        } else {
            strike = max_strike;
        }
    }
}

fn reset_end_and_len(
    new_end_a: &mut usize,
    new_end_b: &mut usize,
    new_len: &mut usize,
    ret: &SubstringResult,
) {
    *new_end_a = ret.end_a;
    *new_end_b = ret.end_b;
    *new_len = ret.len;
}

pub fn common_substring_levenshtein(
    a: &[char],
    b: &[char],
    min_len: usize,
    ratio: f32,
    max_substrings: usize,
) -> Vec<SubstringResult> {
    let mut ret: Vec<SubstringResult> = Vec::new();
    let mut l: EfficientMatrix<MatrixElement> =
        EfficientMatrix::new(MatrixElement { len: 0 }, b.len());
    for (i, c) in a.into_iter().enumerate() {
        for (j, d) in b.into_iter().enumerate() {
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

                if len >= min_len {
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
    ret
}

fn expand_matches_left_and_right(
    ret: &mut [SubstringResult],
    a: &[char],
    b: &[char],
    ratio: f32,
    max_strike: usize,
) {
    let mut new_end_a: usize = 0;
    let mut new_end_b: usize = 0;
    let mut new_len: usize = 0;

    for i in 0..ret.len() {
        let SubstringResult {
            start_a,
            end_a: _,
            start_b,
            end_b: _,
            len: _,
            edit_ratio: _,
        } = ret[i];

        // Expand both sides
        reset_end_and_len(&mut new_end_a, &mut new_end_b, &mut new_len, &ret[i]);
        expand_matches(
            &a,
            &b,
            start_a,
            start_b,
            &mut new_end_a,
            &mut new_end_b,
            &mut new_len,
            ratio,
            max_strike,
            &mut ret[i],
            true,
            true,
        );

        // Expand only on one side (A)
        reset_end_and_len(&mut new_end_a, &mut new_end_b, &mut new_len, &ret[i]);
        expand_matches(
            &a,
            &b,
            start_a,
            start_b,
            &mut new_end_a,
            &mut new_end_b,
            &mut new_len,
            ratio,
            max_strike,
            &mut ret[i],
            true,
            false,
        );

        reset_end_and_len(&mut new_end_a, &mut new_end_b, &mut new_len, &ret[i]);
        expand_matches(
            &a,
            &b,
            start_a,
            start_b,
            &mut new_end_a,
            &mut new_end_b,
            &mut new_len,
            ratio,
            max_strike,
            &mut ret[i],
            false,
            true,
        );
    }
}

#[wasm_bindgen]
pub fn process(
    str_a: String,
    str_b: String,
    min_length: usize,
    ratio: f32,
    max_strikes: usize,
) -> Vec<Result> {
    // Slightly sad workaround to avoid the issue with the last character being removed
    let file_a: Vec<char> = str_a.chars().chain([char::from(0)]).collect();
    let file_a = file_a.as_slice();
    let file_b: Vec<char> = str_b.chars().chain([char::from(1)]).collect();
    let file_b = file_b.as_slice();

    let mut levenshtein_distances =
        common_substring_levenshtein(file_a, file_b, min_length, ratio, 100);
    expand_matches_left_and_right(
        levenshtein_distances.as_mut_slice(),
        &file_a,
        &file_b,
        ratio,
        max_strikes,
    );

    let mut result: Vec<Result> = Vec::with_capacity(levenshtein_distances.len()*2 -1);

    // It seems like this is not needed, as the levenshtein_distances are already sorted
    // levenshtein_distances.sort_unstable_by_key(|x| x.end_a);

    // TODO: eliminate overlapping matches, and always choose the longest match
    //levenshtein_distances.sort_unstable_by_key(|x| x.start_a);

    //let mut non_overlapping_matches: Vec<SubstringResult> = Vec::new();
    //let mut last_end_a = 0;
    //for match_result in levenshtein_distances.iter() {
    //    if match_result.start_a >= last_end_a {
    //        non_overlapping_matches.push(*match_result);
    //        last_end_a = match_result.end_a;
    //    }
    //}

    //levenshtein_distances = non_overlapping_matches;

    for (elem, elem2) in levenshtein_distances[..levenshtein_distances.len() - 1]
        .iter()
        .zip(levenshtein_distances[1..].iter())
    {
        if elem.end_a >= elem2.start_a {
            continue;
        }
        let start_b = min(elem2.end_b, elem.end_b);
        let end_b = max(elem2.start_b, elem.start_b);
        if start_b >= end_b {
            continue;
        }
        let a = Substring {
            start: elem.end_a,
            end: elem2.start_a,
        };
        let b = Substring {
            start: start_b,
            end: end_b,
        };
        let similarity =
            cosine_similarity(&file_a[(a.start)..(a.end)], &file_b[(b.start)..(b.end)]);
        result.push(Result {
            a,
            b,
            similarity,
            levenshteinMatch: false,
        });
    }

    for elem in levenshtein_distances.iter() {
        let a = Substring {
            start: elem.start_a,
            end: elem.end_a,
        };
        let b = Substring {
            start: elem.start_b,
            end: elem.end_b,
        };
        let similarity = elem.edit_ratio;
        result.push(Result {
            a,
            b,
            similarity,
            levenshteinMatch: true,
        });
    }
    result
}

#[wasm_bindgen(start)]
fn start() {
    panic::set_hook(Box::new(|panic_info: &PanicHookInfo| {
        // Alert panic error message
        alert(panic_info.payload().downcast_ref::<String>().unwrap());
        alert(panic_info.location().unwrap().to_string().as_str());
    }));
}
