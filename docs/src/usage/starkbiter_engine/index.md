# Starkbiter Engine

`starkbiter-engine` provides high-level abstractions for building complex, multi-agent simulations on Starknet. It sits on top of `starkbiter-core` and offers ergonomic interfaces for agent-based modeling.

## Overview

The engine crate enables you to:
- **Create Agents** - Autonomous entities with custom behaviors
- **Define Behaviors** - Reusable action patterns for agents
- **Build Worlds** - Shared simulation environments
- **Orchestrate Universes** - Multiple parallel simulations
- **Enable Messaging** - Inter-agent communication

## Installation

Add to your `Cargo.toml`:

```toml
[dependencies]
starkbiter-engine = "0.1"
starkbiter-core = "0.1"
tokio = { version = "1.0", features = ["full"] }
```

## Quick Start

```rust
use starkbiter_core::environment::Environment;
use starkbiter_engine::{Agent, Behavior, World};
use anyhow::Result;

// Define a behavior
struct TradingBehavior;

impl Behavior for TradingBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Agent logic here
        println!("Executing trading strategy");
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<()> {
    // Create environment
    let env = Environment::builder().build().await?;
    
    // Create world
    let world = World::new(env);
    
    // Create and add agents
    let trader = Agent::new("trader", TradingBehavior);
    world.add_agent(trader);
    
    // Run simulation
    world.run().await?;
    
    Ok(())
}
```

## Core Concepts

### Agents

Agents are autonomous entities that execute behaviors. They can:
- React to blockchain events
- Maintain internal state
- Communicate with other agents
- Execute transactions

[Learn more about Agents →](./agents.md)

### Behaviors

Behaviors define what agents do. They are:
- Reusable action patterns
- Composable and modular
- Event-driven or scheduled
- Stateful or stateless

[Learn more about Behaviors →](./behaviors.md)

### Worlds

Worlds provide the simulation environment:
- Shared blockchain state
- Agent coordination
- Event distribution
- Execution scheduling

[Learn more about Worlds →](./worlds_and_universes.md)

### Universes

Universes manage multiple worlds:
- Parallel simulations
- Cross-world analytics
- Resource management
- Coordinated execution

[Learn more about Universes →](./worlds_and_universes.md)

## Architecture

```
Universe
  ├─ World 1
  │   ├─ Agent A (Behavior 1)
  │   ├─ Agent B (Behavior 2)
  │   └─ Environment
  └─ World 2
      ├─ Agent C (Behavior 3)
      └─ Environment
```

## Key Features

### 🤖 Agent-Based Modeling

Build sophisticated simulations with multiple autonomous agents:

```rust
// Create different agent types
let liquidator = Agent::new("liquidator", LiquidatorBehavior);
let borrower = Agent::new("borrower", BorrowerBehavior);
let lender = Agent::new("lender", LenderBehavior);

// Add to world
world.add_agent(liquidator);
world.add_agent(borrower);
world.add_agent(lender);

// Agents interact autonomously
world.run().await?;
```

### 📡 Event-Driven Architecture

Agents react to blockchain events:

```rust
impl Behavior for ArbitrageBehavior {
    async fn on_event(&mut self, event: Event) -> Result<()> {
        if event.name == "Swap" {
            // Check for arbitrage opportunity
            if let Some(profit) = self.check_arbitrage(&event).await? {
                self.execute_arbitrage(profit).await?;
            }
        }
        Ok(())
    }
}
```

### 💬 Inter-Agent Communication

Agents can message each other:

```rust
// Agent A sends message
world.send_message("agent-b", Message::RequestPrice).await?;

// Agent B receives and responds
impl Behavior for PriceOracleBehavior {
    async fn on_message(&mut self, msg: Message) -> Result<()> {
        match msg {
            Message::RequestPrice => {
                let price = self.get_current_price().await?;
                self.respond(Message::PriceUpdate(price)).await?;
            }
            _ => {}
        }
        Ok(())
    }
}
```

### ⚙️ Configuration-Driven

Define simulations in TOML:

```toml
# config.toml
[environment]
chain_id = "0x534e5f5345504f4c4941"
block_time = 10

[agents.liquidator]
behavior = "LiquidatorBehavior"
threshold = 0.8

[agents.borrower]
behavior = "BorrowerBehavior"
risk_profile = "aggressive"
```

[Learn more about Configuration →](./configuration.md)

## Use Cases

### DeFi Protocol Testing

Simulate complex DeFi scenarios:

```rust
// Setup lending protocol
let world = create_lending_world().await?;

// Add diverse agents
world.add_agent(Agent::new("whale-lender", WhaleLender));
world.add_agent(Agent::new("retail-borrower", RetailBorrower));
world.add_agent(Agent::new("liquidator-bot", LiquidatorBot));
world.add_agent(Agent::new("oracle", PriceOracle));

// Simulate market conditions
world.run_for_blocks(1000).await?;

// Analyze results
let metrics = world.get_metrics();
assert!(metrics.protocol_health > 0.95);
```

### Economic Modeling

Model economic systems:

```rust
// AMM simulation
struct LiquidityProvider;
struct Arbitrageur;
struct RetailTrader;

let world = World::new(env);
world.add_agent(Agent::new("lp-1", LiquidityProvider));
world.add_agent(Agent::new("arb-1", Arbitrageur));
world.add_agent(Agent::new("trader-1", RetailTrader));

// Simulate trading activity
world.run().await?;

// Analyze pool dynamics
let pool_metrics = analyze_pool_behavior(&world);
```

### Stress Testing

Test protocol under extreme conditions:

```rust
// Create stress test scenario
let world = setup_stress_test().await?;

// Add malicious agents
world.add_agent(Agent::new("attacker", FlashLoanAttacker));
world.add_agent(Agent::new("price-manipulator", PriceManipulator));

// Run attack scenarios
world.run_until(conditions_met).await?;

// Verify protocol safety
assert!(protocol_remains_solvent(&world));
```

### Strategy Development

Develop and test trading strategies:

```rust
struct BacktestBehavior {
    strategy: TradingStrategy,
    performance: PerformanceTracker,
}

impl Behavior for BacktestBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        let signal = self.strategy.generate_signal(world).await?;
        
        if let Some(trade) = signal {
            let result = execute_trade(world, trade).await?;
            self.performance.record(result);
        }
        
        Ok(())
    }
}
```

## Agent Lifecycle

```
Create → Initialize → Register Events → Execute → Cleanup
```

### Creation

```rust
let agent = Agent::new("my-agent", MyBehavior::new());
```

### Initialization

```rust
impl Behavior for MyBehavior {
    async fn init(&mut self, world: &World) -> Result<()> {
        // Setup state, deploy contracts, etc.
        self.contract = deploy_contract(world).await?;
        Ok(())
    }
}
```

### Event Registration

```rust
impl Behavior for MyBehavior {
    fn events(&self) -> Vec<EventFilter> {
        vec![
            EventFilter::contract_event(self.contract, "Transfer"),
            EventFilter::contract_event(self.contract, "Approval"),
        ]
    }
}
```

### Execution

```rust
impl Behavior for MyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Main agent logic
        self.process_events(world).await?;
        self.update_state(world).await?;
        Ok(())
    }
}
```

## Behavior Patterns

### Reactive Behavior

Respond to events:

```rust
impl Behavior for ReactiveBehavior {
    async fn on_event(&mut self, event: Event) -> Result<()> {
        match event.name.as_str() {
            "Swap" => self.handle_swap(event).await?,
            "Mint" => self.handle_mint(event).await?,
            _ => {}
        }
        Ok(())
    }
}
```

### Scheduled Behavior

Execute on schedule:

```rust
impl Behavior for ScheduledBehavior {
    fn schedule(&self) -> Schedule {
        Schedule::Every(Duration::from_secs(60)) // Every minute
    }
    
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Periodic action
        self.rebalance_portfolio(world).await?;
        Ok(())
    }
}
```

### Stateful Behavior

Maintain state across executions:

```rust
struct StatefulBehavior {
    state: AgentState,
    history: Vec<Action>,
}

impl Behavior for StatefulBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Use and update state
        let action = self.state.decide_action(world).await?;
        self.history.push(action.clone());
        self.execute_action(action, world).await?;
        Ok(())
    }
}
```

## Messaging System

### High-Level Messaging

```rust
use starkbiter_engine::messager::{Messager, Message};

// Create messager
let messager = Messager::new();

// Agent A subscribes
messager.subscribe("agent-a", callback).await?;

// Agent B publishes
messager.publish("agent-a", Message::Data(value)).await?;
```

### Custom Messages

```rust
#[derive(Debug, Clone)]
enum CustomMessage {
    PriceUpdate(u64),
    TradeSignal { asset: String, action: Action },
    Alert(String),
}

// Send custom message
messager.publish("trader", CustomMessage::PriceUpdate(1000)).await?;
```

## Error Handling

### Behavior Errors

```rust
impl Behavior for MyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        self.risky_operation(world)
            .await
            .map_err(|e| anyhow!("Agent failed: {}", e))?;
        Ok(())
    }
}
```

### World-Level Error Handling

```rust
match world.run().await {
    Ok(_) => println!("Simulation completed successfully"),
    Err(e) => {
        eprintln!("Simulation failed: {}", e);
        world.dump_state().await?;
    }
}
```

## Testing Agents

### Unit Tests

```rust
#[tokio::test]
async fn test_agent_behavior() {
    let mut behavior = MyBehavior::new();
    let world = create_test_world().await;
    
    behavior.init(&world).await.unwrap();
    behavior.execute(&world).await.unwrap();
    
    assert_eq!(behavior.get_state(), expected_state);
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_multi_agent_interaction() {
    let world = World::new(env);
    world.add_agent(Agent::new("agent-1", Behavior1));
    world.add_agent(Agent::new("agent-2", Behavior2));
    
    world.run_for_blocks(100).await.unwrap();
    
    let results = world.get_results();
    assert!(results.agents_interacted_correctly());
}
```

## Performance Optimization

### Parallel Agent Execution

```rust
// Agents execute in parallel when possible
world.set_execution_mode(ExecutionMode::Parallel);
world.run().await?;
```

### Batch Operations

```rust
impl Behavior for BatchBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Batch multiple operations
        let operations = self.prepare_batch();
        world.execute_batch(operations).await?;
        Ok(())
    }
}
```

## Best Practices

### 1. Keep Behaviors Focused

```rust
// Good: Single responsibility
struct LiquidatorBehavior;

// Avoid: Too many responsibilities
struct GodBehavior;  // Don't do this!
```

### 2. Use Composition

```rust
struct ComposedBehavior {
    price_oracle: PriceOracle,
    risk_manager: RiskManager,
    executor: TradeExecutor,
}
```

### 3. Handle Errors Gracefully

```rust
impl Behavior for RobustBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        match self.try_execute(world).await {
            Ok(_) => Ok(()),
            Err(e) => {
                log::error!("Execution failed: {}", e);
                self.recover().await?;
                Ok(())
            }
        }
    }
}
```

### 4. Log Extensively

```rust
impl Behavior for LoggingBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        log::info!("Starting execution");
        let result = self.do_work(world).await?;
        log::info!("Completed with result: {:?}", result);
        Ok(())
    }
}
```

## Next Steps

- [Agents](./agents.md) - Deep dive into agents
- [Behaviors](./behaviors.md) - Behavior patterns and examples
- [Worlds and Universes](./worlds_and_universes.md) - Simulation environments
- [Configuration](./configuration.md) - Configuration-driven simulations
- [Examples](../../getting_started/examples.md) - Working examples

