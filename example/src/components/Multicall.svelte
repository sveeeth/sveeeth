<script lang="ts">
  import { account, multicall } from "sveeeth";
  import { DAI_CONFIG } from "../constants";

  const daiMulticall = multicall(DAI_CONFIG);

  $: daiMulticallCal = daiMulticall
    .call("balanceOf", [$account.address])
    .call("totalSupply")
    .call("name")
    .call("symbol");
</script>

<h3>Multicall</h3>

{#await $account.address && daiMulticallCal.execute()}
  <p>Loading...</p>
{:then result}
  <pre>{JSON.stringify(result, (_, v) => typeof v === 'bigint' ? `${v}n` : v, 2)}</pre>
{/await}

<style>
  pre {
    background: #f2f2f2;
    padding: 8px;
    border: 1px solid black;
  }
</style>