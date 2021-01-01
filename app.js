const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

app.set('view engine', 'ejs');

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
    name: String
}

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Hit the + button to add new item"
})

const item2 = new Item({
    name: "Hit the - button to delete new item"
})

const defaultItems = [item1, item2];

app.get('/', function(req,res){
    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    let day = today.toLocaleDateString("en-US", options)
    
    Item.find({}, function(err, foundItems){
        if(foundItems.length===0){
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
                else {
                    console.log("Successfully saved items")
                }
            });
        }
        else {
            res.render("list", {kindOfDay:day, newItems: foundItems});
        }  
    });
});

app.post('/', function(req, res){
    const itemName = req.body.newItem;
    
    const item = new Item({
        name: itemName
    })

    item.save();
    res.redirect('/');
});

app.post('/delete', function(req, res){
    const checkedItemID = req.body.itemChecked;

    Item.findByIdAndRemove(checkedItemID, function(err){
        if(err){
            console.log(err);
        }
        else {
            console.log("Successfully Deleted");
        }
    });
    res.redirect('/');
})

app.listen(3000, function(){
    console.log('Server is running on port 3000')
});

