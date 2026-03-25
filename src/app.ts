import express from "express";
import cors from 'cors';
import { contextMiddleware } from "./middlewares/contextMiddleware.js";
import { userRoutes } from "./routes/userRouter.js";
import viveiroRoutes from "./routes/viveiroRoutes.js";
import { cicloRoutes } from "./routes/cicloRouter.js";
import { produtoRoutes } from "./routes/produtoRouter.js";
import { fornecedorRoutes } from "./routes/fornecedorRouter.js";
import { loteRoutes } from "./routes/loteRouter.js";
import { consumoRoutes } from "./routes/consumoRouter.js";
import desbasteRoutes from "./routes/desbasteRouter.js";
import { estoqueRoutes } from "./routes/estoqueRouter.js";


const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}))


app.use(express.json());
app.use(contextMiddleware); 

app.use(userRoutes);
app.use("/viveiros", viveiroRoutes);
app.use("/ciclos", cicloRoutes);
app.use("/produtos", produtoRoutes);
app.use("/fornecedores", fornecedorRoutes);
app.use("/lotes", loteRoutes);
app.use("/estoque", consumoRoutes);
app.use("/desbastes", desbasteRoutes);
app.use("/estoque", estoqueRoutes);

export { app };