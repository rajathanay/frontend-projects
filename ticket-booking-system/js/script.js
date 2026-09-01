const seatGrid =
    document.getElementById("seat-grid");

const eventSelect =
    document.getElementById("event-select");

const selectedSeatsText =
    document.getElementById("selected-seats");

const ticketCount =
    document.getElementById("ticket-count");

const ticketPrice =
    document.getElementById("ticket-price");

const totalPrice =
    document.getElementById("total-price");

const bookingForm =
    document.getElementById("booking-form");

const bookButton =
    document.getElementById("book-button");

const refreshButton =
    document.getElementById("refresh-seats");

const statusMessage =
    document.getElementById("status-message");


const TOTAL_SEATS = 40;
const STORAGE_KEY = "seatbook-bookings";

let selectedSeats =
    new Set();

let heldSeats =
    new Set();

let currentEvent =
    eventSelect.value;

let currentPrice =
    getEventPrice();

let bookedSeats =
    getBookedSeats(currentEvent);


/* Seat creation and selection */

function createSeats() {

    seatGrid.innerHTML = "";

    for (
        let seatNumber = 1;
        seatNumber <= TOTAL_SEATS;
        seatNumber++
    ) {

        const seat =
            document.createElement("button");

        seat.type =
            "button";

        seat.className =
            "seat";

        seat.textContent =
            seatNumber;

        seat.dataset.seat =
            seatNumber;

        seat.setAttribute(
            "aria-label",
            `Seat ${seatNumber}`
        );

        seatGrid.appendChild(seat);
    }

    renderSeats();
}


seatGrid.addEventListener(
    "click",
    function (event) {

        const seat =
            event.target.closest(".seat");

        if (
            !seat
            ||
            seat.disabled
        ) {
            return;
        }

        const seatNumber =
            Number(seat.dataset.seat);

        if (
            selectedSeats.has(seatNumber)
        ) {

            selectedSeats.delete(
                seatNumber
            );

        } else {

            selectedSeats.add(
                seatNumber
            );
        }

        renderSeats();
        updateSummary();
    }
);


function renderSeats() {

    document
        .querySelectorAll(".seat")
        .forEach(
            seat => {

                const seatNumber =
                    Number(
                        seat.dataset.seat
                    );

                const unavailable =
                    bookedSeats.has(
                        seatNumber
                    )
                    ||
                    heldSeats.has(
                        seatNumber
                    );


                seat.classList.remove(
                    "selected",
                    "booked"
                );

                seat.disabled =
                    unavailable;


                if (unavailable) {

                    seat.classList.add(
                        "booked"
                    );

                    return;
                }


                if (
                    selectedSeats.has(
                        seatNumber
                    )
                ) {

                    seat.classList.add(
                        "selected"
                    );
                }
            }
        );
}


function updateSummary() {

    const seats =
        [...selectedSeats]
            .sort(
                (a, b) => a - b
            );

    const count =
        seats.length;

    selectedSeatsText.textContent =
        count
            ? seats.join(", ")
            : "None";

    ticketCount.textContent =
        count;

    ticketPrice.textContent =
        `$${currentPrice}`;

    totalPrice.textContent =
        `$${count * currentPrice}`;
}


/* Event and live availability */

eventSelect.addEventListener(
    "change",
    async function () {

        currentEvent =
            eventSelect.value;

        currentPrice =
            getEventPrice();

        selectedSeats.clear();
        heldSeats.clear();

        bookedSeats =
            getBookedSeats(
                currentEvent
            );

        updateSummary();
        renderSeats();

        await refreshAvailability();
    }
);


refreshButton.addEventListener(
    "click",
    refreshAvailability
);


async function refreshAvailability() {

    showStatus(
        "Checking live seat availability..."
    );

    refreshButton.disabled =
        true;

    await wait(600);

    const availableSeats =
        [];

    for (
        let seat = 1;
        seat <= TOTAL_SEATS;
        seat++
    ) {

        if (
            !bookedSeats.has(seat)
            &&
            !selectedSeats.has(seat)
        ) {

            availableSeats.push(
                seat
            );
        }
    }

    shuffle(availableSeats);

    heldSeats =
        new Set(
            availableSeats.slice(
                0,
                Math.min(
                    4,
                    availableSeats.length
                )
            )
        );

    renderSeats();

    refreshButton.disabled =
        false;

    showStatus(
        "Seat availability updated."
    );
}


function getEventPrice() {

    return Number(
        eventSelect
            .selectedOptions[0]
            .dataset.price
    );
}


/* Booking */

bookingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        clearStatus();

        if (
            selectedSeats.size === 0
        ) {

            showStatus(
                "Select at least one seat before booking.",
                "error"
            );

            return;
        }

        if (
            !bookingForm.checkValidity()
        ) {

            bookingForm.reportValidity();

            return;
        }

        try {

            bookButton.disabled =
                true;

            bookButton.textContent =
                "Confirming...";

            showStatus(
                "Checking your seats..."
            );

            await confirmSeatsAvailable();

            const reference =
                createBookingReference();

            selectedSeats.forEach(
                seat => {

                    bookedSeats.add(seat);
                }
            );

            saveBookedSeats(
                currentEvent,
                bookedSeats
            );

            heldSeats =
                new Set(
                    [...heldSeats]
                        .filter(
                            seat =>
                                !bookedSeats.has(
                                    seat
                                )
                        )
                );

            selectedSeats.clear();

            bookingForm.reset();

            renderSeats();
            updateSummary();

            showStatus(
                `Booking confirmed. Reference: ${reference}`,
                "success"
            );

        } catch (error) {

            bookedSeats =
                getBookedSeats(
                    currentEvent
                );

            selectedSeats.clear();

            renderSeats();
            updateSummary();

            showStatus(
                error.message,
                "error"
            );

        } finally {

            bookButton.disabled =
                false;

            bookButton.textContent =
                "Confirm Booking";
        }
    }
);


async function confirmSeatsAvailable() {

    await wait(800);

    const latestBookedSeats =
        getBookedSeats(
            currentEvent
        );

    const unavailable =
        [...selectedSeats]
            .filter(
                seat =>
                    latestBookedSeats.has(
                        seat
                    )
            );

    if (unavailable.length > 0) {

        throw new Error(
            `Seat ${unavailable.join(", ")} is no longer available.`
        );
    }
}


/* LocalStorage */

function getSavedBookings() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (!saved) {

        return {};
    }

    try {

        return JSON.parse(saved);

    } catch {

        return {};
    }
}


function getBookedSeats(
    eventName
) {

    const bookings =
        getSavedBookings();

    return new Set(
        bookings[eventName]
        || []
    );
}


function saveBookedSeats(
    eventName,
    seats
) {

    const bookings =
        getSavedBookings();

    bookings[eventName] =
        [...seats];

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            bookings
        )
    );
}


function wait(milliseconds) {

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                milliseconds
            );
        }
    );
}


function shuffle(items) {

    for (
        let i = items.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random()
                * (i + 1)
            );

        [
            items[i],
            items[j]
        ] = [
            items[j],
            items[i]
        ];
    }
}


const createBookingReference =
    (() => {

        let number = 1;

        return function () {

            const time =
                Date.now()
                    .toString()
                    .slice(-6);

            return `SB-${time}-${number++}`;
        };
    })();


function showStatus(
    message,
    type = ""
) {

    statusMessage.textContent =
        message;

    statusMessage.className =
        "status-message";

    if (type) {

        statusMessage.classList.add(
            type
        );
    }
}


function clearStatus() {

    showStatus("");
}


createSeats();
updateSummary();
refreshAvailability();