<script lang="ts">
  import { createSigner } from "sveeeth";

  const signer = createSigner();

  const signMessage = async () => {
    await signer.sign({ message: messageToSign });
  };

  let messageToSign: string;
</script>

<h2>Signing</h2>

{#if $signer.isLoading}
  <p>Loading...</p>
{:else}
  <p>Message to sign:</p>
  <input bind:value={messageToSign} placeholder="Enter a message" />
  <button on:click={signMessage}>Sign message</button>
{/if}

{#if $signer.error}
  <p>Error: {$signer.error}</p>
{:else if $signer.data}
  <p>Signed: {$signer.data}</p>
{/if}