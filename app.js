const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

app.set('view engine', 'ejs');

let items = ["Eat Food", "Code"];

app.get('/', function(req,res){
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = today.toLocaleDateString("en-US", options)

    res.render("list", {kindOfDay:day, newItems: items});
});

app.post('/', function(req, res){
    let item = req.body.newItem;
    items.push(item);
    res.redirect('/');
});

app.listen(3000, function(){
    console.log('Server is running on port 3000')
});

