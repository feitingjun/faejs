import { useLocation } from 'react-router'
import { defineRuntime } from '../../core/define'
import AliveScope from './aliveScope'
import KeepAlive from './keepAlive'
import { useConfig } from '../../app/method'
import { DefaultPageConfig } from '../../app/types'

export type KeepAlivePageConfig = {
  /**当前页面是否缓存 */
  keepAlive?: boolean
}

export interface KeepAliveAppTypes {
  /**keepAlive配置 */
  keepAlive?: {
    /**路由是否默认使用keepAlive */
    default: boolean
  }
}

export default defineRuntime(({
  addProvider,
  addWrapper,
  appContext: {
    appConfig
  }
}) => {
  const { keepAlive: keep } = appConfig as KeepAliveAppTypes
  addProvider(({ children }) => {
    return <AliveScope>{children}</AliveScope>
  })
  addWrapper(({ children, layout, routeId }) => {
    // if(layout) return children
    const { pathname, search } = useLocation()
    const { keepAlive=keep?.default, pagename } = useConfig<DefaultPageConfig<KeepAlivePageConfig>>()
    if(!keepAlive) return children
    return <KeepAlive
      name={routeId+search}
      pagename={pagename}
    >{children}</KeepAlive>
  })
})