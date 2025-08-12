<script lang="ts">
  import { missions } from '$lib/stores/missions';
  let filter = 'all';
  const statuses = ['To Do','In Progress','Done'] as const;
</script>

<div class="panel">
  <div class="panel-title">Project Operations</div>
  <div style="display:flex;gap:10px;margin-bottom:8px">
    <label>Filtrér afdeling:
      <select bind:value={filter} class="btn" style="background:#0b0b0b;border-color:#caa07a">
        <option value="all">Alle</option>
        <option>Engineering</option><option>Science</option><option>Command</option>
      </select>
    </label>
  </div>
  <div class="grid" style="grid-template-columns:repeat(3,1fr)">
    {#each statuses as s}
      <div class="panel">
        <h3 style="margin-top:0">{s}</h3>
        <div class="table">
          {#each $missions.filter(m=> filter==='all'||m.dept===filter) as m}
            {#each m.tasks.filter(t=> t.status===s) as t}
              <div class="row" style="grid-template-columns:1fr auto">
                <div><strong>{t.title}</strong><div style="font-size:12px;color:var(--dim)">{m.name}</div></div>
                <div class="badge prio p{m.priority}">P{m.priority}</div>
              </div>
            {/each}
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>