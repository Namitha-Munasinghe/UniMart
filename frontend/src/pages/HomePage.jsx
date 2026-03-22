import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Store,
  ShieldCheck,
  Users,
  ArrowRight,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

const HomePage = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-950 text-white overflow-hidden">
      {/* ambient */}
      <div
        className="pointer-events-none fixed inset-0 opacity-90"
        aria-hidden
      >
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-violet-600/30 blur-3xl" />
        <div className="absolute top-1/3 right-0 h-[28rem] w-[28rem] rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-fuchsia-600/20 blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-20 md:pt-20 md:pb-28">
        <motion.div
          custom={0}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-violet-200 backdrop-blur-sm"
        >
          <Sparkles className="h-4 w-4 text-violet-300" />
          Campus marketplace for students
        </motion.div>

        <motion.h1
          custom={1}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-8 text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1]"
        >
          <span className="bg-gradient-to-r from-white via-violet-100 to-indigo-200 bg-clip-text text-transparent">
            Buy, sell &amp; connect
          </span>
          <br />
          <span className="text-violet-300/95">on UniMart</span>
        </motion.h1>

        <motion.p
          custom={2}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-6 max-w-xl text-lg text-violet-200/80 leading-relaxed"
        >
          Electronics, books, rooms, services—everything in one trusted
          university hub. Browse by category or list your own items in
          minutes.
        </motion.p>

        <motion.div
          custom={3}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-10 flex flex-wrap gap-4"
        >
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-glow transition hover:from-violet-400 hover:to-indigo-500 hover:shadow-glow-sm"
          >
            <Store className="h-5 w-5" />
            Shop
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10 hover:border-white/30"
          >
            My profile
          </Link>
        </motion.div>

        <motion.div
          custom={4}
          initial="hidden"
          animate="show"
          variants={fadeUp}
          className="mt-20 grid gap-5 sm:grid-cols-3"
        >
          {[
            {
              icon: Store,
              title: "Category browse",
              desc: "Filter listings the way your campus shops.",
            },
            {
              icon: ShieldCheck,
              title: "Student-first",
              desc: "Meet sellers on campus—no rushed checkout pressure.",
            },
            {
              icon: Users,
              title: "Community",
              desc: "Contact sellers and schedule meets when you’re ready.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-md transition hover:border-violet-400/30 hover:bg-white/[0.09]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/20 text-violet-200">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm text-violet-200/70 leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;
