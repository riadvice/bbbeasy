<?php

declare(strict_types=1);

/*
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

namespace Utils;

class PresetProcessor
{
    public function __construct()
    {
    }

    public function preparePresetData($preset)
    {
        $data = [];
        foreach ($preset['categories'] as $category) {
            if ($category['enabled']) {
                $subs = [];
                foreach ($category['subcategories'] as $subcategory) {
                    $subs[$subcategory['name']] = $subcategory['value'];
                }

                $data[$category['name']] = $subs;
            }
        }

        return $data;
    }

    public function toCreateMeetingParams($preset)
    {
        $presetData = $this->preparePresetData($preset);

        return [
            'muteOnStart'                            => $presetData['Audio'] ? ($presetData['Audio']['users_join_muted'] ? true : false) : null,
            'allowModsToUnmuteUsers'                 => $presetData['Audio'] ? ($presetData['Audio']['moderators_allowed_to_unmute_users'] ? true : false) : null,
            // auto_join,listen_only_enabled,skip_echo_test

            'logo'                                   => $presetData['Branding'] ? $presetData['Branding']['logo'] : null,
            'bannerText'                             => $presetData['Branding'] ? $presetData['Branding']['banner_text'] : null,
            'bannerColor'                            => $presetData['Branding'] ? $presetData['Branding']['banner_color'] : null,
            // title,use_avatars,custom_css

            'breakoutRoomsEnabled'                   => $presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['configurable'] ? true : false) : null,
            'breakoutRoomsRecord'                    => $presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['recording'] ? true : false) : null,
            'breakoutRoomsPrivateChatEnabled'        => $presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['private_chat'] ? true : false) : null,

            'duration'                               => $presetData['General'] ? $presetData['General']['duration'] : null,
            'maxParticipants'                        => $presetData['General'] ? $presetData['General']['maximum_participants'] : null,
            // anyone_can_start,open_for_everyone,logged_in_users_only

            'guestPolicy'                            => $presetData['Guest Policy'] ? $presetData['Guest Policy']['policy'] : null,
            // configurable

            // language:default_language
            // layout: presentation,participants,chat,navigation_bar,actions_bar

            'learningDashboardEnabled'               => $presetData['learning_dashboard'] ? ($presetData['learning_dashboard']['configurable'] ? true : false) : null,
            'cleeanupDelay'                          => $presetData['learning_dashboard'] ? $presetData['learning_dashboard']['cleanup_delay'] : null,

            'lockSettingsDisableCam'                 => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['webcams'] ? true : false) : null,
            'lockSettingsDisableMic'                 => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['microphones'] ? true : false) : null,
            'lockSettingsDisablePrivateChat'         => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['private_chat'] ? true : false) : null,
            'lockSettingsDisablePublicChat'          => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['public_chat'] ? true : false) : null,
            'lockSettingsDisableNote'                => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['shared_notes'] ? true : false) : null,
            'lockSettingsLockedLayout'               => $presetData['Lock Settings'] ? ($presetData['Lock Settings']['layout'] ? true : false) : null,

            'preUploadedPresentationOverrideDefault' => $presetData['presentation'] ? ($presetData['presentation']['pre_upload'] ? true : false) : null,

            'autoStartRecording'                     => $presetData['Recording'] ? ($presetData['Recording']['auto_start'] ? true : false) : null,
            'allowStartStopRecording'                => $presetData['Recording'] ? ($presetData['Recording']['allow_start_stop'] ? true : false) : null,
            'record'                                 => $presetData['recording'] ? ($presetData['recording']['configurable'] ? true : false) : null,

            // Screenshare:configurable

            'attendeePW'                             => $presetData['Security'] ? $presetData['Security']['password_for_attendee'] : null,
            'moderatorPW'                            => $presetData['Security'] ? $presetData['Security']['password_for_moderator'] : null,
            // attendeePW & moderatorPW should are boolean or string password in presets

            // UserExperience: keyboard_shortcuts,ask_for_feedback

            'webcamsOnlyForModerator'                => $presetData['Webcams'] ? ($presetData['Webcams']['visible_for_moderator_only'] ? true : false) : null,
            'allowModsToEjectCameras'                => $presetData['Webcams'] ? ($presetData['Webcams']['moderator_allowed_camera_eject'] ? true : false) : null,
            // configurable,auto_share,skip_preview

            // Whiteboard:multi_user_pen_only,presenter_tools,multi_user_tools
            // Zcaleright: poolname
        ];
    }
}
