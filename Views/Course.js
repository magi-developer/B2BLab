
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    loadCourse();
}

var loadCourse = function () {
    var id = getURLParam("id");
    getData("coursesDetails", function (courses) {
        console.log(JSON.parse(courses))

        $.each(JSON.parse(courses), function (index, details) {
            var course = details.item1;
            if (course.id == id) {
                GetSupportedVideoTypes(function (types) {
                    getCourse(id, function (lmsDirectory) {
                        getData("UserCompletion", function (completions) {
                            completions = JSON.parse(completions);
                            setData("CurrentCourse", JSON.stringify(lmsDirectory), function () {
                                getData("UserLevel", function (userLevel) {
                                    userLevel = parseInt(userLevel);
                                    var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses/" + id + ".jpg");
                                    var element = $('.course-details');
                                    var name = lmsDirectory.name.charAt(0).toUpperCase() + lmsDirectory.name.slice(1);
                                    var h2 = $("<h2>" + name + "</h2>");
                                    element.append(h2);
                                    var elementImage = $("<img src='" + image + "' class='courseImage' alt='" + lmsDirectory.name + "'>");
                                    element.append(elementImage);
                                    var shortDescription = $("<p class='desc sd'><b>" + lmsDirectory.descriptionShort + "</b></p>");
                                    var longDescription = $("<p class='desc'>" + lmsDirectory.descriptionLong + "</p>");
                                    element.append(shortDescription);
                                    element.append(longDescription);
                                    element.append("<h3>Resources</h3>");
                                    enableSpeech(element.find("p"));
                                    if (lmsDirectory.files.length > 0) {
                                        var resources = $("<ul class='resource-list styled-list interactive-list'></ul>");
                                        $.each(lmsDirectory.files, function (index, file) {
                                            var type = getFileType(types, file);
                                            var title = file.substr(0, file.lastIndexOf('.')) || file;
                                            var li;
                                            if (type == "video") {
                                                li = $("<li><img src='../icons/video_icon.png' width='40px'> " + title + "</li>");
                                                li.click(function () {
                                                    var url = lmsServer + "/Content/Resource?Course=" + id + "&FileName=" + encodeURIComponent(file) + "&token=" + encodeURIComponent(token);
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
                                                li = $("<li><img src='../icons/pdf_icon.png' width='40px'> " + title + "</li>");
                                                li.click(function () {
                                                    var url = lmsServer + "/Content/Resource?Course=" + id + "&FileName=" + encodeURIComponent(file) + "&token=" + encodeURIComponent(token);
                                                    openDocument(url, title, function (error) {
                                                        if (error !== "") {
                                                            showOkayAlert("Please contact support", error, function (button, dialog) {
                                                                dialog.remove();
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                            if (type == "other") {
                                                li = $("<li>❓ " + title + "</li>");
                                                li.click(function () {
                                                    var url = lmsServer + "/Content/Resource?Course=" + id + "&FileName=" + encodeURIComponent(file) + "&token=" + encodeURIComponent(token);
                                                    openFile(url, function (error) {
                                                        if (error !== "") {
                                                            showOkayAlert("Please contact support", error, function (button, dialog) {
                                                                dialog.remove();
                                                            });
                                                        }
                                                    });
                                                });
                                            }
                                            resources.append(li);
                                        });
                                        element.append(resources);
                                    }

                                    if (lmsDirectory.lmsDirectories.length > 0) {
                                        element.append("<h3>Chapters</h3>");
                                        var chapters = $("<ul class='resource-list styled-list interactive-list'></ul>");
                                        $.each(lmsDirectory.lmsDirectories, function (index, chapter) {
                                            var li = $("<li><img src='../icons/test.png' width='40px'> " + chapter.name + "</li>");
                                            li.click(function () {
                                                location.href = "Chapter.html?id=" + chapter.id;
                                            });
                                            chapters.append(li);
                                        });
                                        element.append(chapters);
                                    }

                                    if (lmsDirectory.lmsReferences.length > 0) {
                                        putReferences(element, lmsDirectory.lmsReferences);
                                    }
                                    if (lmsDirectory.lmsAssignments.length > 0) {
                                        putAssignmentBlock(element, lmsDirectory.lmsAssignments, completions, "");
                                    }
                                    if (lmsDirectory.lmsQuestionnaires.length > 0) {
                                        putQuestionnaireBlock(element, lmsDirectory.lmsQuestionnaires, completions, "");
                                    }
                                });
                            });
                        });
                    });
                });
                var courseDetails = details.item2;
                var firstIncompleteFound = true;
                var completed = 0;
                var chapterCount = 0;
                $.each(courseDetails, function (index, details) {
                    if (details.isChapter) {
                        chapterCount++;
                        var name = details.chapterName;
                        var li = "";
                        if (details.isPassed) {
                            li = $("<li class='Completed tooltip' data-title='completed'><div class='icon' aria-hidden='true'><i class='bx bxs-label'></i></div>" + name + "</li>");
                            li.click(function () {
                                var message = "<h4 style='text-align:justify;'>Assignments: </h4>";
                                var assignments = "";
                                var questionnaire = "";
                                $.each(details.assessments, function (index, assessment) {
                                    if (assessment.isQuestionnaire) {
                                        questionnaire = questionnaire + "<li>" + assessment.name + "</li>";
                                    } else {
                                        assignments = assignments + "<li>" + assessment.name + "</li>";
                                    }
                                });
                                message = message + "<ul class='styled-list'>" + assignments + "</ul>";
                                message = message + "<h4 style='text-align:justify;'>Questionnaires: </h4>";
                                message = message + "<ul class='styled-list'>" + questionnaire + "</ul>";
                                showOkayAlert(name, message, function (button, dialog) {
                                    dialog.remove();
                                });
                            });
                            completed++;
                        } else {
                            if (firstIncompleteFound) {
                                firstIncompleteFound = false;
                                li = "<li class='current tooltip' data-title='Current'><div class='icon' aria-hidden='true'><i class='bx bxs-label'></i></div>" + name + "</li>";
                            } else {
                                li = "<li class='upcoming tooltip' data-title='Upcoming'><div class='icon' aria-hidden='true'><i class='bx bxs-label'></i></div>" + name + "</li>";
                            }
                        }
                        $(".progress-list").append(li);
                    }
                });
                var certLi = li = "<li class='upcoming certLi tooltip'  data-title='Upcoming'><div class='icon' aria-hidden='true'><i class='bx bxs-label'></i></div>Certificate</li>";
                $(".progress-list").append(certLi);
                var per = ((95 * completed) / (chapterCount)) / 100;
                setTimeout(function () { $(".progress-list").css("--progress", per); }, 1000);
            }
        });
    });
}

var getCourse = function (id, callback) {
    $.ajax({
        url: lmsServer + "/Content/Course?id=" + id + "&token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading the course.. Please wait.");
        },
        success: function (response) {
            callback(response);
            console.log(response)
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load the course, the server is not reachable.";
                showError(e);
            } else {
                showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
            }
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
            hideLoading();
        }
    });
};


var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}