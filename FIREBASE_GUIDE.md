# 🔥 Firebase 구축 가이드: 로봇소프트웨어과 홈페이지

이 문서는 제공된 소스 코드를 구글 파이어베이스(Firebase)에 연결하고 실제 서비스로 배포하는 구체적인 절차를 담고 있습니다.

## 1단계: Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속하여 로그인합니다.
2. **"프로젝트 추가"**를 클릭하고 프로젝트 이름을 입력합니다 (예: `robot-software-web`).
3. Google 애널리틱스 설정은 선택 사항입니다 (연습용이라면 해제해도 무관).
4. 프로젝트 생성을 완료합니다.

## 2단계: 웹 앱 등록 및 SDK 설정
1. 프로젝트 홈 화면 중앙의 **웹 아이콘 (</>)**을 클릭합니다.
2. 앱 닉네임을 입력하고 **"Firebase Hosting"** 체크박스를 활성화한 뒤 "앱 등록"을 클릭합니다.
3. 화면에 나타나는 `firebaseConfig` 객체를 복사합니다.
   - `apiKey`, `authDomain`, `projectId` 등이 포함된 부분입니다.
4. 이 복사한 내용을 `app.js` 파일 상단의 `const firebaseConfig = { ... };` 부분에 붙여넣습니다.

## 3단계: Firestore Database 설정 (자유게시판 데이터베이스)
1. 왼쪽 메뉴에서 **빌드 > Firestore Database**를 클릭합니다.
2. **"데이터베이스 만들기"**를 클릭합니다.
3. 위치는 한국이라면 `asia-northeast3 (Seoul)`를 권장합니다.
4. **보안 규칙**은 연습을 위해 **"테스트 모드에서 시작"**을 선택하고 "만들기"를 클릭합니다.
   > [!WARNING]
   > 실제 서비스 시에는 인증된 사용자만 글을 쓸 수 있도록 보안 규칙을 업데이트해야 합니다.

## 4단계: Firebase CLI 설치 및 배포
게시판을 작동시키고 웹에 올리기 위해 다음 과정을 거칩니다.

1. 터미널(PowerShell 또는 CMD)에서 Firebase 도구를 설치합니다:
   ```bash
   npm install -g firebase-tools
   ```
2. 로그인 및 초기화:
   ```bash
   firebase login
   firebase init
   ```
   - **Hosting**을 스페이스바로 선택하고 엔터를 누릅니다.
   - **Use an existing project**를 선택하고 아까 만든 프로젝트를 선택합니다.
   - `public` 디렉토리 질문에는 현재 폴더인 `.` 또는 `src`를 상황에 맞게 입력하되, 별도 폴더가 없다면 기본값으로 둡니다.
   - **Single-page app** 질문에는 `Yes`를 입력합니다.

3. 최종 배포:
   ```bash
   firebase deploy
   ```
   - 배포가 완료되면 `Hosting URL`이 나타납니다. 이 주소로 전 세계 어디서든 접속 가능합니다.

---

## 🛠 주요 기능 활용 방법

### 자유게시판 (Free Board)
- **글쓰기**: 상단의 '글쓰기' 버튼을 눌러 이름, 제목, 내용을 입력합니다.
- **수정/삭제**: 게시글 우측의 아이콘(Edit, Trash)을 통해 가능합니다.
- **댓글**: 게시글 제목을 클릭하면 내용이 펼쳐지며 댓글을 작성할 수 있습니다.

### 전공동아리 탭
- `app.js` 내의 `clubData` 객체를 수정하여 동아리 설명과 이미지를 자유롭게 변경할 수 있습니다.

---

> [!TIP]
> **데이터 확인**: Firebase 콘솔의 Firestore 메뉴에서 실시간으로 데이터가 쌓이는 것을 확인할 수 있습니다.
