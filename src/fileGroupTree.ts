import * as vscode from 'vscode'
import { FileItem } from './FileTreeItem'
import { GroupItem } from './GroupTreeItem'

type TreeItem = FileItem | GroupItem

interface ICreateNewGroupOptions {
    name?: string
    collapsibleState?: vscode.TreeItemCollapsibleState
}

const TEXT_URI_LIST = 'text/uri-list'
export class FileGroupTreeProvider implements vscode.TreeDataProvider<TreeItem>, vscode.TreeDragAndDropController<TreeItem> {
    private static id = 1

    public static readonly MIME_TYPE = 'application/vnd.code.tree.filegroup'

    dropMimeTypes = [TEXT_URI_LIST]
    dragMimeTypes = [TEXT_URI_LIST]

    private _onDidChangeTreeData = new vscode.EventEmitter<TreeItem[] | undefined>()
    onDidChangeTreeData = this._onDidChangeTreeData.event

    private groups: TreeItem[] = []

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element
    }

    getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
        if (!element) {
            if (this.groups.length) {
                return this.groups
            } else {
                const emptyItem: vscode.TreeItem = {
                    iconPath: new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground')),
                    label: 'Drag file(s) into this to create a new group.',
                }
                return [emptyItem] as any
            }
        } else if (element instanceof GroupItem) {
            return element.files
        } else if (element instanceof FileItem) {
            return null
        } else {
            return element as never
        }
    }

    async createNewGroup({ name, collapsibleState }: ICreateNewGroupOptions): Promise<GroupItem | undefined> {
        if (!name) {
            name = await vscode.window.showInputBox({
                title: 'Group Name'
            })
            if (!name) { return }
        }

        const groupTreeItem = new GroupItem(name, `${FileGroupTreeProvider.id++}`, () => {
            this._onDidChangeTreeData.fire([groupTreeItem])
        })
        if (collapsibleState) { groupTreeItem.collapsibleState = collapsibleState }

        this.groups.push(groupTreeItem)
        this._onDidChangeTreeData.fire(undefined)

        return groupTreeItem
    }

    handleDrag(source: TreeItem[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken) {
        treeDataTransfer.set(TEXT_URI_LIST, new vscode.DataTransferItem(source))
    }

    async handleDrop(target: TreeItem | undefined, sources: vscode.DataTransfer, token: vscode.CancellationToken) {
        const transferItem = sources.get('text/uri-list')
        if (!transferItem) {
            return
        }

        const group = target instanceof FileItem
            ? target.parentGroup
            : target ?? await this.createNewGroup({
                collapsibleState: vscode.TreeItemCollapsibleState.Expanded
            });
        if (!group) { return }

        const { value: files } = transferItem
        const isFiles = files instanceof Array && files.every(file => file instanceof FileItem)

        const fileTreeItems = isFiles
            ? files.map(file => file.updatePositionTo(group))
            : (await transferItem.asString())
                .split('\n')
                .map(uriStr => {
                    const uri = vscode.Uri.parse(uriStr)
                    return new FileItem(uri, group)
                })

        group.setFiles(group.files.concat(fileTreeItems))
        this._onDidChangeTreeData.fire([group])
    }
}
