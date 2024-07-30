use std::ops::{Index, IndexMut};

use pyo3::{exceptions::PyValueError, prelude::*};

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

/// Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring
/// Returns index and substring of substrings of length at least min
/// Does not return overlapping substrings
/// Thanks to the EfficientMatrix struct, this implementation is more memory efficient
#[pyfunction]
fn common_substring(py: Python<'_>, mut a: String, mut b: String, min: usize) -> PyResult<Vec<(usize, usize, String, String)>> {
    const MIN_LEN: usize = 2;
    if min < MIN_LEN {
        return Err(PyValueError::new_err("min must be at least 2"));
    }
    Python::allow_threads(py, move || {
        a.push(char::MAX);
        b.push('\n');
        //let mut l: Vec<Vec<usize>> = vec![vec![0usize; b.len()]; a.len()];
        let mut l: EfficientMatrix<usize> = EfficientMatrix::new(0, b.len());

        let mut ret: Vec<(usize, usize, String, String)> = Vec::new();
        for (i, c) in a.chars().enumerate() {
            for (j, d) in b.chars().enumerate() {
                if c == d {
                    if i == 0 || j == 0 {
                        l[i][j] = 1;
                    } else {
                        l[i][j] = l[i - 1][j - 1] + 1;
                    }
                } else {
                    l[i][j] = 0;
                    if i == 0 || j == 0 {
                        continue;
                    }
                    // This does not return overlapping substrings
                    if l[i - 1][j - 1] >= min {
                        // We don't need the -1 because the range is exclusive on the right side
                        // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                        ret.push((i- l[i - 1][j - 1],
                            j- l[i - 1][j - 1],
                            a[i - l[i - 1][j - 1] + 0..(i)].to_string(),
                            b[i - l[i - 1][j - 1] + 0..(i)]
                            .to_string()));
                    }
                }
            }
        }

        Ok(ret)
    })
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
        a.push(char::MAX);
        b.push('\n');
        let mut l: EfficientMatrix<(usize, usize)> = EfficientMatrix::new((0, 0), b.len());
        // let mut l: Vec<Vec<(usize, usize)>> = vec![vec![(0usize, 0usize); b.len()]; a.len()];
        let mut ret: Vec<(usize, usize, f32, String, String)> = Vec::new();
        for (i, c) in a.chars().enumerate() {
            for (j, d) in b.chars().enumerate() {
                if c == d {
                    if i == 0 || j == 0 {
                        l[i][j].0 = 1;
                    } else {
                        l[i][j].0 = l[i - 1][j - 1].0 + 1;
                    }
                } else {
                    if i == 0 || j == 0 {
                        l[i][j].1 = 0;
                        l[i][j].0 = 0;
                        continue;
                    }
                    // We don't check the single character
                    let mut len = l[i-1][j-1].0;
                    if len == 0 {
                        l[i][j].1 = 0;
                        l[i][j].0 = 0;
                        continue;
                    };

                    // Calculate the edit ratio
                    len += 1;
                    let diffirent = l[i-1][j-1].1 +1;
                    let mut edit_ratio = ((len-diffirent) as f32)/(len as f32);

                    // If it is less then the set value, and we are not yet at the end of the string, continue
                    if edit_ratio > ratio && j < b.len()-1 {
                        l[i][j].1 = diffirent;
                        l[i][j].0 = len;
                        continue;
                    }

                    // Calculate the edit ratio for the returning string
                    edit_ratio = ((len-diffirent) as f32)/((len-(1 as usize)) as f32);
                    if l[i - 1][j - 1].0 >= min {
                        // We don't need the -1 because the range is exclusive on the right side
                        // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                        ret.push((i- l[i - 1][j - 1].0, j- l[i - 1][j - 1].0,
                            edit_ratio,
                            a[i - l[i - 1][j - 1].0 + 0..(i)].to_string(),
                            b[j - l[i - 1][j - 1].0 + 0..(i)]
                            .to_string()));
                    }
                    l[i][j].1 = 0;
                    l[i][j].0 = 0;
                }
            }
        }

        Ok(ret)
    })
}

/// A Python module implemented in Rust.
#[pymodule]
fn compare_text(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(common_substring, m)?)?;
    m.add_function(wrap_pyfunction!(common_substring_levenshtein, m)?)?;
    Ok(())
}
