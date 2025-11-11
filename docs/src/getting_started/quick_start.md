# Quick Start

This guide will walk you through creating your first Starkbiter simulation in just a few minutes.

## Your First Simulation

Let's create a simple simulation that deploys and interacts with an ERC20 token contract on Starknet.

### Step 1: Create a New Project

```bash
cargo new my-starkbiter-sim
cd my-starkbiter-sim
```

### Step 2: Add Dependencies

Edit your `Cargo.toml`:

```toml
[package]
name = "my-starkbiter-sim"
version = "0.1.0"
edition = "2021"

[dependencies]
starkbiter-core = "0.1"
starkbiter-bindings = "0.1"
starknet = "0.11"
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
```

### Step 3: Create an Environment

Replace the contents of `src/main.rs`:

```rust
use anyhow::Result;
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;

#[tokio::main]
async fn main() -> Result<()> {
    // Create a new Starknet environment
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941").unwrap()) // Sepolia testnet
        .build()
        .await?;

    println!("✅ Starkbiter environment created!");
    
    // Get the current block number
    let block_number = env.get_block_number().await?;
    println!("📦 Current block: {}", block_number);

    Ok(())
}
```

### Step 4: Run Your Simulation

```bash
cargo run
```

You should see:
```
✅ Starkbiter environment created!
📦 Current block: 0
```

## Adding Contract Interaction

Let's expand the example to deploy and interact with an ERC20 contract.

### Step 1: Generate Contract Bindings

First, you'll need a compiled Starknet contract. For this example, we'll use the pre-generated bindings from `starkbiter-bindings`.

Update your `Cargo.toml`:

```toml
[dependencies]
starkbiter-core = "0.1"
starkbiter-bindings = "0.1"
starknet = "0.11"
tokio = { version = "1.0", features = ["full"] }
anyhow = "1.0"
```

### Step 2: Deploy and Interact

Update `src/main.rs`:

```rust
use anyhow::Result;
use starkbiter_core::environment::Environment;
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;
use starknet::core::types::Felt;

#[tokio::main]
async fn main() -> Result<()> {
    // Create environment
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941").unwrap())
        .build()
        .await?;

    println!("✅ Environment created");

    // Create an account
    let private_key = Felt::from_hex("0x1234").unwrap();
    let account_address = Felt::from_hex("0x1").unwrap();
    
    let account = env.create_single_owner_account(
        private_key,
        account_address
    ).await?;

    println!("✅ Account created: {:#x}", account_address);

    // In a real scenario, you would:
    // 1. Declare the contract class
    // 2. Deploy an instance
    // 3. Interact with the deployed contract

    Ok(())
}
```

## Working with the Example

Starkbiter comes with a complete example. Let's run it:

```bash
# Clone the repository
git clone https://github.com/astraly-labs/starkbiter
cd starkbiter

# Run the minter example
cargo run --example minter simulate ./examples/minter/config.toml -vvvv
```

This runs a simulation with:
- A **Token Admin** agent that creates ERC20 tokens
- A **Token Requester** agent that requests token minting
- Event-based communication between agents
- Automated token minting loop

## Understanding the Example

The minter example demonstrates:
1. **Environment setup** - Creating a sandboxed Starknet instance
2. **Agent creation** - Building autonomous agents with behaviors
3. **Event handling** - Responding to blockchain events
4. **Inter-agent messaging** - Communication between agents
5. **Contract interaction** - Deploying and calling contracts

## Next Steps

Now that you've created your first simulation, explore:

- **[Examples](./examples.md)** - Learn from more complex examples
- **[Core Concepts](../core_concepts/architecture.md)** - Understand Starkbiter's architecture
- **[Usage Guide](../usage/index.md)** - Deep dive into each crate
- **[Advanced Topics](../advanced/simulation_techniques.md)** - Advanced simulation techniques

## Tips

### Logging

Enable detailed logging with the `-v` flags:
```bash
cargo run -- -v    # Info level
cargo run -- -vv   # Debug level
cargo run -- -vvv  # Trace level
```

### Development Mode

Use `cargo watch` for automatic recompilation:
```bash
cargo install cargo-watch
cargo watch -x run
```

### Testing

Write tests for your simulations:
```rust
#[tokio::test]
async fn test_token_minting() -> Result<()> {
    let env = Environment::builder().build().await?;
    // Your test code here
    Ok(())
}
```

## Troubleshooting

### Environment Not Starting

Make sure all dependencies are installed correctly:
```bash
cargo clean
cargo build
```

### Contract Deployment Failures

Check that:
- Your contract is properly compiled to Sierra 1.0
- The contract JSON is in the correct location
- You have the necessary permissions

### Getting Help

- Check the [API Documentation](https://docs.rs/starkbiter-core/)
- Browse [Examples](https://github.com/astraly-labs/starkbiter/tree/main/examples)
- Ask on [GitHub Discussions](https://github.com/astraly-labs/starkbiter/discussions)

