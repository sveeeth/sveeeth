<script lang="ts">
  import { network } from "sveeeth";
</script>

<h2>Network</h2>

{#if $network.chain}
  <p>chain ID: {$network.chain.id}</p>
  <p>Network name: {$network.chain.name}</p>
{:else}
  <p>No network is connected</p>
{/if}
