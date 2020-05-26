const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require("dotenv");
dotenv.config();

const PORT = 80;

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

app.use('/', express.static(path.join(__dirname, 'public')))

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
                
                if(!box.gotClues.includes(newClue.clueID)) {
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