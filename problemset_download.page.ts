import { api, ctx } from '@hydrooj/ui-default';

type ZipTarget = { filename: string, url?: string, content?: string };

/**
 * Extend ui-default zip exporter:
 * when user downloads problems as a zip, also include editorials under `solution/`.
 *
 * Importer (`ProblemModel.import`) already supports reading files from `solution/` directory.
 */
ctx.on('problemset/download', async (pids: number[], _name: string, targets: ZipTarget[]) => {
  const existing = new Set(targets.map((t) => t.filename));
  for (const pid of pids) {
    try {
      const solutions = await api('export.solutions', { id: +pid }, {
        docId: 1,
        content: 1,
      });
      if (!(solutions instanceof Array)) continue;
      let index = 0;
      for (const s of solutions) {
        index++;
        const sid = (s?.docId || index).toString();
        const filename = `${pid}/solution/${index}-${sid}.md`;
        if (existing.has(filename)) continue;
        targets.push({
          filename,
          content: s?.content || '',
        });
        existing.add(filename);
      }
    } catch (e) {
      // No permission / no solutions / request error: ignore.
    }
  }
});

