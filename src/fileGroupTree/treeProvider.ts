import * as vscode from 'vscode'
import { EjectMap } from '../utils/ejectMap'
import { FileItem } from './item/FileTreeItem'
import { GroupItem } from './item/GroupTreeItem'

export class FileGroupTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private static id = 1

    protected _onDidChangeTreeData = new vscode.EventEmitter<TreeItem | TreeItem[] | undefined>()
    onDidChangeTreeData = this._onDidChangeTreeData.event

    private groups: TreeItem[] = []

    protected elementMap = new Map<string, TreeItem>()
    getElementById(id: string): TreeItem | undefined {
        return this.elementMap.get(id)
    }

    getTreeItem(element: TreeItem): TreeItem {
        return element
    }

    getChildren(element?: TreeItem): vscode.ProviderResult<TreeItem[]> {
        if (!element) {
            if (this.groups.length) {
                return this.groups
            } else {
                const emptyItem: vscode.TreeItem = {
                    iconPath: new vscode.ThemeIcon('warning', new vscode.ThemeColor('problemsWarningIcon.foreground')),
                    label: 'Drag file(s) into this view to create a new group.',
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

    async createNewGroup({ name, collapsibleState, skipFire }: ICreateNewGroupOptions): Promise<GroupItem | undefined> {
        if (!name) {
            name = await vscode.window.showInputBox({
                title: 'Group Name'
            })
            if (!name) { return }
        }

        const groupTreeItem = new GroupItem(`${FileGroupTreeProvider.id++}`, name)
        this.elementMap.set(groupTreeItem.id, groupTreeItem)
        if (collapsibleState) { groupTreeItem.collapsibleState = collapsibleState }

        this.groups.push(groupTreeItem)
        if (!skipFire) { this._onDidChangeTreeData.fire(undefined) }

        return groupTreeItem
    }

    async remove(...elements: TreeItem[]) {
        let hasGroup = false
        const updateGroups: GroupItem[] = []
        elements.forEach(element => {
            if (element instanceof FileItem) {
                const { parentGroup } = element
                parentGroup.remove(element)
                updateGroups.push(parentGroup)
            } else if (element instanceof GroupItem) {
                this.groups = this.groups.filter(group => group !== element)
                hasGroup = true
            } else { }
        })

        if (hasGroup) {
            this._onDidChangeTreeData.fire(undefined)
        } else if (updateGroups.length) {
            this._onDidChangeTreeData.fire(updateGroups)
        }
    }
}
