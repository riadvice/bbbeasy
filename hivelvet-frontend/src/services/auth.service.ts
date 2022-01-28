import axios from 'axios';

const API_URL = 'http://hivelvet.test/';

class AuthService {
    register(username: string, email: string, password: string, confirmPassword: string) {
        return axios.post(API_URL + 'account/api/register', {
            username,
            email,
            password,
            confirmPassword,
        });
    }
    login(email: string, password: string) {
        return axios.post(API_URL + 'account/api/login', {
            email,
            password,
        });
    }
    logout() {
        localStorage.removeItem('user');
    }
    reset_password(email: string) {
        return axios.post(API_URL + 'account/api/reset', {
            email,
        });
    }
    change_password(token: string, password: string) {
        return axios.post(API_URL + 'account/api/change_password', {
            token,
            password,
        });
    }
    getUser(token: string ) {
        return axios.post(API_URL + 'account/api/getuser_token', {
            token,
            
        });
    }
}

export default new AuthService();
