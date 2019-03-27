# use-cached

Custom [React hooks](https://reactjs.org/docs/hooks-custom.html) built on top of [lscache](https://github.com/pamelafox/lscache) to provide seamless caching integration.

## Hooks

### `useCachedState(key: string, ttl?: number)`

Returns a cache-enabled counterpart of the native [`useState`](https://reactjs.org/docs/hooks-state.html).

```jsx
import React from 'react'
import { cachedState, cachedReducer } from 'use-cached'


const MyComponent = (props) => {
  const useCachedState = cachedState(key, ttl)
  const [state, setState] = useCached(initialState)
  // initialState is disregarded if there is cached value under given key

  const useCachedReducer = cachedReducer(key, ttl)
  const [state, dispatch] = useCachedReducer(reducer, initialArgs, init)
  // initialArgs is disregarded if there's cached value under given key
}

export default MyComponent
```

### `useCachedReducer` - WIP
