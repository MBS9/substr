use std::ops::{Index, IndexMut};

use pyo3::{exceptions::PyValueError, prelude::*};

struct MatrixElement {
    len: usize,
    diff: usize
}


impl std::clone::Clone for MatrixElement {
    fn clone(&self) -> Self {
        MatrixElement {
            len: self.len,
            diff: self.diff
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


// Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring
/// Returns index and substring of substrings of length at least min which have a certain edit ratio
/// Does not return overlapping substrings
/// This is a more memory efficient implementation, thanks to the EfficientMatrix struct
#[pyfunction]
fn common_substring_levenshtein(py: Python<'_>, mut a: String,
    mut b: String, min: usize, ratio: f32, max_substrings: usize, max_strike: usize)
        -> PyResult<Vec<(usize, usize, usize, usize, usize, f32)>> {
    const MIN_LEN: usize = 3;
    if min < MIN_LEN {
        return Err(PyValueError::new_err("min must be at least MIN_LEN"));
    }
    Python::allow_threads(py, move || {
        a.push(1 as char);
        b.push('\n');
        let mut l: EfficientMatrix<MatrixElement> = EfficientMatrix::new(MatrixElement{
            diff: 0,
            len: 0,
        }, b.len());
        // let mut l: Vec<Vec<(usize, usize)>> = vec![vec![(0usize, 0usize); b.len()]; a.len()];
        let mut ret: Vec<(usize, usize, usize, usize, usize, f32)> = Vec::new();
        'outer: for (i, c) in a.chars().enumerate() {
            for (j, d) in b.chars().enumerate() {
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
                    len += 1;
                    let mut diffirent = l[i-1][j-1].diff + 1;
                    let mut edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    // If it is more then the set value, and we are not yet at the end of the string, continue
                    if edit_ratio > ratio && j < b.len()-1 {
                        l[i][j].diff = diffirent;
                        l[i][j].len = len;
                        continue;
                    }

                    // Calculate the edit ratio for the returning string
                    len -= 1;
                    diffirent -= 1;
                    edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    if len >= min {
                        // We don't need the -1 because the range is exclusive on the right side
                        // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                        ret.push((i- len,
                            i-1,
                            j- len,
                            j-1,
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
            let (_start_a, end_a,
                _start_b,
                end_b, len,
                old_ratio) = ret[i];
            let mut strike = 0;
            let mut new_end_a = end_a;
            let mut new_end_b = end_b;
            let mut new_len = len;
            let mut different = ((old_ratio*(new_len as f32)) as isize - (new_len as isize)).abs() as usize;
            while strike < max_strike {
                new_end_a += 1;
                new_end_b += 1;
                new_len += 1;
                if new_end_a < a_chars.len() && new_end_b < b_chars.len() {
                    if a_chars[new_end_a] != b_chars[new_end_b] {
                        different += 1;
                    }
                    let new_ratio = (new_len as f32 - different as f32) / new_len as f32;
                    if new_ratio < ratio {
                        strike += 1;
                    } else {
                        strike = 0;
                        ret[i].1 = new_end_a;
                        ret[i].3 = new_end_b;
                        ret[i].4 = new_len;
                        ret[i].5 = new_ratio;
                        println!("{}", len);
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
