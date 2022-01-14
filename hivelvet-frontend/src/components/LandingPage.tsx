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

import React,{Component} from 'react';
import { Link} from "react-router-dom";

class LandingPage extends Component<any, any> {

    render() {
        return (
            <section className="hero">
                <div className="container">
                    <div className="hero-inner">
                        <div className="hero-copy">
                            <h1 className="hero-title mt-0">Welcome to Hivelvet Application</h1>
                            <p className="hero-paragraph">
                                The new rooms experience for BigBlueButton.<br></br>
                                New Open-source and simple portal for Web conference BBB.<br></br><br></br>
                            </p>
                            <div className="hero-cta">
                                <Link className={"button button-primary"} to={"/login"}> Sign in </Link>
                                <Link className={"button"} to={"/register"}> Sign up </Link>
                            </div>
                        </div>
                        <div className="hero-figure anime-element">
                            <svg className="placeholder" width="528" height="396" viewBox="0 0 528 396">
                                <rect width="528" height="396" className="home-transparent"/>
                            </svg>
                            <div className="hero-figure-box hero-figure-box-01" data-rotation="45deg"></div>
                            <div className="hero-figure-box hero-figure-box-02" data-rotation="-45deg"></div>
                            <div className="hero-figure-box hero-figure-box-03" data-rotation="0deg"></div>
                            <div className="hero-figure-box hero-figure-box-04" data-rotation="-135deg"></div>
                            <div className="hero-figure-box hero-figure-box-05"></div>
                            <div className="hero-figure-box hero-figure-box-06"></div>
                            <div className="hero-figure-box hero-figure-box-07"></div>
                            <div className="hero-figure-box hero-figure-box-08" data-rotation="-22deg"></div>
                            <div className="hero-figure-box hero-figure-box-09" data-rotation="-52deg"></div>
                            <div className="hero-figure-box hero-figure-box-10" data-rotation="-50deg"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
}
export default LandingPage;