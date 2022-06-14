import CoreSetup from "../../../models/setup.mjs"
import LogEntry from "../../../models/logentry.mjs"
import Share from "../../../models/share.mjs";
import MailSender from "../../mail/services/mailsender.mjs"
import { query } from "entitystorage";
import User from "../../../models/user.mjs";

export async function sendMails(article, curUser){
  if(article.tags.includes("user-emails-sent")) return;

  let shareKey = null;
  for(let user of query.tag("user").relatedTo(query.prop("emailOnNews", true)).all){
    if(!shareKey) shareKey = new Share("email", 'r', curUser).attach(article).key;
    if(!user.email) continue;
    try{
      await new MailSender().send({
        to: user.email, 
        subject: `${CoreSetup.lookup().siteTitle}: News article published`, 
        body: `
          <div>
            <h3>Title: ${article.title}</h3>
            <div>
              <a href="${global.sitecore.siteURL}/wiki/${article.id}?shareKey=${shareKey}">Go to news article</a>
            </div>
            <br>
            <hr>
            <p style="font-size: 10pt;">If you do not want to receive these types of emails, you can unsubscribe <a href="${global.sitecore.siteURL}/profile">here</a></p>
          </div>
        `,
        bodyType: "html"
      })
    } catch(err){
      new LogEntry(`Could not send email to ${user.email}. Error: ${err}`, "mail")
    }
  }

  article.tag("user-emails-sent")
}

export async function sendNotifications(article){
  for(let user of query.type(User).tag("user").all){
    user.notify("wiki", article.title, {title: "News article published", refs: [{uiPath: `/wiki/${article.id}`, title: "Go to article"}]})
  }
}