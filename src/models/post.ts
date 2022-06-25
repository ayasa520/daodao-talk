import { ObjectId } from "mongodb";

export default interface Post {
    text: string;
    time: Date;
    _id?: ObjectId;
}
