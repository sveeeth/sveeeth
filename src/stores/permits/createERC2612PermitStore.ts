import { Readable, writable } from "svelte/store";

import { Permitter } from "./index";
import { ERC2612Permit, ERC2612PermitArgs, signERC2612Permit } from "utils";

export function createERC2612PermitStore(): Readable<Permitter<ERC2612Permit, ERC2612PermitArgs>> {
  const permit = async ({
    token,
    owner,
    spender,
    value,
    deadline,
    nonce,
  }: ERC2612PermitArgs): Promise<ERC2612Permit | null> => {
    update((x) => ({
      ...x,
      data: null,
      error: null,
      isLoading: true,
    }));

    try {
      const data = await signERC2612Permit({
        token,
        owner,
        spender,
        value,
        deadline,
        nonce,
      });

      update((x) => ({ ...x, data, isLoading: false }));
      return data;
    } catch (error: any) {
      update((x) => ({ ...x, error, data: null, isLoading: false }));
    }

    return null;
  };

  const { subscribe, update } = writable<Permitter<ERC2612Permit, ERC2612PermitArgs>>({
    data: null,
    error: null,
    isLoading: false,
    permit,
  });

  return {
    subscribe,
  };
}
