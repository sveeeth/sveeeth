<script lang="ts">
  import type { Abi } from "abitype";

  import sveeeth, {
    disconnect,
    connect,
    network,
    account,
    configureChains,
    contract,
    multicall,
  } from "../../../../sveeeth";
  import { mainnet } from "../../../../sveeeth/dist/chains";
  import { publicProvider } from "../../../../sveeeth/dist/providers";
  import { InjectedConnector } from "../../../../sveeeth/dist/connectors";
  import { fetchEnsData } from "../../../../sveeeth/dist/utils";

  import daiExampleAbi from "../abis/erc20.json";

  const daiConfig = {
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    abi: daiExampleAbi as Abi,
  };

  sveeeth({
    autoConnect: true,
    ...configureChains([mainnet], [publicProvider()]),
  });

  const dai = contract(daiConfig);

  const daiMulticall = multicall(daiConfig);

  $: daiMulticallCal = daiMulticall
    .call("balanceOf", [$account.address])
    .call("totalSupply")
    .call("name")
    .call("symbol");
</script>

<h1>Sveeeth Example</h1>

<hr />

<h2>Account</h2>
{#if !$account.isConnected}
  <!--------------------------------------------------------- 
    | Conntect 
  ----------------------------------------------------------->
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{:else}
  <!--------------------------------------------------------- 
    | Disconntect 
  ----------------------------------------------------------->
  <p>
    address: {$account.address}
    <button on:click={disconnect}>Disconnect</button>
  </p>

  <!--------------------------------------------------------- 
    | ENS Data 
  ----------------------------------------------------------->
  <h3>ENS Data</h3>
  {#await fetchEnsData($account)}
    <p>Loading...</p>
  {:then { name, avatar }}
    <p>Name: {name}</p>
    <p>Avatar: {avatar}</p>
    <img class="avatar" src={avatar} alt="avatar" hidden={!avatar} />
  {/await}

  <!--------------------------------------------------------- 
    | DAI Balance 
  ----------------------------------------------------------->
  <h3>DAI Balance</h3>
  {#await $account.address && dai.balanceOf($account.address)}
    <p>Loading...</p>
  {:then balance}
    <p>Balance: {balance} DAI</p>
  {/await}

  <!--------------------------------------------------------- 
    | DAI Multicall 
  ----------------------------------------------------------->
  <h3>Multicall</h3>
  {#await $account.address && daiMulticallCal.execute()}
    <p>Loading...</p>
  {:then result}
    <pre>{JSON.stringify(result, null, 2)}</pre>
    <p>Total supply: {result[1]}</p>
    <p>Name: {result[2]}</p>
    <p>Symbol: {result[3]}</p>
  {/await}
{/if}

<hr />

<!--------------------------------------------------------- 
  | Network 
----------------------------------------------------------->
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

  pre {
    background: #f2f2f2;
    padding: 8px;
    border: 1px solid black;
  }
</style>
