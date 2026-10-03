import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { AppModule } from "./app.module";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { logger: ["log", "warn", "error"] });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  const origins = process.env.CORS_ORIGIN?.split(",").map(v => v.trim()).filter(Boolean);
  app.enableCors({ origin: origins?.length ? origins : true });

  const port = Number(process.env.PORT ?? 4100);
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
