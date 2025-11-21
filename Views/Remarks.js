
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    loadRemarks(getURLParam("id"), handleRemarks);
}

var loadRemarks = function (id, callback) {
    $.ajax({
        url: lmsServer + "/Content/AssessmentRemarks?token=" + encodeURIComponent(token) + "&completionId=" + id,
        type: "GET",
        beforeSend: function () {
            showLoading("Loading remarks.. Please wait.");
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            showError("No remarks found for the selected assessment. Click <a class='tryAgainLink' href='#' onclick='history.back(); return false;' > here </a> to go back.");
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
            hideLoading();
        }
    });
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var handleRemarks = function (response) {
    var section = $(".chapter-card");
    section.append("<a class='course-title' href='#' onclick='history.back(); return false;'><h4><i class='bx bx-left-arrow-alt'></i> Back</h4></a>");
    section.append("<div class='chapter-title'>" + response.assessmentType + ": " + response.name + "</div>");
    section.append("<ul class='styled-list'><li style='display:flex; justify-content:space-between;'><span>✔️ Validated By</span><span>" + response.validatedBy +
        "</span></li><li style='display:flex; justify-content:space-between;'><span>🏅 Points Scored</span><span>" + response.points +
        "</span></li><li style='display:flex; justify-content:space-between;'><span>🏆 Result</span><span>" + (response.isPassed ? "Passed" : "Failed") +
        "</span></li><li style='display:flex; justify-content:space-between;'><span><img src='../icons/test.png' width='40px'> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span style='text-align:justify;'>" + response.overallRemarks +
        "</span></li></ul>");
    $.each(response.remarks, function (index, remark) {
        section.append("<div class='resources'><h3>Question " + (index + 1) + ": " + remark.question + "</h3><div class='short-desc'>" + remark.notes + "</div></div>");
    });    

    section.append("<div class='navigation'><a href='#' class='nav-btn leftNav' onclick='history.back(); return false;'><i class='bx bx-left-arrow-alt'></i> Back</a></div>");
}