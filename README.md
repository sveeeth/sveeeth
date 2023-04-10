# sveeeth

A [@wagmi/core](https://www.npmjs.com/package/@wagmi/core) wrapper built for Svelte that provides helpful store and utility functions.

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
- [x] **ens:** adding ens fetching and support 
  - [x] Allow ENS to be passed in place of address
  - [x] Add edge case support for functions where the ENS should be sent raw (unfetched)
  - [ ] Reactive fetching of connected account ens data
- [ ] **multicall:** Add multicall support
- [ ] **signing:** Add signing and the typed data signing thing
- [ ] **contract events:** Extend the return from the `contract(...)` to support event listeners
  - Something like `contract(...).events.EventName.watch(() => void)` could be interesting
- [x] Re-export all the wagmi/core utils and constants

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

An ENS name can be passed to a function in place of an address and it will be automatically fetched before the function is called.

```svelte
<script>
  // instead of this
  const balance = dai.balanceOf("0x360EF498A774998900da14E81b86E9200A400ecf");
  
  // we can do this
  const balance = dai.balanceOf("bbque.eth");
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
