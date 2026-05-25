import multer from "multer"
import path from "node:path";
import fs from "node:fs";


const createStorage = (folder: string) => {
  return multer.diskStorage({
    destination: function (_req, _file, cb) {
      const dir = `./public/${folder}`;

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: function (_req, file, cb) {
      const uniqueName =
        Date.now() + path.extname(file.originalname);

      cb(null, uniqueName);
    },
  });
};

export const serviceUpload = multer({
  storage: createStorage("services"),
});

export const avatarUpload = multer({
  storage: createStorage("avatar"),
});
