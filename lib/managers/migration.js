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

export const rollbackMigrations = async () => {

}

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
    const migrationPath = join(process.cwd(), 'migrations')

    fs.readdir(migrationPath, (error, migrations) => {
      const sortedMigrations = sortMigrations(migrations)

      if (error) {
        reject(error)
      }

      for (const mig of sortedMigrations) {
        fs.readFile(join(migrationPath, mig, 'down.sql'), (error, data) => {
          if (error) {
            reject(error)
          } else {
            runQuery(`${data}`, queryRunner, driver)
              .catch((error) => reject(error))
              .then((result) => resolve(result))
          }
        })

        fs.readFile(join(migrationPath, mig, 'up.sql'), (error, data) => {
          if (error) {
            reject(error)
          } else {
            runQuery(`${data}`, queryRunner, driver)
              .catch((error) => reject(error))
              .then((result) => resolve(result))
          }
        })
      }
    })
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
        // console.log(runner)
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
