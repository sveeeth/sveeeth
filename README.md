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
- [x] **switchNetwork:** Switch network
- [x] **account:** The connected account details
- [x] **network:** The connected network details
- [x] **contract:** Create a contract instance
- [x] **chains:** re-exports everything from wagmi/core
- [x] **connectors:** re-exports everything from wagmi/core
- [ ] **ens:** adding ens fetching and support 
  - Making it so you can pass it in in place of an address could be cool. As we are already shimming the contract functions this could be doabled, just check for .eth and convert it to an address in the shim.
- [ ] **multicall:** Add multicall support
- [ ] **signing:** Add signing and the typed data signing thing
- [ ] **contract events:** Extend the return from the `contract(...)` to support event listeners
  - Something like `contract(...).events.EventName.watch(() => void)` could be interesting
- [ ] Reexport all the wagmi/core utils and constants

# 📕 Docs

## Functions

### `connect(args: ConnectArgs)`

Connect to wallet, Accepts `connector` argument which is a `Connector` type which could be MetaMask, WalletConnect, Safe etc.

```svelte
<script>
  import { connect } from "sveeeth";
  import { InjectedConnector } from "sveeeth/connectors";
</script>
<button on:click={() => connect({ connector: new InjectedConnector() })}>Connect</button>
```

### `disconnect()`

```svelte
<script>
  import { disconnect } from "sveeeth";
</script>
<button on:click={() => connect({ connector: Metamask })}>Connect</button>
```

### `contract({ address: Address, abi: Abi })`

The contract function returns a store representing the state and the contract functions

```svelte
<script>
  import { contract, account } from "sveeeth";
  import { daiAddress, daiAbi } from "...";

  $: dai = contract(daiAddress, daiAbi);
  $: balance = dai.balanceOf($account.address);
  $: console.log($dai.isLoading);
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
