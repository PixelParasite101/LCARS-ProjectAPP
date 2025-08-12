<script lang="ts">
  import { metrics } from '$lib/stores/missions';
</script>

<div class="panel">
  <div class="panel-title">Sensor Analysis</div>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
    <div class="panel">
      <h3 style="margin-top:0">Tasks by Status</h3>
      <svg viewBox="0 0 100 50" style="width:100%;height:160px;background:#0b0b0b;border-radius:12px">
        <!-- simple bar chart -->
        <g fill="var(--blue)"><rect x="10" y="{50-($metrics.status.Active*8)}" width="16" height="{$metrics.status.Active*8}"/></g>
        <g fill="var(--line)"><rect x="42" y="{50-($metrics.status.Hold*8)}" width="16" height="{$metrics.status.Hold*8}"/></g>
        <g fill="#7dbf5b"><rect x="74" y="{50-($metrics.status.Done*8)}" width="16" height="{$metrics.status.Done*8}"/></g>
      </svg>
    </div>
    <div class="panel">
      <h3 style="margin-top:0">Priority Distribution</h3>
      <svg viewBox="0 0 100 20" style="width:100%;height:60px;background:#0b0b0b;border-radius:12px">
        {#each [1,2,3,4] as p, i}
          <rect x="{ (Object.values($metrics.priority).slice(0,i).reduce((a,b)=>a+b,0) / Math.max(1, Object.values($metrics.priority).reduce((a,b)=>a+b,0))) * 100 }" y="2" height="16" width="{ ($metrics.priority[p as 1|2|3|4] / Math.max(1, Object.values($metrics.priority).reduce((a,b)=>a+b,0))) * 100 }" fill="{['#ff5e5e','var(--line)','var(--blue)','#7dbf5b'][i]}" />
        {/each}
      </svg>
    </div>
  </div>
</div>