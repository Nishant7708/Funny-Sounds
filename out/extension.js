"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const soundPlayer_1 = require("./soundPlayer");
let soundPlayer;
let statusBarItem;
function activate(context) {
    console.log("Funny Sounds extension is now active!");
    soundPlayer = new soundPlayer_1.SoundPlayer(context.extensionPath);
    // --- Status bar indicator ---
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    updateStatusBar();
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // --- Listen to terminal shell execution end (stable API) ---
    // Plays sound when a command finishes with a non-zero exit code.
    const shellExecListener = vscode.window.onDidEndTerminalShellExecution((e) => {
        const config = vscode.workspace.getConfiguration("funnySounds");
        if (!config.get("enabled", true)) {
            return;
        }
        if (e.exitCode !== undefined && e.exitCode !== 0) {
            soundPlayer.play();
        }
    });
    context.subscriptions.push(shellExecListener);
    // --- Listen to diagnostic changes (editor errors) ---
    const diagnosticListener = vscode.languages.onDidChangeDiagnostics((e) => {
        const config = vscode.workspace.getConfiguration("funnySounds");
        if (!config.get("enabled", true)) {
            return;
        }
        for (const uri of e.uris) {
            const diagnostics = vscode.languages.getDiagnostics(uri);
            const hasError = diagnostics.some((d) => d.severity === vscode.DiagnosticSeverity.Error);
            if (hasError) {
                soundPlayer.play();
                break;
            }
        }
    });
    context.subscriptions.push(diagnosticListener);
    // --- Register commands ---
    context.subscriptions.push(vscode.commands.registerCommand("funnySounds.enable", () => {
        vscode.workspace
            .getConfiguration("funnySounds")
            .update("enabled", true, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("Funny Sounds: Enabled!");
        updateStatusBar();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("funnySounds.disable", () => {
        vscode.workspace
            .getConfiguration("funnySounds")
            .update("enabled", false, vscode.ConfigurationTarget.Global);
        vscode.window.showInformationMessage("Funny Sounds: Disabled!");
        updateStatusBar();
    }));
    context.subscriptions.push(vscode.commands.registerCommand("funnySounds.testSound", () => {
        soundPlayer.play();
        vscode.window.showInformationMessage("Funny Sounds: Playing test sound...");
    }));
    context.subscriptions.push(vscode.commands.registerCommand("funnySounds.selectSound", async () => {
        const result = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            canSelectFolders: false,
            canSelectMany: false,
            filters: {
                "Sound Files": ["wav", "mp3", "ogg"],
            },
            title: "Select a Custom Error Sound",
        });
        if (result && result[0]) {
            const filePath = result[0].fsPath;
            await vscode.workspace
                .getConfiguration("funnySounds")
                .update("soundFilePath", filePath, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage(`Funny Sounds: Custom sound set to "${filePath}"`);
        }
    }));
    // --- React to setting changes ---
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration("funnySounds.enabled")) {
            updateStatusBar();
        }
    }));
}
function updateStatusBar() {
    const enabled = vscode.workspace
        .getConfiguration("funnySounds")
        .get("enabled", true);
    if (enabled) {
        statusBarItem.text = "$(unmute) Funny Sounds";
        statusBarItem.tooltip = "Funny Sounds: ON (click to disable)";
        statusBarItem.command = "funnySounds.disable";
    }
    else {
        statusBarItem.text = "$(mute) Funny Sounds";
        statusBarItem.tooltip = "Funny Sounds: OFF (click to enable)";
        statusBarItem.command = "funnySounds.enable";
    }
}
function deactivate() {
    console.log("Funny Sounds extension deactivated.");
}
//# sourceMappingURL=extension.js.map