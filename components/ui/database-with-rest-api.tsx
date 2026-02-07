"use client";

import React from "react";
import { motion } from "framer-motion";
import { Folder, HeartHandshakeIcon, SparklesIcon, Database, Server, ArrowRight } from "lucide-react"; // Added Database/Server for context if needed

interface DatabaseWithRestApiProps {
    className?: string;
    circleText?: string;
    badgeTexts?: {
        first: string;
        second: string;
        third: string;
        fourth: string;
    };
    buttonTexts?: {
        first: string;
        second: string;
    };
    title?: string;
    lightColor?: string;
}

const DatabaseWithRestApi = ({
    className,
    circleText,
    badgeTexts,
    buttonTexts,
    title,
    lightColor = "#a855f7", // Default to purple-500
}: DatabaseWithRestApiProps) => {

    // Inline utility for class names since lib/utils is missing
    const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

    return (
        <div
            className={cn(
                "relative flex h-[350px] w-full max-w-[500px] flex-col items-center select-none",
                className
            )}
        >
            {/* SVG Paths  */}
            <svg
                className="h-full sm:w-full text-slate-600"
                width="100%"
                height="100%"
                viewBox="0 0 200 100"
            >
                <g
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="0.4"
                    strokeDasharray="100 100"
                    pathLength="100"
                >
                    <path d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10" />
                    <path d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10" />
                    <path d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10" />
                    <path d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10" />
                    {/* Animation For Path Starting */}
                    <animate
                        attributeName="stroke-dashoffset"
                        from="100"
                        to="0"
                        dur="2s"
                        fill="freeze"
                        calcMode="spline"
                        keySplines="0.25,0.1,0.5,1"
                        keyTimes="0; 1"
                    />
                </g>
                {/* Lights - Using Purple Gradient definied in defs */}
                <g mask="url(#db-mask-1)">
                    <circle
                        className="database db-light-1"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-purple-grad)"
                    />
                </g>
                <g mask="url(#db-mask-2)">
                    <circle
                        className="database db-light-2"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-purple-grad)"
                    />
                </g>
                <g mask="url(#db-mask-3)">
                    <circle
                        className="database db-light-3"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-purple-grad)"
                    />
                </g>
                <g mask="url(#db-mask-4)">
                    <circle
                        className="database db-light-4"
                        cx="0"
                        cy="0"
                        r="12"
                        fill="url(#db-purple-grad)"
                    />
                </g>
                {/* Buttons */}
                <g stroke="currentColor" fill="none" strokeWidth="0.4">
                    {/* First Button - ENCRYPT */}
                    <g>
                        <rect
                            fill="#1e293b" // slate-800
                            x="14"
                            y="5"
                            width="34"
                            height="10"
                            rx="5"
                        ></rect>
                        <DatabaseIcon x="18" y="7.5"></DatabaseIcon>
                        <text
                            x="28"
                            y="12"
                            fill="white"
                            stroke="none"
                            fontSize="4"
                            fontWeight="500"
                        >
                            {badgeTexts?.first || "ENCRYPT"}
                        </text>
                    </g>
                    {/* Second Button - HASH */}
                    <g>
                        <rect
                            fill="#1e293b"
                            x="60"
                            y="5"
                            width="34"
                            height="10"
                            rx="5"
                        ></rect>
                        <DatabaseIcon x="64" y="7.5"></DatabaseIcon>
                        <text
                            x="74"
                            y="12"
                            fill="white"
                            stroke="none"
                            fontSize="4"
                            fontWeight="500"
                        >
                            {badgeTexts?.second || "HASH"}
                        </text>
                    </g>
                    {/* Third Button - SALT */}
                    <g>
                        <rect
                            fill="#1e293b"
                            x="108"
                            y="5"
                            width="34"
                            height="10"
                            rx="5"
                        ></rect>
                        <DatabaseIcon x="112" y="7.5"></DatabaseIcon>
                        <text
                            x="122"
                            y="12"
                            fill="white"
                            stroke="none"
                            fontSize="4"
                            fontWeight="500"
                        >
                            {badgeTexts?.third || "SALT"}
                        </text>
                    </g>
                    {/* Fourth Button - STORE */}
                    <g>
                        <rect
                            fill="#1e293b"
                            x="150"
                            y="5"
                            width="40"
                            height="10"
                            rx="5"
                        ></rect>
                        <DatabaseIcon x="154" y="7.5"></DatabaseIcon>
                        <text
                            x="165"
                            y="12"
                            fill="white"
                            stroke="none"
                            fontSize="4"
                            fontWeight="500"
                        >
                            {badgeTexts?.fourth || "STORE"}
                        </text>
                    </g>
                </g>
                <defs>
                    {/* 1 */}
                    <mask id="db-mask-1">
                        <path
                            d="M 31 10 v 15 q 0 5 5 5 h 59 q 5 0 5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 2 */}
                    <mask id="db-mask-2">
                        <path
                            d="M 77 10 v 10 q 0 5 5 5 h 13 q 5 0 5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 3 */}
                    <mask id="db-mask-3">
                        <path
                            d="M 124 10 v 10 q 0 5 -5 5 h -14 q -5 0 -5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* 4 */}
                    <mask id="db-mask-4">
                        <path
                            d="M 170 10 v 15 q 0 5 -5 5 h -60 q -5 0 -5 5 v 10"
                            strokeWidth="0.5"
                            stroke="white"
                        />
                    </mask>
                    {/* Purple Grad */}
                    <radialGradient id="db-purple-grad" fx="1">
                        <stop offset="0%" stopColor={lightColor} />
                        <stop offset="100%" stopColor="transparent" />
                    </radialGradient>
                </defs>
            </svg>
            {/* Main Box */}
            <div className="absolute bottom-10 flex w-full flex-col items-center">
                {/* bottom shadow */}
                <div className="absolute -bottom-4 h-[100px] w-[62%] rounded-lg bg-purple-500/20 blur-2xl" />

                {/* box title */}
                <div className="absolute -top-3 z-20 flex items-center justify-center rounded-full border border-purple-500/30 bg-black/40 backdrop-blur-md px-3 py-1 sm:-top-4 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                    <SparklesIcon className="size-3 text-purple-300" />
                    <span className="ml-2 text-[10px] text-purple-100 font-medium tracking-wide">
                        {title ? title : "ZERO KNOWLEDGE"}
                    </span>
                </div>

                {/* box outter circle */}
                <div className="absolute -bottom-8 z-30 grid h-[60px] w-[60px] place-items-center rounded-full border border-purple-500/40 bg-black/60 backdrop-blur-xl font-bold text-xs text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                    {circleText ? circleText : "ZK"}
                </div>

                {/* Rotating Dashed Circle 1 */}
                <motion.div
                    className="absolute -bottom-[42px] z-20 h-[84px] w-[84px] rounded-full border border-dashed border-purple-500/30"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                {/* Rotating Dashed Circle 2 (Opposite) */}
                <motion.div
                    className="absolute -bottom-[50px] z-20 h-[100px] w-[100px] rounded-full border border-dashed border-purple-500/20"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {/* Orbiting Dot 1 */}
                <motion.div
                    className="absolute -bottom-[42px] z-20 h-[84px] w-[84px]"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[2px] w-1.5 h-1.5 bg-purple-400 rounded-full shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                </motion.div>

                {/* Orbiting Dot 2 */}
                <motion.div
                    className="absolute -bottom-[50px] z-20 h-[100px] w-[100px]"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                >
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[2px] w-1 h-1 bg-white rounded-full shadow-[0_0_5px_rgba(255,255,255,0.8)]"></div>
                </motion.div>

                {/* box content */}
                <div className="relative z-10 flex h-[150px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-2xl">
                    {/* Badges */}
                    <div className="absolute bottom-8 left-12 z-10 h-7 rounded-full bg-black/40 px-3 text-xs border border-white/10 flex items-center gap-2 text-slate-300 backdrop-blur-md">
                        <HeartHandshakeIcon className="size-3 text-purple-400" />
                        <span className="font-mono">{buttonTexts?.first || "SecureVault"}</span>
                    </div>
                    <div className="absolute right-16 z-10 hidden h-7 rounded-full bg-black/40 px-3 text-xs sm:flex border border-white/10 items-center gap-2 text-slate-300 backdrop-blur-md">
                        <Folder className="size-3 text-indigo-400" />
                        <span className="font-mono">{buttonTexts?.second || "Encrypted_DB"}</span>
                    </div>

                    {/* Circles - Ripples */}
                    <motion.div
                        className="absolute -bottom-14 h-[100px] w-[100px] rounded-full border border-purple-500/30 bg-purple-600/10"
                        animate={{
                            scale: [0.95, 1.05, 0.95],
                            opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div
                        className="absolute -bottom-20 h-[145px] w-[145px] rounded-full border border-purple-500/20 bg-purple-600/5"
                        animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                    />
                    <motion.div
                        className="absolute -bottom-[100px] h-[190px] w-[190px] rounded-full border border-purple-500/10 bg-transparent"
                        animate={{
                            scale: [1, 1.15, 1],
                            opacity: [0.1, 0.3, 0.1],
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </div>
            </div>
        </div>
    );
};

export default DatabaseWithRestApi;

const DatabaseIcon = ({ x = "0", y = "0" }: { x: string; y: string }) => {
    return (
        <svg
            x={x}
            y={y}
            xmlns="http://www.w3.org/2000/svg"
            width="5"
            height="5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M3 5V19A9 3 0 0 0 21 19V5" />
            <path d="M3 12A9 3 0 0 0 21 12" />
        </svg>
    );
};
