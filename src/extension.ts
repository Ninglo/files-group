import * as vscode from 'vscode'
import { FileGroupTreeProviderWithDragAndDrog } from './fileGroupTree/treeDragAndDrog'

export function activate(context: vscode.ExtensionContext) {
	const fileGroupTreeProvider = new FileGroupTreeProviderWithDragAndDrog()

	const fileGroupTreeView = vscode.window.createTreeView(
		'fileGroup',
		{
			treeDataProvider: fileGroupTreeProvider,
			dragAndDropController: fileGroupTreeProvider,
			canSelectMany: true,
			showCollapseAll: true
		}
	)
	context.subscriptions.push(fileGroupTreeView)

	context.subscriptions.push(vscode.commands.registerCommand(
		'ninglo.files-group.newGroup',
		async () => {
			fileGroupTreeProvider.createNewGroup({})
		}
	))

	context.subscriptions.push(vscode.commands.registerCommand(
		'ninglo.files-group.remove',
		(item: TreeItem, elements?: TreeItem[]) => {
			if (elements) {
				fileGroupTreeProvider.remove(...elements)
			} else {
				fileGroupTreeProvider.remove(item)
			}
		}
	))
}

export function deactivate() { }
