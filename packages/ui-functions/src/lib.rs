use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn dummy_function() -> String {
    "Hello from Rust!".into()
}
