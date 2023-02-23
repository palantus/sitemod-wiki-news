const elementName = 'news-page'

import api from "/system/api.mjs"
import "/components/field-ref.mjs"
import "/components/field.mjs"
import {on, off} from "/system/events.mjs"
import "/components/action-bar.mjs"
import "/components/action-bar-item.mjs"
import {userPermissions} from "/system/user.mjs"
import {goto} from "/system/core.mjs"
import {alertDialog, showDialog} from "/components/dialog.mjs"

const template = document.createElement('template');
template.innerHTML = `
  <link rel='stylesheet' href='/css/global.css'>
  <link rel='stylesheet' href='/css/searchresults.css'>
  <style>
    #container{
      position: relative;
      padding: 10px;
    }
    table{
      width: 100%;
    }
    table thead tr{
      border-bottom: 1px solid gray;
    }

    #newstab thead th:nth-child(1){width: 85px}
    #newstab.editor thead th:nth-child(2){width: 350px}
    #newstab.editor thead th:nth-child(3){width: 75px}
    #news tr.live td:nth-child(3){color:green;}
    #news tr.draft td:nth-child(3){color:red;}
    #newstab td, #newstab th{padding-top: 5px;}
    #newstab td{padding-bottom: 5px;}

    .hidden{display: none;}
  </style>  

  <action-bar id="action-bar" class="hidden">
    <action-bar-item id="new-btn">New</action-bar-item>
  </action-bar>

  <div id="container">
    <h1>News</h1>

    <p>The following is a list of news articles. If you want an e-mail every time a new article is published, you can enable it in your <field-ref ref="/profile">profile</field-ref>.
    <table id="newstab">
      <thead>
        <tr>
          <th>Date</th>
          <th>Title</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="news">
      </tbody>
    </table>
  </div>

  <dialog-component title="New article" id="new-dialog">
    <field-component label="Title"><input id="new-title"></input></field-component>
    <field-component label="Id"><input id="new-id"></input></field-component>
    <field-component label="Tags"><input id="new-tags" placeholder="tag1, tag2, ..."></input></field-component>
  </dialog-component>
`;

class Element extends HTMLElement {
  constructor() {
    super();

    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.refreshData = this.refreshData.bind(this);
    this.newClicked = this.newClicked.bind(this)
    this.tableClicked = this.tableClicked.bind(this)

    this.shadowRoot.getElementById("new-btn").addEventListener("click", this.newClicked)
    this.shadowRoot.getElementById("newstab").addEventListener("click", this.tableClicked)

    this.refreshData();

    this.shadowRoot.getElementById("new-title").addEventListener("input", e => {
      let value = (e.originalTarget||e.target)?.value
      if(!value) return this.shadowRoot.getElementById("new-id").value = '';
      clearTimeout(this.slugGenTimer)
      this.slugGenTimer = setTimeout(() => {
        if(!value) return;
        api.post("wiki/generate-id", {id: value, ensureNew: true}).then(id => this.shadowRoot.getElementById("new-id").value = id)
      }, 400)
    })
  }
  async refreshData(){
    this.news = await api.get("wiki/search?filter=tag:news permission:news.create")
    let permissions = await userPermissions()
    let isEditor = permissions.includes("news.create") && permissions.includes("wiki.edit")

    this.shadowRoot.getElementById('news').innerHTML = this.news.filter(p => isEditor || !p.tags.includes("draft"))
                                                                .sort((a, b) => a.modified < b.modified ? -1 : 1)
                                                                .map(c => `
      <tr data-id="${c.id}" class="result ${c.tags.includes("draft") ? "draft" : "live"}">
        <td>${c.modified? new Date(c.modified).toLocaleDateString():"N/A"}</td>
        <td><field-ref ref="/wiki/${c.id}">${c.title}</field-ref></td>
        <td class="${isEditor?"":"hidden"}">${c.tags.includes("draft") ? "Draft" : "Published"}</td>
        <td class="${isEditor?"":"hidden"}">${c.tags.includes("draft") ? `<button class="publish">Publish</button>` : `<button class="unpublish">Unpublish</button>`}</td>
      </tr>`).join('');

    if(isEditor){
      this.shadowRoot.querySelector("action-bar").classList.remove("hidden")
      this.shadowRoot.getElementById('newstab').classList.add("editor")
    } else {
      this.shadowRoot.querySelectorAll('table th:nth-child(3),table tbody th:nth-child(4)').forEach(e => e.remove())
    }
  }

  newClicked(){
    let dialog = this.shadowRoot.querySelector("#new-dialog")

    showDialog(dialog, {
      show: () => {
        this.shadowRoot.querySelector("#new-title").focus()
        api.get("news/tags").then(tags => {
          this.shadowRoot.getElementById("new-tags").value = tags.join(", ")
        })
      },
      ok: async (val) => {
        let exists = await api.get(`wiki/exists?id=${val.id}`)
        if(exists) return alertDialog(`The page ${val.id} already exists`)
        await api.patch(`wiki/${val.id}`, val)
        goto(`/wiki/${val.id}`)
      },
      validate: (val) => 
          !val.title ? "Please fill out title"
        : !val.id ? "Please fill out id"
        : true,
      values: () => {return {
        title: this.shadowRoot.getElementById("new-title").value,
        id: this.shadowRoot.getElementById("new-id").value,
        tags: ["news", "draft", ...new Set(this.shadowRoot.getElementById("new-tags").value.split(",").map(t => t.trim()).filter(t => t))],
        access: "shared"
      }},
      close: () => {
        this.shadowRoot.querySelectorAll("field-component input").forEach(e => e.value = '')
      }
    })
  }

  tableClicked(e){
    let id = e.target.closest("tr").getAttribute("data-id")
    if(e.target.classList.contains("publish")){
      e.target.setAttribute("disabled", "true") // Prevent double-clicks
      api.post(`news/${id}/publish`).then(this.refreshData)
    } else if(e.target.classList.contains("unpublish")){
      e.target.setAttribute("disabled", "true") // Prevent double-clicks
      api.post(`news/${id}/unpublish`).then(this.refreshData)
    }
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