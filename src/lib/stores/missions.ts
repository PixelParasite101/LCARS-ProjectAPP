import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';

export type Task = { id:string; title:string; status:'To Do'|'In Progress'|'Done' };
export type Mission = {
  id:string; name:string; dept:'Engineering'|'Science'|'Command';
  priority:1|2|3|4; status:'Active'|'Hold'|'Done'; due:string; tasks:Task[]
};

const initial: Mission[] = [
  { id:'NX-01', name:'Warp Field Test', dept:'Engineering', priority:1, status:'Active', due:new Date(Date.now()+2*864e5).toISOString(), tasks:[
    {id:'t1', title:'Calibrate coils', status:'In Progress'},
    {id:'t2', title:'Field harmonics', status:'To Do'},
    {id:'t3', title:'Power audit', status:'Done'}
  ]},
  { id:'NCC-1701', name:'Sensor Calibration', dept:'Science', priority:2, status:'Active', due:new Date(Date.now()+5*864e5).toISOString(), tasks:[
    {id:'t4', title:'Subspace sweep', status:'In Progress'},
    {id:'t5', title:'Telemetry sync', status:'To Do'}
  ]},
  { id:'NCC-74656', name:'Planetary Survey', dept:'Command', priority:3, status:'Hold', due:new Date(Date.now()-1*864e5).toISOString(), tasks:[
    {id:'t6', title:'Orbital mapping', status:'To Do'}
  ]}
];

const KEY = 'lcars-missions-v1';
function load(){ if(browser){ const r = localStorage.getItem(KEY); if(r) return JSON.parse(r) as Mission[]; } return initial; }
export const missions = writable<Mission[]>(load());
missions.subscribe(v=>{ if(browser) localStorage.setItem(KEY, JSON.stringify(v)); });

export const metrics = derived(missions, ($m)=>{
  const status = { Active:0, Hold:0, Done:0 } as Record<Mission['status'],number>;
  const priority = { 1:0, 2:0, 3:0, 4:0 } as Record<Mission['priority'],number>;
  const tasksByStatus = { 'To Do':0, 'In Progress':0, 'Done':0 } as Record<Task['status'], number>;
  let tasksOpen=0, tasksAll=0, overdue=0; const now=new Date();
  for(const m of $m){
    status[m.status]++;
    priority[m.priority]++;
    for(const t of m.tasks){
      tasksAll++;
      if(t.status!=='Done') tasksOpen++;
      tasksByStatus[t.status]++;
    }
    if(new Date(m.due) < now && m.status!=='Done') overdue++;
  }
  return { status, priority, tasksOpen, tasksAll, overdue, tasksByStatus };
});
export const redAlert = derived(metrics, ($)=> $.overdue>0);

export const nano = ()=> Math.random().toString(36).slice(2,8)+'-'+Date.now().toString(36).slice(-3);