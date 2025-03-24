import { resolve } from 'path'
import { definePlugin } from '../../core/define'

export default definePlugin({
  name: 'fae-atom',
  setup: ({
    addExport
  }) => {
    addExport({
      specifier: ['atom', 'useAtom'],
      source: resolve(import.meta.dirname, 'atom')
    })
  }
})