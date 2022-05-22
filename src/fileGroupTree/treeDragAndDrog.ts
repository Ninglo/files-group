import * as vscode from 'vscode'
import { EjectMap } from '../utils/ejectMap';
import { FileItem } from './item/FileTreeItem';
import { GroupItem } from './item/GroupTreeItem';
import { FileGroupTreeProvider } from "./treeProvider";

const TEXT_URI_LIST = 'text/uri-list' as const
export class FileGroupTreeProviderWithDragAndDrog extends FileGroupTreeProvider implements vscode.TreeDragAndDropController<TreeItem> {

    public static readonly MIME_TYPE = 'application/vnd.code.tree.filegroup'

    dropMimeTypes = [TEXT_URI_LIST] as const
    dragMimeTypes = [TEXT_URI_LIST] as const

    dataTransferMap = new EjectMap<TreeItem[]>()

    handleDrag(source: TreeItem[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken) {
        const key = this.dataTransferMap.save(source)
        treeDataTransfer.set(FileGroupTreeProviderWithDragAndDrog.MIME_TYPE, new vscode.DataTransferItem(key))
    }

    async handleDrop(target: TreeItem | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken) {
        const curtTreeData = sources.get(FileGroupTreeProviderWithDragAndDrog.MIME_TYPE)
        const filesOrUrisStr = curtTreeData
            ? this.dataTransferMap.eject(curtTreeData.value) as FileItem[] // TODO
            : await sources.get(TEXT_URI_LIST)?.asString()
        if (!filesOrUrisStr) { return }
        if (!target && filesOrUrisStr instanceof Array && filesOrUrisStr?.some(file => file instanceof GroupItem)) { return }

        const groupItem = target instanceof FileItem
            ? target.parentGroup
            : target ?? await this.createNewGroup({
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
                skipFire: true,
            });
        if (!groupItem) { return }

        const fileTreeItems = filesOrUrisStr instanceof Array
            ? filesOrUrisStr
                .map(file => file.updatePositionTo(groupItem))
            : filesOrUrisStr
                .split('\n')
                .map(uriStr => {
                    const uri = vscode.Uri.parse(uriStr)
                    const file = new FileItem(uri, groupItem)
                    this.elementMap.set(file.resourceUri.toString(), file)
                    return file
                })

        target instanceof FileItem
            ? groupItem.appendAfter(target, ...fileTreeItems)
            : groupItem.append(...fileTreeItems)
        this._onDidChangeTreeData.fire(undefined)
    }
}