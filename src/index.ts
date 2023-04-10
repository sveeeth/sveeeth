/*
░██████╗██╗░░░██╗███████╗███████╗███████╗████████╗██╗░░██╗
██╔════╝██║░░░██║██╔════╝██╔════╝██╔════╝╚══██╔══╝██║░░██║
╚█████╗░╚██╗░██╔╝█████╗░░█████╗░░█████╗░░░░░██║░░░███████║
░╚═══██╗░╚████╔╝░██╔══╝░░██╔══╝░░██╔══╝░░░░░██║░░░██╔══██║
██████╔╝░░╚██╔╝░░███████╗███████╗███████╗░░░██║░░░██║░░██║
╚═════╝░░░░╚═╝░░░╚══════╝╚══════╝╚══════╝░░░╚═╝░░░╚═╝░░╚═╝

@author GeraldHost, 0xbarbs
@description A svelte wrapper around wagmi/core
*/
export * from "@wagmi/core";

import {
  createClient,
  getProvider,
  getAccount,
  getNetwork,
  watchAccount,
  watchNetwork,
  fetchSigner,
  getContract,
  Signer,
  ClientConfig,
  ConnectArgs,
  GetContractArgs,
  GetContractResult,
  connect as wagmiConnect,
  disconnect as wagmiDisconnect,
  switchNetwork as wagmiSwitchNetwork,
} from "@wagmi/core";
import { Abi } from "abitype";
import { Readable, writable } from "svelte/store";

import { Account, Network } from "./types";
import { addressOrEns, getAbiFunction } from "./utils";

/**
 * Connect
 */
export const connect = ({ connector }: ConnectArgs) => wagmiConnect({ connector });

/**
 * Disconnect
 */
export const disconnect = () => wagmiDisconnect();

/**
 * Account store
 */
const accountStore = writable<Account>({
  address: null,
  isConnected: null,
  isReconnecting: null,
  isDisconnected: null,
  status: null,
});

/**
 * Create account
 * @returns obj Readable store
 */
const createAccount = (): Readable<Account> => ({
  subscribe: accountStore.subscribe,
});

/**
 * The readable account store
 */
export const account = createAccount();

/**
 * Network store
 */
export const network = writable<Network>({
  chains: [],
});

/**
 * Switch network
 */
export const switchNetwork = wagmiSwitchNetwork;

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

/**
 * Main Sveeeth function to be called at the very top of any
 * consuming app. This function creates the wagmi/core client
 * and sets up the account and network listeners and manages
 * updating the stores.
 */
export default (clientConfig: ClientConfig) => {
  createClient(clientConfig);

  const net = getNetwork();
  if (net) network.set(net as Network);

  const acc = getAccount();
  if (acc) accountStore.set(acc as Account);

  watchAccount((acc) => accountStore.set(acc as Account));
  watchNetwork((net) => network.set(net as Network));
};
