import { styleText } from "node:util";

import { type Config, log } from "../config";
import { type GithubContext } from "../github";
import { type StateConfig } from "../state";

export const createDeployment = async (
  config: Config,
  context: GithubContext,
  deploymentId?: string,
  blob?: Blob,
): Promise<StateConfig> => {
  const formData = new FormData();

  if (config.context) formData.set("context", JSON.stringify(context));

  if (blob) formData.set("data", blob);

  let targetUrl = config.server + "/site/" + config.site_id + "/deployment";
  let targetMethod = "POST";

  if (deploymentId) {
    targetUrl
      = config.server
        + "/site/"
        + config.site_id
        + "/deployment/"
        + deploymentId
        + "/files";
    targetMethod = "PATCH";
  }

  const uploadRequest = await fetch(targetUrl, {
    method: targetMethod,
    headers: {
      Authorization: "Bearer " + config.token,
    },
    body: formData,
  });

  const { status } = uploadRequest;

  if (status !== 200) {
    log.empty(
      status === 403
        ? styleText(
            "redBright",
            "Unauthorized. Check your auth token's validity.",
          )
        : styleText("yellowBright", `Unknown error with status code ${status}`),
    );

    process.exit(1);
  }

  const response = await uploadRequest.text();
  const freshDeploymentId = JSON.parse(response).deployment_id;

  log.empty(
    `${styleText("greenBright", "Successfully notified the crew 😊")}: ${freshDeploymentId}`,
  );

  return {
    deployment_id: freshDeploymentId,
    pre_time: context.data.pre_time,
    push_time: context.data.push_time,
    post_time: context.data.post_time,
  };
};
