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
        createdAts: lineSplit[3],
        deletedAts: lineSplit[4],
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

interface JobArea {
  name: string;
  count: number;
}
interface JobAreaResponse {
  tipo: string;
  jobArea: JobArea[];
}

router.get("/job-area", async (request: Request, response: Response) => {
  const jobAreas = await client.users.findMany({
    distinct: ["jobArea"],
    select: {
      jobArea: true,
    },
  });

  const userJobsAtivos: JobArea[] = [];
  const userJobsDelete: JobArea[] = [];

  for await (let job of jobAreas) {
    const ativos = await client.users.count({
      where: {
        deletedAts: "",
        jobArea: job.jobArea,
      },
    });
    userJobsAtivos.push({
      name: job.jobArea,
      count: ativos,
    });

    const deletados = await client.users.count({
      where: {
        deletedAts: { not: "" },
        jobArea: job.jobArea,
      },
    });
    userJobsDelete.push({
      name: job.jobArea,
      count: deletados,
    });
  }
  const usersJobAreasCount: JobAreaResponse[] = [
    { tipo: "Ativos", jobArea: userJobsAtivos },
    { tipo: "Deletados", jobArea: userJobsDelete },
  ];

  return response.json(usersJobAreasCount);
});

interface UserCountResponse {
  usuarios: string;
  count: number;
}

router.get("/user-count", async (request: Request, response: Response) => {
  const ativos = await client.users.count({
    where: {
      deletedAts: "",
    },
  });

  const deletados = await client.users.count({
    where: {
      deletedAts: { not: "" },
    },
  });

  const usersCount: UserCountResponse[] = [
    { usuarios: "Ativos", count: ativos },
    { usuarios: "Deletados", count: deletados },
  ];

  return response.json(usersCount);
});

export default router;
