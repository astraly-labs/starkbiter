# Testing Strategies

This chapter covers advanced testing strategies for smart contracts and DeFi protocols using Starkbiter.

## Unit Testing

Test individual contract functions in isolation.

```rust
#[tokio::test]
async fn test_token_transfer() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    let token = deploy_token(&account).await?;
    let recipient = Felt::from(999u64);
    let amount = Felt::from(1000u64);
    
    token.transfer(recipient, amount).await?;
    
    let balance = token.balance_of(recipient).await?;
    assert_eq!(balance, amount);
}
```

## Integration Testing

Test interactions between multiple contracts.

```rust
#[tokio::test]
async fn test_swap_integration() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    // Deploy all components
    let token_a = deploy_token(&account, "TokenA").await?;
    let token_b = deploy_token(&account, "TokenB").await?;
    let pool = deploy_pool(&account, token_a.address(), token_b.address()).await?;
    let router = deploy_router(&account, pool.address()).await?;
    
    // Test the full flow
    token_a.approve(router.address(), amount).await?;
    router.swap(token_a.address(), token_b.address(), amount).await?;
    
    // Verify results
    let balance_b = token_b.balance_of(account.address()).await?;
    assert!(balance_b > Felt::ZERO);
}
```

## Fuzzing

Test with random inputs to find edge cases.

```rust
use proptest::prelude::*;

#[tokio::test]
async fn fuzz_token_operations() {
    proptest!(|(amount in 1u64..1_000_000u64)| {
        tokio_test::block_on(async {
            let env = Environment::builder().build().await.unwrap();
            let account = env.create_account().await.unwrap();
            let token = deploy_token(&account).await.unwrap();
            
            // Should never panic
            let _ = token.transfer(recipient, Felt::from(amount)).await;
        });
    });
}
```

## Invariant Testing

Test that certain properties always hold.

```rust
#[tokio::test]
async fn test_total_supply_invariant() {
    let env = Environment::builder().build().await?;
    let account1 = env.create_account().await?;
    let account2 = env.create_account().await?;
    
    let token = deploy_token(&account1).await?;
    let initial_supply = token.total_supply().await?;
    
    // Perform many operations
    for _ in 0..100 {
        token.transfer(account2.address(), Felt::from(100u64)).await?;
    }
    
    // Invariant: total supply never changes
    let final_supply = token.total_supply().await?;
    assert_eq!(initial_supply, final_supply);
}
```

## Time-Based Testing

Test time-dependent behavior.

```rust
#[tokio::test]
async fn test_timelock() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    let timelock = deploy_timelock(&account, 86400).await?; // 24 hours
    
    // Should fail before timelock
    assert!(timelock.withdraw().await.is_err());
    
    // Fast forward
    env.increase_time(86400).await?;
    env.mine_block().await?;
    
    // Should succeed after timelock
    assert!(timelock.withdraw().await.is_ok());
}
```

## Snapshot Testing

Use snapshots to test multiple scenarios from the same starting state.

```rust
#[tokio::test]
async fn test_multiple_scenarios() {
    let env = Environment::builder().build().await?;
    let (token, pool) = setup_defi_protocol(&env).await?;
    
    // Take snapshot
    let snapshot = env.snapshot().await?;
    
    // Test scenario 1: Normal usage
    test_normal_usage(&env, &pool).await?;
    env.restore(snapshot).await?;
    
    // Test scenario 2: Extreme volatility
    test_high_volatility(&env, &pool).await?;
    env.restore(snapshot).await?;
    
    // Test scenario 3: Attack
    test_flash_loan_attack(&env, &pool).await?;
}
```

## Stress Testing

Test protocol under extreme conditions.

```rust
#[tokio::test]
async fn stress_test_lending_protocol() {
    let env = Environment::builder().build().await?;
    let protocol = deploy_lending_protocol(&env).await?;
    
    // Simulate high load
    let mut handles = vec![];
    for i in 0..100 {
        let env = env.clone();
        let protocol = protocol.clone();
        
        handles.push(tokio::spawn(async move {
            let account = env.create_account().await.unwrap();
            protocol.borrow(&account, amount).await
        }));
    }
    
    // Wait for all operations
    for handle in handles {
        handle.await.unwrap()?;
    }
    
    // Protocol should still be solvent
    assert!(protocol.is_solvent().await?);
}
```

## Next Steps

- [Simulation Techniques](./simulation_techniques.md) - Advanced simulation patterns
- [Anomaly Detection](./anomaly_detection.md) - Detecting unusual behavior
- [Performance Optimization](./performance.md) - Optimizing your tests

