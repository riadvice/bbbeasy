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

    public function toCreateMeetingParams($preset, $createParams)
    {
        $presetData = $this->preparePresetData($preset);

        $createParams->setMuteOnStart($presetData['Audio'] ? ($presetData['Audio']['users_join_muted'] ? true : false) : false);
        $createParams->setAllowModsToUnmuteUsers($presetData['Audio'] ? ($presetData['Audio']['moderators_allowed_to_unmute_users'] ? true : false) : false);

        $createParams->setLogo($presetData['Branding'] ? $presetData['Branding']['logo'] : null);
        $createParams->setBannerText($presetData['Branding'] ? $presetData['Branding']['banner_text'] : null);
        $createParams->setBannerColor($presetData['Branding'] ? $presetData['Branding']['banner_color'] : null);

        $createParams->setBreakoutRoomsEnabled($presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['configurable'] ? true : false) : false);
        $createParams->setBreakoutRoomsRecord($presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['recording'] ? true : false) : false);
        $createParams->setBreakoutRoomsPrivateChatEnabled($presetData['Breakout Rooms'] ? ($presetData['Breakout Rooms']['private_chat'] ? true : false) : false);

        $createParams->setDuration($presetData['General'] ? $presetData['General']['duration'] : null);
        $createParams->setMaxParticipants($presetData['General'] ? $presetData['General']['maximum_participants'] : null);
        // anyone_can_start,open_for_everyone,logged_in_users_only

        $createParams->setGuestPolicy($presetData['Guest Policy'] ? $presetData['Guest Policy']['policy'] : null);
        // configurable

        // language:default_language
        // layout: presentation,participants,chat,navigation_bar,actions_bar

        $createParams->setLearningDashboardEnabled($presetData['Learning_dashboard'] ? ($presetData['Learning_dashboard']['configurable'] ? true : false) : false);
        $createParams->setLearningDashboardCleanupDelayInMinutes($presetData['Learning_dashboard'] ? $presetData['Learning_dashboard']['cleanup_delay'] : null);

        $createParams->setLockSettingsDisableCam($presetData['Lock Settings'] ? ($presetData['Lock Settings']['webcams'] ? true : false) : false);
        $createParams->setLockSettingsDisableMic($presetData['Lock Settings'] ? ($presetData['Lock Settings']['microphones'] ? true : false) : false);
        $createParams->setLockSettingsDisablePrivateChat($presetData['Lock Settings'] ? ($presetData['Lock Settings']['private_chat'] ? true : false) : false);
        $createParams->setLockSettingsDisablePublicChat($presetData['Lock Settings'] ? ($presetData['Lock Settings']['public_chat'] ? true : false) : false);
        $createParams->setLockSettingsDisableNote($presetData['Lock Settings'] ? ($presetData['Lock Settings']['shared_notes'] ? true : false) : false);
        $createParams->setLockSettingsLockedLayout($presetData['Lock Settings'] ? ($presetData['Lock Settings']['layout'] ? true : false) : false);

        $createParams->setPreUploadedPresentationOverrideDefault($presetData['presentation'] ? ($presetData['presentation']['pre_upload'] ? true : false) : false);

        $createParams->setAutoStartRecording($presetData['Recording'] ? ($presetData['Recording']['auto_start'] ? true : false) : false);
        $createParams->setAllowStartStopRecording($presetData['Recording'] ? ($presetData['Recording']['allow_start_stop'] ? true : false) : false);
        $createParams->setRecord($presetData['Recording'] ? ($presetData['Recording']['configurable'] ? true : false) : null);

        // Screenshare:configurable
        // UserExperience: keyboard_shortcuts,ask_for_feedback

        $createParams->setWebcamsOnlyForModerator($presetData['Webcams'] ? ($presetData['Webcams']['visible_for_moderator_only'] ? true : false) : false);
        $createParams->setAllowModsToEjectCameras($presetData['Webcams'] ? ($presetData['Webcams']['moderator_allowed_camera_eject'] ? true : false) : false);
        // configurable,auto_share,skip_preview

        // Whiteboard:multi_user_pen_only,presenter_tools,multi_user_tools
        // Zcaleright: poolname

        return $createParams;
    }

    public function toJoinParameters($preset, $joinParams)
    {
        $presetData = $this->preparePresetData($preset);
        $joinParams->setRedirect($presetData['Audio'] ? ($presetData['Audio']['auto_join'] ? true : false) : false);

        return $joinParams;
    }
}
