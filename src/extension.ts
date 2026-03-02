import * as vscode from "vscode";
import { SoundPlayer } from "./soundPlayer";

let soundPlayer: SoundPlayer;
let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
  console.log("Funny Sounds extension is now active!");

  soundPlayer = new SoundPlayer(context.extensionPath);

  // --- Status bar indicator ---
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  updateStatusBar();
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // --- Listen to terminal shell execution end (stable API) ---
  // Plays sound when a command finishes with a non-zero exit code.
  const shellExecListener = vscode.window.onDidEndTerminalShellExecution(
    (e) => {
      const config = vscode.workspace.getConfiguration("funnySounds");
      if (!config.get<boolean>("enabled", true)) {
        return;
      }
      if (e.exitCode !== undefined && e.exitCode !== 0) {
        soundPlayer.play();
      }
    }
  );
  context.subscriptions.push(shellExecListener);

  // --- Listen to diagnostic changes (editor errors) ---
  const diagnosticListener = vscode.languages.onDidChangeDiagnostics((e) => {
    const config = vscode.workspace.getConfiguration("funnySounds");
    if (!config.get<boolean>("enabled", true)) {
      return;
    }
    for (const uri of e.uris) {
      const diagnostics = vscode.languages.getDiagnostics(uri);
      const hasError = diagnostics.some(
        (d) => d.severity === vscode.DiagnosticSeverity.Error
      );
      if (hasError) {
        soundPlayer.play();
        break;
      }
    }
  });
  context.subscriptions.push(diagnosticListener);

  // --- Register commands ---
  context.subscriptions.push(
    vscode.commands.registerCommand("funnySounds.enable", () => {
      vscode.workspace
        .getConfiguration("funnySounds")
        .update("enabled", true, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage("Funny Sounds: Enabled!");
      updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("funnySounds.disable", () => {
      vscode.workspace
        .getConfiguration("funnySounds")
        .update("enabled", false, vscode.ConfigurationTarget.Global);
      vscode.window.showInformationMessage("Funny Sounds: Disabled!");
      updateStatusBar();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("funnySounds.testSound", () => {
      soundPlayer.play();
      vscode.window.showInformationMessage(
        "Funny Sounds: Playing test sound..."
      );
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("funnySounds.selectSound", async () => {
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
          .update(
            "soundFilePath",
            filePath,
            vscode.ConfigurationTarget.Global
          );
        vscode.window.showInformationMessage(
          `Funny Sounds: Custom sound set to "${filePath}"`
        );
      }
    })
  );

  // --- React to setting changes ---
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("funnySounds.enabled")) {
        updateStatusBar();
      }
    })
  );
}

function updateStatusBar(): void {
  const enabled = vscode.workspace
    .getConfiguration("funnySounds")
    .get<boolean>("enabled", true);

  if (enabled) {
    statusBarItem.text = "$(unmute) Funny Sounds";
    statusBarItem.tooltip = "Funny Sounds: ON (click to disable)";
    statusBarItem.command = "funnySounds.disable";
  } else {
    statusBarItem.text = "$(mute) Funny Sounds";
    statusBarItem.tooltip = "Funny Sounds: OFF (click to enable)";
    statusBarItem.command = "funnySounds.enable";
  }
}

export function deactivate() {
  console.log("Funny Sounds extension deactivated.");
}
