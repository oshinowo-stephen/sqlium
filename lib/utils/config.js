const { read } = require('./files')
const yaml = require('js-yaml')

const parsePort = (incomingPort) => {
  if (isNaN(parseInt(incomingPort))) {
    throw new Error('Invalid Port.')
  } else {
    return parseInt(incomingPort)
  }
}

export const checkConfigOpts = async (config) => {
  if (typeof config !== 'string') {
    return config
  } else if (config === undefined) {
    return {
      host: process.env.DATABASE_HOST || 'localhost',
      port: parsePort(process.env.DATABASE_PORT),
      file: process.env.DATABASE_FILE,
      name: process.env.DATABASE_NAME,
      pass: process.env.DATABASE_PASS,
      user: process.env.DATABASE_USER,
      driver: process.env.DATABASE_DRIVER,
    }
  } else {
    return (await loadFromFile(config))
  }
}

const loadFromFile = async (path) => {
  const contents = await read(path)

  const yamlConf = yaml.load(contents)

  return {
    host: yamlConf.host || 'localhost',
    port: parsePort(yamlConf.port),
    driver: yamlConf.driver,
    file: yamlConf.file,
    name: yamlConf.name,
    pass: yamlConf.pass,
    user: yamlConf.user,
  }
}
