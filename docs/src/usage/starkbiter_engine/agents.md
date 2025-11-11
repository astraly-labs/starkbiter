# Agents

Agents are the core building blocks of simulations in Starkbiter Engine. They represent autonomous entities that can interact with the blockchain, respond to events, and communicate with other agents.

## Overview

An agent in Starkbiter is an autonomous entity that:
- Executes one or more behaviors
- Maintains its own state
- Reacts to blockchain events
- Communicates with other agents through messaging
- Has access to the blockchain through middleware

## Creating Agents

### Basic Agent

```rust
use starkbiter_engine::Agent;

// Create agent with a behavior
let agent = Agent::new("my-agent", MyBehavior::new());
```

### Agent with Multiple Behaviors

```rust
let mut agent = Agent::new("multi-behavior-agent", PrimaryBehavior);
agent.add_behavior(SecondaryBehavior);
agent.add_behavior(MonitoringBehavior);
```

## Agent Structure

```rust
pub struct Agent {
    pub id: String,
    client: Arc<Middleware>,
    messager: Messager,
    behaviors: Vec<Box<dyn StateMachine>>,
}
```

### Key Components

- **ID**: Unique identifier for the agent
- **Client**: Connection to the blockchain (middleware)
- **Messager**: For inter-agent communication
- **Behaviors**: List of behaviors the agent executes

## Agent Types

### Reactive Agents

Respond to events on the blockchain:

```rust
struct EventReactiveAgent {
    target_contract: ContractAddress,
}

impl Behavior for EventReactiveAgent {
    async fn on_event(&mut self, event: Event) -> Result<()> {
        if event.from_address == self.target_contract {
            // React to events from specific contract
            self.handle_event(event).await?;
        }
        Ok(())
    }
}
```

### Proactive Agents

Take initiative based on strategy:

```rust
struct ProactiveTrader {
    strategy: TradingStrategy,
}

impl Behavior for ProactiveTrader {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Generate trading signal
        if let Some(trade) = self.strategy.generate_signal().await? {
            self.execute_trade(trade).await?;
        }
        Ok(())
    }
}
```

### Hybrid Agents

Combine reactive and proactive behaviors:

```rust
struct HybridAgent {
    reactive: EventHandler,
    proactive: StrategyExecutor,
}
```

## Agent Lifecycle

### 1. Creation

```rust
let agent = Agent::new("agent-id", behavior);
```

### 2. Initialization

```rust
impl Behavior for MyBehavior {
    async fn init(&mut self, world: &World) -> Result<()> {
        // Deploy contracts, load state, etc.
        self.contract = deploy_my_contract(world).await?;
        Ok(())
    }
}
```

### 3. Execution

```rust
// Agent added to world
world.add_agent(agent);

// World runs agents
world.run().await?;
```

### 4. Cleanup

Agents are automatically cleaned up when dropped.

## Agent Communication

### Sending Messages

```rust
impl Behavior for SenderAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Send message to another agent
        world.send_message(
            "receiver-agent",
            Message::custom("price-update", 1000)
        ).await?;
        Ok(())
    }
}
```

### Receiving Messages

```rust
impl Behavior for ReceiverAgent {
    async fn on_message(&mut self, msg: Message) -> Result<()> {
        match msg {
            Message::Custom { topic, data } if topic == "price-update" => {
                self.handle_price_update(data).await?;
            }
            _ => {}
        }
        Ok(())
    }
}
```

## Agent Patterns

### The Observer

Monitors contract state and reports:

```rust
struct ObserverAgent {
    watched_contracts: Vec<ContractAddress>,
    alert_threshold: u64,
}

impl Behavior for ObserverAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        for contract in &self.watched_contracts {
            let value = self.check_value(contract).await?;
            if value > self.alert_threshold {
                world.send_alert(format!("Threshold exceeded: {}", value)).await?;
            }
        }
        Ok(())
    }
}
```

### The Executor

Executes transactions based on conditions:

```rust
struct ExecutorAgent {
    pending_txs: Vec<Transaction>,
}

impl Behavior for ExecutorAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        for tx in &self.pending_txs {
            if self.should_execute(tx).await? {
                self.submit_transaction(tx, world).await?;
            }
        }
        Ok(())
    }
}
```

### The Coordinator

Coordinates actions between multiple agents:

```rust
struct CoordinatorAgent {
    managed_agents: Vec<String>,
}

impl Behavior for CoordinatorAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Send commands to managed agents
        for agent_id in &self.managed_agents {
            world.send_message(
                agent_id,
                Message::Command(Action::Execute)
            ).await?;
        }
        Ok(())
    }
}
```

## Best Practices

### 1. Single Responsibility

Each agent should have a clear, focused purpose:

```rust
// Good: Focused agent
struct LiquidatorAgent;

// Avoid: Too many responsibilities
struct DoEverythingAgent; // Don't do this
```

### 2. State Management

Keep agent state minimal and well-organized:

```rust
struct WellOrganizedAgent {
    config: AgentConfig,
    state: AgentState,
    metrics: PerformanceMetrics,
}
```

### 3. Error Handling

Handle errors gracefully:

```rust
impl Behavior for RobustAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        match self.try_action(world).await {
            Ok(_) => Ok(()),
            Err(e) => {
                log::error!("Action failed: {}", e);
                self.recover().await?;
                Ok(())
            }
        }
    }
}
```

### 4. Logging

Add comprehensive logging:

```rust
impl Behavior for LoggingAgent {
    async fn execute(&mut self, world: &World) -> Result<()> {
        log::info!("Agent {} starting execution", self.id);
        // ... execution logic
        log::debug!("Agent {} completed execution", self.id);
        Ok(())
    }
}
```

## Testing Agents

### Unit Tests

```rust
#[tokio::test]
async fn test_agent_behavior() {
    let mut agent = TestAgent::new();
    let world = create_test_world().await;
    
    agent.init(&world).await.unwrap();
    agent.execute(&world).await.unwrap();
    
    assert_eq!(agent.action_count, 1);
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_agent_interaction() {
    let world = World::new(env);
    let agent1 = Agent::new("agent-1", Behavior1);
    let agent2 = Agent::new("agent-2", Behavior2);
    
    world.add_agent(agent1);
    world.add_agent(agent2);
    
    world.run_for_blocks(10).await.unwrap();
    
    assert!(agents_interacted_correctly(&world));
}
```

## Examples

See the [minter example](../../getting_started/examples.md#token-minter-simulation) for a complete agent implementation.

## Next Steps

- [Behaviors](./behaviors.md) - Define agent actions
- [Worlds and Universes](./worlds_and_universes.md) - Simulation environments
- [Configuration](./configuration.md) - Configure agents via files

