"""
AgriProcure Flask demo server.

Enhanced with:
- Windows-compatible timezone fallback (IST, UTC+5:30)
- Logical, dynamic slot booking system based on confirmed bookings
- Strict past-date prevention (cannot book dates before today)
- Unique monitorable booking IDs (e.g. AGRI-2026-0903-XXXX)
- Seller notification when a buyer calls a token
"""

import json
import os
import secrets
from datetime import date, datetime, timedelta, timezone
from functools import wraps

try:
    from zoneinfo import ZoneInfo
    APP_TIMEZONE = ZoneInfo(os.environ.get("APP_TIMEZONE", "Asia/Kolkata"))
except Exception:
    APP_TIMEZONE = timezone(timedelta(hours=5, minutes=30))

from flask import Flask, jsonify, request, render_template

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "agri-procure.json")

PORT = int(os.environ.get("PORT", 5174))

app = Flask(__name__)

# In-memory demo sessions
sessions = {}

CROP_RATES = {
    "Paddy": 23.69,
    "Wheat": 24.25,
    "Maize": 20.9,
    "Mustard": 59.5,
    "Potato": 15.8,
    "Pulses": 72.4,
}

BOOKING_WINDOW_DAYS = 30
SLOT_SCHEDULE = (
    ("09:00 – 10:00", 9, 10),
    ("10:00 – 11:00", 10, 11),
    ("11:00 – 12:00", 11, 12),
    ("12:00 – 01:00", 12, 13),
    ("02:00 – 03:00", 14, 15),
)


def uid(prefix):
    return f"{prefix}-{secrets.token_hex(3).upper()}"


def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def local_now():
    """Return the current time in Indian Standard Time (IST)."""
    return datetime.now(APP_TIMEZONE)


def today_local():
    return local_now().date()


def parse_booking_date(value):
    """Parse an ISO date string (YYYY-MM-DD)."""
    try:
        return date.fromisoformat(str(value).strip())
    except (TypeError, ValueError):
        return None


def booking_date_bounds():
    start = today_local()
    return start, start + timedelta(days=BOOKING_WINDOW_DAYS)


def booking_date_is_allowed(target_date):
    if target_date is None:
        return False
    start, end = booking_date_bounds()
    return start <= target_date <= end


def slot_id(centre_id, target_date, index):
    return f"SL-{centre_id}-{target_date.strftime('%Y%m%d')}-{index}"


def slot_capacity(centre):
    """Calculate logical slot capacity from centre daily capacity."""
    daily = int(centre.get("capacity", 100))
    return max(5, daily // len(SLOT_SCHEDULE))


def slot_bookings(db, centre_id, target_date, time_label):
    """Count active bookings for a specific centre, date, and time."""
    return sum(
        booking.get("centreId") == centre_id
        and booking.get("date") == target_date.isoformat()
        and booking.get("time") == time_label
        and booking.get("status") not in ("CANCELLED", "REJECTED")
        for booking in db.get("bookings", [])
    )


def slots_for_date(db, centre, target_date):
    """
    Build logical availability for a centre and date from confirmed bookings.
    Past dates are completely closed.
    For today, past hour slots are closed, but current/future hours are open.
    For future dates, all slots are open based on real capacity minus bookings.
    """
    current = local_now()
    capacity = slot_capacity(centre)
    result = []
    
    for index, (time_label, start_hour, end_hour) in enumerate(SLOT_SCHEDULE, start=1):
        is_today = target_date == current.date()
        is_past_day = target_date < current.date()
        
        # A slot is closed if it's in the past or if today's time has already elapsed past the slot end
        closed = is_past_day or (is_today and current.hour >= end_hour)
        booked = slot_bookings(db, centre["id"], target_date, time_label)
        
        available = 0 if closed else max(0, capacity - booked)
        
        result.append(
            {
                "id": slot_id(centre["id"], target_date, index),
                "centreId": centre["id"],
                "date": target_date.isoformat(),
                "time": time_label,
                "total": capacity,
                "booked": booked if not closed else capacity,
                "available": available,
                "isPast": closed,
            }
        )
    return result


def centre_view(db, centre, target_date=None):
    """Return a centre with a live daily availability summary."""
    target_date = target_date or today_local()
    slots = slots_for_date(db, centre, target_date)
    booked = sum(slot["booked"] for slot in slots if not slot["isPast"])
    available = sum(slot["available"] for slot in slots)
    queue_statuses = {"CHECKED_IN", "WAITING", "CALLED", "PROCESSING"}
    queue = sum(
        booking.get("centreId") == centre["id"]
        and booking.get("date") == target_date.isoformat()
        and booking.get("status") in queue_statuses
        for booking in db.get("bookings", [])
    )
    result = dict(centre)
    result.update(
        {
            "booked": booked,
            "availability": available,
            "queue": queue,
            "utilization": round((booked / centre["capacity"]) * 100) if centre.get("capacity") else 0,
            "estimatedWait": queue * centre.get("processingTime", 7),
            "availabilityDate": target_date.isoformat(),
        }
    )
    return result


def new_booking_id(target_date, existing_ids):
    """Create a unique, readable, monitorable booking tracking ID."""
    while True:
        suffix = secrets.token_hex(2).upper()
        candidate = f"AGRI-{target_date.strftime('%y%m%d')}-{suffix}"
        if candidate not in existing_ids:
            return candidate


def read_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(
                {
                    "users": [],
                    "centres": [],
                    "slots": [],
                    "bookings": [],
                    "notifications": [],
                    "verificationRequests": [],
                    "settings": {"averageProcessingTime": 7, "demoMode": True},
                },
                f,
                indent=2,
            )
    with open(DB_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def write_db(db):
    os.makedirs(DATA_DIR, exist_ok=True)
    temp = DB_FILE + ".tmp"
    with open(temp, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    os.replace(temp, DB_FILE)


def safe_user(user):
    return {k: v for k, v in user.items() if k != "password"}


def error(message, status=400):
    return jsonify({"error": message}), status


def get_session_user(required_roles=None):
    header = request.headers.get("Authorization", "")
    token = header[7:] if header.startswith("Bearer ") else header
    session = sessions.get(token)
    if not session or session["expires"] < datetime.now(timezone.utc).timestamp():
        return None
    user = session["user"]
    if required_roles and user.get("role") not in required_roles:
        return None
    return user


def auth_required(roles=None):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_session_user(roles)
            if not user:
                return error("Please sign in to continue.", 401)
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


def find_booking(db, booking_id):
    return next((b for b in db.get("bookings", []) if b["id"] == booking_id), None)


def booking_view(db, booking):
    farmer = next((u for u in db.get("users", []) if u["id"] == booking["farmerId"]), None)
    centre = next((c for c in db.get("centres", []) if c["id"] == booking["centreId"]), None)
    result = dict(booking)
    result["farmer"] = safe_user(farmer) if farmer else None
    result["centre"] = centre_view(db, centre) if centre else None
    return result


def queue_info(db, booking):
    centre = next((c for c in db.get("centres", []) if c["id"] == booking["centreId"]), None)

    active_statuses = {"CHECKED_IN", "WAITING", "CALLED", "PROCESSING"}
    same_queue = [
        item for item in db.get("bookings", [])
        if item["centreId"] == booking["centreId"]
        and item.get("date") == booking.get("date")
        and item["status"] in active_statuses
    ]
    same_queue.sort(key=lambda item: token_sort_key(item.get("token", "")))

    current = next(
        (item for item in db.get("bookings", [])
         if item["centreId"] == booking["centreId"]
         and item.get("date") == booking.get("date")
         and item["status"] == "PROCESSING"),
        None,
    )

    try:
        position = next(i for i, item in enumerate(same_queue) if item["id"] == booking["id"])
    except StopIteration:
        position = -1

    position = max(0, position)
    people_ahead = 0 if booking["status"] == "COMPLETED" else position
    average = (centre or {}).get("processingTime") or db.get("settings", {}).get("averageProcessingTime", 7)

    return {
        "nowServing": current["token"] if current else (same_queue[0]["token"] if same_queue else "—"),
        "yourToken": booking["token"],
        "peopleAhead": people_ahead,
        "estimatedMinutes": people_ahead * average,
        "averageProcessingTime": average,
        "queue": [
            {"token": item["token"], "status": item["status"], "bookingId": item["id"]}
            for item in same_queue
        ],
    }


def token_sort_key(token):
    m = __import__("re").search(r"(\d+)$", str(token))
    return (str(token)[:m.start()] if m else str(token), int(m.group(1)) if m else 0)


def notify(db, user_id, type_, title, message):
    db.setdefault("notifications", []).insert(
        0,
        {
            "id": uid("NT"),
            "userId": user_id,
            "type": type_,
            "title": title,
            "message": message,
            "read": False,
            "time": "Just now",
            "createdAt": now(),
        },
    )


@app.get("/")
def index():
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "ok": True,
        "mode": "DEMO",
        "date": today_local().isoformat(),
        "time": local_now().strftime("%H:%M:%S"),
        "timezone": "Asia/Kolkata",
    })


@app.post("/api/auth/login")
def login():
    db = read_db()
    values = request.get_json(silent=True) or {}
    email = str(values.get("email") or "").strip().lower()
    password = values.get("password")
    role = values.get("role")

    user = next(
        (
            item for item in db.get("users", [])
            if item.get("email", "").strip().lower() == email
            and item.get("password") == password
            and (not role or item.get("role") == role)
        ),
        None,
    )
    if not user:
        return error("Invalid email, password, or role. Use one of the demo accounts.", 401)

    token = secrets.token_hex(24)
    sessions[token] = {
        "user": safe_user(user),
        "expires": datetime.now(timezone.utc).timestamp() + 60 * 60 * 12,
    }
    return jsonify({"token": token, "user": safe_user(user)})


@app.post("/api/auth/register")
def register():
    db = read_db()
    values = request.get_json(silent=True) or {}

    role = values.get("role")
    if role not in ("FARMER", "BUYER") or not values.get("name") or not values.get("email") or not values.get("password"):
        return error("Please complete the required fields.")

    email = str(values["email"]).strip().lower()
    if any(item.get("email", "").strip().lower() == email for item in db.get("users", [])):
        return error("An account with this email already exists.")

    farmer_id = None
    if role == "FARMER":
        farmer_count = sum(1 for item in db.get("users", []) if item.get("role") == "FARMER")
        farmer_id = f"FRM-2026-{str(farmer_count + 135).zfill(5)}"

    user = {
        "id": uid("farmer" if role == "FARMER" else "buyer"),
        "role": role,
        "name": values["name"],
        "email": email,
        "password": values["password"],
        "verification": "PENDING",
        "farmerId": farmer_id,
        "phone": values.get("phone") or "",
        "district": values.get("district") or "North 24 Parganas",
        "state": values.get("state") or "West Bengal",
        "village": values.get("village") or "",
    }

    if role == "BUYER":
        user.pop("farmerId", None)

    db.setdefault("users", []).append(user)

    if role == "BUYER":
        centre = {
            "id": f"CTR-{str(len(db.get('centres', [])) + 1).zfill(3)}",
            "buyerId": user["id"],
            "name": values.get("centreName") or f"{values['name']} Procurement Centre",
            "short": values.get("centreName") or "New Centre",
            "district": values.get("district") or "North 24 Parganas",
            "locality": f"{values.get('district') or 'North 24 Parganas'}, {values.get('state') or 'West Bengal'}",
            "address": values.get("address") or "Station Road",
            "capacity": int(values.get("capacity") or 80),
            "booked": 0,
            "queue": 0,
            "distance": 5.0,
            "crops": values.get("crops") or ["Paddy", "Wheat"],
            "verified": "PENDING",
            "hours": values.get("hours") or "09:00 AM – 04:00 PM",
            "processingTime": 7,
            "lat": 22.72,
            "lng": 88.48,
            "organization": values["name"],
        }
        db.setdefault("centres", []).append(centre)
        user["centreId"] = centre["id"]

        db.setdefault("verificationRequests", []).insert(
            0,
            {
                "id": uid("VR"),
                "centreId": centre["id"],
                "submitted": today_local().strftime("%d %b %Y"),
                "status": "PENDING",
                "stage": "Registration Submitted",
                "contact": values.get("contact") or values["name"],
                "phone": values.get("phone") or "",
                "certificate": values.get("certificate") or "DEMO-REG-2026",
                "document": "demo_registration.pdf",
                "history": ["Registration Submitted"],
            },
        )

    write_db(db)
    return jsonify(
        {
            "message": "Registration successful. Welcome to AgriProcure!",
            "user": safe_user(user),
        }
    ), 201


@app.get("/api/me")
@auth_required()
def me(user):
    db = read_db()
    profile = (
        next((c for c in db.get("centres", []) if c["id"] == user.get("centreId")), None)
        if user.get("role") == "BUYER"
        else user
    )
    return jsonify({"user": user, "profile": profile})


@app.get("/api/dashboard")
@auth_required()
def dashboard(user):
    db = read_db()
    role = user["role"]

    if role == "FARMER":
        farmer_bookings = [b for b in db.get("bookings", []) if b["farmerId"] == user["id"]]
        farmer_bookings.sort(key=lambda b: b["createdAt"], reverse=True)
        # Active booking is the latest non-completed or latest overall
        booking = next((b for b in farmer_bookings if b["status"] != "COMPLETED"), None) or (farmer_bookings[0] if farmer_bookings else None)

        return jsonify({
            "user": user,
            "booking": booking_view(db, booking) if booking else None,
            "queue": queue_info(db, booking) if booking else None,
            "crops": [
                {"crop": b["crop"], "quantity": b["quantity"], "unit": b["unit"]}
                for b in farmer_bookings
            ],
            "notifications": [
                n for n in db.get("notifications", []) if n["userId"] == user["id"]
            ][:8],
            "recommendations": sorted(
                [c for c in db.get("centres", []) if c.get("verified") == "VERIFIED"],
                key=lambda c: c.get("queue", 0) * 3 + c.get("distance", 10),
            )[:3],
        })

    if role == "BUYER":
        raw_centre = next((c for c in db.get("centres", []) if c["id"] == user.get("centreId")), None)
        if not raw_centre:
            return error("Your procurement centre could not be found.", 404)
        centre = centre_view(db, raw_centre)
        bookings = [b for b in db.get("bookings", []) if b["centreId"] == user.get("centreId")]
        checked_in_statuses = {"CHECKED_IN", "WAITING", "CALLED", "PROCESSING", "COMPLETED"}
        waiting_statuses = {"WAITING", "CHECKED_IN"}
        today = today_local().isoformat()
        today_bookings = [b for b in bookings if b.get("date") == today]
        return jsonify({
            "centre": centre,
            "bookings": [booking_view(db, b) for b in bookings],
            "stats": {
                "totalSlots": centre["capacity"],
                "booked": centre["booked"],
                "checkedIn": sum(b["status"] in checked_in_statuses for b in today_bookings),
                "completed": sum(b["status"] == "COMPLETED" for b in today_bookings),
                "waiting": sum(b["status"] in waiting_statuses for b in today_bookings),
                "procurement": sum(
                    float(((b.get("payment") or {}).get("amount")) or 0)
                    for b in today_bookings
                    if (b.get("procurement") or {}).get("accepted")
                ),
                "quantity": sum(
                    float(((b.get("procurement") or {}).get("measuredQuantity")) or 0)
                    for b in today_bookings
                ),
                "pendingPayments": sum(
                    float(((b.get("payment") or {}).get("amount")) or 0)
                    for b in today_bookings
                    if (b.get("payment") or {}).get("status") == "PROCESSING"
                ),
            },
        })

    verified_count = sum(c.get("verified") == "VERIFIED" for c in db.get("centres", []))
    return jsonify({
        "stats": {
            "totalFarmers": len([u for u in db.get("users", []) if u.get("role") == "FARMER"]),
            "verifiedFarmers": len([u for u in db.get("users", []) if u.get("role") == "FARMER" and u.get("verification") == "VERIFIED"]),
            "centres": len(db.get("centres", [])),
            "verifiedCentres": verified_count,
            "bookings": len(db.get("bookings", [])),
            "pendingPayments": sum(float(((b.get("payment") or {}).get("amount")) or 0) for b in db.get("bookings", []) if (b.get("payment") or {}).get("status") == "PROCESSING"),
        },
        "verificationRequests": [
            r for r in db.get("verificationRequests", []) if r["status"] == "PENDING"
        ],
        "centres": db.get("centres", []),
        "verified": verified_count,
    })


@app.get("/api/centres")
@auth_required()
def centres(user):
    db = read_db()
    centres_list = [
        c for c in db.get("centres", [])
        if user["role"] != "FARMER" or c.get("verified") == "VERIFIED"
    ]

    crop = request.args.get("crop")
    term = (request.args.get("q") or "").strip().lower()

    if crop and crop not in ("all", "All crops"):
        centres_list = [c for c in centres_list if crop in c.get("crops", [])]

    if term:
        centres_list = [
            c for c in centres_list
            if term in f"{c.get('name', '')} {c.get('district', '')} {c.get('locality', '')} {c.get('address', '')} {' '.join(c.get('crops', []))}".lower()
        ]

    return jsonify([centre_view(db, centre) for centre in centres_list])


@app.get("/api/centres/<centre_id>")
@auth_required()
def centre_detail(user, centre_id):
    db = read_db()
    centre = next((c for c in db.get("centres", []) if c["id"] == centre_id), None)
    if not centre:
        return error("Procurement centre not found.", 404)

    # Prevent past date selection: clamp to today if before today
    raw_date = request.args.get("date")
    parsed = parse_booking_date(raw_date)
    requested_date = parsed if (parsed and parsed >= today_local()) else today_local()

    result = centre_view(db, centre, requested_date)
    result["slots"] = slots_for_date(db, centre, requested_date)
    result["selectedDate"] = requested_date.isoformat()
    result["minBookingDate"] = booking_date_bounds()[0].isoformat()
    result["maxBookingDate"] = booking_date_bounds()[1].isoformat()
    return jsonify(result)


@app.get("/api/centres/<centre_id>/slots")
@auth_required()
def centre_slots(user, centre_id):
    db = read_db()
    centre = next((c for c in db.get("centres", []) if c["id"] == centre_id), None)
    if not centre:
        return error("Procurement centre not found.", 404)
    raw_date = request.args.get("date")
    parsed = parse_booking_date(raw_date)
    requested_date = parsed if (parsed and parsed >= today_local()) else today_local()
    return jsonify(slots_for_date(db, centre, requested_date))


@app.get("/api/bookings")
@auth_required()
def bookings(user):
    db = read_db()
    if user["role"] == "FARMER":
        items = [b for b in db.get("bookings", []) if b["farmerId"] == user["id"]]
    elif user["role"] == "BUYER":
        items = [b for b in db.get("bookings", []) if b["centreId"] == user.get("centreId")]
    else:
        items = db.get("bookings", [])

    return jsonify([
        {**booking_view(db, b), "queue": queue_info(db, b)}
        for b in items
    ])


@app.post("/api/bookings")
@auth_required()
def create_booking(user):
    if user["role"] != "FARMER":
        return error("Only farmer accounts can book a procurement slot.", 403)

    db = read_db()
    values = request.get_json(silent=True) or {}
    centre = next((c for c in db.get("centres", []) if c["id"] == values.get("centreId")), None)
    target_date = parse_booking_date(values.get("date"))

    if not centre or centre.get("verified") != "VERIFIED":
        return error("This centre is not currently accepting farmer bookings.")

    # Strict past date check
    if not target_date or target_date < today_local():
        return error(f"Cannot book a slot for a past date. Please choose today ({today_local().isoformat()}) or an upcoming date.")

    if not booking_date_is_allowed(target_date):
        start, end = booking_date_bounds()
        return error(f"Bookings are available from {start.isoformat()} to {end.isoformat()} only.")

    slot_list = slots_for_date(db, centre, target_date)
    slot = next((item for item in slot_list if item["id"] == values.get("slotId")), None)
    
    if not slot or slot["isPast"] or slot["booked"] >= slot["total"]:
        return error("This slot is no longer available. Please select another slot.")

    try:
        quantity = float(values.get("quantity") or 0)
    except (TypeError, ValueError):
        return error("Enter a valid crop quantity.")
    if quantity <= 0:
        return error("Crop quantity must be greater than zero.")

    active_statuses = {"BOOKED", "CHECKED_IN", "WAITING", "CALLED", "PROCESSING"}
    if any(
        booking["farmerId"] == user["id"]
        and booking.get("date") == target_date.isoformat()
        and booking.get("status") in active_statuses
        for booking in db.get("bookings", [])
    ):
        return error("You already have an active booking for this date. Check Track Queue before booking another slot.")

    same_day_tokens = [
        token_sort_key(booking.get("token", "A-0"))[1]
        for booking in db.get("bookings", [])
        if booking.get("centreId") == centre["id"] and booking.get("date") == target_date.isoformat()
    ]
    serial = max(same_day_tokens, default=0) + 1
    
    unique_id = new_booking_id(target_date, {item["id"] for item in db.get("bookings", [])})
    token_str = f"A-{str(serial).zfill(3)}"

    booking = {
        "id": unique_id,
        "token": token_str,
        "farmerId": user["id"],
        "centreId": centre["id"],
        "slotId": slot["id"],
        "crop": values.get("crop") or "Paddy",
        "variety": values.get("variety") or "Standard",
        "quantity": int(quantity) if quantity.is_integer() else quantity,
        "unit": values.get("unit") or "kg",
        "date": target_date.isoformat(),
        "time": slot["time"],
        "status": "BOOKED",
        "createdAt": now(),
        "procurement": None,
        "payment": None,
    }

    db.setdefault("bookings", []).append(booking)

    notify(
        db,
        user["id"],
        "BOOKING",
        "Booking confirmed",
        f"Booking {booking['id']} is confirmed! Your token is {booking['token']} at {centre['short']} on {booking['date']}.",
    )
    write_db(db)

    return jsonify({
        "message": "Booking confirmed",
        "booking": booking_view(db, booking),
        "queue": queue_info(db, booking),
    }), 201


@app.get("/api/queue/<booking_id>")
@auth_required()
def queue(user, booking_id):
    db = read_db()
    booking = find_booking(db, booking_id)
    if not booking:
        return error("Booking not found.", 404)

    if user["role"] == "FARMER" and booking["farmerId"] != user["id"]:
        return error("You cannot view another farmer’s queue.", 403)
    if user["role"] == "BUYER" and booking["centreId"] != user.get("centreId"):
        return error("This booking belongs to another centre.", 403)

    return jsonify(queue_info(db, booking))


@app.get("/api/notifications")
@auth_required()
def notifications(user):
    db = read_db()
    if user["role"] == "ADMIN":
        return jsonify(db.get("notifications", []))
    return jsonify([n for n in db.get("notifications", []) if n["userId"] == user["id"]])


@app.post("/api/buyer/bookings/<booking_id>/action")
@auth_required()
def buyer_action(user, booking_id):
    if user["role"] != "BUYER":
        return error("Only procurement-centre accounts can update the queue.", 403)

    db = read_db()
    booking = find_booking(db, booking_id)
    if not booking or booking["centreId"] != user.get("centreId"):
        return error("Booking not found at your centre.", 404)

    values = request.get_json(silent=True) or {}
    action = values.get("action")
    centre = next((c for c in db.get("centres", []) if c["id"] == booking["centreId"]), {"short": "Procurement Centre"})

    if action == "CHECK_IN":
        if booking["status"] != "BOOKED":
            return error("Only a booked farmer can be checked in.")
        booking["status"] = "WAITING"
        notify(
            db, booking["farmerId"], "QUEUE", "Check-in successful",
            f"You are checked in with token {booking['token']} (Booking ID: {booking['id']})."
        )

    elif action == "CALL":
        if booking["status"] not in {"WAITING", "CHECKED_IN"}:
            return error("Only a checked-in farmer can be called.")
        current = next(
            (
                item for item in db.get("bookings", [])
                if item["centreId"] == user.get("centreId")
                and item.get("date") == booking.get("date")
                and item["status"] == "PROCESSING"
                and item["id"] != booking["id"]
            ),
            None,
        )
        if current:
            return error(f"Token {current['token']} is still being processed. Complete that procurement before calling the next farmer.")
        booking["status"] = "PROCESSING"
        # High priority seller call notification
        notify(
            db, booking["farmerId"], "CALL", "📣 Your Token Has Been Called!",
            f"The procurement counter at {centre.get('short', 'Centre')} has called your token {booking['token']} (Booking: {booking['id']}). Please proceed to the counter immediately!"
        )

    elif action == "COMPLETE":
        if booking["status"] != "PROCESSING":
            return error("Only the farmer currently being processed can be completed.")
        booking["status"] = "COMPLETED"
        measured = float(values.get("measuredQuantity") or booking["quantity"])
        if measured.is_integer():
            measured = int(measured)
        booking["procurement"] = {
            "status": "COMPLETED",
            "declaredQuantity": booking["quantity"],
            "measuredQuantity": measured,
            "quality": values.get("quality") or "FAQ",
            "moisture": values.get("moisture") or "13.5%",
            "accepted": True,
        }
        rate = CROP_RATES.get(booking["crop"], 23.69)
        amount = measured * rate
        booking["payment"] = {
            "status": "PROCESSING",
            "rate": rate,
            "amount": round(amount, 2),
            "transactionId": None,
        }
        notify(
            db, booking["farmerId"], "PROCUREMENT", "Procurement completed",
            f"{booking['crop']} ({measured} {booking['unit']}) has been accepted. Payment processing of ₹{amount:,.2f} has started."
        )

    elif action == "REJECT":
        booking["status"] = "CANCELLED"
        reason = values.get("reason") or "Quality does not meet the standard specification."
        booking["procurement"] = {
            "status": "REJECTED",
            "reason": reason,
            "accepted": False,
        }
        notify(
            db, booking["farmerId"], "PROCUREMENT",
            "Crop verification rejected", reason
        )

    else:
        return error("Invalid queue action.")

    write_db(db)
    return jsonify({
        "message": "Queue updated",
        "booking": booking_view(db, booking),
        "queue": queue_info(db, booking),
    })


@app.post("/api/payments/<booking_id>/complete")
@auth_required()
def payment_complete(user, booking_id):
    if user["role"] not in ("BUYER", "ADMIN"):
        return error("Only an authorized centre or admin can update payments.", 403)

    db = read_db()
    booking = find_booking(db, booking_id)
    if not booking or not booking.get("payment"):
        return error("No payment record is available for this booking.", 404)
    if user["role"] == "BUYER" and booking["centreId"] != user.get("centreId"):
        return error("This payment belongs to another centre.", 403)

    booking["payment"]["status"] = "COMPLETED"
    booking["payment"]["transactionId"] = (
        f"TXN-DEMO-{booking['date'].replace('-', '')}-{booking['token'].replace('A-', '')}"
    )

    amount = booking["payment"]["amount"]
    formatted = f"{amount:,.0f}" if float(amount).is_integer() else f"{amount:,.2f}"
    notify(
        db, booking["farmerId"], "PAYMENT",
        "Payment processed successfully",
        f"₹{formatted} has been transferred and marked completed.",
    )
    write_db(db)
    return jsonify({
        "message": "Demo payment marked completed.",
        "booking": booking_view(db, booking),
    })


@app.get("/api/admin/verifications")
@auth_required()
def admin_verifications(user):
    if user["role"] != "ADMIN":
        return error("Admin access required.", 403)

    db = read_db()
    result = []
    for req in db.get("verificationRequests", []):
        item = dict(req)
        item["centre"] = next(
            (c for c in db.get("centres", []) if c["id"] == req.get("centreId")),
            {
                "name": "Pending Demo Procurement Centre",
                "district": "North 24 Parganas",
                "capacity": 70,
                "crops": ["Paddy"],
            },
        )
        result.append(item)
    return jsonify(result)


@app.post("/api/admin/verifications/<request_id>/<action>")
@auth_required()
def verification_action(user, request_id, action):
    if user["role"] != "ADMIN":
        return error("Admin access required.", 403)
    if action not in ("approve", "reject"):
        return error("Route not found.", 404)

    db = read_db()
    req = next((r for r in db.get("verificationRequests", []) if r["id"] == request_id), None)
    if not req:
        return error("Verification request not found.", 404)

    result = "VERIFIED" if action == "approve" else "REJECTED"
    req["status"] = result
    req["stage"] = "Admin Approval" if result == "VERIFIED" else "Rejected"
    req.setdefault("history", []).append(
        "Admin Approval — Verified" if result == "VERIFIED" else "Rejected — Demo review"
    )

    centre = next((c for c in db.get("centres", []) if c["id"] == req.get("centreId")), None)
    if centre:
        centre["verified"] = result

    write_db(db)
    return jsonify({
        "message": f"Centre {result.lower()} successfully.",
        "request": req,
        "centre": centre,
    })


@app.get("/api/search")
@auth_required()
def search(user):
    db = read_db()
    term = (request.args.get("q") or "").strip().lower()

    def haystack(value):
        return term in json.dumps(value, ensure_ascii=False).lower()

    booking_items = [b for b in db.get("bookings", []) if haystack(b)]
    centre_items = [c for c in db.get("centres", []) if haystack(c)]

    if user["role"] == "FARMER":
        booking_items = [b for b in booking_items if b["farmerId"] == user["id"]]
    elif user["role"] == "BUYER":
        booking_items = [b for b in booking_items if b["centreId"] == user.get("centreId")]

    return jsonify({
        "bookings": [booking_view(db, b) for b in booking_items[:8]],
        "centres": centre_items[:5],
    })


@app.errorhandler(404)
def not_found(_):
    return error("Route not found.", 404)


@app.errorhandler(Exception)
def handle_exception(exc):
    app.logger.exception("Unhandled server error")
    return error("Something went wrong. Please try again.", 500)


if __name__ == "__main__":
    print(f"AgriProcure Flask is running at http://localhost:{PORT}")
    app.run(host="0.0.0.0", port=PORT, debug=False)
