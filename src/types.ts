export interface CommandOptions {
  cwd?: string
  publisher?: string
  extension?: string
  pageSize?: number
  latest?: boolean
}

export interface Options extends Required<CommandOptions> {
  version: string
  url: string
}

export interface ExtensionQueryResponse {
  results: {
    extensions: Extension[]
  }[]
}

export interface Extension {
  extensionId: string
  extensionName: string
  displayName: string
  shortDescription: string
  publisher: {
    publisherId: string
    publisherName: string
    displayName: string
  }
  versions: ExtensionVersion[]
  statistics: ExtensionStatistics[]
}

export interface ExtensionVersion {
  version: string
  lastUpdated: string
  files: ExtensionFile[]
}

export interface ExtensionFile {
  assetType: string
  source: string
}

export interface ExtensionStatistics {
  statisticName: string
  value: number
}
