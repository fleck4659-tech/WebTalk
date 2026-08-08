// ===== State =====
let currentUser = null;
let selectedFile = null;
let friends = [];
let allUsers = [];
let activeChat = null;          // who we are currently talking to
let conversations = {};         // { friendName: [messages] }

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
const searchResults = document.getElementById('search-results');
const friendsContainer = document.getElementById('friends-container');
const chatWith = document.getElementById('chat-with');
const chatWithName = document.getElementById('chat-with-name');
const sendBtn = document.getElementById('send-btn');

// ===== Detect mobile =====
const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

// ===== Random name =====
function generateRandomName() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `WebTalk-${code}`;
}

// ===== Join =====
joinBtn.addEventListener('click', () => {
    currentUser = generateRandomName();
    myNameEl.textContent = currentUser;

    // Mock users that "exist" on WebTalk
    allUsers = [
        'WebTalk-9K2P', 'WebTalk-L4M7', 'WebTalk-X8Q1',
        'WebTalk-B3N5', 'WebTalk-R6T9', 'WebTalk-H2J4',
        'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey',
        'Riley', 'Morgan', 'Quinn', 'Avery'
    ];

    friends = []; // start empty – user must add people
    renderFriends(friends);

    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    addSystemMessage(`Welcome! Your name is ${currentUser}. Search for people and add them to start chatting.`);
});

// ===== Change name =====
changeNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter a new name (3-20 characters):', currentUser);
    if (newName && newName.trim().length >= 3 && newName.trim().length <= 20) {
        currentUser = newName.trim();
        myNameEl.textContent = currentUser;
    }
});

// ===== Theme =====
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeToggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// ===== Render friends =====
function renderFriends(list) {
    friendsContainer.innerHTML = '';
    if (list.length === 0) {
        friendsContainer.innerHTML = '<p style="padding:12px 16px;color:#64748b;font-size:0.9rem;">No friends yet – search & add people!</p>';
        return;
    }
    list.forEach(name => {
        const div = document.createElement('div');
        div.className = 'friend-item' + (activeChat === name ? ' active' : '');
        const initial = name.charAt(0).toUpperCase();
        div.innerHTML = `
            <div class="avatar">${initial}</div>
            <span>${name}</span>
        `;
        div.addEventListener('click', () => openChat(name));
        friendsContainer.appendChild(div);
    });
}

// ===== Friends search =====
friendsSearch.addEventListener('input', () => {
    const q = friendsSearch.value.toLowerCase().trim();
    const filtered = friends.filter(f => f.toLowerCase().includes(q));
    renderFriends(filtered);
});

// ===== User search with Add Friend =====
usersSearch.addEventListener('input', () => {
    const q = usersSearch.value.toLowerCase().trim();
    searchResults.innerHTML = '';

    if (!q) {
        searchResults.classList.add('hidden');
        return;
    }

    const results = allUsers.filter(u =>
        u.toLowerCase().includes(q) &&
        u !== currentUser
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><span>No users found</span></div>';
    } else {
        results.forEach(name => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            const alreadyFriend = friends.includes(name);
            item.innerHTML = `
                <span class="name">${name}</span>
                <button class="add-friend-btn" ${alreadyFriend ? 'disabled' : ''}>
                    ${alreadyFriend ? 'Added' : 'Add Friend'}
                </button>
            `;

            if (!alreadyFriend) {
                item.querySelector('button').addEventListener('click', () => {
                    addFriend(name);
                    item.querySelector('button').textContent = 'Added';
                    item.querySelector('button').disabled = true;
                });
            }
            searchResults.appendChild(item);
        });
    }
    searchResults.classList.remove('hidden');
});

// Hide search results when clicking outside
document.addEventListener('click', (e) => {
    if (!usersSearch.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// ===== Add Friend =====
function addFriend(name) {
    if (!friends.includes(name)) {
        friends.push(name);
        conversations[name] = conversations[name] || [];
        renderFriends(friends);
        addSystemMessage(`${name} was added to your friends! Click them to start chatting.`);
    }
}

// ===== Open a chat with someone =====
function openChat(name) {
    activeChat = name;
    chatWith.classList.remove('hidden');
    chatWithName.textContent = name;

    // Enable input
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.placeholder = `Message ${name}...`;
    messageInput.focus();

    // Load conversation
    const messagesEl = document.getElementById('messages');
    messagesEl.innerHTML = '';

    const history = conversations[name] || [];
    history.forEach(msg => {
        displayMessage(msg.content, msg.isMine, msg.isFile);
    });

    renderFriends(friends); // highlight active
}

// ===== System message helper =====
function addSystemMessage(text) {
    const messages = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'message';
    div.style.alignSelf = 'center';
    div.style.background = 'transparent';
    div.style.border = 'none';
    div.style.color = '#64748b';
    div.style.fontSize = '0.9rem';
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
}

// ===== Display a message in the UI =====
function displayMessage(content, isMine = true, isFile = false) {
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

// ===== Save + show message =====
function addMessage(content, isMine = true, isFile = false) {
    if (!activeChat) return;

    // Save to conversation history
    if (!conversations[activeChat]) conversations[activeChat] = [];
    conversations[activeChat].push({ content, isMine, isFile });

    displayMessage(content, isMine, isFile);
}

// ===== Live replies from the other person =====
const replyPool = [
    "Hey! How’s it going?",
    "Nice to meet you 😊",
    "What’s up?",
    "Haha yeah!",
    "That’s cool!",
    "I’m good, thanks for asking!",
    "Lol",
    "Where are you from?",
    "This app is pretty fun",
    "True 🔥",
    "Tell me more!",
    "Awesome!",
    "I was just thinking the same thing",
    "👋",
    "Sure, sounds good!"
];

function simulateReply() {
    if (!activeChat) return;

    // Show typing indicator
    typingIndicator.classList.remove('hidden');

    const delay = 800 + Math.random() * 1800; // 0.8 – 2.6 seconds
    setTimeout(() => {
        typingIndicator.classList.add('hidden');

        const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
        addMessage(reply, false); // not mine
    }, delay);
}

// ===== Send Message =====
function sendMessage() {
    if (!activeChat) return;

    const text = messageInput.value.trim();

    if (selectedFile) {
        addMessage(selectedFile, true, true);
        clearFilePreview();
        // Other person reacts to file
        setTimeout(() => simulateReply(), 600);
    }

    if (text) {
        addMessage(text, true);
        messageInput.value = '';
        // Live reply
        simulateReply();
    }

    typingIndicator.classList.add('hidden');
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// ===== Live typing indicator (your own) =====
let typingTimeout;
messageInput.addEventListener('input', () => {
    if (!activeChat) return;
    typingIndicator.classList.remove('hidden');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        typingIndicator.classList.add('hidden');
    }, 1000);
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
