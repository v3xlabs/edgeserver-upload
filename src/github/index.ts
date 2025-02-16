import * as github from '@actions/github';
import { StateConfig } from '../state';

export type GithubContext = {
    contextType: 'github-action';
    data: {
        event: string;
        sha: string;
        workflow: string;
        workflow_status: string;
        runNumber: number;
        runId: number;
        server_url: string;
        ref: string;
        actor: string;
        sender: string;
        commit: {
            id: string;
            message: string;
            author: {
                name: string;
                email: string;
                username: string;
            };
            committer: {
                name: string;
                email: string;
                username: string;
            };
            distinct: boolean;
            timestamp: string;
            tree_id: string;
            url: string;
        };
        pre_time: string;
        push_time: string;
        post_time: string;
    };
};

export const getGithubContext = (workflow_status: ('pre' | 'push' | 'post') & string, state: StateConfig): GithubContext => {
    const context = {
        contextType: 'github-action',
        data: {
            event: github.context.eventName,
            sha: github.context.sha,
            workflow: github.context.workflow,
            workflow_status: workflow_status,
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
            pre_time: state.pre_time,
            push_time: state.push_time,
            post_time: state.post_time,
        },
    } as GithubContext;

    const now = new Date().toISOString();

    if (workflow_status == 'pre') {
        context.data.pre_time = now;
    } else if (workflow_status == 'post') {
        context.data.post_time = now;
    } else if (workflow_status == 'push') {
        context.data.push_time = now;
    }

    return context;
};
