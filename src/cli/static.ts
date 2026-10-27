import path from "node:path"
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs"
import { exec } from 'node:child_process';

interface ReplaceState {
    git: {
        commit: string
    }
}

async function getReplaceState(rootDir: string): Promise<ReplaceState> {
    return new Promise<ReplaceState>((resolve, reject) => {
        const child = exec(`git -C ${rootDir} rev-parse HEAD `, {
            encoding: 'utf8',
            cwd: rootDir
        })


        let output = '';

        child.stdout!.on('data', (data) => {
            output += data;
        });

        child.on('close', (code) => {
            if (code === 0) {
                const commit = output.trim();
                resolve({ git: { commit } })
            } else {
                reject(new Error(`Git command failed with exit code: ${code}`));
            }
        });

        child.on('error', (err) => {
            reject(new Error(`Failed to execute Git: ${err}`));
        });

    });
}


function processContent(content: string, state: ReplaceState): string {
    return content.replaceAll("$COMMIT_HASH", state.git.commit)
}

export interface State {
    rootDir: string
    replaceState: ReplaceState
}

async function moveFiles(state: State, sub_path: string | null): Promise<void> {
    const originDir = sub_path ? path.join(state.rootDir, sub_path) : state.rootDir
    const destFolder = sub_path ? path.join(state.rootDir, "dist", sub_path) : path.join(state.rootDir, "dist")

    const files = (await readdir(originDir))
        .filter((file) => file.endsWith(".html") || file.endsWith(".css"))

    if (!existsSync(destFolder)) {
        await mkdir(destFolder, { recursive: true })
    }

    await Promise.all(files.map(async (file) => {
        const content = await readFile(
            path.join(originDir, file),
            "utf8"
        );

        await writeFile(path.join(destFolder, file), processContent(content, state.replaceState))

    }))

}



async function main(): Promise<void> {

    const rootDir = path.join(__dirname, "..", "..", "..");

    const replaceState = await getReplaceState(rootDir)

    const state: State = { rootDir, replaceState }

    await Promise.all([moveFiles(state, "static"), moveFiles(state, "static/v1"), moveFiles(state, "static/v2")])



}



void main()
