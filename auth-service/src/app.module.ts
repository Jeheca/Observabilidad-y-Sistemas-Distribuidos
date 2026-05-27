import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from '././observability/metrics.module';
import { User } from './auth/entities/user.entity';

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variable de entorno requerida: ${name}`);
  return value;
}

@Module({
  imports: [
    // Logs estructurados en JSON (Pino).
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL ?? 'info',
        // Campo presente en todas las líneas de log; útil para filtrar en Loki.
        base: { service: 'auth-service' },
        // Prometheus scrapea /metrics constantemente: no se registra cada scrape.
        autoLogging: { ignore: (req) => req.url === '/metrics' }
      }
    }),
    MetricsModule,
    AuthModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: env('DB_HOST'),
      port: parseInt(env('DB_PORT')),
      username: env('DB_USER'),
      password: env('DB_PASSWORD'),
      database: env('DB_NAME'),
      entities: [User],
      synchronize: true
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
