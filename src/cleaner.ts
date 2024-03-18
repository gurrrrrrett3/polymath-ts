import fs from "fs"
import path from "path"
import Config from "./config";
import PackManager from "./packs";


export default class Cleaner {

    public static start(packManager: PackManager, config: Config) {
        setInterval(() => {
            this.clean(packManager, config)
        }, config.cleanerDelay)
    }

    public static clean(packManager: PackManager, config: Config) {
        const now = Date.now()
        for (const hash in packManager.registry) {
            if (now - packManager.registry[hash].lastDownload > config.packLifespan) {
                delete packManager.registry[hash]
            }
        }

        for (const file in fs.readdirSync(packManager.packsPath)) {
            if (!fs.existsSync(path.resolve(packManager.packsPath, file))) {
                fs.unlinkSync(path.resolve(packManager.packsPath, file))
            }

            if (!packManager.registry[file]) {
                fs.unlinkSync(path.resolve(packManager.packsPath, file))
            }
        }
    }
}