import * as vscode from 'vscode';

export function setupWatcher(panel: vscode.WebviewPanel, context: vscode.ExtensionContext) {
    const fileTimers: Map<string, number> = new Map();

    const reload = (uri: vscode.Uri) => {
        const key = uri.toString();
        if (fileTimers.has(key)) clearTimeout(fileTimers.get(key)!);
        fileTimers.set(key, window.setTimeout(() => {
            panel.webview.postMessage({ type: 'reload', uri: key });
            fileTimers.delete(key);
        }, 250));
    };

    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{html,css,js,png,jpg,svg}');
    watcher.onDidChange(reload);
    watcher.onDidCreate(reload);
    watcher.onDidDelete(reload);

    const changeSub = vscode.workspace.onDidChangeTextDocument(event => {
        const ext = event.document.uri.fsPath.split('.').pop();
        if (['html', 'css', 'js'].includes(ext!)) reload(event.document.uri);
    });

    context.subscriptions.push(watcher, changeSub);
}