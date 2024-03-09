import type { NavigateToOptions } from "#app/composables/router";
import type { RouteLocationRaw } from "#vue-router";

export interface IMenuItem {
  label: string;
  icon?: string;
  iconImageUrl?: string;
  navigateTo?: string;
  items?: IMenuItem[];
}
