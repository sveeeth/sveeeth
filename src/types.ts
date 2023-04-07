import { Address, GetAccountResult, GetNetworkResult } from "@wagmi/core";

export type Nullable<T> = T | null;

export interface Account {
  address: Nullable<Address>;
  isConnected: Nullable<boolean>;
  isReconnecting: Nullable<boolean>;
  isDisconnected: Nullable<boolean>;
  status: Nullable<GetAccountResult["status"]>;
}

export interface Network extends GetNetworkResult {}
