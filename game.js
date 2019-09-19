var app = require('express')();
var http = require('http').Server(app);
let io = require('socket.io')(http);
const express = require('express')
var bodyParser = require('body-parser');
app.use(express.static(__dirname));
app.set('views', __dirname);
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

http.listen(process.env.PORT || 5000, () => {
    console.log('We are live on  5000');
});

io.on('connection', function(socket){
    console.log('new connection');
    let number = createRand4DigitNumber();

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    let steps = 0;

    socket.on('try', function(assumption){
        steps++;
        let text = checkAssumption(assumption,number,steps);
        if(text.includes('Поздравляю,')){
            number = createRand4DigitNumber();
            steps = 0;
        }
        socket.emit('tried', text);
    });

});

app.get("*", function(req, res){
    res.sendFile(__dirname + '/index.html');
})

function checkAssumption(assumption, number, steps) {

    assumption = assumption.replace(/\D/g, '');
    if (assumption.length >4){
        assumption = assumption.slice(0,4);
    }
    if (assumption.length !== 4){
        return "Вы ввели некорректное число"
    }

    let right = 0; let close = 0;
    for (let i = 0; i < assumption.length;i++){
        if (assumption[i] == number[i]){
            right++;
        }
    }
    let tmpNumber = number;
    let tmpAssumption = assumption;
    let help = 0;
    for (let i = 0; i < 4; i++){

        if (tmpNumber.indexOf(tmpAssumption[help]) !== -1 && number[i] !== assumption[i]){
            tmpNumber = tmpNumber.replace(tmpAssumption[help],'');
            tmpAssumption = tmpAssumption.replace(tmpAssumption[help],'');
            help--;
            close++;
        }
        help++;
        // console.log(tmpAssumption + " " + tmpNumber);
    }
    //console.log("Чисел B: " + right + " чисел K: " + close);
    if(right === 4){
        return "Поздравляю, вы победили за " + steps + " ходов! Число компьютера: " + number + " можете попробовать снова :)"
    } else{
        return assumption +" - Цифр B: " + right + " цифр K: " + close;
    }
}

function createRand4DigitNumber() {
    let tmp = "";

    for (let i = 0; i<4;i++){
        tmp += Math.floor(Math.random() * (9));
    }
    console.log(tmp);
    return tmp;
}