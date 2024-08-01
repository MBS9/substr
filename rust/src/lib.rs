use std::ops::{Index, IndexMut};

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
            true_len_b: self.true_len_a
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


// Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring
/// Returns index and substring of substrings of length at least min which have a certain edit ratio
/// Does not return overlapping substrings
/// This is a more memory efficient implementation, thanks to the EfficientMatrix struct
#[pyfunction]
fn common_substring_levenshtein(py: Python<'_>, mut a: String, mut b: String, min: usize, ratio: f32) -> PyResult<Vec<(usize, usize, f32, String, String)>> {
    const MIN_LEN: usize = 2;
    if min < MIN_LEN {
        return Err(PyValueError::new_err("min must be at least MIN_LEN"));
    }
    Python::allow_threads(py, move || {
        a.push(1 as char);
        b.push('\n');
        let mut l: EfficientMatrix<MatrixElement> = EfficientMatrix::new(MatrixElement{
            diff: 0,
            len: 0,
            true_len_a: 0,
            true_len_b: 0
        }, b.len());
        // let mut l: Vec<Vec<(usize, usize)>> = vec![vec![(0usize, 0usize); b.len()]; a.len()];
        let mut ret: Vec<(usize, usize, f32, String, String)> = Vec::new();
        for (i, (i_true, c)) in a.char_indices().enumerate() {
            for (j, (j_true, d)) in b.char_indices().enumerate() {
                if c == d {
                    if i == 0 || j == 0 {
                        l[i][j].true_len_a = c.len_utf8();
                        l[i][j].true_len_b = c.len_utf8();
                        l[i][j].len = 1;
                    } else {
                        l[i][j].true_len_a = l[i - 1][j - 1].true_len_a + c.len_utf8();
                        l[i][j].true_len_b = l[i - 1][j - 1].true_len_b + c.len_utf8();
                        l[i][j].len = l[i - 1][j - 1].len + 1;
                    }
                } else {
                    if i == 0 || j == 0 {
                        l[i][j].zero();
                        continue;
                    }
                    // We don't check the single character
                    let mut len = l[i-1][j-1].len;
                    if len == 0 {
                        l[i][j].zero();
                        continue;
                    };

                    // Calculate the edit ratio
                    len += 1;
                    let diffirent = l[i-1][j-1].diff + 1;
                    let mut edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    // If it is less then the set value, and we are not yet at the end of the string, continue
                    if edit_ratio > ratio && j < b.len()-1 {
                        l[i][j].diff = diffirent;
                        l[i][j].len = len;
                        l[i][j].true_len_a = l[i-1][j-1].true_len_a + c.len_utf8();
                        l[i][j].true_len_b = l[i-1][j-1].true_len_b + d.len_utf8();
                        continue;
                    }

                    // Calculate the edit ratio for the returning string
                    edit_ratio = ((len-diffirent) as f32)/((len-(1 as usize)) as f32);
                    if l[i - 1][j - 1].len >= min {
                        // We don't need the -1 because the range is exclusive on the right side
                        // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                        ret.push((i- l[i - 1][j - 1].len, j- l[i - 1][j - 1].len,
                            edit_ratio,
                            a[i_true - l[i - 1][j - 1].true_len_a + 0..(i_true)].to_string(),
                            b[j_true - l[i - 1][j - 1].true_len_b + 0..(j_true)]
                            .to_string()));
                    }
                    l[i][j].zero();
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
