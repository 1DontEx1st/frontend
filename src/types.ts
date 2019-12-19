export interface Route {
  path: string;
  prefix: string;
}

export interface Status {
  background_task: boolean;
  disabled: boolean;
  lovelace_mode: "storeage" | "yaml";
  reloading_data: boolean;
  startup: boolean;
  upgrading_all: boolean;
}

export interface Configuration {
  categories: [string];
  country: string;
  dev: string;
  experimental: boolean;
  frontend_compact: boolean;
  frontend_mode: string;
  onboarding_done: boolean;
  version: string;
}

export interface Critical {
  repository: string;
  reason: string;
  link: string;
  acknowledged: boolean;
}

export interface SelectedValue {
  detail: { selected: string };
}

export interface Repository {
  additional_info: string;
  authors: [string];
  available_version: string;
  beta: boolean;
  can_install: boolean;
  category: string;
  country: string;
  custom: boolean;
  default_branch: string;
  description: string;
  domain: string;
  downloads: number;
  file_name: string;
  full_name: string;
  hide: boolean;
  homeassistant: string;
  id: string;
  info: string;
  installed_version: string;
  installed: boolean;
  javascript_type: string;
  last_updated: string;
  local_path: string;
  main_action: string;
  name: string;
  new: string;
  pending_upgrade: boolean;
  releases: [string];
  selected_tag: string;
  stars: number;
  state: string;
  status_description: string;
  status: string;
  topics: [string];
  updated_info: boolean;
  version_or_commit: string;
}

export interface ValueChangedEvent {
  detail?: { value: string };
}

export interface LocationChangedEvent {
  detail?: { value: Route };
}

export interface RepositoryCategories {
  appdaemon_apps: Repository[];
  integrations: Repository[];
  plugins: Repository[];
  python_scripts: Repository[];
  themes: Repository[];
}

export const AllCategories = [
  "integrations",
  "plugins",
  "appdaemon_apps",
  "python_scripts",
  "themes"
];

export interface LovelaceConfig {
  background?: string;
  resources?: LovelaceResourceConfig[];
  title?: string;
  views: LovelaceViewConfig[];
}

export interface LovelaceViewConfig {
  background?: string;
  badges?: Array<string | LovelaceBadgeConfig>;
  cards?: LovelaceCardConfig[];
  icon?: string;
  index?: number;
  panel?: boolean;
  path?: string;
  theme?: string;
  title?: string;
  visible?: boolean | ShowViewConfig[];
}

export interface ShowViewConfig {
  user?: string;
}

export interface LovelaceBadgeConfig {
  type?: string;
  [key: string]: any;
}

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  type: string;
  [key: string]: any;
}

export interface LovelaceResourceConfig {
  type: "css" | "js" | "module" | "html";
  url: string;
}
