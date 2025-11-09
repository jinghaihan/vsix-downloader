import type { ExtensionVersion } from './types'

export function extractSource(version: ExtensionVersion) {
  return version.files.find(i => i.assetType.includes('VSIXPackage'))?.source
}
