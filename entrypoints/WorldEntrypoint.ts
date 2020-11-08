import express, {Request, Response} from "express";
import {WorldService} from "../services/world/WorldService";

export const worldEntrypoint = express.Router();

worldEntrypoint.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

worldEntrypoint.get('/worlds', (req: Request, res: Response) => {
    WorldService.getWolds().then((result) => {
        res.send(result);
    }).catch((e) => {
        res.sendStatus(400);
    });
});

worldEntrypoint.get('/world:id', (req: Request, res: Response) => {
    const id = req.params.id;
    if (id) {
        WorldService.getWorld(id).then((result) => {
            res.send(result);
        }).catch((e) => {
            res.sendStatus(400);
        });
    } else {
        res.sendStatus(400);
    }
});

worldEntrypoint.get('/worlds:name', (req: Request, res: Response) => {
    const name = req.params.name;
    if (name) {
        WorldService.getWorldsWhereName(name).then((result) => {
            res.send(result);
        }).catch((e) => {
            res.sendStatus(400);
        });
    } else {
        res.sendStatus(400);
    }
});
