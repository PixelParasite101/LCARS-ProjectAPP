<script lang="ts">
  import { missions, nano } from '$lib/stores/missions';
  // Simpel crew-liste gemt i localStorage ved at genbruge missions som namespace
  // (i en rigtig app ville vi lave et separat store)
  let crew = JSON.parse(localStorage.getItem('lcars-crew')||'[]');
  $: localStorage.setItem('lcars-crew', JSON.stringify(crew));
  let draft = { id:nano(), name:'', role:'' };
  const add = ()=>{ crew=[{...draft, id:nano()}, ...crew]; draft={id:nano(), name:'', role:''}; };
  const del = (id:string)=> crew = crew.filter((c:any)=>c.id!==id);
</script>

<div class="panel">
  <div class="panel-title">Crew Roster</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
    <label>Navn<input class="btn" style="width:100%;background:#0b0b0b;border-color:#caa07a" bind:value={draft.name}></label>
    <label>Rolle<input class="btn" style="width:100%;background:#0b0b0b;border-color:#caa07a" bind:value={draft.role}></label>
    <div style="grid-column:1/-1;display:flex;justify-content:flex-end"><button class="btn accent" on:click={add}>Tilføj medlem</button></div>
  </div>
  <div class="table">
    {#each crew as c}
      <div class="row" style="grid-template-columns:1fr 1fr auto">
        <div>{c.name}</div>
        <div>{c.role}</div>
        <button class="btn tiny warn" on:click={() => del(c.id)}>Slet</button>
      </div>
    {/each}
    {#if crew.length===0}<div class="empty">Ingen medlemmer endnu.</div>{/if}
  </div>
</div>