import * as vscode from 'vscode';
export function setupWatcher(panel, context) {
    const fileTimers = new Map();
    const reload = (uri) => {
        const key = uri.toString();
        if (fileTimers.has(key))
            clearTimeout(fileTimers.get(key));
        fileTimers.set(key, window.setTimeout(() => {
            panel.webview.postMessage({ type: 'reload', uri: key });
            fileTimers.delete(key);
        }, 250));
    };
    // Only use watchers on Desktop (Node)
    if (vscode.env.uiKind === vscode.UIKind.Desktop) {
        const watcher = vscode.workspace.createFileSystemWatcher('**/*.{html,css,js,png,jpg,svg}');
        watcher.onDidChange(reload);
        watcher.onDidCreate(reload);
        watcher.onDidDelete(reload);
        context.subscriptions.push(watcher);
    }
    // Always watch open editors (works in browser)
    const changeSub = vscode.workspace.onDidChangeTextDocument(event => {
        const ext = event.document.uri.fsPath.split('.').pop();
        if (['html', 'css', 'js'].includes(ext))
            reload(event.document.uri);
    });
    context.subscriptions.push(changeSub);
}
//# sourceMappingURL=watcher.js.map