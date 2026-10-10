import { PrismaClient } from "./src/generated/prisma/client.js";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { studentProfile: true },
  });
  console.log("=== USERS IN DB ===");
  console.log(JSON.stringify(users, null, 2));

  const students = await prisma.student.findMany();
  console.log("=== STUDENTS IN DB ===");
  console.log(JSON.stringify(students, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
