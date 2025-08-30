import * as vscode from 'vscode';
const INLINE_THRESHOLD = 5 * 1024; // 5 KB
export async function buildWebviewContent(document, panel) {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    if (!workspaceFolder)
        return "<body>No workspace folder found</body>";
    let html = document.getText();
    const regex = /(href|src)=["'](.+?)["']/g;
    const matches = Array.from(html.matchAll(regex));
    for (const m of matches) {
        const [fullMatch, attr, srcPath] = m;
        try {
            // Always treat srcPath as string
            const pathStr = String(srcPath);
            const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, pathStr);
            // Read file in a browser-compatible way
            const bytes = await vscode.workspace.fs.readFile(fileUri);
            const content = new TextDecoder().decode(bytes);
            // Inline small CSS/JS
            if ((attr === 'href' && pathStr.endsWith('.css')) || (attr === 'src' && pathStr.endsWith('.js'))) {
                if (content.length <= INLINE_THRESHOLD) {
                    if (attr === 'href')
                        html = html.replace(fullMatch, `<style>${content}</style>`);
                    if (attr === 'src')
                        html = html.replace(fullMatch, `<script>${content}</script>`);
                    continue;
                }
            }
            const webviewUri = panel.webview.asWebviewUri(fileUri);
            html = html.replace(fullMatch, `${attr}="${webviewUri.toString()}"`);
        }
        catch {
            html = html.replace(fullMatch, `${attr}="${srcPath}"`);
        }
    }
    html += `<script>
        const vscode = acquireVsCodeApi();
        window.addEventListener('message', event => {
            if(event.data.type === 'reload') location.reload();
        });
    </script>`;
    return html;
}
//# sourceMappingURL=webview.js.map