<script lang="ts">
  import { account, contract } from "sveeeth";
  import { DAI_CONFIG } from "../constants";

  const dai = contract(DAI_CONFIG);

  $: ({ address } = $account);
  $: balance = $account.address && dai.read.balanceOf(address);
</script>

<h3>DAI Balance</h3>

{#await balance}
  <p>Loading...</p>
{:then balance}
  <p>Balance: {balance} DAI</p>
{/await}