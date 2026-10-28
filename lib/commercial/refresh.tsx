"use client";
import { useEffect, type DependencyList, type EffectCallback } from "react";
export function useRefreshableEffect(
  effect: EffectCallback,
  deps: DependencyList,
) {
  useEffect(effect, deps);
}
