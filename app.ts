// express
import express = require('express');
import bodyParser = require('body-parser')
import {Request, Response} from "express";

// sentry logging
const Sentry = require("@sentry/node");
const Tracing = require("@sentry/tracing");

// mongoose
import mongoose from "mongoose";

try {
    // create a new express application instance
    const app: express.Application = express();

    // ---------- SENTRY Logging ----------
    // initialize sentry logging
    Sentry.init({
        dsn: "https://16df13405aac449c954d777ef14be2e6@o267551.ingest.sentry.io/5516217",
        release: "mcone-storage@" + process.env.npm_package_version,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({tracing: true}),
            // enable Express.js middleware tracing
            new Tracing.Integrations.Express({app}),
        ],
        tracesSampleRate: 1.0
    });

    // use sentry tracing, event- and http request logging
    app.use(Sentry.Handlers.requestHandler());
    app.use(Sentry.Handlers.tracingHandler());
    app.use(Sentry.Handlers.errorHandler());

// ---------- MONGODB ----------
    mongoose.connect('mongodb://mcone-coresystem:Ga8FEcnf33scTUB33Ju4rWfTA1ScHa1m4h86UYtJLmVKIkM0SGhgTsyoe1XMbbGu@db.labor.mcone.eu:27017?authSource=admin', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(r => {
    });

// ---------- ROUTING --------------------
    const {worldRoute} = require("./routes/WorldRoute");
    const {replayRoute} = require("./routes/ReplayRoute");

    app.use(bodyParser.urlencoded({extended: true}))

// default
    app.get('/', (req: Request, res: Response) => {
        res.sendStatus(200);
    });

// custom routes
    app.use('/api/world', worldRoute);
    app.use('/api/replay', replayRoute);

//---------- SERVER --------------------
    app.listen(5000, () => {
        console.log('Example app listening on port 5000!');
    });
} catch (e) {
    if (!process.env.TS_NODE_DEV) {
        Sentry.captureException(e);
    }
}
