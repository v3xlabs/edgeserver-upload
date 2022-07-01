"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("@lvksh/logger");
var chalk_1 = __importDefault(require("chalk"));
var core_1 = __importDefault(require("@actions/core"));
var log = (0, logger_1.createLogger)({
    "🚀": "🚀",
    "⚙️": "⚙️ ",
    "🔧": "🔧",
    "🌿": "🌿",
    "💨": "💨",
    "⭐": "⭐",
    empty: {
        label: "  ",
    },
}, {
    divider: " ",
    newLine: "  ",
    newLineEnd: "  ",
    padding: "NONE",
});
var version = require('../package.json')['version'];
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var config;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                log.empty("", "");
                log["⭐"](chalk_1.default.magenta(templateObject_1 || (templateObject_1 = __makeTemplateObject(["edgeserver upload"], ["edgeserver upload"]))) + " action v" + version);
                log.empty(chalk_1.default.yellowBright("-".repeat(40)));
                log.empty("Authored by " + chalk_1.default.gray(templateObject_2 || (templateObject_2 = __makeTemplateObject(["@lvksh"], ["@lvksh"]))), "github.com/lvksh/edgeserver-upload", "");
                return [4 /*yield*/, new Promise(function (reply) { return setTimeout(reply, 1000); })];
            case 1:
                _a.sent();
                log["🌿"]("Relaxing....");
                log.empty(chalk_1.default.yellowBright("-".repeat(40)));
                // Install dependencies
                // log.empty('');
                // log['🔧']('Building...');
                // log.empty(chalk.yellowBright('-'.repeat(40)));
                // log.empty('Switching to ' + chalk.gray(global));
                log.empty();
                log["⚙️"]("Configuration");
                log.empty(chalk_1.default.yellowBright("-".repeat(40)));
                config = {
                    server: core_1.default.getInput("server"),
                    app_id: core_1.default.getInput("app_id"),
                    token: core_1.default.getInput("token"),
                    directory: core_1.default.getInput("directory"),
                };
                log.empty('Server: ' + chalk_1.default.gray(config.server));
                log.empty('App ID: ' + chalk_1.default.gray(config.app_id));
                log.empty('Directory: ' + chalk_1.default.yellowBright(config.directory));
                log.empty('Token: ' + chalk_1.default.gray('*'.repeat(config.token.length)));
                log.empty("");
                log.empty(chalk_1.default.yellowBright("-".repeat(40)));
                log.empty("");
                log["🚀"](chalk_1.default.cyan(templateObject_3 || (templateObject_3 = __makeTemplateObject(["Off to the races!"], ["Off to the races!"]))));
                log.empty("", "");
                return [2 /*return*/];
        }
    });
}); })();
var templateObject_1, templateObject_2, templateObject_3;
