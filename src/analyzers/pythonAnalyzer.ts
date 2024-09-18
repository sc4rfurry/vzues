import * as vscode from 'vscode';

export class PythonAnalyzer {
    async analyzeCyclomaticComplexity(document: vscode.TextDocument): Promise<number> {
        try {
            const text = document.getText();
            return this.calculateComplexity(text);
        } catch (error) {
            console.error('Error in analyzeCyclomaticComplexity:', error);
            throw new Error('Failed to analyze cyclomatic complexity');
        }
    }

    async analyzeFunctionComplexities(document: vscode.TextDocument): Promise<{ [key: string]: number }> {
        try {
            const text = document.getText();
            const functionRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g;
            const functionComplexities: { [key: string]: number } = {};
            
            let match;
            while ((match = functionRegex.exec(text)) !== null) {
                const functionName = match[1];
                const functionBody = this.extractFunctionBody(text, match.index);
                functionComplexities[functionName] = this.calculateComplexity(functionBody);
            }

            return functionComplexities;
        } catch (error) {
            console.error('Error in analyzeFunctionComplexities:', error);
            throw new Error('Failed to analyze function complexities');
        }
    }

    private calculateComplexity(code: string): number {
        let complexity = 1;
        const patterns = [
            /if\s+/g,
            /elif\s+/g,
            /else:/g,
            /for\s+/g,
            /while\s+/g,
            /except\s+/g,
            /finally:/g,
            /\?/g, // Ternary operator in Python 3.10+
        ];

        patterns.forEach(pattern => {
            const matches = code.match(pattern);
            if (matches) {
                complexity += matches.length;
            }
        });

        return complexity;
    }

    private extractFunctionBody(text: string, startIndex: number): string {
        let braceCount = 0;
        let endIndex = startIndex;
        
        for (let i = startIndex; i < text.length; i++) {
            if (text[i] === ':') {
                braceCount++;
            } else if (text[i] === '\n' && text[i + 1] !== ' ' && text[i + 1] !== '\t') {
                braceCount--;
            }
            
            if (braceCount === 0) {
                endIndex = i;
                break;
            }
        }
        
        return text.substring(startIndex, endIndex);
    }
}