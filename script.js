// 初期化関数
function initClock(tick) {

    // 1 秒ごとに現在時刻を更新
    setInterval(function () {
        const now = new Date();

        // 時刻を HH:MM:SS の文字列にする
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        // コロンを入れる
        const str = `${hours}:${minutes}:${seconds}`;

        // tick に値をセット
        tick.value = str;

        // aria-label に時間表示を入れる（アクセシビリティ対応）
        tick.root.setAttribute('aria-label', str);
    }, 1000);

}
