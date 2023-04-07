export * from "@wagmi/core/connectors";
export * from "@wagmi/core/providers/public";
export * from "@wagmi/core/providers/infura";
export * from "@wagmi/core/providers/alchemy";
export * from "@wagmi/core/chains";
export { createClient, configureChains } from "@wagmi/core";
import { Abi } from "abitype";

import {
  ClientConfig,
  Connector,
  GetAccountResult,
  GetContractArgs,
  GetContractResult,
  GetNetworkResult,
  createClient,
  getAccount,
  getContract,
  getNetwork,
  getProvider,
  watchAccount,
  watchNetwork,
} from "@wagmi/core";
import { Address } from "@wagmi/core";
import { connect as wagmiConnect, disconnect as wagmiDisconnect } from "@wagmi/core";
import { Writable, writable } from "svelte/store";

type Nullable<T> = T | null;

interface ConnectProps {
  connector: Connector;
}

interface Account {
  address: Nullable<Address>;
  isConnected: Nullable<boolean>;
  isReconnecting: Nullable<boolean>;
  isDisconnected: Nullable<boolean>;
  status: Nullable<GetAccountResult["status"]>;
}

interface Network extends GetNetworkResult {}

export const connect = ({ connector }: ConnectProps) => wagmiConnect({ connector });
export const disconnect = () => wagmiDisconnect();

export const account = writable<Account>({
  address: null,
  isConnected: null,
  isReconnecting: null,
  isDisconnected: null,
  status: null,
});

export const network = writable<Network>({
  chains: [],
});

export const contract = <T extends Abi>(contractConfig: GetContractArgs<T>) => {
  const provider = getProvider();
  const contractInstance = getContract<T>({ ...contractConfig, signerOrProvider: provider });
  const state = writable({
    isLoading: false,
  });

  const shimmed: GetContractResult<T>["functions"] = Object.keys(contractInstance.functions).reduce(
    (acc, key) => ({
      ...acc,
      [key]: async (...args: any) => {
        state.update((x) => ({ ...x, isLoading: true }));
        const ret = await contractInstance[key](...args);
        state.update((x) => ({ ...x, isLoading: false }));
        return ret;
      },
    }),
    {} as GetContractResult<T>["functions"]
  );

  return { ...state, ...shimmed };
};

/*
░██████╗██╗░░░██╗███████╗███████╗███████╗████████╗██╗░░██╗
██╔════╝██║░░░██║██╔════╝██╔════╝██╔════╝╚══██╔══╝██║░░██║
╚█████╗░╚██╗░██╔╝█████╗░░█████╗░░█████╗░░░░░██║░░░███████║
░╚═══██╗░╚████╔╝░██╔══╝░░██╔══╝░░██╔══╝░░░░░██║░░░██╔══██║
██████╔╝░░╚██╔╝░░███████╗███████╗███████╗░░░██║░░░██║░░██║
╚═════╝░░░░╚═╝░░░╚══════╝╚══════╝╚══════╝░░░╚═╝░░░╚═╝░░╚═╝
*/

export default (clientConfig: ClientConfig) => {
  createClient(clientConfig);

  const acc = getAccount();
  if (acc) account.set(acc as Account);

  const net = getNetwork();
  if (net) network.set(net as Network);

  watchAccount((acc) => account.set(acc as Account));
  watchNetwork((net) => network.set(net as Network));
};
