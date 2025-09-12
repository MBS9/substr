extern crate wasm_bindgen;
use gloo_utils::format::JsValueSerdeExt;
use std::panic::{self, PanicHookInfo};
use wasm_bindgen::prelude::*;


mod comparativus;
mod synonyms;
mod utils;

#[derive(PartialEq)]
#[wasm_bindgen]
pub enum Algorithm {
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

    let mut matches_a = levenshtein_distances[..].to_vec();
    matches_a.sort_unstable_by_key(|x| x.start_a);
    let mut matches_b = levenshtein_distances[..].to_vec();
    matches_b.sort_unstable_by_key(|x| x.start_b);

    let mut result: Vec<utils::Result> = Vec::with_capacity(levenshtein_distances.len() * 2 + 1);

    let mut add_levenshtein_match = |elem: &utils::SubstringResult| {
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
    };

    matches_a.iter().for_each(|elem| {
        add_levenshtein_match(&elem);
    });

    // Merge overlapping matches in both lists
    matches_a.dedup_by(|a, b| {
        if a.start_a <= b.end_a && b.start_a <= a.end_a {
            a.start_a = a.start_a.min(b.start_a);
            a.end_a = a.end_a.max(b.end_a);
            b.start_a = a.start_a;
            b.end_a = a.end_a;
            true
        } else {
            false
        }
    });
    matches_b.dedup_by(|a, b| {
        if a.start_b <= b.end_b && b.start_b <= a.end_b {
            a.start_b = a.start_b.min(b.start_b);
            a.end_b = a.end_b.max(b.end_b);
            b.start_b = a.start_b;
            b.end_b = a.end_b;
            true
        } else {
            false
        }
    });

    let add_cosine_similarity_to_result = |cosine: &mut utils::Result| {
        if cosine.a.start < cosine.a.end && cosine.b.start < cosine.b.end {
            cosine.similarity = utils::cosine_similarity(
                &file_a[cosine.a.start..cosine.a.end],
                &file_b[cosine.b.start..cosine.b.end],
            );
        } else {
            cosine.similarity = 0.0;
        }
        *cosine
    };
    result.push(add_cosine_similarity_to_result(&mut utils::Result {
        a: utils::Substring {
            start: 0,
            end: matches_a.first().unwrap().start_a,
        },
        b: utils::Substring {
            start: 0,
            end: matches_b.first().unwrap().start_b,
        },
        similarity: 0.0,
        levenshteinMatch: false,
    }));
    for (tokens_a, tokens_b) in matches_a.windows(2).zip(matches_b.windows(2)) {
        // Get the area between two matches in from tokens_a and b
        let mut cosine = utils::Result {
            a: utils::Substring {
                start: tokens_a[0].end_a,
                end: tokens_a[1].start_a,
            },
            b: utils::Substring {
                start: tokens_b[0].end_b,
                end: tokens_b[1].start_b,
            },
            similarity: 0.0,
            levenshteinMatch: false,
        };
        result.push(add_cosine_similarity_to_result(&mut cosine));
    }
    result.push(add_cosine_similarity_to_result(&mut utils::Result {
        a: utils::Substring {
            start: matches_a.last().unwrap().end_a,
            end: file_a.len(),
        },
        b: utils::Substring {
            start: matches_b.last().unwrap().end_b,
            end: file_b.len(),
        },
        similarity: 0.0,
        levenshteinMatch: false,
    }));
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
        utils::error(panic_info.payload().downcast_ref::<String>().unwrap());
        utils::error(panic_info.location().unwrap().to_string().as_str());
    }));
}
