import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Crew = { id: string; name: string; role: string };
const KEY = 'lcars-crew';

function load(): Crew[] {
  if (browser) {
    const r = localStorage.getItem(KEY);
    if (r) return JSON.parse(r) as Crew[];
  }
  return [];
}

export const crew = writable<Crew[]>(load());
crew.subscribe(v => { if (browser) localStorage.setItem(KEY, JSON.stringify(v)); });
