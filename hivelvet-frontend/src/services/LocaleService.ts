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

import { tx } from '@transifex/native';

localStorage.getItem('locale')
    ? tx.setCurrentLocale(localStorage.getItem('locale'))
    : tx.setCurrentLocale(navigator.language);
class LocaleService {
    language: any = localStorage.getItem('locale') != null ? localStorage.getItem('locale') : navigator.language;

    direction: any = this.language !== 'ar' ? 'ltr' : 'rtl';

    antdlocale: any = this.language.includes('en') ? enUS : this.language.includes('fr') ? frFR : arEG;
    changeLocale(locale) {
        moment.locale(locale);
        tx.setCurrentLocale(locale);

        this.language = locale;
        this.direction = locale === 'ar' ? 'rtl' : 'ltr';
        localStorage.setItem('locale', this.language);
        this.antdlocale = this.language.includes('en') ? enUS : this.language.includes('fr') ? frFR : arEG;
    }
}

export default new LocaleService();
