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

  const { publicClient } = configureChains([mainnet], [publicProvider()]);

  sveeeth({
    autoConnect: true,
    publicClient,
  });

  const components = [
    NetworkDetails,
    EnsData,
    DaiBalance,
    Multicall,
    Signing,
  ];
</script>

<h1>Sveeeth Example</h1>
<hr />

<AccountConnect />
<hr />

{#if $account.status === "connected"}
  {#each components as Component}
    <Component />
    <hr />
  {/each}
{/if}
