import { Request, Response, Router } from "express";
import { Readable } from "stream";
import multer from "multer";
import readline from "readline";
import { client } from "./database/client";

const multerConfit = multer();

const router = Router();

interface Users {
  id: string;
  name: string;
  jobArea: string;
  createdAts?: string;
  deletedAts?: any;
}

router.post(
  "/arquivo",
  multerConfit.single("file"),
  async (request: Request, response: Response) => {
    const { file } = request;
    const buffer = file?.buffer;

    const readableFile = new Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    const userLine = readline.createInterface({
      input: readableFile,
    });

    const users: Users[] = [];

    for await (let line of userLine) {
      const lineSplit = line.split(";");
      users.push({
        id: lineSplit[0],
        name: lineSplit[1],
        jobArea: lineSplit[2],
        createdAts: lineSplit[3] as string,
        deletedAts: lineSplit[4] as string,
      });
    }

    for await (let user of users) {
      await client.users.create({
        data: {
          id: user.id,
          name: user.name,
          jobArea: user.jobArea,
          cratedAts: user.createdAts,
          deletedAts: user.deletedAts,
        },
      });
    }

    return response.json(users);
  }
);

export default router;
