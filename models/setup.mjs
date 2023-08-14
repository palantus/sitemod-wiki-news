import Entity, { query } from "entitystorage";

export default class Setup extends Entity{
  initNew(){
    this.tag("wikinewssetup")
  }

  static lookup(){
    return query.type(Setup).tag("wikinewssetup").first || new Setup()
  }

  get roles(){
    return (this.roleFilter||"").split(",").map(r => r.trim())
  }

  toObj(){
    return {
      defaultACLId: this._id,
      additionalTags: this.additionalTags || [],
      roleFilter: this.roleFilter || null
    }
  }
}