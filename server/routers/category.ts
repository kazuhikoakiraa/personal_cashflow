import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const categoryRouter = router({
  /**
   * Create a new category
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(50),
        icon: z.string().optional(),
        type: z.enum(["INCOME", "EXPENSE"]),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const category = await ctx.db.category.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          icon: input.icon,
          type: input.type,
          color: input.color || "#000000",
        },
      });

      return category;
    }),

  /**
   * Get all categories for the user
   */
  list: protectedProcedure
    .input(
      z.object({
        type: z.enum(["INCOME", "EXPENSE"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Ensure sensible defaults if user has no categories yet
      const categories = await ctx.db.category.findMany({
        where: {
          userId: ctx.userId,
          ...(input.type && { type: input.type }),
        },
        orderBy: {
          name: "asc",
        },
      });

      if (categories.length === 0) {
        try {
          await ctx.db.category.createMany({
            data: [
              { userId: ctx.userId, name: "Salary", type: "INCOME", icon: "wallet", color: "#10B981" },
              { userId: ctx.userId, name: "Freelance", type: "INCOME", icon: "briefcase", color: "#06B6D4" },
              { userId: ctx.userId, name: "Rent", type: "EXPENSE", icon: "home", color: "#F97316" },
              { userId: ctx.userId, name: "Groceries", type: "EXPENSE", icon: "shopping-cart", color: "#F59E0B" },
              { userId: ctx.userId, name: "Transport", type: "EXPENSE", icon: "car", color: "#8B5CF6" },
              { userId: ctx.userId, name: "Utilities", type: "EXPENSE", icon: "cpu", color: "#EF4444" },
              { userId: ctx.userId, name: "Entertainment", type: "EXPENSE", icon: "music", color: "#EC4899" },
              { userId: ctx.userId, name: "Health", type: "EXPENSE", icon: "heart", color: "#F97316" },
              { userId: ctx.userId, name: "Misc", type: "EXPENSE", icon: "dots-horizontal", color: "#6B7280" },
            ],
            skipDuplicates: true,
          });
        } catch {
          // ignore create failures; fallthrough to return whatever exists
        }

        return ctx.db.category.findMany({
          where: {
            userId: ctx.userId,
            ...(input.type && { type: input.type }),
          },
          orderBy: {
            name: "asc",
          },
        });
      }

      return categories;
    }),

  /**
   * Update a category
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(50).optional(),
        icon: z.string().optional(),
        color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      const category = await ctx.db.category.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.icon !== undefined && { icon: input.icon }),
          ...(input.color && { color: input.color }),
        },
      });

      return category;
    }),

  /**
   * Delete a category
   */
  delete: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const existingCategory = await ctx.db.category.findFirst({
        where: {
          id: input,
          userId: ctx.userId,
        },
      });

      if (!existingCategory) {
        throw new Error("Category not found");
      }

      // Check if category is in use
      const transactionCount = await ctx.db.transaction.count({
        where: { categoryId: input },
      });

      if (transactionCount > 0) {
        throw new Error(
          "Cannot delete category with existing transactions"
        );
      }

      await ctx.db.category.delete({
        where: { id: input },
      });

      return { success: true };
    }),
});
