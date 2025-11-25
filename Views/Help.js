
function init(server) {
    lmsServer = server;
    getToken(loadPage);
}

var getHelp = function (callback) {
    $.ajax({
        url: lmsServer + "/Content/Help?token=" + encodeURIComponent(token),
        type: "GET",
        beforeSend: function () {
            showLoading("Loading content.. Please wait.");
        },
        success: function (response) {
            callback(response);
            // console.log(response)
        },
        error: function (xhr, status, error) {
            var e = eval("(" + xhr.responseText + ")");
            if (e == undefined) {
                e = "Unable to load the page, the server is not reachable.";
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
    getData("notifications", loadNotifications);
    getHelp(function (items) {
        $.each(items, function (index, item) {

            let helpDetails = JSON.stringify(item);
            // console.log('------------------')
            // console.log(item)
            // console.log('------------------')

            var itemDiv = $(`
    <div class='faq-card'>
        <div class='help-icon'><ion-icon name='document-text-outline'></ion-icon></div>
        <div class='faq-date'>
            <h3>${item.title}</h3>
            <span>${item.date}</span>
        </div>
    </div>
`);

            itemDiv.data("item", item);

            //     itemDiv.find('.faq-date').click(function () {
            //         // var p = $(itemDiv).find('p');
            //         // p.fadeIn();
            //         let item = $(this).attr('data-item');
            //         console.log(item);
            //         $('.overlay').fadeIn();
            //         // if (p.is(":visible")) {
            //         //     p.fadeOut();
            //         // } else {
            //         //     p.fadeIn();
            //         // }
            //     });
            $('.faq-list').append(itemDiv);
        });

        $('.faq-card').click(function () {

            $('.help-model').empty();

            // GET full object SAFELY (no JSON.parse needed!)
            let item = $(this).data('item');
            console.log(item);

            let data = `
                        <div class="popclsbtn"><i class='bx bx-x'></i></div>
                        <div class="popup-help-header">
                            <h3 class="popup-title">${item.title}</h3>
                            <p class="popup-datetime">${item.date}</p>
                        </div>
                        <div class="popup-help-description">
                            <p class="popup-helpdesc">${item.details}</p>
                        </div>
                    `;

            $('.help-model').append(data).fadeIn();
            $('.overlay').fadeIn();
        });

        enableSpeech($('.faq-list').find('p'));
    });

    $(".contact-btn").click(function () {
        // $('.help-support').hide();
        $('.help-tickets').hide();
        $('.help-contact, .overlay').fadeIn();
    });

    // $(document).on('click', '.overlay', function(){
    //     $('.model, .overlay').fadeOut();
    // })

    $(document).on('click', '.popclsbtn, .contact-btn-cancel', function () {
        $('.model, .overlay').fadeOut();
    })

    // $(".contact-btn-cancel").click(function () {
    //     $('.help-support').show();
    //     $('.help-tickets').hide();
    //     $('.help-contact').hide();
    // });

    $('.contact-tickets').click(function () {
        loadMyTickets(function (response) {

            $('.help-ticket').empty();
            $('.help-support').hide();
            $('.help-tickets').show();
            $('.help-contact').hide();

            let html = `
        <table id="ticketTable" class="display" cellspacing='0' cellpadding='10'>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Details</th>
                    <th>Created On</th>
                    <th>Is Resolved</th>
                    <th>Resolved By</th>
                </tr>
            </thead>
            <tbody>
    `;

            response.reverse().forEach(item => {
                let fullText = item.details;
                let shortText = fullText.length > 30
                    ? fullText.substring(0, 30) + "..."
                    : fullText;

                html += `
            <tr class="ticket_tr">
                <td>${item.subject}</td>
                <td class="details-cell" data-full="${fullText}" data-short="${shortText}">
                    ${shortText}
                </td>
                <td>${item.createdOn}</td>
                <td class="${item.isResolved == 'Yes' ? 'resolved-yes' : 'resolved-no'}">${item.isResolved}</td>
                <td>${item.resolvedBy}</td>
            </tr>
        `;
            });

            html += `</tbody></table>`;

            $('.help-ticket').append(html);

            // ⭐ Apply DataTable AFTER table is added to DOM
            $('#ticketTable').DataTable({
                pageLength: 10,
                lengthMenu: [5, 10, 20, 50],
                columnDefs: [
                    { orderable: false, targets: 1 }  // Disable sorting on Details column (optional)
                ],
                lengthChange: false,   // hides "Show X entries"
                info: false,
                dom: '<"table-search-container"f>t<"bottom"p>',
                order: [[3, "desc"]],
            });

            $(".table-search-container label").html(`
    <div class="custom-search-box content_searcher">
        <i class='bx bx-search'></i>
        <input type="search" class="custom-search-input" placeholder="Search...">
    </div>
`);
            $(".custom-search-input").on("keyup", function () {
                $('#ticketTable').DataTable().search(this.value).draw();
            });

            // Expand/Collapse full text
            $(document).on('click', '.details-cell', function () {
                let full = $(this).data('full');
                let short = $(this).data('short');

                if ($(this).hasClass('open')) {
                    $(this).removeClass('open').text(short);
                } else {
                    $(this).addClass('open').text(full);
                }
            });

        });
    });
    $('#searchInput').on('keyup', function () {
        let filter = $(this).val().toLowerCase();

        $('#ticketTable tbody .ticket_tr').each(function () {
            let text = $(this).text().toLowerCase();
            $(this).toggle(text.includes(filter));
        });
    });

    $('.contact-footer-btn').click(function () {
        $('.support-footer').addClass('active');
    });
    $(document).click(function (e) {
        // Check if click is outside BOTH .support-footer and .contact-footer-btn
        if (!$(e.target).closest('.support-footer, .contact-footer-btn').length) {
            $('.support-footer').removeClass('active');
        }
    });


    $('.contact-btn-back').click(function () {
        $('.help-support').show();
        $('.help-tickets').hide();
        $('.help-contact').hide();
    });

    $(".contact-btn-submit").click(function () {
        var subject = $('#text-subject').val();
        var details = $('#text-issue').val();
        if (subject == "" || details == "") {
            showOkayAlert("Validation error", "Please mention both the subject and the details", function (button, element) {
                element.remove();
            });
        } else {
            $.ajax({
                url: lmsServer + "/Content/Support",
                type: "POST",
                data: JSON.stringify({
                    "token": token,
                    "subject": subject,
                    "details": details
                }),
                beforeSend: function () {
                    showLoading("Submitting.. Please wait.");
                },
                success: function (response) {
                    showOkayAlert("Submitted", "The issue is submitted", function (button, element) {
                        element.remove();
                        $('.help-support').show();
                        $('.help-contact').hide();
                        $('.help-tickets').hide();
                        $('.overlay').fadeOut();
                    });
                },
                error: function (xhr, status, error) {
                    var e = eval("(" + xhr.responseText + ")");
                    if (e == undefined) {
                        e = "Unable to submit, the server is not reachable.";
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
    });

    var loadMyTickets = function (callback) {
        $.ajax({
            url: lmsServer + "/Content/SupportItems?token=" + encodeURIComponent(token),
            type: "GET",
            beforeSend: function () {
                showLoading("Loading your tickets.. Please wait.");
            },
            success: function (response) {
                // response = [
                //     {
                //         "createdOn": "October 17, 2025",
                //         "details": "test",
                //         "isResolved": "No",
                //         "resolvedBy": "",
                //         "subject": "test"
                //     },
                //     {
                //         "createdOn": "October 20, 2025",
                //         "details": "issue with PCB layout",
                //         "isResolved": "No",
                //         "resolvedBy": "",
                //         "subject": "PCB Design Issue"
                //     },
                //     {
                //         "createdOn": "October 22, 2025",
                //         "details": "resource upload check",
                //         "isResolved": "Yes",
                //         "resolvedBy": "Admin",
                //         "subject": "Upload Verification"
                //     }
                // ]
                callback(response);
                // console.log(response)
            },
            error: function (xhr, status, error) {
                var e = eval("(" + xhr.responseText + ")");
                if (e == undefined) {
                    e = "Unable to load the page, the server is not reachable.";
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

    $(function () {
        $('#text-search').bind('keyup change', function (ev) {
            // pull in the new value
            var searchTerm = $(this).val();

            // remove any old highlighted terms
            $('.faq-list').removeHighlight();
            searchTerm = searchTerm.trim();
            // disable highlighting if empty
            if (searchTerm) {
                // highlight the new term
                $('.faq-list').highlight2(searchTerm);
                $('.faq-list').find('.faq-card').each(function () {
                    if ($(this).find('span.highlight2').length > 0) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                });
            } else {
                $('.faq-card').show();
            }
        });
    });
}

//External code pasted
jQuery.fn.highlight2 = function (pat) {
    function innerHighlight(node, pat) {
        var skip = 0;
        if (node.nodeType == 3) {
            var pos = node.data.toUpperCase().indexOf(pat);
            if (pos >= 0) {
                var spannode = document.createElement('span');
                spannode.className = 'highlight2';
                var middlebit = node.splitText(pos);
                var endbit = middlebit.splitText(pat.length);
                var middleclone = middlebit.cloneNode(true);
                spannode.appendChild(middleclone);
                middlebit.parentNode.replaceChild(spannode, middlebit);
                skip = 1;
            }
        }
        else if (node.nodeType == 1 && node.childNodes && !/(script|style)/i.test(node.tagName)) {
            for (var i = 0; i < node.childNodes.length; ++i) {
                i += innerHighlight(node.childNodes[i], pat);
            }
        }
        return skip;
    }
    return this.each(function () {
        innerHighlight(this, pat.toUpperCase());
    });
};

jQuery.fn.removeHighlight = function () {
    function newNormalize(node) {
        for (var i = 0, children = node.childNodes, nodeCount = children.length; i < nodeCount; i++) {
            var child = children[i];
            if (child.nodeType == 1) {
                newNormalize(child);
                continue;
            }
            if (child.nodeType != 3) { continue; }
            var next = child.nextSibling;
            if (next == null || next.nodeType != 3) { continue; }
            var combined_text = child.nodeValue + next.nodeValue;
            let new_node = node.ownerDocument.createTextNode(combined_text);
            node.insertBefore(new_node, child);
            node.removeChild(child);
            node.removeChild(next);
            i--;
            nodeCount--;
        }
    }

    return this.find("span.highlight2").each(function () {
        var thisParent = this.parentNode;
        thisParent.replaceChild(this.firstChild, this);
        newNormalize(thisParent);
    }).end();
};