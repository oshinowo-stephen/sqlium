require('./managers/env-loader')
const logger = require('./utils/logger')
const drivers = require('./managers/drivers')
const { checkConfigOpts } = require('./utils/config')
const { runMigrations, generateMigration } = require('./managers/migration')

const checkArgs = (incomingArgs) => {
  const { argv } = incomingArgs

  switch (argv._[0]) {
    case 'up':
    case 'run':
    case 'down':
    case 'rollback':
    case 'generate':
      break
    default:
      logger.error('Invalid Command')

      process.exit(1)
  }

  if (argv._.length === 0) {
    logger.error('Invalid Input, please insert a command.')

    process.exit(1)
  } else {
    return incomingArgs
  }
}

const grabConnection = async (driver, connOpts) => {
  let outgoingConnection

  switch (driver.toLowerCase()) {
    case 'sqlite':
    case 'sqlite3':
      try {
        outgoingConnection = await drivers.sqliteDriver(connOpts)
      } catch (error) {
        throw new Error(`SQLite driver ran into an error: ${error}`)
      }
      break
    case 'mysql':
    case 'maria':
    case 'mariadb':
      try {
        outgoingConnection = await drivers.mysqlDriver(connOpts)
      } catch (error) {
        throw new Error(`MySQL driver ran into an error: ${error}`)
      }
      break
    case 'pg':
    case 'postgres':
    case 'postgresql':
      try {
        outgoingConnection = await drivers.pgDriver(connOpts)
      } catch (error) {
        throw new Error(`PostgreSQL driver ran into an error: ${error}`)
      }
      break
    default:
      throw new Error('Unhandled/Invalid driver.')
  }

  return outgoingConnection
}

export const handle = (args) => checkArgs(args)
  .command('generate [ name ]', 'generate a migration file', (yargs) => {
    return yargs
      .positional('name', {
        describe: 'The migration name',
      })
  }, async (argv) => {
    if (!argv.name) {
      return logger.error('please supply a migraiton name.')
    }

    logger.info(`GENERATING MIGRATION ${argv.name}`)

    await generateMigration(argv.name)

    logger.info('MIGRATION GENERATED!!!')
  })
  .command('run', 'run all latest migrations', (yargs) => yargs,
    async (argv) => {
      let conn

      const opts = await checkConfigOpts(argv.config)

      try {
        conn = await grabConnection(opts.driver, {
          name: opts.name,
          user: opts.user,
          pass: opts.pass,
          host: opts.host,
          port: opts.port,
          file: opts.file,
        })
      } catch (error) {
        logger.error(`Failed to retrieve connection, reason: ${error}`)

        process.exit(1)
      }

      try {
        await runMigrations(conn, opts.driver)
      } catch (error) {
        logger.error(`Having some problems running migrations: ${error}`)

        process.exit(1)
      }

      logger.info('RUNNING LATEST MIGRATIONS')
    })
  .command('rollback', 'rollback all ran migrations', (yargs) => yargs,
    async (args) => {
      logger.info('ROLLING BACK ALL RAN MIGRATIONS')
    })
  .option('config', {
    alias: 'C',
    type: 'string',
    description: 'Path to SQL config',
  })
  .option('verbose', {
    alias: 'v',
    type: 'boolean',
    description: 'Verbose logging.',
  })
  .argv
