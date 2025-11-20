
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

            var itemDiv = $("<div class='faq-card' data-item='" + helpDetails + "'><div class='help-icon'><ion-icon name='document-text-outline'></ion-icon></div><div class='faq-date'><h3>" + item.title +
                "</h3><span>" + item.date + "</span></div>");

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
            console.log('click')
            let item =JSON.parse($(this).attr('data-item'));
            console.log(item);
            
        })

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

    $(document).on('click', '.overlay, .contact-btn-cancel', function () {
        $('.model, .overlay').fadeOut();
    })

    // $(".contact-btn-cancel").click(function () {
    //     $('.help-support').show();
    //     $('.help-tickets').hide();
    //     $('.help-contact').hide();
    // });

    $('.contact-tickets').click(function () {
        loadMyTickets(function (response) {
            // console.log(response)
            $('.help-tickets').find('.help-search').empty();
            $('.help-support').hide();
            $('.help-tickets').show();
            $('.help-contact').hide();

            var table = $("<table cellspacing='0' cellpadding='10'></table>");
            response = response.reverse();
            $.each(response, function (index, item) {
                let ticketContainer = '';
                if (index == 0) {
                    table.append("<tr class='separator'><td></td><td></td></tr>");
                }
                var tr = $("<tr class='firstRow'></tr>");
                tr.append("<td class='col1'>Subject</td>");
                tr.append("<td class='col2'>" + item.subject + "</td>");
                table.append(tr);

                tr = $("<tr></tr>");
                tr.append("<td class='col1'>Details</td>");
                tr.append("<td class='col2'>" + item.details + "</td>");
                table.append(tr);

                tr = $("<tr></tr>");
                tr.append("<td class='col1'>Created On</td>");
                tr.append("<td class='col2'>" + item.createdOn + "</td>");
                table.append(tr);

                tr = $("<tr></tr>");
                tr.append("<td class='col1'>Is Resolved</td>");
                tr.append("<td class='col2'>" + item.isResolved + "</td>");
                table.append(tr);

                tr = $("<tr class='lastRow'></tr>");
                tr.append("<td class='col1'>Resolved By</td>");
                tr.append("<td class='col2'>" + item.resolvedBy + "</td>");
                table.append(tr);

                table.append("<tr class='separator'><td></td><td></td></tr>");

                let ticketResolved = item.isResolved.toLowerCase() == 'yes' ? "<p class='ticket-isresolved yes'>It's Resolved By " + item.resolvedBy + "</p>" : "<p class='ticket-isresolved no'>It's Not Resolved</p>";
                let d = new Date(item.createdOn);

                let day = d.getDate();
                let year = d.getFullYear();

                // Month short names
                let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

                let formatted = `${day}-${months[d.getMonth()]}<br>${year}`;

                ticketContainer += `
                    <div class='parent-container'>
                        <div>
                            <div class="ticket-createdon">${formatted}</div>
                        </div>
                        <div class='tickets'>
                            <h3>${item.subject}</h3>
                            <div class='ticket-body'>
                                <p>${item.details}</p>
                                ${ticketResolved}
                            </div>
                        </div>
                        <div></div>
                        <div></div>
                    </div>
                `

                $('.help-tickets').find('.help-search').append(ticketContainer);
            });
        });
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
                response = [
                    {
                        "createdOn": "October 17, 2025",
                        "details": "test",
                        "isResolved": "No",
                        "resolvedBy": "",
                        "subject": "test"
                    },
                    {
                        "createdOn": "October 20, 2025",
                        "details": "issue with PCB layout",
                        "isResolved": "No",
                        "resolvedBy": "",
                        "subject": "PCB Design Issue"
                    },
                    {
                        "createdOn": "October 22, 2025",
                        "details": "resource upload check",
                        "isResolved": "Yes",
                        "resolvedBy": "Admin",
                        "subject": "Upload Verification"
                    }
                ]
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