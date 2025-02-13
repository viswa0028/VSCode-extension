const vscode = require('vscode');
const axios = require('axios');

const API_KEY = 'AIzaSyB3MDyxXQCFkvmF74RGbq5zmp2joCH-q6I';
const API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + API_KEY;

async function analyzeCode() {  
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        console.log("Editor not activated");
        vscode.window.showErrorMessage("No active editor found!");
        return;
    }

    const code = editor.document.getText();
    const prompt = `Analyse the code and tell me all the errors in it the code is:\n\n${code} and also give a seperate heading suggestions for better output of the code`;

    try {
        const response = await axios.post(API_URL, {
            contents: [{ role: "user", parts: [{ text: prompt }] }]  
        });

        const analysisText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!analysisText) {
            throw new Error("Invalid response format from Gemini API");
        }

        vscode.window.showInformationMessage("Analysis of the code complete.");

        // Create and show markdown content
        const markdownContent = new vscode.MarkdownString(analysisText);
        const doc = await vscode.workspace.openTextDocument({
            content: analysisText,
            language: 'markdown'
        });
        
        // Show the document in a new editor
        await vscode.window.showTextDocument(doc, {
            viewColumn: vscode.ViewColumn.Beside,
            preview: true
        });
        
        // Open the markdown preview
        await vscode.commands.executeCommand('markdown.showPreview', doc.uri);

    } catch (error) {
        console.error("Error details:", error);
        const errorMessage = error.response?.data?.error?.message || error.message;
        vscode.window.showErrorMessage("Error analyzing code: " + errorMessage);
    }
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    let disposable = vscode.commands.registerCommand('Finderrors', analyzeCode);
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};