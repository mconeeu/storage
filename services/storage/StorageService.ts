import fs = require('fs');
import path = require("path");

const multer = require('multer');
const worldStorage = multer.diskStorage({
    destination: function (req: any, file: any, cb: any) {
        cb(null, 'upload/tmp')
    },
    filename: function (req: any, file: any, cb: any) {
        cb(null, file.originalname);
    }
});

class StorageService {

    static readonly STORAGE_PATH: any = process.cwd();
    static readonly UPLOAD_FOLDER: any = StorageService.STORAGE_PATH;
    static readonly TMP_FOLDER: any = StorageService.UPLOAD_FOLDER + "\\tmp";

    static listEntries(requestPath: string): object {
        const fullPath = path.join(this.UPLOAD_FOLDER, "upload", requestPath);

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

    static async move(source: string, destination: string, fileName: string): Promise<any> {
        if (fs.existsSync(source)) {
            if (!fs.existsSync(destination)) {
                await fs.mkdirSync(destination);
            }

            await fs.copyFileSync(source, path.join(destination, fileName));
        }
    }

    static delete(path: string): void {
        fs.unlinkSync(path);
    }

    static existPath(path: string): boolean {
        return fs.existsSync(path);
    }
}

export {StorageService, worldStorage};
