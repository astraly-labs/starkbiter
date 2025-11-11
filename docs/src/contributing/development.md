# Development Setup

Detailed guide for setting up your Starkbiter development environment.

## Prerequisites

### Rust

Install Rust using rustup:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup update
```

### Additional Tools

```bash
# Code formatting
rustup component add rustfmt

# Linting
rustup component add clippy

# Documentation
cargo install mdbook mdbook-katex

# Development tools
cargo install cargo-watch  # Auto-rebuild on changes
cargo install cargo-expand # Expand macros
```

## Building the Project

### Full Build

```bash
# Clone repository
git clone https://github.com/astraly-labs/starkbiter
cd starkbiter

# Build all crates
cargo build --all --all-features

# Build in release mode
cargo build --release --all --all-features
```

### Individual Crates

```bash
# Build specific crate
cargo build -p starkbiter-core
cargo build -p starkbiter-engine
cargo build -p starkbiter-bindings

# With features
cargo build -p starkbiter-core --features "cheating"
```

## Running Tests

### All Tests

```bash
# Run all tests
cargo test --all --all-features

# With output
cargo test --all --all-features -- --nocapture

# Specific test
cargo test test_name --all-features
```

### Package-Specific Tests

```bash
# Core tests
cargo test -p starkbiter-core

# Engine tests
cargo test -p starkbiter-engine

# Integration tests only
cargo test --test '*'
```

### Test Coverage

```bash
# Install tarpaulin
cargo install cargo-tarpaulin

# Generate coverage report
cargo tarpaulin --all --all-features --out Html
```

## Code Quality

### Formatting

```bash
# Check formatting
cargo fmt --all -- --check

# Format code
cargo fmt --all
```

### Linting

```bash
# Check for issues
cargo clippy --all --all-features

# Fix automatically where possible
cargo clippy --all --all-features --fix
```

### Documentation

```bash
# Build docs
cargo doc --all --all-features --no-deps

# Open in browser
cargo doc --all --all-features --no-deps --open

# Check for broken links
cargo doc --all --all-features --no-deps 2>&1 | grep warning
```

## Development Workflow

### Watch Mode

Auto-rebuild on file changes:

```bash
# Watch and rebuild
cargo watch -x build

# Watch and test
cargo watch -x test

# Watch and run example
cargo watch -x "run --example minter"
```

### Debugging

```rust
// Add debug prints
println!("Debug: {:?}", value);
dbg!(value);

// Or use the log crate
use log::{debug, info, error};

debug!("Detailed information");
info!("General information");
error!("Error occurred: {}", e);
```

Run with logging:

```bash
RUST_LOG=debug cargo test
RUST_LOG=starkbiter_core=trace cargo run --example minter
```

### Benchmarking

```bash
# Run benchmarks
cargo bench -p starkbiter-core

# Compare benchmarks
cargo bench --bench bench_name -- --save-baseline before
# ... make changes ...
cargo bench --bench bench_name -- --baseline before
```

## Working with Examples

### Running Examples

```bash
# List examples
cargo run --example --list

# Run example
cargo run --example minter

# With arguments
cargo run --example minter simulate ./examples/minter/config.toml -vvvv
```

### Creating Examples

```bash
# Create new example
mkdir examples/my_example
touch examples/my_example/main.rs

# Add to workspace if needed
# (usually automatic)
```

## Documentation Development

### Building the Book

```bash
cd docs

# Install dependencies
cargo install mdbook mdbook-katex

# Build
mdbook build

# Serve with auto-reload
mdbook serve

# Open http://localhost:3000
```

### Adding Pages

1. Create markdown file in `docs/src/`
2. Update `docs/src/SUMMARY.md`
3. Test locally with `mdbook serve`

## IDE Setup

### VS Code

Recommended extensions:
- rust-analyzer
- CodeLLDB (debugging)
- Even Better TOML
- Error Lens

`settings.json`:
```json
{
    "rust-analyzer.checkOnSave.command": "clippy",
    "rust-analyzer.cargo.features": "all",
    "[rust]": {
        "editor.defaultFormatter": "rust-lang.rust-analyzer",
        "editor.formatOnSave": true
    }
}
```

### IntelliJ IDEA / CLion

- Install Rust plugin
- Enable rustfmt on save
- Configure clippy as external tool

## Troubleshooting

### Build Issues

```bash
# Clean build artifacts
cargo clean

# Update dependencies
cargo update

# Check dependency tree
cargo tree
```

### Test Failures

```bash
# Run specific test with output
cargo test test_name -- --nocapture

# Run ignored tests
cargo test -- --ignored

# Run in single-threaded mode
cargo test -- --test-threads=1
```

### Performance Issues

```bash
# Profile with flamegraph
cargo install flamegraph
cargo flamegraph --example minter

# Use release mode
cargo build --release
cargo test --release
```

## Continuous Integration

Our CI runs:
- Tests on Linux, macOS, Windows
- Formatting checks
- Clippy lints
- Documentation builds
- Example builds

Make sure your PR passes all checks:

```bash
# Run CI checks locally
cargo fmt --all -- --check
cargo clippy --all --all-features -- -D warnings
cargo test --all --all-features
cargo build --examples
```

## Next Steps

- [Contributing Guidelines](./index.md) - How to contribute
- [Code Style Guide](./code_style.md) - Coding standards
- [Testing Guide](./testing.md) - Writing tests

