import { useEffect, useState, useReducer } from 'react'
import lscache from 'lscache'

/**
 * Higher order function that configures and returns a modified version of
 * React.useState function.
 *
 * @param {string} key cache key.
 * @param {number} [ttl = null] cache TTL/expiration. By default in minutes.
 * @returns {function(*): [any, function]} wrapped version of React.useState
 */
export const cachedState = (key, ttl = null) => (...args) => {
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }

  if (ttl !== null && isNaN(parseFloat(ttl))) {
    throw new Error('ttl can only be null or a valid number.')
  }

  const cachedState = lscache.get(key)

  const [state, action] = cachedState !== null
    ? useState(cachedState) // cachedState as initialState (value)
    : useState(...args) // initialState (value | function)

  useEffect(() => {
    lscache.set(key, state, ttl)
  }, [state, key, ttl])

  return [state, action]
}

/**
 * Higher order function that configures and returns a modified version of
 * React.useRecuder function.
 *
 * @param {string} key cache key.
 * @param {number} [ttl = null] cache TTL/expiration. By default in minutes.
 * @returns {function(*): [any, function]} wrapped version of React.useRecuder
 */
export const cachedReducer = (key, ttl = null) => (...args) => {
  if (!key || typeof key !== 'string') {
    throw new Error('key must be a non-empty string.')
  }

  if (ttl !== null && isNaN(parseFloat(ttl))) {
    throw new Error('ttl can only be null or a valid number.')
  }

  const cachedState = lscache.get(key)

  const [state, action] = cachedState !== null
    ? useReducer(args[0], cachedState, args[2]) // reducer, cachedState as initialArg, init
    : useReducer(...args) // reducer, initialArg, init

  useEffect(() => {
    lscache.set(key, state, ttl)
  }, [state, key, ttl])

  return [state, action]
}
