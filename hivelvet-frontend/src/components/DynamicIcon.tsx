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

import React, {Component} from "react";
import Icon from '@ant-design/icons';
import * as AntdIcons from '@ant-design/icons';
import ZcaleRight from "../icons/Icon_ZcaleRight.png";

type Props = {
 type: string;
 className?: string;
 iconClassName?: string;
};
type State = {};

class DynamicIcon extends Component<Props, State> {

 render() {
     const {type, className, iconClassName } = this.props;
     const AntdIcon = AntdIcons[type];
     if (type == 'ZcaleRight') {
         const ZcaleRightIcon = () => (
             <img src={ZcaleRight} className={iconClassName}/>
         );
         return <Icon component={ZcaleRightIcon} className={className} />
     }
     else {
         return <AntdIcon className={className} />;
     }
 }
}

export default DynamicIcon;