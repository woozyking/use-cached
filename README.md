# use-cached

Custom [React hooks](https://reactjs.org/docs/hooks-custom.html) built on top of [lscache](https://github.com/pamelafox/lscache) to provide seamless caching integration.

## Hooks

```jsx
import React from 'react'
import { cachedState, cachedReducer } from 'use-cached'


const MyComponent = (props) => {
  // get a cached version of useState
  const useCachedState = cachedState(key, ttl)
  // initialState is disregarded if there is cached value under given key
  const [state, setState] = useCached(initialState)

  // get a cached version of useReducer
  const useCachedReducer = cachedReducer(key, ttl)
  // initialArgs is disregarded if there's cached value under given key
  const [state, dispatch] = useCachedReducer(reducer, initialArgs, init)
}

export default MyComponent
```

### `useCachedReducer` - WIP
