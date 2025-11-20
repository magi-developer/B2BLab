
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    // $('.welcomeMsg').html(getMessage());

    $('#messageInput').keypress(function (e) {
        var key = e.which;
        if (key == 13) {
            if ($('#sendBtn').is(":disabled")) {
                $(this).prop('disabled', true);
                highlight($(this), function () { $('#messageInput').prop('disabled', false); });
            } else {
                $('#sendBtn').trigger('click');
            }
            return false;
        }
        
    }); 

    $('#messageInput').keyup(function () {
        $('.charCount').html($(this).val().length + "/200");
    });

    $('#sendBtn').click(function () {

        if ($('#messageInput').val().trim() == "") {
            return false;
        }
        $('.chat-messages').show();
        // $('.aiDiv').css('box-shadow', '0 0 20px gray');
        var query = $("#messageInput").val();
        $("#messageInput").val("");
        $('.charCount').html("0/200");
        $('.chat-messages').append("<div class='message user'>" + query + "</div>");
        $(this).prop('disabled', true);

        var responseMessage = $("<div class='message bot bot-typing'><span></span><span></span><span></span></div>");
        $('.chat-messages').append(responseMessage);
        $(".chat-messages").stop().animate({
            scrollTop: $(".chat-messages")[0].scrollHeight
        }, 500);
        askAssistant(query, function (message) {
            responseMessage.removeClass("bot-typing");
            responseMessage.html(message.response);
            enableSpeech(responseMessage);
            $('#chat-footer').find('.modelName').html("Model: &nbsp;<strong> " + message.model + "</strong>");
            $('#sendBtn').prop('disabled', false);
            $(".chat-messages").stop().animate({
                scrollTop: $(".chat-messages")[0].scrollHeight
            }, 500);
        });
    });
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var getMessage = function () {
    var currentTime = new Date();
    var currentHour = currentTime.getHours();
    var message = "";

    if (currentHour >= 5 && currentHour < 12) {
        message = "Good morning";
    } else if (currentHour >= 12 && currentHour < 17) {
        message = "Good afternoon";
    } else if (currentHour >= 17 && currentHour < 22) {
        message = "Good evening";
    } else {
        message = "Good night";
    }
    var username = sessionStorage.getItem("username");

    var emojis = ["🥂", "✨", "🙏", "💫", "🕺", "💃", "💪", "🔥", "😊", "😃", "😎", "🤗","😇"];
    var randomemoji = emojis[Math.floor(Math.random() * emojis.length)];

    return "Hi " + username + ", " + message + " " + randomemoji;
}
