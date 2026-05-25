import multer from "multer";
import path from "node:path";
import fs from "node:fs";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let folder = "uploads";

    // decide folder based on field name
    switch (file.fieldname) {
      case "avatar":
        folder = "avatar";
        break;

      case "logo":
        folder = "business-logo";
        break;

      case "image":
        folder = "services";
        break;
    }

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

export const upload = multer({ storage });