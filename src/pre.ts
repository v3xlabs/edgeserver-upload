import { styleText } from "node:util";

import { log, printHeader } from "./config";
import { createDeployment } from "./deploy";
import { getGithubContext } from "./github";
import { getState, setState } from "./state";

void (async () => {
  const config = await printHeader();
  const state = getState();
  const context = getGithubContext("pre", state);

  log["✨"]("Shooting flares");
  const freshState = await createDeployment(config, context);

  log.empty(`Deployment prepared: ${freshState.deployment_id}`);

  setState({
    deployment_id: freshState.deployment_id,
    pre_time: context.data.pre_time,
    push_time: undefined,
    post_time: undefined,
  });
  log.empty(styleText("greenBright", "Flares sent. Preparation complete ✨"));
})();
