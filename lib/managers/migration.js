const fs = require('fs')
const { join } = require('path')
const {
  createDirectory,
  createIfNotExists,
} = require('../utils/files')

const sortMigrations = (migrations) => {
  return migrations
    .filter((f) => /[0-9]+:[A-Za-z_-]/.test(f))
    .sort((x, y) => {
      const migrationX = parseInt(x.split(':')[0])
      const migrationY = parseInt(y.split(':')[0])

      if ((Date.now() - migrationX) > (Date.now() - migrationY)) {
        return migrationY
      } else {
        return migrationX
      }
    })
}

export const runMigration = (
  p,
  r,
  d,
  isUp,
) => new Promise((resolve, reject) => {
  const forgedPath = join(p, isUp ? 'up.sql' : 'down.sql')

  fs.readFile(forgedPath, (error, buffer) => {
    if (error) {
      reject(new Error(`An issue pulling up migration: ${error}`))
    } else {
      runQuery(buffer, r, d)
        .then((result) => resolve(result))
        .catch((error) => reject(error))
    }
  })
})

export const generateMigration = async (name) => {
  const constructedMigrationPath = join(
    process.cwd(), 'migrations', `${Date.now()}:${name}`,
  )

  await createDirectory(constructedMigrationPath)

  const upFilePath = join(constructedMigrationPath, 'up.sql')
  const downFilePath = join(constructedMigrationPath, 'down.sql')

  await createIfNotExists(upFilePath, `CREATE TABLE ${name};`)
  await createIfNotExists(downFilePath, `DROP TABLE ${name};`)
}

export const runMigrations = (queryRunner, driver) =>
  new Promise((resolve, reject) => {
    const outgoingResult = {
      up: undefined,
      down: undefined,
    }

    const migrationPath = join(process.cwd(), 'migrations')

    fs.readdir(migrationPath, (error, migrations) => {
      const sortedMigrations = sortMigrations(migrations)

      if (error) {
        reject(error)
      }

      for (const mig of sortedMigrations) {
        const migrationFile = join(migrationPath, mig)

        runMigration(migrationFile, queryRunner, driver, false)
          .then((result) => {
            outgoingResult.down = result
          })
          .catch((error) => reject(error))

        runMigration(migrationFile, queryRunner, driver, true)
          .then((result) => {
            outgoingResult.up = result
          })
          .catch((error) => reject(error))
      }
    })

    resolve(outgoingResult)
  })

const runQuery = async (query, runner, driver) => {
  let outgoingResult

  switch (driver.toLowerCase()) {
    case 'sqlite':
    case 'sqlit3':
      runner.run(query, (error, result) => {
        if (error) {
          throw new Error(`Issue on SQLite driver: ${error}`)
        } else {
          outgoingResult = result
        }
      })
      break
    case 'pg':
    case 'postgres':
    case 'postgresql':
      try {
        outgoingResult = await runner.query(query)
      } catch (error) {
        throw new Error(`Issue on PgSQL driver: ${error}`)
      }
      break
    case 'mysql':
    case 'maria':
    case 'mariadb':
      runner.query(query, (err, results, fields) => {
        if (err) {
          throw new Error(`Issue on MySQL driver: ${err}`)
        } else {
          outgoingResult = { results, fields }
        }
      })
      break
    default:
      throw new Error(`Invalid driver: ${driver}`)
  }

  return outgoingResult
}
