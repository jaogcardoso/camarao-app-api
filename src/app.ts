import express from "express";
import { contextMiddleware } from "./middlewares/contextMiddleware.js";
import { userRoutes } from "./routes/userRouter.js";
import viveiroRoutes from "./routes/viveiroRoutes.js";
import { cicloRoutes } from "./routes/cicloRouter.js";
import { produtoRoutes } from "./routes/produtoRouter.js";
import { fornecedorRoutes } from "./routes/fornecedorRouter.js";

const app = express();


app.use(express.json());
app.use(contextMiddleware); 

app.use(userRoutes);
app.use("/viveiros", viveiroRoutes);
app.use("/ciclos", cicloRoutes);
app.use("/produtos", produtoRoutes);
app.use("/fornecedores", fornecedorRoutes);

export { app };