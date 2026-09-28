const API = {
    donors: "/api/donors",
    donations: "/api/donations",
    bloodUnits: "/api/blood-units",
    issues: "/api/issues"
};


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {

    document.querySelectorAll(".section")
        .forEach(section => {
            section.classList.remove("active-section");
        });

    const section = document.getElementById(sectionId);

    if (section) {
        section.classList.add("active-section");
    }

    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    const navItems = document.querySelectorAll(".nav-item");

    navItems.forEach(item => {

        if (item.getAttribute("onclick")
            ?.includes(sectionId)) {

            item.classList.add("active");
        }

    });

    loadSectionData(sectionId);
}


/* =========================
   MODALS
========================= */

function openModal(id) {

    document.getElementById(id)
        .classList.add("show");
}


function closeModal(id) {

    document.getElementById(id)
        .classList.remove("show");
}


/* Close modal by clicking outside */

document.querySelectorAll(".modal-overlay")
    .forEach(modal => {

        modal.addEventListener("click", function (event) {

            if (event.target === modal) {
                modal.classList.remove("show");
            }

        });

    });


/* =========================
   API HELPER
========================= */

async function apiRequest(url, options = {}) {

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    if (!response.ok) {

        let message = "Request failed";

        try {

            const error = await response.json();

            message =
                error.message ||
                error.error ||
                message;

        } catch (e) {
        }

        throw new Error(message);
    }

    return response.json();
}


/* =========================
   LOAD ALL DASHBOARD DATA
========================= */

async function loadDashboard() {

    try {

        const [
            donors,
            bloodUnits,
            issues
        ] = await Promise.all([

            apiRequest(API.donors),

            apiRequest(API.bloodUnits),

            apiRequest(API.issues)

        ]);


        updateStatistics(
            donors,
            bloodUnits,
            issues
        );

        displayBloodStock(bloodUnits);

        displayAlerts(bloodUnits);

        displayRecentIssues(issues);

    } catch (error) {

        console.error(error);

        showConnectionError();

    }
}


/* =========================
   STATISTICS
========================= */

function updateStatistics(
    donors,
    bloodUnits,
    issues
) {

    const totalDonors =
        document.getElementById("totalDonors");

    const totalUnits =
        document.getElementById("totalUnits");

    const availableUnits =
        document.getElementById("availableUnits");

    const issuedUnits =
        document.getElementById("issuedUnits");


    totalDonors.textContent =
        donors.length;


    totalUnits.textContent =
        bloodUnits.length;


    availableUnits.textContent =
        bloodUnits.filter(
            unit =>
                unit.status === "AVAILABLE"
        ).length;


    issuedUnits.textContent =
        bloodUnits.filter(
            unit =>
                unit.status === "ISSUED"
        ).length;
}


/* =========================
   BLOOD STOCK
========================= */

function displayBloodStock(units) {

    const container =
        document.getElementById("bloodStock");

    const groups = [

        "A_POSITIVE",
        "A_NEGATIVE",
        "B_POSITIVE",
        "B_NEGATIVE",
        "AB_POSITIVE",
        "AB_NEGATIVE",
        "O_POSITIVE",
        "O_NEGATIVE"

    ];


    const labels = {

        A_POSITIVE: "A+",
        A_NEGATIVE: "A-",

        B_POSITIVE: "B+",
        B_NEGATIVE: "B-",

        AB_POSITIVE: "AB+",
        AB_NEGATIVE: "AB-",

        O_POSITIVE: "O+",
        O_NEGATIVE: "O-"

    };


    const availableUnits =
        units.filter(
            unit =>
                unit.status === "AVAILABLE"
        );


    const counts = {};


    groups.forEach(group => {

        counts[group] =
            availableUnits.filter(
                unit =>
                    unit.bloodGroup === group
            ).length;

    });


    const maxCount =
        Math.max(
            ...Object.values(counts),
            1
        );


    container.innerHTML = "";


    groups.forEach(group => {

        const count =
            counts[group];

        const percentage =
            Math.min(
                (count / maxCount) * 100,
                100
            );


        container.innerHTML += `

            <div class="blood-row">

                <div class="blood-info">

                    <div class="blood-name">

                        <div class="blood-circle">
                            ${labels[group]}
                        </div>

                        ${labels[group]}

                    </div>

                    <span class="blood-count">
                        ${count} unit${count !== 1 ? "s" : ""}
                    </span>

                </div>

                <div class="progress">

                    <div
                        class="progress-bar"
                        style="width:${percentage}%">
                    </div>

                </div>

            </div>

        `;

    });
}


/* =========================
   INVENTORY ALERTS
========================= */

function displayAlerts(units) {

    const container =
        document.getElementById("alerts");


    const expired =
        units.filter(
            unit =>
                unit.status === "EXPIRED"
        );


    const expiring =
        units.filter(
            unit =>
                unit.status === "EXPIRING_SOON"
        );


    const alerts = [

        ...expired.map(unit => ({
            type: "expired",
            title: "Expired blood unit",
            text:
                `${formatBloodGroup(unit.bloodGroup)}
                 • Unit #${unit.id}`
        })),

        ...expiring.map(unit => ({
            type: "expiring",
            title: "Expiring soon",
            text:
                `${formatBloodGroup(unit.bloodGroup)}
                 • Unit #${unit.id}`
        }))

    ];


    if (alerts.length === 0) {

        container.innerHTML = `

            <div class="empty-state">
                ✓ No inventory alerts
            </div>

        `;

        return;
    }


    container.innerHTML = "";


    alerts.slice(0, 5)
        .forEach(alert => {

            container.innerHTML += `

                <div class="alert-item
                    ${alert.type === "expired"
                ? "alert-expired"
                : ""}">

                    <div class="alert-icon">

                        ${alert.type === "expired"
                ? "⚠"
                : "⏳"}

                    </div>

                    <div>

                        <strong>
                            ${alert.title}
                        </strong>

                        <span>
                            ${alert.text}
                        </span>

                    </div>

                </div>

            `;

        });
}


/* =========================
   RECENT ISSUES
========================= */

function displayRecentIssues(issues) {

    const tbody =
        document.getElementById("recentIssues");


    if (!issues.length) {

        tbody.innerHTML = `

            <tr>
                <td colspan="5">
                    <div class="empty-state">
                        No blood issues recorded yet.
                    </div>
                </td>
            </tr>

        `;

        return;
    }


    const recent =
        [...issues]
            .sort(
                (a, b) =>
                    new Date(b.issueDate) -
                    new Date(a.issueDate)
            )
            .slice(0, 5);


    tbody.innerHTML = "";


    recent.forEach(issue => {

        tbody.innerHTML += `

            <tr>

                <td>
                    <strong>
                        ${issue.patientName || "-"}
                    </strong>
                </td>

                <td>
                    ${issue.hospitalName || "-"}
                </td>

                <td>
                    ${formatBloodGroup(
            issue.bloodGroup
        )}
                </td>

                <td>
                    ${issue.quantity || 1}
                </td>

                <td>
                    ${formatDate(issue.issueDate)}
                </td>

            </tr>

        `;

    });
}


/* =========================
   INVENTORY TABLE
========================= */

async function loadInventory() {

    try {

        const units =
            await apiRequest(API.bloodUnits);

        const tbody =
            document.getElementById(
                "inventoryTable"
            );

        tbody.innerHTML = "";


        units.forEach(unit => {

            tbody.innerHTML += `

                <tr>

                    <td>#${unit.id}</td>

                    <td>
                        ${formatBloodGroup(
                unit.bloodGroup
            )}
                    </td>

                    <td>
                        ${formatDate(
                unit.collectionDate
            )}
                    </td>

                    <td>
                        ${formatDate(
                unit.expiryDate
            )}
                    </td>

                    <td>
                        ${statusBadge(unit.status)}
                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   DONOR TABLE
========================= */

async function loadDonors() {

    try {

        const donors =
            await apiRequest(API.donors);

        const tbody =
            document.getElementById(
                "donorsTable"
            );

        tbody.innerHTML = "";


        donors.forEach(donor => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        #${donor.id}
                    </td>

                    <td>
                        <strong>
                            ${donor.name}
                        </strong>
                    </td>

                    <td>
                        ${formatBloodGroup(
                donor.bloodGroup
            )}
                    </td>

                    <td>
                        ${donor.phone || "-"}
                    </td>

                    <td>
                        ${donor.email || "-"}
                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   DONATION TABLE
========================= */

async function loadDonations() {

    try {

        const donations =
            await apiRequest(API.donations);

        const tbody =
            document.getElementById(
                "donationsTable"
            );

        tbody.innerHTML = "";


        donations.forEach(donation => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        #${donation.id}
                    </td>

                    <td>
                        Donor #${donation.donor?.id || "-"}
                    </td>

                    <td>
                        ${formatDate(
                donation.donationDate
            )}
                    </td>

                    <td>
                        ${formatDate(
                donation.collectionDate
            )}
                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   ISSUE TABLE
========================= */

async function loadIssues() {

    try {

        const issues =
            await apiRequest(API.issues);

        const tbody =
            document.getElementById(
                "issuesTable"
            );

        tbody.innerHTML = "";


        issues.forEach(issue => {

            tbody.innerHTML += `

                <tr>

                    <td>
                        #${issue.id}
                    </td>

                    <td>
                        ${issue.patientName || "-"}
                    </td>

                    <td>
                        ${issue.hospitalName || "-"}
                    </td>

                    <td>
                        ${formatBloodGroup(
                issue.bloodGroup
            )}
                    </td>

                    <td>
                        ${issue.quantity || 1}
                    </td>

                    <td>
                        ${formatDate(
                issue.issueDate
            )}
                    </td>

                </tr>

            `;

        });

    } catch (error) {

        console.error(error);

    }
}


/* =========================
   SECTION DATA
========================= */

function loadSectionData(section) {

    if (section === "dashboard") {
        loadDashboard();
    }

    if (section === "inventory") {
        loadInventory();
    }

    if (section === "donors") {
        loadDonors();
    }

    if (section === "donations") {
        loadDonations();
    }

    if (section === "issues") {
        loadIssues();
    }
}


/* =========================
   ADD DONOR
========================= */

document.getElementById("donorForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const donor = {

            name:
            document.getElementById(
                "donorName"
            ).value,

            phone:
            document.getElementById(
                "donorPhone"
            ).value,

            email:
            document.getElementById(
                "donorEmail"
            ).value,

            bloodGroup:
            document.getElementById(
                "donorBloodGroup"
            ).value,

            dateOfBirth:
            document.getElementById(
                "donorDob"
            ).value

        };


        try {

            await apiRequest(API.donors, {

                method: "POST",

                body: JSON.stringify(donor)

            });


            alert("Donor added successfully!");

            this.reset();

            closeModal("donorModal");

            loadDashboard();

        } catch (error) {

            alert(error.message);

        }

    });


/* =========================
   RECORD DONATION
========================= */

document.getElementById("donationForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const donorId =
            document.getElementById(
                "donationDonorId"
            ).value;


        try {

            await apiRequest(
                `${API.donations}/donor/${donorId}`,
                {
                    method: "POST",

                    body: JSON.stringify({})
                }
            );


            alert(
                "Donation recorded successfully!"
            );

            this.reset();

            closeModal("donationModal");

            loadDashboard();

        } catch (error) {

            alert(error.message);

        }

    });


/* =========================
   ADD BLOOD UNIT
========================= */

document.getElementById("bloodUnitForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const bloodUnit = {

            bloodGroup:
            document.getElementById(
                "unitBloodGroup"
            ).value,

            collectionDate:
            document.getElementById(
                "unitCollectionDate"
            ).value,

            expiryDate:
            document.getElementById(
                "unitExpiryDate"
            ).value,

            donation: {

                id:
                    Number(
                        document.getElementById(
                            "unitDonationId"
                        ).value
                    )

            }

        };


        try {

            await apiRequest(
                API.bloodUnits,
                {
                    method: "POST",

                    body:
                        JSON.stringify(
                            bloodUnit
                        )
                }
            );


            alert(
                "Blood unit added successfully!"
            );

            this.reset();

            closeModal("bloodUnitModal");

            loadDashboard();

        } catch (error) {

            alert(error.message);

        }

    });


/* =========================
   ISSUE BLOOD
========================= */

document.getElementById("issueForm")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        const bloodGroup =
            document.getElementById(
                "issueBloodGroup"
            ).value;

        const patientName =
            document.getElementById(
                "issuePatient"
            ).value;

        const hospitalName =
            document.getElementById(
                "issueHospital"
            ).value;


        const params =
            new URLSearchParams({

                bloodGroup,
                hospitalName,
                patientName

            });


        try {

            await apiRequest(
                `${API.issues}?${params.toString()}`,
                {
                    method: "POST"
                }
            );


            alert(
                "Blood issued successfully!"
            );

            this.reset();

            closeModal("issueModal");

            loadDashboard();

        } catch (error) {

            alert(error.message);

        }

    });


/* =========================
   FORMATTERS
========================= */

function formatBloodGroup(group) {

    const labels = {

        A_POSITIVE: "A+",
        A_NEGATIVE: "A-",

        B_POSITIVE: "B+",
        B_NEGATIVE: "B-",

        AB_POSITIVE: "AB+",
        AB_NEGATIVE: "AB-",

        O_POSITIVE: "O+",
        O_NEGATIVE: "O-"

    };

    return labels[group] || group || "-";
}


function formatDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (isNaN(d)) {
        return date;
    }

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


function statusBadge(status) {

    const labels = {

        AVAILABLE: "Available",
        ISSUED: "Issued",
        EXPIRED: "Expired",
        EXPIRING_SOON: "Expiring Soon"

    };


    let css = "available";


    if (status === "ISSUED") {
        css = "issued";
    }

    if (status === "EXPIRED") {
        css = "expired";
    }

    if (status === "EXPIRING_SOON") {
        css = "expiring";
    }


    return `

        <span class="status ${css}">
            ${labels[status] || status}
        </span>

    `;
}


/* =========================
   CONNECTION ERROR
========================= */

function showConnectionError() {

    document.getElementById(
        "bloodStock"
    ).innerHTML = `

        <div class="empty-state">

            ⚠ Unable to load inventory.

            <br><br>

            Make sure Spring Boot is running.

        </div>

    `;

    document.getElementById(
        "alerts"
    ).innerHTML = `

        <div class="empty-state">

            Backend connection unavailable.

        </div>

    `;
}


/* =========================
   INITIAL LOAD
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadDashboard();

    }
);