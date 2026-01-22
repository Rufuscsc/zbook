"use client"

import Link from 'next/link';
import { Button } from './ui/button';
import { BookKey, BookOpen, Compass, Plus, Library } from 'lucide-react';
import {usePathname} from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';

const Navbar = () =>{
    const pathname = usePathname();

    function isActive(path: string){
        if(pathname === path){
            return true;
        }
        return false;
    }
    return(
        <nav className="border-b border-[#DAD3C8] bg-[#FCFAF7]/50 backdrop-blur-xs sticky top-0 z-50 px-4">
            <div className="mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2"> 
                        <BookKey className="w-6 h-6"/>
                        <span className="text-xl font-bold text-foreground">Zbooks</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <Button
                        variant={isActive("/") ? "default" : "ghost"}
                        size="sm"
                        asChild
                        >
                            <Link href="/" className="gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">Feed</span>
                            </Link>
                        </Button>
                        <Button
                        variant={isActive("/explore") ? "default" : "ghost"}
                        size="sm"
                        asChild
                        >
                            <Link href="/explore">
                            <Compass className="w-4 h-4" />
                            <span className="hidden sm:inline">Explore</span>
                            </Link>
                        </Button>                        
                        <Button                         
                        variant={isActive("/addbook") ? "default" : "ghost"}
                        size="sm"
                        asChild>
                            <Link href="/addbook">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add book</span>
                            </Link>
                        </Button>                        
                        <Button                        
                        variant={isActive("/library") ? "default" : "ghost"}
                        size="sm"
                        asChild>
                            <Link href="/library">
                            <Library className="w-4 h-4" />
                            <span className="hidden sm:inline">Library</span>
                            </Link>
                        </Button>  

                        <SignedOut>
                            <SignInButton>
                                <Button                         
                                variant={"outline"}
                                size={"sm"}
                                >
                                    <Link href="/signin">Sign In</Link>
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton />
                        </SignedIn>                      
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar;