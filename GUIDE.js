"use strict";
/**
 * ============================================================
 *  FUNNY SOUNDS — VS Code Extension Guide
 * ============================================================
 *
 *  This file is a developer guide written in TypeScript.
 *  It explains how the extension works, how to set it up,
 *  and how to customize it.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Commands = void 0;
// ─────────────────────────────────────────────────────────────
//  3. GETTING STARTED
// ─────────────────────────────────────────────────────────────
/**
 * STEP 1 — Install dependencies:
 *
 *   npm install
 *
 * STEP 2 — Compile TypeScript:
 *
 *   npm run compile
 *
 * STEP 3 — Test in VS Code:
 *
 *   Press F5 in VS Code to open an Extension Development Host.
 *   Open a terminal in the new window and type a command that
 *   produces an error, for example:
 *
 *     node -e "throw new Error('boom')"
 *
 *   You should hear the error sound!
 *
 * STEP 4 — Package for distribution (optional):
 *
 *   npm install -g @vscode/vsce
 *   vsce package
 *
 *   This creates a `.vsix` file you can install anywhere with:
 *
 *     code --install-extension funny-sounds-1.0.0.vsix
 */
// ─────────────────────────────────────────────────────────────
//  4. AVAILABLE COMMANDS (Command Palette)
// ─────────────────────────────────────────────────────────────
var Commands;
(function (Commands) {
    /** Enable error sound playback */
    Commands["Enable"] = "funnySounds.enable";
    /** Disable error sound playback */
    Commands["Disable"] = "funnySounds.disable";
    /** Play the current sound once (for testing) */
    Commands["TestSound"] = "funnySounds.testSound";
    /** Open a file picker to choose a custom sound file */
    Commands["SelectSound"] = "funnySounds.selectSound";
})(Commands || (exports.Commands = Commands = {}));
//# sourceMappingURL=GUIDE.js.map