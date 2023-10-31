const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.i5g3jew.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        const productCollection = client.db('productDB').collection("product");

        const sliderCollection = client.db('sliderDB').collection("slider.json");

        app.get('/slider', async (req, res) => {
            const cursor = sliderCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })



        app.get('/product', async (req, res) => {
            const cursor = productCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await productCollection.findOne(query);
            res.send(result);
        })



        app.post('/product', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct);
            const result = await productCollection.insertOne(newProduct);
            res.send(result);
        })

        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateProduct = req.body;
            const product = {
                $set: {
                    name: updateProduct.name,
                    image: updateProduct.image,
                    brand: updateProduct.brand,
                    type: updateProduct.type,
                    price: updateProduct.price,
                    rating: updateProduct.rating
                }
            }
            const result = await productCollection.updateOne(filter, product, options);
            res.send(result);
        })
        const cartCollection = client.db('CartDB').collection('carts');
        app.put('/cart', async (req, res) => {
            const data = req.body;
            console.log(data);
            const filter = {
                $and: [
                    { email: data.email },
                    { prodId: data.id }
                ]
            };
            const options = { upsert: true };
            const cart = {
                $set: {
                    prodId: data.id,
                    email: data.email
                }
            }
            const result = await cartCollection.updateOne(filter, cart, options);
            res.send(result);
        })
        app.get('/cart', async (req, res) => {
            const cursor = cartCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        app.delete('/cart', async (req, res) => {
            const data = req.body;
            console.log(data);
            // const query = { prodId: data.id };
            const filter = {
                $and: [
                    { email: data.email },
                    { prodId: data.id }
                ]
            }
            const result = await cartCollection.deleteOne(filter);
            res.send(result);
        })


        // const cartCollection = client.db('cartDB').collection("cart");
        // app.put('/cart',async (req,res) =>{
        //    const data = req.body;
        //    console.log(data);
        //    const filter = {
        //     $and: [
        //         { email: data.email},
        //         { productId: data.id }
        //     ]
        //    };
        //    const options = { upsert: true};
        //    const cart ={
        //     $set:{
        //         productId: data.id,
        //         email: data.email
        //     }
        //    }
        //    const result = await cartCollection.updateOne(filter,cart,options);
        //    res.send(result);

        // })

        // app.get( '/cart',async (req,res) =>{
        //     const cursor = cartCollection.find();
        //     const result = await cursor.toArray();
        //     res.send(result);
        // })

        // app.delete('/cart', async(req,res) => {
        //     const data = req.body;
        //     console.log(data);
        //     const filter ={
        //         $and:[
        //             { email: data.email},
        //             { productId: data.id}
        //         ]
        //     }
        //     const result = await cartCollection.deleteOne(filter);
        //     res.send(result);
        // })



        // const sliderCollection = client.db('productDB').collection("slider.json");


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Food and Beverage server is running')
})
app.listen(port, () => {
    console.log(`server is running: ${port}`);
})