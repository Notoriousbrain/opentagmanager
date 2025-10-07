import { router, protectedProcedure } from "../trpc";

export const meRouter = router({
  me: protectedProcedure.query(({ ctx }) => {
    const { id, email, name, image } = ctx.session.user;
    return { id, email, name, image };
  }),
});
