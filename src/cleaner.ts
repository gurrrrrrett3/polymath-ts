import fs from "fs";
import path from "path";
import Config from "./config";
import PackManager from "./packs";

export default class Cleaner {

    static start(packManager: PackManager, config: Config) {
        setInterval(async () => {
            const now = Date.now();
            const toDelete: string[] = [];

            for (const [hash, pack] of Object.entries(packManager.registry)) {
                if (now - pack.lastDownload > config.packLifespan) {
                    toDelete.push(hash);
                }
            }

            for (const hash of toDelete) {
                try {
                    if (config.useS3 && packManager.s3) {
                        const params = {
                            Bucket: config.s3Config.bucketName,
                            Key: hash,
                        };
                        await packManager.s3.deleteObject(params).promise();
                        console.log(`Deleted ${hash} from S3`);
                    } else {
                        const packFile = path.resolve(packManager.packsPath, hash);
                        if (fs.existsSync(packFile)) {
                            fs.unlinkSync(packFile);
                            console.log(`Deleted ${hash} from local storage`);
                        }
                    }
                    delete packManager.registry[hash];
                    fs.writeFileSync(packManager.registryPath, JSON.stringify(packManager.registry));
                } catch (error) {
                    console.error(`Failed to delete ${hash}:`, error);
                }
            }
        }, config.cleanerDelay);
    }
}
