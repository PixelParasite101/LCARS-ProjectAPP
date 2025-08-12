import { writable } from 'svelte/store'

/**
 * Create a Svelte writable store that persists to localStorage.
 * @template T
 * @param {string} key
 * @param {T} initial
 */
export function createPersistedStore(key, initial) {
  const data = typeof localStorage !== 'undefined' && localStorage.getItem(key)
  const start = data ? safeParse(data, initial) : initial
  const store = writable(start)
  if (typeof window !== 'undefined') {
    store.subscribe((v) => {
      try {
        localStorage.setItem(key, JSON.stringify(v))
      } catch {}
    })
  }
  return store
}

function safeParse(json, fallback) {
  try {
    return JSON.parse(json)
  } catch {
    return fallback
  }
}
