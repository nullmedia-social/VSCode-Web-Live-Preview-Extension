"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWatcher = setupWatcher;
const vscode = require("vscode");
function setupWatcher(panel, context) {
    const fileTimers = new Map();
    const reload = (uri) => {
        if (fileTimers.has(uri.fsPath))
            clearTimeout(fileTimers.get(uri.fsPath));
        fileTimers.set(uri.fsPath, setTimeout(() => {
            panel.webview.postMessage({ type: 'reload', uri: uri.toString() });
            fileTimers.delete(uri.fsPath);
        }, 250)); // 250ms debounce
    };
    const watcher = vscode.workspace.createFileSystemWatcher('**/*.{html,css,js,png,jpg,svg}');
    watcher.onDidChange(reload);
    watcher.onDidCreate(reload);
    watcher.onDidDelete(reload);
    // Optional: live typing reload
    const changeSub = vscode.workspace.onDidChangeTextDocument(event => {
        const ext = event.document.uri.fsPath.split('.').pop();
        if (['html', 'css', 'js'].includes(ext))
            reload(event.document.uri);
    });
    context.subscriptions.push(watcher, changeSub);
}
//# sourceMappingURL=watcher.js.map