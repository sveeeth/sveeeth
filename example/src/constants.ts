import type { Abi } from "abitype";
import daiExampleAbi from "./abis/erc20.json";

export const DAI_CONFIG = {
  address: "0x6b175474e89094c44da98b954eedeac495271d0f",
  abi: daiExampleAbi as Abi,
};
