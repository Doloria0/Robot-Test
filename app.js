// 파이어베이스 SDK 임포트
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, 
    query, orderBy, serverTimestamp, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- 파이어베이스 설정 ---
const firebaseConfig = {
  apiKey: "AIzaSyCpES5tDi0Cy8zdoDyJf3byWdIw5XgJl2Q",
  authDomain: "robot-test-b965a.firebaseapp.com",
  projectId: "robot-test-b965a",
  storageBucket: "robot-test-b965a.firebasestorage.app",
  messagingSenderId: "894129080350",
  appId: "1:894129080350:web:913bd2e398440ea25cc60f",
  measurementId: "G-6XNKWZ0CN5"
};

// --- 파이어베이스 및 DOM 초기 로직 ---
let db;
let analytics;

// 1. 파이어베이스 초기화
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    // 애널리틱스 실패가 전체 실행을 막지 않도록 분리
    try {
        analytics = getAnalytics(app);
    } catch (e) { console.log("Analytics 생략됨"); }
} catch (e) {
    console.error("Firebase 초기화 중 에러 발생:", e);
}

// 2. DOM 요소 가져오기
const postsList = document.getElementById('postsList');
const postModal = document.getElementById('postModal');
const postForm = document.getElementById('postForm');
const openWriteModal = document.getElementById('openWriteModal');
const closeModal = document.getElementById('closeModal');
const clubTabs = document.getElementById('clubTabs');

// --- 동아리 탭 이벤트 ---
if (clubTabs) {
    clubTabs.addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            const id = e.target.getAttribute('data-club');
            const data = clubData[id];
            document.getElementById('clubName').innerText = data.name;
            document.getElementById('clubDesc').innerText = data.desc;
            document.getElementById('clubImage').src = data.img;
        }
    });
}

// --- 모달 기능 (글쓰기 창 열기) ---
if (openWriteModal) {
    openWriteModal.addEventListener('click', () => {
        postForm.reset();
        document.getElementById('postId').value = '';
        document.getElementById('modalTitle').innerText = '게시글 작성';
        postModal.style.display = 'flex';
    });
}

if (closeModal) {
    closeModal.onclick = () => {
        postModal.style.display = 'none';
    };
}

window.onclick = (e) => {
    if (e.target == postModal) postModal.style.display = 'none';
};

// --- 자유게시판 CRUD 로직 ---

// 1. 글 저장 (생성/수정)
if (postForm) {
    postForm.onsubmit = async (e) => {
        e.preventDefault();
        if (!db) return alert("데이터베이스 연결에 실패했습니다. 설정을 확인하세요!");

        const id = document.getElementById('postId').value;
        const author = document.getElementById('postAuthor').value;
        const title = document.getElementById('postTitle').value;
        const content = document.getElementById('postContent').value;

        try {
            if (id) {
                await updateDoc(doc(db, "posts", id), {
                    author, title, content, updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, "posts"), {
                    author, title, content, createdAt: serverTimestamp()
                });
            }
            postModal.style.display = 'none';
        } catch (error) {
            console.error("데이터 저장 실패:", error);
            alert("저장 중 오류가 발생했습니다: " + error.message);
        }
    };
}

// 2. 글 읽기 (실시간 업데이트)
if (db) {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        postsList.innerHTML = '';
        if (snapshot.empty) {
            postsList.innerHTML = '<div style="text-align: center; padding: 2rem; color: #666;">작성된 게시글이 없습니다.</div>';
            return;
        }

        snapshot.forEach((postDoc) => {
            const post = postDoc.data();
            const date = post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : '작성 중...';
            
            const postEl = document.createElement('div');
            postEl.className = 'post-item';
            postEl.style.flexDirection = 'column';
            postEl.style.gap = '10px';
            postEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 1.1rem; color: #2121D5; cursor:pointer;" onclick="togglePost('${postDoc.id}')">${post.title}</strong>
                    <div class="text-muted" style="font-size: 0.8rem;">
                        ${post.author} | ${date}
                        <i data-lucide="edit-2" style="width: 14px; margin-left: 10px; cursor:pointer;" onclick="editPost('${postDoc.id}', '${post.author}', '${post.title}', \`${post.content}\`)"></i>
                        <i data-lucide="trash-2" style="width: 14px; margin-left: 5px; cursor:pointer; color: #ff4d4d;" onclick="deletePost('${postDoc.id}')"></i>
                    </div>
                </div>
                <div id="content-${postDoc.id}" style="display: none; padding: 1rem; background: #f8f9fa; border-radius: 8px; margin-top: 5px; border-left: 4px solid #2121D5;">
                    <p style="white-space: pre-wrap;">${post.content}</p>
                    <div class="comments-section">
                         <div id="comments-list-${postDoc.id}"></div>
                         <div style="display: flex; gap: 5px; margin-top: 10px;">
                            <input type="text" id="comment-input-${postDoc.id}" placeholder="댓글을 입력하세요..." style="flex: 1; padding: 5px; font-size: 0.8rem;">
                            <button class="btn btn-primary" style="padding: 5px 10px; font-size: 0.8rem;" onclick="addComment('${postDoc.id}')">등록</button>
                         </div>
                    </div>
                </div>
            `;
            postsList.appendChild(postEl);
            loadComments(postDoc.id);
        });
        if (window.lucide) lucide.createIcons();
    });
}

// 3. 동아리 데이터 (전체 코드 보존)
const clubData = {
    MAS: { name: "MAS", desc: "Microcontroller & Automation Systems 연구 동아리", img: "https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&q=80&w=400" },
    MCA: { name: "MCA", desc: "Mobile Computing & AI 로봇 접목 연구", img: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400" },
    MoAS: { name: "MoAS", desc: "모바일 기반 자동화 시스템 설계 및 제작", img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=400" },
    SMART: { name: "SMART", desc: "지능형 로봇 통신 시스템 연구", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400" },
    UR: { name: "UR", desc: "협동 로봇 및 산업용 로봇 제어 실습", img: "https://images.unsplash.com/photo-1561144443-f54bc579b33a?auto=format&fit=crop&q=80&w=400" },
    Intel: { name: "지능형로봇", desc: "고급 AI를 적용한 사회 문제 해결 프로젝트", img: "https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&q=80&w=400" }
};

// --- 기타 함수들 ---
window.togglePost = (id) => {
    const el = document.getElementById(`content-${id}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
};

window.editPost = (id, author, title, content) => {
    document.getElementById('postId').value = id;
    document.getElementById('postAuthor').value = author;
    document.getElementById('postTitle').value = title;
    document.getElementById('postContent').value = content;
    document.getElementById('modalTitle').innerText = '게시글 수정';
    postModal.style.display = 'flex';
};

window.deletePost = async (id) => {
    if (confirm("정말 삭제하시겠습니까?")) {
        await deleteDoc(doc(db, "posts", id));
    }
};

window.addComment = async (postId) => {
    const input = document.getElementById(`comment-input-${postId}`);
    if (!input.value) return;
    await addDoc(collection(db, "posts", postId, "comments"), {
        text: input.value,
        createdAt: serverTimestamp()
    });
    input.value = '';
};

function loadComments(postId) {
    const q = query(collection(db, "posts", postId, "comments"), orderBy("createdAt", "asc"));
    onSnapshot(q, (snapshot) => {
        const list = document.getElementById(`comments-list-${postId}`);
        if (!list) return;
        list.innerHTML = '';
        snapshot.forEach(cDoc => {
            const c = cDoc.data();
            const div = document.createElement('div');
            div.className = 'comment';
            div.style.background = '#f0f2f5';
            div.style.padding = '8px';
            div.style.borderRadius = '6px';
            div.style.marginBottom = '5px';
            div.style.fontSize = '0.9rem';
            div.innerText = c.text;
            list.appendChild(div);
        });
    });
}
