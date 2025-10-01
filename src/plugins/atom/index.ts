import { resolve } from 'path'
import { definePlugin } from '../../core/define'

export default definePlugin({
  setup: ({ addExport }) => {
    addExport({
      specifier: ['atom', 'useAtom'],
      source: resolve(import.meta.dirname, 'atom')
    })
  }
})
