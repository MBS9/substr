extern crate wasm_bindgen;
use wasm_bindgen::prelude::*;
use std::collections::{HashMap, HashSet};
use std::panic::{self, PanicHookInfo};
use std::{cmp::min, ops::{Index, IndexMut}};

struct MatrixElement {
    len: usize,
    diff: usize,
}


impl std::clone::Clone for MatrixElement {
    fn clone(&self) -> Self {
        MatrixElement {
            len: self.len,
            diff: self.diff,
        }
    }
}

impl MatrixElement {
    fn zero(&mut self) {
        self.len = 0;
        self.diff = 0;
    }
}

// Efficient matrix implementation - only stores last 2 rows to save memory
struct EfficientMatrix<T> {
    row_len: usize,
    data: Vec<T>
}

impl<T: std::clone::Clone> EfficientMatrix<T> {
    fn new(inital: T, row_len: usize) -> Self {
        EfficientMatrix {
            row_len,
            data: vec![inital; 2 * row_len]
        }
    }
}

impl<T> Index<usize> for EfficientMatrix <T> {
    type Output = [T];

    fn index(&self, index: usize) -> &[T] {
        let base = (index%2) * self.row_len;
        &self.data[base..][..self.row_len]
    }
}

impl<T> IndexMut<usize> for EfficientMatrix<T> {
    fn index_mut(&mut self, index: usize) -> &mut [T] {
        let base = (index%2) * self.row_len;
        &mut self.data[base..][..self.row_len]
    }
}

fn levenshteinEditDistance(a_chars: &[char], b_chars: &[char]) -> usize {
    let mut l = EfficientMatrix::new(0, b_chars.len()+1);
    // for i in 0..(a_chars.len()+1) {
    //     l[0][i] = i;
    // }
    for j in 0..(b_chars.len()+1) {
        l[0][j] = j;
    }
    for i in 1..(a_chars.len()+1) {
        l[i][0] = i;
        for j in 1..(b_chars.len()+1) {
            if a_chars[i-1] == b_chars[j-1] {
                l[i][j] = l[i - 1][j - 1];
            } else {
                l[i][j] = min(l[i - 1][j], min(l[i][j - 1], l[i - 1][j - 1])) + 1;
            }
        }
    }
    l[a_chars.len()][b_chars.len()]
}

fn cosineSimilarity(strA: &[char], strB: &[char]) -> f32 {
    // Find the frequency of each unicode character in the string
    let mut a: HashMap<char, u32> = HashMap::new();
    let mut b: HashMap<char, u32> = HashMap::new();
    for c in strA {
        *a.entry(*c).or_insert(0) += 1;
    }
    for c in strB {
        *b.entry(*c).or_insert(0) += 1;
    }
    let mut dot_product = 0;
    let mut norm_a = 0;
    let mut norm_b = 0;
    let allKeys: Vec<&char> = a.keys().chain(b.keys()).into_iter().collect::<HashSet<&char>>().into_iter().collect::<Vec<&char>>();
    for i in allKeys {
        let aFreq = *a.get(i).unwrap_or(&0);
        let bFreq = *b.get(i).unwrap_or(&0);
        dot_product += aFreq * bFreq;
        norm_a += aFreq * aFreq;
        norm_b += bFreq * bFreq;
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
    pub end: usize
}

#[wasm_bindgen]
pub struct Result {
    pub a: Substring,
    pub b: Substring,
    pub similarity: f32,
    pub levenshteinMatch: bool
}

pub fn common_substring_levenshtein(
    a: &Vec<char>, b: &Vec<char>, min_len: usize, ratio: f32, max_substrings: usize, max_strike: usize
    )
        -> Vec<SubstringResult> {
        let mut ret: Vec<SubstringResult> = Vec::new();
        let mut l: EfficientMatrix<MatrixElement> = EfficientMatrix::new(MatrixElement{
            diff: 0,
            len: 0,
        }, b.len());
        // let mut l: Vec<Vec<(usize, usize)>> = vec![vec![(0usize, 0usize); b.len()]; a.len()];
        'outer: for (i, c) in a.into_iter().enumerate() {
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
                    let mut len = l[i-1][j-1].len;
                    if len == 0 {
                        continue;
                    };

                    // Calculate the edit ratio
                    //let mut diffirent = l[i-1][j-1].diff + 1;
                    let mut diffirent = levenshteinEditDistance(
                        &a[(i-l[i-1][j-1].len)..(i+1)],
                        &b[(j-l[i-1][j-1].len)..(j+1)]);
                    len += 1;
                    let mut edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    // If it is more then the set value, and we are not yet at the end of the string, continue
                    if edit_ratio > ratio && j < b.len()-1 {
                        //l[i][j].diff = diffirent;
                        l[i][j].len = len;
                        continue;
                    }

                    // Calculate the edit ratio for the returning string
                    len -= 1;
                    diffirent = levenshteinEditDistance(
                        &a[(i-l[i-1][j-1].len)..(i)],
                        &b[(j-l[i-1][j-1].len)..(j)]);
                    edit_ratio = ((len-diffirent) as f32)/(len as f32);

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
                            break 'outer;
                        }
                    }
                }
            }
        }
        // Expand matches for the set number of strikes
        // TODO: allow seperately expanding on one side, for only 1 of the strings
        for i in 0..ret.len() {
            let SubstringResult {
                start_a,
                end_a,
                start_b,
                end_b,
                len,
                edit_ratio: _old_ratio,
            } = ret[i];
            let mut strike = 0;
            let mut new_end_a = end_a;
            let mut new_end_b = end_b;
            let mut new_len = len;
            while strike < max_strike {
                new_end_a += 1;
                new_end_b += 1;
                new_len += 1;
                if new_end_a < a.len() && new_end_b < b.len() {
                    let new_ratio = levenshteinEditDistance(
                        &a[start_a..new_end_a],
                        &b[start_b..new_end_b]
                        ) as f32 / new_len as f32;
                    if new_ratio < ratio {
                        strike += 1;
                    } else {
                        strike = 0;
                        ret[i].end_a = new_end_a;
                        ret[i].end_b = new_end_b;
                        ret[i].len = new_len;
                        ret[i].edit_ratio = new_ratio;
                    }
                } else {
                    strike = max_strike;
                }
            }
        }
        ret
}

#[wasm_bindgen]
pub fn process(strA: String, strB: String, minLength: usize, ratio: f32, maxStrikes: usize) -> Vec<Result> {

    panic::set_hook(Box::new(|panic_info: &PanicHookInfo | {
        // Alert panic error message
        alert(panic_info.payload().downcast_ref::<String>().unwrap());
    }));

    // Slightly sad workaround to avoid the issue with the last character being removed

    let mut fileA: Vec<_> = strA.chars().chain([char::from(0)]).collect();
    let mut fileB: Vec<_> = strB.chars().chain([char::from(1)]).collect();

    let levenshteinDistances = common_substring_levenshtein(&fileA, &fileB, minLength, ratio, 100, maxStrikes);
    fileA.pop();
    fileB.pop();

    let mut result: Vec<Result> = Vec::new();

    for (i, elem) in levenshteinDistances.iter().enumerate() {
        let a = Substring { start: elem.start_a, end: elem.end_a };
        let b = Substring { start: elem.start_b, end: elem.end_b };
        let similarity = elem.edit_ratio;
        result.push(Result {
            a,
            b,
            similarity,
            levenshteinMatch: true
        });
        for elem2 in levenshteinDistances.iter().skip(i+1) {
            if elem.end_a >= elem2.start_a || elem.end_b >= elem2.start_b {
                continue;
            }
            let a = Substring { start: elem.end_a, end: elem2.start_a };
            let b = Substring { start: elem.end_b, end: elem2.start_b };
            let similarity = cosineSimilarity(
                &fileA[(a.start)..(a.end)],
                &fileB[(b.start)..(b.end)]
            );
            result.push(Result {
                a,
                b,
                similarity,
                levenshteinMatch: false
            });
        }
    }
    result
}
