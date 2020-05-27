let password = "";

let mode = 'boxes';

$(() => {
    $('#control-area-container').hide();
    $('#clues-container').hide();
    $('#template-clue').hide();
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
            console.log('Box Mode');
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

    $('#log-in-button').click(() => {
        $('#error-message-container').hide();
        password = $('#password').val();

        $('.clue').remove();

        fetch('/api/login/' + password).then((response) => {
            response.json().then((json => {
                if (json.result == 'valid_password') {
                    $('#control-area-container').show();


                    fetch('/api/panel/clues/' + password).then((response) => {
                        response.json().then((json => {

                            let clues = json.clues;

                            clues.forEach(clue => {
                                let clueBox = $('#template-clue').clone();
                                clueBox.attr("id", "");
                                clueBox.addClass("clue");


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