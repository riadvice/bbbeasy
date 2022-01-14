/**
 * Hivelvet open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * Hivelvet is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with Hivelvet; if not, see <http://www.gnu.org/licenses/>.
 */

import React from "react";
import {Link} from "react-router-dom";
import * as Yup from "yup";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup/dist/yup";
import axios from "axios";

function Login() {
    const validationSchema = Yup.object().shape({
        email: Yup.string()
            .required('Email is required')
            .email('Email is invalid'),
        password: Yup.string()
            .required('Password is required')
            .min(4, 'Password must be at least 4 characters')
    });
    const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(validationSchema) });

    const addReturnBlock = (message : string, typeMessage : string) => {
        var responseElement = document.getElementById('responseServer');
        responseElement?.remove();

        var formElement = document.getElementById('formulaire');
        var divElement = document.createElement('div');
        divElement.id = 'responseServer';
        divElement.className = typeMessage == 'error' ? 'alert alert-danger' : 'alert alert-success';
        divElement.innerHTML = message;
        formElement?.parentNode?.insertBefore(divElement,formElement);
    }

    const onSubmit = (data : any) => {
        let url = 'http://hivelvet.test/account/api/login';
        axios.post(url,data)
            .then(response => {
                const responseMessage = response.data.message;
                const user = response.data.user;
                addReturnBlock(responseMessage,'success');
                localStorage.setItem("user", JSON.stringify(user));
            })
            .catch(error => {
                const responseMessage = error.response.data.message;
                addReturnBlock(responseMessage,'error');
            });
    };
    return (
        <section className="pricing section">
            <div className="container-sm">
                <div className="pricing-inner section-inner section-top">
                    <div className="pricing-header text-center">
                        <h2 className="section-title mt-0">Get started</h2>
                        <p className="section-paragraph mb-0">Sign in to continue to our application </p>
                    </div>
                    <div className="pricing-tables-wrap">
                        <div className="pricing-table page-login">
                            <div className="pricing-table-inner is-revealing">
                                <div className="pricing-table-main">
                                    <form id="formulaire" className="formulaire" method="post" onSubmit={handleSubmit(onSubmit)}>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_email">Email</label>
                                            <input type="text" id="user_email"
                                                   {...register('email')}
                                                   className={`form-control ${errors.email ? 'is-invalid' : ''}`}/>
                                            <div className="invalid-feedback">{errors.email?.message}</div>
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label" htmlFor="user_password">Password</label>
                                            <input type="password" id="user_password"
                                                   {...register('password')}
                                                   className={`form-control ${errors.password ? 'is-invalid' : ''}`}/>
                                            <div className="invalid-feedback">{errors.password?.message}</div>
                                        </div>
                                        <div className="pricing-table-cta mb-8">
                                            <button className="button button-primary button-shadow button-block submit-btn">
                                                Login now
                                            </button>
                                        </div>
                                    </form>
                                    <div className="text-center mt-24">
                                        <span className="text-xs">Dont't have an account ? <Link to={'/register'} className="login-link">Register here</Link></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Login;
