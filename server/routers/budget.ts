import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { assertCategoryBelongsToUser } from "../ownership";

export const budgetRouter = router({
  /**
   * Create or update a budget for a category and month
   */
  upsert: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().cuid(),
        limitAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await assertCategoryBelongsToUser(ctx.db, input.categoryId, ctx.userId, "EXPENSE");

      const budget = await ctx.db.budget.upsert({
        where: {
          userId_categoryId_month_year: {
            userId: ctx.userId,
            categoryId: input.categoryId,
            month: input.month,
            year: input.year,
          },
        },
        update: {
          limitAmount: input.limitAmount,
        },
        create: {
          userId: ctx.userId,
          categoryId: input.categoryId,
          limitAmount: input.limitAmount,
          month: input.month,
          year: input.year,
        },
        include: {
          category: true,
        },
      });

      return budget;
    }),

  /**
   * Get budgets for a specific month and year
   */
  getByMonth: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
      })
    )
    .query(async ({ ctx, input }) => {
      const budgets = await ctx.db.budget.findMany({
        where: {
          userId: ctx.userId,
          month: input.month,
          year: input.year,
        },
        include: {
          category: true,
        },
      });

      // Calculate spent amount for each budget
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      const budgetsWithSpent = await Promise.all(
        budgets.map(async (budget) => {
          const transactions = await ctx.db.transaction.aggregate({
            where: {
              userId: ctx.userId,
              categoryId: budget.categoryId,
              type: "EXPENSE",
              date: {
                gte: startDate,
                lte: endDate,
              },
            },
            _sum: {
              amount: true,
            },
          });

          const spent = transactions._sum.amount || 0;
          const limit = parseFloat(budget.limitAmount.toString());
          const percentage =
            limit > 0 ? (parseFloat(spent.toString()) / limit) * 100 : 0;

          return {
            ...budget,
            spent: spent.toString(),
            percentage: Math.min(percentage, 100),
            isOverBudget: parseFloat(spent.toString()) > limit,
          };
        })
      );

      return budgetsWithSpent;
    }),

  /**
   * Delete a budget
   */
  delete: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().cuid(),
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.budget.delete({
        where: {
          userId_categoryId_month_year: {
            userId: ctx.userId,
            categoryId: input.categoryId,
            month: input.month,
            year: input.year,
          },
        },
      });

      return { success: true };
    }),
});
