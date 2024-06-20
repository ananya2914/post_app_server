// knexfile.js
import path from 'path';

export default {
    development: {
      client: 'pg',
      connection: {
        host: 'localhost',
        user: 'postgres',
        password: '1234',
        database: 'post_app',
        port: Number(process.env.DB_PORT),   
         },
      migrations: {
        directory: './src/db/migration',
        tableName: 'knex_migrations',
        extension: 'ts',
      }
    },
    seeds: {
      directory: path.join(__dirname, 'db', 'seeds'),
    },
    production: {
      client: 'pg',
      connection: process.env.DATABASE_URL,
      migrations: {
        tableName: 'knex_migrations'
      }
    }
  };
  