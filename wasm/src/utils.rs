extern crate wasm_bindgen;
use rustc_hash::FxHashMap;
use std::{
    cmp::min,
    ops::{Index, IndexMut},
};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    pub fn alert(s: &str);
    #[wasm_bindgen(js_namespace = console)]
    pub fn log(s: &str);
}

#[wasm_bindgen]
pub struct SubstringResult {
    pub start_a: usize,
    pub end_a: usize,
    pub start_b: usize,
    pub end_b: usize,
    pub len: usize,
    pub edit_ratio: f32,
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

pub struct MatrixElement {
    pub len: usize,
}

impl std::clone::Clone for MatrixElement {
    fn clone(&self) -> Self {
        MatrixElement { len: self.len }
    }
}

impl MatrixElement {
    pub fn zero(&mut self) {
        self.len = 0;
    }
}

// Efficient matrix implementation - only stores last 2 rows to save memory
pub struct EfficientMatrix<T> {
    row_len: usize,
    data: Vec<T>,
}

impl<T: std::clone::Clone> EfficientMatrix<T> {
    pub fn new(inital: T, row_len: usize) -> Self {
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

pub fn levenshtein_edit_distance(a_chars: &[char], b_chars: &[char]) -> usize {
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

pub fn cosine_similarity(str_a: &[char], str_b: &[char]) -> f32 {
    // Find the frequency of each unicode character in the string
    let mut a: FxHashMap<char, u32> = FxHashMap::default();
    let mut b: FxHashMap<char, u32> = FxHashMap::default();
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
        .collect::<Vec<_>>()
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

pub fn recompute_ratio(
    a: &[char],
    b: &[char],
    start_a: usize,
    new_end_a: usize,
    start_b: usize,
    new_end_b: usize,
    new_len: usize,
) -> f32 {
    let edit_distance = levenshtein_edit_distance(&a[start_a..new_end_a], &b[start_b..new_end_b]);
    ((new_len - edit_distance) as f32) / (new_len as f32)
}

// Helper function to expand matches
pub fn expand_matches(
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

pub fn expand_match_left_and_right(
    substr: &mut SubstringResult,
    a: &[char],
    b: &[char],
    ratio: f32,
    max_strike: usize,
) {
    let mut new_end_a: usize = substr.end_a;
    let mut new_end_b: usize = substr.end_b;
    let mut new_len: usize = substr.len;
    let start_a = substr.start_a;
    let start_b = substr.start_b;

    // Expand both sides
    expand_matches(
        a,
        b,
        start_a,
        start_b,
        &mut new_end_a,
        &mut new_end_b,
        &mut new_len,
        ratio,
        max_strike,
        substr,
        true,
        true,
    );

    // Expand only on one side (A)
    new_end_a = substr.end_a;
    new_end_b = substr.end_b;
    new_len = substr.len;
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
        substr,
        true,
        false,
    );

    new_end_a = substr.end_a;
    new_end_b = substr.end_b;
    new_len = substr.len;
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
        substr,
        false,
        true,
    );
}

pub fn expand_matches_left_and_right(
    ret: &mut [SubstringResult],
    a: &[char],
    b: &[char],
    ratio: f32,
    max_strike: usize,
) {
    for substr in ret.iter_mut() {
        expand_match_left_and_right(substr, a, b, ratio, max_strike);
    }
}
