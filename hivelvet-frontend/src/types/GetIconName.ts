import { categoriesIcons } from './CategoriesIcon';

export const getIconName = (name) => {
    return categoriesIcons[name.toLowerCase()];
};
