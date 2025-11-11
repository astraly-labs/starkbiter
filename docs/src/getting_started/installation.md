# Installation

This guide will help you install Starkbiter and set up your development environment.

## Prerequisites

Before installing Starkbiter, you need to have Rust installed on your system.

### Installing Rust

If you don't have Rust installed, you can install it using [rustup](https://rustup.rs/):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

After installation, make sure your Rust toolchain is up to date:

```bash
rustup update
```

Starkbiter requires Rust 1.75 or later. You can check your Rust version with:

```bash
rustc --version
```

## Installing Starkbiter CLI

The Starkbiter CLI tool is useful for generating contract bindings and managing your projects.

### Install from crates.io

```bash
cargo install starkbiter
```

### Verify Installation

Check that Starkbiter was installed correctly:

```bash
starkbiter --help
```

You should see the Starkbiter help menu with available commands.

## Adding Starkbiter to Your Project

To use Starkbiter in your Rust project, add the necessary crates to your `Cargo.toml`:

```toml
[dependencies]
starkbiter-core = "0.1"
starkbiter-engine = "0.1"
starkbiter-bindings = "0.1"
starkbiter-macros = "0.1"

# Required dependencies
starknet = "0.11"
tokio = { version = "1.0", features = ["full"] }
```

## Optional Tools

### cargo-generate

For creating new projects from templates, install `cargo-generate`:

```bash
cargo install cargo-generate
```

## Next Steps

Now that you have Starkbiter installed, continue to the [Quick Start](./quick_start.md) guide to create your first simulation!

## Troubleshooting

### Common Issues

#### Compilation Errors

If you encounter compilation errors, make sure you have the latest stable Rust toolchain:

```bash
rustup update stable
rustup default stable
```

#### Missing System Dependencies

On Linux, you may need to install additional development packages:

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install build-essential pkg-config libssl-dev
```

**Fedora:**
```bash
sudo dnf install gcc pkg-config openssl-devel
```

**macOS:**
```bash
xcode-select --install
```

### Getting Help

If you continue to have issues:
- Check the [GitHub Issues](https://github.com/astraly-labs/starkbiter/issues)
- Start a [Discussion](https://github.com/astraly-labs/starkbiter/discussions)
- Read the [FAQ](../advanced/faq.md)

