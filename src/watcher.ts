import * as vscode from 'vscode';

export function setupWatcher(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{html,css,js,png,jpg,svg}');

    const reload = async (uri: vscode.Uri) => {
        panel.webview.postMessage({ type: 'reload', uri: uri.toString() });
    };

    watcher.onDidChange(reload);
    watcher.onDidCreate(reload);
    watcher.onDidDelete(reload);

    // Optional: live typing reload
    const changeSub = vscode.workspace.onDidChangeTextDocument(event => {
        if (event.document.uri.fsPath.endsWith('.html') || event.document.uri.fsPath.endsWith('.css') || event.document.uri.fsPath.endsWith('.js')) {
            panel.webview.postMessage({ type: 'reload', uri: event.document.uri.toString() });
        }
    });

    context.subscriptions.push(watcher, changeSub);
}