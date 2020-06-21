var Transaction = require('../Models/transaction.model');
var Book = require('../Models/data.model');
var User = require('../Models/user.model');
var Session = require('../Models/session.model');

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CloudName,
    api_key: process.env.APIkeyUp,
    api_secret: process.env.APIsecretUp
});

module.exports.showBook = async function(req, res) {
    //var dataBook = await Book.find();
    const dataBookPromise = Book.find();
   
    var page = parseInt(req.query.page) || 1; //so trang
    var items = 9; // 9 item
    var start = (page - 1) * items;
    var end = page * items;
    const dataBook = await dataBookPromise;
    var endPage = Math.floor(dataBook.length / items) + 1;

    if (res.locals.user) {
        if (res.locals.user.isAdmin) {
            res.status(200).render("books", {
                books: dataBook.slice(start, end),
                viewAction: true,
                user: res.locals.user,
                page: page,
                endPage: endPage,
                sumCart: res.locals.count
            });
        }
        res.status(200).render("books", {
            books: dataBook.slice(start, end),
            viewAction: false,
            user: res.locals.user,
            page,
            endPage,
            sumCart: res.locals.count
        });
    }

    res.status(200).render("books", {
        books: dataBook.slice(start, end),
        viewAction: false,
        user: dataBook,
        page,
        endPage,
        sumCart: res.locals.count
    });
}
module.exports.showAdd = (req, res) => {
    res.render("add");
};

module.exports.postAddBook = async (req, res) => {
    let titleAdded = req.body.titleAdded;
    let descriptionAdded = req.body.descriptionAdded;
    
    try {
        var uploader = await cloudinary.v2.uploader.upload(req.file.path);
       
        await new Book({
            title: titleAdded,
            description: descriptionAdded,
            image: uploader.url
        }).save();
    } catch (err) {
        console.log(err);
    }
 
    res.redirect("/books");
};

module.exports.deleteBook = async function(req, res) {
    let id = req.params.id;
    // await Book.deleteOne({ _id: id });
    // await Transaction.deleteOne({ bookId: id });
    const bookDelPromise = Book.deleteOne({ _id: id });
    const transDelPromise = Transaction.deleteOne({ bookId: id })
    const bookDel = await bookDelPromise;
    const transDel = await transDelPromise;
    
    res.redirect("/books");

};

module.exports.viewDetail = async function(req, res) {
    let id = req.params.id;
    let dataDetail = await Book.find({ _id: id });
    res.render("detail", { dataDetail, values:req.body });
};

module.exports.updateBook = async function(req, res) {
    let id = req.params.id;
    let dataDetail = await Book.find({ _id: id });
    res.render("update", { dataDetail });
};

module.exports.postUpdateBook = async function(req, res) {
    let titleAdded = req.body.titleAdded;
    let descriptionAdded = req.body.descriptionAdded;
    try {
        var uploader = await cloudinary.v2.uploader.upload(req.file.path);
        await Book.updateOne({ _id: req.params.id }, {
            title: req.body.titleUpdate,
            description: req.body.descriptionUpdate,
            image: uploader.url
        })
        res.redirect("/");
    }
    catch(err){
        console.log(err);
    }
    res.redirect("/");
};

module.exports.searchBook = async function(req, res) {
    let q = req.query.s;    
    var dataBook = await Book.find();
    var page = parseInt(req.query.page) || 1; //so trang
    var items = 9; // 9 item
    var start = (page - 1) * items;
    var end = page * items;
    var endPage = Math.floor(dataBook.length / items) + 1;

   
    var dataFiltered = dataBook.filter(product => product.title.toLowerCase().indexOf(q) != -1 ||  product.title.indexOf(q) != -1);
    if (res.locals.user) {
        if (res.locals.user.isAdmin) {
            res.status(200).render("books", {
                books: dataFiltered,
                viewAction: true,
                user: res.locals.user,
                page: page,
                endPage: endPage,
                numResult: dataFiltered.length,
                valueRecurrent: req.query.s
            });
        }
        res.status(200).render("books", {
            books: dataFiltered,
            viewAction: false,
            user: res.locals.user,
            page,
            endPage,
            numResult: dataFiltered.length,
            valueRecurrent: req.query.s
        });
    }

    if(dataFiltered.length == 0){
        dataFiltered = false
    }
    res.status(200).render("books", {
        books: dataFiltered,
        viewAction: false,
        user: dataBook,
        page,
        endPage,
        numResult: dataFiltered.length,
        valueRecurrent: req.query.s
    });
}