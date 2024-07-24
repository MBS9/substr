use pyo3::{exceptions::PyValueError, prelude::*};

/// Modified version of this: https://en.wikipedia.org/wiki/Longest_common_substring
/// Returns index and substring of substrings of length at least min
/// Does not return overlapping substrings
#[pyfunction]
fn common_substring(mut b: String, mut a: String, min: usize) -> PyResult<Vec<(usize, String)>> {
    a.push(char::MAX);
    b.push('\n');
    if min < 2 {
        return Err(PyValueError::new_err("min must be at least 2"));
    }
    let mut l: Vec<Vec<usize>> = vec![vec![0usize; b.len()]; a.len()];
    let mut ret: Vec<(usize, String)> = Vec::new();
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
                if l[i - 1][j - 1] >= min {
                    // We don't need the -1 because the range is exclusive on the right side
                    // We don't need the -1 in the main formula, because the array starts from 0, but string length starts from 1
                    ret.push((i-1, a[i - l[i - 1][j - 1] + 0..(i)].to_string()));
                }
            }
        }
    }

    Ok(ret)
}

/// A Python module implemented in Rust.
#[pymodule]
fn compare_text(m: &Bound<'_, PyModule>) -> PyResult<()> {
    m.add_function(wrap_pyfunction!(common_substring, m)?)?;
    Ok(())
}
