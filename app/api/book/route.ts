import {auth, currentUser} from "@clerk/nextjs/server";
import { connectToDatabase } from "@/lib/connectToDB";
import Book from "@/models/book";


export async function POST(req: Request){
    try{
        const {isAuthenticated} = await auth();
        if(!isAuthenticated){
                return Response.json({error: "Unauthorised"}, {status: 401});
        }

        await connectToDatabase
        const user = await currentUser();

        const formData = await req.formData();

        const title = formData.get("title")?.toString() || "";
        const author = formData.get("author")?.toString() || "";
        const genre = formData.get("genre")?.toString() || "";
        const description = formData.get("description")?.toString() || "";
        const publishedYearRaw = formData.get("year")?.toString() || "";
        const year = publishedYearRaw 
            ? Number(publishedYearRaw) 
            : undefined;
        
        const book = await Book.create({
            title,
            author,
            cover:"",
            genre,
            description,
            year,
            addedBy: {id: user?.id, firstName: user?.firstName}
        });

        return Response.json({book}, {status: 201 });
    }catch(error){
        console.error("Error creating book: ", error);
        return Response.json({error: "Failed to create book"}, {status: 500});

    }
}