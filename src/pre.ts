import chalk from 'chalk';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createDeployment } from './deploy';
import { log, printHeader } from './config';
import { getGithubContext } from './github';
import { setState } from './state';

(async () => {
    const config = await printHeader();

    log.empty('');
    log['✨']('Shooting flares');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const context = getGithubContext('pre');

    const state = await createDeployment(config, context);

    log.empty(state);

    setState({
        deployment_id: state.deployment_id,
        pre_time: new Date().toISOString(),
        push_time: undefined,
        post_time: undefined,
    });

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
