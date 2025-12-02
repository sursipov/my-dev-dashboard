export const sendTelegramNotification = async (message: string) => {
  const token = localStorage.getItem('telegramBotToken');
  const chatId = localStorage.getItem('telegramChatId');
  const notificationsEnabled = localStorage.getItem('notifications') === 'true';

  if (!notificationsEnabled || !token || !chatId) {
    console.log('Telegram notifications disabled or not configured');
    return false;
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML"
      }),
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('Telegram notification sent successfully');
      return true;
    } else {
      console.error('Telegram API error:', result.description);
      return false;
    }
  } catch (error) {
    console.error("Failed to send Telegram notification:", error);
    return false;
  }
};

let lastNotificationDate: string | null = null;

export const checkDeadlinesAndNotify = async (projects: any[]) => {
  const today = new Date().toISOString().split('T')[0];
  
  if (lastNotificationDate === today) {
    console.log('Notifications already sent today');
    return;
  }
  
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  const upcomingDeadlines = projects.filter(project => {
    if (project.completed) return false;
    
    const deadline = new Date(project.deadline);
    deadline.setHours(0, 0, 0, 0);
    const timeDiff = deadline.getTime() - todayDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    return daysDiff >= 0 && daysDiff <= 3;
  });

  if (upcomingDeadlines.length === 0) {
    console.log('No upcoming deadlines found');
    return;
  }

  let notificationsSent = 0;

  for (const project of upcomingDeadlines) {
    const deadline = new Date(project.deadline);
    deadline.setHours(0, 0, 0, 0);
    const timeDiff = deadline.getTime() - todayDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let message = '';
    
    const getDayWord = (days: number) => {
      if (days === 1) return 'день';
      if (days >= 2 && days <= 4) return 'дня';
      return 'дней';
    };

    if (daysDiff === 0) {
      message = `🚨 <b>СЕГОДНЯ ДЕДЛАЙН!</b>\n` +
                `📋 Проект: ${project.name}\n` +
                `📁 Тип: ${project.type}\n` +
                `💰 Стоимость: $${project.cost.toLocaleString()}\n` +
                `⏰ Успейте завершить проект сегодня!`;
    } else if (daysDiff === 1) {
      message = `⚠️ <b>Завтра дедлайн!</b>\n` +
                `📋 Проект: ${project.name}\n` +
                `📁 Тип: ${project.type}\n` +
                `💰 Стоимость: $${project.cost.toLocaleString()}\n` +
                `⏰ Остался 1 день до дедлайна`;
    } else {
      message = `📅 <b>До дедлайна ${daysDiff} ${getDayWord(daysDiff)}</b>\n` +
                `📋 Проект: ${project.name}\n` +
                `📁 Тип: ${project.type}\n` +
                `💰 Стоимость: $${project.cost.toLocaleString()}\n` +
                `📆 Дедлайн: ${deadline.toLocaleDateString('ru-RU')}`;
    }
    
    const success = await sendTelegramNotification(message);
    if (success) {
      notificationsSent++;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  if (notificationsSent > 0) {
    lastNotificationDate = today;
    console.log(`Sent ${notificationsSent} Telegram notifications`);
  }
};