"use strict";

// DOM Elements
const menuEl = document.getElementById("menu");
const postListEl = document.getElementById("guestbook");
const loginformEl = document.getElementById("loginform");
const registerformEl = document.getElementById("registerform");
const postformEl = document.getElementById("postform");

// Run on page load
window.onload = init;

function init() {
    changeMenu();

    if (postListEl) {
        getGuestbook();
    }

    if (loginformEl) {
        loginformEl.addEventListener("submit", loginUser);
    }

    if (postformEl) {
        postformEl.addEventListener("submit", newPost);
    }

    if (registerformEl) {
        registerformEl.addEventListener("submit", registerUser);
    }
}

// Fetch guestbook posts
async function getGuestbook() {
    try {
        const response = await fetch("https://db-ingrid.onrender.com/api", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.ok) {
            const data = await response.json();
            loadGuestbook(data);
        } else {
            console.error("Failed to fetch guestbook posts");
        }
    } catch (error) {
        console.error("Error fetching guestbook:", error);
    }
}

// Display posts on page
function loadGuestbook(posts) {
    postListEl.innerHTML = "";
const sortedPosts = posts.sort((a, b) => (b.created) - (a.created));
console.log(sortedPosts)  
sortedPosts.forEach(post => {
        const postEl = document.createElement("li");
        postEl.className = "post_li";
        postEl.innerHTML = `
            <p id="from">från ${post.author}, ${new Date(post.created).toLocaleDateString}</p>
            <p id="textinput">${post.textinput}</p>
            ${post.image ? `<img src="${post.image}" alt="post image">` : ""}
        `;
        postListEl.appendChild(postEl);
    });
}

// Update menu based on login status
function changeMenu() {
    if (localStorage.getItem("JWT_token")) {
        menuEl.innerHTML = `
            <ul>
                <li><a href="index.html">Gästbok</a></li>
                <li><a href="newpost.html">Nytt inlägg</a></li>
                <li><a id="logout" href="#">Logga ut</a></li>
            </ul>
        `;
    } else {
        menuEl.innerHTML = `
            <ul>
                <li><a href="index.html">Gästbok</a></li>
                <li><a href="login.html">Logga in</a></li>
                <li><a href="register.html">Registrera dig</a></li>
            </ul>
        `;
    }

    const logoutEl = document.getElementById("logout");
    if (logoutEl) {
        logoutEl.addEventListener("click", () => {
            localStorage.removeItem("JWT_token");
            window.location.href = "index.html";
        });
    }
}

// Login user
async function loginUser(e) {
    e.preventDefault();

    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Vänligen fyll i alla fält");
        return;
    }

    try {
        const resp = await fetch("https://db-ingrid.onrender.com/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (resp.ok) {
            const data = await resp.json();
            localStorage.setItem("JWT_token", data.token);
            window.location.href = "newpost.html";
        } else {
            alert("Felaktigt användarnamn eller lösenord");
        }
    } catch (error) {
        console.error("Login error:", error);
        alert("Något gick fel vid inloggning.");
    }
}

// Register user
async function registerUser(e) {
    e.preventDefault();

    const username = document.getElementById("name").value;
    const password = document.getElementById("password").value;

    if (!username || !password) {
        alert("Vänligen fyll i alla fält");
        return;
    }

    try {
        const resp = await fetch("https://db-ingrid.onrender.com/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        });

        if (resp.ok) {
            alert("Användare skapad! Logga in för att skriva ett inlägg.");
            window.location.href = "login.html";
        } else {
            alert("Användarnamnet finns redan.");
        }
    } catch (error) {
        console.error("Registration error:", error);
        alert("Något gick fel vid registrering.");
    }
}

// Create new post
async function newPost(e) {
    e.preventDefault();

    const textinput = document.getElementById("textinput").value;
    const imageFile = document.getElementById("image").files[0];

    if (!textinput) {
        alert("Vänligen skriv ett inlägg");
        return;
    }

    const formData = new FormData();
    formData.append("textinput", textinput);
    if (imageFile) {
        formData.append("image", imageFile);
    }

    try {
        const resp = await fetch("https://db-ingrid.onrender.com/api/newpost", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("JWT_token")}`
                // DO NOT set Content-Type here when using FormData
            },
            body: formData
        });

        if (resp.ok) {
            const data = await resp.json();
            alert("Inlägget har skapats");
            window.location.href = "index.html";
        } else {
            console.error("Create post failed", await resp.json());
            alert("Det gick inte att skapa inlägget");
        }
    } catch (error) {
        console.error("Post error:", error);
        alert("Något gick fel vid skapandet av inlägget.");
    }
}