import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const savingsRouter = router({
  createGoal: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.savingsGoal.create({
        data: {
          userId: ctx.userId,
          name: input.name,
          targetAmount: input.targetAmount,
          deadline: input.deadline ? new Date(input.deadline) : undefined,
        },
      });
      return goal;
    }),

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
            orderBy: { date: "desc" },
          },
        },
        orderBy: { createdAt: "desc" },
      });
      return goals;
    }),

  addDeposit: protectedProcedure
    .input(
      z.object({
        goalId: z.string().cuid(),
        amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
        note: z.string().optional(),
        date: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.savingsGoal.findFirst({
        where: { id: input.goalId, userId: ctx.userId },
      });

      if (!goal) throw new Error("Savings goal not found");

      const deposit = await ctx.db.savingsDeposit.create({
        data: {
          goalId: input.goalId,
          amount: input.amount,
          note: input.note,
          date: input.date ? new Date(input.date) : new Date(),
        },
      });

      const newCurrentAmount = (
        parseFloat(goal.currentAmount.toString()) + parseFloat(input.amount)
      ).toString();

      const isCompleted =
        parseFloat(newCurrentAmount) >= parseFloat(goal.targetAmount.toString());

      const updatedGoal = await ctx.db.savingsGoal.update({
        where: { id: input.goalId },
        data: { currentAmount: newCurrentAmount, isCompleted },
      });

      return { deposit, goal: updatedGoal };
    }),

  removeDeposit: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const deposit = await ctx.db.savingsDeposit.findUnique({
        where: { id: input },
        include: { goal: true },
      });

      if (!deposit || deposit.goal.userId !== ctx.userId) {
        throw new Error("Deposit not found");
      }

      await ctx.db.savingsDeposit.delete({ where: { id: input } });

      const newCurrentAmount = (
        parseFloat(deposit.goal.currentAmount.toString()) -
        parseFloat(deposit.amount.toString())
      ).toString();

      const isCompleted =
        parseFloat(newCurrentAmount) >= parseFloat(deposit.goal.targetAmount.toString());

      await ctx.db.savingsGoal.update({
        where: { id: deposit.goalId },
        data: { currentAmount: newCurrentAmount, isCompleted },
      });

      return { success: true };
    }),

  deleteGoal: protectedProcedure
    .input(z.string().cuid())
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.savingsGoal.findFirst({
        where: { id: input, userId: ctx.userId },
      });

      if (!goal) throw new Error("Savings goal not found");

      await ctx.db.savingsGoal.delete({ where: { id: input } });
      return { success: true };
    }),

  updateGoal: protectedProcedure
    .input(
      z.object({
        id: z.string().cuid(),
        name: z.string().min(1).max(100).optional(),
        targetAmount: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
        deadline: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await ctx.db.savingsGoal.findFirst({
        where: { id: input.id, userId: ctx.userId },
      });

      if (!goal) throw new Error("Savings goal not found");

      const updated = await ctx.db.savingsGoal.update({
        where: { id: input.id },
        data: {
          ...(input.name && { name: input.name }),
          ...(input.targetAmount && { targetAmount: input.targetAmount }),
          ...(input.deadline && { deadline: new Date(input.deadline) }),
        },
      });

      return updated;
    }),
});