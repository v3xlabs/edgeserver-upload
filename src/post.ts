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

    const context = getGithubContext('post', state);

    const fresh_state = await createDeployment(config, context, state.deployment_id);

    // Save state for debugging purposes
    setState({
        deployment_id: fresh_state.deployment_id,
        pre_time: state.pre_time,
        push_time: state.push_time,
        post_time: context['post_time'],
    });

    log.empty('', '');
})();
