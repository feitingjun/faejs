import { preview } from 'vite'
import config from './config'

export default async function previewApp(){
  const server = await preview(config)
  server.printUrls()
  server.bindCLIShortcuts({ print: true })
}