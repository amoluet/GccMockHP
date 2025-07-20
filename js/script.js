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

// ページコンテンツが全て読み込まれた後に実行される処理
document.addEventListener('DOMContentLoaded', function() {
    // ポップアップの閉じるボタンにイベントリスナーを追加
    const closePopupButton = document.querySelector('#popup .btn-secondary');
    if (closePopupButton) {
        closePopupButton.addEventListener('click', togglePopup);
    }

    // 広報ブログ記事の読み込みと表示
    const blogArticlesContainer = document.getElementById('blog-articles');
    if (blogArticlesContainer) {
        fetch('./data/articles.json')
            .then(response => response.json())
            .then(articles => {
                articles.forEach(article => {
                    const cardHtml = `
                        <div class="col">
                            <div class="card h-100 blog-card" data-article-id="${article.id}">
                                <img src="${article.thumbnail}" class="card-img-top" alt="${article.title}">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${article.title}</h5>
                                    <p class="card-text excerpt">${article.excerpt}</p>
                                    <div class="mt-auto text-end">
                                        <a href="blog-detail.html?id=${article.id}" class="btn btn-primary btn-sm">続きを読む</a>
                                    </div>
                                </div>
                                <div class="card-footer text-muted">
                                    公開日: ${article.date}
                                </div>
                            </div>
                        </div>
                    `;
                    blogArticlesContainer.insertAdjacentHTML('beforeend', cardHtml);
                });
            })
            .catch(error => console.error('Error loading blog articles:', error));
    }
});
