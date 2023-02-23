import Permission from "../../models/permission.mjs"
import Role from "../../models/role.mjs"

export default async () => {
  // init
  Role.lookupOrCreate("admin").addPermission(["news.setup", "news.create"], true)

  Permission.lookup("news.read")?.delete()

  return {
  }
}