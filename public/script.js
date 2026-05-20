// =======================
// LOGIN SYSTEM
// =======================

function login() {

    const user =
        document.getElementById("username").value;

    const pass =
        document.getElementById("password").value;

    if (user === "Admin" && pass === "ykspj83965bl") {

        document.getElementById(
            "loginScreen"
        ).style.display = "none";

        document.getElementById(
            "dashboard"
        ).style.display = "block";

        loadBooks();

    } else {

        alert("Invalid login");
    }
}

// =======================
// LOGOUT
// =======================

function logout() {

    document.getElementById(
        "dashboard"
    ).style.display = "none";

    document.getElementById(
        "loginScreen"
    ).style.display = "flex";
}

// =======================
// SECTION SWITCHING
// =======================

function showSection(section) {

    document.getElementById(
        "paceSection"
    ).style.display = "none";

    document.getElementById(
        "scorekeysSection"
    ).style.display = "none";

    document.getElementById(
        "addSection"
    ).style.display = "none";

    if (section === "pace") {

        document.getElementById(
            "paceSection"
        ).style.display = "block";
    }

    if (section === "scorekeys") {

        document.getElementById(
            "scorekeysSection"
        ).style.display = "block";
    }

    if (section === "add") {

        document.getElementById(
            "addSection"
        ).style.display = "block";

        // auto focus barcode input
        setTimeout(() => {

            const input =
                document.getElementById(
                    "barcodeInput"
                );

            if (input) {
                input.focus();
            }

        }, 200);
    }
}

// =======================
// LOAD MATERIALS
// =======================

async function loadBooks() {

    const res =
        await fetch("/books");

    let books =
        await res.json();

    // =========================
    // FILTER VALUES
    // =========================

    const search =
        document.getElementById(
            "searchInput"
        )?.value.toLowerCase() || "";

    const gradeFilter =
        document.getElementById(
            "gradeFilter"
        )?.value || "";

    const subjectFilter =
        document.getElementById(
            "subjectFilter"
        )?.value || "";

    const lowStockOnly =
        document.getElementById(
            "lowStockOnly"
        )?.checked || false;

    // =========================
    // APPLY FILTERS
    // =========================

    books = books.filter(book => {

        const matchesSearch =

            book.subject
                .toLowerCase()
                .includes(search)

            ||

            book.pace_number
                .toLowerCase()
                .includes(search);

        const matchesGrade =

            !gradeFilter ||

            book.grade === gradeFilter;

        const matchesSubject =

            !subjectFilter ||

            book.subject === subjectFilter;

        const matchesLowStock =

            !lowStockOnly ||

            book.quantity <= 2;

        return (

            matchesSearch &&
            matchesGrade &&
            matchesSubject &&
            matchesLowStock
        );
    });

    // =========================
    // DISPLAY
    // =========================

    const paceList =
        document.getElementById("bookList");

    const scoreList =
        document.getElementById("scoreKeyList");

    paceList.innerHTML = "";

    scoreList.innerHTML = "";

    books.forEach(book => {

        let warning = "";

        if (book.quantity <= 2) {

            warning = `
                <div class="lowStockWarning">
                    ⚠️ LOW STOCK
                </div>
            `;
        }

        const li =
            document.createElement("li");

        li.innerHTML = `

            <b>${book.subject}</b><br>

            PACE:
            ${book.pace_number}<br>

            ${book.grade}<br>

            Remaining Stock:
            ${book.quantity}

            ${warning}

            <br><br>

            <button onclick="borrow(${book.id})">
                Borrow
            </button>

            <button onclick="returnBook(${book.id})">
                Return
            </button>
        `;

        if (book.type === "PACE") {

            paceList.appendChild(li);

        } else {

            scoreList.appendChild(li);
        }
    });
}
// =======================
// ADD MATERIAL
// =======================

async function addBook() {

    const title =
        document.getElementById("title").value;

    const author =
        document.getElementById("author").value;

    const quantity =
        document.getElementById("quantity").value;

    const type =
        document.getElementById(
            "materialType"
        ).value;

    await fetch("/books", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            title,
            author,
            quantity,
            type
        })
    });

    alert("Material added successfully");

    // clear fields
    document.getElementById("title").value = "";

    document.getElementById("author").value = "";

    document.getElementById("quantity").value = "";

    document.getElementById("barcodeInput").value = "";

    loadBooks();

    // focus barcode input again
    document.getElementById(
        "barcodeInput"
    ).focus();
}

// =======================
// BORROW MATERIAL
// =======================

async function borrow(id) {

    const borrower =
        document.getElementById(
            "borrower"
        ).value;

    if (!borrower) {

        alert(
            "Enter borrower name first"
        );

        return;
    }

    await fetch(`/borrow/${id}`, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            borrower
        })
    });

    alert("Material borrowed");

    loadBooks();
}

// =======================
// RETURN MATERIAL
// =======================

async function returnBook(id) {

    await fetch(`/return/${id}`, {

        method: "POST"
    });

    alert("Material returned");

    loadBooks();
}

// =======================
// USB BARCODE SCANNER
// =======================

async function handleBarcode(event) {

    // USB scanners usually press Enter automatically
    if (event.key === "Enter") {

        const isbn =
            document.getElementById(
                "barcodeInput"
            ).value;

        fetchBookData(isbn);
    }
}

// =======================
// FETCH BOOK DATA
// =======================

async function fetchBookData(isbn) {

    try {

        const res =
            await fetch(
                `https://openlibrary.org/isbn/${isbn}.json`
            );

        if (!res.ok) {

            alert(
                "Book not found. Enter manually."
            );

            return;
        }

        const data =
            await res.json();

        document.getElementById(
            "title"
        ).value = data.title || "";

        // optional auto quantity
        document.getElementById(
            "quantity"
        ).value = 1;

    } catch (err) {

        console.log(err);

        alert(
            "Error fetching barcode data"
        );
    }
}
