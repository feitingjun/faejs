import { ReactNode, ReactElement } from 'react';
export default function KeepAlive({ name, children, ...props }: {
    name: string;
    children: ReactNode;
    [prop: string]: any;
}): string | number | bigint | boolean | Iterable<ReactNode> | Promise<string | number | bigint | boolean | import("react").ReactPortal | ReactElement<unknown, string | import("react").JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | import("react/jsx-runtime").JSX.Element | null | undefined;
