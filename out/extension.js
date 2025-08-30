import * as vscode from 'vscode';
import { buildWebviewContent } from './webview';
import { setupWatcher } from './watcher';
export function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('livePreview.open', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        const panel = vscode.window.createWebviewPanel('livePreview', 'Live Preview', vscode.ViewColumn.Beside, { enableScripts: true, retainContextWhenHidden: true });
        panel.webview.html = await buildWebviewContent(editor.document, panel);
        setupWatcher(panel, context);
    }));
}
export function deactivate() { }
//# sourceMappingURL=extension.js.map