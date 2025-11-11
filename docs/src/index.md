# Starkbiter Documentation

```bash
#  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
#  ░░     ░░░       ░░░     ░░░      ░░░░  ░░░  ░░      ░░░       ░░       ░░      ░░      ░░░
#  ▒  ▒▒▒▒▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒  ▒▒  ▒▒▒  ▒▒▒  ▒▒  ▒▒▒  ▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒▒▒  ▒▒▒▒▒▒  ▒▒▒  ▒▒
#  ▓▓     ▓▓▓▓▓  ▓▓▓▓▓  ▓▓▓  ▓▓     ▓▓▓▓▓    ▓▓▓▓▓      ▓▓▓▓▓▓  ▓▓▓▓▓▓  ▓▓▓▓▓    ▓▓▓▓      ▓▓▓
#  ██████  ████  █████       ██  ███  ███  ██  ███  ███  █████  ██████  █████  ██████  ███  ██
#  ██     █████  █████  ███  ██  ████  ██  ███  ██      ███       ████  █████      ██  ████  █
#  ███████████████████████████████████████████████████████████████████████████████████████████
```

**Starkbiter** is a powerful framework for orchestrating event-based agentic simulations on top of Starknet. 
The framework features a [`starknet-rs`](https://github.com/xJonathanLEI/starknet-rs) middleware built on top of [starknet-devnet](https://github.com/0xSpaceShard/starknet-devnet) which allows you to interact with a sandboxed Starknet Sequencer instance as if it were a live Starknet node.

## Why Starkbiter?

Starkbiter enables you to:
- 🔬 **Test smart contracts** against adversarial environments and dynamic parameters
- 🤖 **Build autonomous agents** that interact with Starknet contracts in realistic scenarios
- 📊 **Model economic systems** and DeFi protocols with sophisticated simulations
- 🔍 **Detect anomalies** and vulnerabilities before deployment
- ⚡ **Rapid iteration** with high-performance local testing

## Overview

The Starkbiter workspace consists of five crates:

- **`starkbiter`**: Binary crate providing a CLI for contract bindings generation
- **`starkbiter-core`**: Core library with `Environment` sandbox and middleware for Starknet interaction
- **`starkbiter-engine`**: High-level abstractions for building simulations, agents, and behaviors
- **`starkbiter-macros`**: Proc macros to simplify development
- **`starkbiter-bindings`**: Pre-generated bindings for common utility contracts

All contract bytecode runs directly using Starknet Devnet (powered by Blockifier, Starkware's sequencer implementation), ensuring your contracts are tested in an environment identical to production.

## Key Features

### 🏗️ Stateful Simulation
Test contracts against dynamic, stateful environments that mirror real-world Starknet conditions.

### 🎯 Event-Based Architecture
Build reactive agents that respond to blockchain events, enabling complex behavioral modeling.

### 🔌 Full JSON-RPC Support
Complete Starknet node capabilities with additional methods for controlling block production and deployments.

### 🚀 High Performance
Local execution provides unmatched speed for rapid testing and iteration.

### 🧪 Forking Support
Fork from any Starknet network state to test against real mainnet or testnet conditions.

## Use Cases

### Smart Contract Testing
Move beyond static, stateless tests. Simulate contracts in adversarial environments with various parameters and agent behaviors.

### DeFi Protocol Development
Model complex economic systems with multiple interacting agents, market conditions, and edge cases.

### Simulation-Driven Development
Build tests that validate not just code correctness, but economic incentives and mechanism design.

### Strategy Backtesting
Test trading strategies, liquidation bots, and other autonomous agents against thousands of scenarios.

### Security Auditing
Perform domain-specific fuzzing and anomaly detection to uncover vulnerabilities before deployment.

## Getting Started

Ready to start building with Starkbiter? Here's what you need:

1. **[Installation](./getting_started/installation.md)** - Set up Rust and install Starkbiter
2. **[Quick Start](./getting_started/quick_start.md)** - Your first simulation in 5 minutes
3. **[Examples](./getting_started/examples.md)** - Learn from working examples

## Architecture

Starkbiter's architecture is built around three core components:

### Environment
A sandboxed Starknet instance that provides:
- Full sequencer capabilities via Starknet Devnet
- Complete control over block production
- State forking from live networks
- Contract deployment and declaration

### Middleware
A familiar interface for contract interaction:
- Implements `starknet-rs` patterns
- Seamless integration with existing tooling
- Additional control methods for testing

### Engine
High-level abstractions for simulations:
- Agent behaviors and event handling
- World and universe management
- Configuration-driven setup
- Inter-agent messaging

## Quick Example

Here's a simple example of creating an environment and deploying a contract:

```rust
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;

// Create a new environment
let env = Environment::builder()
    .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941").unwrap())
    .build()
    .await?;

// Create an account
let account = env.create_single_owner_account(
    Felt::from_hex("0xprivate_key").unwrap(),
    Felt::from_hex("0xaccount_address").unwrap(),
).await?;

// Deploy your contracts and start simulating!
```

## Resources

### Documentation
- 📖 **[This Book](https://astraly-labs.github.io/starkbiter/)** - Complete guide and tutorials
- 📚 **[API Docs](https://docs.rs/starkbiter-core/)** - Detailed API documentation
- 🎓 **[Examples](https://github.com/astraly-labs/starkbiter/tree/main/examples)** - Working code examples

### Crates
All Starkbiter crates are available on crates.io:
- [`starkbiter`](https://crates.io/crates/starkbiter) - CLI tool
- [`starkbiter-core`](https://crates.io/crates/starkbiter-core) - Core library
- [`starkbiter-engine`](https://crates.io/crates/starkbiter-engine) - Simulation engine
- [`starkbiter-macros`](https://crates.io/crates/starkbiter-macros) - Proc macros
- [`starkbiter-bindings`](https://crates.io/crates/starkbiter-bindings) - Contract bindings

### Community
- 🐙 **[GitHub](https://github.com/astraly-labs/starkbiter)** - Source code and issues
- 💬 **[Discussions](https://github.com/astraly-labs/starkbiter/discussions)** - Ask questions and share ideas
- 🐛 **[Issues](https://github.com/astraly-labs/starkbiter/issues)** - Report bugs and request features

## Contributing

Starkbiter is open source and welcomes contributions! Check out our [Contributing Guide](./contributing/index.md) to get started.

## License

Starkbiter is licensed under the MIT License. See the [LICENSE](https://github.com/astraly-labs/starkbiter/blob/main/LICENSE) file for details.