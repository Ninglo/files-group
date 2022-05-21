import * as vscode from 'vscode';
import { FileGroupTreeProvider } from './fileGroupTree';

export function activate(context: vscode.ExtensionContext) {
	const fileGroupTreeProvider = new FileGroupTreeProvider();

	context.subscriptions.push(vscode.window.createTreeView(
		'fileGroup',
		{
			treeDataProvider: fileGroupTreeProvider,
			dragAndDropController: fileGroupTreeProvider,
			canSelectMany: true,
			showCollapseAll: true
		},
	))

	context.subscriptions.push(vscode.commands.registerCommand(
		'files-group.newGroup',
		async () => {
			fileGroupTreeProvider.createNewGroup({})
		}
	))
}

export function deactivate() { }
