const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // create a demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
    },
  });

  // categories (must include `type`; uniqueness is [userId, name])
  const categories = [
    { name: 'Salary', color: '#16A34A', type: 'INCOME' },
    { name: 'Groceries', color: '#2563EB', type: 'EXPENSE' },
    { name: 'Utilities', color: '#EA580C', type: 'EXPENSE' },
    { name: 'Entertainment', color: '#9333EA', type: 'EXPENSE' },
  ];

  const categoryMap = {};

  for (const c of categories) {
    const category = await prisma.category.upsert({
      where: {
        userId_name: {
          userId: user.id,
          name: c.name,
        },
      },
      update: {
        color: c.color,
        type: c.type,
      },
      create: {
        userId: user.id,
        name: c.name,
        color: c.color,
        type: c.type,
      },
    });

    categoryMap[c.name] = category.id;
  }

  // sample transactions
  await prisma.transaction.create({
    data: {
      userId: user.id,
      categoryId: categoryMap.Salary,
      amount: '4500.00',
      type: 'INCOME',
      date: new Date(),
      note: 'Demo salary',
    },
  });

  await prisma.transaction.create({
    data: {
      userId: user.id,
      categoryId: categoryMap.Groceries,
      amount: '150.50',
      type: 'EXPENSE',
      date: new Date(),
      note: 'Groceries',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
