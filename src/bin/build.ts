import { build as viteBuild, mergeConfig } from 'vite'
import config from './config'

export default async function build() {
  await viteBuild(mergeConfig(config, {
    logLevel: 'info',
  }))
}