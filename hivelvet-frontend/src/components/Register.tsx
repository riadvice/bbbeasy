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

 import React, { Component } from 'react';
 import { Link } from 'react-router-dom';
 import ReactDOMServer from 'react-dom/server';
 import AuthService from '../services/auth.service';
 
 import { Form, Input, Button, Checkbox, Alert, Col, Row, Typography, Card, Result } from 'antd';
 import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
 import { T } from '@transifex/react';
 
 const { Title, Paragraph } = Typography;
 
 type Props = {};
 
 type State = {
     successful?: boolean;
     message?: string;
     errors?: any;
 };
 
 class Register extends Component<Props, State> {
     constructor(props: Props) {
         super(props);
         this.handleRegistration = this.handleRegistration.bind(this);
         this.state = {
             successful: false,
             message: '',
             errors:[]
         };
     }
 
     handleRegistration(formValue: any) {
         AuthService.register(formValue)
             .then((response) => {
                 const responseMessage = response.data.message;
                 this.setState({
                     successful: true,
                     message: responseMessage,
                 });
             })
             .catch((error) => {
                 this.setState({
                     errors: []
                 });
                 const response = error.response.data;
                 if (response.errors) {
                     const errors = Object.values(response.errors);
                     const err = [];
                     errors.forEach(function (value : any) {
                         const keys = Object.keys(value);
                         keys.forEach(function (key) {
                             err.push(value[key]);
                         });
                     });
                     this.setState({
                         errors: err
                     });
                 }
 
                 const responseMessage = response.message;
                 this.setState({
                     successful: false,
                     message: responseMessage,
                 });
             });
     }
 
     render() {
         const { successful, message, errors } = this.state;
         const initialValues = {
             username: '',
             email: '',
             password: '',
             confirmPassword: '',
             agreement: false
         };
 
         return (
             <Row>
                 { successful ?
                     <Col span={10} offset={7} className="section-top">
                         <Result
                             status="success"
                             title="Registration completed successfully"
                             subTitle={message}
                             extra={
                                 <Link to={'/login'} className="ant-btn ant-btn-lg">
                                     Login now
                                 </Link>
                             }
                         />
                     </Col>
                     :
                     <Col span={8} offset={8} className="section-top">
                         <Card className="form-content">
                             <Paragraph className="form-header text-center">
                                 <img className="form-img" src="images/logo_02.png" alt="Logo" />
                                 <Title level={4}>
                                     {' '}
                                     <T _str="Sign Up" />
                                 </Title>
                             </Paragraph>
 
                             {errors.length > 0 && (
                                 <Alert
                                     type="error"
                                    className="alert-msg"
                                    message={errors.length > 1 ? (
                                        <ul className="errors-list">
                                            {errors.map((item,index) => (
                                                <li key={index}>{item}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <T _str={errors.toString()} />
                                    )}
                                    showIcon
                                 />
                             )}
 
                             {message && (
                                 <Alert type="error" className="alert-msg" message={<T _str={message} />} showIcon />
                             )}
 
                             <Form
                                 layout="vertical"
                                 name="register"
                                 className="register-form"
                                 
                                 initialValues={initialValues}
                                 requiredMark={false}
                                 scrollToFirstError={true}
                                 validateTrigger="onSubmit"
                                 
                                 onFinish={this.handleRegistration}
                             >
                                 <Form.Item
                                     label={<T _str="Username" />}
                                     name="username"
                                     rules={[
                                         {
                                             required: true,
                                             message: <T _str="Username is required" />,
                                         },
                                     ]}
                                 >
                                     <Input placeholder="Username" />
                                 </Form.Item>
                                 <Form.Item
                                     label={<T _str="Email" />}
                                     name="email"
                                     rules={[
                                         {
                                             type: 'email',
                                             message: <T _str="Invalid Email" />,
                                         },
                                         {
                                             required: true,
                                             message: <T _str="Email is required" />,
                                         },
                                     ]}
                                 >
                                     <Input placeholder="Email" />
                                 </Form.Item>
                                 <Form.Item
                                     label={<T _str="Password" />}
                                     name="password"
                                     rules={[
                                         {
                                             min: 4,
                                             message: <T _str="Password must be at least 4 characters" />,
                                         },
                                         {
                                             required: true,
                                             message: <T _str="Password is required" />,
                                         },
                                     ]}
                                 >
                                     <Input.Password
                                         placeholder="**********"
                                         iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                                     />
                                 </Form.Item>
                                 <Form.Item
                                     label={<T _str="Confirm Password" />}
                                     name="confirmPassword"
                                     dependencies={['password']}
                                     rules={[
                                         {
                                             min: 4,
                                             message: <T _str="Confirm password must be at least 4 characters" />,
                                         },
                                         {
                                             required: true,
                                             message: <T _str="Confirm password is required" />,
                                         },
                                         ({ getFieldValue }) => ({
                                             validator(_, value) {
                                                 if (!value || getFieldValue('password') === value) {
                                                     return Promise.resolve();
                                                 }
                                                 return Promise.reject(
                                                     ReactDOMServer.renderToString(
                                                         <T _str="The two passwords that you entered do not match" />
                                                     )
                                                 );
                                             },
                                         }),
                                     ]}
                                 >
                                     <Input.Password placeholder="**********" />
                                 </Form.Item>
 
                                 <Form.Item
                                     className="form-agree"
                                     name="agreement"
                                     valuePropName="checked"
                                     rules={[
                                         {
                                             validator: (_, value) =>
                                                 value
                                                     ? Promise.resolve()
                                                     : Promise.reject(
                                                           new Error(
                                                               ReactDOMServer.renderToString(
                                                                   <T _str="Should accept the agreement" />
                                                               )
                                                           )
                                                       ),
                                         },
                                     ]}
                                 >
                                     <Checkbox>
                                         <T _str="I agree to the" />
                                         <a href="#">
                                             {' '}
                                             <T _str="Terms of Service" />
                                         </a>{' '}
                                         <T _str="and" />{' '}
                                         <a href="#">
                                             {' '}
                                             <T _str="Privacy Policy" />
                                         </a>
                                     </Checkbox>
                                 </Form.Item>
 
                                 <Form.Item>
                                     <Button type="primary" htmlType="submit" block>
                                         <T _str="Register" />
                                     </Button>
                                 </Form.Item>
                             </Form>
                         </Card>
                     </Col>
                 }
             </Row>
         );
     }
 }
 
 export default Register;
 
 