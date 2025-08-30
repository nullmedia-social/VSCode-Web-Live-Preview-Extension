import * as vscode from 'vscode';
import * as path from 'path';

export async function buildWebviewContent(document: vscode.TextDocument, panel: vscode.WebviewPanel): Promise<string> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder) return "<body>No workspace folder found</body>";

    let html = document.getText();

    // Find <link> and <script src> and <img> and rewrite to webview URIs
    const assetRegex = /(href|src)=["'](.+?)["']/g;
    html = html.replace(assetRegex, (_, attr, srcPath) => {
        try {
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, srcPath);
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