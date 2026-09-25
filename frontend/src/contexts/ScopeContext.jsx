/* eslint-disable react-refresh/only-export-components -- Context provider and hook share one module. */
import { createContext, useContext, useEffect, useState } from "react";

// Mocked role/scope until real auth exists - a logged-in user's role and
// assigned state/district would come from the backend instead of this
// manual switcher. Persisted so a refresh doesn't reset "who you're
// viewing as" mid-demo.
const STORAGE_KEY = "userScope";
const DEFAULT_SCOPE = { role: "national", state: null, district: null };

const ScopeContext = createContext(null);

export function ScopeProvider({ children }) {
  const [scope, setScope] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved || DEFAULT_SCOPE;
    } catch {
      return DEFAULT_SCOPE;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scope));
    } catch {
      // Non-fatal if storage is unavailable.
    }
  }, [scope]);

  const setNational = () => setScope({ role: "national", state: null, district: null });
  const setStateScope = (state) => setScope({ role: "state", state, district: null });
  const setDistrictScope = (state, district) => setScope({ role: "district", state, district });

  return (
    <ScopeContext.Provider
      value={{ scope, setNational, setStateScope, setDistrictScope }}
    >
      {children}
    </ScopeContext.Provider>
  );
}

export function useScope() {
  const ctx = useContext(ScopeContext);
  if (!ctx) throw new Error("useScope must be used within a ScopeProvider");
  return ctx;
}