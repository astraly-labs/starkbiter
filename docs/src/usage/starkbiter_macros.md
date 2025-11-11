# Starkbiter Macros

`starkbiter-macros` provides procedural macros to reduce boilerplate and improve ergonomics when building simulations.

## Overview

The macros crate simplifies common patterns:
- Behavior derivation
- Agent configuration
- Event handling
- Message routing

## Installation

```toml
[dependencies]
starkbiter-macros = "0.1"
```

## Available Macros

### `#[behavior]`

Automatically implement the `Behavior` trait:

```rust
use starkbiter_macros::behavior;

#[behavior]
struct MyBehavior {
    counter: u64,
}

// The macro generates the Behavior implementation
impl MyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        self.counter += 1;
        Ok(())
    }
}
```

### `#[agent]`

Configure agent with derive macro:

```rust
use starkbiter_macros::agent;

#[agent(
    id = "trader",
    events = ["Transfer", "Swap"]
)]
struct TradingAgent {
    strategy: Strategy,
}
```

### `#[event_handler]`

Simplify event handling:

```rust
use starkbiter_macros::event_handler;

#[event_handler]
impl MyBehavior {
    #[on_event("Transfer")]
    async fn handle_transfer(&mut self, event: Event) -> Result<()> {
        // Handle transfer event
        Ok(())
    }
    
    #[on_event("Swap")]
    async fn handle_swap(&mut self, event: Event) -> Result<()> {
        // Handle swap event
        Ok(())
    }
}
```

## Usage Examples

### Complete Agent with Macros

```rust
use starkbiter_macros::{behavior, event_handler};
use starkbiter_engine::Behavior;

#[behavior]
#[event_handler]
struct TradingBot {
    position: Position,
    profit: u64,
}

impl TradingBot {
    #[on_event("PriceUpdate")]
    async fn on_price_update(&mut self, event: Event) -> Result<()> {
        let price = parse_price(&event)?;
        self.update_position(price).await?;
        Ok(())
    }
    
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Main execution logic
        self.check_exit_conditions(world).await?;
        Ok(())
    }
}
```

### Configuration Macro

```rust
use starkbiter_macros::config;

#[config]
struct SimConfig {
    #[env]
    chain_id: String,
    
    #[agent]
    trader: TraderConfig,
    
    #[agent]
    liquidator: LiquidatorConfig,
}

// Automatically load from TOML
let config = SimConfig::from_file("config.toml")?;
```

## Benefits

### Reduced Boilerplate

**Without macros:**
```rust
struct MyBehavior;

impl Behavior for MyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Logic
        Ok(())
    }
    
    async fn on_event(&mut self, event: Event) -> Result<()> {
        match event.name.as_str() {
            "Transfer" => self.handle_transfer(event).await?,
            "Swap" => self.handle_swap(event).await?,
            _ => {}
        }
        Ok(())
    }
    
    fn events(&self) -> Vec<EventFilter> {
        vec![
            EventFilter::name("Transfer"),
            EventFilter::name("Swap"),
        ]
    }
}
```

**With macros:**
```rust
#[behavior]
#[event_handler]
struct MyBehavior;

impl MyBehavior {
    #[on_event("Transfer")]
    async fn handle_transfer(&mut self, event: Event) -> Result<()> {
        // Logic
        Ok(())
    }
    
    #[on_event("Swap")]
    async fn handle_swap(&mut self, event: Event) -> Result<()> {
        // Logic
        Ok(())
    }
    
    async fn execute(&mut self, world: &World) -> Result<()> {
        Ok(())
    }
}
```

### Type Safety

Macros provide compile-time checks:

```rust
#[behavior]
struct TypedBehavior {
    #[validate(min = 0, max = 100)]
    percentage: u8,
}

// Compile error if validation fails
```

### Better IDE Support

Macros generate code that IDEs understand, providing better autocomplete and error messages.

## Advanced Usage

### Custom Attributes

```rust
#[behavior(
    name = "MyBehavior",
    description = "A sophisticated trading bot"
)]
struct MyBehavior {
    #[state]
    position: Position,
    
    #[metric]
    profit: u64,
    
    #[config]
    risk_tolerance: f64,
}
```

### Conditional Compilation

```rust
#[behavior]
struct DebugBehavior {
    #[cfg(debug_assertions)]
    debug_info: DebugInfo,
}
```

## Next Steps

- [Starkbiter Core](./starkbiter_core/index.md) - Core functionality
- [Starkbiter Engine](./starkbiter_engine/index.md) - Agent-based simulations
- [Examples](../getting_started/examples.md) - See macros in action

