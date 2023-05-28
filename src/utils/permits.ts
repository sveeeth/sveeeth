import { getAccount, getNetwork, readContract } from "@wagmi/core";
import { createSigner } from "../index";
import { Nullable } from "../types";
import { Readable, writable } from "svelte/store";

const MAX_INT = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

interface Domain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

interface ERC2612PermitMessage {
  owner: string;
  spender: string;
  value: number | string;
  nonce: number | string;
  deadline: number | string;
}

interface RSV {
  r: string;
  s: string;
  v: number;
}

export type ERC2612Permit = ERC2612PermitMessage & RSV;

const EIP712Domain = [
  { name: "name", type: "string" },
  { name: "version", type: "string" },
  { name: "chainId", type: "uint256" },
  { name: "verifyingContract", type: "address" },
];

const createTypedERC2612Data = (message: ERC2612PermitMessage, domain: Domain) => {
  return {
    types: {
      EIP712Domain,
      Permit: [
        { name: "owner", type: "address" },
        { name: "spender", type: "address" },
        { name: "value", type: "uint256" },
        { name: "nonce", type: "uint256" },
        { name: "deadline", type: "uint256" },
      ],
    },
    primaryType: "Permit",
    domain,
    message,
  };
};

const getTokenName = async (tokenAddress: string): Promise<string> => {
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

const getNonce = async (tokenAddress: string): Promise<string> => {
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

const getDomain = async (token: string | Domain): Promise<Domain> => {
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

const getRSV = (data: any): RSV => {
  return {
    r: data.slice(0, 66),
    s: "0x" + data.slice(66, 130),
    v: parseInt(data.slice(130, 132), 16),
  };
};

type Permitter<T> = {
  data: Nullable<T>;
  error: any;
  isLoading: boolean;
};

type ERC2612PermitArgs = {
  token: string | Domain;
  owner: string;
  spender: string;
  value?: string | number;
  deadline?: number;
  nonce?: number;
};

interface PermitterStore<TPermit, TPermitArgs> extends Readable<Permitter<TPermit>> {
  permit: (args: TPermitArgs) => Promise<TPermit | null>;
}

export function createERC2612Permit(): PermitterStore<ERC2612Permit, ERC2612PermitArgs> {
  const { subscribe, set } = writable<Permitter<ERC2612Permit>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const permit = async ({
    token,
    owner,
    spender,
    value,
    deadline,
    nonce,
  }: ERC2612PermitArgs): Promise<ERC2612Permit | null> => {
    set({
      data: null,
      error: null,
      isLoading: true,
    });

    try {
      const signer = createSigner();
      const tokenAddress = (token as Domain).verifyingContract || (token as string);

      const message: ERC2612PermitMessage = {
        owner,
        spender,
        value: value || MAX_INT,
        nonce: nonce || (await getNonce(tokenAddress)),
        deadline: deadline || MAX_INT,
      };

      const domain = await getDomain(token);
      const typedData = createTypedERC2612Data(message, domain);
      const permit = await signer.signTypedData(typedData);

      return { ...message, ...getRSV(permit) };
    } catch (error: any) {
      set({ error, data: null, isLoading: false });
    }

    return null;
  };

  return {
    permit,
    subscribe,
  };
}
