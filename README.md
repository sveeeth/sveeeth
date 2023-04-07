# sveeeth

A [viem](https://github.com/wagmi-dev/viem) wrapper built for Svelte that provides helpful store and utility functions.

Reactive stores to access useful connected wallet data.

```js
import { connect, disconnect, account, network, contract } from "sveeeth";
import { Metamask, Walletconnect, ... } from "sveeeth/connectors";
import { mainnet, goerli, ... } from "sveeeth/chains";
```

# 🚗 Roadmap

- [x] **connect:** Connect to wallet
- [x] **disconnect:** Disconnect from wallet
- [ ] **switchNetwork:** Switch network
- [x] **account:** The connected account details
- [x] **network:** The connected network details
- [x] **contract:** Create a contract instance
- [x] **chains:** re-exports everything from wagmi/core
- [x] **connectors:** re-exports everything from wagmi/core

# 📕 Docs

## Functions

### `connect({ connector: Connector })`

Connect to wallet, Accepts `connector` argument which is a `Connector` type which could be MetaMask, WalletConnect, Safe etc.

```svelte
<script>
  import { connect } from "sveeeth";
  import { Metamask } from "sveeeth/connectors";
</script>
<button on:click={() => connect({ connector: Metamask })}>Connect</button>
```

### `disconnect()`

```svelte
<script>
  import { disconnect } from "sveeeth";
</script>
<button on:click={() => connect({ connector: Metamask })}>Connect</button>
```

### `contract({ address: Address, abi: Abi, sender: Address })`

The contract function returns a store representing the defined contract

```svelte
<script>
  import { contract, account } from "sveeeth";
  import { daiAddress, daiAbi } from "...";

  $: dai = contract(daiAddress, daiAbi);
  $: balance = $dai.balanceOf($account.address);
</script>
```

### `switchNetwork({ chain: Chain })`

Switch to the specified network.

## Stores

### `account`

Account store that returns an object with the account details. Object contains:

`{ address: Address, isConnected: boolean, isDisconnected: boolean, isConnecting: boolean, connector: Connector }`

```svelte
<script>
  import { account, connect } from "sveeeth";
</script>

{#if $account.isConnected}
  <p>Account: $account.address</p>
{:else}
  <button on:click={() => connect({ connector })}>Connect</button>
{/if}
```

### `network`

Store that has the network details in it.

```svelte
<script>
  import { network } from "sveeeth";
  $: ({ chain, chains } = $network);
</script>
```
