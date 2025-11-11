# Contributing to Starkbiter

Thank you for your interest in contributing to Starkbiter! This guide will help you get started.

## Ways to Contribute

There are many ways to contribute to Starkbiter:

- 🐛 **Report bugs** - Found an issue? Let us know!
- 💡 **Suggest features** - Have an idea? We'd love to hear it!
- 📖 **Improve documentation** - Help make our docs better
- 🧪 **Add examples** - Share your simulations with the community
- 🔧 **Fix issues** - Submit pull requests for open issues
- ⭐ **Spread the word** - Tell others about Starkbiter

## Getting Started

### 1. Fork the Repository

Fork [starkbiter](https://github.com/astraly-labs/starkbiter) on GitHub.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/starkbiter
cd starkbiter
```

### 3. Set Up Development Environment

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Build the project
cargo build

# Run tests
cargo test --all --all-features
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Making Changes

1. **Write code** - Implement your feature or fix
2. **Add tests** - Ensure your code is tested
3. **Update docs** - Document new features
4. **Run tests** - Make sure everything works
5. **Commit changes** - Use clear commit messages

### Commit Messages

Follow conventional commits:

```
feat: add support for custom gas prices
fix: resolve race condition in agent execution
docs: improve quickstart guide
test: add integration tests for forking
refactor: simplify environment builder
```

### Testing

Run the full test suite:

```bash
# All tests
cargo test --all --all-features

# Specific package
cargo test -p starkbiter-core

# With output
cargo test -- --nocapture
```

### Code Style

We use rustfmt and clippy:

```bash
# Format code
cargo fmt --all

# Check for issues
cargo clippy --all --all-features
```

## Pull Request Process

### Before Submitting

- [ ] Tests pass locally
- [ ] Code is formatted (`cargo fmt`)
- [ ] No clippy warnings (`cargo clippy`)
- [ ] Documentation is updated
- [ ] Examples work
- [ ] Changelog updated (if applicable)

### Submitting

1. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create Pull Request** on GitHub

3. **Fill out the template**
   - Describe your changes
   - Link related issues
   - Add screenshots if applicable

4. **Wait for review**
   - Address feedback
   - Make requested changes
   - Keep discussion constructive

### Review Process

- Maintainers will review your PR
- CI must pass (tests, formatting, clippy)
- At least one approval required
- Maintainer will merge when ready

## Code Guidelines

### Rust Style

- Follow [Rust API Guidelines](https://rust-lang.github.io/api-guidelines/)
- Use `rustfmt` defaults
- Prefer explicit types in public APIs
- Document public items

### Error Handling

```rust
// Good: Use Result and descriptive errors
async fn deploy_contract(&self) -> Result<ContractAddress> {
    self.declare().await?;
    self.deploy().await
        .context("Failed to deploy contract")
}

// Avoid: Unwrap or panic in library code
async fn bad_deploy(&self) -> ContractAddress {
    self.deploy().await.unwrap()  // Don't do this!
}
```

### Documentation

```rust
/// Deploys a new contract instance.
///
/// # Arguments
///
/// * `account` - The account to deploy from
/// * `class_hash` - The declared contract class hash
/// * `constructor_calldata` - Arguments for the constructor
///
/// # Returns
///
/// The address of the deployed contract
///
/// # Errors
///
/// Returns an error if deployment fails or if the class is not declared
///
/// # Example
///
/// ```rust
/// let address = env.deploy_contract(
///     &account,
///     class_hash,
///     vec![],
/// ).await?;
/// ```
pub async fn deploy_contract(
    &self,
    account: &Account,
    class_hash: Felt,
    constructor_calldata: Vec<Felt>,
) -> Result<Felt> {
    // Implementation
}
```

### Testing

```rust
// Unit tests in same file
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_feature() {
        // Test code
    }
}

// Integration tests in tests/
// tests/integration_test.rs
```

## Project Structure

```
starkbiter/
├── bin/              # CLI binary
├── bindings/         # Contract bindings
├── core/             # Core library
│   ├── src/
│   │   ├── environment/
│   │   ├── middleware/
│   │   └── tokens/
│   └── tests/
├── engine/           # Engine library
│   ├── src/
│   │   ├── agent.rs
│   │   ├── behavior.rs
│   │   └── world.rs
│   └── tests/
├── macros/           # Procedural macros
├── examples/         # Example simulations
└── docs/             # Documentation (mdBook)
```

## Documentation

### Building the Book

```bash
# Install mdbook
cargo install mdbook mdbook-katex

# Build and serve
cd docs
mdbook serve

# Open http://localhost:3000
```

### Adding Documentation

- Update SUMMARY.md for new pages
- Use markdown for content
- Add code examples
- Keep it beginner-friendly

## Examples

When adding examples:

1. Create directory under `examples/`
2. Add `main.rs` and supporting files
3. Document in `examples/README.md`
4. Update book's examples page

## Community

### Communication Channels

- **GitHub Discussions** - Ask questions, share ideas
- **GitHub Issues** - Report bugs, request features
- **Pull Requests** - Submit code changes

### Code of Conduct

Be respectful and constructive. We're all here to learn and build together.

## Getting Help

- Read the [documentation](https://astraly-labs.github.io/starkbiter/)
- Search [existing issues](https://github.com/astraly-labs/starkbiter/issues)
- Ask in [discussions](https://github.com/astraly-labs/starkbiter/discussions)
- Check the [examples](https://github.com/astraly-labs/starkbiter/tree/main/examples)

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md`
- Release notes
- Documentation credits

Thank you for contributing to Starkbiter! 🚀

