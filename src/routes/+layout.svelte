<script lang="ts">
  import '../lib/styles/lcars.css';
  import LcarsHeader from '$lib/components/LcarsHeader.svelte';
  import { redAlert } from '$lib/stores/missions';
</script>

<LcarsHeader title="LCARS SUITE" />
{#if $redAlert}
  <div class="alert"><div class="led"></div><strong>RED ALERT</strong><span>Mindst én mission er forfalden.</span></div>
{/if}

<nav class="container" style="margin-bottom:8px">
  <div class="panel" style="display:flex;gap:10px;flex-wrap:wrap">
    <a class="btn accent" href="/">Mission Control</a>
    <a class="btn" href="/operations">Project Operations</a>
    <a class="btn" href="/crew">Crew Roster</a>
    <a class="btn" href="/logs">Mission Logs</a>
    <a class="btn" href="/sensors">Sensor Analysis</a>
  </div>
</nav>

<main class="container">
  <slot />
</main>