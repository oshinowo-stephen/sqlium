const { config: dotenv } = require('dotenv')
const { load: secrets } = require('docker-secret-env')

if (process.env.NODE_ENV !== 'production') {
  dotenv()
} else {
  secrets()
}
