<script lang="ts">
  import { metrics } from '$lib/stores/missions';
</script>

  <div class="panel">
    <div class="panel-title">Sensor Analysis</div>
    <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
      <div class="panel">
        <h3 style="margin-top:0">Tasks by Status</h3>
        <svg viewBox="0 0 100 60" style="width:100%;height:160px;background:#0b0b0b;border-radius:12px">
          <!-- simple bar chart using tasksByStatus: To Do, In Progress, Done -->
          <g>
            <rect x="12" y="{58-($metrics.tasksByStatus['To Do']*10)}" width="16" height="{$metrics.tasksByStatus['To Do']*10}" fill="var(--line)" />
            <rect x="42" y="{58-($metrics.tasksByStatus['In Progress']*10)}" width="16" height="{$metrics.tasksByStatus['In Progress']*10}" fill="var(--blue)" />
            <rect x="72" y="{58-($metrics.tasksByStatus['Done']*10)}" width="16" height="{$metrics.tasksByStatus['Done']*10}" fill="#7dbf5b" />
          </g>
        </svg>
        <div class="legend" style="display:flex;gap:10px;font-size:12px;color:var(--dim)">
          <span>To Do: {$metrics.tasksByStatus['To Do']}</span>
          <span>In Progress: {$metrics.tasksByStatus['In Progress']}</span>
          <span>Done: {$metrics.tasksByStatus['Done']}</span>
        </div>
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