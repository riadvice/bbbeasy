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

import React, { createContext, useContext, useEffect, useState } from 'react';

import SettingsService from '../services/settings.service';

import { SettingsType } from '../types/SettingsType';

type SettingsContextType = {
    settings: SettingsType | null;
};

const SettingsContext = createContext<SettingsContextType>({ settings: null });

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
    const [settings, setSettings] = useState<SettingsType | null>(null);

    useEffect(() => {
        SettingsService.collect_settings()
            .then((response) => setSettings(response.data))
            .catch(() => setSettings(null));

        // Saving the branding announces the new settings, so what the footer shows
        // follows without a reload.
        return SettingsService.on_settings_updated((updated) => setSettings(updated));
    }, []);

    return <SettingsContext.Provider value={{ settings }}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => useContext(SettingsContext);
