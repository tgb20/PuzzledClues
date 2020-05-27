let timer;

let numOfClues = 5;

$(() => {
    $('#time-container').hide();
    $('#clues-container').hide();
    $('#solved-message-container').hide();
    $('#unsolved-message-container').hide();
    $('#error-message-container').hide();
    $('#template-clue').hide();
    $('#error-clue-container').hide();

    $('#error-close-button').click(() => {
        $('#error-message-container').hide();
    });

    $('#unsolved-close-button').click(() => {
        $('#unsolved-message-container').hide();
    });

    $('#error-clue-container').click(() => {
        $('#error-clue-container').hide();
    });

    $('#end-button').click(() => {
        let password = $('#final-password').val();
        let boxCode = $('#boxcode').val();
        $('#error-message-container').hide();
        $('#unsolved-message-container').hide();
        $('#solved-message-container').hide();
        $('#error-clue-container').hide();

        fetch('/api/end/' + boxCode + '/' + password).then((response) => {
            response.json().then((json => {
                if (json.error) {
                    if (json.error == "database") {
                        $('#error-title').text('There was a problem with the Database');
                        $('#error-subtitle').text('Please try again later');
                        $('#error-message-container').show(250);
                    }
                    if (json.error == "database") {
                        $('#error-title').text('There was a problem with the Database');
                        $('#error-subtitle').text('Please try again later');
                        $('#error-message-container').show(250);
                    }
                    if (json.error == "incorrect_password") {
                        $('#unsolved-message-container').show(250);
                    }

                    return;
                }

                if (json.success) {
                    clearInterval(timer);
                    $('#solved-message-container').show(250);
                    $('#password-container').hide();
                }
            }));
        });
    });

    $("#start-button").click(() => {

        $('#time-container').hide();
        $('#clues-container').hide();
        $('#solved-message-container').hide();
        $('#error-message-container').hide();
        $('#unsolved-message-container').hide();
        $('#error-clue-container').hide();

        $('.clue').remove();


        let boxCode = $('#boxcode').val() || -1;


        fetch('/api/start/' + boxCode).then((response) => {
            response.json().then((json => {
                if (json.error) {
                    if (json.error == "invalid_code") {
                        $('#error-title').text('There was a problem with your box code');
                        $('#error-subtitle').text('Please make sure your box code matches the one that came with your box');
                        $('#error-message-container').show(250);
                    }
                    if (json.error == "database") {
                        $('#error-title').text('There was a problem with the Database');
                        $('#error-subtitle').text('Please try again later');
                        $('#error-message-container').show(250);
                    }
                    return;
                }

                let start = json.start;
                let end = json.end;
                let cluesLeft = json.clues;

                $('#clues-remaining').text(cluesLeft);

                let baseDate = Date.parse("2000");
                let endDate = Date.parse(end);

                if (endDate != baseDate) {
                    $('#time-elapsed').text(getTimeString(start, end));
                    $('#solved-message-container').show();
                    $('#password-container').hide();
                    clearInterval(timer);
                } else {
                    $('#password-container').show();
                    $('#time-elapsed').text(getTimeString(start, Date.now()));
                    timer = setInterval(() => {
                        let timeString = getTimeString(start, Date.now());
                        $('#time-elapsed').text(timeString);
                    }, 1000);
                }

                $('#error-message-container').hide();
                $('#time-container').show(250);

                fetch('api/clues/' + boxCode).then((clueResponse) => {
                    clueResponse.json().then(clueJSON => {
                        let clues = clueJSON.clues;
                        clues.forEach(clue => {
                            let clueBox = $('#template-clue').clone();
                            clueBox.attr("id", "");
                            clueBox.addClass("clue");
                            clueBox.find('.header').text(clue.title);
                            clueBox.find('#unlocked').hide();

                            if (clue.answer) {
                                let answer = clue.answer;

                                let description = clueBox.find('.description');

                                clueBox.find('#clue-unlock').hide();
                                clueBox.find('#unlocked').show();

                                description.find('img').hide();
                                description.text(answer);
                            }



                            clueBox.find('#clue-unlock').click(() => {

                                $('#error-message-container').hide();
                                $('#unsolved-message-container').hide();
                                $('#error-clue-container').hide();

                                fetch('api/clues/' + boxCode + '/' + clue.clueID).then((answerResponse) => {
                                    answerResponse.json().then(answerJSON => {
                                        if (answerJSON.error) {
                                            if (answerJSON.error == "invalid_code") {
                                                $('#error-title').text('There was a problem with your box code');
                                                $('#error-subtitle').text('Please make sure your box code matches the one that came with your box');
                                                $('#error-clue-container').show(250);
                                            }
                                            if (answerJSON.error == "database") {
                                                $('#error-title').text('There was a problem with the Database');
                                                $('#error-subtitle').text('Please try again later');
                                                $('#error-clue-container').show(250);
                                            }
                                            if (answerJSON.error == "no_clues") {
                                                $('#error-title').text('You have no clues left!');
                                                $('#error-subtitle').text('You can take a penalty to add clues');
                                                $('#error-clue-container').show(250);
                                            }
                                            return;
                                        }
                                        let answer = answerJSON.answer;

                                        let description = clueBox.find('.description');

                                        clueBox.find('#clue-unlock').hide();
                                        clueBox.find('#unlocked').show();

                                        description.find('img').hide();
                                        description.text(answer);


                                        cluesLeft -= 1;
                                        $('#clues-remaining').text(cluesLeft);
                                    });
                                })
                            });

                            clueBox.show();
                            clueBox.appendTo('#clues-list');

                        });
                    });
                });

                $('#clues-container').show(250);
            }));
        });
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
