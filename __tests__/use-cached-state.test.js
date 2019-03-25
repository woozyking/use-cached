import { renderHook, cleanup, act } from 'react-hooks-testing-library'
import lscache from 'lscache'

import { useCachedState } from '../src'

const CACHE_KEY = 'test_key_' + Math.random()

afterEach(() => {
  lscache.flush()
  lscache.setExpiryMilliseconds(60000)
  return cleanup()
})

describe('useCachedState should throw an error on invalid key', () => {
  test.each([
    [''],
    [null],
    [undefined],
    [123],
    [() => {}],
    [true],
    [Symbol(CACHE_KEY)],
  ])('key = %p', (key) => {
    expect(() => { useCachedState(key) }).toThrow()
  })
})

describe('useCachedState should return [state, setState]', () => {
  const value = Math.random()
  test.each([
    [CACHE_KEY, null, null, null],
    [CACHE_KEY, 50, null, null],
    [CACHE_KEY, null, value, value],
    [CACHE_KEY, 50, value, value],
    [CACHE_KEY, 50, () => value, value],
  ])('useCachedState(%p, %p, %p)', (key, ttl, initialState, expected) => {
    const { result } = renderHook(() => useCachedState(key, ttl, initialState))
    expect(result.current[0]).toBe(expected)
    expect(typeof result.current[1]).toBe('function')
  })
})

describe('setState should update state and set cache', () => {
  test('setState(value)', () => {
    const { result } = renderHook(() => useCachedState(CACHE_KEY))
    const value = Math.random()

    act(() => result.current[1](value))
    expect(result.current[0]).toBe(value)
    expect(lscache.get(CACHE_KEY)).toBe(value)
  })

  test('setState(function)', () => {
    const { result } = renderHook(() => useCachedState(CACHE_KEY))
    const value = Math.random()

    act(() => result.current[1](() => value))
    expect(result.current[0]).toBe(value)
    expect(lscache.get(CACHE_KEY)).toBe(value)

    act(() => result.current[1]((prev) => prev + 1))
    expect(result.current[0]).toBe(value + 1)
    expect(lscache.get(CACHE_KEY)).toBe(value + 1)

    act(() => result.current[1]((prev) => prev * 10))
    expect(result.current[0]).toBe((value + 1) * 10)
    expect(lscache.get(CACHE_KEY)).toBe((value + 1) * 10)
  })
})

describe('intact state, and null cached value after TTL expires', () => {
  test('using TTL initialized by useCachedState()', (done) => {
    lscache.setExpiryMilliseconds(1)
    const ttl = 50
    const { result } = renderHook(() => useCachedState(CACHE_KEY, ttl))
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

  test('using TTL set by setState()', (done) => {
    lscache.setExpiryMilliseconds(1)
    const ttl = 60
    const { result } = renderHook(() => useCachedState(CACHE_KEY))
    const value = Math.random()

    act(() => result.current[1](() => value, ttl))
    expect(result.current[0]).toBe(value)
    expect(lscache.get(CACHE_KEY)).toBe(value)

    setTimeout(() => {
      expect(result.current[0]).toBe(value)
      expect(lscache.get(CACHE_KEY)).toBe(null)
      done()
    }, ttl)
  })
})

describe('initialState', () => {
  test('null cache, value initialState', () => {
    const value = Math.random()
    const { result } = renderHook(() => useCachedState(CACHE_KEY, null, value))
    expect(result.current[0]).toBe(value)
  })

  test('null cache, functional initialState', () => {
    const value = Math.random()
    const initialState = () => value
    const { result } = renderHook(() => useCachedState(CACHE_KEY, null, initialState))
    expect(result.current[0]).toBe(value)
  })

  test('non-null cache, value initialState disregarded', () => {
    const value = Math.random()
    const initialState = value + 1
    lscache.set(CACHE_KEY, value)
    const { result } = renderHook(() => useCachedState(CACHE_KEY, null, initialState))
    expect(result.current[0]).toBe(value)
  })

  test('non-null cache, functional initialState disregarded', () => {
    const value = Math.random()
    const initialState = () => value + 1
    lscache.set(CACHE_KEY, value)
    const { result } = renderHook(() => useCachedState(CACHE_KEY, null, initialState))
    expect(result.current[0]).toBe(value)
  })
})
