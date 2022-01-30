import axios from 'axios';

const API_URL = 'http://api.hivelvet.test';

class AuthService {
    register(username: string, email: string, password: string, confirmPassword: string) {
        return axios.post(API_URL + '/account/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
    login(email: string, password: string) {
        return axios.post(API_URL + '/account/login', {
            email,
            password,
        });
    }
    logout() {
        localStorage.removeItem('user');
    }

    reset_password(email: string) {
        return axios.post(API_URL + '/account/reset', {
            email,
        });
    }
    change_password(token: string, password: string) {
        return axios.post(API_URL + '/account/change_password', {
            token,
            password,
        });
    }
    getUser(token: string) {
        return axios.get(API_URL + '/account/get_user_token?token=' + token, {});
    }
    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
}

export default new AuthService();
