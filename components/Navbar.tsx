"use client";

import Link from 'next/link';
import { Button } from './ui/button';
import { BookKey, BookOpen, Compass, Plus, Library, ShoppingCart } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import axios from 'axios';

const Navbar = () => {
    const pathname = usePathname();

    // Cart state
    const [cartCount, setCartCount] = useState(0);
    const [showToast, setShowToast] = useState(false);

   
    function isActive(path: string) {
        return pathname === path;
    }

    return (
        <nav className="border-b border-[#DAD3C8] bg-[#FCFAF7]/50 backdrop-blur-xs h-17.5 sticky top-0 z-50 px-4">
            <div className="mx-auto">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="flex items-center gap-2"> 
                        <BookKey className="w-6 h-6"/>
                        <span className="text-xl font-bold text-foreground">E-books</span>
                    </Link>

                    <div className="flex items-center gap-2 relative">
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
                            variant={isActive("/add-book") ? "default" : "ghost"}
                            size="sm"
                            asChild
                        >
                            <Link href="/add-book">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Add book</span>
                            </Link>
                        </Button>                        

                        <Button                        
                            variant={isActive("/library") ? "default" : "ghost"}
                            size="sm"
                            asChild
                        >
                            <Link href="/library">
                                <Library className="w-4 h-4" />
                                <span className="hidden sm:inline">Library</span>
                            </Link>
                        </Button>  

                        {/* Cart Icon */}
                        <Button
                            variant={isActive("/cart") ? "default" : "ghost"}
                            size="sm"
                            asChild
                        >
                            <Link href="/cart" className="relative flex items-center">
                                <ShoppingCart className="w-4 h-4" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-2 text-xs bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                                <span className="hidden sm:inline ml-1">Cart</span>
                            </Link>
                        </Button>

                        {/* Toast popup */}
                        {showToast && (
                            <div className="absolute top-12 right-0 bg-black text-white px-3 py-1 rounded shadow-md text-sm animate-slide-down">
                                Added to cart!
                            </div>
                        )}

                        <SignedOut>
                            <SignInButton>
                                <Button variant={"outline"} size={"sm"}>
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
    );
}

export default Navbar;
