import * as vscode from 'vscode';
import { PythonAnalyzer } from './analyzers/pythonAnalyzer';
import { ComplexityVisualizerPanel } from './panels/complexityVisualizerPanel';

export function activate(context: vscode.ExtensionContext) {
	// show a message in the output channel
	vscode.window.createOutputChannel('vZeus').appendLine('vZeus is now active!');
	// display a message in the status bar
	vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 10000).text = 'vZeus is active';
	// register the command to analyze the complexity
    let disposable = vscode.commands.registerCommand('vzeus.analyzeComplexity', async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'python') {
                vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Analyzing code complexity...",
                    cancellable: false
                }, async (progress) => {
                    try {
                        const analyzer = new PythonAnalyzer();
                        progress.report({ increment: 30, message: "Calculating overall complexity..." });
                        const complexity = await analyzer.analyzeCyclomaticComplexity(document);
                        progress.report({ increment: 30, message: "Analyzing function complexities..." });
                        const functionComplexities = await analyzer.analyzeFunctionComplexities(document);
                        progress.report({ increment: 40, message: "Generating visualization..." });
                        ComplexityVisualizerPanel.createOrShow(context.extensionUri, complexity, functionComplexities);
                    } catch (error: unknown) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        vscode.window.showErrorMessage(`Failed to analyze code complexity: ${errorMessage}`);
                    }
                });
            } else {
                vscode.window.showWarningMessage('Unsupported language. Only Python is currently supported.');
            }
        } else {
            vscode.window.showErrorMessage('No active editor found');
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}