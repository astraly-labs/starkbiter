# Architecture

Starkbiter's architecture is designed to provide a seamless simulation experience while maintaining compatibility with existing Starknet tooling. This chapter explains the high-level architecture and how different components work together.

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         User Code                            │
│  (Agents, Behaviors, Simulations)                           │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                   Starkbiter Engine                          │
│  • Agent Management                                          │
│  • Behavior Orchestration                                    │
│  • World & Universe Abstractions                            │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                    Starkbiter Core                           │
│  • Environment (Sandbox)                                     │
│  • Middleware (starknet-rs compatible)                       │
│  • Token Management                                          │
└────────────────┬────────────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────────────┐
│                  Starknet Devnet                             │
│  • Blockifier (Sequencer Implementation)                     │
│  • JSON-RPC Interface                                        │
│  • State Management                                          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Starkbiter Core

The foundation of Starkbiter, providing low-level primitives for Starknet interaction.

**Key Responsibilities:**
- **Environment Management:** Creates and manages sandboxed Starknet instances
- **Middleware Layer:** Provides `starknet-rs` compatible interface for contract interaction
- **State Control:** Manages blockchain state, block production, and time manipulation
- **Account Management:** Handles account creation and deployment

**Key Types:**
- `Environment` - Sandboxed Starknet instance
- `CheatingProvider` - Middleware with additional testing capabilities
- `Connection` - Manages RPC communication

### 2. Starkbiter Engine

High-level abstractions for building complex simulations.

**Key Responsibilities:**
- **Agent Lifecycle:** Creates, manages, and coordinates agents
- **Behavior Execution:** Schedules and runs agent behaviors
- **Event System:** Handles blockchain events and inter-agent messaging
- **World Management:** Provides simulation environments with shared state

**Key Types:**
- `Agent` - Autonomous entity with behaviors
- `Behavior` - Trait for defining agent actions
- `World` - Simulation environment
- `Universe` - Collection of worlds
- `Messager` - Inter-agent communication

### 3. Starkbiter CLI

Command-line tools for project management.

**Key Responsibilities:**
- **Binding Generation:** Creates Rust bindings from Cairo contracts
- **Project Templates:** Scaffolds new simulation projects
- **Build Tools:** Compiles and manages contract artifacts

### 4. Starkbiter Bindings

Pre-generated bindings for common contracts.

**Includes:**
- ERC20 tokens
- Account contracts (Argent, OpenZeppelin)
- DEX contracts (Ekubo)
- Utility contracts

## Data Flow

### Contract Deployment Flow

```
User Code
    │
    └─> Environment.declare_contract()
            │
            └─> Devnet declares contract class
                    │
                    └─> Returns class hash
    
User Code
    │
    └─> Environment.deploy_contract()
            │
            └─> Devnet deploys instance
                    │
                    └─> Returns contract address
```

### Transaction Execution Flow

```
Agent Behavior
    │
    └─> Contract.call_method()
            │
            └─> Middleware prepares transaction
                    │
                    └─> Devnet executes transaction
                            │
                            ├─> Updates state
                            ├─> Emits events
                            └─> Returns receipt
                                    │
                                    └─> Agent processes result
```

### Event Handling Flow

```
Contract emits event
    │
    └─> Devnet captures event
            │
            └─> Environment polls for events
                    │
                    └─> Event distributed to subscribers
                            │
                            └─> Agent behaviors triggered
```

## Design Principles

### 1. Compatibility First

Starkbiter maintains compatibility with `starknet-rs` to ensure:
- Seamless integration with existing code
- Familiar APIs for developers
- Easy transition between testing and production

### 2. Layered Abstraction

Each layer serves a specific purpose:
- **Low-level (Core):** Maximum control and flexibility
- **Mid-level (Engine):** Balanced abstraction for common patterns
- **High-level (User Code):** Domain-specific logic

### 3. Performance Oriented

- Local execution eliminates network latency
- Efficient state management
- Optimized for rapid iteration

### 4. Testing First

Built specifically for testing scenarios:
- Time manipulation
- State snapshots and rollbacks
- Deterministic execution
- Block production control

## Integration Points

### With Starknet-rs

Starkbiter implements `starknet-rs` traits:
- `Provider` - For read operations
- `Account` - For transaction signing and submission

This allows seamless use of:
- Contract bindings generated with `cainome`
- Existing Starknet libraries
- Standard tooling

### With Starknet Devnet

Starkbiter wraps Starknet Devnet to provide:
- Full sequencer capabilities
- JSON-RPC interface
- State forking
- Additional testing methods

### With Cairo Contracts

Starkbiter works with standard Cairo contracts:
- Compiled to Sierra 1.0
- Standard JSON format
- ABI compatibility

## Execution Model

### Synchronous Simulation

```rust
// Create environment
let env = Environment::builder().build().await?;

// Operations execute immediately
let account = env.create_account(...).await?;
let contract = deploy_contract(&account, ...).await?;

// State is updated synchronously
let result = contract.transfer(...).await?;
```

### Event-Driven Simulation

```rust
// Agents react to events
let mut agent = Agent::new("trader", TradingBehavior);

agent.on_event("SwapExecuted", |event| {
    // React to DEX swaps
    handle_swap(event)
});

// Engine coordinates execution
world.add_agent(agent);
world.run().await?;
```

## Memory and State Management

### Environment Lifecycle

1. **Initialization:** Devnet starts with genesis state
2. **Execution:** State updates with each transaction
3. **Cleanup:** Resources released on drop

### State Isolation

Each `Environment` instance:
- Has its own isolated state
- Independent block production
- Separate account namespaces

### Forking

When forking from live networks:
- Initial state loaded lazily
- Missing state fetched on-demand
- Local modifications isolated

## Concurrency Model

### Async/Await

Starkbiter uses Tokio for async execution:
```rust
#[tokio::main]
async fn main() -> Result<()> {
    let env = Environment::builder().build().await?;
    // Concurrent operations
    let (r1, r2) = tokio::join!(
        operation1(&env),
        operation2(&env),
    );
    Ok(())
}
```

### Agent Concurrency

Multiple agents can execute concurrently:
- Coordinated by the engine
- Shared state through the world
- Message passing for communication

## Error Handling

### Error Types

Starkbiter defines structured errors:
- `EnvironmentError` - Environment setup and operation failures
- `ContractError` - Contract deployment and interaction errors
- `AgentError` - Agent execution failures

### Error Propagation

Errors use `anyhow` or `thiserror` for:
- Rich context
- Easy error chaining
- Flexible handling

## Next Steps

- [Environment](./environment.md) - Deep dive into the Environment API
- [Middleware](./middleware.md) - Understanding the middleware layer
- [Forking](./forking.md) - State forking from live networks

