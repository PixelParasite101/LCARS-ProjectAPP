<script>
  import { writable, derived } from "svelte/store";

  // --- Types (JSDoc for editor help) ---
  /**
   * @typedef {{id:string,title:string,status:'To Do'|'In Progress'|'Done'}} Task
   * @typedef {{id:string,name:string,dept:'Engineering'|'Science'|'Command',priority:1|2|3|4,status:'Active'|'Hold'|'Done',due:string,tasks:Task[]}} Mission
   */

  // --- Persistent store (localStorage) ---
  function persist(key, initial) {
    const raw = typeof localStorage !== 'undefined' && localStorage.getItem(key);
    const start = raw ? JSON.parse(raw) : initial;
    const s = writable(start);
    s.subscribe(v => typeof localStorage !== 'undefined' && localStorage.setItem(key, JSON.stringify(v)));
    return s;
  }

  const demoMissions = /** @type {Mission[]} */ ([
    {
      id: "NX-01",
      name: "Warp Field Test",
      dept: "Engineering",
      priority: 1,
  status: "Active",
  due: new Date(Date.now() + 1000*60*60*24*2).toISOString(), // +2d
      tasks: [
        { id: "t1", title: "Calibrate coils", status: "In Progress" },
        { id: "t2", title: "Field harmonics", status: "To Do" },
        { id: "t3", title: "Power audit", status: "Done" }
      ]
    },
    {
      id: "NCC-1701",
      name: "Sensor Calibration",
      dept: "Science",
      priority: 2,
      status: "Active",
      due: new Date(Date.now() + 1000*60*60*24*5).toISOString(), // +5d
      tasks: [
        { id: "t4", title: "Subspace sweep", status: "In Progress" },
        { id: "t5", title: "Telemetry sync", status: "To Do" }
      ]
    },
    {
      id: "NCC-74656",
      name: "Planetary Survey",
      dept: "Command",
      priority: 3,
      status: "Hold",
      due: new Date(Date.now() - 1000*60*60*24*1).toISOString(), // overdue
      tasks: [
        { id: "t6", title: "Orbital mapping", status: "To Do" }
      ]
    }
  ]);

  const missions = persist("lcars-mission-control-v1", demoMissions);

  // --- UI state ---
   let showMissionForm = false;
   let showTaskForm = false;
   let taskMissionId = "";
   const q = writable("");

  // --- Drafts ---
  let draftMission = /** @type {Mission} */ ({
    id: nano(), name: "", dept: "Engineering", priority: 2, status: "Active",
    due: new Date().toISOString().slice(0,10), tasks: []
  });
  let draftTask = /** @type {Task} */ ({ id: nano(), title: "", status: "To Do" });

  function nano(){ return Math.random().toString(36).slice(2,8) + "-" + Date.now().toString(36).slice(-3); }

  // --- Computed ---
  // Filtered missions reacts to $missions and $q
  const filtered = derived([missions, q], ([$missions, $q]) => {
    if (!$q) return $missions;
    const s = $q.toLowerCase();
    return $missions.filter(m =>
      (m.id + m.name + m.dept + m.status + m.priority + m.due + m.tasks.map(t => t.title).join(" ")).toLowerCase().includes(s)
    );
  });

  // Metrics derived from filtered
  const metrics = derived(filtered, ($ms) => {
    const status = { Active: 0, Hold: 0, Done: 0 };
    const priority = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let tasksOpen = 0, tasksAll = 0;
    let overdue = 0;

    const now = Date.now();
    for (const m of $ms) {
      status[m.status]++; priority[m.priority]++;
      for (const t of m.tasks) { tasksAll++; if (t.status !== 'Done') tasksOpen++; }
      if (new Date(m.due).getTime() < now && m.status !== 'Done') overdue++;
    }
    return { status, priority, tasksOpen, tasksAll, overdue };
  });

  const redAlert = derived(metrics, ($m) => $m.overdue > 0);

  // Days until due
  function daysLeft(iso){
    const d = new Date(iso).getTime();
    const one = 24*60*60*1000;
    return Math.ceil((d - Date.now())/one);
  }

  // --- Mutations ---
  function addMission() {
    missions.update(list => [{...draftMission, id:nano()}, ...list]);
    draftMission = { id:nano(), name:"", dept:"Engineering", priority:2, status:"Active", due:new Date().toISOString().slice(0,10), tasks:[] };
    showMissionForm = false;
  }
  function quickCompleteMission(id){
    missions.update(list => list.map(m => m.id===id ? {...m, status:'Done'} : m));
  }
  function deleteMission(id){
    missions.update(list => list.filter(m => m.id!==id));
  }

  function toggleTask(missionId, taskId){
    missions.update(list => list.map(m => {
      if(m.id!==missionId) return m;
      return {
        ...m,
        tasks: m.tasks.map(t => t.id===taskId ? {...t, status: t.status==='Done' ? 'To Do' : 'Done'} : t)
      };
    }));
  }

  function addTask(){
    if(!taskMissionId || !draftTask.title.trim()) return;
    const toAdd = { ...draftTask, id: nano() };
    missions.update(list => list.map(m => m.id===taskMissionId ? { ...m, tasks: [toAdd, ...m.tasks] } : m));
    draftTask = { id: nano(), title: "", status: "To Do" };
    showTaskForm = false;
  }

  // Small helpers for charts
  function bar(w){ return `M0 0 H${w} V18 H0 Z`; }
</script>

<!-- Header -->
<header class="lcars page" aria-label="Mission Control">
  <div class="rail left">
    <div class="pad a"></div>
    <div class="pad b"></div>
    <div class="pad c"></div>
  </div>
  <div class="head">
    <div class="title">
      <span>LCARS OPS</span>
      <small>MISSION CONTROL</small>
    </div>
    <div class="meta">
      <span class="label">STARDATE</span>
      <span>{new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>
  <div class="rail right">
    <div class="pill a">SECTOR</div>
    <div class="pill b">3202-M3</div>
  </div>
</header>

{#if $redAlert}
<div class="alert">
  <div class="led"></div>
  <strong>RED ALERT</strong>
  <span>Der findes {$metrics.overdue} mission(er) med overskredet deadline.</span>
</div>
{/if}

<main class="grid">
  <!-- Left: KPIs + Graphs -->
  <section class="panel kpis">
    <div class="panel-title">Overview</div>

    <div class="kpi-row">
      <div class="kpi">
        <div class="kpi-label">Åbne opgaver</div>
  <div class="kpi-value">{$metrics.tasksOpen} / {$metrics.tasksAll}</div>
        <svg viewBox="0 0 100 18" class="bar">
          <path class="track" d={bar(100)}></path>
          <path class="fill" d={bar($metrics.tasksAll ? 100*($metrics.tasksAll-$metrics.tasksOpen)/$metrics.tasksAll : 0)}></path>
        </svg>
      </div>

      <div class="kpi">
        <div class="kpi-label">Mission status</div>
        <div class="legend">
          <span class="dot active"></span>Active {$metrics.status.Active}
          <span class="dot hold"></span>Hold {$metrics.status.Hold}
          <span class="dot done"></span>Done {$metrics.status.Done}
        </div>
      </div>
    </div>

    <div class="kpi">
      <div class="kpi-label">Prioriteter</div>
      <svg viewBox="0 0 100 18" class="bar stack">
        <!-- stacked simple bars -->
        {#each [1,2,3,4] as p, i}
          <path class="seg p{p}" d={bar(
            100 * (Object.values($metrics.priority).slice(0,i).reduce((a,b)=>a+b,0) + $metrics.priority[p]) / Math.max(1, Object.values($metrics.priority).reduce((a,b)=>a+b,0))
          )} style="transform: translateX({100 * (Object.values($metrics.priority).slice(0,i).reduce((a,b)=>a+b,0)) / Math.max(1, Object.values($metrics.priority).reduce((a,b)=>a+b,0))}%)"></path>
        {/each}
      </svg>
      <div class="legend">
        <span class="chip p1"></span>P1
        <span class="chip p2"></span>P2
        <span class="chip p3"></span>P3
        <span class="chip p4"></span>P4
      </div>
    </div>

    <div class="toolbar">
  <input class="search" placeholder="Søg missioner..." bind:value={$q} />
      <button class="btn accent" on:click={() => (showMissionForm = true)}>+ Ny mission</button>
      <button class="btn ghost" on:click={() => (showTaskForm = true)}>+ Ny opgave</button>
    </div>
  </section>

  <!-- Right: Mission cards -->
  <section class="panel missions">
    <div class="panel-title">Projekter (missioner)</div>
  {#if $filtered.length === 0}
      <div class="empty">Ingen missioner fundet.</div>
    {:else}
      <div class="cards">
    {#each $filtered as m}
          <article class="card">
            <header class="card-head">
              <div class="badge dept {m.dept.toLowerCase()}">{m.dept}</div>
              <div class="spacer"></div>
              <div class="badge prio p{m.priority}">P{m.priority}</div>
              <div class="badge status {m.status.toLowerCase()}">{m.status}</div>
            </header>
            <h3 class="name">{m.name}</h3>
            <div class="row">
              <div class="label">Deadline</div>
              <div class="value mono">
                {new Date(m.due).toISOString().slice(0,10)}
                {#if daysLeft(m.due) < 0}
                  <span class="due overdue">({daysLeft(m.due)} d)</span>
                {:else}
                  <span class="due">(+{daysLeft(m.due)} d)</span>
                {/if}
              </div>
            </div>
            <div class="row">
              <div class="label">Opgaver</div>
              <div class="value">
                {m.tasks.filter(t=>t.status!=='Done').length} åben / {m.tasks.length} total
              </div>
            </div>
            <div class="tasks">
              {#each m.tasks.slice(0,4) as t}
                <button class="task {t.status==='Done' ? 'done' : ''}" on:click={() => toggleTask(m.id, t.id)}>
                  {t.title}
                </button>
              {/each}
              {#if m.tasks.length > 4}<span class="more">+{m.tasks.length-4} flere</span>{/if}
            </div>
            <footer class="card-actions">
              <button class="btn tiny" on:click={() => { showTaskForm = true; taskMissionId = m.id; }}>+ Opgave</button>
              <button class="btn tiny ghost" on:click={() => quickCompleteMission(m.id)}>Sæt Done</button>
              <button class="btn tiny warn" on:click={() => deleteMission(m.id)}>Slet</button>
            </footer>
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>

<!-- Mission form modal -->
{#if showMissionForm}
<div class="modal" role="button" tabindex="0" aria-label="Luk modal" on:click={() => (showMissionForm=false)} on:keydown={(e) => { if (e.key==='Escape' || e.key==='Enter' || e.key===' ') showMissionForm=false; }}>
  <div class="dialog" role="dialog" tabindex="-1" aria-modal="true" on:click|stopPropagation on:keydown={(e) => { if (e.key==='Escape') showMissionForm=false; }}>
    <h3>Ny mission</h3>
    <div class="form">
      <label>Navn<input bind:value={draftMission.name} placeholder="Mission name" /></label>
      <label>Afdeling
        <select bind:value={draftMission.dept}>
          <option>Engineering</option><option>Science</option><option>Command</option>
        </select>
      </label>
      <label>Prioritet
        <select bind:value={draftMission.priority}>
          <option value={1}>1</option><option value={2}>2</option>
          <option value={3}>3</option><option value={4}>4</option>
        </select>
      </label>
      <label>Status
        <select bind:value={draftMission.status}>
          <option>Active</option><option>Hold</option><option>Done</option>
        </select>
      </label>
      <label>Deadline<input type="date" bind:value={draftMission.due} /></label>
    </div>
    <div class="actions">
      <button class="btn accent" on:click={addMission}>Opret</button>
      <button class="btn ghost" on:click={() => (showMissionForm=false)}>Luk</button>
    </div>
  </div>
</div>
{/if}

<!-- Task form modal -->
{#if showTaskForm}
<div class="modal" role="button" tabindex="0" aria-label="Luk modal" on:click={() => (showTaskForm=false)} on:keydown={(e) => { if (e.key==='Escape' || e.key==='Enter' || e.key===' ') showTaskForm=false; }}>
  <div class="dialog" role="dialog" tabindex="-1" aria-modal="true" on:click|stopPropagation on:keydown={(e) => { if (e.key==='Escape') showTaskForm=false; }}>
    <h3>Ny opgave</h3>
    <div class="form">
      <label>Mission
        <select bind:value={taskMissionId}>
          <option value="" disabled>Vælg mission…</option>
          {#each $missions as m}<option value={m.id}>{m.name}</option>{/each}
        </select>
      </label>
      <label>Titel<input bind:value={draftTask.title} placeholder="Opgave titel" /></label>
      <label>Status
        <select bind:value={draftTask.status}>
          <option>To Do</option><option>In Progress</option><option>Done</option>
        </select>
      </label>
    </div>
    <div class="actions">
      <button class="btn accent" on:click={addTask}>Tilføj</button>
      <button class="btn ghost" on:click={() => (showTaskForm=false)}>Luk</button>
    </div>
  </div>
</div>
{/if}

<style>
  :root{
    --bg:#000; --line:#f4a340; --line2:#f6d06b; --blue:#5b8bbf; --blue2:#3e6b9a;
    --text:#ffe6c7; --dim:#9fb8d3; --chip:#151515; --radius:22px; --gap:14px;
    --mono: ui-monospace, Menlo, Consolas, monospace;
    --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }
  *{box-sizing:border-box}
  :global(body){margin:0;background:var(--bg);color:var(--text);font-family:var(--sans)}

  /* Header */
  .lcars.page{display:grid;grid-template-columns:140px 1fr 240px;gap:12px;padding:18px}
  .rail.left,.rail.right{display:flex;flex-direction:column;gap:10px}
  .pad{height:34px;border-radius:0 var(--radius) var(--radius) 0}
  .pad.a{background:var(--line)}
  .pad.b{background:var(--blue);width:80%}
  .pad.c{background:var(--line2);width:60%}
  .pill{height:34px;border-radius:var(--radius) 0 0 var(--radius);display:flex;align-items:center;justify-content:flex-end;padding:0 12px;font-family:var(--mono)}
  .pill.a{background:var(--line)} .pill.b{background:var(--blue)}
  .head{border:2px solid var(--line);border-radius:var(--radius);display:flex;align-items:center;justify-content:space-between;padding:12px 16px}
  .title{display:flex;flex-direction:column;font-weight:700}
  .title small{color:var(--dim)}
  .meta{display:flex;align-items:center;gap:10px}
  .meta .label{color:var(--dim)} .meta span{font-family:var(--mono)}

  /* Alert */
  .alert{display:flex;align-items:center;gap:12px;margin:0 18px 8px 18px;border:2px solid #ff6b6b;border-radius:18px;padding:8px 12px;background:#1a0000;animation: pulse 1.3s infinite}
  .alert .led{width:12px;height:12px;border-radius:50%;background:#ff6b6b;box-shadow:0 0 12px #ff6b6b}
  @keyframes pulse{0%{filter:brightness(1)}50%{filter:brightness(1.3)}100%{filter:brightness(1)}}

  /* Layout */
  .grid{display:grid;grid-template-columns:420px 1fr;gap:var(--gap);padding:0 18px 24px}
  @media (max-width:1000px){ .grid{grid-template-columns:1fr} }

  .panel{border:2px solid var(--line);border-radius:var(--radius);padding:12px;background:linear-gradient(180deg, rgba(255,255,255,0.03), transparent)}
  .panel-title{font-family:var(--mono);color:#caa07a;margin-bottom:8px}

  /* KPI area */
  .kpis .kpi-row{display:flex;gap:10px}
  .kpis .kpi{border:2px solid var(--blue2);border-radius:16px;padding:10px;margin-bottom:10px}
  .kpi-label{color:var(--dim);font-size:12px;margin-bottom:6px}
  .kpi-value{font-family:var(--mono);font-size:18px;margin-bottom:6px}
  .bar{width:100%;height:18px}
  .bar .track{fill:#0b0b0b} .bar .fill{fill:var(--line)}
  .stack .seg{opacity:0.9}
  .seg.p1{fill:#ff5e5e}.seg.p2{fill:#f4a340}.seg.p3{fill:#5b8bbf}.seg.p4{fill:#7dbf5b}
  .legend{display:flex;gap:10px;align-items:center;font-size:12px;color:var(--dim)}
  .dot{display:inline-block;width:10px;height:10px;border-radius:50%;margin:0 4px 0 8px}
  .dot.active{background:#89c3ff}.dot.hold{background:#ffc06b}.dot.done{background:#97ff97}

  .toolbar{display:flex;gap:10px;margin-top:6px}
  .search{flex:1;background:#0b0b0b;border:2px solid var(--tan,#caa07a);border-radius:14px;padding:10px 12px;color:var(--text)}
  .btn{border:2px solid var(--line);background:#141414;border-radius:14px;padding:8px 14px;color:var(--text);cursor:pointer}
  .btn:hover{filter:brightness(1.1)}
  .btn.ghost{border-color:var(--blue)}
  .btn.accent{background:var(--line);color:#000}
  .btn.tiny{padding:4px 8px;border-radius:10px}
  .btn.warn{border-color:#ff6b6b;color:#ffb0b0}

  /* Mission cards */
  .missions .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
  .card{background:#0b0b0b;border:2px solid var(--blue2);border-radius:16px;padding:10px}
  .card:hover{border-color:var(--blue)}
  .card-head{display:flex;gap:6px;align-items:center}
  .badge{font-family:var(--mono);font-size:12px;border-radius:999px;padding:2px 8px;border:2px solid #333}
  .dept.engineering{background:#402a00;border-color:#f4a340}
  .dept.science{background:#0a243b;border-color:#5b8bbf}
  .dept.command{background:#3b0a0a;border-color:#ff6b6b}
  .prio.p1{background:#3b0a0a;border-color:#ff5e5e}
  .prio.p2{background:#402a00;border-color:#f4a340}
  .prio.p3{background:#0a243b;border-color:#5b8bbf}
  .prio.p4{background:#123a12;border-color:#7dbf5b}
  .status.active{background:#0a243b;border-color:#5b8bbf}
  .status.hold{background:#402a00;border-color:#f4a340}
  .status.done{background:#113011;border-color:#7dbf5b}
  .name{margin:8px 0 6px 0}
  .row{display:flex;gap:8px;margin:2px 0}
  .label{color:var(--dim);min-width:82px}
  .value{flex:1}
  .mono{font-family:var(--mono)}
  .due{margin-left:6px;color:var(--dim)} .due.overdue{color:#ff8a8a}
  .tasks{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .task{background:#111;border:1px solid #2e4b6b;border-radius:12px;padding:4px 8px;font-size:12px;color:#cfe6ff;cursor:pointer}
  .task.done{opacity:0.6;text-decoration:line-through}
  .more{color:var(--dim);font-size:12px;align-self:center}
  .card-actions{display:flex;gap:6px;margin-top:8px;justify-content:flex-end}

  /* Modal */
  .modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px}
  .dialog{background:#0b0b0b;border:2px solid var(--line);border-radius:18px;padding:14px;min-width:320px;max-width:90vw}
  .form{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:8px 0}
  .form label{display:flex;flex-direction:column;font-size:12px;color:var(--dim)}
  input, select{margin-top:6px;background:#101010;border:2px solid var(--blue2);border-radius:12px;padding:8px 10px;color:var(--text)}
  .actions{display:flex;gap:8px;justify-content:flex-end}
  .empty{opacity:.7;padding:16px;text-align:center;border:2px dashed var(--line);border-radius:12px}
</style>
