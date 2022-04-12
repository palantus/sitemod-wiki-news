import express from "express"
import Setup from "../../models/setup.mjs";
const { Router, Request, Response } = express;
const route = Router();
import { validateAccess } from "../../../../services/auth.mjs"

export default (app) => {

  app.use("/news", route)

  route.get("/tags", (req, res) => {
    res.json(Setup.lookup().additionalTags || [])
  })
};