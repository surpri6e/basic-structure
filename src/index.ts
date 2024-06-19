import path from 'node:path';
import fsp from 'node:fs/promises';
import prompts, { PromptObject } from 'prompts';
import chalk from 'chalk';
import { fileURLToPath } from 'node:url';

const question: PromptObject<string>[] = [
    {
        type: 'text',
        name: 'folder',
        message: 'Enter a path of project',
    },
    {
        type: 'text',
        name: 'name',
        message: 'Enter a name of your project',
    },
];

interface IAnswer {
    folder: string;
    name: string;
}

async function getAnswers(): Promise<IAnswer> {
    const response = await prompts(question);

    return {
        folder: response.folder,
        name: response.name,
    };
}

const copyFilesAndDirectories = async (from: string, to: string) => {
    const entries = await fsp.readdir(from);

    for (const entry of entries) {
        const sourcePath = path.join(from, entry);
        const destPath = path.join(to, entry);

        const stat = await fsp.lstat(sourcePath);

        if (stat.isDirectory()) {
            await fsp.mkdir(destPath);
            await copyFilesAndDirectories(sourcePath, destPath);
        } else {
            await fsp.copyFile(sourcePath, destPath);
        }
    }
};

const renamePackageJsonName = async (targetDir: string, projectName: string) => {
    const packageJsonPath = path.join(targetDir, 'package.json');

    try {
        const packageJsonData = await fsp.readFile(packageJsonPath, 'utf8');
        const packageJson = JSON.parse(packageJsonData);
        packageJson.name = projectName;
        await fsp.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 4), 'utf8');
    } catch (error: unknown) {
        if (typeof error === 'string') {
            throw new Error(error);
        }
    }
};

(async () => {
    try {
        const { folder, name } = await getAnswers();

        const to = path.join(process.cwd(), folder);
        const from = path.resolve(fileURLToPath(import.meta.url), '..', '..', 'example');

        await fsp.mkdir(to, { recursive: true });
        await copyFilesAndDirectories(from, to);
        await renamePackageJsonName(to, name);

        fsp.rename(path.join(to, '_env'), path.join(to, '.env'));
        fsp.rename(path.join(to, '_gitignore'), path.join(to, '.gitignore'));
        fsp.rename(path.join(to, '_npmignore'), path.join(to, '.npmignore'));

        console.log(chalk.green('Success all'));
        console.log(chalk.green('Enter command - npm install'));
    } catch (error: unknown) {
        if (typeof error === 'string') {
            console.log(error);
        }

        console.log(chalk.red('Something went wrong!'));
    }
})();
