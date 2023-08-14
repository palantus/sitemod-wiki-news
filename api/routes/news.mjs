import express from "express"
import Setup from "../../models/setup.mjs";
const { Router, Request, Response } = express;
const route = Router();
import { permission, validateAccess } from "../../../../services/auth.mjs"
import Page from "../../../wiki/models/page.mjs"
import { sendMails, sendNotifications } from "../../services/news-service.mjs";
import Notification from "../../../../models/notification.mjs";
import { getTimestamp } from "../../../../tools/date.mjs";

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
    article.rels.notification?.forEach(n => Notification.from(n).dismiss());
    res.json({success: true})
  })

  route.post("/articles", permission("wiki.edit"), (req, res) => {
    let page = Page.lookup(req.body.id)
    if(page) throw "Article/page already exists"
    page = new Page(req.body.id, res.locals.user);
    page.tag("user-news")
    page.tag("user-draft")
    page.title = (typeof req.body.title === "string" && req.body.title) ? req.body.title : page.id
    page.prop("modified", getTimestamp())
    let template = Page.lookup("wiki-news-template")
    if(template){
      page.body = template.body
      page.html = template.html
      page.acl = template.acl;
      template.tags.filter(t => t.startsWith("user-")).forEach(t => page.tag(t))
    } else{
      page.acl = "r:shared;w:private";
    }
    res.json(page.toObj(res.locals.user))
  })
};