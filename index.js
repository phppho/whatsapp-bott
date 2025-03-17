const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('📸 امسح QR Code لتسجيل الدخول:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ البوت جاهز للعمل على واتساب!');
});

// دالة لاستدعاء OpenRouter AI للردود الذكية
async function getAIResponse(userMessage) {
    try {
        const response = await axios.post(process.env.API_URL, {
            model: "mistral",
            messages: [{ role: "user", content: userMessage }],
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("❌ خطأ في الاتصال بـ OpenRouter:", error);
        return "عذرًا، حدث خطأ أثناء معالجة طلبك.";
    }
}

// التعامل مع الرسائل
client.on('message', async message => {
    const userMessage = message.body.toLowerCase().trim();

    // أوامر خاصة
    if (userMessage === "/help") {
        message.reply("🤖 *قائمة الأوامر:*\n/help - عرض المساعدة\n/info - معلومات البوت\n/clear - مسح المحادثات");
        return;
    }
    if (userMessage === "/info") {
        message.reply("🤖 بوت واتساب ذكي يعتمد على OpenRouter AI.");
        return;
    }

    // جلب رد من الذكاء الاصطناعي
    const aiReply = await getAIResponse(userMessage);
    message.reply(aiReply);
});

client.initialize();
