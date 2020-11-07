import fs = require('fs');
import path = require("path");

class StorageService {

    static readonly STORAGE_PATH: string = process.cwd();

    static listEntries(requestPath: string): object {
        const fullPath = path.join(this.STORAGE_PATH, "uploads", requestPath);

        if (fs.existsSync(fullPath)) {
            const entries = fs.readdirSync(fullPath);

            const found: Array<String> = [];

            entries.forEach((entry) => {
                found.push(entry);
            });

            return {
                "result": found
            };
        }

        return {
            "result": 404
        };
    }
}

export {StorageService};
