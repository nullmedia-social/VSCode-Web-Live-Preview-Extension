"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const webview_1 = require("./webview");
const watcher_1 = require("./watcher");
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('livePreview.open', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const panel = vscode.window.createWebviewPanel('livePreview', 'Live Preview', vscode.ViewColumn.Beside, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = await (0, webview_1.buildWebviewContent)(editor.document, panel);
        // Setup multi-file watcher
        (0, watcher_1.setupWatcher)(panel, context);
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map