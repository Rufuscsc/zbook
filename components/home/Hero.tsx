"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const Hero = () => {
  return (
    <section className="bg-white border-b border-[#DAD3C8]">
      <div className="container mx-auto px-6 py-16 lg:py-28">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          <div className="space-y-4 max-w-2xl">
            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="text-5xl md:text-5xl font-bold text-[#1A1A1A] uppercase leading-15"
            >
              Welcome to a Place of Knowledge
            </motion.h1>

            <motion.p
              initial={{ y: -30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
              className="text-lg md:text-xl text-[#5E544D] leading-relaxed"
            >
              Explore a curated selection of eBooks designed for the modern
              developer and lifelong learner. Simple access to the foundations
              of engineering, design, and leadership.
            </motion.p>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="flex items-center gap-4 pt-4"
            >
              <Button
                asChild
                size="lg"
                className="rounded-full text-white transition-all"
              >
                <Link href="/explore" className="flex items-center gap-2">
                  Explore the Library <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            viewport={{ once: true }}
            className="relative w-full aspect-square items-center lg:aspect-video rounded-2xl overflow-hidden shadow-sm"
          >
            <img
              src="/assets/book.png"
              alt="Collection of professional books"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/5 rounded-2xl" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
