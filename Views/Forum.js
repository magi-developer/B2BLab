var currentOffset = 0;
var currentSize = 10;
var filtered = false;
var topicId = null;

function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    getTopics(loadForum);

    $('.forum-search-btn').click(function () {
        var search = $('.forum-search-input').val();
        if (search == "" && !filtered) {
            $('.forum-search-btn').prop('disabled', true);
            highlightElement($('.forum-search-input'), function () {
                $('.forum-search-btn').prop('disabled', false);
            })
            return;
        }
        currentOffset = 0;
        getTopics(loadForum);
    });

    $('.pagerPrev').click(function () {
        goToPreviousPage(loadForum);
    });

    $('.pagerNext').click(function () {
        goToNextPage(loadForum);
    });

    $('#newTopicForm').submit(function (e) {
        var name = $(this).find('#topicTitle').val();
        var desc = $(this).find('#topicDescription').val();

        if (name.trim() == "" || desc.trim() == "") {
            e.preventDefault();
            showOkayAlert("Error", "Empty fields found", function (b, e) {
                e.remove();
            });
            return false;
        }

        $.ajax({
            url: lmsServer + "/Content/AddTopic?topicName=" + name + "&topicDescription=" + encodeURIComponent(desc) + "&token=" + encodeURIComponent(token),
            type: "GET",
            beforeSend: function () {
                $('.postTopic').prop('disabled', true).html("Submitting..");
            },
            success: function (response) {
                $('.postTopic').prop('disabled', false).html("Post Topic");
                $('#topicTitle').val("");
                $('#topicDescription').val("");
                var topicDiv = addTopic(response);
                $('#topics-container').append(topicDiv);
            },
            error: function (xhr, status, error) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    e = "Unable to add the topic, the server is not reachable.";
                    showError(e);
                } else {
                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                }
            },
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            complete: function (response) {

            }
        });
        return false;
    });

    $('.insertImageTopic').click(function () {
        var textArea = $('#topicDescription');
        if (textArea.val().length > 850) {
            showOkayAlert("Error", "Cannot insert image, max charecters in topic description is 1000", function (b, e) {
                e.remove();
            });
        } else {
            uploadUserFile("Select an image", function (fileUrl) {
                var imageLink = "\n\n<br/><br/><img src='" + fileUrl + "' class='commentImage' /><br/><br/>\n\n";
                var cursorPos = textArea.prop('selectionStart');
                var v = textArea.val();
                var textBefore = v.substring(0, cursorPos);
                var textAfter = v.substring(cursorPos, v.length);
                var newVal = textBefore + imageLink + textAfter;
                textArea.val(textBefore + imageLink + textAfter);
            });
        }
    });

    $('.previewTopic').click(function () {
        var textArea = $('#topicDescription');
        var content = textArea.val();
        showOkayAlert($('#topicTitle').val(), "<div style='width:100%; text-align:left;'>" + content + "</div>", function (b, e) {
            e.remove();
        });
    });

    $(document).on('click', '.forumPopUpGenerater', function(){
        $('.new-topic-form, .overlay').fadeIn();
        console.log('popup clicked');
    })
    $(document).on('click', '.overlay', function(){
        $('.model, .overlay').fadeOut();
        console.log('popup closed');
    })



}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var goToNextPage = function (callback) {
    currentOffset = currentOffset + currentSize;
    getTopics(callback);
}

var goToPreviousPage = function (callback) {
    currentOffset = currentOffset - currentSize;
    getTopics(callback);
}

var getTopics = function (callback) {
    topicId = getURLParam("id");
    if (topicId == null) {
        var search = $('.forum-search-input').val();
        $('#topics-container').empty();
        loadTopics(currentOffset, search, null, callback);
    } else {
        $('#topics-container').empty();
        window.history.pushState("changeURL", "Title", "Forum.html");
        loadTopics(currentOffset, "", topicId, callback);
    }

}

var loadTopics = function (offset, search, id, callback) {
    if (offset == undefined || offset == null) {
        offset = 0;
    }
    var url = lmsServer + "/Content/Topics?offset=" + offset + "&size=" + currentSize + "&search=" + search + "&token=" + encodeURIComponent(token);
    if (id != null) {
        url = url + "&id=" + id;
    }
    $.ajax({
        url: url,
        type: "GET",
        beforeSend: function () {
            showLoading("Loading topics.. Please wait.");
        },
        success: function (response) {
            callback(response);
            console.log(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load the topics, the server is not reachable.";
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
}

var loadForum = function (topicResponse) {
    var topicReversed = topicResponse.topics.reverse();
    $.each(topicReversed, function (index, topic) {
        var div = addTopic(topic);
        $('#topics-container').append(div);
    });
    $('.pagerPrev').prop("disabled", false);
    $('.pagerNext').prop("disabled", false);
    if (topicResponse.offset == 0) {
        $('.pagerPrev').prop("disabled", true);
    }
    if (topicResponse.offset + topicResponse.pageSize >= topicResponse.total) {
        $('.pagerNext').prop("disabled", true);
    }
    filtered = topicResponse.search != "";
    if (topicId != null) {
        $('.topic-header').trigger('click');
        topicId = null;
        $('.forum-search-back').show();
    }
}

var addComment = function (comment) {
    var commentDiv = $("<div class='comment'><div class='commentHeader'><div class='comment-meta'>@" + comment.user + " · " + comment.date + "</div></div><div>" + comment.comment + "</div></div>");
    if (comment.isAllowedToDelete) {
        deleteBtn = $("<div class='deleteComment'>❌</div>");
        deleteBtn.click(function () {

            $(this).hide();
            $(this).remove();

            $.ajax({
                url: lmsServer + "/Content/DeleteComment?commentId=" + comment.id + "&token=" + encodeURIComponent(token),
                type: "GET",
                beforeSend: function () {

                },
                success: function (response) {
                    commentDiv.remove();
                },
                error: function (xhr, status, error) {
                    var e = eval("(" + xhr.responseText + ")");
                    if (e == undefined) {
                        e = "Unable to delete the comment, the server is not reachable.";
                        showError(e);
                    } else {
                        showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                    }
                },
                dataType: "JSON",
                contentType: "application/json; charset=utf-8",
                complete: function (response) {

                }
            });
        });
        commentDiv.find('.commentHeader').append(deleteBtn);
    }
    return commentDiv;
}

var addTopic = function (topic) {
    var topicDiv = $("<div class='topic'><div class='topic-header'><div class='topicTitle'><span class='topicName'>" + topic.topicName + "</span><span class='topic-meta'>By " + topic.user + "  " + topic.date + "</span></div><div class='topicDescription'>" + topic.description + "</div></div></div>");
    var topicBody = $("<div class='topic-body'></div>");
    $.each(topic.comments, function (index, comment) {
        var div = addComment(comment);
        topicBody.append(div);
    });



    var newComment = $("<form class='comment-form'><textarea placeholder='Add a comment' required='' class='newComment' maxlength='1000'></textarea><div class='commentActions'><button class='addNewComment' type='submit'>Comment</button><button class='insertImage' type='button'>Insert Image</button><button class='previewComment' type='button'>Preview</button></div></form>");

    newComment.submit(function (e) {
        var comment = $(this).find('.newComment').val();

        if (comment.trim() == "") {
            e.preventDefault();
            showOkayAlert("Error", "Empty comment", function (b, e) {
                e.remove();
            });
            return false;
        }

        $.ajax({
            url: lmsServer + "/Content/AddComment?topicId=" + topic.id + "&comment=" + encodeURIComponent(comment) + "&token=" + encodeURIComponent(token),
            type: "GET",
            beforeSend: function () {
                newComment.find('.addNewComment').prop('disabled', true).html("Submitting..");
            },
            success: function (response) {
                newComment.find('.addNewComment').prop('disabled', false).html("Comment");
                var commentDiv = addComment(response);
                newComment.before(commentDiv);
                newComment.find('.newComment').val("");
            },
            error: function (xhr, status, error) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    e = "Unable to add the topic, the server is not reachable.";
                    showError(e);
                } else {
                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                }
            },
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            complete: function (response) {

            }
        });
        return false;
    });

    newComment.find('.insertImage').click(function () {
        var textArea = newComment.find('.newComment');
        if (textArea.val().length > 850) {
            showOkayAlert("Error", "Cannot insert image, max charecters per comment is 1000", function (b, e) {
                e.remove();
            });
        } else {
            uploadUserFile("Select an image", function (fileUrl) {
                var imageLink = "\n\n<br/><br/><img src='" + fileUrl + "' class='commentImage' /><br/><br/>\n\n";
                var cursorPos = textArea.prop('selectionStart');
                var v = textArea.val();
                var textBefore = v.substring(0, cursorPos);
                var textAfter = v.substring(cursorPos, v.length);
                var newVal = textBefore + imageLink + textAfter;
                textArea.val(textBefore + imageLink + textAfter);
            });
        }
    });

    newComment.find('.previewComment').click(function () {
        var textArea = newComment.find('.newComment');
        var content = textArea.val();
        showOkayAlert("Comment preview", "<div style='width:100%; text-align:left;'>" + content + "</div>", function (b, e) {
            e.remove();
        });
    });





    topicBody.append(newComment);
    topicDiv.find('.topic-header').click(function () {
        if (topicBody.is(":visible")) {
            topicBody.hide();
            $('.topic-body').removeClass('active')
            console.log('unclicked');

        } else {
            topicBody.show();
            $(this).siblings(".topic-body").toggleClass("active");
            // $('.topic-body').addClass('active')
            console.log('clicked');
        }
    });
    topicDiv.append(topicBody);

    // let topicCard = document.querySelectorAll('.topic');

    // let observe = new IntersectionObserver(entries => {
    //     entries.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             entry.target.classList.add('show');
    //         }
    //     });
    // });

    // topicCard.forEach(card => observe.observe(card));

    return topicDiv;



}