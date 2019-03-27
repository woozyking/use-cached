import { renderHook, cleanup, act } from 'react-hooks-testing-library'
import lscache from 'lscache'

import { cachedState, cachedReducer } from '../src'

const CACHE_KEY = 'test_key_' + Math.random()

afterEach(() => {
  lscache.flush()
  lscache.setExpiryMilliseconds(60000)
  return cleanup()
})

describe('invalid key throws an error', () => {
  test.each([
    cachedState,
    cachedReducer,
  ].map(fn => ([
    '',
    null,
    undefined,
    123,
    () => {},
    true,
    Symbol(CACHE_KEY),
  ].map(key => ([fn, key])))).flat())('fn = %p, key = %p', (fn, key) => {
    expect(() => { fn(key)() }).toThrow()
  })
})

describe('cachedState', () => {
  describe('returned hook should return [state, setState]', () => {
    const value = Math.random()
    test.each([
      [CACHE_KEY, null, null, null],
      [CACHE_KEY, 50, null, null],
      [CACHE_KEY, null, value, value],
      [CACHE_KEY, 50, value, value],
      [CACHE_KEY, 50, () => value, value],
    ])('cachedState(%p, %p)(%p)', (key, ttl, initialState, expected) => {
      const { result } = renderHook(() => cachedState(key, ttl)(initialState))
      expect(result.current[0]).toBe(expected)
      expect(typeof result.current[1]).toBe('function')
    })
  })

  describe('setState should update state and set cache', () => {
    const value = Math.random()

    test.each([
      [null, value, value],
      [1, (prev) => prev + 1, 2],
    ])('initialState = %p, setState(%p)', (initialState, update, expected) => {
      const { result } = renderHook(() => cachedState(CACHE_KEY)(initialState))
      act(() => result.current[1](update))
      expect(result.current[0]).toBe(expected)
      expect(lscache.get(CACHE_KEY)).toBe(expected)
    })
  })

  test('null cached value after expiration', (done) => {
    lscache.setExpiryMilliseconds(1)
    const ttl = 50
    const { result } = renderHook(() => cachedState(CACHE_KEY, ttl)())
    const value = Math.random()

    act(() => result.current[1](() => value))
    expect(result.current[0]).toBe(value)
    expect(lscache.get(CACHE_KEY)).toBe(value)

    setTimeout(() => {
      expect(result.current[0]).toBe(value)
      expect(lscache.get(CACHE_KEY)).toBe(null)
      done()
    }, ttl)
  })

  describe('initialState', () => {
    test('null cache, value initialState', () => {
      const value = Math.random()
      const { result } = renderHook(() => cachedState(CACHE_KEY)(value))
      expect(result.current[0]).toBe(value)
    })

    test('null cache, functional initialState', () => {
      const value = Math.random()
      const initialState = () => value
      const { result } = renderHook(() => cachedState(CACHE_KEY)(initialState))
      expect(result.current[0]).toBe(value)
    })

    test('non-null cache, value initialState disregarded', () => {
      const value = Math.random()
      const initialState = value + 1
      lscache.set(CACHE_KEY, value)
      const { result } = renderHook(() => cachedState(CACHE_KEY)(initialState))
      expect(result.current[0]).toBe(value)
    })

    test('non-null cache, functional initialState disregarded', () => {
      const value = Math.random()
      const initialState = () => value + 1
      lscache.set(CACHE_KEY, value)
      const { result } = renderHook(() => cachedState(CACHE_KEY)(initialState))
      expect(result.current[0]).toBe(value)
    })
  })
})

describe('cachedReducer', () => {

})
