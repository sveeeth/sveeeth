<script lang="ts">
  import sveeeth, {
    disconnect,
    connect,
    network,
    account,
    configureChains,
    contract,
  } from "../../../../sveeeth";
  import { mainnet } from "../../../../sveeeth/dist/chains";
  import { publicProvider } from "../../../../sveeeth/dist/providers";
  import { InjectedConnector } from "../../../../sveeeth/dist/connectors";
  import { fetchEnsData } from "../../../../sveeeth/dist/utils";
  import daiExampleAbi from "../abis/dai.example.json";

  const { provider } = configureChains([mainnet], [publicProvider()]);

  sveeeth({
    autoConnect: true,
    provider,
  });

  const dai = contract({
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    abi: daiExampleAbi,
  });

  /**
   * DAI
   */
  let daiBalance: bigint;

  const getDaiBalance = async (addressOrEns: string) => {
    daiBalance = await dai.balanceOf(addressOrEns);
  };
</script>

<h1>Sveeeth Example</h1>
<hr />
<h2>Account</h2>
{#if $account.isConnected}
  <button on:click={disconnect}>Disconnect</button>

  <p>address: {$account.address}</p>

  {#await fetchEnsData($account)}
    <p>ENS: Loading...</p>
  {:then { name, avatar }}
    <p>ENS: {name}</p>

    {#if avatar}
      <img class="avatar" src={avatar} alt={`${name} avatar image`}>
    {/if}
  {/await}

  <p>
    DAI balance:
    {#if $dai.isLoading}Loading...{:else}{daiBalance}{/if}
    <button on:click={() => getDaiBalance($account.address)}>Get</button>
  </p>
{:else}
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{/if}

<hr />
<h2>Network</h2>
<p>chain ID: {$network.chain?.id}</p>
<p>Network name: {$network.chain?.name}</p>

<style>
  .avatar {
      width: 100px;
      height: 100px;
      border: 1px solid black;
      border-radius: 50%;
  }
</style>
