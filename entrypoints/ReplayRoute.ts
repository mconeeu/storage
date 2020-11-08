import express, {Request, Response} from "express";

export const replayRoute = express.Router();

replayRoute.get('/', (req: Request, res: Response) => {
    res.sendStatus(200);
});

