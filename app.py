"""
AgriProcure Flask demo server.

This is a Flask port of the original dependency-free Node.js REST server.
The existing frontend (public/index.html, public/app.js, public/styles.css)
and demo datastore (data/agri-procure.json) are intentionally kept unchanged.
"""

import json
import os
import secrets
from datetime import datetime, timezone
from functools import wraps

from flask import Flask, jsonify, request, render_template

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
DB_FILE = os.path.join(DATA_DIR, "agri-procure.json")

PORT = int(os.environ.get("PORT", 5174))

app = Flask(__name__)

# In-memory demo sessions, equivalent to the original Node server.
sessions = {}

CROP_RATES = {
    "Paddy": 23.69,
    "Wheat": 24.25,
    "Maize": 20.9,
    "Mustard": 59.5,
    "Potato": 15.8,
    "Pulses": 72.4,
}


def uid(prefix):
    return f"{prefix}-{secrets.token_hex(3).upper()}"


def now():
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def read_db():
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        # The supplied project already includes this file. This fallback keeps
        # the server self-contained if it is deleted before first run.
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
    # Atomic-ish write to avoid leaving a half-written JSON file.
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
                # Keep the original distinction: unauthenticated vs wrong role
                if roles:
                    return error("Please sign in to continue.", 401)
                return error("Please sign in to continue.", 401)
            return fn(user, *args, **kwargs)
        return wrapper
    return decorator


def find_booking(db, booking_id):
    return next((b for b in db["bookings"] if b["id"] == booking_id), None)


def booking_view(db, booking):
    farmer = next((u for u in db["users"] if u["id"] == booking["farmerId"]), None)
    centre = next((c for c in db["centres"] if c["id"] == booking["centreId"]), None)
    result = dict(booking)
    result["farmer"] = safe_user(farmer) if farmer else None
    result["centre"] = centre
    return result


def queue_info(db, booking):
    centre = next((c for c in db["centres"] if c["id"] == booking["centreId"]), None)

    active_statuses = {"CHECKED_IN", "WAITING", "CALLED", "PROCESSING"}
    same_queue = [
        item for item in db["bookings"]
        if item["centreId"] == booking["centreId"] and item["status"] in active_statuses
    ]
    same_queue.sort(key=lambda item: token_sort_key(item["token"]))

    current = next(
        (item for item in db["bookings"]
         if item["centreId"] == booking["centreId"] and item["status"] == "PROCESSING"),
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
        "nowServing": current["token"] if current else "A-043",
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
    # Equivalent to JS localeCompare(..., {numeric:true}) for A-### demo tokens.
    m = __import__("re").search(r"(\d+)$", str(token))
    return (str(token)[:m.start()] if m else str(token), int(m.group(1)) if m else 0)


def notify(db, user_id, type_, title, message):
    db["notifications"].insert(
        0,
        {
            "id": uid("NT"),
            "userId": user_id,
            "type": type_,
            "title": title,
            "message": message,
            "read": False,
            "time": "Just now",
        },
    )


@app.get("/")
def index():
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "mode": "DEMO", "storage": "persistent demo datastore"})


@app.post("/api/auth/login")
def login():
    db = read_db()
    values = request.get_json(silent=True) or {}
    email = str(values.get("email") or "")
    password = values.get("password")
    role = values.get("role")

    user = next(
        (
            item for item in db["users"]
            if item.get("email", "").lower() == email.lower()
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
        "expires": datetime.now(timezone.utc).timestamp() + 60 * 60 * 8,
    }
    return jsonify({"token": token, "user": safe_user(user)})


@app.post("/api/auth/register")
def register():
    db = read_db()
    values = request.get_json(silent=True) or {}

    role = values.get("role")
    if role not in ("FARMER", "BUYER") or not values.get("name") or not values.get("email") or not values.get("password"):
        return error("Please complete the required fields.")

    email = str(values["email"]).lower()
    if any(item.get("email", "").lower() == email for item in db["users"]):
        return error("An account with this email already exists.")

    farmer_id = None
    if role == "FARMER":
        farmer_count = sum(1 for item in db["users"] if item.get("role") == "FARMER")
        farmer_id = f"FRM-2026-{str(farmer_count + 124).zfill(5)}"

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

    # The original JS omits undefined farmerId for buyers. Remove None for
    # equivalent JSON shape.
    if role == "BUYER":
        user.pop("farmerId", None)

    db["users"].append(user)

    if role == "BUYER":
        centre = {
            "id": f"PC-WB-{str(len(db['centres']) + 1).zfill(3)}",
            "buyerId": user["id"],
            "name": values.get("centreName") or f"{values['name']} Procurement Centre",
            "short": values.get("centreName") or "New Centre",
            "district": values.get("district") or "North 24 Parganas",
            "locality": f"{values.get('district') or 'North 24 Parganas'}, {values.get('state') or 'West Bengal'}",
            "address": values.get("address") or "Demo address",
            "capacity": int(values.get("capacity") or 60),
            "booked": 0,
            "queue": 0,
            "distance": 0,
            "crops": values.get("crops") or ["Paddy"],
            "verified": "PENDING",
            "hours": values.get("hours") or "09:00 AM – 04:00 PM",
            "processingTime": 7,
            "lat": 22.72,
            "lng": 88.48,
            "organization": values["name"],
        }
        db["centres"].append(centre)
        user["centreId"] = centre["id"]

        db["verificationRequests"].insert(
            0,
            {
                "id": uid("VR"),
                "centreId": centre["id"],
                "submitted": "01 Sep 2026",
                "status": "PENDING",
                "stage": "Registration Submitted",
                "contact": values.get("contact") or values["name"],
                "phone": values.get("phone") or "",
                "certificate": values.get("certificate") or "DEMO-PENDING",
                "document": "demo_upload_pending.pdf",
                "history": ["Registration Submitted"],
            },
        )

    write_db(db)
    return jsonify(
        {
            "message": "Registration successful. Prototype verification is pending.",
            "user": safe_user(user),
        }
    ), 201


@app.get("/api/me")
@auth_required()
def me(user):
    db = read_db()
    profile = (
        next((c for c in db["centres"] if c["id"] == user.get("centreId")), None)
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
        farmer_bookings = [b for b in db["bookings"] if b["farmerId"] == user["id"]]
        farmer_bookings.sort(key=lambda b: b["createdAt"], reverse=True)
        booking = farmer_bookings[0] if farmer_bookings else None

        return jsonify({
            "user": user,
            "booking": booking_view(db, booking) if booking else None,
            "queue": queue_info(db, booking) if booking else None,
            "crops": [
                {"crop": b["crop"], "quantity": b["quantity"], "unit": b["unit"]}
                for b in farmer_bookings
            ],
            "notifications": [
                n for n in db["notifications"] if n["userId"] == user["id"]
            ][:5],
            "recommendations": sorted(
                [c for c in db["centres"] if c["verified"] == "VERIFIED"],
                key=lambda c: c["queue"] * 3 + c["distance"],
            )[:3],
        })

    if role == "BUYER":
        centre = next((c for c in db["centres"] if c["id"] == user.get("centreId")), None)
        bookings = [b for b in db["bookings"] if b["centreId"] == user.get("centreId")]
        checked_in_statuses = {"CHECKED_IN", "WAITING", "CALLED", "PROCESSING", "COMPLETED"}
        waiting_statuses = {"WAITING", "CHECKED_IN"}
        return jsonify({
            "centre": centre,
            "bookings": [booking_view(db, b) for b in bookings],
            "stats": {
                "totalSlots": centre["capacity"],
                "booked": centre["booked"],
                "checkedIn": sum(b["status"] in checked_in_statuses for b in bookings) + 52,
                "completed": sum(b["status"] == "COMPLETED" for b in bookings) + 30,
                "waiting": sum(b["status"] in waiting_statuses for b in bookings) + 10,
                "procurement": 482500,
                "quantity": 182.5,
                "pendingPayments": 124800,
            },
        })

    verified = sum(c["verified"] == "VERIFIED" for c in db["centres"])
    return jsonify({
        "stats": {
            "totalFarmers": 12450,
            "verifiedFarmers": 10842,
            "centres": 186,
            "verifiedCentres": 152,
            "bookings": 2840,
            "procurement": 1934,
            "pendingPayments": 2480000,
        },
        "verificationRequests": [
            r for r in db["verificationRequests"] if r["status"] == "PENDING"
        ],
        "centres": db["centres"],
        "verified": verified,
    })


@app.get("/api/centres")
@auth_required()
def centres(user):
    db = read_db()
    centres_list = [
        c for c in db["centres"]
        if user["role"] != "FARMER" or c["verified"] == "VERIFIED"
    ]

    crop = request.args.get("crop")
    term = (request.args.get("q") or "").lower()

    if crop and crop != "All crops":
        centres_list = [c for c in centres_list if crop in c["crops"]]

    if term:
        centres_list = [
            c for c in centres_list
            if f"{c['name']} {c['district']}".lower().find(term) >= 0
        ]

    result = []
    for centre in centres_list:
        item = dict(centre)
        item["availability"] = centre["capacity"] - centre["booked"]
        item["utilization"] = round((centre["booked"] / centre["capacity"]) * 100)
        item["estimatedWait"] = centre["queue"] * centre["processingTime"]
        result.append(item)
    return jsonify(result)


@app.get("/api/centres/<centre_id>")
@auth_required()
def centre_detail(user, centre_id):
    db = read_db()
    centre = next((c for c in db["centres"] if c["id"] == centre_id), None)
    if not centre:
        return error("Procurement centre not found.", 404)

    result = dict(centre)
    result["slots"] = [s for s in db["slots"] if s["centreId"] == centre["id"]]
    result["utilization"] = round(centre["booked"] / centre["capacity"] * 100)
    result["estimatedWait"] = centre["queue"] * centre["processingTime"]
    return jsonify(result)


@app.get("/api/centres/<centre_id>/slots")
@auth_required()
def centre_slots(user, centre_id):
    db = read_db()
    return jsonify([s for s in db["slots"] if s["centreId"] == centre_id])


@app.get("/api/bookings")
@auth_required()
def bookings(user):
    db = read_db()
    if user["role"] == "FARMER":
        items = [b for b in db["bookings"] if b["farmerId"] == user["id"]]
    elif user["role"] == "BUYER":
        items = [b for b in db["bookings"] if b["centreId"] == user["centreId"]]
    else:
        items = db["bookings"]

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
    centre = next((c for c in db["centres"] if c["id"] == values.get("centreId")), None)
    slot = next((s for s in db["slots"] if s["id"] == values.get("slotId")), None)

    if not centre or centre["verified"] != "VERIFIED":
        return error("This centre is not currently accepting farmer bookings.")
    if not slot or slot["centreId"] != centre["id"] or slot["booked"] >= slot["total"]:
        return error("This slot is no longer available. Please select another slot.")

    serial = 47 + len([b for b in db["bookings"] if b["centreId"] == centre["id"]]) + 1
    booking = {
        "id": f"BK-2026-{str(472 + len(db['bookings'])).zfill(5)}",
        "token": f"A-{str(serial).zfill(3)}",
        "farmerId": user["id"],
        "centreId": centre["id"],
        "slotId": slot["id"],
        "crop": values.get("crop") or "Paddy",
        "variety": values.get("variety") or "Standard",
        "quantity": float(values.get("quantity") or 100),
        "unit": values.get("unit") or "kg",
        "date": values.get("date") or slot["date"],
        "time": slot["time"],
        "status": "BOOKED",
        "createdAt": now(),
        "procurement": None,
        "payment": None,
    }
    # Keep integer quantities as integers where possible, matching JS JSON output.
    if isinstance(booking["quantity"], float) and booking["quantity"].is_integer():
        booking["quantity"] = int(booking["quantity"])

    db["bookings"].append(booking)
    slot["booked"] += 1
    centre["booked"] += 1
    centre["queue"] += 1

    notify(
        db,
        user["id"],
        "BOOKING",
        "Booking confirmed",
        f"Your token is {booking['token']} at {centre['short']}.",
    )
    write_db(db)

    return jsonify({
        "message": "Booking confirmed",
        "booking": booking_view(db, booking),
        "queue": queue_info(db, booking),
    }), 201


@app.get("/api/queue/<booking_id>")
@auth_required()
def queue( user, booking_id):
    db = read_db()
    booking = find_booking(db, booking_id)
    if not booking:
        return error("Booking not found.", 404)

    if user["role"] == "FARMER" and booking["farmerId"] != user["id"]:
        return error("You cannot view another farmer’s queue.", 403)
    if user["role"] == "BUYER" and booking["centreId"] != user["centreId"]:
        return error("This booking belongs to another centre.", 403)

    return jsonify(queue_info(db, booking))


@app.get("/api/notifications")
@auth_required()
def notifications(user):
    db = read_db()
    if user["role"] == "ADMIN":
        return jsonify(db["notifications"])
    return jsonify([n for n in db["notifications"] if n["userId"] == user["id"]])


@app.post("/api/buyer/bookings/<booking_id>/action")
@auth_required()
def buyer_action(user, booking_id):
    if user["role"] != "BUYER":
        return error("Only procurement-centre accounts can update the queue.", 403)

    db = read_db()
    booking = find_booking(db, booking_id)
    if not booking or booking["centreId"] != user["centreId"]:
        return error("Booking not found at your centre.", 404)

    values = request.get_json(silent=True) or {}
    action = values.get("action")

    if action == "CHECK_IN":
        booking["status"] = "WAITING"
        notify(
            db, booking["farmerId"], "QUEUE", "Check-in successful",
            f"You are checked in with token {booking['token']}."
        )

    elif action == "CALL":
        for item in db["bookings"]:
            if item["centreId"] == user["centreId"] and item["status"] == "PROCESSING":
                item["status"] = "COMPLETED"
        booking["status"] = "PROCESSING"
        notify(
            db, booking["farmerId"], "QUEUE", "Your token has been called",
            f"Please proceed to the procurement counter. Token {booking['token']} is now processing."
        )

    elif action == "COMPLETE":
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
        rate = CROP_RATES.get(booking["crop"], 20)
        amount = measured * rate
        booking["payment"] = {
            "status": "PROCESSING",
            "rate": rate,
            "amount": round(amount, 2),
            "transactionId": None,
        }
        notify(
            db, booking["farmerId"], "PROCUREMENT", "Procurement completed",
            f"{booking['crop']} has been accepted. Payment processing has started."
        )

    elif action == "REJECT":
        booking["status"] = "CANCELLED"
        reason = values.get("reason") or "Quality does not meet the demo specification."
        booking["procurement"] = {
            "status": "REJECTED",
            "reason": reason,
            "accepted": False,
        }
        notify(
            db, booking["farmerId"], "PROCUREMENT",
            "Crop verification needs attention", reason
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
    if user["role"] == "BUYER" and booking["centreId"] != user["centreId"]:
        return error("This payment belongs to another centre.", 403)

    booking["payment"]["status"] = "COMPLETED"
    booking["payment"]["transactionId"] = (
        f"TXN-DEMO-20260905-{booking['token'].replace('A-', '')}"
    )

    amount = booking["payment"]["amount"]
    formatted = f"{amount:,.0f}" if float(amount).is_integer() else f"{amount:,.2f}"
    notify(
        db, booking["farmerId"], "PAYMENT",
        "Payment processed successfully",
        f"₹{formatted} has been marked as completed in DEMO MODE.",
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
    for req in db["verificationRequests"]:
        item = dict(req)
        item["centre"] = next(
            (c for c in db["centres"] if c["id"] == req.get("centreId")),
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
    req = next((r for r in db["verificationRequests"] if r["id"] == request_id), None)
    if not req:
        return error("Verification request not found.", 404)

    result = "VERIFIED" if action == "approve" else "REJECTED"
    req["status"] = result
    req["stage"] = "Admin Approval" if result == "VERIFIED" else "Rejected"
    req["history"].append(
        "Admin Approval — Verified" if result == "VERIFIED" else "Rejected — Demo review"
    )

    centre = next((c for c in db["centres"] if c["id"] == req.get("centreId")), None)
    if centre:
        centre["verified"] = result

    write_db(db)
    return jsonify({
        "message": f"Centre {result.lower()} successfully in demo mode.",
        "request": req,
        "centre": centre,
    })


@app.get("/api/search")
@auth_required()
def search(user):
    if user["role"] not in ("BUYER", "ADMIN"):
        return error("Search is available to buyers and administrators.", 403)

    db = read_db()
    term = request.args.get("q") or ""

    def haystack(value):
        return term.lower() in json.dumps(value, ensure_ascii=False).lower()

    booking_items = [b for b in db["bookings"] if haystack(b)]
    centre_items = [c for c in db["centres"] if haystack(c)]

    if user["role"] != "ADMIN":
        booking_items = [b for b in booking_items if b["centreId"] == user["centreId"]]

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
