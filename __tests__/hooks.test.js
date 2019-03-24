import { renderHook, cleanup, act } from 'react-hooks-testing-library'
import lscache from 'lscache'

import { useStateLS } from '../src'

jest.useFakeTimers()

afterEach(() => {
  lscache.flush()
  return cleanup()
})

it('should create [state, setState] pair', () => {
  const { result: { current: [state, setState] } } = renderHook(() => useStateLS('test_key'))
  expect(state).toBe(null)
  expect(typeof setState).toBe('function')
})

it('should update state by invoking setState', () => {
  const { result } = renderHook(() => useStateLS('test_key'))
  const value = Math.random()
  act(() => result.current[1](value))
  expect(result.current[0]).toBe(value)
})

it('should set lscache value with setState(value)', () => {
  const { result } = renderHook(() => useStateLS('test_key'))
  const value = Math.random()
  act(() => result.current[1](value))
  expect(result.current[0]).toBe(value)
  expect(lscache.get('test_key')).toBe(value)
})

it('should set lscache value with setState functional update', () => {
  const key = 'test_key'
  const { result } = renderHook(() => useStateLS(key))
  const value = Math.random()
  act(() => result.current[1](() => value))
  expect(result.current[0]).toBe(value)
  expect(lscache.get(key)).toBe(value)
  act(() => result.current[1]((prev) => prev + 1))
  expect(result.current[0]).toBe(value + 1)
})

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
it('should have in-memory state intact, while lscache value as null after its ttl expired', (done) => {
  lscache.setExpiryMilliseconds(1)
  const ttl = 500
  const key = 'test_key'
  const { result } = renderHook(() => useStateLS(key, ttl))
  const value = Math.random()

  act(() => result.current[1](() => value))
  expect(result.current[0]).toBe(value)
  expect(lscache.get(key)).toBe(value)

  setTimeout(() => {
    expect(result.current[0]).toBe(value)
    expect(lscache.get(key)).toBe(null)
    done()
  }, ttl)
})
