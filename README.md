# use-cached

[![npm version](https://badge.fury.io/js/use-cached.svg)](https://www.npmjs.com/package/use-cached)

Higher-order-function that bakes state caching mechanism into supported React hooks.

Built on top of [lscache](https://github.com/pamelafox/lscache) to provide seamless caching integration with TTL/expiration support.

## Install

```shell
yarn add use-cached
# OR
npm install use-cached
```

## Usage

```js
import { cached } from 'use-cached'
// or import its default, which is the same function
import cached from 'use-cached'
```

The only interface (the higher-order-function) is exported as the module's named function (`{ cached }`), and its `default`. Check out the [Storybook](https://woozyking.github.io/use-cached), or examples below.

### Cached `useState`

```jsx
import React from 'react'
import { cached } from 'use-cached'

// get cached version of useState
const useState = cached({
  // Object config, added in v1.2.0
  key: 'TEST_CACHE_KEY',
  ttl: 60,
  ttlMS: 60000, // added in v1.2.0
  // effective TTL in this case is 60 * 60000ms = 60 minutes
})(React.useState)

function Counter({initialCount}) {
  // count here would be from cache if it exists as a non-null value
  const [count, setCount] = useState(initialCount)
  return (
    <>
      Count: {count}
      <button onClick={() => setCount(initialCount)}>Reset</button>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
      <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
    </>
  )
}
```

### Cached `useReducer`

```jsx
import React from 'react'
import cached from 'use-cached' // same as import { cached }

// get cached version of useReducer
const useReducer = cached(
  // positional config, deprecating in v2.0
  'TEST_CACHE_KEY', // key
  60, // ttl
  60000, // ttlMS
)(React.useReducer)

function init(initialCount) {
  return {count: initialCount}
}

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1}
    case 'decrement':
      return {count: state.count - 1}
    case 'reset':
      return init(action.payload)
    default:
      throw new Error()
  }
}

function Counter({initialCount}) {
  // state here would be from cache if it exists as a non-null value
  const [state, dispatch] = useReducer(reducer, initialCount, init)
  return (
    <>
      Count: {state.count}
      <button
        onClick={() => dispatch({type: 'reset', payload: initialCount})}>
        Reset
      </button>
      <button onClick={() => dispatch({type: 'increment'})}>+</button>
      <button onClick={() => dispatch({type: 'decrement'})}>-</button>
    </>
  )
}
```
