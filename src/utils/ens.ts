import { mainnet } from "@wagmi/core/chains";
import { Address, fetchEnsAddress, fetchEnsAvatar, fetchEnsName } from "@wagmi/core";

import { Nullable } from "types";

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

  const name = await fetchEnsName({ address, chainId });
  if (!name) {
    return { name: null, avatar: null };
  }

  const avatar = await fetchEnsAvatar({ name, chainId });

  return { name, avatar };
};

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
    ? await fetchEnsAddress({ chainId: mainnet.id, name: addressOrEns })
    : addressOrEns;
};
