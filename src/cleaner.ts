import fs from "fs";
import path from "path";
import Config from "./config";
import PackManager from "./packs";

export default class Cleaner {

    public static start(packManager: PackManager, config: Config) {
        setInterval(() => {
            this.clean(packManager, config)
        }, config.cleanerDelay)
    }

    public static async clean(packManager: PackManager, config: Config) {
        const now = Date.now();
        for (const hash in packManager.registry) {
            if (now - packManager.registry[hash].lastDownload > config.packLifespan) {
                if (config.useS3 && packManager.s3) {
                    // Delete from S3
                    await packManager.s3.deleteObject({
                        Bucket: config.s3Config.bucketName,
                        Key: hash
                    }).promise();
                } else {
                    // Delete from local storage
                    const filePath = path.resolve(packManager.packsPath, hash);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                    }
                }
                delete packManager.registry[hash];
            }
        }

        if (!config.useS3) {
            for (const file of fs.readdirSync(packManager.packsPath)) {
                const filePath = path.resolve(packManager.packsPath, file);
                if (!fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }

                if (!packManager.registry[file]) {
                    fs.unlinkSync(filePath);
                }
            }
        }

        // Save the updated registry
        fs.writeFileSync(packManager.registryPath, JSON.stringify(packManager.registry));
    }
}
