const fs = require('fs/promises')
const { basename } = require('path')

export const read = async (path) => await fs.readFile(path)

export const create = async (path, buffer) =>
  await fs.writeFile(path, buffer)

export const createIfNotExists = async (path, buffer) => {
  try {
    await create(path, buffer)
  } catch (error) {
    throw new Error(error)
  }
}

export const createDirectory = async (path) => {
  try {
    await fs.mkdir(path)
  } catch (error) {
    if (error.toString().includes('Not Found')) {
      await createDirectory(basename(path))
    } else {
      throw new Error(error)
    }
  }
}
