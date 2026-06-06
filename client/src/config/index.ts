// API 配置
const env = process.env.NODE_ENV || 'development'

const config = {
  development: {
    baseUrl: 'http://localhost:3000/api',
  },
  production: {
    baseUrl: 'https://www.pdstudios.me/api',
  },
}

export default config[env] || config.development
