import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  MessageCircle,
  Paperclip,
  Send,
  ShieldCheck,
} from "lucide-react";

const buyerStats = [
  { label: "Upcoming Meetings", value: "2", valueClassName: "text-indigo-600" },
  { label: "Completed", value: "0", valueClassName: "text-emerald-600" },
  { label: "Pending Requests", value: "1", valueClassName: "text-amber-500" },
];

const buyerTabs = ["Schedule", "My Meetings", "Chat", "History"];

const calendarDays = [
  { value: "23", muted: true },
  { value: "24", muted: true },
  { value: "25", muted: true },
  { value: "26", muted: true },
  { value: "27", muted: true },
  { value: "28", muted: true },
  { value: "1" },
  { value: "2" },
  { value: "3" },
  { value: "4", meeting: true },
  { value: "5" },
  { value: "6", meeting: true },
  { value: "7" },
  { value: "8" },
  { value: "9" },
  { value: "10", meeting: true },
  { value: "11" },
  { value: "12" },
  { value: "13" },
  { value: "14", meeting: true },
  { value: "15" },
  { value: "16" },
  { value: "17" },
  { value: "18", meeting: true },
  { value: "19" },
  { value: "20" },
  { value: "21", today: true, meeting: true },
  { value: "22" },
  { value: "23" },
  { value: "24", selected: true },
  { value: "25" },
  { value: "26" },
  { value: "27" },
  { value: "28" },
  { value: "29" },
  { value: "30" },
  { value: "31" },
];

const timeSlots = [
  { label: "9:00 AM", state: "booked" },
  { label: "10:00 AM", state: "available" },
  { label: "11:00 AM", state: "available" },
  { label: "12:00 PM", state: "booked" },
  { label: "1:00 PM", state: "available" },
  { label: "2:00 PM", state: "selected" },
  { label: "3:00 PM", state: "available" },
  { label: "4:00 PM", state: "booked" },
];

const locations = ["SLIIT Canteen", "New Building", "Main Building", "Custom"];

const buyerMeetings = [
  {
    day: "24",
    month: "Mar",
    color: "bg-indigo-600",
    title: "iPhone 13pro",
    meta: ["2:00 PM", "SLIIT Canteen", "Kamal P."],
    badge: { label: "Confirmed", tone: "green" },
    actions: ["Reschedule", "Cancel"],
  },
  {
    day: "27",
    month: "Mar",
    color: "bg-indigo-600",
    title: "Keyboard - Logitech K380",
    meta: ["11:30 AM", "New Building", "Nimasha S."],
    badge: { label: "Pending", tone: "amber" },
    actions: ["View Details"],
  },
];

const buyerMessages = [
  {
    side: "sent",
    text: "Is there any flexibility in the price",
    time: "10:26 AM",
  },
  {
    side: "recv",
    initials: "K",
    tone: "green",
    text: "Im firm on the price since i just posted it",
    time: "10:24 AM",
  },
];

const sectionCardClass =
  "rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]";

const badgeClassNames = {
  blue: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-slate-100 text-slate-600",
};

const avatarClassNames = {
  green: "bg-emerald-100 text-emerald-700",
};

function Badge({ label, tone = "gray" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClassNames[tone]}`}
    >
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
      {children}
    </p>
  );
}

function StatCard({ value, label, valueClassName }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <div className={`text-3xl font-bold ${valueClassName}`}>{value}</div>
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
    </div>
  );
}

function Tabs({ items, active }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item}
          type="button"
          className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
            item === active
              ? "border-indigo-600 bg-indigo-600 text-white"
              : "border-slate-200 bg-white text-slate-500 hover:border-indigo-400 hover:text-indigo-600"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Calendar() {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">March 2026</h3>
        <button
          type="button"
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
          <div
            key={dayName}
            className="py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"
          >
            {dayName}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={`${day.value}-${index}`}
            className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${
              day.today
                ? "bg-indigo-600 text-white"
                : day.selected
                  ? "border-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                  : day.muted
                    ? "text-slate-300"
                    : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
            }`}
          >
            {day.value}
            {day.meeting ? (
              <span
                className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${day.today ? "bg-white/80" : "bg-emerald-500"}`}
              />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ message }) {
  const isSent = message.side === "sent";

  return (
    <div
      className={`flex max-w-[85%] gap-2 ${isSent ? "ml-auto flex-row-reverse" : ""}`}
    >
      {!isSent ? (
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarClassNames[message.tone]}`}
        >
          {message.initials}
        </div>
      ) : null}
      <div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isSent
              ? "rounded-br-md bg-indigo-600 text-white"
              : "rounded-bl-md bg-slate-100 text-slate-700"
          }`}
        >
          {message.text}
        </div>
        <p
          className={`mt-1 px-1 text-[11px] text-slate-400 ${isSent ? "text-right" : ""}`}
        >
          {message.time}
        </p>
      </div>
    </div>
  );
}

const BuyerScheduleMeetingPage = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f8fafc_45%,#f1f5f9_100%)] px-4 py-8 md:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto max-w-7xl space-y-10"
      >
        <section className="rounded-[32px] border border-indigo-100 bg-white/80 px-6 py-7 shadow-[0_20px_60px_rgba(79,70,229,0.08)] backdrop-blur md:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-700">
                <CalendarRange size={16} />
                Buying
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Lets Get You Connected!
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  Stay organized with your scheduled meetups and pending buy
                  requests.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Product
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge label="Iphone 13" tone="blue" />
                <p className="text-sm font-medium text-slate-700"></p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">
              Meeting Scheduler
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {buyerStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <Tabs items={buyerTabs} active="Schedule" />

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <div>
                <SectionLabel>Request a Meeting</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="text-indigo-600" size={18} />
                      <h3 className="text-lg font-semibold text-slate-900">
                        Pick a Date and Time
                      </h3>
                    </div>
                    <Badge label="Step 1 of 3" tone="blue" />
                  </div>
                  <div className="space-y-6 px-6 py-5">
                    <Calendar />

                    <div>
                      <SectionLabel>Available Slots - Mar 24</SectionLabel>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.label}
                            type="button"
                            className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                              slot.state === "booked"
                                ? "cursor-not-allowed border-transparent bg-slate-100 text-slate-400 line-through"
                                : slot.state === "selected"
                                  ? "border-indigo-600 bg-indigo-600 text-white"
                                  : "border-emerald-500 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {slot.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionLabel>Meeting Location</SectionLabel>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((location) => (
                          <button
                            key={location}
                            type="button"
                            className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100"
                          >
                            <MapPin size={14} />
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        Preferred Duration
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {["15 min", "30 min", "45 min", "1 hr"].map(
                          (duration) => (
                            <button
                              key={duration}
                              type="button"
                              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                duration === "30 min"
                                  ? "bg-indigo-600 text-white"
                                  : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                              }`}
                            >
                              {duration}
                            </button>
                          ),
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Continue
                      <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </div>

              
            </div>

            <div className="space-y-6">
              <div>
                <SectionLabel>Upcoming Meetings</SectionLabel>
                <div className={`${sectionCardClass} px-6 py-5`}>
                  <div className="space-y-4">
                    {buyerMeetings.map((meeting) => (
                      <div
                        key={`${meeting.title}-${meeting.day}`}
                        className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm"
                      >
                        <div
                          className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl text-white ${meeting.color}`}
                        >
                          <span className="text-xl font-bold leading-none">
                            {meeting.day}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                            {meeting.month}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-900">
                            {meeting.title}
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                            {meeting.meta.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1.5"
                              >
                                <Clock3 size={13} />
                                {item}
                              </span>
                            ))}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <Badge
                              label={meeting.badge.label}
                              tone={meeting.badge.tone}
                            />
                            {meeting.actions.map((action) => (
                              <button
                                key={action}
                                type="button"
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                  action === "Cancel"
                                    ? "bg-rose-500 text-white hover:bg-rose-600"
                                    : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                                }`}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Chat with Seller</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="flex items-center gap-3 border-b border-indigo-200 bg-indigo-50 px-5 py-4">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${avatarClassNames.green}`}
                    >
                      K
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Kamal Perera
                      </p>
                      <p className="text-xs text-slate-500">
                        iPhone 13 Pro - LKR 85,000
                      </p>
                    </div>
                    
                  </div>

                  <div className="flex h-[420px] flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                      {buyerMessages.map((message, index) => (
                        <MessageBubble
                          key={`${message.time}-${index}`}
                          message={message}
                        />
                      ))}

                      
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
                     
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                      <button
                        type="button"
                        className="rounded-full bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700"
                      >
                        <Send size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        
      </motion.div>
    </div>
  );
};

export default BuyerScheduleMeetingPage;
