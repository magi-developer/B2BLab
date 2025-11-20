
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    fetchNotifications();
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var reloadNotifications = function (id, button, indicator) {
    var read = button.is(":checked");
    $.ajax({
        url: lmsServer + "/Content/MarkRead?id=" + id + "&token=" + encodeURIComponent(token) + "&markAs=" + (read ? "0" : "1"),
        type: "GET",
        beforeSend: function () {
            button.prop('disabled', true);
            indicator.html("Marking..");
        },
        success: function (response) {
            setData("notifications", JSON.stringify(response), function () {
                updateUI(response);

                loadUnreadNotifications(response);
            });
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load notifications, the server is not reachable.";
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
}

// var updateUI = function (notifications) {
//     $('.notification-list').empty();
//     $.each(notifications, function (index, notification) {
//         var element = $("<div class='notification-card'><div class='notification-content'><p class='notification-text'>" + notification.details +
//             "</p><span class='notification-meta'>From: <b>" + notification.from + "</b> · " + notification.date + "</span></div></div>");
//         var button;
//         var indicator;
//         if (notification.isRead) {
//             button = $("<label class='theme-toggle'><input type='checkbox' id='dashboardToggle' class='readUnreadcheckbox'><span class='slider'></span></label>");
//             indicator = $("<span class=''>Read &nbsp; </span>");
//         } else {
//             button = $("<label class='theme-toggle'><input type='checkbox' id='dashboardToggle' class='readUnreadcheckbox' checked><span class='slider'></span></label>");
//             indicator = $("<span class=''>Unread &nbsp; </span>");   
//         }
//         button.find('.readUnreadcheckbox').change(function () {
//             reloadNotifications(notification.id, $(this), indicator);
//         });
//         element.append(indicator);
//         element.append(button);

//         $('.notification-list').append(element);
//     });
// }

var allNotifications = []; // to store all notifications globally

var updateUI = function (notifications) {
    allNotifications = notifications; // store full data for filtering
    renderNotifications("all"); // initially show all
};

function renderNotifications(filterType) {
    $('.notification-list').empty();
    let filtered = [];

    if (filterType === "read") {
        filtered = allNotifications.filter(n => n.isRead);
    } else if (filterType === "unread") {
        filtered = allNotifications.filter(n => !n.isRead);
    } else {
        filtered = allNotifications;
    }

    $.each(filtered, function (index, notification) {
        var element = $("<div class='notification-card'></div>");
        var notifyContent = $("<div class='notification-content'><p class='notification-text'>" + notification.details + "</p></div>")
        var notificationMeta = $("<div class='notification-meta'><p>" + notification.from + "</p> <p> " + notification.date + "</p></div>")

        var button, indicator;
        if (notification.isRead) {
            button = $("<label class='theme-toggle'><input type='checkbox' class='readUnreadcheckbox'><span class='slider'></span></label>");
            indicator = $("<span class=''>Read &nbsp; </span>");
        } else {
            button = $("<label class='theme-toggle'><input type='checkbox' class='readUnreadcheckbox' checked><span class='slider'></span></label>");
            indicator = $("<span class=''>Unread &nbsp; </span>");
        }

        button.find('.readUnreadcheckbox').change(function () {
            reloadNotifications(notification.id, $(this), indicator);
        });

        notifyContent.append(indicator);
        indicator.append(button);
        element.append(notificationMeta);
        element.append(notifyContent);
        $('.notification-list').append(element);
    });
}

// Filter Button Logic
$(document).on('click', '.filter-btn', function () {
    $('.filter-btn').removeClass('active');
    $(this).addClass('active');

    const filterType = $(this).data('filter');
    renderNotifications(filterType);
});

var fetchNotifications = function () {
    $.ajax({
        url: lmsServer + "/Content/Notifications?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading your notifications.. Please wait.");
        },
        success: function (response) {
            console.log(response)
            updateUI(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load notifications, the server is not reachable.";
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

