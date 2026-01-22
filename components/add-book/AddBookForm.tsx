"use client"

import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import React, {useState} from "react";

const AddBookform = ()=>{
    const [coverPreview, setCoverPreview] = useState(null);
    return(
        <Card className="p-8 max-w-3xl mx-auto my-3">
            <form>
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-semibold text-lg">
                        Book Title *
                    </Label>
                    <Input id="title" name="title" placeholder="Enter the book title" required className="h-12 textbase!"/>
                </div>

                <div className="space-y-2 my-7">
                    <Label htmlFor="author" className="font-semibold text-lg">
                        Author *
                    </Label>
                    <Input id="author" name="author" placeholder="Enter Author name" required className="h-12 textbase!"/>
                </div>

                <div className="space-y-2">
                </div>
            </form>
        </Card>
    );
}

export default AddBookform;