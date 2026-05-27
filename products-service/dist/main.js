"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const nestjs_pino_1 = require("nestjs-pino");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const port = process.env.PORT;
    if (!port)
        throw new Error('Variable de entorno requerida: PORT');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true });
    app.useLogger(app.get(nestjs_pino_1.Logger));
    app.enableCors();
    await app.listen(parseInt(port));
}
bootstrap().catch((err) => {
    console.log(err);
});
//# sourceMappingURL=main.js.map