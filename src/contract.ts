import {
  getProvider,
  fetchSigner,
  getContract,
  Signer,
  GetContractResult,
  watchContractEvent,
  WatchContractEventCallback,
} from "@wagmi/core";
import { Abi, Address } from "abitype";
import { writable } from "svelte/store";

import { addressOrEns, getAbiFunction } from "./utils";

/**
 * Contract store
 * This contract returns a svelte store mixed with an object containing
 * ethers Contract["functions"]. So it can be consumed with autosubscribers
 * and update as a normal svelte store but can also call contract functions
 *
 * Example:
 *
 * ```ts
 * <script>
 *    let daiBalance;
 *    const dai = contract({ address, abi });
 *    const getDaiBalance = async (acc: Address) => {
 *      daiBalance = await dai.balanceOf(acc);
 *    }
 * </script>
 *
 * {#if $dai.isLoading}Loading...{:else}{daiBalance}{/if}
 * <button on:click={getDaiBalance}>Get balance</button>
 * ```
 *
 * Contracts also support event listeners
 *
 * Example:
 *
 * ```ts
 * <script>
 *    const dai = contract({ address, abi });
 *
 *    onMount(() => {
 *      dai.events.Transfer((...args) => { ... });
 *    });
 * </script>
 * ```
 */
export const contract = <TAbi extends Abi>(contractConfig: { address: string; abi: TAbi }) => {
  // Setup all the things
  const provider = getProvider();
  const contractInstance = getContract<TAbi>({ ...contractConfig, signerOrProvider: provider });
  const store = writable({ isLoading: false });

  const setIsLoading = (isLoading: boolean) => store.update((x) => ({ ...x, isLoading }));

  // Loop through each key of the functions property and return their
  // associated contract instance value, wrapped in a shim that updates
  // isLoading on the store
  const functions: GetContractResult<TAbi>["functions"] = Object.keys(
    contractInstance.functions
  ).reduce(
    (acc, key) => ({
      ...acc,
      [key]: async (...args: any) => {
        setIsLoading(true);

        const fn = getAbiFunction(contractConfig.abi, key);
        const parsedArgs = await Promise.all(
          args.map(async (arg: any, index: number) =>
            fn?.type === "function" && fn?.inputs[index].type === "address"
              ? await addressOrEns(arg)
              : arg
          )
        );

        const signer = await fetchSigner();
        const ret = await contractInstance.connect(signer as Signer)[key](...parsedArgs);

        setIsLoading(false);
        return ret;
      },
    }),
    {} as GetContractResult<TAbi>["functions"]
  );

  const events: GetContractResult<TAbi>["filters"] = Object.keys(contractInstance.filters).reduce(
    (acc, key: string) => ({
      ...acc,
      [key]: (fn: WatchContractEventCallback<TAbi, any>) =>
        watchContractEvent(
          {
            address: contractConfig.address as Address,
            abi: contractConfig.abi,
            eventName: key as any,
          },
          fn
        ),
    }),
    {}
  );

  // Return the store/contract object
  return { ...store, ...functions, events };
};
