import { customElement, TemplateResult, html, property } from "lit-element";
import { HacsRepositoryButton } from "./HacsRepositoryButton"
import { RepositoryWebSocketAction } from "../misc/RepositoryWebSocketAction"

@customElement("hacs-button-main-action")
export class HacsButtonMainAction extends HacsRepositoryButton {

    @property()
    private pathExists: boolean = false;

    protected firstUpdated() {
        this.hass.connection.sendMessagePromise({
            type: "hacs/check_path",
            path: this.repository.local_path
        }).then(
            (resp) => {
                this.pathExists = resp["exist"];
            },
            (err) => {
                console.error('[hacs/check_path] Message failed!', err);
            }
        );
    }

    protected render(): TemplateResult | void {
        return html`
            <mwc-button @click=${this.RepositoryInstall}>
                ${(this.repository.state == "installing"
                ? html`<paper-spinner active></paper-spinner>`
                : html`${this.hass.localize(
                    `component.hacs.repository.${this.repository.main_action.toLowerCase()}`)}`)}
            </mwc-button>
        `;
    }

    RepositoryInstall() {
        if (this.pathExists && !this.repository.installed) {
            if (window.confirm(
                this.hass.localize("component.hacs.confirm.exsist", "item", this.repository.local_path)
                + "\n" + this.hass.localize("component.hacs.confirm.overwrite")
                + "\n" + this.hass.localize("component.hacs.confirm.continue")
            )) this.ExecuteAction()
        } else this.ExecuteAction()
    }

    ExecuteAction() {
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "set_state", "installing");
        RepositoryWebSocketAction(
            this.hass, this.repository.id, "install");
    }
}