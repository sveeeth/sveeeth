import { Readable, writable } from "svelte/store";

import { Permitter } from "./index";
import { DaiPermit, DaiPermitArgs, signDaiPermit } from "utils";

export function createDaiPermitStore(): Readable<Permitter<DaiPermit, DaiPermitArgs>> {
  const permit = async ({
    token,
    holder,
    spender,
    expiry,
    nonce,
    allowed,
  }: DaiPermitArgs): Promise<DaiPermit | null> => {
    update((x) => ({
      ...x,
      data: null,
      error: null,
      isLoading: true,
    }));

    try {
      const data = await signDaiPermit({
        token,
        holder,
        spender,
        expiry,
        nonce,
        allowed,
      });

      update((x) => ({ ...x, data, isLoading: false }));
      return data;
    } catch (error: any) {
      update((x) => ({ ...x, error, data: null, isLoading: false }));
    }

    return null;
  };

  const { subscribe, update } = writable<Permitter<DaiPermit, DaiPermitArgs>>({
    data: null,
    error: null,
    isLoading: false,
    permit,
  });

  return {
    subscribe,
  };
}
