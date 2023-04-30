import { Address, GetAccountResult, GetNetworkResult } from "@wagmi/core";

export type Nullable<T> = T | null;

export interface Account {
  address: Address;
  isConnected: boolean;
  isReconnecting: boolean;
  isDisconnected: boolean;
  status: GetAccountResult["status"];
}

export interface Network extends GetNetworkResult {}
