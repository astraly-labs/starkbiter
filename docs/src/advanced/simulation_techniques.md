# Simulation Techniques

Advanced techniques for building realistic and effective simulations with Starkbiter.

## Agent-Based Modeling

### Heterogeneous Agents

Create agents with different behaviors and strategies:

```rust
// Conservative trader
let conservative = Agent::new("conservative", ConservativeBehavior {
    risk_tolerance: 0.3,
    trade_frequency: Duration::from_secs(3600),
});

// Aggressive trader
let aggressive = Agent::new("aggressive", AggressiveBehavior {
    risk_tolerance: 0.9,
    trade_frequency: Duration::from_secs(60),
});

world.add_agent(conservative);
world.add_agent(aggressive);
```

### Adaptive Agents

Agents that learn and adapt:

```rust
struct AdaptiveBehavior {
    strategy: Box<dyn Strategy>,
    performance: PerformanceTracker,
}

impl Behavior for AdaptiveBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Execute strategy
        let result = self.strategy.execute(world).await?;
        
        // Track performance
        self.performance.record(result);
        
        // Adapt if performance is poor
        if self.performance.is_underperforming() {
            self.strategy = self.select_better_strategy();
        }
        
        Ok(())
    }
}
```

## Economic Modeling

### Supply and Demand

Model market dynamics:

```rust
struct MarketSimulation {
    suppliers: Vec<Agent>,
    consumers: Vec<Agent>,
    price_discovery: PriceDiscovery,
}

impl MarketSimulation {
    async fn simulate(&mut self, blocks: u64) -> Result<PriceHistory> {
        for _ in 0..blocks {
            // Suppliers offer
            let supply = self.aggregate_supply().await?;
            
            // Consumers bid
            let demand = self.aggregate_demand().await?;
            
            // Clear market
            let price = self.price_discovery.clear_market(supply, demand);
            
            // Execute trades
            self.execute_at_price(price).await?;
        }
        
        Ok(self.price_discovery.history())
    }
}
```

### Liquidity Modeling

Simulate realistic liquidity conditions:

```rust
struct LiquidityProvider {
    target_tvl: u64,
    rebalance_threshold: f64,
}

impl Behavior for LiquidityProvider {
    async fn execute(&mut self, world: &World) -> Result<()> {
        let current_tvl = self.get_tvl(world).await?;
        let imbalance = (current_tvl as f64 - self.target_tvl as f64).abs()
            / self.target_tvl as f64;
        
        if imbalance > self.rebalance_threshold {
            self.rebalance(world, current_tvl).await?;
        }
        
        Ok(())
    }
}
```

## Monte Carlo Simulation

Run many simulations with random parameters:

```rust
async fn monte_carlo_analysis(
    scenarios: usize,
) -> Result<Statistics> {
    let mut results = vec![];
    
    for i in 0..scenarios {
        // Create environment with random seed
        let env = Environment::builder()
            .with_seed(i as u64)
            .build()
            .await?;
        
        // Run simulation
        let outcome = run_simulation(env).await?;
        results.push(outcome);
    }
    
    // Analyze results
    Ok(Statistics::from_results(results))
}
```

## Scenario Analysis

### Best Case / Worst Case

```rust
async fn scenario_analysis() -> Result<ScenarioResults> {
    let universe = Universe::new();
    
    // Best case
    let best = create_optimistic_world().await?;
    universe.add_world("best", best);
    
    // Expected case
    let expected = create_realistic_world().await?;
    universe.add_world("expected", expected);
    
    // Worst case
    let worst = create_pessimistic_world().await?;
    universe.add_world("worst", worst);
    
    universe.run_all().await?;
    
    Ok(universe.compare_outcomes())
}
```

### Parameter Sweeps

Test across parameter ranges:

```rust
async fn parameter_sweep() -> Result<HeatMap> {
    let mut results = HeatMap::new();
    
    for fee in [0.001, 0.003, 0.005, 0.01] {
        for slippage in [0.001, 0.005, 0.01, 0.05] {
            let env = Environment::builder().build().await?;
            let protocol = deploy_with_params(&env, fee, slippage).await?;
            
            let profit = simulate_trading(&protocol).await?;
            results.insert((fee, slippage), profit);
        }
    }
    
    Ok(results)
}
```

## Time Series Analysis

### Price Processes

Simulate realistic price movements:

```rust
struct GeometricBrownianMotion {
    mu: f64,      // drift
    sigma: f64,   // volatility
    dt: f64,      // time step
}

impl GeometricBrownianMotion {
    fn simulate(&self, steps: usize, initial_price: f64) -> Vec<f64> {
        let mut prices = vec![initial_price];
        let mut rng = thread_rng();
        
        for _ in 0..steps {
            let last_price = prices.last().unwrap();
            let dw = Normal::new(0.0, (self.dt).sqrt()).unwrap().sample(&mut rng);
            let drift = self.mu * self.dt;
            let diffusion = self.sigma * dw;
            let next_price = last_price * ((drift + diffusion).exp());
            prices.push(next_price);
        }
        
        prices
    }
}
```

### Event-Driven Updates

```rust
struct PriceOracle {
    gbm: GeometricBrownianMotion,
    current_price: f64,
}

impl Behavior for PriceOracle {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Update price
        let new_price = self.gbm.step(self.current_price);
        self.current_price = new_price;
        
        // Broadcast update
        world.broadcast(Message::PriceUpdate {
            asset: "ETH".to_string(),
            price: new_price,
        }).await?;
        
        Ok(())
    }
}
```

## Network Effects

Model interactions between agents:

```rust
struct NetworkSimulation {
    agents: Vec<Agent>,
    network: Graph<AgentId, Relationship>,
}

impl NetworkSimulation {
    async fn propagate_influence(&mut self, source: AgentId) -> Result<()> {
        // Find neighbors
        let neighbors = self.network.neighbors(source);
        
        // Influence spreads through network
        for neighbor in neighbors {
            if let Some(agent) = self.agents.get_mut(&neighbor) {
                agent.receive_influence(source).await?;
            }
        }
        
        Ok(())
    }
}
```

## Next Steps

- [Anomaly Detection](./anomaly_detection.md) - Detecting unusual behavior
- [Testing Strategies](./testing_strategies.md) - Testing approaches
- [Performance Optimization](./performance.md) - Optimizing simulations

