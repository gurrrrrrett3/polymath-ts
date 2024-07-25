import fs from "fs"
import path from "path"

export default class Config {

    private config: {
        server: {
            port: number
            url: string
        },
        request: {
            maxSize: number
        },
        cleaner: {
            delay: number
            packLifespan: number
        }
    } = {
            server: {
                port: Number(process.env.SERVER_PORT) || 8080,
                url: process.env.SERVER_URL || "http://localhost:8080"
            },
            request: {
                maxSize: Number(process.env.REQUEST_MAXSIZE) || (1024 * 1024 * 100) // 100MB
            },
            cleaner: {
                delay: Number(process.env.CLEANER_DELAY) || 1000 * 60 * 60 * 6, // 6 hours 
                packLifespan: Number(process.env.CLEANER_PACKLIFESPAN) || 1000 * 60 * 60 * 24 * 7 // remove a pack after 7 days without downloads
            }
        }

    public get serverPort() {
        return this.config.server.port
    }

    public get serverUrl() {
        return this.config.server.url
    }

    public get requestMaxSize() {
        return this.config.request.maxSize
    }

    public get cleanerDelay() {
        return this.config.cleaner.delay
    }

    public get packLifespan() {
        return this.config.cleaner.packLifespan
    }

    public load() {
        if (fs.existsSync(path.resolve("./config.json"))) {
            this.config = JSON.parse(fs.readFileSync(path.resolve("./config.json"), "utf8"))
        } else {
            fs.writeFileSync(path.resolve("./config.json"), JSON.stringify(this.config, null, 2))
            console.log("Config file created, please edit it and restart the server")
            process.exit(0)
        }
    }

}