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

import { Component } from "react";
import {Link} from "react-router-dom";

import AuthService from "../services/auth.service";
import { Formik, Field, Form, ErrorMessage } from "formik";
import * as Yup from 'yup';

type Props = {};

type State = {
    email?: string;
    password?: string;
    successful: boolean;
    message: string;
};

class Login extends Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.handleLogin = this.handleLogin.bind(this);
        this.state = {
            email: '',
            password: '',
            successful: false,
            message: ''
        };
    }

    validationSchema() {
        return Yup.object().shape({
            email: Yup.string()
                .required('Email is required')
                .email('Email is invalid'),
            password: Yup.string()
                .required('Password is required')
                .min(4, 'Password must be at least 4 characters')
        });
    }

    handleLogin(formValue: { email: string; password: string }) {
        const { email, password } = formValue;
        AuthService.login(email, password)
            .then(response => {
                const responseMessage = response.data.message;
                this.setState({
                    successful: true,
                    message: responseMessage
                });
                const user = response.data.user;
                localStorage.setItem("user", JSON.stringify(user));
            })
            .catch(error => {
                const responseMessage = error.response.data.message;
                this.setState({
                    successful: false,
                    message: responseMessage
                });
            });
    }

    render() {
        const { successful, message } = this.state;
        const initialValues = {
            email: '',
            password: '',
            successful: false,
            message: ''
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
                                        { message &&
                                            <div className={ successful ? 'alert alert-success' : 'alert alert-danger'}>
                                                { message }
                                            </div>
                                        }
                                        <Formik
                                            initialValues={initialValues}
                                            validationSchema={this.validationSchema}
                                            onSubmit={this.handleLogin}>
                                            {({ errors, touched }) => (
                                                <Form>
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor="user_email">Email</label>
                                                        <Field type="email" name="email" id="user_email" className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}/>
                                                        <ErrorMessage name="email" component="div" className="invalid-feedback"/>
                                                    </div>
                                                    <div className="form-group">
                                                        <label className="form-label" htmlFor="user_password">Password</label>
                                                        <Field type="password" name="password" id="user_password" className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}/>
                                                        <ErrorMessage name="password" component="div" className="invalid-feedback"/>
                                                    </div>
                                                    <div className="pricing-table-cta mb-8">
                                                        <button
                                                            className="button button-primary button-shadow button-block submit-btn">
                                                            Login now
                                                        </button>
                                                    </div>
                                                </Form>
                                            )}
                                        </Formik>
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
}

export default Login;
