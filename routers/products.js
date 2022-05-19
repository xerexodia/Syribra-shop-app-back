const express = require('express');
const router = express.Router();
const {Product} = require('../models/product')
const {Category} = require('../models/category')
const mongoose = require('mongoose');
const multer = require('multer');

const FILE_TAP_MAP={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TAP_MAP[file.mimetype];
    let uploadError = new Error('invalid image type');
    if (isValid) {
        uploadError=null
    }
    cb(uploadError,  'public/uploads')
  },
  filename: function (req, file, cb) {
    const fielname = file.originalname.split(' ').join('-')
    const extension = FILE_TAP_MAP[file.mimetype]
    cb(null, `${fielname}-${Date.now()}.${extension}`)
  }
})

const uploadOptions = multer({ storage: storage })



//post a product
router.post('/',uploadOptions.single('image'), async (req,res)=>{
    const category = await Category.findById(req.body.category);
    if(!category)  {
        return res.status(400).send('invalid category')
    }
    const file =req.file;
    if(!file)  {
        return res.status(400).send('there is no image please add an image')
    }
    const fileName = file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
    let product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReview:req.body.numReview,
        isFeatured:req.body.isFeatured,
    })
    product = await product.save()
    !product ? res.status(500).json('product cannot be created') : res.send(product)
})


//get all products
router.get('/', async (req,res)=>{
    let filter= {};

    if(req.query.categories){
        filter = {category :req.query.categories.split(',') }
    }
    const productList = await Product.find(filter).populate('category');
    if(!productList){
        res.status(500).json({success:false})
    }
    res.send(productList);
})


//get a single product
router.get('/:id', async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category');
    if(!product){
        res.status(500).json({success:false})
    }
    res.send(product);
})




//upate a product
router.put('/:id', async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)) 
        return res.status(400).send('invalid product id ');
    const category = await Category.findById(req.body.category);
    if(!category)  {
        return res.status(400).send('invalid category')
    }
    let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:req.body.image,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReview:req.body.numReview,
        isFeatured:req.body.isFeatured,
        },{new:true}
    );
    !product ? res.status(500).send('the product cannot be updated') : res.send(product);
})


//Delete a product
router.delete('/:id',(req,res)=>{
    Product.findByIdAndRemove(req.params.id)
    .then(product=>{
        if(product){
            return res.status(200).json({success:true,message:'the product is deleted'})
        }else{
            return res.status(404).json({success:false,message:'product not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false, error:err})
    })
})


router.get('/get/count', async (req,res)=>{
    const productCount = await Product.countDocuments({});
    if(!productCount){
        res.status(500).json({success:false})
    }
    res.send({
        productCount:productCount
    });
})

router.get('/get/featured/:count', async (req,res)=>{
    const count = req.params.count ? req.params.count : 0
    const products = await Product.find({
        isFeatured:true
    }).limit(count);
    if(!products){
        res.status(500).json({success:false})
    }
    res.send(products);
})

router.put('/gallery-images/:id',
    uploadOptions.array('images',10), 
    async(req, res) => {
        if(!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).send('invalid product id ');}
        const files = req.files;
        let imagesPaths=[];
        const basePath = `${req.protocol}://${req.get('host')}/public/upload/`;
        if(files){
            files.map(file => {
                imagesPaths.push(`${basePath}${file.filename}`);
            })
        }
        let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images:imagesPaths
        },{new:true}
    );
    !product ? res.status(500).send('the product cannot be updated') : res.send(product);
})


module.exports = router;