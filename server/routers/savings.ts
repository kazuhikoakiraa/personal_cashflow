import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const savingsRouter = router({
  /**
   * Create a new savings goal
   */
  createGoal: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.savingsGoal.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          targetAmount: input.targetAmount,
          deadline: input.deadline,
        },
      });

      return goal;
    }),

  /**
   * Get all savings goals for the user
   */
  listGoals: protectedProcedure
    .input(
      z.object({
        includeCompleted: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const goals = await ctx.db.savingsGoal.findMany({
        where: {
          userId: ctx.userId,
          ...(input.includeCompleted ? {} : { isCompleted: false }),
        },
        include: {
          deposits: {
            orderBy: {
              date: "desc",
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return goals;
    }),

  /**
   * Add a deposit to a savings goal
   */
  addDeposit: protectedProcedure
    .input(
      z.object({
        goalId: z.string().cuid(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        note: z.string().optional(),
        date: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify goal ownership
      const goal = await ctx.db.savingsGoal.findFirst({
        where: {
          id: input.goalId,
          userId: ctx.userId,
        },
      });

      if (!goal) {
        throw new Error("Savings goal not found");
      }

      // Add deposit
      const deposit = await ctx.db.savingsDeposit.create({
        data: {
          goalId: input.goalId,
          amount: input.amount,
          note: input.note,
          date: input.date || new Date(),
        },
      });

      // Update goal current amount
      const newCurrentAmount = (
        parseFloat(goal.currentAmount.toString()) + parseFloat(input.amount)
      ).toString();

      const isCompleted =
        parseFloat(newCurrentAmount) >= parseFloat(goal.targetAmount.toString());

      const updatedGoal = await ctx.db.savingsGoal.update({
        where: { id: input.goalId },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted,
        },
      });

      return { deposit, goal: updatedGoal };
    }),

  /**
   * Remove a deposit from a savings goal
   */
  removeDeposit: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Get deposit and verify ownership through goal
      const deposit = await ctx.db.savingsDeposit.findUnique({
        where: { id: input },
        include: {
          goal: true,
        },
      });

      if (!deposit || deposit.goal.userId !== ctx.userId) {
        throw new Error("Deposit not found");
      }

      await ctx.db.savingsDeposit.delete({
        where: { id: input },
      });

      // Update goal current amount
      const newCurrentAmount = (
        parseFloat(deposit.goal.currentAmount.toString()) -
        parseFloat(deposit.amount.toString())
      ).toString();

      const isCompleted =
        parseFloat(newCurrentAmount) >=
        parseFloat(deposit.goal.targetAmount.toString());

      await ctx.db.savingsGoal.update({
        where: { id: deposit.goalId },
        data: {
          currentAmount: newCurrentAmount,
          isCompleted,
        },
      });

      return { success: true };
    }),

  /**
   * Delete a savings goal
   */
  deleteGoal: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const goal = await ctx.db.savingsGoal.findFirst({
        where: {
          id: input,
          userId: ctx.userId,
        },
      });

      if (!goal) {
        throw new Error("Savings goal not found");
      }

      await ctx.db.savingsGoal.delete({
        where: { id: input },
      });

      return { success: true };
    }),

  /**
   * Update savings goal
   */
  updateGoal: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
        targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        deadline: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership
      const goal = await ctx.db.savingsGoal.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      if (!goal) {
        throw new Error("Savings goal not found");
      }

      const updated = await ctx.db.savingsGoal.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.targetAmount && { targetAmount: input.targetAmount }),
          ...(input.deadline && { deadline: input.deadline }),
        },
      });

      return updated;
    }),
});
