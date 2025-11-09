import pkg from '../package.json'

export const NAME = pkg.name

export const VERSION = pkg.version

export const DEFAULT_OPTIONS = {
  pageSize: 100,
  latest: false,
}

export const REQUEST_URL = 'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery'
export const REQUEST_HEADERS = {
  'Accept': 'application/json;api-version=7.1-preview.1',
  'Content-Type': 'application/json',
  'Origin': 'https://marketplace.visualstudio.com',
}
export const REQUEST_BODY = {
  assetTypes: ['Microsoft.VisualStudio.Services.VSIXPackage'],
}
