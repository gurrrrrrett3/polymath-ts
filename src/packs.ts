import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import AWS from 'aws-sdk';
import Config from './config';

export default class PackManager {
    private config: Config;
    public s3?: AWS.S3;

    public storagePath = path.resolve("./storage");
    public packsPath = path.resolve(this.storagePath, "packs");
    public registryPath = path.resolve(this.storagePath, "registry.json");
    public registry: {
        [hash: string]: {
            spigotId: string,
            ip: string,
            lastDownload: number
        }
    } = {};

    constructor(config: Config) {
        this.config = config;

        if (!fs.existsSync(this.storagePath)) {
            fs.mkdirSync(this.storagePath);
        }

        if (!fs.existsSync(this.packsPath)) {
            fs.mkdirSync(this.packsPath);
        }

        if (!fs.existsSync(this.registryPath)) {
            fs.writeFileSync(this.registryPath, JSON.stringify({}));
        }

        if (fs.existsSync(this.registryPath)) {
            this.registry = JSON.parse(fs.readFileSync(this.registryPath, "utf8"));
        }

        if (this.config.useS3) {
            AWS.config.update({
                accessKeyId: this.config.s3Config.accessKeyId,
                secretAccessKey: this.config.s3Config.secretAccessKey,
                region: this.config.s3Config.region
            });
            this.s3 = new AWS.S3();
        }
    }

    public async register(pack: Buffer, spigotId: string, ip: string): Promise<string> {
        const sha1 = crypto.createHash('sha1');
        sha1.update(pack);
        const hash = sha1.digest('hex');

        if (this.config.useS3 && this.s3) {
            await this.s3.upload({
                Bucket: this.config.s3Config.bucketName,
                Key: hash,
                Body: pack
            }).promise();
        } else {
            const packFile = path.resolve(this.packsPath, hash);
            fs.writeFileSync(packFile, pack);
        }

        this.registry[hash] = {
            spigotId,
            ip,
            lastDownload: Date.now()
        };

        fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));

        return hash;
    }

    public async fetch(hash: string): Promise<string | Buffer | null> {
        if (this.config.useS3 && this.s3) {
            try {
                const data = await this.s3.getObject({
                    Bucket: this.config.s3Config.bucketName,
                    Key: hash
                }).promise();
                this.registry[hash].lastDownload = Date.now();
                fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                return data.Body as Buffer;
            } catch (err) {
                return null;
            }
        } else {
            const outPath = path.resolve(this.packsPath, hash);
            if (fs.existsSync(outPath)) {
                this.registry[hash].lastDownload = Date.now();
                fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                return outPath;
            }
            return null;
        }
    }
}
