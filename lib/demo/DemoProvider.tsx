"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SessionUser } from "@/types/database";
import * as demo from "@/lib/demo/store";

type DemoContextValue = {
  ready: boolean;
  session: SessionUser | null;
  refresh: () => void;
  loginAs: (role: "admin" | "member" | "caregiver", largeTargets?: boolean) => void;
  logout: () => void;
  setLargeTargets: (value: boolean) => void;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<SessionUser | null>(null);

  const refresh = useCallback(() => {
    setSession(demo.getSession());
  }, []);

  useEffect(() => {
    refresh();
    setReady(true);
    const onUpdate = () => refresh();
    window.addEventListener("careroute:demo-update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("careroute:demo-update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [refresh]);

  const value = useMemo<DemoContextValue>(
    () => ({
      ready,
      session,
      refresh,
      loginAs: (role, largeTargets) => {
        demo.startDemoSession(role, largeTargets);
        refresh();
      },
      logout: () => {
        demo.endDemoSession();
        refresh();
      },
      setLargeTargets: (largeTargets) => {
        demo.updateSessionPrefs({ largeTargets });
        refresh();
      },
    }),
    [ready, session, refresh]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
