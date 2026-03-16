/* ═══════════════════════════════════════════════════════════════════════
   improvements_locale_complete_fix.js
   Load LAST — after all other improvements_*.js files.

   Fixes confirmed i18n gaps:
   1.  RTL / LTR direction on <html> for Arabic (and future RTL locales)
   2.  Annotates elements missed by annotateAll():
       • deleteEntryModal  (title, desc, Cancel, Delete buttons)
       • fullEntryDeleteModal (title, desc, Cancel, Delete Entry buttons)
       • premiumConfirmModal  (title, Cancel, Delete buttons)
       • deleteAllModal passcode / type-confirm labels
       • Journal page hero eyebrow + subtitle
   3.  Full per-language GAP table for every string above,
       PLUS T_E.ar keys that are missing (page subtitles, modal labels,
       report tabs, save-journal, journal-unsaved …)
   4.  Patches showEntryModal to translate JS-generated body text
   5.  Re-runs on every navigate() and savePreference('locale', …)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─── helpers ────────────────────────────────────────────────────── */
    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 900); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 1800); });
    }

    function loc() { return String(window.auraLocale || 'en').split('-')[0]; }

    /* ─── GAP translation table ──────────────────────────────────────── */
    /*
     * Only keys PROVEN to be missing or unannotated in the existing stack.
     * All locales must have every key — this table is fully self-contained.
     */
    var GAP = {

/* ══════════ ENGLISH ══════════ */
en: {
    /* Modals */
    modal_cancel:'Cancel', modal_delete:'Delete', modal_confirm:'Confirm',
    delete_entry_q:'Delete Entry?',
    cannot_undo:'This action cannot be undone.',
    full_delete_day:'Delete this entire day?',
    full_delete_desc:'Mood, energy, sleep, activities and journal will be permanently removed.',
    full_delete_btn:'Delete Entry',
    are_you_sure:'Are you sure?',
    enter_passcode:'Enter passcode to confirm',
    type_delete_label:'Type DELETE to confirm',
    /* Journal page hero */
    journal_eyebrow:'Your reflections',
    journal_one_per_day_sub:'One entry per day.',
    /* Entry modal body */
    no_entry_day:'No entry for this day.',
    click_edit_checkin:'Click Edit Check-In to add one.',
    delete_entire_entry:'🗑 Delete entire entry for this day',
    /* Missing from T_E for some locales */
    save_journal:'Save Journal',
    journal_unsaved:'Unsaved changes',
    modal_full_edit:'✏️ Full Edit',
    modal_journal_btn:'📓 Journal',
    modal_close:'Close',
    /* Analytics page subtitles */
    page_mood_sub:'Patterns and trends in your emotional wellbeing.',
    page_sleep_sub:'Quality and consistency of your rest.',
    page_energy_sub:'Rhythm and stamina across days.',
    page_velocity_h:'Mood Velocity & Stability',
    page_velocity_sub:'See how your mood shifts day to day and how stable you feel.',
    page_corr_sub:'Discover relationships between your tracked metrics.',
    page_patterns_sub:'Sleep, activity and mood patterns.',
    page_seasonal_h:'Seasonal & Rhythm Analysis',
    page_seasonal_sub:'Uncover how your mood, sleep and energy shift across seasons and years.',
    page_forecast_sub:'Predictive trends based on your recent data.',
    insights_eyebrow_txt:'Personal Analytics',
    insights_overview_txt:'Patterns from your data. The more you log, the sharper these become.',
    page_export_sub:'Your data belongs to you. Download, back up, or import at any time.',
    report_week:'Week', report_month:'Month', report_year:'Year',
    report_export_pdf:'Export report as PDF',
    delete_all_title_txt:'Delete all my data',
    delete_all_desc_txt:'This permanently deletes all entries, journal, backups, and settings.',
    calendar_title_txt:'Calendar',
    calendar_sub_txt:'Explore your mood history across days, weeks and months.',
},

/* ══════════ GERMAN ══════════ */
de: {
    modal_cancel:'Abbrechen', modal_delete:'Löschen', modal_confirm:'Bestätigen',
    delete_entry_q:'Eintrag löschen?',
    cannot_undo:'Diese Aktion kann nicht rückgängig gemacht werden.',
    full_delete_day:'Diesen ganzen Tag löschen?',
    full_delete_desc:'Stimmung, Energie, Schlaf, Aktivitäten und Tagebuch werden dauerhaft gelöscht.',
    full_delete_btn:'Eintrag löschen',
    are_you_sure:'Bist du sicher?',
    enter_passcode:'Passcode eingeben, um zu bestätigen',
    type_delete_label:'DELETE eingeben, um zu bestätigen',
    journal_eyebrow:'Deine Reflexionen',
    journal_one_per_day_sub:'Ein Eintrag pro Tag.',
    no_entry_day:'Kein Eintrag für diesen Tag.',
    click_edit_checkin:'Klicke auf Eintrag bearbeiten, um hinzuzufügen.',
    delete_entire_entry:'🗑 Kompletten Eintrag löschen',
    save_journal:'Tagebuch speichern',
    journal_unsaved:'Ungespeicherte Änderungen',
    modal_full_edit:'✏️ Vollständig bearbeiten',
    modal_journal_btn:'📓 Tagebuch',
    modal_close:'Schließen',
    page_mood_sub:'Muster und Trends in deinem emotionalen Wohlbefinden.',
    page_sleep_sub:'Qualität und Konsistenz deiner Erholung.',
    page_energy_sub:'Rhythmus und Ausdauer über Tage.',
    page_velocity_h:'Stimmungsgeschwindigkeit & Stabilität',
    page_velocity_sub:'Sieh, wie sich deine Stimmung von Tag zu Tag verändert.',
    page_corr_sub:'Entdecke Zusammenhänge zwischen deinen Metriken.',
    page_patterns_sub:'Schlaf-, Aktivitäts- und Stimmungsmuster.',
    page_seasonal_h:'Saisonale & Rhythmusanalyse',
    page_seasonal_sub:'Entdecke, wie sich deine Stimmung saisonal verändert.',
    page_forecast_sub:'Vorhersagetrends basierend auf deinen aktuellen Daten.',
    insights_eyebrow_txt:'Persönliche Analytik',
    insights_overview_txt:'Muster aus deinen Daten. Je mehr du aufzeichnest, desto schärfer werden sie.',
    page_export_sub:'Deine Daten gehören dir.',
    report_week:'Woche', report_month:'Monat', report_year:'Jahr',
    report_export_pdf:'Bericht als PDF exportieren',
    delete_all_title_txt:'Alle meine Daten löschen',
    delete_all_desc_txt:'Alle Einträge, Tagebücher, Sicherungen und Einstellungen werden dauerhaft gelöscht.',
    calendar_title_txt:'Kalender',
    calendar_sub_txt:'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.',
},

/* ══════════ FRENCH ══════════ */
fr: {
    modal_cancel:'Annuler', modal_delete:'Supprimer', modal_confirm:'Confirmer',
    delete_entry_q:'Supprimer l\'entrée ?',
    cannot_undo:'Cette action est irréversible.',
    full_delete_day:'Supprimer toute la journée ?',
    full_delete_desc:'Humeur, énergie, sommeil, activités et journal seront définitivement supprimés.',
    full_delete_btn:'Supprimer l\'entrée',
    are_you_sure:'Êtes-vous sûr ?',
    enter_passcode:'Entrez le code pour confirmer',
    type_delete_label:'Tapez SUPPRIMER pour confirmer',
    journal_eyebrow:'Vos réflexions',
    journal_one_per_day_sub:'Une entrée par jour.',
    no_entry_day:'Aucune entrée pour ce jour.',
    click_edit_checkin:'Cliquez sur Modifier pour en ajouter une.',
    delete_entire_entry:'🗑 Supprimer toute l\'entrée',
    save_journal:'Enregistrer le journal',
    journal_unsaved:'Modifications non enregistrées',
    modal_full_edit:'✏️ Modifier complet',
    modal_journal_btn:'📓 Journal',
    modal_close:'Fermer',
    page_mood_sub:'Tendances de votre bien-être émotionnel.',
    page_sleep_sub:'Qualité et constance de votre repos.',
    page_energy_sub:'Rythme et endurance au fil des jours.',
    page_velocity_h:'Vélocité & Stabilité de l\'Humeur',
    page_velocity_sub:'Voyez comment votre humeur évolue jour après jour.',
    page_corr_sub:'Découvrez les relations entre vos métriques.',
    page_patterns_sub:'Patterns de sommeil, d\'activité et d\'humeur.',
    page_seasonal_h:'Analyse Saisonnière & Rythmique',
    page_seasonal_sub:'Découvrez comment votre humeur évolue selon les saisons.',
    page_forecast_sub:'Tendances prédictives basées sur vos données récentes.',
    insights_eyebrow_txt:'Analytique personnelle',
    insights_overview_txt:'Modèles de vos données. Plus vous enregistrez, plus ils s\'affinent.',
    page_export_sub:'Vos données vous appartiennent.',
    report_week:'Semaine', report_month:'Mois', report_year:'Année',
    report_export_pdf:'Exporter le rapport en PDF',
    delete_all_title_txt:'Supprimer toutes mes données',
    delete_all_desc_txt:'Supprime définitivement toutes les entrées, le journal, les sauvegardes et les paramètres.',
    calendar_title_txt:'Calendrier',
    calendar_sub_txt:'Explorez votre historique d\'humeur par jour, semaine et mois.',
},

/* ══════════ SPANISH ══════════ */
es: {
    modal_cancel:'Cancelar', modal_delete:'Eliminar', modal_confirm:'Confirmar',
    delete_entry_q:'¿Eliminar entrada?',
    cannot_undo:'Esta acción no se puede deshacer.',
    full_delete_day:'¿Eliminar todo el día?',
    full_delete_desc:'El ánimo, energía, sueño, actividades y diario se eliminarán permanentemente.',
    full_delete_btn:'Eliminar entrada',
    are_you_sure:'¿Estás seguro?',
    enter_passcode:'Introduce el código para confirmar',
    type_delete_label:'Escribe ELIMINAR para confirmar',
    journal_eyebrow:'Tus reflexiones',
    journal_one_per_day_sub:'Una entrada por día.',
    no_entry_day:'No hay entrada para este día.',
    click_edit_checkin:'Haz clic en Editar para añadir.',
    delete_entire_entry:'🗑 Eliminar la entrada completa',
    save_journal:'Guardar diario',
    journal_unsaved:'Cambios sin guardar',
    modal_full_edit:'✏️ Editar completo',
    modal_journal_btn:'📓 Diario',
    modal_close:'Cerrar',
    page_mood_sub:'Tendencias en tu bienestar emocional.',
    page_sleep_sub:'Calidad y consistencia de tu descanso.',
    page_energy_sub:'Ritmo y resistencia a lo largo de los días.',
    page_velocity_h:'Velocidad & Estabilidad del Ánimo',
    page_velocity_sub:'Ve cómo cambia tu ánimo día a día.',
    page_corr_sub:'Descubre relaciones entre tus métricas.',
    page_patterns_sub:'Patrones de sueño, actividad y ánimo.',
    page_seasonal_h:'Análisis Estacional & Rítmico',
    page_seasonal_sub:'Descubre cómo tu ánimo varía estacionalmente.',
    page_forecast_sub:'Tendencias predictivas basadas en tus datos recientes.',
    insights_eyebrow_txt:'Análisis personal',
    insights_overview_txt:'Patrones de tus datos. Cuanto más registres, más precisos serán.',
    page_export_sub:'Tus datos son tuyos.',
    report_week:'Semana', report_month:'Mes', report_year:'Año',
    report_export_pdf:'Exportar informe como PDF',
    delete_all_title_txt:'Eliminar todos mis datos',
    delete_all_desc_txt:'Elimina permanentemente todas las entradas, diario, copias de seguridad y ajustes.',
    calendar_title_txt:'Calendario',
    calendar_sub_txt:'Explora tu historial de ánimo por días, semanas y meses.',
},

/* ══════════ ITALIAN ══════════ */
it: {
    modal_cancel:'Annulla', modal_delete:'Elimina', modal_confirm:'Conferma',
    delete_entry_q:'Eliminare la voce?',
    cannot_undo:'Questa azione non può essere annullata.',
    full_delete_day:'Eliminare l\'intera giornata?',
    full_delete_desc:'Umore, energia, sonno, attività e diario verranno eliminati definitivamente.',
    full_delete_btn:'Elimina voce',
    are_you_sure:'Sei sicuro?',
    enter_passcode:'Inserisci il codice per confermare',
    type_delete_label:'Digita ELIMINA per confermare',
    journal_eyebrow:'Le tue riflessioni',
    journal_one_per_day_sub:'Una voce al giorno.',
    no_entry_day:'Nessuna voce per questo giorno.',
    click_edit_checkin:'Clicca su Modifica per aggiungere.',
    delete_entire_entry:'🗑 Elimina voce completa',
    save_journal:'Salva diario',
    journal_unsaved:'Modifiche non salvate',
    modal_full_edit:'✏️ Modifica completa',
    modal_journal_btn:'📓 Diario',
    modal_close:'Chiudi',
    page_mood_sub:'Tendenze del tuo benessere emotivo.',
    page_sleep_sub:'Qualità e costanza del tuo riposo.',
    page_energy_sub:'Ritmo e resistenza nel corso dei giorni.',
    page_velocity_h:'Velocità & Stabilità dell\'Umore',
    page_velocity_sub:'Osserva come cambia il tuo umore giorno per giorno.',
    page_corr_sub:'Scopri le relazioni tra le tue metriche.',
    page_patterns_sub:'Pattern di sonno, attività e umore.',
    page_seasonal_h:'Analisi Stagionale & Ritmica',
    page_seasonal_sub:'Scopri come umore, sonno ed energia cambiano stagionalmente.',
    page_forecast_sub:'Tendenze predittive basate sui dati recenti.',
    insights_eyebrow_txt:'Analisi personale',
    insights_overview_txt:'Pattern dai tuoi dati.',
    page_export_sub:'I tuoi dati ti appartengono.',
    report_week:'Settimana', report_month:'Mese', report_year:'Anno',
    report_export_pdf:'Esporta report come PDF',
    delete_all_title_txt:'Elimina tutti i miei dati',
    delete_all_desc_txt:'Elimina definitivamente tutte le voci, il diario, i backup e le impostazioni.',
    calendar_title_txt:'Calendario',
    calendar_sub_txt:'Esplora la storia dell\'umore per giorni, settimane e mesi.',
},

/* ══════════ PORTUGUESE ══════════ */
pt: {
    modal_cancel:'Cancelar', modal_delete:'Eliminar', modal_confirm:'Confirmar',
    delete_entry_q:'Eliminar entrada?',
    cannot_undo:'Esta ação não pode ser desfeita.',
    full_delete_day:'Eliminar todo o dia?',
    full_delete_desc:'Humor, energia, sono, atividades e diário serão eliminados permanentemente.',
    full_delete_btn:'Eliminar entrada',
    are_you_sure:'Tem certeza?',
    enter_passcode:'Insira o código para confirmar',
    type_delete_label:'Digite EXCLUIR para confirmar',
    journal_eyebrow:'As suas reflexões',
    journal_one_per_day_sub:'Uma entrada por dia.',
    no_entry_day:'Sem entrada para este dia.',
    click_edit_checkin:'Clique em Editar para adicionar.',
    delete_entire_entry:'🗑 Eliminar a entrada completa',
    save_journal:'Guardar diário',
    journal_unsaved:'Alterações não guardadas',
    modal_full_edit:'✏️ Edição completa',
    modal_journal_btn:'📓 Diário',
    modal_close:'Fechar',
    page_mood_sub:'Tendências do bem-estar emocional.',
    page_sleep_sub:'Qualidade e consistência do descanso.',
    page_energy_sub:'Ritmo e resistência ao longo dos dias.',
    page_velocity_h:'Velocidade & Estabilidade do Humor',
    page_velocity_sub:'Veja como o seu humor muda dia a dia.',
    page_corr_sub:'Descubra relações entre as suas métricas.',
    page_patterns_sub:'Padrões de sono, atividade e humor.',
    page_seasonal_h:'Análise Sazonal & Rítmica',
    page_seasonal_sub:'Descubra como humor, sono e energia variam sazonalmente.',
    page_forecast_sub:'Tendências preditivas com base nos dados recentes.',
    insights_eyebrow_txt:'Análise pessoal',
    insights_overview_txt:'Padrões dos seus dados.',
    page_export_sub:'Os seus dados pertencem-lhe.',
    report_week:'Semana', report_month:'Mês', report_year:'Ano',
    report_export_pdf:'Exportar relatório como PDF',
    delete_all_title_txt:'Eliminar todos os meus dados',
    delete_all_desc_txt:'Elimina permanentemente todas as entradas, diário, cópias de segurança e definições.',
    calendar_title_txt:'Calendário',
    calendar_sub_txt:'Explore o historial de humor por dias, semanas e meses.',
},

/* ══════════ DUTCH ══════════ */
nl: {
    modal_cancel:'Annuleren', modal_delete:'Verwijderen', modal_confirm:'Bevestigen',
    delete_entry_q:'Invoer verwijderen?',
    cannot_undo:'Deze actie kan niet ongedaan worden gemaakt.',
    full_delete_day:'Hele dag verwijderen?',
    full_delete_desc:'Stemming, energie, slaap, activiteiten en dagboek worden permanent verwijderd.',
    full_delete_btn:'Invoer verwijderen',
    are_you_sure:'Weet je het zeker?',
    enter_passcode:'Voer code in om te bevestigen',
    type_delete_label:'Typ VERWIJDER om te bevestigen',
    journal_eyebrow:'Jouw reflecties',
    journal_one_per_day_sub:'Één invoer per dag.',
    no_entry_day:'Geen invoer voor deze dag.',
    click_edit_checkin:'Klik op Bewerken om toe te voegen.',
    delete_entire_entry:'🗑 Volledige invoer verwijderen',
    save_journal:'Dagboek opslaan',
    journal_unsaved:'Niet-opgeslagen wijzigingen',
    modal_full_edit:'✏️ Volledig bewerken',
    modal_journal_btn:'📓 Dagboek',
    modal_close:'Sluiten',
    page_mood_sub:'Patronen in jouw emotioneel welzijn.',
    page_sleep_sub:'Kwaliteit en consistentie van jouw rust.',
    page_energy_sub:'Ritme en uithoudingsvermogen door de dagen.',
    page_velocity_h:'Stemming Snelheid & Stabiliteit',
    page_velocity_sub:'Zie hoe jouw stemming dag tot dag verandert.',
    page_corr_sub:'Ontdek verbanden tussen jouw statistieken.',
    page_patterns_sub:'Slaap-, activiteits- en stemmingspatronen.',
    page_seasonal_h:'Seizoens- & Ritmeanalyse',
    page_seasonal_sub:'Ontdek hoe stemming, slaap en energie per seizoen variëren.',
    page_forecast_sub:'Voorspellende trends op basis van recente gegevens.',
    insights_eyebrow_txt:'Persoonlijke analyse',
    insights_overview_txt:'Patronen uit jouw data.',
    page_export_sub:'Jouw gegevens zijn van jou.',
    report_week:'Week', report_month:'Maand', report_year:'Jaar',
    report_export_pdf:'Rapport exporteren als PDF',
    delete_all_title_txt:'Alle gegevens verwijderen',
    delete_all_desc_txt:'Verwijdert permanent alle invoer, dagboek, back-ups en instellingen.',
    calendar_title_txt:'Kalender',
    calendar_sub_txt:'Bekijk je stemmingsgeschiedenis per dag, week en maand.',
},

/* ══════════ POLISH ══════════ */
pl: {
    modal_cancel:'Anuluj', modal_delete:'Usuń', modal_confirm:'Potwierdź',
    delete_entry_q:'Usunąć wpis?',
    cannot_undo:'Tej czynności nie można cofnąć.',
    full_delete_day:'Usunąć cały dzień?',
    full_delete_desc:'Nastrój, energia, sen, aktywności i dziennik zostaną trwale usunięte.',
    full_delete_btn:'Usuń wpis',
    are_you_sure:'Jesteś pewny?',
    enter_passcode:'Wpisz kod, aby potwierdzić',
    type_delete_label:'Wpisz USUŃ, aby potwierdzić',
    journal_eyebrow:'Twoje refleksje',
    journal_one_per_day_sub:'Jeden wpis dziennie.',
    no_entry_day:'Brak wpisu na ten dzień.',
    click_edit_checkin:'Kliknij Edytuj, aby dodać.',
    delete_entire_entry:'🗑 Usuń cały wpis',
    save_journal:'Zapisz dziennik',
    journal_unsaved:'Niezapisane zmiany',
    modal_full_edit:'✏️ Pełna edycja',
    modal_journal_btn:'📓 Dziennik',
    modal_close:'Zamknij',
    page_mood_sub:'Wzorce i trendy Twojego samopoczucia.',
    page_sleep_sub:'Jakość i spójność Twojego odpoczynku.',
    page_energy_sub:'Rytm i wytrzymałość przez dni.',
    page_velocity_h:'Prędkość & Stabilność Nastroju',
    page_velocity_sub:'Obserwuj, jak Twój nastrój zmienia się z dnia na dzień.',
    page_corr_sub:'Odkryj zależności między śledzonymi metrykami.',
    page_patterns_sub:'Wzorce snu, aktywności i nastroju.',
    page_seasonal_h:'Sezonowa & Rytmiczna Analiza',
    page_seasonal_sub:'Odkryj, jak nastrój, sen i energia zmieniają się sezonowo.',
    page_forecast_sub:'Trendy predykcyjne na podstawie najnowszych danych.',
    insights_eyebrow_txt:'Analityka osobista',
    insights_overview_txt:'Wzorce z Twoich danych.',
    page_export_sub:'Twoje dane należą do Ciebie.',
    report_week:'Tydzień', report_month:'Miesiąc', report_year:'Rok',
    report_export_pdf:'Eksportuj raport jako PDF',
    delete_all_title_txt:'Usuń wszystkie moje dane',
    delete_all_desc_txt:'Trwale usuwa wszystkie wpisy, dziennik, kopie zapasowe i ustawienia.',
    calendar_title_txt:'Kalendarz',
    calendar_sub_txt:'Przeglądaj historię nastroju po dniach, tygodniach i miesiącach.',
},

/* ══════════ RUSSIAN ══════════ */
ru: {
    modal_cancel:'Отмена', modal_delete:'Удалить', modal_confirm:'Подтвердить',
    delete_entry_q:'Удалить запись?',
    cannot_undo:'Это действие нельзя отменить.',
    full_delete_day:'Удалить весь день?',
    full_delete_desc:'Настроение, энергия, сон, активности и дневник будут удалены безвозвратно.',
    full_delete_btn:'Удалить запись',
    are_you_sure:'Вы уверены?',
    enter_passcode:'Введите код для подтверждения',
    type_delete_label:'Введите УДАЛИТЬ для подтверждения',
    journal_eyebrow:'Ваши размышления',
    journal_one_per_day_sub:'Одна запись в день.',
    no_entry_day:'Нет записи за этот день.',
    click_edit_checkin:'Нажмите Редактировать для добавления.',
    delete_entire_entry:'🗑 Удалить всю запись',
    save_journal:'Сохранить дневник',
    journal_unsaved:'Несохранённые изменения',
    modal_full_edit:'✏️ Полное редактирование',
    modal_journal_btn:'📓 Дневник',
    modal_close:'Закрыть',
    page_mood_sub:'Паттерны вашего эмоционального благополучия.',
    page_sleep_sub:'Качество и постоянство вашего отдыха.',
    page_energy_sub:'Ритм и выносливость за дни.',
    page_velocity_h:'Скорость & Стабильность Настроения',
    page_velocity_sub:'Наблюдайте изменения настроения день за днём.',
    page_corr_sub:'Откройте связи между вашими метриками.',
    page_patterns_sub:'Паттерны сна, активности и настроения.',
    page_seasonal_h:'Сезонный & Ритмический Анализ',
    page_seasonal_sub:'Узнайте, как меняется настроение по сезонам.',
    page_forecast_sub:'Прогнозные тренды на основе последних данных.',
    insights_eyebrow_txt:'Персональная аналитика',
    insights_overview_txt:'Паттерны из ваших данных.',
    page_export_sub:'Ваши данные принадлежат вам.',
    report_week:'Неделя', report_month:'Месяц', report_year:'Год',
    report_export_pdf:'Экспортировать отчёт в PDF',
    delete_all_title_txt:'Удалить все мои данные',
    delete_all_desc_txt:'Безвозвратно удаляет все записи, дневник, резервные копии и настройки.',
    calendar_title_txt:'Календарь',
    calendar_sub_txt:'Изучайте историю настроения за дни, недели и месяцы.',
},

/* ══════════ TURKISH ══════════ */
tr: {
    modal_cancel:'İptal', modal_delete:'Sil', modal_confirm:'Onayla',
    delete_entry_q:'Kaydı sil?',
    cannot_undo:'Bu işlem geri alınamaz.',
    full_delete_day:'Tüm günü sil?',
    full_delete_desc:'Ruh hali, enerji, uyku, aktiviteler ve günlük kalıcı olarak silinecek.',
    full_delete_btn:'Kaydı sil',
    are_you_sure:'Emin misiniz?',
    enter_passcode:'Onaylamak için şifre girin',
    type_delete_label:'Onaylamak için SİL yazın',
    journal_eyebrow:'Yansımalarınız',
    journal_one_per_day_sub:'Günde bir giriş.',
    no_entry_day:'Bu gün için kayıt yok.',
    click_edit_checkin:'Eklemek için Düzenle\'ye tıklayın.',
    delete_entire_entry:'🗑 Tüm kaydı sil',
    save_journal:'Günlüğü kaydet',
    journal_unsaved:'Kaydedilmemiş değişiklikler',
    modal_full_edit:'✏️ Tam düzenleme',
    modal_journal_btn:'📓 Günlük',
    modal_close:'Kapat',
    page_mood_sub:'Duygusal sağlığınızdaki paternler ve eğilimler.',
    page_sleep_sub:'Dinlenmenizin kalitesi ve tutarlılığı.',
    page_energy_sub:'Günler boyunca ritim ve dayanıklılık.',
    page_velocity_h:'Ruh Hali Hızı & Stabilitesi',
    page_velocity_sub:'Ruh halinizin günden güne nasıl değiştiğini görün.',
    page_corr_sub:'Takip ettiğiniz metrikler arasındaki ilişkileri keşfedin.',
    page_patterns_sub:'Uyku, aktivite ve ruh hali kalıpları.',
    page_seasonal_h:'Mevsimsel & Ritim Analizi',
    page_seasonal_sub:'Ruh halinizin mevsimlere göre nasıl değiştiğini keşfedin.',
    page_forecast_sub:'Son verilerinize dayalı tahmin eğilimleri.',
    insights_eyebrow_txt:'Kişisel analitik',
    insights_overview_txt:'Verilerinizdeki paternler.',
    page_export_sub:'Verileriniz size ait.',
    report_week:'Hafta', report_month:'Ay', report_year:'Yıl',
    report_export_pdf:'Raporu PDF olarak dışa aktar',
    delete_all_title_txt:'Tüm verilerimi sil',
    delete_all_desc_txt:'Tüm girişler, günlük, yedekler ve ayarlar kalıcı olarak silinir.',
    calendar_title_txt:'Takvim',
    calendar_sub_txt:'Gün, hafta ve aylara göre ruh hali geçmişinizi keşfedin.',
},

/* ══════════ JAPANESE ══════════ */
ja: {
    modal_cancel:'キャンセル', modal_delete:'削除', modal_confirm:'確認',
    delete_entry_q:'記録を削除しますか？',
    cannot_undo:'この操作は元に戻せません。',
    full_delete_day:'この日全体を削除しますか？',
    full_delete_desc:'気分、エネルギー、睡眠、活動、日記が完全に削除されます。',
    full_delete_btn:'記録を削除',
    are_you_sure:'本当によろしいですか？',
    enter_passcode:'確認のためパスコードを入力',
    type_delete_label:'確認のためDELETEと入力',
    journal_eyebrow:'あなたの振り返り',
    journal_one_per_day_sub:'1日1件のエントリー。',
    no_entry_day:'この日のエントリーはありません。',
    click_edit_checkin:'編集をクリックして追加。',
    delete_entire_entry:'🗑 この日の全エントリーを削除',
    save_journal:'日記を保存',
    journal_unsaved:'未保存の変更',
    modal_full_edit:'✏️ 完全編集',
    modal_journal_btn:'📓 日記',
    modal_close:'閉じる',
    page_mood_sub:'感情的な健康のパターンとトレンド。',
    page_sleep_sub:'休息の質と一貫性。',
    page_energy_sub:'日々のリズムとスタミナ。',
    page_velocity_h:'気分の速度と安定性',
    page_velocity_sub:'日々の気分の変化を確認。',
    page_corr_sub:'追跡指標間の関係を発見。',
    page_patterns_sub:'睡眠、活動、気分のパターン。',
    page_seasonal_h:'季節的・リズム分析',
    page_seasonal_sub:'気分、睡眠、エネルギーの季節変化を確認。',
    page_forecast_sub:'最近のデータに基づく予測トレンド。',
    insights_eyebrow_txt:'パーソナル分析',
    insights_overview_txt:'データからのパターン。',
    page_export_sub:'あなたのデータはあなたのもの。',
    report_week:'週', report_month:'月', report_year:'年',
    report_export_pdf:'PDFでレポートを書き出す',
    delete_all_title_txt:'全データを削除',
    delete_all_desc_txt:'すべてのエントリー、日記、バックアップ、設定を永久に削除します。',
    calendar_title_txt:'カレンダー',
    calendar_sub_txt:'日、週、月ごとの気分履歴を確認。',
},

/* ══════════ CHINESE ══════════ */
zh: {
    modal_cancel:'取消', modal_delete:'删除', modal_confirm:'确认',
    delete_entry_q:'删除记录？',
    cannot_undo:'此操作无法撤销。',
    full_delete_day:'删除整天记录？',
    full_delete_desc:'情绪、能量、睡眠、活动和日记将被永久删除。',
    full_delete_btn:'删除记录',
    are_you_sure:'您确定吗？',
    enter_passcode:'输入密码以确认',
    type_delete_label:'输入删除以确认',
    journal_eyebrow:'您的反思',
    journal_one_per_day_sub:'每天一条记录。',
    no_entry_day:'这天没有记录。',
    click_edit_checkin:'点击编辑以添加。',
    delete_entire_entry:'🗑 删除这天的全部记录',
    save_journal:'保存日记',
    journal_unsaved:'未保存的更改',
    modal_full_edit:'✏️ 完整编辑',
    modal_journal_btn:'📓 日记',
    modal_close:'关闭',
    page_mood_sub:'情绪健康的规律和趋势。',
    page_sleep_sub:'休息的质量和一致性。',
    page_energy_sub:'各天的节奏和耐力。',
    page_velocity_h:'情绪速度与稳定性',
    page_velocity_sub:'查看情绪日复一日的变化。',
    page_corr_sub:'发现追踪指标之间的关系。',
    page_patterns_sub:'睡眠、活动和情绪模式。',
    page_seasonal_h:'季节性与节律分析',
    page_seasonal_sub:'发现情绪、睡眠和能量的季节变化。',
    page_forecast_sub:'基于最新数据的预测趋势。',
    insights_eyebrow_txt:'个人分析',
    insights_overview_txt:'来自您数据的规律。',
    page_export_sub:'您的数据属于您。',
    report_week:'周', report_month:'月', report_year:'年',
    report_export_pdf:'将报告导出为PDF',
    delete_all_title_txt:'删除所有数据',
    delete_all_desc_txt:'永久删除所有记录、日记、备份和设置。',
    calendar_title_txt:'日历',
    calendar_sub_txt:'按日、周、月浏览情绪历史。',
},

/* ══════════ HINDI ══════════ */
hi: {
    modal_cancel:'रद्द करें', modal_delete:'हटाएं', modal_confirm:'पुष्टि करें',
    delete_entry_q:'प्रविष्टि हटाएं?',
    cannot_undo:'यह क्रिया पूर्ववत नहीं की जा सकती।',
    full_delete_day:'पूरा दिन हटाएं?',
    full_delete_desc:'मूड, ऊर्जा, नींद, गतिविधियां और डायरी स्थायी रूप से हटाई जाएंगी।',
    full_delete_btn:'प्रविष्टि हटाएं',
    are_you_sure:'क्या आप सुनिश्चित हैं?',
    enter_passcode:'पुष्टि के लिए पासकोड दर्ज करें',
    type_delete_label:'पुष्टि के लिए DELETE टाइप करें',
    journal_eyebrow:'आपके विचार',
    journal_one_per_day_sub:'प्रतिदिन एक प्रविष्टि।',
    no_entry_day:'इस दिन के लिए कोई प्रविष्टि नहीं।',
    click_edit_checkin:'जोड़ने के लिए चेक-इन संपादित करें पर क्लिक करें।',
    delete_entire_entry:'🗑 इस दिन की पूरी प्रविष्टि हटाएं',
    save_journal:'डायरी सहेजें',
    journal_unsaved:'सहेजे नहीं गए बदलाव',
    modal_full_edit:'✏️ पूर्ण संपादन',
    modal_journal_btn:'📓 डायरी',
    modal_close:'बंद करें',
    page_mood_sub:'आपके भावनात्मक स्वास्थ्य के पैटर्न।',
    page_sleep_sub:'आपकी नींद की गुणवत्ता और निरंतरता।',
    page_energy_sub:'दिनों में लय और सहनशक्ति।',
    page_velocity_h:'मूड वेलोसिटी और स्थिरता',
    page_velocity_sub:'देखें मूड दिन-प्रतिदिन कैसे बदलता है।',
    page_corr_sub:'ट्रैक की गई मेट्रिक्स के बीच संबंध खोजें।',
    page_patterns_sub:'नींद, गतिविधि और मूड के पैटर्न।',
    page_seasonal_h:'मौसमी और लयबद्ध विश्लेषण',
    page_seasonal_sub:'मूड, नींद और ऊर्जा में मौसमी बदलाव जानें।',
    page_forecast_sub:'हाल के डेटा के आधार पर पूर्वानुमान रुझान।',
    insights_eyebrow_txt:'व्यक्तिगत विश्लेषण',
    insights_overview_txt:'आपके डेटा से पैटर्न।',
    page_export_sub:'आपका डेटा आपका है।',
    report_week:'सप्ताह', report_month:'माह', report_year:'वर्ष',
    report_export_pdf:'रिपोर्ट PDF में निर्यात करें',
    delete_all_title_txt:'सभी डेटा हटाएं',
    delete_all_desc_txt:'सभी प्रविष्टियां, डायरी, बैकअप और सेटिंग्स स्थायी रूप से हटाएं।',
    calendar_title_txt:'कैलेंडर',
    calendar_sub_txt:'दिनों, हफ्तों और महीनों में मूड इतिहास देखें।',
},

/* ══════════ ARABIC ══════════ */
ar: {
    modal_cancel:'إلغاء',
    modal_delete:'حذف',
    modal_confirm:'تأكيد',
    delete_entry_q:'حذف الإدخال؟',
    cannot_undo:'لا يمكن التراجع عن هذا الإجراء.',
    full_delete_day:'حذف هذا اليوم بالكامل؟',
    full_delete_desc:'سيتم حذف المزاج والطاقة والنوم والأنشطة واليوميات نهائياً.',
    full_delete_btn:'حذف الإدخال',
    are_you_sure:'هل أنت متأكد؟',
    enter_passcode:'أدخل رمز المرور للتأكيد',
    type_delete_label:'اكتب DELETE للتأكيد',
    journal_eyebrow:'تأملاتك',
    journal_one_per_day_sub:'إدخال واحد في اليوم.',
    no_entry_day:'لا يوجد إدخال لهذا اليوم.',
    click_edit_checkin:'انقر على تعديل الفحص للإضافة.',
    delete_entire_entry:'🗑 حذف الإدخال الكامل لهذا اليوم',
    save_journal:'حفظ اليوميات',
    journal_unsaved:'تغييرات غير محفوظة',
    modal_full_edit:'✏️ تعديل كامل',
    modal_journal_btn:'📓 اليوميات',
    modal_close:'إغلاق',
    page_mood_sub:'الأنماط والاتجاهات في رفاهيتك العاطفية.',
    page_sleep_sub:'جودة واتساق نومك.',
    page_energy_sub:'الإيقاع والقدرة على التحمل عبر الأيام.',
    page_velocity_h:'سرعة المزاج والاستقرار',
    page_velocity_sub:'راقب كيف يتغير مزاجك من يوم لآخر.',
    page_corr_sub:'اكتشف العلاقات بين مقاييسك المتتبعة.',
    page_patterns_sub:'أنماط النوم والنشاط والمزاج.',
    page_seasonal_h:'التحليل الموسمي والإيقاعي',
    page_seasonal_sub:'اكتشف كيف يتغير مزاجك ونومك وطاقتك موسمياً.',
    page_forecast_sub:'الاتجاهات التنبؤية بناءً على بياناتك الأخيرة.',
    insights_eyebrow_txt:'التحليلات الشخصية',
    insights_overview_txt:'الأنماط من بياناتك. كلما سجّلت أكثر، كلما أصبحت أوضح.',
    page_export_sub:'بياناتك ملك لك. نزّل أو انسخ احتياطياً أو استورد في أي وقت.',
    report_week:'أسبوع',
    report_month:'شهر',
    report_year:'سنة',
    report_export_pdf:'تصدير التقرير كـ PDF',
    delete_all_title_txt:'حذف جميع بياناتي',
    delete_all_desc_txt:'يحذف هذا نهائياً جميع الإدخالات واليوميات والنسخ الاحتياطية والإعدادات.',
    calendar_title_txt:'التقويم',
    calendar_sub_txt:'استعرض سجل مزاجك عبر الأيام والأسابيع والأشهر.',
}

    }; /* end GAP */

    /* ─── lookup ──────────────────────────────────────────────────────── */
    function g(key) {
        var l = loc();
        var row = GAP[l] || GAP.en;
        var val = row[key];
        return val != null ? val : (GAP.en[key] || null);
    }

    /* ─── RTL / LTR ───────────────────────────────────────────────────── */
    var RTL_LOCALES = { ar: 1, he: 1, fa: 1, ur: 1 };

    function applyRTL() {
        var l = loc();
        var isRTL = !!RTL_LOCALES[l];
        document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = l;
        /* Swap nav arrow on dashboard CTA */
        document.querySelectorAll('[data-rtl-arrow]').forEach(function (el) {
            el.textContent = isRTL ? '→' : '←';
        });
    }

    /* ─── Annotate elements missed by annotateAll() ───────────────────── */
    function ann(el, key) {
        if (el && !el.getAttribute('data-i18n')) el.setAttribute('data-i18n', key);
    }

    function annotateGaps() {
        /* deleteEntryModal */
        ann(document.getElementById('deleteEntryModalTitle'), 'delete_entry_q');
        ann(document.getElementById('deleteEntryModalDesc'),  'cannot_undo');
        ann(document.getElementById('deleteEntryCancelBtn'),  'modal_cancel');
        ann(document.getElementById('deleteEntryConfirmBtn'), 'modal_delete');

        /* fullEntryDeleteModal */
        ann(document.getElementById('fullEntryDeleteModalTitle'), 'full_delete_day');
        ann(document.getElementById('fullEntryDeleteModalDesc'),  'full_delete_desc');
        ann(document.getElementById('fullEntryDeleteConfirmBtn'), 'full_delete_btn');
        var fedModal = document.getElementById('fullEntryDeleteModal');
        if (fedModal) {
            fedModal.querySelectorAll('.btn-secondary').forEach(function (btn) {
                if ((btn.textContent || '').trim() === 'Cancel') ann(btn, 'modal_cancel');
            });
        }

        /* premiumConfirmModal */
        ann(document.getElementById('premiumConfirmTitle'), 'are_you_sure');
        var pcModal = document.getElementById('premiumConfirmModal');
        if (pcModal) {
            pcModal.querySelectorAll('button').forEach(function (btn) {
                var txt = (btn.textContent || '').trim();
                if (txt === 'Cancel') ann(btn, 'modal_cancel');
                if (txt === 'Delete') ann(btn, 'modal_delete');
            });
        }

        /* deleteAllModal — passcode / type labels */
        var passLabel = document.querySelector('#deleteAllPasscodeWrap label');
        ann(passLabel, 'enter_passcode');
        var typeLabel = document.querySelector('#deleteAllTypeWrap label');
        ann(typeLabel, 'type_delete_label');

        /* Journal page hero */
        var jEyebrow  = document.querySelector('.journal-hero-eyebrow');
        var jSubtitle = document.querySelector('.journal-hero-subtitle');
        ann(jEyebrow,  'journal_eyebrow');
        ann(jSubtitle, 'journal_one_per_day_sub');

        /* Save-journal / journal-unsaved spans (checkin form) */
        document.querySelectorAll('.save-journal-btn, [data-action="save-journal"], button').forEach(function (el) {
            if ((el.textContent || '').trim() === 'Save Journal') ann(el, 'save_journal');
        });
        document.querySelectorAll('.journal-unsaved-label, .unsaved-badge').forEach(function (el) {
            if ((el.textContent || '').trim() === 'Unsaved changes') ann(el, 'journal_unsaved');
        });

        /* Entry modal footer: Full Edit / Journal / Close */
        var editBtn    = document.getElementById('entryModalEditBtn');
        var journalBtn = document.getElementById('entryModalJournalBtn');
        if (editBtn    && !editBtn.getAttribute('data-i18n'))    editBtn.setAttribute('data-i18n',    'modal_full_edit');
        if (journalBtn && !journalBtn.getAttribute('data-i18n')) journalBtn.setAttribute('data-i18n', 'modal_journal_btn');
        var closeBtn = document.querySelector('.entry-modal-footer button:not(#entryModalEditBtn):not(#entryModalJournalBtn)');
        if (closeBtn && (closeBtn.textContent || '').trim() === 'Close') ann(closeBtn, 'modal_close');

        /* Analytics page subtitles — add data-i18n only if the element has
           no key yet (batch_e may have already stamped different keys) */
        function annPageSub(pageId, h1Key, subKey, subSel) {
            var pg = document.getElementById(pageId);
            if (!pg) return;
            var subEl = pg.querySelector(subSel || '.page-subtitle,.page-hero-subtitle,.circadian-page-subtitle');
            ann(pg.querySelector('h1'), h1Key);
            ann(subEl, subKey);
        }
        annPageSub('mood',         'page_mood_h1_gap',     'page_mood_sub');
        annPageSub('sleep',        'page_sleep_h1_gap',    'page_sleep_sub');
        annPageSub('energy',       'page_energy_h1_gap',   'page_energy_sub');
        annPageSub('circadian',    'page_velocity_h',      'page_velocity_sub', '.circadian-page-subtitle,.page-subtitle,.page-hero-subtitle');
        annPageSub('correlations', 'page_corr_h1_gap',     'page_corr_sub');
        annPageSub('patterns',     'page_patterns_h1_gap', 'page_patterns_sub');
        annPageSub('seasonal',     'page_seasonal_h',      'page_seasonal_sub', '.page-hero-subtitle,.page-subtitle');
        annPageSub('predictions',  'page_forecast_h1_gap', 'page_forecast_sub', '.page-hero-subtitle,.page-subtitle');

        /* Insights eyebrow / overview */
        var insightsPage = document.getElementById('insights');
        if (insightsPage) {
            var eyebrow  = insightsPage.querySelector('.insights-eyebrow');
            var overview = insightsPage.querySelector('.page-hero-subtitle, #insightsOverviewText');
            ann(eyebrow,  'insights_eyebrow_txt');
            ann(overview, 'insights_overview_txt');
        }

        /* Export page subtitle */
        var dataPage = document.getElementById('data');
        if (dataPage) ann(dataPage.querySelector('.page-hero-subtitle,.page-subtitle'), 'page_export_sub');

        /* Report tabs */
        document.querySelectorAll('.report-tabs button').forEach(function (el) {
            var txt = (el.textContent || '').trim();
            if (txt === 'Week')  ann(el, 'report_week');
            if (txt === 'Month') ann(el, 'report_month');
            if (txt === 'Year')  ann(el, 'report_year');
        });

        /* Report export PDF button */
        document.querySelectorAll('.report-pdf-row .btn, button').forEach(function (el) {
            if ((el.textContent || '').trim().indexOf('Export report') === 0) ann(el, 'report_export_pdf');
        });

        /* deleteAllModal title / desc (belt-and-suspenders alongside batch_e) */
        ann(document.getElementById('deleteAllModalTitle'), 'delete_all_title_txt');
        ann(document.getElementById('deleteAllModalDesc'),  'delete_all_desc_txt');
    }

    /* ─── Apply GAP translations to all annotated elements ───────────── */
    function applyGap() {
        var l = loc();
        var row = GAP[l] || GAP.en;
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = row[key] != null ? row[key] : (GAP.en[key] || null);
            if (val == null) return;
            if (el.getAttribute('data-i18n-placeholder')) { el.placeholder = val; return; }
            /* Safe first-text-node replacement — preserves child elements */
            var replaced = false;
            for (var i = 0; i < el.childNodes.length; i++) {
                var cn = el.childNodes[i];
                if (cn.nodeType === 3 && cn.textContent.trim()) {
                    cn.textContent = val;
                    replaced = true;
                    break;
                }
            }
            if (!replaced && !el.children.length) el.textContent = val;
        });
    }

    /* ─── Translate JS-generated entry modal body ─────────────────────── */
    function patchEntryModal() {
        var orig = window.showEntryModal;
        if (typeof orig !== 'function' || orig._gapFixed) return;
        orig._gapFixed = true;
        window.showEntryModal = function () {
            var r = orig.apply(this, arguments);
            setTimeout(function () {
                var l = loc();
                var row = GAP[l] || GAP.en;
                var body = document.getElementById('entryModalBody');
                if (!body) return;

                /* "Delete entire entry" button */
                body.querySelectorAll('.entry-modal-delete-btn').forEach(function (btn) {
                    if (row.delete_entire_entry) btn.textContent = row.delete_entire_entry;
                });

                /* "No entry for this day." empty-state divs */
                body.querySelectorAll('div').forEach(function (div) {
                    if (div.children.length === 0) {
                        var t = (div.textContent || '').trim();
                        if (t === 'No entry for this day.' && row.no_entry_day)
                            div.textContent = row.no_entry_day;
                        else if (t === 'Click Edit Check-In to add one.' && row.click_edit_checkin)
                            div.textContent = row.click_edit_checkin;
                    }
                });

                /* Field labels (.em-field-label) */
                var FIELD_MAP = {
                    'Mood':       'checkin_mood',
                    'Sleep':      'checkin_sleep_duration',
                    'Energy':     'checkin_energy',
                    'Activities': 'checkin_activities',
                    'Tags':       'checkin_tags',
                    'Journal':    'journal',
                    'Photos':     'checkin_photos'
                };
                body.querySelectorAll('.em-field-label').forEach(function (el) {
                    var txt = (el.textContent || '').trim();
                    /* Try GAP first, then fall back to global T_E translation chain */
                    var key = FIELD_MAP[txt];
                    if (!key) return;
                    var translated = (window.__t && window.__t(key)) || null;
                    if (translated && translated !== key) el.textContent = translated;
                });

            }, 120);
            return r;
        };
    }

    /* ─── Main run ────────────────────────────────────────────────────── */
    function runAll() {
        applyRTL();
        annotateGaps();
        applyGap();
    }

    onReady(function () {
        runAll();
        patchEntryModal();

        /* Re-run on every page navigate */
        var origNav = window.navigate;
        if (typeof origNav === 'function' && !origNav._gapFixed) {
            window.navigate = function (page) {
                var r = origNav.apply(this, arguments);
                setTimeout(runAll, 400);
                return r;
            };
            window.navigate._gapFixed = true;
        }

        /* Re-run when locale changes — fires AFTER all other wrappers */
        var origSave = window.savePreference;
        if (typeof origSave === 'function' && !origSave._gapFixed) {
            window.savePreference = function (key, value) {
                var r = origSave.apply(this, arguments);
                if (key === 'locale') {
                    setTimeout(runAll, 450); /* run after Batch E (250 ms) + final (400 ms) */
                }
                return r;
            };
            window.savePreference._gapFixed = true;
        }
    });

    console.log('[Aura Locale Fix] RTL + modal gaps + analytics subtitles + entry modal patched.');
})();
