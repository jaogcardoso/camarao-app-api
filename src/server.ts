import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { userRoutes } from "./routes/userRouter.js";
import viveiroRoutes from "./routes/viveiroRoutes.js";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API do Sistema de Carcinicultura no ar! 🦐");
});

// rotas de usuário
app.use(userRoutes);

// rotas de viveiro
app.use("/viveiros", viveiroRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});