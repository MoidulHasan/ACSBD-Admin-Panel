export interface IMenuItem {
  label: string;
  icon?: string;
  iconImageUrl?: string;
  navigateTo?: string;
  isActive?: boolean;
  items?: IMenuItem[];
}
