import { renderHook, cleanup, act } from 'react-hooks-testing-library'
import React, { useState, useReducer, useEffect } from 'react'
import lscache from 'lscache'

import { cached } from '../src'

const CACHE_KEY = 'test_key_' + Math.random()

afterEach(() => {
  lscache.flush()
  lscache.setExpiryMilliseconds(60000)
  return cleanup()
})

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

describe('argument validations', () => {
  const keys = ['', null, undefined, 123, () => {}, true, Symbol(CACHE_KEY)]
  test.each(
    keys.map(key => [
      [{ key }],
      [key],
    ]).flat()
  )('key: %p', (opts) => {
    expect(() => { cached(...opts)(useState)() }).toThrow()
  })

  const ttls = ['', undefined, -123, () => {}, true, Symbol(CACHE_KEY)]
  test.each(
    ttls.map(ttl => [
      [{ key: CACHE_KEY, ttl }],
      [CACHE_KEY, ttl],
    ]).flat()
  )('ttl: %p', (opts) => {
    expect(() => { cached(...opts)(useState)() }).toThrow()
  })

  const fns = ['', null, undefined, 123, () => {}, true, Symbol(CACHE_KEY), useEffect]
  test.each(
    fns.map(fn => [
      [CACHE_KEY],
      [{ key: CACHE_KEY }],
    ].map(opts => [fn, opts])).flat()
  )('fn: %p', (fn, opts) => {
    expect(() => { cached(...opts)(fn)() }).toThrow()
  })
})

describe('returned hook should return [state, method, remove]', () => {
  const value = Math.random()
  const ttls = [Math.ceil(value * 10), null]
  const hooks = Object.entries({
    useState: {
      args: [[value], [() => value]],
      matcher: 'toBe',
      expected: value,
    },
    useReducer: {
      args: [[reducer, init(value)], [reducer, value, init]],
      matcher: 'toEqual',
      expected: init(value),
    },
  })
  test.each(
    ttls.map(ttl =>
      hooks.map(([hook, { args, matcher, expected }]) =>
        args.map(a => [
          [[CACHE_KEY, ttl], React[hook], a, matcher, expected],
          [[{ key: CACHE_KEY, ttl }], React[hook], a, matcher, expected],
        ])
      )
    ).flat(3)
  )('cached(CACHE_KEY, %p)(%p)(...%p)', (opt, hook, args, matcher, expected) => {
    const { result } = renderHook(() => cached(...opt)(hook)(...args))
    expect(result.current[0])[matcher](expected)
    expect(typeof result.current[1]).toBe('function')
    expect(typeof result.current[2]).toBe('function')
  })
})

describe('non-null cached value, initialState|initialArgs, init is disregarded', () => {
  const value = Math.random()
  const hooks = Object.entries({
    useState: {
      args: [[value + 1], [() => value + 1]],
      matcher: 'toBe',
      expected: value,
    },
    useReducer: {
      args: [[reducer, { count: value + 1 }], [reducer, value + 1, init]],
      matcher: 'toEqual',
      expected: { count: value },
    },
  })
  test.each(
    hooks.map(([hook, { args, matcher, expected }]) =>
      args.map(a => [
        [[CACHE_KEY], React[hook], a, matcher, expected],
        [[{ key: CACHE_KEY }], React[hook], a, matcher, expected],
      ])
    ).flat(2)
  )('cached(CACHE_KEY)(%p)(...%p)', (opts, hook, args, expected) => {
    lscache.set(CACHE_KEY, expected)
    const { result } = renderHook(() => cached(...opts)(hook)(...args))
    expect(result.current[0]).toEqual(expected)
  })
})

describe('setState|dispatch should update state and cache', () => {
  const value = Math.random()
  // TODO: more cases
  test.each([
    [useState, [value], [value + 1], value + 1, 'toBe'],
    [useState, [() => value], [(prev) => prev - 1], value - 1, 'toBe'],
    [useReducer, [reducer, init(value)], [{ type: 'decrement' }], { count: value - 1 }, 'toEqual'],
  ].map(params => [
    [[{ key: CACHE_KEY }], ...params],
    [[CACHE_KEY], ...params],
  ]).flat())('%p(...%p), update(...%p), %p', (opts, hook, i, u, e, matcher) => {
    const { result } = renderHook(() => cached(...opts)(hook)(...i))
    act(() => result.current[1](...u))
    expect(result.current[0])[matcher](e)
    expect(lscache.get(CACHE_KEY))[matcher](e)
  })
})

describe('null cached value after TTL expiration', () => {
  const value = Math.random()
  const ttl = 50
  test.each([
    [useState, [value], value, 'toBe'],
    [useState, [() => value], value, 'toBe'],
    [useReducer, [reducer, init(value)], init(value), 'toEqual'],
    [useReducer, [reducer, value, init], init(value), 'toEqual'],
  ].map(params => [
    [[{ key: CACHE_KEY, ttl, ttlMS: 1 }], ...params],
    [[CACHE_KEY, ttl, 1], ...params],
  ]).flat())('cached(CACHE_KEY, 50ms)(%p)(...%p)', (opts, hook, args, expected, matcher, done) => {
    const { result } = renderHook(() => cached(...opts)(hook)(...args))

    expect(result.current[0])[matcher](expected)
    expect(lscache.get(CACHE_KEY))[matcher](expected)

    setTimeout(() => {
      expect(result.current[0])[matcher](expected)
      expect(lscache.get(CACHE_KEY)).toBe(null)
      done()
    }, ttl * 2)
  })
})

describe('programmatic cache removal should not impact current state, but only cache', () => {
  const value = Math.random()
  test.each([
    [useState, [value], [value + 1], value + 1, 'toBe'],
    [useState, [() => value], [(prev) => prev - 1], value - 1, 'toBe'],
    [useReducer, [reducer, init(value)], [{ type: 'decrement' }], { count: value - 1 }, 'toEqual'],
  ].map(params => [
    [[{ key: CACHE_KEY }], ...params],
    [[CACHE_KEY], ...params],
  ]).flat())('%p(...%p), update(...%p), %p', (opts, hook, i, u, e, matcher) => {
    const { result } = renderHook(() => cached(...opts)(hook)(...i))
    act(() => result.current[1](...u))
    expect(result.current[0])[matcher](e)
    expect(lscache.get(CACHE_KEY))[matcher](e)
    act(() => result.current[2]())
    expect(result.current[0])[matcher](e)
    expect(lscache.get(CACHE_KEY))[matcher](null)
  })
})
