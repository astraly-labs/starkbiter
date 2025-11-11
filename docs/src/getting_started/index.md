# Getting Started

Welcome to Starkbiter! This section will guide you through everything you need to start building simulations on Starknet.

## What You'll Learn

In this section, you'll learn how to:
- Install Starkbiter and set up your development environment
- Create your first simulation
- Deploy and interact with Starknet contracts
- Build agents with custom behaviors
- Run and analyze simulations

## Prerequisites

Before starting with Starkbiter, you should have:
- Basic knowledge of Rust programming
- Familiarity with Starknet and smart contracts
- Understanding of blockchain fundamentals

Don't worry if you're not an expert - we'll guide you through each step!

## Setup Options

### Option 1: Using the CLI (Recommended)

The Starkbiter CLI provides the easiest way to get started:
1. Install the CLI tool
2. Generate contract bindings
3. Use pre-built templates

**Best for:** Most users, especially those new to Starkbiter

### Option 2: Direct Crate Usage

Use Starkbiter crates directly in your Rust projects:
```toml
[dependencies]
starkbiter-core = "0.1"
starkbiter-bindings = "0.1"
starkbiter-engine = "0.1"
```

**Best for:** Advanced users who want full control over their setup

## Learning Path

Follow these guides in order for the best learning experience:

1. **[Installation](./installation.md)** - Set up Rust and install Starkbiter
2. **[Quick Start](./quick_start.md)** - Build your first simulation in 5 minutes
3. **[Examples](./examples.md)** - Explore working examples and learn best practices

## Use Cases for Starkbiter

### Smart Contract Testing
Test your contracts in realistic environments with multiple interacting agents, simulating mainnet conditions without deployment costs.

### DeFi Protocol Development
Model complex economic systems, test liquidation mechanisms, and validate AMM designs before going live.

### Strategy Backtesting
Develop and test trading strategies, arbitrage bots, and MEV searchers in controlled environments.

### Security Auditing
Perform sophisticated fuzzing, anomaly detection, and vulnerability assessment with agent-based modeling.

## Support and Resources

### Documentation
- 📖 This book - comprehensive guides and tutorials
- 📚 [API docs](https://docs.rs/starkbiter-core/) - detailed API reference
- 🎓 [Examples](https://github.com/astraly-labs/starkbiter/tree/main/examples) - working code samples

### Community
- 💬 [Discussions](https://github.com/astraly-labs/starkbiter/discussions) - ask questions
- 🐛 [Issues](https://github.com/astraly-labs/starkbiter/issues) - report bugs
- 🐙 [GitHub](https://github.com/astraly-labs/starkbiter) - source code

## Next Steps

Ready to start? Head to the [Installation](./installation.md) guide!

