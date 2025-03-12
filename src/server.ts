import { PrismaClient } from '@prisma/client';
import Fastify from "fastify";
import cors from '@fastify/cors';

const prisma = new PrismaClient();
const server = Fastify({ logger: true });

await server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'DELETE'],
});

server.get("/", async (_request, reply) => {
  const addresses = await prisma.address.findMany();
  reply.send({ addresses });
});

server.post("/", async (request, reply) => {
  const { address, country, zip } = request.body as { address: string; country?: string; zip?: string };

  if (!address) {
    reply.status(400).send({ error: "Address field is required" });
    return;
  }

  try {
    const newAddress = await prisma.address.create({
      data: { address, country, zip },
    });
    reply.send(newAddress);
  } catch (error) {
    console.error(error);
    reply.status(500).send({ error: "Failed to add address" });
  }
});

server.delete("/:id", async (request, reply) => {
  const { id } = request.params as { id: string };

  try {
    await prisma.address.delete({
      where: { id: Number(id) },
    });
    reply.send({ message: "Address deleted successfully" });
  } catch (error) {
    reply.status(500).send({ error: "Failed to delete address" });
  }
});

const main = async () => {
  try {
    await server.listen({ port: 4001 });
    console.log("🚀 Server is running on http://localhost:4001");
  } catch (err) {
    console.error(err);
    await prisma.$disconnect();
  }
};

main();