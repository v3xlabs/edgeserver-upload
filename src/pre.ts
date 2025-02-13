import * as core from '@actions/core';
import * as github from '@actions/github';
import { createLogger } from '@lvksh/logger';
import archiver from 'archiver';
import chalk from 'chalk';
import { createWriteStream } from 'node:fs';
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
    log['✨']('Shooting flares');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const context = {
        contextType: 'github-action',
        data: {
            event: github.context.eventName,
            sha: github.context.sha,
            workflow: github.context.workflow,
            workflow_status: 'pre',
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

    const uploadRequest = await fetch(
        config.server + '/site/' + config.site_id + '/deployment',
        {
            method: 'POST',
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

    const response = await uploadRequest.text();

    log.empty(chalk.greenBright('Successfully notified the crew 😊'));
    log.empty(response);

    const deployment_id = JSON.parse(response).deployment_id;

    log.empty(deployment_id);

    // save deployment_id file to ~/.edgeserver/deployment_id
    const deployment_id_file = createWriteStream(resolve('~/.edgeserver/deployment_id'));
    deployment_id_file.write(deployment_id);
    deployment_id_file.end();

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
