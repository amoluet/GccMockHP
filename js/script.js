// ヘッダーとフッターの動的読み込み
document.addEventListener("DOMContentLoaded", () => {
    fetchHeader();
    fetchFooter();
    
    // 現在のページに応じた処理
    if (document.getElementById('promotion-banner')) { // index.htmlの場合
        loadPromotionBanner();
        loadTopBlogArticles();
    }
    if (document.getElementById('blog-list')) { // blog-list.htmlの場合
        loadBlogList();
    }
    if (document.getElementById('blog-title')) { // blog-detail.htmlの場合
        loadBlogArticleDetail();
    }
});

async function fetchHeader() {
    try {
        const response = await fetch('header.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const headerHtml = await response.text();
        document.getElementById('header-placeholder').innerHTML = `<header class="bg-dark text-light">${headerHtml}</header>`;
    } catch (error) {
        console.error('ヘッダーの読み込みに失敗しました:', error);
    }
}

async function fetchFooter() {
    try {
        const response = await fetch('footer.html');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const footerHtml = await response.text();
        document.getElementById('footer-placeholder').innerHTML = `<footer class="bg-dark text-light py-4">${footerHtml}</footer>`;
    } catch (error) {
        console.error('フッターの読み込みに失敗しました:', error);
    }
}

async function loadPromotionBanner() {
    try {
        const response = await fetch('data/banner_posts.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const banners = await response.json();
        const carouselInner = document.querySelector('#banner-carousel .carousel-inner');
        const carouselIndicators = document.querySelector('#banner-carousel .carousel-indicators');

        if (!carouselInner || !carouselIndicators) {
            console.warn('バナーの表示要素が見つかりません。');
            return;
        }

        carouselInner.innerHTML = '';
        carouselIndicators.innerHTML = '';

        banners.forEach((banner, index) => {
            const activeClass = index === 0 ? 'active' : '';
            carouselInner.innerHTML += `
                <div class="carousel-item ${activeClass}">
                    <a href="${banner.link}">
                        <img src="${banner.image}" class="d-block w-100" alt="${banner.title}">
                        <div class="carousel-caption d-none d-md-block">
                            <h5>${banner.title}</h5>
                            <p class="badge bg-primary">${banner.category}</p>
                        </div>
                    </a>
                </div>
            `;
            carouselIndicators.innerHTML += `
                <button type="button" data-bs-target="#banner-carousel" data-bs-slide-to="${index}" class="${activeClass}" aria-current="${activeClass ? 'true' : 'false'}" aria-label="Slide ${index + 1}"></button>
            `;
        });
    } catch (error) {
        console.error('プロモーションバナーの読み込みに失敗しました:', error);
    }
}

async function loadBlogArticles(containerId, limit = null, tag = null) {
    try {
        const response = await fetch('data/blog_articles.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        let articles = await response.json();

        // 日付の新しい順にソート (降順)
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));

        // タグでフィルタリング
        if (tag && tag !== "全て") {
            articles = articles.filter(article => article.tags.includes(tag));
        }

        const blogArticlesContainer = document.getElementById(containerId);
        if (!blogArticlesContainer) return;
        blogArticlesContainer.innerHTML = ''; // 既存のコンテンツをクリア

        if (articles.length === 0) {
            blogArticlesContainer.innerHTML = '<p class="text-center col-12">該当する記事はありません。</p>';
            return;
        }

        // 記事数の制限
        if (limit) {
            articles = articles.slice(0, limit);
        }

        articles.forEach(article => {
            const cardHtml = `
                <div class="col">
                    <div class="card h-100 blog-card">
                        <img src="${article.thumbnail}" class="card-img-top" alt="${article.title}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${article.title}</h5>
                            <p class="card-text text-muted">${article.date}</p>
                            <p class="card-text excerpt">${article.excerpt}</p>
                            <div class="blog-tags mt-auto mb-2">
                                ${article.tags.map(tag => `<span class="badge bg-secondary me-1 blog-tag-clickable" data-tag="${tag}">${tag}</span>`).join('')}
                            </div>
                            <div class="text-end">
                                <a href="blog-detail.html?id=${article.id}" class="btn btn-primary btn-sm">続きを読む</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            blogArticlesContainer.insertAdjacentHTML('beforeend', cardHtml);
        });

        // ブログ記事内のタグにイベントリスナーを追加
        if (containerId === 'blog-articles-container') {
            document.querySelectorAll('.blog-tag-clickable').forEach(tagElement => {
                tagElement.addEventListener('click', (event) => {
                    const selectedTag = event.target.dataset.tag;
                    if (selectedTag) {
                        window.location.href = `blog-list.html?tag=${encodeURIComponent(selectedTag)}`;
                    }
                });
            });
        }

    } catch (error) {
        console.error(`ブログ記事の読み込みに失敗しました (${containerId}):`, error);
    }
}

// index.html 用の最新記事ロード
function loadTopBlogArticles() {
    loadBlogArticles('top-blog-articles', 3); // 最新の3件をロード
}

// blog-list.html 用の全記事ロードとタグフィルタリング
async function loadBlogList() {
    const urlParams = new URLSearchParams(window.location.search);
    const initialTag = urlParams.get('tag');

    // タグボタンの生成
    const response = await fetch('data/blog_articles.json');
    const allArticles = await response.json();
    const allTags = new Set();
    allArticles.forEach(article => {
        article.tags.forEach(tag => allTags.add(tag));
    });

    const tagButtonsContainer = document.querySelector('#blog-list .text-center');
    if (tagButtonsContainer) {
        // 既存の「全て」ボタンを保持しつつ、他のタグを追加
        const existingAllButton = tagButtonsContainer.querySelector('[data-tag="全て"]');
        tagButtonsContainer.innerHTML = ''; // 一度クリアしてから再構築

        // 「全て」ボタンを再追加
        tagButtonsContainer.innerHTML += `<button class="btn btn-outline-primary btn-sm me-2 mb-2" data-tag="全て">全て</button>`;

        // 他のタグボタンを追加
        Array.from(allTags).sort().forEach(tag => {
            tagButtonsContainer.innerHTML += `<button class="btn btn-outline-primary btn-sm me-2 mb-2" data-tag="${tag}">${tag}</button>`;
        });

        // 初期タグが指定されている場合、そのタグのボタンをアクティブにする
        let activeTagButton = tagButtonsContainer.querySelector(`[data-tag="${initialTag || '全て'}"]`);
        if (activeTagButton) {
            activeTagButton.classList.add('active');
        } else {
            // 不正なタグが指定された場合は「全て」をアクティブにする
            tagButtonsContainer.querySelector('[data-tag="全て"]').classList.add('active');
        }

        // タグボタンにイベントリスナーを追加
        tagButtonsContainer.addEventListener('click', (event) => {
            const target = event.target;
            if (target.tagName === 'BUTTON' && target.dataset.tag) {
                // アクティブクラスの切り替え
                document.querySelectorAll('#blog-list .text-center .btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                target.classList.add('active');

                const selectedTag = target.dataset.tag;
                loadBlogArticles('blog-articles-container', null, selectedTag);
                // URLのクエリパラメータを更新して履歴に残す
                const newUrl = new URL(window.location.href);
                if (selectedTag === "全て") {
                    newUrl.searchParams.delete('tag');
                } else {
                    newUrl.searchParams.set('tag', selectedTag);
                }
                window.history.pushState({ path: newUrl.href }, '', newUrl.href);
            }
        });
    }
    // 初回ロード時、クエリパラメータに基づいて記事をロード
    loadBlogArticles('blog-articles-container', null, initialTag);
}

async function loadBlogArticleDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const articleId = parseInt(urlParams.get('id'));

    if (isNaN(articleId)) {
        document.getElementById('blog-title').textContent = '記事IDが指定されていません';
        document.getElementById('blog-date').textContent = '';
        document.getElementById('blog-thumbnail').style.display = 'none';
        document.getElementById('blog-content').innerHTML = '<p class="text-center">表示する記事のIDが指定されていません。</p>';
        document.getElementById('blog-tags-container').innerHTML = ''; // タグもクリア
        return;
    }

    try {
        const response = await fetch('data/blog_articles.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const articles = await response.json();
        const article = articles.find(a => a.id === articleId);

        if (article) {
            document.getElementById('blog-title').textContent = article.title;
            document.getElementById('blog-date').textContent = article.date;
            document.getElementById('blog-thumbnail').src = article.thumbnail;
            document.getElementById('blog-content').innerHTML = article.content;

            const tagsContainer = document.getElementById('blog-tags-container');
            tagsContainer.innerHTML = article.tags.map(tag => 
                `<span class="badge bg-info me-1 blog-tag-detail-clickable" data-tag="${tag}">${tag}</span>`
            ).join(''); // タグ表示

            // 詳細ページのタグにイベントリスナーを追加
            document.querySelectorAll('.blog-tag-detail-clickable').forEach(tagElement => {
                tagElement.addEventListener('click', (event) => {
                    const selectedTag = event.target.dataset.tag;
                    if (selectedTag) {
                        window.location.href = `blog-list.html?tag=${encodeURIComponent(selectedTag)}`;
                    }
                });
            });

        } else {
            document.getElementById('blog-title').textContent = '記事が見つかりません';
            document.getElementById('blog-date').textContent = '';
            document.getElementById('blog-thumbnail').style.display = 'none';
            document.getElementById('blog-content').innerHTML = '<p class="text-center">指定された記事は存在しません。</p>';
            document.getElementById('blog-tags-container').innerHTML = ''; // タグもクリア
        }
    } catch (error) {
        console.error('Error loading article:', error);
        document.getElementById('blog-title').textContent = '記事の読み込みエラー';
        document.getElementById('blog-date').textContent = '';
        document.getElementById('blog-thumbnail').style.display = 'none';
        document.getElementById('blog-content').innerHTML = '<p class="text-center">記事の読み込み中にエラーが発生しました。</p>';
        document.getElementById('blog-tags-container').innerHTML = ''; // タグもクリア
    }
}


// スクロールアニメーション
const animatedElements = document.querySelectorAll(".animate");
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("fade-in");
        observer.unobserve(entry.target); // 一度アニメーションしたら監視を停止
      }
    });
  },
  { threshold: 0.2 } // 要素が20%表示されたらアニメーション
);

animatedElements.forEach((el) => observer.observe(el));

// ヒーローセクションのタイトルアニメーション (初回のみ)
const heroTitle = document.querySelector(".animate-hero");
if (heroTitle) {
    setTimeout(() => {
        heroTitle.style.opacity = '1';
        heroTitle.style.transform = 'translateY(0) scale(1)';
    }, 300); // ページロードから少し遅らせて実行
}

// ポップアップ (利用規約)
function togglePopup() {
  var popup = document.getElementById("popup");
  var overlay = document.getElementById("overlay");
  if (popup.style.display === "block") {
    // 閉じるときのアニメーション
    popup.style.animation = "popup2FadeYReverse 0.4s ease forwards";
    overlay.style.animation = "overlayFadeReverse 0.4s ease forwards";
    setTimeout(() => {
        popup.style.display = "none";
        overlay.style.display = "none";
        popup.style.animation = ""; // アニメーションをリセット
        overlay.style.animation = ""; // アニメーションをリセット
    }, 400); // アニメーション時間に合わせて遅延
  } else {
    // 開くときのアニメーション
    popup.style.display = "block";
    overlay.style.display = "block";
    popup.style.animation = "popup2FadeY 0.4s ease forwards";
    overlay.style.animation = "overlayFade 0.4s ease forwards";
  }
}

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginMessage = document.getElementById('loginMessage');

    // モックのユーザー名とパスワード
    const correctUsername = 'member';
    const correctPassword = 'password';

    // 既にログインしている場合はmember-area.htmlへリダイレクト
    if (localStorage.getItem('isLoggedIn') === 'true') {
        if (window.location.pathname.endsWith('login.html')) {
            window.location.href = 'member-area.html';
        }
    }

    if (loginForm) { // login.html の場合のみ実行
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault(); // フォームのデフォルト送信を防止

            const enteredUsername = usernameInput.value;
            const enteredPassword = passwordInput.value;

            if (enteredUsername === correctUsername && enteredPassword === correctPassword) {
                loginMessage.textContent = 'ログイン成功！部員ページへリダイレクトします...';
                loginMessage.className = 'alert alert-success';
                loginMessage.style.display = 'block';

                // ログイン成功時にlocalStorageにフラグを保存
                localStorage.setItem('isLoggedIn', 'true');

                setTimeout(() => {
                    window.location.href = 'member-area.html'; // 部員専用ページへリダイレクト
                }, 1500);
            } else {
                loginMessage.textContent = 'ユーザー名またはパスワードが間違っています。';
                loginMessage.className = 'alert alert-danger';
                loginMessage.style.display = 'block';
                // 失敗時はlocalStorageのフラグをクリア
                localStorage.removeItem('isLoggedIn');
            }
        });
    }
});


if (window.location.pathname.endsWith('member-area.html')) {
    const isLoggedIn = localStorage.getItem('isLoggedIn');

    if (isLoggedIn !== 'true') {
        // ログインしていない場合、ログインページへリダイレクト
        alert('このページへのアクセスにはログインが必要です。');
        window.location.href = 'login.html';
        return;
    }

    // ログアウトボタンの処理
    const logoutButton = document.getElementById('logoutButton'); 
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('isLoggedIn');
            alert('ログアウトしました。');
            window.location.href = 'login.html';
        });
    } else {
        console.log("IDが'logoutButton'の要素が見つかりません。");
    }
}
