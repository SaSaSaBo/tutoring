import { TypeOrmModule } from '@nestjs/typeorm';
import * as config from 'config';

const db = config.get('db');

export const typeOrmDatabase = [
  TypeOrmModule.forRoot({
    type: db.type ,
    port: db.port,
    username: db.username,
    password: db.password ,
    database: db.database,
    name: db.name,
    schema: db.schema,
    host: db.host,
    timezone: 'Europe/Istanbul',
    entities: [
      __dirname + '/../modules/**/*.entity.{js,ts}', // Entityleri alacağı klasör
      __dirname + '/../modules/**/**/*.entity.{js,ts}', // Entityleri alacağı klasör
    ],
    synchronize: true,
  }),
];
