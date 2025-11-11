# Starkbiter Core

`starkbiter-core` is the foundation of the Starkbiter framework. It provides low-level primitives for interacting with Starknet in a sandboxed environment with complete control over blockchain state.

## Overview

The core crate gives you:
- **Environment** - A sandboxed Starknet Devnet instance
- **Middleware** - `starknet-rs` compatible provider with testing extensions
- **State Control** - Block production, time manipulation, snapshots
- **Account Management** - Account creation and deployment
- **Contract Management** - Declaration and deployment

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
starkbiter-core = "0.1"
starknet = "0.11"
tokio = { version = "1.0", features = ["full"] }
```

## Quick Start

```rust
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Create environment
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941")?)
        .build()
        .await?;
    
    // Create account
    let account = env.create_account().await?;
    
    // Deploy and interact with contracts
    // ...
    
    Ok(())
}
```

## Core Components

### Environment

The `Environment` struct is the main entry point. It encapsulates:
- Starknet Devnet instance
- Block production control
- State management
- Account and contract operations

[Learn more about Environment →](./environment.md)

### Middleware

The `CheatingProvider` implements the `Provider` trait from `starknet-rs` with additional testing methods:
- Standard RPC calls
- Time manipulation
- Balance manipulation
- Storage access
- Impersonation

[Learn more about Middleware →](./middleware.md)

## Key Features

### 🔧 Full Control

Complete control over the blockchain state:

```rust
// Control block production
env.mine_block().await?;
env.mine_blocks(10).await?;

// Manipulate time
env.increase_time(3600).await?;  // +1 hour
env.set_timestamp(timestamp).await?;

// Take snapshots
let snapshot = env.snapshot().await?;
// ... make changes ...
env.restore(snapshot).await?;
```

### 🚀 High Performance

Local execution with no network latency:
- Instant transaction confirmation
- Rapid state queries
- Fast iteration cycles

### 🔌 Compatible

Works seamlessly with the Starknet ecosystem:
- `starknet-rs` types and traits
- `cainome` contract bindings
- Standard tooling and libraries

### 🧪 Testing First

Built specifically for testing scenarios:

```rust
// Impersonate addresses
env.start_prank(contract, impersonator).await?;

// Set balances
env.set_balance(address, amount).await?;

// Manipulate storage
env.store(contract, key, value).await?;
```

## Architecture

```
Your Code
    ↓
Environment
    ↓
CheatingProvider (Middleware)
    ↓
Starknet Devnet
    ↓
Blockifier (Sequencer)
```

## Use Cases

### Unit Testing

```rust
#[tokio::test]
async fn test_token_transfer() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    let token = deploy_token(&account).await?;
    token.transfer(recipient, amount).await?;
    
    let balance = token.balance_of(recipient).await?;
    assert_eq!(balance, amount);
}
```

### Integration Testing

```rust
#[tokio::test]
async fn test_defi_protocol() {
    let env = Environment::builder().build().await?;
    
    // Deploy multiple contracts
    let token = deploy_token(&env).await?;
    let pool = deploy_pool(&env).await?;
    let router = deploy_router(&env).await?;
    
    // Test interactions
    test_swap(&env, &router, &pool).await?;
}
```

### Fork Testing

```rust
let env = Environment::builder()
    .with_fork(mainnet_url, block_num, None)
    .build()
    .await?;

// Test against real mainnet state
let usdc = ERC20::new(usdc_mainnet_address, &account);
let balance = usdc.balance_of(whale).await?;
```

### Time-Based Testing

```rust
// Test time-locked features
let contract = deploy_timelock(&env).await?;

// Try before lock expires
assert!(contract.withdraw().await.is_err());

// Fast forward
env.increase_time(lock_duration).await?;
env.mine_block().await?;

// Now succeeds
contract.withdraw().await?;
```

## API Documentation

### Environment API

The `Environment` provides these main capabilities:

**Setup & Configuration:**
- `Environment::builder()` - Create environment builder
- `.with_chain_id()` - Set chain ID
- `.with_block_time()` - Configure block production
- `.with_fork()` - Fork from live network
- `.build()` - Build environment

**Block Control:**
- `.mine_block()` - Produce one block
- `.mine_blocks(n)` - Produce n blocks
- `.get_block_number()` - Get current block
- `.get_block()` - Get block details

**Time Control:**
- `.get_timestamp()` - Get current time
- `.set_timestamp()` - Set specific time
- `.increase_time()` - Advance time

**State Management:**
- `.snapshot()` - Save state
- `.restore()` - Restore state

**Account Management:**
- `.create_account()` - Create new account
- `.create_single_owner_account()` - Create with specific keys
- `.get_predeployed_accounts()` - Get test accounts

**Contract Management:**
- `.declare_contract()` - Declare contract class
- `.deploy_contract()` - Deploy contract instance

[Full Environment API →](./environment.md)

### Middleware API

The `CheatingProvider` extends standard `Provider`:

**Standard Methods:**
- `.block_number()` - Get latest block
- `.get_block_with_tx_hashes()` - Get block data
- `.get_transaction()` - Get transaction
- `.get_storage_at()` - Read storage
- `.get_events()` - Query events

**Testing Methods:**
- `.start_prank()` - Start impersonation
- `.stop_prank()` - Stop impersonation
- `.set_balance()` - Set ETH balance
- `.store()` - Write to storage
- `.load()` - Read from storage
- `.snapshot()` - Save state
- `.revert()` - Restore state

[Full Middleware API →](./middleware.md)

## Error Handling

The core crate uses standard Rust error handling:

```rust
use anyhow::Result;

async fn deploy_contract(env: &Environment) -> Result<ContractAddress> {
    let account = env.create_account().await?;
    let class_hash = env.declare_contract(&account, contract_json).await?;
    let address = env.deploy_contract(&account, class_hash, vec![]).await?;
    Ok(address)
}
```

## Examples

### Complete Testing Example

```rust
use starkbiter_core::environment::Environment;
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;
use starknet::core::types::Felt;
use anyhow::Result;

#[tokio::test]
async fn test_erc20_operations() -> Result<()> {
    // Setup
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941")?)
        .build()
        .await?;
    
    let owner = env.create_account().await?;
    let recipient = env.create_account().await?;
    
    // Deploy token
    let initial_supply = Felt::from(1_000_000u64);
    let token = ERC20::deploy(
        &owner,
        "Test Token",
        "TEST",
        18,
        initial_supply,
        owner.address(),
    ).await?;
    
    // Test balance
    let balance = token.balance_of(owner.address()).await?;
    assert_eq!(balance, initial_supply);
    
    // Test transfer
    let transfer_amount = Felt::from(1000u64);
    token.transfer(recipient.address(), transfer_amount).await?;
    
    let recipient_balance = token.balance_of(recipient.address()).await?;
    assert_eq!(recipient_balance, transfer_amount);
    
    Ok(())
}
```

## Best Practices

### 1. Use Builder Pattern

Always configure environments with the builder:

```rust
let env = Environment::builder()
    .with_chain_id(chain_id)
    .with_block_time(10)
    .build()
    .await?;
```

### 2. Handle Errors Properly

Use `Result` and `?` operator:

```rust
async fn setup_test() -> Result<(Environment, Account)> {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    Ok((env, account))
}
```

### 3. Clean Up Resources

Leverage Rust's ownership for automatic cleanup:

```rust
#[tokio::test]
async fn my_test() -> Result<()> {
    let env = Environment::builder().build().await?;
    // Test code
    Ok(())
} // Environment automatically cleaned up
```

### 4. Use Snapshots for Isolation

```rust
let snapshot = env.snapshot().await?;

for test_case in test_cases {
    env.restore(snapshot).await?;
    run_test_case(&env, test_case).await?;
}
```

## Performance Tips

### Parallel Testing

Run independent tests in parallel:

```rust
#[tokio::test(flavor = "multi_thread")]
async fn parallel_test() {
    // Each test gets its own environment
    // Tests run concurrently
}
```

### Batch Operations

Group related operations:

```rust
use tokio::try_join;

let (balance, nonce, storage) = try_join!(
    env.get_balance(address),
    env.get_nonce(address),
    env.get_storage_at(contract, key),
)?;
```

## Next Steps

- [Environment API](./environment.md) - Detailed environment documentation
- [Middleware API](./middleware.md) - Detailed middleware documentation
- [Examples](../../getting_started/examples.md) - Working code examples
- [Advanced Topics](../../advanced/simulation_techniques.md) - Advanced techniques

