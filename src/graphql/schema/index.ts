// import fs from 'fs';
import path from 'path';
import url from 'url';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { loadFiles } from '@graphql-tools/load-files';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// console.log({ __filename, __dirname });

const folderPath = path.join(process.cwd(), '/src/graphql/schema');
// const folderContents = fs.readdirSync(__dirname);
// const folders = folderContents.filter(item => {
//   console.log({ __dirname, item, path: path.join(__dirname, item) });
//   console.log({
//     isDirectory: fs.statSync(path.join(__dirname, item)).isDirectory(),
//   });
//   return fs.statSync(path.join(__dirname, item)).isDirectory();
// });

const loadedTypeDefs = await loadFiles(`${folderPath}/**/*.types.*`, {
  ignoreIndex: true,
  requireMethod: async (fullPath: string) => {
    const fileNameWithExtension = path.basename(fullPath);

    const { name } = path.parse(fileNameWithExtension);

    const relativePath = path.relative(folderPath, fullPath);
    const folderName = path.dirname(relativePath);

    console.log({ relativePath, folderName, folderPath, fullPath });

    return await import(`./${folderName}/${name}`);
  },
});

export default mergeTypeDefs(loadedTypeDefs);
