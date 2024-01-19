import path from 'path';
import url from 'url';
import { mergeResolvers } from '@graphql-tools/merge';
import { loadFiles } from '@graphql-tools/load-files';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log({ __filename, __dirname });

const folderPath = path.join(process.cwd(), '/src/graphql/schema');

const loadedResolvers = await loadFiles(`${folderPath}/**/*.resolvers.*`, {
  ignoreIndex: true,
  requireMethod: async (fullPath: string) => {
    const fileNameWithExtension = path.basename(fullPath);

    const { name } = path.parse(fileNameWithExtension);

    const relativePath = path.relative(folderPath, fullPath);
    const folderName = path.dirname(relativePath);

    // console.log({ relativePath, folderName, folderPath, fullPath });

    return await import(`./${folderPath}/${name}`);
  },
});

export default mergeResolvers(loadedResolvers);
