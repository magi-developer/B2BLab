
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications);
    getData("courses", loadCourses);
    LoadOtherCourses();
}

var LoadOtherCourses = function () {
    $.ajax({
        url: lmsServer + "/Content/OtherCourses?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading recommendations.. Please wait.");
        },
        success: function (response) {
            addCourses(response);
            // console.log(response);

            let cards = document.querySelectorAll('.card');

            let observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('show');
                    }
                });
            });

            cards.forEach(card => observer.observe(card));

        },
        error: function (e) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load courses, the server is not reachable.";
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

var addCourses = function (coursejson) {
    // console.log("addCourses called");
    $('.explore-course').empty(); // clear old cards first

    if (coursejson.length > 3) {
        coursejson = coursejson.slice(0, 3);
    }
    // Step 1: create an empty string
    let allCardsHTML = "";

    // Step 2: loop through each course and add to string
    $.each(coursejson, function (index, course) {
        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses\\" + course.id + ".jpg");

        allCardsHTML += `
            <div class='card image-card'>
            <img src='${image}' alt='${course.name}'>
            <h3>${course.name}</h3>
                <p>${course.shortDescription}</p>
                
            </div>
        `;
        // <button class='btnDashboardType1 btnExploreCourses'>Explore</button>
    });

    // Step 3: append all at once
    $('.explore-course').append(allCardsHTML);

    // Step 4: re-enable features after appending
    enableSpeech($('.explore-course p'));

    $('.btnExploreCourses').click(function () {
        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
        window.open(lmsServer + "/courses.html", "_blank", strWindowFeatures);
    });
}


var loadCourses = function (coursesJson) {
    // const courses = [
    //     {
    //         id: 1,
    //         name: 'Test Course 1',
    //         description: 'Short description on Test Course 1 Short description on Test Course 1 Short description on Test Course 1 Short description on Test Course 1 Short description on Test Course 1 Short description on Test Course 1',
    //         amountDue: 10000,
    //         remainingCourseDays: 24,
    //         assignments: 0,
    //         courseProgress: 0,
    //         daysProgress: 20,
    //         gracePeriodType: 0,
    //         level: 1,
    //         levelDays: 30,
    //         levelGracePeriod: 30,
    //         paidGracePeriod: 0,
    //         pendingAssessmentsInLevel: 1,
    //         points: 0,
    //         questionnaires: 0
    //     },
    //     {
    //         id: 2,
    //         name: 'Test Course 2',
    //         description: 'Short description on Test Course 2',
    //         amountDue: 12000,
    //         remainingCourseDays: 18,
    //         assignments: 2,
    //         courseProgress: 10,
    //         daysProgress: 25,
    //         gracePeriodType: 1,
    //         level: 2,
    //         levelDays: 40,
    //         levelGracePeriod: 20,
    //         paidGracePeriod: 5,
    //         pendingAssessmentsInLevel: 2,
    //         points: 100,
    //         questionnaires: 1
    //     },
    //     {
    //         id: 3,
    //         name: 'Test Course 3',
    //         description: 'Short description on Test Course 3',
    //         amountDue: 8000,
    //         remainingCourseDays: 15,
    //         assignments: 1,
    //         courseProgress: 30,
    //         daysProgress: 35,
    //         gracePeriodType: 0,
    //         level: 1,
    //         levelDays: 25,
    //         levelGracePeriod: 15,
    //         paidGracePeriod: 0,
    //         pendingAssessmentsInLevel: 0,
    //         points: 150,
    //         questionnaires: 0
    //     },
    //     {
    //         id: 4,
    //         name: 'Test Course 4',
    //         description: 'Short description on Test Course 4',
    //         amountDue: 15000,
    //         remainingCourseDays: 20,
    //         assignments: 3,
    //         courseProgress: 40,
    //         daysProgress: 50,
    //         gracePeriodType: 1,
    //         level: 3,
    //         levelDays: 45,
    //         levelGracePeriod: 10,
    //         paidGracePeriod: 10,
    //         pendingAssessmentsInLevel: 1,
    //         points: 200,
    //         questionnaires: 1
    //     },
    //     {
    //         id: 5,
    //         name: 'Test Course 5',
    //         description: 'Short description on Test Course 5',
    //         amountDue: 5000,
    //         remainingCourseDays: 28,
    //         assignments: 0,
    //         courseProgress: 5,
    //         daysProgress: 10,
    //         gracePeriodType: 0,
    //         level: 1,
    //         levelDays: 30,
    //         levelGracePeriod: 30,
    //         paidGracePeriod: 0,
    //         pendingAssessmentsInLevel: 1,
    //         points: 50,
    //         questionnaires: 0
    //     },
    // ];

    var courses = JSON.parse(coursesJson);
    console.log(courses)
    // var courses = coursesJson;
    $.each(courses, function (index, course) {
        // console.log(course);
        var stars = undefined;
        if (course.level == 0 || course.level == 3 || course.level > 3) {
            stars = "<span style='color: #FFBF00;'>★★★</span>";
        }
        if (course.level == 1) {
            stars = "<span style='color:#FFBF00;'>★</span>★★";
        }
        if (course.level == 2) {
            stars = "<span style='color:#FFBF00;'>★★</span>★";
        }
        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses\\" + course.id + ".jpg");

        const shortDescription = course.description.length > 100
            ? course.description.slice(0, 100) + "..."
            : course.description;

        var card = $("<div class='card image-card'><div class='image-card-header'><h3>" + course.name + "</h3><div class='image-card-header-stars'>" + stars + "</div></div><img src='" + image + "' alt='" +
            course.name + "'><p>" + shortDescription + "</p>");
        enableSpeech(card.find('p'));
        var courseProgress = "<div class='progress-group'><div class='progress-label'>Course Progress</div><div class='progress-bar'><div class='progress-fill' style='width: " + course.courseProgress + "%;'></div></div></div>";
        var daysProgress = "";
        if (course.gracePeriodType == 0) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Remaining Course Days: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill' style='width: " + course.daysProgress + "%;'></div></div></div>";
        } else if (course.gracePeriodType == 1) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Grace Period: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill-grace' style='width: " + course.daysProgress + "%;'></div></div></div>";
        } else if (course.gracePeriodType == 2) {
            daysProgress = "<div class='progress-group'><div class='progress-label'>Paid Grace Period: " + course.remainingCourseDays + "/" + course.levelDays + "</div><div class='progress-bar'><div class='progress-fill-paid-grace' style='width: " + course.daysProgress + "%;'></div></div></div>";
        }


        card.append(`<div class='course-progress-container'>
                ${courseProgress}
                ${daysProgress}
            </div>`);
        // card.append(courseProgress);
        // card.append(daysProgress);
        var button1 = `<button class='btnDashboardType1 course-enter-btn' data-id='${course.id}'>Enter</button>`;
        let button2 = ''
        if (course.gracePeriodType == 1) {
            button2 = "&nbsp; <button class='btnDashboardType1'>Get Grace Period</button>";
        }
        $(document).on('click', '.course-enter-btn', function () {
            let id = $(this).data('id');
            location.href = "Course.html?id=" + id;
        });
        card.append(`<div class="course-btn-container">${button1} ${button2}</div>`);
        // card.append(button1);
        // card.append(button2);
        $('.cards').append(card);
    });

    document.getElementById("courseSearch").addEventListener("keyup", function () {
        let filter = this.value.toLowerCase();
        let cards = document.querySelectorAll(".card");

        cards.forEach(card => {
            let text = card.innerText.toLowerCase();
            card.style.display = text.includes(filter) ? "grid" : "none";
        });
    });

}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}