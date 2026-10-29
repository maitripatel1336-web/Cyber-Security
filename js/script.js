/* ==========================================
   SECURETEXT
   Encryption & Decryption Application
   JavaScript Functionality
========================================== */


/* ==========================================
   1. DOM ELEMENTS
========================================== */

const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const passwordInput = document.getElementById("password");

const encryptBtn = document.getElementById("encryptBtn");
const decryptBtn = document.getElementById("decryptBtn");

const clearInputBtn = document.getElementById("clearInput");
const clearAllBtn = document.getElementById("clearAllBtn");

const copyBtn = document.getElementById("copyBtn");
const downloadBtn = document.getElementById("downloadBtn");

const togglePasswordBtn = document.getElementById("togglePassword");

const charCount = document.getElementById("charCount");
const outputCount = document.getElementById("outputCount");

const resultBadge = document.getElementById("resultBadge");

const resultMessage = document.getElementById("resultMessage");
const resultMessageIcon = document.getElementById("resultMessageIcon");
const resultMessageText = document.getElementById("resultMessageText");

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const currentYear = document.getElementById("currentYear");


/* ==========================================
   2. UPDATE CHARACTER COUNTS
========================================== */

function updateCharacterCounts() {
    charCount.textContent =
        `${inputText.value.length} characters`;

    outputCount.textContent =
        `${outputText.value.length} characters`;
}

inputText.addEventListener("input", updateCharacterCounts);


/* ==========================================
   3. RESULT MESSAGE
========================================== */

function showMessage(message, type = "info") {

    resultMessage.className = "result-message";

    if (type === "success") {
        resultMessage.classList.add("success");
        resultMessageIcon.textContent = "✓";
        resultBadge.textContent = "SUCCESS";
        resultBadge.className = "result-badge success";

    } else if (type === "error") {
        resultMessage.classList.add("error");
        resultMessageIcon.textContent = "!";
        resultBadge.textContent = "ERROR";
        resultBadge.className = "result-badge error";

    } else {
        resultMessageIcon.textContent = "ℹ";
        resultBadge.textContent = "WAITING";
        resultBadge.className = "result-badge";
    }

    resultMessageText.textContent = message;
}


/* ==========================================
   4. CLEAR PREVIOUS RESULT
========================================== */

function clearPreviousResult() {

    outputText.value = "";

    updateCharacterCounts();

    showMessage("Your result will appear here.");
}


/* ==========================================
   5. PASSWORD VALIDATION
========================================== */

function validateInputs() {

    const message = inputText.value;
    const password = passwordInput.value;

    if (!message.trim()) {
        showMessage("Please enter a message first.", "error");
        inputText.focus();
        return false;
    }

    if (!password) {
        showMessage("Please enter your password.", "error");
        passwordInput.focus();
        return false;
    }

    if (password.length < 12) {
        showMessage(
            "Use a password with at least 12 characters.",
            "error"
        );

        passwordInput.focus();
        return false;
    }

    return true;
}


/* ==========================================
   6. ENCRYPT TEXT
========================================== */

async function encryptText() {

    clearPreviousResult();

    if (!validateInputs()) {
        return;
    }

    if (!window.crypto || !window.crypto.subtle) {
        showMessage(
            "Secure encryption is unavailable. Open this website through localhost or HTTPS.",
            "error"
        );

        return;
    }

    encryptBtn.disabled = true;
    decryptBtn.disabled = true;

    try {

        const message = inputText.value;
        const password = passwordInput.value;

        showMessage("Encrypting your message...");

        /*
         * Generate a random salt and IV.
         */

        const salt = window.crypto.getRandomValues(
            new Uint8Array(16)
        );

        const iv = window.crypto.getRandomValues(
            new Uint8Array(12)
        );

        /*
         * Convert password into an AES key
         * using PBKDF2.
         */

        const passwordBytes = new TextEncoder().encode(password);

        const passwordKey = await window.crypto.subtle.importKey(
            "raw",
            passwordBytes,
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const encryptionKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 600000,
                hash: "SHA-256"
            },
            passwordKey,
            {
                name: "AES-GCM",
                length: 256
            },
            false,
            ["encrypt"]
        );

        /*
         * Encrypt the message using AES-256-GCM.
         */

        const encryptedData = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv,
                tagLength: 128
            },
            encryptionKey,
            new TextEncoder().encode(message)
        );

        /*
         * Package the salt, IV and encrypted data.
         */

        const combinedData = new Uint8Array(
            salt.length + iv.length + encryptedData.byteLength
        );

        combinedData.set(salt, 0);
        combinedData.set(iv, salt.length);
        combinedData.set(
            new Uint8Array(encryptedData),
            salt.length + iv.length
        );

        /*
         * Convert the package into Base64.
         */

        let binaryString = "";

        for (const byte of combinedData) {
            binaryString += String.fromCharCode(byte);
        }

        const encodedResult = btoa(binaryString);

        /*
         * Add a version prefix to identify
         * SecureText encrypted messages.
         */

        outputText.value = "ST1:" + encodedResult;

        updateCharacterCounts();

        showMessage(
            "Encryption successful! Your message is now encrypted.",
            "success"
        );

    } catch (error) {

        console.error("Encryption error:", error);

        showMessage(
            "Encryption failed. Please try again.",
            "error"
        );

    } finally {

        encryptBtn.disabled = false;
        decryptBtn.disabled = false;

    }
}


/* ==========================================
   7. DECRYPT TEXT
========================================== */

async function decryptText() {

    clearPreviousResult();

    if (!validateInputs()) {
        return;
    }

    if (!window.crypto || !window.crypto.subtle) {
        showMessage(
            "Secure decryption is unavailable. Open this website through localhost or HTTPS.",
            "error"
        );

        return;
    }

    decryptBtn.disabled = true;
    encryptBtn.disabled = true;

    try {

        const encryptedMessage = inputText.value.trim();
        const password = passwordInput.value;

        /*
         * Check the SecureText message format.
         */

        if (!encryptedMessage.startsWith("ST1:")) {

            showMessage(
                "Invalid format. Enter a message encrypted by SecureText.",
                "error"
            );

            return;
        }

        const base64Data = encryptedMessage.slice(4);

        let binaryString;

        try {

            binaryString = atob(base64Data);

        } catch {

            showMessage(
                "The encrypted message has an invalid format.",
                "error"
            );

            return;
        }

        const combinedData = Uint8Array.from(
            binaryString,
            character => character.charCodeAt(0)
        );

        /*
         * Minimum size:
         * 16-byte salt + 12-byte IV + 16-byte GCM tag.
         */

        if (combinedData.length < 44) {

            showMessage(
                "The encrypted message is incomplete or invalid.",
                "error"
            );

            return;
        }

        /*
         * Extract salt, IV and ciphertext.
         */

        const salt = combinedData.slice(0, 16);

        const iv = combinedData.slice(16, 28);

        const encryptedData = combinedData.slice(28);

        /*
         * Derive the same AES key from the password.
         */

        const passwordBytes = new TextEncoder().encode(password);

        const passwordKey = await window.crypto.subtle.importKey(
            "raw",
            passwordBytes,
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        const decryptionKey = await window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: salt,
                iterations: 600000,
                hash: "SHA-256"
            },
            passwordKey,
            {
                name: "AES-GCM",
                length: 256
            },
            false,
            ["decrypt"]
        );

        /*
         * Decrypt and authenticate the message.
         */

        const decryptedData = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv,
                tagLength: 128
            },
            decryptionKey,
            encryptedData
        );

        outputText.value = new TextDecoder(
            "utf-8",
            { fatal: true }
        ).decode(decryptedData);

        updateCharacterCounts();

        showMessage(
            "Decryption successful! Your original message has been recovered.",
            "success"
        );

    } catch (error) {

        console.error("Decryption error:", error);

        showMessage(
            "Decryption failed. Check your password and encrypted text.",
            "error"
        );

    } finally {

        decryptBtn.disabled = false;
        encryptBtn.disabled = false;

    }
}


/* ==========================================
   8. SHOW / HIDE PASSWORD
========================================== */

togglePasswordBtn.addEventListener("click", function () {

    const isPasswordHidden =
        passwordInput.type === "password";

    passwordInput.type =
        isPasswordHidden ? "text" : "password";

    togglePasswordBtn.textContent =
        isPasswordHidden ? "Hide" : "Show";

    togglePasswordBtn.setAttribute(
        "aria-label",
        isPasswordHidden ? "Hide password" : "Show password"
    );

});


/* ==========================================
   9. COPY RESULT
========================================== */

copyBtn.addEventListener("click", async function () {

    if (!outputText.value) {

        showMessage(
            "There is no result to copy.",
            "error"
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(outputText.value);

        showMessage(
            "Result copied to clipboard successfully.",
            "success"
        );

    } catch (error) {

        /*
         * Fallback for browsers where Clipboard API
         * is not available.
         */

        try {

            outputText.focus();
            outputText.select();

            const copied = document.execCommand("copy");

            if (copied) {

                showMessage(
                    "Result copied to clipboard.",
                    "success"
                );

            } else {

                showMessage(
                    "Copy failed. Select the result and copy it manually.",
                    "error"
                );

            }

        } catch {

            showMessage(
                "Copy failed. Please copy the result manually.",
                "error"
            );

        }

    }

});


/* ==========================================
   10. CLEAR INPUT
========================================== */

clearInputBtn.addEventListener("click", function () {

    inputText.value = "";

    updateCharacterCounts();

    showMessage("Input message cleared.");

    inputText.focus();

});


/* ==========================================
   11. CLEAR ALL
========================================== */

clearAllBtn.addEventListener("click", function () {

    inputText.value = "";
    outputText.value = "";
    passwordInput.value = "";

    passwordInput.type = "password";
    togglePasswordBtn.textContent = "Show";

    togglePasswordBtn.setAttribute(
        "aria-label",
        "Show password"
    );

    updateCharacterCounts();

    showMessage("All fields have been cleared.");

});


/* ==========================================
   12. DOWNLOAD RESULT
========================================== */

downloadBtn.addEventListener("click", function () {

    if (!outputText.value) {

        showMessage(
            "There is no result to download.",
            "error"
        );

        return;
    }

    try {

        const blob = new Blob(
            [outputText.value],
            {
                type: "text/plain;charset=utf-8"
            }
        );

        const downloadURL = URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");

        downloadLink.href = downloadURL;

        downloadLink.download = "securetext-result.txt";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        downloadLink.remove();

        setTimeout(() => {
            URL.revokeObjectURL(downloadURL);
        }, 1000);

        showMessage(
            "Your result has been downloaded successfully.",
            "success"
        );

    } catch (error) {

        console.error("Download error:", error);

        showMessage(
            "Download failed. Please try again.",
            "error"
        );

    }

});


/* ==========================================
   13. MOBILE NAVIGATION
========================================== */

menuToggle.addEventListener("click", function () {

    const isOpen = navLinks.classList.toggle("show");

    menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
    );

    menuToggle.textContent = isOpen ? "✕" : "☰";

});


/*
 * Close the mobile menu after clicking a link.
 */

document.querySelectorAll(".nav-link, .footer-links a, .logo").forEach(
    function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("show");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

            menuToggle.textContent = "☰";

        });

    }
);


/* ==========================================
   14. UPDATE FOOTER YEAR
========================================== */

currentYear.textContent = new Date().getFullYear();


/* ==========================================
   15. BUTTON EVENT LISTENERS
========================================== */

encryptBtn.addEventListener("click", encryptText);

decryptBtn.addEventListener("click", decryptText);


/* ==========================================
   16. INITIALIZE APPLICATION
========================================== */

updateCharacterCounts();

showMessage(
    "Enter a message and password to get started."
);

console.log("SecureText application initialized successfully.");