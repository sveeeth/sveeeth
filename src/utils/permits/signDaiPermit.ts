import { signTypedData } from "@wagmi/core";

import { MAX_INT } from "consts";
import { Domain, EIP712Domain, getDomain, getNonce, getRSV, RSV } from "stores";

export type DaiPermitArgs = {
  token: string | Domain;
  holder: string;
  spender: string;
  expiry?: number;
  nonce?: number;
  allowed?: boolean;
};

export interface DaiPermitMessage {
  holder: string;
  spender: string;
  nonce: number | string;
  expiry: number | string;
  allowed?: boolean;
}

export type DaiPermit = DaiPermitMessage & RSV;

const createTypedDaiData = (message: DaiPermitMessage, domain: Domain) => {
  return {
    types: {
      EIP712Domain,
      Permit: [
        { name: "holder", type: "address" },
        { name: "spender", type: "address" },
        { name: "nonce", type: "uint256" },
        { name: "expiry", type: "uint256" },
        { name: "allowed", type: "bool" },
      ],
    },
    primaryType: "Permit",
    domain,
    message,
  };
};

export const signDaiPermit = async ({
  token,
  holder,
  spender,
  expiry,
  nonce,
  allowed,
}: DaiPermitArgs): Promise<DaiPermit | null> => {
  const tokenAddress = (token as Domain).verifyingContract || (token as string);

  const message: DaiPermitMessage = {
    holder,
    spender,
    nonce: nonce || (await getNonce(tokenAddress)),
    expiry: expiry || MAX_INT,
    allowed: allowed === undefined ? true : allowed,
  };

  const domain = await getDomain(token);
  const typedData = createTypedDaiData(message, domain);
  const permit = await signTypedData(typedData);

  return { ...message, ...getRSV(permit) };
};
