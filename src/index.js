import { useState } from 'react'
import lscache from 'lscache'

/**
 * Wraps useState using cache get for initial value population.
 * setState triggers a cache set.
 *
 * @param {string} key - Cache key.
 * @param {number} [ttl = null]
 *  [Optional] Cache expiration in minutes.
 * @param {} [initialState = null]
 *  [Optional] Same as the initial state (value|function) supplied to useState. Only effective when cached value is null.
 *
 * @return [state, setState]
 */
export function useCachedState(key, ttl = null, initialState = null) {
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }

  let cachedInit = lscache.get(key)
  if (!cachedInit) {
    if (typeof initialState === 'function') {
      cachedInit = initialState()
    } else {
      cachedInit = initialState
    }
    lscache.set(key, cachedInit, ttl)
  }

  const [state, setState] = useState(cachedInit)

  const setCachedState = (newState, time = ttl) => {
    let value = newState
    if (typeof newState === 'function') {
      // get new state value on functional updates
      value = newState(state)
    }
    lscache.set(key, value, time)
    return setState(newState)
  }

  return [state, setCachedState]
}
