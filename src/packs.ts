import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

export default class PackManager {

    public storagePath = path.resolve("./storage")
    public packsPath = path.resolve(this.storagePath, "packs")
    public registryPath = path.resolve(this.storagePath, "registry.json")
    public registry: {
        [hash: string]: {
            spigotId: string,
            ip: string,
            lastDownload: number
        }
    } = {}

    constructor() {
        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath)
        }

        if (!fs.existsSync(this.packsPath)) {
            fs.mkdirSync(this.packsPath)
        }

        if (!fs.existsSync(this.registryPath)) {
            fs.writeFileSync(this.registryPath, JSON.stringify({}))
        }

        if (fs.existsSync(this.registryPath)) {
            this.registry = JSON.parse(fs.readFileSync(this.registryPath, "utf8"))
        }

    }

    public register(pack: Buffer, spigotId: string, ip: string) {
        const sha1 = crypto.createHash('sha1')
        sha1.update(pack)
        const hash = sha1.digest('hex')

        const packFile = path.resolve(this.packsPath, hash)
        fs.writeFileSync(packFile, pack)

        this.registry[hash] = {
            spigotId,
            ip,
            lastDownload: Date.now()
        }

        fs.writeFileSync(this.registryPath, JSON.stringify(this.registry))

        return hash
    }

    public fetch(hash: string) {
        const outPath = path.resolve(this.packsPath, hash)
        if (fs.existsSync(outPath)) {
            this.registry[hash].lastDownload = Date.now()
            fs.writeFileSync(this.registryPath, JSON.stringify(this.registry))
            return outPath
        }

        return null
    }

}
