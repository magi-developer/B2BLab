
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    LoadEvents();

    // let eventCard = document.querySelectorAll('.event-card');
    // let observe = new IntersectionObserver(entity => {
    //     entity.forEach(entry => {
    //         if (entry.isIntersecting) {
    //             entry.target.classList.add('show')
    //         }
    //     })
    // })
    // eventCard.forEach(card => observe.observe(card));

}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var getEvents = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/UserEvents?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading events.. Please wait.");
        },
        success: function (response) {
            // console.log(response)
            callback(response);

        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load the events, the server is not reachable.";
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

var setEventRegistration = function (register, eventId, callback) {
    $.ajax({
        url: lmsServer + "/Content/UserEventsRegistration?eventId=" + eventId + "&register=" + register + "&token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {

        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to set user event registration, the server is not reachable.";
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

var LoadEvents = function () {
    getEvents(function (events) {
        $.each(events, function (index, event) {
            var eventCard = $("<div class='event-card'></div>");
            var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Events/" + event.id + ".jpg");
            eventCard.append("<img src='" + image + "' alt='" + event.name + "' />");
            var eventInfo = $("<div class='event-info'></div>");
            var details = $("<p class='event-agenda'>" + event.details + "</p>");
            enableSpeech(details);
            eventInfo.append("<h3 class='event-title'>" + event.name + "</h3>");
            eventInfo.append(details);
            eventInfo.append("<div class='event-date-cont'><p class='event-datetime'><ion-icon name='calendar-number'></ion-icon> " + event.date + " </p><p class='event-time'><ion-icon name='stopwatch'></ion-icon> " + event.timeSpan + "</p>" + "<p class='event-location'><ion-icon name='pin'></ion-icon> " + event.location + "</p>");
            // eventInfo.append("<p class='event-location'>📍 " + event.location + "</p>");
            var actions = $("<div class='event-actions'></div>");
            var register = $("<button class='btn register'>Register</button>");
            var unregister = $("<button class='btn unregister'>Unregister</button>");
            actions.append(register);
            actions.append(unregister);
            register.hide();
            unregister.hide();
            register.click(function () {
                $(this).prop('disabled', true).html("Registering..");
                setEventRegistration("1", event.id, function () {
                    register.prop('disabled', false).html("Register");
                    register.hide();
                    unregister.show();
                });
            });
            unregister.click(function () {
                $(this).prop('disabled', true).html("Unregistering..");
                setEventRegistration("0", event.id, function () {
                    unregister.prop('disabled', false).html("Unregister");
                    unregister.hide();
                    register.show();
                });
            });
            if (event.allowRegistration && !event.isRegistered) {
                register.show();
            }
            if (!event.allowRegistration && event.isRegistered) {
                unregister.show();
            }
            eventInfo.append(actions);
            eventCard.append(eventInfo);

            $('.event-list').append(eventCard);
        });
        let eventCard = document.querySelectorAll('.event-card');
        let observe = new IntersectionObserver(entity => {
            entity.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show')
                }
            })
        })
        eventCard.forEach(card => observe.observe(card));
    });
}