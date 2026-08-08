// ===== State =====
let currentUser = null;
let currentBio = '';
let currentAvatar = null; // base64 string
let selectedFile = null;
let friends = [];
let pendingOutgoing = [];   // requests you sent
let pendingIncoming = [];   // requests others sent you
let allUsers = [];
let activeChat = null;
let conversations = {};

// Elements
const authScreen = document.getElementById('auth-screen');
const chatScreen = document.getElementById('chat-screen');
const joinBtn = document.getElementById('join-btn');
const myNameEl = document.getElementById('my-name');
const myBioEl = document.getElementById('my-bio');
const myAvatarEl = document.getElementById('my-avatar');
const avatarInput = document.getElementById('avatar-input');
const changeNameBtn = document.getElementById('change-name-btn');
const editBioBtn = document.getElementById('edit-bio-btn');
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
const notificationsList = document.getElementById('notifications-list');
const notifBadge = document.getElementById('notif-badge');
const chatWith = document.getElementById('chat-with');
const chatWithName = document.getElementById('chat-with-name');
const sendBtn = document.getElementById('send-btn');

const isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile/i.test(navigator.userAgent);

allUsers = [
    'Alex', 'Sam', 'Jordan', 'Taylor', 'Casey',
    'Riley', 'Morgan', 'Quinn', 'Avery', 'Jamie',
    'Cameron', 'Drew', 'Parker', 'Reese', 'Skyler'
];

// ===== Helpers =====
function generateRandomName() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return `WebTalk-${code}`;
}

function saveData() {
    localStorage.setItem('webtalk_v2_user', currentUser);
    localStorage.setItem('webtalk_v2_bio', currentBio);
    localStorage.setItem('webtalk_v2_avatar', currentAvatar || '');
    localStorage.setItem('webtalk_v2_friends', JSON.stringify(friends));
    localStorage.setItem('webtalk_v2_outgoing', JSON.stringify(pendingOutgoing));
    localStorage.setItem('webtalk_v2_incoming', JSON.stringify(pendingIncoming));
    localStorage.setItem('webtalk_v2_conversations', JSON.stringify(conversations));
}

function loadData() {
    const savedUser = localStorage.getItem('webtalk_v2_user');
    if (!savedUser) return false;

    currentUser = savedUser;
    currentBio = localStorage.getItem('webtalk_v2_bio') || '';
    currentAvatar = localStorage.getItem('webtalk_v2_avatar') || null;
    friends = JSON.parse(localStorage.getItem('webtalk_v2_friends') || '[]');
    pendingOutgoing = JSON.parse(localStorage.getItem('webtalk_v2_outgoing') || '[]');
    pendingIncoming = JSON.parse(localStorage.getItem('webtalk_v2_incoming') || '[]');
    conversations = JSON.parse(localStorage.getItem('webtalk_v2_conversations') || '{}');

    myNameEl.textContent = currentUser;
    updateBioDisplay();
    updateAvatarDisplay();
    setupAvatarEditor();
    setupBioEditor();
    renderFriends(friends);
    renderNotifications();

    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    return true;
}

// ===== Avatar =====
function updateAvatarDisplay() {
    if (currentAvatar) {
        myAvatarEl.style.backgroundImage = `url(${currentAvatar})`;
        myAvatarEl.textContent = '';
    } else {
        myAvatarEl.style.backgroundImage = '';
        myAvatarEl.textContent = currentUser ? currentUser.charAt(0).toUpperCase() : '?';
    }
}

function setupAvatarEditor() {
    if (!myAvatarEl || !avatarInput) return;

    myAvatarEl.style.cursor = 'pointer';
    myAvatarEl.title = 'Click to change profile picture';

    myAvatarEl.onclick = () => {
        avatarInput.click();
    };

    avatarInput.onchange = () => {
        const file = avatarInput.files[0];
        if (!file || !file.type.startsWith('image/')) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            currentAvatar = e.target.result;
            updateAvatarDisplay();
            saveData();
        };
        reader.readAsDataURL(file);
    };
}

// ===== Bio =====
function updateBioDisplay() {
    if (myBioEl) {
        myBioEl.textContent = currentBio || 'No bio yet';
    }
}

function setupBioEditor() {
    if (!editBioBtn) return;

    editBioBtn.onclick = () => {
        const newBio = prompt('Enter a short bio (optional, max 80 characters):', currentBio || '');
        if (newBio !== null) {
            currentBio = newBio.trim().slice(0, 80);
            updateBioDisplay();
            saveData();
        }
    };

    // Also allow clicking the bio text itself
    if (myBioEl) {
        myBioEl.style.cursor = 'pointer';
        myBioEl.title = 'Click to edit bio';
        myBioEl.onclick = () => editBioBtn.click();
    }
}

// ===== Join =====
joinBtn.addEventListener('click', () => {
    currentUser = generateRandomName();
    currentBio = '';
    currentAvatar = null;
    friends = [];
    pendingOutgoing = [];
    pendingIncoming = [];
    conversations = {};

    myNameEl.textContent = currentUser;
    updateBioDisplay();
    updateAvatarDisplay();
    setupAvatarEditor();
    setupBioEditor();
    saveData();
    renderFriends(friends);
    renderNotifications();

    authScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');

    addSystemMessage(`Welcome! Your name is ${currentUser}. Search for people and send friend requests.`);
});

// ===== Change name =====
changeNameBtn.addEventListener('click', () => {
    const newName = prompt('Enter a new name (3-20 characters):', currentUser);
    if (newName && newName.trim().length >= 3 && newName.trim().length <= 20) {
        currentUser = newName.trim();
        myNameEl.textContent = currentUser;
        updateAvatarDisplay();
        saveData();
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
        friendsContainer.innerHTML = '<p class="empty-msg">No friends yet</p>';
        return;
    }
    list.forEach(name => {
        const div = document.createElement('div');
        div.className = 'friend-item' + (activeChat === name ? ' active' : '');
        div.innerHTML = `
            <div class="avatar">${name.charAt(0).toUpperCase()}</div>
            <span>${name}</span>
        `;
        div.addEventListener('click', () => openChat(name));
        friendsContainer.appendChild(div);
    });
}

friendsSearch.addEventListener('input', () => {
    const q = friendsSearch.value.toLowerCase().trim();
    renderFriends(friends.filter(f => f.toLowerCase().includes(q)));
});

// ===== Notifications =====
function renderNotifications() {
    notificationsList.innerHTML = '';

    if (pendingIncoming.length === 0) {
        notificationsList.innerHTML = '<p class="empty-msg">No notifications</p>';
        notifBadge.classList.add('hidden');
        return;
    }

    notifBadge.textContent = pendingIncoming.length;
    notifBadge.classList.remove('hidden');

    pendingIncoming.forEach(name => {
        const item = document.createElement('div');
        item.className = 'notif-item';
        item.innerHTML = `
            <p><strong>${name}</strong> sent you a friend request</p>
            <div class="notif-actions">
                <button class="accept-btn">Accept</button>
                <button class="decline-btn">Decline</button>
            </div>
        `;
        item.querySelector('.accept-btn').addEventListener('click', () => acceptRequest(name));
        item.querySelector('.decline-btn').addEventListener('click', () => declineRequest(name));
        notificationsList.appendChild(item);
    });
}

function acceptRequest(name) {
    pendingIncoming = pendingIncoming.filter(n => n !== name);
    if (!friends.includes(name)) friends.push(name);
    conversations[name] = conversations[name] || [];
    saveData();
    renderNotifications();
    renderFriends(friends);
    addSystemMessage(`You are now friends with ${name}!`);
}

function declineRequest(name) {
    pendingIncoming = pendingIncoming.filter(n => n !== name);
    saveData();
    renderNotifications();
}

// ===== User search + Send Request =====
usersSearch.addEventListener('input', () => {
    const q = usersSearch.value.toLowerCase().trim();
    searchResults.innerHTML = '';

    if (!q) {
        searchResults.classList.add('hidden');
        return;
    }

    const results = allUsers.filter(u =>
        u.toLowerCase().includes(q) && u !== currentUser
    );

    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item"><span>No users found</span></div>';
    } else {
        results.forEach(name => {
            const item = document.createElement('div');
            item.className = 'search-result-item';

            let btnLabel = 'Send Request';
            let disabled = false;

            if (friends.includes(name)) {
                btnLabel = 'Friends';
                disabled = true;
            } else if (pendingOutgoing.includes(name)) {
                btnLabel = 'Pending';
                disabled = true;
            } else if (pendingIncoming.includes(name)) {
                btnLabel = 'Accept in Notifs';
                disabled = true;
            }

            item.innerHTML = `
                <span class="name">${name}</span>
                <button class="add-friend-btn" ${disabled ? 'disabled' : ''}>${btnLabel}</button>
            `;

            if (!disabled) {
                item.querySelector('button').addEventListener('click', () => {
                    sendFriendRequest(name);
                    item.querySelector('button').textContent = 'Pending';
                    item.querySelector('button').disabled = true;
                });
            }
            searchResults.appendChild(item);
        });
    }
    searchResults.classList.remove('hidden');
});

document.addEventListener('click', (e) => {
    if (!usersSearch.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.classList.add('hidden');
    }
});

// ===== Send Friend Request =====
function sendFriendRequest(name) {
    if (pendingOutgoing.includes(name) || friends.includes(name)) return;

    pendingOutgoing.push(name);
    saveData();

    addSystemMessage(`Friend request sent to ${name}. Waiting for them to accept...`);

    // Simulate the other person receiving it and deciding after a delay
    setTimeout(() => {
        // 70% chance they accept
        if (Math.random() < 0.7) {
            pendingOutgoing = pendingOutgoing.filter(n => n !== name);
            if (!friends.includes(name)) friends.push(name);
            conversations[name] = conversations[name] || [];
            saveData();
            renderFriends(friends);
            addSystemMessage(`${name} accepted your friend request!`);
        } else {
            pendingOutgoing = pendingOutgoing.filter(n => n !== name);
            saveData();
            addSystemMessage(`${name} declined your friend request.`);
        }
    }, 2500 + Math.random() * 3000);
}

// ===== Simulate occasional incoming requests =====
function maybeReceiveRequest() {
    if (!currentUser) return;
    const candidates = allUsers.filter(u =>
        !friends.includes(u) &&
        !pendingIncoming.includes(u) &&
        !pendingOutgoing.includes(u)
    );
    if (candidates.length === 0) return;

    if (Math.random() < 0.4) {
        const name = candidates[Math.floor(Math.random() * candidates.length)];
        pendingIncoming.push(name);
        saveData();
        renderNotifications();
    }
}

setInterval(maybeReceiveRequest, 25000);

// ===== Open chat =====
function openChat(name) {
    activeChat = name;
    chatWith.classList.remove('hidden');
    chatWithName.textContent = name;
    messageInput.disabled = false;
    sendBtn.disabled = false;
    messageInput.placeholder = `Message ${name}...`;
    messageInput.focus();

    const messagesEl = document.getElementById('messages');
    messagesEl.innerHTML = '';
    (conversations[name] || []).forEach(msg => {
        displayMessage(msg.content, msg.isMine, false);
    });
    renderFriends(friends);
}

// ===== Messages =====
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

function addMessage(content, isMine = true, isFile = false) {
    if (!activeChat) return;
    if (!conversations[activeChat]) conversations[activeChat] = [];
    if (!isFile) {
        conversations[activeChat].push({ content, isMine, isFile: false });
        saveData();
    }
    displayMessage(content, isMine, isFile);
}

const replyPool = [
    "Hey! How’s it going?", "Nice to meet you 😊", "What’s up?",
    "Haha yeah!", "That’s cool!", "I’m good, thanks!", "Lol",
    "Where are you from?", "This app is pretty fun", "True 🔥",
    "Tell me more!", "Awesome!", "👋", "Sure, sounds good!"
];

function simulateReply() {
    if (!activeChat) return;
    typingIndicator.classList.remove('hidden');
    setTimeout(() => {
        typingIndicator.classList.add('hidden');
        const reply = replyPool[Math.floor(Math.random() * replyPool.length)];
        addMessage(reply, false);
    }, 800 + Math.random() * 1800);
}

function sendMessage() {
    if (!activeChat) return;
    const text = messageInput.value.trim();

    if (selectedFile) {
        addMessage(selectedFile, true, true);
        clearFilePreview();
        setTimeout(simulateReply, 600);
    }
    if (text) {
        addMessage(text, true);
        messageInput.value = '';
        simulateReply();
    }
    typingIndicator.classList.add('hidden');
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

let typingTimeout;
messageInput.addEventListener('input', () => {
    if (!activeChat) return;
    typingIndicator.classList.remove('hidden');
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => typingIndicator.classList.add('hidden'), 1000);
});

// ===== Emoji =====
const emojis = ['😀','😂','😊','😍','🤔','😎','😢','😡','👍','👎','❤️','🔥','🎉','✅','❌','⭐','🌟','💯','🙌','👏','🐶','🐱','🌈','☀️','🌙','🍎','🍕','⚽','🎮','🎵'];

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

emojiBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (isMobile) { messageInput.focus(); return; }
    emojiPicker.classList.toggle('hidden');
});

document.addEventListener('click', e => {
    if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add('hidden');
    }
});

// ===== File preview =====
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

// ===== Start =====
loadData();

// Make sure editors are ready even if loadData did not run
setupAvatarEditor();
setupBioEditor();
