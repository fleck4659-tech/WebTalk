// ===== State =====
let currentUser = null;
let selectedFile = null;
let friends = [];          // will hold friend names
let allUsers = [];         // mock list of other users

// Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const myNameEl = document.getElementById('my-name');
const changeNameBtn = document.getElementById('change-name-btn');
const themeToggle = document.getElementById('theme-toggle');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');
const emojiBtn = document.getElementById('emoji-btn');
const emojiPicker = document.getElementById('emoji-picker');
const fileInput = document.getElementById('file-input');
const filePreview = document.getElementById('file-preview');
const previewContent = document.getElementById('preview-content');
const cancelFileBtn = document.getElementById('cancel-file');
const friendsSearch = document.getElementById('friends-search');
const usersSearch = document.getElementById('users-search');
const friendsContainer = document.getElementById('friends-container');

// ===== Detect mobile =====
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

// ===== Generate random WebTalk name =====
function generateRandomName() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `WebTalk-${code}`;
}

// ===== Join button =====
joinBtn.addEventListener('click', () => {
    currentUser = generateRandomName();
    myNameEl.textContent = currentUser;

    // Create some mock users & friends for demo
    allUsers = [
        'WebTalk-9K2P', 'WebTalk-L4M7', 'WebTalk-X8Q1',
        'WebTalk-B3N5', 'WebTalk-R6T9', 'WebTalk-H2J4',
        'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'
    ];
    friends = ['WebTalk-9K2P', 'Alex', 'Sam'];

    renderFriends(friends);

    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    addMessage(`Welcome! Your name is ${currentUser}. You can change it anytime.`, false);
});

// ===== Change name =====
changeNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter a new name (3-20 characters):', currentUser);
    if (newName && newName.trim().length >= 3 && newName.trim().length <= 20) {
        currentUser = newName.trim();
        myNameEl.textContent = currentUser;
    }
});

// ===== Theme Toggle =====
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// ===== Render friends list =====
function renderFriends(list) {
    friendsContainer.innerHTML = '';
    if (list.length === 0) {
        friendsContainer.innerHTML = '<p style="padding:12px 16px;color:#64748b;font-size:0.9rem;">No friends yet</p>';
        return;
    }
    list.forEach(name => {
        const div = document.createElement('div');
        div.className = 'friend-item';
        const initial = name.charAt(0).toUpperCase();
        div.innerHTML = `
            <div class="avatar">${initial}</div>
            <span>${name}</span>
        `;
        div.addEventListener('click', () => {
            addMessage(`Opened chat with ${name}`, false);
        });
        friendsContainer.appendChild(div);
    });
}

// ===== Friends search (small) =====
friendsSearch.addEventListener('input', () => {
    const q = friendsSearch.value.toLowerCase().trim();
    const filtered = friends.filter(f => f.toLowerCase().includes(q));
    renderFriends(filtered);
});

// ===== Users search (big) =====
usersSearch.addEventListener('input', () => {
    const q = usersSearch.value.toLowerCase().trim();
    if (!q) {
        // clear any previous search results from messages for demo
        return;
    }
    const results = allUsers.filter(u => u.toLowerCase().includes(q) && u !== currentUser);
    if (results.length) {
        addMessage(`Found users: ${results.join(', ')}`, false);
    } else {
        addMessage(`No users found for "${q}"`, false);
    }
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
    typingIndicator.classList.remove('hidden');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 1200);
});

// ===== Send Message =====
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

// ===== Emoji Picker =====
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
        messageInput.focus();
        return;
    }
    emojiPicker.classList.toggle('hidden');
});

document.addEventListener('click', (e) => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add('hidden');
    }
});

// ===== File Preview =====
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
