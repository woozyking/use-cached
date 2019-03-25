# use-cached

Custom [React hooks](https://reactjs.org/docs/hooks-custom.html) built on top of [lscache](https://github.com/pamelafox/lscache) to provide seemless caching integration.

## Hooks

### `useCachedState(key: string, ttl?: number, lazy?: Function)`

Cached counterpart of the native [`useState`](https://reactjs.org/docs/hooks-state.html).

```jsx
import React from 'react'
import { useCachedState } from 'use-cached'


const MyComponent = (props) => {
  // initialize state with value stored in 'cached_counter' cache key; null if not cached
  const [counter, setCounter] = useCachedState('cached_counter')

  // initialize state with a 60-minute TTL (time-to-live, or expiration time)
  const [user, setUser] = useCachedState('cached_user', 60)

  // initialize state with a lazy initializing function
  const [state, setState] = useCachedState('cached_state', null, () => {
    // this is effective when cached_state gets null value
    const initialState = someExpensiveComputation(props)
    return initialState
  })
}

export default MyComponent
```

### `useCachedReducer` - WIP
