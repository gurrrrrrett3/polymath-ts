import express from "express";
import fileUpload from "express-fileupload";
import Config from "./config";
import Cleaner from "./cleaner";
import PackManager from "./packs";

const config = new Config();
config.load();

const packManager = new PackManager(config);

Cleaner.start(packManager, config);

const app = express();

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/upload", async (req, res) => {
    const id = req.body.id as string;
    const pack = req.files?.pack as fileUpload.UploadedFile;

    if (!id) {
        return res.status(400).json({ "error": "No id provided" });
    }

    if (!pack) {
        return res.status(400).json({ "error": "No pack provided" });
    }

    const hash = await packManager.register(pack.data, id, (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress) as string);
    const url = `${config.serverUrl}/pack.zip?id=${hash}`;

    res.status(200).json({
        url,
        sha1: hash
    });
});

app.get("/pack.zip", async (req, res) => {
    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({ "error": "No id provided" });
    }

    const pack = await packManager.fetch(id);

    if (!pack) {
        return res.status(404).json({ "error": "No pack found" });
    }

    if (config.useS3) {
        res.setHeader('Content-type', 'application/zip').send(pack as Buffer);
    } else {
        res.setHeader('Content-type', 'application/zip').sendFile(pack as string);
    }
});

app.get("/debug", (req, res) => {
    return res.status(200).send("It seems to be working...");
});

app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
});
