"use strict";
// knexfile.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
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
            tableName: 'knex_migrations',
            directory: './src/db/migrations'
        }
    },
    test: {
        client: 'postgresql',
        connection: {
          database: 'post_app', 
          user: 'postgres',
          password: '1234',
          host: 'localhost',
          port: 5432,
        },
        migrations: {
            tableName: 'knex_migrations',
            directory: './src/db/migrations'
    }},
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
