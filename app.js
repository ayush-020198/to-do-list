const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');
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

const listSchema = {
    name: String, 
    items: [itemsSchema]
};

const List = mongoose.model('list', listSchema);

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
            res.render("list", {listTitle:day, newListItems: foundItems});
        }  
    });
});

app.get('/:customListName', (req, res) => {
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, (err, foundList) => {
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: defaultItems
                })
            
                list.save();
                res.redirect('/' + customListName);
            }
            else {
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    })
})

app.post('/', function(req, res){
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    let today = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    if(listName === today.toLocaleDateString("en-US", options)){
        item.save();
        res.redirect('/');
    }
    else {
        List.findOne({name: listName}, (err, foundList) => {
            foundList.items.push(item);
            foundList.save();
            res.redirect('/'+listName);
        })
    }
});

app.post('/delete', function(req, res){
    const checkedItemID = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === today.toLocaleDateString("en-US", options)){
        Item.findByIdAndRemove(checkedItemID, function(err){
            if(err){
                console.log(err);
            }
            else {
                console.log("Successfully Deleted");
                res.redirect('/');
            }
        });
    }
    else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, (err, foundList) => {
            if(err){
                console.log(err);
            }
            else {
                res.redirect('/' + listName);
            } 
        })
    }

    res.redirect('/');
})

app.listen(3000, function(){
    console.log('Server is running on port 3000')
});

