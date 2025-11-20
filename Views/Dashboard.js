
var notificationList = [];

function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var loadPage = function (userToken) {
    token = userToken;
    loadResources();
    loadDashboard();
    loadevents();
    $('.systemUpdate').click(function () {
        checkForUpdates(function (updateAvailable) {
            if (!updateAvailable) {
                showOkayAlert("No updates available", "Great! The system is up to date.", function (button, element) {
                    element.remove();
                });
            }
        });
    });
}

var loadResources = function () {
    $('.levelsImage').attr('src', lmsServer + '/Content/File?name=page/levels.png');
    $('.allCoursesCardImage').attr('src', lmsServer + '/Content/File?name=Courses/all.jpg');
    $('.videoImage').html("<source src='" + lmsServer + "/Content/File?name=Others/learning.mp4' type='video/mp4'>");
}

var loadNotifications = function () {
    loadUnreadNotifications(notificationList);
}

var loadDashboard = function () {
    $.ajax({
        url: lmsServer + "/Content/UserDashboard?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading your dashboard.. Please wait.");
        },
        success: function (response) {
            console.log(response);
            getUserCompletion(function (completion, apiError) {
                if (apiError == null || completion != null) {
                    var points = 0;
                    var questionnaires = 0;
                    var assignments = 0;
                    var courses = [];
                    var loopcourses = [];

                    // STEP 1: Collect all course details
                    $.each(response.courseDetails, function (index, details) {
                        var course = details.item1;
                        courses.push(course);
                    });

                    // STEP 2: Duplicate logic — always make total 3 cards
                    if (courses.length === 1) {
                        loopcourses = [courses[0], courses[0], courses[0]]; // repeat same course 3 times
                    } else if (courses.length === 2) {
                        loopcourses = [courses[0], courses[1], courses[0]]; // repeat first course
                    } else {
                        loopcourses = courses.slice(0, 3); // if 3 or more, take first 3
                    }
                    // STEP 3: Render courses
                    $.each(loopcourses, function (index, course) {
                        var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Courses/" + course.id + ".jpg");
                        var card = $("<div class='card image-card course-card'><img src='" + image + "' alt='" +
                            course.name + "'><h3>" + course.name + "</h3><p>" + course.description + "</p></div>"); //<button class='btnDashboardType1'>Enter</button>

                        card.find('.btnDashboardType1').click(function () {
                            location.href = "Course.html?id=" + course.id;
                        });

                        // enableSpeech(card.find('p'));
                        $('.course-container .course_cards').append(card);

                        const cards = document.querySelectorAll('.course-card');
                        const eventcards = document.querySelectorAll('.dashboard-events');

                        // if (cards.length > 0) {
                        let observer = new IntersectionObserver(entries => {
                            entries.forEach(entry => {
                                if (entry.isIntersecting) {
                                    entry.target.classList.add('show');
                                }
                            });
                        });

                        cards.forEach(card => observer.observe(card));
                        eventcards.forEach(eventcard => observer.observe(eventcard));
                        // }

                        points = points + course.points;
                        questionnaires = questionnaires + course.questionnaires;
                        assignments = assignments + course.assignments;
                    })
                    $.each(courses, function (index, course) {
                        // Level logic
                        setData("UserLevel-" + course.id, course.level, function () {
                            var courseStat = $("<div class='courseStat'></div>");
                            var innerDiv = $("<div></div>");
                            var stars = undefined;

                            if (course.level == 0 || course.level == 3) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★★★</span></div>");
                            }
                            if (course.level == 1) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★</span>★★</div>");
                            }
                            if (course.level == 2) {
                                stars = $("<div class='statLevels'><span style='color:gold;'>★★</span>★</div>");
                            }

                            innerDiv.append(stars);
                            var statCourseName = $("<div class='statCourseName'>" + course.name + "</div>");
                            innerDiv.append(statCourseName);
                            courseStat.append(innerDiv);

                            var levelDesc = $("<div class='statLevelDesc'><span>" + getUserLevel(course.level) + "</span></div>");
                            courseStat.append(levelDesc);

                            var courseStatWrapper = $("<div></div>");
                            courseStatWrapper.append(courseStat);

                            var totalAssessments = course.assignments + course.pendingAssessmentsInLevel;

                            if (totalAssessments == 0) {
                                courseStatWrapper.append("<div class='courseStatPending'>Error! No assessments found</div>");
                            } else {
                                if (course.pendingAssessmentsInLevel == totalAssessments) {
                                    courseStatWrapper.append("<div class='courseStatPending'>Complete " + course.pendingAssessmentsInLevel + " assessments to level up</div>");
                                } else {
                                    if (course.pendingAssessmentsInLevel == 0) {
                                        if (course.amountDue > 0) {
                                            courseStatWrapper.append("<div class='courseStatPending'>Click <a href='Settings.html'>here</a> to clear due amout</div>");
                                        } else {
                                            if (course.level == 3) {
                                                courseStatWrapper.append("<div class='courseStatPending'><a href='#' class='aCompletion' courseId='" + course.id + "'>Complete Course</a></div>");
                                            } else {
                                                courseStatWrapper.append("<div class='courseStatPending'>Click <a href='#' class='aCompletion' courseId='" + course.id + "'>here</a> to level up</div>");
                                            }
                                        }
                                    } else {
                                        courseStatWrapper.append("<div class='courseStatPending'>Complete " + course.pendingAssessmentsInLevel + " more assessments to level up</div>");
                                    }

                                    // Course completion link
                                    courseStatWrapper.find('.aCompletion').click(function () {
                                        var courseId = $(this).attr('courseId');
                                        $.ajax({
                                            url: lmsServer + "/Content/CourseCompletion?courseId=" + courseId + "&token=" + encodeURIComponent(token),
                                            type: "GET",
                                            beforeSend: function () {
                                                showLoading("Working on it.. Please wait.");
                                            },
                                            dataType: "JSON",
                                            contentType: "application/json; charset=utf-8",
                                            success: function (response) {
                                                if (!response.isSuccess) {
                                                    showOkayAlert("Error", response.message, function (button, element) {
                                                        element.remove();
                                                    });
                                                }
                                            },
                                            complete: function () {
                                                hideLoading();
                                            },
                                            error: function (xhr, status, error) {
                                                var e = eval("(" + xhr.responseText + ")");
                                                if (e == undefined) {
                                                    e = "Unable to load dashboard, the server is not reachable.";
                                                    showError(e);
                                                } else {
                                                    showError("Error: " + e.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.");
                                                }
                                            }
                                        });
                                        return false;
                                    });
                                }
                            }

                            $('.userStats').append(courseStatWrapper);
                        });
                    });

                    // Update stats
                    $('.statPoints').html(points);
                    $('.statQuestionnaires').html(questionnaires);
                    $('.statAssignments').html(assignments);
                    $('.welcomeMessage').html("Welcome back <span class='dash_username'>" + response.username + "</span>");
                    sessionStorage.setItem("username", response.username);

                    // Button actions
                    $('.btnLevelInfo').click(function () {
                        var msg = "<div style='display:flex;justify-content: space-around;'><div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★</span><span style='color:#d63384;font-size:2rem;'>★★</span><br/>" + getUserLevel(1) + "</div>";
                        msg += "<div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★★</span><span style='color:#d63384;font-size:2rem;'>★</span><br/>" + getUserLevel(2) + "</div>";
                        msg += "<div style='padding: 25px;'><span style='color:gold;font-size:2rem;'>★★★</span><br/>" + getUserLevel(3) + "</div></div>";
                        showOkayAlert("User Levels", msg, function (button, dialog) {
                            dialog.remove();
                        });
                    });

                    $('.btnExploreCourses').click(function () {
                        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                        window.open("courses.html", "_self", strWindowFeatures);
                    });
                    $('.btnExploreJobs').click(function () {
                        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                        window.open("JobPortal.html", "_self", strWindowFeatures);
                    });

                    $('.btnAboutus').click(function () {
                        var strWindowFeatures = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
                        window.open(lmsServer + "/index.html#why-us", "_blank", strWindowFeatures);
                    });

                    // Event card (optional)
                    if (response.event != null) {
                        var eventImage = lmsServer + "/Content/File?name=" + encodeURIComponent("Events/" + response.event.id + ".jpg");
                        var eventCard = $("<div class='card image-card' aria-label='Upcoming Event'><h3 class='event-title'>Upcoming Event</h3><img src='" + eventImage + "' alt='" + response.event.name +
                            "' class='event-img-top'><div class='event-body'><h3 class='event-title'>" + response.event.name +
                            "</h3><table class='event-table'><tbody><tr><th>Date:</th><td>" + response.event.date +
                            "</td></tr><tr><th>Time:</th><td>" + response.event.timeSpan + "</td></tr><tr><th>Location:</th><td>" + response.event.location +
                            "</td></tr><tr><th>Details:</th><td class='ttsEnabled'>" + response.event.details + "</td></tr></tbody></table><button class='event-button'>Go to Events</button></div></div>");

                        if (response.event.isRegistered) {
                            eventCard.find('.event-button').prop('disabled', true).html("Registered").addClass('disabled-event-button');
                        } else {
                            eventCard.find('.event-button').click(function () {
                                location.href = "Events.html";
                            });
                        }

                        enableSpeech(eventCard.find('.ttsEnabled'));
                        // $('.cards').append(eventCard);
                    }

                    notificationList = response.notifications;
                    setData("notifications", JSON.stringify(response.notifications), loadNotifications);
                    setData("coursesDetails", JSON.stringify(response.courseDetails), function () {
                        setData("courses", JSON.stringify(courses), hideLoading);
                    });

                } else {
                    var message = "";
                    if (apiError == undefined) {
                        message = "Unable to get user course completion status";
                    } else {
                        message = "Error getting user course completion status: " + e.title;
                    }
                    showOkayAlert("Error", message, function (button, element) {
                        element.remove();
                        location.href = "Login.html";
                    });
                }
            });

            getApplicationShortcuts(function (shortcuts) {
                $.each(shortcuts, function (index, shortcut) {
                    var shortcutElement = $("<div class='shortcut-card' sid=" + shortcut.Item1 + "><div class='shortcut-icon'><img src='data:image/png;base64," + shortcut.Item3 + "'/></div><div class='shortcut-title'>" + shortcut.Item2 + "</div></div>");
                    shortcutElement.click(function () {
                        openShortcutApplication(shortcut.Item1, function (success) {
                            if (!success) {
                                showOkayAlert("Error", "Unable to open the application. Click <a href='Help.html'>here</a> to go to support.", function (button, element) {
                                    element.remove();
                                });
                            }
                        });
                    });

                    $('.shortcut-grid').append(shortcutElement);
                });
            });
            if (response.assistant != undefined || response.assistant != null) {
                if (response.textAssistant == null || response.textAssistant == undefined) {
                    response.textAssistant = "";
                }
                if (response.enhancedTextAssistant == null || response.enhancedTextAssistant == undefined) {
                    response.enhancedTextAssistant = "";
                }
                initAssistant(response.assistant, response.textAssistant, response.enhancedTextAssistant, function () {

                });
            }
            // LoadOtherCourses();
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load dashboard, the server is not reachable.";
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

// ------------- Rotating Cards ---------------------

// === Rotating Carousel Logic ===
document.addEventListener("DOMContentLoaded", () => {
    const cards = document.querySelectorAll(".card");
    const cardsButton = document.querySelector(".btnDashboardType1");
    const next = document.getElementById("next");
    const prev = document.getElementById("prev");
    let positions = [0, 1, 2]; // initial order

    function updateCards() {
        cards.forEach((card, i) => {

            const isCenter = positions[i] === 1;
            card.classList.toggle('is-center', isCenter);

            if (positions[i] === 1) {
                // Center card
                card.style.zIndex = 5;
                card.style.transform = "translateX(0px) scale(1.1) rotateY(0deg)";
                card.style.opacity = "1";
                card.style.background = "#fff";

                // card.style.border = "2px solid #FF561F";
                card.style.boxShadow = "0 0 20px #00aeef54 ";

            } else if (positions[i] === 0) {
                // Left card
                card.style.zIndex = 2;
                card.style.transform = "translateX(-280px) scale(0.85) rotateY(25deg)";
                card.style.opacity = "0.9";
                card.style.background = "#ffffff91";
                card.style.border = "none";
                card.style.boxShadow = "0 0 20px #3dcaff5c";
                card.style.backdropFilter = "blur(3px)";

            } else {
                // Right card
                card.style.zIndex = 2;
                card.style.transform = "translateX(280px) scale(0.85) rotateY(-25deg)";
                card.style.opacity = "0.9";
                card.style.background = "ffffff91";
                card.style.border = "none";
                card.style.boxShadow = "0 0 20px #3dcaff5c";
                card.style.backdropFilter = "blur(3px)";

            }
        });
    }

    function rotateNext() {
        positions.push(positions.shift());
        updateCards();
    }

    function rotatePrev() {
        positions.unshift(positions.pop());
        updateCards();
    }

    next.addEventListener("click", rotateNext);
    prev.addEventListener("click", rotatePrev);

    updateCards();
});


// ---------- GET cOURSES -------------------

// var LoadOtherCourses = function () {
//     $.ajax({
//         url: lmsServer + "/Content/OtherCourses?token=" + encodeURIComponent(token),
//         type: "GET",
//         dataType: "json",
//         contentType: "application/json; charset=utf-8",
//         beforeSend: function () {
//             showLoading("Loading recommendations.. Please wait.");
//         },
//         success: function (response) {

//             response = response.reverse();
//             var courses =
//                 (Array.isArray(response) && response) ||
//                 (Array.isArray(response?.data) && response.data) ||
//                 (Array.isArray(response?.items) && response.items) ||
//                 (Array.isArray(response?.otherCourses) && response.otherCourses) ||
//                 (Array.isArray(response?.courseDetails) && response.courseDetails.map(x => x.item1 || x.course || x)) ||
//                 [];

//             if (!courses.length && response && typeof response === 'object') {
//                 for (const k in response) {
//                     if (Array.isArray(response[k]) && response[k].length && typeof response[k][0] === 'object') {
//                         courses = response[k];
//                         break;
//                     }
//                 }
//             }

//             // ✅ show only first 3
//             courses = courses.filter(Boolean).slice(0, 3);

//             // (rest of your code stays the same)
//             console.log("OtherCourses raw response:", response);
//             console.log("Normalized courses (first 3):", courses);

//             var $cards = $('.course-container .course_cards');
//             if (!$cards.length) {
//                 console.warn("Target .course-container .course_cards not found. Creating it.");
//                 $('.course-container').length ? $('.course-container').append('<div class="course_cards"></div>')
//                     : $('body').append('<div class="course-container"><div class="course_cards"></div></div>');
//                 $cards = $('.course-container .course_cards');
//             }

//             if (!courses.length) {
//                 $cards.html('<p>No courses found.</p>');
//                 return;
//             }

//             var html = '';
//             $.each(courses, function (_, course) {
//                 var image = (typeof lmsServer !== 'undefined' && lmsServer)
//                     ? (lmsServer + "/Content/File?name=" + encodeURIComponent("Courses/" + (course.id ?? course.ID ?? course.courseId) + ".jpg"))
//                     : "https://via.placeholder.com/400x240?text=" + encodeURIComponent(course.name || "Course");

//                 html += `
//       <div class="card image-card">
//         <h3>${course.name || course.title || ''}</h3>
//         <img src="${image}" alt="${course.name || course.title || 'Course'}">
//         <p>${course.shortDescription || course.description || ''}</p>
//         <button class="btnDashboardType1 btnExploreCourses" data-id="${course.id ?? course.ID ?? course.courseId}">Explore</button>
//       </div>`;
//             });

//             $cards.empty().append(html);

//             if (typeof enableSpeech === 'function') {
//                 $cards.find('.card p').each(function () { enableSpeech($(this)); });
//             }

//             $cards.off('click', '.btnExploreCourses').on('click', '.btnExploreCourses', function () {
//                 var courseId = $(this).data('id');
//                 var features = "location=yes,height=" + window.innerHeight + ",width=" + window.innerWidth + ",scrollbars=yes,status=yes";
//                 var url = (typeof lmsServer !== 'undefined' && lmsServer)
//                     ? (lmsServer + "/courses.html?id=" + encodeURIComponent(courseId))
//                     : ("/courses.html?id=" + encodeURIComponent(courseId));
//                 window.open(url, "_blank", features);
//             });
//         },
//         error: function (xhr, status, error) {
//             // ---- fixed: use xhr safely, no eval ----
//             console.error("OtherCourses error:", status, error, xhr && xhr.responseText);
//             var message = "Unable to load courses, the server is not reachable.";
//             try {
//                 var payload = xhr && xhr.responseText ? JSON.parse(xhr.responseText) : null;
//                 if (payload && payload.title) message = "Error: " + payload.title + ". Click <a class='tryAgainLink' href='Login.html'> here </a> to go to login.";
//             } catch (e) { /* ignore JSON parse error */ }
//             showError(message);
//         },
//         complete: function () {
//             hideLoading();
//             // Verify in DOM
//             console.log("Rendered courses count:", $('.course-container .course_cards .card').length);
//         }
//     });
// };

function loadevents() {
    $.ajax({
        url: lmsServer + "/Content/UserEvents?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading events.. Please wait.");
        },
        success: function (response) {
            console.log(response)
            let events = response.slice(0, 3);
            $('.event-container').empty()
            let eventHTML = '';
            events.forEach(ele => {
                var image = lmsServer + "/Content/File?name=" + encodeURIComponent("Events/" + ele.id + ".jpg");
                eventHTML += `<div class="events dashboard-events">
                                    <div class='event-header'>
                                        <img src="${image}" alt="event Poster">
                                    </div>
                                    <div class="event-content">
                                    
                                        <h4 class="event-date">${ele.name} <span class="event_datetime">${ele.date} <br> ${ele.timeSpan}</span></h4>
                                        <p class='event-details'>${ele.details}</p>
                                        <h5><i class='bx bx-current-location' ></i> ${ele.location}</h5>
                                    </div>
                                </div>`;
            });
            $('.event-container').append(eventHTML);

            $.ajax({
                url: lmsServer + "/Content/Jobs?token=" + encodeURIComponent(token),
                type: "GET",
                beforeSend: function () {
                    showLoading("Loading jobs.. Please wait.");
                },
                success: function (response) {
                    console.log(response)
                    let jobsHTML = '';
                    response.forEach(jobs => {
                        jobsHTML += `<div class="job-card">
                                    <h2 class="job-title">"${jobs.title}"</h2>
                                    <p class="job-company"><strong>Company</strong>: ${jobs.company}</p>
                                    <p class="job-location"><strong>Location</strong>: ${jobs.location}</p>
                                    <p class="job-package">${jobs.package}</p>
                                </div>`
                    })
                    $('.dashboard-jobportal-container').append(jobsHTML);

                    const eventcards = document.querySelectorAll('.dashboard-events');

                    // if (cards.length > 0) {
                    let observer = new IntersectionObserver(entries => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                entry.target.classList.add('show');
                            }
                        });
                    });

                    eventcards.forEach(eventcard => observer.observe(eventcard));

                }, error: function (xhr, status, error) {
                    var e = eval("(" + xhr.responseText + ")");
                    if (e == undefined) {
                        e = "Unable to load jobs, the server is not reachable.";
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
            })

            // Now bind clicks to new .events
            const eventdropdown = document.querySelectorAll('.events');

            eventdropdown.forEach(card => {
                card.addEventListener('click', () => {
                    eventdropdown.forEach(c => {
                        if (c !== card) c.classList.remove("active");
                    });
                    card.classList.toggle('active');
                });
            });

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
}


