
const sidebar = document.getElementById('sidebar');
const hamburger = document.getElementById('hamburger');
const overlay = document.getElementById('overlay');
const notifications = document.getElementById('notifications');
const notifDropdown = document.getElementById('notificationsDropdown');

function toggleSidebar() {
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    } else {
        if (sidebar.classList.contains('collapsed')) {
            sidebar.classList.remove('collapsed');
            hamburger.textContent = '✕';
            hamburger.classList.add('close');
        } else {
            sidebar.classList.add('collapsed');
            hamburger.textContent = '☰';
            hamburger.classList.remove('close');
        }
    }
}

function openSidebar() {
    sidebar.classList.add('active');
    overlay.classList.add('active');
    hamburger.textContent = '✕';
    hamburger.classList.add('close');
}

function closeSidebar() {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.textContent = '☰';
    hamburger.classList.remove('close');
}

function toggleNotificationsDropdown(event) {
    event.stopPropagation();
    notifDropdown.classList.toggle('active');
}

// Close notifications dropdown if clicking outside
document.addEventListener('click', () => {
    notifDropdown.classList.remove('active');
});

// Prevent sidebar scroll on mobile
sidebar.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 768) {
        e.preventDefault();
    }
}, { passive: false });

// Handle resizing
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        overlay.classList.remove('active');
        sidebar.classList.remove('active');
        sidebar.classList.remove('collapsed');
        hamburger.textContent = '✕';
        hamburger.classList.add('close');
    } else {
        sidebar.classList.remove('collapsed');
        closeSidebar();
    }
});

// Initialize correct state on load
window.addEventListener('load', () => {
    if (window.innerWidth > 768) {
        sidebar.classList.remove('collapsed');
        hamburger.textContent = '✕';
        hamburger.classList.add('close');
    } else {
        sidebar.classList.remove('collapsed');
        closeSidebar();
    }
});


var getNotifications = function () {
    getToken(function (userToken) {
        if (userToken != null && userToken != "" && userToken != undefined) {
            $.ajax({
                url: lmsServer + "/Content/Notifications?token=" + encodeURIComponent(userToken),
                type: "GET",
                beforeSend: function () {

                },
                error: function () {

                },
                complete: function (response) {

                },
                success: function (response) {
                    getData("notifications", function (notifications) {
                        var count = JSON.parse(notifications).length;
                        setData("notifications", JSON.stringify(response), function () {
                            loadUnreadNotifications(response);
                            if (response.length > count) {
                                notify(function () { });
                            }
                        });
                    });
                }
            });
        }
    });
};

setInterval(getNotifications, 10000);