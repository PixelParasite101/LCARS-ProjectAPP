import { browser } from '$app/environment';
import { writable } from 'svelte/store';

export type Theme = 'classic' | 'nebula';
const KEY = 'lcars-theme';

const initial: Theme = (browser && (localStorage.getItem(KEY) as Theme)) || 'classic';

export const theme = writable<Theme>(initial);

let prev: Theme | null = null;
if (browser) {
  // Ensure classic class exists on first load for SSR parity
  const el = document.documentElement;
  el.classList.add('theme-classic');
  prev = 'classic';

  theme.subscribe((t) => {
    try {
      localStorage.setItem(KEY, t);
      if (prev) el.classList.remove(`theme-${prev}`);
      el.classList.add(`theme-${t}`);
      prev = t;
    } catch {}
  });
}
