
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    loadCertificates();
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var getCertificates = function (callback) {
    $.ajax({
        url: lmsServer + "/Website/GetCertificates?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading certificates.. Please wait.");
        },
        success: function (response) {
            callback(response);
            console.log(response)
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load certificates, the server is not reachable.";
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


var loadCertificates = function () {
    getCertificates(function (certificates) {
        certificates = [
            {
                certificateId: "2QB8EC7IHD",
                completionDate: "September 09, 2025",
                courseName: "HTML Course",
                details: "An intermediate-level PCB design certification builds on foundational skills for those with some schematic and layout experience, validating the ability to design multilayer boards with moderate density and mixed-signal integration. Candidates gain proficiency in tools like Altium Designer, OrCAD, or Mentor Graphics while learning advanced routing, DFM, and signal integrity basics such as impedance matching. The certification also covers documentation, assembly drawings, fabrication notes, library management, thermal design, ground planes, vias, and noise control. Typical projects include four-layer IoT or power management boards following IPC guidelines, making this level ideal for final-year students, engineers, and professionals seeking stronger PCB skills for industry use.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Competent",
                registrationDate: "September 03, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "B6PKMND9YL",
                completionDate: "September 03, 2025",
                courseName: "HTML Course",
                details: "A novice-level PCB design certification is for beginners in electronics, focusing on core concepts and hands-on practice. Candidates learn basic circuit theory, schematics, footprints, and simple single- or double-sided layouts using entry-level tools like KiCad, EasyEDA, or beginner versions of Altium and OrCAD. Training covers design rules, basic routing, and generating outputs such as Gerber files and BOMs. Ideal for students, enthusiasts, or career changers, it requires no prior experience and builds confidence through projects like a small microcontroller board or LED driver circuit.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Novice",
                registrationDate: "September 01, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "M9TXP2L7WR",
                completionDate: "September 15, 2025",
                courseName: "CSS Styling Essentials",
                details: "This course introduces modern web styling using CSS3, including selectors, flexbox, grid, transitions, and responsive layouts. Participants learn to build clean, adaptive UIs optimized for mobile and desktop, emphasizing maintainable code structures and performance.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Novice",
                registrationDate: "September 10, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "K2FG8VN5SD",
                completionDate: "September 20, 2025",
                courseName: "JavaScript Fundamentals",
                details: "Covers core JS concepts including DOM manipulation, ES6 syntax, and event handling. Students gain practical experience developing interactive web pages and dynamic content for modern browsers.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Novice",
                registrationDate: "September 16, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "A5N4CW7QTY",
                completionDate: "September 25, 2025",
                courseName: "React Frontend Basics",
                details: "A foundation course in React, focusing on components, state management, props, and lifecycle methods. Learners create small apps to understand data flow and JSX fundamentals.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Competent",
                registrationDate: "September 18, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "X7PE4L3BVS",
                completionDate: "October 01, 2025",
                courseName: "Node.js Essentials",
                details: "Learn server-side JavaScript using Node.js — covering asynchronous programming, Express.js, API creation, and database connectivity with MongoDB.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Expert",
                registrationDate: "September 27, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "Z8UM4KR2QF",
                completionDate: "October 05, 2025",
                courseName: "Python for Automation",
                details: "Introduces Python scripting for automating tasks, file handling, and API integration. Learners develop small automation tools using standard libraries and third-party modules.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Novice",
                registrationDate: "September 29, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "H3DL7SX9JT",
                completionDate: "October 10, 2025",
                courseName: "PCB Library Management",
                details: "Focuses on creating and managing schematic symbols, footprints, and 3D models in professional EDA tools following IPC standards. Ideal for design engineers and librarians.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Competent",
                registrationDate: "October 05, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "J4FR9YP1LN",
                completionDate: "October 15, 2025",
                courseName: "Advanced PCB Thermal Design",
                details: "Teaches advanced thermal management, copper balancing, and simulation techniques for high-current boards. Students explore heat sink integration and thermal vias.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Expert",
                registrationDate: "October 09, 2025",
                userFullName: "Test 1 User"
            },
            {
                certificateId: "L6VK5BQ3MW",
                completionDate: "October 20, 2025",
                courseName: "Full Stack Development Intro",
                details: "Combines frontend and backend skills using HTML, CSS, JS, Node.js, and database integration. Participants build and deploy simple full-stack web apps.",
                dob: "December 13, 2000",
                email: "gokul.k@gighz.net",
                file: "/Content/File?name=Certificates/B6PKMND9YL.png",
                level: "Competent",
                registrationDate: "October 13, 2025",
                userFullName: "Test 1 User"
            }
        ];

        $.each(certificates, function (index, certificate) {
            var eventCard = $("<div class='event-card'></div>");
            var image = lmsServer + certificate.file;
            var certImage = $("<img class='certImage' src='" + image + "' alt='" + certificate.certificateId + "' />");
            eventCard.append(certImage);
            var eventInfo = $("<div class='event-info'></div>");
            eventInfo.append("<p class='event-datetime'><ion-icon name='rocket'></ion-icon> " + certificate.level + "  <ion-icon name='hourglass'></ion-icon> " + certificate.completionDate + "</p>");
            eventInfo.append("<h3 class='event-title'>" + certificate.courseName + "</h3>");
            var details = $("<p class='event-agenda'>" + certificate.details.substring(0, 100) + "..." + "</p>");
            enableSpeech(details);
            eventInfo.append(details);
            eventCard.append(eventInfo);
            $('.event-list').append(eventCard);
            certImage.click(function () {
                var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                window.open(lmsServer + "/Website/Certificate?id=" + certificate.certificateId, "_blank", strWindowFeatures);
            });
        });
        let certanimation = document.querySelectorAll('.event-card');

        let observe = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                }
            });
        });

        document.getElementById("certificateSearch").addEventListener("keyup", function () {
            let filter = this.value.toLowerCase();
            let cards = document.querySelectorAll(".event-card");

            cards.forEach(card => {
                let text = card.innerText.toLowerCase();
                card.style.display = text.includes(filter) ? "grid" : "none";
            });
        });

        certanimation.forEach(card => observe.observe(card));
    });


}