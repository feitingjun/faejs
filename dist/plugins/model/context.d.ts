import type { models as rawModels } from './model';
import React from 'react';
type Models = typeof rawModels;
type GetNamespaces<M> = {
    [K in keyof M]: M[K] extends {
        namespace: string;
    } ? M[K]['namespace'] : never;
}[keyof M];
type Namespaces = GetNamespaces<Models>;
export declare function Provider(props: {
    models: Record<string, any>;
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
type GetModelByNamespace<M, N> = {
    [K in keyof M]: M[K] extends {
        namespace: string;
        model: unknown;
    } ? M[K]['namespace'] extends N ? M[K]['model'] extends (...args: any) => any ? ReturnType<M[K]['model']> : never : never : never;
}[keyof M];
type Model<N> = GetModelByNamespace<Models, N>;
type Selector<N, S> = (model: Model<N>) => S;
type SelectedModel<N, T> = T extends (...args: any) => any ? ReturnType<NonNullable<T>> : Model<N>;
export declare function useModel<N extends Namespaces>(namespace: N): Model<N>;
export declare function useModel<N extends Namespaces, S>(namespace: N, selector: Selector<N, S>): SelectedModel<N, typeof selector>;
export {};
