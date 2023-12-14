import { signTypedData } from "@wagmi/core";

import { MAX_INT } from "consts";
import { Domain, EIP712Domain, getDomain, getNonce, getRSV, RSV } from "stores";
import { Address } from "abitype";

export type DaiPermitArgs = {
  token: Address | Domain;
  holder: Address;
  spender: Address;
  expiry?: bigint;
  nonce?: bigint;
  allowed: boolean;
};

export interface DaiPermitMessage {
  holder: Address;
  spender: Address;
  nonce: bigint;
  expiry: bigint;
  allowed: boolean;
}

export type DaiPermit = DaiPermitMessage & RSV;

const createTypedDaiData = (message: DaiPermitMessage, domain: Domain) => {
  return {
    domain,
    message,
    types: {
      EIP712Domain,
      Permit: [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
      ],
    } as const,
    primaryType: "Permit",
  } as const;
};

export const signDaiPermit = async ({
  token,
  holder,
  spender,
  expiry,
  nonce,
  allowed = true,
}: DaiPermitArgs): Promise<DaiPermit | null> => {
  const tokenAddress = ((token as Domain).verifyingContract || token) as Address;

  const message: DaiPermitMessage = {
    holder,
    spender,
    nonce: nonce || (await getNonce(tokenAddress)),
    expiry: expiry || MAX_INT,
    allowed: allowed,
  } as const;

  const domain = await getDomain(token);
  const typedData = createTypedDaiData(message, domain);
  const permit = await signTypedData(typedData);

  return { ...message, ...getRSV(permit) };
};
