import { fetchEnsAddress } from "@wagmi/core";
import { Abi, AbiFunction } from "abitype";

/**
 * Returns the address associated with a given ENS name or the
 * original input if it's already an address.
 *
 * An input ending with ".eth" is assumed to be an ENS name and the
 * corresponding address.
 *
 * @param addressOrEns The input string that can be an address or an ENS name.
 *
 * @returns A promise that resolves to a string representing the address or null if the input
 *          is not a valid address or ENS name.
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
 * @returns The AbiFunction object representing the function in the ABI that matches the given
 *          name, or undefined if no such function is found.
 */
export const getAbiFunction = (abi: Abi, name: String): AbiFunction | undefined => {
  return abi.find(
    fn => fn.type === "function" && fn.name === name,
  ) as AbiFunction | undefined;
};