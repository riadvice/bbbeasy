import { categoriesIcons } from './CategoriesIcon';
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const getRandomString = () => {
    let result = '';
    for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        if (j != 2) {
            result += '-';
        }
    }
    return result;
};
