import os from 'node:os';
import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { chmod, stat } from 'node:fs/promises';
import path, { resolve } from 'node:path';
import { blobFrom } from 'node-fetch';
import prettyBytes from 'pretty-bytes';

import { logTreeData, treeFolderData } from './treeFolder';

import { log, version, validateConfiguration, randomQuote, ZIPLOCATION, printHeader } from './config';
import { getGithubContext } from './github';
import { createDeployment } from './deploy';

(async () => {
    const config = await printHeader();

    log.empty('');
    log['📁']('Compressing Application');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const sizeData = await treeFolderData(resolve('./', config.directory));

    log.empty('Files Overview:');
    logTreeData(sizeData, console.log);

    log.empty('');

    const writeStrem = createWriteStream(resolve('./', ZIPLOCATION));
    const zippo = archiver('zip');

    zippo.on('progress', (data) => {
        const percentage = Math.ceil(
            (data.fs.processedBytes / sizeData.size) * 100
        );

        log.empty('Compressing ' + (percentage > 100 ? 100 : percentage) + '%');
    });

    zippo.pipe(writeStrem);
    zippo.directory(resolve('./', config.directory), false);

    await zippo.finalize();

    const file_path = resolve('./', ZIPLOCATION);
    const compressedData = await stat(file_path);

    log.empty('');

    log.empty(
        'Compressed to ' + chalk.yellowBright(prettyBytes(compressedData.size))
    );

    log.empty('');
    log['🚀']('Deploying');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const context = getGithubContext('push');

    // const formData = new FormData();

    // if (config.context) formData.set('context', JSON.stringify(context));

    log.empty('Loading blob....');

    await new Promise<void>(acc => setTimeout(acc, 2000));

    await chmod(file_path, '777');

    const file = await blobFrom(file_path);

    log.empty('Blob size: ' + file.size);

    log.empty('Uploading blob....');

    // check if ~/.edgeserver/deployment_id exists

    let deployment_id: string | undefined;

    const homeDir = os.homedir();
    const filepath = path.join(homeDir, '.edgeserver', 'deployment_id');
    if (existsSync(filepath)) {
        const fs_deployment_id = readFileSync(filepath, 'utf8');
        deployment_id = fs_deployment_id;

        log.empty('Uploading files for deployment ID: ' + fs_deployment_id);
    } else {
        log.empty('Creating new deployment');
    }

    const fresh_deployment_id = await createDeployment(config, context, deployment_id, file);

    log.empty('Fresh deployment ID: ' + fresh_deployment_id);

    log.empty(chalk.greenBright('Successfully Deployed 😊'));

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
