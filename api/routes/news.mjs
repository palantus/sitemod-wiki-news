import express from "express"
import Setup from "../../models/setup.mjs";
const { Router, Request, Response } = express;
const route = Router();
import { validateAccess } from "../../../../services/auth.mjs"
import Page from "../../../wiki/models/page.mjs"
import { sendMails, sendNotifications } from "../../services/news-service.mjs";

export default (app) => {

  app.use("/news", route)

  route.get("/tags", (req, res) => {
    res.json(Setup.lookup().additionalTags || [])
  })

  route.post("/:id/publish", (req, res) => {
    if (!validateAccess(req, res, { permission: "news.create" })) return;
    let article = Page.lookup(req.params.id)
    if(!article || !article.tags.includes("user-news")) throw "Unknown article"
    if(article && !article.validateAccess(res, 'w')) return;
    article.removeTag("user-draft")
    sendMails(article, res.locals.user)
    sendNotifications(article)
    res.json({success: true})
  })

  route.post("/:id/unpublish", (req, res) => {
    if (!validateAccess(req, res, { permission: "news.create" })) return;
    let article = Page.lookup(req.params.id)
    if(!article || !article.tags.includes("user-news")) throw "Unknown article"
    if(article && !article.validateAccess(res, 'w')) return;
    article.tag("user-draft")
    res.json({success: true})
  })
};