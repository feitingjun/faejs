import { resolve } from 'path'
import { definePlugin } from '../../core/define'

export default definePlugin({
  name: 'fae-jotai',
  setup: ({
    addExport
  }) => {
    addExport({
      specifier: ['atom', 'useAtom'],
      source: resolve(import.meta.dirname, 'jotai')
    })
  }
})