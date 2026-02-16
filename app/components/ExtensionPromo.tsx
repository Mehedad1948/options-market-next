'use client'; // Required for Framer Motion

import React from 'react';
import Image from 'next/image';
import { Chrome, Zap, Shield, MousePointer2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const ExtensionPromo = () => {
  const extensionUrl = "https://chromewebstore.google.com/detail/optionyar-%D8%A2%D9%BE%D8%B4%D9%86%E2%80%8C%DB%8C%D8%A7%D8%B1/mnpfikomilcgieconkiiodfcpkjaclcb";

  // --- Animation Variants ---
  
  // Animation for the text block (slides in from right)
  const textVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.8, ease: "easeOut" } 
    }
  };

  // Animation for the image block (scales up and fades in)
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9, x: -50 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      x: 0,
      transition: { duration: 0.8, ease: "easeOut", delay: 0.2 } 
    }
  };

  // Container for features to control the staggering (scatter effect)
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15, // Delay between each item appearing
        delayChildren: 0.3 // Wait a bit before starting
      }
    }
  };

  // Animation for individual feature items (pop up)
  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100 } 
    }
  };

  return (
    <section className="relative py-24 overflow-hidden dir-rtl bg-white dark:bg-slate-950/50">
      
      {/* --- Background Ambient Light --- */}
      <div className='absolute inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-slate-100/50 dark:bg-slate-900/20 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3' />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          {/* --- RIGHT: Content (Text Side) --- */}
          <motion.div 
            className="w-full lg:w-3/5 text-right order-1"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }} // Triggers when 30% visible
            variants={textVariants}
          >
            
            {/* The Slogan */}
            <h2 className="text-3xl md:text-5xl font-black leading-tight text-slate-900 dark:text-white mb-6 tracking-tight">
              سیگنال‌های هوشمند،
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500 relative">
                درست در قلب پلتفرم معاملاتی
              </span>
            </h2>

            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10 max-w-2xl">
              تجربه معامله‌گری خود را ارتقا دهید. افزونه آپشن‌یار تحلیل‌های پیشرفته و سیگنال‌های لحظه‌ای را بدون هیچ فاصله‌ای، مستقیماً روی پنل کارگزاری شما نمایش می‌دهد.
            </p>

            {/* Minimal Feature List with Scatter Animation */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-10"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              {[
                { icon: Zap, text: "سیگنال خرید و فروش آنی" },
                { icon: Shield, text: "محاسبه‌گر ریسک هوشمند" },
                { icon: MousePointer2, text: "بدون نیاز به کلیک اضافه" },
                { icon: Chrome, text: "سازگار با تمام کارگزاری‌ها" },
              ].map((feature, idx) => (
                <motion.div 
                  key={idx} 
                  className="flex items-center gap-3 group"
                  variants={itemVariants}
                >
                  <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-50 dark:group-hover:bg-amber-900/20 transition-colors duration-300">
                    <feature.icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Classy CTA Button */}
            <motion.div 
              className="flex justify-start"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <a
                href={extensionUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-white transition-all duration-300 bg-amber-600  rounded-xl hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5"
              >
                <Chrome className="w-4 h-4 ml-2" />
                <span>نصب رایگان افزونه</span>
              </a>
            </motion.div>
          </motion.div>

          {/* --- LEFT: Image (Visual Side) --- */}
          <motion.div 
            className="w-full lg:w-2/5 flex justify-center lg:justify-center order-2 mt-8 lg:mt-0 relative"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={imageVariants}
          >
            
            {/* The "Amberish Shady Glow" */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-amber-500/15 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10">
               {/* Image Wrapper */}
               <div className="relative rounded-[20px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-black/50">
                  <Image
                    src="/extension.png"
                    width={450}
                    height={700}
                    alt="OptionYar Extension Preview"
                    className="w-full mx-auto h-auto object-cover max-w-[280px] sm:max-w-[320px] lg:max-w-[300px]"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Subtle Glass Overlay for Polish */}
                  <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/10 rounded-[20px] pointer-events-none" />
               </div>
               
               {/* Abstract floating decor for balance - Animated Pop in */}
               <motion.div 
                 className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-tr from-slate-100 to-white dark:from-slate-800 dark:to-slate-700 rounded-2xl shadow-lg flex items-center justify-center border border-slate-50 dark:border-slate-600 hidden sm:flex"
                 initial={{ scale: 0, opacity: 0 }}
                 whileInView={{ scale: 1, opacity: 1 }}
                 transition={{ delay: 0.8, type: "spring" }}
                 viewport={{ once: true }}
               >
                  <div className="text-center animate-pulse-slow">
                    <span className="block text-xs text-slate-400 font-medium">Status</span>
                    <span className="block text-sm font-bold animate-pulse text-emerald-500">Active</span>
                  </div>
               </motion.div>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default ExtensionPromo;
