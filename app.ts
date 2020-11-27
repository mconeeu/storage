// express
import express = require('express');
import bodyParser = require('body-parser')
import {Request, Response} from "express";

require('dotenv').config()

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
        dsn: process.env.SENTRY_DSN,
        release: process.env.RELEASE,
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
    mongoose.connect(process.env.MONGODB_URL as string, {
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
