import * as vscode from 'vscode'
import { FileItem } from "./fileGroupTree/item/FileTreeItem"
import { GroupItem } from "./fileGroupTree/item/GroupTreeItem"

declare global {
    type TreeItem = FileItem | GroupItem

    interface ICreateNewGroupOptions {
        name?: string
        collapsibleState?: vscode.TreeItemCollapsibleState
        skipFire?: boolean
    }
}
