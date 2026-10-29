"use client";
import { useEffect, type DependencyList, type EffectCallback } from "react";
export function useRefreshableEffect(
  effect: EffectCallback,
  dependencies: DependencyList,
) {
  useEffect(() => {
    let cleanup = effect();
    const refresh = () => {
      if (document.visibilityState === "visible") {
        cleanup?.();
        cleanup = effect();
      }
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      document.removeEventListener("visibilitychange", refresh);
      cleanup?.();
    };
  }, dependencies);
}
