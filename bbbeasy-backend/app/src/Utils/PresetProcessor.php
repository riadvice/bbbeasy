<?php

declare(strict_types=1);

/*
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
 * with BBBeasy. If not, see <https://www.gnu.org/licenses/>
 */

namespace Utils;

use Data\PresetData;
use Enum\Presets\Audio;
use Enum\Presets\Branding;
use Enum\Presets\BreakoutRooms;
use Enum\Presets\General;
use Enum\Presets\GuestPolicy;
use Enum\Presets\Layout;
use Enum\Presets\LearningDashboard;
use Enum\Presets\LockSettings;
use Enum\Presets\Presentation;
use Enum\Presets\Recording;

use Enum\Presets\Security;

use Enum\Presets\Screenshare;
use Enum\Presets\UserExperience;

use Enum\Presets\Webcams;
use Enum\Presets\Whiteboard;

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
        $disabledFeatures  = [];
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

        $presetsData->setData(General::GROUP_NAME, General::DURATION , $preparePresetData[General::GROUP_NAME][General::DURATION]?:null);


        $presetsData->setData(General::GROUP_NAME, General::MAXIMUM_PARTICIPANTS, $preparePresetData[General::GROUP_NAME][General::MAXIMUM_PARTICIPANTS]?:null);

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

        $presetsData->setData(Security::GROUP_NAME,Security::PASSWORD_FOR_MODERATOR,($preparePresetData[Security::GROUP_NAME][Security::PASSWORD_FOR_MODERATOR]));
        $presetsData->setData(Security::GROUP_NAME,Security::PASSWORD_FOR_ATTENDEE, $preparePresetData[Security::GROUP_NAME][Security::PASSWORD_FOR_ATTENDEE] );



        $presetsData->setData(Screenshare::GROUP_NAME, Screenshare::CONFIGURABLE, $preparePresetData[Screenshare::GROUP_NAME][Screenshare::CONFIGURABLE]);

        $presetsData->setData(Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY, $preparePresetData[Webcams::GROUP_NAME][Webcams::VISIBLE_FOR_MODERATOR_ONLY]);
        $presetsData->setData(Webcams::GROUP_NAME, Webcams::MODERATOR_ALLOWED_CAMERA_EJECT, $preparePresetData[Webcams::GROUP_NAME][Webcams::MODERATOR_ALLOWED_CAMERA_EJECT]);

        // Get preset data to create meeting parameters
        $createParams->setModeratorPassword($presetsData->getData(Security::GROUP_NAME,Security::PASSWORD_FOR_MODERATOR)?$presetsData->getData(Security::GROUP_NAME,Security::PASSWORD_FOR_MODERATOR):DataUtils::generateRandomString());
        $createParams->setAttendeePassword($presetsData->getData(Security::GROUP_NAME,Security::PASSWORD_FOR_ATTENDEE)?$presetsData->getData(Security::GROUP_NAME,Security::PASSWORD_FOR_ATTENDEE):DataUtils::generateRandomString());

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
        $createParams->setLearningDashboardCleanupDelayInMinutes($presetsData->getData(LearningDashboard::GROUP_NAME, LearningDashboard::CLEANUP_DELAY)?:null);

        $createParams->setLockSettingsDisableCam($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::WEBCAMS));
        $createParams->setLockSettingsDisableMic($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::MICROPHONES));
        $createParams->setLockSettingsDisablePrivateChat($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PRIVATE_CHAT));
        $createParams->setLockSettingsDisablePublicChat($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PUBLIC_CHAT));
        $createParams->setLockSettingsDisableNote($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::SHARED_NOTES));
        if ($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::LAYOUT)) {
            $disabledFeatures[] = 'layouts';
        }

        // $createParams->setPreUploadedPresentationOverrideDefault($presetsData->getData(Presentation::GROUP_NAME, Presentation::PRE_UPLOAD));

        $createParams->setAutoStartRecording($presetsData->getData(Recording::GROUP_NAME, Recording::AUTO_START));
        $createParams->setAllowStartStopRecording($presetsData->getData(Recording::GROUP_NAME, Recording::ALLOW_START_STOP));
        $createParams->setRecord($presetsData->getData(Recording::GROUP_NAME, Recording::RECORD));
        if (!$presetsData->getData(Screenshare::GROUP_NAME, Screenshare::CONFIGURABLE)) {
            $disabledFeatures[] = 'screenshare';
        }
        $createParams->setDisabledFeatures($disabledFeatures);

        // Screenshare:configurable
        // UserExperience: keyboard_shortcuts,ask_for_feedback

        $createParams->setWebcamsOnlyForModerator($presetsData->getData(Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY));
        $createParams->setAllowModsToEjectCameras($presetsData->getData(Webcams::GROUP_NAME, Webcams::MODERATOR_ALLOWED_CAMERA_EJECT) ? true : false);
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
        $presetsData->setData(Audio::GROUP_NAME, Audio::AUTO_JOIN, $preparePresetData[Audio::GROUP_NAME][Audio::AUTO_JOIN]);
        $presetsData->setData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED, $preparePresetData[Audio::GROUP_NAME][Audio::LISTEN_ONLY_ENABLED]);
        $presetsData->setData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST, $preparePresetData[Audio::GROUP_NAME][Audio::SKIP_ECHO_TEST]);

        $presetsData->setData(Layout::GROUP_NAME, Layout::PRESENTATION, $preparePresetData[Layout::GROUP_NAME][Layout::PRESENTATION]);
        $presetsData->setData(Layout::GROUP_NAME, Layout::PARTICIPANTS, $preparePresetData[Layout::GROUP_NAME][Layout::PARTICIPANTS]);
        $presetsData->setData(Layout::GROUP_NAME, Layout::CHAT, $preparePresetData[Layout::GROUP_NAME][Layout::CHAT]);
        $presetsData->setData(Layout::GROUP_NAME, Layout::NAVIGATION_BAR, $preparePresetData[Layout::GROUP_NAME][Layout::NAVIGATION_BAR]);
        $presetsData->setData(Layout::GROUP_NAME, Layout::ACTIONS_BAR, $preparePresetData[Layout::GROUP_NAME][Layout::ACTIONS_BAR]);

        $presetsData->setData(UserExperience::GROUP_NAME, UserExperience::ASK_FOR_FEEDBACK, $preparePresetData[UserExperience::GROUP_NAME][UserExperience::ASK_FOR_FEEDBACK]);

        $presetsData->setData(Webcams::GROUP_NAME, Webcams::CONFIGURABLE, $preparePresetData[Webcams::GROUP_NAME][Webcams::CONFIGURABLE]);
        $presetsData->setData(Webcams::GROUP_NAME, Webcams::AUTO_SHARE, $preparePresetData[Webcams::GROUP_NAME][Webcams::AUTO_SHARE]);
        $presetsData->setData(Webcams::GROUP_NAME, Webcams::SKIP_PREVIEW, $preparePresetData[Webcams::GROUP_NAME][Webcams::SKIP_PREVIEW]);

        $presetsData->setData(Whiteboard::GROUP_NAME, Whiteboard::MULTI_USER_PEN_ONLY, $preparePresetData[Whiteboard::GROUP_NAME][Whiteboard::MULTI_USER_PEN_ONLY]);

        $joinParams->addUserData('bbb_listen_only_mode', !$presetsData->getData(Audio::GROUP_NAME, Audio::AUTO_JOIN));
        $joinParams->addUserData('bbb_force_listen_only', $presetsData->getData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED));

        $joinParams->addUserData('bbb_skip_check_audio', $presetsData->getData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST) || $presetsData->getData(Audio::GROUP_NAME, Audio::AUTO_JOIN));

        $joinParams->addUserData('bbb_hide_presentation_on_join', !$presetsData->getData(Layout::GROUP_NAME, Layout::PRESENTATION));
        $joinParams->addUserData('bbb_show_participants_on_login', $presetsData->getData(Layout::GROUP_NAME, Layout::PARTICIPANTS));
        $joinParams->addUserData('bbb_show_public_chat_on_login', $presetsData->getData(Layout::GROUP_NAME, Layout::CHAT));
        $joinParams->addUserData('bbb_hide_nav_bar', !$presetsData->getData(Layout::GROUP_NAME, Layout::NAVIGATION_BAR));
        $joinParams->addUserData('bbb_hide_actions_bar', !$presetsData->getData(Layout::GROUP_NAME, Layout::ACTIONS_BAR));

        $joinParams->addUserData('bbb_ask_for_feedback_on_logout', $presetsData->getData(UserExperience::GROUP_NAME, UserExperience::ASK_FOR_FEEDBACK));

        $joinParams->addUserData('bbb_enable_video', $presetsData->getData(Webcams::GROUP_NAME, Webcams::CONFIGURABLE));
        $joinParams->addUserData('bbb_auto_share_webcam', $presetsData->getData(Webcams::GROUP_NAME, Webcams::AUTO_SHARE));
        $joinParams->addUserData('bbb_skip_video_preview', $presetsData->getData(Webcams::GROUP_NAME, Webcams::SKIP_PREVIEW));

        $joinParams->addUserData('bbb_multi_user_pen_only', $presetsData->getData(Whiteboard::GROUP_NAME, Whiteboard::MULTI_USER_PEN_ONLY));

        $joinParams->setRedirect(false);

        return $joinParams;
    }
}
