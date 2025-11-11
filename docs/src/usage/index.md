# Usage Guide Overview

This section provides detailed documentation for each component of the Starkbiter framework. Whether you're building simple contract tests or complex multi-agent simulations, you'll find the information you need here.

## Crates Overview

Starkbiter is organized into several crates, each serving a specific purpose:

### [Starkbiter Core](./starkbiter_core/index.md)
The foundation layer providing direct interaction with Starknet.

**Key Components:**
- `Environment` - Sandboxed Starknet instance
- `CheatingProvider` - Extended middleware with testing capabilities
- State management and control
- Account and contract deployment

**Best for:** Low-level control, custom testing scenarios, framework integration

### [Starkbiter Engine](./starkbiter_engine/index.md)
High-level abstractions for building agent-based simulations.

**Key Components:**
- `Agent` - Autonomous entities with behaviors
- `Behavior` - Trait for defining agent actions
- `World` - Simulation environment
- `Universe` - Multi-world orchestration
- Inter-agent messaging

**Best for:** Complex simulations, agent-based modeling, DeFi protocol testing

### [Starkbiter CLI](./starkbiter_cli.md)
Command-line tools for project management.

**Key Features:**
- Contract binding generation
- Project initialization
- Build management

**Best for:** Project setup, contract integration

### [Starkbiter Macros](./starkbiter_macros.md)
Procedural macros to reduce boilerplate.

**Provides:**
- Behavior derivation
- Agent configuration
- Simplified async patterns

**Best for:** Cleaner code, rapid development

### [Starkbiter Bindings](./starkbiter_bindings.md)
Pre-generated contract bindings for common contracts.

**Includes:**
- ERC20 tokens
- Account contracts
- DEX protocols (Ekubo)
- Test utilities

**Best for:** Quick testing, common contract interactions

## Choosing the Right Level

### Use Core When:
- You need maximum control over the simulation
- Building custom testing frameworks
- Integrating with other tools
- Implementing novel testing patterns

```rust
use starkbiter_core::environment::Environment;

let env = Environment::builder().build().await?;
let account = env.create_account().await?;
// Direct, low-level control
```

### Use Engine When:
- Building multi-agent simulations
- Modeling economic systems
- Testing protocol interactions
- Simulating user behaviors

```rust
use starkbiter_engine::{Agent, World};

let world = World::new(env);
world.add_agent(Agent::new("trader", TradingBehavior));
world.run().await?;
```

### Use CLI When:
- Starting new projects
- Generating contract bindings
- Managing build artifacts

```bash
starkbiter bind
starkbiter init my-project
```

## Common Patterns

### Pattern 1: Simple Contract Testing

```rust
use starkbiter_core::environment::Environment;

#[tokio::test]
async fn test_my_contract() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    // Deploy and test
    let contract = deploy_contract(&account).await?;
    assert_eq!(contract.get_value().await?, expected_value);
}
```

### Pattern 2: Multi-Agent Simulation

```rust
use starkbiter_engine::{Agent, World, Behavior};

#[tokio::main]
async fn main() -> Result<()> {
    let env = Environment::builder().build().await?;
    let world = World::new(env);
    
    // Add multiple agents
    world.add_agent(Agent::new("liquidator", LiquidatorBehavior));
    world.add_agent(Agent::new("borrower", BorrowerBehavior));
    world.add_agent(Agent::new("lender", LenderBehavior));
    
    // Run simulation
    world.run().await?;
    Ok(())
}
```

### Pattern 3: Fork Testing

```rust
let env = Environment::builder()
    .with_fork(mainnet_url, block_num, None)
    .build()
    .await?;

// Test against real mainnet state
let usdc = ERC20::new(usdc_address, &account);
let balance = usdc.balance_of(whale_address).await?;
```

## Navigation

Each crate section includes:
- **Overview** - What it does and when to use it
- **API Reference** - Detailed documentation of types and methods
- **Examples** - Working code samples
- **Best Practices** - Tips and patterns

Start with the crate that matches your use case:
- [Starkbiter Core](./starkbiter_core/index.md) - Low-level control
- [Starkbiter Engine](./starkbiter_engine/index.md) - Agent simulations
- [Starkbiter CLI](./starkbiter_cli.md) - Project tooling

## Additional Resources

- [Core Concepts](../core_concepts/architecture.md) - Architecture and design
- [Advanced Topics](../advanced/simulation_techniques.md) - Advanced techniques
- [Examples](../getting_started/examples.md) - Working examples
- [API Docs](https://docs.rs/starkbiter-core/) - Full API reference