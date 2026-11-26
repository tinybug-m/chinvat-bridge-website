import { useSyncExternalStore } from "react";

/*
 * A tiny external store for values that change every frame (the dog's place, its box and mouth on
 * screen). Leaf components subscribe to them, so the homepage itself never re-renders on scroll.
 */
export type Store<T> = {
  get: () => T;
  set: (next: T) => void;
  subscribe: (listener: () => void) => () => void;
};

export function createStore<T>(initial: T): Store<T> {
  let value = initial;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export function useStore<T>(store: Store<T>, server: T) {
  return useSyncExternalStore(store.subscribe, store.get, () => server);
}

export type Rect = { x: number; y: number; width: number; height: number };
export type Point = { x: number; y: number };

export const rectOf = (el: Element | null | undefined): Rect | null => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, width: r.width, height: r.height };
};

/** True when two rects (or points) differ by more than `eps` CSS px on any side. */
export function moved<T extends Record<string, number>>(a: T | null, b: T | null, eps = 0.5) {
  if (!a || !b) return a !== b;
  for (const key in a) if (Math.abs(a[key] - b[key]) > eps) return true;
  return false;
}
