# use-cached

Custom [React hooks](https://reactjs.org/docs/hooks-custom.html) built on top of [lscache](https://github.com/pamelafox/lscache) to provide seamless caching integration.

## Hooks

### `useCachedState(key: string, ttl?: number, initialState?: any)`

Cached counterpart of the native [`useState`](https://reactjs.org/docs/hooks-state.html).

```jsx
import React from 'react'
import { useCachedState } from 'use-cached'


const MyComponent = (props) => {
  // initialize state with value stored in 'cached_counter' cache key
  const [counter, setCounter] = useCachedState('cached_counter')

  // initialize state with a 60-minute TTL (time-to-live, or expiration time)
  const [user, setUser] = useCachedState('cached_user', 60)

  // initialize state with a initialState mirroring useState interface
  // effective only when cached value returns null
  const [s1, setS1] = useCachedState('cached_1', null, 5)
  const [s2, setS2] = useCachedState('cached_2', null, () => heavy(...args))
}

export default MyComponent
```

### `useCachedReducer` - WIP
