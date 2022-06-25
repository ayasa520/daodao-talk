// External Dependencies
import * as mongoDB from "mongodb";
import Post from "../models/post";

// Global Variables
export const collections: { posts?: mongoDB.Collection<mongoDB.OptionalId<Post>> } = {}

// Initialize Connection
export async function connectToDatabase () {
   const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING!);
           
   await client.connect();
       
   const db: mongoDB.Db = client.db(process.env.DB_NAME!);
  
   const postsCollection: mongoDB.Collection<mongoDB.OptionalId<Post>> = db.collection<mongoDB.OptionalId<Post>>(process.env.COLLECTION_NAME!);

   collections.posts = postsCollection;

   
   console.log(`Successfully connected to database: ${db.databaseName} and collection: ${postsCollection.collectionName}`);
}

