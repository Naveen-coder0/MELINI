import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

const ScrollProgressBar = () => {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

    return (
        <motion.div
            style={{ scaleX, transformOrigin: '0%' }}
            className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-primary"
        />
    );
};

export default ScrollProgressBar;
