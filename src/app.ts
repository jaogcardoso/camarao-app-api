import express from "express";
import { userRoutes } from "./routes/userRouter.js";
import viveiroRoutes from "./routes/viveiroRoutes.js";

const app = express();

app.use(express.json());

app.use(userRoutes);
app.use("/viveiros", viveiroRoutes);

export { app };