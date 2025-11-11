# Forking

Forking allows you to create a local simulation based on the state of a live Starknet network. This is incredibly powerful for testing against real mainnet/testnet conditions without spending real tokens.

## Overview

When you fork a network, Starkbiter:
1. Connects to a live Starknet RPC endpoint
2. Fetches state lazily (only when needed)
3. Stores state locally for fast access
4. Allows you to make local modifications without affecting the real network

## Basic Forking

### Fork from Mainnet

```rust
use starkbiter_core::environment::Environment;
use starknet::core::types::Felt;
use url::Url;
use std::str::FromStr;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex("0x534e5f4d41494e")?)  // Mainnet
        .with_fork(
            Url::from_str("https://starknet-mainnet.public.blastapi.io")?,
            100000,  // Block number to fork from
            None,    // Optional: block hash for verification
        )
        .build()
        .await?;
    
    // Now you have mainnet state locally!
    let block = env.get_block_number().await?;
    println!("Forked at block: {}", block);
    
    Ok(())
}
```

### Fork from Sepolia

```rust
let env = Environment::builder()
    .with_chain_id(Felt::from_hex("0x534e5f5345504f4c4941")?)
    .with_fork(
        Url::from_str("https://starknet-sepolia.public.blastapi.io")?,
        50000,
        None,
    )
    .build()
    .await?;
```

## Configuration

### Block Selection

You can fork from any block:

```rust
// Fork from latest block (use a very high number)
.with_fork(rpc_url, u64::MAX, None)

// Fork from specific block
.with_fork(rpc_url, 123456, None)

// Fork with block hash verification
.with_fork(
    rpc_url,
    123456,
    Some(Felt::from_hex("0xblock_hash")?),
)
```

### RPC Endpoints

Popular Starknet RPC providers:

```rust
// Public endpoints
const MAINNET: &str = "https://starknet-mainnet.public.blastapi.io";
const SEPOLIA: &str = "https://starknet-sepolia.public.blastapi.io";

// Alchemy
const ALCHEMY: &str = "https://starknet-mainnet.g.alchemy.com/v2/YOUR_API_KEY";

// Infura
const INFURA: &str = "https://starknet-mainnet.infura.io/v3/YOUR_PROJECT_ID";
```

## Use Cases

### Testing Against Real Protocols

```rust
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;

// Fork mainnet
let env = Environment::builder()
    .with_fork(mainnet_url, block_num, None)
    .build()
    .await?;

// Interact with real USDC contract
let usdc_address = Felt::from_hex("0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8")?;
let account = env.create_account().await?;
let usdc = ERC20::new(usdc_address, &account);

// Read real state
let total_supply = usdc.total_supply().await?;
println!("USDC total supply: {}", total_supply);
```

### Debugging Transactions

```rust
// Fork at the block before an issue occurred
let env = Environment::builder()
    .with_fork(mainnet_url, problem_block - 1, None)
    .build()
    .await?;

// Reproduce the issue locally
let tx_result = reproduce_issue(&env).await?;

// Debug with full control
env.increase_time(1).await?;
let next_result = try_fix(&env).await?;
```

### Strategy Backtesting

```rust
// Fork from historical block
let env = Environment::builder()
    .with_fork(mainnet_url, historical_block, None)
    .build()
    .await?;

// Run your strategy against real historical state
let profit = run_strategy(&env).await?;
println!("Strategy would have made: {}", profit);
```

### Protocol Integration Testing

```rust
// Test your protocol against real DEX
let env = Environment::builder()
    .with_fork(mainnet_url, latest_block, None)
    .build()
    .await?;

// Deploy your protocol
let my_contract = deploy_my_protocol(&env).await?;

// Test integration with real Jediswap/10k swap/Ekubo
let result = test_swap_integration(&env, my_contract).await?;
```

## Lazy State Loading

Starkbiter loads state lazily for efficiency:

```rust
// Fork is created
let env = Environment::builder()
    .with_fork(url, block, None)
    .build()
    .await?;

// State is fetched only when accessed
let balance = env.get_balance(address).await?;  // Fetches balance
let storage = env.get_storage_at(contract, key).await?;  // Fetches storage

// Subsequent accesses use cached state
let balance2 = env.get_balance(address).await?;  // Uses cache
```

## Local Modifications

Changes you make are local and don't affect the real network:

```rust
// Fork mainnet
let env = Environment::builder()
    .with_fork(mainnet_url, block, None)
    .build()
    .await?;

let account = env.create_account().await?;

// Modify state locally
env.set_balance(account.address(), Felt::from(1_000_000u64)).await?;

// Deploy contracts
let my_contract = deploy_contract(&account).await?;

// Make transactions
my_contract.do_something().await?;

// All changes are local - mainnet is unaffected!
```

## Impersonation in Forks

Interact with contracts as if you were any address:

```rust
// Fork mainnet
let env = Environment::builder()
    .with_fork(mainnet_url, block, None)
    .build()
    .await?;

// Impersonate a whale address
let whale = Felt::from_hex("0xwhale_address")?;
env.start_prank(contract_address, whale).await?;

// Make calls as the whale
let contract = Token::new(token_address, &env);
contract.transfer(my_address, large_amount).await?;

env.stop_prank(contract_address).await?;
```

## Snapshot and Restore with Forks

Combine forking with snapshots for powerful testing:

```rust
// Fork mainnet
let env = Environment::builder()
    .with_fork(mainnet_url, block, None)
    .build()
    .await?;

// Take snapshot of forked state
let snapshot = env.snapshot().await?;

// Test scenario 1
test_scenario_1(&env).await?;

// Restore forked state
env.restore(snapshot).await?;

// Test scenario 2 with same starting state
test_scenario_2(&env).await?;
```

## Performance Considerations

### Network Latency

State fetching requires network calls:

```rust
// First access: slow (network fetch)
let balance = env.get_balance(address).await?;

// Subsequent accesses: fast (cached)
let balance2 = env.get_balance(address).await?;
```

### Batch Queries

Optimize by batching related operations:

```rust
// Instead of sequential queries
let balance1 = env.get_balance(addr1).await?;
let balance2 = env.get_balance(addr2).await?;

// Use concurrent queries
use tokio::try_join;
let (balance1, balance2) = try_join!(
    env.get_balance(addr1),
    env.get_balance(addr2),
)?;
```

### Persistent Caching

Consider caching fork state for repeated runs:

```rust
// Future enhancement (not yet implemented)
let env = Environment::builder()
    .with_fork(url, block, None)
    .with_cache_dir("./fork_cache")
    .build()
    .await?;
```

## Limitations

### Active Connection Required

Forking requires the RPC endpoint to remain available:

```rust
// ❌ This will fail if RPC goes down
let env = Environment::builder()
    .with_fork(unreliable_url, block, None)
    .build()
    .await?;

// First access works
let state1 = env.get_storage_at(addr, key).await?;

// If RPC goes down, subsequent fetches fail
let state2 = env.get_storage_at(other_addr, key).await?;  // Error!
```

### State Consistency

Forked state is point-in-time:

```rust
// Fork at block 100000
let env = Environment::builder()
    .with_fork(url, 100000, None)
    .build()
    .await?;

// State is frozen at block 100000
// Real network has moved on
// Your fork doesn't see newer transactions
```

### Block Hash Verification

If provided, block hash must match:

```rust
// This will fail if block hash doesn't match block number
let env = Environment::builder()
    .with_fork(
        url,
        123456,
        Some(wrong_block_hash),  // ❌ Error!
    )
    .build()
    .await?;
```

## Best Practices

### 1. Use Recent Blocks

```rust
// Good: Recent block, less likely to be pruned
.with_fork(url, recent_block, None)

// Risky: Very old block might be pruned by RPC
.with_fork(url, very_old_block, None)
```

### 2. Verify Block Hash for Critical Tests

```rust
// For production testing, verify block hash
.with_fork(
    url,
    critical_block,
    Some(verified_block_hash),
)
```

### 3. Handle Network Errors

```rust
let env = match Environment::builder()
    .with_fork(url, block, None)
    .build()
    .await
{
    Ok(env) => env,
    Err(e) => {
        eprintln!("Failed to fork: {}", e);
        // Fallback to non-forked environment
        Environment::builder().build().await?
    }
};
```

### 4. Use Local Snapshots

```rust
// After forking, take snapshot for fast resets
let snapshot = env.snapshot().await?;

for test in tests {
    env.restore(snapshot).await?;
    test.run(&env).await?;
}
```

## Troubleshooting

### Fork Fails to Connect

```
Error: Failed to connect to RPC endpoint
```

**Solutions:**
- Check RPC URL is correct
- Verify network connectivity
- Try a different RPC provider
- Check if the endpoint requires API key

### Block Not Found

```
Error: Block not found
```

**Solutions:**
- Verify block number exists
- Check if block is too old (pruned)
- Try a more recent block
- Use an archive node for historical blocks

### State Loading Timeout

```
Error: Timeout fetching state
```

**Solutions:**
- Increase timeout duration
- Use a faster RPC provider
- Pre-warm cache by accessing state upfront

## Next Steps

- [Environment](./environment.md) - Deep dive into Environment API
- [Middleware](./middleware.md) - Understanding the middleware layer
- [Advanced Topics](../advanced/simulation_techniques.md) - Advanced simulation techniques

