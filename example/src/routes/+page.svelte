<script lang="ts">
  import sveeeth, {
    publicProvider,
    mainnet,
    disconnect,
    connect,
    network,
    account,
    configureChains,
    InjectedConnector,
    contract,
  } from "../../../../sveeeth";

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

  let daiBalance: any;

  const getDaiBalance = async () => {
    daiBalance = await dai.balanceOf($account.address);
  };
</script>

<h1>Sveeeth Example</h1>
<hr />
<h2>Account</h2>
{#if $account.isConnected}
  <p>address: {$account.address}</p>
  <button on:click={() => disconnect()}>Disconnect</button>
  <p>
    DAI balance <button on:click={getDaiBalance}>Get</button>: {#if $dai.isLoading}Loading...{:else}{daiBalance}{/if}
  </p>
{:else}
  <button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
{/if}

<hr />
<h2>Network</h2>
<p>chain ID: {$network.chain?.id}</p>
<p>Network name: {$network.chain?.name}</p>
