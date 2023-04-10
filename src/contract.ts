import {
  getProvider,
  fetchSigner,
  getContract,
  Signer,
  GetContractArgs,
  GetContractResult,
} from "@wagmi/core";
import { Abi } from "abitype";
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
 */
export const contract = <T extends Abi>(contractConfig: GetContractArgs<T>) => {
  // Setup all the things
  const provider = getProvider();
  const contractInstance = getContract<T>({ ...contractConfig, signerOrProvider: provider });
  const store = writable({ isLoading: false });

  const setIsLoading = (isLoading: boolean) => store.update((x) => ({ ...x, isLoading }));

  // Loop through each key of the functions property and return their
  // associated contract instance value, wrapped in a shim that updates
  // isLoading on the store
  const shimmed: GetContractResult<T>["functions"] = Object.keys(contractInstance.functions).reduce(
    (acc, key) => ({
      ...acc,
      [key]: async (...args: any) => {
        setIsLoading(true);

        const fn = getAbiFunction(contractConfig.abi, key);
        const parsedArgs = await Promise.all(
          args.map(async (arg: any, index: number) =>
            fn?.inputs[index].type === "address" ? await addressOrEns(arg) : arg
          )
        );

        const signer = await fetchSigner();
        const ret = await contractInstance.connect(signer as Signer)[key](...parsedArgs);

        setIsLoading(false);
        return ret;
      },
    }),
    {} as GetContractResult<T>["functions"]
  );

  // Return the store/contract object
  return { ...store, ...shimmed };
};
