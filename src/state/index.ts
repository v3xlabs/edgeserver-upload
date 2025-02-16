import os from 'node:os';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export type StateConfig = {
    deployment_id: string | undefined;
    pre_time: string | undefined;
    push_time: string | undefined;
    post_time: string | undefined;
};

export const getState = (): StateConfig => {
    const homeDir = os.homedir();
    const filepath = path.join(homeDir, '.edgeserver', 'state.json');

    let data: StateConfig = {
        deployment_id: undefined,
        pre_time: undefined,
        push_time: undefined,
        post_time: undefined,
    };

    if (existsSync(filepath)) {
        const fs_data = readFileSync(filepath, 'utf8');
        data = JSON.parse(fs_data);
    }

    return data;
};

export const setState = (data: StateConfig) => {
    const homeDir = os.homedir();
    const filepath = path.join(homeDir, '.edgeserver', 'state.json');

    mkdirSync(path.dirname(filepath), { recursive: true });
    writeFileSync(filepath, JSON.stringify(data), 'utf-8');
};
