import { signTypedData } from "@wagmi/core";

import { MAX_INT } from "consts";
import { Domain, EIP712Domain, getDomain, getNonce, getRSV, RSV } from "stores";
import { Address } from "abitype";

export type ERC2612PermitArgs = {
  token: Address | Domain;
  owner: Address;
  spender: Address;
  value?: bigint;
  deadline?: bigint;
  nonce?: bigint;
};

export interface ERC2612PermitMessage {
  owner: Address;
  spender: Address;
  value: bigint;
  nonce: bigint;
  deadline: bigint;
}

export type ERC2612Permit = ERC2612PermitMessage & RSV;

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
  } as const;
};

export const signERC2612Permit = async ({
  token,
  owner,
  spender,
  value,
  deadline,
  nonce,
}: ERC2612PermitArgs): Promise<ERC2612Permit | null> => {
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
  const permit = await signTypedData(typedData);

  return { ...message, ...getRSV(permit) };
};
