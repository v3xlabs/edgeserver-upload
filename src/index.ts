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
import { getState, setState } from './state';

(async () => {
    const config = await printHeader();

    const state = getState();

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

    const context = getGithubContext('push', state);

    log.empty('Loading blob....');

    await new Promise<void>(acc => setTimeout(acc, 2000));

    await chmod(file_path, '777');

    const file = await blobFrom(file_path);

    log.empty('Blob size: ' + file.size);

    log.empty('Uploading blob....');

    if (state.deployment_id) {
        log.empty('Uploading files for deployment ID: ' + state.deployment_id);
    } else {
        log.empty('Creating new deployment');
    }

    const fresh_state = await createDeployment(config, context, state.deployment_id, file);

    log.empty('Fresh deployment ID: ' + fresh_state.deployment_id);

    log.empty(chalk.greenBright('Successfully Deployed 😊'));

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    setState({
        deployment_id: fresh_state.deployment_id,
        pre_time: state.pre_time,
        push_time: context['push_time'],
        post_time: undefined,
    });

    log.empty('', '');
})();
