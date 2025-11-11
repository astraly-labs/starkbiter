# Performance Optimization

Techniques for optimizing the performance of your Starkbiter simulations and tests.

## General Optimization

### Parallel Execution

Run independent tests in parallel:

```rust
#[tokio::test(flavor = "multi_thread", worker_threads = 4)]
async fn parallel_tests() {
    // Tests run concurrently
}
```

### Batch Operations

Group operations to reduce overhead:

```rust
use tokio::try_join;

// Instead of sequential
let balance1 = env.get_balance(addr1).await?;
let balance2 = env.get_balance(addr2).await?;
let balance3 = env.get_balance(addr3).await?;

// Use concurrent
let (balance1, balance2, balance3) = try_join!(
    env.get_balance(addr1),
    env.get_balance(addr2),
    env.get_balance(addr3),
)?;
```

### Reuse Environments

Reuse environments when possible:

```rust
// Expensive: create new environment for each test
#[tokio::test]
async fn test1() {
    let env = Environment::builder().build().await?;
    // ...
}

// Better: use fixtures with snapshots
async fn test_fixture() -> (Environment, SnapshotId) {
    let env = Environment::builder().build().await?;
    // Setup common state
    let snapshot = env.snapshot().await?;
    (env, snapshot)
}

#[tokio::test]
async fn test1() {
    let (env, snapshot) = test_fixture().await;
    // ... test ...
    env.restore(snapshot).await?;
}
```

## Environment Optimization

### Disable Unnecessary Features

```rust
let env = Environment::builder()
    .with_minimal_setup()  // Skip unnecessary initialization
    .build()
    .await?;
```

### Control Block Production

```rust
// Manual block production for testing
let env = Environment::builder()
    .with_block_time(0)  // Manual mode
    .build()
    .await?;

// Only mine when needed
env.mine_block().await?;
```

## Agent Optimization

### Efficient State Management

```rust
// Bad: Deep cloning on every execution
struct InefficientBehavior {
    large_state: Vec<LargeData>, // Cloned frequently
}

// Good: Use references and Arc
struct EfficientBehavior {
    large_state: Arc<Vec<LargeData>>, // Shared reference
}
```

### Lazy Evaluation

```rust
struct LazyBehavior {
    cached_data: Option<ExpensiveData>,
}

impl Behavior for LazyBehavior {
    async fn execute(&mut self, world: &World) -> Result<()> {
        // Only compute when needed
        let data = match &self.cached_data {
            Some(d) => d,
            None => {
                let d = self.compute_expensive_data(world).await?;
                self.cached_data = Some(d);
                self.cached_data.as_ref().unwrap()
            }
        };
        
        self.use_data(data).await?;
        Ok(())
    }
}
```

## Memory Management

### Resource Cleanup

```rust
impl Drop for MyAgent {
    fn drop(&mut self) {
        // Clean up resources
        self.close_connections();
        self.flush_caches();
    }
}
```

### Limit Cache Sizes

```rust
use lru::LruCache;

struct CachedBehavior {
    cache: LruCache<Key, Value>,
}

impl CachedBehavior {
    fn new() -> Self {
        Self {
            cache: LruCache::new(1000.try_into().unwrap()), // Limit cache size
        }
    }
}
```

## Profiling

### Measure Performance

```rust
use std::time::Instant;

async fn measure_performance<F, T>(name: &str, f: F) -> T
where
    F: Future<Output = T>,
{
    let start = Instant::now();
    let result = f.await;
    let elapsed = start.elapsed();
    println!("{} took {:?}", name, elapsed);
    result
}

// Usage
let result = measure_performance("deploy_contract", async {
    deploy_contract(&account).await
}).await?;
```

### Profile with tokio-console

```rust
// Add to Cargo.toml
// [dependencies]
// console-subscriber = "0.1"

// In main
#[tokio::main]
async fn main() {
    console_subscriber::init();
    // ... your code
}
```

## Benchmarking

Use Criterion for benchmarking:

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion};

fn bench_contract_call(c: &mut Criterion) {
    let rt = tokio::runtime::Runtime::new().unwrap();
    
    c.bench_function("contract_call", |b| {
        b.to_async(&rt).iter(|| async {
            let env = Environment::builder().build().await.unwrap();
            let account = env.create_account().await.unwrap();
            let contract = deploy_contract(&account).await.unwrap();
            
            black_box(contract.call_method().await.unwrap())
        });
    });
}

criterion_group!(benches, bench_contract_call);
criterion_main!(benches);
```

## Next Steps

- [Testing Strategies](./testing_strategies.md) - Effective testing
- [Simulation Techniques](./simulation_techniques.md) - Advanced simulations
- [Anomaly Detection](./anomaly_detection.md) - Detecting issues

