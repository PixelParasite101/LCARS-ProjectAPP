<script lang="ts">
  export let title = 'MISSION CONTROL';
</script>
<header class="lcars-header" aria-label={title}>
  <div class="lcars-rail">
    <div class="lcars-pad a"></div>
    <div class="lcars-pad b"></div>
    <div class="lcars-pad c"></div>
  </div>
  <div class="lcars-head">
    <div class="lcars-title"><span>LCARS OPS</span><small>{title}</small></div>
    <div class="lcars-meta"><label>STARDATE</label><span>{new Date().toISOString().slice(0,10)}</span></div>
  </div>
  <div class="lcars-rail" style="align-items:flex-end">
    <div class="lcars-pill a">SECTOR</div>
    <div class="lcars-pill b">3202‑M3</div>
  </div>
</header>