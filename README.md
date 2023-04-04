# sveeeth

A [viem](https://github.com/wagmi-dev/viem) wrapper built for Svelte that provides helpful store and utility functions.

### Stores

Reactive stores to access useful connected wallet data.

```js
import { connected, account, chain } from "sveeeth";
```

- [ ] **connected:** True if the wallet is connected, false if otherwise.
- [ ] **account:** The connected account.
- [ ] **chain:** The connected chain.

### Helper functions

- [ ] Connect to a users wallet

```js
import { connect } from "sveeeth/util";

const account = await connect();
```