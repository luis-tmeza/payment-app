declare module 'vuex' {
  import type { App } from 'vue';

  export type Mutation<S> = (state: S, payload?: any) => void;

  export type StoreOptions<S> = {
    state?: S | (() => S);
    mutations?: Record<string, Mutation<S>>;
    plugins?: Array<(store: Store<S>) => void>;
  };

  export type MutationPayload = {
    type: string;
    payload?: unknown;
  };

  export type Store<S> = {
    readonly state: S;
    install(app: App): void;
    commit(type: string, payload?: unknown): void;
    subscribe(listener: (mutation: MutationPayload, state: S) => unknown): () => void;
  };

  export function createStore<S>(options: StoreOptions<S>): Store<S>;
}