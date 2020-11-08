import mongoose, {Schema} from 'mongoose';

const WorldsSchema: Schema = new Schema({
    name: String,
    uuid: String,
    contributors: Array,
    versions: [{
        version: String,
        author: String,
        changelog: String,
        time: String
    }]
});

export default mongoose.model('worlds', WorldsSchema);
