"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// knexfile.js
const path_1 = __importDefault(require("path"));
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
            directory: './src/db/migrations' ,
            tableName: 'knex_migrations',
            extension: 'ts',
        }
    },
    seeds: {
        directory: path_1.default.join(__dirname, 'db', 'seeds'),
    },
    production: {
        client: 'pg',
        connection: process.env.DATABASE_URL,
        migrations: {
            tableName: 'knex_migrations'
        }
    }
};
