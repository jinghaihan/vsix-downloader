import type { Extension, ExtensionQueryResponse, ExtensionVersion } from './types'
import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import { ofetch } from 'ofetch'
import { resolve } from 'pathe'
import { DEFAULT_OPTIONS, REQUEST_BODY, REQUEST_HEADERS, REQUEST_URL } from './constants'
import { extractSource } from './utils'

export async function searchExtensions(
  name: string,
  page: number = 1,
  pageSize: number = DEFAULT_OPTIONS.pageSize,
): Promise<Extension[]> {
  const response = await ofetch<ExtensionQueryResponse>(
    REQUEST_URL,
    {
      method: 'POST',
      headers: REQUEST_HEADERS,
      body: JSON.stringify({
        ...REQUEST_BODY,
        filters: [
          {
            criteria: [
              { filterType: 8, value: 'Microsoft.VisualStudio.Code' },
              { filterType: 10, value: name },
              { filterType: 12, value: '37888' },
            ],
            pageNumber: page,
            pageSize,
            sortBy: 0,
            sortOrder: 0,
          },
        ],
        flags: 914,
      }),
    },
  )

  return response.results[0]?.extensions || []
}

export async function getExtensionVersion(publisher: string, extension: string): Promise<ExtensionVersion[]> {
  const response = await ofetch<ExtensionQueryResponse>(
    REQUEST_URL,
    {
      method: 'POST',
      headers: REQUEST_HEADERS,
      body: JSON.stringify({
        ...REQUEST_BODY,
        filters: [
          {
            criteria: [{ filterType: 7, value: `${publisher}.${extension}` }],
            direction: 2,
            pageSize: 1,
            pageNumber: 1,
          },
        ],
        flags: 2151,
      }),
    },
  )

  return response.results[0]?.extensions[0]?.versions ?? []
}

export async function downloadExtension(
  publisher: string,
  extension: string,
  cwd: string = process.cwd(),
): Promise<void> {
  const response = await ofetch<ExtensionQueryResponse>(
    REQUEST_URL,
    {
      method: 'POST',
      headers: REQUEST_HEADERS,
      body: JSON.stringify({
        ...REQUEST_BODY,
        filters: [
          {
            criteria: [{ filterType: 7, value: `${publisher}.${extension}` }],
            direction: 2,
            pageSize: 1,
            pageNumber: 1,
          },
        ],
        flags: 914,
      }),
    },
  )
  const extensionVersion = response.results[0].extensions[0].versions[0]
  const url = extractSource(extensionVersion)

  const data = await ofetch(url, { responseType: 'arrayBuffer' })
  const filename = `${publisher}.${extension}-${extensionVersion.version}.vsix`
  await writeFile(resolve(cwd, filename), Buffer.from(data))
}
