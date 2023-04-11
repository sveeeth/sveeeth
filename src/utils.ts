import { Address, fetchEnsAddress, fetchEnsAvatar, fetchEnsName } from "@wagmi/core";
import { Abi, AbiFunction } from "abitype";
import { Nullable } from "./types";

/**
 * Returns the address associated with a given ENS name or the
 * original input if it's already an address.
 *
 * An input ending with ".eth" is assumed to be an ENS name and the
 * corresponding address.
 *
 * @param addressOrEns The address or an ENS name.
 *
 * @returns A promise that resolves to a string representing the address or null if the
 *          input is not a valid address or ENS name.
 */
export const addressOrEns = async (addressOrEns: string): Promise<string | null> => {
  return addressOrEns.endsWith(".eth")
    ? await fetchEnsAddress({ name: addressOrEns })
    : addressOrEns;
};

/**
 * Returns the function that matches the given function name from the provided ABI.
 *
 * @param abi The ABI of a smart contract.
 * @param name A string representing the name of the function to be retrieved.
 *
 * @returns The function in the ABI that matches the given name, or undefined if no
 *          such function is found.
 */
export const getAbiFunction = (abi: Abi, name: string): AbiFunction | undefined => {
  return abi.find((fn) => fn.type === "function" && fn.name === name) as AbiFunction | undefined;
};

export type FetchEnsDataArgs = {
  address: Address | null;
  chainId?: number;
};

export type FetchEnsDataResult = {
  name: Nullable<string>;
  avatar: Nullable<string>;
};

/**
 * Asynchronously fetches ENS data for a given address.
 *
 * @param address The address to fetch ENS data for.
 * @param chainId The chainId to use for the provider.
 *
 * @returns A Promise that resolves to an array of two strings, the ENS name and avatar.
 */
export const fetchEnsData = async ({
  address,
  chainId,
}: FetchEnsDataArgs): Promise<FetchEnsDataResult> => {
  if (!address) {
    return { name: null, avatar: null };
  }

  const [name, avatar] = await Promise.all([
    fetchEnsName({ address, chainId }),
    fetchEnsAvatar({ address, chainId }),
  ]);

  return { name, avatar };
};
