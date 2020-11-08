import express, {Request, Response} from "express";
import {StorageService} from "../services/StorageService";
import Storage from "../services/Storage";

const multer = require('multer');

export const storageEntrypoint = express.Router();

storageEntrypoint.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

storageEntrypoint.get('/:path', (req: Request, res: Response) => {
    const path = req.params.path;
    if (path) {
        res.send(StorageService.listEntries(path));
    } else {
        res.sendStatus(400);
    }
});

storageEntrypoint.post('/upload/:path', multer({storage: Storage}).single('entry'), (req, res, next) => {
    if (req.params.path) {
        const file = req.file
        if (!file) {
            return next(400);
        }

        res.send(file);
    } else {
        res.sendStatus(400);
    }
});

storageEntrypoint.get('/download/:path', function (req, res) {
    const path = req.params.path;
    if (path) {
        res.download(StorageService.STORAGE_PATH + path);
    } else {
        res.sendStatus(400);
    }
});
