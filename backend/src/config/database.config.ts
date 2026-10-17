import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { APP_ENTITIES } from '../database/entities';

export const getDatabaseConfig = (): TypeOrmModuleOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isLocal =
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes('localhost') ||
    process.env.DATABASE_URL.includes('127.0.0.1');
  const enableSsl =
    process.env.DB_SSL === 'true' || (!isLocal && !!process.env.DATABASE_URL);

  const sslConfig = enableSsl ? { rejectUnauthorized: false } : false;

  if (process.env.DATABASE_URL) {
    return {
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: APP_ENTITIES,
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || !isProduction,
      logging:
        process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
      ssl: sslConfig,
    };
  }

  return {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'asistencia_db',
    entities: APP_ENTITIES,
    synchronize: process.env.DB_SYNCHRONIZE === 'true' || !isProduction,
    logging:
      process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};
