extern crate wasm_bindgen;
use std::panic::{self, PanicHookInfo};
use std::{cmp::max, cmp::min};
use gloo_utils::format::JsValueSerdeExt;
use wasm_bindgen::prelude::*;

mod comparativus;
mod matrix;
mod utils;
mod synonyms;

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
    synonyms_a: JsValue,
    synonyms_b: JsValue,
) -> JsValue {
    let file_a: Vec<char> = str_a.chars().collect();
    let file_b: Vec<char> = str_b.chars().collect();
    let mut synonyms_a = synonyms_a.into_serde::<Vec<synonyms::Synonym>>().unwrap();
    synonyms_a.sort_unstable_by_key(|s| s.word.start);
    let mut synonyms_b = synonyms_b.into_serde::<Vec<synonyms::Synonym>>().unwrap();
    synonyms_b.sort_unstable_by_key(|s| s.word.start);
    let token_a = synonyms::tokenize_text(0, file_a.len(), &synonyms_a, file_a.as_slice());
    let token_b = synonyms::tokenize_text(0, file_b.len(), &synonyms_b, file_b.as_slice());
    let levenshtein_distances: Vec<utils::SubstringResult>;
    match levenshtein_algorithm {
        Algorithm::Matrix => {
            levenshtein_distances = matrix::find_levenshtein_matches(
                token_a.as_slice(),
                token_b.as_slice(),
                min_length,
                ratio,
                max_substrings,
                max_strikes,
            );
        }
        Algorithm::Comparativus => {
            levenshtein_distances = comparativus::find_levenshtein_matches(
                token_a.as_slice(),
                token_b.as_slice(),
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
        return JsValue::from_serde(&Vec::<utils::Result>::new()).unwrap();
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
    for (tokens1, tokens2) in levenshtein_distances[..levenshtein_distances.len() - 1]
        .iter()
        .zip(levenshtein_distances[1..].iter())
    {
        let elem = utils::SubstringResult{
            start_a: token_a[tokens1.start_a].start,
            end_a: token_a[tokens1.end_a-1].end,
            start_b: token_b[tokens1.start_b].start,
            end_b: token_b[tokens1.end_b-1].end,
            len: tokens1.len,
            edit_ratio: tokens1.edit_ratio,
        };
        let elem2 = utils::SubstringResult{
            start_a: token_a[tokens2.start_a].start,
            end_a: token_a[tokens2.end_a-1].end,
            start_b: token_b[tokens2.start_b].start,
            end_b: token_b[tokens2.end_b-1].end,
            len: tokens2.len,
            edit_ratio: tokens2.edit_ratio,
        };
        // Add levenshtein match
        add_levenshtein_match(&elem, &mut result);
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
    let token = levenshtein_distances.last().unwrap();
    let elem = utils::SubstringResult{
        start_a: token_a[token.start_a].start,
        end_a: token_a[token.end_a-1].end,
        start_b: token_b[token.start_b].start,
        end_b: token_b[token.end_b-1].end,
        len: token.len,
        edit_ratio: token.edit_ratio,
    };
    add_levenshtein_match(&elem, &mut result);
    return JsValue::from_serde(&result).unwrap();
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
