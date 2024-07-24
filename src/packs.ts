import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import Config from './config';

export default class PackManager {
    public storagePath = path.resolve("./storage");
    public packsPath = path.resolve(this.storagePath, "packs");
    public registryPath = path.resolve(this.storagePath, "registry.json");
    public registry: {
        [hash: string]: {
            spigotId: string,
            ip: string,
            lastDownload: number;
        };
    } = {};
    public s3?: AWS.S3;
    private config: Config;

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

        if (config.useS3) {
            try {
                this.s3 = new AWS.S3({
                    accessKeyId: config.s3Config.accessKeyId,
                    secretAccessKey: config.s3Config.secretAccessKey,
                    region: config.s3Config.region,
                    endpoint: config.s3Config.endpoint,
                    s3ForcePathStyle: true,
                    httpOptions: {
                        timeout: 10000,
                    },
                });
            } catch (error) {
                console.error("Error initializing S3:", error);
            }
        }
    }

    public async register(pack: Buffer, spigotId: string, ip: string): Promise<string | null> {
        const sha1 = crypto.createHash('sha1');
        sha1.update(pack);
        const hash = sha1.digest('hex');
    
        if (this.config.useS3 && this.s3) {
            try {
                const params = {
                    Bucket: this.config.s3Config.bucketName,
                    Key: hash,
                    Body: pack
                };
                await this.s3.upload(params).promise();
                // Update the registry after upload
                this.registry[hash] = {
                    spigotId,
                    ip,
                    lastDownload: Date.now()
                };
                fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                return hash;
            } catch (error) {
                console.error("Error uploading to S3:", error);
                return null;
            }
        } else {
            try {
                const packFile = path.resolve(this.packsPath, hash);
                fs.writeFileSync(packFile, pack);
                // Update the registry
                this.registry[hash] = {
                    spigotId,
                    ip,
                    lastDownload: Date.now()
                };
                fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                return hash;
            } catch (error) {
                console.error("Error saving pack to local storage:", error);
                return null;
            }
        }
    }    

    public async fetch(hash: string): Promise<string | null> {
        if (this.config.useS3 && this.s3) {
            try {
                const params = {
                    Bucket: this.config.s3Config.bucketName,
                    Key: hash,
                };
                await this.s3.headObject(params).promise();
                this.registry[hash].lastDownload = Date.now();
                fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                return hash;
            } catch (error) {
                console.error("Error fetching from S3:", error);
                return null;
            }
        } else {
            try {
                const outPath = path.resolve(this.packsPath, hash);
                if (fs.existsSync(outPath)) {
                    this.registry[hash].lastDownload = Date.now();
                    fs.writeFileSync(this.registryPath, JSON.stringify(this.registry));
                    return outPath;
                } else {
                    return null;
                }
            } catch (error) {
                console.error("Error fetching from local storage:", error);
                return null;
            }
        }
    }
}
