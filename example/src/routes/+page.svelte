<script lang="ts">
  import sveeeth, {
    disconnect,
    connect,
    network,
    account,
    configureChains,
    contract,
    fetchEnsName,
    fetchEnsAvatar
  } from "../../../../sveeeth";
  import { mainnet } from "../../../../sveeeth/dist/chains";
  import { publicProvider } from "../../../../sveeeth/dist/providers";
  import { InjectedConnector } from "../../../../sveeeth/dist/connectors";
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

  /**
   * ENS
   */
  let ensName: string | null = null;

  $: (async({ address }) => {
    ensName = address ? await fetchEnsName({ address }) : null;
  })($account);

</script>

<h1>Sveeeth Example</h1>
<hr />
<h2>Account</h2>
{#if $account.isConnected}
  <button on:click={disconnect}>Disconnect</button>

  <p>address: {$account.address}</p>
  <p>ENS: {ensName ?? "none"}</p>

  {#await fetchEnsAvatar({ address: $account.address }) then ensAvatar}
    {#if ensAvatar}
      <img class="avatar" src={ensAvatar} alt={`${ensName} avatar image`}>
    {/if}
  {/await}

  <p>
    {ensName ? "DAI balance via ENS" : "DAI balance"}:
    {#if $dai.isLoading}Loading...{:else}{daiBalance}{/if}
    <button on:click={() => getDaiBalance(ensName ?? $account.address)}>Get</button>
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
