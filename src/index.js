import { useState, useEffect } from 'react'
import lscache from 'lscache'

/**
 * Wraps useState using localStorage get for initial value population.
 * setState triggers a localStorage set.
 *
 * @param {string} key localStorage key.
 * @param {number} ttl Optional. localStorage expiration in minutes.
 * @return [state, setState] the same way useState returns.
 */
export const useCachedState = (key, ttl = null) => {
  const [state, setState] = useState(lscache.get(key))

  const setStateLS = (newState) => {
    let value = newState
    if (typeof newState === 'function') {
      // get new state value on functional updates
      value = newState(state)
    }
    lscache.set(key, value, ttl)
    return setState(newState)
  }

  return [state, setStateLS]
}

export default { useCachedState }
