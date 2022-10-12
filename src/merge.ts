import { MergeController } from './MergeController';

(async function () {
  const m = new MergeController([
    'a-folder'
  ], { 
    basePath: '../json/',
    filterKeys: [],
  });
  await m.run();
})();
