const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose.connect(
    "mongodb+srv://raftaaruser:eganinja2021@cluster0.f4sgh.mongodb.net/Cluster0?retryWrites=true&w=majority",
    {
        //useMongoClient: true
        useNewUrlParser: true,
        useUnifiedTopology: true,
    },
    console.log("Database Connected")
);

const meetingSchema = new mongoose.Schema({
    date: {
        type: String,
        required: true,
    },
    startTime: {
        type: Number,
        required: true,
        min: 9,
        max: 17
    },
    duration: {
        type: Number,
        required: true,
        min: 1
    }
});

const Meeting = mongoose.model("meeting", meetingSchema);

app.get('/', async (req, res) => {
    return res.send("Hello");
});

app.post('/meeting/add', async (req, res) => {
    const { date, startTime, duration } = req.body;
    console.log(date, startTime, duration);

    //ARRAY OF OBJECTS TO STORE THE EXISTING MEETINGS OF A DAY
    var existingMeetings = null;

    //MAINTAIN FREE SLOTS OF 1HR EACH
    var slots = [];
    for (var i = 0; i < 9; ++i)
        slots.push(false);

    //GET ALL MEETINGS OF A DAY
    Meeting.find({ date: date }, async (err, records) => {
        if (err)
            return res.status(500).send({ "message": String(err) });
        existingMeetings = records;
        existingMeetings.sort(function (a, b) {
            var keyA = new Date(a.startTime),
                keyB = new Date(b.startTime);
            // Compare the 2 dates
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        console.log(existingMeetings);

        existingMeetings.forEach(meet => {
            var i = 0;
            var duration = meet.duration;
            while (duration > 0) {
                slots[meet.startTime + i - 9] = true;
                --duration;
                ++i;
            }
        });

        //PRINTING FREE AND USED SLOTS
        console.log(slots);

        var freeSlots = [];

        for (var i = 0; i < 9; ++i) {
            if (slots[i] == false) {
                freeSlots.push(i + 9);
            }
        }
        console.log(freeSlots);
        var newMeetDuration = duration;
        var count = duration;
        var ite = 0;
        while (newMeetDuration > 0) {
            for (var j = 0; j < freeSlots.length; ++j) {
                if ((startTime + ite) == freeSlots[j]) {
                    --count;
                    // console.log("Not Available");
                }
            }
            --newMeetDuration;
            ++ite;
        }
        const newMeetObject = new Meeting({ date: date, startTime: startTime, duration: duration });
        if (count == 0) {
            newMeetObject.save().then(res => {
                console.log("saved");
            }).catch(err => {
                console.log(err);
            });
            return res.status(200).send({ "message": "New Meeting Created." })
        }
        else
            return res.status(400).send({ "message": "New Meeting Cannot Be Created." })
    });
});

app.post('/meeting/all', async (req, res) => {
    const { date } = req.body;
    console.log(date);

    //ARRAY OF OBJECTS TO STORE THE EXISTING MEETINGS OF A DAY
    var existingMeetings = null;

    //MAINTAIN FREE SLOTS OF 1HR EACH
    var slots = [];
    for (var i = 0; i < 9; ++i)
        slots.push(false);

    //GET ALL MEETINGS OF A DAY
    Meeting.find({ date: date }, async (err, records) => {
        if (err)
            return res.status(500).send({ "message": String(err) });
        existingMeetings = records;
        existingMeetings.sort(function (a, b) {
            var keyA = new Date(a.startTime),
                keyB = new Date(b.startTime);
            // Compare the 2 dates
            if (keyA < keyB) return -1;
            if (keyA > keyB) return 1;
            return 0;
        });
        console.log(existingMeetings);

        existingMeetings.forEach(meet => {
            var i = 0;
            var duration = meet.duration;
            while (duration > 0) {
                slots[meet.startTime + i - 9] = true;
                --duration;
                ++i;
            }
        });

        //PRINTING FREE AND USED SLOTS
        console.log(slots);

        var freeSlots = [];

        for (var i = 0; i < 9; ++i) {
            if (slots[i] == false) {
                freeSlots.push(i + 9);
            }
        }
        console.log(freeSlots);

        var response = [];

        if (freeSlots.length > 0) {
            var startPoint = freeSlots[0];
            var endPoint = freeSlots[0];

            if (freeSlots.length == 1) {
                response.push(freeSlots[0] + " - "(freeSlots[0] + 1))
            }

            // var flag = 1;
            // for (var i = 1; i < freeSlots.length; ++i) {
            //     flag = 1;
            //     if ((freeSlots[i] - freeSlots[i - 1]) == 1) {
            //         endPoint = freeSlots[i];
            //     }
            //     else {
            //         flag = 0;
            //         response.push(startPoint + " - " + endPoint);
            //         startPoint = i + 1;
            //         endPoint = i + 1;
            //     }
            // }
            // if(flag == 1)
            //     response.push(startPoint + " - " + endPoint);
            startPoint = 0, endPoint = 0;
            var flag= 1;
            for(var i=1; i<freeSlots.length; )
            {
                flag = 1;
                if((freeSlots[i] - freeSlots[i-1]) == 1)
                {
                    endPoint = i;
                    ++i;
                }
                else
                {
                    flag = 0;
                    if(startPoint == endPoint)
                        response.push(freeSlots[startPoint] + '-' + (freeSlots[startPoint] + 1));
                    else
                        response.push(freeSlots[startPoint] + '-' + freeSlots[endPoint]);
                    startPoint = endPoint = i;
                    ++i;
                }   
            }
            if(flag == 1)
            {
                response.push(freeSlots[startPoint] + '-' + (freeSlots[endPoint] + 1));
            }

        }

        return res.status(200).send({ "message": response });
    });
});

app.listen('4040', function () {
    console.log("Server is running.")
})


   // [
    //     {
    //       _id: new ObjectId("61727d604340124cafc7c9db"),
    //       date: '22/10/2021',
    //       startTime: 9,
    //       duration: 1
    //     },
    //     {
    //       _id: new ObjectId("61727b9c4340124cafc7c9d9"),
    //       date: '22/10/2021',
    //       startTime: 15,
    //       duration: 2
    //     },
    //     {
    //       _id: new ObjectId("61727d8b4340124cafc7c9dc"),
    //       date: '22/10/2021',
    //       startTime: 17,
    //       duration: 1
    //     }
    //   ]
