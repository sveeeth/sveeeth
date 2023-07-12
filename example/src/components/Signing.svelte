<script lang="ts">
  import { createSigner } from "sveeeth";
  import type { SignTypedDataArgs } from "@wagmi/core";

  const signer = createSigner();

  const signMessage = async () => {
    await signer.sign({ message: messageToSign });
  };

  const signTypedData = async () => {
    // test data taken from: https://wagmi.sh/core/actions/signTypedData

    // All properties on a domain are optional
    const domain = {
      name: 'Ether Mail',
      version: '1',
      chainId: 1,
      verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
    } as const

    // The named list of all type definitions
    const types = {
      Person: [
        { name: 'name', type: 'string' },
        { name: 'wallet', type: 'address' },
      ],
      Mail: [
        { name: 'from', type: 'Person' },
        { name: 'to', type: 'Person' },
        { name: 'contents', type: 'string' },
      ],
    } as const

    const message = {
      from: {
        name: 'Cow',
        wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
      },
      to: {
        name: 'Bob',
        wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
      },
      contents: messageToSign,
    } as const

    await signer.signTypedData({
      domain,
      message,
      types,
      primaryType: "Mail",
    } as SignTypedDataArgs);
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
  <button on:click={signTypedData}>Sign typed data</button>
{/if}

{#if $signer.error}
  <p>Error: {$signer.error}</p>
{:else if $signer.data}
  <p>Signed: {$signer.data}</p>
{/if}