# Behaviors

Behaviors define what agents do in a simulation. They are the core logic that determines how agents interact with the blockchain, respond to events, and communicate with other agents.

## Overview

A Behavior is a trait that defines:
- How an agent initializes
- How it responds to events
- How it executes periodic actions
- How it processes messages

## The Behavior Trait

```rust
pub trait Behavior: Send + Sync {
    /// Initialize the behavior
    async fn init(&mut self, world: &World) -> Result<()> {
        Ok(())
    }
    
    /// Main execution logic
    async fn execute(&mut self, world: &World) -> Result<()>;
    
    /// Handle blockchain events
    async fn on_event(&mut self, event: Event) -> Result<()> {
        Ok(())
    }
    
    /// Handle messages from other agents
    async fn on_message(&mut self, message: Message) -> Result<()> {
        Ok(())
    }
    
    /// Define which events to subscribe to
    fn events(&self) -> Vec<EventFilter> {
        vec![]
    }
}
```

## Creating Behaviors

### Simple Behavior

```rust
struct SimpleBehavior {
    counter: u64,
}

impl Behavior for SimpleBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        self.counter += 1;
        println!("Executed {} times", self.counter);
        Ok(())
    }
}
```

### Event-Driven Behavior

```rust
struct EventDrivenBehavior {
    contract_address: Felt,
}

impl Behavior for EventDrivenBehavior {
    fn events(&self) -> Vec<EventFilter> {
        vec![
            EventFilter::contract_event(self.contract_address, "Transfer"),
        ]
    }
    
    async fn on_event(&mut self, event: Event) -> Result<()> {
        match event.name.as_str() {
            "Transfer" => self.handle_transfer(event).await?,
            _ => {}
        }
        Ok(())
    }
}
```

### Stateful Behavior

```rust
struct StatefulBehavior {
    state: AgentState,
    history: Vec<Action>,
}

impl Behavior for StatefulBehavior {
    async fn init(&mut self, world: &World) -> Result<()> {
        self.state = self.load_initial_state(world).await?;
        Ok(())
    }
    
    async fn execute(&mut self, world: &World) -> Result<()> {
        let action = self.state.decide_next_action(world).await?;
        self.history.push(action.clone());
        self.execute_action(action, world).await?;
        Ok(())
    }
}
```

## Behavior Patterns

### The Trading Bot

```rust
struct TradingBotBehavior {
    strategy: Box<dyn TradingStrategy>,
    portfolio: Portfolio,
}

impl Behavior for TradingBotBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Get market data
        let prices = self.fetch_prices(world).await?;
        
        // Generate signal
        let signal = self.strategy.analyze(&prices, &self.portfolio).await?;
        
        // Execute if signal is strong enough
        if signal.strength > 0.8 {
            self.execute_trade(world, signal.trade).await?;
        }
        
        Ok(())
    }
}
```

### The Liquidator

```rust
struct LiquidatorBehavior {
    lending_protocol: ContractAddress,
    min_profit: u64,
}

impl Behavior for LiquidatorBehavior {
    fn events(&self) -> Vec<EventFilter> {
        vec![
            EventFilter::contract_event(self.lending_protocol, "Borrow"),
            EventFilter::contract_event(self.lending_protocol, "PriceUpdate"),
        ]
    }
    
    async fn on_event(&mut self, event: Event) -> Result<()> {
        // Check for liquidation opportunities
        let positions = self.get_unhealthy_positions(event).await?;
        
        for position in positions {
            if let Some(profit) = self.calculate_profit(&position).await? {
                if profit > self.min_profit {
                    self.liquidate(position).await?;
                }
            }
        }
        
        Ok(())
    }
}
```

### The Market Maker

```rust
struct MarketMakerBehavior {
    pool: ContractAddress,
    spread: f64,
    inventory: Inventory,
}

impl Behavior for MarketMakerBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Update quotes
        let mid_price = self.get_mid_price(world).await?;
        let bid = mid_price * (1.0 - self.spread);
        let ask = mid_price * (1.0 + self.spread);
        
        // Place orders
        self.place_limit_order(world, Side::Buy, bid).await?;
        self.place_limit_order(world, Side::Sell, ask).await?;
        
        // Rebalance inventory
        self.rebalance_if_needed(world).await?;
        
        Ok(())
    }
}
```

### The Oracle

```rust
struct OracleBehavior {
    price_feeds: Vec<PriceFeed>,
}

impl Behavior for OracleBehavior {
    async fn on_message(&mut self, msg: Message) -> Result<()> {
        match msg {
            Message::PriceRequest { asset } => {
                let price = self.fetch_price(&asset).await?;
                self.respond(Message::PriceResponse { asset, price }).await?;
            }
            _ => {}
        }
        Ok(())
    }
    
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Periodically update prices
        for feed in &self.price_feeds {
            let price = feed.fetch_latest().await?;
            world.broadcast(Message::PriceUpdate {
                asset: feed.asset.clone(),
                price,
            }).await?;
        }
        Ok(())
    }
}
```

## Composing Behaviors

### Behavior Composition

Combine multiple behaviors:

```rust
struct ComposedBehavior {
    monitor: MonitoringBehavior,
    executor: ExecutionBehavior,
    reporter: ReportingBehavior,
}

impl Behavior for ComposedBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Execute in sequence
        self.monitor.execute(world).await?;
        self.executor.execute(world).await?;
        self.reporter.execute(world).await?;
        Ok(())
    }
}
```

### Conditional Behavior

Execute behaviors conditionally:

```rust
impl Behavior for ConditionalBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        if self.should_trade(world).await? {
            self.trading_behavior.execute(world).await?;
        } else {
            self.monitoring_behavior.execute(world).await?;
        }
        Ok(())
    }
}
```

## Testing Behaviors

### Unit Tests

```rust
#[tokio::test]
async fn test_behavior_logic() {
    let mut behavior = MyBehavior::new();
    let world = create_mock_world();
    
    behavior.init(&world).await.unwrap();
    behavior.execute(&world).await.unwrap();
    
    assert_eq!(behavior.state, ExpectedState);
}
```

### Mock World

```rust
struct MockWorld {
    // Minimal world for testing
}

impl MockWorld {
    fn new() -> Self {
        // Create test environment
        Self {}
    }
}
```

## Best Practices

### 1. Keep Behaviors Focused

```rust
// Good: Single purpose
struct SwapExecutor;

// Avoid: Too many responsibilities
struct DoEverything; // Don't do this
```

### 2. Make Behaviors Reusable

```rust
struct ReusableBehavior<S: Strategy> {
    strategy: S,
}

// Can be used with different strategies
let behavior1 = ReusableBehavior { strategy: ConservativeStrategy };
let behavior2 = ReusableBehavior { strategy: AggressiveStrategy };
```

### 3. Handle Errors Gracefully

```rust
impl Behavior for RobustBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        self.try_execute(world).await.or_else(|e| {
            log::error!("Execution failed: {}", e);
            self.fallback(world)
        })
    }
}
```

### 4. Add Logging

```rust
impl Behavior for LoggedBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        log::info!("Starting execution");
        let result = self.do_work(world).await;
        log::info!("Execution completed: {:?}", result);
        result
    }
}
```

## Examples

See the [examples](../../getting_started/examples.md) for complete behavior implementations.

## Next Steps

- [Agents](./agents.md) - Creating agents with behaviors
- [Worlds and Universes](./worlds_and_universes.md) - Running simulations
- [Configuration](./configuration.md) - Configuring behaviors

