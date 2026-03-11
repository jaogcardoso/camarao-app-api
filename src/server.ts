import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma.js";
import { userRoutes } from "./routes/user/userRouter.js";

const app = express();
const PORT = process.env.PORT || 3333;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API do Sistema de Carcinicultura no ar! 🦐");
});

app.use(userRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});