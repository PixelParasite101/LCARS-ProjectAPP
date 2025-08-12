<script>
  import { createPersistedStore } from './lib/persistedStore.js';
  import Overview from './pages/Overview.svelte';
  import MissionControl from './pages/MissionControl.svelte';

  const records = createPersistedStore('lcars-crud-v1', [
    { id: 'NX-01', title: 'Warp field test', status: 'Active', stardate: '9031.5', notes: 'Phase variance nominal.' },
    { id: 'NCC-1701', title: 'Sensor sweep', status: 'Queued', stardate: '9032.1', notes: 'Beta quadrant sector.' }
  ]);

  // Runes-based local state
  let q = $state('');
  let editing = $state(null); // record id being edited
  let draft = $state({ id: '', title: '', status: 'Queued', stardate: '', notes: '' });

  const statuses = ['Queued', 'Active', 'Hold', 'Done'];

  // Simple navigation
  let tab = $state('console'); // 'console' | 'overview' | 'mission'

  function resetDraft() {
    draft = { id: cryptoId(), title: '', status: 'Queued', stardate: '', notes: '' };
  }
  function cryptoId() {
    return Math.random().toString(36).slice(2, 8) + '-' + Date.now().toString(36).slice(-4);
  }

  resetDraft();

  function create(r) {
    records.update(list => [{ ...r }, ...list]);
    resetDraft();
  }
  function startEdit(r) {
    editing = r.id;
    draft = { ...r };
  }
  function cancelEdit() {
    editing = null;
    resetDraft();
  }
  function updateRecord() {
    records.update(list => list.map(x => (x.id === draft.id ? { ...draft } : x)));
    editing = null;
    resetDraft();
  }
  function remove(id) {
    records.update(list => list.filter(x => x.id !== id));
    if (editing === id) cancelEdit();
  }

  // Derived from store and query
  const filtered = $derived($records.filter(r => {
    const s = (r.id + r.title + r.status + r.stardate + r.notes).toLowerCase();
    return s.includes(q.toLowerCase());
  }));
</script>

<!-- LCARS Header -->
<header class="lcars page">
  <div class="rail left">
    <div class="pad block a"></div>
    <div class="pad block b"></div>
    <div class="pad block c"></div>
  </div>

  <div class="head">
    <div class="title">
      <span>LCARS OPS</span>
      <small>CRUD CONSOLE</small>
    </div>
    <div class="stardate">
      <span class="label">STARDATE</span>
      <span>{new Date().toISOString().slice(0,10)}</span>
    </div>
  </div>

  <div class="rail right">
    <div class="pill a">9031.5</div>
    <div class="pill b">SECTOR 3202‑M3</div>
  </div>
</header>
<!-- Tabs -->
<nav class="tabs">
  <button class="tab {tab === 'console' ? 'active' : ''}" onclick={() => (tab = 'console')}>Konsol</button>
  <button class="tab {tab === 'overview' ? 'active' : ''}" onclick={() => (tab = 'overview')}>Oversigt</button>
  <button class="tab {tab === 'mission' ? 'active' : ''}" onclick={() => (tab = 'mission')}>Mission Control</button>
  <div class="spacer"></div>
</nav>

<main class="grid" hidden={tab !== 'console'}>
  <!-- Create / Edit panel -->
  <section class="panel form">
    <div class="panel-title">Function</div>
    <div class="bars">
      <div class="bar a"></div><div class="bar b"></div><div class="bar c"></div>
    </div>

  <form onsubmit={(e) => { e.preventDefault(); editing ? updateRecord() : create(draft); }} class="form-grid">
      <label>ID
        <input required bind:value={draft.id} placeholder="Auto/egen ID" />
      </label>
      <label>Titel
        <input required bind:value={draft.title} placeholder="Titel" />
      </label>
      <label>Status
        <select bind:value={draft.status}>
          {#each statuses as s}<option value={s}>{s}</option>{/each}
        </select>
      </label>
      <label>Stardate
        <input bind:value={draft.stardate} placeholder="9031.5" />
      </label>
      <label class="notes">Noter
        <textarea rows="3" bind:value={draft.notes} placeholder="Detaljer..."></textarea>
      </label>

      <div class="actions">
        {#if editing}
          <button type="submit" class="btn accent">Opdater</button>
          <button type="button" class="btn ghost" onclick={cancelEdit}>Annullér</button>
          <span class="hint">Redigerer: {editing}</span>
        {:else}
          <button type="submit" class="btn accent">Opret</button>
          <button type="button" class="btn ghost" onclick={resetDraft}>Nulstil</button>
        {/if}
      </div>
    </form>
  </section>

  <!-- List panel -->
  <section class="panel list">
    <div class="panel-title">Database</div>
    <div class="toolbar">
      <input class="search" placeholder="Søg (id, titel, status...)" bind:value={q} />
      <div class="chips">
        <span class="chip a"></span><span class="chip b"></span><span class="chip c"></span>
      </div>
    </div>

    <div class="table">
      <div class="thead">
        <div>ID</div><div>Titel</div><div>Status</div><div>Stardate</div><div>Noter</div><div></div>
      </div>
      {#if filtered.length === 0}
        <div class="empty">Ingen poster matcher din søgning.</div>
      {:else}
        {#each filtered as r}
          <div class="row">
            <div class="mono">{r.id}</div>
            <div>{r.title}</div>
            <div class="status {r.status.toLowerCase()}">{r.status}</div>
            <div class="mono">{r.stardate}</div>
            <div class="notes-cell">{r.notes}</div>
            <div class="row-actions">
              <button class="btn tiny" onclick={() => startEdit(r)}>Redigér</button>
              <button class="btn tiny warn" onclick={() => remove(r.id)}>Slet</button>
            </div>
          </div>
        {/each}
      {/if}
    </div>
  </section>
</main>

<!-- Overview page -->
<section hidden={tab !== 'overview'} class="panel overview-wrap">
  <Overview total={$records.length} latest={$records[0]}
  />
  <div class="bars" style="margin-top:12px">
    <div class="bar a"></div><div class="bar b"></div><div class="bar c"></div>
  </div>
</section>

<!-- Mission Control page -->
<section hidden={tab !== 'mission'} class="panel overview-wrap">
  <MissionControl />
  <div class="bars" style="margin-top:12px">
    <div class="bar a"></div><div class="bar b"></div><div class="bar c"></div>
  </div>
  
</section>

<style>
  :root{
    --bg:#000000;
    --line:#f4a340;
    --line-2:#f6d06b;
    --blue:#5b8bbf;
    --blue-2:#3e6b9a;
    --tan:#caa07a;
    --text:#ffe6c7;
    --text-dim:#9fb8d3;
    --chip:#2a2a2a;
    --radius:22px;
    --gap:14px;
    --mono: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;
    --sans: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
  }
  *{box-sizing:border-box}
  :global(html, body){height:100%}
  :global(body){margin:0;background:var(--bg);color:var(--text);font-family:var(--sans)}

  /* Header LCARS */
  .lcars.page{display:grid;grid-template-columns: 140px 1fr 240px;align-items:stretch;padding:18px 18px 8px 18px;gap:12px}
  .rail.left,.rail.right{display:flex;flex-direction:column;gap:10px}
  .pad.block{height:34px;border-radius:0 var(--radius) var(--radius) 0;background:var(--line);box-shadow:0 0 0 2px var(--line) inset}
  .pad.block.b{width:80%;background:var(--blue)}
  .pad.block.c{width:60%;background:var(--line-2)}
  .pill{height:34px;border-radius:var(--radius) 0 0 var(--radius);display:flex;align-items:center;justify-content:flex-end;padding:0 12px;font-family:var(--mono);background:var(--line)}
  .pill.b{background:var(--blue)}
  .head{display:flex;align-items:center;justify-content:space-between;border:2px solid var(--line);border-radius:var(--radius);padding:12px 16px;gap:16px}
  /* Tabs */
  .tabs{display:flex;align-items:center;gap:8px;padding:0 18px 10px 18px}
  .tab{border:2px solid var(--line);background:#141414;border-radius:999px;padding:6px 12px;color:var(--text);cursor:pointer}
  .tab.active{background:var(--line);color:#000}
  .tabs .spacer{flex:1}

  .overview-wrap{margin:0 18px}
  .title{display:flex;flex-direction:column;font-weight:700;letter-spacing:1px}
  .title small{color:var(--text-dim);font-weight:500}
  .stardate{display:flex;align-items:center;gap:10px}
  .stardate .label{color:var(--text-dim)}
  .stardate span{font-family:var(--mono)}

  /* Layout */
  .grid{display:grid;grid-template-columns: 380px 1fr;gap:var(--gap);padding:0 18px 24px 18px}
  @media (max-width: 980px){ .grid{grid-template-columns:1fr} }

  /* Panels */
  .panel{border:2px solid var(--line);border-radius:var(--radius);padding:12px;background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.0))}
  .panel-title{font-family:var(--mono);color:var(--tan);margin-bottom:8px}
  .bars{display:flex;gap:8px;margin-bottom:10px}
  .bar{height:14px;border-radius:10px;background:var(--chip)}
  .bar.a{width:45%;background:var(--line)}
  .bar.b{width:30%;background:var(--blue)}
  .bar.c{width:15%;background:var(--line-2)}

  /* Form */
  .form .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .form label{display:flex;flex-direction:column;font-size:12px;color:var(--text-dim)}
  .form input,.form select,.form textarea{
    margin-top:6px;background:#0b0b0b;border:2px solid var(--blue-2);
    border-radius:12px;padding:10px 12px;color:var(--text);font-family:var(--sans);outline:none
  }
  .form .notes{grid-column:1/-1}
  .actions{grid-column:1/-1;display:flex;align-items:center;gap:10px;margin-top:4px}
  .btn{border:2px solid var(--line);background:#141414;border-radius:14px;padding:8px 14px;color:var(--text);cursor:pointer}
  .btn:hover{filter:brightness(1.1)}
  .btn.ghost{border-color:var(--blue)}
  .btn.accent{background:var(--line);color:#000}
  .btn.tiny{padding:4px 8px;border-radius:10px}
  .btn.warn{border-color:#ff6b6b;color:#ffb0b0}
  .hint{font-family:var(--mono);color:var(--text-dim)}

  /* List */
  .toolbar{display:flex;align-items:center;gap:10px;margin-bottom:8px}
  .search{flex:1;background:#0b0b0b;border:2px solid var(--tan);border-radius:14px;padding:10px 12px;color:var(--text)}
  .chips{display:flex;gap:6px}
  .chip{width:26px;height:14px;border-radius:10px;background:var(--chip)}
  .chip.a{background:var(--line)}
  .chip.b{background:var(--blue)}
  .chip.c{background:var(--line-2)}

  .table{display:flex;flex-direction:column;gap:6px}
  .thead,.row{display:grid;grid-template-columns: 1.2fr 1.6fr 0.9fr 0.9fr 2fr 0.8fr;gap:8px;align-items:center}
  .thead{padding:8px 10px;border-bottom:2px solid var(--line);color:var(--text-dim);font-family:var(--mono)}
  .row{padding:10px;border:2px solid var(--blue-2);border-radius:16px;background:#0b0b0b}
  .row:hover{border-color:var(--blue)}
  .row-actions{display:flex;gap:6px;justify-content:flex-end}
  .mono{font-family:var(--mono)}
  .notes-cell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}

  .status{font-family:var(--mono)}
  .status.queued{color:#d8d8d8}
  .status.active{color:#89c3ff}
  .status.hold{color:#ffc06b}
  .status.done{color:#97ff97}

  .empty{opacity:0.7;padding:16px;text-align:center;border:2px dashed var(--tan);border-radius:12px}
</style>
