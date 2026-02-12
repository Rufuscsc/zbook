import AddBookform from "@/components/add-book/AddBookForm";

const AddBook = ()=>{
    return(
        <div className="py-5 min-h-screen px-4 bg-background">
            <h1 className="text-5xl! md:text-3xl font-bold text-center mx-auto text-foreground">Add a New Book</h1>
            <p className="text-lg text-[#847062] text-center leading-relaxed" >Share a literary treasure with our community</p>

            {/*Form*/}
            <AddBookform/>
        </div>
    );
}

export default AddBook;