import React, { useState, useReducer } from 'react'

import { storiesOf } from '@storybook/react'

import cached from '../src'

const init = () => Math.floor(Math.random() * 10)

storiesOf('cached', module)
  .add('with useState', () => {
    const StateCounter = () => {
      // count here would be from cache if it exists as a non-null value
      const [count, setCount] = cached({
        key: 'USE_CACHED_USE_STATE_STORY',
        ttl: 60,
      })(useState)(init())
      return (
        <>
          Count: {count}
          <button onClick={() => setCount(init())}>Randomize</button>
          <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
          <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
        </>
      )
    }
    return (<StateCounter />)
  }, { options: { showPanel: true, panelPosition: 'bottom' } })
  .add('with useReducer', () => {
    const ReducerCounter = () => {
      const initialCount = Math.floor(Math.random() * 10)

      function init(initialCount) {
        return { count: initialCount }
      }

      function reducer(state, action) {
        switch (action.type) {
          case 'increment':
            return { count: state.count + 1 }
          case 'decrement':
            return { count: state.count - 1 }
          case 'reset':
            return init(action.payload)
          default:
            throw new Error()
        }
      }

      // state here would be from cache if it exists as a non-null value
      const [state, dispatch] = cached({
        key: 'USE_CACHED_USE_REDUCER_STORY',
        ttl: 60,
      })(useReducer)(reducer, initialCount, init)
      return (
        <>
          Count: {state.count}
          <button
            onClick={() => dispatch({ type: 'reset', payload: initialCount })}>
            Randomize
          </button>
          <button onClick={() => dispatch({ type: 'increment' })}>+</button>
          <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
        </>
      )
    }
    return (<ReducerCounter />)
  }, { options: { showPanel: true, panelPosition: 'bottom' } })
  .add('programmtic cache removal', () => {
    const StateCounter = () => {
      const init = () => Math.floor(Math.random() * 10)
      // count here would be from cache if it exists as a non-null value
      const [count, setCount, remove] = cached({
        key: 'USE_CACHED_USE_STATE_REMOVE_STORY',
        ttl: 60,
      })(useState)(init())
      return (
        <>
          Count: {count}
          <button onClick={() => setCount(init())}>Randomize</button>
          <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
          <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
          <button onClick={() => remove()}>Cache Removal (current state intact until refresh)</button>
        </>
      )
    }
    return (<StateCounter />)
  })
  .add('No key, no cache', () => {
    const StateCounter = () => {
      const init = () => Math.floor(Math.random() * 10)
      // count here would be from cache if it exists as a non-null value
      const [count, setCount, remove] = cached()(useState)(init())
      return (
        <>
          Count: {count}
          <button onClick={() => setCount(init())}>Randomize</button>
          <button onClick={() => setCount(prevCount => prevCount + 1)}>+</button>
          <button onClick={() => setCount(prevCount => prevCount - 1)}>-</button>
          <button onClick={() => remove()}>Cache Removal (no-op without key)</button>
        </>
      )
    }
    return (<StateCounter />)
  })
