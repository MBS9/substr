use std::hash::Hash;

use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Clone, Copy)]
#[wasm_bindgen]
pub struct Word {
    pub start: usize,
    pub end: usize,
}

#[wasm_bindgen]
pub struct Synonym {
    pub word: Word,
    synonyms: Vec<Word>,
}

#[wasm_bindgen]
impl Synonym {
    #[wasm_bindgen(getter)]
    pub fn synonyms(&self) -> Vec<Word> {
        self.synonyms.clone()
    }
    #[wasm_bindgen(setter)]
    pub fn set_synonyms(&mut self, synonyms: Vec<Word>) {
        self.synonyms = synonyms;
    }
}

pub struct Token<'a> {
    pub start: usize,
    pub end: usize,
    pub synonym: Option<&'a Synonym>,
    pub text: &'a [char],
}

impl PartialEq for Token<'_> {
    fn eq(&self, other: &Self) -> bool {
        // Check if their text is equal
        let mut equal = self.text == other.text;
        // Check if any of the synonyms are equal to the other
        let Some(synonym) = self.synonym else {
            return equal;
        };
        if synonym
            .synonyms
            .iter()
            .any(|s| s.start == other.start && s.end == other.end)
        {
            equal = true;
        }
        equal
    }
}

impl Eq for Token<'_> {}

impl Hash for Token<'_> {
    fn hash<H: std::hash::Hasher>(&self, state: &mut H) {
        // Hash the text only
        self.text.hash(state);
    }
}

pub fn tokenize_text<'a>(
    start: usize,
    end: usize,
    synonyms: &'a Vec<Synonym>,
    text: &'a [char],
) -> Vec<Token<'a>> {
    let mut tokens = Vec::new();
    let mut current_synonym_index = 0;
    let mut current_synonym: Option<&'a Synonym> = synonyms.get(current_synonym_index);

    let mut i = start;
    while i < end {
        if current_synonym.is_some() {
            let synonym = current_synonym.unwrap();
            if i >= synonym.word.start && i < synonym.word.end {
                // We are in the synonym, so let's add it as a token
                tokens.push(Token {
                    start: synonym.word.start,
                    end: synonym.word.end,
                    synonym: Some(synonym),
                    text: &text[synonym.word.start..synonym.word.end],
                });
                current_synonym_index += 1;
                current_synonym = synonyms.get(current_synonym_index);
                i = synonym.word.end;
            } else {
                // We are outside a synonym, so we only add the current character as a token
                tokens.push(Token {
                    start: i,
                    end: i + 1,
                    synonym: None,
                    text: &text[i..i + 1],
                });
                i += 1;
            }
        } else {
            // Just add the current character as a token
            tokens.push(Token {
                start: i,
                end: i + 1,
                synonym: None,
                text: &text[i..i + 1],
            });
            i += 1;
        }
    }

    tokens
}
