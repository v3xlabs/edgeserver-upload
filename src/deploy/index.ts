import chalk from "chalk";
import { log } from "../config";

export const createDeployment = async (config, context, deployment_id?: string, blob?: Blob): Promise<string> => {
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

        return;
    }

    const response = await uploadRequest.text();

    log.empty(chalk.greenBright('Successfully notified the crew 😊'));
    log.empty(response);

    const fresh_deployment_id = JSON.parse(response).deployment_id;

    return fresh_deployment_id;
};
