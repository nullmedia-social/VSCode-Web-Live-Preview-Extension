"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildWebviewContent = buildWebviewContent;
const vscode = require("vscode");
const fs = require("fs");
const INLINE_THRESHOLD = 5 * 1024; // 5 KB
async function buildWebviewContent(document, panel) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder)
        return "<body>No workspace folder found</body>";
    let html = document.getText();
    const assetsToWatch = [];
    // Regex for link/script/img
    const regex = /(href|src)=["'](.+?)["']/g;
    html = html.replace(regex, (_, attr, srcPath) => {
        try {
            // joinPath and asWebviewUri are available in @types/vscode >=1.56
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, srcPath);
            assetsToWatch.push(fileUri);
            const fileContent = fs.readFileSync(fileUri.fsPath, 'utf-8');
            if ((attr === 'href' && srcPath.endsWith('.css')) || (attr === 'src' && srcPath.endsWith('.js'))) {
                if (fileContent.length <= INLINE_THRESHOLD) {
                    if (attr === 'href')
                        return `<style>${fileContent}</style>`;
                    if (attr === 'src')
                        return `<script>${fileContent}</script>`;
                }
            }
            const webviewUri = panel.webview.asWebviewUri(fileUri);
            return `${attr}="${webviewUri.toString()}"`;
        }
        catch {
            return `${attr}="${srcPath}"`;
        }
    });
    // Inject live-reload script
    html = html.replace(/<\/body>/i, `<script>
            const vscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
                if(event.data.type === 'reload'){
                    location.reload();
                }
            });
        </script></body>`);
    return html;
}
//# sourceMappingURL=webview.js.map