<script lang="ts">
  import sveeeth, { account, configureChains, } from "sveeeth";
  import { mainnet } from "sveeeth/chains";
  import { publicProvider } from "sveeeth/providers";
  import {
    AccountConnect,
    DaiBalance,
    EnsData,
    Multicall,
    NetworkDetails,
    Signing
  } from "../components";

  const { provider } = configureChains([mainnet], [publicProvider()]);

  sveeeth({
    autoConnect: true,
    provider,
  });
</script>

<h1>Sveeeth Example</h1>
<hr />
<AccountConnect />
<hr />
<NetworkDetails />
<hr />

{#if $account.isConnected}
  <EnsData />
  <hr />
  <DaiBalance />
  <hr />
  <Multicall />
  <hr />
  <Signing />
  <hr />
{/if}
