import * as tedious from 'tedious';

export const DB_CONFIG: any = {
  database: process.env.DB_DATABASE,
  define: {
    timestamps: false,
  },
  dialect: 'mssql',
  dialectModule: tedious,
  dialectOptions: {
    options: {
      encrypt: true,
    },
  },
  host: process.env.DB_HOST,
  logging: false,
  password: process.env.DB_PASS,
  pool: {
    idle: 30000,
    max: 10,
    min: 0,
  },
  port: process.env.DB_PORT,
  username: process.env.DB_USER
};
