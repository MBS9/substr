use std::{cmp::min, ops::{Index, IndexMut}};

use pyo3::{exceptions::PyValueError, prelude::*};

struct MatrixElement {
    len: usize,
    diff: usize,
    true_len_a: usize,
    true_len_b: usize
}


impl std::clone::Clone for MatrixElement {
    fn clone(&self) -> Self {
        MatrixElement {
            len: self.len,
            diff: self.diff,
            true_len_a: self.true_len_a,
            true_len_b: self.true_len_b
        }
    }
}

impl MatrixElement {
    fn zero(&mut self) {
        self.len = 0;
        self.diff = 0;
        self.true_len_a = 0;
        self.true_len_b = 0;
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

fn levenshteinEditDistance(a: &str, b: &str) -> usize {
    let a_chars: Vec<_> = a.chars().collect();
    let b_chars: Vec<_> = b.chars().collect();
    let mut l: Vec<Vec<usize>> = vec![vec![0; b_chars.len()+1]; a_chars.len()+1];
    for i in 0..(a_chars.len()+1) {
        l[i][0] = i;
    }
    for j in 0..(b_chars.len()+1) {
        l[0][j] = j;
    }
    for i in 1..(a_chars.len()+1) {
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


// Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring
/// Returns index and substring of substrings of length at least min which have a certain edit ratio
/// Does not return overlapping substrings
/// This is a more memory efficient implementation, thanks to the EfficientMatrix struct
#[pyfunction]
fn common_substring_levenshtein(py: Python<'_>, mut a: String,
    mut b: String, min_len: usize, ratio: f32, max_substrings: usize, max_strike: usize)
        -> PyResult<Vec<(usize, usize, usize, usize, usize, f32)>> {
    const MIN_LEN: usize = 3;
    if min_len < MIN_LEN {
        return Err(PyValueError::new_err("min must be at least MIN_LEN"));
    }
    Python::allow_threads(py, move || {
        a.push('B' as char);
        b.push('\n');
        let mut l: EfficientMatrix<MatrixElement> = EfficientMatrix::new(MatrixElement{
            diff: 0,
            len: 0,
            true_len_a: 0,
            true_len_b: 0
        }, b.len());
        // let mut l: Vec<Vec<(usize, usize)>> = vec![vec![(0usize, 0usize); b.len()]; a.len()];
        let mut ret: Vec<(usize, usize, usize, usize, usize, f32)> = Vec::new();
        'outer: for (i, (i_true, c)) in a.char_indices().enumerate() {
            for (j, (j_true, d)) in b.char_indices().enumerate() {
                l[i][j].zero();
                if c == d {
                    if i == 0 || j == 0 {
                        l[i][j].len = 1;
                        l[i][j].true_len_a = c.len_utf8();
                        l[i][j].true_len_b = d.len_utf8();
                    } else {
                        l[i][j].len = l[i - 1][j - 1].len + 1;
                        l[i][j].true_len_a = l[i - 1][j - 1].true_len_a + c.len_utf8();
                        l[i][j].true_len_b = l[i - 1][j - 1].true_len_b + d.len_utf8();
                        // l[i][j].diff = l[i - 1][j - 1].diff;
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
                        &a[(i_true-l[i-1][j-1].true_len_a)..(i_true + c.len_utf8())],
                        &b[(j_true-l[i-1][j-1].true_len_b)..(j_true + d.len_utf8())]);
                    len += 1;
                    let mut edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    // If it is more then the set value, and we are not yet at the end of the string, continue
                    if edit_ratio > ratio && j < b.len()-1 {
                        //l[i][j].diff = diffirent;
                        l[i][j].len = len;
                        l[i][j].true_len_a = l[i-1][j-1].true_len_a + c.len_utf8();
                        l[i][j].true_len_b = l[i-1][j-1].true_len_b + d.len_utf8();
                        continue;
                    }

                    // Calculate the edit ratio for the returning string
                    len -= 1;
                    diffirent = levenshteinEditDistance(
                        &a[(i_true-l[i-1][j-1].true_len_a)..(i_true)],
                        &b[(j_true-l[i-1][j-1].true_len_b)..(j_true)]);
                    edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    if len >= min_len {
                        // We don't need the -1 because the range is exclusive on the right side
                        // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                        ret.push((i- len,
                            i,
                            j- len,
                            j,
                            len,
                            edit_ratio
                            ));
                        if ret.len() >= max_substrings {
                            break 'outer;
                        }
                    }
                }
            }
        }
        // Expand matches for the set number of strikes
        let a_chars: Vec<_> = a.chars().collect();
        let b_chars: Vec<_> = b.chars().collect();
        for i in 0..ret.len() {
            let (start_a, end_a,
                start_b,
                end_b, len,
                _old_ratio) = ret[i];
            let mut strike = 0;
            let mut new_end_a = end_a;
            let mut new_end_b = end_b;
            let mut new_len = len;
            while strike < max_strike {
                new_end_a += 1;
                new_end_b += 1;
                new_len += 1;
                if new_end_a < a_chars.len() && new_end_b < b_chars.len() {
                    let new_ratio = levenshteinEditDistance(
                        &String::from_iter(a_chars[start_a..new_end_a].iter()),
                            &String::from_iter(b_chars[start_b..new_end_b].iter())
                        ) as f32 / new_len as f32;
                    if new_ratio < ratio {
                        strike += 1;
                    } else {
                        strike = 0;
                        ret[i].1 = new_end_a;
                        ret[i].3 = new_end_b;
                        ret[i].4 = new_len;
                        ret[i].5 = new_ratio;
                    }
                } else {
                    strike = max_strike;
                }
            }
        }
        Ok(ret)
    })
}

/// A Python module implemented in Rust.
#[pymodule]
fn compare_text(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(common_substring_levenshtein, m)?)?;
    Ok(())
}
