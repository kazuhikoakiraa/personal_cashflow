import { type PrismaClient } from "@prisma/client";

export async function assertCategoryBelongsToUser(
  db: PrismaClient,
  categoryId: string,
  userId: string,
  expectedType?: "INCOME" | "EXPENSE"
) {
  const category = await db.category.findFirst({
    where: {
      id: categoryId,
      userId,
      ...(expectedType ? { type: expectedType } : {}),
    },
    select: {
      id: true,
      type: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
}