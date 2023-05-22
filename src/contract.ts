import {
  watchContractEvent,
  WatchContractEventCallback,
  readContract,
  writeContract,
  Address,
  ReadContractConfig,
  WriteContractUnpreparedArgs,
} from "@wagmi/core";
import { Abi } from "abitype";
import { Readable, writable } from "svelte/store";

import { addressOrEns, getAbiFunction } from "./utils";

interface ContractStore {
  isLoading: boolean;
}

export type Contract = Readable<ContractStore> & {
  read: { [key: string]: () => void };
  write: { [key: string]: () => void };
  events: { [key: string]: () => void };
};

/**
 * Contract store
 * This contract returns a readable svelte store mixed with an object containing
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
 *      daiBalance = await dai.read.balanceOf(acc);
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
export const contract = <
  TAbi extends Abi,
  TEventName extends string,
  TFunctionName extends string
>(contractConfig: {
  address: Address;
  abi: TAbi;
}): Contract => {
  const { subscribe, update } = writable<ContractStore>({ isLoading: false });

  const setIsLoading = (isLoading: boolean) => update((x) => ({ ...x, isLoading }));

  const read = new Proxy(
    {},
    {
      get(_, functionName: TFunctionName) {
        return async (..._args: readonly unknown[]) => {
          setIsLoading(true);

          const fn = getAbiFunction(contractConfig.abi, functionName);
          const args: readonly unknown[] = await Promise.all(
            _args.map(async (arg: any, index: number) =>
              fn?.type === "function" && fn?.inputs[index].type === "address"
                ? await addressOrEns(arg)
                : arg
            )
          );

          const data = await readContract({
            ...contractConfig,
            functionName,
            args,
          } as ReadContractConfig);

          setIsLoading(false);
          return data;
        };
      },
    }
  );

  const write = new Proxy(
    {},
    {
      get(_, functionName: TFunctionName) {
        return async (..._args: readonly unknown[]) => {
          setIsLoading(true);

          const fn = getAbiFunction(contractConfig.abi, functionName);
          const args: readonly unknown[] = await Promise.all(
            _args.map(async (arg: any, index: number) =>
              fn?.type === "function" && fn?.inputs[index].type === "address"
                ? await addressOrEns(arg)
                : arg
            )
          );

          // todo: prepared write is currently broken: https://github.com/wagmi-dev/wagmi/pull/2380
          // const config = await prepareWriteContract({
          //   ...contractConfig,
          //   functionName,
          //   args,
          // });

          const data = await writeContract({
            ...contractConfig,
            functionName,
            args,
          } as WriteContractUnpreparedArgs<TAbi, TFunctionName>);

          setIsLoading(false);
          return data;
        };
      },
    }
  );

  const events = new Proxy(
    {},
    {
      get(_, eventName: TEventName) {
        return (fn: WatchContractEventCallback<TAbi, TEventName>) => {
          return watchContractEvent(
            {
              ...contractConfig,
              eventName,
            },
            (args: any[]) => fn(args[0])
          );
        };
      },
    }
  );

  return { subscribe, read, write, events };
};
