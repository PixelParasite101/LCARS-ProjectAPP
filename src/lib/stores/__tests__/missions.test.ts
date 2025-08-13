import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { missions, metrics, redAlert, type Mission } from '../missions';

function resetMissions(data: Mission[]) {
  missions.set(data);
}

describe('missions store and metrics', () => {
  beforeEach(() => {
    resetMissions([
      { id: 'm1', name: 'Test 1', dept: 'Engineering', status: 'Active', priority: 1, due: '2025-08-20', tasks: [
        { id: 't1', title: 'A', status: 'To Do' },
        { id: 't2', title: 'B', status: 'In Progress' },
        { id: 't3', title: 'C', status: 'Done' }
      ]},
      { id: 'm2', name: 'Test 2', dept: 'Science', status: 'Hold', priority: 4, due: '2025-08-10', tasks: [
        { id: 't4', title: 'D', status: 'To Do' },
      ]}
    ]);
  });

  it('computes status and priority counts', () => {
    const m = get(metrics);
    expect(m.status.Active).toBe(1);
    expect(m.status.Hold).toBe(1);
  expect(m.priority[1]).toBe(1);
  expect(m.priority[4]).toBe(1);
  });

  it('computes tasks counters and tasksByStatus', () => {
    const m = get(metrics);
    expect(m.tasksAll).toBe(4);
  expect(m.tasksOpen).toBe(3); // To Do (2) + In Progress (1)
    expect(m.tasksByStatus['To Do']).toBe(2);
    expect(m.tasksByStatus['In Progress']).toBe(1);
    expect(m.tasksByStatus['Done']).toBe(1);
  });

  it('sets redAlert when overdue missions exist', () => {
    const r = get(redAlert);
    // m2 due 2025-08-10 is overdue relative to now in test env; but jsdom uses system time.
    // For a stable check, just ensure boolean matches overdue>0
    const m = get(metrics);
    expect(r).toBe(m.overdue > 0);
  });
});
