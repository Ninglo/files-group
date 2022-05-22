import * as vscode from 'vscode'
import { FileItem } from './FileTreeItem'

export class GroupItem implements vscode.TreeItem {
    collapsibleState = vscode.TreeItemCollapsibleState.Expanded
    contextValue: string

    files: FileItem[] = []

    constructor(
        public readonly id: string,
        public readonly label: string
    ) {
        this.contextValue = id
    }

    remove(removeFile: FileItem) {
        const filtedFiles = this.files.filter(file => file !== removeFile)

        this.files = filtedFiles
    }

    appendOne(appendFile: FileItem) {
        if (this.files.some(file => file.resourceUri.toString() === appendFile.resourceUri.toString())) { return }

        this.files = this.files.concat(appendFile)
    }

    append(...appendFiles: FileItem[]) {
        appendFiles.forEach(file => this.appendOne(file))
    }

    appendAfter(beforeFile: FileItem | undefined, ...appendFiles: FileItem[]) {
        if (!beforeFile || !this.files.includes(beforeFile)) {
            this.append(...appendFiles)
            return
        }

        const filtedFiles = this.files.filter(file => !appendFiles.includes(file))
        const i = filtedFiles.indexOf(beforeFile)

        this.files = [
            ...filtedFiles.slice(0, i + 1),
            ...appendFiles,
            ...filtedFiles.slice(i + 1, filtedFiles.length)
        ]
    }
}
