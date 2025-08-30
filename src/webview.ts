import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

const INLINE_THRESHOLD = 5 * 1024; // 5 KB

export async function buildWebviewContent(document: vscode.TextDocument, panel: vscode.WebviewPanel): Promise<string> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) return "<body>No workspace folder found</body>";

    let html = document.getText();
    const assetsToWatch: vscode.Uri[] = [];

    // Regex for link/script/img
    const regex = /(href|src)=["'](.+?)["']/g;
    html = html.replace(regex, (_, attr, srcPath) => {
        try {
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, srcPath);
            assetsToWatch.push(fileUri);

            const fileContent = fs.readFileSync(fileUri.fsPath, 'utf-8');
            if ((attr === 'href' && srcPath.endsWith('.css')) || (attr === 'src' && srcPath.endsWith('.js'))) {
                if (fileContent.length <= INLINE_THRESHOLD) {
                    if (attr === 'href') return `<style>${fileContent}</style>`;
                    if (attr === 'src') return `<script>${fileContent}</script>`;
                }
            }

            const webviewUri = panel.webview.asWebviewUri(fileUri);
            return `${attr}="${webviewUri.toString()}"`;
        } catch {
            return `${attr}="${srcPath}"`;
        }
    });

    // Inject live-reload script
    html = html.replace(
        /<\/body>/i,
        `<script>
            const vscode = acquireVsCodeApi();
            window.addEventListener('message', event => {
                if(event.data.type === 'reload'){
                    location.reload();
                }
            });
        </script></body>`
    );

    return html;
}