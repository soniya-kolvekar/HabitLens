'use client';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import useHabitStore from '../../store/useHabitStore';

export default function ResetButton() {
    const { setResetModalOpen } = useHabitStore();

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setResetModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500/80 to-purple-500/80 hover:from-pink-500 hover:to-purple-500 text-white rounded-full shadow-lg backdrop-blur-sm border border-white/20 transition-all group"
        >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-semibold">Reset My Life</span>
        </motion.button>
    );
}
