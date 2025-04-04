import { ReactNode, Context } from 'react';
export declare class Activation {
    name: string;
    /**组件的dom */
    dom: HTMLDivElement | null;
    /**组件是否激活 */
    active: boolean;
    /**组件的props */
    props: Record<string, any>;
    /**桥接的bridges列表 */
    bridges: {
        context: Context<any>;
        value: any;
    }[];
    /**这个组件实际的容器 */
    wrapper: HTMLDivElement | null;
    /**当前组件的children */
    children: ReactNode | null;
    /**激活监听器列表 */
    activateListeners: Set<() => void>;
    /**失活监听器列表 */
    unactivateListeners: Set<() => void>;
    constructor(name: string);
    /**切换激活状态 */
    toggle: (active: boolean) => void;
    /**更新组件 */
    update: (bridge: {
        context: Context<any>;
        value: any;
    }[], children: ReactNode, wrapper: HTMLDivElement | null) => void;
}
export default function KeepAlive({ name, children, ...props }: {
    name: string;
    children: ReactNode;
    [prop: string]: any;
}): import("react/jsx-runtime").JSX.Element;
