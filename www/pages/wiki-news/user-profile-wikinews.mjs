const elementName = 'wiki-news-user-profile-component'

import api from "../../system/api.mjs"
import "../../components/field.mjs"
import "../../components/field-edit.mjs"
import "../../components/field-list.mjs"
import {on, off} from "../../system/events.mjs"
import {mods} from "../../system/core.mjs"

const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <style>
    field-list{
      width: 300px;
    }
    :host{
      margin-top: 10px;
      display: block;
    }
    .hidden{display: none;}
  </style>  

  <div id="container">
    <h2>News</h2>
    <field-list labels-pct="50">
      <field-edit label="E-mail me with news" title="Receive an e-mail notification every time a news article is published" type="checkbox" id="emailOnNews"></field-edit>
    </field-list>
  </div>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.refreshData = this.refreshData.bind(this)

    this.shadowRoot.getElementById("emailOnNews").classList.toggle("hidden", !!!mods().find(m => m.id == "mail"))

    this.refreshData();
  }

  async refreshData(){
    let setup = await api.get("me/setup")
    
    this.shadowRoot.getElementById("emailOnNews").setAttribute("value", !!setup.emailOnNews)

    this.shadowRoot.querySelectorAll("field-edit:not([disabled])").forEach(e => e.setAttribute("patch", `wiki-news/me/setup`));
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

export function showOnPage(args){
  let element = document.createElement(elementName)
  args.container.appendChild(element)
}