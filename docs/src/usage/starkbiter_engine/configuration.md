# Configuration

Starkbiter supports configuration-driven simulations using TOML files. This allows you to define simulations declaratively and separate configuration from code.

## Configuration File Structure

```toml
# config.toml

[environment]
chain_id = "0x534e5f5345504f4c4941"  # Sepolia
block_time = 10                       # seconds
gas_price = 100000000000              # 100 gwei

[agents.liquidator]
behavior = "LiquidatorBehavior"
min_profit = 1000
check_interval = 60

[agents.trader]
behavior = "TradingBehavior"
initial_capital = 10000
risk_tolerance = 0.7

[agents.oracle]
behavior = "OracleBehavior"
update_frequency = 30
price_feeds = ["ETH/USD", "BTC/USD"]
```

## Loading Configuration

```rust
use serde::Deserialize;
use std::fs;

#[derive(Deserialize)]
struct SimulationConfig {
    environment: EnvironmentConfig,
    agents: HashMap<String, AgentConfig>,
}

let config_str = fs::read_to_string("config.toml")?;
let config: SimulationConfig = toml::from_str(&config_str)?;
```

## Building from Configuration

```rust
async fn build_from_config(config: SimulationConfig) -> Result<World> {
    // Build environment
    let env = Environment::builder()
        .with_chain_id(Felt::from_hex(&config.environment.chain_id)?)
        .with_block_time(config.environment.block_time)
        .build()
        .await?;
    
    let world = World::new(env);
    
    // Add agents
    for (id, agent_config) in config.agents {
        let behavior = create_behavior(&agent_config)?;
        world.add_agent(Agent::new(&id, behavior));
    }
    
    Ok(world)
}
```

## Configuration Examples

### DeFi Protocol Testing

```toml
[environment]
chain_id = "0x534e5f5345504f4c4941"
block_time = 10

[protocol]
pool_address = "0x..."
router_address = "0x..."

[agents.lender]
behavior = "LenderBehavior"
deposit_amount = 100000
target_apy = 0.05

[agents.borrower]
behavior = "BorrowerBehavior"
collateral_ratio = 1.5
max_leverage = 3

[agents.liquidator]
behavior = "LiquidatorBehavior"
min_profit = 500
```

### Trading Simulation

```toml
[environment]
chain_id = "0x534e5f5345504f4c4941"

[agents.market_maker]
behavior = "MarketMakerBehavior"
spread = 0.003
inventory_target = 10000

[agents.arbitrageur]
behavior = "ArbitrageurBehavior"
min_profit_bps = 10
pools = ["pool1", "pool2", "pool3"]

[agents.retail_trader]
behavior = "RetailTraderBehavior"
trade_frequency = 120
average_size = 100
```

## Next Steps

- [Agents](./agents.md) - Creating agents
- [Behaviors](./behaviors.md) - Defining behaviors
- [Examples](../../getting_started/examples.md) - Working examples

