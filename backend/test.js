"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    const c = await prisma.clienteInstitucional.count();
    const recientes = await prisma.clienteInstitucional.count({
        where: { createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } }
    });
    console.log('Total Clientes:', c);
    console.log('Clientes recientes (30 dias):', recientes);
    const data = await prisma.clienteInstitucional.findMany({ take: 5 });
    console.log('Sample clientes:', data.map(d => d.createdAt));
}
main().finally(() => prisma.$disconnect());
//# sourceMappingURL=test.js.map