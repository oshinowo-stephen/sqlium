const pg = require('pg')
const mysql = require('mysql2')
const sqlite = require('sqlite3')

export const sqliteDriver = ({ file }) => new Promise((resolve, reject) => {
  let driver
  let driverError

  if (!file) {
    driverError = new Error('Missing/Not Found database file.')

    reject(driverError)
  } else {
    driver = new sqlite.Database(file, (error) => {
      if (error) {
        driverError = error
      }

      reject(driverError)
    })

    resolve(driver)
  }
})

export const mysqlDriver = ({
  host,
  port,
  pass,
  user,
  name,
}) => Promise((r, rej) => {
  let driverError

  const connection = mysql.createConnection({
    host,
    user,
    port,
    password: pass,
    database: name,
  })

  connection.connect((error) => {
    if (error) {
      driverError = new Error(error)
    }
  })

  if (driverError !== undefined) {
    rej(driverError)
  } else {
    r(connection)
  }
})

export const pgDriver = async ({
  host,
  user,
  port,
  pass,
  name,
}) => {
  const client = new pg.Client({
    user,
    host,
    port,
    password: pass,
    database: name,
  })

  try {
    await client.connect()
  } catch (error) {
    throw new Error(error)
  }

  return client
}
