import { Readable, writable } from "svelte/store";
import { signMessage, SignMessageArgs } from "@wagmi/core";
import { Nullable } from "./types";

type Signer = {
  data: Nullable<string>;
  error: any;
  isLoading: boolean;
};

interface SignerStore extends Readable<Signer> {
  sign: ({ message }: SignMessageArgs) => Promise<any>;
}

export function createSigner(): SignerStore {
  const { subscribe, set } = writable<Signer>({
    data: null,
    error: null,
    isLoading: false,
  });

  const sign = async ({ message }: SignMessageArgs): Promise<string | null> => {
    set({
      data: null,
      error: null,
      isLoading: true,
    });

    try {
      const data = await signMessage({ message });
      set({ data, error: null, isLoading: false });
      return data;
    } catch (error: any) {
      set({ error, data: null, isLoading: false });
    }

    return null;
  };

  return {
    sign,
    subscribe,
  };
}
