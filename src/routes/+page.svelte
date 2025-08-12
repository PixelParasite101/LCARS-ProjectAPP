<script lang="ts">
  import { missions, metrics, nano } from '$lib/stores/missions';
  import { get } from 'svelte/store';
  let q=''; let showMission=false; let showTask=false; let taskMissionId='';
  let draftMission={ id:nano(), name:'', dept:'Engineering', priority:2, status:'Active', due:new Date().toISOString().slice(0,10), tasks:[] } as any;
  let draftTask={ id:nano(), title:'', status:'To Do' } as any;

  function addMission(){ missions.update(list=>[{...draftMission, id:nano()}, ...list]); resetMission(); }
  function addTask(){ if(!taskMissionId) return; missions.update(list=> list.map(m=> m.id===taskMissionId?{...m,tasks:[{...draftTask,id:nano()},...m.tasks]}:m)); resetTask(); }
  function resetMission(){ draftMission={ id:nano(), name:'', dept:'Engineering', priority:2, status:'Active', due:new Date().toISOString().slice(0,10), tasks:[] }; showMission=false; }
  function resetTask(){ draftTask={ id:nano(), title:'', status:'To Do' }; showTask=false; }
  const days = (iso:string)=> Math.ceil((new Date(iso).getTime()-Date.now())/86400000);
  $: list = get(missions).filter(m=> (m.name+m.dept+m.status+m.priority+m.due+m.tasks.map(t=>t.title).join(' ')).toLowerCase().includes(q.toLowerCase()));
</script>

<section class="grid" style="grid-template-columns:420px 1fr">
  <div class="panel">
    <div class="panel-title">Overview</div>
    <div class="kpi" style="border:2px solid var(--blue2);border-radius:16px;padding:10px;margin-bottom:10px">
      <div style="color:var(--dim);font-size:12px;margin-bottom:6px">Åbne opgaver</div>
      <div class="mono" style="font-size:18px;margin-bottom:6px">{$metrics.tasksOpen} / {$metrics.tasksAll}</div>
      <svg viewBox="0 0 100 18" class="bar" style="width:100%;height:18px">
        <path d="M0 0 H100 V18 H0 Z" fill="#0b0b0b" />
        <path d="M0 0 H{100*($metrics.tasksAll?($metrics.tasksAll-$metrics.tasksOpen)/$metrics.tasksAll:0)} V18 H0 Z" fill="var(--line)" />
      </svg>
    </div>

    <div class="panel-title">Handling</div>
    <div style="display:flex;gap:10px;margin:6px 0">
      <button class="btn accent" on:click={()=>showMission=true}>+ Ny mission</button>
      <button class="btn ghost" on:click={()=>showTask=true}>+ Ny opgave</button>
    </div>

    <input class="btn" style="width:100%;background:#0b0b0b;border-color:#caa07a" placeholder="Søg missioner…" bind:value={q} />
  </div>

  <div class="panel">
    <div class="panel-title">Projekter (missioner)</div>
    {#if list.length===0}
      <div class="empty">Ingen missioner fundet.</div>
    {:else}
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">
        {#each list as m}
          <article class="row" style="display:block">
            <header style="display:flex;gap:6px;align-items:center">
              <div class="badge dept {m.dept.toLowerCase()}">{m.dept}</div>
              <div style="flex:1"></div>
              <div class="badge prio p{m.priority}">P{m.priority}</div>
              <div class="badge status {m.status.toLowerCase()}">{m.status}</div>
            </header>
            <h3 style="margin:8px 0 6px 0">{m.name}</h3>
            <div style="display:flex;gap:8px"><span style="color:var(--dim);min-width:82px">Deadline</span>
              <span class="mono">{new Date(m.due).toISOString().slice(0,10)} {#if days(m.due)<0}<span style="color:#ff8a8a">({days(m.due)} d)</span>{:else}<span style="color:var(--dim)">(+{days(m.due)} d)</span>{/if}</span>
            </div>
            <div style="display:flex;gap:8px"><span style="color:var(--dim);min-width:82px">Opgaver</span>
              <span>{m.tasks.filter(t=>t.status!=='Done').length} åben / {m.tasks.length} total</span>
            </div>
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
              {#each m.tasks.slice(0,4) as t}
                <span class="btn tiny" class:ghost={t.status==='Done'}>{t.title}</span>
              {/each}
              {#if m.tasks.length>4}<span style="color:var(--dim);font-size:12px;align-self:center">+{m.tasks.length-4} flere</span>{/if}
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</section>

<!-- Mission modal -->
{#if showMission}
  <div class="modal" on:click={()=>(showMission=false)}>
    <div class="dialog" on:click|stopPropagation>
      <h3>Ny mission</h3>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px;margin:8px 0">
        <label>Navn<input bind:value={draftMission.name}></label>
        <label>Afdeling<select bind:value={draftMission.dept}><option>Engineering</option><option>Science</option><option>Command</option></select></label>
        <label>Prioritet<select bind:value={draftMission.priority}><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option></select></label>
        <label>Status<select bind:value={draftMission.status}><option>Active</option><option>Hold</option><option>Done</option></select></label>
        <label style="grid-column:1/-1">Deadline<input type="date" bind:value={draftMission.due}></label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn accent" on:click={addMission}>Opret</button><button class="btn ghost" on:click={()=>(showMission=false)}>Luk</button></div>
    </div>
  </div>
{/if}

<!-- Task modal -->
{#if showTask}
  <div class="modal" on:click={()=>(showTask=false)}>
    <div class="dialog" on:click|stopPropagation>
      <h3>Ny opgave</h3>
      <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px;margin:8px 0">
        <label style="grid-column:1/-1">Mission<select bind:value={taskMissionId}><option value="" disabled selected>Vælg mission…</option>{#each $missions as m}<option value={m.id}>{m.name}</option>{/each}</select></label>
        <label style="grid-column:1/-1">Titel<input bind:value={draftTask.title}></label>
        <label>Status<select bind:value={draftTask.status}><option>To Do</option><option>In Progress</option><option>Done</option></select></label>
      </div>
      <div style="display:flex;gap:8px;justify-content:flex-end"><button class="btn accent" on:click={addTask}>Tilføj</button><button class="btn ghost" on:click={()=>(showTask=false)}>Luk</button></div>
    </div>
  </div>
{/if}

<style>
.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px}
.dialog{background:#0b0b0b;border:2px solid var(--line);border-radius:18px;padding:14px;min-width:320px;max-width:90vw}
</style>