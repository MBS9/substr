extern crate wasm_bindgen;
use std::panic::{self, PanicHookInfo};
use std::{cmp::max, cmp::min};
use wasm_bindgen::prelude::*;

mod comparativus;
mod matrix;
mod utils;

#[derive(PartialEq)]
#[wasm_bindgen]
pub enum Algorithm {
    Matrix,
    Comparativus,
}

#[wasm_bindgen]
pub fn process(
    str_a: String,
    str_b: String,
    min_length: usize,
    ratio: f32,
    max_strikes: usize,
    max_substrings: usize,
    kernel_size: usize,
    base_match_size: usize,
    levenshtein_algorithm: Algorithm,
) -> Vec<utils::Result> {
    let file_a: Vec<char> = str_a.chars().collect();
    let file_a = file_a.as_slice();
    let file_b: Vec<char> = str_b.chars().collect();
    let file_b = file_b.as_slice();
    let levenshtein_distances: Vec<utils::SubstringResult>;
    match levenshtein_algorithm {
        Algorithm::Matrix => {
            levenshtein_distances = matrix::find_levenshtein_matches(
                file_a,
                file_b,
                min_length,
                ratio,
                max_substrings,
                max_strikes,
            );
        }
        Algorithm::Comparativus => {
            levenshtein_distances = comparativus::find_levenshtein_matches(
                file_a,
                file_b,
                min_length,
                ratio,
                max_substrings,
                max_strikes,
                kernel_size,
                base_match_size,
            );
        }
    }
    if levenshtein_distances.is_empty() {
        return Vec::new();
    }

    fn add_levenshtein_match(elem: &utils::SubstringResult, result: &mut Vec<utils::Result>) {
        let a = utils::Substring {
            start: elem.start_a,
            end: elem.end_a,
        };
        let b = utils::Substring {
            start: elem.start_b,
            end: elem.end_b,
        };
        let similarity = elem.edit_ratio;
        result.push(utils::Result {
            a,
            b,
            similarity,
            levenshteinMatch: true,
        });
    }

    let mut result: Vec<utils::Result> = Vec::with_capacity(levenshtein_distances.len() * 2 - 1);
    for (elem, elem2) in levenshtein_distances[..levenshtein_distances.len() - 1]
        .iter()
        .zip(levenshtein_distances[1..].iter())
    {
        // Add levenshtein match
        add_levenshtein_match(elem, &mut result);
        // Add cosine similarity match
        if elem.end_a >= elem2.start_a {
            continue;
        }
        let start_b = min(elem2.end_b, elem.end_b);
        let end_b = max(elem2.start_b, elem.start_b);
        if start_b >= end_b {
            continue;
        }
        let a = utils::Substring {
            start: elem.end_a,
            end: elem2.start_a,
        };
        let b = utils::Substring {
            start: start_b,
            end: end_b,
        };
        let similarity =
            utils::cosine_similarity(&file_a[(a.start)..(a.end)], &file_b[(b.start)..(b.end)]);
        result.push(utils::Result {
            a,
            b,
            similarity,
            levenshteinMatch: false,
        });
    }
    // Add last element
    let elem = levenshtein_distances.last().unwrap();
    add_levenshtein_match(elem, &mut result);
    result
}

const PUNCTUATION: [char; 44] = [
    '.', ',', '，', '。', '：', '；', '「', '」', '？', '\n', '、', '·', '》', '《', '“', '”', '‘',
    '’', '！', '（', '）', '【', '】', '『', '』', '—', '～', '\n', '\r', '\t', ' ', '*', '!', '?',
    ':', ';', '(', ')', '[', ']', '{', '}', '<', '>',
];

#[wasm_bindgen]
pub fn clean_text(text: String) -> String {
    let mut text = text;
    text.retain(|c| !PUNCTUATION.contains(&c));
    text
}

#[wasm_bindgen(start)]
pub fn start() {
    panic::set_hook(Box::new(|panic_info: &PanicHookInfo| {
        // Alert panic error message
        utils::alert(panic_info.payload().downcast_ref::<String>().unwrap());
        utils::alert(panic_info.location().unwrap().to_string().as_str());
    }));
}
