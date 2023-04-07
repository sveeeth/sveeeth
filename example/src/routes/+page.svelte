<script>
  import sveeeth, {
    publicProvider,
    mainnet,
    disconnect,
    connect,
    network,
    account,
    configureChains,
    InjectedConnector,
  } from "../../../../sveeeth";

  const { provider } = configureChains([mainnet], [publicProvider()]);

  sveeeth({
    autoConnect: true,
    provider,
  });
</script>

<h1>Sveeeth Example</h1>
<hr />
<h2>Account</h2>
{#if $account.isConnected}
  <p>address: {$account.address}</p>
  <button on:click={() => disconnect()}>Disconnect</button>
{:else}
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{/if}

<hr />
<h2>Network</h2>
<p>chain ID: {$network.chain?.id}</p>
<p>Network name: {$network.chain?.name}</p>
