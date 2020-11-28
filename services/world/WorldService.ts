import WorldSchema from "./WorldSchema";

class WorldService {

    static async getWolds(): Promise<Object> {
        return WorldSchema.find().exec();
    }

    static async getWorld(id: String): Promise<any> {
        return WorldSchema.findOne({_id: id}).exec();
    }

    static async getWorldsWhereName(name: String): Promise<Object> {
        return WorldSchema.find({name: name}).exec();
    }
}

export default WorldService;
