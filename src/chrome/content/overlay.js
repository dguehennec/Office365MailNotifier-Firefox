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
Components.utils.import("resource://office365_mail_notifier/service/util.jsm", com);
Components.utils.import("resource://office365_mail_notifier/service/prefs.jsm", com);
Components.utils.import("resource://office365_mail_notifier/service/logger.jsm", com);
Components.utils.import("resource://office365_mail_notifier/controller/controller.jsm", com);

/**
 * The Class Main.
 * 
 * @constructor
 * @this {Main}
 */
com.office365.Main = {};

/**
 * Init module.
 * 
 * @this {Main}
 */
com.office365.Main.init = function() {
    this._logger = new com.office365_notifier_Logger("Main");
    this._logger.trace("init");
    try {
        com.office365_notifier_Controller.addCallBackRefresh(this);

        // Install the button in the nav-bar if necessary
        if (com.office365_notifier_Prefs.isFirstStart(true)) {
            com.office365.UiUtil.installButton("nav-bar", "office365_mail_notifier-toolbar-button");
        }

        this.refresh();
        // add event listener to notify when DOM content is loaded
        window.document.addEventListener("DOMContentLoaded", this.contentLoadedEvent);

    } catch (e) {
        dump("FATAL in office365.Main.init: " + e + "\n");
    }
};

/**
 * release Main.
 * 
 * @this {Main}
 */

com.office365.Main.release = function() {
    com.office365_notifier_Controller.removeCallBackRefresh(this);
};

/**
 * Checks if URL is Lords And Knights.
 * 
 * @this {Main}
 * @param {String}
 *            href the url to test
 * @return {Boolean} true, if URL is Office 365 web site
 */
com.office365.Main.isOffice365WebSite = function(href) {
    return (href.indexOf(com.office365_notifier_Constant.URLS.SITE_DEFAULT) >= 0);
};

/**
 * Check Web Site.
 * 
 * @this {Main}
 * @param {DOMDocument}
 *            doc the window document
 * @return {Boolean} true, if web site is good
 */
com.office365.Main.checkWebSite = function(doc) {
    var href = doc.location.toString();
    if (this.isOffice365WebSite(href)) {
        return true;
    }
    return false;
};

/**
 * call on DOMContentLoaded
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.office365.Main.contentLoaded = function(evt) {
    this._logger.trace("contentLoaded");
    if (evt.originalTarget instanceof HTMLDocument) {
        var doc = evt.originalTarget;
        if ((doc.location !== null) && this.checkWebSite(doc)) {
            com.office365_notifier_Controller.office365InterfaceLoaded(this, doc);
            // update events listener
            window.document.removeEventListener("DOMContentLoaded", this.contentLoadedEvent);
            doc.defaultView.addEventListener("unload", this.contentUnloadEvent);
        }
    }
};

/**
 * call on content unloaded
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.office365.Main.contentUnload = function(evt) {
    this._logger.trace("contentUnload");
    com.office365_notifier_Controller.office365InterfaceUnloaded(this);
    // update events listener
    window.document.addEventListener("DOMContentLoaded", this.contentLoadedEvent);
    var doc = evt.originalTarget;
    if ((doc.location !== null) && this.checkWebSite(doc)) {
        doc.defaultView.removeEventListener("unload", this.contentUnloadEvent);
    }
};

/**
 * refresh interface.
 * 
 * @this {Main}
 */
com.office365.Main.refresh = function(inProgress) {
    var util = com.office365.UiUtil;

    if (inProgress) {
        util.setAttribute("office365_mail_notifier-status-icon", "status", "2");
        util.setAttribute("office365_mail_notifier-toolbar-button", "status", "2");
        return;
    }

    var nbUnreadMessages = -1;
    if (com.office365_notifier_Controller.isInitialized()) {
        var hasError = (com.office365_notifier_Controller.getLastErrorMessage() !== "");
        nbUnreadMessages = com.office365_notifier_Controller.getNbMessageUnread();
        util.removeAttribute("office365_mail_notifier-mainSeparator", "hidden");
        util.removeAttribute("office365_mail_notifier-mainToolsSeparator", "hidden");
        util.removeAttribute("office365_mail_notifier-mainToolsCheckNow", "hidden");
        util.removeAttribute("office365_mail_notifier-mainCheckNow", "hidden");
        util.setAttribute("office365_mail_notifier-status-icon", "status", hasError ? "3" : "1");
        util.setAttribute("office365_mail_notifier-toolbar-button", "status", hasError ? "3" : "1");
    } else {
        util.setAttribute("office365_mail_notifier-mainSeparator", "hidden", "true");
        util.setAttribute("office365_mail_notifier-mainToolsSeparator", "hidden", "true");
        util.setAttribute("office365_mail_notifier-mainToolsCheckNow", "hidden", "true");
        util.setAttribute("office365_mail_notifier-mainCheckNow", "hidden", "true");
        util.setAttribute("office365_mail_notifier-status-icon", "status", "0");
        util.setAttribute("office365_mail_notifier-toolbar-button", "status", "0");
    }
    // StatusBar
    if (com.office365_notifier_Prefs.isStatusBarEnabled()) {
        util.setVisibility("office365_mail_notifier-status-icon", "visible");
        if (nbUnreadMessages >= 0) {
            util.setAttribute("office365_mail_notifier-status-icon", "label", nbUnreadMessages);
        } else {
            util.setAttribute("office365_mail_notifier-status-icon", "label", "");
        }
    } else {
        util.setVisibility("office365_mail_notifier-status-icon", "collapse");
    }
    // ToolBar
    if (nbUnreadMessages > 0) {
        util.setAttribute("office365_mail_notifier-toolbar-button-label", "value", nbUnreadMessages);
    } else {
        util.setAttribute("office365_mail_notifier-toolbar-button-label", "value", "");
    }
};

/**
 * Show Option Menu
 * 
 */
com.office365.Main.openOptionsDialog = function() {
    this._openPrefsDialog();
};

/**
 * Show About Menu
 */
com.office365.Main.openAboutDialog = function() {
    window.openDialog('chrome://office365_mail_notifier/content/about.xul', "", 'chrome, modal, dialog, centerscreen');
};

/**
 * call on check now event
 */
com.office365.Main.onCheckNowClick = function() {
    com.office365_notifier_Controller.checkNow();
};

/**
 * call on statusBar event
 * 
 * @param evt
 *            event of the element
 */
com.office365.Main.onStatusBarClick = function(evt) {
    if (evt === undefined || evt.button === 0) {
        com.office365_notifier_Controller.openWebInterface();
    }
};

/**
 * Show Option Menu and select the desired tab
 */
com.office365.Main._openPrefsDialog = function() {
    var features = "chrome,titlebar,toolbar,centerscreen," + ((Services.appinfo.OS === "Darwin") ? "dialog=yes" : "modal");
    window.openDialog('chrome://office365_mail_notifier/content/options.xul', "", features);
};

/**
 * Initialize tooltip
 * 
 * @private
 */
com.office365.Main.initializeTooltip = function() {
    var util = com.office365.UiUtil;
    var errorMsg = com.office365_notifier_Controller.getLastErrorMessage();

    if (com.office365_notifier_Controller.isInitialized()) {
        if (errorMsg !== "") {
            util.setAttribute("office365_mail_notifier_tooltipTitle", "value", com.office365_notifier_Util.getBundleString("tooltip.errorConnected.title"));
            util.setTextContent("office365_mail_notifier_tooltipGeneral", errorMsg);
            util.setAttribute("office365_mail_notifier_tooltipCalendarGroup", "hidden", "true");
            util.setAttribute("office365_mail_notifier_tooltipMessageGroup", "hidden", "true");
        } else {
            // show general information
            var msgTitle = com.office365_notifier_Util.getBundleString("tooltip.unreadMessages.title");
            msgTitle = msgTitle.replace("%NB%", com.office365_notifier_Controller.getNbMessageUnread());
            util.setAttribute("office365_mail_notifier_tooltipTitle", "value", msgTitle);
            var msgDesc = com.office365_notifier_Util.getBundleString("tooltip.connected.description");
            msgDesc = msgDesc.replace("%EMAIL%", "TODO");

            util.setTextContent("office365_mail_notifier_tooltipGeneral", msgDesc);
            // show calendar information
            if (com.office365_notifier_Prefs.isCalendarEnabled()) {
                util.removeAttribute("office365_mail_notifier_tooltipCalendarGroup", "hidden");
                this.initializeTooltipCalendar();
            } else {
                util.setAttribute("office365_mail_notifier_tooltipCalendarGroup", "hidden", "true");
            }
            // show message information
            if (com.office365_notifier_Prefs.isMessageEnabled()) {
                util.removeAttribute("office365_mail_notifier_tooltipMessageGroup", "hidden");
                this.initializeTooltipMessage();
            } else {
                util.setAttribute("office365_mail_notifier_tooltipMessageGroup", "hidden", "true");
            }

        }
    } else {
        util.setAttribute("office365_mail_notifier_tooltipCalendarGroup", "hidden", "true");
        util.setAttribute("office365_mail_notifier_tooltipMessageGroup", "hidden", "true");
        if (errorMsg !== "") {
            util.setAttribute("office365_mail_notifier_tooltipTitle", "value", com.office365_notifier_Util.getBundleString("tooltip.errorNotConnected.title"));
            util.setTextContent("office365_mail_notifier_tooltipGeneral", errorMsg);
        } else {
            util.setAttribute("office365_mail_notifier_tooltipTitle", "value", com.office365_notifier_Util.getBundleString("tooltip.notConnected.title"));
            util.setTextContent("office365_mail_notifier_tooltipGeneral", com.office365_notifier_Util.getBundleString("tooltip.notConnected.description"));
        }
    }
};

/**
 * Initialize tooltip calendar
 * 
 * @private
 */
com.office365.Main.initializeTooltipCalendar = function() {
    var index, label;

    // clean calendar
    var tooltipCalendar = document.getElementById("office365_mail_notifier_tooltipCalendar");
    while (tooltipCalendar.hasChildNodes()) {
        tooltipCalendar.removeChild(tooltipCalendar.firstChild);
    }

    var events = com.office365_notifier_Controller.getCalendarEvents();
    if (events.length === 0) {
        label = document.createElement('label');
        label.setAttribute("flex", "1");
        label.setAttribute("class", "eventLabelName");
        label.setAttribute("value", com.office365_notifier_Util.getBundleString("tooltip.noEvent"));
        tooltipCalendar.appendChild(label);
    } else {
        for (index = 0; index < events.length; index++) {
            var currentEvent = events[index];
            label = document.createElement('label');
            label.setAttribute("flex", "1");
            label.setAttribute("class", "eventLabelName");
            label.setAttribute("value", currentEvent.name);
            tooltipCalendar.appendChild(label);
            label = document.createElement('label');
            label.setAttribute("flex", "1");
            label.setAttribute("class", "eventLabelDescription");
            label.setAttribute("value", currentEvent.duration);
            tooltipCalendar.appendChild(label);
        }
    }
};

/**
 * Initiliaze tooltip message
 * 
 * @private
 */
com.office365.Main.initializeTooltipMessage = function() {
    var index, label;

    // clean message
    var tooltipMessage = document.getElementById("office365_mail_notifier_tooltipMessage");
    while (tooltipMessage.hasChildNodes()) {
        tooltipMessage.removeChild(tooltipMessage.firstChild);
    }

    var events = com.office365_notifier_Controller.getMessageEvents();
    if (events.length === 0) {
        label = document.createElement('label');
        label.setAttribute("flex", "1");
        label.setAttribute("class", "eventLabelName");
        label.setAttribute("value", com.office365_notifier_Util.getBundleString("tooltip.noMessage"));
        tooltipMessage.appendChild(label);
    } else {
        for (index = 0; index < events.length; index++) {
            var currentEvent = events[index];
            label = document.createElement('label');
            label.setAttribute("flex", "1");
            label.setAttribute("class", "eventLabelName");
            label.setAttribute("value", currentEvent.name);
            tooltipMessage.appendChild(label);
            label = document.createElement('label');
            label.setAttribute("flex", "1");
            label.setAttribute("class", "eventLabelDescription");
            label.setAttribute("value", currentEvent.message);
            tooltipMessage.appendChild(label);
        }
    }
};

/**
 * clean tooltip
 */
com.office365.Main.hideTooltip = function() {
    com.office365.UiUtil.setAttribute("office365_mail_notifier_tooltipTitle", "value", "");
    com.office365.UiUtil.setTextContent("office365_mail_notifier_tooltipMessage", "");
};

/**
 * call on DOMContentLoaded Event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.office365.Main.contentLoadedEvent = function(evt) {
    com.office365.Main.contentLoaded(evt);
};

/**
 * call on content unloaded Event
 * 
 * @this {Main}
 * @param {Event}
 *            evt event of the element
 */
com.office365.Main.contentUnloadEvent = function(evt) {
    com.office365.Main.contentUnload(evt);
};

/**
 * add event listener to notify when content is loaded
 */
window.addEventListener("load", function() {
    window.setTimeout(function() {
        com.office365.Main.init();
    }, 100);
}, false);

/**
 * add event listener to notify when content is loaded
 */
window.addEventListener("unload", function() {
    window.setTimeout(function() {
        com.office365.Main.release();
    });
}, false);
