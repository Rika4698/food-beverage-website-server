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
//console.log(uri);
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
        // app.put('/cart', async (req, res) => {
        //     const data = req.body;
        //     console.log(data);
        //     const filter = {
        //         $and: [
        //             { email: data.email },
        //             { prodId: data.id }
        //         ]
        //     };
        //     const options = { upsert: true };
        //     const cart = {
        //         $set: {
        //             prodId: data.id,
        //             email: data.email
        //         }
        //     }
        //     const result = await cartCollection.updateOne(filter, cart, options);
        //     res.send(result);
        // })


        app.get('/cart', async (req, res) => {
            const email = req.query.email;
            const query ={email: email}
            
            const result = await cartCollection.find(query).toArray();
            res.send(result);
        })

        app.post('/cart', async(req,res)=>{
            const cartItem = req.body;
            const existingCartItem = await cartCollection.findOne({ proId: cartItem.proId, email: cartItem.email });
            if (existingCartItem) {
                res.status(400).send({ message: 'Product already exists in the cart.' });
            } else {
                const result = await cartCollection.insertOne(cartItem);
                res.send(result);}
        })


        // app.post('/comment', async (req, res) => {
        //     try {
        //       const { id, comment } = req.body;
        //       const result = await productCollection.updateOne(
        //         { _id: new ObjectId(id) },
        //         { $push: { comments: comment } }
        //       );
        //       res.send({ message: 'Comment added successfully' });
        //     } catch (error) {
        //       console.error('Error adding comment:', error);
        //       res.status(500).send({ message: 'Internal server error' });
        //     }
        //   });
        
          // Endpoint to get all comments for a product
        //   app.get('/comments/:id', async (req, res) => {
        //     try {
        //       const { id } = req.params;
        //       const product = await productCollection.findOne({ _id: new ObjectId(id) });
        //       res.send(product.comments);
        //     } catch (error) {
        //       console.error('Error fetching comments:', error);
        //       res.status(500).send({ message: 'Internal server error' });
        //     }
        //   });
        
      
        
    //     app.get('/comments/:id', async (req, res) => {
    //         const id = req.params.id;
    //         const cart = await productCollection.findOne({ _id: new ObjectId(id) });
        
    //         if (cart) {
    //             res.send({ comments: cart.comments || [] });
    //         } else {
    //             res.status(404).send({ message: 'Cart item not found' });
    //         }
    //     });

    //     app.put('/cartCommentUpdate/:id',  async(req, res)=>{
    //         const id = req.params.id
    //    const comment = req.query.comment
    //    const cart = await productCollection.findOne({_id: new ObjectId(id)})
    //    console.log(cart);
    //    if (cart) {
    //     if(cart.reports){
    //       updatedQuery = {
    //         $push: {comments: comment}
    //       }
    //     }else{
    //       updatedQuery = {
    //         $set: {comments: [comment]}
    //       }
    //     }
    //   }
       
    //    const result = await productCollection.updateOne({_id: new ObjectId(id)}, updatedQuery);
    //    res.send(result);
    //   })

    app.get('/cartComments/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const cart = await productCollection.findOne({_id: new ObjectId(id)});
            if (cart) {
                res.json(cart.comments || []);
            } else {
                res.status(404).json({ message: 'Cart not found' });
            }
        } catch (error) {
            console.error('Error fetching cart comments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

      app.put('/cartCommentUpdate/:id', async (req, res) => {
        try {
            const id = req.params.id;
            const comment = req.query.comment;
            let updatedQuery;
            const cart = await productCollection.findOne({_id: new ObjectId(id)});
            if (cart) {
                if (cart.comments && cart.comments.length > 0) {
                    updatedQuery = {
                        $push: {comments: comment}
                    };
                } else {
                    updatedQuery = {
                        $set: {comments: [comment]}
                    };
                }
                const result = await productCollection.updateOne({_id: new ObjectId(id)}, updatedQuery);
                res.json(result);
            } else {
                res.status(404).json({ message: 'Cart not found' });
            }
        } catch (error) {
            console.error('Error updating cart comments:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    });

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
        // app.delete('/cart', async (req, res) => {
        //     const data = req.body;
        //         const result = await cartCollection.deleteMany(data);
        //         console.log( result.deletedCount );
        //         res.send(result);
        // })
           
    
        app.delete('/cart', async (req, res) => {
            const data = req.body;
            console.log(data);
            const query = { prodId: data.id };
            const filter = {
                $and: [
                    { email: data.email },
                    { prodId: data.id }
                ]
            }
            const result = await cartCollection.deleteMany(filter);
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