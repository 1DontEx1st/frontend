import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";

import { HomeAssistant } from "custom-card-helpers";

import { HacsStyle } from "../style/hacs-style"
import { Configuration, Repository, Route, Status, ValueChangedEvent } from "../types"
import { navigate } from "../misc/navigate"
import { LovelaceConfig } from "../misc/LovelaceTypes"
import { AddedToLovelace } from "../misc/AddedToLovelace"

import { localize } from "../localize/localize"

import "../components/buttons/HacsButtonClearNew"


@customElement("hacs-panel")
export class HacsPanelStore extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public repositories!: Repository[]
  @property() public configuration!: Configuration
  @property() public route!: Route;
  @property() public panel;
  @property() public status!: Status;
  @property() public repository_view = false;
  @property() public repository: string;
  @property() public SortKey: string = "name";
  @property() public SearchTerm: string = "";
  @property() public lovelaceconfig: LovelaceConfig;

  protected render(): TemplateResult | void {
    if (this.panel === "repository") {
      // How fun, this is a repository!
      return html`
      <hacs-panel-repository
        .hass=${this.hass}
        .route=${this.route}
        .status=${this.status}
        .configuration=${this.configuration}
        .repositories=${this.repositories}
        .repository=${this.repository}
        .lovelaceconfig=${this.lovelaceconfig}
      >
      </hacs-panel-repository>`
    } else {
      const category = this.panel;
      var newRepositories: Repository[] = [];
      const config = this.configuration;
      this.SearchTerm = localStorage.getItem("hacs-search");
      this.SortKey = localStorage.getItem("hacs-sort");
      var SearchTerm = this.SearchTerm;
      var _repositories = this.repositories.filter(function (repo) {

        if (category !== "installed") {
          // Hide HACS from the store
          if (repo.id === "172733314") return false;

          // Hide hidden repos from the store
          if (repo.hide) return false;

          // Check contry restrictions
          if (config.country !== "ALL" && repo.country !== undefined) {
            if (config.country !== repo.country) return false;
          }

        } else {
          if (repo.installed) return true;
        }

        if (repo.category === category) {
          if (SearchTerm !== "" || null) {
            if (repo.name.toLowerCase().includes(SearchTerm)) return true;
            if (repo.description.toLowerCase().includes(SearchTerm)) return true;
            if (repo.full_name.toLowerCase().includes(SearchTerm)) return true;
            if (String(repo.authors).toLowerCase().includes(SearchTerm)) return true;
            if (String(repo.topics).toLowerCase().includes(SearchTerm)) return true;
            return false;
          }

          if (repo.new) newRepositories.push(repo);

          // Fallback to not showing it if no search.
          return true;
        }
        // Fallback to not showing it.
        return false;
      });

      return html`
      <div class="store-top store-top-${this.panel}">
        <paper-input
          class="search-bar padder"
          type="text"
          id="Search"
          @input=${this.DoSearch}
          placeholder="  ${localize("store.placeholder_search")}."
          autofocus
          .value=${this.SearchTerm}
        >
          ${(this.SearchTerm.length > 0 ? html`
            <ha-icon slot="suffix" icon="mdi:close" @click="${this.clearSearch}"></ha-icon>
          ` : "")}
        </paper-input>
        <paper-dropdown-menu @value-changed="${this.SetSortKey}" class="sort padder" label="Sort">
          <paper-listbox slot="dropdown-content" selected="${this.SortKey}" attr-for-selected="key">
            <paper-item key="name">Name</paper-item>
            <paper-item key="stars">Stars</paper-item>
            <paper-item key="status">Status</paper-item>
          </paper-listbox>
        </paper-dropdown-menu>
        </div>

    ${(newRepositories.length !== 0 ? html`
    <div class="card-group">
      <h1>${localize(`store.new_repositories`)}</h1>
      ${newRepositories.sort((a, b) => (this.SortRepo(a, b)) ? 1 : -1).map(repo =>
        html`
          ${(this.configuration.frontend_mode !== "Table" ? html`
          <ha-card @click="${this.ShowRepository}" .RepoID="${repo.id}"
            class="${(this.configuration.frontend_compact ? "compact" : "")}">
          <div class="card-content">
            <div>
              <ha-icon
                icon="mdi:new-box"
                class="${this.StatusAndDescription(repo).status}"
                title="${this.StatusAndDescription(repo).description}"
                >
              </ha-icon>
              <div>
                <div class="title">${repo.name}</div>
                <div class="addition">${repo.description}</div>
              </div>
            </div>
          </div>
          </ha-card>

        ` : html`

        <paper-item .RepoID=${repo.id} @click="${this.ShowRepository}"
          class="${(this.configuration.frontend_compact ? "compact" : "")}">
          <div class="icon">
            <ha-icon
              icon="mdi:new-box"
              class="${this.StatusAndDescription(repo).status}"
              title="${this.StatusAndDescription(repo).description}"
          </ha-icon>
          </div>
          <paper-item-body two-line>
            <div>${repo.name}</div>
            <div class="addition">${repo.description}</div>
          </paper-item-body>
        </paper-item>
        `)}
      `)}
    </div>
    <div class="card-group">
      <hacs-button-clear-new .hass=${this.hass} .category=${category}></hacs-button-clear-new>
    </div>
    <hr>
    ` : "")}

    <div class="card-group">
    ${_repositories.sort((a, b) => (this.SortRepo(a, b)) ? 1 : -1).map(repo =>
          html`

      ${(this.configuration.frontend_mode !== "Table" ? html`
        <ha-card @click="${this.ShowRepository}" .RepoID="${repo.id}"
          class="${(this.configuration.frontend_compact ? "compact" : "")}">
        <div class="card-content">
          <div>
            <ha-icon
              icon=${(repo.new ? "mdi:new-box" : "mdi:cube")}
              class="${this.StatusAndDescription(repo).status}"
              title="${this.StatusAndDescription(repo).description}"
              >
            </ha-icon>
            <div>
              <div class="title">${repo.name}</div>
              <div class="addition">${repo.description}</div>
            </div>
          </div>
        </div>
        </ha-card>

      ` : html`

      <paper-item .RepoID=${repo.id} @click="${this.ShowRepository}"
        class="${(this.configuration.frontend_compact ? "compact" : "")}">
        <div class="icon">
          <ha-icon
            icon=${(repo.new ? "mdi:new-box" : "mdi:cube")}
            class="${this.StatusAndDescription(repo).status}"
            title="${this.StatusAndDescription(repo).description}"
        </ha-icon>
        </div>
        <paper-item-body two-line>
          <div>${repo.name}</div>
          <div class="addition">${repo.description}</div>
        </paper-item-body>
      </paper-item>
      `)}


      `)}
    </div>`;
    }
  }

  SortRepo(a: Repository, b: Repository): boolean {

    if (this.SortKey === "stars") return a.stars < b.stars
    if (this.SortKey === "status") return a.status < b.status

    return a[this.SortKey] > b[this.SortKey];
  }

  SetSortKey(ev: ValueChangedEvent) {
    if (ev.detail.value.length === 0) return;
    this.SortKey = ev.detail.value.replace(" ", "_").toLowerCase()
    localStorage.setItem("hacs-sort", this.SortKey);
  }

  StatusAndDescription(repository: Repository): { status: string, description: string } {
    var status = repository.status;
    var description = repository.status_description;

    if (repository.installed && !this.status.background_task) {
      if (repository.category === "plugin" && !AddedToLovelace(repository, this.lovelaceconfig, this.status)) {
        status = "not-loaded";
        description = "Not loaded in lovelace";
      }
    }

    return { status: status, description: description }
  }

  DoSearch(ev) {
    this.SearchTerm = ev.composedPath()[0].value.toLowerCase();

    localStorage.setItem("hacs-search", this.SearchTerm);
  };

  clearSearch() {
    this.SearchTerm = "";
    localStorage.setItem("hacs-search", this.SearchTerm);
  }

  ShowRepository(ev) {
    var RepoID: string

    ev.composedPath().forEach((item: any) => {
      if (item.RepoID) {
        RepoID = item.RepoID;
      }
    })

    this.panel = `repository`;
    this.repository = RepoID;
    this.repository_view = true;
    this.requestUpdate();
    navigate(this, `/${this._rootPath}/repository/${RepoID}`);
  }

  private get _rootPath() {
    if (window.location.pathname.split("/")[1] === "hacs_dev") return "hacs_dev";
    return "hacs"
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`


    .padder {
      padding-left: 8px;
      padding-right: 8px;
    }
      .search-bar {
        display: block;
        width: calc(60% - 16px);
        margin-left: 3.4%;
        margin-top: 2%;
        background-color: var(--primary-background-color);
        color: var(--primary-text-color);
        line-height: 32px;
        border-color: var(--dark-primary-color);
        border-width: inherit;
        border-bottom-width: thin;
        border-radius: var(--ha-card-border-radius)
      }

      .sort {
        display: block;
        width: calc(30% - 16px);
        margin-left: 3.4%;
        margin-top: 2%;
        background-color: var(--primary-background-color);
        color: var(--primary-text-color);
        line-height: 32px;
        border-color: var(--dark-primary-color);
        border-width: inherit;
        border-bottom-width: thin;
        border-radius: var(--ha-card-border-radius)
      }

      .store-top {
        display: flex;
      }

      .store-top-installed, .store-top-settings {
        display: none;
      }

      ha-card {
        display: inline-flex;
      }

      .card-content, paper-item-body {
        width: 95%;
      }
    `];
  }
}