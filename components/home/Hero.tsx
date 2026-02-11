import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="bg-white border-b border-[#DAD3C8]">
      <div className="container mx-auto px-6 py-16 lg:py-28">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-5xl md:text-5xl font-bold text-[#1A1A1A] uppercase leading-15">
              Welcome to a Place of Knowledge
            </h1>

            <p className="text-lg md:text-xl text-[#5E544D] leading-relaxed">
              Explore a curated selection of eBooks designed for the modern
              developer and lifelong learner. Simple access to the foundations
              of engineering, design, and leadership.
            </p>

            <div className="flex items-center gap-4 pt-4">
              <Button
                asChild
                size="lg"
                className="rounded-full text-white transition-all"
              >
                <Link href="/explore" className="flex items-center gap-2">
                  Explore the Library <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative w-full aspect-square items-center lg:aspect-video rounded-2xl overflow-hidden shadow-sm">
            <img
              src="/assets/book.png"
              alt="Collection of professional books"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
          </div>

          
        </div>
      </div>
    </section>
  );
};

export default Hero;
