import { useEffect } from 'react'
import lscache from 'lscache'

const SUPPORTED_HOOKS = ['useState', 'useReducer']

/**
 * Higher order function that configures and returns a modified version of
 * the given supported hook
 *
 * @function cached
 *
 * @param {string} key cache key.
 * @param {number} [ttl = null] Optional cache TTL/expiration. By default in minutes.
 *
 * @returns {(hook: function) => function} wrapped version of supported React hook
 */
export function cached(key, ttl = null) {
  // argument validations
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }
  if (ttl !== null && (isNaN(parseFloat(ttl)) || ttl < 0)) {
    throw new Error('ttl can only be null or a positive number.')
  }
  return (hook) => (...args) => {
    // hook support check
    if (!hook || typeof hook !== 'function' || !SUPPORTED_HOOKS.includes(hook.name)) {
      throw new Error(`only ${SUPPORTED_HOOKS.join(' | ')} can be cached.`)
    }
    // pull cached state
    const cachedState = lscache.get(key)
    // invoke hook depending on cached state availability
    const [state, method] = cachedState === null ? hook(...args) : hook(...{
      useState: [cachedState],
      useReducer: [args[0], cachedState],
    }[hook.name])
    // internal effect to update cache
    useEffect(() => {
      lscache.set(key, state, ttl)
    }, [state, key, ttl])
    // return [state, method()[, remove()]]
    return [state, method, () => lscache.remove(key)]
  }
}

export default cached
