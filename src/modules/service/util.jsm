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

var EXPORTED_SYMBOLS = [ "office365_notifier_Util" ];

/**
 * Creates a global instance of office365_notifier_Util
 * 
 * @constructor
 * @this {Util}
 * 
 */
var office365_notifier_Util = {
    /**
     * @private bundle
     */
    _bundle : null
};

/**
 * get bundle.
 * 
 * @this {Util}
 * 
 * @param {String}
 *            param parameter value to get
 * @return {String} value of parameter
 */
office365_notifier_Util.getBundleString = function(param) {
    try {
        if (this._bundle === null) {
            var appLocale = Services.locale.getApplicationLocale();
            this._bundle = Services.strings.createBundle(office365_notifier_Constant.STRING_BUNDLE.DEFAULT_URL, appLocale);
        }
        return this._bundle.GetStringFromName(param);
    } catch (e) {
        return '';
    }
};

/**
 * Create and launch a timer
 * 
 * @warning You must keep a reference of the timer as long as he lives
 * 
 * @this {Util}
 * 
 * @param {nsITimer}
 *            timer A previous instance of a timer to reuse, can be null: create a new one
 * @param {Function}
 *            func The callback to be fired when the timer timeout
 * @param {Number}
 *            delay The number of ms
 * 
 * @return {nsITimer} The created timer
 */
office365_notifier_Util.setTimer = function(timer, func, delay) {
    if (!timer) {
        timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
    }
    timer.initWithCallback(func, delay, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    return timer;
};

/**
 * return max length string
 * 
 * @this {Util}
 * @param {String}
 *            text text to limit.
 * @param {Number}
 *            length max text length.
 * @return {String} text limited with ....
 */
office365_notifier_Util.maxStringLength = function(text, length) {
    if (text === null || (text.length < length)) {
        return text;
    }
    if (length <= 0) {
        return '';
    }
    if (length < 6) {
        return text.substring(0, length);
    }
    return text.substring(0, length - 3) + "...";
};

/**
 * Show notification
 * 
 * @param {String}
 *            title The title of the notification
 * @param {String}
 *            text The text of the notification
 * @param {Number}
 *            duration Minimum duration of the notification (ms)
 * @param {Function}
 *            callback The function to call
 * @param {Object}
 *            callbackThis The context of the function (this)
 * 
 * @return {Boolean} true if success
 */
office365_notifier_Util.showNotification = function(title, text, duration, callback, callbackThis) {
    try {
        var listener = null;
        var textClickable = false;

        if (callback) {
            var dateStartNotify = new Date().getTime();
            var arrayArgs = [].slice.call(arguments, 0);

            textClickable = true;
            listener = {
                _endTime : (dateStartNotify + duration),
                observe : function(subject, topic, data) {
                    // On Mac OS X, the notification is handled with Growl and is not using
                    // the plateform independant notification system of firefox
                    if (topic === "alertfinished" && Services.appinfo.OS !== "Darwin") {

                        var dateEndNotify = new Date().getTime();
                        duration = listener._endTime - dateEndNotify;
                        listener._endTime = 0;
                        // If the user do not cancel it : the duration is around 4 seconds
                        // And the time left to display the notification is more than 0.1s
                        // And there is at least one opened window : If the user close the browser,
                        // stop to display the notification
                        if ((dateEndNotify > (dateStartNotify + 3800)) && (duration > 500) && (Services.wm.getEnumerator("navigator:browser").hasMoreElements())) {

                            arrayArgs[2] = duration;
                            office365_notifier_Util.showNotification.apply(office365_notifier_Util, arrayArgs);
                        }
                    } else if (topic === "alertclickcallback") {
                        listener._endTime = 0;
                        // Run the callback with the callbackThis as context and with parameter
                        // the optional arguments passed to the showNotification function
                        callback.apply(callbackThis, arrayArgs.slice(5));
                    }
                }
            };
        }

        // Show the notification
        var alertsService = Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);

        alertsService.showAlertNotification('chrome://office365_mail_notifier/skin/images/office365_mail_notifier.png', title, text, textClickable, null, listener, "Office 365 Mail Notifier");
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * play new mail sound
 * 
 * @return {Boolean} true if success
 */
office365_notifier_Util.playSound = function() {
    try {
        var sound = Components.classes["@mozilla.org/sound;1"].createInstance(Components.interfaces.nsISound);
        if (Services.appinfo.OS === "Darwin") {
            sound.beep();
        } else {
            sound.playEventSound(Components.interfaces.nsISound.EVENT_NEW_MAIL_RECEIVED);
        }
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * open url in a new browser tab
 * 
 * @this {Util}
 * @param {UrlToGoTo}
 *            UrlToGoTo url to open.
 * @return {boolean} true of successful.
 */
office365_notifier_Util.openURL = function(UrlToGoTo) {
    try {
        var wm = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator);
        var browserEnumerator = wm.getEnumerator("navigator:browser");
        while (browserEnumerator.hasMoreElements()) {
            var browserInstance = browserEnumerator.getNext().getBrowser();
            var numTabs = browserInstance.mPanelContainer.childNodes.length;
            for (var index = 0; index < numTabs; index++) {
                var currentTab = browserInstance.getBrowserAtIndex(index);
                if (currentTab && currentTab.currentURI.spec.indexOf(UrlToGoTo) >= 0) {
                    browserInstance.selectedTab = browserInstance.tabContainer.childNodes[index];
                    try {
                        browserInstance.contentWindow.focus();
                        browserInstance.focus();
                        return true;
                    } catch (e) {
                        // Nothing
                    }
                }
            }
        }
        var recentWindow = wm.getMostRecentWindow("navigator:browser");
        if (recentWindow) {
            recentWindow.delayedOpenTab(UrlToGoTo, null, null, null, null);
        } else {
            this._window.open(UrlToGoTo);
        }
    } catch (e) {
        return false;
    }
    return true;
};

/**
 * crc32.
 * 
 * @this {Util}
 * @param {String}
 *            str
 * @return {String} crc32
 */
office365_notifier_Util.crc32 = function(str) {
    var c, n, i, k;
    var crc = 0 ^ (-1);
    var crcTable = [];
    for (n = 0; n < 256; n++) {
        c = n;
        for (k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    for (i = 0; i < str.length; i++) {
        crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};

/**
 * notifyObservers.
 * 
 * @this {Util}
 * @param {String}
 *            topic the topic
 * @param {String}
 *            data the data
 */
office365_notifier_Util.notifyObservers = function(topic, data) {
    Services.obs.notifyObservers(null, topic, data);
};

/**
 * Extend the Object properties
 * 
 * @param {Object}
 *            base The base object
 * @param {Object}
 *            sub The sub object
 * @param {String}
 *            superPropName The name of the property to access of parent "class"
 */
office365_notifier_Util.extend = function(base, sub, superPropName) {
    var tmp = function() {
    };
    // Copy the prototype from the base to setup inheritance
    tmp.prototype = base.prototype;
    sub.prototype = new tmp();
    // The constructor property was set wrong, let's fix it
    sub.prototype.constructor = sub;
    if (!superPropName) {
        superPropName = '_super';
    }
    sub.prototype[superPropName] = base.prototype;
};

/**
 * Dump the content of an object
 * 
 * @param {Object}
 *            obj The object to dump
 * @param {String}
 *            pref The prefix to display for each line
 */
office365_notifier_Util.dump = function(obj, pref) {
    if (!pref && pref !== '') {
        pref = '=> ';
    }
    for ( var p in obj) {
        try {
            dump(pref + p);
            var v = obj[p];
            if (v) {
                if (typeof (v) === 'object') {
                    dump("\n");
                    office365_notifier_Util.dump(v, pref + p + '.');
                } else if (typeof (v) !== 'function') {
                    dump(" : " + v + ";");
                }
            } else {
                dump(" : " + v + ";");
            }
        } catch (e) {
            dump(" ... ");
        } finally {
            dump("\n");
        }
    }
};

/**
 * Freeze enum / constant object recursively
 * 
 * @param {Object}
 *            obj The object to freeze
 */
office365_notifier_Util.deepFreeze = function(obj) {
    // First freeze the object
    Object.freeze(obj);
    // Iterate over properties of object
    for ( var propKey in obj) {
        if (obj.hasOwnProperty(propKey)) {
            var prop = obj[propKey];
            if (typeof (prop) === 'object') {
                office365_notifier_Util.deepFreeze(prop);
            }
        }
    }
    return obj;
};

/**
 * Prevent any modifications of the Util object
 */
Object.seal(office365_notifier_Util);
