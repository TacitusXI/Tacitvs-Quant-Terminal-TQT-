"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useUIStore } from "@/lib/store";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const { setActivePage } = useUIStore();

  useEffect(() => {
    // Redirect to OPS page by default
    setActivePage("ops");
    router.push("/OPS");
  }, [router, setActivePage]);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 holographic opacity-30" />
      
      <motion.div 
        className="text-center relative z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo with pulsing glow */}
        <motion.div
          className="flex items-center justify-center mb-8"
          animate={{
            filter: [
              "drop-shadow(0 0 20px rgba(98, 67, 221, 0.6))",
              "drop-shadow(0 0 40px rgba(45, 142, 223, 0.8))",
              "drop-shadow(0 0 20px rgba(98, 67, 221, 0.6))",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/logo.webp"
            alt="Tacitus Quant Terminal"
            width={200}
            height={200}
            className="rounded-2xl"
            priority
          />
        </motion.div>
        
        <motion.div 
          className="text-6xl font-black cyber-title mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          TQT
        </motion.div>
        
        <motion.div 
          className="text-2xl font-bold cyber-text mb-12 tracking-widest"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          TACITUS QUANT TERMINAL
        </motion.div>
        
        <motion.div 
          className="matrix-text text-sm mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          &gt; INITIALIZING QUANTUM TRADING SYSTEM...
        </motion.div>
        
        <motion.div 
          className="flex items-center justify-center gap-2 text-xs text-[#6243DD]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-[#6243DD] animate-pulse" />
          <span className="inline-block w-2 h-2 rounded-full bg-[#2D8EDF] animate-pulse" style={{ animationDelay: '0.2s' }} />
          <span className="inline-block w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" style={{ animationDelay: '0.4s' }} />
        </motion.div>
      </motion.div>
    </div>
  );
}
