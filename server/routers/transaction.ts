import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { assertCategoryBelongsToUser } from "../ownership";

const paymentMethodSchema = z.enum([
  "CASH",
  "DEBIT_CARD",
  "CREDIT_CARD",
  "BANK_TRANSFER",
  "EWALLET",
  "QRIS",
  "OTHER",
]);

const expenseDetailsSchema = z.object({
  merchant: z.string().trim().max(100).optional(),
  paymentMethod: paymentMethodSchema.optional(),
  location: z.string().trim().max(120).optional(),
});

export const transactionRouter = router({
  /**
   * Create a new transaction (income or expense)
   */
  create: protectedProcedure
    .input(
      z.object({
        categoryId: z.string().cuid(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        type: z.enum(["INCOME", "EXPENSE"]),
        note: z.string().optional(),
        date: z.string().optional(),
      }).merge(expenseDetailsSchema)
    )
    .mutation(async ({ ctx, input }) => {
      await assertCategoryBelongsToUser(ctx.db, input.categoryId, ctx.userId, input.type);

      const transaction = await ctx.db.transaction.create({
        data: {
          userId: ctx.userId,
          categoryId: input.categoryId,
          amount: input.amount,
          type: input.type,
          note: input.note,
          merchant: input.merchant,
          paymentMethod: input.paymentMethod,
          location: input.location,
          date: input.date ? new Date(input.date) : new Date(),
        },
        include: {
          category: true,
        },
      });

      return transaction;
    }),

  /**
   * Get all transactions for the logged-in user
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        categoryId: z.string().optional(),
        fromDate: z.date().optional(),
        toDate: z.date().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Build date filter if needed
      const dateFilter = (input.fromDate || input.toDate) ? {
        ...(input.fromDate ? { gte: input.fromDate } : {}),
        ...(input.toDate ? { lte: input.toDate } : {}),
      } : undefined;

      const where = {
        userId: ctx.userId,
        ...(input.type ? { type: input.type } : {}),
        ...(input.categoryId ? { categoryId: input.categoryId } : {}),
        ...(dateFilter ? { date: dateFilter } : {}),
      };

      const [transactions, total] = await Promise.all([
        ctx.db.transaction.findMany({
          where,
          include: {
            category: true,
          },
          orderBy: {
            date: "desc",
          },
          take: input.limit,
          skip: input.offset,
        }),
        ctx.db.transaction.count({ where }),
      ]);

      return {
        transactions,
        total,
        limit: input.limit,
        offset: input.offset,
      };
    }),

  /**
   * Get a single transaction by ID
   */
  getById: protectedProcedure
    .input(z.string().cuid())
    .query(async ({ ctx, input }) => {
      const transaction = await ctx.db.transaction.findFirst({
        where: {
          id: input,
          userId: ctx.userId,
        },
        include: {
          category: true,
        },
      });

      return transaction;
    }),

  /**
   * Update a transaction
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        categoryId: z.string().cuid().optional(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
        note: z.string().optional(),
        date: z.string().optional(),
      }).merge(expenseDetailsSchema.partial())
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingTransaction = await ctx.db.transaction.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      if (input.categoryId) {
        await assertCategoryBelongsToUser(ctx.db, input.categoryId, ctx.userId);
      }

      const transaction = await ctx.db.transaction.update({
        where: { id: input.id },
        data: {
          ...(input.categoryId && { categoryId: input.categoryId }),
          ...(input.amount && { amount: input.amount }),
          ...(input.type && { type: input.type }),
          ...(input.note !== undefined && { note: input.note }),
          ...(input.merchant !== undefined && { merchant: input.merchant }),
          ...(input.paymentMethod !== undefined && { paymentMethod: input.paymentMethod }),
          ...(input.location !== undefined && { location: input.location }),
          ...(input.date && { date: new Date(input.date) }),
        },
        include: {
          category: true,
        },
      });

      return transaction;
    }),

  /**
   * Delete a transaction
   */
  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingTransaction = await ctx.db.transaction.findFirst({
        where: {
          id: input,
          userId: ctx.userId,
        },
      });

      if (!existingTransaction) {
        throw new Error("Transaction not found");
      }

      await ctx.db.transaction.delete({
        where: { id: input },
      });

      return { success: true };
    }),

  /**
   * Get transactions grouped by category for a given month
   */
  getByCategory: protectedProcedure
    .input(
      z.object({
        month: z.number().min(1).max(12),
        year: z.number().min(2000),
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const startDate = new Date(input.year, input.month - 1, 1);
      const endDate = new Date(input.year, input.month, 0, 23, 59, 59);

      const transactions = await ctx.db.transaction.findMany({
        where: {
          userId: ctx.userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
          ...(input.type && { type: input.type }),
        },
        include: {
          category: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      // Group by category
      const grouped = transactions.reduce(
        (acc, transaction) => {
          const categoryName = transaction.category.name;
          if (!acc[categoryName]) {
            acc[categoryName] = {
              category: transaction.category,
              total: "0",
              count: 0,
              transactions: [],
            };
          }
          acc[categoryName].total = (
            parseFloat(acc[categoryName].total) + parseFloat(transaction.amount.toString())
          ).toString();
          acc[categoryName].count += 1;
          acc[categoryName].transactions.push(transaction);
          return acc;
        },
        {} as Record<
          string,
          {
            category: (typeof transactions)[0]["category"];
            total: string;
            count: number;
            transactions: (typeof transactions)[0][];
          }
        >
      );

      return Object.values(grouped);
    }),
});
