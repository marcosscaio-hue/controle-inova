const { spawnSync } = require('child_process')
const path = require('path')
const os = require('os')

const download = require('../node_modules/node-flywaydb/lib/download')
const config = require('../flyway.config.cjs')()

const command = process.argv[2] || 'migrate'

// Quote values that contain spaces so Flyway doesn't split them
const flywayArgs = Object.entries(config.flywayArgs).map(([k, v]) => {
  const val = String(v)
  return val.includes(' ') ? `-${k}="${val}"` : `-${k}=${val}`
})

download.ensureArtifacts(config, function (err, flywayBin) {
  if (err) {
    console.error('Erro ao baixar Flyway:', err.message)
    process.exit(1)
  }

  // Paths with spaces on Windows require quoting + windowsVerbatimArguments
  // https://github.com/nodejs/node/issues/7367
  const hasSpaces = flywayBin.includes(' ') && os.platform() === 'win32'
  const safeBin = hasSpaces ? `"${flywayBin}"` : flywayBin

  const result = spawnSync(safeBin, [command, ...flywayArgs], {
    stdio: 'inherit',
    shell: true,
    windowsVerbatimArguments: true,
    cwd: path.dirname(flywayBin),
  })

  process.exit(result.status ?? 1)
})
