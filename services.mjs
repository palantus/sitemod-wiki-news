import Role from "../../models/role.mjs"

export default async () => {
  // init
  Role.lookupOrCreate("admin").addPermission(["news.setup", "news.create", "news.read"], true)

  return {
  }
}