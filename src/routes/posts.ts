// External Dependencies
import express, { Request, Response } from "express";
import {  Collection, ObjectId, OptionalId } from "mongodb";
import { collections } from "../service/database";
import Post from "../models/post";


// Global Config
export const postRouter = express.Router();

// 怎么写的比 Java 还难受

postRouter.use(express.json());

// GET
postRouter.get("/", async (_req: Request, res: Response) => {
    const posts: Collection<OptionalId<Post>> = collections.posts as Collection<OptionalId<Post>>
    try {
       const post =
       (await posts.find({}).toArray()) as Post[]
        res.status(200).send(post);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// GET  
postRouter.get("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;

    const posts: Collection<OptionalId<Post>> = collections.posts as Collection<OptionalId<Post>>
    try {
        
        const query = { _id: new ObjectId(id) };
        const post = (await posts.findOne(query)) as Post;

        if (post) {
            res.status(200).send(post);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${req.params.id}`);
    }
});

//POST 
postRouter.post("/", async (req: Request, res: Response) => {
    const posts: Collection<OptionalId<Post>> = collections.posts as Collection<OptionalId<Post>>
    try {
        const newPost = {"text": req.body.text, "time":new Date()} as Post;
        const result = await posts.insertOne(newPost);

        result
            ? res.status(201).send(`Successfully created a new game with id ${result.insertedId}`)
            : res.status(500).send("Failed to create a new game.");
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

// PUT
postRouter.put("/:id", async (req: Request, res: Response) => {
    const posts: Collection<OptionalId<Post>> = collections.posts as Collection<OptionalId<Post>>
    const id = req?.params?.id;

    try {
        const updatedPost: Post = req.body as Post;
        const query = { _id: new ObjectId(id) };
      
        const result = await posts.updateOne(query, { $set: updatedPost });

        result
            ? res.status(200).send(`Successfully updated game with id ${id}`)
            : res.status(304).send(`Post with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

// DELETE
postRouter.delete("/:id", async (req: Request, res: Response) => {
    const id = req?.params?.id;
    const posts: Collection<OptionalId<Post>> = collections.posts as Collection<OptionalId<Post>>

    try {
        const query = { _id: new ObjectId(id) };
        const result = await posts.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed game with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove game with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Game with id ${id} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});


