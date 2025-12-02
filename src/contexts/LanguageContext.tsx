import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  ru: {
    'settings': 'Настройки',
    'back': 'Назад',
    'save': 'Сохранить',
    'cancel': 'Отмена',
    'delete': 'Удалить',
    'edit': 'Редактировать',
    'add': 'Добавить',
    'loading': 'Загрузка...',
    
    'appearance': 'Внешний вид',
    'theme': 'Тема',
    'light': 'Светлая',
    'dark': 'Темная',
    'chooseTheme': 'Выберите светлую или темную тему',
    
    'mainSettings': 'Основные настройки',
    'currency': 'Валюта',
    'currencyForDisplay': 'Валюта для отображения сумм',
    'conversionCurrency': 'Валюта конвертации',
    'conversionCurrencyDesc': 'Валюта для отображения в скобках рядом с основной суммой',
    'language': 'Язык',
    'interfaceLanguage': 'Язык интерфейса',
    
    'notifications': 'Уведомления',
    'receiveNotifications': 'Получать уведомления о дедлайнах',
    'autoBackup': 'Авто-бэкап',
    'autoBackupDesc': 'Автоматическое сохранение данных',

    'telegramBot': 'Telegram Бот',
    'botToken': 'Токен бота',
    'botTokenDesc': 'Получите у @BotFather в Telegram. Формат: 1234567890:ABCDEFGhijKlmnOpqRstUvWxyz123456',
    'chatId': 'ID чата',
    'chatIdDesc': 'Узнайте у @userinfobot в Telegram. Формат: 123456789',
    'testMessage': 'Тестовое сообщение',
    'testMessageDesc': 'Отправьте тестовое сообщение для проверки настроек',
    'send': 'Отправка...',
    'test': 'Тест',
    'botConfigured': 'Telegram бот настроен. Уведомления о дедлайнах будут отправляться при включенных уведомлениях.',

    'fillBotTokenAndChatId': 'Заполните токен бота и ID чата',
    'defaultTestMessage': '✅ Тестовое сообщение от SursipFlow! Бот настроен правильно.',
    'testMessageSuccess': '✅ Тестовое сообщение отправлено успешно!',
    'testMessageError': '❌ Ошибка: {description}',
    'sendMessageError': '❌ Ошибка при отправке сообщения. Проверьте токен и ID чата.',
    
    'dataManagement': 'Управление данными',
    'exportData': 'Экспорт данных за месяц',
    'exportDataDesc': 'Экспортировать проекты и цели за {month}',
    'clearAllData': 'Очистить все данные',
    'export': 'Экспорт',
    'clearDataConfirm': 'Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.',
    'dataExported': 'Данные за {month} успешно экспортированы!',
    'backupWarning': 'Экспортируйте свои данные для резервного копирования или очистите все данные приложения',
    
    'aboutApp': 'О приложении',
    'version': 'Версия',
    'buildDate': 'Дата сборки',
    'copyright': '©2025 SursipFlow. Все права защищены.',
    
    'dashboard': 'Дашборд',
    'projects': 'Проект',
    'goals': 'Цели',
    'notes': 'Заметки',
    'dayPlans': 'Планы на день',
    'stats': 'Статистика',
    
    'newProject': 'Новый проект',
    'projectName': 'Название проекта',
    'projectType': 'Тип проекта',
    'chooseType': 'Выберите тип',
    'customType': 'Другой (ввести свой)',
    'enterCustomType': 'Введите тип проекта',
    'cost': 'Стоимость',
    'deadline': 'Дедлайн',
    'notesField': 'Заметки (необязательно)',
    'placeholderNotes': 'ТЗ, пожелания клиента...',
    'create': 'Создать',
    'creating': 'Создание...',
    'noProjects': 'Проектов пока нет.',
    'createFirstProject': 'Нажмите «+ Новый проект», чтобы создать первый!',
    'sorting': 'Сортировка',
    'newest': 'Новые',
    'byType': 'Тип',
    'byCost': 'Стоимость',
    'byDeadline': 'Дедлайн',
    'ascending': 'возрастание',
    'descending': 'убывание',
    'projectsCount': 'проектов',
    'markCompleted': 'Отметить как выполненный',
    'projectCompleted': 'Проект выполнен',
    "noCompletedProjects": "Нет завершенных проектов",
    
    'newGoal': 'Новая цель',
    'targetAmount': 'Целевая сумма',
    'month': 'Месяц',
    'saveGoal': 'Сохранить цель',
    'saving': 'Сохранение...',
    'fillAllFields': 'Заполните все поля',
    'amountGreaterThanZero': 'Сумма должна быть больше 0',
    'noGoals': 'Целей пока нет.',
    'setFinancialGoals': 'Установите финансовые цели для отслеживания прогресса!',
    
    'totalEarned': 'Всего заработано',
    'averageAmount': 'Средняя сумма',
    'completedProjects': 'Выполнено',
    'averageTime': 'Среднее время',
    'topProfitableTypes': 'Топ-5 прибыльных',
    'topLongest': 'Топ-5 самых долгих',
    'progressToGoal': 'Прогресс к цели',
    'goalNotSet': 'Цель на месяц не установлена.',
    'setGoal': 'Установить цель',
    'completed': 'Выполнено.',
    'days': 'дн.',

    'projectNamePlaceholder': 'Лендинг для кофейни',
    'descriptionPlaceholder': 'Подробности, ссылки, ТЗ...',
    'forMonth': 'За',
    'errorCreatingProject': 'Ошибка при создании проекта',
    'errorCreatingType': 'Ошибка при создании типа проекта',
    'errorUpdatingProject': 'Ошибка при обновлении проекта',
    'fillRequiredFields': 'Заполните обязательные поля: название, стоимость и дедлайн',
    'chooseOrEnterType': 'Выберите или введите тип проекта',
    'errorSavingGoal': 'Ошибка при сохранении цели',

    'planning': 'Планы',
    'newTask': 'Новая задача',
    'noTasks': 'Задач пока нет.',
    'createFirstTask': 'Нажмите «+ Новая задача», чтобы создать первую!',
    'executionDate': 'Дата выполнения',
    'taskName': 'Название задачи',
    'enterTaskName': 'Введите название задачи',
    'descriptionOptional': 'Описание (необязательно)',
    'priority': 'Приоритет',
    'high': 'Высокий',
    'medium': 'Средний',
    'low': 'Низкий',
    'adding': 'Добавление...',
    'addTask': 'Добавить задачу',
    'tasksCount': 'задач',
    'today': 'Сегодня',
    'tomorrow': 'Завтра',

    'newNote': 'Новая заметка',
    'editNote': 'Редактировать заметку',
    'noNotes': 'Заметок пока нет.',
    'createFirstNote': 'Нажмите «+ Новая заметка», чтобы создать первую!',
    'title': 'Заголовок',
    'content': 'Содержание',
    'tags': 'Теги (через запятую)',
    'createNote': 'Создать заметку',
    'noteTitlePlaceholder': 'Заголовок заметки',
    'noteContentPlaceholder': 'Содержание заметки...',
    'noteTitleRequired': 'Введите заголовок заметки',

    'home': 'Главная',
    'startDate': 'Дата начала',
    'status': 'Статус',
    'active': 'Активный.',
    'goalAchieved': 'Цель достигнута!',
    'notSet': 'Не указано',
  },
  en: {
    'settings': 'Settings',
    'back': 'Back',
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'add': 'Add',
    'loading': 'Loading...',
    
    'appearance': 'Appearance',
    'theme': 'Theme',
    'light': 'Light',
    'dark': 'Dark',
    'chooseTheme': 'Choose light or dark theme',
    
    'mainSettings': 'Main Settings',
    'currency': 'Currency',
    'currencyForDisplay': 'Currency for displaying amounts',
    'conversionCurrency': 'Conversion Currency',
    'conversionCurrencyDesc': 'Currency to display in parentheses next to the main amount',
    'language': 'Language',
    'interfaceLanguage': 'Interface language',
    
    'notifications': 'Notifications',
    'receiveNotifications': 'Receive deadline notifications',
    'autoBackup': 'Auto-backup',
    'autoBackupDesc': 'Automatic data saving',
    
    'telegramBot': 'Telegram Bot',
    'botToken': 'Bot Token',
    'botTokenDesc': 'Get from @BotFather in Telegram. Format: 1234567890:ABCDEFGhijKlmnOpqRstUvWxyz123456',
    'chatId': 'Chat ID',
    'chatIdDesc': 'Get from @userinfobot in Telegram. Format: 123456789',
    'testMessage': 'Test message',
    'testMessageDesc': 'Send a test message to check settings',
    'send': 'Sending...',
    'test': 'Test',
    'botConfigured': 'Telegram bot configured. Deadline notifications will be sent with notifications enabled.',

    'fillBotTokenAndChatId': 'Fill in bot token and chat ID',
    'defaultTestMessage': '✅ Test message from SursipFlow! Bot configured correctly.',
    'testMessageSuccess': '✅ Test message sent successfully!',
    'testMessageError': '❌ Error: {description}',
    'sendMessageError': '❌ Error sending message. Check token and chat ID.',
    
    'dataManagement': 'Data Management',
    'exportData': 'Export data for month',
    'exportDataDesc': 'Export projects and goals for {month}',
    'clearAllData': 'Clear all data',
    'export': 'Export',
    'clearDataConfirm': 'Are you sure you want to delete all data? This action cannot be undone.',
    'dataExported': 'Data for {month} successfully exported!',
    'backupWarning': 'Export your data for backup or clear all app data',
    
    'aboutApp': 'About App',
    'version': 'Version',
    'buildDate': 'Build date',
    'copyright': '©2025 SursipFlow. All rights reserved.',
    
    'dashboard': 'Dashboard',
    'projects': 'Project',
    'goals': 'Goals',
    'notes': 'Notes',
    'dayPlans': 'Day Plans',
    'stats': 'Statistics',
    
    'newProject': 'New Project',
    'projectName': 'Project Name',
    'projectType': 'Project Type',
    'chooseType': 'Choose type',
    'customType': 'Other (enter custom)',
    'enterCustomType': 'Enter project type',
    'cost': 'Cost',
    'deadline': 'Deadline',
    'notesField': 'Notes (optional)',
    'placeholderNotes': 'Requirements, client wishes...',
    'create': 'Create',
    'creating': 'Creating...',
    'noProjects': 'No projects yet.',
    'createFirstProject': 'Click "+ New Project" to create the first one!',
    'sorting': 'Sorting',
    'newest': 'Newest',
    'byType': 'Type',
    'byCost': 'Cost',
    'byDeadline': 'Deadline',
    'ascending': 'ascending',
    'descending': 'descending',
    'projectsCount': 'projects',
    'markCompleted': 'Mark as completed',
    'projectCompleted': 'Project completed',
    "noCompletedProjects": "No completed projects",
    
    'newGoal': 'New Goal',
    'targetAmount': 'Target Amount',
    'month': 'Month',
    'saveGoal': 'Save Goal',
    'saving': 'Saving...',
    'fillAllFields': 'Fill in all fields',
    'amountGreaterThanZero': 'Amount must be greater than 0',
    'noGoals': 'No goals yet.',
    'setFinancialGoals': 'Set financial goals to track progress!',
    
    'totalEarned': 'Total Earned',
    'averageAmount': 'Average Amount',
    'completedProjects': 'Completed',
    'averageTime': 'Average Time',
    'topProfitableTypes': 'Top-5 Profitable',
    'topLongest': 'Top-5 Longest',
    'progressToGoal': 'Progress to Goal',
    'goalNotSet': 'Goal for month not set.',
    'setGoal': 'Set Goal',
    'completed': 'completed',
    'days': 'days',

    'projectNamePlaceholder': 'Landing page for coffee shop',
    'descriptionPlaceholder': 'Details, links, requirements...',
    'forMonth': 'For',
    'errorCreatingProject': 'Error creating project',
    'errorCreatingType': 'Error creating project type',
    'errorUpdatingProject': 'Error updating project',
    'fillRequiredFields': 'Fill in required fields: name, cost and deadline',
    'chooseOrEnterType': 'Choose or enter project type',
    'errorSavingGoal': 'Error saving goal',

    'planning': 'Planning',
    'newTask': 'New Task',
    'noTasks': 'No tasks yet.',
    'createFirstTask': 'Click "+ New Task" to create the first one!',
    'executionDate': 'Execution Date',
    'taskName': 'Task Name',
    'enterTaskName': 'Enter task name',
    'descriptionOptional': 'Description (optional)',
    'priority': 'Priority',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'adding': 'Adding...',
    'addTask': 'Add Task',
    'tasksCount': 'tasks',
    'today': 'Today',
    'tomorrow': 'Tomorrow',

    'newNote': 'New Note',
    'editNote': 'Edit Note',
    'noNotes': 'No notes yet.',
    'createFirstNote': 'Click "+ New Note" to create the first one!',
    'title': 'Title',
    'content': 'Content',
    'tags': 'Tags (comma separated)',
    'createNote': 'Create Note',
    'noteTitlePlaceholder': 'Note title',
    'noteContentPlaceholder': 'Note content...',
    'noteTitleRequired': 'Enter note title',

    'home': 'Home',
    'startDate': 'Start Date',
    'status': 'Status',
    'active': 'Active.',
    'goalAchieved': 'Goal achieved!',
    'notSet': 'Not set',
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState('ru');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: string) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
  };

  const t = (key: string, params?: Record<string, string>): string => {
    const lang = language as keyof typeof translations;
    const translation = translations[lang]?.[key] || translations['ru'][key] || key;
    
    if (params) {
      return Object.keys(params).reduce((result, paramKey) => {
        return result.replace(`{${paramKey}}`, params[paramKey]);
      }, translation);
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}