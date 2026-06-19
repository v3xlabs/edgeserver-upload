import chalk from "chalk";
import { log, Config } from "../config";
import { GithubContext } from "../github";
import { StateConfig } from "../state";

export const createDeployment = async (config: Config, context: GithubContext, deployment_id?: string, blob?: Blob): Promise<StateConfig> => {
    const formData = new FormData();

    if (config.context) formData.set('context', JSON.stringify(context));

    if (blob) formData.set('data', blob);

    let target_url = config.server + '/site/' + config.site_id + '/deployment';
    let target_method = 'POST';

    if (deployment_id) {
        target_url = config.server + '/site/' + config.site_id + '/deployment/' + deployment_id + '/files';
        target_method = 'PATCH';
    }

    const uploadRequest = await fetch(
        target_url,
        {
            method: target_method,
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
    }

    const response = await uploadRequest.text();

    log.empty(chalk.greenBright('Successfully notified the crew 😊'));
    log.empty(response);

    const fresh_deployment_id = JSON.parse(response).deployment_id;

    return {
        deployment_id: fresh_deployment_id,
        pre_time: context.data.pre_time,
        push_time: context.data.push_time,
        post_time: context.data.post_time,
    };
};
