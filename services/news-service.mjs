import CoreSetup from "../../../models/setup.mjs"
import Share from "../../../models/share.mjs";
import { query } from "entitystorage";
import User from "../../../models/user.mjs";

export async function sendMails(article, curUser){
  if(article.tags.includes("user-emails-sent")) return;

  let Mail = null;
  try{
    Mail = (await import("../../mail/models/mail.mjs")).default
  } catch(err){
    return;
  }

  let shareKey = null;
  for(let user of query.tag("user").relatedTo(query.prop("emailOnNews", true)).all){
    if(!shareKey) shareKey = new Share("email", 'r', curUser).attach(article).key;
    if(!user.email) continue;
    await new Mail({
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
    }).send()
    await new Promise(r => setTimeout(r, 300)); //Wait a bit between mails, to prevent slowing down the app
  }

  article.tag("user-emails-sent")
}

export async function sendNotifications(article){
  for(let user of query.type(User).tag("user").all){
    article.rel(user.notify("wiki", article.title, {title: "News article published", refs: [{uiPath: `/wiki/${article.id}`, title: "Go to article"}]}), "notification")
  }
}