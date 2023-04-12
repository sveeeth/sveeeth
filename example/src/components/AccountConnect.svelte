<script lang="ts">
  import { account, connect, disconnect } from "sveeeth";
  import { InjectedConnector } from "sveeeth/connectors";
</script>

<h2>Account</h2>
{#if !$account.isConnected}
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{:else}
  <p>
    address: {$account.address}
    <button on:click={disconnect}>Disconnect</button>
  </p>
{/if}