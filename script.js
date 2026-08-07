// ===== Auth state =====
let isSignupMode = false;
let currentUser = null;
let selectedFile = null;

// Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const authForm = document.getElementById('auth-form');
const authError = document.getElementById('auth-error');
const btnLogin = document.getElementById('btn-login');
const btnSignup = document.getElementById('btn-signup');
const authSubmit = document.getElementById('auth-submit');
const themeToggle = document.getElementById('theme-toggle');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const previewContent = document.getElementById('preview-content');
const cancelFileBtn = document.getElementById('cancel-file');

// ===== Detect mobile =====
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

// ===== Auth Toggle =====
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

// ===== Auth Submit =====
authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    if (username.length < 3 || username.length > 30) {
        authError.textContent = 'Username must be 3–30 characters.';
        return;
    }
    if (password.length < 8 || password.length > 15) {
        authError.textContent = 'Password must be 8–15 characters.';
        return;
    }

    currentUser = username;
    authError.textContent = '';
    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    addMessage(`Welcome to WebTalk, ${username}!`, false);
});

// ===== Theme Toggle =====
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// ===== Add Message Helper =====
function addMessage(content, isMine = true, isFile = false) {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'message' + (isMine ? ' mine' : '');

    if (isFile && content instanceof File) {
        if (content.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(content);
            img.style.maxWidth = '220px';
            img.style.borderRadius = '12px';
            div.appendChild(img);
        } else {
            div.textContent = `📎 ${content.name}`;
        }
    } else {
        div.textContent = content;
    }

    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ===== Live Typing Indicator =====
let typingTimeout;
messageInput.addEventListener('input', () => {
    // Show the animated typing bubble while the user is typing
    typingIndicator.classList.remove('hidden');

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 1200);
});

// ===== Send Text Message =====
function sendMessage() {
    const text = messageInput.value.trim();

    if (selectedFile) {
        addMessage(selectedFile, true, true);
        clearFilePreview();
    }

    if (text) {
        addMessage(text, true);
        messageInput.value = '';
    }

    typingIndicator.classList.add('hidden');
}

document.getElementById('send-btn').addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ===== Emoji Picker (Desktop only) =====
const emojis = [
    '😀','😂','😊','😍','🤔','😎','😢','😡','👍','👎',
    '❤️','🔥','🎉','✅','❌','⭐','🌟','💯','🙌','👏',
    '🐶','🐱','🌈','☀️','🌙','🍎','🍕','⚽','🎮','🎵'
];

function buildEmojiPicker() {
    const grid = emojiPicker.querySelector('.emoji-grid');
    grid.innerHTML = '';
    emojis.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.addEventListener('click', () => {
            messageInput.value += emoji;
            messageInput.focus();
            emojiPicker.classList.add('hidden');
        });
        grid.appendChild(span);
    });
}

buildEmojiPicker();

emojiBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (isMobile) {
        // On mobile just focus the input so the native emoji keyboard can be used
        messageInput.focus();
        return;
    }

    // Desktop: toggle custom picker
    emojiPicker.classList.toggle('hidden');
});

// Close picker when clicking outside
document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add('hidden');
    }
});

// ===== File / Photo Selection + Preview =====
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;

    selectedFile = file;
    previewContent.innerHTML = '';

    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        previewContent.appendChild(img);
    }

    const name = document.createElement('span');
    name.className = 'file-name';
    name.textContent = file.name;
    previewContent.appendChild(name);

    filePreview.classList.remove('hidden');
});

function clearFilePreview() {
    selectedFile = null;
    fileInput.value = '';
    previewContent.innerHTML = '';
    filePreview.classList.add('hidden');
}

cancelFileBtn.addEventListener('click', clearFilePreview);
