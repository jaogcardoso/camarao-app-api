import express from "express";
import { contextMiddleware } from "./middlewares/contextMiddleware.js";
import { userRoutes } from "./routes/userRouter.js";
import viveiroRoutes from "./routes/viveiroRoutes.js";
import { cicloRoutes } from "./routes/cicloRouter.js";

const app = express();

app.use(contextMiddleware); 

app.use(express.json());

app.use(userRoutes);
app.use("/viveiros", viveiroRoutes);
app.use("/ciclos", cicloRoutes);

export { app };