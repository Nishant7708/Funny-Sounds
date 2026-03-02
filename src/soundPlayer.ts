import * as path from "path";
import * as fs from "fs";
import { exec } from "child_process";
import * as vscode from "vscode";

export class SoundPlayer {
  private extensionPath: string;
  private lastPlayTime: number = 0;

  constructor(extensionPath: string) {
    this.extensionPath = extensionPath;
  }

  /**
   * Get the path to the sound file — custom or default.
   */
  private getSoundFilePath(): string {
    const config = vscode.workspace.getConfiguration("funnySounds");
    const customPath = config.get<string>("soundFilePath", "");

    if (customPath && fs.existsSync(customPath)) {
      return customPath;
    }

    return path.join(this.extensionPath, "sounds", "error.wav");
  }

  /**
   * Play the error sound, respecting the cooldown setting.
   */
  public play(): void {
    const config = vscode.workspace.getConfiguration("funnySounds");
    const cooldown = config.get<number>("cooldownMs", 2000);
    const now = Date.now();

    if (now - this.lastPlayTime < cooldown) {
      return;
    }

    this.lastPlayTime = now;
    const soundFile = this.getSoundFilePath();

    if (!fs.existsSync(soundFile)) {
      vscode.window.showWarningMessage(
        `Funny Sounds: Sound file not found at "${soundFile}". ` +
          `Place a .wav file at that path or set a custom path in settings.`
      );
      return;
    }

    this.playFile(soundFile);
  }

  /**
   * Play a sound file using a platform-specific command.
   */
  private playFile(filePath: string): void {
    const volume = vscode.workspace
      .getConfiguration("funnySounds")
      .get<number>("volume", 50);

    let command: string;
    const platform = process.platform;

    if (platform === "win32") {
      // PowerShell MediaPlayer approach for Windows
      const volumeDecimal = (volume / 100).toFixed(2);
      command =
        `powershell -NoProfile -Command "` +
        `$p = New-Object System.Media.SoundPlayer '${filePath.replace(/'/g, "''")}'; ` +
        `$p.PlaySync()"`;
    } else if (platform === "darwin") {
      // macOS — use afplay with volume
      const afplayVol = (volume / 100) * 2; // afplay volume range 0-2
      command = `afplay -v ${afplayVol.toFixed(2)} "${filePath}"`;
    } else {
      // Linux — try aplay, paplay, or ffplay
      command =
        `(command -v paplay >/dev/null 2>&1 && paplay "${filePath}") || ` +
        `(command -v aplay >/dev/null 2>&1 && aplay -q "${filePath}") || ` +
        `(command -v ffplay >/dev/null 2>&1 && ffplay -nodisp -autoexit -loglevel quiet "${filePath}")`;
    }

    exec(command, (err) => {
      if (err) {
        console.error("Funny Sounds: Failed to play sound:", err.message);
      }
    });
  }
}
