import express, {Request, Response} from "express";
import WorldService from "../services/world/WorldService";
import {StorageService, worldStorage} from "../services/storage/StorageService";
import WorldSchema from "../services/world/WorldSchema";

const multer = require('multer');

export const worldRoute = express.Router();

// POST/UPLOAD world
worldRoute.post('/', multer({storage: worldStorage}).single('document'), async (req: Request, res: Response) => {
    const file = req.file
    const id = req.headers.id;

    try {
        if (id) {
            let world: any = await WorldSchema.findOne({w_id: id}).exec();
            let version: any = [1, 0, 0];

            // Update world
            if (world) {
                const {increase, author, changelog} = req.headers;

                if (file && author && increase && changelog) {
                    if (world) {
                        const versions = world.versions[world.versions.length - 1];

                        if (versions) {
                            version = versions.version.slice();
                            switch (increase) {
                                case "MAJOR":
                                    version[0] = ++version[0];
                                    break;
                                case "MINOR":
                                    if (version[1] >= 9) {
                                        version[0] = ++version[0];
                                    } else {
                                        version[1] = ++version[1];
                                    }

                                    break;
                                case "PATCH":
                                    if (version[2] == 9) {
                                        version[2] = 0;

                                        if (version[1] == 9) {
                                            version[1] = 0;
                                            version[0] = ++version[0];
                                        } else {
                                            version[1] = ++version[0];
                                        }
                                    } else {
                                        version[2] = ++version[2];
                                    }

                                    break;
                            }
                        }

                        world.versions.push({
                            version: version,
                            author: author,
                            changelog: changelog,
                            time: (new Date().getTime() / 1000)
                        });
                    }
                } else {
                    StorageService.delete(StorageService.TMP_FOLDER + "\\" + file.originalname);
                    res.sendStatus(400);
                    return;
                }
            } else {
                const {initiator, name, contributors} = req.headers;

                if (initiator && name && contributors) {
                    try {
                        const parsedContributors = JSON.parse(contributors.toString());

                        world = new WorldSchema({
                            name: name,
                            w_id: id,
                            contributors: parsedContributors,
                            versions: [{
                                version: version,
                                author: initiator,
                                changelog: "initial commit",
                                time: (new Date().getTime() / 1000)
                            }]
                        });
                    } catch (e) {
                        res.send({
                            result: "couldn't parse contributors to JSON array!"
                        });

                        return;
                    }
                } else {
                    StorageService.delete(StorageService.TMP_FOLDER + "\\" + file.originalname);
                    res.sendStatus(400);
                    return;
                }
            }

            // move file
            const tmpFile = StorageService.TMP_FOLDER + "\\" + file.originalname;
            await StorageService.move(tmpFile, StorageService.UPLOAD_FOLDER + "\\" + world.w_id, version.toString().split(",").join("-"))
                .then(async (result) => {
                    await world.save();
                }).catch((err) => {
                    res.sendStatus(500);
                });

            StorageService.delete(tmpFile);

            res.send({
                result: world
            });
            return;
        }

        // BAD REQUEST
        res.sendStatus(400);
    } catch (e) {
        StorageService.delete(StorageService.TMP_FOLDER + "\\" + file.originalname);
        res.sendStatus(500);
    }
});


// GET/DOWNLOAD world
worldRoute.get('/', function (req, res) {
    const {id, version} = req.headers;

    if (id && version) {
        try {
            const versionArray = JSON.parse(version.toString());
            const path = StorageService.UPLOAD_FOLDER + "\\" + id + "\\" + versionArray.toString().split(",").join("-")
            if (StorageService.existPath(path)) {
                res.download(path);
            } else {
                res.sendStatus(404);
            }
        } catch (e) {
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
})
;

// GET all locally stored worlds
worldRoute.get('/local', (req: Request, res: Response) => {
    const path = req.params.path;
    if (path) {
        res.send(StorageService.listEntries(path));
    } else {
        res.sendStatus(400);
    }
});


// GET all worlds in the database
worldRoute.get('/worlds', (req: Request, res: Response) => {
    WorldService.getWolds().then((result) => {
        if (result) {
            res.send(result);
        } else {
            res.sendStatus(404);
        }
    }).catch((e) => {
        res.sendStatus(500);
    });
});

// GET world by id
worldRoute.get('/:id', (req: Request, res: Response) => {
    const id = req.params.id;
    if (id) {
        WorldService.getWorld(id).then((result) => {
            if (result) {
                res.send(result);
            } else {
                res.sendStatus(404);
            }
        }).catch((e) => {
            res.sendStatus(500);
        });
    } else {
        res.sendStatus(400);
    }
});
