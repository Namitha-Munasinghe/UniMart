import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Send,
  ShieldCheck,
} from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "../lib/axios";
import { useUserStore } from "../stores/useUserStore";

const buyerTabs = ["Schedule", "My Meetings"];
const locations = ["SLIIT Canteen", "New Building", "Main Building", "Custom"];
const durations = [15, 30, 45, 60];
const CHAT_POLL_INTERVAL_MS = 3000;
const timeSlots = [
  { value: "09:00", label: "9:00 AM" },
  { value: "10:00", label: "10:00 AM" },
  { value: "11:00", label: "11:00 AM" },
  { value: "12:00", label: "12:00 PM" },
  { value: "13:00", label: "1:00 PM" },
  { value: "14:00", label: "2:00 PM" },
  { value: "15:00", label: "3:00 PM" },
  { value: "16:00", label: "4:00 PM" },
];

const sectionCardClass =
  "rounded-[24px] border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,0.06)]";

const badgeClassNames = {
  blue: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  gray: "bg-slate-100 text-slate-600",
  red: "bg-rose-100 text-rose-700",
};

const avatarClassNames = {
  green: "bg-emerald-100 text-emerald-700",
};

const statusToneMap = {
  Pending: "amber",
  Confirmed: "green",
  Ignored: "gray",
  Cancelled: "red",
};

const formatDateKey = (date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const startOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1);

const getInitialDate = () => {
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  nextDay.setHours(0, 0, 0, 0);
  return nextDay;
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
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClassNames[tone]}`}
    >
      {label}
    </span>
  );
}

function SectionLabel({ children }) {
  return <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{children}</p>;
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
        <div
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarClassNames.green}`}
        >
          S
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
              : "border-slate-200 bg-white text-slate-500"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Calendar({ monthDate, selectedDate, meetingDates, onMonthChange, onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthStart = startOfMonth(monthDate);
  const firstWeekday = monthStart.getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];

  for (let index = 0; index < firstWeekday; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1))}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <ChevronLeft size={16} />
        </button>
        <h3 className="text-lg font-semibold text-slate-900">
          {monthDate.toLocaleDateString("en-LK", { month: "long", year: "numeric" })}
        </h3>
        <button
          type="button"
          onClick={() => onMonthChange(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1))}
          className="rounded-xl border border-slate-200 p-2 text-slate-500 transition hover:border-indigo-300 hover:text-indigo-600"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((dayName) => (
          <div key={dayName} className="py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            {dayName}
          </div>
        ))}

        {cells.map((day, index) => {
          if (!day) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(day);
          const isSelected = dateKey === selectedDate;
          const isToday = dateKey === formatDateKey(today);
          const isPast = day < today;

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isPast}
              onClick={() => onSelectDate(dateKey)}
              className={`relative flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition ${
                isSelected
                  ? "border-2 border-indigo-500 bg-indigo-50 text-indigo-700"
                  : isToday
                    ? "bg-indigo-600 text-white"
                    : isPast
                      ? "cursor-not-allowed text-slate-300"
                      : "text-slate-700 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              {day.getDate()}
              {meetingDates.has(dateKey) ? (
                <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isToday ? "bg-white/80" : "bg-emerald-500"}`} />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const BuyerScheduleMeetingPage = () => {
  const { productId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUserStore();

  const [product, setProduct] = useState(location.state?.product || null);
  const [buyerMeetings, setBuyerMeetings] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(formatDateKey(getInitialDate()));
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(getInitialDate()));
  const [selectedTime, setSelectedTime] = useState("14:00");
  const [selectedLocation, setSelectedLocation] = useState(locations[0]);
  const [customLocation, setCustomLocation] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [note, setNote] = useState("");
  const [chatMessage, setChatMessage] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const loadBuyerMeetings = async () => {
    const response = await axios.get("/meetings/buyer");
    setBuyerMeetings(response.data.data || []);
  };

  useEffect(() => {
    const loadPage = async () => {
      try {
        setPageLoading(true);

        if (productId) {
          const productResponse = await axios.get(`/products/${productId}`);
          setProduct(productResponse.data.data);
        }

        await loadBuyerMeetings();
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to load meeting scheduler");
      } finally {
        setPageLoading(false);
      }
    };

    loadPage();
  }, [productId]);

  useEffect(() => {
    let isActive = true;

    const refreshMeetings = async () => {
      if (document.visibilityState === "hidden") {
        return;
      }

      try {
        const response = await axios.get("/meetings/buyer");

        if (!isActive) {
          return;
        }

        setBuyerMeetings(response.data.data || []);
      } catch (error) {
        if (isActive) {
          console.error("Realtime buyer meeting refresh failed:", error.message);
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

  useEffect(() => {
    const currentSelection = new Date(`${selectedDate}T00:00:00`);
    setCalendarMonth(startOfMonth(currentSelection));
  }, [selectedDate]);

  const activeMeetings = useMemo(
    () => buyerMeetings.filter((meeting) => ["Pending", "Confirmed"].includes(meeting.status)),
    [buyerMeetings],
  );

  const stats = useMemo(() => {
    const now = new Date();
    return [
      {
        label: "Upcoming Meetings",
        value: activeMeetings.filter((meeting) => new Date(meeting.scheduledAt) >= now).length,
        valueClassName: "text-indigo-600",
      },
      {
        label: "Confirmed",
        value: buyerMeetings.filter((meeting) => meeting.status === "Confirmed").length,
        valueClassName: "text-emerald-600",
      },
      {
        label: "Pending Requests",
        value: buyerMeetings.filter((meeting) => meeting.status === "Pending").length,
        valueClassName: "text-amber-500",
      },
    ];
  }, [activeMeetings, buyerMeetings]);

  const meetingDates = useMemo(
    () => new Set(activeMeetings.map((meeting) => formatDateKey(new Date(meeting.scheduledAt)))),
    [activeMeetings],
  );

  const isOwnProduct =
    product?.sellerId === user?._id ||
    product?.sellerId === user?.id ||
    product?.seller?._id === user?._id ||
    product?.seller?._id === user?.id;
  const activeProductMeeting = useMemo(
    () =>
      activeMeetings.find((meeting) => {
        const currentProductId = meeting.product?._id || meeting.productId;
        return currentProductId === (product?._id || productId);
      }),
    [activeMeetings, product, productId],
  );
  const activeProductMessages = activeProductMeeting?.messages || [];

  const selectedDateLabel = useMemo(
    () =>
      new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-LK", {
        month: "short",
        day: "numeric",
      }),
    [selectedDate],
  );

  const unavailableSlots = useMemo(() => {
    const selectedDayMeetings = activeMeetings
      .filter((meeting) => formatDateKey(new Date(meeting.scheduledAt)) === selectedDate)
      .map((meeting) =>
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date(meeting.scheduledAt)),
      );

    const todayKey = formatDateKey(new Date());

    return new Set(
      timeSlots
        .filter((slot) => {
          if (selectedDate !== todayKey) {
            return selectedDayMeetings.includes(slot.value);
          }

          const now = new Date();
          const slotTime = new Date(`${selectedDate}T${slot.value}:00`);
          return selectedDayMeetings.includes(slot.value) || slotTime <= now;
        })
        .map((slot) => slot.value),
    );
  }, [activeMeetings, selectedDate]);

  const handleCreateMeeting = async () => {
    if (!product?._id) {
      toast.error("Pick a product before scheduling a meeting.");
      return;
    }

    if (activeProductMeeting) {
      toast.error("You already have an active meeting request for this product.");
      return;
    }

    const finalLocation = selectedLocation === "Custom" ? customLocation.trim() : selectedLocation;

    if (!finalLocation) {
      toast.error("Please choose a meeting location.");
      return;
    }

    if (unavailableSlots.has(selectedTime)) {
      toast.error("Please choose another time slot.");
      return;
    }

    try {
      setSubmitting(true);

      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);
      await axios.post("/meetings", {
        productId: product._id,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes,
        location: finalLocation,
        note,
      });

      toast.success("Meeting request sent to the seller.");
      setNote("");
      setCustomLocation("");
      await loadBuyerMeetings();
      navigate("/schedule-meeting/buyer/" + product._id, { replace: true, state: { product } });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to schedule meeting");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelMeeting = async (meetingId) => {
    try {
      await axios.patch(`/meetings/${meetingId}/status`, { status: "Cancelled" });
      toast.success("Meeting cancelled.");
      await loadBuyerMeetings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel meeting");
    }
  };

  const handleSendChatMessage = async () => {
    if (!activeProductMeeting?._id || !chatMessage.trim()) {
      return;
    }

    try {
      setSendingChat(true);
      await axios.post(`/meetings/${activeProductMeeting._id}/messages`, {
        text: chatMessage,
      });
      setChatMessage("");
      await loadBuyerMeetings();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setSendingChat(false);
    }
  };

  if (pageLoading) {
    return <div className="min-h-screen bg-slate-50" />;
  }

  if (!productId && !product?._id) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl rounded-[2rem] bg-white p-10 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-slate-900">Pick a product first</h1>
          <p className="mt-3 text-sm text-slate-500">Start from a product page so we know which seller and item this meeting is for.</p>
          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse products
          </Link>
        </div>
      </div>
    );
  }

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
                Buying
              </span>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">Lets Get You Connected!</h1>
                <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  Send a meeting request for this product, then keep track of the seller response and your upcoming meetup.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Product</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge label={product?.category || "Listing"} tone="blue" />
                <p className="text-sm font-medium text-slate-700">{product?.name}</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Seller: {product?.seller?.name || "Listing owner"} · LKR {product?.price}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900">Meeting Scheduler</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((stat) => (
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
                      <h3 className="text-lg font-semibold text-slate-900">Pick a Date and Time</h3>
                    </div>
                    <Badge label={activeProductMeeting ? "Request Sent" : "Ready"} tone={activeProductMeeting ? "amber" : "blue"} />
                  </div>
                  <div className="space-y-6 px-6 py-5">
                    <Calendar
                      monthDate={calendarMonth}
                      selectedDate={selectedDate}
                      meetingDates={meetingDates}
                      onMonthChange={setCalendarMonth}
                      onSelectDate={setSelectedDate}
                    />

                    <div>
                      <SectionLabel>Available Slots - {selectedDateLabel}</SectionLabel>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {timeSlots.map((slot) => {
                          const isUnavailable = unavailableSlots.has(slot.value);
                          const isSelected = selectedTime === slot.value;

                          return (
                            <button
                              key={slot.value}
                              type="button"
                              disabled={isUnavailable}
                              onClick={() => setSelectedTime(slot.value)}
                              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                isUnavailable
                                  ? "cursor-not-allowed border-transparent bg-slate-100 text-slate-400 line-through"
                                  : isSelected
                                    ? "border-indigo-600 bg-indigo-600 text-white"
                                    : "border-emerald-500 bg-emerald-50 text-emerald-700"
                              }`}
                            >
                              {slot.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <SectionLabel>Meeting Location</SectionLabel>
                      <div className="flex flex-wrap gap-2">
                        {locations.map((locationOption) => (
                          <button
                            key={locationOption}
                            type="button"
                            onClick={() => setSelectedLocation(locationOption)}
                            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                              selectedLocation === locationOption
                                ? "bg-indigo-600 text-white"
                                : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            <MapPin size={14} />
                            {locationOption}
                          </button>
                        ))}
                      </div>
                      {selectedLocation === "Custom" ? (
                        <input
                          type="text"
                          value={customLocation}
                          onChange={(event) => setCustomLocation(event.target.value)}
                          placeholder="Enter the exact meeting point"
                          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                        />
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Preferred Duration</label>
                      <div className="flex flex-wrap gap-2">
                        {durations.map((duration) => (
                          <button
                            key={duration}
                            type="button"
                            onClick={() => setDurationMinutes(duration)}
                            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                              durationMinutes === duration
                                ? "bg-indigo-600 text-white"
                                : "border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                            }`}
                          >
                            {duration} min
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">Add a note for the seller</label>
                      <textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Example: I can meet after my 1 PM lecture near the canteen."
                        rows={4}
                        className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-400"
                      />
                    </div>

                    {isOwnProduct ? (
                      <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        This is your own listing, so buyer scheduling is disabled for it.
                      </div>
                    ) : null}

                    <button
                      type="button"
                      disabled={submitting || !!activeProductMeeting || isOwnProduct}
                      onClick={handleCreateMeeting}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                      {submitting ? "Sending Request..." : "Schedule Meeting"}
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <SectionLabel>My Meetings</SectionLabel>
                <div className={`${sectionCardClass} px-6 py-5`}>
                  <div className="space-y-4">
                    {buyerMeetings.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
                        No meetings yet. Once you schedule one, it will appear here.
                      </div>
                    ) : (
                      buyerMeetings.map((meeting) => (
                        <div
                          key={meeting._id}
                          className="flex gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white hover:shadow-sm"
                        >
                          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-indigo-600 text-white">
                            <span className="text-xl font-bold leading-none">{new Date(meeting.scheduledAt).getDate()}</span>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80">
                              {new Date(meeting.scheduledAt).toLocaleDateString("en-LK", { month: "short" })}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-slate-900">{meeting.product?.name || "Product"}</h3>
                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <Clock3 size={13} />
                                {formatMeetingDate(meeting.scheduledAt)} at {formatMeetingTime(meeting.scheduledAt)}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={13} />
                                {meeting.location}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <ShieldCheck size={13} />
                                {meeting.seller?.name || "Seller"} · {meeting.durationMinutes} min
                              </span>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <Badge label={meeting.status} tone={statusToneMap[meeting.status]} />
                              {["Pending", "Confirmed"].includes(meeting.status) ? (
                                <button
                                  type="button"
                                  onClick={() => handleCancelMeeting(meeting._id)}
                                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-rose-600"
                                >
                                  Cancel
                                </button>
                              ) : null}
                              <Link
                                to={`/products/${meeting.product?._id || product?._id}`}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
                              >
                                View Product
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div>
                <SectionLabel>Chat with Seller</SectionLabel>
                <div className={sectionCardClass}>
                  <div className="flex items-center gap-3 border-b border-indigo-200 bg-indigo-50 px-5 py-4">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-full font-bold ${avatarClassNames.green}`}>
                      {(product?.seller?.name || "S").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{product?.seller?.name || "Seller"}</p>
                      <p className="text-xs text-slate-500">{product?.name} · LKR {product?.price}</p>
                    </div>
                    <Badge label={activeProductMeeting?.status || "Not Requested"} tone={statusToneMap[activeProductMeeting?.status] || "gray"} />
                  </div>

                  <div className="flex h-[520px] flex-col">
                    <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
                      {activeProductMeeting ? (
                        activeProductMessages.length > 0 ? (
                          activeProductMessages.map((message) => (
                            <MessageBubble
                              key={message._id}
                              message={message}
                              isCurrentUser={message.senderRole === "buyer"}
                            />
                          ))
                        ) : (
                          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500">
                            No messages yet. Send a quick note to the seller about where or when you want to meet.
                          </div>
                        )
                      ) : (
                        <div className="space-y-4 text-sm text-slate-600">
                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">Seller contact</p>
                            <p className="mt-2">Email: {product?.seller?.email || "Not available"}</p>
                            <p className="mt-1">Phone: {product?.seller?.phone || "Not available"}</p>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-4">
                            <p className="font-semibold text-slate-900">Your latest note</p>
                            <p className="mt-2 leading-6 text-slate-600">
                              {note || "Add a short note with your preferred meetup details before sending the request."}
                            </p>
                          </div>

                          <div className="rounded-2xl bg-emerald-50 p-4 text-emerald-700">
                            Once you send the meeting request, your chat with the seller will appear here.
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 border-t border-slate-200 px-5 py-4">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(event) => setChatMessage(event.target.value)}
                        disabled={!activeProductMeeting || sendingChat}
                        placeholder={activeProductMeeting ? "Type a message..." : "Send a request first to start chatting"}
                        className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white disabled:cursor-not-allowed disabled:bg-slate-100"
                      />
                      <button
                        type="button"
                        onClick={handleSendChatMessage}
                        disabled={!activeProductMeeting || sendingChat || !chatMessage.trim()}
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

export default BuyerScheduleMeetingPage;
