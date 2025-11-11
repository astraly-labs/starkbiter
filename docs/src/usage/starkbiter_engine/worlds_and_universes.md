# Worlds and Universes

Worlds and Universes are the containers and orchestrators for simulations in Starkbiter Engine.

## Worlds

A **World** represents a single simulation environment where agents interact with a shared blockchain state.

### Creating a World

```rust
use starkbiter_core::environment::Environment;
use starkbiter_engine::World;

let env = Environment::builder().build().await?;
let world = World::new(env);
```

### Adding Agents

```rust
world.add_agent(Agent::new("trader", TradingBehavior));
world.add_agent(Agent::new("liquidator", LiquidatorBehavior));
world.add_agent(Agent::new("oracle", OracleBehavior));
```

### Running Simulations

```rust
// Run until completion
world.run().await?;

// Run for specific number of blocks
world.run_for_blocks(1000).await?;

// Run until condition met
world.run_until(|w| w.condition_met()).await?;
```

## Universes

A **Universe** manages multiple parallel worlds, enabling complex multi-world simulations and comparisons.

### Creating a Universe

```rust
use starkbiter_engine::Universe;

let universe = Universe::new();
```

### Adding Worlds

```rust
// Create worlds with different configurations
let world1 = create_conservative_world().await?;
let world2 = create_aggressive_world().await?;

universe.add_world("conservative", world1);
universe.add_world("aggressive", world2);
```

### Running Multiple Worlds

```rust
// Run all worlds in parallel
universe.run_all().await?;

// Compare results
let results = universe.compare_results();
```

## World API

### State Queries

```rust
// Get current block
let block = world.get_block_number().await?;

// Get world state
let state = world.get_state();

// Get metrics
let metrics = world.get_metrics();
```

### Agent Management

```rust
// Get agent by ID
let agent = world.get_agent("trader")?;

// List all agents
let agents = world.list_agents();

// Remove agent
world.remove_agent("trader")?;
```

### Messaging

```rust
// Send message to agent
world.send_message("receiver", Message::Data(value)).await?;

// Broadcast to all agents
world.broadcast(Message::Alert("Important".to_string())).await?;
```

## Use Cases

### Scenario Testing

```rust
// Test different scenarios in separate worlds
let bear_market = create_world_with_params(MarketCondition::Bear).await?;
let bull_market = create_world_with_params(MarketCondition::Bull).await?;

universe.add_world("bear", bear_market);
universe.add_world("bull", bull_market);

universe.run_all().await?;
```

### Parameter Sweeps

```rust
// Test multiple parameter combinations
for gas_price in [10, 50, 100, 500] {
    let world = create_world_with_gas(gas_price).await?;
    universe.add_world(&format!("gas-{}", gas_price), world);
}

universe.run_all().await?;
let optimal = universe.find_optimal_parameters();
```

### A/B Testing

```rust
// Compare strategy variations
let strategy_a = World::new(env1);
strategy_a.add_agent(Agent::new("trader", StrategyA));

let strategy_b = World::new(env2);
strategy_b.add_agent(Agent::new("trader", StrategyB));

universe.add_world("A", strategy_a);
universe.add_world("B", strategy_b);

universe.run_all().await?;
universe.compare_performance();
```

## Next Steps

- [Agents](./agents.md) - Creating agents
- [Behaviors](./behaviors.md) - Defining behaviors
- [Configuration](./configuration.md) - Configuration files

