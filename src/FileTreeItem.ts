import * as vscode from 'vscode';
import { GroupItem } from "./GroupTreeItem";

export class FileItem implements vscode.TreeItem {
    collapsibleState = vscode.TreeItemCollapsibleState.None;
    command: vscode.Command;

    constructor(
        public readonly resourceUri: vscode.Uri,
        public parentGroup: GroupItem
    ) {
        this.command = {
            title: '',
            command: 'vscode.open',
            arguments: [resourceUri]
        };
    }

    updatePositionTo(newParentGroup: GroupItem) {
        this.parentGroup.remove(this);

        newParentGroup.append(this);
        this.parentGroup = newParentGroup;

        return this;
    }
}
