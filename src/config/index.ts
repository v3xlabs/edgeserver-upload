import { styleText } from "node:util";

import * as core from "@actions/core";
import * as github from "@actions/github";
import { createLogger } from "@lvksh/logger";
import * as yup from "yup";

import { version } from "../../package.json";

process.env.FORCE_COLOR = "1";

const ZIPLOCATION = "edgeserver_dist.zip";
const QUOTES = [
  "Well hello there",
  "Good morning me lad!",
  "Lets goooooo!!",
  "Hope you are doing okay 😇",
  "See you on the other side 🎉",
];

const randomQuote = (): string => QUOTES[Math.floor(Math.random() * QUOTES.length)] ?? "";

const validateConfig = yup
  .object({
    server: yup.string().required("Please specify a server")
      .url("Not a URL"),
    site_id: yup
      .string()
      .min(1, "Please specify a site_id, you find this on your apps page.")
      .matches(
        /^s_[a-z0-9]+$/,
        "Invalid site_id, try adding quotes around it.",
      ),
    token: yup
      .string()
      .required("Please specify a token, see /keys for more"),
    directory: yup
      .string()
      .required("Please specify a directory such as `dist`"),
  })
  .required();

const log = createLogger(
  {
    "✨": "✨",
    "⚙️": "⚙️ ",
    "🔧": "🔧",
    "🌿": "🌿",
    "💨": "💨",
    "⭐": "⭐",
    "📁": "📁",
    "🚀": "🚀",
    "empty": { label: "  " },
  },
  {
    divider: " ",
    newLine: "  ",
    newLineEnd: "  ",
    padding: "NONE",
  },
);

export type Config = {
  server: string;
  site_id: string;
  token: string;
  directory: string;
  context: boolean;
};

export const printHeader = async (): Promise<Config> => {
  log.empty("", "");
  log["⭐"](styleText("magenta", "Edgeserver Upload") + " action v" + version);
  log.empty(styleText("yellowBright", "-".repeat(40)));
  log.empty(
    "Authored by " + styleText("gray", "@v3xlabs"),
    "github.com/v3xlabs/edgeserver-upload",
  );
  log["🌿"]("Relaxing....");
  log.empty(randomQuote());

  const config = {
    server: process.env.EDGE_SERVER || core.getInput("server"),
    site_id: process.env.EDGE_SITE_ID || core.getInput("site_id"),
    token: process.env.EDGE_TOKEN || core.getInput("token"),
    directory: process.env.EDGE_DIRECTORY || core.getInput("directory"),
    context: ["1", "true"].includes(
      process.env.EDGE_CONTEXT || core.getInput("context"),
    ),
  };

  try {
    validateConfig.validateSync(config, { abortEarly: true });
  }
  catch (error) {
    if (error instanceof yup.ValidationError) {
      log.empty(
        "Configuration error: "
        + styleText("yellowBright", error.errors.at(0) ?? "Invalid input"),
      );
    }

    process.exit(1);
  }

  log["⚙️"](
    `${styleText("gray", config.server)} | ${styleText("gray", config.site_id)} | ${styleText("yellowBright", config.directory)}`,
  );
  log.empty(
    github.context.sha
      ? `Commit: ${styleText("gray", github.context.sha.slice(0, 7))}`
      : "GitHub context is unavailable",
  );

  return config;
};

export { log, ZIPLOCATION };
