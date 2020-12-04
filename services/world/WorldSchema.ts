import mongoose, {Schema} from 'mongoose';

const VersionSchema: Schema = new Schema({
    version: Array,
    author: String,
    changelog: String,
    time: Number
}, {
    _id: false,
    minimize: false
});

const WorldSchema: Schema = new Schema({
    _id: String,
    name: String,
    contributors: [String],
    versions: [VersionSchema]
}, {
    _id: false,
    collection: "worlds",
    minimize: false
});

export default mongoose.connection.useDb("mc1cloud").model('worlds', WorldSchema);
