# Anomaly Detection

Use Starkbiter to detect anomalies and vulnerabilities in smart contract systems through simulation-based analysis.

## Overview

Anomaly detection in Starkbiter involves:
- Defining normal system behavior
- Running simulations with various conditions
- Identifying deviations from expected behavior
- Analyzing root causes of anomalies

## Statistical Anomaly Detection

### Baseline Behavior

Establish normal behavior patterns:

```rust
struct BehaviorBaseline {
    mean_gas_usage: f64,
    std_gas_usage: f64,
    mean_execution_time: f64,
    typical_event_counts: HashMap<String, f64>,
}

impl BehaviorBaseline {
    async fn establish(env: &Environment, runs: usize) -> Result<Self> {
        let mut gas_samples = vec![];
        let mut time_samples = vec![];
        
        for _ in 0..runs {
            let start = Instant::now();
            let result = run_normal_simulation(env).await?;
            
            gas_samples.push(result.gas_used as f64);
            time_samples.push(start.elapsed().as_secs_f64());
        }
        
        Ok(Self {
            mean_gas_usage: mean(&gas_samples),
            std_gas_usage: std_dev(&gas_samples),
            mean_execution_time: mean(&time_samples),
            typical_event_counts: result.event_counts,
        })
    }
    
    fn is_anomalous(&self, observation: &Observation) -> bool {
        let z_score = (observation.gas_used as f64 - self.mean_gas_usage)
            / self.std_gas_usage;
        
        z_score.abs() > 3.0  // 3-sigma rule
    }
}
```

### Detecting Outliers

```rust
async fn detect_gas_anomalies(
    protocol: &Protocol,
    operations: Vec<Operation>,
) -> Result<Vec<Anomaly>> {
    let baseline = BehaviorBaseline::establish(&protocol.env, 100).await?;
    let mut anomalies = vec![];
    
    for op in operations {
        let result = protocol.execute(op).await?;
        
        if baseline.is_anomalous(&result) {
            anomalies.push(Anomaly {
                operation: op,
                gas_used: result.gas_used,
                expected_gas: baseline.mean_gas_usage,
                deviation: (result.gas_used as f64 - baseline.mean_gas_usage)
                    / baseline.mean_gas_usage,
            });
        }
    }
    
    Ok(anomalies)
}
```

## Invariant Violation Detection

### Define Invariants

```rust
struct ProtocolInvariants {
    rules: Vec<Box<dyn Invariant>>,
}

trait Invariant {
    async fn check(&self, world: &World) -> Result<bool>;
    fn description(&self) -> &str;
}

// Example: Total supply invariant
struct TotalSupplyInvariant {
    token_address: Felt,
    expected_supply: Felt,
}

impl Invariant for TotalSupplyInvariant {
    async fn check(&self, world: &World) -> Result<bool> {
        let token = ERC20::new(self.token_address, &world.account());
        let actual = token.total_supply().await?;
        Ok(actual == self.expected_supply)
    }
    
    fn description(&self) -> &str {
        "Total token supply must remain constant"
    }
}
```

### Monitor Invariants

```rust
async fn monitor_invariants(
    world: &World,
    invariants: &ProtocolInvariants,
) -> Result<Vec<Violation>> {
    let mut violations = vec![];
    
    for invariant in &invariants.rules {
        if !invariant.check(world).await? {
            violations.push(Violation {
                rule: invariant.description().to_string(),
                timestamp: world.get_timestamp().await?,
                block: world.get_block_number().await?,
            });
        }
    }
    
    Ok(violations)
}
```

## Behavioral Analysis

### Track Agent Behavior

```rust
struct BehaviorMonitor {
    agent_patterns: HashMap<String, BehaviorPattern>,
}

impl BehaviorMonitor {
    fn record_action(&mut self, agent_id: &str, action: Action) {
        let pattern = self.agent_patterns
            .entry(agent_id.to_string())
            .or_insert(BehaviorPattern::new());
        
        pattern.add_action(action);
    }
    
    fn detect_suspicious_behavior(&self) -> Vec<Alert> {
        let mut alerts = vec![];
        
        for (agent_id, pattern) in &self.agent_patterns {
            // Detect unusual frequency
            if pattern.action_rate() > pattern.typical_rate() * 10.0 {
                alerts.push(Alert::UnusualFrequency {
                    agent: agent_id.clone(),
                    rate: pattern.action_rate(),
                });
            }
            
            // Detect unusual amounts
            if pattern.max_amount() > pattern.typical_amount() * 100.0 {
                alerts.push(Alert::UnusualAmount {
                    agent: agent_id.clone(),
                    amount: pattern.max_amount(),
                });
            }
        }
        
        alerts
    }
}
```

## Flash Loan Attack Detection

```rust
struct FlashLoanDetector {
    threshold_borrow: u64,
    threshold_profit: u64,
}

impl FlashLoanDetector {
    async fn monitor_block(&self, world: &World) -> Result<Vec<AttackAlert>> {
        let mut alerts = vec![];
        let events = world.get_recent_events().await?;
        
        // Group events by transaction
        let tx_groups = self.group_by_transaction(events);
        
        for (tx_hash, tx_events) in tx_groups {
            // Look for borrow-repay in same transaction
            let borrowed = self.find_borrows(&tx_events);
            let repaid = self.find_repayments(&tx_events);
            
            if !borrowed.is_empty() && !repaid.is_empty() {
                let total_borrowed: u64 = borrowed.iter().map(|b| b.amount).sum();
                let profit = self.calculate_profit(&tx_events);
                
                if total_borrowed > self.threshold_borrow
                    && profit > self.threshold_profit {
                    alerts.push(AttackAlert::FlashLoan {
                        tx: tx_hash,
                        borrowed: total_borrowed,
                        profit,
                    });
                }
            }
        }
        
        Ok(alerts)
    }
}
```

## Price Manipulation Detection

```rust
struct PriceManipulationDetector {
    price_impact_threshold: f64,
}

impl PriceManipulationDetector {
    async fn detect(&self, pool: &Pool) -> Result<Option<ManipulationAlert>> {
        let snapshot = pool.snapshot().await?;
        
        // Simulate large trade
        let large_trade = pool.max_trade_size() * 0.5;
        let price_before = pool.get_price().await?;
        
        pool.simulate_swap(large_trade).await?;
        let price_after = pool.get_price().await?;
        
        let price_impact = (price_after - price_before) / price_before;
        
        // Restore state
        pool.restore(snapshot).await?;
        
        if price_impact.abs() > self.price_impact_threshold {
            Ok(Some(ManipulationAlert {
                pool: pool.address(),
                price_impact,
                vulnerable_to_manipulation: true,
            }))
        } else {
            Ok(None)
        }
    }
}
```

## Machine Learning-Based Detection

### Feature Extraction

```rust
struct TransactionFeatures {
    gas_used: f64,
    value_transferred: f64,
    num_calls: f64,
    unique_contracts: f64,
    loops_detected: bool,
    reentrancy_risk: f64,
}

impl TransactionFeatures {
    async fn extract(tx: &Transaction, world: &World) -> Result<Self> {
        // Analyze transaction
        let trace = world.trace_transaction(tx).await?;
        
        Ok(Self {
            gas_used: trace.gas_used as f64,
            value_transferred: trace.value_transferred as f64,
            num_calls: trace.calls.len() as f64,
            unique_contracts: trace.unique_contracts().len() as f64,
            loops_detected: trace.has_loops(),
            reentrancy_risk: trace.calculate_reentrancy_risk(),
        })
    }
}
```

### Anomaly Scoring

```rust
struct AnomalyDetector {
    model: Box<dyn AnomalyModel>,
}

impl AnomalyDetector {
    fn score(&self, features: &TransactionFeatures) -> f64 {
        self.model.predict_anomaly_score(features)
    }
    
    fn classify(&self, features: &TransactionFeatures) -> Classification {
        let score = self.score(features);
        
        if score > 0.9 {
            Classification::HighRisk
        } else if score > 0.7 {
            Classification::MediumRisk
        } else {
            Classification::Normal
        }
    }
}
```

## Reporting

```rust
struct AnomalyReport {
    anomalies: Vec<Anomaly>,
    severity_distribution: HashMap<Severity, usize>,
    recommendations: Vec<String>,
}

impl AnomalyReport {
    fn generate(detections: Vec<Detection>) -> Self {
        let mut anomalies = vec![];
        let mut severity_dist = HashMap::new();
        
        for detection in detections {
            let anomaly = Anomaly::from(detection);
            *severity_dist.entry(anomaly.severity).or_insert(0) += 1;
            anomalies.push(anomaly);
        }
        
        let recommendations = Self::generate_recommendations(&anomalies);
        
        Self {
            anomalies,
            severity_distribution: severity_dist,
            recommendations,
        }
    }
    
    fn to_markdown(&self) -> String {
        // Generate markdown report
        format!(
            "# Anomaly Detection Report\n\n\
             ## Summary\n\
             - Total anomalies: {}\n\
             - Critical: {}\n\
             - High: {}\n\
             - Medium: {}\n\
             - Low: {}\n\n\
             ## Recommendations\n{}\n",
            self.anomalies.len(),
            self.severity_distribution.get(&Severity::Critical).unwrap_or(&0),
            self.severity_distribution.get(&Severity::High).unwrap_or(&0),
            self.severity_distribution.get(&Severity::Medium).unwrap_or(&0),
            self.severity_distribution.get(&Severity::Low).unwrap_or(&0),
            self.recommendations.join("\n"),
        )
    }
}
```

## Next Steps

- [Testing Strategies](./testing_strategies.md) - Testing approaches
- [Simulation Techniques](./simulation_techniques.md) - Simulation patterns
- [Performance Optimization](./performance.md) - Optimizing detection

