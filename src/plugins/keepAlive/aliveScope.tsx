import { ReactNode, useState, Fragment, useRef } from 'react'
import { ScopeContext } from './context'
import Activation from './activation'
import Keeper from './keeper'

export default function AliveScope ({
  children
}:{
  children: ReactNode
}) {
  const actives = useRef<Map<string, Activation>>(new Map())
  const [ names, setNames ] = useState<string[]>([])
  return (
    <Fragment>
      <ScopeContext.Provider value={{
        addActivation: at => {
          actives.current.set(at.name, at)
          setNames([...names, at.name])
        },
        getActivation: name => actives.current.get(name),
        destroy: name => {
          if(typeof name === 'string') name = [name]
          setNames(names.filter(v => !name.includes(v)))
          name.forEach(v => actives.current.delete(v))
        },
        destroyAll: () => {
          setNames([])
          actives.current.clear()
        },
        cachingNodes: names.map(v => ({...actives.current.get(v)!}))
      }}>
        {children}
        <div className='ka-caches'>{[...names.map(v => {
          return <Keeper key={v} name={v} />
        })]}</div>
      </ScopeContext.Provider>
    </Fragment>
  )
}