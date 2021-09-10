if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
} else {
  require('docker-secret-env').load()
}
