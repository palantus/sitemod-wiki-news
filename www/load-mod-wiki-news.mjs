import {on} from "/system/events.mjs"

export async function load(){
  on("user-profile-page-created", "news-load", (...args) => {
    import("/pages/wiki-news/user-profile.mjs").then(i => {
      i.showOnPage(...args)
    })
  })
}