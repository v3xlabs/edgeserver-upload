import { styleText } from "node:util";

import { log, printHeader } from "./config";
import { createDeployment } from "./deploy";
import { getGithubContext } from "./github";
import { getState, setState } from "./state";

void (async () => {
  const config = await printHeader();
  const state = getState();
  const context = getGithubContext("post", state);
  const freshState = await createDeployment(config, context, state.deployment_id);

  setState({
    deployment_id: freshState.deployment_id,
    pre_time: state.pre_time,
    push_time: state.push_time,
    post_time: context.data.post_time,
  });
  log.empty(styleText("greenBright", "Deployment finalized. See you on the other side 🎉"));
})();
