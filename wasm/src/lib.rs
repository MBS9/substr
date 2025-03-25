extern crate wasm_bindgen;
use std::panic::{self, PanicHookInfo};
use std::{
    cmp::max,
    cmp::min,
};
use wasm_bindgen::prelude::*;

mod matrix;
mod utils;

#[wasm_bindgen]
pub fn process(
    str_a: String,
    str_b: String,
    min_length: usize,
    ratio: f32,
    max_strikes: usize,
) -> Vec<utils::Result> {
    // Slightly sad workaround to avoid the issue with the last character being removed
    let file_a: Vec<char> = str_a.chars().chain([char::from(0)]).collect();
    let file_a = file_a.as_slice();
    let file_b: Vec<char> = str_b.chars().chain([char::from(1)]).collect();
    let file_b = file_b.as_slice();

    let mut levenshtein_distances =
        matrix::find_levenshtein_matches(file_a, file_b, min_length, ratio, 150);
    utils::expand_matches_left_and_right(
        levenshtein_distances.as_mut_slice(),
        &file_a,
        &file_b,
        ratio,
        max_strikes,
    );

    let mut result: Vec<utils::Result> = Vec::with_capacity(levenshtein_distances.len() * 2 - 1);

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

    for elem in levenshtein_distances.iter() {
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
    result
}

#[wasm_bindgen(start)]
fn start() {
    panic::set_hook(Box::new(|panic_info: &PanicHookInfo| {
        // Alert panic error message
        utils::alert(panic_info.payload().downcast_ref::<String>().unwrap());
        utils::alert(panic_info.location().unwrap().to_string().as_str());
    }));
}
