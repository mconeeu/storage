import express, {Request, Response} from "express";
import {ReplayService} from "../services/replay/ReplayService";

export const replayEntrypoint = express.Router();

replayEntrypoint.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});
