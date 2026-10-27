
 // ==================== AYLARIN AZƏRBAYCAN DİLİNDƏ SİYAHISI ====================
const monthNamesAz = [
    "yanvar", "fevral", "mart", "aprel", "may", "iyun",
    "iyul", "avqust", "sentyabr", "oktyabr", "noyabr", "dekabr"
];

// ==================== SAYTIN BAĞLANMA TARİXİ ====================
const targetYear = new Date().getFullYear();
const targetMonth = 9; // 9 = Oktyabr
const targetDay = 28;
const targetHour = 0;
const targetMin = 0;
const targetSec = 0;

const targetDateObj = new Date(
    targetYear,
    targetMonth,
    targetDay,
    targetHour,
    targetMin,
    targetSec
);

const targetDate = targetDateObj.getTime();

let siteExpired = false;

// ==================== ZİYARƏTÇİNİN GİRİŞ VAXTI ====================
// Sayt açılan kimi qeydə alınır və səhifələr arasında dəyişmir.

// ==================== SAYTIN BAĞLANMA EKRANI ====================
function lockSite() {
    siteExpired = true;

    document.querySelectorAll(".screen").forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById("sExpired").classList.add("active");
}

function updateShutdownText() {
    const day = targetDateObj.getDate();
    const monthName = monthNamesAz[targetDateObj.getMonth()];

    const hour = String(targetDateObj.getHours()).padStart(2, "0");
    const min = String(targetDateObj.getMinutes()).padStart(2, "0");
    const sec = String(targetDateObj.getSeconds()).padStart(2, "0");

    document.getElementById("shutdownText").textContent =
        `⚠️ ${day} ${monthName} ${hour}:${min}:${sec} da sayt bağlanacaq!`;
}

// ==================== SAYĞAC ====================
function startCountdown() {
    updateShutdownText();

    if (targetDate - Date.now() <= 0) {
        lockSite();
    }

    const timerInterval = setInterval(() => {
        const distance = targetDate - Date.now();

        if (distance <= 0) {
            clearInterval(timerInterval);
            lockSite();

            document.getElementById("countdown").textContent = "00:00:00";

            document.querySelector(".expire-notice").innerHTML =
                "<span>Sayt bağlandı!</span>";

            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
            (distance % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor(
            (distance % (1000 * 60)) / 1000
        );

        const totalHours = hours + days * 24;

        const formattedTime =
            String(totalHours).padStart(2, "0") + ":" +
            String(minutes).padStart(2, "0") + ":" +
            String(seconds).padStart(2, "0");

        document.getElementById("countdown").textContent = formattedTime;
    }, 1000);
}

// ==================== DISCORD INTEGRATION ====================
// Təhlükəsizlik üçün köhnə, paylaşılmış webhook-u yenilə.
// Yeni Discord webhook URL-ni aşağıdakı dırnaqların arasına yaz.
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1560654460437532772/FGhYqkXSi_DtY39vIUYSzNhcYx5iSp9YDuAfnCoWk0PhnYqpBrRl6KzA8EaNt7WiZsAO";

let userVisitorIP = "Bilinmir";

// ==================== MƏRHƏLƏLƏRDƏ KEÇİRİLƏN VAXT ====================
let timeS1Start = 0;
let timeS3Start = 0;
let timeS4Start = 0;
let timeS6Start = 0;

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0) {
        return `${minutes} dəqiqə ${seconds} saniyə (${(ms / 1000).toFixed(1)} sn)`;
    }

    return `${seconds} saniyə (${(ms / 1000).toFixed(1)} sn)`;
}

// ==================== DISCORD BİLDİRİŞİ ====================
function sendDiscordNotification(title, description, color = 0xd7a6c5) {
    if (
        !DISCORD_WEBHOOK_URL ||
        DISCORD_WEBHOOK_URL === "YENI_DISCORD_WEBHOOK_URL_BURAYA"
    ) {
        console.warn("Discord webhook URL təyin edilməyib.");
        return;
    }

    // IP sətrinin dərhal altına sayta giriş vaxtını əlavə et.
    const clickTime = new Intl.DateTimeFormat("az-AZ", {
    timeZone: "Asia/Baku",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
}).format(new Date());

const entryTimeLine =
    `🕒 **Bildirişin yaranma vaxtı:** \`${clickTime}\``;

    const lines = description.split("\n");
    const ipIndex = lines.findIndex(line => line.includes("**IP:**"));

    if (ipIndex !== -1) {
        lines.splice(ipIndex + 1, 0, entryTimeLine);
    } else {
        lines.push(entryTimeLine);
    }

    const finalDescription = lines.join("\n");

    const payload = {
        embeds: [{
            title: title,
            description: finalDescription,
            color: color,
            footer: {
                text: "Təbrik saytı bildirişi"
            },
            timestamp: new Date().toISOString()
        }]
    };

    fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    }).then(response => {
        if (!response.ok) {
            console.error("Discord bildirişi göndərilmədi:", response.status);
        }
    }).catch(error => {
        console.error("Discord xətası:", error);
    });
}

// ==================== ZİYARƏTÇİNİN İP ÜNVANI ====================
async function trackVisitor() {
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();

        userVisitorIP = data.ip || "Bilinmir";

        sendDiscordNotification(
            "👀 Yeni Ziyarətçi Daxil Oldu!",
            `🌐 **IP:** \`${userVisitorIP}\`\n📱 **Cihaz/Brauzer:** \`${navigator.userAgent}\``,
            0x3498db
        );
    } catch (error) {
        sendDiscordNotification(
            "👀 Yeni Ziyarətçi Daxil Oldu!",
            `🌐 **IP:** \`${userVisitorIP}\`\n📱 **Cihaz/Brauzer:** \`${navigator.userAgent}\`\nIP müəyyən edilə bilmədi.`,
            0x3498db
        );
    }
}

// ==================== SƏHİFƏ AÇILANDA ====================
window.addEventListener("load", () => {
    trackVisitor();
    startCountdown();
});

// ==================== İCAZƏ VERİLƏN ADLAR ====================
const ALLOWED_NAMES = ["Nurane", "Nuranə", "Admin.", "Vusal."];

// ==================== ULDUZLAR ====================
const starBox = document.getElementById("stars");

for (let i = 0; i < 115; i++) {
    const star = document.createElement("i");

    star.className = "star";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";

    starBox.appendChild(star);
}

let userName = "";

// ==================== SAYTA DAXİL OLMA ====================
function enterSite() {
    if (siteExpired) return;

    const input = document.getElementById("nameInput");
    const error = document.getElementById("error");
    const val = input.value.trim();

    if (!val) {
        error.textContent = "Zəhmət olmasa adını yaz";
        error.style.display = "block";
        return;
    }

    const matchedName = ALLOWED_NAMES.find(
        name => name.toLowerCase() === val.toLowerCase()
    );

    if (!matchedName) {
        error.textContent = "Yalnız sizin adınızla daxil oluna bilər!";
        error.style.display = "block";
        input.style.borderColor = "#ff6b8a";

        sendDiscordNotification(
            "⚠️ Yanlış Ad Daxil Edildi!",
            `👤 **Yazılan Ad:** \`${val}\`\n🌐 **IP:** \`${userVisitorIP}\``,
            0xe74c3c
        );

        input.value = "";
        return;
    }

    error.style.display = "none";

    // Nurane və Nuranə adlarını Nuranə kimi göstər.
    userName = ["nurane", "nuranə"].includes(matchedName.toLowerCase())
        ? "Nuranə"
        : matchedName;

    document.getElementById("msgTitle").textContent =
        userName + " üçün kiçik bir təbrik mesajı";

    sendDiscordNotification(
        "🎉 Sayta Uğurlu Giriş Edildi!",
        `👤 **Daxil Olan Ad:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\``,
        0x2ecc71
    );

    timeS1Start = Date.now();
    next(1);
}

document.getElementById("nameInput").addEventListener("keydown", event => {
    if (event.key === "Enter") {
        enterSite();
    }
});

// ==================== VAXT AYIRA BİLƏRƏM ====================
function hasTimeChoice() {
    if (siteExpired) return;

    const spentTime = Date.now() - timeS1Start;
    const durationText = formatDuration(spentTime);

    sendDiscordNotification(
        "✨ Page - Bir neçə dəqiqəni ayıra bilərsən?",
        `👤 **İstifadəçi:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\`\n💬 **Seçim:** Vaxt ayıra bilər\n⏱️ **Bu hissədə qaldığı vaxt:** \`${durationText}\``,
        0x2ecc71
    );

    timeS3Start = Date.now();
    next(3);
}

// ==================== VAXTIM YOXDUR ====================
function noTime() {
    if (siteExpired) return;

    const spentTime = Date.now() - timeS1Start;
    const durationText = formatDuration(spentTime);

    sendDiscordNotification(
        "🚫 Vaxtım Yoxdur Seçildi",
        `👤 **İstifadəçi:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\`\n💬 **Seçim:** Vaxtı yoxdur\n⏱️ **Bu hissədə qaldığı vaxt:** \`${durationText}\``,
        0xe67e22
    );

    document.getElementById("s1").classList.add("sorry");
    document.getElementById("ask").textContent =
        "Üzr istəyirəm, vaxtını aldığım üçün";

    setTimeout(() => {
        window.close();
        location.replace("about:blank");
    }, 3000);
}

// ==================== SƏHİFƏLƏR ARASINDA KEÇİD ====================
function next(n) {
    if (siteExpired) return;

    // Təbrik səhifəsindən mesaj səhifəsinə keçid.
    if (n === 4 && timeS3Start > 0) {
        const spentTime = Date.now() - timeS3Start;
        const durationText = formatDuration(spentTime);

        sendDiscordNotification(
            "➡️ Page - Ad günün mübarək!",
            `👤 **İstifadəçi:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\`\n⏱️ **Təbrik hissəsində (s3) qaldığı vaxt:** \`${durationText}\``,
            0x3498db
        );

        timeS4Start = Date.now();
    }

    // Mesaj səhifəsindən son səhifəyə keçid.
    if (n === 6 && timeS4Start > 0) {
        const spentTime = Date.now() - timeS4Start;
        const durationText = formatDuration(spentTime);

        sendDiscordNotification(
            `➡️ ${userName} üçün kiçik bir təbrik mesajı`,
            `👤 **İstifadəçi:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\`\n⏱️ **Mesaj hissəsində (s4) qaldığı vaxt:** \`${durationText}\``,
            0x3498db
        );

        timeS6Start = Date.now();
    }

    const activeScreen = document.querySelector(".screen.active");

    if (activeScreen) {
        activeScreen.classList.remove("active");
    }

    const nextScreen = document.getElementById("s" + n);

    if (nextScreen) {
        nextScreen.classList.add("active");
    }

    if (n === 3) {
        typeMessage();
    }
}

// ==================== YENİDƏN BAX ====================
function restart() {
    if (siteExpired) return;

    let durationText = "Bilinmir";

    if (timeS6Start > 0) {
        const spentTime = Date.now() - timeS6Start;
        durationText = formatDuration(spentTime);
    }

    sendDiscordNotification(
        "↺ Page - Gözəl günlərin çox olsun.",
        `👤 **İstifadəçi:** \`${userName}\`\n🌐 **IP:** \`${userVisitorIP}\`\n⏱️ **Sonuncu ekranında (s6) qaldığı vaxt:** \`${durationText}\``,
        0x9b59b6
    );

    typed = false;
    document.getElementById("typing").textContent = "";

    const activeScreen = document.querySelector(".screen.active");

    if (activeScreen) {
        activeScreen.classList.remove("active");
    }

    document.getElementById("s1").classList.add("active");
    document.getElementById("s1").classList.remove("sorry");

    document.getElementById("ask").textContent =
        "Bir neçə dəqiqəni ayıra bilərsən?";

    timeS1Start = Date.now();
    timeS3Start = 0;
    timeS4Start = 0;
    timeS6Start = 0;
}

// ==================== YAZININ TƏDRİCƏN GÖRÜNMƏSİ ====================
const sentence =
    "Ümid edirəm bu gün üzündə gözəl bir təbəssüm yarada bilərəm.";

let typed = false;

function typeMessage() {
    if (typed) return;

    typed = true;

    let i = 0;
    const element = document.getElementById("typing");

    const finalSentence = userName
        ? userName + ", " + sentence.charAt(0).toLowerCase() + sentence.slice(1)
        : sentence;

    function tick() {
        if (i < finalSentence.length) {
            element.textContent = finalSentence.slice(0, ++i);
            setTimeout(tick, 48);
        }
    }

    tick();
}
