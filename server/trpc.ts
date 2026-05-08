import { TRPCError, initTRPC } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "./db";
import { createClient } from "~/lib/supabase/server";

/**
 * Context for tRPC
 */
export async function createTRPCContext(
  opts: FetchCreateContextFnOptions & { userId?: string }
): Promise<{
  userId?: string;
  db: typeof db;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return {
    userId: opts.userId ?? user?.id,
    db,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

/**
 * Initialization of tRPC backend with context type
 */
const t = initTRPC.context<Context>().create();

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Create a server-side caller for the tRPC API
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * Protected (authenticated) procedures
 */
export const protectedProcedure = t.procedure.use(async (opts) => {
  const userId = opts.ctx.userId;

  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return opts.next({
    ctx: {
      ...opts.ctx,
      userId,
    },
  });
});
