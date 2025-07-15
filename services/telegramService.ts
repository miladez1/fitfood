import type { Order, User, AdminSettings } from '../types.ts';

const formatOrderForTelegram = (order: Order, user: User): string => {
    let message = `🔔 **سفارش جدید دریافت شد!**\n\n`;
    message += `👤 **کاربر:** ${user.fullName || user.email}\n`;
    message += `📞 **تلفن:** ${user.phone || 'ثبت نشده'}\n`;
    message += `\n---\n\n`;
    message += `🚚 **روش تحویل:** ${order.deliveryMethod}\n`;
    message += `📍 **آدرس:** ${order.address}\n`;
    message += `⏰ **ساعت تحویل:** ${order.deliveryTime}\n`;
    message += `\n---\n\n`;
    message += `🛍 **آیتم‌های سفارش:**\n`;
    order.items.forEach(item => {
        message += `  - ${item.name} (x${item.quantity}) - ${(item.discountPrice ?? item.price).toLocaleString('fa-IR')} تومان\n`;
    });
    if (order.drinks.length > 0) {
        message += `\n🥤 **نوشیدنی‌ها:**\n`;
        order.drinks.forEach(drink => {
            message += `  - ${drink.name} (x${drink.quantity}) - ${drink.price.toLocaleString('fa-IR')} تومان\n`;
        });
    }
    message += `\n---\n\n`;
    message += `💳 **روش پرداخت:** ${order.paymentMethod}\n`;
    if (order.paymentMethod === 'کارت به کارت' && order.receiptImage) {
        message += `🧾 **وضعیت رسید:** رسید آپلود شد (در پنل مدیریت بررسی کنید).\n`;
    }
    message += `\n---\n\n`;
    message += `💰 **مبلغ نهایی:** **${order.totalPrice.toLocaleString('fa-IR')} تومان**\n`;

    return message;
};


export const sendTelegramNotification = async (order: Order, user: User, settings: AdminSettings): Promise<void> => {
    if (!settings.telegramToken || !settings.telegramChatId) {
        console.warn("Telegram settings are not configured. Skipping notification.");
        return;
    }

    const message = formatOrderForTelegram(order, user);
    const url = `https://api.telegram.org/bot${settings.telegramToken}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: settings.telegramChatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        if (!result.ok) {
            console.error("Failed to send Telegram notification:", result.description);
        } else {
             console.log("Telegram notification sent successfully.");
        }
    } catch (error) {
        console.error("Error sending Telegram notification:", error);
    }
};