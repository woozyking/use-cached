# use-cached

[![npm version](https://badge.fury.io/js/use-cached.svg)](https://www.npmjs.com/package/use-cached)

A zero-dependency, highly performant higher-order function that bakes `localStorage` caching and optional TTL (Time To Live) expiration into standard React hooks (`useState` and `useReducer`).

## Features

- **Zero Dependencies:** Fully natively manages `localStorage`. No external caching libraries required.
- **High Performance:** Uses React's lazy initialization to ensure `localStorage` (a synchronous, blocking API) is only read exactly once during component mount, preventing render bottlenecks.
- **TTL Expiration:** Easily set cache expiration times so your state doesn't get stale permanently.
- **Cache Invalidation:** The wrapped hooks return a 3rd tuple element—a dedicated removal function to easily wipe the cache for that specific key.

## Install

```shell
npm install use-cached
```

Or the equivalent of your choice of package manager.

## API Configuration

The `cached` function accepts a configuration object to define how the state is stored:

* **`key`** *(string, required)*: The unique `localStorage` key used to save the data.
* **`ttl`** *(number, optional)*: Time To Live multiplier. How long the cache is valid. If not provided, the cache will never expire.
* **`ttlMS`** *(number, optional)*: The base unit in milliseconds for the `ttl`. Default is `60000` (1 minute).

*Example: `ttl: 5` and `ttlMS: 1000` means the cache expires in 5000 milliseconds (5 seconds).*

## Usage Examples

### 1. Basic `useState`

When wrapping `useState`, the hook returns `[state, setState, removeCache]`.

```jsx
import { useState } from "react";
import { cached } from "use-cached";

const useCachedState = cached({ key: "app_user_name" })(useState);

function BasicStateDemo() {
  const [name, setName, removeCache] = useCachedState("Guest");

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={removeCache}>Clear Cache</button>
    </>
  );
}
```

### 2. `useState` with TTL Expiration

```jsx
import { useState } from "react";
import { cached } from "use-cached";

// Expires in 5 seconds (ttl: 5, ttlMS: 1000ms)
const useExpiringState = cached({
  key: "app_temp_count",
  ttl: 5,
  ttlMS: 1000,
})(useState);

function ExpiringCounter() {
  const [count, setCount] = useExpiringState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Increment: {count}
    </button>
  );
}
```

### 3. Cached `useReducer`

When wrapping `useReducer`, the hook returns `[state, dispatch, removeCache]`.

```jsx
import { useReducer } from "react";
import { cached } from "use-cached";

const useCachedReducer = cached({ key: "app_counter_reducer" })(useReducer);

const counterReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    case 'DECREMENT': return { count: state.count - 1 };
    case 'RESET': return { count: 0 };
    default: return state;
  }
};

function ReducerDemo() {
  const [state, dispatch, removeCache] = useCachedReducer(counterReducer, { count: 0 });

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={removeCache}>Clear Cache</button>
    </>
  );
}
```
