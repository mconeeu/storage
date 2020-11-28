import express, {Request, Response} from "express";
import WorldService from "../services/world/WorldService";
import {StorageService, worldStorage} from "../services/storage/StorageService";
import WorldSchema from "../services/world/WorldSchema";

const multer = require('multer');

export const worldRoute = express.Router();

// POST/UPLOAD world
worldRoute.post('/', multer({storage: worldStorage}).single('document'), async (req: Request, res: Response) => {
    const file = req.file
    const id = req.body.id;
    const tmpFile = StorageService.TMP_FOLDER + "\\" + file.originalname;

    try {
        if (id) {
            let world: any = await WorldSchema.findOne({_id: id}).exec();
            let version: any = [1, 0, 0];
            let versionObj: any;

            // Update world
            if (world) {
                const {increase, author, changelog} = req.body;

                if (file && author && increase && changelog) {
                    const versions = world.versions[world.versions.length - 1];

                    if (versions) {
                        version = versions.version.slice();
                        switch (increase) {
                            case "MAJOR":
                                version[0] = ++version[0];
                                break;
                            case "MINOR":
                                version[1] = ++version[1];
                                break;
                            case "PATCH":
                                version[2] = ++version[2];
                                break;
                        }
                    }

                    versionObj = {
                        version: version,
                        author: author,
                        changelog: changelog,
                        time: (new Date().getTime() / 1000)
                    };

                    world.versions.push(versionObj);

                    await StorageService.move(tmpFile, StorageService.UPLOAD_FOLDER + "\\" + world._id, version.toString().split(",").join("-"))
                        .then(async (result) => {
                            await world.save();
                        }).catch((err) => {
                            res.sendStatus(500);
                        });

                    res.send({
                        name: world.name,
                        _id: id,
                        contributors: world.contributors,
                        version: [versionObj]
                    });
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(404);
            }
        } else {
            res.sendStatus(400);
        }

        StorageService.delete(tmpFile);
    } catch (e) {
        StorageService.delete(tmpFile);
        res.sendStatus(500);
    }
});

// POST/UPLOAD a new world
worldRoute.post('/insert', multer({storage: worldStorage}).single('document'), async (req: Request, res: Response) => {
        const file = req.file
        const id = req.body.id;
        const tmpFile = StorageService.TMP_FOLDER + "\\" + file.originalname;

        try {
            if (!id) {
                const {initiator, name, contributors} = req.body;

                if (initiator && name && contributors) {
                    try {
                        const parsedContributors = JSON.parse(contributors.toString());
                        const version = [1, 0, 0];

                        const world = new WorldSchema({
                            name: name,
                            _id: id,
                            contributors: parsedContributors,
                            versions: [{
                                version: version,
                                author: initiator,
                                changelog: "initial commit",
                                time: (new Date().getTime() / 1000)
                            }]
                        });

                        // move file
                        await StorageService.move(tmpFile, StorageService.UPLOAD_FOLDER + "\\" + world._id, version.toString().split(",").join("-"))
                            .then(async (result) => {
                                await world.save();
                            }).catch((err) => {
                                res.sendStatus(500);
                            });

                        res.send(world);
                    } catch (e) {
                        res.send({
                            result: "couldn't parse contributors to JSON array!"
                        });
                    }
                } else {
                    res.sendStatus(400);
                }
            } else {
                res.sendStatus(409);
            }

            StorageService.delete(tmpFile);
        } catch (e) {
            StorageService.delete(tmpFile);
            res.sendStatus(500);
        }
    }
);


// GET/DOWNLOAD world
worldRoute.get('/', function (req, res) {
    const {id, version} = req.params;

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
