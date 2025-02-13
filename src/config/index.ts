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

import { logTreeData, treeFolderData } from '../treeFolder';

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

const version = require('../../package.json')['version'];

export const printHeader = async () => {
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

    return config;
};

export {
    version,
    validateConfiguration,
    log,
    randomQuote,
    ZIPLOCATION,
};
