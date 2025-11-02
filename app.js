import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import mentalRouter from "./Routes/MentalHealthRouter.js";
import consultsRouter from "./Routes/ConsultsRouter.js";
import AuthRouter from "./Routes/AuthRouter.js";
import errorHandler from "./Middleware/errorHandler.js";
import { initRealtimeHandler } from "./Validator/realtimeHandler.js";

dotenv.config();

const app = express();
const swaggerDocument = YAML.load("./docs/openapi.yaml");

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get("/", (req, res) => res.json({ message: "HealthPal API", version: "1.0" }));
app.use("/api/v1/mental", mentalRouter);
app.use("/api/v1/consults", consultsRouter);
app.use("/api/v1/auth", AuthRouter);
app.use(errorHandler);

const server = http.createServer(app);
initRealtimeHandler(server);

const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
