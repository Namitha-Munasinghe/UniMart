import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarRange, Clock3, MapPin, Phone, Send } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";

const sellerTabs = ["Requests", "Chat", "History"];
const CHAT_POLL_INTERVAL_MS = 3000;

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
  gray: "border-slate-300 bg-slate-50 text-slate-700",
};

const statusToneMap = {
  Pending: "amber",
  Confirmed: "green",
  Ignored: "gray",
  Cancelled: "gray",
};

const statusPanelToneMap = {
  Pending: "amber",
  Confirmed: "green",
  Ignored: "violet",
  Cancelled: "gray",
};

const formatMeetingDate = (value) =>
  new Intl.DateTimeFormat("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const formatMeetingTime = (value) =>
  new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const formatChatTime = (value) =>
  new Intl.DateTimeFormat("en-LK", {
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const MotionDiv = motion.div;

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

function MessageBubble({ message, isCurrentUser }) {
  return (
    <div className={`flex max-w-[85%] gap-2 ${isCurrentUser ? "ml-auto flex-row-reverse" : ""}`}>
      {!isCurrentUser ? (
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarClassNames.blue}`}>
          B
        </div>
      ) : null}
      <div>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 ${
            isCurrentUser ? "rounded-br-md bg-indigo-600 text-white" : "rounded-bl-md bg-slate-100 text-slate-700"
          }`}
        >
          {message.text}
        </div>
        <p className={`mt-1 px-1 text-[11px] text-slate-400 ${isCurrentUser ? "text-right" : ""}`}>
          {formatChatTime(message.createdAt)}
        </p>
      </div>
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

const SellerScheduleMeetingPage = () => {
  const { productId } = useParams();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeetingId, setSelectedMeetingId] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const loadMeetings = async () => {
    const response = await axios.get("/meetings/seller");
    const items = response.data.data || [];
    setMeetings(items);
    setSelectedMeetingId((currentId) => currentId || items[0]?._id || "");
  };

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        await loadMeetings();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load seller meetings");
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, []);

  useEffect(() => {
    let isActive = true;

    const refreshMeetings = async () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await axios.get("/meetings/seller");
        const items = response.data.data || [];

        if (!isActive) {
          return;
        }

        setMeetings(items);
        setSelectedMeetingId((currentId) => currentId || items[0]?._id || "");
      } catch (error) {
        if (isActive) {
          console.error("Realtime seller meeting refresh failed:", error.message);
        }
      }
    };

    const intervalId = window.setInterval(() => {
      void refreshMeetings();
    }, CHAT_POLL_INTERVAL_MS);

    const handleWindowFocus = () => {
      void refreshMeetings();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refreshMeetings();
      }
    };

    window.addEventListener("focus", handleWindowFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const selectedProduct = useMemo(
    () => meetings.find((meeting) => (meeting.product?._id || meeting.productId) === productId)?.product || null,
    [meetings, productId],
  );

  const filteredMeetings = useMemo(() => {
    if (!productId) {
      return meetings;
    }

    return meetings.filter((meeting) => (meeting.product?._id || meeting.productId) === productId);
  }, [meetings, productId]);

  const filteredPendingMeetings = useMemo(
    () => filteredMeetings.filter((meeting) => meeting.status === "Pending"),
    [filteredMeetings],
  );

  const filteredResponseMeetings = useMemo(
    () => filteredMeetings.filter((meeting) => meeting.status !== "Pending"),
    [filteredMeetings],
  );

  const meetingPeople = filteredMeetings;
  const sellerStats = useMemo(
    () => [
      { label: "Pending Requests", value: filteredPendingMeetings.length, valueClassName: "text-indigo-600" },
      {
        label: "Accepted Requests",
        value: filteredMeetings.filter((meeting) => meeting.status === "Confirmed").length,
        valueClassName: "text-emerald-600",
      },
      {
        label: "Ignored Requests",
        value: filteredMeetings.filter((meeting) => meeting.status === "Ignored").length,
        valueClassName: "text-slate-500",
      },
    ],
    [filteredMeetings, filteredPendingMeetings.length],
  );

  const handleStatusUpdate = async (meetingId, status) => {
    try {
      setUpdatingId(meetingId);
      await axios.patch(`/meetings/${meetingId}/status`, { status });
      toast.success(status === "Confirmed" ? "Meeting confirmed." : "Meeting ignored.");
      await loadMeetings();
      setSelectedMeetingId(meetingId);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update request");
    } finally {
      setUpdatingId("");
    }
  };

  const handleSendChatMessage = async () => {
    if (!currentMeeting?._id || !chatMessage.trim()) {
      return;
    }

    try {
      setSendingChat(true);
      await axios.post(`/meetings/${currentMeeting._id}/messages`, {
        text: chatMessage,
      });
      setChatMessage("");
      await loadMeetings();
      setSelectedMeetingId(currentMeeting._id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSendingChat(false);
    }
  };

  useEffect(() => {
    setSelectedMeetingId((currentId) => {
      if (filteredMeetings.some((meeting) => meeting._id === currentId)) {
        return currentId;
      }

      return filteredMeetings[0]?._id || "";
    });
  }, [filteredMeetings]);

  const currentMeeting = useMemo(
    () => filteredMeetings.find((meeting) => meeting._id === selectedMeetingId) || filteredMeetings[0] || null,
    [filteredMeetings, selectedMeetingId],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#eef2ff_0%,#f8fafc_45%,#f1f5f9_100%)] px-4 py-8 md:px-6 lg:px-8">
      <MotionDiv
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
            {productId ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Focused Product</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{selectedProduct?.name || "Selected listing"}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {filteredMeetings.length} meeting{filteredMeetings.length === 1 ? "" : "s"} connected to this listing
                </p>
                <Link
                  to="/my-meetings"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-600 transition hover:text-indigo-700"
                >
                  <ArrowLeft size={16} />
                  Back to My Meetings
                </Link>
              </div>
            ) : null}
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
                    <h3 className="text-lg font-semibold text-slate-900">Requests ({filteredPendingMeetings.length})</h3>
                  </div>
                  <div className="divide-y divide-slate-100 px-6 py-2">
                    {loading ? (
                      <div className="py-6 text-sm text-slate-500">Loading requests...</div>
                    ) : filteredPendingMeetings.length === 0 ? (
                      <div className="py-6 text-sm text-slate-500">
                        {productId ? "No pending meeting requests for this product right now." : "No pending meeting requests right now."}
                      </div>
                    ) : (
                      filteredPendingMeetings.map((request) => {
                        const initials = (request.buyer?.name || "B")
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <div key={request._id} className="flex gap-4 py-5">
                            <button
                              type="button"
                              onClick={() => setSelectedMeetingId(request._id)}
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold ${avatarClassNames.blue}`}
                            >
                              {initials}
                            </button>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-900">{request.buyer?.name || "Buyer"}</h3>
                                <Badge label="New" tone="amber" />
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>{request.product?.name || "Product"}</span>
                                <span>
                                  {formatMeetingDate(request.scheduledAt)}, {formatMeetingTime(request.scheduledAt)}
                                </span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                                <span>{request.durationMinutes} min</span>
                                <span>{request.location}</span>
                              </div>
                              {request.note ? <p className="mt-2 text-xs italic text-slate-500">{request.note}</p> : null}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  disabled={updatingId === request._id}
                                  onClick={() => handleStatusUpdate(request._id, "Confirmed")}
                                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
                                >
                                  Accept
                                </button>
                                <button
                                  type="button"
                                  disabled={updatingId === request._id}
                                  onClick={() => handleStatusUpdate(request._id, "Ignored")}
                                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-60"
                                >
                                  Ignore
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
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
                    {filteredResponseMeetings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                        {productId
                          ? "Confirmed, ignored, and cancelled requests for this product will appear here."
                          : "Confirmed and ignored requests will appear here after you take action."}
                      </div>
                    ) : (
                      filteredResponseMeetings.map((item) => (
                        <div
                          key={item._id}
                          className={`rounded-2xl border-l-4 p-4 ${responseToneClassNames[statusPanelToneMap[item.status]]}`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {item.status === "Confirmed" ? "Accepted Request" : item.status === "Ignored" ? "Ignored Request" : "Cancelled Request"}
                              </p>
                              <p className="mt-1 text-sm text-slate-700">{item.buyer?.name || "Buyer"}</p>
                              <p className="mt-1 text-xs text-slate-500">
                                {item.product?.name || "Product"} · {formatMeetingDate(item.scheduledAt)} · {formatMeetingTime(item.scheduledAt)} · {item.location}
                              </p>
                            </div>
                            <Badge label={item.status} tone={statusToneMap[item.status]} />
                          </div>
                        </div>
                      ))
                    )}
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
                      {meetingPeople.map((person) => {
                        const isActive = currentMeeting?._id === person._id;
                        const initials = (person.buyer?.name || "B")
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase();

                        return (
                          <button
                            key={person._id}
                            type="button"
                            onClick={() => setSelectedMeetingId(person._id)}
                            className="flex shrink-0 flex-col items-center gap-2"
                          >
                            <div className="relative">
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold ${isActive ? "border-indigo-500" : "border-transparent"} ${avatarClassNames.blue}`}>
                                {initials}
                              </div>
                              {person.status === "Pending" ? <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-amber-500" /> : null}
                            </div>
                            <p className={`text-xs font-medium ${isActive ? "text-indigo-600" : "text-slate-500"}`}>
                              {(person.buyer?.name || "Buyer").split(" ")[0]}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex h-[520px] flex-col">
                    <div className="flex items-center gap-3 border-b border-indigo-200 bg-indigo-50 px-5 py-4">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${avatarClassNames.blue}`}>
                        {((currentMeeting?.buyer?.name || "B").slice(0, 1) || "B").toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">{currentMeeting?.buyer?.name || "No buyer selected"}</p>
                        <p className="text-xs text-slate-500">{currentMeeting?.product?.name || "Pick a meeting to review it"}</p>
                      </div>
                      <Badge label={currentMeeting?.status || "No Request"} tone={statusToneMap[currentMeeting?.status] || "gray"} />
                    </div>

                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                      {currentMeeting ? (
                        <>
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="font-semibold text-slate-900">Requested meetup</p>
                            <div className="mt-3 space-y-2">
                              <p className="inline-flex items-center gap-2">
                                <Clock3 size={14} />
                                {formatMeetingDate(currentMeeting.scheduledAt)} at {formatMeetingTime(currentMeeting.scheduledAt)}
                              </p>
                              <p className="inline-flex items-center gap-2">
                                <MapPin size={14} />
                                {currentMeeting.location} · {currentMeeting.durationMinutes} min
                              </p>
                              <p className="inline-flex items-center gap-2">
                                <Phone size={14} />
                                {currentMeeting.buyer?.phone || "No phone number"}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-indigo-50 p-4 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">Buyer note</p>
                            <p className="mt-3 leading-6">
                              {currentMeeting.note || "No extra note was added to this request."}
                            </p>
                          </div>

                          <div className="space-y-3">
                            {(currentMeeting.messages || []).length > 0 ? (
                              currentMeeting.messages.map((message) => (
                                <MessageBubble
                                  key={message._id}
                                  message={message}
                                  isCurrentUser={message.senderRole === "seller"}
                                />
                              ))
                            ) : (
                              <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                                No chat messages yet. You can send the buyer a quick reply from here.
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                          Meeting details will appear here when a buyer sends a request.
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(event) => setChatMessage(event.target.value)}
                        disabled={!currentMeeting || sendingChat}
                        placeholder={currentMeeting ? "Type a message..." : "Choose a meeting first"}
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={handleSendChatMessage}
                        disabled={!currentMeeting || sendingChat || !chatMessage.trim()}
                        className="rounded-full bg-indigo-600 p-2.5 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

       
      </MotionDiv>
    </div>
  );
};

export default SellerScheduleMeetingPage;
