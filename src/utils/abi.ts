import { Abi } from "abitype";

/**
 * Returns the function that matches the given function name from the provided ABI.
 *
 * @param abi The ABI of a smart contract.
 * @param name A string representing the name of the function to be retrieved.
 *
 * @returns The function in the ABI that matches the given name, or undefined if no
 *          such function is found.
 */
export const getAbiFunction = (abi: Abi, name: string) => {
  return abi.find((fn) => fn.type === "function" && fn.name === name);
};
