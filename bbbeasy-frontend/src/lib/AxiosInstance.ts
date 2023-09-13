/**
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Affero General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBeasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */
 
import axios from 'axios'; 
import { apiRoutes } from '../routing/backend-config'; 
 axios.defaults.withCredentials = true;
const interceptor = axios.create();
  const logout=()=> {
        return interceptor.get(apiRoutes.LOGOUT_URL);
    }
interceptor.interceptors.response.use(response => {
   return response;
}, error => {
  if (error.response.status === 401) {
  
  logout()
            .then(() => {
   console.log("Unauthorized");
   
              
                localStorage.removeItem('user');
               
                localStorage.removeItem('session');
                
                window.location.href ='/login';
            })
            .catch((error) => {
                console.log(error);
            });
  
  }
  return error;
});
 
export const axiosInstance = interceptor;
