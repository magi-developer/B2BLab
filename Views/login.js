var tempResponse;

function init(server) {
    lmsServer = server;
    loadPage();
}

var loginCallback = function () {
    if (tempResponse.passwordReset) {
        location.href = "ResetPassword.html";
    } else {
        location.href = "Dashboard.html";
    }
}

var login = function (username, password) {
    $.ajax({
        url: lmsServer + "/Content/Login",
        type: "POST",
        data: JSON.stringify({
            "username": username,
            "password": password
        }),
        beforeSend: function () {
            showLoading("Logging in.. Please wait.");
        },
        success: function (response) {
            tempResponse = response;
            token = response.token;
            showLoading("Checking system.. Please wait.");
            verifyService(token, function (result) {
                hideLoading();
                if (result) {
                    setData("PasswordHint", response.passwordHint == null ? "" : response.passwordHint, function () {
                        setToken(token, loginCallback);
                    });
                } else {
                    showError("System check failed, please contact GigHz.");
                }
            });
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to login, the server is not reachable.";
                showError(e);
            } else {
                showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to try again.");
            }
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
            
        }
    });
}

var loadPage = function () {
    testConnection(function (success) {
        if (success) {
            checkForUpdates(function (updateAvailable) {
                $(".login-form").submit(function (e) {
                    e.preventDefault();
                    if ($('#username').val() != "" && $('#password').val() != "") {
                        login($('#username').val(), $('#password').val());
                    }
                });
            });
        }
    });
}


var testConnection = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/Test",
        type: "GET",
        beforeSend: function () {
            showLoading("Testing connection.. Please wait.");
        },
        success: function (response) {
            if (response.api != undefined) {
                callback(true);
            }
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Connection failed, the server is not reachable.";
                showError(e);
            } else {
                showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to try again.");
            }
        },
        dataType: "JSON",
        contentType: "application/json; charset=utf-8",
        complete: function (response) {
            hideLoading();
        }
    });
}