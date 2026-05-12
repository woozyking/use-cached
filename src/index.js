import { useCallback, useEffect, useReducer, useState } from "react";

const SUPPORTED_HOOKS = [useState, useReducer];

const getCachedItem = (key) => {
  try {
    const itemStr = window.localStorage.getItem(key);
    if (!itemStr) {
      return null;
    }

    const item = JSON.parse(itemStr);
    // TTL Check: Remove and return null if expired
    if (item.expiry && Date.now() > item.expiry) {
      window.localStorage.removeItem(key);
      return null;
    }
    return item.value;
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
    return null;
  }
};

const setCachedItem = (key, value, ttl, ttlMS) => {
  try {
    // Replicating lscache behavior: ttlMS acts as the base unit multiplier.
    // Default unit is typically 1 minute (60000ms).
    const unit =
      ttlMS && !Number.isNaN(parseInt(ttlMS, 10)) && ttlMS > 0 ? ttlMS : 60000;
    const expiry = ttl !== null ? Date.now() + ttl * unit : null;

    window.localStorage.setItem(key, JSON.stringify({ value, expiry }));
  } catch (e) {
    console.warn("Failed to save to localStorage (might be full):", e);
  }
};

/**
 * Higher order function that configures and returns a modified version of
 * the given supported hook
 */
export function cached(...params) {
  let key, ttl, ttlMS;

  if (typeof params[0] === "object" && params[0] !== null) {
    ({ key = null, ttl = null, ttlMS = null } = params[0]);
  } else {
    [key = null, ttl = null, ttlMS = null] = params;
  }

  // Return unmodded hook when no key is provided
  if (key === null) {
    return (hook) =>
      (...args) => [...hook(...args), () => {}];
  }

  // Argument validations
  if (typeof key !== "string" || key.trim() === "") {
    throw new Error("key must be a non-empty string.");
  }
  if (ttl !== null && (Number.isNaN(parseFloat(ttl)) || ttl < 0)) {
    throw new Error("ttl can only be null or a positive number.");
  }

  return (hook) => {
    if (typeof hook !== "function" || !SUPPORTED_HOOKS.includes(hook)) {
      throw new Error("Only useState and useReducer can be cached");
    }

    return (...args) => {
      const isStateHook = hook === useState;

      // LAZY INITIALIZATION: Ensure we only read from localStorage once on mount
      const initFunction = isStateHook
        ? () => {
            const cachedValue = getCachedItem(key);
            if (cachedValue !== null) {
              return cachedValue;
            }
            // Handle standard useState lazy init fallback
            return typeof args[0] === "function" ? args[0]() : args[0];
          }
        : (initialArg) => {
            const cachedValue = getCachedItem(key);
            if (cachedValue !== null) return cachedValue;
            // Handle standard useReducer lazy init fallback
            return typeof args[2] === "function"
              ? args[2](initialArg)
              : initialArg;
          };

      // Invoke hook with the appropriate lazy initializers
      const hookArgs = isStateHook
        ? [initFunction]
        : [args[0], args[1], initFunction];

      const [state, method] = hook(...hookArgs);

      // Internal effect to update cache when state changes
      useEffect(() => {
        setCachedItem(key, state, ttl, ttlMS);
      }, [state]);

      // Memoize the removal function to maintain referential equality
      const removeCache = useCallback(() => {
        try {
          window.localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove key "${key}" from localStorage:`, e);
        }
      }, []);

      return [state, method, removeCache];
    };
  };
}

export default cached;
