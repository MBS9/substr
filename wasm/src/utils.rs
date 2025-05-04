extern crate wasm_bindgen;
use rustc_hash::{FxHashMap, FxHashSet};
use serde::{Deserialize, Serialize};
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
#[derive(Serialize, Deserialize)]
pub struct Substring {
    pub start: usize,
    pub end: usize,
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
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

pub fn levenshtein_edit_distance<T: Eq>(a_chars: &[T], b_chars: &[T]) -> usize {
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
    let mut all_keys = FxHashSet::default();
    all_keys.extend(a.keys());
    all_keys.extend(b.keys());
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

pub fn recompute_ratio<T: Eq>(
    a: &[T],
    b: &[T],
    start_a: usize,
    new_end_a: usize,
    start_b: usize,
    new_end_b: usize,
    new_len: usize,
) -> f32 {
    let edit_distance = levenshtein_edit_distance(&a[start_a..new_end_a], &b[start_b..new_end_b]);
    ((new_len - edit_distance) as f32) / (new_len as f32)
}

// Helper function to expand matches forward (right)
pub fn expand_matches_forward<T: Eq>(
    a: &[T],
    b: &[T],
    ratio: f32,
    max_strike: usize,
    ret: &mut SubstringResult,
) {
    let mut new_end_a = ret.end_a;
    let mut new_end_b = ret.end_b;
    let mut new_len = ret.len;
    let start_a = ret.start_a;
    let start_b = ret.start_b;
    let mut strike = 0;
    
    while strike < max_strike && new_end_a < a.len() - 1 && new_end_b < b.len() - 1 {
        // Expand
        new_end_a += 1;
        new_len += 1;
        new_end_b += 1;
        
        let new_ratio = recompute_ratio(a, b, start_a, new_end_a, start_b, new_end_b, new_len);
        
        if new_ratio < ratio {
            strike += 1;
        } else {
            strike = 0;
            ret.end_a = new_end_a;
            ret.end_b = new_end_b;
            ret.len = new_len;
            ret.edit_ratio = new_ratio;
        }
    }
}

// Helper function to expand matches backward (left)
pub fn expand_matches_backward<T: Eq>(
    a: &[T],
    b: &[T],
    ratio: f32,
    max_strike: usize,
    ret: &mut SubstringResult,
) {
    let mut new_start_a: usize = ret.start_a;
    let mut new_start_b: usize = ret.start_b;
    let mut new_len: usize = ret.len;
    let end_a = ret.end_a;
    let end_b = ret.end_b;
    let mut strike = 0;
    
    while strike < max_strike && new_start_a > 0 && new_start_b > 0{
        
        // Expand
        new_start_a -= 1;
        new_len += 1;
        new_start_b -= 1;
        
        let new_ratio =
            recompute_ratio(a, b, new_start_a, end_a, new_start_b, end_b, new_len);
        
        if new_ratio < ratio {
            strike += 1;
        } else {
            strike = 0;
            ret.start_a = new_start_a;
            ret.start_b = new_start_b;
            ret.len = new_len;
            ret.edit_ratio = new_ratio;
        }
    }
}

pub fn expand_match_left_and_right<T: Eq>(
    substr: &mut SubstringResult,
    a: &[T],
    b: &[T],
    ratio: f32,
    max_strike: usize,
) {
    // Expand to the right
    expand_matches_forward(
        a,
        b,
        ratio,
        max_strike,
        substr,
    );
    
    // Expand to the left
    expand_matches_backward(
        a,
        b,
        ratio,
        max_strike,
        substr,
    );
}

pub fn expand_matches_left_and_right<T: Eq>(
    ret: &mut [SubstringResult],
    a: &[T],
    b: &[T],
    ratio: f32,
    max_strike: usize,
) {
    for substr in ret.iter_mut() {
        expand_match_left_and_right(substr, a, b, ratio, max_strike);
    }
}
