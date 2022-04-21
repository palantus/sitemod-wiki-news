import setup from "./routes/setup.mjs"
import news from "./routes/news.mjs"
import user from "./routes/user.mjs"

export default (app) => {
  
  setup(app)
  news(app)
  user(app)
	
  return app
}