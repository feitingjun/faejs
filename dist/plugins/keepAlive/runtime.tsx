import { defineRuntime } from '../../core/define'
import { useConfig } from '../../app/method'
import { DefaultPageConfig } from '../../app/types'
import { AliveScope, KeepAlive, useAliveController, CachingNode } from 'react-activation'
import { useLocation } from 'react-router'

export type KeepAlivePageConfig = {
  /**当前页面是否缓存 */
  keepAlive?: boolean
}

export type KeepAliveAppConfig = {
  /**项目keepAlive配置 */
  keepAlive?: {
    /**页面默认是否缓存 */
    default?: boolean
  }
}

/**
 * 获取缓存节点列表  
 * includeLayout: 是否包含layout
 */
export const useCachingNodes = (includeLayout?: boolean) => {
  const { getCachingNodes, dropScope: drop, clear } = useAliveController()
  const cachingNodes:CachingNode[] = getCachingNodes()
  /**
   * 删除缓存节点  
   * names: 要删除的节点name列表  
   * relevance: 是否删除关联节点的缓存  
   ** 删除节点时如果没有兄弟节点存在则会同步删除父级layout的缓存
   ** 删除layout节点缓存时会同步删除子节点的缓存
  */
  const dropScope = (names: string[], relevance:boolean=true) => {
    const arr: string[] = []
    const recursion = (list:string[], direction?: 'up' | 'down') => {
      list.forEach(item => {
        const node = cachingNodes.find(v => v.name === item)!
        if(!arr.includes(node.name!)) arr.push(node.name!)
        // 查询子级
        if(node.layout && direction !== 'up') {
          const childs = cachingNodes.filter(v => v.parendRouteId === node.routeId)
          recursion(childs.map(v => v.name!), 'down')
        }
        if(direction === 'down') return
        // 查询打开的兄弟节点，没有则将父级也清除
        const sibling = cachingNodes.filter(v => v.parendRouteId === node.parendRouteId && v.name !== node.name && !arr.includes(v.name!))
        if(sibling.length > 0) return
        const parent = cachingNodes.find(v => v.routeId === node.parendRouteId)
        if(parent) recursion([parent.name!], 'up')
      })
    }
    relevance ? recursion(names) : arr.push(...names)
    arr.forEach(v => drop(v))
    return arr
  }
  return {
    cachingNodes: includeLayout ? cachingNodes : cachingNodes.filter(v => !v.layout),
    dropScope,
    clear
  }
}

export default defineRuntime(({
  addProvider,
  addWrapper,
  appContext: {
    appConfig
  }
}) => {
  const { keepAlive: keep } = appConfig as KeepAliveAppConfig
  addProvider(({ children }) => {
    return <AliveScope>{children}</AliveScope>
  })
  addWrapper(({ children, routeId, layout, parentId }) => {
    let { pathname, search } = useLocation()
    const id = layout ? routeId : routeId + search
    const { keepAlive=keep?.default, pagename } = useConfig<DefaultPageConfig<KeepAlivePageConfig>>()??{}
    if(!keepAlive) return children
    return (
      <KeepAlive
        name={id}
        cacheKey={id}
        id={search}
        pagename={pagename}
        pathname={pathname}
        search={search}
        routeId={routeId}
        layout={layout}
        parendRouteId={parentId}
        /**
         * react-freeze与React.createRoot搭配使用会导致React.useLayoutEffec多次重复执行，
         * 从而造成antd的Button组件在页面切换时显示loading，使用autoFreeze关闭react-freeze，但会导致性能下降
         * 或者降级到react17
         * */
        autoFreeze={false}
      >{children}</KeepAlive>
    )
  })
})