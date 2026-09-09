import "reflect-metadata";
// Precisa ser o primeiro import de fato executado: @aritech/database instancia
// o PrismaClient no top-level do módulo, então DATABASE_URL precisa estar em
// process.env ANTES de "./app.module" (e suas dependências) serem carregados.
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { DomainExceptionFilter } from "./common/filters/domain-exception.filter";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: config.get<string>("WEB_ORIGIN", "http://localhost:3000"),
    credentials: true,
  });

  app.setGlobalPrefix("api/v1");
  app.useGlobalFilters(new DomainExceptionFilter());

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Aritech Digital — API Financeira")
    .setDescription("Núcleo financeiro da Plataforma Aritech (MVP) — ver docs/ no repositório.")
    .setVersion("0.1.0")
    .addCookieAuth("access_token")
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  const port = config.get<number>("API_PORT", 3001);
  await app.listen(port);
  console.log(`Aritech API rodando em http://localhost:${port}/api/v1 (docs em /api/docs)`);
}

bootstrap();
