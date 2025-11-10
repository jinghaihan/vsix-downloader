import type { CommandOptions, Options } from './types'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { getExtensionVersion, searchExtensions } from './api'
import { DEFAULT_OPTIONS } from './constants'
import { extractSource } from './utils'

function normalizeConfig(options: Partial<CommandOptions>) {
  // interop
  if ('default' in options)
    options = options.default as Partial<CommandOptions>

  return options
}

export async function resolveConfig(name: string = '', options: Partial<CommandOptions>): Promise<Options> {
  const defaults = structuredClone(DEFAULT_OPTIONS)
  options = normalizeConfig(options)

  const merged: Partial<Options> = { ...defaults, ...options }
  merged.cwd = merged.cwd ?? process.cwd()

  const extract = (name: string) => {
    if (!name.includes('.'))
      return

    const [publisher, extension] = name.split('.')
    merged.publisher = merged.publisher ?? publisher
    merged.extension = merged.extension ?? extension
  }

  if (name.includes('.'))
    extract(name)

  if (name && (!merged.publisher || !merged.extension)) {
    const spinner = p.spinner()
    spinner.start('Searching for extensions...')
    const extensions = await searchExtensions(name)
    spinner.stop(`Found ${c.yellow(extensions.length)} extensions`)

    if (extensions.length === 0) {
      p.outro(c.yellow('No extensions found'))
      process.exit(1)
    }

    const options = extensions.map((i) => {
      return {
        label: `${i.displayName} · ${i.publisher.displayName}`,
        value: `${i.publisher.publisherName}.${i.extensionName}`,
        hint: i.shortDescription,
        version: i.versions[0].version,
        url: extractSource(i.versions[0]),
      }
    })

    if (options.length === 1) {
      const ext = options[0]
      extract(ext.value)
      p.log.info(`Using extension: ${c.yellow(ext.label)}`)
    }
    else {
      const result = await p.select({
        message: 'select an extension',
        options,
      })

      if (p.isCancel(result) || !result) {
        p.outro(c.red('aborting'))
        process.exit(1)
      }
      extract(result)
    }

    // use the latest version
    if (merged.latest) {
      const opt = options.find(i => i.value === `${merged.publisher}.${merged.extension}`)
      merged.version = opt?.version
      merged.url = opt?.url
    }
  }

  if (!merged.version || !merged.url) {
    const { version, url } = await promptVersion(merged.publisher!, merged.extension!)
    merged.version = version
    merged.url = url
  }

  return merged as Options
}

async function promptVersion(publisher: string, extension: string) {
  const spinner = p.spinner()
  spinner.start('Getting extension versions...')
  const versions = await getExtensionVersion(publisher, extension)
  spinner.stop(`Found ${c.yellow(versions.length)} versions`)

  if (!versions.length) {
    p.outro(c.red('No versions found'))
    process.exit(1)
  }

  const getSource = (version: string) => {
    return extractSource(versions.find(i => i.version === version)!)
  }

  if (versions.length === 1) {
    const extVer = versions[0]
    p.log.info(`Using version: ${c.yellow(extVer.version)}`)
    return { version: extVer.version, url: getSource(extVer.version) }
  }
  else {
    const version = await p.select({
      message: 'select a version',
      options: versions.map((i) => {
        return {
          label: i.version,
          value: i.version,
        }
      }),
      initialValue: getSource(versions[0].version),
    })
    if (p.isCancel(version) || !version) {
      p.outro(c.red('aborting'))
      process.exit(1)
    }

    return { version, url: getSource(version) }
  }
}
