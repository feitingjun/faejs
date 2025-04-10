import { PropsWithChildren } from 'react';
export interface AccessPageConfig {
    /**当前页面权限code */
    access?: string | string[];
}
export interface AccessAppConfig {
    /**路由组件无权限时显示的组件 */
    NoAccess?: React.FC;
}
export declare const useAuth: (code: string | string[]) => boolean;
export declare const Access: ({ children, access }: PropsWithChildren<{
    access: string | string[];
}>) => import("react").ReactNode;
export declare const AccessHC: (access: string | string[]) => (Component: React.FC) => (props: any) => import("react/jsx-runtime").JSX.Element;
export declare const useAccess: () => {
    access: string[];
    setAccess: (access: string[]) => void;
};
declare const _default: import("../..").Runtime;
export default _default;
