import { MergeController } from './MergeController';

(async function () {
  const m = new MergeController('../json/__2010', true);
  m.run();
})();
