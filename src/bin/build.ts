import { build, mergeConfig } from 'vite'
import config from './config'

export default async function buildApp() {
  await build(mergeConfig(config, {
    logLevel: 'info',
  }))
}