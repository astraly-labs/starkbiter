# Starkbiter Bindings

`starkbiter-bindings` provides pre-generated Rust bindings for common Starknet contracts, making it easy to interact with standard protocols in your simulations.

## Overview

The bindings crate includes:
- ERC20 token contracts
- Account contracts (Argent, OpenZeppelin)
- DEX protocols (Ekubo)
- Test utilities

## Installation

```toml
[dependencies]
starkbiter-bindings = "0.1"
```

## Available Bindings

### ERC20 Tokens

#### Standard ERC20

```rust
use starkbiter_bindings::erc_20_mintable_oz0::ERC20;
use starknet::core::types::Felt;

// Deploy new token
let token = ERC20::deploy(
    &account,
    "My Token",          // name
    "MTK",              // symbol
    18,                 // decimals
    Felt::from(1_000_000u64),  // initial supply
    owner_address,      // recipient
).await?;

// Transfer tokens
token.transfer(recipient, amount).await?;

// Check balance
let balance = token.balance_of(address).await?;

// Approve spending
token.approve(spender, amount).await?;

// Check allowance
let allowance = token.allowance(owner, spender).await?;
```

### Account Contracts

#### Argent Account

```rust
use starkbiter_bindings::argent_account::ArgentAccount;

let account = ArgentAccount::new(account_address, &provider);

// Execute transaction
account.execute(calls).await?;

// Get account info
let owner = account.get_owner().await?;
```

#### OpenZeppelin Account

```rust
use starkbiter_bindings::open_zeppelin_account::OZAccount;

let account = OZAccount::new(account_address, &provider);
```

### DEX Protocols

#### Ekubo Core

```rust
use starkbiter_bindings::ekubo_core::EkuboCore;

let ekubo = EkuboCore::new(ekubo_address, &account);

// Get pool info
let pool = ekubo.get_pool(token0, token1, fee).await?;

// Swap tokens
ekubo.swap(
    token_in,
    token_out,
    amount,
    min_amount_out,
    recipient
).await?;
```

### Test Contracts

#### Counter

```rust
use starkbiter_bindings::contracts_counter::Counter;

let counter = Counter::deploy(&account).await?;

counter.increment().await?;
let value = counter.get_value().await?;
assert_eq!(value, Felt::from(1u64));
```

#### UserValues

```rust
use starkbiter_bindings::contracts_user_values::UserValues;

let contract = UserValues::deploy(&account).await?;

contract.set_value(key, value).await?;
let retrieved = contract.get_value(key).await?;
```

## Common Patterns

### Deploy and Initialize Token

```rust
async fn setup_token(account: &Account) -> Result<ERC20> {
    let token = ERC20::deploy(
        account,
        "Test Token",
        "TEST",
        18,
        Felt::from(1_000_000_000u64),
        account.address(),
    ).await?;
    
    Ok(token)
}
```

### Transfer Between Accounts

```rust
async fn transfer_tokens(
    token: &ERC20,
    from: &Account,
    to: Felt,
    amount: Felt
) -> Result<()> {
    token.transfer(to, amount).await?;
    Ok(())
}
```

### Approve and Transfer From

```rust
// Owner approves spender
token.approve(spender_address, amount).await?;

// Spender transfers from owner
let spender_token = ERC20::new(token.address(), &spender_account);
spender_token.transfer_from(
    owner_address,
    recipient,
    amount
).await?;
```

## Integration with Simulations

### Token Distribution Agent

```rust
struct TokenDistributor {
    token: ERC20,
    recipients: Vec<Felt>,
}

impl Behavior for TokenDistributor {
    async fn execute(&mut self, world: &World) -> Result<()> {
        let amount = Felt::from(100u64);
        
        for recipient in &self.recipients {
            self.token.transfer(*recipient, amount).await?;
        }
        
        Ok(())
    }
}
```

### DEX Trader Agent

```rust
struct DexTrader {
    ekubo: EkuboCore,
    token_in: Felt,
    token_out: Felt,
}

impl Behavior for DexTrader {
    async fn execute(&mut self, world: &World) -> Result<()> {
        let amount = Felt::from(1000u64);
        
        self.ekubo.swap(
            self.token_in,
            self.token_out,
            amount,
            Felt::ZERO,
            world.account().address()
        ).await?;
        
        Ok(())
    }
}
```

## Creating Custom Bindings

To generate bindings for your own contracts:

1. Compile your Cairo contract to Sierra 1.0
2. Place the JSON file in `contracts/`
3. Run `starkbiter bind`

```bash
# Copy contract
cp target/dev/my_contract.contract_class.json contracts/

# Generate bindings
starkbiter bind

# Use in code
use crate::bindings::my_contract::MyContract;
```

See [Starkbiter CLI](./starkbiter_cli.md) for more details.

## Contract Addresses

The bindings work with any deployment. You specify addresses when creating instances:

```rust
// Use with mainnet deployment
let usdc = ERC20::new(
    Felt::from_hex("0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8")?,
    &account
);

// Or with your own deployment
let token = ERC20::deploy(&account, ...).await?;
let token_address = token.address();
```

## Type Safety

All bindings provide type-safe interfaces:

```rust
// Compile-time type checking
let balance: Felt = token.balance_of(address).await?;

// Method signatures match contract ABI
token.transfer(recipient: Felt, amount: Felt).await?;
```

## Error Handling

```rust
use anyhow::Result;

async fn safe_transfer(token: &ERC20, to: Felt, amount: Felt) -> Result<()> {
    match token.transfer(to, amount).await {
        Ok(_) => {
            println!("Transfer successful");
            Ok(())
        }
        Err(e) => {
            eprintln!("Transfer failed: {}", e);
            Err(e.into())
        }
    }
}
```

## Testing with Bindings

```rust
#[tokio::test]
async fn test_erc20_transfer() {
    let env = Environment::builder().build().await?;
    let account = env.create_account().await?;
    
    // Deploy token
    let token = ERC20::deploy(
        &account,
        "Test",
        "TST",
        18,
        Felt::from(1_000_000u64),
        account.address(),
    ).await?;
    
    // Test transfer
    let recipient = Felt::from(999u64);
    let amount = Felt::from(1000u64);
    
    token.transfer(recipient, amount).await?;
    
    let balance = token.balance_of(recipient).await?;
    assert_eq!(balance, amount);
}
```

## Next Steps

- [Starkbiter CLI](./starkbiter_cli.md) - Generate custom bindings
- [Quick Start](../getting_started/quick_start.md) - Use bindings in simulations
- [Examples](../getting_started/examples.md) - See bindings in action

