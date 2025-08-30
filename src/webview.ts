import * as vscode from 'vscode';

const INLINE_THRESHOLD = 5 * 1024; // 5 KB

export async function buildWebviewContent(
    document: vscode.TextDocument,
    panel: vscode.WebviewPanel
): Promise<string> {
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);

    let html = document.getText();
    const regex = /(href|src)=["'](.+?)["']/g;
    const matches = Array.from(html.matchAll(regex));

    for (const m of matches) {
        const [fullMatch, attr, srcPath] = m;
        try {
            const pathStr = String(srcPath);
            let content: string | undefined;
            let webviewUriStr = pathStr;

            // Desktop: read file from workspace.fs
            if (workspaceFolder && vscode.env.uiKind === vscode.UIKind.Desktop) {
                const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, pathStr);
                const bytes = await vscode.workspace.fs.readFile(fileUri);
                content = new TextDecoder().decode(bytes);
                webviewUriStr = panel.webview.asWebviewUri(fileUri).toString();
            }

            // Inline small CSS/JS if available
            if (content && ((attr === 'href' && pathStr.endsWith('.css')) || (attr === 'src' && pathStr.endsWith('.js')))) {
                if (content.length <= INLINE_THRESHOLD) {
                    html = attr === 'href'
                        ? html.replace(fullMatch, `<style>${content}</style>`)
                        : html.replace(fullMatch, `<script>${content}</script>`);
                    continue;
                }
            }

            html = html.replace(fullMatch, `${attr}="${webviewUriStr}"`);
        } catch {
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