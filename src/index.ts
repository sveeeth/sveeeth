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
export { configureChains } from "@wagmi/core";
export * from "./contract";
export * from "./multicall";
export * from "./signer";

import {
  createConfig,
  getAccount,
  getNetwork,
  watchAccount,
  watchNetwork,
  ConnectArgs,
  CreateConfigParameters,
  connect as wagmiConnect,
  disconnect as wagmiDisconnect,
  switchNetwork as wagmiSwitchNetwork,
} from "@wagmi/core";
import { Readable, writable } from "svelte/store";

import { Account, Network } from "./types";

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
  address: "0x0000000000000000000000000000000000000000",
  isConnected: false,
  isReconnecting: false,
  isDisconnected: false,
  status: "disconnected",
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
 * Main Sveeeth function to be called at the very top of any
 * consuming app. This function creates the wagmi/core client
 * and sets up the account and network listeners and manages
 * updating the stores.
 */
export default (clientConfig: CreateConfigParameters) => {
  createConfig(clientConfig);

  const net = getNetwork();
  if (net) network.set(net as Network);

  const acc = getAccount();
  if (acc) accountStore.set(acc as Account);

  watchAccount((acc) => accountStore.set(acc as Account));
  watchNetwork((net) => network.set(net as Network));
};
