const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const path = require("path")
const mongoose = require("mongoose")

const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))


app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs")


mongoose.connect("mongodb+srv://enestekin1:enestekin1@cluster0.p9v6i.mongodb.net/todoListDB");

const itemsSchema = new mongoose.Schema({
    name: String
})

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to todolist app"
})

const item2 = new Item({
    name: "Hit + to add new items"
})

const item3 = new Item({
    name: "Check the checkbox to delete an item"
})

const item4 = new Item({
    name: "You can type anything you want at the end of the url (e.g: /Work) to create your own list page"
})

const defaultItems = [item1, item2, item3,item4]

const listSchema = {
    name: String
}

var connection= mongoose.connection;



var createdCollection = mongoose.model("", itemsSchema)




app.listen(process.env.PORT, function () {
    console.log("Server has started")
})

app.get("/", function (req, res) {
    Item.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            Item.insertMany(defaultItems, function (err) {
                console.log(err);
            })
            res.redirect("/")
        } else {

            res.render("list", {
                title: "Today",
                newListItems: foundItems
            })
        }
    })

})


app.post("/", function (req, res) {
    var item = req.body.formInput
    const listName = req.body.addButton

    if (listName === "Today") {
        const addItem = new Item({
            name: item
        })
        addItem.save()
        res.redirect("/")
    } else {
        createdCollection = mongoose.model(listName, itemsSchema)
        const addItem = new createdCollection({
            name: item
        })
        addItem.save()
        res.redirect("/" + listName)
    }
})


app.post("/delete", function (req, res) {
    const itemId = req.body.checkbox;
    const listName = req.body.hiddenInput
    const lowerListName= listName.toLowerCase();

    if (listName === "Today") {
        Item.findByIdAndRemove(itemId, function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Item has been removed");
                res.redirect("/")
            }
        })
    }
    
    else{
    createdCollection = mongoose.model(listName, itemsSchema)
    createdCollection.findByIdAndRemove(itemId, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Item has been removed");
            res.redirect("/"+ listName)
        }
    })
    }
})        


app.get("/:post", function (req, res) {
    const requestedParam = req.params.post

    const createdCollection = mongoose.model(requestedParam, itemsSchema)

    createdCollection.find({}, function (err, foundItems) {
        if (foundItems.length === 0) {
            createdCollection.insertMany(defaultItems, function (err) {
                console.log(err);
            })
            res.redirect("/" + requestedParam)
        } else {
            res.render("list", {
                title: requestedParam,
                newListItems: foundItems
            })
        }
    })


})