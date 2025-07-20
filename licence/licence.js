const terms = {
    lastUpdated: "2025年7月21日",
    sections: [
      {
        title: "ダウンロードについて",
        content: "改変しないなら自由に遊んで諸手"
      }
    ]
  };
  
  const termsContainer = document.getElementById("terms");
  termsContainer.innerHTML = `${terms.lastUpdated}更新<br><br>`;
  
  terms.sections.forEach(section => {
    termsContainer.innerHTML += `<strong>${section.title}</strong><br>${section.content.split('。').join('。<br>')}<br><br>`;
  });