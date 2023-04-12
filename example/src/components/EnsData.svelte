<script lang="ts">
  import { account } from "sveeeth";
  import { fetchEnsData } from "sveeeth/utils";
</script>

<h3>ENS Data</h3>

{#await fetchEnsData($account)}
  <p>Loading...</p>
{:then { name, avatar }}
  <p>Name: {name}</p>
  <p>Avatar: {avatar}</p>
  <img class="avatar" src={avatar} alt="avatar" hidden={!avatar} />
{/await}

<style>
  .avatar {
    width: 100px;
    height: 100px;
    border: 1px solid black;
    border-radius: 50%;
  }
</style>