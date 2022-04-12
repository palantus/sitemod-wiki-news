import setup from "./routes/setup.mjs"
import news from "./routes/news.mjs"

export default (app) => {
  
  setup(app)
  news(app)
	
  return app
}