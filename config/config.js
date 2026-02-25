require('dotenv').config()

const isFly = !!process.env.FLY_APP_NAME
const options = isFly ? {} : { ssl: { rejectUnauthorized: false, require: true } }

module.exports = {
  development: {
    dialect: 'postgres',
    dialectOptions: options,
    use_env_variable: 'DATABASE_URL',
  },
  test: {
    dialect: 'postgres',
    dialectOptions: options,
    use_env_variable: 'DATABASE_URL',
  },
  production: {
    dialect: 'postgres',
    dialectOptions: options,
    use_env_variable: 'DATABASE_URL',
  },
}