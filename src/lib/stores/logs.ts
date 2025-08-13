import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Log = { id: string; date: string; title: string; desc: string };
const KEY = 'lcars-logs';

function load(): Log[] {
  if (browser) {
    const r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r) as Log[];
  }
  return [];
}

export const logs = writable<Log[]>(load());
logs.subscribe(v => { if (browser) localStorage.setItem(KEY, JSON.stringify(v)); });
