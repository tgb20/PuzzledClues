let password = "";

let mode = 'boxes';

$(() => {
    $('#control-area-container').hide();
    $('#clues-container').hide();
    $('#template-clue').hide();
    $('#template-box').hide();
    $('#error-message-container').hide();
    $('#positive-message-container').hide();

    $('#positive-close-button').click(() => {
        $('#positive-message-container').hide();
    });

    $('#error-close-button').click(() => {
        $('#error-message-container').hide();
    });

    $('#add-button').click(() => {
        if (mode == 'boxes') {
            fetch('/api/panel/newbox/' + password).then((response) => {
                response.json().then((json => {

                    let box = json.box;

                    let boxCard = $('#template-box').clone();
                    boxCard.attr('id', '');
                    boxCard.addClass('box');
                    boxCard.find('.boxTitle').text(box.boxCode);
                    boxCard.find('.cluesLeft').text(box.clues);
                    boxCard.find('.cluesUsed').text(box.gotClues.length);
                    boxCard.find('.date').text('Not Started');

                    boxCard.find('.boxTrash').click(() => {

                        fetch('/api/remove/box/' + box.boxCode + '/' + password).then((response) => {
                            response.json().then((json => {
                                if (!json.error) {
                                    boxCard.remove();
                                } else {
                                    $('#error-title').text('Failed to delete Box');
                                    $('#error-subtitle').text('There was an error deleting the box');
                                    $('#error-message-container').show(250);
                                }
                            }));
                        });
                    });

                    boxCard.show();
                    boxCard.appendTo('#boxes-list');
                }));
            });
        } else {

            let clueBox = $('#template-clue').clone();
            clueBox.attr("id", "");
            clueBox.addClass("clue");

            clueBox.find('.clueSave').click(() => {

                let clueTitle = clueBox.find('.clueTitle').val();
                let clueAnswer = clueBox.find('.clueMessage').val();

                fetch('/api/save/clue/' + 9999 + '/' + password, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: clueTitle,
                        answer: clueAnswer
                    })
                }).then((response) => {
                    response.json().then((json => {
                        if (!json.error) {
                            console.log('Success!');
                            $('#positive-title').text('Saved the clue');
                            $('#positive-subtitle').text('The clue has been updated');
                            $('#positive-message-container').show(250);
                        } else {
                            $('#error-title').text('Failed to save Clue');
                            $('#error-subtitle').text('There was an error saving the clue');
                            $('#error-message-container').show(250);
                        }
                    }));
                });

            });

            clueBox.find('.clueTrash').click(() => {
                // Delete UI

                fetch('/api/remove/clue/' + 9999 + '/' + password).then((response) => {
                    response.json().then((json => {
                        if (!json.error) {
                            clueBox.remove();
                        } else {
                            $('#error-title').text('Failed to delete Clue');
                            $('#error-subtitle').text('This clue has not been saved yet');
                            $('#error-message-container').show(250);
                        }
                    }));
                });
                // Delete on Database
            });


            clueBox.show();
            clueBox.appendTo('#clues-list');
        }
    });

    if (Cookies.get('password')) {
        $('#error-message-container').hide();
        password = Cookies.get('password');

        $('.clue').remove();
        $('.box').remove();

        fetch('/api/login/' + password).then((response) => {
            response.json().then((json => {
                if (json.result == 'valid_password') {
                    $('#control-area-container').show();

                    fetch('/api/panel/clues/' + password).then((response) => {
                        response.json().then((json => {

                            let clues = json.clues;

                            clues.forEach(clue => {
                                let clueBox = $('#template-clue').clone();
                                clueBox.attr('id', '');
                                clueBox.addClass('clue');


                                clueBox.find('.clueTitle').val(clue.title);
                                clueBox.find('.clueMessage').val(clue.answer);


                                clueBox.find('.clueSave').click(() => {

                                    let clueTitle = clueBox.find('.clueTitle').val();
                                    let clueAnswer = clueBox.find('.clueMessage').val();

                                    fetch('/api/save/clue/' + clue.clueID + '/' + password, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            title: clueTitle,
                                            answer: clueAnswer
                                        })
                                    }).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                console.log('Success!');
                                                $('#positive-title').text('Saved the clue');
                                                $('#positive-subtitle').text('The clue has been updated');
                                                $('#positive-message-container').show(250);
                                            } else {
                                                $('#error-title').text('Failed to save Clue');
                                                $('#error-subtitle').text('There was an error saving the clue');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });

                                });

                                clueBox.find('.clueTrash').click(() => {
                                    // Delete UI

                                    fetch('/api/remove/clue/' + clue.clueID + '/' + password).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                clueBox.remove();
                                            } else {
                                                $('#error-title').text('Failed to delete Clue');
                                                $('#error-subtitle').text('There was an error deleting the clue');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });
                                    // Delete on Database
                                });


                                clueBox.show();
                                clueBox.appendTo('#clues-list');
                            });

                        }));
                    });

                    fetch('/api/panel/boxes/' + password).then((response) => {
                        response.json().then((json => {
                            let boxes = json.boxes;
                            boxes.forEach(box => {
                                let boxCard = $('#template-box').clone();
                                boxCard.attr('id', '');
                                boxCard.addClass('box');

                                boxCard.find('.boxTitle').text(box.boxCode);
                                boxCard.find('.cluesLeft').text(box.clues);
                                boxCard.find('.cluesUsed').text(box.gotClues.length);

                                boxCard.find('.boxTrash').click(() => {
                                    // Delete UI

                                    fetch('/api/remove/box/' + box.boxCode + '/' + password).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                boxCard.remove();
                                            } else {
                                                $('#error-title').text('Failed to delete Box');
                                                $('#error-subtitle').text('There was an error deleting the box');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });
                                    // Delete on Database
                                });

                                let date = '';
                                let defaultDate = Date.parse('2000');
                                // Haven't Started
                                if (Date.parse(box.start) == defaultDate) {
                                    date = 'Not Started';
                                }
                                else if (Date.parse(box.end) == defaultDate) {
                                    date = 'Started';
                                } else {
                                    date = 'Finished in ' + getTimeString(box.start, box.end);
                                }

                                boxCard.find('.date').text(date);

                                boxCard.show();
                                boxCard.appendTo('#boxes-list');
                            });
                        }));
                    });

                } else {
                    $('#error-title').text('Invalid Password');
                    $('#error-subtitle').text('The password you entered is not correct');
                    $('#error-message-container').show(250);
                }
            }));
        });


    }



    $('#log-in-button').click(() => {
        $('#error-message-container').hide();
        password = $('#password').val();

        $('.clue').remove();
        $('.box').remove();

        fetch('/api/login/' + password).then((response) => {
            response.json().then((json => {
                if (json.result == 'valid_password') {
                    $('#control-area-container').show();
                    Cookies.set('password', password);

                    fetch('/api/panel/clues/' + password).then((response) => {
                        response.json().then((json => {

                            let clues = json.clues;

                            clues.forEach(clue => {
                                let clueBox = $('#template-clue').clone();
                                clueBox.attr('id', '');
                                clueBox.addClass('clue');


                                clueBox.find('.clueTitle').val(clue.title);
                                clueBox.find('.clueMessage').val(clue.answer);


                                clueBox.find('.clueSave').click(() => {

                                    let clueTitle = clueBox.find('.clueTitle').val();
                                    let clueAnswer = clueBox.find('.clueMessage').val();

                                    fetch('/api/save/clue/' + clue.clueID + '/' + password, {
                                        method: 'POST',
                                        headers: {
                                            'Accept': 'application/json',
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            title: clueTitle,
                                            answer: clueAnswer
                                        })
                                    }).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                console.log('Success!');
                                                $('#positive-title').text('Saved the clue');
                                                $('#positive-subtitle').text('The clue has been updated');
                                                $('#positive-message-container').show(250);
                                            } else {
                                                $('#error-title').text('Failed to save Clue');
                                                $('#error-subtitle').text('There was an error saving the clue');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });

                                });

                                clueBox.find('.clueTrash').click(() => {
                                    // Delete UI

                                    fetch('/api/remove/clue/' + clue.clueID + '/' + password).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                clueBox.remove();
                                            } else {
                                                $('#error-title').text('Failed to delete Clue');
                                                $('#error-subtitle').text('There was an error deleting the clue');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });
                                    // Delete on Database
                                });


                                clueBox.show();
                                clueBox.appendTo('#clues-list');
                            });

                        }));
                    });

                    fetch('/api/panel/boxes/' + password).then((response) => {
                        response.json().then((json => {
                            let boxes = json.boxes;
                            boxes.forEach(box => {
                                let boxCard = $('#template-box').clone();
                                boxCard.attr('id', '');
                                boxCard.addClass('box');

                                boxCard.find('.boxTitle').text(box.boxCode);
                                boxCard.find('.cluesLeft').text(box.clues);
                                boxCard.find('.cluesUsed').text(box.gotClues.length);

                                boxCard.find('.boxTrash').click(() => {
                                    // Delete UI

                                    fetch('/api/remove/box/' + box.boxCode + '/' + password).then((response) => {
                                        response.json().then((json => {
                                            if (!json.error) {
                                                boxCard.remove();
                                            } else {
                                                $('#error-title').text('Failed to delete Box');
                                                $('#error-subtitle').text('There was an error deleting the box');
                                                $('#error-message-container').show(250);
                                            }
                                        }));
                                    });
                                    // Delete on Database
                                });

                                let date = '';
                                let defaultDate = Date.parse('2000');
                                // Haven't Started
                                if (Date.parse(box.start) == defaultDate) {
                                    date = 'Not Started';
                                }
                                else if (Date.parse(box.end) == defaultDate) {
                                    date = 'Started';
                                } else {
                                    date = 'Finished in ' + getTimeString(box.start, box.end);
                                }

                                boxCard.find('.date').text(date);

                                boxCard.show();
                                boxCard.appendTo('#boxes-list');
                            });
                        }));
                    });

                } else {
                    $('#error-title').text('Invalid Password');
                    $('#error-subtitle').text('The password you entered is not correct');
                    $('#error-message-container').show(250);
                }
            }));
        });


    });

    $('#boxes-button').click(() => {

        $('.tabitem').removeClass('active');
        $('#boxes-button').addClass('active');
        $('#clues-container').hide();
        $('#boxes-container').show();
        mode = 'boxes';

    });

    $('#clues-button').click(() => {
        $('.tabitem').removeClass('active');
        $('#clues-button').addClass('active');
        $('#boxes-container').hide();
        $('#clues-container').show();
        mode = 'clues';
    });


});

function getTimeString(startDate, endDate) {

    let start = new Date(startDate);
    let end = new Date(endDate);

    let difference = end - start;

    seconds = Math.floor((difference / 1000) % 60),
        minutes = Math.floor((difference / (1000 * 60)) % 60),
        hours = Math.floor((difference / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}