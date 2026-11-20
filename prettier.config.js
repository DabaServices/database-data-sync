//  @ts-check

/** @type {import('prettier').Config} */
const config = {
  printWidth: 100,
  semi: false,
  endOfLine: 'lf',
  singleQuote: true,
  trailingComma: 'all',
  plugins: ['prettier-plugin-organize-imports'],
}

export default config
