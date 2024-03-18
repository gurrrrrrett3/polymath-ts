import express, { json } from "express";
import fileUpload from "express-fileupload";
import PackManager from "./packs";
import Config from "./config";
import Cleaner from "./cleaner";

const config = new Config();
const packManager = new PackManager();

config.load();

Cleaner.start(packManager, config);

const app = express();

app.use(fileUpload());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 *  Allow to upload a resourcepack with a spigot id

    Test: curl -F "pack=@./file.zip" -F "id=EXAMPLE" -X POST http://localhost:8080/upload

           Returns:
               pack (web.json_response): Pack url and its SHA1 hash
 */
app.post("/upload", async (req, res) => {

    // id is formencoded 

    const id = req.body.id as string;
    const pack = req.files?.pack as fileUpload.UploadedFile;

    if (!id) {
        return res.status(200).json({"error": "This license has been disabled"})
    }

    if (!pack) {
        return res.status(400).json({"error": "No pack provided"})
    }

    const hash = packManager.register(pack.data, id, (req.headers["x-forwarded-for"] || req.headers["x-real-ip"] || req.socket.remoteAddress) as string);
    const url = `${config.serverUrl}/pack.zip?id=${hash}`
    
    res.status(200).json({
        url,
        sha1: hash
    });
})

/**
 *  Allow to download a resourcepack with a spigot id

    Test: curl -X GET http://localhost:8080/pack.zip?id=EXAMPLE

           Returns:
               pack (web.download): The resourcepack
 */
app.get("/pack.zip", (req, res) => {
    const id = req.query.id as string;

    if (!id) {
        return res.status(400).json({"error": "No id provided"})
    }

    const pack = packManager.fetch(id);

    if (!pack) {
        return res.status(404).json({"error": "No pack found"})
    }

    res.setHeader('Content-type', 'application/zip').sendFile(pack);
})

app.get("/debug", (req, res) => {
    return res.status(200).send("It seems to be working...")
})

app.listen(config.serverPort, () => {
    console.log(`Server is running on port ${config.serverPort}`);
})