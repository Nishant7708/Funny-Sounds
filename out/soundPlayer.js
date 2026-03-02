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
exports.SoundPlayer = void 0;
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const child_process_1 = require("child_process");
const vscode = __importStar(require("vscode"));
class SoundPlayer {
    constructor(extensionPath) {
        this.lastPlayTime = 0;
        this.extensionPath = extensionPath;
    }
    /**
     * Get the path to the sound file — custom or default.
     */
    getSoundFilePath() {
        const config = vscode.workspace.getConfiguration("funnySounds");
        const customPath = config.get("soundFilePath", "");
        if (customPath && fs.existsSync(customPath)) {
            return customPath;
        }
        return path.join(this.extensionPath, "sounds", "error.wav");
    }
    /**
     * Play the error sound, respecting the cooldown setting.
     */
    play() {
        const config = vscode.workspace.getConfiguration("funnySounds");
        const cooldown = config.get("cooldownMs", 2000);
        const now = Date.now();
        if (now - this.lastPlayTime < cooldown) {
            return;
        }
        this.lastPlayTime = now;
        const soundFile = this.getSoundFilePath();
        if (!fs.existsSync(soundFile)) {
            vscode.window.showWarningMessage(`Funny Sounds: Sound file not found at "${soundFile}". ` +
                `Place a .wav file at that path or set a custom path in settings.`);
            return;
        }
        this.playFile(soundFile);
    }
    /**
     * Play a sound file using a platform-specific command.
     */
    playFile(filePath) {
        const volume = vscode.workspace
            .getConfiguration("funnySounds")
            .get("volume", 50);
        let command;
        const platform = process.platform;
        if (platform === "win32") {
            // PowerShell MediaPlayer approach for Windows
            const volumeDecimal = (volume / 100).toFixed(2);
            command =
                `powershell -NoProfile -Command "` +
                    `$p = New-Object System.Media.SoundPlayer '${filePath.replace(/'/g, "''")}'; ` +
                    `$p.PlaySync()"`;
        }
        else if (platform === "darwin") {
            // macOS — use afplay with volume
            const afplayVol = (volume / 100) * 2; // afplay volume range 0-2
            command = `afplay -v ${afplayVol.toFixed(2)} "${filePath}"`;
        }
        else {
            // Linux — try aplay, paplay, or ffplay
            command =
                `(command -v paplay >/dev/null 2>&1 && paplay "${filePath}") || ` +
                    `(command -v aplay >/dev/null 2>&1 && aplay -q "${filePath}") || ` +
                    `(command -v ffplay >/dev/null 2>&1 && ffplay -nodisp -autoexit -loglevel quiet "${filePath}")`;
        }
        (0, child_process_1.exec)(command, (err) => {
            if (err) {
                console.error("Funny Sounds: Failed to play sound:", err.message);
            }
        });
    }
}
exports.SoundPlayer = SoundPlayer;
//# sourceMappingURL=soundPlayer.js.map