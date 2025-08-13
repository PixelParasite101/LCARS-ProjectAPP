<script lang="ts">
  export let open=false; export let title='';
  export let onClose: () => void = () => {};
  function handleKey(e: KeyboardEvent){ if(e.key==='Escape' || e.key==='Enter' || e.key===' '){ onClose(); } }
</script>
{#if open}
<div class="modal" role="button" tabindex="0" aria-label="Luk modal" on:click={onClose} on:keydown={handleKey}>
  <div class="dialog" role="dialog" aria-modal="true" tabindex="-1" on:click|stopPropagation on:keydown={handleKey}>
    {#if title}<h3>{title}</h3>{/if}
    <slot />
  </div>
</div>
{/if}
<style>
.modal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:12px}
.dialog{background:#0b0b0b;border:2px solid var(--line);border-radius:18px;padding:14px;min-width:320px;max-width:90vw}
</style>