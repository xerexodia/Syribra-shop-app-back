require('dotenv/config')
const express= require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const productRouter = require('./routers/products')
const categoriesRouter = require('./routers/categories')
const usersRouter = require('./routers/users')
const ordersRouter = require('./routers/orders')
const cors = require('cors');
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error');



app.use(bodyParser.json());
app.use(morgan('tiny'));
app.use(cors());
app.options('*', cors());
app.use(authJwt());
app.use(errorHandler) 


const api = process.env.API_URL
app.use(`${api}/products`,productRouter);
app.use(`${api}/categories`,categoriesRouter);
app.use(`${api}/users`,usersRouter);
app.use(`${api}/orders`,ordersRouter);
app.use('/public/upload',express.static(__dirname + '/public/uploads'));


mongoose.connect(process.env.Connection_String,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    dbName:'Shop-App'
})
.then(()=>{
    console.log('success connection')
})
.catch((err)=>{
    console.log(err)
})

var server = app.listen(process.env.PORT || 3000 ,function(){
    var port = server.address().port;
    
    console.log("server is working on port " + port + ' '+ app.settings.env)
})