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
import enUS from 'antd/lib/locale/en_US';
import moment from 'moment';
import frFR from 'antd/lib/locale/fr_FR';

import arEG from 'antd/lib/locale/ar_EG';
import { initReactI18next } from 'react-i18next';

import i18next from 'i18next';
import translationEN from '../locale/en-US.json';
import translationFR from '../locale/fr-FR.json';
import translationAR from '../locale/ar-TN.json';
import languages from '../components/Languages';
import { Locale } from 'antd/lib/locale-provider';
import { DirectionType } from 'antd/lib/config-provider';

i18next.use(initReactI18next).init({
    resources: {
        en: { translation: translationEN },
        fr: { translation: translationFR },
        ar: { translation: translationAR },
    },
    lng: localStorage.getItem('locale'),
    // @todo: put the fallback language in configuration files
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    debug: true,
});

class LocaleService {
    localeMap: object = { 'en': enUS, 'fr': frFR, 'ar': arEG };
    rtlLocales: string[] = ['ar'];
    language: string;
    antdlocale: Locale;
    direction: DirectionType;

    constructor() {
        this.language = localStorage.getItem('locale') != null ? localStorage.getItem('locale') : navigator.language;
        this.setLocale(this.language);
    }

    private getLanguageDirection(locale: string) {
        return !this.rtlLocales.includes(locale) ? 'ltr' : 'rtl';
    }

    private setLocale(language: string) {
        this.direction = this.getLanguageDirection(language);
        this.antdlocale = this.localeMap[language.substring(2)];
    }

    changeLocale(locale: string) {
        const res = languages.filter((item) => item.value == locale);
        i18next.changeLanguage(res[0].key);
        moment.locale(locale);
        this.setLocale(locale);
    }
}

export default new LocaleService();
