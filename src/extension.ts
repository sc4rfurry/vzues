import * as vscode from 'vscode';
import { PythonAnalyzer } from './analyzers/pythonAnalyzer';
import { ComplexityVisualizerPanel } from './panels/complexityVisualizerPanel';

export function activate(context: vscode.ExtensionContext) {
	// show a message in the output channel
	vscode.window.createOutputChannel('vZeus').appendLine('vZeus is now active!');
	const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000);
	statusBarItem.text = 'vZeus: Ready';
	statusBarItem.show();

	// register the command to analyze the complexity
    let disposable = vscode.commands.registerCommand('vzeus.analyzeComplexity', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'python') {
                statusBarItem.text = 'vZeus: Analyzing...';
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Analyzing Python code complexity...",
                    cancellable: false
                }, async (progress) => {
                    try {
                        const analyzer = new PythonAnalyzer();
                        progress.report({ increment: 50, message: "Calculating complexity metrics..." });
                        const complexityData = await analyzer.analyzeComplexity(document);
                        progress.report({ increment: 50, message: "Generating visualization..." });
                        ComplexityVisualizerPanel.createOrShow(context.extensionUri, complexityData);
                        statusBarItem.text = 'vZeus: Ready';
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        vscode.window.showErrorMessage(`Failed to analyze code complexity: ${errorMessage}`);
                        statusBarItem.text = 'vZeus: Error';
                    }
                });
            } else {
                vscode.window.showWarningMessage('vZeus: Unsupported language. Only Python is currently supported.');
            }
        } else {
            vscode.window.showErrorMessage('vZeus: No active editor found');
        }
    });

    context.subscriptions.push(disposable, statusBarItem);
}

export function deactivate() {}