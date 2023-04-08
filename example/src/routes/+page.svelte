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

  const { provider } = configureChains([mainnet], [publicProvider()]);

  sveeeth({
    autoConnect: true,
    provider,
  });

  const dai = contract({
    address: "0x6b175474e89094c44da98b954eedeac495271d0f",
    abi: [
      {
        constant: true,
        inputs: [
          {
            name: "_owner",
            type: "address",
          },
        ],
        name: "balanceOf",
        outputs: [
          {
            name: "balance",
            type: "uint256",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
  });

  let daiBalance: bigint;

  const getDaiBalance = async (addressOrEns: string) => {
    daiBalance = await dai.balanceOf(addressOrEns);
  };

  let ensName: string | null;
  let ensAvatar: string | null;

  $: (async({ address }) => {
    if (address) {
      [ensName, ensAvatar] = await Promise.all([
        fetchEnsName({ address }),
        fetchEnsAvatar({ address })
      ]);
    }
  })($account);

</script>

<h1>Sveeeth Example</h1>
<hr />
<h2>Account</h2>
{#if $account.isConnected}
  <button on:click={disconnect}>Disconnect</button>

  <p>address: {$account.address}</p>
  <p>ENS: {ensName}</p>

  {#if ensAvatar}
    <img class="avatar" src={ensAvatar} alt={`${ensName} avatar image`}>
  {/if}

  <p>
    DAI balance {ensName && "via ENS"}: <button on:click={() => getDaiBalance(ensName ?? $account.address)}>Get</button>: {#if $dai.isLoading}Loading...{:else}{daiBalance}{/if}
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
