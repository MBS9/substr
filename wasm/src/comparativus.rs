use std::cmp::min;

/*
* This algorithm is equivalent to the algorithm at https://github.com/MGelein/comparativus
*/
use crate::{synonyms::Token, utils::{self}};
use rustc_hash::{FxBuildHasher, FxHashMap};

use crate::utils::SubstringResult;

struct Ngrams<'a> {
    ngrams: FxHashMap<&'a [Token<'a>], Vec<usize>>,
    keys: Vec<&'a [Token<'a>]>,
}
impl<'a> Ngrams<'a> {
    fn new(size: usize) -> Self {
        Ngrams {
            ngrams: FxHashMap::with_capacity_and_hasher(size, FxBuildHasher),
            keys: Vec::with_capacity(size),
        }
    }
    fn add_gram(&mut self, gram: &'a [Token], index: usize) {
        if let Some(v) = self.ngrams.get_mut(gram) {
            v.push(index);
        } else {
            self.ngrams.insert(gram, vec![index]);
            self.keys.push(gram);
        }
    }
    fn get(&self, gram: &'a [Token]) -> Option<&Vec<usize>> {
        for key in &self.keys {
            if key == &gram {
                // This is necessary because the Hash trait for Token is broken
                // so we need to make sure that it is exactly the same key
                return self.ngrams.get(key);
            }
        }

        // If we don't find the key, we can return None
        None
    }
}

fn build_ngrams<'a>(text: &'a [Token<'a>], kernel_size: usize) -> Ngrams<'a> {
    let mut ngrams: Ngrams = Ngrams::new(text.len() - kernel_size);
    text.windows(kernel_size).enumerate().for_each(|(i, gram)| {
        ngrams.add_gram(gram, i);
    });
    ngrams
}

fn expand_all_matches(
    occ_a: &Vec<usize>,
    occ_b: &Vec<usize>,
    text_a: &[Token],
    text_b: &[Token],
    results: &mut Vec<utils::SubstringResult>,
    min_ratio: f32,
    max_strike: usize,
    max_substrings: usize,
    base_match_size: usize,
    min_len: usize,
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
            ma.edit_ratio = utils::recompute_ratio(
                // This is the ratio of the match, which has been set as 1.0 before, but we need the real value
                text_a, text_b, ma.start_a, ma.end_a, ma.start_b, ma.end_b, ma.len,
            );
            while ma.start_a < ma.end_a && ma.start_b < ma.end_b && ma.edit_ratio < min_ratio {
                ma.len -= 1;
                ma.end_a -= 1;
                ma.end_b -= 1;
                ma.edit_ratio = utils::recompute_ratio(
                    text_a, text_b, ma.start_a, ma.end_a, ma.start_b, ma.end_b, ma.len,
                );
            }
            utils::expand_match_left_and_right(&mut ma, text_a, text_b, min_ratio, max_strike);
            if ma.len >= min_len {
                results.push(ma)
            };
        }
    }
}

pub fn find_levenshtein_matches(
    a: &[Token],
    b: &[Token],
    min_len: usize,
    ratio: f32,
    max_substrings: usize,
    max_strikes: usize,
    kernel_size: usize,
    base_match_size: usize,
) -> Vec<SubstringResult> {
    let ngrams_a = build_ngrams(a, kernel_size);
    let ngrams_b = build_ngrams(b, kernel_size);
    let mut ret: Vec<utils::SubstringResult> = Vec::new();
    for &gram_a in &ngrams_a.keys {
        if let Some(occ_b) = ngrams_b.get(gram_a) {
            expand_all_matches(
                ngrams_a.get(gram_a).unwrap(),
                occ_b,
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
