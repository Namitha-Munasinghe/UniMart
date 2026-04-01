import React from "react";
import { motion } from "framer-motion";
import {
  CalendarRange,
  
  Send,
  
} from "lucide-react";

const sellerStats = [
  { label: "Pending Requests", value: "5", valueClassName: "text-indigo-600" },
  { label: "Accepted Requests", value: "8", valueClassName: "text-emerald-600" },
  { label: "Ignored Requests", value: "2", valueClassName: "text-slate-500" },
];

const sellerTabs = ["Requests", "Chat", "History"];

const incomingRequests = [
  {
    initials: "A",
    avatarTone: "blue",
    name: "Kamal Perera",
    badge: { label: "New", tone: "amber" },
    lines: [
      ["iphone 13pro", "Mar 25, 10:00 AM"],
      ["30 min", "New Building"],
    ],
    
    noteTone: "muted",
    actions: ["Accept", "Ignore","Message"],
  },
  {
    initials: "R",
    avatarTone: "violet",
    name: "Rashida M.",
    lines: [
      ["Engineering Textbooks", "Mar 26, 2:00 PM"],
      ["15 min", "SLIIT Canteen"],
    ],
    actions: ["Accept", "Ignore","Message"],
  },
  {
    initials: "D",
    avatarTone: "amber",
    name: "Dilshan K.",
    badge: { label: "Reschedule", tone: "blue" },
    lines: [
      ["Dell Laptop Stand", "Mar 28, 3:30 PM"],
      ["20 min", "Main Building"],
    ],
    
    
    actions: ["Accept", "Ignore","Message"],
  },
];

const sellerResponses = [
  {
    title: "Accepted Request",
    buyer: "Tharuka W.",
    details: "Scientific Calculator - Mar 24, 2:00 PM - Main Building",
    tone: "green",
    status: "Accepted",
  },
  {
    title: "Waiting for Seller Action",
    buyer: "Amara Silva",
    details: "Samsung A54 - Mar 25, 10:00 AM - New Building",
    tone: "amber",
    status: "Pending",
  },
  {
    title: "Ignored Request",
    buyer: "Rashida M.",
    details: "Engineering Textbooks - Mar 26, 2:00 PM - SLIIT Canteen",
    tone: "violet",
    status: "Ignored",
  },
];

const sellerMessages = [
  { side: "recv", initials: "K", tone: "blue", text: "Is there any flexibility in the price ", time: "9:50 AM" },
  { side: "sent", text: "Im firm on the price since i just posted it", time: "9:53 AM" },
  
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
  blue: "bg-indigo-100 text-indigo-700",
  violet: "bg-violet-100 text-violet-700",
  amber: "bg-amber-100 text-amber-700",
};

const responseToneClassNames = {
  amber: "border-amber-400 bg-amber-50 text-amber-700",
  green: "border-emerald-400 bg-emerald-50 text-emerald-700",
  violet: "border-violet-400 bg-violet-50 text-violet-700",
};

function Badge({ label, tone = "gray" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClassNames[tone]}`}>
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
      <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">{label}</p>
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

function MessageBubble({ message }) {
  const isSent = message.side === "sent";

  return (
    <div className={`flex max-w-[85%] gap-2 ${isSent ? "ml-auto flex-row-reverse" : ""}`}>
      {!isSent ? (
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarClassNames[message.tone]}`}>
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
        <p className={`mt-1 px-1 text-[11px] text-slate-400 ${isSent ? "text-right" : ""}`}>{message.time}</p>
      </div>
    </div>
  );
}

const SellerScheduleMeetingPage = () => {
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
                Selling
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                  Lets Get Your Items Sold!
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  Connect with potential buyers to confirm inspections and price negotiations. Stay on top of your pending requests to close deals faster.
                </p>
              </div>
            </div>

            
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Meeting Scheduler</h2>
            
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {sellerStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <Tabs items={sellerTabs} active="Requests" />

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-6">
              <div>
                <SectionLabel>Incoming Meeting Requests</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h3 className="text-lg font-semibold text-slate-900">Requests (3)</h3>
                    <button type="button" className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600">
                      Newest First
                    </button>
                  </div>
                  <div className="divide-y divide-slate-100 px-6 py-2">
                    {incomingRequests.map((request) => (
                      <div key={request.name} className="flex gap-4 py-5">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${avatarClassNames[request.avatarTone]}`}>
                          {request.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-semibold text-slate-900">{request.name}</h3>
                            {request.badge ? <Badge label={request.badge.label} tone={request.badge.tone} /> : null}
                          </div>
                          {request.lines.map((line, lineIndex) => (
                            <div key={`${request.name}-${lineIndex}`} className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              {line.map((item) => (
                                <span key={item}>{item}</span>
                              ))}
                            </div>
                          ))}
                          {request.note ? (
                            <p className={`mt-2 text-xs ${request.noteTone === "warn" ? "text-amber-600" : "italic text-slate-500"}`}>
                              {request.note}
                            </p>
                          ) : null}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {request.actions.map((action) => (
                              <button
                                key={action}
                                type="button"
                                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                                  action === "Accept"
                                    ? "bg-emerald-500 text-white hover:bg-emerald-600"
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
                <SectionLabel>Request Responses</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
                    <h3 className="text-lg font-semibold text-slate-900">Buyer Request Status</h3>
                    
                  </div>
                  <div className="space-y-4 px-6 py-5">
                    {sellerResponses.map((item) => (
                      <div
                        key={`${item.buyer}-${item.status}`}
                        className={`rounded-2xl border-l-4 p-4 ${responseToneClassNames[item.tone]}`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                            <p className="mt-1 text-sm text-slate-700">{item.buyer}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.details}</p>
                          </div>
                          <Badge
                            label={item.status}
                            tone={
                              item.status === "Accepted"
                                ? "green"
                                : item.status === "Pending"
                                  ? "amber"
                                  : "gray"
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
        

              <div>
                <SectionLabel>Chat with Buyer</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="border-b border-slate-200 px-5 pt-4">
                    <div className="flex gap-3 overflow-x-auto pb-4">
                      {[
                        { initials: "K", tone: "blue", active: true, online: true, name: "Kamal" },
                        { initials: "D", tone: "amber", name: "Dilshan" },
                        { initials: "R", tone: "violet", online: true, name: "Rashida" },
                      ].map((person) => (
                        <div key={person.name} className="flex shrink-0 flex-col items-center gap-2">
                          <div className="relative">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${person.active ? "border-indigo-500" : "border-transparent"} ${avatarClassNames[person.tone]}`}>
                              {person.initials}
                            </div>
                            {person.online ? <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" /> : null}
                          </div>
                          <p className={`text-xs font-medium ${person.active ? "text-indigo-600" : "text-slate-500"}`}>{person.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex h-[340px] flex-col">
                    <div className="flex items-center gap-3 border-b border-indigo-200 bg-indigo-50 px-5 py-4">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${avatarClassNames.blue}`}>K</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Kamal Perera</p>
                        <p className="text-xs text-slate-500">iphone 13pro</p>
                      </div>
                      <Badge label="Pending Request" tone="amber" />
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                      {sellerMessages.map((message, index) => (
                        <MessageBubble key={`${message.time}-${index}`} message={message} />
                      ))}

                      
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
                      
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white"
                      />
                      <button type="button" className="rounded-full bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700">
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

export default SellerScheduleMeetingPage;
