import { createTRPCRouter, protectedProcedure } from "../trpc";

export const meRouter = createTRPCRouter({
  me: protectedProcedure.query(({ ctx }) => {
    const { id, email, name, image } = ctx.session.user;
    return { id, email, name, image };
  }),
});
