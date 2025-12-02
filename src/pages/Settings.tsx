import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Moon, Sun, Globe, DollarSign, Trash2, Bell, Bot, Send, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Settings() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currency, setCurrency, conversionCurrency, setConversionCurrency } = useCurrency();
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [notifications, setNotifications] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [telegramBotToken, setTelegramBotToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [exportMonth, setExportMonth] = useState(new Date().toISOString().slice(0, 7));

  const { data: projects = [] } = useQuery({ 
    queryKey: ["projects"], 
    queryFn: api.getProjects 
  });
  
  const { data: goals = [] } = useQuery({ 
    queryKey: ["goals"], 
    queryFn: api.getGoals 
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
    
    const savedCurrency = localStorage.getItem("currency");
    const savedLanguage = localStorage.getItem("language");
    const savedNotifications = localStorage.getItem("notifications");
    const savedAutoBackup = localStorage.getItem("autoBackup");
    const savedTelegramBotToken = localStorage.getItem("telegramBotToken");
    const savedTelegramChatId = localStorage.getItem("telegramChatId");

    if (savedCurrency) setCurrency(savedCurrency);
    if (savedLanguage) setLanguage(savedLanguage);
    if (savedNotifications) setNotifications(savedNotifications === "true");
    if (savedAutoBackup) setAutoBackup(savedAutoBackup === "true");
    if (savedTelegramBotToken) setTelegramBotToken(savedTelegramBotToken);
    if (savedTelegramChatId) setTelegramChatId(savedTelegramChatId);
  }, []);

  const handleThemeChange = (newTheme: "light" | "dark") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleNotificationsChange = (checked: boolean) => {
    setNotifications(checked);
    localStorage.setItem("notifications", checked.toString());
  };

  const handleAutoBackupChange = (checked: boolean) => {
    setAutoBackup(checked);
    localStorage.setItem("autoBackup", checked.toString());
  };

  const handleTelegramBotTokenChange = (value: string) => {
    setTelegramBotToken(value);
    localStorage.setItem("telegramBotToken", value);
  };

  const handleTelegramChatIdChange = (value: string) => {
    setTelegramChatId(value);
    localStorage.setItem("telegramChatId", value);
  };

  const handleClearData = () => {
    if (window.confirm(t('clearDataConfirm'))) {
      localStorage.clear();
      queryClient.clear();
      window.location.reload();
    }
  };

  const handleExportData = () => {
    const filteredProjects = projects.filter((project: any) => {
      const projectDate = new Date(project.createdAt);
      return projectDate.toISOString().slice(0, 7) === exportMonth;
    });

    const filteredGoals = goals.filter((goal: any) => goal.month === exportMonth);

    const exportData = {
      exportDate: new Date().toISOString(),
      exportMonth: exportMonth,
      projects: filteredProjects,
      goals: filteredGoals,
      settings: {
        currency,
        language,
        theme
      }
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sursipflow-export-${exportMonth}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    alert(t('dataExported', { month: getMonthName(exportMonth, language) }));
  };

  const getMonthName = (monthString: string, lang: string): string => {
    const [year, month] = monthString.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const locale = lang === 'ru' ? 'ru-RU' : 'en-US';
    return date.toLocaleDateString(locale, { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const handleTestTelegram = async () => {
    if (!telegramBotToken || !telegramChatId) {
      alert(t('fillBotTokenAndChatId'));
      return;
    }

    setIsTesting(true);
    try {
      const message = testMessage || t('defaultTestMessage');
      
      const response = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: message,
          parse_mode: "HTML"
        }),
      });

      const result = await response.json();

      if (result.ok) {
        alert(t('testMessageSuccess'));
        setTestMessage("");
      } else {
        alert(t('testMessageError', { description: result.description }));
      }
    } catch (error) {
      console.error("Failed to send test message:", error);
      alert(t('sendMessageError'));
    } finally {
      setIsTesting(false);
    }
  };

  const isTelegramConfigured = telegramBotToken && telegramChatId;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="glass glass-hover rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-4xl font-bold">{t('settings')}</h1>
      </div>

      <div className="grid gap-6">
        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-6 w-6 text-primary" /> : <Sun className="h-6 w-6 text-primary" />}
            {t('appearance')}
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme" className="text-lg font-medium">{t('theme')}</Label>
                <p className="text-sm text-muted-foreground">{t('chooseTheme')}</p>
              </div>
              <Select value={theme} onValueChange={handleThemeChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">{t('dark')}</SelectItem>
                  <SelectItem value="light">{t('light')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            {t('mainSettings')}
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="currency" className="text-lg font-medium">{t('currency')}</Label>
                <p className="text-sm text-muted-foreground">{t('currencyForDisplay')}</p>
              </div>
              <Select value={currency} onValueChange={handleCurrencyChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="RUB">RUB (₽)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
                <div>
                    <Label htmlFor="conversionCurrency" className="text-lg font-medium">{t('conversionCurrency')}</Label>
                    <p className="text-sm text-muted-foreground">{t('conversionCurrencyDesc')}</p>
                </div>
                <Select value={conversionCurrency} onValueChange={setConversionCurrency}>
                    <SelectTrigger className="w-32">
                    <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="RUB">RUB (₽)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="language" className="text-lg font-medium">{t('language')}</Label>
                <p className="text-sm text-muted-foreground">{t('interfaceLanguage')}</p>
              </div>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            {t('notifications')}
          </h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="text-lg font-medium">{t('notifications')}</Label>
                <p className="text-sm text-muted-foreground">{t('receiveNotifications')}</p>
              </div>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoBackup" className="text-lg font-medium">{t('autoBackup')}</Label>
                <p className="text-sm text-muted-foreground">{t('autoBackupDesc')}</p>
              </div>
              <Switch
                id="autoBackup"
                checked={autoBackup}
                onCheckedChange={handleAutoBackupChange}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Bot className="h-6 w-6 text-primary" />
            {t('telegramBot')}
          </h2>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="telegramBotToken" className="text-lg font-medium">{t('botToken')}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('botTokenDesc')}
                </p>
                <Input
                  id="telegramBotToken"
                  value={telegramBotToken}
                  onChange={(e) => handleTelegramBotTokenChange(e.target.value)}
                  placeholder={t('enterBotToken')}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="telegramChatId" className="text-lg font-medium">{t('chatId')}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('chatIdDesc')}
                </p>
                <Input
                  id="telegramChatId"
                  value={telegramChatId}
                  onChange={(e) => handleTelegramChatIdChange(e.target.value)}
                  placeholder={t('enterChatId')}
                  className="w-full"
                />
              </div>

              <div>
                <Label htmlFor="testMessage" className="text-lg font-medium">{t('testMessage')}</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('testMessageDesc')}
                </p>
                <div className="flex gap-2">
                  <Input
                    id="testMessage"
                    value={testMessage}
                    onChange={(e) => setTestMessage(e.target.value)}
                    placeholder={t('enterTestMessageOptional')}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleTestTelegram}
                    disabled={isTesting || !isTelegramConfigured}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    {isTesting ? t('sending') : t('test')}
                  </Button>
                </div>
              </div>
            </div>

            {isTelegramConfigured && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-green-600 text-sm">
                  {t('botConfigured')}
                </p>
              </div>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Download className="h-6 w-6 text-primary" />
            {t('dataManagement')}
        </h2>
        <div className="space-y-4">
            <div className="space-y-2">
            <Label>{t('exportData')}</Label>
            <div className="flex gap-2">
                <Input
                type="month"
                value={exportMonth}
                onChange={e => setExportMonth(e.target.value)}
                className="flex-1"
                />
                <Button 
                onClick={handleExportData}
                className="gap-2"
                >
                <Download className="h-4 w-4" />
                {t('export')}
                </Button>
            </div>
            <p className="text-sm text-muted-foreground">
                {t('exportDataDesc', { month: getMonthName(exportMonth, language) })}
            </p>
            </div>
            
            <Button 
            onClick={handleClearData} 
            variant="destructive" 
            className="w-full gap-2"
            >
            <Trash2 className="h-4 w-4" />
            {t('clearAllData')}
            </Button>
            
            <p className="text-sm text-muted-foreground">
            {t('backupWarning')}
            </p>
        </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-2xl font-bold mb-6">{t('aboutApp')}</h2>
          <div className="space-y-2 text-muted-foreground">
            <p>{t('version')}: 1.7.12</p>
            <p>{t('buildDate')}: {new Date().toLocaleDateString(language === 'ru' ? 'ru-RU' : 'en-US')}</p>
            <p>{t('copyright')}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}