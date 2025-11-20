
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    var type = getURLParam("type");
    loadAssessment(type);
}

var loadAssessment = function (type) {
    getData("CurrentAssessment", function (assessment) {
        assessment = JSON.parse(assessment);
        var name;
        var assignmentId = -1;
        var questionnaireId = -1;
        if (type == "questionnaire") {
            questionnaireId = assessment.id;
            name = assessment.questionnaireName;
        } else {
            assignmentId = assessment.id;
            name = assessment.assignmentName;
        }
        getAssessment(assessment.id, type, function (response) {
            var questionnaire = $('.questionnaire');
            questionnaire.append("<h2 class='assessmentName'>" + name + "</h2>");
            $.each(response, function (index, question) {
                var questionElement;
                if (question.questionType == 1) {
                    questionElement = getMultipleChoiceQuestion((index + 1), question);
                }
                if (question.questionType == 2) {
                    questionElement = getMultiAnswerQuestion((index + 1), question);
                }
                if (question.questionType == 3) {
                    questionElement = getBooleanQuestion((index + 1), question);
                }
                if (question.questionType == 4) {
                    questionElement = getEssayQuestion((index + 1), question);
                }
                if (question.questionType == 5) {
                    questionElement = getFileOutputQuestion((index + 1), question);
                }
                questionnaire.append(questionElement);
            });
            var navigation = $("<div class='navigation'><a href='' class='nav-btn leftNav'>⬅️ Go Back</a><a href='' class='nav-btn rightNav greenHover'>💾 Submit</a></div>");
            var goBack = navigation.find(".leftNav");
            var submit = navigation.find(".rightNav");
            goBack.click(function () {
                window.history.back();
                return false;
            });
            submit.click(function () {
                if ($(this).hasClass('disabled')) { return false; }
                getAnswers(function (errorObject, answeredQuestions) {
                    if (errorObject == null) {
                        var uploadData = {};
                        uploadData.AssignmentId = assignmentId;
                        uploadData.QuestionnaireId = questionnaireId;
                        uploadData.AnsweredQuestions = answeredQuestions;
                        uploadData.Token = token;
                        uploadData.URL = lmsServer + "/Content/UserFileUpload";
                        (async () => {
                            const bridge = chrome.webview.hostObjects.bridge;
                            var uploadResponse = await bridge.UploadAssessment(JSON.stringify(uploadData));
                            if (uploadResponse == "") {
                                var message = "";
                                if (assignmentId > 0) {
                                    message = "The assignment has been submitted successfully and will be evaluated soon.";
                                }
                                if (questionnaireId > 0) {
                                    message = "The questionnaire has been submitted successfully.";
                                }
                                getUserCompletion(function () {
                                    showOkayAlert("Success", message, function (button, element) {
                                        element.remove();
                                        window.history.back();
                                    });
                                });
                            } else {
                                showOkayAlert("Failed", uploadResponse, function (button, element) {
                                    element.remove();
                                    window.history.back();
                                });
                            }
                            
                        })();
                        showLoading("Processing.. Please wait.");
                    } else {
                        $('.rightNav').addClass('disabled');
                        highlightElement(errorObject, function () {
                            $('.rightNav').removeClass('disabled');
                        });
                    }
                });
                return false;
            });
            questionnaire.append(navigation);
        });
    });
}

var getAnswers = function (callback) {
    getData("CurrentQuestions", function (questions) {
        questions = JSON.parse(questions);
        var questionnaire = $('.question-block');
        var errorObject = null;
        var answeredQuestions = [];
        questionnaire.each(function (index, questionBlock) {
            questionBlock = $(questionBlock);
            if (errorObject == null) {
                var questionId = parseInt(questionBlock.attr('questionId'));
                var serial = questionBlock.attr('serial');
                var question = questions.filter(function (item) {
                    return item.id == questionId;
                })[0];
                question.description = "";
                if (question.questionType == 1 || question.questionType == 2) {
                    question.answer1 = questionBlock.find('.answer1').is(":checked");
                    question.answer2 = questionBlock.find('.answer2').is(":checked");
                    question.answer3 = questionBlock.find('.answer3').is(":checked");
                    question.answer4 = questionBlock.find('.answer4').is(":checked");
                    question.answer5 = questionBlock.find('.answer5').is(":checked");
                    question.answer6 = questionBlock.find('.answer6').is(":checked");
                    if (question.answer1 == false && question.answer2 == false && question.answer3 == false && question.answer4 == false && question.answer5 == false && question.answer6 == false) {
                        errorObject = questionBlock;
                    }
                }
                if (question.questionType == 3) {
                    question.answer = questionBlock.find('input[name="' + "choice" + serial + '"]:checked').val() == "1";
                    if (questionBlock.find('input[name="' + "choice" + serial + '"]:checked').length == 0) {
                        errorObject = questionBlock;
                    }
                }
                if (question.questionType == 4) {
                    question.answer = questionBlock.find('.answer').val();
                    if (question.answer == "") {
                        errorObject = questionBlock;
                    }
                }
                if (question.questionType == 5) {
                    var fileNameblock = questionBlock.find(".selectedFile");
                    var isSelected = fileNameblock.attr('isselected') == "1";
                    if (isSelected) {
                        question.description = questionBlock.find('.description').val();
                        question.answer = questionBlock.find('.file-upload').attr('fullName');
                    } else {
                        errorObject = questionBlock;
                    }
                }
                answeredQuestions.push(question);
            }
        });
        callback(errorObject, answeredQuestions);
    });
}

//type=1
var getMultipleChoiceQuestion = function (sl, question){
    var block = $("<div class='question-block' type='1' questionId='" + question.id + "' serial='" + sl + "'></div>");
    var title = $("<div class='question-title'>" + sl + ". " + question.question + "</div>");
    block.append(title);

    var options = $("<div class='options'></div>");
    if (question.choice1 != null && question.choice1 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer1' />" + question.choice1 + "</label>"));
    }
    if (question.choice2 != null && question.choice2 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer2' />" + question.choice2 + "</label>"));
    }
    if (question.choice3 != null && question.choice3 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer3' />" + question.choice3 + "</label>"));
    }
    if (question.choice4 != null && question.choice4 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer4' />" + question.choice4 + "</label>"));
    }
    if (question.choice5 != null && question.choice5 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer5' />" + question.choice5 + "</label>"));
    }
    if (question.choice6 != null && question.choice6 != "") {
        options.append($("<label><input type='radio' name='choice" + sl + "' class='answer6' />" + question.choice6 + "</label>"));
    }
    block.append(options);
    return block;
}

//type=2
var getMultiAnswerQuestion = function (sl, question) {
    var block = $("<div class='question-block' type='2' questionId='" + question.id + "' serial='" + sl + "'></div>");
    var title = $("<div class='question-title'>" + sl + ". " + question.question + "</div>");
    block.append(title);

    var options = $("<div class='options'></div>");
    if (question.choice1 != null && question.choice1 != "") {
        options.append($("<label><input type='checkbox' class='answer1' />" + question.choice1 + "</label>"));
    }
    if (question.choice2 != null && question.choice2 != "") {
        options.append($("<label><input type='checkbox' class='answer2' />" + question.choice2 + "</label>"));
    }
    if (question.choice3 != null && question.choice3 != "") {
        options.append($("<label><input type='checkbox' class='answer3' />" + question.choice3 + "</label>"));
    }
    if (question.choice4 != null && question.choice4 != "") {
        options.append($("<label><input type='checkbox' class='answer4' />" + question.choice4 + "</label>"));
    }
    if (question.choice5 != null && question.choice5 != "") {
        options.append($("<label><input type='checkbox' class='answer5' />" + question.choice5 + "</label>"));
    }
    if (question.choice6 != null && question.choice6 != "") {
        options.append($("<label><input type='checkbox' class='answer6' />" + question.choice6 + "</label>"));
    }
    block.append(options);
    return block;
}

//type=3
var getBooleanQuestion = function (sl, question) {
    var block = $("<div class='question-block' type='3' questionId='" + question.id + "' serial='" + sl + "'></div>");
    var title = $("<div class='question-title'>" + sl + ". " + question.question + "</div>");
    block.append(title);

    var options = $("<div class='toggle'></div>");
    options.append($("<label><input type='radio' name='choice" + sl + "' class='answer1' value='1'/>Yes</label>"));
    options.append($("<label><input type='radio' name='choice" + sl + "' class='answer1' value='0'/>No</label>"));
    block.append(options);
    return block;
}

//type=4
var getEssayQuestion = function (sl, question) {
    var block = $("<div class='question-block' type='4' questionId='" + question.id + "' serial='" + sl + "'></div>");
    block.append($("<div class='question-title'>" + sl + ". " + question.question + "</div>"));
    block.append($("<textarea class='answer' placeholder='Type your answer here'></textarea>"));
    return block;
}

//type=5
var getFileOutputQuestion = function (sl, question) {
    var block = $("<div class='question-block question-block" + sl + "' type='5' questionId='" + question.id + "' serial='" + sl + "'></div>");
    block.append($("<div class='question-title'>" + sl + ". " + question.question + "</div>"));
    block.append($("<textarea class='description' placeholder='Type your description here'></textarea>"));
    var fileInput = $("<div class='file-upload'><div><button class='file-upload-button'>Select File</button> <span class='selectedFile' isselected='0'>Click on Select File to choose output file to upload</span></div><span class='clearFileInput'>❌ Clear</span></div>");
    fileInput.find('.clearFileInput').hide();
    fileInput.find('.clearFileInput').click(function () {
        fileInput.find('.selectedFile').html("Click on Select File to choose output file to upload");
        fileInput.removeAttr("fullName");
        fileInput.find('.selectedFile').attr("isselected", "0");
        fileInput.find('.clearFileInput').hide();
    });
    fileInput.find('.file-upload-button').click(function () {
        OpenFileDialog("question-block" + sl, "fileSelectionCallback", "Select an output file to upload", question.outputFileExtension, question.outputFileMaxSize, "0");
    });
    block.append(fileInput);
    return block;
}

var fileSelectionCallback = function (blockClassName, result) {
    var block = $("." + blockClassName);
    var fileInput = block.find('.file-upload');
    if (result.IsSuccess) {
        fileInput.find('.selectedFile').html(result.FileName);
        fileInput.attr("fullName", result.FullFileName);
        fileInput.find('.selectedFile').attr("isselected", "1");
        fileInput.find('.clearFileInput').show();
    } else {
        if (result.Error != "") {
            showOkayAlert("Error", result.Error, function (button, element) {
                element.remove();
            });
        }
    }
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var getAssessment = function (id, type, callback) {
    $.ajax({
        url: lmsServer + "/Content/" + type + "?id=" + id + "&token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading the " + type + ".. Please wait.");
        },
        success: function (response) {
            setData("CurrentQuestions", JSON.stringify(response), function () {
                callback(response);
            });
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load the " + type + ", the server is not reachable.";
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