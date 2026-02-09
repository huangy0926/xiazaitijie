import {
  Context, PERM, STATUS, ProblemModel, Query, Schema, SolutionModel,
} from 'hydrooj';

export const name = 'export-solution-download';

const Api = {
  /**
   * Return solutions (editorials) for a problem.
   * This is designed for frontend zip exporter, and reuses the same permission
   * rule as `/p/:pid/solution`.
   */
  'export.solutions': Query(Schema.object({
    domainId: Schema.string().required(),
    id: Schema.union([Schema.number().step(1), Schema.string()]).required(),
  }), async (c, args) => {
    const pdoc = await ProblemModel.get(args.domainId, args.id);
    if (!pdoc) return [];
    if (pdoc.hidden) c.checkPerm(PERM.PERM_VIEW_PROBLEM_HIDDEN);

    const psdoc = await ProblemModel.getStatus(args.domainId, pdoc.docId, c.user._id);
    const accepted = psdoc?.status === STATUS.STATUS_ACCEPTED;
    if (!accepted || !c.user.hasPerm(PERM.PERM_VIEW_PROBLEM_SOLUTION_ACCEPT)) {
      c.checkPerm(PERM.PERM_VIEW_PROBLEM_SOLUTION);
    }

    return await SolutionModel.getMulti(args.domainId, pdoc.docId)
      .project<any>({
        docId: 1,
        owner: 1,
        vote: 1,
        content: 1,
      })
      .toArray();
  }),
} as const;

export function apply(ctx: Context) {
  ctx.inject(['api'], ({ api }) => {
    api.provide(Api);
  });
}

