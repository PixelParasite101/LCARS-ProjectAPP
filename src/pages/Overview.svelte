<script>
  let { total = 0, latest = null } = $props();
</script>

<section class="panel overview">
  <div class="panel-title">Oversigt</div>
  <div class="stats">
    <div class="stat">
      <div class="num">{total}</div>
      <div class="label">Poster i alt</div>
    </div>
    <div class="stat">
      <div class="num small">{latest ? latest.id : '—'}</div>
      <div class="label">Seneste ID</div>
    </div>
  </div>

  <div class="tips">
    <p>Dette er en ny side. Brug fanerne for oven til at skifte mellem Konsol og Oversigt.</p>
  </div>
</section>

<style>
  .overview{display:flex;flex-direction:column;gap:12px}
  .stats{display:flex;gap:14px}
  .stat{flex:0 0 auto;min-width:160px;border:2px solid var(--line);border-radius:16px;padding:12px;background:#0b0b0b}
  .num{font-size:28px;font-weight:700}
  .num.small{font-family:var(--mono);font-size:20px}
  .label{color:var(--text-dim)}
  .tips{border:2px dashed var(--tan);border-radius:12px;padding:12px;color:var(--text-dim)}
</style>
