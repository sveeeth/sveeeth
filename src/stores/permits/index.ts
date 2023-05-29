export * from "./createERC2612PermitStore";

import { getAccount, getNetwork, readContract } from "@wagmi/core";

import { Nullable } from "types";

export interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

export interface RSV {
  r: string;
  s: string;
  v: number;
}

export type Permitter<TPermit, TPermitArgs> = {
  data: Nullable<TPermit>;
  error: any;
  isLoading: boolean;
  permit: (args: TPermitArgs) => Promise<TPermit | null>;
};

export const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

export const getTokenName = async (tokenAddress: string): Promise<string> => {
  return await readContract({
    address: tokenAddress,
    abi: [
      {
        constant: true,
        inputs: [],
        name: "name",
        outputs: [
          {
            name: "",
            type: "string",
          },
        ],
        payable: false,
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "name",
  });
};

export const getNonce = async (tokenAddress: string): Promise<string> => {
  const { address } = getAccount();
  if (!address) {
    throw new Error("you must be connected to a wallet to sign a permit");
  }

  return await readContract({
    address: tokenAddress,
    abi: [
      {
        inputs: [
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
        ],
        name: "nonces",
        outputs: [
          {
            internalType: "uint256",
            name: "",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "nonces",
    args: [address],
  });
};

export const getDomain = async (token: string | Domain): Promise<Domain> => {
  if (typeof token !== "string") {
    return token as Domain;
  }

  const { chain } = getNetwork();
  if (!chain?.id) {
    throw new Error("you must be connected to a network to sign a permit");
  }

  const tokenAddress = token as string;

  return {
    name: await getTokenName(tokenAddress),
    version: "1",
    chainId: chain.id,
    verifyingContract: tokenAddress,
  };
};

export const getRSV = (data: any): RSV => {
  return {
    r: data.slice(0, 66),
    s: "0x" + data.slice(66, 130),
    v: parseInt(data.slice(130, 132), 16),
  };
};
