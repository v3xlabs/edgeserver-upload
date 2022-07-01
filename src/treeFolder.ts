import { GenericLogFunction } from "@lvksh/logger";
import chalk from "chalk";
import {} from "node:fs";
import { readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import prettyBytes from "pretty-bytes";

type FileData = {
    name: string;
    type: "file";
    size: number;
};

type FolderData = {
    name: string;
    type: "folder";
    size: number;
    files: (FileData | FolderData)[];
};

type RootData = Omit<FolderData, "name">;

type TreeData = FolderData | RootData;

export const treeFolderData = async (
    folder_path: string,
): Promise<RootData> => {
    const filesAndDirs = await readdir(folder_path, { withFileTypes: true });
    filesAndDirs.sort((a, b) =>
        a.isDirectory() ? -1 : b.isDirectory() ? 1 : 0,
    );

    const result = [];
    let totalSize = 0;
    for (let fileOrDir of filesAndDirs) {
        const path = resolve(folder_path, fileOrDir.name);
        if (fileOrDir.isFile()) {
            const size = await stat(path);
            result.push({
                name: fileOrDir.name,
                type: "file",
                size: size.size,
            });
            totalSize += size.size;
            continue;
        }
        if (fileOrDir.isDirectory()) {
            const data = await treeFolderData(path);
            result.push({ name: fileOrDir.name, type: "folder", ...data });
            totalSize += data.size;
        }
    }
    return {
        type: "folder",
        size: totalSize,
        files: result,
    };
};

export const logTreeData = (
    treeData: TreeData,
    log: GenericLogFunction,
    indents: number = 0,
) => {
    if (indents != 0 && treeData["name"])
        log(`\t${"\t".repeat(indents == 0 ? 0 : indents - 1)}${chalk.cyanBright('/' + treeData["name"])}`);

    for (let fileOrFolder of treeData.files) {
        if (fileOrFolder.type === "folder") {
            logTreeData(fileOrFolder, log, indents + 1);
            continue;
        }
        if (fileOrFolder.type === "file") {
            log(
                `\t${"\t".repeat(indents)}${
                    chalk.gray(fileOrFolder.name)
                } ${chalk.gray("-")} ${chalk.yellowBright(
                    prettyBytes(fileOrFolder.size),
                )}`,
            );
        }
    }
};
