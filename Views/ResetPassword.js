
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("PasswordHint", function (hint) {
        $('#hint-password').val(hint);
        $(".reset-form").submit(function (e) {
            e.preventDefault();
            var newPass = $('#new-password').val();
            var confirmPass = $('#confirm-password').val();
            var oldPass = $('#old-password').val();
            if (newPass != confirmPass) {
                $('.submitButton').prop('disabled', true);
                highlight($('#new-password'));
                highlight($('#confirm-password'));
                tempTextChange($('#resetMessage'), 'Passwords do not match, try again', function (e) { $('.submitButton').prop('disabled', false); });
                return;
            }
            if (oldPass == newPass) {
                $('.submitButton').prop('disabled', true);
                highlight($('#new-password'));
                highlight($('#old-password'));
                tempTextChange($('#resetMessage'), 'The new and old passwords are same, try again', function (e) { $('.submitButton').prop('disabled', false); });
                return;
            }
            var hint = $('#hint-password').val();
            if (hint != "") {
                showYesNoAlert("Password hint", "Set a password hint that helps you remember your password without giving it away to others. Avoid using the actual password or sensitive information. Proceed to reset password?", function () {
                    resetPassword(oldPass, newPass, hint);
                }, function (button, element) {
                    element.remove();
                });
            } else {
                resetPassword(oldPass, newPass, hint);
            }
        });
    });
}

var resetPassword = function (oldPassword, newPassword, hint) {
    $.ajax({
        url: lmsServer + "/Content/PasswordReset",
        type: "POST",
        data: JSON.stringify({
            "oldPassword": oldPassword,
            "newPassword": newPassword,
            "token": token,
            "hint":hint
        }),
        beforeSend: function () {
            showLoading("Resetting password.. Please wait.");
        },
        success: function (response) {
            hideLoading();
            showOkayAlert("Success", "Your changes are saved successfully. Click 'Okay' to login.", function (button, element) {
                element.remove();
                location.href = "Login.html";
            });
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to reset password, the server is not reachable.";
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