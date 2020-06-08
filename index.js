const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

const PORT = process.env.PORT || 80;

mongoose.connect('mongodb+srv://puzzledAPI:' + process.env.MONGO_PASSWORD + '@cluster0-m1khb.mongodb.net/puzzled?retryWrites=true&w=majority', { useNewUrlParser: true });

let boxSchema = new mongoose.Schema({
    boxCode: String,
    start: Date,
    clues: Number,
    end: Date,
    gotClues: [Number]
});

let clueSchema = new mongoose.Schema({
    clueID: Number,
    title: String,
    answer: String
});

let boxModel = mongoose.model('boxes', boxSchema);
let clueModel = mongoose.model('clues', clueSchema);

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.raw());

app.use('/', express.static(path.join(__dirname, 'public')))

app.get('/control', function (req, res) {
    res.sendFile(path.join(__dirname, '/public/control.html'));
});

app.get('/api/login/:password', (req, res) => {
    let password = req.params.password;

    if (password == process.env.PANEL_PASSWORD) {
        res.json({ result: 'valid_password' });
        return;
    } else {
        res.json({ result: 'invalid_password' });
        return;
    }
});

app.get('/api/remove/clue/:id/:password', (req, res) => {

    let password = req.params.password;
    let clueID = req.params.id;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    if (clueID == 9999) {
        res.json({ error: 'no_clues' });
    } else {
        clueModel.findOneAndRemove({ clueID: clueID }, (err) => {
            if (err) {
                res.json({ error: 'database' });
                return;
            }
            res.json({ result: 'success' });
        });
    }
});

app.post('/api/save/clue/:id/:password', (req, res) => {

    let password = req.params.password;
    let clueID = req.params.id;

    let title = req.body.title;
    let answer = req.body.answer;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    if (clueID == 9999) {


        clueModel.find({}, (err, clues) => {

            if (err) {
                res.json({ error: 'database' });
                return;
            }

            let newClue = new clueModel({ clueID: clues.length + 1, title: title, answer: answer });
            newClue.save();
            res.json({ result: 'success' });
        });
    } else {
        clueModel.find({ clueID: clueID }, (err, clues) => {
            if (err) {
                res.json({ error: 'database' });
                return;
            } else if (clues.length == 0) {
                res.json({ error: 'no_clues' });
                return;
            }

            let clue = clues[0];

            clue.title = title;
            clue.answer = answer;

            clue.save();

            res.json({ result: 'success' });
        });
    }
});

app.get('/api/panel/boxes/:password', (req, res) => {
    let password = req.params.password;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    boxModel.find({}, (err, boxes) => {

        if (err) {
            res.json({ error: 'database' });
            return;
        }

        res.json({ boxes: boxes });
    });
});

app.get('/api/panel/newbox/:password', (req, res) => {
    let password = req.params.password;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    boxModel.find({}, (err, box) => {

        if (err) {
            res.json({ error: 'database' });
            return;
        }

        let newBox = new boxModel({ boxCode: makeid(5), start: Date.parse('2000'), clues: 3, end: Date.parse('2000') });
        newBox.save();
        res.json({ box: newBox });
    });
});

app.get('/api/remove/box/:code/:password', (req, res) => {

    let password = req.params.password;
    let code = req.params.code;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    boxModel.findOneAndRemove({ boxCode: code }, (err) => {
        if (err) {
            res.json({ error: 'database' });
            return;
        }
        res.json({ result: 'success' });
    });
});

app.get('/api/panel/clues/:password', (req, res) => {
    let password = req.params.password;

    if (password != process.env.PANEL_PASSWORD) {
        res.json({ error: 'invalid_password' });
        return;
    }

    clueModel.find({}, (err, clues) => {

        if (err) {
            res.json({ error: 'database' });
            return;
        }

        res.json({ clues: clues });
    });
});

app.get('/api/clues/:box_code/:clue_number', (req, res) => {

    let boxCode = req.params.box_code;
    let clueNumber = req.params.clue_number;

    boxModel.find({ boxCode: boxCode }, (err, boxes) => {

        if (err) {
            res.json({ error: 'database' });
            return;
        } else if (boxes.length == 0) {
            res.json({ error: 'invalid_code' });
            return;
        }

        let box = boxes[0];

        if (box.clues <= 0) {
            res.json({ error: 'no_clues' });
            return;
        }

        clueModel.find({ clueID: clueNumber }, (err, clues) => {

            if (err) {
                res.json({ error: 'database' });
                return;
            } else if (clues.length == 0) {
                res.json({ error: 'no_clues' });
                return;
            }

            let clueAnswer = JSON.parse(JSON.stringify(clues[0].answer))

            box.gotClues.push(clueNumber);

            box.clues = box.clues - 1;
            box.save();

            res.json({ answer: clueAnswer });
        });
    });
});

app.get('/api/clues/:box_code', (req, res) => {

    let boxCode = req.params.box_code;

    boxModel.find({ boxCode: boxCode }, (err, boxes) => {
        if (err) {
            res.json({ error: 'database' });
            return;
        } else if (boxes.length == 0) {
            res.json({ error: 'invalid_code' });
            return;
        }

        let box = boxes[0];

        clueModel.find({}, (err, clues) => {

            if (err) {
                res.json({ error: 'database' });
                return;
            }

            let formattedClues = [];

            clues.forEach(clue => {
                let newClue = JSON.parse(JSON.stringify(clue))

                if (!box.gotClues.includes(newClue.clueID)) {
                    delete newClue.answer;
                }
                formattedClues.push(newClue);
            });

            res.json({ clues: formattedClues });
        });



    });
});

app.get('/api/end/:box_code/:password', (req, res) => {

    let boxCode = req.params.box_code;
    let password = req.params.password;

    boxModel.find({ boxCode: boxCode }, (err, boxes) => {

        let box = boxes[0];

        if (err) {
            res.json({ error: 'database' });
            return;
        } else if (boxes.length == 0) {
            res.json({ error: 'invalid_code' });
            return;
        }

        if (password == process.env.GAME_PASSWORD) {
            box.end = Date.now();
            box.save();
            res.json({ success: 'correct_password' });
        } else {
            res.json({ error: 'incorrect_password' });
        }
    });
});

app.get('/api/start/:box_code', (req, res) => {

    let boxCode = req.params.box_code;

    // Check if valid box code
    boxModel.find({ boxCode: boxCode }, (err, boxes) => {

        if (err) {
            res.json({ error: 'database' });
            return;
        } else if (boxes.length == 0) {
            res.json({ error: 'invalid_code' });
            return;
        }

        let box = boxes[0];

        let baseDate = Date.parse('2000');
        let boxDate = Date.parse(box.start);

        // Check if the box has started
        if (boxDate != baseDate) {
            console.log('Box Started');
            // Get start time
            let start = box.start;
            // Get clues left
            let clues = box.clues;
            // Get end time
            let end = box.end;

            res.json({ start: start, clues: clues, end: end });
        } else {
            console.log('Box Not Started');
            // Record the current time stamp
            let start = Date.now();
            box.start = start;
            box.save();
            // Get clues left
            let clues = box.clues;
            // Get end time
            let end = box.end;
            res.json({ start: start, clues: clues, end: end });
        }
    });
});


app.listen(PORT, () => {
    console.log(`Server started on port: ${PORT}`);
});

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHJKMNPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}