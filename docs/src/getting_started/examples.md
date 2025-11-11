# Examples

This page provides an overview of the examples included with Starkbiter. These examples demonstrate key features and best practices for building simulations.

## Running the Examples

All examples are located in the [examples](https://github.com/astraly-labs/starkbiter/tree/main/examples) directory of the Starkbiter repository.

To run an example:

```bash
# Clone the repository if you haven't already
git clone https://github.com/astraly-labs/starkbiter
cd starkbiter

# Run an example
cargo run --example <example_name>
```

## Available Examples

### Token Minter Simulation

**Location:** `examples/minter/`

A comprehensive example demonstrating event-based agent communication and contract interaction.

**Run it:**
```bash
cargo run --example minter simulate ./examples/minter/config.toml -vvvv
```

**What it demonstrates:**
- Creating and managing multiple agents
- Event-based communication between agents
- ERC20 token deployment and interaction
- High-level messaging between agents
- Configuration-driven simulation setup

**How it works:**

The simulation involves two agents:

1. **Token Admin (TA):**
   - Creates and deploys ERC20 contracts
   - Subscribes to a high-level messenger for mint requests
   - Mints tokens upon receiving requests

2. **Token Requester (TR):**
   - Subscribes to `TokenMinted` events from ERC20 contracts
   - Requests more tokens when minting events are detected
   - Creates an endless loop until a threshold is reached

**Key Code Locations:**
- `examples/minter/main.rs` - Entry point and setup
- `examples/minter/behaviors/token_admin.rs` - Admin agent logic
- `examples/minter/behaviors/token_requester.rs` - Requester agent logic
- `examples/minter/config.toml` - Configuration file

**Learning outcomes:**
- Agent behavior patterns
- Event subscription and handling
- Inter-agent messaging
- Contract lifecycle management

### Configuration Options

The minter example uses a TOML configuration file. Here's what you can configure:

```toml
# Environment settings
[environment]
chain_id = "0x534e5f5345504f4c4941"  # Starknet Sepolia

# Agent configurations
[agents.token_admin]
# Admin-specific settings

[agents.token_requester]
# Requester-specific settings
```

## Advanced Example: Forking

Starkbiter supports forking from live Starknet networks to test against real state.

**Basic forking example:**

```rust
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;
use url::Url;
use std::str::FromStr;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Fork from Starknet mainnet at a specific block
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f4d41494e").unwrap())
        .with_fork(
            Url::from_str("https://starknet-mainnet.public.blastapi.io")?,
            1000, // Block number to fork from
            Some(Felt::from_hex("0xblock_hash").unwrap()),
        )
        .build()
        .await?;

    // Now you can interact with mainnet state locally!
    let block = env.get_block_number().await?;
    println!("Forked at block: {}", block);

    Ok(())
}
```

**What forking enables:**
- Test against real mainnet/testnet state
- Simulate interactions with live protocols
- Debug issues without spending real tokens
- Analyze historical scenarios

**Note:** Forking requires an active RPC endpoint during simulation.

## Building Your Own Examples

### Template Structure

Here's a basic template for creating your own simulation:

```rust
use anyhow::Result;
use starkbiter_core::environment::Environment;
use starkbiter_engine::{Agent, Behavior, World};
use starknet::core::types::Felt;

// Define your behavior
struct MyBehavior;

impl Behavior for MyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Your agent logic here
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // 1. Create environment
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941")?)
        .build()
        .await?;

    // 2. Create world and agents
    let world = World::new(env);
    let agent = Agent::new("my-agent", MyBehavior);
    
    // 3. Run simulation
    world.add_agent(agent);
    world.run().await?;

    Ok(())
}
```

### Best Practices

1. **Modular behaviors:** Keep behavior logic in separate files
2. **Configuration-driven:** Use TOML files for simulation parameters
3. **Logging:** Add comprehensive logging with `tracing` or `log` crates
4. **Error handling:** Use `anyhow` or `thiserror` for robust error handling
5. **Testing:** Write unit tests for individual behaviors

## Example Projects Gallery

Looking for more inspiration? Check out these community examples:

- **DEX Arbitrage Bot:** Simulates arbitrage opportunities across multiple DEXes
- **Liquidation Engine:** Models liquidation mechanisms for lending protocols
- **MEV Searcher:** Demonstrates MEV extraction strategies
- **Oracle Price Feed:** Simulates price feed updates and consumer reactions

*Note: Community examples are maintained by their respective authors*

## Next Steps

After exploring the examples:

1. **Modify an example** - Change parameters and observe the results
2. **Combine patterns** - Mix concepts from different examples
3. **Build your own** - Create a simulation for your use case
4. **Share it** - Contribute your example back to the community!

## Troubleshooting

### Example Won't Run

```bash
# Clean and rebuild
cargo clean
cargo build --example <example_name>
```

### Missing Dependencies

```bash
# Update dependencies
cargo update
```

### Configuration Errors

Make sure your config file paths are correct:
```bash
cargo run --example minter simulate ./examples/minter/config.toml
```

## Getting Help

- 📖 Read the [Usage Guide](../usage/index.md)
- 💬 Ask in [Discussions](https://github.com/astraly-labs/starkbiter/discussions)
- 🐛 Report issues on [GitHub](https://github.com/astraly-labs/starkbiter/issues)
