import path from 'node:path';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import prompts, { PromptObject } from 'prompts';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

console.log(process.cwd());

const question: PromptObject<string> = {
    type: 'text',
    name: 'folder',
    message: 'Укажите путь до развертывания',
};

async function getDestanationFolder() {
    const response = await prompts(question);
    return response.folder;
}

const basicFilesNames = ['tsconfig.json', 'README.md', 'LICENSE', '.prettierrc', '.npmignore', '.gitignore', '.env', 'package.json'];

// async function copyBasicFiles(destanationFolder: string) {
//     try {
//         if (destanationFolder !== '.') {
//             await fsp.mkdir(path.resolve(destanationFolder));
//         }

//         await fsp.mkdir(path.resolve(destanationFolder, 'src'));

//         await fsp.copyFile(path.resolve('example', 'src', 'index.ts'), path.resolve(destanationFolder, 'src', 'index.ts'));

//         basicFilesNames.forEach(async (name) => {
//             await fsp.copyFile(path.resolve('example', name), path.resolve(destanationFolder, name));
//         });
//     } catch (error) {
//         console.log(error);
//     }
// }

const copyFilesAndDirectories = async (source: string, destination: string) => {
    const entries = await fsp.readdir(source);

    for (const entry of entries) {
        const sourcePath = path.join(source, entry);
        const destPath = path.join(destination, entry);

        const stat = await fsp.lstat(sourcePath);

        if (stat.isDirectory()) {
            // Create the directory in the destination
            await fsp.mkdir(destPath);

            // Recursively copy files and subdirectories
            await copyFilesAndDirectories(sourcePath, destPath);
        } else {
            // Copy the file
            await fsp.copyFile(sourcePath, destPath);
        }
    }
};

(async () => {
    const destanationFolder = await getDestanationFolder();
    const targetDir = path.join(process.cwd(), destanationFolder);
    const sourceDir = path.resolve(fileURLToPath(import.meta.url), '../../example');
    // await copyBasicFiles(destanationFolder);
    fs.mkdirSync(targetDir, { recursive: true });
    await copyFilesAndDirectories(sourceDir, targetDir);

    fs.renameSync(path.join(targetDir, '_env'), path.join(targetDir, '.env'));
    fs.renameSync(path.join(targetDir, '_gitignore'), path.join(targetDir, '.gitignore'));
    fs.renameSync(path.join(targetDir, '_npmignore'), path.join(targetDir, '.npmignore'));

    console.log(chalk.red('Все успешно развернуто!'));
    console.log(chalk.red('Введите команду npm install'));
})();
