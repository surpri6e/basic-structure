import path from 'path';
import fsp from 'fs/promises';
import prompts, { PromptObject } from 'prompts';
import chalk from 'chalk';

const question: PromptObject<string> = {
    type: 'text',
    name: 'folder',
    message: 'Укажите путь до развертывания',
};

async function getDestanationFolder() {
    const response = await prompts(question);
    return response.folder;
}

const destanationFolder = await getDestanationFolder();

const basicFilesNames = ['tsconfig.json', 'README.md', 'LICENSE', '.prettierrc', '.npmignore', '.gitignore', '.env', 'package.json'];

async function copyBasicFiles() {
    try {
        await fsp.mkdir(path.join(destanationFolder));
        await fsp.mkdir(path.join(destanationFolder, 'src'));

        await fsp.copyFile(path.join('example', 'src', 'index.ts'), path.join(destanationFolder, 'src', 'index.ts'));

        basicFilesNames.forEach(async (name) => {
            await fsp.copyFile(path.join('example', name), path.join(destanationFolder, name));
        });
    } catch (error) {
        console.log(error);
    }
}

copyBasicFiles();

console.log(chalk.red('Все успешно развернуто!'));
console.log(chalk.red('Введите команду npm install'));
