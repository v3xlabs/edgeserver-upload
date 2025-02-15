import chalk from 'chalk';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';

import { createDeployment } from './deploy';
import { log, printHeader } from './config';
import { getGithubContext } from './github';

(async () => {
    const config = await printHeader();

    log.empty('');
    log['✨']('Shooting flares');
    log.empty(chalk.yellowBright('-'.repeat(40)));

    const context = getGithubContext('pre');

    const deployment_id = await createDeployment(config, context);

    log.empty(deployment_id);

    // save deployment_id file to ~/.edgeserver/deployment_id
    const homeDir = os.homedir();
    const filepath = path.join(homeDir, '.edgeserver', 'deployment_id');

    mkdirSync(path.dirname(filepath), { recursive: true });
    writeFileSync(filepath, deployment_id, 'utf-8');

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty('', '');
})();
