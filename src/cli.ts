import type { CAC } from 'cac'
import type { CommandOptions } from './types'
import { Buffer } from 'node:buffer'
import { writeFile } from 'node:fs/promises'
import process from 'node:process'
import * as p from '@clack/prompts'
import c from 'ansis'
import { cac } from 'cac'
import { ofetch } from 'ofetch'
import { resolve } from 'pathe'
import { resolveConfig } from './config'
import { NAME, VERSION } from './constants'

try {
  const cli: CAC = cac(NAME)

  cli
    .command('[name]', 'A CLI to Fetch Vsix Files from Visual Studio Marketplace.')
    .option('--cwd <cwd>', 'The current working directory.')
    .option('--publisher <publisher>', 'The publisher of the extension.')
    .option('--extension <extension>', 'The name of the extension.')
    .option('--page-size <size>', 'The page size.')
    .option('--latest', 'Download the latest version of the extension.')
    .allowUnknownOptions()
    .action(async (name: string = '', options: Partial<CommandOptions>) => {
      p.intro(`${c.yellow`${NAME} `}${c.dim`v${VERSION}`}`)

      const config = await resolveConfig(name, options)

      const spinner = p.spinner()
      spinner.start('Downloading extension...')
      const response = await ofetch(config.url, { responseType: 'arrayBuffer' })
      spinner.stop('Download completed')

      const filename = `${config.publisher}.${config.extension}-${config.version}.vsix`
      await writeFile(resolve(config.cwd, filename), Buffer.from(response))

      p.outro(c.green(`Done`))
    })

  cli.help()
  cli.version(VERSION)
  cli.parse()
}
catch (error) {
  console.error(error)
  process.exit(1)
}
