const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('las0000f', 10);
  const updatedUser = await prisma.user.update({
    where: { email: 'jjssjj7788@gmail.com' },
    data: { password: hash }
  });
  console.log('Password reset successfully for:', updatedUser.email);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
