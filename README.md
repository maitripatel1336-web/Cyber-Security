# 🔐 SecureText
### Encryption & Decryption Web Application

SecureText is a web-based cybersecurity project that demonstrates
how text messages can be encrypted and decrypted using modern
cryptographic techniques.

The application allows users to convert readable messages into
encrypted text and recover the original message using the correct
password.

---

## 📌 Project Overview

SecureText is designed to demonstrate the fundamental concepts
of cryptography, data confidentiality, encryption, and decryption.

The application uses a simple and responsive interface developed
with HTML, CSS, and JavaScript.

All encryption and decryption operations are performed in the
user's browser without requiring a backend server.

---

## 🎯 Objectives

- To understand the basic concepts of encryption and decryption.
- To demonstrate symmetric-key cryptography.
- To implement AES-256-GCM encryption.
- To derive encryption keys from passwords using PBKDF2.
- To provide a simple interface for secure text processing.
- To understand the importance of data confidentiality.
- To develop practical cybersecurity skills using web technologies.

---

## ✨ Features

- 🔒 AES-256-GCM text encryption
- 🔓 Password-based text decryption
- 🔑 Password input with show/hide functionality
- 📋 Copy encrypted or decrypted results
- 📥 Download results as text files
- 🗑️ Clear input, output, and password fields
- 📱 Responsive user interface
- ⚡ Browser-based processing
- 🛡️ Authentication of encrypted data through AES-GCM

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Defines the web page structure |
| CSS3 | Provides styling and responsive design |
| JavaScript | Implements application functionality |
| Web Crypto API | Provides cryptographic operations |
| AES-256-GCM | Encrypts and authenticates messages |
| PBKDF2 | Derives an encryption key from a password |
| TextEncoder API | Converts text into bytes |
| Base64 | Encodes encrypted data for text storage |

---

## 📂 Project Structure

```text
SecureText/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   └── script.js
│
├── images/
│
└── README.md