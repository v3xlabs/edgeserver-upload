import { createLogger } from "@lvksh/logger";
import chalk from "chalk";
import * as core from "@actions/core";
import * as yup from "yup";
import * as ora from "ora";
import readline from "readline";
import prettyBytes from "pretty-bytes";
import { logTreeData, treeFolderData } from "./treeFolder";
import { resolve } from "path";
import { zip } from "zip-a-folder";
import { stat } from "fs/promises";

chalk.level = 1;
process.env.FORCE_COLOR = "1";

const clearLastLine = () => {
    readline.moveCursor(process.stdout, 0, -1); // up one line
    readline.clearLine(process.stdout, 1); // from cursor to end
};

const QUOTES = [
    "Well hello there",
    "Good morning me lad!",
    "Lets goooooo!!",
    "Visit https://og.ax/ for a good laugh.",
    "Hope you are doing okay 😇",
    "See you on the other side 🎉",
];

const randomQuote = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

const validateConfiguration = yup
    .object({
        server: yup
            .string()
            .required("Please specify a server")
            .url("Not a URL"),
        app_id: yup
            .string()
            .min(
                1,
                "Please specify an app_id, you find this on your apps page.",
            )
            .matches(
                /^(?!([0-9.]+[eE]]\+[0-9]+))[0-9]+$/,
                "Invalid app_id, try adding quotes around it.",
            )
            .matches(/[0-9]+/m, "Invalid app_id, make it a number"),
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
        "🚀": "🚀",
        "⚙️": "⚙️ ",
        "🔧": "🔧",
        "🌿": "🌿",
        "💨": "💨",
        "⭐": "⭐",
        "📁": "📁",
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

const version = require("../package.json")["version"];

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
    log.empty(randomQuote());

    // Install dependencies
    // log.empty('');
    // log['🔧']('Building...');
    // log.empty(chalk.yellowBright('-'.repeat(40)));

    // log.empty('Switching to ' + chalk.gray(global));

    log.empty();
    log["⚙️"]("Configuration");
    log.empty(chalk.yellowBright("-".repeat(40)));

    log.empty("Loading...");

    const config = {
        server: process.env.EDGE_SERVER || core.getInput("server"),
        app_id: process.env.EDGE_APP_ID || core.getInput("app_id").toString(),
        token: process.env.EDGE_TOKEN || core.getInput("token"),
        directory: process.env.EDGE_DIRECTORY || core.getInput("directory"),
    };

    clearLastLine();

    try {
        validateConfiguration.validateSync(config, { abortEarly: true });
    } catch (error) {
        if (error instanceof yup.ValidationError) {
            log.empty(
                "Error Validating " + chalk.yellowBright(error.path),
                "\t" + chalk.white(chalk.bgCyanBright(` ${error.errors[0]} `)),
            );
        }
        return;
    }

    log.empty("Server: " + chalk.gray(config.server));
    log.empty("App ID: " + chalk.gray(config.app_id));
    log.empty("Directory: " + chalk.yellowBright(config.directory));
    log.empty(
        "Token: " + chalk.gray("*".repeat(4) + ` [${config.token.length}]`),
    );

    log.empty("");
    log["📁"]("Compressing Application");
    log.empty(chalk.yellowBright("-".repeat(40)));

    const scanSpinner = ora.default("Compressing " + config.directory).start();

    const sizeData = await treeFolderData(resolve("./", config.directory));

    scanSpinner.stop();

    log.empty("Files Overview:");
    logTreeData(sizeData, log.empty);

    log.empty("");

    const compressSpinner = ora
        .default("Compressing " + config.directory)
        .start();

    await zip(
        resolve("./", config.directory),
        resolve("./", "edgeserver_dist.zip"),
    );

    const compressedData = await stat(resolve("./", "edgeserver_dist.zip"));

    compressSpinner.stop();

    log.empty(
        "Compressed to " + chalk.yellowBright(prettyBytes(compressedData.size)),
    );

    log.empty("");
    log["🚀"]("Deploying");
    log.empty(chalk.yellowBright("-".repeat(40)));

    const uploadSpinner = ora.default("Compressing " + config.directory).start();

    await new Promise<void>(acc => setTimeout(acc, 3000));

    uploadSpinner.stop();

    // log.empty(chalk.white(`[${chalk.greenBright("\u2588".repeat(32))}]`));

    log.empty("", "");
})();
