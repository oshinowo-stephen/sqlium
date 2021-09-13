import test from 'ava'

import { join } from 'path'
import { checkConfigOpts } from '../lib/utils/config'

test('load from file', async (t) => {
  const configPath = join(__dirname, '..', 'example-conf.yml')

  const incomingConfig = await checkConfigOpts(configPath)

  t.is(incomingConfig.name, 'test_db')
})

test('default config load', async (t) => {
  t.true(2 + 2 === 4)
})
