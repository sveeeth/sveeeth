<script lang="ts">
  import { account, connect, disconnect } from "sveeeth";
  import { InjectedConnector } from "sveeeth/connectors";

  $: ({ address, isConnected, status } = $account);
</script>

<h2>Account ({status})</h2>

{#if !isConnected}
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{:else}
  <p>
    address: {address}
    <button on:click={disconnect}>Disconnect</button>
  </p>
{/if}