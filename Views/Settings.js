var profile = null;
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    loadUserAccountDetails(createUI);
}

var fileSelectionCallback = function (response) {
    if (response != "") {
        $('.avatar-img').attr('src', "data:image/jpg;base64," + response);
        profile.image = response;
    }
}

var loadUserAccountDetails = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/UserProfile?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading your account details.. Please wait.");
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load account details, the server is not reachable.";
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

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var setProfilePic = function (imageData) {
    $('.avatar-img').attr('src', "data:image/jpg;base64," + imageData);
}

var setDefaultprofilePic = function () {
    var gender = profile.isMale ? "1" : "0";
    getProfilePic(gender, function (data) {
        setProfilePic(data);
    });
}



var createUI = function (response) {
    console.log('UI Creating');

    profile = response;
    $('.change-avatar-btn').click(function () {
        selectProfilePic('fileSelectionCallback');
    });
    $('.remove-avatar-btn').click(function () {
        profile.image = "";
        setDefaultprofilePic();
    });
    if (profile.image != "" && profile.image != null) {
        setProfilePic(profile.image);
    } else {
        profile.image = "";
        setDefaultprofilePic();
    }

    $('.settings-form').submit(function () {
        $(".canBeChanged").each(function (index, element) {
            var id = $(this).attr("id");
            profile[id] = $(this).val();
        });
        $.ajax({
            url: lmsServer + "/Content/UpdateUserProfile?token=" + encodeURIComponent(token),
            type: "POST",
            data: JSON.stringify(profile),
            beforeSend: function () {
                showLoading("Updating profile.. Please wait.");
            },
            success: function (response) {

            },
            error: function (xhr, status, error) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    console.log('error in if')
                    e = "Unable to update the profile, the server is not reachable.";
                    showError(e);
                } else {
                    console.log('error in else')
                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to try again.");
                }
            },
            dataType: "JSON",
            contentType: "application/json; charset=utf-8",
            complete: function (response) {
                hideLoading();
            }
        });
        return false;
    });

    $('.settings-form').find('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="number"]').each(function (index, element) {
        var id = $(this).attr("id");
        $(this).val(profile[id]);
    });
    $('#isMale').prop("checked", profile.isMale);
    $('#isFemale').prop("checked", !profile.isMale);
    $('#emailVerified').prop("checked", profile.emailVerified);
    $('#isStudent').prop("checked", profile.isStudent);
    $('#isWorking').prop("checked", profile.isWorking);
    $('#isJobSeeker').prop("checked", profile.isJobSeeker);
    $('.referral-code').html(profile.referralCode);
    var tableDiv = $(".themed-table-container");
    $.each(profile.courses, function (index, course) {
        var tbody = tableDiv.find('tbody');

        var tr1 = $("<tr><td rowspan='3' class='settings-course-name'>" + course.name + "</td><td>" + getUserLevel(1) +
            "</td><td>" + (course.level1RegistrationDate == null ? "" : course.level1RegistrationDate) + "</td><td>" + (course.level1Offer == null ? "" : course.level1Offer) + "</td><td>Rs. " + (course.userLevel == 1 ? course.balanceAmount : 0) +
            "</td><td>" + course.level1CoursePeriod + " Days</td></tr>");
        tbody.append(tr1);
        var tr2 = $("<tr><td>" + getUserLevel(2) + "</td><td>" + (course.level2RegistrationDate == null ? "" : course.level2RegistrationDate) + "</td><td>" + (course.level2Offer == null ? "" : course.level2Offer) +
            "</td><td>Rs. " + (course.userLevel == 2 ? course.balanceAmount : 0) + "</td><td>" + course.level2CoursePeriod + " Days</td></tr>");
        tbody.append(tr2);
        var tr3 = $("<tr><td>" + getUserLevel(3) + "</td><td>" + (course.level3RegistrationDate == null ? "" : course.level3RegistrationDate) + "</td><td>" + (course.level3Offer == null ? "" : course.level3Offer) +
            "</td><td>Rs. " + (course.userLevel == 3 ? course.balanceAmount : 0) + "</td><td>" + course.level3CoursePeriod + " Days</td></tr>");
        tbody.append(tr3);

        if (course.balanceAmount > 0) {
            var payDue = $("<tr><td colspan='6'><a href='#' class='themed-link' style='margin-top:5px;'>Clear due amount for the course '" + course.name + "'</a></td></tr>");
            tbody.append(payDue);
            payDue.addClass('courseEnd');
        } else {
            tr3.addClass('courseEnd');
            tr1.find('.settings-course-name').addClass('courseEnd');
        }
    });

    $('.settings-form').find(".PasswordResetOptions").before(tableDiv);

    $(document).ready(function () {
        $('.settingFormTab').click(function (e) {
            e.preventDefault();
            console.log('Box');

            // Remove active class from all links
            $('.settingFormTab').removeClass('active');

            // Add active class to clicked one
            $(this).addClass('active');

            // Hide all boxes
            $('.setting-form-box').hide();

            // Show targeted box
            let target = $(this).data('target');
            $('#' + target).fadeIn(300); // ✅ Add # before ID
        });

        // Optional: Show first box by default
        $('.settingFormTab:first').click();
    });

    $('.cancel-btn').click(function () {
        window.history.back();
    });
}