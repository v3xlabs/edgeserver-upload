import { createWriteStream } from "node:fs";
import { chmod, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { styleText } from "node:util";

import { type ProgressData, ZipArchive } from "archiver";
import prettyBytes from "pretty-bytes";

import { log, printHeader, ZIPLOCATION } from "./config";
import { createDeployment } from "./deploy";
import { getGithubContext } from "./github";
import { getState, setState } from "./state";

type DirectoryStats = {
  fileCount: number;
  sizeBytes: number;
};

const getDirectoryStats = async (directoryPath: string): Promise<DirectoryStats> => {
  const entries = await readdir(directoryPath, { withFileTypes: true });
  let fileCount = 0;
  let sizeBytes = 0;

  for (const entry of entries) {
    const entryPath = path.resolve(directoryPath, entry.name);

    if (entry.isFile()) {
      const entryStats = await stat(entryPath);

      fileCount += 1;
      sizeBytes += entryStats.size;
      continue;
    }

    if (entry.isDirectory()) {
      const directoryStats = await getDirectoryStats(entryPath);

      fileCount += directoryStats.fileCount;
      sizeBytes += directoryStats.sizeBytes;
    }
  }

  return { fileCount, sizeBytes };
};

void (async () => {
  const config = await printHeader();
  const state = getState();

  log.empty("");
  log["📁"]("Compressing application");

  const directoryStats = await getDirectoryStats(path.resolve("./", config.directory));

  log.empty(
    `Preparing ${directoryStats.fileCount} files (${prettyBytes(directoryStats.sizeBytes)})`,
  );

  const filePath = path.resolve("./", ZIPLOCATION);
  const writeStream = createWriteStream(filePath);
  const archive = new ZipArchive();
  let lastProgressPercentage = -10;

  archive.on("progress", (data: ProgressData) => {
    if (directoryStats.sizeBytes === 0) return;

    const progressPercentage = Math.min(
      100,
      Math.floor((data.fs.processedBytes / directoryStats.sizeBytes) * 100),
    );
    const milestonePercentage = progressPercentage - (progressPercentage % 10);

    if (milestonePercentage > lastProgressPercentage) {
      lastProgressPercentage = milestonePercentage;
      log.empty(`Compressing: ${milestonePercentage}%`);
    }
  });

  archive.pipe(writeStream);
  archive.directory(path.resolve("./", config.directory), false);
  await archive.finalize();

  const compressedData = await stat(filePath);

  log.empty(`Archive ready: ${styleText("yellowBright", prettyBytes(compressedData.size))}`);

  log.empty("");
  log["🚀"]("Deploying");

  const context = getGithubContext("push", state);

  await new Promise<void>(resolveDelay => setTimeout(resolveDelay, 2000));
  await chmod(filePath, "777");

  const buffer = await readFile(filePath);
  const file = new Blob([buffer], { type: "application/zip" });

  log.empty(`Uploading archive: ${prettyBytes(file.size)}`);
  log.empty(
    state.deployment_id
      ? `Updating deployment: ${state.deployment_id}`
      : "Creating deployment",
  );

  const freshState = await createDeployment(
    config,
    context,
    state.deployment_id,
    file,
  );

  log.empty(styleText("greenBright", "Successfully deployed 😊"));

  setState({
    deployment_id: freshState.deployment_id,
    pre_time: state.pre_time,
    push_time: context.data.push_time,
    post_time: context.data.post_time,
  });
})();
