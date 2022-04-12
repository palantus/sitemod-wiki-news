import Entity, { query } from "entitystorage";

export default class Setup extends Entity{
  initNew(){
    this.tag("wikinewssetup")
  }

  static lookup(){
    return query.type(Setup).tag("wikinewssetup").first || new Setup()
  }

  toObj(){
    return {
      additionalTags: this.additionalTags || []
    }
  }
}