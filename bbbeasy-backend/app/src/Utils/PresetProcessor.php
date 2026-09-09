<?php

declare(strict_types=1);

/*
 * BBBEasy open source platform - https://riadvice.com/
 *
 * Copyright (c) 2022-2026 RIADVICE SUARL and by respective authors (see below).
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

use BigBlueButton\Enum\Feature;
use BigBlueButton\Enum\GuestPolicy as BBBGuestPolicy;
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
use Enum\Presets\Screenshare;
use Enum\Presets\Security;
use Enum\Presets\UserExperience;
use Enum\Presets\Webcams;
use Enum\Presets\Whiteboard;

class PresetProcessor
{
    /**
     * Preset settings handed to BigBlueButton, in the order they are read.
     */
    private const SETTINGS = [
        [Audio::GROUP_NAME, Audio::USERS_JOIN_MUTED],
        [Audio::GROUP_NAME, Audio::MODERATORS_ALLOWED_TO_UNMUTE_USERS],
        [Branding::GROUP_NAME, Branding::LOGO],
        [Branding::GROUP_NAME, Branding::BANNER_COLOR],
        [Branding::GROUP_NAME, Branding::BANNER_TEXT],
        [BreakoutRooms::GROUP_NAME, BreakoutRooms::CONFIGURABLE],
        [BreakoutRooms::GROUP_NAME, BreakoutRooms::RECORDING],
        [BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT],
        [General::GROUP_NAME, General::DURATION],
        [General::GROUP_NAME, General::MAXIMUM_PARTICIPANTS],
        [General::GROUP_NAME, General::WELCOME],
        [GuestPolicy::GROUP_NAME, GuestPolicy::POLICY],
        [LearningDashboard::GROUP_NAME, LearningDashboard::CONFIGURABLE],
        [LearningDashboard::GROUP_NAME, LearningDashboard::CLEANUP_DELAY],
        [LockSettings::GROUP_NAME, LockSettings::WEBCAMS],
        [LockSettings::GROUP_NAME, LockSettings::MICROPHONES],
        [LockSettings::GROUP_NAME, LockSettings::PRIVATE_CHAT],
        [LockSettings::GROUP_NAME, LockSettings::PUBLIC_CHAT],
        [LockSettings::GROUP_NAME, LockSettings::SHARED_NOTES],
        [LockSettings::GROUP_NAME, LockSettings::LAYOUT],
        [Presentation::GROUP_NAME, Presentation::PRE_UPLOAD],
        [Recording::GROUP_NAME, Recording::AUTO_START],
        [Recording::GROUP_NAME, Recording::ALLOW_START_STOP],
        [Recording::GROUP_NAME, Recording::RECORD],
        [Security::GROUP_NAME, Security::PASSWORD_FOR_MODERATOR],
        [Security::GROUP_NAME, Security::PASSWORD_FOR_ATTENDEE],
        [Screenshare::GROUP_NAME, Screenshare::CONFIGURABLE],
        [Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY],
        [Webcams::GROUP_NAME, Webcams::MODERATOR_ALLOWED_CAMERA_EJECT],
    ];

    /**
     * Settings BigBlueButton expects unset rather than zero.
     */
    private const EMPTY_IS_NULL = [
        General::DURATION,
        General::MAXIMUM_PARTICIPANTS,
    ];

    /**
     * Settings of the enabled categories of a preset, keyed by category and by name.
     *
     * @param mixed $preset
     */
    public function preparePresetData($preset): array
    {
        $data = [];

        foreach ($preset['categories'] ?? [] as $category) {
            if (!$category['enabled']) {
                continue;
            }

            $data[$category['name']] = array_column($category['subcategories'], 'value', 'name');
        }

        return $data;
    }

    public function toCreateMeetingParams($preset, $createParams)
    {
        $disabledFeatures  = [];
        $presetsData       = new PresetData();
        $preparePresetData = $this->preparePresetData($preset);

        // Set the preset data
        foreach (self::SETTINGS as [$group, $setting]) {
            // A category the user disabled is simply absent from the preset.
            $value = $preparePresetData[$group][$setting] ?? null;

            if (\in_array($setting, self::EMPTY_IS_NULL, true)) {
                $value = $value ?: null;
            }

            $presetsData->setData($group, $setting, $value);
        }

        // Get preset data to create meeting parameters
        $createParams->setModeratorPassword((string) $presetsData->getData(Security::GROUP_NAME, Security::PASSWORD_FOR_MODERATOR) ?: DataUtils::generateRandomString());
        $createParams->setAttendeePassword((string) $presetsData->getData(Security::GROUP_NAME, Security::PASSWORD_FOR_ATTENDEE) ?: DataUtils::generateRandomString());

        $createParams->setMuteOnStart((bool) $presetsData->getData(Audio::GROUP_NAME, Audio::USERS_JOIN_MUTED));

        $createParams->setAllowModsToUnmuteUsers((bool) $presetsData->getData(Audio::GROUP_NAME, Audio::MODERATORS_ALLOWED_TO_UNMUTE_USERS));
        // $createParams->setListenOnlyEnabled($presetData->getData(Audio::GROUP_NAME, Audio::LISTEN_ONLY_ENABLED));
        // $createParams->setSkipEchoTest($presetData->getData(Audio::GROUP_NAME, Audio::SKIP_ECHO_TEST));

        $this->setIfFilled($createParams, 'setLogo', $presetsData->getData(Branding::GROUP_NAME, Branding::LOGO));
        $this->setIfFilled($createParams, 'setBannerText', $presetsData->getData(Branding::GROUP_NAME, Branding::BANNER_TEXT));
        $this->setIfFilled($createParams, 'setBannerColor', $presetsData->getData(Branding::GROUP_NAME, Branding::BANNER_COLOR));
        // $createParams->setUseAvatars($presetsData->getData(Branding::GROUP_NAME, Branding::USE_AVATARS));

        $createParams->setBreakoutRoomsEnabled((bool) $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::CONFIGURABLE));
        $createParams->setBreakoutRoomsRecord((bool) $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::RECORDING));

        $createParams->setBreakoutRoomsPrivateChatEnabled(null !== $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT) ? $presetsData->getData(BreakoutRooms::GROUP_NAME, BreakoutRooms::PRIVATE_CHAT) : true);

        // An empty duration or participant limit means "no limit", which BigBlueButton
        // expresses by leaving the parameter out rather than by sending a zero.
        $this->setIfFilled($createParams, 'setDuration', $presetsData->getData(General::GROUP_NAME, General::DURATION), 'int');
        $this->setIfFilled($createParams, 'setMaxParticipants', $presetsData->getData(General::GROUP_NAME, General::MAXIMUM_PARTICIPANTS), 'int');
        $this->setIfFilled($createParams, 'setWelcomeMessage', $presetsData->getData(General::GROUP_NAME, General::WELCOME));

        // $createParams->setOpenForEveryone($presetData->getData(General::GROUP_NAME, General::OPEN_FOR_EVERYONE));
        // anyone_can_start,open_for_everyone,logged_in_users_only

        $guestPolicy = BBBGuestPolicy::tryFrom((string) $presetsData->getData(GuestPolicy::GROUP_NAME, GuestPolicy::POLICY));
        if (null !== $guestPolicy) {
            $createParams->setGuestPolicy($guestPolicy);
        }
        // configurable

        // language:default_language
        // layout: presentation,participants,chat,navigation_bar,actions_bar

        $createParams->setLearningDashboardEnabled((bool) $presetsData->getData(LearningDashboard::GROUP_NAME, LearningDashboard::CONFIGURABLE));
        $createParams->setLearningDashboardCleanupDelayInMinutes((int) $presetsData->getData(LearningDashboard::GROUP_NAME, LearningDashboard::CLEANUP_DELAY));

        $createParams->setLockSettingsDisableCam((bool) $presetsData->getData(LockSettings::GROUP_NAME, LockSettings::WEBCAMS));
        $createParams->setLockSettingsDisableMic((bool) $presetsData->getData(LockSettings::GROUP_NAME, LockSettings::MICROPHONES));
        $createParams->setLockSettingsDisablePrivateChat((bool) $presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PRIVATE_CHAT));
        $createParams->setLockSettingsDisablePublicChat((bool) $presetsData->getData(LockSettings::GROUP_NAME, LockSettings::PUBLIC_CHAT));
        $createParams->setLockSettingsDisableNote((bool) $presetsData->getData(LockSettings::GROUP_NAME, LockSettings::SHARED_NOTES));
        if ($presetsData->getData(LockSettings::GROUP_NAME, LockSettings::LAYOUT)) {
            $disabledFeatures[] = Feature::LAYOUTS;
        }

        // $createParams->setPreUploadedPresentationOverrideDefault($presetsData->getData(Presentation::GROUP_NAME, Presentation::PRE_UPLOAD));

        $createParams->setAutoStartRecording((bool) $presetsData->getData(Recording::GROUP_NAME, Recording::AUTO_START));
        $createParams->setAllowStartStopRecording((bool) $presetsData->getData(Recording::GROUP_NAME, Recording::ALLOW_START_STOP));
        $createParams->setRecord((bool) $presetsData->getData(Recording::GROUP_NAME, Recording::RECORD));
        if (!$presetsData->getData(Screenshare::GROUP_NAME, Screenshare::CONFIGURABLE)) {
            $disabledFeatures[] = Feature::SCREENSHARE;
        }
        $createParams->setDisabledFeatures($disabledFeatures);

        // Screenshare:configurable
        // UserExperience: keyboard_shortcuts,ask_for_feedback

        $createParams->setWebcamsOnlyForModerator((bool) $presetsData->getData(Webcams::GROUP_NAME, Webcams::VISIBLE_FOR_MODERATOR_ONLY));
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

    /**
     * Call a BigBlueButton parameter setter only when the preset actually holds a
     * value, so an empty preset field falls back to the server default instead of
     * sending an empty or zeroed parameter.
     *
     * @param mixed $value
     */
    private function setIfFilled(object $params, string $setter, $value, string $cast = 'string'): void
    {
        if (null === $value || '' === $value) {
            return;
        }

        $params->{$setter}('int' === $cast ? (int) $value : (string) $value);
    }
}
