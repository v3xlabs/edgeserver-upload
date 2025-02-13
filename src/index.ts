import * as core from '@actions/core';
import * as github from '@actions/github';
import { createLogger } from '@lvksh/logger';
import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { chmod, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import fetch, { blobFrom, FormData } from 'node-fetch';
import prettyBytes from 'pretty-bytes';
import * as yup from 'yup';

import { logTreeData, treeFolderData } from './treeFolder';

import { log, version, validateConfiguration, randomQuote, ZIPLOCATION, printHeader } from './config';

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

    const context = {
        contextType: 'github-action',
        data: {
            event: github.context.eventName,
            sha: github.context.sha,
            workflow: github.context.workflow,
            workflow_status: 'run',
            runNumber: github.context.runNumber,
            runId: github.context.runId,
            server_url: github.context.serverUrl,
            ref: github.context.ref,
            actor: github.context.actor,
            sender: github.context.actor,
            commit:
                github.context.payload['head_commit'] ||
                    github.context.payload['commits']
                    ? github.context.payload['commits'].at(0)
                    : undefined,
        },
    };

    const formData = new FormData();

    if (config.context) formData.set('context', JSON.stringify(context));

    log.empty('Loading blob....');

    await new Promise<void>(acc => setTimeout(acc, 2000));

    await chmod(file_path, '777');

    const file = await blobFrom(file_path);

    log.empty('Blob size: ' + file.size);

    formData.set('data', file);

    log.empty('Uploading blob....');

    let target_url = config.server + '/site/' + config.site_id + '/deployment';
    let target_method = 'POST';

    // check if ~/.edgeserver/deployment_id exists
    const deployment_id_file = resolve('~/.edgeserver/deployment_id');
    if (existsSync(deployment_id_file)) {
        const deployment_id = readFileSync(deployment_id_file, 'utf8');

        log.empty('Uploading files for deployment ID: ' + deployment_id);
        target_url = config.server + '/site/' + config.site_id + '/deployment/' + deployment_id + '/files';
        target_method = 'PATCH';
    } else {
        log.empty('Creating new deployment');
    }

    const uploadRequest = await fetch(
        target_url,
        {
            method: target_method,
            headers: {
                Authorization: 'Bearer ' + config.token,
            },
            body: formData,
        }
    );

    const { status } = uploadRequest;

    if (status != 200) {
        if (status == 403) {
            log.empty(
                chalk.redBright(
                    // eslint-disable-next-line quotes
                    "Unauthorized.... Check your auth token's validity."
                )
            );
        } else {
            log.empty(
                chalk.yellowBright('Unknown error with status code ' + status)
            );
        }

        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);

        return;
    }

    await uploadRequest.text();

    log.empty(chalk.greenBright('Successfully Deployed 😊'));

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
