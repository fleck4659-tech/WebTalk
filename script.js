// ===== Auth state =====
let isSignupMode = false;
let currentUser = null;

// Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const authSubmit = document.getElementById('auth-submit');
const themeToggle = document.getElementById('theme-toggle');

// Toggle between Log In / Create Account
btnLogin.addEventListener('click', () => {
    isSignupMode = false;
    btnLogin.classList.add('active');
    btnSignup.classList.remove('active');
    authSubmit.textContent = 'Log In';
    authError.textContent = '';
});

btnSignup.addEventListener('click', () => {
    isSignupMode = true;
    btnSignup.classList.add('active');
    btnLogin.classList.remove('active');
    authSubmit.textContent = 'Create Account';
    authError.textContent = '';
});

// Handle form submit
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // Validation (enforced by HTML + extra check)
    if (username.length < 3 || username.length > 30) {
        authError.textContent = 'Username must be 3–30 characters.';
        return;
    }
    if (password.length < 8 || password.length > 15) {
        authError.textContent = 'Password must be 8–15 characters.';
        return;
    }

    // Mock success – in a real app this would talk to a server
    currentUser = username;
    authError.textContent = '';

    // Smooth transition to chat
    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    // Optional: show a welcome message
    addMessage(`Welcome to WebTalk, ${username}!`, false);
});

// Theme toggle (Day / Night)
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// Simple helper to add a message bubble
function addMessage(text, isMine = true) {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'message' + (isMine ? ' mine' : '');
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// Placeholder for later features (emoji, file, send, typing)
document.getElementById('send-btn').addEventListener('click', () => {
    const input = document.getElementById('message-input');
    const text = input.value.trim();
    if (text) {
        addMessage(text, true);
        input.value = '';
    }
});

document.getElementById('message-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('send-btn').click();
    }
});
