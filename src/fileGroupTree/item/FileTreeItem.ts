import * as vscode from 'vscode'
import { GroupItem } from './GroupTreeItem'

export class FileItem implements vscode.TreeItem {
    command: vscode.Command
    contextValue: string

    constructor(
        public readonly resourceUri: vscode.Uri,
        public parentGroup: GroupItem
    ) {
        this.contextValue = resourceUri.toString()
        this.command = {
            title: '',
            command: 'vscode.open',
            arguments: [resourceUri]
        }
    }

    updatePositionTo(newParentGroup: GroupItem) {
        this.parentGroup.remove(this)
        this.parentGroup = newParentGroup
        newParentGroup.append(this)

        return this
    }
}
