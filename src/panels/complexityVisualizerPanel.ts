import * as vscode from 'vscode';

export class ComplexityVisualizerPanel {
    public static currentPanel: ComplexityVisualizerPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    }

    public static createOrShow(extensionUri: vscode.Uri, complexity: number, functionComplexities: { [key: string]: number }) {
        const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

        if (ComplexityVisualizerPanel.currentPanel) {
            ComplexityVisualizerPanel.currentPanel._panel.reveal(column);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'complexityVisualizer',
                'Code Complexity Visualization',
                column || vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
                }
            );

            ComplexityVisualizerPanel.currentPanel = new ComplexityVisualizerPanel(panel, extensionUri);
        }

        ComplexityVisualizerPanel.currentPanel._update(complexity, functionComplexities);
    }

    private _update(complexity: number, functionComplexities: { [key: string]: number }) {
        this._panel.webview.postMessage({ command: 'update', complexity, functionComplexities });
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'main.js'));

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Code Complexity Visualization</title>
        </head>
        <body>
            <h1>Code Complexity Visualization</h1>
            <div id="complexity"></div>
            <div id="functionComplexities"></div>
            <script src="${scriptUri}"></script>
        </body>
        </html>`;
    }

    public dispose() {
        ComplexityVisualizerPanel.currentPanel = undefined;
        this._panel.dispose();
        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}