<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.tn/
 *
 * Copyright (c) 2022-2023 RIADVICE SUARL and by respective authors (see below).
 *
 * This program is free software; you can redistribute it and/or modify it under the
 * terms of the GNU Lesser General Public License as published by the Free Software
 * Foundation; either version 3.0 of the License, or (at your option) any later
 * version.
 *
 * BBBEasy is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
 * PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License along
 * with BBBEasy; if not, see <http://www.gnu.org/licenses/>.
 */

namespace Utils;

use Data\PresetData;
use Enum\Presets\Audio;
use Enum\Presets\Branding;
use Enum\Presets\BreakoutRooms;
use Enum\Presets\General;
use Enum\Presets\GuestPolicy;
use Enum\Presets\LearningDashboard;
use Enum\Presets\LockSettings;
use Enum\Presets\Presentation;
use Enum\Presets\Recording;
use Enum\Presets\Webcams;

class PresetProcessor
{
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
        $presetsData       = new PresetData();
        $preparePresetData = $this->preparePresetData($preset);

        // Set the preset data
        $presetsData->setData(Audio::GROUP_NAME, Audio::USERS_JOIN_MUTED, $preparePresetData[Audio::GROUP_NAME][Audio::USERS_JOIN_MUTED]);
        $presetsData->setData(Audio::GROUP_NAME, Audio::MODERATORS_ALLOWED_TO_UNMUTE_USERS, $preparePresetData[Audio::GROUP_NAME][Audio::MODERATORS_ALLOWED_TO_UNMUTE_USERS]);

        $presetsData->setData(Branding::GROUP_NAME, Branding::LOGO, $preparePresetData[Branding::GROUP_NAME][Branding::LOGO]);
        $presetsData->setData(Branding::GROUP_NAME, Branding::BANNER_COLOR, $preparePresetData[Branding::GROUP_NAME][Branding::BANNER_COLOR]);
        $presetsData->setData(Branding::GROUP_NAME, Branding::BANNER_TEXT, $preparePresetData[Branding::GROUP_NAME][Branding::BANNER_TEXT]);

        $presetsData->setData(BreakoutRooms::GROUP_NAME, BreakoutRooms::CONFIGURABLE, $preparePresetData[BreakoutRooms::GROUP_NAME][BreakoutRooms::CONFIGURABLE]);
        $presetsData->setData(BreakoutRooms::GROUP_NAME, BreakoutRooms::RECORDING, $preparePresetData[BreakoutRooms::GROUP_NAME][BreakoutRooms::RECORDING]);
        $presetsData->setData(BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT, $preparePresetData[BreakoutRooms::GROUP_NAME][BreakoutRooms::PRIVATE_CHAT]);

        $presetsData->setData(General::GROUP_NAME, General::DURATION, $preparePresetData[General::GROUP_NAME][General::DURATION]);

        $presetsData->setData(General::GROUP_NAME, General::MAXIMUM_PARTICIPANTS, $preparePresetData[General::GROUP_NAME][General::MAXIMUM_PARTICIPANTS]);

        $presetsData->setData(GuestPolicy::GROUP_NAME, GuestPolicy::POLICY, $preparePresetData[GuestPolicy::GROUP_NAME][GuestPolicy::POLICY]);

        $presetsData->setData(LearningDashboard::GROUP_NAME, LearningDashboard::CONFIGURABLE, $preparePresetData[LearningDashboard::GROUP_NAME][LearningDashboard::CONFIGURABLE]);
        $presetsData->setData(LearningDashboard::GROUP_NAME, LearningDashboard::CLEANUP_DELAY, $preparePresetData[LearningDashboard::GROUP_NAME][LearningDashboard::CLEANUP_DELAY]);

        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::WEBCAMS, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::WEBCAMS]);
        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::MICROPHONES, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::MICROPHONES]);
        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::PRIVATE_CHAT, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::PRIVATE_CHAT]);
        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::PUBLIC_CHAT, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::PUBLIC_CHAT]);
        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::SHARED_NOTES, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::SHARED_NOTES]);
        $presetsData->setData(LockSettings::GROUP_NAME, LockSettings::LAYOUT, $preparePresetData[LockSettings::GROUP_NAME][LockSettings::LAYOUT]);

        $presetsData->setData(Presentation::GROUP_NAME, Presentation::PRE_UPLOAD, $preparePresetData[Presentation::GROUP_NAME][Presentation::PRE_UPLOAD]);

        $presetsData->setData(Recording::GROUP_NAME, Recording::AUTO_START, $preparePresetData[Recording::GROUP_NAME][Recording::AUTO_START]);
        $presetsData->setData(Recording::GROUP_NAME, Recording::ALLOW_START_STOP, $preparePresetData[Recording::GROUP_NAME][Recording::ALLOW_START_STOP]);
        $presetsData->setData(Recording::GROUP_NAME, Recording::RECORD, $preparePresetData[Recording::GROUP_NAME][Recording::RECORD]);

        $presetsData->setData(Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY, $preparePresetData[Webcams::GROUP_NAME][Webcams::VISIBLE_FOR_MODERATOR_ONLY]);
        $presetsData->setData(Webcams::GROUP_NAME, Webcams::MODERATOR_ALLOWED_CAMERA_EJECT, $preparePresetData[Webcams::GROUP_NAME][Webcams::MODERATOR_ALLOWED_CAMERA_EJECT]);

        // Get preset data to create meeting parameters
        $createParams->setMuteOnStart($presetsData->getData(Audio::GROUP_NAME, Audio::USERS_JOIN_MUTED));

        $createParams->setAllowModsToUnmuteUsers($presetsData->getData(Audio::GROUP_NAME, Audio::MODERATORS_ALLOWED_TO_UNMUTE_USERS));
        // $createParams->setListenOnlyEnabled($presetData->getData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED));
        // $createParams->setSkipEchoTest($presetData->getData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST));

        $createParams->setLogo($presetsData->getData(Branding::GROUP_NAME, Branding::LOGO));
        $createParams->setBannerText($presetsData->getData(Branding::GROUP_NAME, Branding::BANNER_TEXT));
        $createParams->setBannerColor($presetsData->getData(Branding::GROUP_NAME, Branding::BANNER_COLOR));
        // $createParams->setUseAvatars($presetsData->getData(Branding::GROUP_NAME, Branding::USE_AVATARS));

        $createParams->setBreakoutRoomsEnabled($presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::CONFIGURABLE));
        $createParams->setBreakoutRoomsRecord($presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::RECORDING));

        $createParams->setBreakoutRoomsPrivateChatEnabled(null !== $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT) ? $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT) : true);

        $createParams->setDuration($presetsData->getData(General::GROUP_NAME, General::DURATION));
        $createParams->setMaxParticipants($presetsData->getData(General::GROUP_NAME, General::MAXIMUM_PARTICIPANTS));
        // $createParams->setOpenForEveryone($presetData->getData(General::GROUP_NAME, General::OPEN_FOR_EVERYONE));
        // anyone_can_start,open_for_everyone,logged_in_users_only

        $createParams->setGuestPolicy($presetsData->getData(GuestPolicy::GROUP_NAME, GuestPolicy::POLICY));
        // configurable

        // language:default_language
        // layout: presentation,participants,chat,navigation_bar,actions_bar

        $createParams->setLearningDashboardEnabled($presetsData->getData(LearningDashboard::GROUP_NAME, LearningDashboard::CONFIGURABLE));
        $createParams->setLearningDashboardCleanupDelayInMinutes($presetsData->getData(LearningDashboard::GROUP_NAME, LearningDashboard::CLEANUP_DELAY));

        $createParams->setLockSettingsDisableCam($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::WEBCAMS));
        $createParams->setLockSettingsDisableMic($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::MICROPHONES));
        $createParams->setLockSettingsDisablePrivateChat($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PRIVATE_CHAT));
        $createParams->setLockSettingsDisablePublicChat($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PUBLIC_CHAT));
        $createParams->setLockSettingsDisableNote($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::SHARED_NOTES));
        $createParams->setLockSettingsLockedLayout($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::LAYOUT));

        // $createParams->setPreUploadedPresentationOverrideDefault($presetsData->getData(Presentation::GROUP_NAME, Presentation::PRE_UPLOAD));

        $createParams->setAutoStartRecording($presetsData->getData(Recording::GROUP_NAME, Recording::AUTO_START));
        $createParams->setAllowStartStopRecording($presetsData->getData(Recording::GROUP_NAME, Recording::ALLOW_START_STOP));
        $createParams->setRecord($presetsData->getData(Recording::GROUP_NAME, Recording::RECORD));

        // Screenshare:configurable
        // UserExperience: keyboard_shortcuts,ask_for_feedback

        $createParams->setWebcamsOnlyForModerator($presetsData->getData(Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY));
        // $createParams->setAllowModsToEjectCameras($presetsData->getData(Webcams::GROUP_NAME, Webcams::MODERATOR_ALLOWED_CAMERA_EJECT));
        // configurable,auto_share,skip_preview

        // Whiteboard:multi_user_pen_only,presenter_tools,multi_user_tools
        // Zcaleright: poolname*/

        return $createParams;
    }

    public function toJoinParameters($preset, $joinParams)
    {
        $presetsData       = new PresetData();
        $preparePresetData = $this->preparePresetData($preset);

        // Set the preset data
        $presetsData->setData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED, $preparePresetData[Audio::GROUP_NAME][Audio::LISTEN_ONLY_ENABLED]);
        $presetsData->setData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST, $preparePresetData[Audio::GROUP_NAME][Audio::SKIP_ECHO_TEST]);

        $joinParams->addUserData('bbb_force_listen_only', $presetsData->getData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED));

        $joinParams->addUserData('bbb_skip_check_audio', $presetsData->getData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST));
        $joinParams->setRedirect(false);

        return $joinParams;
    }
}
