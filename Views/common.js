var lmsServer = null;
var token = null;

var showLoading = function (displayText) {
    hideLoading();
	var element = "<div id='custom-loader' class='loading-screen'><div class='loader'><div></div><div></div><div></div></div><div class='loading-text'>" + displayText + "</div></div>";
    $(document.body).append(element);
};

var hideLoading = function(){
	$('.loading-screen').remove();
}

var showError = function (displayText) {
    setTimeout(function () {
        hideLoading();
        var element = "<div id='custom-loader' class='loading-screen'><div class='loading-text'>" + displayText + "</div></div>";
        $(document.body).append(element);
    }, 1000);
};

var highlight = function (element, callback) {
    var color = element.css('border-color');
    element.css('border-color', 'red');
    setTimeout(function () {
        element.css('border-color', color);
        if (callback != null && callback != undefined) {
            callback(element);
        }
    }, 4000);
}

var highlightBackground = function (element, callback) {
    var color = element.css('background');
    element.css('background', 'red');
    setTimeout(function () {
        element.css('background', color);
        if (callback != null && callback != undefined) {
            callback(element);
        }
    }, 4000);
}

var highlightBackground2 = function (element, callback) {
    var color = element.css('background');
    element.css('background', 'red');
    setTimeout(function () {
        element.css('background', color);
        if (callback != null && callback != undefined) {
            callback(element);
        }
    }, 300);
}

var highlightElement = function (element, callback) {
    element.addClass('highlight');
    setTimeout(function () {
        element.removeClass('highlight');
        if (callback != null && callback != undefined) {
            callback(element);
        }
    }, 2000);
}

var tempTextChange = function (element, tempText, callback) {
    var text = element.html();
    element.html(tempText);
    setTimeout(function () {
        element.html(text);
        if (callback != null && callback != undefined) {
            callback(element);
        }
    }, 4000);
}

var loadUnreadNotifications = function (notifications) {
    $('.notificationList').empty();
    var notifications = $.grep(notifications, function (n) {
        return !n.isRead;
    });
    $.each(notifications, function (index, notification) {
        var element = $("<li><b>" + notification.from + "</b>: " + notification.details + "</li>");
        $('.notificationList').append(element);
    });
    if (notifications.length == 0) {
        $('#notifCount').hide();
        $('#notificationsDropdown').find('h4').html("Go to Notifications");
    } else {
        $('#notifCount').show();
        $('#notifCount').html(notifications.length);
    }
    $('#notificationsDropdown').unbind('click').click(function () {
        location.href = "Notifications.html";
    });
}

var showAlert = function (title, message, callbacks) {
    var element = $("<div id='alertPopup' class='alert-popup-overlay'><div class='alert-popup'><h3 class='alert-title'>" + title +
        "</h3><p class='alert-message'>" + message + "</p></div></div>");
    $.each(callbacks, function (index, callback) {
        var button = $("<button class='alert-button'>" + callback.text + "</button>");
        button.click(function () {
            callback.callback(button, element);
        });
        element.find('.alert-popup').append(button);
    });
    $(document.body).append(element);
}

var showOkayAlert = function (title, message, callback) {
    var callbacks = [];
    callbacks.push({
        text: "Okay",
        callback: callback
    });
    showAlert(title, message, callbacks);
}

var showYesNoAlert = function (title, message, yesCallback, noCallback) {
    var callbacks = [];
    callbacks.push({
        text: "Yes",
        callback: function (button, element) {
            element.remove();
            yesCallback();
        }
    });
    callbacks.push({
        text: "No",
        callback: function (button, element) {
            element.remove();
            noCallback();
        }
    });
    showAlert(title, message, callbacks);
}

var getURLParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURI(results[1]) || 0;
}

var endsWith = function (filename, extension) {
    return (filename.toLowerCase().lastIndexOf(extension.toLowerCase()) === filename.length - extension.length) > 0;
}

var getExtension = function (fileName) {
    return fileName.split('.').pop().toLowerCase();
}

var getFileType = function (types, fileName) {
    if ($.inArray(getExtension(fileName).toLowerCase(), types.videoTypes) !== -1) {
        return "video";
    }
    if ($.inArray(getExtension(fileName).toLowerCase(), types.documentTypes) !== -1) {
        return "document";
    }
    return "other";
}

var getUserCompletion = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/UserCompletion?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            
        },
        success: function (response) {
            setData("UserCompletion", JSON.stringify(response), function () {
                callback(response, null);
            });
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            setData("UserCompletion", [], function () {
                callback(null, e);
            });
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
        }
    });
}

var putReferences = function (card, lmsReferences) {
    card.append("<div class='resources'><h3>References</h3></div>");
    var references = $("<ul class='resource-list styled-list'></ul>");
    $.each(lmsReferences, function (index, reference) {
        var li;
        if (reference.isLink) {
            li = $("<li><img src='../icons/link.png' width='40px'> &nbsp;<a class='themed-link' target='_blank' href='" + reference.content + "'>" + reference.content + "</a></li>");
        }
        if (reference.isHTML) {
            li = $(reference.content);
        }
        references.append(li);
    });
    card.append(references);
}

var putAssignmentBlock = function (card, lmsAssignments, completions, levelMessage) {
    card.append("<div class='resources'><h3>Assignments</h3></div>");
    var assignments = $("<ul class='resource-list styled-list interactive-list'></ul>");
    $.each(lmsAssignments, function (index, assignment) {
        var completionClass = "";
        var completionElement = "";
        var allowEntering = true;
        var message = "";

        var remarksAvailable = false;
        var allowRetry = false;

        var completionId = -1;

        if (levelMessage == "" || levelMessage == undefined) {
            var completionStatus = completions.filter(function (completion) {
                return completion.id == assignment.id && !completion.isQuestionnaire;
            });
            if (completionStatus.length > 0) {
                completionStatus = completionStatus[0];
                completionId = completionStatus.completionId;
                completionClass = "CompletedStatus";
                allowEntering = false;
                if (completionStatus.isPassed) {
                    completionElement = "<span class='completion spanCompleted'>COMPLETED</span>";
                    message = "Assessment is completed";
                    remarksAvailable = true;
                } else if (!completionStatus.isPassed && completionStatus.isValidated) {
                    completionElement = "<span class='completion spanFailed'>Failed, try again</span>";
                    message = "Failed to complete the assessment";
                    remarksAvailable = true;
                    allowRetry = true;
                } else if (!completionStatus.isPassed && !completionStatus.isValidated) {
                    completionElement = "<span class='completion spanPending'>Under Evaluation</span>";
                    message = "Assessment is under evaluation";
                }
            }
        } else {
            completionElement = "🔒";
            allowEntering = false;
            message = levelMessage;
        }
        
        var li = $("<li class='" + completionClass + "'><span class='liName'><img src='../icons/test.png' width='40px'> " + assignment.assignmentName + "</span>" + completionElement + "</li>");
        if (allowEntering == true) {
            li.click(function () {
                showYesNoAlert("Start the assignment?", "<h4>" + assignment.assignmentName + "</h4>" + assignment.description, function () {
                    setData("CurrentAssessment", JSON.stringify(assignment), function () {
                        location.href = "Assessment.html?type=assignment";
                    });
                }, function () { });
            });
        } else {
            if (remarksAvailable || allowRetry) {
                li.click(function () {
                    var callbacks = [];
                    callbacks.push({
                        text: "See Remarks",
                        callback: function (button, element) {
                            element.remove();
                            location.href = "Remarks.html?id=" + completionId;
                        }
                    });
                    if (allowRetry) {
                        callbacks.push({
                            text: "Retry",
                            callback: function (button, element) {
                                element.remove();
                                setData("CurrentAssessment", JSON.stringify(assignment), function () {
                                    location.href = "Assessment.html?type=assignment";
                                });
                            }
                        });
                    }
                    callbacks.push({
                        text: "Cancel",
                        callback: function (button, element) {
                            element.remove();
                        }
                    });

                    showAlert("Assessment Options", message, callbacks);
                });
            } else {
                li.click(function () {
                    showOkayAlert("Locked", message, function (button, element) {
                        element.remove();
                    });
                });
            }
        }
        assignments.append(li);
    });
    card.append(assignments);
}

var putQuestionnaireBlock = function (card, lmsQuestionnaires, completions, levelMessage) {
    card.append("<div class='resources'><h3>Questionnaires</h3></div>");
    var questionnaires = $("<ul class='resource-list styled-list interactive-list'></ul>");
    $.each(lmsQuestionnaires, function (index, questionnaire) {
        var completionClass = "";
        var completionElement = "";
        var allowEntering = true;
        var message = "";
        var remarksAvailable = false;
        var allowRetry = false;
        var completionId = -1;
        if (levelMessage == "" || levelMessage == undefined) {
            var completionStatus = completions.filter(function (completion) {
                return completion.id == questionnaire.id && completion.isQuestionnaire;
            });
            if (completionStatus.length > 0) {
                completionStatus = completionStatus[0];
                completionId = completionStatus.completionId;
                allowEntering = false;
                completionClass = "CompletedStatus";
                if (completionStatus.isPassed) {
                    completionElement = "<span class='completion spanCompleted'>COMPLETED</span>";
                    message = "Assessment is completed";
                    remarksAvailable = true;
                } else if (!completionStatus.isPassed && completionStatus.isValidated) {
                    completionElement = "<span class='completion spanFailed'>Failed, try again</span>";
                    remarksAvailable = true;
                    allowRetry = true;
                } else if (!completionStatus.isPassed && !completionStatus.isValidated) {
                    completionElement = "<span class='completion spanPending'>Under Evaluation</span>";
                    message = "Assessment is under evaluation";
                }
            }
        } else {
            completionElement = "🔒";
            allowEntering = false;
            message = levelMessage;
        }
        var li = $("<li class='" + completionClass + "'><span class='liName'><span class='liName'><img src='../icons/test.png' width='40px'> " + questionnaire.questionnaireName + "</span>" + completionElement + "</li>");
        if (allowEntering == true) {
            li.click(function () {
                showYesNoAlert("Start answering the questionnaire?", "<h4>" + questionnaire.questionnaireName + "</h4>Minimum correct answeres required is <b>" + questionnaire.minimumAnswersRequired + "</b>.", function () {
                    setData("CurrentAssessment", JSON.stringify(questionnaire), function () {
                        location.href = "Assessment.html?type=questionnaire";
                    });
                }, function () { });
            });
        } else {
            if (remarksAvailable || allowRetry) {
                li.click(function () {
                    var callbacks = [];
                    callbacks.push({
                        text: "ℹ️ See Remarks",
                        callback: function (button, element) {
                            element.remove();
                            location.href = "Remarks.html?id=" + completionId;
                        }
                    });
                    if (allowRetry) {
                        callbacks.push({
                            text: "Retry",
                            callback: function (button, element) {
                                element.remove();
                                setData("CurrentAssessment", JSON.stringify(questionnaire), function () {
                                    location.href = "Assessment.html?type=questionnaire";
                                });
                            }
                        });
                    }
                    callbacks.push({
                        text: "Cancel",
                        callback: function (button, element) {
                            element.remove();
                        }
                    });

                    showAlert("Assessment Options", message, callbacks);
                });
            } else {
                li.click(function () {
                    showOkayAlert("Locked", message, function (button, element) {
                        element.remove();
                    });
                });
            }
        }
        questionnaires.append(li);
    });
    card.append(questionnaires);
}

var enableSpeech = function (elements) {
    elements.each(function (index, element) {
        element = $(element);
        var speechIcon = $("<span class='speaker-inline' title='Listen'><i class='bx bxs-volume-full'></i></span>");
        speechIcon.click(function () {
            showLoading("Please note: The GigHz LMS text-to-speech feature is experimental and currently in its beta phase.");
            openTextToSpeech(element.text(), function (result) {
                hideLoading();
                if (result != "") {
                    showOkayAlert("Error", result, function (button, dialog) {
                        dialog.remove();
                    });
                }
            });
        });
        element.prepend(speechIcon);
    });
}

var getUserLevel = function (level) {
    if (level == 1) {
        return "Novice";
    }
    if (level == 2) {
        return "Competent";
    }
    if (level == 3) {
        return "Expert";
    }
    return "System";
}

//webview methods
function setToken(token, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        await bridge.SetToken(token);
        callback();
    })();
}

function getToken(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var token = await bridge.GetToken();
        callback(token);
    })();
}

function GetSupportedVideoTypes(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var types = await bridge.GetSupportedVideoTypes();
        callback(JSON.parse(types));
    })();
}

function setData(key, value, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        await bridge.SetData(key, value);
        callback();
    })();
}

function getData(key, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var data = await bridge.GetData(key);
        callback(data);
    })();
}

function openVideo(url,title, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var error = await bridge.OpenVideo(url, title);
        callback(error);
    })();
}

function openDocument(url, title, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var error = await bridge.OpenDocument(url, title);
        callback(error);
    })();
}

function openFile(url, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var error = await bridge.OpenFile(url);
        callback(error);
    })();
}

function toggleMenu(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var isVisible = await bridge.ToggleMenu();
        callback(isVisible);
    })();
}

function OpenFileDialog(blockClassName, afterSeclectCallback, title, filter, maxSize, multiSelect) {
        const bridge = chrome.webview.hostObjects.bridge;
        if (title == "" || title == undefined) {
            title = "Open file";
        }
        if (filter == undefined) {
            filter = "";
        }
        if (maxSize == "" || maxSize == undefined) {
            maxSize = "1";
        }
        if (multiSelect == "" || multiSelect == undefined) {
            multiSelect = "0";
        }
        bridge.OpenFileDialog(blockClassName, afterSeclectCallback, title, filter, maxSize, multiSelect);
}

function selectProfilePic(afterSeclectCallback) {
    const bridge = chrome.webview.hostObjects.bridge;
    bridge.UpdateUserPic(afterSeclectCallback);
}

function getProfilePic(isMale, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var imageData = await bridge.ProfilePic(isMale);
        callback(imageData);
    })();
}

function openTextToSpeech(text, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.TextToSpeech(text, true);
        callback(result);
    })();
}

function notify(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        await bridge.Notify();
        callback();
    })();
}

function currentVersion(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.Version();
        callback(result);
    })();
}

function systemUpdate(callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.SystemUpdate();
        callback(result);
    })();
}

var checkForUpdates = function (callback) {
    currentVersion(function (version) {
        $.ajax({
            url: lmsServer + "/Content/Version",
            type: "GET",
            beforeSend: function () {
                showLoading("Checking for updates.. Please wait.");
            },
            success: function (response) {
                if (response != version) {
                    showOkayAlert("Update available", "A new version " + response + " of the application is available. Click 'Okay' to start updating.", function () {
                        systemUpdate(function (success) {
                            if (!success) {
                                showOkayAlert("Unable to update", "Update failed. Please contact support.", function () {
                                    callback(true);
                                });
                            }
                        });
                    });
                } else {
                    callback(false);
                }
            },
            error: function (xhr, status, error) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    e = "Unable to get updates, the server is not reachable.";
                    showError(e);
                } else {
                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to try again.");
                }
            },
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            complete: function (response) {
                hideLoading();
            }
        });
    });
}

var verifyService = function (token, callback)
{
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.VerifyService(token);
        callback(result);
    })();
}

var getApplicationShortcuts = function (callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.GetApplicationShortcuts();
        callback(JSON.parse(result));
    })();
}

var openShortcutApplication = function (id, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.OpenApplication(id);
        callback(result);
    })();
}


var userFileUploadCallback = undefined;
var uploadUserFile = function (title, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        userFileUploadCallback = callback;
        bridge.UploadUserFile(title, "*.jpg;*.jpeg;*.png;*.gif;*.bmp;*.tiff", 'afterUserFileUpload');
    })();
}

var afterUserFileUpload = function (response) {
    if (response.IsSuccess) {
        userFileUploadCallback(lmsServer + "/Content/File?name=" + response.FullFileName);
    } else {
        if (response.Error != "") {
            showOkayAlert("Error", response.Error, function (button, element) {
                element.remove();
            });
        }
    }
    userFileUploadCallback = undefined;
}

var initAssistant = function (config, textConfig, enhancedTextConfig, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        await bridge.InitAssistant(JSON.stringify(config), JSON.stringify(textConfig), JSON.stringify(enhancedTextConfig));
        callback();
    })();
}

var askAssistant = function (query, callback) {
    (async () => {
        const bridge = chrome.webview.hostObjects.bridge;
        var result = await bridge.AskAssistant(query);
        callback(JSON.parse(result));
    })();
}