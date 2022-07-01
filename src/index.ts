import { createLogger } from "@lvksh/logger";
import chalk from "chalk";
import * as core from "@actions/core";

chalk.level = 1;

const log = createLogger(
    {
        "🚀": "🚀",
        "⚙️": "⚙️",
        "🔧": "🔧",
        "🌿": "🌿",
        "💨": "💨",
        "⭐": "⭐",
        empty: {
            label: "  ",
        },
    },
    {
        divider: " ",
        newLine: "  ",
        newLineEnd: "  ",
        padding: "NONE",
    },
);

const version = require('../package.json')['version'];

(async () => {
    log.empty("", "");

    log["⭐"](chalk.magenta`edgeserver upload` + " action v" + version);
    log.empty(chalk.yellowBright("-".repeat(40)));
    log.empty(
        "Authored by " + chalk.gray`@lvksh`,
        "github.com/lvksh/edgeserver-upload",
        "",
    );

    await new Promise<void>((reply) => setTimeout(reply, 1000));

    log["🌿"]("Relaxing....");
    log.empty(chalk.yellowBright("-".repeat(40)));

    // Install dependencies
    // log.empty('');
    // log['🔧']('Building...');
    // log.empty(chalk.yellowBright('-'.repeat(40)));

    // log.empty('Switching to ' + chalk.gray(global));

    log.empty();
    log["⚙️"]("Configuration");
    log.empty(chalk.yellowBright("-".repeat(40)));

    const config = {
        server: core.getInput("server", {required: true}),
        app_id: core.getInput("app_id", {required: true}).toString(),
        token: core.getInput("token", {required: true}),
        directory: core.getInput("directory", {required: false}),
    };

    log.empty('Server: ' + chalk.gray(config.server));
    log.empty('App ID: ' + chalk.gray(config.app_id));
    log.empty('Directory: ' + chalk.yellowBright(config.directory));
    log.empty('Token: ' + chalk.gray('*'.repeat(config.token.length)));

    log.empty("");
    log.empty(chalk.yellowBright("-".repeat(40)));
    log.empty("");
    log["🚀"](chalk.cyan`Off to the races!`);

    log.empty("", "");
})();
