const roomForm =
    document.getElementById("room-form");

const roomInput =
    document.getElementById("room-name");

const roomList =
    document.getElementById("room-list");

const userList =
    document.getElementById("user-list");

const onlineCount =
    document.getElementById("online-count");

const currentRoomName =
    document.getElementById("current-room-name");

const messageList =
    document.getElementById("message-list");

const emptyChat =
    document.getElementById("empty-chat");

const typingIndicator =
    document.getElementById("typing-indicator");

const messageForm =
    document.getElementById("message-form");

const messageInput =
    document.getElementById("message-input");

const statusMessage =
    document.getElementById("status-message");

const clearChatDataButton =
    document.getElementById("clear-chat-data");


const STORAGE_KEY =
    "talkspace-data";


const mockUsers = [
    {
        id: createId(),
        name: "thanay",
        online: true
    },
    {
        id: createId(),
        name: "manoj",
        online: true
    },
    {
        id: createId(),
        name: "vinay",
        online: false
    }
];


let rooms =
    loadRooms();

let currentRoomId =
    rooms[0].id;


/* Room handling */

roomForm.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();

        const name =
            roomInput.value.trim();

        if (!name) {
            return;
        }

        const alreadyExists =
            rooms.some(
                room =>
                    room.name.toLowerCase()
                    === name.toLowerCase()
            );

        if (alreadyExists) {

            showError(
                "That room already exists."
            );

            return;
        }

        const room = {
            id: createId(),
            name,
            messages: []
        };

        rooms.push(room);

        currentRoomId =
            room.id;

        roomInput.value =
            "";

        saveRooms();
        renderApp();

        messageInput.focus();
    }
);


roomList.addEventListener(
    "click",
    function (event) {

        const button =
            event.target.closest(
                ".room-button"
            );

        if (!button) {
            return;
        }

        currentRoomId =
            button.dataset.roomId;

        typingIndicator.textContent =
            "";

        clearError();

        renderApp();
    }
);


function renderRooms() {

    roomList.innerHTML =
        "";

    rooms.forEach(
        room => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "room-button";

            button.dataset.roomId =
                room.id;

            button.textContent =
                `# ${room.name}`;

            if (
                room.id ===
                currentRoomId
            ) {

                button.classList.add(
                    "active"
                );
            }

            roomList.appendChild(
                button
            );
        }
    );
}


/* Messages */

messageForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const text =
            messageInput.value.trim();

        if (!text) {
            return;
        }

        clearError();

        const roomId =
            currentRoomId;

        addMessage(
            roomId,
            {
                id: createId(),
                sender: "You",
                text,
                createdAt:
                    new Date()
                        .toISOString(),
                mine: true
            }
        );

        messageInput.value =
            "";

        saveRooms();

        if (
            currentRoomId ===
            roomId
        ) {

            renderMessages();
        }

        await simulateIncomingMessage(
            roomId,
            text
        );
    }
);


function addMessage(
    roomId,
    message
) {

    const room =
        rooms.find(
            item =>
                item.id === roomId
        );

    if (!room) {
        return;
    }

    room.messages.push(
        message
    );
}


function renderMessages() {

    const room =
        getCurrentRoom();

    currentRoomName.textContent =
        room.name;

    messageList.innerHTML =
        "";

    emptyChat.hidden =
        room.messages.length !== 0;


    room.messages.forEach(
        message => {

            const wrapper =
                document.createElement(
                    "article"
                );

            wrapper.className =
                "message";

            if (message.mine) {

                wrapper.classList.add(
                    "mine"
                );
            }


            const meta =
                document.createElement(
                    "div"
                );

            meta.className =
                "message-meta";


            const sender =
                document.createElement(
                    "strong"
                );

            sender.textContent =
                message.sender;


            const time =
                document.createElement(
                    "span"
                );

            time.textContent =
                formatTime(
                    message.createdAt
                );

            time.title =
                formatFullDate(
                    message.createdAt
                );


            const bubble =
                document.createElement(
                    "div"
                );

            bubble.className =
                "message-bubble";


            const text =
                document.createElement(
                    "p"
                );

            text.textContent =
                message.text;


            meta.append(
                sender,
                time
            );

            bubble.appendChild(
                text
            );

            wrapper.append(
                meta,
                bubble
            );

            messageList.appendChild(
                wrapper
            );
        }
    );


    messageList.scrollTop =
        messageList.scrollHeight;
}


/* Mock realtime behavior */

async function simulateIncomingMessage(
    roomId,
    originalMessage
) {

    const onlineUsers =
        mockUsers.filter(
            user =>
                user.online
        );

    if (
        onlineUsers.length === 0
    ) {

        return;
    }


    const user =
        onlineUsers[
            Math.floor(
                Math.random()
                * onlineUsers.length
            )
        ];


    if (
        currentRoomId ===
        roomId
    ) {

        typingIndicator.textContent =
            `${user.name} is typing...`;
    }


    await wait(
        randomDelay(
            900,
            1800
        )
    );


    const preview =
        originalMessage.length > 55
            ? `${originalMessage.slice(0, 55)}...`
            : originalMessage;


    addMessage(
        roomId,
        {
            id: createId(),
            sender: user.name,
            text: `Re: ${preview}`,
            createdAt:
                new Date()
                    .toISOString(),
            mine: false
        }
    );


    saveRooms();


    if (
        currentRoomId ===
        roomId
    ) {

        typingIndicator.textContent =
            "";

        renderMessages();
    }
}


/* Online status */

function renderUsers() {

    userList.innerHTML =
        "";

    const online =
        mockUsers.filter(
            user => user.online
        ).length;

    onlineCount.textContent =
        `${online} online`;


    mockUsers.forEach(
        user => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "user";


            const avatar =
                document.createElement(
                    "div"
                );

            avatar.className =
                "avatar";

            avatar.textContent =
                getInitials(
                    user.name
                );


            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "user-info";


            const name =
                document.createElement(
                    "p"
                );

            name.className =
                "user-name";

            name.textContent =
                user.name;


            const status =
                document.createElement(
                    "p"
                );

            status.className =
                "user-status";


            const dot =
                document.createElement(
                    "span"
                );

            dot.className =
                "status-dot";

            if (user.online) {

                dot.classList.add(
                    "online"
                );
            }


            const statusText =
                document.createElement(
                    "span"
                );

            statusText.textContent =
                user.online
                    ? "Online"
                    : "Offline";


            status.append(
                dot,
                statusText
            );

            info.append(
                name,
                status
            );

            item.append(
                avatar,
                info
            );

            userList.appendChild(
                item
            );
        }
    );
}


setInterval(
    function () {

        const user =
            mockUsers[
                Math.floor(
                    Math.random()
                    * mockUsers.length
                )
            ];

        user.online =
            !user.online;

        renderUsers();
    },
    8000
);


/* Clear saved chat data */

clearChatDataButton.addEventListener(
    "click",
    function () {

        const confirmed =
            confirm(
                "Clear all rooms and messages?"
            );

        if (!confirmed) {
            return;
        }

        localStorage.removeItem(
            STORAGE_KEY
        );

        rooms =
            createDefaultRooms();

        currentRoomId =
            rooms[0].id;

        typingIndicator.textContent =
            "";

        roomInput.value =
            "";

        messageInput.value =
            "";

        clearError();

        renderApp();

        messageInput.focus();
    }
);


/* Storage and helpers */

function createDefaultRooms() {

    return [
        {
            id: createId(),
            name: "General",
            messages: []
        }
    ];
}


function loadRooms() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );

    if (saved) {

        try {

            const data =
                JSON.parse(saved);

            if (
                Array.isArray(data)
                &&
                data.length > 0
            ) {

                return data;
            }

        } catch {
        }
    }

    return createDefaultRooms();
}


function saveRooms() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            rooms
        )
    );
}


function getCurrentRoom() {

    return rooms.find(
        room =>
            room.id ===
            currentRoomId
    );
}


function createId() {

    if (
        crypto.randomUUID
    ) {

        return crypto.randomUUID();
    }

    return (
        Date.now().toString()
        +
        Math.random()
            .toString(16)
            .slice(2)
    );
}


function formatTime(
    dateValue
) {

    return new Date(
        dateValue
    ).toLocaleTimeString(
        [],
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


function formatFullDate(
    dateValue
) {

    return new Date(
        dateValue
    ).toLocaleString();
}


function getInitials(name) {

    return name
        .split(" ")
        .map(
            part => part[0]
        )
        .join("")
        .toUpperCase()
        .slice(0, 2);
}


function wait(milliseconds) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );
}


function randomDelay(
    minimum,
    maximum
) {

    return Math.floor(
        Math.random()
        * (
            maximum
            - minimum
            + 1
        )
    )
    + minimum;
}


function showError(message) {

    statusMessage.textContent =
        message;
}


function clearError() {

    statusMessage.textContent =
        "";
}


function renderApp() {

    renderRooms();
    renderMessages();
    renderUsers();
}


renderApp();