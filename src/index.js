import { useCallback, useEffect, useReducer, useRef, useState } from "react";

const SUPPORTED_HOOKS = new Set([useState, useReducer]);
const DEFAULT_UNIT_MS = 60_000; // compatible with lscache behaviour
const isBrowser = typeof window !== "undefined" && !!window.localStorage; // SSR guardrail
const isDev = process.env.NODE_ENV !== "production";

const warn = (msg, e) => {
  if (isDev) {
    console.warn(`[cached] ${msg}`, e);
  }
};

const noop = () => {};

const readCache = (key) => {
  if (!isBrowser) {
    return undefined;
  }

  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return undefined;
    }

    const { value, expiry } = JSON.parse(raw);
    if (expiry && Date.now() > expiry) {
      window.localStorage.removeItem(key);
      return undefined;
    }
    return { value }; // null/undefined values survive round-trip
  } catch (e) {
    warn(`read failed for "${key}"`, e);
    return undefined;
  }
};

const writeCache = (key, value, ttl, unit) => {
  if (!isBrowser) {
    return;
  }

  try {
    const expiry = ttl != null ? Date.now() + ttl * unit : null;
    window.localStorage.setItem(key, JSON.stringify({ value, expiry }));
  } catch (e) {
    warn(`write failed for "${key}" (storage full?)`, e);
  }
};

const dropCache = (key) => {
  if (!isBrowser) {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (e) {
    warn(`remove failed for "${key}"`, e);
  }
};

export function cached(...params) {
  const opts =
    params[0] && typeof params[0] === "object"
      ? params[0]
      : { key: params[0], ttl: params[1], ttlMS: params[2] };
  const { key = null, ttl = null, ttlMS = null } = opts;

  // passthrough: cached() with no key returns the hook untouched + noop remove.
  if (key === null) {
    return (hook) =>
      (...args) => {
        const [s, d] = hook(...args);
        return [s, d, noop];
      };
  }

  if (typeof key !== "string" || key.trim() === "") {
    throw new Error("`key` must be a non-empty string.");
  }
  if (
    ttl !== null &&
    (typeof ttl !== "number" || !Number.isFinite(ttl) || ttl < 0)
  ) {
    throw new Error("`ttl` must be null or a non-negative finite number.");
  }
  if (
    ttlMS !== null &&
    (typeof ttlMS !== "number" || !Number.isFinite(ttlMS) || ttlMS <= 0)
  ) {
    throw new Error("`ttlMS` must be null or a positive finite number.");
  }
  const unit = ttlMS ?? DEFAULT_UNIT_MS;

  return (hook) => {
    if (!SUPPORTED_HOOKS.has(hook)) {
      throw new Error("`cached` only supports useState and useReducer.");
    }
    const isStateHook = hook === useState;

    return (...args) => {
      const init = isStateHook
        ? () => {
            const hit = readCache(key);
            if (hit) {
              return hit.value;
            }
            return typeof args[0] === "function" ? args[0]() : args[0];
          }
        : (initialArg) => {
            const hit = readCache(key);
            if (hit) {
              return hit.value;
            }
            return typeof args[2] === "function"
              ? args[2](initialArg)
              : initialArg;
          };

      const [state, dispatch] = hook(
        ...(isStateHook ? [init] : [args[0], args[1], init]),
      );

      // skip the no-op initial write; the first useful write is the first state change.
      const firstRun = useRef(true);
      useEffect(() => {
        if (firstRun.current) {
          firstRun.current = false;
          return;
        }
        writeCache(key, state, ttl, unit);
      }, [state]);

      const remove = useCallback(() => dropCache(key), []);
      return [state, dispatch, remove];
    };
  };
}

export default cached;
