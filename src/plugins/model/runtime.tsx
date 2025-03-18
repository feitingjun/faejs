import { defineRuntime } from '../../core/define'
import { useMemo } from 'react'
import { Provider } from './context'
// @ts-ignore
import { models as rawModels } from './model'

function ModelProviderWrapper(props: any) {
  const models = useMemo(() => {
    return Object.keys(rawModels).reduce((memo, key) => {
      // @ts-ignore
      memo[rawModels[key].namespace] = rawModels[key].model
      return memo
    }, {})
  }, [])
  return <Provider models={models} {...props}>{ props.children }</Provider>
}

export default defineRuntime(({
  addProvider
}) => {
  addProvider(({ children }) => {
    return <ModelProviderWrapper>{children}</ModelProviderWrapper>
  })
})