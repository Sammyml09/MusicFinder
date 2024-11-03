let comments = [];
let commentSectionId = localStorage.getItem('ArtistID')

function loadCommentSection() {
    fetch('comments.json')
        .then(response => response.json())
        .then(data => {
            comments = data[commentSectionId] || [];
            displayComments();
        });
}

function displayComments(commentsList = comments, parentElement = document.getElementById('comments'), openBranches = []) {
    parentElement.innerHTML = '';
    commentsList.forEach((comment, index) => {
        const repliesHTML = displayReplies(comment.replies, `${parentElement.id}-${index}`, openBranches);
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment';
        commentDiv.innerHTML = `
            <p>${comment.text}</p>
            <button onclick="showReplyBox('${parentElement.id}-${index}')">Reply</button>
            ${repliesHTML ? `<button onclick="toggleReplies('${parentElement.id}-${index}')">Show/Hide Replies</button>` : ''}
            <div class="replies ${openBranches.includes(`${parentElement.id}-${index}`) ? '' : 'hidden'}" id="replies-${parentElement.id}-${index}">
                ${repliesHTML}
            </div>
            <div class="reply-box hidden" id="reply-box-${parentElement.id}-${index}">
                <textarea id="reply-input-${parentElement.id}-${index}" placeholder="Write a reply..."></textarea>
                <button onclick="submitReply('${parentElement.id}-${index}')">Submit Reply</button>
            </div>
        `;
        parentElement.appendChild(commentDiv);
    });
}

function displayReplies(replies, parentId, openBranches) {
    if (!replies) return '';
    let repliesHTML = '';
    replies.forEach((reply, index) => {
        const hasReplies = reply.replies && reply.replies.length > 0;
        repliesHTML += `
            <div class="reply">
                <div class="reply-box">
                    <p>${reply.text}</p>
                    <button onclick="showReplyBox('${parentId}-${index}')">Reply</button>
                    ${hasReplies ? `<button onclick="toggleReplies('${parentId}-${index}')">Show/Hide Replies</button>` : ''}
                    <div class="replies ${openBranches.includes(`${parentId}-${index}`) ? '' : 'hidden'}" id="replies-${parentId}-${index}">
                        ${displayReplies(reply.replies, `${parentId}-${index}`, openBranches)}
                    </div>
                    <div class="reply-box hidden" id="reply-box-${parentId}-${index}">
                        <textarea id="reply-input-${parentId}-${index}" placeholder="Write a reply..."></textarea>
                        <button onclick="submitReply('${parentId}-${index}')">Submit Reply</button>
                    </div>
                </div>
            </div>
        `;
    });
    return repliesHTML;
}

function addComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value;
    comments.push({ text: commentText, replies: [] });
    saveComments(() => {
        commentInput.value = '';
        displayComments();
    });
}

function showReplyBox(commentId) {
    const replyBox = document.getElementById(`reply-box-${commentId}`);
    if (replyBox) {
        replyBox.classList.remove('hidden');
    }
}

function submitReply(commentId) {
    const replyInput = document.getElementById(`reply-input-${commentId}`);
    const replyText = replyInput.value;
    if (replyText === '') return;
    const path = commentId.split('-').slice(1).map(Number);
    let current = comments;
    path.forEach(index => current = current[index].replies);
    current.push({ text: replyText, replies: [] });
    saveComments(() => {
        const openBranches = getOpenBranches();
        openBranches.push(commentId);
        displayComments(comments, document.getElementById('comments'), openBranches);
    });
}

function toggleReplies(commentId) {
    const repliesDiv = document.getElementById(`replies-${commentId}`);
    if (repliesDiv) {
        repliesDiv.classList.toggle('hidden');
    }
}

function getOpenBranches() {
    const openBranches = [];
    document.querySelectorAll('.replies:not(.hidden)').forEach(div => {
        openBranches.push(div.id.replace('replies-', ''));
    });
    return openBranches;
}

function saveComments(callback) {
fetch('comments.json') .then(response => response.json()) .then(data => { data[commentSectionId] = comments; const sortedData = {}; Object.keys(data).sort().forEach(key => { sortedData[key] = data[key]; }); return fetch('save_comments.php', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sortedData) }); }) .then(callback); } // Initial load loadCommentSection
