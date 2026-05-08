import { router } from "./trpc";
import { transactionRouter } from "./routers/transaction";
import { categoryRouter } from "./routers/category";
import { budgetRouter } from "./routers/budget";
import { savingsRouter } from "./routers/savings";

/**
 * This is the primary router for your app.
 * All routers should be manually added here
 */
export const appRouter = router({
  transaction: transactionRouter,
  category: categoryRouter,
  budget: budgetRouter,
  savings: savingsRouter,
});

export type AppRouter = typeof appRouter;
