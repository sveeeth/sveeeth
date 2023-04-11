<script lang="ts">
  import type { Abi } from "abitype";

  import sveeeth, {
    disconnect,
    connect,
    network,
    account,
    configureChains,
    contract,
    createSigner,
  } from "../../../../sveeeth";
  import { mainnet } from "../../../../sveeeth/dist/chains";
  import { publicProvider } from "../../../../sveeeth/dist/providers";
  import { InjectedConnector } from "../../../../sveeeth/dist/connectors";
  import { fetchEnsData } from "../../../../sveeeth/dist/utils";

  import daiExampleAbi from "../abis/erc20.json";

  const DAI_CONTRACT_ADDRESS = "0x6b175474e89094c44da98b954eedeac495271d0f";

  sveeeth({
    autoConnect: true,
    ...configureChains([mainnet], [publicProvider()]),
  });

  const dai = contract({
    address: DAI_CONTRACT_ADDRESS,
    abi: daiExampleAbi as Abi,
  });

  let messageToSign: string;
  const signer = createSigner();

  const signMessage = async () => {
    await signer.sign({ message: messageToSign });
  };
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
  {#await $account.address && dai.balanceOf($account.address)}
    <p>Loading...</p>
  {:then balance}
    <p>Balance: {balance} DAI</p>
  {/await}
{/if}

<hr />

<!---------------------------------------------------------
  | Signing
----------------------------------------------------------->
<h2>Signing</h2>

{#if $signer.isLoading}
  <p>Loading...</p>
{:else}
  <p>Message to sign:</p>
  <input bind:value={messageToSign} placeholder="Enter a message" />
  <button on:click={signMessage}>Sign message</button>
{/if}

{#if $signer.error}
  <p>Error: {$signer.error}</p>
{:else if $signer.data}
  <p>Signed: {$signer.data}</p>
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
</style>
