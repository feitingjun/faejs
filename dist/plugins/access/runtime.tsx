import { defineRuntime } from '../../core/define'
import { useConfig } from '../../app/method'
import { createContext, useContext, useState, PropsWithChildren } from 'react'

export interface AccessPageConfig {
  /**当前页面权限code */
  access?: string | string[]
}

export interface AccessAppConfig {
  /**路由组件无权限时显示的组件 */
  NoAccess?: React.FC
}

const Context = createContext<{
  access: string[]
  setAccess: (access: string[]) => void
}>({
  access: [],
  setAccess: () => {}
})

export const useAuth = (code: string|string[]) => {
  const access = useContext(Context).access
  if(Array.isArray(code)){
    return code.some(c => access.includes(c))
  }
  return access.includes(code)
}

export const Access = ({
  children,
  access
}:PropsWithChildren<{
  access: string|string[]
}>) => {
  const hasAuth = useAuth(access)
  return hasAuth ? children : null
}

export const AccessHC = (access: string|string[]) => {
  return (Component: React.FC) => {
    return (props:any) => {
      return <Access access={access}><Component {...props} /></Access>
    }
  }
}

export const useAccess = () => {
  const { access, setAccess } = useContext(Context)
  return { access, setAccess }
}

export default defineRuntime(({
  addProvider,
  addWrapper,
  appContext: {
    appConfig
  }
}) => {
  const { NoAccess } = appConfig as AccessAppConfig
  addProvider(({ children }) => {
    const [ access, setAccess ] = useState<string[]>([])
    return <Context.Provider value={{
      access,
      setAccess
    }}>{children}</Context.Provider>
  })
  addWrapper(({
    children
  }) => {
    const { access } = useConfig<AccessPageConfig>()
    // 没有定义access的页面不纳入权限管理
    if(!access) return children
    const isAuth = useAuth(access)
    return isAuth ? children : NoAccess ? <NoAccess /> :<>无权限</>
  })
})