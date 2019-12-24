import {
  LitElement,
  customElement,
  CSSResultArray,
  css,
  TemplateResult,
  html,
  property
} from "lit-element";
import { HacsStyle } from "../style/hacs-style";
import { RepositoryData, Configuration, Status, LovelaceConfig } from "../types";
import { AddedToLovelace } from "./AddedToLovelace";
import { HomeAssistant } from "custom-card-helpers";
import { localize } from "../localize/localize";

interface CustomHACard extends HTMLElement {
  header?: string;
}

interface AddedToLovelace extends HTMLElement {
  hass?: HomeAssistant;
  configuration?: Configuration;
  lovelaceconfig?: LovelaceConfig;
  repository?: RepositoryData;
}

@customElement("hacs-repository-banner-note")
export class RepositoryBannerNote extends LitElement {
  @property({ type: Object }) public configuration: Configuration;
  @property({ type: Object }) public hass!: HomeAssistant;
  @property({ type: Object }) public lovelaceconfig: LovelaceConfig;
  @property({ type: Object }) public repository!: RepositoryData;
  @property({ type: Object }) public status!: Status;

  protected render(): TemplateResult | void {
    if (!this.repository.installed) return html``;
    var message: string = "";
    var title: string = "";
    var type: "alert" | "warning" | "info" | "" = "";

    if (this.repository.status == "pending-restart") {
      type = "alert";
      title = localize("repository_banner.restart_pending");
      message = localize("repository_banner.restart");
    } else if (this.repository.category == "plugin") {
      if (this.lovelaceconfig !== undefined && !this.status.background_task) {
        var loaded: boolean = AddedToLovelace(
          this.repository,
          this.lovelaceconfig,
          this.status
        );

        if (!loaded) {
          type = "warning";
          title = localize("repository_banner.not_loaded");
          message = localize("repository_banner.plugin_not_loaded");
        }
      }
    }
    if (message.length === 0) return html``;

    const wrapper: CustomHACard = document.createElement("ha-card");
    wrapper.className = type;
    wrapper.header = title;

    const content = document.createElement("div");
    content.className = "card-content";
    content.innerText = message;
    wrapper.appendChild(content);

    if (this.repository.category === "plugin") {
      const actions = document.createElement("div");
      actions.className = "card-actions";

      const addedToLovelace: AddedToLovelace = document.createElement(
        "hacs-button-add-to-lovelace"
      );
      addedToLovelace.hass = this.hass;
      addedToLovelace.configuration = this.configuration;
      addedToLovelace.repository = this.repository;
      addedToLovelace.lovelaceconfig = this.lovelaceconfig;
      actions.appendChild(addedToLovelace);
      wrapper.appendChild(actions);
    }

    return html`
      ${wrapper}
    `;
  }

  static get styles(): CSSResultArray {
    return [
      HacsStyle,
      css`
        ha-card {
          width: 90%;
          margin-left: 5%;
        }
        .alert {
          background-color: var(
            --hacs-status-pending-restart,
            var(--google-red-500)
          );
          color: var(--text-primary-color);
        }
        .warning {
          background-color: var(--hacs-status-pending-update);
          color: var(--primary-text-color);
        }
        .info {
          background-color: var(--primary-background-color);
          color: var(--primary-text-color);
        }
      `
    ];
  }
}
