import * as vscode from 'vscode';
import { FileItem } from './FileTreeItem';

export class GroupItem implements vscode.TreeItem {
    collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;

    private _files: FileItem[] = [];
    get files() {
        return this._files;
    }
    setFiles(files: FileItem[]) {
        this._files = files;
        this.onDidChange();
    }

    constructor(
        public readonly label: string,
        public readonly id: string,
        private readonly onDidChange: () => void
    ) { }

    remove(removeFile: FileItem) {
        const filtedFiles = this.files.filter(file => file !== removeFile);
        this.setFiles(filtedFiles);
    }

    append(appendFile: FileItem) {
        if (this.files.some(file => file.resourceUri === appendFile.resourceUri)) { return; }

        this.setFiles(this.files.concat(appendFile));
    }
}
