import fs from "fs";
import path from "path";

export default class Config {
    private config: {
        server: {
            port: number;
            url: string;
        };
        request: {
            maxSize: number;
        };
        cleaner: {
            delay: number;
            packLifespan: number;
        };
        useS3: boolean;
        s3Config: {
            accessKeyId: string;
            secretAccessKey: string;
            region: string;
            bucketName: string;
            endpoint: string;
        };
    } = {
        server: {
            port: 8181,
            url: "http://localhost:8181"
        },
        request: {
            maxSize: 1024 * 1024 * 100 // 100MB
        },
        cleaner: {
            delay: 1000 * 60 * 60 * 6, // 6 hours
            packLifespan: 1000 * 60 * 60 * 24 * 7 // 7 days
        },
        useS3: false,
        s3Config: {
            accessKeyId: "",
            secretAccessKey: "",
            region: "",
            bucketName: "",
            endpoint: ""
        }
    };

    public get serverPort() {
        return this.config.server.port;
    }

    public get serverUrl() {
        return this.config.server.url;
    }

    public get requestMaxSize() {
        return this.config.request.maxSize;
    }

    public get cleanerDelay() {
        return this.config.cleaner.delay;
    }

    public get packLifespan() {
        return this.config.cleaner.packLifespan;
    }

    public get useS3() {
        return this.config.useS3;
    }

    public get s3Config() {
        return this.config.s3Config;
    }

    public load() {
        if (fs.existsSync(path.resolve("./config.json"))) {
            this.config = JSON.parse(fs.readFileSync(path.resolve("./config.json"), "utf8"));
        } else {
            fs.writeFileSync(path.resolve("./config.json"), JSON.stringify(this.config, null, 2));
            console.log("Config file created, please edit it and restart the server");
            process.exit(0);
        }
    }
}
