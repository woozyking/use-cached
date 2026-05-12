import { useReducer, useState } from "react";
import cached from "./index.js";

export default {
  title: "cached",
};

export const BasicUseState = {
  render: () => {
    // cached useState
    const useCachedState = cached({ key: "sb_user_name" })(useState);
    const [name, setName, removeCache] = useCachedState("Guest");

    // demo rendering
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <p>
          Refresh the page. The value will persist in <code>localStorage</code>.
        </p>
        <div style={{ display: "flex", gap: "10px" }}>
          <input value={name} onChange={(e) => setName(e.target.value)} />
          <button type="button" onClick={removeCache}>
            Clear Cache
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        language: "jsx",
        code: `
import { useState } from "react";
import { cached } from "use-cached";

const useCachedState = cached({ key: "app_user_name" })(useState);

function BasicStateDemo() {
  const [name, setName, removeCache] = useCachedState("Guest");

  return (
    <>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button onClick={removeCache}>Clear Cache</button>
    </>
  );
}
        `.trim(),
      },
    },
  },
};

export const WithExpirationTTL = {
  render: () => {
    // cached useState with expiration TTL
    const useExpiringState = cached({
      key: "sb_temp_count",
      ttl: 5,
      ttlMS: 1000,
    })(useState);
    const [count, setCount] = useExpiringState(0);

    // demo rendering
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <p>Increment this, wait 5 seconds, and refresh. It will revert to 0.</p>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <strong>{count}</strong>
          <button type="button" onClick={() => setCount((c) => c + 1)}>
            Increment
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        language: "jsx",
        code: `
import { useState } from "react";
import { cached } from "use-cached";

// Expires in 5 seconds (ttl: 5, ttlMS: 1000ms)
const useExpiringState = cached({
  key: "app_temp_count",
  ttl: 5,
  ttlMS: 1000,
})(useState);

function ExpiringCounter() {
  const [count, setCount] = useExpiringState(0);

  return (
    <button onClick={() => setCount((c) => c + 1)}>
      Increment: {count}
    </button>
  );
}
        `.trim(),
      },
    },
  },
};

export const UsingUseReducer = {
  render: () => {
    // Reducer logic
    const counterReducer = (state, action) => {
      switch (action.type) {
        case "INCREMENT":
          return { count: state.count + 1 };
        case "DECREMENT":
          return { count: state.count - 1 };
        case "RESET":
          return { count: 0 };
        default:
          return state;
      }
    };

    // cached useReducer
    const useCachedReducer = cached({ key: "sb_counter_reducer" })(useReducer);
    const [state, dispatch, removeCache] = useCachedReducer(counterReducer, {
      count: 0,
    });

    // demo rendering
    return (
      <div style={{ fontFamily: "sans-serif", padding: "20px" }}>
        <p>
          Cached <code>useReducer</code> state.
        </p>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <strong>{state.count}</strong>
          <button type="button" onClick={() => dispatch({ type: "INCREMENT" })}>
            +
          </button>
          <button type="button" onClick={() => dispatch({ type: "DECREMENT" })}>
            -
          </button>
          <button type="button" onClick={() => dispatch({ type: "RESET" })}>
            Reset
          </button>
          <button type="button" onClick={removeCache}>
            Clear Cache
          </button>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      source: {
        language: "jsx",
        code: `
import { useReducer } from "react";
import { cached } from "use-cached";

const useCachedReducer = cached({ key: "app_counter_reducer" })(useReducer);

const counterReducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT': return { count: state.count + 1 };
    case 'DECREMENT': return { count: state.count - 1 };
    case 'RESET': return { count: 0 };
    default: return state;
  }
};

function ReducerDemo() {
  const [state, dispatch, removeCache] = useCachedReducer(counterReducer, { count: 0 });

  return (
    <>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'DECREMENT' })}>-</button>
      <button onClick={() => dispatch({ type: 'RESET' })}>Reset</button>
      <button onClick={removeCache}>Clear Cache</button>
    </>
  );
}
        `.trim(),
      },
    },
  },
};
