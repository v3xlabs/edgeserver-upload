import * as github from '@actions/github';

export const getGithubContext = (workflow_status: ('pre' | 'push' | 'post') & string) => {
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
        },
    };

    return context;
};
