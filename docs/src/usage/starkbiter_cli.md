# Starkbiter CLI

The Starkbiter command-line interface provides tools for managing your projects and generating contract bindings.

## Installation

```bash
cargo install starkbiter
```

## Commands

### `bind` - Generate Contract Bindings

Generate Rust bindings from Cairo contract JSON files using `cainome`.

```bash
starkbiter bind [OPTIONS]
```

**Options:**
- `--contracts-dir <DIR>` - Directory containing contract JSON files (default: `./contracts`)
- `--output-dir <DIR>` - Output directory for generated bindings (default: `./bindings/src`)

**Example:**

```bash
# Generate bindings for all contracts in ./contracts/
starkbiter bind

# Custom directories
starkbiter bind --contracts-dir ./my-contracts --output-dir ./src/bindings
```

**Contract Format:**

Your contract JSON files should be Sierra 1.0 compiled contracts with ABI:

```json
{
  "sierra_program": [...],
  "contract_class_version": "0.1.0",
  "entry_points_by_type": {...},
  "abi": [...]
}
```

### `init` - Initialize a New Project

*(Under development)*

Create a new Starkbiter simulation project from a template.

```bash
starkbiter init <project-name>
```

### `--help` - Show Help

Display help information:

```bash
starkbiter --help
starkbiter bind --help
```

## Workflow

### 1. Compile Your Contracts

First, compile your Cairo contracts to Sierra 1.0:

```bash
scarb build
```

This generates JSON files in `target/dev/`.

### 2. Copy Contract Files

Copy the contract JSON files to your project:

```bash
mkdir contracts
cp target/dev/my_contract.contract_class.json contracts/
```

### 3. Generate Bindings

Run the CLI to generate Rust bindings:

```bash
starkbiter bind
```

This creates Rust files in `bindings/src/` with typed interfaces for your contracts.

### 4. Use the Bindings

Import and use the generated bindings in your code:

```rust
use crate::bindings::my_contract::MyContract;

// Deploy
let contract = MyContract::deploy(&account, constructor_args).await?;

// Call functions
let result = contract.my_function(args).await?;
```

## Project Structure

A typical Starkbiter project structure:

```
my-project/
├── Cargo.toml
├── contracts/
│   ├── MyContract.json
│   └── MyToken.json
├── bindings/
│   ├── Cargo.toml
│   └── src/
│       ├── lib.rs
│       ├── my_contract.rs
│       └── my_token.rs
├── src/
│   ├── main.rs
│   └── behaviors/
│       ├── mod.rs
│       └── trading.rs
└── config.toml
```

## Cargo.toml Setup

Add bindings crate as a dependency:

```toml
[package]
name = "my-project"
version = "0.1.0"
edition = "2021"

[dependencies]
starkbiter-core = "0.1"
starkbiter-engine = "0.1"
my-bindings = { path = "./bindings" }
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
```

## Tips

### Automatic Regeneration

Use a build script or file watcher to regenerate bindings when contracts change:

```bash
# Using cargo-watch
cargo watch -x "run --bin starkbiter -- bind"
```

### CI/CD Integration

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Generate bindings
  run: starkbiter bind
  
- name: Check bindings are up to date
  run: git diff --exit-code bindings/
```

### Multiple Contract Directories

Generate bindings from multiple directories:

```bash
starkbiter bind --contracts-dir ./core-contracts
starkbiter bind --contracts-dir ./periphery-contracts
```

## Troubleshooting

### Binding Generation Fails

**Error:** "Failed to parse contract JSON"

**Solution:** Ensure contracts are compiled with compatible Sierra version:
```bash
scarb build --release
```

### Missing Dependencies

**Error:** "cainome not found"

**Solution:** The CLI includes cainome, but ensure you have it in your dependencies:
```toml
[dependencies]
cainome = "0.3"
```

### Import Errors

**Error:** "Cannot find module"

**Solution:** Check your `lib.rs` in bindings crate includes the generated modules:
```rust
pub mod my_contract;
pub mod my_token;
```

## Next Steps

- [Quick Start](../getting_started/quick_start.md) - Build your first simulation
- [Examples](../getting_started/examples.md) - See bindings in action
- [Starkbiter Bindings](./starkbiter_bindings.md) - Pre-generated bindings

