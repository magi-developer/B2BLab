
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    loadChapters(getURLParam("id"));
}

var loadChapters = function (id) {
    getData("CurrentCourse", function (lmsDirectory) {
        var course = JSON.parse(lmsDirectory);
        var chapter = course.lmsDirectories.filter(function (item) {
            return item.id == id;
        })[0];

        var index = $.inArray(chapter, course.lmsDirectories);
        var isFirst = index == 0;
        var isLast = index == course.lmsDirectories.length - 1;
        var nextChapter = "";
        if (!isLast) {
            nextChapter = "Chapter.html?id=" + course.lmsDirectories[index + 1].id;
        }
        var previousChapter = "";
        if (!isFirst) {
            previousChapter = "Chapter.html?id=" + course.lmsDirectories[index - 1].id;
        }

        setData("CurrentChapter", JSON.stringify(chapter), function () {
            GetSupportedVideoTypes(function (types) {
                getData("UserCompletion", function (completions) {
                    getData("UserLevel-" + course.id, function (userLevel) {
                        userLevel = parseInt(userLevel);
                        completions = JSON.parse(completions);
                        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Chapters/" + id + ".jpg");
                        var card = $(".chapter-card");
                        var courseName = $("<a class='course-title' href='Course.html?id=" + course.id + "'><h4><i class='bx bx-left-arrow-alt'></i>" + course.name + "</h4></a>");
                        card.append(courseName);
                        var chapterName = $("<div class='chapter-title'>" + chapter.name + "</div>");
                        card.append(chapterName);
                        var elementImage = $("<img src='" + image + "' class='chapterImage' alt='" + chapter.name + "'>");
                        card.append(elementImage);
                        var shortDescription = $("<div class='short-desc'>" + chapter.descriptionShort + "</div>");
                        card.append(shortDescription);
                        var longDescription = $("<div class='long-desc'>" + chapter.descriptionLong + "</div>");
                        card.append(longDescription);
                        enableSpeech(card.find(".short-desc, .long-desc"));
                        if (chapter.files.length > 0) {
                            var resources = $("<div class='resources'><h3>Chapter Resources</h3></div>");
                            var resourceList = $("<ul class='resource-list styled-list interactive-list'></ul>");
                            $.each(chapter.files, function (index, file) {
                                var type = getFileType(types, file);
                                var title = file.substr(0, file.lastIndexOf('.')) || file;
                                var li;
                                var url = lmsServer + "/Content/Resource?Course=" + course.id + "&Chapter=" + id + "&FileName=" + encodeURIComponent(file) + "&token=" + encodeURIComponent(token);
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
                                    if (chapter.level > userLevel && userLevel > 0) {
                                        li = $("<li><span><img src='../icons/pdf_icon.png' width='40px'> " + title + "</span> 🔒</li>");
                                        li.click(function () {
                                            showOkayAlert("Locked", "This document will be unlocked at level '" + getUserLevel(chapter.level) + "'", function (button, dialog) {
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

                        if (chapter.lmsDirectories.length > 0) {
                            card.append("<div class='resources'><h3>Modules</h3><div>");
                            var modules = $("<ul class='resource-list styled-list interactive-list'></ul>");
                            $.each(chapter.lmsDirectories, function (index, module) {
                                var li = $("<li><img src='../icons/books.png' width='40px'> " + module.name + "</li>");
                                li.click(function () {
                                    location.href = "Module.html?id=" + module.id;
                                });
                                modules.append(li);
                            });
                            card.append(modules);
                        }

                        if (chapter.lmsReferences.length > 0) {
                            putReferences(card, chapter.lmsReferences);
                        }

                        if (chapter.lmsAssignments.length > 0) {
                            var message = "";
                            if (chapter.level > userLevel && userLevel > 0) {
                                message = "This assignment will be unlocked at level '" + getUserLevel(chapter.level) + "'";
                            }
                            putAssignmentBlock(card, chapter.lmsAssignments, completions, message);
                        }

                        if (chapter.lmsQuestionnaires.length > 0) {
                            var message = "";
                            if (chapter.level > userLevel && userLevel > 0) {
                                message = "This questionnaire will be unlocked at level '" + getUserLevel(chapter.level) + "'";
                            }
                            putQuestionnaireBlock(card, chapter.lmsQuestionnaires, completions, message);
                        }

                        var navigation = $("<div class='navigation'><a href='#' class='nav-btn leftNav'><i class='bx bx-left-arrow-alt'></i> Previous Chapter</a><a href='#' class='nav-btn rightNav'>Next Chapter <i class='bx bx-right-arrow-alt' ></i></a></div>");
                        var previous = navigation.find(".leftNav");
                        if (previousChapter == "") {
                            previous.addClass('disabled-link');
                        } else {
                            previous.attr('href', previousChapter);
                        }
                        var next = navigation.find(".rightNav");
                        if (nextChapter == "") {
                            next.addClass('disabled-link');
                        } else {
                            next.attr('href', nextChapter);
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