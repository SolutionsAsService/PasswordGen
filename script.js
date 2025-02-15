document.addEventListener("DOMContentLoaded", function () {
    // Theme Toggle
    const themeToggle = document.getElementById("theme-switcher");
    const body = document.body;

    // Check Local Storage for Theme Preference
    if (localStorage.getItem("theme") === "dark") {
        body.classList.add("dark-mode");
    }

    // Toggle Theme Function
    themeToggle.addEventListener("click", function () {
        body.classList.toggle("dark-mode");

        // Store Theme Preference in Local Storage
        if (body.classList.contains("dark-mode")) {
            localStorage.setItem("theme", "dark");
        } else {
            localStorage.setItem("theme", "light");
        }
    });

    // Password Generator
    document.getElementById("generate-btn").addEventListener("click", generatePassword);

    function generatePassword() {
        const length = document.getElementById("length").value;
        const includeCaps = document.getElementById("includeCaps").checked;
        const includeSpecial = document.getElementById("includeSpecial").checked;
        const includeNumbers = document.getElementById("includeNumbers").checked;

        let chars = "abcdefghijklmnopqrstuvwxyz";
        if (includeCaps) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (includeSpecial) chars += "!@#$%^&*()_+~`|}{[]:;?><,./-=";
        if (includeNumbers) chars += "0123456789";

        let password = "";
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * chars.length);
            password += chars[randomIndex];
        }

        document.getElementById("passwordOutput").innerText = password;
    }
});
