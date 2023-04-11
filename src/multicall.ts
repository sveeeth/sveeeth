import { Abi, Address } from "abitype";
import { GetContractArgs, multicall as wagmiMulticall } from "@wagmi/core";

/**
 *  Multicall store
 *
 *  Example:
 *
 *  ```ts
 *  <script>
 *    const multicallDai = multicall({ address, abi });
 *    const multicallCall = multicallDai
 *      .call("balanceOf", [$account.address])
 *      .call("totalSupply")
 *      .call("name")
 *      .call("symbol")
 *  </script>
 *
 *  {#if $account.address}
 *    {#await multicallCall then result}
 *      <p>Balance: {result.balanceOf}</p>
 *      <p>Total supply: {result.totalSupply}</p>
 *      <p>Name: {result.name}</p>
 *      <p>Symbol: {result.symbol}</p>
 *    {/await}
 *  {/if}
 *  ```
 */
export const multicall = <T extends Abi>(contractConfig: GetContractArgs<T>) => {
  const calls: { functionName: string; args: any[]; address: Address; abi: Abi }[] = [];

  const execute = async () => {
    return await wagmiMulticall({ contracts: calls });
  };

  const call = (functionName: string, args?: any[]) => {
    calls.push({
      address: contractConfig.address as Address,
      abi: contractConfig.abi as Abi,
      functionName,
      args: args || [],
    });
    return { calls, call, execute };
  };

  return {
    calls,
    execute,
    call: (functionName: string, args: any[]) => {
      calls.length = 0;
      return call(functionName, args);
    },
  };
};
