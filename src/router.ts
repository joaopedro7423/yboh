import { Request, Response, Router } from "express";

import multer from "multer";

const multerConfit = multer();

const router = Router();

router.post(
  "/arquivo",
  multerConfit.single("file"),
  (request: Request, response: Response) => {
    console.log(request.file?.buffer.toString("utf-8"));
    return response.send();
  }
);

export default router;
