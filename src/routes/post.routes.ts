// External Dependencies
import express, { Request, Response } from "express";
import postModel  from "../models/post.schema";


// Global Config
export const postRouter = express.Router();

// 怎么写的比 Java 还难受

postRouter.use(express.json());

// GET
postRouter.get("/", async (_req: Request, res: Response) => {
    try {
       const post = await postModel.find({})
        res.status(200).send(post);
    } catch (error: any) {
        res.status(500).send(error.message);
    }
});

// GET  
postRouter.get("/:id", async (req: Request, res: Response) => {
    const {id} = req.params;
    try {
        
        const query = { _id: id };
        const post = await postModel.findOne(query);

        if (post) {
            res.status(200).send(post);
        }
    } catch (error) {
        res.status(404).send(`Unable to find matching document with id: ${id}`);
    }
});

//POST 
postRouter.post("/", async (req: Request, res: Response) => {
    try {
        const {text} = req.body;
        const result = await postModel.create({text});

        result
            ? res.status(201).send(`Successfully created a new post with id ${result}`)
            : res.status(500).send("Failed to create a new post.");
    } catch (error: any) {
        console.error(error);
        res.status(400).send(error.message);
    }
});

// PUT
postRouter.put("/:id", async (req: Request, res: Response) => {
    const {id} = req.params;
    const {text} = req.body;

    try {
        const query = { _id: id };
      
        const result = await postModel.updateOne(query, {text});

        result
            ? res.status(200).send(`Successfully updated post with id ${id}`)
            : res.status(304).send(`Post with id: ${id} not updated`);
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});

// DELETE
postRouter.delete("/:id", async (req: Request, res: Response) => {
    const {id} = req.params;

    try {
        const query = { _id: id };
        const result = await postModel.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(202).send(`Successfully removed post with id ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove post with id ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`post with id ${id} does not exist`);
        }
    } catch (error: any) {
        console.error(error.message);
        res.status(400).send(error.message);
    }
});


