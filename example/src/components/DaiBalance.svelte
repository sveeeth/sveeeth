<script lang="ts">
  import { account, contract } from "sveeeth";
  import { DAI_CONFIG } from "../constants";

  const dai = contract(DAI_CONFIG);
</script>

<h3>DAI Balance</h3>

{#await $account.address && dai.read.balanceOf("bbque.eth")}
  <p>Loading...</p>
{:then balance}
  <p>Balance: {balance} DAI</p>
{/await}