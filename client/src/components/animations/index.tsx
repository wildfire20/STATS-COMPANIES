import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, ReactNode } from "react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

interface FadeInUpProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  duration?: number;
}

export function FadeInUp({ children, delay = 0, className = "", duration = 0.8 }: FadeInUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  speed?: number;
}

export function ParallaxImage({ src, alt, className = "", speed = 0.5 }: ParallaxImageProps) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [-30 * speed, 30 * speed]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.05, 1]);
  
  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        style={{ y, scale }}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

interface RevealSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function RevealSection({ children, className = "", delay = 0 }: RevealSectionProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ProductCardAnimationProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ProductCardAnimation({ children, className = "", delay = 0 }: ProductCardAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ImageHoverZoomProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function ImageHoverZoom({ children, className = "", scale = 1.08 }: ImageHoverZoomProps) {
  return (
    <motion.div
      className={`overflow-hidden ${className}`}
      whileHover="hover"
    >
      <motion.div
        variants={{
          hover: { scale, transition: { duration: 0.6, ease: "easeOut" } }
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

interface GalleryItemProps {
  children: ReactNode;
  className?: string;
  index?: number;
}

export function GalleryItem({ children, className = "", index = 0 }: GalleryItemProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 }}
      transition={{ 
        duration: 0.7, 
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      whileHover={{ 
        y: -12,
        scale: 1.02,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
}

export function FloatingElement({ children, className = "", amplitude = 10, duration = 4 }: FloatingElementProps) {
  return (
    <motion.div
      animate={{
        y: [-amplitude/2, amplitude/2, -amplitude/2],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  className?: string;
  delay?: number;
}

export function SlideIn({ children, direction = "up", className = "", delay = 0 }: SlideInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  
  const variants = {
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
    up: { x: 0, y: 30 },
    down: { x: 0, y: -30 }
  };
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, ...variants[direction] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...variants[direction] }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ModalAnimationProps {
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalAnimation({ children, isOpen, onClose }: ModalAnimationProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export { fadeInUp, fadeIn, staggerContainer };
