import chalk from 'chalk';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createDeployment } from './deploy';
import { log, printHeader } from './config';
import { getGithubContext } from './github';
import { getState, setState } from './state';

(async () => {
    const config = await printHeader();

    log.empty('');
    log['✨']('Shooting flares');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const state = getState();

    const context = getGithubContext('pre', state);
    
    const fresh_state = await createDeployment(config, context);

    log.empty(fresh_state);

    setState({
        deployment_id: fresh_state.deployment_id,
        pre_time: context.data.pre_time,
        push_time: undefined,
        post_time: undefined,
    });

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
