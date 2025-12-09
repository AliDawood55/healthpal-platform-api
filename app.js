import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";

import mentalRouter from "./Routes/MentalHealthRouter.js";
import AuthRouter from "./Routes/AuthRouter.js";
import errorHandler from "./Middleware/errorHandler.js";
import MissionRouter from "./Routes/MissionRouter.js";
import AlertsRouter from "./Routes/AlertsRouter.js";
import ConsultRouter from "./Routes/ConsultRouter.js";
import GuidesRouter from "./Routes/GuidesRouter.js";
import SponsorshipRouter from "./Routes/SponsorshipRouter.js";
import UsersRouter from "./Routes/UsersRouter.js";
import medicationRouter from "./Routes/medication.routes.js";
import equipmentRouter from "./Routes/equipment.js";
import openfdaRouter from "./Routes/openfdaRouter.js";

dotenv.config();

const app = express();

// Load Swagger file
const swaggerDocument = YAML.load("./docs/openapi.yaml");

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Swagger Docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Basic home route
app.get("/", (req, res) => {
  res.json({ message: "HealthPal API", version: "1.0" });
});

// Routers
app.use("/api/v1/mental", mentalRouter);
app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/mission", MissionRouter);
app.use("/api/v1/alerts", AlertsRouter);
app.use("/api/v1/consult", ConsultRouter);
app.use("/api/v1/guides", GuidesRouter);
app.use("/api/v1/sponsorship", SponsorshipRouter);
app.use("/api/v1/users", UsersRouter);
app.use("/api/v1/medication", medicationRouter);
app.use("/api/v1/equipment", equipmentRouter);
app.use("/api/v1/medication/openfda", openfdaRouter);

// Global error handler
app.use(errorHandler);

// Server
const server = http.createServer(app);

const port = process.env.PORT || 3001;
if (process.env.NODE_ENV !== "test") {
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

export default app;
