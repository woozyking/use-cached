import { renderHook, cleanup, act } from 'react-hooks-testing-library'
import lscache from 'lscache'

import { useCachedState } from '../src'

const CACHE_KEY = 'test_key_' + Math.random()

afterEach(() => {
  lscache.flush()
  return cleanup()
})

it('should create [state, setState] pair', () => {
  const { result: { current: [state, setState] } } = renderHook(() => useCachedState(CACHE_KEY))
  expect(state).toBe(null)
  expect(typeof setState).toBe('function')
})

it('should update state and set cache by invoking setState(value)', () => {
  const { result } = renderHook(() => useCachedState(CACHE_KEY))
  const value = Math.random()

  act(() => result.current[1](value))
  expect(result.current[0]).toBe(value)
  expect(lscache.get(CACHE_KEY)).toBe(value)
})

it('should update state and set cache by invoking setState(function)', () => {
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

it('should have in-memory state intact, while lscache value as null after its ttl expired', (done) => {
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
