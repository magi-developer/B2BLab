
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var getJobs = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/Jobs?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading jobs.. Please wait.");
        },
        success: function (response) {

             response = [
                {
                    id: 1,
                    company: "WebDev",
                    title: "Web Developer",
                    details: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris cursus quis metus quis pellentesque. Integer rutrum congue arcu, eu ultricies nisl dignissim id. Aliquam erat volutpat. Nulla nisi sem, pulvinar sit amet ullamcorper at, tincidunt eget mi. Suspendisse sed molestie ex, sit amet pellentesque odio. Sed nec tellus a leo aliquet rhoncus id a enim. Cras bibendum, augue ac rutrum consequat, metus nisl egestas magna, eget scelerisque sem est nec tortor. Morbi scelerisque nibh risus, in ultricies lectus ornare at. Suspendisse tempor dolor eget cursus imperdiet. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec ac facilisis eros. Quisque vel ipsum condimentum, ullamcorper eros ac, maximus metus. Duis dignissim nulla a orci ultrices, sit amet mattis magna commodo. Proin placerat, ipsum sed cursus varius, tellus urna tristique nisl, a tristique elit tellus id leo. Nullam euismod tempor orci et placerat.r",
                    qualification: "B.E",
                    location: "Bargur, Tamil Nadu",
                    notice: "3 Month",
                    package: "3.2 LPA",
                    isApplied: true,
                    tags: ["HTML", "CSS", "Java"]
                },
                {
                    id: 2,
                    company: "TechSpark",
                    title: "Frontend Developer",
                    details: "React UI Developer",
                    qualification: "B.Tech",
                    location: "Chennai, Tamil Nadu",
                    notice: "Immediate",
                    package: "4.0 LPA",
                    isApplied: false,
                    tags: ["React", "JavaScript", "Tailwind"]
                },
                {
                    id: 3,
                    company: "CodeMind",
                    title: "Backend Developer",
                    details: "Node.js Backend Engineer",
                    qualification: "B.E / B.Tech",
                    location: "Bangalore, Karnataka",
                    notice: "1 Month",
                    package: "5.5 LPA",
                    isApplied: false,
                    tags: ["Node.js", "Express", "MongoDB"]
                },
                {
                    id: 4,
                    company: "SoftLogic",
                    title: "Full Stack Developer",
                    details: "MERN Stack Developer",
                    qualification: "Any Degree",
                    location: "Coimbatore, Tamil Nadu",
                    notice: "15 Days",
                    package: "6.0 LPA",
                    isApplied: true,
                    tags: ["MongoDB", "React", "Node.js"]
                },
                {
                    id: 5,
                    company: "BrightApps",
                    title: "UI/UX Designer",
                    details: "Figma UI Designer",
                    qualification: "B.Sc / B.Des",
                    location: "Salem, Tamil Nadu",
                    notice: "Immediate",
                    package: "3.8 LPA",
                    isApplied: false,
                    tags: ["Figma", "Photoshop", "Wireframe"]
                }
            ];

            callback(response.reverse());
        },
        error: function (xhr, status, error) {
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
    });
}

var loadNotifications = function (notifications) {
    loadUnreadNotifications(JSON.parse(notifications));
}

var loadPage = function (userToken) {
    token = userToken;
    getData("notifications", loadNotifications)
    getJobs(function (jobs) {
        $.each(jobs, function (index, job) {

            let stringItem = JSON.stringify(job);

            var card = $("<div class='job-card'></div>");
            var jobDetails = $("<div class='job-details jobdetailscont'></div>")
            jobDetails.data("item", job);
            var header = $("<div class='job-header'><div class='job-company'><ion-icon name='business'></ion-icon> " + job.company + "</div><div class='job-title'>" + job.title + "</div></div>");
            jobDetails.append(header);

            var details1 = $("<div class='job-details'><ion-icon name='wallet'></ion-icon> " + job.package + " | <ion-icon name='calendar-number'></ion-icon> " + job.notice + " | <ion-icon name='location'></ion-icon> " + job.location + "</div>");
            var details2 = $("<div class='job-details'><strong>Description:</strong>" + job.details.substring(0, 100) +"...</div>");
            var qualification = $("<div class='job-details'><strong>Qualifications: </strong>" + job.qualification + "</div>");
            jobDetails.append(qualification);
            jobDetails.append(details2);

            var tags = $("<div class='job-tags'></div>");
            $.each(job.tags, function (i, t) {
                var tag = $("<span class='tag'>" + t + "</span>");
                tags.append(tag);
            });
            jobDetails.append(tags);
            jobDetails.append(details1);

            var actions = $("<div class='job-actions'></div>");

            var apply = $("<button class='job-button'>Apply Now</button>");
            var withdraw = $("<button class='job-button' style='background: #eee; color: #333;'>Cancel</button>");
            actions.append(apply);
            actions.append(withdraw);
            apply.hide();
            withdraw.hide();

            // header.click(function () {
            //     if (details1.is(":visible")) {
            //         details1.hide();
            //         details2.hide();
            //         qualification.hide();
            //         tags.hide();
            //         actions.hide();
            //     } else {
            //         details1.show();
            //         details2.show();
            //         qualification.show();
            //         tags.show();
            //         actions.show();
            //     }
            // });

            apply.click(function () {
                $(this).prop('disabled', true).html("Applying..");
                setJobApplication("1", job.id, function () {
                    apply.prop('disabled', false).html("Apply");
                    apply.hide();
                    withdraw.show();
                });
            });
            withdraw.click(function () {
                $(this).prop('disabled', true).html("Cancelling..");
                setJobApplication("0", job.id, function () {
                    withdraw.prop('disabled', false).html("Cancel");
                    withdraw.hide();
                    apply.show();
                });
            });
            if (job.isApplied) {
                withdraw.show();
            } else {
                apply.show();
            }
            card.append(jobDetails);
            card.append(actions);
            $('.job-portal-section').append(card);
            // header.trigger('click');
        });
    });



    document.getElementById("jobSearch").addEventListener("keyup", function () {
        let filter = this.value.toLowerCase();
        let cards = document.querySelectorAll(".job-card");

        cards.forEach(card => {
            let text = card.innerText.toLowerCase();
            card.style.display = text.includes(filter) ? "flex" : "none";
        });
    });

    // $('.job-card').click(function () {
    //     let item = $(this).data("item");
    //     console.log(item);
    // });

    $(document).on('click', '.jobdetailscont', function () {

        $('.course-popup-details, .overflow').fadeIn();

        let item = $(this).data("item");
        let originalCard = $(this).parent();   // <-- Important
        $('.course-popup-details').empty();

        // Create action buttons
        var actions = $("<div class='job-actions'></div>");
        var apply = $("<button class='job-button'>Apply Now</button>");
        var withdraw = $("<button class='job-button' style='background:#eee;color:#333;'>Cancel</button>");

        actions.append(apply, withdraw);
        apply.hide(); withdraw.hide();

        let tags = ''
        $.each(item.tags, function (i, t) {
             tags += "<span class='tag'>" + t + "</span>";
        });

        // Build popup HTML
        let courseDetails = `
        <div class='popup-jobdetails'>
            <div class='popup-jobportalheader'>
                <p class='popup-company'><ion-icon name='business'></ion-icon>${item.company}</p>
                <h3 class='popup-jobtitle'>${item.title}</h3>
            </div>
            <div class='popup-jobportalbody'>
                <div class='job-details'><strong>Qualifications:</strong> ${item.qualification}</div>
                <div class='job-tags'>Skills: ${tags}</div>
                <div class='job-details'><strong>Job Description:</strong> ${item.details}</div>
                <div class='job-details'>
                    <ion-icon name='wallet'></ion-icon> ${item.package} |
                    <ion-icon name='calendar-number'></ion-icon> ${item.notice} |
                    <ion-icon name='location'></ion-icon> ${item.location}
                </div>
            </div>
        </div>
    `;
        
       

        $('.course-popup-details').append(courseDetails);
        // $('.course-popup-details .popup-jobdetails').append(tags);
        $('.course-popup-details .popup-jobdetails').append(actions);

        // ===============  APPLY ==================
        apply.click(function () {

            $(this).prop('disabled', true).html("Applying..");
            setJobApplication("1", item.id, function () {

                // Popup buttons update
                apply.prop('disabled', false).html("Apply").hide();
                withdraw.show();

                // ORIGINAL CARD BUTTON UPDATE
                let origApply = originalCard.find(".job-button:contains('Apply')");
                let origCancel = originalCard.find(".job-button:contains('Cancel')");

                origApply.hide();
                origCancel.show();
            });
        });

        // ===============  WITHDRAW ==================
        withdraw.click(function () {

            $(this).prop('disabled', true).html("Cancelling..");
            setJobApplication("0", item.id, function () {

                // Popup update
                withdraw.prop('disabled', false).html("Cancel").hide();
                apply.show();

                // ORIGINAL CARD UPDATE
                let origApply = originalCard.find(".job-button:contains('Apply')");
                let origCancel = originalCard.find(".job-button:contains('Cancel')");

                origCancel.hide();
                origApply.show();
            });
        });

        // Show correct button in popup
        if (item.isApplied) {
            withdraw.show();
        } else {
            apply.show();
        }
    });

    $(document).on('click', '.overflow', function () {
        $('.model, .overflow').fadeOut();
    })
}

var setJobApplication = function (apply, jobId, callback) {
    $.ajax({
        url: lmsServer + "/Content/UserJobApplication?jobId=" + jobId + "&apply=" + apply + "&token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {

        },
        success: function (response) {
            callback(response);
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to apply for the job, the server is not reachable.";
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