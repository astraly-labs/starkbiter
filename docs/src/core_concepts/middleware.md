# Middleware

The middleware layer in Starkbiter provides a familiar interface for interacting with Starknet contracts, compatible with the `starknet-rs` ecosystem. This chapter explains how middleware works and how to use it effectively.

## Overview

Starkbiter's middleware implements the standard `Provider` trait from `starknet-rs`, extended with additional "cheating" methods for testing. This means:

- **Familiar API**: If you know `starknet-rs`, you know Starkbiter
- **Seamless Integration**: Works with `cainome` bindings and other tooling
- **Extended Capabilities**: Additional methods for testing scenarios

## The CheatingProvider

The `CheatingProvider` is the main middleware implementation in Starkbiter.

```rust
use starkbiter_core::middleware::CheatingProvider;

// Access through environment
let provider = env.provider();

// Use standard Provider methods
let block_number = provider.block_number().await?;
let block = provider.get_block_with_tx_hashes(block_number).await?;
```

## Standard Provider Methods

### Block Queries

```rust
use starknet::providers::Provider;

// Get latest block number
let block_num = provider.block_number().await?;

// Get block by number
let block = provider.get_block_with_tx_hashes(block_num).await?;

// Get block by hash
let block = provider.get_block_with_tx_hashes_by_hash(block_hash).await?;
```

### Transaction Queries

```rust
// Get transaction by hash
let tx = provider.get_transaction_by_hash(tx_hash).await?;

// Get transaction receipt
let receipt = provider.get_transaction_receipt(tx_hash).await?;

// Get transaction status
let status = provider.get_transaction_status(tx_hash).await?;
```

### State Queries

```rust
// Get storage at address
let value = provider.get_storage_at(
    contract_address,
    key,
    block_id
).await?;

// Get nonce
let nonce = provider.get_nonce(
    block_id,
    contract_address
).await?;

// Get class hash at contract
let class_hash = provider.get_class_hash_at(
    block_id,
    contract_address
).await?;
```

### Contract Class Queries

```rust
// Get class
let class = provider.get_class(
    block_id,
    class_hash
).await?;

// Get class at contract address
let class = provider.get_class_at(
    block_id,
    contract_address
).await?;
```

### Event Queries

```rust
use starknet::core::types::{EventFilter, EventsPage};

let filter = EventFilter {
    from_block: Some(BlockId::Number(0)),
    to_block: Some(BlockId::Number(100)),
    address: Some(contract_address),
    keys: None,
};

let events: EventsPage = provider.get_events(
    filter,
    None,  // continuation_token
    100,   // chunk_size
).await?;
```

## Cheating Methods

Beyond standard Provider methods, `CheatingProvider` offers testing-specific capabilities.

### Time Manipulation

```rust
// Get current timestamp
let timestamp = provider.get_timestamp().await?;

// Set specific timestamp
provider.set_timestamp(new_timestamp).await?;

// Increase time
provider.increase_time(seconds).await?;
```

### Block Manipulation

```rust
// Mine a single block
provider.mine_block().await?;

// Mine multiple blocks
provider.mine_blocks(count).await?;

// Set block interval
provider.set_block_interval(seconds).await?;
```

### Account Impersonation

```rust
// Start impersonating an address
provider.start_prank(target_contract, impersonator).await?;

// Make calls as the impersonator
// All calls to target_contract will appear to come from impersonator

// Stop impersonating
provider.stop_prank(target_contract).await?;
```

### Balance Manipulation

```rust
// Set ETH balance
provider.set_balance(address, amount).await?;

// Deal tokens (if supported)
provider.deal(token_address, recipient, amount).await?;
```

### Storage Manipulation

```rust
// Write to storage
provider.store(
    contract_address,
    storage_key,
    value
).await?;

// Read from storage
let value = provider.load(
    contract_address,
    storage_key
).await?;
```

### Snapshots

```rust
// Create snapshot
let snapshot_id = provider.snapshot().await?;

// Make changes...
contract.modify_state().await?;

// Restore to snapshot
provider.revert(snapshot_id).await?;
```

## Using with Accounts

The middleware integrates seamlessly with Starknet accounts.

### Account Creation

```rust
use starknet::accounts::{Account, SingleOwnerAccount};
use starknet::signers::LocalWallet;

// Create wallet
let signer = LocalWallet::from(private_key);

// Create account with the provider
let account = SingleOwnerAccount::new(
    provider.clone(),
    signer,
    account_address,
    chain_id,
);
```

### Signing Transactions

```rust
use starknet::accounts::Call;

// Prepare call
let call = Call {
    to: contract_address,
    selector: get_selector_from_name("transfer")?,
    calldata: vec![recipient, amount_low, amount_high],
};

// Execute through account
let result = account.execute(vec![call]).send().await?;
```

## Using with Contract Bindings

The middleware works seamlessly with `cainome`-generated bindings.

### Reading from Contracts

```rust
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;

// Create contract instance
let token = ERC20::new(token_address, &account);

// Read state (calls Provider methods)
let balance = token.balance_of(address).await?;
let total_supply = token.total_supply().await?;
```

### Writing to Contracts

```rust
// Prepare transaction
let tx = token.transfer(recipient, amount);

// Execute (uses Account methods)
let result = tx.send().await?;

// Wait for confirmation
let receipt = result.wait_for_acceptance().await?;
```

## Connection Management

The middleware manages the underlying connection to Devnet.

### Connection Configuration

```rust
use starkbiter_core::middleware::Connection;

// Default configuration (automatic)
let connection = Connection::new()?;

// Custom port
let connection = Connection::with_port(5050)?;

// Custom URL
let connection = Connection::with_url("http://localhost:5050")?;
```

### Health Checks

```rust
// Check if Devnet is responsive
if provider.is_alive().await? {
    println!("Devnet is running");
}
```

## Error Handling

The middleware uses standard Starknet error types.

### Common Errors

```rust
use starknet::providers::ProviderError;

match provider.get_block_with_tx_hashes(1000000).await {
    Ok(block) => {
        // Process block
    }
    Err(ProviderError::StarknetError(e)) => {
        // Starknet-specific error
        eprintln!("Starknet error: {:?}", e);
    }
    Err(e) => {
        // Other errors
        eprintln!("Provider error: {:?}", e);
    }
}
```

### Best Practices

```rust
// Use Result types
async fn get_balance(
    provider: &CheatingProvider,
    address: Felt,
) -> Result<Felt> {
    let balance = provider.get_balance(address).await?;
    Ok(balance)
}

// Handle specific error cases
async fn safe_get_block(
    provider: &CheatingProvider,
    block_num: u64,
) -> Option<Block> {
    match provider.get_block_with_tx_hashes(block_num).await {
        Ok(block) => Some(block),
        Err(e) => {
            log::warn!("Failed to get block {}: {}", block_num, e);
            None
        }
    }
}
```

## Advanced Patterns

### Concurrent Requests

```rust
use tokio::try_join;

// Execute multiple queries in parallel
let (balance, nonce, block) = try_join!(
    provider.get_balance(address),
    provider.get_nonce(BlockId::Pending, address),
    provider.block_number(),
)?;
```

### Retry Logic

```rust
use tokio::time::{sleep, Duration};

async fn get_receipt_with_retry(
    provider: &CheatingProvider,
    tx_hash: Felt,
    max_retries: u32,
) -> Result<TransactionReceipt> {
    for attempt in 0..max_retries {
        match provider.get_transaction_receipt(tx_hash).await {
            Ok(receipt) => return Ok(receipt),
            Err(e) if attempt < max_retries - 1 => {
                sleep(Duration::from_millis(100)).await;
                continue;
            }
            Err(e) => return Err(e.into()),
        }
    }
    unreachable!()
}
```

### Polling for Events

```rust
async fn watch_for_event(
    provider: &CheatingProvider,
    contract: Felt,
    event_key: Felt,
) -> Result<Event> {
    let mut last_block = provider.block_number().await?;
    
    loop {
        let current_block = provider.block_number().await?;
        
        if current_block > last_block {
            let events = provider.get_events(
                EventFilter {
                    from_block: Some(BlockId::Number(last_block + 1)),
                    to_block: Some(BlockId::Number(current_block)),
                    address: Some(contract),
                    keys: Some(vec![vec![event_key]]),
                },
                None,
                100,
            ).await?;
            
            if let Some(event) = events.events.first() {
                return Ok(event.clone());
            }
            
            last_block = current_block;
        }
        
        sleep(Duration::from_millis(100)).await;
    }
}
```

## Testing with Middleware

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    use starkbiter_core::environment::Environment;

    #[tokio::test]
    async fn test_provider_queries() {
        let env = Environment::builder().build().await.unwrap();
        let provider = env.provider();
        
        let block_num = provider.block_number().await.unwrap();
        assert_eq!(block_num, 0);
    }
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_contract_interaction() {
    let env = Environment::builder().build().await?;
    let provider = env.provider();
    let account = env.create_account().await?;
    
    // Deploy contract
    let contract = deploy_test_contract(&account).await?;
    
    // Interact through provider
    let call = Call {
        to: contract.address,
        selector: get_selector_from_name("set_value")?,
        calldata: vec![Felt::from(42u64)],
    };
    
    account.execute(vec![call]).send().await?;
    
    // Verify
    let value = contract.get_value().await?;
    assert_eq!(value, Felt::from(42u64));
}
```

## Next Steps

- [Environment](./environment.md) - Deep dive into Environment
- [Forking](./forking.md) - State forking from live networks
- [Usage Guide](../usage/starkbiter_core/middleware.md) - Detailed middleware API

