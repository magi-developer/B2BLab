
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    loadModule(getURLParam("id"));
}

var loadModule = function (id) {
    getData("CurrentCourse", function (course) {
        var course = JSON.parse(course);
        getData("CurrentChapter", function (chapter) {
            chapter = JSON.parse(chapter);
            var module = chapter.lmsDirectories.filter(function (item) {
                return item.id == id;
            })[0];
            var index = $.inArray(module, chapter.lmsDirectories);
            var isFirst = index == 0;
            var isLast = index == chapter.lmsDirectories.length - 1;
            var nextModule = "";
            if (!isLast) {
                nextModule = "Module.html?id=" + chapter.lmsDirectories[index + 1].id;
            }
            var previousModule = "";
            if (!isFirst) {
                previousModule = "Module.html?id=" + chapter.lmsDirectories[index - 1].id;
            }
            GetSupportedVideoTypes(function (types) {
                getData("UserCompletion", function (completions) {
                    getData("UserLevel-" + course.id, function (userLevel) {
                        userLevel = parseInt(userLevel);
                        completions = JSON.parse(completions);
                        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Modules/" + id + ".jpg");
                        var card = $(".chapter-card");
                        var courseName = $("<a class='course-title' href='Chapter.html?id=" + chapter.id + "'><h4><i class='bx bx-left-arrow-alt'></i>" + chapter.name + "</h4></a>");
                        card.append(courseName);
                        var chapterName = $("<div class='chapter-title'>" + module.name + "</div>");
                        card.append(chapterName);
                        var elementImage = $("<img src='" + image + "' class='chapterImage' alt='" + module.name + "'>");
                        card.append(elementImage);
                        var shortDescription = $("<div class='short-desc'>" + module.descriptionShort + "</div>");
                        card.append(shortDescription);
                        var longDescription = $("<div class='long-desc'>" + module.descriptionLong + "</div>");
                        card.append(longDescription);
                        enableSpeech(card.find(".short-desc, .long-desc"));
                        if (module.files.length > 0) {
                            var resources = $("<div class='resources'><h3>Module Resources</h3></div>");
                            var resourceList = $("<ul class='resource-list styled-list interactive-list'></ul>");
                            $.each(module.files, function (index, file) {
                                var type = getFileType(types, file);
                                var title = file.substr(0, file.lastIndexOf('.')) || file;
                                var li;
                                var url = lmsServer + "/Content/Resource?Course=" + course.id + "&Chapter=" + chapter.id + "&Module=" + id + "&FileName=" + encodeURIComponent(file) + "&token=" + encodeURIComponent(token);
                                if (type == "video") {
                                    li = $("<li><img src='../icons/video_icon.png' width='40px'> " + title + "</li>");
                                    li.click(function () {
                                        openVideo(url, title, function (error) {
                                            if (error !== "") {
                                                showOkayAlert("Please contact support", error, function (button, dialog) {
                                                    dialog.remove();
                                                });
                                            }
                                        });
                                    });
                                }
                                if (type == "document") {
                                    if (module.level > parseInt(userLevel) && userLevel > 0) {
                                        li = $("<li><span><img src='../icons/pdf_icon.png' width='40px'> " + title + "</span> 🔒</li>");
                                        li.click(function () {
                                            showOkayAlert("Locked", "This document will be unlocked at level '" + getUserLevel(module.level) + "'", function (button, dialog) {
                                                dialog.remove();
                                            });
                                        });
                                    } else {
                                        li = $("<li><img src='../icons/pdf_icon.png' width='40px'> " + title + "</li>");
                                        li.click(function () {
                                            openDocument(url, title, function (error) {
                                                if (error !== "") {
                                                    showOkayAlert("Please contact support", error, function (button, dialog) {
                                                        dialog.remove();
                                                    });
                                                }
                                            });
                                        });
                                    }
                                }
                                if (type == "other") {
                                    li = $("<li>❓ " + title + "</li>");
                                    li.click(function () {
                                        openFile(url, function (error) {
                                            if (error !== "") {
                                                showOkayAlert("Please contact support", error, function (button, dialog) {
                                                    dialog.remove();
                                                });
                                            }
                                        });
                                    });
                                }
                                resourceList.append(li);
                            });
                            resources.append(resourceList);
                            card.append(resources);
                        }

                        if (module.lmsReferences.length > 0) {
                            putReferences(card, module.lmsReferences);
                        }

                        if (module.lmsAssignments.length > 0) {
                            var message = "";
                            if (module.level > userLevel && userLevel > 0) {
                                message = "This assignment will be unlocked at level '" + getUserLevel(module.level) + "'";
                            }
                            putAssignmentBlock(card, module.lmsAssignments, completions, message);
                        }

                        if (module.lmsQuestionnaires.length > 0) {
                            var message = "";
                            if (module.level > userLevel && userLevel > 0) {
                                message = "This questionnaire will be unlocked at level '" + getUserLevel(module.level) + "'";
                            }
                            putQuestionnaireBlock(card, module.lmsQuestionnaires, completions, message);
                        }

                        var navigation = $("<div class='navigation'><a href='#' class='nav-btn leftNav'><i class='bx bx-left-arrow-alt'></i> Previous Module</a><a href='#' class='nav-btn rightNav'>Next Module <i class='bx bx-right-arrow-alt' ></i></a></div>");
                        var previous = navigation.find(".leftNav");
                        if (previousModule == "") {
                            previous.addClass('disabled-link');
                        } else {
                            previous.attr('href', previousModule);
                        }
                        var next = navigation.find(".rightNav");
                        if (nextModule == "") {
                            next.addClass('disabled-link');
                        } else {
                            next.attr('href', nextModule);
                        }
                        card.append(navigation);
                    });
                });
            });
        });
    });
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}