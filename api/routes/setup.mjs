import express from "express"
const { Router, Request, Response } = express;
const route = Router();
import { validateAccess } from "../../../../services/auth.mjs"
import Setup from "../../models/setup.mjs";

export default (app) => {

  app.use("/news", route)

  route.get('/setup', function (req, res, next) {
    if (!validateAccess(req, res, { permission: "news.setup" })) return;
    res.json(Setup.lookup().toObj());
  });

  route.patch('/setup', function (req, res, next) {
    if (!validateAccess(req, res, { permission: "news.setup" })) return;

    let setup = Setup.lookup();

    if(req.body.additionalTags !== undefined && req.body.additionalTags && typeof req.body.additionalTags === "string") 
      setup.additionalTags = req.body.additionalTags.split(",").map(t => t.trim())
    if(req.body.additionalTags !== undefined && Array.isArray(req.body.additionalTags)) 
      setup.additionalTags = req.body.additionalTags
    if(req.body.roleFilter === null || typeof req.body.roleFilter === "string") 
      setup.roleFilter = req.body.roleFilter

    res.json(true);
  });
};