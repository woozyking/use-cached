import { useState, useEffect } from 'react'
import lscache from 'lscache'

import { pipe } from './utils'

/**
 * Wraps useState using localStorage get for initial value population.
 * setState triggers a localStorage set.
 *
 * @param {string} key localStorage key.
 * @param {number} ttl Optional. localStorage expiration in minutes.
 * @return [state, setState] the same way useState returns.
 */
export const useStateLS = (key, ttl = null) => {
  const [state, setState] = useState(lscache.get(key))

  const setStateLS = (newState) => {
    setState(newState)
    if (typeof newState === 'function') {
      // pipe the return value of functional argument to lscache
      pipe(newState, (value) => lscache.set(key, value, ttl))()
    } else {
      lscache.set(key, newState, ttl)
    }
  }

  return [state, setStateLS]
}

export default { useStateLS }
