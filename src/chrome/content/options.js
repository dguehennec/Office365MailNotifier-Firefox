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

if (!com) {
    var com = {};
}
if (!com.office365) {
    com.office365 = {};
}

Components.utils.import("resource://gre/modules/Services.jsm");
Components.utils.import("resource://office365_mail_notifier/constant/office365helper.jsm", com);
Components.utils.import("resource://office365_mail_notifier/service/prefs.jsm", com);
Components.utils.import("resource://office365_mail_notifier/service/util.jsm", com);
Components.utils.import("resource://office365_mail_notifier/controller/controller.jsm", com);

/**
 * The Class Options.
 * 
 * @constructor
 * @this {Options}
 */
com.office365.Options = {
    _prefInstantApply : false
};

/**
 * Initialize option.
 * 
 * @this {Option}
 */
com.office365.Options.init = function() {

    var util = com.office365.UiUtil;
    var prefs = com.office365_notifier_Prefs;

    // Register
    com.office365_notifier_Controller.addCallBackRefresh(this);

    // Do we have a OK/Cancel button, or modification is applied immediately
    if (Application.prefs.getValue("browser.preferences.instantApply", null) === true) {
        this._prefInstantApply = true;
    }

    // Hide platform depending options
    if (Services.appinfo.OS === "Darwin") {
        util.setVisibility("office365_mail_notifier-hboxMailNotifyDuration", "collapse");
    }
};

/**
 * Call when the window is closed
 * 
 * @this {Option}
 */
com.office365.Options.release = function() {
    com.office365_notifier_Controller.removeCallBackRefresh(this);

    if (this._prefInstantApply) {
        this.validated();
    }
};

/**
 * Call when the window is validated
 * 
 * @this {Option}
 */
com.office365.Options.validated = function() {
    // Do not call this function again
    this._prefInstantApply = false;

    // Inform that the preferences may have changed
    com.office365_notifier_Controller.removeCallBackRefresh(this);
    com.office365_notifier_Util.notifyObservers(com.office365_notifier_Constant.OBSERVER.PREF_SAVED);
    return true;
};
