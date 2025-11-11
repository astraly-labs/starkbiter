# Environment

The `Environment` is the core abstraction in Starkbiter, representing a sandboxed Starknet instance. It provides complete control over blockchain state, block production, and contract interaction.

## Overview

An `Environment` wraps a Starknet Devnet instance, giving you:
- Full JSON-RPC capabilities
- Additional testing methods (cheating methods)
- State management and control
- Account creation and management

Think of it as your personal Starknet network that you have complete control over.

## Creating an Environment

### Basic Setup

```rust
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941")?)
        .build()
        .await?;
    
    println!("Environment ready!");
    Ok(())
}
```

### Builder Pattern

The `EnvironmentBuilder` provides a fluent API for configuration:

```rust
let env = Environment::builder()
    .with_chain_id(chain_id)
    .with_gas_price(100_000_000_000)  // 100 gwei
    .with_block_time(10)               // 10 seconds per block
    .build()
    .await?;
```

## Configuration Options

### Chain ID

Specify which network to simulate:

```rust
// Starknet Mainnet
let mainnet_id = Felt::from_hex("0x534e5f4d41494e")?;

// Starknet Sepolia Testnet
let sepolia_id = Felt::from_hex("0x534e5f5345504f4c4941")?;

let env = Environment::builder()
    .with_chain_id(sepolia_id)
    .build()
    .await?;
```

### Block Time

Control block production:

```rust
// Automatic block production every 5 seconds
let env = Environment::builder()
    .with_block_time(5)
    .build()
    .await?;

// Manual block production
let env = Environment::builder()
    .with_block_time(0)  // 0 = manual mode
    .build()
    .await?;
```

### Gas Configuration

Set gas prices:

```rust
let env = Environment::builder()
    .with_gas_price(50_000_000_000)  // 50 gwei
    .build()
    .await?;
```

## State Management

### Block Production

Control when blocks are produced:

```rust
// Manual block production
env.mine_block().await?;

// Mine multiple blocks
env.mine_blocks(10).await?;

// Get current block number
let block_num = env.get_block_number().await?;
println!("Current block: {}", block_num);
```

### Time Manipulation

Control blockchain time:

```rust
// Increase time by 1 hour
env.increase_time(3600).await?;

// Set specific timestamp
env.set_timestamp(1234567890).await?;

// Get current timestamp
let timestamp = env.get_timestamp().await?;
```

### State Snapshots

Save and restore state:

```rust
// Take a snapshot
let snapshot_id = env.snapshot().await?;

// Make some changes
contract.do_something().await?;

// Restore to snapshot
env.restore(snapshot_id).await?;
```

## Account Management

### Creating Accounts

```rust
use starknet::core::types::Felt;

// Create with random keys
let account = env.create_account().await?;

// Create with specific keys
let private_key = Felt::from_hex("0x123...")? ;
let account_address = Felt::from_hex("0x456...")?;

let account = env.create_single_owner_account(
    private_key,
    account_address
).await?;
```

### Predeployed Accounts

Devnet comes with predeployed accounts for testing:

```rust
// Get predeployed accounts
let accounts = env.get_predeployed_accounts().await?;

for account in accounts {
    println!("Address: {:#x}", account.address);
    println!("Private Key: {:#x}", account.private_key);
}
```

## Contract Management

### Declaring Contracts

Before deploying, contracts must be declared:

```rust
use std::fs;

// Read contract JSON
let contract_json = fs::read_to_string("path/to/contract.json")?;

// Declare the contract
let class_hash = env.declare_contract(
    &account,
    contract_json
).await?;

println!("Contract declared: {:#x}", class_hash);
```

### Deploying Contracts

```rust
use starknet::core::types::Felt;

// Deploy with constructor args
let constructor_args = vec![
    Felt::from(1000u64),  // Initial supply
    Felt::from_hex("0x...")?,  // Owner address
];

let contract_address = env.deploy_contract(
    &account,
    class_hash,
    constructor_args
).await?;

println!("Contract deployed at: {:#x}", contract_address);
```

### Using Bindings

With `cainome`-generated bindings:

```rust
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;

// Deploy using binding
let erc20 = ERC20::deploy(
    &account,
    name,
    symbol,
    decimals,
    initial_supply,
    recipient
).await?;

// Interact with contract
let balance = erc20.balance_of(address).await?;
```

## Querying State

### Block Information

```rust
// Get latest block
let block = env.get_block_latest().await?;
println!("Block number: {}", block.block_number);
println!("Timestamp: {}", block.timestamp);

// Get specific block
let block = env.get_block_by_number(100).await?;
```

### Transaction Information

```rust
// Get transaction by hash
let tx = env.get_transaction(tx_hash).await?;

// Get transaction receipt
let receipt = env.get_transaction_receipt(tx_hash).await?;

// Get transaction status
let status = env.get_transaction_status(tx_hash).await?;
```

### Contract State

```rust
// Get contract storage
let storage_value = env.get_storage_at(
    contract_address,
    storage_key
).await?;

// Get contract nonce
let nonce = env.get_nonce(contract_address).await?;

// Get contract class
let contract_class = env.get_class_at(contract_address).await?;
```

## Event Handling

### Polling for Events

```rust
// Get events from latest block
let events = env.get_events(
    from_block,
    to_block,
    contract_address,
    keys
).await?;

for event in events {
    println!("Event: {:?}", event);
}
```

### Event Filtering

```rust
use starknet::core::types::EventFilter;

let filter = EventFilter {
    from_block: Some(0),
    to_block: Some(100),
    address: Some(contract_address),
    keys: Some(vec![event_key]),
};

let events = env.get_events_filtered(filter).await?;
```

## Forking

Fork from live networks:

```rust
use url::Url;
use std::str::FromStr;

let env = Environment::builder()
    .with_chain_id(mainnet_id)
    .with_fork(
        Url::from_str("https://starknet-mainnet.public.blastapi.io")?,
        12345,  // Block number
        Some(Felt::from_hex("0xblock_hash")?),
    )
    .build()
    .await?;
```

See [Forking](./forking.md) for more details.

## Cheating Methods

Starkbiter provides additional testing methods:

### Impersonation

```rust
// Impersonate an address
env.start_prank(target_address, impersonator_address).await?;

// Make calls as the impersonator
contract.privileged_function().await?;

// Stop impersonating
env.stop_prank(target_address).await?;
```

### Balance Manipulation

```rust
// Set ETH balance
env.set_balance(address, amount).await?;

// Get balance
let balance = env.get_balance(address).await?;
```

### Storage Manipulation

```rust
// Write directly to storage
env.store(
    contract_address,
    storage_key,
    value
).await?;

// Load from storage
let value = env.load(contract_address, storage_key).await?;
```

## Cleanup and Shutdown

Environments are automatically cleaned up when dropped:

```rust
{
    let env = Environment::builder().build().await?;
    // Use env
} // env is dropped, resources cleaned up
```

Explicit shutdown:

```rust
env.shutdown().await?;
```

## Best Practices

### 1. Use Builder Pattern

Always use the builder for consistent configuration:

```rust
let env = Environment::builder()
    .with_chain_id(chain_id)
    .build()
    .await?;
```

### 2. Error Handling

Always handle environment errors:

```rust
match env.get_block_number().await {
    Ok(block) => println!("Block: {}", block),
    Err(e) => eprintln!("Error: {}", e),
}
```

### 3. Resource Management

Create environments in appropriate scopes:

```rust
#[tokio::test]
async fn test_contract() -> Result<()> {
    let env = Environment::builder().build().await?;
    // Test code
    Ok(())
} // Environment cleaned up automatically
```

### 4. Snapshots for Testing

Use snapshots to isolate test cases:

```rust
let snapshot = env.snapshot().await?;

// Test case 1
run_test_1(&env).await?;
env.restore(snapshot).await?;

// Test case 2  
run_test_2(&env).await?;
env.restore(snapshot).await?;
```

## Common Patterns

### Deploy and Initialize

```rust
async fn deploy_and_initialize(env: &Environment) -> Result<ContractAddress> {
    let account = env.create_account().await?;
    
    // Declare
    let class_hash = env.declare_contract(&account, contract_json).await?;
    
    // Deploy
    let address = env.deploy_contract(&account, class_hash, vec![]).await?;
    
    // Initialize
    let contract = MyContract::new(address, &account);
    contract.initialize().await?;
    
    Ok(address)
}
```

### Time-Based Testing

```rust
async fn test_time_lock(env: &Environment) -> Result<()> {
    let contract = deploy_timelock(&env).await?;
    
    // Try before time lock expires (should fail)
    assert!(contract.withdraw().await.is_err());
    
    // Fast forward
    env.increase_time(86400).await?;  // +24 hours
    env.mine_block().await?;
    
    // Now should succeed
    contract.withdraw().await?;
    
    Ok(())
}
```

## Next Steps

- [Middleware](./middleware.md) - Understanding the middleware layer
- [Forking](./forking.md) - State forking from live networks
- [Usage Guide](../usage/starkbiter_core/index.md) - Detailed API reference

