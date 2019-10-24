import {
  LitElement,
  customElement,
  CSSResultArray,
  TemplateResult,
  html,
  css,
  property
} from "lit-element";
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { HomeAssistant } from "custom-card-helpers";
import { HacsStyle } from "../style/hacs-style"

import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

import { Configuration, Repository, Route } from "../types"
import { navigate } from "../misc/navigate"

import "../misc/Authors"
import "../misc/buttons/HacsButtonOpenPlugin"
import "../misc/buttons/HacsButtonOpenRepository"
import "../misc/buttons/HacsButtonUninstall"
import "../misc/RepositoryNote"
import "./corePanel"

@customElement("hacs-panel-repository")
export class HacsPanelRepository extends LitElement {
  @property()
  public hass!: HomeAssistant;

  @property()
  public repositories!: Repository[];

  @property()
  public configuration!: Configuration;

  @property()
  public repository!: string;

  @property()
  public panel;

  @property()
  public route!: Route;

  @property()
  public repository_view = false;

  @property()
  private repo: Repository;

  protected firstUpdated() {
    if (!this.repo.updated_info) {
      RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
      RepositoryWebSocketAction(this.hass, this.repo.id, "update");
    }
  }

  render(): TemplateResult | void {
    if (this.repository === undefined) {
      return html`
      <hacs-panel
        .hass=${this.hass}
        .configuration=${this.configuration}
        .repositories=${this.repositories}
        .panel=${this.panel}
        .route=${this.route}
        .repository_view=${this.repository_view}
        .repository=${this.repository}
      >
      </hacs-panel>
      `
    }
    var _repository = this.repository;
    var _repositories = this.repositories.filter(function (repo) {
      return repo.id === _repository
    });
    this.repo = _repositories[0]

    if (this.repo.installed) {
      var back = `
        ${this.hass.localize(`component.hacs.repository.back_to`)} ${this.hass.localize(`component.hacs.repository.installed`)}
        `;
    } else {
      if (this.repo.category === "appdaemon") {
        var FE_cat = "appdaemon_apps";
      } else {
        FE_cat = `${this.repo.category}s`
      }
      var back = `
        ${this.hass.localize(`component.hacs.repository.back_to`)} ${this.hass.localize(`component.hacs.common.${FE_cat}`)}
        `;
    }

    return html`

    <div class="getBack">
      <mwc-button @click=${this.GoBackToStore} title="${back}">
      <ha-icon  icon="mdi:arrow-left"></ha-icon>
        ${back}
      </mwc-button>
      ${(this.repo.state == "other" ? html`<paper-spinner active class="loader"></paper-spinner>` : "")}
    </div>


    <ha-card header="${this.repo.name}">
      <paper-menu-button no-animations horizontal-align="right" role="group" aria-haspopup="true" vertical-align="top" aria-disabled="false">
        <paper-icon-button icon="hass:dots-vertical" slot="dropdown-trigger" role="button"></paper-icon-button>
        <paper-listbox slot="dropdown-content" role="listbox" tabindex="0">

        <paper-item @click=${this.RepositoryReload}>
        ${this.hass.localize(`component.hacs.repository.update_information`)}
        </paper-item>

      ${(this.repo.version_or_commit === "version" ? html`
      <paper-item @click=${this.RepositoryBeta}>
      ${(this.repo.beta ?
          this.hass.localize(`component.hacs.repository.hide_beta`) :
          this.hass.localize(`component.hacs.repository.show_beta`)
        )}
        </paper-item>`: "")}

        ${(!this.repo.custom ? html`
        <paper-item @click=${this.RepositoryHide}>
          ${this.hass.localize(`component.hacs.repository.hide`)}
        </paper-item>`: "")}

        <a href="https://github.com/${this.repo.full_name}" rel='noreferrer' target="_blank">
          <paper-item>
            <ha-icon class="link-icon" icon="mdi:open-in-new"></ha-icon>
            ${this.hass.localize(`component.hacs.repository.open_issue`)}
          </paper-item>
        </a>

        <a href="https://github.com" rel='noreferrer' target="_blank">
          <paper-item>
            <ha-icon class="link-icon" icon="mdi:open-in-new"></ha-icon>
            ${this.hass.localize(`component.hacs.repository.flag_this`)}
          </paper-item>
        </a>

        </paper-listbox>
      </paper-menu-button>
      <div class="card-content">
        <div class="description addition">
          ${this.repo.description}
        </div>
        <div class="information">
          ${(this.repo.installed ?
        html`
          <div class="version installed">
            <b>${this.hass.localize(`component.hacs.repository.installed`)}: </b> ${this.repo.installed_version}
          </div>
          ` :
        "")}

        ${(String(this.repo.releases.length) === "0" ? html`
              <div class="version-available">
                  <b>${this.hass.localize(`component.hacs.repository.available`)}: </b> ${this.repo.available_version}
              </div>
          ` : html`
              <div class="version-available">
                  <paper-dropdown-menu
                    label="${this.hass.localize(`component.hacs.repository.available`)}:
                     (${this.hass.localize(`component.hacs.repository.newest`)}: ${this.repo.releases[0]})">
                      <paper-listbox slot="dropdown-content" selected="-1">
                          ${this.repo.releases.map(release =>
          html`<paper-item @click="${this.SetVersion}">${release}</paper-item>`
        )}
                          <paper-item @click="${this.SetVersion}">${this.repo.default_branch}</paper-item>
                      </paper-listbox>
                  </paper-dropdown-menu>
              </div>`
      )}

        </div>
        <hacs-authors .hass=${this.hass} .authors=${this.repo.authors}></hacs-authors>
      </div>


      <div class="card-actions">

      <mwc-button @click=${this.RepositoryInstall}>
        ${(this.repo.state == "installing"
        ? html`<paper-spinner active></paper-spinner>` : html`
        ${this.hass.localize(`component.hacs.repository.${this.repo.main_action.toLowerCase()}`)}
        `)}
      </mwc-button>

      ${(this.repo.state == "installing" ? html`
      <a href="https://github.com/${this.repo.full_name}/releases" rel='noreferrer' target="_blank">
        <mwc-button>
        ${this.hass.localize(`component.hacs.repository.changelog`)}
        </mwc-button>
      </a>`: "")}

      <hacs-button-open-repository .hass=${this.hass} .repository=${this.repo}></hacs-button-open-repository>
      <hacs-button-open-plugin .hass=${this.hass} .repository=${this.repo}></hacs-button-open-plugin>
      <hacs-button-uninstall class="right" .hass=${this.hass} .repository=${this.repo}></hacs-button-uninstall>

      </div>
    </ha-card>

    <ha-card>
      <div class="card-content">
        <div class="more_info">
          ${unsafeHTML(this.repo.additional_info)}
        </div>
      <hacs-repository-note
        .hass=${this.hass}
        .configuration=${this.configuration}
        .repository=${this.repo}
      ></hacs-repository-note>
      </div>
    </ha-card>
          `;
  }

  RepositoryReload() {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
    RepositoryWebSocketAction(this.hass, this.repo.id, "update");
  }

  RepositoryInstall() {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "installing");
    RepositoryWebSocketAction(this.hass, this.repo.id, "install");
  }

  RepositoryUnInstall() {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "uninstalling");
    RepositoryWebSocketAction(this.hass, this.repo.id, "uninstall");
  }

  RepositoryBeta() {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
    if (this.repo.beta) {
      RepositoryWebSocketAction(this.hass, this.repo.id, "hide_beta");
    } else {
      RepositoryWebSocketAction(this.hass, this.repo.id, "show_beta");
    }
  }

  RepositoryHide() {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
    if (this.repo.hide) {
      RepositoryWebSocketAction(this.hass, this.repo.id, "unhide");
    } else {
      RepositoryWebSocketAction(this.hass, this.repo.id, "hide");
    }
  }

  SetVersion(ev: any) {
    RepositoryWebSocketAction(this.hass, this.repo.id, "set_state", "other");
    var Version = ev.composedPath()[2].outerText;
    if (Version) RepositoryWebSocketAction(this.hass, this.repo.id, "set_version", Version);
  }

  GoBackToStore() {

    this.repository = undefined;
    if (this.repo.installed) {
      this.panel = "installed"
    } else {
      this.panel = this.repo.category
    }
    navigate(this, `/${this._rootPath}/${this.panel}`)
    this.requestUpdate();
  }

  private get _rootPath() {
    if (window.location.pathname.split("/")[1] === "hacs_dev") return "hacs_dev";
    return "hacs"
  }


  static get styles(): CSSResultArray {
    return [HacsStyle, css`
      paper-dropdown-menu {
        width: 250px;
        margin-top: -24px;

      }
      paper-spinner.loader {
        position: absolute;
        top: 20%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 99;
        width: 300px;
        height: 300px;
     }
      .description {
        font-style: italic;
        padding-bottom: 16px;
      }
      .version {
        padding-bottom: 8px;
      }
      .options {
        float: right;
        width: 40%;
      }
      .information {
        width: 60%;
      }
      .getBack {
        margin-top: 8px;
        margin-bottom: 4px;
        margin-left: 5%;
      }
      .right {
        float: right;
      }
      .loading {
        text-align: center;
        width: 100%;
      }
      ha-card {
        width: 90%;
        margin-left: 5%;
      }
      .link-icon {
        color: var(--dark-primary-color);
        margin-right: 8px;
      }
      paper-menu-button {
        float: right;
        top: -65px;
      }
    `]
  }
}