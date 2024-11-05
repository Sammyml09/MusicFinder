import { initializeApp} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js"; 
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"; 

const firebaseConfig = {
    apiKey: "AIzaSyCZaRehLm9_JvragEmcXmFwe5LFd5w_oKg",
    authDomain: "musicfinder-78a80.firebaseapp.com",
    projectId: "musicfinder-78a80",
    storageBucket: "musicfinder-78a80.firebasestorage.app",
    messagingSenderId: "1055196571399",
    appId: "1:1055196571399:web:691089229f8282b70447a2",
    measurementId: "G-MXNEKBZX29"
};

const app = initializeApp(firebaseConfig); 
const db = getFirestore(app);

let comments = [];
let commentSectionId = localStorage.getItem('ArtistID')

export function loadCommentSection() {
    var commentSectionId = localStorage.getItem('ArtistID')
    if (commentSectionId = 'null'){
        console.log("OOOOOOOOOOOOOOOOOH");
    }
    const docRef = doc(db, "comments", localStorage.getItem('ArtistID'));
    getDoc(docRef).then((doc) => {
        if (doc.exists()) {
            const data = doc.data();
            comments = data?.comments || [];
            displayComments();
        } else {
            displayComments();
        }
    }).catch(error => console.error("Error Loading Comments :", error));
}

export function displayComments(commentsList = comments, parentElement = document.getElementById('comments'), openBranches = []) {
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

export function displayReplies(replies, parentId, openBranches) {
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

export function addComment() {
    const commentInput = document.getElementById('commentInput');
    const commentText = commentInput.value;
    comments.push({ text: commentText, replies: [] });
    saveComments(() => {
        commentInput.value = '';
        displayComments();
    });
}

export function showReplyBox(commentId) {
    const replyBox = document.getElementById(`reply-box-${commentId}`);
    if (replyBox) {
        replyBox.classList.remove('hidden');
    }
}

export function submitReply(commentId) {
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

export function toggleReplies(commentId) {
    const repliesDiv = document.getElementById(`replies-${commentId}`);
    if (repliesDiv) {
        repliesDiv.classList.toggle('hidden');
    }
}

export function getOpenBranches() {
    const openBranches = [];
    document.querySelectorAll('.replies:not(.hidden)').forEach(div => {
        openBranches.push(div.id.replace('replies-', ''));
    });
    return openBranches;
}


export function saveComments(callback) { 
    const docRef = doc(db, "comments", commentSectionId); 
    setDoc(docRef, { comments: comments }).then(() => {
         callback();}).catch(error => console.error("Error saving comments:", error));
        
}
