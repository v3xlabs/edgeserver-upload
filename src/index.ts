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

chalk.level = 1;
process.env.FORCE_COLOR = '1';

const QUOTES = [
    'Well hello there',
    'Good morning me lad!',
    'Lets goooooo!!',
    'Hope you are doing okay 😇',
    'See you on the other side 🎉',
];

const ZIPLOCATION = 'edgeserver_dist.zip';

const randomQuote = () => QUOTES.at(Math.floor(Math.random() * QUOTES.length));

const validateConfiguration = yup
    .object({
        server: yup
            .string()
            .required('Please specify a server')
            .url('Not a URL'),
        site_id: yup
            .string()
            .min(
                1,
                'Please specify a site_id, you find this on your apps page.'
            )
            .matches(
                /^s_[a-z0-9]+$/,
                'Invalid site_id, try adding quotes around it.'
            ),
        token: yup
            .string()
            .required('Please specify a token, see /keys for more'),
        directory: yup
            .string()
            .required('Please specify a directory such as `dist`'),
    })
    .required();

const log = createLogger(
    {
        '🚀': '🚀',
        '⚙️': '⚙️ ',
        '🔧': '🔧',
        '🌿': '🌿',
        '💨': '💨',
        '⭐': '⭐',
        '📁': '📁',
        empty: {
            label: '  ',
        },
    },
    {
        divider: ' ',
        newLine: '  ',
        newLineEnd: '  ',
        padding: 'NONE',
    }
);

const version = require('../package.json')['version'];

(async () => {
    log.empty('', '');

    log['⭐'](chalk.magenta`edgeserver upload` + ' action v' + version);
    log.empty(chalk.yellowBright('-'.repeat(40)));
    log.empty(
        'Authored by ' + chalk.gray`@lvksh`,
        'github.com/lvksh/edgeserver-upload'
    );

    await new Promise<void>((reply) => setTimeout(reply, 1000));

    log.empty();
    log['🌿']('Relaxing....');
    log.empty(chalk.yellowBright('-'.repeat(40)));
    log.empty(randomQuote());

    log.empty();
    log['🔧']('Context Data');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const shouldPushGithubContext = github.context && github.context.sha;

    if (shouldPushGithubContext) {
        log.empty('Loaded github context');
    } else {
        log.empty('No context to be found');
    }

    log.empty();
    log['⚙️']('Configuration');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const config = {
        server: process.env.EDGE_SERVER || core.getInput('server'),
        site_id: process.env.EDGE_SITE_ID || core.getInput('site_id').toString(),
        token: process.env.EDGE_TOKEN || core.getInput('token'),
        directory: process.env.EDGE_DIRECTORY || core.getInput('directory'),
        context: ['1', 'true'].includes(
            process.env.EDGE_CONTEXT || core.getInput('context')
        ),
    };

    try {
        validateConfiguration.validateSync(config, { abortEarly: true });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            log.empty(
                'Error Validating ' + chalk.yellowBright(error.path),
                '\t' +
                chalk.white(chalk.bgCyanBright(` ${error.errors.at(0)} `))
            );
        }

        process.exit(1);

        return;
    }

    log.empty('Server: ' + chalk.gray(config.server));
    log.empty('App ID: ' + chalk.gray(config.site_id));
    log.empty('Directory: ' + chalk.yellowBright(config.directory));
    log.empty(
        'Token: ' + chalk.gray('*'.repeat(4) + ` [${config.token.length}]`)
    );
    log.empty(
        'Github Context: ' + config.context
            ? chalk.greenBright('Yes')
            : chalk.yellowBright('')
    );

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

    await uploadRequest.text();

    log.empty(chalk.greenBright('Successfully Deployed 😊'));

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
