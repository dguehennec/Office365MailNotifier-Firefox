/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is office365 Mail Notifier.
 *
 * The Initial Developer of the Original Code is
 * David GUEHENNEC.
 * Portions created by the Initial Developer are Copyright (C) 2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

"use strict";

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://office365_mail_notifier/constant/office365helper.jsm");
Components.utils.import("resource://office365_mail_notifier/service/util.jsm");

var EXPORTED_SYMBOLS = [ "office365_notifier_Prefs" ];

/**
 * Creates an instance of Prefs.
 *
 * @constructor
 * @this {Prefs}
 */
var office365_notifier_Prefs = {
    _prefs : null,
    _is_first_launch : false,
    _previous_version : 0
};

/**
 * pref identifiers
 *
 * @constant
 */
office365_notifier_Prefs.PREF = {
    // general
    ACCESS_STATUSBAR : "accessStatusBar",
    CURRENT_VERSION : "currentVersion",
    // email
    EMAIL_NOTIFICATION_ENABLED : "systemNotificationEnabled",
    EMAIL_SOUND_ENABLED : "soundEnabled",
    EMAIL_NOTIFICATION_DURATION : "emailNotificationDuration",
    // calendar
    CALENDAR_ENABLED : "calendarEnabled",
    CALENDAR_NOTIFICATION_ENABLED : "calendarSystemNotificationEnabled",
    CALENDAR_SOUND_ENABLED : "calendarSoundEnabled",
    CALENDAR_REMINDER_NB_REPEAT : "calendarReminderRepeatNb",
    // message
    MESSAGE_ENABLED : "messageEnabled",
    MESSAGE_NOTIFICATION_ENABLED : "messageSystemNotificationEnabled",
    MESSAGE_SOUND_ENABLED : "messageSoundEnabled"
};

office365_notifier_Util.deepFreeze(office365_notifier_Prefs.PREF);

/**
 * Load preferences
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.load = function() {
    // email
    this.pref_email_notification_enabled = this._getPref(this.PREF.EMAIL_NOTIFICATION_ENABLED);
    this.pref_email_sound_enabled = this._getPref(this.PREF.EMAIL_SOUND_ENABLED);
    this.pref_email_notification_duration = this._getPref(this.PREF.EMAIL_NOTIFICATION_DURATION);
    // calendar
    this.pref_calendar_enabled = this._getPref(this.PREF.CALENDAR_ENABLED);
    this.pref_calendar_notification_enabled = this._getPref(this.PREF.CALENDAR_NOTIFICATION_ENABLED);
    this.pref_calendar_sound_enabled = this._getPref(this.PREF.CALENDAR_SOUND_ENABLED);
    this.pref_calendar_reminder_nb_repeat = this._getPref(this.PREF.CALENDAR_REMINDER_NB_REPEAT);
    // message
    this.pref_message_enabled = this._getPref(this.PREF.MESSAGE_ENABLED);
    this.pref_message_notification_enabled = this._getPref(this.PREF.MESSAGE_NOTIFICATION_ENABLED);
    this.pref_message_sound_enabled = this._getPref(this.PREF.MESSAGE_SOUND_ENABLED);
    // general
    this.pref_access_statusBar = this._getPref(this.PREF.ACCESS_STATUSBAR);

    // Get the previous version
    this._previous_version = this._getPref(this.PREF.CURRENT_VERSION);

    // Check if this is the first time the extension is started
    if (!this._previous_version) {
        this._is_first_launch = true;
    }
    // Set the current version
    this.pref_current_version = office365_notifier_Constant.VERSION;
    this._prefs.setIntPref(this.PREF.CURRENT_VERSION, this.pref_current_version);
};

/**
 * Initialize preference object, listen for preference change
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.init = function() {
    if (!this._prefs) {
        this._prefs = Services.prefs.getBranch("extensions.office365_mail_notifier.");
        this._prefs.addObserver("", this, false);
    }
    this.load();
};

/**
 * Remove observer, called from shutdown
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.release = function() {
    if (this._prefs) {
        this._prefs.removeObserver("", this);
        this._prefs = null;
    }
};

/**
 * Observe for preference change
 *
 * @this {Prefs}
 */
office365_notifier_Prefs.observe = function(subject, topic, data) {

    if (!this._prefs || topic !== "nsPref:changed") {
        return;
    }

    switch (data) {

    // email
    case this.PREF.EMAIL_NOTIFICATION_ENABLED:
        this.pref_email_notification_enabled = this._getPref(data);
        break;

    case this.PREF.EMAIL_SOUND_ENABLED:
        this.pref_email_sound_enabled = this._getPref(data);
        break;

    case this.PREF.EMAIL_NOTIFICATION_DURATION:
        this.pref_email_notification_duration = this._getPref(data);
        break;

    // general
    case this.PREF.ACCESS_STATUSBAR:
        this.pref_access_statusBar = this._getPref(data);
        break;

    // calendar
    case this.PREF.CALENDAR_ENABLED:
        this.pref_calendar_enabled = this._getPref(data);
        break;

    case this.PREF.CALENDAR_NOTIFICATION_ENABLED:
        this.pref_calendar_notification_enabled = this._getPref(data);
        break;

    case this.PREF.CALENDAR_SOUND_ENABLED:
        this.pref_calendar_sound_enabled = this._getPref(data);
        break;

    case this.PREF.CALENDAR_REMINDER_NB_REPEAT:
        this.pref_calendar_reminder_nb_repeat = this._getPref(data);
        break;

    // message
    case this.PREF.MESSAGE_ENABLED:
        this.pref_message_enabled = this._getPref(data);
        break;

    case this.PREF.MESSAGE_NOTIFICATION_ENABLED:
        this.pref_message_notification_enabled = this._getPref(data);
        break;

    case this.PREF.MESSAGE_SOUND_ENABLED:
        this.pref_message_sound_enabled = this._getPref(data);
        break;

    default:
        break;
    }
};

/**
 * Check if this is the first start of the extension
 *
 * @this {Prefs}
 * @param {Boolean} True if the flag should be reseted
 */
office365_notifier_Prefs.isFirstStart = function(reset) {
    var ret = this._is_first_launch;
    if (reset) {
        this._is_first_launch = false;
    }
    return ret;
};

/* *************************** general *************************** */

/**
 * indicate the current version
 *
 * @this {Prefs}
 * @return {Number} the current version
 */
office365_notifier_Prefs.getCurrentVersion = function() {
    return this.pref_current_version;
};

/**
 * indicate if statusBar is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isStatusBarEnabled = function() {
    return this.pref_access_statusBar;
};

/* *************************** email *************************** */

/**
 * indicate if email notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isEmailNotificationEnabled = function() {
    return this.pref_email_notification_enabled;
};

/**
 * indicate if sound is enabled for email notification
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isEmailSoundEnabled = function() {
    return this.pref_email_sound_enabled;
};

/**
 * indicate the duration of the email notification
 *
 * @this {Prefs}
 * @return {Number} The duration of the notification in ms
 */
office365_notifier_Prefs.getEmailNotificationDuration = function() {
    return (this.pref_email_notification_duration * 1000);
};

/* *************************** calendar *************************** */

/**
 * indicate if Calendar is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarEnabled = function() {
    return this.pref_calendar_enabled;
};

/**
 * indicate if Calendar System Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarNotificationEnabled = function() {
    return this.pref_calendar_notification_enabled;
};

/**
 * indicate if Calendar Sound Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isCalendarSoundEnabled = function() {
    return this.pref_calendar_sound_enabled;
};

/**
 * get Calendar Reminder number repeat
 *
 * @this {Prefs}
 * @return {Number}
 */
office365_notifier_Prefs.getCalendarReminderNbRepeat = function() {
    return this.pref_calendar_reminder_nb_repeat;
};

/* *************************** message *************************** */

/**
 * indicate if message is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageEnabled = function() {
    return this.pref_message_enabled;
};

/**
 * indicate if message System Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageNotificationEnabled = function() {
    return this.pref_message_notification_enabled;
};

/**
 * indicate if message Sound Notification is enabled
 *
 * @this {Prefs}
 * @return {Boolean} true if enabled
 */
office365_notifier_Prefs.isMessageSoundEnabled = function() {
    return this.pref_message_sound_enabled;
};

/* *************************** Private *************************** */

/**
 * get preference
 *
 * @private
 *
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
office365_notifier_Prefs._getPref = function(pref) {
    var value = null;
    if (this._prefs) {
        if (this._prefs.getPrefType(pref) === this._prefs.PREF_BOOL) {
            value = this._prefs.getBoolPref(pref);
        } else if (this._prefs.getPrefType(pref) === this._prefs.PREF_INT) {
            value = this._prefs.getIntPref(pref);
        } else if (this._prefs.getPrefType(pref) === this._prefs.PREF_STRING) {
            value = this._prefs.getCharPref(pref).trim();
        }
    }
    return value;
};

/**
 * get a complex preference
 *
 * @private
 * @this {Prefs}
 *
 * @param {String}
 *            pref the preference name
 * @return {Object} the preference value
 */
office365_notifier_Prefs._getComplexPref = function(pref) {
    var value = null;
    try {
        var strVal = null;
        if (this._prefs.getPrefType(pref) === this._prefs.PREF_STRING) {
            strVal = this._prefs.getCharPref(pref);
        }
        if (strVal && strVal.length > 0) {
            value = JSON.parse(strVal);
        }
    } catch (e) {
    }
    return value;
};

/**
 * Initialize the preference
 */
office365_notifier_Prefs.init();

/**
 * Prevent any futher modifications of the Prefs object
 */
Object.seal(office365_notifier_Prefs);
