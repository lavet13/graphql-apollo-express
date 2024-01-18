import path from 'path';
import url from 'url';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { loadFiles } from '@graphql-tools/load-files';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log({ __filename, __dirname });

const loadedTypeDefs = await loadFiles(`${__dirname}/**/*.types.*`, {
  ignoreIndex: true,
  requireMethod: async (fullPath: string) => {
    const fileNameWithExtension = path.basename(fullPath);

    const { name } = path.parse(fileNameWithExtension);

    console.log({ fullPath, name });

    return await import(`./types/${name}`);
  },
});

export default mergeTypeDefs(loadedTypeDefs);
