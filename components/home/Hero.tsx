import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";


const Hero = () =>{
    return (
    <section className="border-b border-[#DAD3C8]">
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl mx-auto text-center space-y-4">
                <h1 className="text-7xl! md:text-6xl font-bold text-foreground" >Welcome to Zbooks</h1>
                <p className="text-lg text-[#847062] leading-relaxed">Power your most ambitious projects with the ZBook workstation collection. Built for engineers, developers, and data scientists, these machines offer the expandability and thermal efficiency required for sustained peak performance.
                </p>
                <Button>
                    <Link href="/explore-more">
                    <span>Explore more book</span>
                    <ArrowRight className="w-4 h-4 inline"/>
                    </Link>
                </Button>
            </div>
        </div>
    </section>
    );
}

export default Hero;