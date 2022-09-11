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
import Input from "antd/lib/input";
import Button from "antd/lib/button";
import Dropdown from "antd/lib/dropdown";
import Panel from "rc-color-picker/lib/Panel";

export default function InputColor(props) {
  const { defaultColor, onChange, ...restProps } = props;

  const [internalColor, setInternalColor] = React.useState<string>(defaultColor);

  const handleChange = ({ color }) => {
    setInternalColor(color);
    if(onChange)
    {
      onChange(color);
    }
  };

  const overlay = (
    <div>
      <Panel
        color={internalColor}
        enableAlpha={false}
        onChange={handleChange}
      />
    </div>
  );

  return (
    <Input
      {...restProps}
      disabled
      value={internalColor}
      suffix={
        <Dropdown trigger={["click"]} overlay={overlay}>
          <Button style={{ background: internalColor }}> </Button>
        </Dropdown>
      }
    />
  );
}
