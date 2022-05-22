export class EjectMap<T = unknown> {
    private dataTransFerKey = 1
    private dataTransFerMap = new Map()

    save(value: T): number {
        const key = this.dataTransFerKey++
        this.dataTransFerMap.set(key, value)
        return key
    }

    eject(key?: number): T | undefined {
        if (!key) { return undefined }

        const val = this.dataTransFerMap.get(key)
        this.dataTransFerMap.delete(key)
        return val
    }
}
