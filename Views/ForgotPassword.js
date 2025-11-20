function init(server) {
    lmsServer = server;
    loadPage();
}

var getHint = function (username, email, mode, callback) {
    $.ajax({
        url: lmsServer + "/Content/PasswordHint?username=" + username + "&mode=" + mode + "&email=" + encodeURIComponent(email),
        type: "GET",
        beforeSend: function () {
            showLoading("Working.. Please wait.");
        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "The server is not reachable.";
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

var loadPage = function () {
    $(".forgot-form").submit(function (e) {
        var option = $('input[name="option"]:checked').val();
        var username = $('.username').val();
        var email = $('.email').val();

        getHint(username, email, option, function (response) {
            var title = "";
            if (option == "mail") {
                title = "Recovery email";
            } else {
                title = "Password hint";
            }
            showOkayAlert(title, response.message, function (button, dialog) {
                dialog.remove();
                location.href = "Login.html";
            });
        });
        return false;
    });
}