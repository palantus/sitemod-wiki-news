const elementName = 'wiki-news-setup-page'

import api from "../../system/api.mjs"
import "../../components/field-edit.mjs"
import "../../components/field-list.mjs"
import {on, off} from "../../system/events.mjs"
import { goto } from "../../system/core.mjs"

const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <style>
    #container{
        padding: 10px;
        position: relative;
    }
    div.group:not(:first-child){
      margin-top: 10px;
    }
    .group input{
      width: 350px;
    }
    field-list{
      width: 600px;
    }
    h2{
      margin-top: 30px;
    }
    .hidden{display: none;}
  </style>  

  <div id="container">

    <h1>News setup</h1>
    <field-list labels-pct="30">
      <field-edit type="text" label="Role filter" id="roleFilter" title="Roles for which users in them will receive news notifications" placeholder="role1, role2 etc."></field-edit>
      <field-edit type="text" label="Additional tags" id="additionalTags" title="Tags that will be added to news articles" placeholder="tag1, tag2 etc."></field-edit>
    </field-list>

    <h2>Use the following template page to assign default permissions, tags and content</h2>
    <button id="template-btn">Goto template</button>
  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.refreshData = this.refreshData.bind(this);
    
    this.refreshData();
  }

  async refreshData(){

    let setup = await api.get("news/setup")

    this.shadowRoot.getElementById("additionalTags").setAttribute("value", setup.additionalTags.join(", "))
    this.shadowRoot.getElementById("roleFilter").setAttribute("value", setup.roleFilter||"")
    this.shadowRoot.getElementById("template-btn").addEventListener("click", () => goto("/wiki/wiki-news-template"))

    this.shadowRoot.querySelectorAll("field-edit:not([disabled])").forEach(e => e.setAttribute("patch", `news/setup`));
  }

  connectedCallback() {
    on("changed-page", elementName, this.refreshData)
  }

  disconnectedCallback() {
    off("changed-page", elementName)
  }
}

window.customElements.define(elementName, Element);
export {Element, elementName as name}