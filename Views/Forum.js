var currentOffset = 0;
var currentSize = 10;
var filtered = false;
var topicId = null;
var currentOpenTopic = null;

function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    getTopics(loadForum);

    let typingTimer;
    let typingDelay = 300; // ms

    $('#forumSearch').on('keyup', function (e) {

        clearTimeout(typingTimer);

        var search = $(this).val().trim();

        // ENTER key
        if (e.key === "Enter") {
            triggerSearch(search);
            return;
        }

        // Typing auto search
        typingTimer = setTimeout(function () {
            triggerSearch(search);
        }, typingDelay);
    });

    function triggerSearch(search) {

        if (search === "" && !filtered) {
            highlightElement($('#forumSearch'));
            return;
        }

        currentOffset = 0;
        getTopics(loadForum);
    }

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

    $(document).on('click', '.forumPopUpGenerater', function () {
        $('.new-topic-form, .overlay').fadeIn();
        console.log('popup clicked');
    })
    $(document).on('click', '.overlay', function () {
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
            // response.topics = response.topics.reverse();
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
    $.each(topicResponse.topics.reverse(), function (index, topic) {
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

    // document.getElementById("forumSearch").addEventListener("keyup", function () {
    //     let filter = this.value.toLowerCase();
    //     let cards = document.querySelectorAll(".topic-header");

    //     cards.forEach(card => {
    //         let text = card.innerText.toLowerCase();
    //         card.style.display = text.includes(filter) ? "grid" : "none";
    //     });
    // });

}

var addComment = function (comment) {
    var commentDiv = $("<div class='comment'><div class='commentHeader'><div class='comment-meta'><strong>@" + comment.user + "</strong> · " + comment.date + "</div></div><div>" + comment.comment + "</div></div>");

    if (comment.isAllowedToDelete) {
        deleteBtn = $("<div class='deleteComment'>❌</div>");
        deleteBtn.click(function () {

            $(this).hide();
            $(this).remove();

            $.ajax({
                url: lmsServer + "/Content/DeleteComment?commentId=" + comment.id + "&token=" + encodeURIComponent(token),
                type: "GET",
                success: function (response) {

                    commentDiv.remove();

                    // ⭐ FIX: Update topic comments list in memory
                    if (currentOpenTopic) {
                        currentOpenTopic.comments =
                            currentOpenTopic.comments.filter(c => c.id !== comment.id);
                    }
                },
                error: function (xhr, status, error) {
                    var e = eval("(" + xhr.responseText + ")");
                    if (e == undefined) {
                        showError("Unable to delete the comment, the server is not reachable.");
                    } else {
                        showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                    }
                }
            });

        });
        commentDiv.find('.commentHeader').append(deleteBtn);
    }

    return commentDiv;
}

// var addTopic = function (topic) {
//     // let item = JSON.stringify(topic);
//     var topicDiv = $("<div class='topic' ><div class='topic-header'><div class='topicTitle'><span class='topicName'>" + topic.topicName + "</span><span class='topic-meta'>By " + topic.user + "  " + topic.date + "</span></div></div></div>"); //<div class='topicDescription'>" + topic.description + "</div>
//         topicDiv.data('item', topic)
//     var topicBody = $("<div class='topic-body'></div>");
//     $.each(topic.comments, function (index, comment) {
//         var div = addComment(comment);
//         topicBody.append(div);
//     });



//     var newComment = $("<form class='comment-form'><textarea placeholder='Add a comment' required='' class='newComment' maxlength='1000'></textarea><div class='commentActions'><button class='addNewComment' type='submit'>Comment</button><button class='insertImage' type='button'>Insert Image</button><button class='previewComment' type='button'>Preview</button></div></form>");

//     newComment.submit(function (e) {
//         var comment = $(this).find('.newComment').val();

//         if (comment.trim() == "") {
//             e.preventDefault();
//             showOkayAlert("Error", "Empty comment", function (b, e) {
//                 e.remove();
//             });
//             return false;
//         }

//         $.ajax({
//             url: lmsServer + "/Content/AddComment?topicId=" + topic.id + "&comment=" + encodeURIComponent(comment) + "&token=" + encodeURIComponent(token),
//             type: "GET",
//             beforeSend: function () {
//                 newComment.find('.addNewComment').prop('disabled', true).html("Submitting..");
//             },
//             success: function (response) {
//                 newComment.find('.addNewComment').prop('disabled', false).html("Comment");
//                 var commentDiv = addComment(response);
//                 newComment.before(commentDiv);
//                 newComment.find('.newComment').val("");
//             },
//             error: function (xhr, status, error) {
//                 var e = eval("(" + xhr.responseText + ")");
//                 if (e == undefined) {
//                     e = "Unable to add the topic, the server is not reachable.";
//                     showError(e);
//                 } else {
//                     showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
//                 }
//             },
//             dataType: "JSON",
//             contentType: "application/json; charset=utf-8",
//             complete: function (response) {

//             }
//         });
//         return false;
//     });

//     newComment.find('.insertImage').click(function () {
//         var textArea = newComment.find('.newComment');
//         if (textArea.val().length > 850) {
//             showOkayAlert("Error", "Cannot insert image, max charecters per comment is 1000", function (b, e) {
//                 e.remove();
//             });
//         } else {
//             uploadUserFile("Select an image", function (fileUrl) {
//                 var imageLink = "\n\n<br/><br/><img src='" + fileUrl + "' class='commentImage' /><br/><br/>\n\n";
//                 var cursorPos = textArea.prop('selectionStart');
//                 var v = textArea.val();
//                 var textBefore = v.substring(0, cursorPos);
//                 var textAfter = v.substring(cursorPos, v.length);
//                 var newVal = textBefore + imageLink + textAfter;
//                 textArea.val(textBefore + imageLink + textAfter);
//             });
//         }
//     });

//     newComment.find('.previewComment').click(function () {
//         var textArea = newComment.find('.newComment');
//         var content = textArea.val();
//         showOkayAlert("Comment preview", "<div style='width:100%; text-align:left;'>" + content + "</div>", function (b, e) {
//             e.remove();
//         });
//     });





//     topicBody.append(newComment);
//     topicDiv.find('.topic-header').click(function () {
//         if (topicBody.is(":visible")) {
//             topicBody.hide();
//             $('.topic-body').removeClass('active')
//             console.log('unclicked');

//         } else {
//             topicBody.show();
//             $(this).siblings(".topic-body").toggleClass("active");
//             // $('.topic-body').addClass('active')
//             console.log('clicked');
//         }
//     });
//     topicDiv.append(topicBody);

//     // let topicCard = document.querySelectorAll('.topic');

//     // let observe = new IntersectionObserver(entries => {
//     //     entries.forEach(entry => {
//     //         if (entry.isIntersecting) {
//     //             entry.target.classList.add('show');
//     //         }
//     //     });
//     // });

//     // topicCard.forEach(card => observe.observe(card));

//     return topicDiv;

// }

var addTopic = function (topic) {
    console.log(topic)
    // Create card container
    var topicDiv = $(`
        <div class='topic'>
            <div class='topic-header'>
                <div class='topicTitle'>
                    <span class='topicName'>${topic.topicName}</span>
                    <span class='topic-meta'>By ${topic.user} ${topic.date}</span>
                </div>
            </div>
        </div>
    `);

    // Store full topic object (SAFE way)
    topicDiv.data("item", topic);

    // On clicking the topic → open detail page
    topicDiv.click(function () {

        // Get stored topic object
        let t = $(this).data("item");

        showTopicDetail(t);  // call the detail view
    });

    return topicDiv;
}

function showTopicDetail(topic) {
    // console.log(topic)
    currentOpenTopic = topic;

    $("#topics-container").hide();
    $(".forum-pagination").hide();
    $(".forumPopUpGenerater").hide();
    $(".forum-search-container").hide();
    $("#topic-detail").show().html("");

    let detail = $(`
        <div class="topic-detail-container">

            <button id="backBtn">← Back</button>

            <h2>${topic.topicName}</h2>
            <p class="topic-meta">By ${topic.user} • ${topic.date}</p>

            <div class="topic-full-description">${topic.description}</div>

            <h3>Comments</h3>
            <div id="comments-container"></div>

        </div>
    `);

    $("#topic-detail").append(detail);

    // Load existing comments
    topic.comments.forEach(comment => {
        $("#comments-container").append(addComment(comment));
    });

    // Add your old comment form
    $("#comments-container").append(addCommentForm(topic));

    // Back button
    $("#backBtn").click(() => {
        $("#topic-detail").hide();
        $(".forum-pagination").show();
        $(".forumPopUpGenerater").show();
        $("#topics-container").show();
        $(".forum-search-container").show();
    });

    // $(".alert-button").click(() => {
    //     $(".alert-popup").hide();
    //     console.log('hai')
    //     $(".overlay").hide();
    // });


}

function addCommentForm(topic) {

    var newComment = $("<form class='comment-form'>" +
        "<textarea placeholder='Add a comment' required class='newComment' maxlength='1000'></textarea>" +
        "<div class='commentActions'>" +
        "<button class='addNewComment' type='submit'>Comment</button>" +
        "<button class='insertImage' type='button'>Insert Image</button>" +
        "<button class='previewComment' type='button'>Preview</button>" +
        "</div></form>");

    newComment.submit(function (e) {
        e.preventDefault();

        var comment = $(this).find('.newComment').val().trim();
        if (comment === "") {
            showOkayAlert("Error", "Empty comment", function (b, e) {
                e.remove();
            });
            return false;
        }

        $.ajax({
            url: lmsServer + "/Content/AddComment?topicId=" + topic.id +
                "&comment=" + encodeURIComponent(comment) +
                "&token=" + encodeURIComponent(token),
            type: "GET",

            beforeSend: function () {
                newComment.find('.addNewComment').prop('disabled', true).html("Submitting..");
            },

            success: function (response) {
                newComment.find('.addNewComment').prop('disabled', false).html("Comment");

                var commentDiv = addComment(response);
                newComment.before(commentDiv);
                newComment.find('.newComment').val("");

                // ⭐ FIX: Add comment to memory so it won’t disappear
                if (currentOpenTopic) {
                    currentOpenTopic.comments.push(response);
                }
            },

            error: function (xhr) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    showError("Unable to add the comment. Server unreachable.");
                } else {
                    showError("Error: " + e.title + ". Click <a href='Login.html'>here</a> to login.");
                }
            }
        });

        return false;
    });


    // Insert image into comment
    newComment.find('.insertImage').click(function () {
        var textArea = newComment.find('.newComment');
        if (textArea.val().length > 850) {
            showOkayAlert("Error", "Cannot insert image, max charecters per comment is 1000", function (b, e) {
                e.remove();
            });
        } else {
            uploadUserFile("Select an image", function (fileUrl) {
                var img = `<br><br><img src='${fileUrl}' class='commentImage'/><br><br>`;
                var cursor = textArea.prop('selectionStart');
                var txt = textArea.val();
                textArea.val(txt.substring(0, cursor) + img + txt.substring(cursor));
            });
        }
    });


    // Preview comment
    newComment.find('.previewComment').click(function () {
        var content = newComment.find('.newComment').val();
        showOkayAlert("Comment preview", "<div style='width:100%; text-align:left;'>" + content + "</div>", function (b, e) {
            e.remove();
        });
    });

    return newComment;
}
