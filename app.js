require('dotenv').config();
const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const path = require("path")
const mongoose = require("mongoose")
const session= require("express-session")
const passport= require("passport")
const passportLocalMongoose= require("passport-local-mongoose")


const app = express();
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static("public"))


app.set('views', path.join(__dirname, 'views'));
app.set("view engine", "ejs")

//Authentication setup
  app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  }))
 
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect("mongodb+srv://enestekin1:enestekin1@cluster0.fagi2.mongodb.net/todoListDB");
// mongoose.connect('mongodb://localhost:27017/todoListDB');

const itemsSchema = new mongoose.Schema({
    name: String,
})

const userSchema= new mongoose.Schema({
    email: String,
    password: String,
    items: [itemsSchema]
})
const listSchema = {
    name: String
}

userSchema.plugin(passportLocalMongoose) 


const User= new mongoose.model("User", userSchema)
const Item = mongoose.model("Item", itemsSchema)


passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


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

app.listen(3000, function () {
    console.log("Server has started")
})


app.get("/", function (req, res) {
    if(req.isAuthenticated()){
        const userId= req.user.id
        User.findOne({id: userId}, function(err,foundItems){
            if(err){
                console.log(err);
            }else{
                if(foundItems.length===0){

                }
                res.render("home",{
                    title: "Today",
                    newListItems: foundItems.items
                })
            }
        })
    }else{
        res.render("index")
    }    
})    

app.post("/", function (req, res) {
    const item = req.body.formInput
    const userId= req.user.id

    const addItem = {
        name: item
    }
        User.findOne({id: userId}, function(err, foundItems){
            foundItems.items.push(addItem)
            foundItems.save()
            res.redirect("/")
        })
})

app.get("/login", function(req,res){
    res.render("login")
})

app.post("/login" , function(req,res){
    const user= new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err){
        if(err){
            console.log(err);
            res.redirect("/login")
        }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/") 
        })
    }
})
})
app.get("/register", function(req,res){
    res.render("register")
})

app.post("/register", function(req,res){
    User.register({username: req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err)
            res.redirect("/register")
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/")
            })
        }
    })
})
app.post("/delete", function (req, res) {
    const itemId = req.body.checkbox;
    const userId= req.user.id
    
    
    User.findOne({id: userId}, function(err, foundItems){
        const removeIndex = foundItems.items.findIndex( item => item.id === itemId );
        foundItems.items.splice( removeIndex, 1 );
        foundItems.save()
        res.redirect("/")
    })
})   