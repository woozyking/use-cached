import { useState, useEffect } from 'react'
import lscache from 'lscache'

/**
 * Wraps useState using cache get for initial value population.
 * setState triggers a cache set.
 *
 * @param {string} key - Cache key.
 * @param {number} [ttl = null]
 *  [Optional] Cache expiration in minutes.
 * @param {function} [lazy = null]
 *  [Optional] Same as the functional argument passed to useState(fn) for lazy initial state.
 *  It's only effective when there's no cached value by given key.
 *
 * @return [state, setState]
 */
export function useCachedState(key, ttl = null, lazy = null) {
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }

  let initialState = lscache.get(key)
  if (!initialState && lazy && typeof lazy === 'function') {
    initialState = lazy
  }
  const [state, setState] = useState(initialState)

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
