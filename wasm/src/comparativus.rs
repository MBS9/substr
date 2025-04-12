use std::cmp::min;

/*
* This algorithm is equivalent to the algorithm at https://github.com/MGelein/comparativus
*/
use crate::utils::{self};
use rustc_hash::{FxBuildHasher, FxHashMap};

use crate::utils::SubstringResult;

type Ngrams<'a> = FxHashMap<&'a [char], Vec<usize>>;
fn build_ngrams(text: &[char], kernel_size: usize) -> Ngrams {
    let mut ngrams: Ngrams =
        FxHashMap::with_capacity_and_hasher(text.len()-kernel_size, FxBuildHasher);
    text.windows(kernel_size).enumerate().for_each(|(i, gram)| {
        ngrams.entry(gram).or_insert_with(Vec::new).push(i);
    });
    ngrams
}

fn expand_all_matches(
    occ_a: &Vec<usize>,
    occ_b: &Vec<usize>,
    text_a: &[char],
    text_b: &[char],
    results: &mut Vec<utils::SubstringResult>,
    ratio: f32,
    max_strike: usize,
    max_substrings: usize,
    base_match_size: usize,
    min_len: usize
) {
    'outer: for occurance_a in occ_a {
        'nextMatch: for occurance_b in occ_b {
            if results.len() >= max_substrings {
                utils::alert("Max substrings reached, stopping search.");
                break 'outer;
            }
            for ma in results.iter() {
                // Should we allow equality here?
                if *occurance_a < ma.end_a
                    && *occurance_a > ma.start_a
                    && *occurance_b < ma.end_b
                    && *occurance_b > ma.start_b
                {
                    // This match is embedded within an existing match, so we can safely skip
                    continue 'nextMatch;
                }
            }
            let mut ma = utils::SubstringResult {
                start_a: *occurance_a,
                end_a: min(*occurance_a + base_match_size, text_a.len()),
                start_b: *occurance_b,
                end_b: min(*occurance_b + base_match_size, text_b.len()),
                len: base_match_size,
                edit_ratio: 1.0,
            };
            ma.len = ma.end_a - ma.start_a; // This may not necessarily be the same as base_match_size
            while ma.start_a < ma.end_a && ma.start_b < ma.end_b && utils::recompute_ratio(text_a, text_b, ma.start_a, ma.end_a, ma.start_b, ma.end_b, ma.len) < ratio {
                ma.len -= 1;
                ma.end_a -= 1;
                ma.end_b -= 1;
            }
            utils::expand_match_left_and_right(&mut ma, text_a, text_b, ratio, max_strike);
            if ma.len >= min_len { results.push(ma)};
        }
    }
}

pub fn find_levenshtein_matches(
    a: &[char],
    b: &[char],
    min_len: usize,
    ratio: f32,
    max_substrings: usize,
    max_strikes: usize,
    kernel_size: usize,
    base_match_size: usize
) -> Vec<SubstringResult> {
    let ngrams_a = build_ngrams(a, kernel_size);
    let ngrams_b = build_ngrams(b, kernel_size);
    let mut ret: Vec<utils::SubstringResult> = Vec::new();
    for (gram_a, occ_a) in ngrams_a {
        if ngrams_b.contains_key(gram_a) {
            expand_all_matches(
                &occ_a,
                &ngrams_b[gram_a],
                a,
                b,
                &mut ret,
                ratio,
                max_strikes,
                max_substrings,
                base_match_size,
                min_len,
            );
        }
    }
    ret.sort_unstable_by_key(|x| x.start_a);
    ret
}
