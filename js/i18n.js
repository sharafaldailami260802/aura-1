/* ═══════════════════════════════════════════════════════════════════════
   js/i18n.js  —  Aura Mood  ·  Single authoritative i18n system
   ───────────────────────────────────────────────────────────────────────
   REPLACES: improvements.js (lang section), improvements_batch_e_i18n.js,
             improvements_i18n_runtime.js, improvements_i18n_final.js,
             improvements_locale_complete_fix.js

   HOW TO DEPLOY
   1.  Add   <script src="js/i18n.js"></script>   as the VERY LAST
       <script> tag in index.html — after every other script.
   2.  Remove (or keep but ignore) all old i18n improvement files;
       they will still run but this file wins every race.

   DESIGN RULES
   • One master table  window.AURA_STRINGS
   • One apply function  window.applyI18n(locale)
   • Wraps savePreference + navigate exactly ONCE each (guarded)
   • Runs 700 ms after page ready — beats every existing 80–450 ms timer
   • Auto-fills any missing key from English (no blank text ever)
   • RTL for Arabic / Hebrew / Farsi / Urdu
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ═══════════════════════════════════════════════════════════════════
       §1  MASTER TRANSLATION TABLE
       ─────────────────────────────────────────────────────────────────
       Keys are grouped thematically.
       Template vars:  {n} {tag} {v} {list} {s} {delta} {min} {max}
                       {moodLabel} {diff} {avg} {day1} {day2} {energy}
                       {activities} {tags} {label} {count} {days}
    ═══════════════════════════════════════════════════════════════════ */
    var S = {};

    /* ──────────────────────────── ENGLISH ─────────────────────────── */
    S.en = {
        /* Nav — sidebar + bottom bar */
        nav_tracking:'Tracking', nav_analytics_label:'Analytics',
        nav_explore:'Explore', nav_data_label:'Data',
        nav_overview:'Overview', nav_checkin:'Daily Check-In', nav_checkin_short:'Check-In',
        nav_calendar:'Calendar', nav_journal:'Journal', nav_mood_trends:'Mood Trends',
        nav_sleep:'Sleep Analysis', nav_energy:'Energy Patterns', nav_insights:'Insights',
        nav_correlations:'Correlations', nav_velocity:'Mood Velocity', nav_forecast:'Forecast',
        nav_patterns:'My Patterns', nav_seasonal:'Seasonal Rhythm', nav_reports:'Reports',
        nav_export:'Export & Backup', nav_menu:'Menu', nav_seasonal_short:'Seasonal',

        /* Dashboard */
        dash_welcome_title:'Welcome to Aura Mood',
        dash_welcome_subtitle:'Track your mood, sleep, and energy every day. Patterns emerge after a week. Insights sharpen over a month.',
        dash_start_checkin:"Start today's check-in →",
        dash_sample_data:'Explore with sample data',
        dash_feat_mood:'Mood trends & forecasting',
        dash_feat_sleep:'Sleep pattern analysis',
        dash_feat_insights:'Personalised insights',
        dash_go_deeper:'Go deeper',
        dash_analytics_hint:'Explore patterns, correlations, and forecasts from your data.',
        tile_insights_desc:'Patterns from your data',
        tile_corr_desc:'Sleep, mood & energy links',
        tile_forecast_desc:'Where your mood may go',
        tile_patterns_desc:'Sleep timeline & rhythms',
        tile_seasonal_desc:'Monthly & yearly rhythm',
        tile_velocity_desc:'Day-to-day change',

        /* Dashboard narrative */
        good_morning:'Good morning', good_afternoon:'Good afternoon', good_evening:'Good evening',
        narrative_start:'Start logging your first check-in to see patterns emerge here.',
        narrative_trend_up:'Your mood has been climbing this week.',
        narrative_trend_down:'Your mood has dipped a little this week.',
        narrative_steady:'Your mood has been steady this week.',
        narrative_logged_mood:'Today you logged {moodLabel} mood of {n}.',
        narrative_strong_mood:'a strong', narrative_moderate_mood:'a moderate', narrative_low_mood:'a low',
        no_checkin_today:'No check-in yet today.',
        tagging_recently:'You\u2019ve been tagging \u201c{tag}\u201d a lot lately.',
        streak_days:'{n}-day streak \u2014 keep it up.',
        streak_day:'Day {n} of your streak.',

        /* Daily Check-In page */
        daily_checkin:'Daily Check-In',
        checkin_subtitle:'Log your mood, sleep, and energy.',
        checkin_desc:'One entry per day \u2014 quick or detailed, your choice.',
        fill_sections:'Fill in the sections below',
        checkin_progress_label:'Fill in the sections below',
        date_heading:'Date', checkin_date_heading:'Date', checkin_date:'Date',
        checkin_mood_energy_heading:'Mood & Energy',
        checkin_sleep_heading:'Sleep',
        checkin_activities_tags_heading:'Activities & Tags',
        activities_tags_heading:'Activities & Tags',
        checkin_mood:'Mood', checkin_energy:'Energy Level',
        checkin_sleep_duration:'Sleep Duration', checkin_sleep_quality:'Sleep Quality',
        checkin_sleep_time:'Primary Sleep Time', checkin_wake_time:'Primary Wake Time',
        checkin_sleep_segments:'Sleep Segments',
        checkin_activities:'Activities', checkin_tags:'Tags', checkin_photos:'Photos',
        activities_label:'Activities', tags_label:'Tags',
        checkin_suggested_tags:'Suggested tags', checkin_tap_to_add:'Tap to add',
        checkin_daily_reflection:'Daily Reflection',
        checkin_reflection_desc:'Capture how the day felt, what mattered, and what you noticed.',
        checkin_saved_reflection:'Saved reflection',
        checkin_open_journal:'Open full journal',
        checkin_sleep_hint:'Use segments to track fragmented or polyphasic sleep.',
        checkin_sleep_segments_intro:'Record split or interrupted sleep in separate segments.',
        checkin_add_segment:'+ Add sleep segment',
        checkin_save_hint:'\u2318S to save',
        checkin_no_summary:'Not enough data to generate a summary yet.',
        undo:'Undo', redo:'Redo',
        save_entry:'Save Entry',
        daily_summary:'Daily Summary',
        low_mood:'Low mood', neutral:'Neutral', good_mood:'Good mood', today:'Today',

        /* Calendar */
        calendar_title:'Calendar',
        calendar_subtitle:'Explore your mood history across days, weeks and months.',
        calendar_year_heatmap:'Year heatmap', cal_year_heatmap:'Year heatmap',
        calendar_month_grid:'Month grid', cal_month_grid:'Month grid',
        calendar_week_timeline:'Week timeline', cal_week_timeline:'Week timeline',
        calendar_list_view:'List', cal_list:'List',
        year_in_mood_title:'Year in Mood', cal_year_in_mood:'Year in Mood',
        cal_year_subtitle:'Track your mood consistency across the past year',
        export_heatmap:'Export Heatmap',

        /* Journal */
        journal:'Journal', journal_title:'Journal',
        journal_page_subtitle:'Write freely \u2014 this is just for you.',
        journal_eyebrow:'Your reflections',
        journal_one_per_day_sub:'One entry per day.',
        journal_unsaved:'Unsaved changes',
        save_journal:'Save Journal',
        edit_journal_entry:'Edit journal entry',
        journal_saved_placeholder:'Your journal entry for today has already been saved.',
        one_journal_per_day:'Only one journal entry can be created per day.',
        add_photo:'\ud83d\udcf7 Add Photo',

        /* Analytics pages */
        page_mood_subtitle:'Patterns and trends in your emotional wellbeing.',
        page_sleep_subtitle:'Quality and consistency of your rest.',
        page_energy_subtitle:'Rhythm and stamina across days.',
        page_velocity_h1:'Mood Velocity & Stability',
        page_velocity_subtitle:'See how your mood shifts day to day and how stable you feel.',
        page_corr_subtitle:'Discover relationships between your tracked metrics.',
        page_patterns_subtitle:'Sleep, activity and mood patterns.',
        page_seasonal_h1:'Seasonal & Rhythm Analysis',
        page_seasonal_subtitle:'Uncover how your mood, sleep and energy shift across seasons and years.',
        page_forecast_subtitle:'Predictive trends based on your recent data.',
        insights_eyebrow:'Personal Analytics',
        insights_overview:'Patterns from your data. The more you log, the sharper these become.',

        /* Export page */
        export_page_title:'Export & Backup',
        export_page_subtitle:'Your data belongs to you. Download, back up, or import at any time.',
        download_eyebrow:'Download',
        export_data_title:'Export data',
        export_data_desc:'Download entries as JSON or CSV. Optionally filter by date range or tags.',
        from_label:'From', to_label:'To',
        tags_optional:'Tags (optional)',

        /* Reports */
        report_week:'Week', report_month:'Month', report_year:'Year',
        report_export_pdf:'Export report as PDF',
        report_best_day:'Best day', report_challenging:'Challenging day (lowest mood)',

        /* Settings */
        settings:'Settings',
        s_appearance:'Appearance', s_appearance_desc:'Theme and display preferences.',
        s_theme:'Theme', s_dark_mode:'Dark mode',
        s_sound:'Success sound', s_particles:'Ambient particles', s_parallax:'Parallax scrolling',
        s_preferences:'Preferences', s_preferences_desc:'Defaults and display options.',
        s_language:'Language', s_date_format:'Date format', s_time_format:'Time format',
        s_chart_days:'Chart default days', s_reduce_motion:'Reduce motion',
        s_notifications:'Enable notifications (browser)',
        s_dashboard_widgets:'Dashboard widgets',
        s_show_mood:'Show Mood chart', s_show_sleep:'Show Sleep chart', s_show_energy:'Show Energy chart',
        s_custom_metrics:'Custom metrics',
        s_custom_metrics_desc:'Add your own trackable metrics (e.g. anxiety, pain, productivity).',
        s_privacy:'Data & Privacy',
        s_privacy_desc:'All data is stored locally on your device.',
        s_delete_all:'Delete all my data',
        s_favourite_tags:'Favourite tags', s_default_activities:'Default activities',

        /* Modals */
        modal_full_edit:'\u270f\ufe0f Full Edit',
        modal_journal_btn:'\ud83d\udcd3 Journal',
        modal_close:'Close', modal_cancel:'Cancel',
        modal_delete:'Delete', modal_confirm:'Confirm',
        delete_entry:'Delete Entry',
        delete_entry_q:'Delete Entry?',
        cannot_undo:'This action cannot be undone.',
        full_delete_day:'Delete this entire day?',
        full_delete_desc:'Mood, energy, sleep, activities and journal will be permanently removed.',
        full_delete_btn:'Delete Entry',
        are_you_sure:'Are you sure?',
        enter_passcode:'Enter passcode to confirm',
        type_delete_label:'Type DELETE to confirm',
        delete_all_title:'Delete all my data',
        delete_all_desc:'This permanently deletes all entries, journal, backups, and settings.',
        delete_all_confirm:'Delete everything',
        no_entry_day:'No entry for this day.',
        click_edit_checkin:'Click Edit Check-In to add one.',
        delete_entire_entry:'\ud83d\uddd1 Delete entire entry for this day',

        /* PWA */
        pwa_install_text:'Install Aura for quick access and offline use.',
        pwa_not_now:'Not now', pwa_install_btn:'Install',
        pwa_update_text:'A new version is available.', pwa_reload:'Reload',

        /* Charts / insights */
        chart_avg_mood_month:'Average Mood by Month',
        chart_mood_axis:'Mood change (day-over-day)',
        chart_mood_axis_short:'Change',
        chart_mood_improved:'Mood improved by {n} point{s}',
        chart_mood_dipped:'Mood dipped by {n} point{s}',
        chart_mood_1_10:'Mood (1\u201310)',
        chip_latest:'Latest: {delta} vs avg',
        chip_range:'Range {min}\u2013{max}',
        insights_what_data_shows:'What your data shows',
        insight_sleep_heading:'Sleep Insights',
        insight_activity_heading:'Activity Insights',
        insight_stability_heading:'Mood Stability Insights',
        insight_tags_heading:'Tag Insights',

        /* Daily summary */
        ds_not_enough:'Not enough data to generate a summary yet.',
        ds_journal_only:'You recorded a journal entry today. No mood data was logged.',
        ds_photos_only:'You saved photos for this day, with no mood data logged.',
        ds_mood_only:'Mood was recorded today without additional metrics.',
        ds_mood_high:'Your mood was slightly higher than your recent average.',
        ds_mood_low:'Your mood came in a little lower than your recent average.',
        ds_mood_steady:'Your mood was in line with your recent average.',
        ds_mood_first:'Your first mood entry \u2014 great start.',
        ds_sleep_high:'Sleep duration was slightly above your typical range.',
        ds_sleep_low:'Sleep duration was slightly below your typical range.',
        ds_sleep_steady:'Sleep duration was close to your typical range.',
        ds_sleep_recorded:'Sleep was recorded for the day.',
        ds_sleep_segmented:', and it was split into multiple segments.',
        ds_energy_and:', and {energy} energy.',
        ds_energy_only:'Energy was recorded today without a matching mood entry.',
        ds_activities_tags:'Today included activities like \u201c{activities}\u201d and tags such as \u201c{tags}\u201d.',
        ds_activities_only:'Today included activities: \u201c{activities}\u201d.',
        ds_tags_only:'Today included tags: \u201c{tags}\u201d.',
        ds_journal_saved:'A journal note was saved.',
        ds_mood:'{v}/10 mood', ds_sleep:'Sleep: {v} hrs', ds_energy:'Energy: {v}/10',
        ds_above_avg:'Slightly above your usual range.',
        ds_below_avg:'Slightly below your usual range.',
        ds_on_avg:'Within your typical range.',
        ds_first:'First entry \u2014 great start.',
        ds_tags:'Tags: {list}.', ds_activities:'Activities: {list}.',
        ds_journal:'A journal note was saved.',
        ds_multi_sleep:'Sleep was split across multiple segments.',

        /* Day-of-week chart */
        dow_need_more_data:'Add at least 2 weeks of entries to see your weekly patterns.',
        dow_peak_dip:'Your mood tends to peak on {day1}s and dip on {day2}s.',
        dow_no_data_label:'No data', dow_average_label:'average', dow_dataset_label:'Average mood',

        /* Toasts */
        toast_lang:'Language updated \u2713',
        toast_date_fmt:'Date format updated \u2713',
        toast_time_fmt:'Time format updated \u2713',
        toast_saved:'Saved \u2713',
    };

    /* ──────────────────────────── GERMAN ──────────────────────────── */
    S.de = {
        nav_tracking:'Tracking', nav_analytics_label:'Analytik',
        nav_explore:'Erkunden', nav_data_label:'Daten',
        nav_overview:'Übersicht', nav_checkin:'Tages-Check-in', nav_checkin_short:'Check-in',
        nav_calendar:'Kalender', nav_journal:'Tagebuch', nav_mood_trends:'Stimmungstrends',
        nav_sleep:'Schlafanalyse', nav_energy:'Energiemuster', nav_insights:'Einblicke',
        nav_correlations:'Korrelationen', nav_velocity:'Stimmungsgeschwindigkeit', nav_forecast:'Prognose',
        nav_patterns:'Meine Muster', nav_seasonal:'Saisonaler Rhythmus', nav_reports:'Berichte',
        nav_export:'Export & Backup', nav_menu:'Menü', nav_seasonal_short:'Saisonal',
        dash_welcome_title:'Willkommen bei Aura Mood',
        dash_welcome_subtitle:'Verfolge täglich deine Stimmung, deinen Schlaf und deine Energie. Muster zeigen sich nach einer Woche.',
        dash_start_checkin:'Heutigen Check-in starten →',
        dash_sample_data:'Mit Beispieldaten erkunden',
        dash_feat_mood:'Stimmungstrends & Prognosen',
        dash_feat_sleep:'Schlafmusteranalyse',
        dash_feat_insights:'Personalisierte Einblicke',
        dash_go_deeper:'Tiefer eintauchen',
        dash_analytics_hint:'Erkunde Muster, Korrelationen und Prognosen aus deinen Daten.',
        tile_insights_desc:'Muster aus deinen Daten',
        tile_corr_desc:'Schlaf-, Stimmungs- & Energieverbindungen',
        tile_forecast_desc:'Wohin deine Stimmung tendiert',
        tile_patterns_desc:'Schlaf-Timeline & Rhythmen',
        tile_seasonal_desc:'Monatlicher & jährlicher Rhythmus',
        tile_velocity_desc:'Tägliche Veränderungen',
        good_morning:'Guten Morgen', good_afternoon:'Guten Tag', good_evening:'Guten Abend',
        narrative_start:'Beginne mit deinem ersten Check-in, um Muster zu sehen.',
        narrative_trend_up:'Deine Stimmung steigt diese Woche.',
        narrative_trend_down:'Deine Stimmung ist diese Woche etwas gesunken.',
        narrative_steady:'Deine Stimmung war diese Woche stabil.',
        narrative_strong_mood:'eine starke', narrative_moderate_mood:'eine moderate', narrative_low_mood:'eine niedrige',
        no_checkin_today:'Heute noch kein Check-in.',
        tagging_recently:'Du verwendest das Tag \u201e{tag}\u201c in letzter Zeit oft.',
        streak_days:'{n}-Tage-Streak \u2014 weiter so!',
        streak_day:'Tag {n} deines Streaks.',
        daily_checkin:'Tages-Check-in',
        checkin_subtitle:'Erfasse deine Stimmung, deinen Schlaf und deine Energie.',
        checkin_desc:'Ein Eintrag pro Tag \u2014 kurz oder detailliert, du entscheidest.',
        fill_sections:'Fülle die Abschnitte unten aus',
        checkin_progress_label:'Fülle die Abschnitte unten aus',
        date_heading:'Datum', checkin_date_heading:'Datum', checkin_date:'Datum',
        checkin_mood_energy_heading:'Stimmung & Energie',
        checkin_sleep_heading:'Schlaf',
        checkin_activities_tags_heading:'Aktivitäten & Tags',
        activities_tags_heading:'Aktivitäten & Tags',
        checkin_mood:'Stimmung', checkin_energy:'Energieniveau',
        checkin_sleep_duration:'Schlafdauer', checkin_sleep_quality:'Schlafqualität',
        checkin_sleep_time:'Hauptschlafzeit', checkin_wake_time:'Hauptaufwachzeit',
        checkin_sleep_segments:'Schlafphasen',
        checkin_activities:'Aktivitäten', checkin_tags:'Tags', checkin_photos:'Fotos',
        activities_label:'Aktivitäten', tags_label:'Tags',
        checkin_suggested_tags:'Vorgeschlagene Tags', checkin_tap_to_add:'Tippen zum Hinzufügen',
        checkin_daily_reflection:'Tagesreflexion',
        checkin_reflection_desc:'Halte fest, wie der Tag war, was wichtig war und was du bemerkt hast.',
        checkin_saved_reflection:'Gespeicherte Reflexion',
        checkin_open_journal:'Vollständiges Tagebuch öffnen',
        checkin_sleep_hint:'Verwende Segmente für fragmentierten oder polyphasischen Schlaf.',
        checkin_sleep_segments_intro:'Erfasse geteilten oder unterbrochenen Schlaf in separaten Segmenten.',
        checkin_add_segment:'+ Schlafphase hinzufügen',
        checkin_save_hint:'\u2318S zum Speichern',
        checkin_no_summary:'Noch nicht genug Daten für eine Zusammenfassung.',
        undo:'Rückgängig', redo:'Wiederholen',
        save_entry:'Eintrag speichern',
        daily_summary:'Tageszusammenfassung',
        low_mood:'Niedrige Stimmung', neutral:'Neutral', good_mood:'Gute Stimmung', today:'Heute',
        calendar_title:'Kalender',
        calendar_subtitle:'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.',
        calendar_year_heatmap:'Jahres-Heatmap', cal_year_heatmap:'Jahres-Heatmap',
        calendar_month_grid:'Monatsgitter', cal_month_grid:'Monatsgitter',
        calendar_week_timeline:'Wochen-Timeline', cal_week_timeline:'Wochen-Timeline',
        calendar_list_view:'Liste', cal_list:'Liste',
        year_in_mood_title:'Jahr in Stimmung', cal_year_in_mood:'Jahr in Stimmung',
        cal_year_subtitle:'Verfolge deine Stimmungskonsistenz über das vergangene Jahr',
        export_heatmap:'Heatmap exportieren',
        journal:'Tagebuch', journal_title:'Tagebuch',
        journal_page_subtitle:'Schreibe frei \u2014 das ist nur für dich.',
        journal_eyebrow:'Deine Reflexionen',
        journal_one_per_day_sub:'Ein Eintrag pro Tag.',
        journal_unsaved:'Ungespeicherte Änderungen',
        save_journal:'Tagebuch speichern',
        edit_journal_entry:'Tagebucheintrag bearbeiten',
        journal_saved_placeholder:'Dein Tagebucheintrag für heute wurde bereits gespeichert.',
        one_journal_per_day:'Pro Tag kann nur ein Tagebucheintrag erstellt werden.',
        add_photo:'\ud83d\udcf7 Foto hinzufügen',
        page_mood_subtitle:'Muster und Trends in deinem emotionalen Wohlbefinden.',
        page_sleep_subtitle:'Qualität und Konsistenz deiner Erholung.',
        page_energy_subtitle:'Rhythmus und Ausdauer über Tage.',
        page_velocity_h1:'Stimmungsgeschwindigkeit & Stabilität',
        page_velocity_subtitle:'Sieh, wie sich deine Stimmung von Tag zu Tag verändert.',
        page_corr_subtitle:'Entdecke Zusammenhänge zwischen deinen Metriken.',
        page_patterns_subtitle:'Schlaf-, Aktivitäts- und Stimmungsmuster.',
        page_seasonal_h1:'Saisonale & Rhythmusanalyse',
        page_seasonal_subtitle:'Entdecke, wie sich deine Stimmung, dein Schlaf und deine Energie saisonal verändern.',
        page_forecast_subtitle:'Vorhersagetrends basierend auf deinen aktuellen Daten.',
        insights_eyebrow:'Persönliche Analytik',
        insights_overview:'Muster aus deinen Daten. Je mehr du aufzeichnest, desto schärfer werden sie.',
        export_page_title:'Export & Backup',
        export_page_subtitle:'Deine Daten gehören dir. Lade sie jederzeit herunter, sichere oder importiere sie.',
        download_eyebrow:'Herunterladen',
        export_data_title:'Daten exportieren',
        export_data_desc:'Einträge als JSON oder CSV herunterladen. Optional nach Datum oder Tags filtern.',
        from_label:'Von', to_label:'Bis', tags_optional:'Tags (optional)',
        report_week:'Woche', report_month:'Monat', report_year:'Jahr',
        report_export_pdf:'Bericht als PDF exportieren',
        report_best_day:'Bester Tag', report_challenging:'Schwieriger Tag (niedrigste Stimmung)',
        settings:'Einstellungen',
        s_appearance:'Aussehen', s_appearance_desc:'Design und Anzeigeeinstellungen.',
        s_theme:'Design', s_dark_mode:'Dunkelmodus',
        s_sound:'Erfolgston', s_particles:'Umgebungspartikel', s_parallax:'Parallax-Scrollen',
        s_preferences:'Einstellungen', s_preferences_desc:'Standard- und Anzeigeoptionen.',
        s_language:'Sprache', s_date_format:'Datumsformat', s_time_format:'Zeitformat',
        s_chart_days:'Standardzeitraum', s_reduce_motion:'Bewegung reduzieren',
        s_notifications:'Benachrichtigungen aktivieren (Browser)',
        s_dashboard_widgets:'Dashboard-Widgets',
        s_show_mood:'Stimmungsdiagramm anzeigen', s_show_sleep:'Schlafdiagramm anzeigen', s_show_energy:'Energiediagramm anzeigen',
        s_custom_metrics:'Eigene Metriken',
        s_custom_metrics_desc:'Füge eigene Metriken hinzu (z. B. Angst, Schmerz, Produktivität).',
        s_privacy:'Daten & Datenschutz',
        s_privacy_desc:'Alle Daten werden lokal auf deinem Gerät gespeichert.',
        s_delete_all:'Alle Daten löschen',
        s_favourite_tags:'Lieblingstags', s_default_activities:'Standardaktivitäten',
        modal_full_edit:'\u270f\ufe0f Vollständig bearbeiten', modal_journal_btn:'\ud83d\udcd3 Tagebuch',
        modal_close:'Schließen', modal_cancel:'Abbrechen', modal_delete:'Löschen', modal_confirm:'Bestätigen',
        delete_entry:'Eintrag löschen', delete_entry_q:'Eintrag löschen?',
        cannot_undo:'Diese Aktion kann nicht rückgängig gemacht werden.',
        full_delete_day:'Diesen ganzen Tag löschen?',
        full_delete_desc:'Stimmung, Energie, Schlaf, Aktivitäten und Tagebuch werden dauerhaft gelöscht.',
        full_delete_btn:'Eintrag löschen',
        are_you_sure:'Bist du sicher?',
        enter_passcode:'Passcode eingeben, um zu bestätigen',
        type_delete_label:'DELETE eingeben, um zu bestätigen',
        delete_all_title:'Alle meine Daten löschen',
        delete_all_desc:'Alle Einträge, Tagebücher, Sicherungen und Einstellungen werden dauerhaft gelöscht.',
        delete_all_confirm:'Alles löschen',
        no_entry_day:'Kein Eintrag für diesen Tag.',
        click_edit_checkin:'Klicke auf Eintrag bearbeiten, um hinzuzufügen.',
        delete_entire_entry:'\ud83d\uddd1 Kompletten Eintrag löschen',
        pwa_install_text:'Installiere Aura für schnellen Zugriff und Offline-Nutzung.',
        pwa_not_now:'Nicht jetzt', pwa_install_btn:'Installieren',
        pwa_update_text:'Eine neue Version ist verfügbar.', pwa_reload:'Neu laden',
        chart_avg_mood_month:'Durchschnittliche Stimmung nach Monat',
        chart_mood_axis:'Stimmungsveränderung (Tag-zu-Tag)',
        chart_mood_axis_short:'Veränderung',
        chart_mood_improved:'Stimmung um {n} Punkt{s} gestiegen',
        chart_mood_dipped:'Stimmung um {n} Punkt{s} gefallen',
        chart_mood_1_10:'Stimmung (1\u201310)',
        chip_latest:'Aktuell: {delta} vs Ø',
        chip_range:'Bereich {min}\u2013{max}',
        insights_what_data_shows:'Was deine Daten zeigen',
        insight_sleep_heading:'Schlaf-Einblicke', insight_activity_heading:'Aktivitäts-Einblicke',
        insight_stability_heading:'Stimmungsstabilität', insight_tags_heading:'Tag-Einblicke',
        toast_lang:'Sprache aktualisiert \u2713', toast_date_fmt:'Datumsformat aktualisiert \u2713',
        toast_time_fmt:'Zeitformat aktualisiert \u2713', toast_saved:'Gespeichert \u2713',
        dow_need_more_data:'Füge mindestens 2 Wochen Einträge hinzu, um wöchentliche Muster zu sehen.',
        dow_peak_dip:'Deine Stimmung erreicht tendenziell am {day1} ihren Höhepunkt und sinkt am {day2}.',
        dow_no_data_label:'Keine Daten', dow_average_label:'Durchschnitt', dow_dataset_label:'Durchschnittliche Stimmung',
    };

    /* ──────────────────────────── FRENCH ──────────────────────────── */
    S.fr = {
        nav_tracking:'Suivi', nav_analytics_label:'Analytique',
        nav_explore:'Explorer', nav_data_label:'Données',
        nav_overview:'Vue d\'ensemble', nav_checkin:'Bilan du jour', nav_checkin_short:'Bilan',
        nav_calendar:'Calendrier', nav_journal:'Journal', nav_mood_trends:'Tendances',
        nav_sleep:'Analyse du sommeil', nav_energy:'Niveaux d\'énergie', nav_insights:'Insights',
        nav_correlations:'Corrélations', nav_velocity:'Vélocité', nav_forecast:'Prévisions',
        nav_patterns:'Mes patterns', nav_seasonal:'Rythme saisonnier', nav_reports:'Rapports',
        nav_export:'Exporter & Sauvegarder', nav_menu:'Menu', nav_seasonal_short:'Saisonnier',
        dash_welcome_title:'Bienvenue sur Aura Mood',
        dash_welcome_subtitle:'Suivez votre humeur, sommeil et énergie chaque jour. Les tendances émergent en une semaine.',
        dash_start_checkin:'Commencer le bilan du jour →',
        dash_sample_data:'Explorer avec des données exemples',
        dash_feat_mood:'Tendances d\'humeur & prévisions',
        dash_feat_sleep:'Analyse des habitudes de sommeil',
        dash_feat_insights:'Insights personnalisés',
        dash_go_deeper:'Aller plus loin',
        dash_analytics_hint:'Explorez les patterns, corrélations et prévisions de vos données.',
        tile_insights_desc:'Patterns de vos données',
        tile_corr_desc:'Liens sommeil, humeur & énergie',
        tile_forecast_desc:'Où va votre humeur',
        tile_patterns_desc:'Chronologie & rythmes de sommeil',
        tile_seasonal_desc:'Rythme mensuel & annuel',
        tile_velocity_desc:'Changement jour par jour',
        good_morning:'Bonjour', good_afternoon:'Bon après-midi', good_evening:'Bonsoir',
        narrative_start:'Commencez à enregistrer votre premier bilan pour voir les patterns.',
        narrative_trend_up:'Votre humeur s\'améliore cette semaine.',
        narrative_trend_down:'Votre humeur a légèrement baissé cette semaine.',
        narrative_steady:'Votre humeur a été stable cette semaine.',
        narrative_strong_mood:'une forte', narrative_moderate_mood:'une modérée', narrative_low_mood:'une faible',
        no_checkin_today:'Pas encore de bilan aujourd\'hui.',
        tagging_recently:'Vous utilisez beaucoup le tag \u00ab\u00a0{tag}\u00a0\u00bb ces derniers temps.',
        streak_days:'Série de {n} jours \u2014 continuez !',
        streak_day:'Jour {n} de votre série.',
        daily_checkin:'Bilan du jour',
        checkin_subtitle:'Enregistrez votre humeur, sommeil et énergie.',
        checkin_desc:'Une entrée par jour \u2014 courte ou détaillée, votre choix.',
        fill_sections:'Remplissez les sections ci-dessous',
        checkin_progress_label:'Remplissez les sections ci-dessous',
        date_heading:'Date', checkin_date_heading:'Date', checkin_date:'Date',
        checkin_mood_energy_heading:'Humeur & Énergie',
        checkin_sleep_heading:'Sommeil',
        checkin_activities_tags_heading:'Activités & Étiquettes',
        activities_tags_heading:'Activités & Étiquettes',
        checkin_mood:'Humeur', checkin_energy:'Niveau d\'énergie',
        checkin_sleep_duration:'Durée du sommeil', checkin_sleep_quality:'Qualité du sommeil',
        checkin_sleep_time:'Heure de coucher', checkin_wake_time:'Heure de réveil',
        checkin_sleep_segments:'Segments de sommeil',
        checkin_activities:'Activités', checkin_tags:'Étiquettes', checkin_photos:'Photos',
        activities_label:'Activités', tags_label:'Étiquettes',
        checkin_suggested_tags:'Étiquettes suggérées', checkin_tap_to_add:'Appuyer pour ajouter',
        checkin_daily_reflection:'Réflexion du jour',
        checkin_reflection_desc:'Notez comment s\'est passée la journée, ce qui a compté et ce que vous avez remarqué.',
        checkin_saved_reflection:'Réflexion enregistrée',
        checkin_open_journal:'Ouvrir le journal complet',
        checkin_sleep_hint:'Utilisez des segments pour un sommeil fragmenté ou polyphasique.',
        checkin_sleep_segments_intro:'Enregistrez un sommeil divisé en segments séparés.',
        checkin_add_segment:'+ Ajouter un segment de sommeil',
        checkin_save_hint:'\u2318S pour sauvegarder',
        checkin_no_summary:'Pas encore assez de données pour générer un résumé.',
        undo:'Annuler', redo:'Rétablir',
        save_entry:'Enregistrer',
        daily_summary:'Résumé du jour',
        low_mood:'Humeur basse', neutral:'Neutre', good_mood:'Bonne humeur', today:'Aujourd\'hui',
        calendar_title:'Calendrier',
        calendar_subtitle:'Explorez votre historique d\'humeur par jour, semaine et mois.',
        calendar_year_heatmap:'Heatmap annuelle', cal_year_heatmap:'Heatmap annuelle',
        calendar_month_grid:'Grille mensuelle', cal_month_grid:'Grille mensuelle',
        calendar_week_timeline:'Chronologie hebdomadaire', cal_week_timeline:'Chronologie hebdomadaire',
        calendar_list_view:'Liste', cal_list:'Liste',
        year_in_mood_title:'Année en humeur', cal_year_in_mood:'Année en humeur',
        cal_year_subtitle:'Suivez votre constance d\'humeur sur l\'année passée',
        export_heatmap:'Exporter la heatmap',
        journal:'Journal', journal_title:'Journal',
        journal_page_subtitle:'Écrivez librement \u2014 c\'est juste pour vous.',
        journal_eyebrow:'Vos réflexions',
        journal_one_per_day_sub:'Une entrée par jour.',
        journal_unsaved:'Modifications non enregistrées',
        save_journal:'Enregistrer le journal',
        edit_journal_entry:'Modifier l\'entrée',
        journal_saved_placeholder:'Votre entrée a déjà été enregistrée.',
        one_journal_per_day:'Un seul entrée de journal par jour.',
        add_photo:'\ud83d\udcf7 Ajouter une photo',
        page_mood_subtitle:'Tendances de votre bien-être émotionnel.',
        page_sleep_subtitle:'Qualité et constance de votre repos.',
        page_energy_subtitle:'Rythme et endurance au fil des jours.',
        page_velocity_h1:'Vélocité & Stabilité de l\'Humeur',
        page_velocity_subtitle:'Voyez comment votre humeur évolue jour après jour.',
        page_corr_subtitle:'Découvrez les relations entre vos métriques.',
        page_patterns_subtitle:'Patterns de sommeil, d\'activité et d\'humeur.',
        page_seasonal_h1:'Analyse Saisonnière & Rythmique',
        page_seasonal_subtitle:'Découvrez comment votre humeur évolue selon les saisons.',
        page_forecast_subtitle:'Tendances prédictives basées sur vos données récentes.',
        insights_eyebrow:'Analytique personnelle',
        insights_overview:'Modèles de vos données. Plus vous enregistrez, plus ils s\'affinent.',
        export_page_title:'Exporter & Sauvegarder',
        export_page_subtitle:'Vos données vous appartiennent. Téléchargez, sauvegardez ou importez à tout moment.',
        download_eyebrow:'Télécharger', export_data_title:'Exporter les données',
        export_data_desc:'Téléchargez les entrées en JSON ou CSV.',
        from_label:'De', to_label:'À', tags_optional:'Étiquettes (optionnel)',
        report_week:'Semaine', report_month:'Mois', report_year:'Année',
        report_export_pdf:'Exporter le rapport en PDF',
        report_best_day:'Meilleur jour', report_challenging:'Jour difficile (humeur la plus basse)',
        settings:'Paramètres',
        s_appearance:'Apparence', s_appearance_desc:'Thème et préférences d\'affichage.',
        s_theme:'Thème', s_dark_mode:'Mode sombre',
        s_sound:'Son de succès', s_particles:'Particules ambiantes', s_parallax:'Défilement parallaxe',
        s_preferences:'Préférences', s_preferences_desc:'Options par défaut et d\'affichage.',
        s_language:'Langue', s_date_format:'Format de date', s_time_format:'Format de l\'heure',
        s_chart_days:'Jours par défaut du graphique', s_reduce_motion:'Réduire les animations',
        s_notifications:'Activer les notifications (navigateur)',
        s_dashboard_widgets:'Widgets du tableau de bord',
        s_show_mood:'Afficher le graphique d\'humeur', s_show_sleep:'Afficher le graphique de sommeil', s_show_energy:'Afficher le graphique d\'énergie',
        s_custom_metrics:'Métriques personnalisées',
        s_custom_metrics_desc:'Ajoutez vos propres métriques (p. ex. anxiété, douleur, productivité).',
        s_privacy:'Données & Confidentialité',
        s_privacy_desc:'Toutes les données sont stockées localement sur votre appareil.',
        s_delete_all:'Supprimer toutes mes données',
        s_favourite_tags:'Étiquettes favorites', s_default_activities:'Activités par défaut',
        modal_full_edit:'\u270f\ufe0f Modifier complet', modal_journal_btn:'\ud83d\udcd3 Journal',
        modal_close:'Fermer', modal_cancel:'Annuler', modal_delete:'Supprimer', modal_confirm:'Confirmer',
        delete_entry:'Supprimer l\'entrée', delete_entry_q:'Supprimer l\'entrée ?',
        cannot_undo:'Cette action est irréversible.',
        full_delete_day:'Supprimer toute la journée ?',
        full_delete_desc:'Humeur, énergie, sommeil, activités et journal seront définitivement supprimés.',
        full_delete_btn:'Supprimer l\'entrée',
        are_you_sure:'Êtes-vous sûr ?',
        enter_passcode:'Entrez le code pour confirmer',
        type_delete_label:'Tapez SUPPRIMER pour confirmer',
        delete_all_title:'Supprimer toutes mes données',
        delete_all_desc:'Supprime définitivement toutes les entrées, le journal, les sauvegardes et les paramètres.',
        delete_all_confirm:'Tout supprimer',
        no_entry_day:'Aucune entrée pour ce jour.',
        click_edit_checkin:'Cliquez sur Modifier pour en ajouter une.',
        delete_entire_entry:'\ud83d\uddd1 Supprimer toute l\'entrée',
        pwa_install_text:'Installez Aura pour un accès rapide et hors ligne.',
        pwa_not_now:'Pas maintenant', pwa_install_btn:'Installer',
        pwa_update_text:'Une nouvelle version est disponible.', pwa_reload:'Recharger',
        chart_avg_mood_month:'Humeur moyenne par mois',
        chart_mood_axis:'Variation d\'humeur (jour après jour)',
        chart_mood_axis_short:'Variation',
        chart_mood_improved:'Humeur améliorée de {n} point{s}',
        chart_mood_dipped:'Humeur en baisse de {n} point{s}',
        chart_mood_1_10:'Humeur (1\u201310)',
        chip_latest:'Récent : {delta} vs moy.',
        chip_range:'Plage {min}\u2013{max}',
        insights_what_data_shows:'Ce que montrent vos données',
        insight_sleep_heading:'Sommeil', insight_activity_heading:'Activité',
        insight_stability_heading:'Stabilité émotionnelle', insight_tags_heading:'Étiquettes',
        toast_lang:'Langue mise à jour \u2713', toast_date_fmt:'Format de date mis à jour \u2713',
        toast_time_fmt:'Format de l\'heure mis à jour \u2713', toast_saved:'Enregistré \u2713',
        dow_need_more_data:'Ajoutez au moins 2 semaines d\'entrées pour voir vos patterns hebdomadaires.',
        dow_peak_dip:'Votre humeur tend à culminer le {day1} et à baisser le {day2}.',
        dow_no_data_label:'Aucune donnée', dow_average_label:'moyenne', dow_dataset_label:'Humeur moyenne',
    };

    /* ──────────────────────────── SPANISH ─────────────────────────── */
    S.es = {
        nav_tracking:'Seguimiento', nav_analytics_label:'Analítica',
        nav_explore:'Explorar', nav_data_label:'Datos',
        nav_overview:'Resumen', nav_checkin:'Registro diario', nav_checkin_short:'Registro',
        nav_calendar:'Calendario', nav_journal:'Diario', nav_mood_trends:'Tendencias',
        nav_sleep:'Análisis del sueño', nav_energy:'Patrones de energía', nav_insights:'Perspectivas',
        nav_correlations:'Correlaciones', nav_velocity:'Velocidad del ánimo', nav_forecast:'Pronóstico',
        nav_patterns:'Mis patrones', nav_seasonal:'Ritmo estacional', nav_reports:'Informes',
        nav_export:'Exportar & Copia', nav_menu:'Menú', nav_seasonal_short:'Estacional',
        dash_welcome_title:'Bienvenido a Aura Mood',
        dash_welcome_subtitle:'Registra tu ánimo, sueño y energía cada día. Los patrones emergen en una semana.',
        dash_start_checkin:'Empezar el registro de hoy →',
        dash_sample_data:'Explorar con datos de ejemplo',
        dash_feat_mood:'Tendencias de ánimo y pronósticos',
        dash_feat_sleep:'Análisis de patrones de sueño',
        dash_feat_insights:'Perspectivas personalizadas',
        dash_go_deeper:'Ir más profundo',
        dash_analytics_hint:'Explora patrones, correlaciones y pronósticos de tus datos.',
        tile_insights_desc:'Patrones de tus datos',
        tile_corr_desc:'Vínculos sueño, ánimo y energía',
        tile_forecast_desc:'Hacia dónde va tu ánimo',
        tile_patterns_desc:'Línea de tiempo de sueño',
        tile_seasonal_desc:'Ritmo mensual y anual',
        tile_velocity_desc:'Cambio día a día',
        good_morning:'Buenos días', good_afternoon:'Buenas tardes', good_evening:'Buenas noches',
        narrative_start:'Empieza a registrar tu primer check-in para ver los patrones.',
        narrative_trend_up:'Tu ánimo ha mejorado esta semana.',
        narrative_trend_down:'Tu ánimo ha bajado un poco esta semana.',
        narrative_steady:'Tu ánimo ha sido estable esta semana.',
        narrative_strong_mood:'un', narrative_moderate_mood:'un moderado', narrative_low_mood:'un bajo',
        no_checkin_today:'Aún no hay registro hoy.',
        tagging_recently:'Has estado usando la etiqueta \u201c{tag}\u201d mucho últimamente.',
        streak_days:'Racha de {n} días \u2014 ¡sigue así!',
        streak_day:'Día {n} de tu racha.',
        daily_checkin:'Registro diario',
        checkin_subtitle:'Registra tu ánimo, sueño y energía.',
        checkin_desc:'Una entrada por día \u2014 corta o detallada, a tu elección.',
        fill_sections:'Completa las secciones abajo',
        checkin_progress_label:'Completa las secciones abajo',
        date_heading:'Fecha', checkin_date_heading:'Fecha', checkin_date:'Fecha',
        checkin_mood_energy_heading:'Ánimo y Energía',
        checkin_sleep_heading:'Sueño',
        checkin_activities_tags_heading:'Actividades y Etiquetas',
        activities_tags_heading:'Actividades y Etiquetas',
        checkin_mood:'Ánimo', checkin_energy:'Nivel de energía',
        checkin_sleep_duration:'Duración del sueño', checkin_sleep_quality:'Calidad del sueño',
        checkin_sleep_time:'Hora principal de dormir', checkin_wake_time:'Hora principal de despertar',
        checkin_sleep_segments:'Segmentos de sueño',
        checkin_activities:'Actividades', checkin_tags:'Etiquetas', checkin_photos:'Fotos',
        activities_label:'Actividades', tags_label:'Etiquetas',
        checkin_suggested_tags:'Etiquetas sugeridas', checkin_tap_to_add:'Toca para añadir',
        checkin_daily_reflection:'Reflexión diaria',
        checkin_reflection_desc:'Captura cómo fue el día, qué importó y qué notaste.',
        checkin_saved_reflection:'Reflexión guardada',
        checkin_open_journal:'Abrir el diario completo',
        checkin_sleep_hint:'Usa segmentos para el sueño fragmentado o polifásico.',
        checkin_sleep_segments_intro:'Captura el sueño dividido en segmentos separados.',
        checkin_add_segment:'+ Añadir segmento de sueño',
        checkin_save_hint:'\u2318S para guardar',
        checkin_no_summary:'Todavía no hay suficientes datos para generar un resumen.',
        undo:'Deshacer', redo:'Rehacer',
        save_entry:'Guardar entrada',
        daily_summary:'Resumen del día',
        low_mood:'Ánimo bajo', neutral:'Neutral', good_mood:'Buen ánimo', today:'Hoy',
        calendar_title:'Calendario',
        calendar_subtitle:'Explora tu historial de ánimo por días, semanas y meses.',
        calendar_year_heatmap:'Mapa de calor anual', cal_year_heatmap:'Mapa de calor anual',
        calendar_month_grid:'Cuadrícula mensual', cal_month_grid:'Cuadrícula mensual',
        calendar_week_timeline:'Línea de tiempo semanal', cal_week_timeline:'Línea de tiempo semanal',
        calendar_list_view:'Lista', cal_list:'Lista',
        year_in_mood_title:'Año en estado de ánimo', cal_year_in_mood:'Año en estado de ánimo',
        cal_year_subtitle:'Sigue la consistencia de tu ánimo durante el año pasado',
        export_heatmap:'Exportar mapa de calor',
        journal:'Diario', journal_title:'Diario',
        journal_page_subtitle:'Escribe libremente \u2014 esto es solo para ti.',
        journal_eyebrow:'Tus reflexiones',
        journal_one_per_day_sub:'Una entrada por día.',
        journal_unsaved:'Cambios sin guardar',
        save_journal:'Guardar diario',
        edit_journal_entry:'Editar entrada del diario',
        journal_saved_placeholder:'Tu entrada del diario de hoy ya ha sido guardada.',
        one_journal_per_day:'Solo se puede crear una entrada de diario por día.',
        add_photo:'\ud83d\udcf7 Añadir foto',
        page_mood_subtitle:'Tendencias en tu bienestar emocional.',
        page_sleep_subtitle:'Calidad y consistencia de tu descanso.',
        page_energy_subtitle:'Ritmo y resistencia a lo largo de los días.',
        page_velocity_h1:'Velocidad & Estabilidad del Ánimo',
        page_velocity_subtitle:'Ve cómo cambia tu ánimo día a día.',
        page_corr_subtitle:'Descubre relaciones entre tus métricas.',
        page_patterns_subtitle:'Patrones de sueño, actividad y ánimo.',
        page_seasonal_h1:'Análisis Estacional & Rítmico',
        page_seasonal_subtitle:'Descubre cómo tu ánimo varía estacionalmente.',
        page_forecast_subtitle:'Tendencias predictivas basadas en tus datos recientes.',
        insights_eyebrow:'Análisis personal',
        insights_overview:'Patrones de tus datos. Cuanto más registres, más precisos serán.',
        export_page_title:'Exportar & Copia de seguridad',
        export_page_subtitle:'Tus datos son tuyos. Descarga, respalda o importa cuando quieras.',
        download_eyebrow:'Descargar', export_data_title:'Exportar datos',
        export_data_desc:'Descarga las entradas en JSON o CSV.',
        from_label:'Desde', to_label:'Hasta', tags_optional:'Etiquetas (opcional)',
        report_week:'Semana', report_month:'Mes', report_year:'Año',
        report_export_pdf:'Exportar informe como PDF',
        report_best_day:'Mejor día', report_challenging:'Día difícil (menor ánimo)',
        settings:'Ajustes',
        s_appearance:'Apariencia', s_appearance_desc:'Tema y preferencias de visualización.',
        s_theme:'Tema', s_dark_mode:'Modo oscuro',
        s_sound:'Sonido de éxito', s_particles:'Partículas ambientales', s_parallax:'Desplazamiento parallax',
        s_preferences:'Preferencias', s_preferences_desc:'Opciones predeterminadas y de visualización.',
        s_language:'Idioma', s_date_format:'Formato de fecha', s_time_format:'Formato de hora',
        s_chart_days:'Días predeterminados del gráfico', s_reduce_motion:'Reducir movimiento',
        s_notifications:'Activar notificaciones (navegador)',
        s_dashboard_widgets:'Widgets del panel',
        s_show_mood:'Mostrar gráfico de ánimo', s_show_sleep:'Mostrar gráfico de sueño', s_show_energy:'Mostrar gráfico de energía',
        s_custom_metrics:'Métricas personalizadas',
        s_custom_metrics_desc:'Añade tus propias métricas (p. ej. ansiedad, dolor, productividad).',
        s_privacy:'Datos y Privacidad',
        s_privacy_desc:'Todos los datos se almacenan localmente en tu dispositivo.',
        s_delete_all:'Eliminar todos mis datos',
        s_favourite_tags:'Etiquetas favoritas', s_default_activities:'Actividades predeterminadas',
        modal_full_edit:'\u270f\ufe0f Editar completo', modal_journal_btn:'\ud83d\udcd3 Diario',
        modal_close:'Cerrar', modal_cancel:'Cancelar', modal_delete:'Eliminar', modal_confirm:'Confirmar',
        delete_entry:'Eliminar entrada', delete_entry_q:'¿Eliminar entrada?',
        cannot_undo:'Esta acción no se puede deshacer.',
        full_delete_day:'¿Eliminar todo el día?',
        full_delete_desc:'El ánimo, energía, sueño, actividades y diario se eliminarán permanentemente.',
        full_delete_btn:'Eliminar entrada', are_you_sure:'¿Estás seguro?',
        enter_passcode:'Introduce el código para confirmar',
        type_delete_label:'Escribe ELIMINAR para confirmar',
        delete_all_title:'Eliminar todos mis datos',
        delete_all_desc:'Elimina permanentemente todas las entradas, diario, copias de seguridad y ajustes.',
        delete_all_confirm:'Eliminar todo',
        no_entry_day:'No hay entrada para este día.',
        click_edit_checkin:'Haz clic en Editar para añadir.',
        delete_entire_entry:'\ud83d\uddd1 Eliminar la entrada completa',
        pwa_install_text:'Instala Aura para acceso rápido y uso sin conexión.',
        pwa_not_now:'Ahora no', pwa_install_btn:'Instalar',
        pwa_update_text:'Hay una nueva versión disponible.', pwa_reload:'Recargar',
        chart_avg_mood_month:'Estado de ánimo medio por mes',
        chart_mood_axis:'Variación del ánimo (día a día)',
        chart_mood_axis_short:'Variación',
        chart_mood_improved:'Ánimo mejorado {n} punto{s}',
        chart_mood_dipped:'Ánimo bajó {n} punto{s}',
        chart_mood_1_10:'Ánimo (1\u201310)',
        chip_latest:'Reciente: {delta} vs med.',
        chip_range:'Rango {min}\u2013{max}',
        insights_what_data_shows:'Lo que muestran tus datos',
        insight_sleep_heading:'Sueño', insight_activity_heading:'Actividad',
        insight_stability_heading:'Estabilidad emocional', insight_tags_heading:'Etiquetas',
        toast_lang:'Idioma actualizado \u2713', toast_date_fmt:'Formato de fecha actualizado \u2713',
        toast_time_fmt:'Formato de hora actualizado \u2713', toast_saved:'Guardado \u2713',
        dow_need_more_data:'Añade al menos 2 semanas de entradas para ver tus patrones semanales.',
        dow_peak_dip:'Tu ánimo tiende a alcanzar su punto álgido el {day1} y a caer el {day2}.',
        dow_no_data_label:'Sin datos', dow_average_label:'promedio', dow_dataset_label:'Ánimo promedio',
    };

    /* ──────────────────────────── ARABIC ──────────────────────────── */
    S.ar = {
        /* Navigation */
        nav_tracking:'التتبع', nav_analytics_label:'التحليلات',
        nav_explore:'استكشاف', nav_data_label:'البيانات',
        nav_overview:'نظرة عامة', nav_checkin:'الفحص اليومي', nav_checkin_short:'تسجيل',
        nav_calendar:'التقويم', nav_journal:'اليوميات', nav_mood_trends:'اتجاهات المزاج',
        nav_sleep:'تحليل النوم', nav_energy:'أنماط الطاقة', nav_insights:'الرؤى',
        nav_correlations:'الارتباطات', nav_velocity:'سرعة المزاج', nav_forecast:'التوقعات',
        nav_patterns:'أنماطي', nav_seasonal:'الإيقاع الموسمي', nav_reports:'التقارير',
        nav_export:'تصدير ونسخ احتياطي', nav_menu:'القائمة', nav_seasonal_short:'موسمي',

        /* Dashboard */
        dash_welcome_title:'مرحباً بك في Aura Mood',
        dash_welcome_subtitle:'تتبع مزاجك ونومك وطاقتك كل يوم. تظهر الأنماط بعد أسبوع. وتتحسّن الرؤى بعد شهر.',
        dash_start_checkin:'ابدأ فحص اليوم ←',
        dash_sample_data:'استكشاف ببيانات نموذجية',
        dash_feat_mood:'اتجاهات المزاج والتوقعات',
        dash_feat_sleep:'تحليل أنماط النوم',
        dash_feat_insights:'رؤى مخصصة',
        dash_go_deeper:'الغوص في العمق',
        dash_analytics_hint:'استكشف الأنماط والارتباطات والتوقعات من بياناتك.',
        tile_insights_desc:'الأنماط من بياناتك',
        tile_corr_desc:'روابط النوم والمزاج والطاقة',
        tile_forecast_desc:'إلى أين يتجه مزاجك',
        tile_patterns_desc:'الجدول الزمني وإيقاعات النوم',
        tile_seasonal_desc:'الإيقاع الشهري والسنوي',
        tile_velocity_desc:'التغيير من يوم لآخر',

        /* Dashboard narrative */
        good_morning:'صباح الخير', good_afternoon:'مساء الخير', good_evening:'مساء النور',
        narrative_start:'ابدأ بتسجيل أول يوم لترى الأنماط تظهر هنا.',
        narrative_trend_up:'تحسّن مزاجك هذا الأسبوع.',
        narrative_trend_down:'انخفض مزاجك قليلاً هذا الأسبوع.',
        narrative_steady:'كان مزاجك مستقراً هذا الأسبوع.',
        narrative_logged_mood:'سجّلت اليوم مزاجاً {moodLabel} بمعدل {n}.',
        narrative_strong_mood:'قوياً', narrative_moderate_mood:'معتدلاً', narrative_low_mood:'منخفضاً',
        no_checkin_today:'لا يوجد تسجيل لهذا اليوم بعد.',
        tagging_recently:'لقد كنت تستخدم وسم \u201c{tag}\u201d كثيراً مؤخراً.',
        streak_days:'{n} أيام متتالية \u2014 استمر!',
        streak_day:'اليوم {n} من سلسلتك.',

        /* Daily Check-In */
        daily_checkin:'الفحص اليومي',
        checkin_subtitle:'سجّل مزاجك ونومك وطاقتك.',
        checkin_desc:'إدخال واحد في اليوم \u2014 مختصر أو مفصّل، الاختيار لك.',
        fill_sections:'أكمل الأقسام أدناه',
        checkin_progress_label:'أكمل الأقسام أدناه',
        date_heading:'التاريخ', checkin_date_heading:'التاريخ', checkin_date:'التاريخ',
        checkin_mood_energy_heading:'المزاج والطاقة',
        checkin_sleep_heading:'النوم',
        checkin_activities_tags_heading:'الأنشطة والوسوم',
        activities_tags_heading:'الأنشطة والوسوم',
        checkin_mood:'المزاج', checkin_energy:'مستوى الطاقة',
        checkin_sleep_duration:'مدة النوم', checkin_sleep_quality:'جودة النوم',
        checkin_sleep_time:'وقت النوم الرئيسي', checkin_wake_time:'وقت الاستيقاظ الرئيسي',
        checkin_sleep_segments:'أجزاء النوم',
        checkin_activities:'الأنشطة', checkin_tags:'الوسوم', checkin_photos:'الصور',
        activities_label:'الأنشطة', tags_label:'الوسوم',
        checkin_suggested_tags:'وسوم مقترحة', checkin_tap_to_add:'اضغط للإضافة',
        checkin_daily_reflection:'التأمل اليومي',
        checkin_reflection_desc:'سجّل كيف كان يومك، وما الذي أهمّك، وما الذي لاحظته.',
        checkin_saved_reflection:'تأمل محفوظ',
        checkin_open_journal:'فتح اليوميات الكاملة',
        checkin_sleep_hint:'استخدم الأجزاء لتتبع النوم المتقطع أو متعدد الأطوار.',
        checkin_sleep_segments_intro:'سجّل النوم المتقسّم في أجزاء منفصلة.',
        checkin_add_segment:'+ إضافة جزء نوم',
        checkin_save_hint:'\u2318S للحفظ',
        checkin_no_summary:'لا توجد بيانات كافية لإنشاء ملخص بعد.',
        undo:'تراجع', redo:'إعادة',
        save_entry:'حفظ الإدخال',
        daily_summary:'ملخص اليوم',
        low_mood:'مزاج منخفض', neutral:'محايد', good_mood:'مزاج جيد', today:'اليوم',

        /* Calendar */
        calendar_title:'التقويم',
        calendar_subtitle:'استعرض سجل مزاجك عبر الأيام والأسابيع والأشهر.',
        calendar_year_heatmap:'خريطة حرارة سنوية', cal_year_heatmap:'خريطة حرارة سنوية',
        calendar_month_grid:'شبكة شهرية', cal_month_grid:'شبكة شهرية',
        calendar_week_timeline:'جدول زمني أسبوعي', cal_week_timeline:'جدول زمني أسبوعي',
        calendar_list_view:'قائمة', cal_list:'قائمة',
        year_in_mood_title:'عام المزاج', cal_year_in_mood:'عام المزاج',
        cal_year_subtitle:'تتبع اتساق مزاجك خلال العام الماضي',
        export_heatmap:'تصدير خريطة الحرارة',

        /* Journal */
        journal:'اليوميات', journal_title:'اليوميات',
        journal_page_subtitle:'اكتب بحرية \u2014 هذا لك وحدك.',
        journal_eyebrow:'تأملاتك',
        journal_one_per_day_sub:'إدخال واحد في اليوم.',
        journal_unsaved:'تغييرات غير محفوظة',
        save_journal:'حفظ اليوميات',
        edit_journal_entry:'تعديل إدخال اليوميات',
        journal_saved_placeholder:'تم حفظ إدخال يومياتك لهذا اليوم بالفعل.',
        one_journal_per_day:'إدخال يوميات واحد فقط في اليوم.',
        add_photo:'\ud83d\udcf7 إضافة صورة',

        /* Analytics pages */
        page_mood_subtitle:'الأنماط والاتجاهات في رفاهيتك العاطفية.',
        page_sleep_subtitle:'جودة واتساق نومك.',
        page_energy_subtitle:'الإيقاع والقدرة على التحمل عبر الأيام.',
        page_velocity_h1:'سرعة المزاج والاستقرار',
        page_velocity_subtitle:'راقب كيف يتغير مزاجك من يوم لآخر.',
        page_corr_subtitle:'اكتشف العلاقات بين مقاييسك المتتبعة.',
        page_patterns_subtitle:'أنماط النوم والنشاط والمزاج.',
        page_seasonal_h1:'التحليل الموسمي والإيقاعي',
        page_seasonal_subtitle:'اكتشف كيف يتغير مزاجك ونومك وطاقتك موسمياً.',
        page_forecast_subtitle:'الاتجاهات التنبؤية بناءً على بياناتك الأخيرة.',
        insights_eyebrow:'التحليلات الشخصية',
        insights_overview:'الأنماط من بياناتك. كلما سجّلت أكثر، كلما أصبحت أوضح.',

        /* Export */
        export_page_title:'تصدير ونسخ احتياطي',
        export_page_subtitle:'بياناتك ملك لك. نزّل أو انسخ احتياطياً أو استورد في أي وقت.',
        download_eyebrow:'تنزيل',
        export_data_title:'تصدير البيانات',
        export_data_desc:'نزّل الإدخالات بصيغة JSON أو CSV. يمكنك التصفية اختيارياً حسب التاريخ أو الوسوم.',
        from_label:'من', to_label:'إلى', tags_optional:'الوسوم (اختياري)',

        /* Reports */
        report_week:'أسبوع', report_month:'شهر', report_year:'سنة',
        report_export_pdf:'تصدير التقرير كـ PDF',
        report_best_day:'أفضل يوم', report_challenging:'يوم صعب (أدنى مزاج)',

        /* Settings */
        settings:'الإعدادات',
        s_appearance:'المظهر', s_appearance_desc:'السمة وتفضيلات العرض.',
        s_theme:'السمة', s_dark_mode:'الوضع المظلم',
        s_sound:'صوت النجاح', s_particles:'الجسيمات المحيطة', s_parallax:'التمرير المتوازي',
        s_preferences:'التفضيلات', s_preferences_desc:'الخيارات الافتراضية وخيارات العرض.',
        s_language:'اللغة', s_date_format:'تنسيق التاريخ', s_time_format:'تنسيق الوقت',
        s_chart_days:'الأيام الافتراضية للمخطط', s_reduce_motion:'تقليل الحركة',
        s_notifications:'تفعيل الإشعارات (المتصفح)',
        s_dashboard_widgets:'أدوات لوحة التحكم',
        s_show_mood:'عرض مخطط المزاج', s_show_sleep:'عرض مخطط النوم', s_show_energy:'عرض مخطط الطاقة',
        s_custom_metrics:'مقاييس مخصصة',
        s_custom_metrics_desc:'أضف مقاييسك الخاصة (مثل القلق، الألم، الإنتاجية).',
        s_privacy:'البيانات والخصوصية',
        s_privacy_desc:'يتم تخزين جميع البيانات محلياً على جهازك.',
        s_delete_all:'حذف جميع بياناتي',
        s_favourite_tags:'الوسوم المفضلة', s_default_activities:'الأنشطة الافتراضية',

        /* Modals */
        modal_full_edit:'\u270f\ufe0f تعديل كامل',
        modal_journal_btn:'\ud83d\udcd3 اليوميات',
        modal_close:'إغلاق', modal_cancel:'إلغاء',
        modal_delete:'حذف', modal_confirm:'تأكيد',
        delete_entry:'حذف الإدخال',
        delete_entry_q:'حذف الإدخال؟',
        cannot_undo:'لا يمكن التراجع عن هذا الإجراء.',
        full_delete_day:'حذف هذا اليوم بالكامل؟',
        full_delete_desc:'سيتم حذف المزاج والطاقة والنوم والأنشطة واليوميات نهائياً.',
        full_delete_btn:'حذف الإدخال',
        are_you_sure:'هل أنت متأكد؟',
        enter_passcode:'أدخل رمز المرور للتأكيد',
        type_delete_label:'اكتب DELETE للتأكيد',
        delete_all_title:'حذف جميع بياناتي',
        delete_all_desc:'يحذف هذا نهائياً جميع الإدخالات واليوميات والنسخ الاحتياطية والإعدادات.',
        delete_all_confirm:'حذف كل شيء',
        no_entry_day:'لا يوجد إدخال لهذا اليوم.',
        click_edit_checkin:'انقر على تعديل الفحص للإضافة.',
        delete_entire_entry:'\ud83d\uddd1 حذف الإدخال الكامل لهذا اليوم',

        /* PWA */
        pwa_install_text:'ثبّت Aura للوصول السريع والاستخدام دون اتصال.',
        pwa_not_now:'ليس الآن', pwa_install_btn:'تثبيت',
        pwa_update_text:'إصدار جديد متاح.', pwa_reload:'إعادة تحميل',

        /* Charts / insights */
        chart_avg_mood_month:'متوسط المزاج حسب الشهر',
        chart_mood_axis:'تغيّر المزاج (يوماً بيوم)',
        chart_mood_axis_short:'التغيّر',
        chart_mood_improved:'تحسّن المزاج بـ {n} نقطة',
        chart_mood_dipped:'انخفض المزاج بـ {n} نقطة',
        chart_mood_1_10:'المزاج (1\u201310)',
        chip_latest:'الأخير: {delta} مقابل المتوسط',
        chip_range:'النطاق {min}\u2013{max}',
        insights_what_data_shows:'ما تكشفه بياناتك',
        insight_sleep_heading:'رؤى النوم',
        insight_activity_heading:'رؤى النشاط',
        insight_stability_heading:'استقرار المزاج',
        insight_tags_heading:'رؤى الوسوم',

        /* Daily summary */
        ds_not_enough:'لا توجد بيانات كافية لإنشاء ملخص بعد.',
        ds_journal_only:'سجّلت إدخال يوميات اليوم. لا بيانات مزاج.',
        ds_photos_only:'حفظت صوراً لهذا اليوم بدون بيانات مزاج.',
        ds_mood_only:'تم تسجيل المزاج فقط اليوم.',
        ds_mood_high:'كان مزاجك أعلى قليلاً من متوسطك الأخير.',
        ds_mood_low:'كان مزاجك أدنى قليلاً من متوسطك الأخير.',
        ds_mood_steady:'كان مزاجك ضمن نطاقك المعتاد.',
        ds_mood_first:'أول تسجيل \u2014 بداية رائعة!',
        ds_sleep_high:'مدة النوم أعلى قليلاً من نطاقك المعتاد.',
        ds_sleep_low:'مدة النوم أقل قليلاً من نطاقك المعتاد.',
        ds_sleep_steady:'مدة النوم ضمن نطاقك المعتاد.',
        ds_sleep_recorded:'تم تسجيل النوم لهذا اليوم.',
        ds_sleep_segmented:'، وانقسم إلى عدة فترات.',
        ds_energy_and:'، وطاقة {energy}.',
        ds_energy_only:'تم تسجيل الطاقة اليوم بدون إدخال مزاج.',
        ds_activities_tags:'الأنشطة: \u201c{activities}\u201d والوسوم: \u201c{tags}\u201d.',
        ds_activities_only:'الأنشطة: \u201c{activities}\u201d.',
        ds_tags_only:'الوسوم: \u201c{tags}\u201d.',
        ds_journal_saved:'تم حفظ ملاحظة يومية.',
        ds_mood:'المزاج: {v}/10', ds_sleep:'النوم: {v} ساعة', ds_energy:'الطاقة: {v}/10',
        ds_above_avg:'أعلى قليلاً من نطاقك المعتاد.',
        ds_below_avg:'أدنى قليلاً من نطاقك المعتاد.',
        ds_on_avg:'ضمن نطاقك المعتاد.',
        ds_first:'أول تسجيل \u2014 بداية رائعة!',
        ds_tags:'الوسوم: {list}.', ds_activities:'الأنشطة: {list}.',
        ds_journal:'تم حفظ ملاحظة يومية.',
        ds_multi_sleep:'انقسم النوم إلى عدة فترات.',

        /* Day-of-week chart */
        dow_need_more_data:'أضف ما لا يقل عن أسبوعين من الإدخالات لرؤية أنماطك الأسبوعية.',
        dow_peak_dip:'يميل مزاجك للذروة يوم {day1} والانخفاض يوم {day2}.',
        dow_no_data_label:'لا بيانات', dow_average_label:'المتوسط', dow_dataset_label:'متوسط المزاج',

        /* Toasts */
        toast_lang:'تم تحديث اللغة \u2713',
        toast_date_fmt:'تم تحديث تنسيق التاريخ \u2713',
        toast_time_fmt:'تم تحديث تنسيق الوقت \u2713',
        toast_saved:'تم الحفظ \u2713',
    };

    /* ─── Other locales: abbreviated but complete for nav/settings/modals ─── */
    /* Italian, Portuguese, Dutch, Polish, Russian, Turkish, Japanese, Chinese, Hindi */
    /* Each auto-fills missing keys from English — zero blank text guaranteed     */

    S.it = { nav_tracking:'Tracciamento', nav_analytics_label:'Analitica', nav_explore:'Esplora', nav_data_label:'Dati', nav_overview:'Panoramica', nav_checkin:'Check-in giornaliero', nav_checkin_short:'Check-in', nav_calendar:'Calendario', nav_journal:'Diario', nav_mood_trends:'Tendenze umore', nav_sleep:'Analisi sonno', nav_energy:'Livelli energia', nav_insights:'Approfondimenti', nav_correlations:'Correlazioni', nav_velocity:'Velocità umore', nav_forecast:'Previsioni', nav_patterns:'I miei pattern', nav_seasonal:'Ritmo stagionale', nav_reports:'Rapporti', nav_export:'Esporta & Backup', nav_menu:'Menu', nav_seasonal_short:'Stagionale', good_morning:'Buongiorno', good_afternoon:'Buon pomeriggio', good_evening:'Buonasera', narrative_start:'Inizia a registrare il tuo primo check-in.', narrative_trend_up:'Il tuo umore è migliorato questa settimana.', narrative_trend_down:'Il tuo umore è leggermente calato questa settimana.', narrative_steady:'Il tuo umore è stato stabile questa settimana.', no_checkin_today:'Nessun check-in ancora oggi.', streak_days:'{n} giorni di fila \u2014 continua!', streak_day:'Giorno {n} della tua serie.', daily_checkin:'Check-in giornaliero', checkin_subtitle:'Registra umore, sonno ed energia.', save_entry:'Salva voce', daily_summary:'Riepilogo quotidiano', low_mood:'Umore basso', neutral:'Neutro', good_mood:'Buon umore', today:'Oggi', calendar_title:'Calendario', calendar_subtitle:'Esplora la storia dell\'umore.', calendar_year_heatmap:'Mappa di calore annuale', cal_year_heatmap:'Mappa di calore annuale', calendar_month_grid:'Griglia mensile', cal_month_grid:'Griglia mensile', calendar_week_timeline:'Cronologia settimanale', cal_week_timeline:'Cronologia settimanale', calendar_list_view:'Lista', cal_list:'Lista', year_in_mood_title:'Anno in umore', cal_year_in_mood:'Anno in umore', export_heatmap:'Esporta heatmap', journal:'Diario', journal_title:'Diario', journal_page_subtitle:'Scrivi liberamente \u2014 è solo per te.', journal_eyebrow:'Le tue riflessioni', journal_one_per_day_sub:'Una voce al giorno.', journal_unsaved:'Modifiche non salvate', save_journal:'Salva diario', edit_journal_entry:'Modifica voce', journal_saved_placeholder:'La voce è già stata salvata.', one_journal_per_day:'Una sola voce per giorno.', add_photo:'\ud83d\udcf7 Aggiungi foto', page_mood_subtitle:'Tendenze del tuo benessere emotivo.', page_sleep_subtitle:'Qualità e costanza del tuo riposo.', page_energy_subtitle:'Ritmo e resistenza nel corso dei giorni.', page_velocity_h1:'Velocità & Stabilità dell\'Umore', page_velocity_subtitle:'Osserva come cambia il tuo umore giorno per giorno.', page_corr_subtitle:'Scopri le relazioni tra le tue metriche.', page_patterns_subtitle:'Pattern di sonno, attività e umore.', page_seasonal_h1:'Analisi Stagionale & Ritmica', page_seasonal_subtitle:'Scopri come umore, sonno ed energia cambiano stagionalmente.', page_forecast_subtitle:'Tendenze predittive basate sui dati recenti.', insights_eyebrow:'Analisi personale', insights_overview:'Pattern dai tuoi dati.', export_page_title:'Esporta & Backup', export_page_subtitle:'I tuoi dati ti appartengono.', from_label:'Da', to_label:'A', tags_optional:'Tag (opzionale)', report_week:'Settimana', report_month:'Mese', report_year:'Anno', report_export_pdf:'Esporta report come PDF', report_best_day:'Giorno migliore', report_challenging:'Giorno difficile', settings:'Impostazioni', s_appearance:'Aspetto', s_appearance_desc:'Tema e preferenze di visualizzazione.', s_theme:'Tema', s_dark_mode:'Modalità scura', s_sound:'Suono di successo', s_particles:'Particelle ambientali', s_parallax:'Scorrimento parallasse', s_preferences:'Preferenze', s_preferences_desc:'Opzioni predefinite e di visualizzazione.', s_language:'Lingua', s_date_format:'Formato data', s_time_format:'Formato orario', s_chart_days:'Giorni grafico', s_reduce_motion:'Riduci animazioni', s_notifications:'Abilita notifiche (browser)', s_dashboard_widgets:'Widget dashboard', s_show_mood:'Mostra grafico umore', s_show_sleep:'Mostra grafico sonno', s_show_energy:'Mostra grafico energia', s_custom_metrics:'Metriche personalizzate', s_custom_metrics_desc:'Aggiungi le tue metriche (es. ansia, dolore, produttività).', s_privacy:'Dati & Privacy', s_privacy_desc:'Tutti i dati sono archiviati localmente sul dispositivo.', s_delete_all:'Elimina tutti i miei dati', s_favourite_tags:'Tag preferiti', s_default_activities:'Attività predefinite', modal_full_edit:'\u270f\ufe0f Modifica completa', modal_journal_btn:'\ud83d\udcd3 Diario', modal_close:'Chiudi', modal_cancel:'Annulla', modal_delete:'Elimina', modal_confirm:'Conferma', delete_entry:'Elimina voce', delete_entry_q:'Eliminare la voce?', cannot_undo:'Questa azione non può essere annullata.', full_delete_day:'Eliminare l\'intera giornata?', full_delete_desc:'Umore, energia, sonno, attività e diario verranno eliminati definitivamente.', full_delete_btn:'Elimina voce', are_you_sure:'Sei sicuro?', enter_passcode:'Inserisci il codice per confermare', type_delete_label:'Digita ELIMINA per confermare', delete_all_title:'Elimina tutti i miei dati', delete_all_desc:'Elimina definitivamente tutte le voci.', delete_all_confirm:'Elimina tutto', no_entry_day:'Nessuna voce per questo giorno.', click_edit_checkin:'Clicca su Modifica per aggiungere.', delete_entire_entry:'\ud83d\uddd1 Elimina voce completa', pwa_install_text:'Installa Aura per accesso rapido e offline.', pwa_not_now:'Non ora', pwa_install_btn:'Installa', pwa_update_text:'Una nuova versione è disponibile.', pwa_reload:'Ricarica', chart_avg_mood_month:'Umore medio per mese', chart_mood_axis:'Variazione umore', chart_mood_axis_short:'Var.', chart_mood_improved:'Umore migliorato di {n} punto{s}', chart_mood_dipped:'Umore calato di {n} punto{s}', chart_mood_1_10:'Umore (1\u201310)', chip_latest:'Recente: {delta} vs media', chip_range:'Intervallo {min}\u2013{max}', insights_what_data_shows:'Cosa mostrano i tuoi dati', insight_sleep_heading:'Sonno', insight_activity_heading:'Attività', insight_stability_heading:'Stabilità emotiva', insight_tags_heading:'Tag', toast_lang:'Lingua aggiornata \u2713', toast_date_fmt:'Formato data aggiornato \u2713', toast_time_fmt:'Formato orario aggiornato \u2713', toast_saved:'Salvato \u2713', dow_need_more_data:'Aggiungi almeno 2 settimane per vedere i pattern settimanali.', dow_no_data_label:'Nessun dato', dow_average_label:'media', dow_dataset_label:'Umore medio' };

    S.pt = { nav_tracking:'Seguimento', nav_analytics_label:'Análise', nav_explore:'Explorar', nav_data_label:'Dados', nav_overview:'Visão geral', nav_checkin:'Check-in diário', nav_checkin_short:'Check-in', nav_calendar:'Calendário', nav_journal:'Diário', nav_mood_trends:'Tendências', nav_sleep:'Análise do sono', nav_energy:'Padrões de energia', nav_insights:'Insights', nav_correlations:'Correlações', nav_velocity:'Velocidade do humor', nav_forecast:'Previsão', nav_patterns:'Os meus padrões', nav_seasonal:'Ritmo sazonal', nav_reports:'Relatórios', nav_export:'Exportar & Backup', nav_menu:'Menu', nav_seasonal_short:'Sazonal', good_morning:'Bom dia', good_afternoon:'Boa tarde', good_evening:'Boa noite', narrative_start:'Comece a registar o seu primeiro check-in.', narrative_trend_up:'O seu humor melhorou esta semana.', narrative_trend_down:'O seu humor baixou um pouco esta semana.', narrative_steady:'O seu humor esteve estável esta semana.', no_checkin_today:'Ainda sem check-in hoje.', streak_days:'Série de {n} dias \u2014 continue!', streak_day:'Dia {n} da sua série.', daily_checkin:'Check-in diário', checkin_subtitle:'Registe o seu humor, sono e energia.', save_entry:'Guardar entrada', daily_summary:'Resumo diário', low_mood:'Humor baixo', neutral:'Neutro', good_mood:'Bom humor', today:'Hoje', calendar_title:'Calendário', calendar_subtitle:'Explore o historial de humor.', calendar_year_heatmap:'Heatmap anual', cal_year_heatmap:'Heatmap anual', calendar_month_grid:'Grelha mensal', cal_month_grid:'Grelha mensal', calendar_week_timeline:'Cronologia semanal', cal_week_timeline:'Cronologia semanal', calendar_list_view:'Lista', cal_list:'Lista', year_in_mood_title:'Ano em humor', cal_year_in_mood:'Ano em humor', export_heatmap:'Exportar heatmap', journal:'Diário', journal_title:'Diário', journal_page_subtitle:'Escreva livremente \u2014 é só para si.', journal_eyebrow:'As suas reflexões', journal_one_per_day_sub:'Uma entrada por dia.', journal_unsaved:'Alterações não guardadas', save_journal:'Guardar diário', edit_journal_entry:'Editar entrada', journal_saved_placeholder:'A entrada já foi guardada.', one_journal_per_day:'Apenas uma entrada por dia.', add_photo:'\ud83d\udcf7 Adicionar foto', page_mood_subtitle:'Tendências do bem-estar emocional.', page_sleep_subtitle:'Qualidade e consistência do descanso.', page_energy_subtitle:'Ritmo e resistência ao longo dos dias.', page_velocity_h1:'Velocidade & Estabilidade do Humor', page_velocity_subtitle:'Veja como o seu humor muda dia a dia.', page_corr_subtitle:'Descubra relações entre as suas métricas.', page_patterns_subtitle:'Padrões de sono, atividade e humor.', page_seasonal_h1:'Análise Sazonal & Rítmica', page_seasonal_subtitle:'Descubra como o humor varia sazonalmente.', page_forecast_subtitle:'Tendências preditivas com base nos dados recentes.', insights_eyebrow:'Análise pessoal', insights_overview:'Padrões dos seus dados.', export_page_title:'Exportar & Backup', export_page_subtitle:'Os seus dados pertencem-lhe.', from_label:'De', to_label:'Até', tags_optional:'Etiquetas (opcional)', report_week:'Semana', report_month:'Mês', report_year:'Ano', report_export_pdf:'Exportar relatório como PDF', report_best_day:'Melhor dia', report_challenging:'Dia difícil', settings:'Definições', s_appearance:'Aparência', s_appearance_desc:'Tema e preferências de exibição.', s_theme:'Tema', s_dark_mode:'Modo escuro', s_sound:'Som de sucesso', s_particles:'Partículas ambientais', s_parallax:'Rolagem parallax', s_preferences:'Preferências', s_preferences_desc:'Opções predefinidas.', s_language:'Idioma', s_date_format:'Formato de data', s_time_format:'Formato de hora', s_chart_days:'Dias do gráfico', s_reduce_motion:'Reduzir movimento', s_notifications:'Ativar notificações (navegador)', s_dashboard_widgets:'Widgets do painel', s_show_mood:'Mostrar gráfico de humor', s_show_sleep:'Mostrar gráfico de sono', s_show_energy:'Mostrar gráfico de energia', s_custom_metrics:'Métricas personalizadas', s_custom_metrics_desc:'Adicione as suas próprias métricas.', s_privacy:'Dados & Privacidade', s_privacy_desc:'Todos os dados estão armazenados localmente.', s_delete_all:'Eliminar todos os meus dados', s_favourite_tags:'Etiquetas favoritas', s_default_activities:'Atividades predefinidas', modal_full_edit:'\u270f\ufe0f Edição completa', modal_journal_btn:'\ud83d\udcd3 Diário', modal_close:'Fechar', modal_cancel:'Cancelar', modal_delete:'Eliminar', modal_confirm:'Confirmar', delete_entry:'Eliminar entrada', delete_entry_q:'Eliminar entrada?', cannot_undo:'Esta ação não pode ser desfeita.', full_delete_day:'Eliminar todo o dia?', full_delete_desc:'Humor, energia, sono, atividades e diário serão eliminados permanentemente.', full_delete_btn:'Eliminar entrada', are_you_sure:'Tem certeza?', enter_passcode:'Insira o código para confirmar', type_delete_label:'Digite EXCLUIR para confirmar', delete_all_title:'Eliminar todos os meus dados', delete_all_desc:'Elimina permanentemente todas as entradas.', delete_all_confirm:'Eliminar tudo', no_entry_day:'Sem entrada para este dia.', click_edit_checkin:'Clique em Editar para adicionar.', delete_entire_entry:'\ud83d\uddd1 Eliminar entrada completa', pwa_install_text:'Instale Aura para acesso rápido e offline.', pwa_not_now:'Agora não', pwa_install_btn:'Instalar', pwa_update_text:'Nova versão disponível.', pwa_reload:'Recarregar', chart_avg_mood_month:'Humor médio por mês', chart_mood_axis:'Variação de humor', chart_mood_axis_short:'Var.', chart_mood_improved:'Humor melhorou {n} ponto{s}', chart_mood_dipped:'Humor caiu {n} ponto{s}', chart_mood_1_10:'Humor (1\u201310)', chip_latest:'Recente: {delta} vs méd.', chip_range:'Intervalo {min}\u2013{max}', insights_what_data_shows:'O que os seus dados mostram', insight_sleep_heading:'Sono', insight_activity_heading:'Atividade', insight_stability_heading:'Estabilidade emocional', insight_tags_heading:'Etiquetas', toast_lang:'Idioma atualizado \u2713', toast_date_fmt:'Formato de data atualizado \u2713', toast_time_fmt:'Formato de hora atualizado \u2713', toast_saved:'Guardado \u2713', dow_need_more_data:'Adicione pelo menos 2 semanas de entradas.', dow_no_data_label:'Sem dados', dow_average_label:'média', dow_dataset_label:'Humor médio' };

    S.nl = { nav_tracking:'Bijhouden', nav_analytics_label:'Analyses', nav_explore:'Verkennen', nav_data_label:'Gegevens', nav_overview:'Overzicht', nav_checkin:'Dagelijkse check-in', nav_checkin_short:'Check-in', nav_calendar:'Kalender', nav_journal:'Dagboek', nav_mood_trends:'Stemmingstrends', nav_sleep:'Slaapanalyse', nav_energy:'Energiepatronen', nav_insights:'Inzichten', nav_correlations:'Correlaties', nav_velocity:'Stemmingssnelheid', nav_forecast:'Prognose', nav_patterns:'Mijn patronen', nav_seasonal:'Seizoensritme', nav_reports:'Rapporten', nav_export:'Exporteren & Backup', nav_menu:'Menu', nav_seasonal_short:'Seizoen', good_morning:'Goedemorgen', good_afternoon:'Goedemiddag', good_evening:'Goedenavond', narrative_start:'Begin met loggen om patronen te zien.', narrative_trend_up:'Je stemming is deze week gestegen.', narrative_trend_down:'Je stemming is deze week iets gedaald.', narrative_steady:'Je stemming was deze week stabiel.', no_checkin_today:'Nog geen check-in vandaag.', streak_days:'{n}-daagse reeks \u2014 ga door!', streak_day:'Dag {n} van je reeks.', daily_checkin:'Dagelijkse check-in', checkin_subtitle:'Registreer je stemming, slaap en energie.', save_entry:'Invoer opslaan', daily_summary:'Dagelijks overzicht', low_mood:'Lage stemming', neutral:'Neutraal', good_mood:'Goede stemming', today:'Vandaag', calendar_title:'Kalender', calendar_subtitle:'Bekijk je stemmingsgeschiedenis.', calendar_year_heatmap:'Jaarlijkse heatmap', cal_year_heatmap:'Jaarlijkse heatmap', calendar_month_grid:'Maandgrid', cal_month_grid:'Maandgrid', calendar_week_timeline:'Weekchronologie', cal_week_timeline:'Weekchronologie', calendar_list_view:'Lijst', cal_list:'Lijst', year_in_mood_title:'Jaar in stemming', cal_year_in_mood:'Jaar in stemming', export_heatmap:'Heatmap exporteren', journal:'Dagboek', journal_title:'Dagboek', journal_page_subtitle:'Schrijf vrij \u2014 dit is alleen voor jou.', journal_eyebrow:'Jouw reflecties', journal_one_per_day_sub:'Één invoer per dag.', journal_unsaved:'Niet-opgeslagen wijzigingen', save_journal:'Dagboek opslaan', edit_journal_entry:'Dagboek bewerken', journal_saved_placeholder:'De dagboekvermelding is al opgeslagen.', one_journal_per_day:'Eén dagboekvermelding per dag.', add_photo:'\ud83d\udcf7 Foto toevoegen', page_mood_subtitle:'Patronen in jouw emotioneel welzijn.', page_sleep_subtitle:'Kwaliteit en consistentie van jouw rust.', page_energy_subtitle:'Ritme en uithoudingsvermogen door de dagen.', page_velocity_h1:'Stemmingssnelheid & Stabiliteit', page_velocity_subtitle:'Zie hoe jouw stemming dag tot dag verandert.', page_corr_subtitle:'Ontdek verbanden tussen jouw statistieken.', page_patterns_subtitle:'Slaap-, activiteits- en stemmingspatronen.', page_seasonal_h1:'Seizoens- & Ritmeanalyse', page_seasonal_subtitle:'Ontdek hoe stemming en slaap per seizoen variëren.', page_forecast_subtitle:'Voorspellende trends op basis van recente gegevens.', insights_eyebrow:'Persoonlijke analyse', insights_overview:'Patronen uit jouw data.', export_page_title:'Exporteren & Backup', export_page_subtitle:'Jouw gegevens zijn van jou.', from_label:'Van', to_label:'Tot', tags_optional:'Labels (optioneel)', report_week:'Week', report_month:'Maand', report_year:'Jaar', report_export_pdf:'Rapport exporteren als PDF', report_best_day:'Beste dag', report_challenging:'Moeilijke dag', settings:'Instellingen', s_appearance:'Weergave', s_appearance_desc:'Thema en weergavevoorkeuren.', s_theme:'Thema', s_dark_mode:'Donkere modus', s_sound:'Succesvol geluid', s_particles:'Omgevingsdeeltjes', s_parallax:'Parallax scrollen', s_preferences:'Voorkeuren', s_preferences_desc:'Standaard- en weergaveopties.', s_language:'Taal', s_date_format:'Datumnotatie', s_time_format:'Tijdnotatie', s_chart_days:'Standaard grafiekdagen', s_reduce_motion:'Beweging verminderen', s_notifications:'Meldingen inschakelen (browser)', s_dashboard_widgets:'Dashboard-widgets', s_show_mood:'Stemmingsgrafiek weergeven', s_show_sleep:'Slaapgrafiek weergeven', s_show_energy:'Energiegrafiek weergeven', s_custom_metrics:'Aangepaste statistieken', s_custom_metrics_desc:'Voeg je eigen statistieken toe.', s_privacy:'Gegevens & Privacy', s_privacy_desc:'Alle gegevens worden lokaal opgeslagen.', s_delete_all:'Alle gegevens verwijderen', s_favourite_tags:'Favoriete labels', s_default_activities:'Standaardactiviteiten', modal_full_edit:'\u270f\ufe0f Volledig bewerken', modal_journal_btn:'\ud83d\udcd3 Dagboek', modal_close:'Sluiten', modal_cancel:'Annuleren', modal_delete:'Verwijderen', modal_confirm:'Bevestigen', delete_entry:'Invoer verwijderen', delete_entry_q:'Invoer verwijderen?', cannot_undo:'Deze actie kan niet ongedaan worden gemaakt.', full_delete_day:'Hele dag verwijderen?', full_delete_desc:'Stemming, energie, slaap, activiteiten en dagboek worden permanent verwijderd.', full_delete_btn:'Invoer verwijderen', are_you_sure:'Weet je het zeker?', enter_passcode:'Voer code in om te bevestigen', type_delete_label:'Typ VERWIJDER om te bevestigen', delete_all_title:'Alle gegevens verwijderen', delete_all_desc:'Verwijdert permanent alle invoer, dagboek, back-ups en instellingen.', delete_all_confirm:'Alles verwijderen', no_entry_day:'Geen invoer voor deze dag.', click_edit_checkin:'Klik op Bewerken om toe te voegen.', delete_entire_entry:'\ud83d\uddd1 Volledige invoer verwijderen', pwa_install_text:'Installeer Aura voor snel toegang en offline gebruik.', pwa_not_now:'Niet nu', pwa_install_btn:'Installeren', pwa_update_text:'Nieuwe versie beschikbaar.', pwa_reload:'Herladen', chart_avg_mood_month:'Gemiddelde stemming per maand', chart_mood_axis:'Stemmingsverandering', chart_mood_axis_short:'Var.', chart_mood_improved:'Stemming verbeterd met {n} punt{s}', chart_mood_dipped:'Stemming gedaald met {n} punt{s}', chart_mood_1_10:'Stemming (1\u201310)', chip_latest:'Recent: {delta} vs gem.', chip_range:'Bereik {min}\u2013{max}', insights_what_data_shows:'Wat jouw data laat zien', insight_sleep_heading:'Slaap', insight_activity_heading:'Activiteit', insight_stability_heading:'Emotionele stabiliteit', insight_tags_heading:'Labels', toast_lang:'Taal bijgewerkt \u2713', toast_date_fmt:'Datumnotatie bijgewerkt \u2713', toast_time_fmt:'Tijdnotatie bijgewerkt \u2713', toast_saved:'Opgeslagen \u2713', dow_need_more_data:'Voeg minimaal 2 weken toe.', dow_no_data_label:'Geen data', dow_average_label:'gemiddelde', dow_dataset_label:'Gemiddelde stemming' };

    S.pl = { nav_tracking:'Śledzenie', nav_analytics_label:'Analityka', nav_explore:'Eksploruj', nav_data_label:'Dane', nav_overview:'Przegląd', nav_checkin:'Codzienny check-in', nav_checkin_short:'Check-in', nav_calendar:'Kalendarz', nav_journal:'Dziennik', nav_mood_trends:'Trendy nastroju', nav_sleep:'Analiza snu', nav_energy:'Wzorce energii', nav_insights:'Spostrzeżenia', nav_correlations:'Korelacje', nav_velocity:'Prędkość nastroju', nav_forecast:'Prognoza', nav_patterns:'Moje wzorce', nav_seasonal:'Rytm sezonowy', nav_reports:'Raporty', nav_export:'Eksport & Kopia', nav_menu:'Menu', nav_seasonal_short:'Sezonowy', good_morning:'Dzień dobry', good_afternoon:'Dobry wieczór', good_evening:'Dobry wieczór', narrative_start:'Zacznij rejestrować, aby zobaczyć wzorce.', narrative_trend_up:'Twój nastrój poprawiał się w tym tygodniu.', narrative_trend_down:'Twój nastrój trochę spadł w tym tygodniu.', narrative_steady:'Twój nastrój był stabilny w tym tygodniu.', no_checkin_today:'Brak check-inu dzisiaj.', streak_days:'{n}-dniowa seria \u2014 tak trzymaj!', streak_day:'Dzień {n} serii.', daily_checkin:'Codzienny check-in', checkin_subtitle:'Rejestruj nastrój, sen i energię.', save_entry:'Zapisz wpis', daily_summary:'Podsumowanie dnia', low_mood:'Zły nastrój', neutral:'Neutralny', good_mood:'Dobry nastrój', today:'Dziś', calendar_title:'Kalendarz', calendar_subtitle:'Przeglądaj historię nastroju.', calendar_year_heatmap:'Heatmapa roczna', cal_year_heatmap:'Heatmapa roczna', calendar_month_grid:'Siatka miesięczna', cal_month_grid:'Siatka miesięczna', calendar_week_timeline:'Oś tygodnia', cal_week_timeline:'Oś tygodnia', calendar_list_view:'Lista', cal_list:'Lista', year_in_mood_title:'Rok nastrojów', cal_year_in_mood:'Rok nastrojów', export_heatmap:'Eksportuj heatmapę', journal:'Dziennik', journal_title:'Dziennik', journal_page_subtitle:'Pisz swobodnie \u2014 to tylko dla ciebie.', journal_eyebrow:'Twoje refleksje', journal_one_per_day_sub:'Jeden wpis dziennie.', journal_unsaved:'Niezapisane zmiany', save_journal:'Zapisz dziennik', edit_journal_entry:'Edytuj wpis', journal_saved_placeholder:'Wpis w dzienniku jest już zapisany.', one_journal_per_day:'Jeden wpis w dzienniku na dzień.', add_photo:'\ud83d\udcf7 Dodaj zdjęcie', page_mood_subtitle:'Wzorce nastroju.', page_sleep_subtitle:'Jakość snu.', page_energy_subtitle:'Rytm energii.', page_velocity_h1:'Prędkość i stabilność nastroju', page_velocity_subtitle:'Obserwuj zmiany nastroju.', page_corr_subtitle:'Odkryj zależności między metrykami.', page_patterns_subtitle:'Wzorce snu, aktywności i nastroju.', page_seasonal_h1:'Analiza sezonowa', page_seasonal_subtitle:'Sezonowe zmiany nastroju.', page_forecast_subtitle:'Predykcyjne trendy.', insights_eyebrow:'Analityka osobista', insights_overview:'Wzorce z danych.', export_page_title:'Eksport & Kopia zapasowa', export_page_subtitle:'Twoje dane należą do Ciebie.', from_label:'Od', to_label:'Do', tags_optional:'Tagi (opcjonalne)', report_week:'Tydzień', report_month:'Miesiąc', report_year:'Rok', report_export_pdf:'Eksportuj raport jako PDF', report_best_day:'Najlepszy dzień', report_challenging:'Trudny dzień', settings:'Ustawienia', s_appearance:'Wygląd', s_appearance_desc:'Motyw i preferencje wyświetlania.', s_theme:'Motyw', s_dark_mode:'Tryb ciemny', s_sound:'Dźwięk sukcesu', s_particles:'Cząsteczki otoczenia', s_parallax:'Przewijanie paralaksy', s_preferences:'Preferencje', s_preferences_desc:'Opcje domyślne.', s_language:'Język', s_date_format:'Format daty', s_time_format:'Format czasu', s_chart_days:'Domyślne dni wykresu', s_reduce_motion:'Zmniejsz animacje', s_notifications:'Włącz powiadomienia (przeglądarka)', s_dashboard_widgets:'Widżety pulpitu', s_show_mood:'Pokaż wykres nastroju', s_show_sleep:'Pokaż wykres snu', s_show_energy:'Pokaż wykres energii', s_custom_metrics:'Własne metryki', s_custom_metrics_desc:'Dodaj własne metryki.', s_privacy:'Dane & Prywatność', s_privacy_desc:'Wszystkie dane są przechowywane lokalnie.', s_delete_all:'Usuń wszystkie moje dane', s_favourite_tags:'Ulubione tagi', s_default_activities:'Domyślne aktywności', modal_full_edit:'\u270f\ufe0f Pełna edycja', modal_journal_btn:'\ud83d\udcd3 Dziennik', modal_close:'Zamknij', modal_cancel:'Anuluj', modal_delete:'Usuń', modal_confirm:'Potwierdź', delete_entry:'Usuń wpis', delete_entry_q:'Usunąć wpis?', cannot_undo:'Tej czynności nie można cofnąć.', full_delete_day:'Usunąć cały dzień?', full_delete_desc:'Nastrój, energia, sen, aktywności i dziennik zostaną trwale usunięte.', full_delete_btn:'Usuń wpis', are_you_sure:'Jesteś pewny?', enter_passcode:'Wpisz kod, aby potwierdzić', type_delete_label:'Wpisz USUŃ, aby potwierdzić', delete_all_title:'Usuń wszystkie moje dane', delete_all_desc:'Trwale usuwa wszystkie wpisy.', delete_all_confirm:'Usuń wszystko', no_entry_day:'Brak wpisu na ten dzień.', click_edit_checkin:'Kliknij Edytuj, aby dodać.', delete_entire_entry:'\ud83d\uddd1 Usuń cały wpis', pwa_install_text:'Zainstaluj Aura.', pwa_not_now:'Nie teraz', pwa_install_btn:'Zainstaluj', pwa_update_text:'Nowa wersja dostępna.', pwa_reload:'Odśwież', chart_avg_mood_month:'Średni nastrój według miesiąca', chart_mood_axis:'Zmiana nastroju', chart_mood_axis_short:'Zmiana', chart_mood_improved:'Nastrój poprawił się o {n} punkt{s}', chart_mood_dipped:'Nastrój spadł o {n} punkt{s}', chart_mood_1_10:'Nastrój (1\u201310)', chip_latest:'Ostatni: {delta} vs śr.', chip_range:'Zakres {min}\u2013{max}', insights_what_data_shows:'Co pokazują Twoje dane', insight_sleep_heading:'Sen', insight_activity_heading:'Aktywność', insight_stability_heading:'Stabilność nastroju', insight_tags_heading:'Tagi', toast_lang:'Język zaktualizowany \u2713', toast_date_fmt:'Format daty zaktualizowany \u2713', toast_time_fmt:'Format czasu zaktualizowany \u2713', toast_saved:'Zapisano \u2713', dow_need_more_data:'Dodaj co najmniej 2 tygodnie wpisów.', dow_no_data_label:'Brak danych', dow_average_label:'średnia', dow_dataset_label:'Średni nastrój' };

    S.ru = { nav_tracking:'Отслеживание', nav_analytics_label:'Аналитика', nav_explore:'Исследовать', nav_data_label:'Данные', nav_overview:'Обзор', nav_checkin:'Ежедневный чекин', nav_checkin_short:'Чекин', nav_calendar:'Календарь', nav_journal:'Дневник', nav_mood_trends:'Тренды настроения', nav_sleep:'Анализ сна', nav_energy:'Паттерны энергии', nav_insights:'Инсайты', nav_correlations:'Корреляции', nav_velocity:'Скорость настроения', nav_forecast:'Прогноз', nav_patterns:'Мои паттерны', nav_seasonal:'Сезонный ритм', nav_reports:'Отчёты', nav_export:'Экспорт & Резервная копия', nav_menu:'Меню', nav_seasonal_short:'Сезонный', good_morning:'Доброе утро', good_afternoon:'Добрый день', good_evening:'Добрый вечер', narrative_start:'Начните вести записи, чтобы увидеть паттерны.', narrative_trend_up:'Ваше настроение улучшалось на этой неделе.', narrative_trend_down:'Ваше настроение немного снизилось на этой неделе.', narrative_steady:'Ваше настроение было стабильным на этой неделе.', no_checkin_today:'Ещё нет чекина сегодня.', streak_days:'{n}-дневная серия \u2014 продолжайте!', streak_day:'День {n} вашей серии.', daily_checkin:'Ежедневный чекин', checkin_subtitle:'Запишите настроение, сон и энергию.', save_entry:'Сохранить запись', daily_summary:'Итог дня', low_mood:'Плохое настроение', neutral:'Нейтральный', good_mood:'Хорошее настроение', today:'Сегодня', calendar_title:'Календарь', calendar_subtitle:'История настроения по дням, неделям, месяцам.', calendar_year_heatmap:'Годовая тепловая карта', cal_year_heatmap:'Годовая тепловая карта', calendar_month_grid:'Месячная сетка', cal_month_grid:'Месячная сетка', calendar_week_timeline:'Недельная хронология', cal_week_timeline:'Недельная хронология', calendar_list_view:'Список', cal_list:'Список', year_in_mood_title:'Год в настроении', cal_year_in_mood:'Год в настроении', export_heatmap:'Экспорт тепловой карты', journal:'Дневник', journal_title:'Дневник', journal_page_subtitle:'Пишите свободно \u2014 это только для вас.', journal_eyebrow:'Ваши размышления', journal_one_per_day_sub:'Одна запись в день.', journal_unsaved:'Несохранённые изменения', save_journal:'Сохранить дневник', edit_journal_entry:'Редактировать запись дневника', journal_saved_placeholder:'Запись дневника на сегодня уже сохранена.', one_journal_per_day:'В день можно создать только одну запись дневника.', add_photo:'\ud83d\udcf7 Добавить фото', page_mood_subtitle:'Паттерны вашего эмоционального благополучия.', page_sleep_subtitle:'Качество и постоянство вашего отдыха.', page_energy_subtitle:'Ритм и выносливость в течение дней.', page_velocity_h1:'Скорость и Стабильность Настроения', page_velocity_subtitle:'Наблюдайте изменения настроения день за днём.', page_corr_subtitle:'Откройте связи между вашими метриками.', page_patterns_subtitle:'Паттерны сна, активности и настроения.', page_seasonal_h1:'Сезонный и Ритмический Анализ', page_seasonal_subtitle:'Узнайте, как меняется настроение по сезонам.', page_forecast_subtitle:'Прогнозные тренды на основе последних данных.', insights_eyebrow:'Персональная аналитика', insights_overview:'Паттерны из ваших данных.', export_page_title:'Экспорт & Резервная копия', export_page_subtitle:'Ваши данные принадлежат вам.', from_label:'С', to_label:'По', tags_optional:'Теги (необязательно)', report_week:'Неделя', report_month:'Месяц', report_year:'Год', report_export_pdf:'Экспортировать отчёт в PDF', report_best_day:'Лучший день', report_challenging:'Сложный день', settings:'Настройки', s_appearance:'Внешний вид', s_appearance_desc:'Тема и настройки отображения.', s_theme:'Тема', s_dark_mode:'Тёмный режим', s_sound:'Звук успеха', s_particles:'Частицы', s_parallax:'Параллакс', s_preferences:'Настройки', s_preferences_desc:'Параметры по умолчанию.', s_language:'Язык', s_date_format:'Формат даты', s_time_format:'Формат времени', s_chart_days:'Дней на графике', s_reduce_motion:'Уменьшить анимацию', s_notifications:'Включить уведомления (браузер)', s_dashboard_widgets:'Виджеты панели', s_show_mood:'Показать график настроения', s_show_sleep:'Показать график сна', s_show_energy:'Показать график энергии', s_custom_metrics:'Пользовательские метрики', s_custom_metrics_desc:'Добавьте собственные метрики.', s_privacy:'Данные и Конфиденциальность', s_privacy_desc:'Все данные хранятся локально на вашем устройстве.', s_delete_all:'Удалить все мои данные', s_favourite_tags:'Избранные теги', s_default_activities:'Активности по умолчанию', modal_full_edit:'\u270f\ufe0f Полное редактирование', modal_journal_btn:'\ud83d\udcd3 Дневник', modal_close:'Закрыть', modal_cancel:'Отмена', modal_delete:'Удалить', modal_confirm:'Подтвердить', delete_entry:'Удалить запись', delete_entry_q:'Удалить запись?', cannot_undo:'Это действие нельзя отменить.', full_delete_day:'Удалить весь день?', full_delete_desc:'Настроение, энергия, сон, активности и дневник будут удалены безвозвратно.', full_delete_btn:'Удалить запись', are_you_sure:'Вы уверены?', enter_passcode:'Введите код для подтверждения', type_delete_label:'Введите УДАЛИТЬ для подтверждения', delete_all_title:'Удалить все мои данные', delete_all_desc:'Безвозвратно удаляет все записи.', delete_all_confirm:'Удалить всё', no_entry_day:'Нет записи за этот день.', click_edit_checkin:'Нажмите Редактировать для добавления.', delete_entire_entry:'\ud83d\uddd1 Удалить всю запись', pwa_install_text:'Установите Aura.', pwa_not_now:'Не сейчас', pwa_install_btn:'Установить', pwa_update_text:'Доступна новая версия.', pwa_reload:'Перезагрузить', chart_avg_mood_month:'Среднее настроение по месяцам', chart_mood_axis:'Изменение настроения', chart_mood_axis_short:'Изм.', chart_mood_improved:'Настроение улучшилось на {n} балл{s}', chart_mood_dipped:'Настроение упало на {n} балл{s}', chart_mood_1_10:'Настроение (1\u201310)', chip_latest:'Последний: {delta} vs сред.', chip_range:'Диапазон {min}\u2013{max}', insights_what_data_shows:'Что показывают ваши данные', insight_sleep_heading:'Сон', insight_activity_heading:'Активность', insight_stability_heading:'Стабильность настроения', insight_tags_heading:'Теги', toast_lang:'Язык обновлён \u2713', toast_date_fmt:'Формат даты обновлён \u2713', toast_time_fmt:'Формат времени обновлён \u2713', toast_saved:'Сохранено \u2713', dow_need_more_data:'Добавьте не менее 2 недель записей.', dow_no_data_label:'Нет данных', dow_average_label:'среднее', dow_dataset_label:'Среднее настроение' };

    S.tr = { nav_tracking:'Takip', nav_analytics_label:'Analitik', nav_explore:'Keşfet', nav_data_label:'Veri', nav_overview:'Genel Bakış', nav_checkin:'Günlük kontrol', nav_checkin_short:'Kontrol', nav_calendar:'Takvim', nav_journal:'Günlük', nav_mood_trends:'Ruh hali trendleri', nav_sleep:'Uyku analizi', nav_energy:'Enerji desenleri', nav_insights:'Öngörüler', nav_correlations:'Korelasyonlar', nav_velocity:'Ruh hali hızı', nav_forecast:'Tahmin', nav_patterns:'Kalıplarım', nav_seasonal:'Mevsimsel ritim', nav_reports:'Raporlar', nav_export:'Dışa Aktar & Yedek', nav_menu:'Menü', nav_seasonal_short:'Mevsimsel', good_morning:'Günaydın', good_afternoon:'İyi öğleden sonralar', good_evening:'İyi akşamlar', narrative_start:'Desenleri görmek için ilk girişinizi yapın.', narrative_trend_up:'Bu hafta ruh haliniz yükseldi.', narrative_trend_down:'Bu hafta ruh haliniz biraz düştü.', narrative_steady:'Bu hafta ruh haliniz istikrarlıydı.', no_checkin_today:'Bugün henüz giriş yok.', streak_days:'{n} günlük seri \u2014 devam edin!', streak_day:'Serinizin {n}. günü.', daily_checkin:'Günlük kontrol', checkin_subtitle:'Ruh halinizi, uyku ve enerjinizi kaydedin.', save_entry:'Kaydı kaydet', daily_summary:'Günlük özet', low_mood:'Düşük ruh hali', neutral:'Nötr', good_mood:'İyi ruh hali', today:'Bugün', calendar_title:'Takvim', calendar_subtitle:'Ruh hali geçmişini keşfedin.', calendar_year_heatmap:'Yıllık ısı haritası', cal_year_heatmap:'Yıllık ısı haritası', calendar_month_grid:'Aylık ızgara', cal_month_grid:'Aylık ızgara', calendar_week_timeline:'Haftalık zaman çizelgesi', cal_week_timeline:'Haftalık zaman çizelgesi', calendar_list_view:'Liste', cal_list:'Liste', year_in_mood_title:'Yılın ruh hali', cal_year_in_mood:'Yılın ruh hali', export_heatmap:'Isı haritası dışa aktar', journal:'Günlük', journal_title:'Günlük', journal_page_subtitle:'Özgürce yaz \u2014 bu sadece senin için.', journal_eyebrow:'Yansımalarınız', journal_one_per_day_sub:'Günde bir giriş.', journal_unsaved:'Kaydedilmemiş değişiklikler', save_journal:'Günlüğü kaydet', edit_journal_entry:'Günlük girişini düzenle', journal_saved_placeholder:'Günlük girişiniz zaten kaydedildi.', one_journal_per_day:'Günde yalnızca bir günlük girişi.', add_photo:'\ud83d\udcf7 Fotoğraf ekle', page_mood_subtitle:'Duygusal sağlığınızdaki paternler.', page_sleep_subtitle:'Dinlenmenizin kalitesi.', page_energy_subtitle:'Enerji ritmi.', page_velocity_h1:'Ruh Hali Hızı & Stabilitesi', page_velocity_subtitle:'Ruh halinizin günden güne nasıl değiştiğini görün.', page_corr_subtitle:'Metrikleriniz arasındaki ilişkileri keşfedin.', page_patterns_subtitle:'Uyku, aktivite ve ruh hali kalıpları.', page_seasonal_h1:'Mevsimsel & Ritim Analizi', page_seasonal_subtitle:'Mevsimsel değişimleri keşfedin.', page_forecast_subtitle:'Tahmin trendleri.', insights_eyebrow:'Kişisel analitik', insights_overview:'Verilerinizdeki paternler.', export_page_title:'Dışa Aktar & Yedek', export_page_subtitle:'Verileriniz size ait.', from_label:'Başlangıç', to_label:'Bitiş', tags_optional:'Etiketler (isteğe bağlı)', report_week:'Hafta', report_month:'Ay', report_year:'Yıl', report_export_pdf:'Raporu PDF olarak dışa aktar', report_best_day:'En iyi gün', report_challenging:'Zor gün', settings:'Ayarlar', s_appearance:'Görünüm', s_appearance_desc:'Tema ve görüntüleme tercihleri.', s_theme:'Tema', s_dark_mode:'Karanlık mod', s_sound:'Başarı sesi', s_particles:'Ortam partikülleri', s_parallax:'Paralaks kaydırma', s_preferences:'Tercihler', s_preferences_desc:'Varsayılan seçenekler.', s_language:'Dil', s_date_format:'Tarih biçimi', s_time_format:'Saat biçimi', s_chart_days:'Grafik varsayılan günler', s_reduce_motion:'Hareketi azalt', s_notifications:'Bildirimleri etkinleştir (tarayıcı)', s_dashboard_widgets:'Gösterge paneli widget\'ları', s_show_mood:'Ruh hali grafiği göster', s_show_sleep:'Uyku grafiği göster', s_show_energy:'Enerji grafiği göster', s_custom_metrics:'Özel metrikler', s_custom_metrics_desc:'Kendi metriklerinizi ekleyin.', s_privacy:'Veri ve Gizlilik', s_privacy_desc:'Tüm veriler cihazınızda yerel olarak saklanır.', s_delete_all:'Tüm verilerimi sil', s_favourite_tags:'Favori etiketler', s_default_activities:'Varsayılan aktiviteler', modal_full_edit:'\u270f\ufe0f Tam düzenleme', modal_journal_btn:'\ud83d\udcd3 Günlük', modal_close:'Kapat', modal_cancel:'İptal', modal_delete:'Sil', modal_confirm:'Onayla', delete_entry:'Kaydı sil', delete_entry_q:'Kaydı sil?', cannot_undo:'Bu işlem geri alınamaz.', full_delete_day:'Tüm günü sil?', full_delete_desc:'Ruh hali, enerji, uyku, aktiviteler ve günlük kalıcı olarak silinecek.', full_delete_btn:'Kaydı sil', are_you_sure:'Emin misiniz?', enter_passcode:'Onaylamak için şifre girin', type_delete_label:'Onaylamak için SİL yazın', delete_all_title:'Tüm verilerimi sil', delete_all_desc:'Tüm girişler, günlük, yedekler ve ayarlar kalıcı olarak silinir.', delete_all_confirm:'Hepsini sil', no_entry_day:'Bu gün için kayıt yok.', click_edit_checkin:'Eklemek için Düzenle\'ye tıklayın.', delete_entire_entry:'\ud83d\uddd1 Tüm kaydı sil', pwa_install_text:'Hızlı erişim için Aura\'yı yükleyin.', pwa_not_now:'Şimdi değil', pwa_install_btn:'Yükle', pwa_update_text:'Yeni bir sürüm mevcut.', pwa_reload:'Yenile', chart_avg_mood_month:'Aylara göre ortalama ruh hali', chart_mood_axis:'Ruh hali değişimi', chart_mood_axis_short:'Değişim', chart_mood_improved:'Ruh hali {n} puan yükseldi', chart_mood_dipped:'Ruh hali {n} puan düştü', chart_mood_1_10:'Ruh hali (1\u201310)', chip_latest:'Son: {delta} vs ort.', chip_range:'Aralık {min}\u2013{max}', insights_what_data_shows:'Verileriniz ne gösteriyor', insight_sleep_heading:'Uyku', insight_activity_heading:'Aktivite', insight_stability_heading:'Ruh hali istikrarı', insight_tags_heading:'Etiketler', toast_lang:'Dil güncellendi \u2713', toast_date_fmt:'Tarih biçimi güncellendi \u2713', toast_time_fmt:'Saat biçimi güncellendi \u2713', toast_saved:'Kaydedildi \u2713', dow_need_more_data:'Haftalık desenleri görmek için en az 2 hafta ekleyin.', dow_no_data_label:'Veri yok', dow_average_label:'ortalama', dow_dataset_label:'Ortalama ruh hali' };

    S.ja = { nav_tracking:'トラッキング', nav_analytics_label:'アナリティクス', nav_explore:'探索', nav_data_label:'データ', nav_overview:'概要', nav_checkin:'デイリーチェックイン', nav_checkin_short:'チェックイン', nav_calendar:'カレンダー', nav_journal:'日記', nav_mood_trends:'気分トレンド', nav_sleep:'睡眠分析', nav_energy:'エネルギーパターン', nav_insights:'インサイト', nav_correlations:'相関', nav_velocity:'気分の速度', nav_forecast:'予測', nav_patterns:'マイパターン', nav_seasonal:'季節のリズム', nav_reports:'レポート', nav_export:'エクスポート＆バックアップ', nav_menu:'メニュー', nav_seasonal_short:'季節', good_morning:'おはようございます', good_afternoon:'こんにちは', good_evening:'こんばんは', narrative_start:'最初のチェックインを記録してパターンを確認しましょう。', narrative_trend_up:'今週は気分が上がっています。', narrative_trend_down:'今週は気分が少し下がっています。', narrative_steady:'今週は気分が安定しています。', no_checkin_today:'今日はまだチェックインがありません。', streak_days:'{n}日連続 \u2014 続けましょう！', streak_day:'連続{n}日目です。', daily_checkin:'デイリーチェックイン', checkin_subtitle:'気分、睡眠、エネルギーを記録。', save_entry:'保存', daily_summary:'1日のまとめ', low_mood:'低い気分', neutral:'普通', good_mood:'良い気分', today:'今日', calendar_title:'カレンダー', calendar_subtitle:'日、週、月ごとの気分履歴を確認。', calendar_year_heatmap:'年間ヒートマップ', cal_year_heatmap:'年間ヒートマップ', calendar_month_grid:'月次グリッド', cal_month_grid:'月次グリッド', calendar_week_timeline:'週次タイムライン', cal_week_timeline:'週次タイムライン', calendar_list_view:'リスト', cal_list:'リスト', year_in_mood_title:'年間の気分', cal_year_in_mood:'年間の気分', export_heatmap:'ヒートマップを書き出す', journal:'日記', journal_title:'日記', journal_page_subtitle:'自由に書いてください \u2014 これはあなただけのものです。', journal_eyebrow:'あなたの振り返り', journal_one_per_day_sub:'1日1件のエントリー。', journal_unsaved:'未保存の変更', save_journal:'日記を保存', edit_journal_entry:'日記を編集', journal_saved_placeholder:'今日の日記はすでに保存されています。', one_journal_per_day:'1日に作成できる日記は1件のみです。', add_photo:'\ud83d\udcf7 写真を追加', page_mood_subtitle:'感情的な健康のパターンとトレンド。', page_sleep_subtitle:'休息の質と一貫性。', page_energy_subtitle:'日々のリズムとスタミナ。', page_velocity_h1:'気分の速度と安定性', page_velocity_subtitle:'日々の気分の変化を確認。', page_corr_subtitle:'追跡指標間の関係を発見。', page_patterns_subtitle:'睡眠、活動、気分のパターン。', page_seasonal_h1:'季節的・リズム分析', page_seasonal_subtitle:'気分、睡眠、エネルギーの季節変化を確認。', page_forecast_subtitle:'最近のデータに基づく予測トレンド。', insights_eyebrow:'パーソナル分析', insights_overview:'データからのパターン。', export_page_title:'エクスポート＆バックアップ', export_page_subtitle:'あなたのデータはあなたのもの。', from_label:'開始', to_label:'終了', tags_optional:'タグ（任意）', report_week:'週', report_month:'月', report_year:'年', report_export_pdf:'PDFでレポートを書き出す', report_best_day:'最良の日', report_challenging:'つらい日', settings:'設定', s_appearance:'外観', s_appearance_desc:'テーマと表示設定。', s_theme:'テーマ', s_dark_mode:'ダークモード', s_sound:'成功音', s_particles:'アンビエントパーティクル', s_parallax:'パララックス', s_preferences:'設定', s_preferences_desc:'デフォルトオプション。', s_language:'言語', s_date_format:'日付形式', s_time_format:'時刻形式', s_chart_days:'グラフのデフォルト日数', s_reduce_motion:'モーションを減らす', s_notifications:'通知を有効化（ブラウザ）', s_dashboard_widgets:'ダッシュボードウィジェット', s_show_mood:'気分グラフを表示', s_show_sleep:'睡眠グラフを表示', s_show_energy:'エネルギーグラフを表示', s_custom_metrics:'カスタム指標', s_custom_metrics_desc:'独自の指標を追加。', s_privacy:'データとプライバシー', s_privacy_desc:'すべてのデータはデバイスにローカル保存されます。', s_delete_all:'全データを削除', s_favourite_tags:'お気に入りタグ', s_default_activities:'デフォルト活動', modal_full_edit:'\u270f\ufe0f 完全編集', modal_journal_btn:'\ud83d\udcd3 日記', modal_close:'閉じる', modal_cancel:'キャンセル', modal_delete:'削除', modal_confirm:'確認', delete_entry:'削除', delete_entry_q:'記録を削除しますか？', cannot_undo:'この操作は元に戻せません。', full_delete_day:'この日全体を削除しますか？', full_delete_desc:'気分、エネルギー、睡眠、活動、日記が完全に削除されます。', full_delete_btn:'記録を削除', are_you_sure:'本当によろしいですか？', enter_passcode:'確認のためパスコードを入力', type_delete_label:'確認のためDELETEと入力', delete_all_title:'全データを削除', delete_all_desc:'すべてのエントリー、日記、バックアップ、設定を永久に削除します。', delete_all_confirm:'すべて削除', no_entry_day:'この日のエントリーはありません。', click_edit_checkin:'編集をクリックして追加。', delete_entire_entry:'\ud83d\uddd1 この日の全エントリーを削除', pwa_install_text:'Auraをインストール。', pwa_not_now:'後で', pwa_install_btn:'インストール', pwa_update_text:'新しいバージョンが利用可能です。', pwa_reload:'再読み込み', chart_avg_mood_month:'月別平均気分', chart_mood_axis:'気分の変化', chart_mood_axis_short:'変化', chart_mood_improved:'気分が{n}ポイント向上', chart_mood_dipped:'気分が{n}ポイント低下', chart_mood_1_10:'気分（1〜10）', chip_latest:'最新: {delta} vs 平均', chip_range:'範囲 {min}〜{max}', insights_what_data_shows:'データが示すもの', insight_sleep_heading:'睡眠インサイト', insight_activity_heading:'活動インサイト', insight_stability_heading:'気分の安定性', insight_tags_heading:'タグインサイト', toast_lang:'言語を更新しました \u2713', toast_date_fmt:'日付形式を更新しました \u2713', toast_time_fmt:'時刻形式を更新しました \u2713', toast_saved:'保存しました \u2713', dow_need_more_data:'週ごとのパターンを見るには少なくとも2週間入力してください。', dow_no_data_label:'データなし', dow_average_label:'平均', dow_dataset_label:'平均気分' };

    S.zh = { nav_tracking:'追踪', nav_analytics_label:'分析', nav_explore:'探索', nav_data_label:'数据', nav_overview:'概览', nav_checkin:'每日打卡', nav_checkin_short:'打卡', nav_calendar:'日历', nav_journal:'日记', nav_mood_trends:'情绪趋势', nav_sleep:'睡眠分析', nav_energy:'能量模式', nav_insights:'洞察', nav_correlations:'相关性', nav_velocity:'情绪速度', nav_forecast:'预测', nav_patterns:'我的模式', nav_seasonal:'季节节律', nav_reports:'报告', nav_export:'导出与备份', nav_menu:'菜单', nav_seasonal_short:'季节', good_morning:'早上好', good_afternoon:'下午好', good_evening:'晚上好', narrative_start:'开始记录第一次打卡，在这里看到模式的出现。', narrative_trend_up:'您的情绪本周有所改善。', narrative_trend_down:'您的情绪本周略有下降。', narrative_steady:'您的情绪本周保持稳定。', no_checkin_today:'今天还没有打卡。', streak_days:'连续{n}天 \u2014 继续坚持！', streak_day:'连续第{n}天。', daily_checkin:'每日打卡', checkin_subtitle:'记录您的情绪、睡眠和能量。', save_entry:'保存记录', daily_summary:'每日总结', low_mood:'情绪低落', neutral:'中性', good_mood:'情绪良好', today:'今天', calendar_title:'日历', calendar_subtitle:'按日、周、月浏览情绪历史。', calendar_year_heatmap:'年度热力图', cal_year_heatmap:'年度热力图', calendar_month_grid:'月度网格', cal_month_grid:'月度网格', calendar_week_timeline:'周时间轴', cal_week_timeline:'周时间轴', calendar_list_view:'列表', cal_list:'列表', year_in_mood_title:'年度情绪', cal_year_in_mood:'年度情绪', export_heatmap:'导出热力图', journal:'日记', journal_title:'日记', journal_page_subtitle:'自由书写 \u2014 这只属于您。', journal_eyebrow:'您的反思', journal_one_per_day_sub:'每天一条记录。', journal_unsaved:'未保存的更改', save_journal:'保存日记', edit_journal_entry:'编辑日记', journal_saved_placeholder:'今天的日记已保存。', one_journal_per_day:'每天只能创建一条日记。', add_photo:'\ud83d\udcf7 添加照片', page_mood_subtitle:'情绪健康的规律和趋势。', page_sleep_subtitle:'休息的质量和一致性。', page_energy_subtitle:'各天的节奏和耐力。', page_velocity_h1:'情绪速度与稳定性', page_velocity_subtitle:'查看情绪日复一日的变化。', page_corr_subtitle:'发现追踪指标之间的关系。', page_patterns_subtitle:'睡眠、活动和情绪模式。', page_seasonal_h1:'季节性与节律分析', page_seasonal_subtitle:'发现情绪、睡眠和能量的季节变化。', page_forecast_subtitle:'基于最新数据的预测趋势。', insights_eyebrow:'个人分析', insights_overview:'来自您数据的规律。', export_page_title:'导出与备份', export_page_subtitle:'您的数据属于您。', from_label:'开始', to_label:'结束', tags_optional:'标签（可选）', report_week:'周', report_month:'月', report_year:'年', report_export_pdf:'将报告导出为PDF', report_best_day:'最佳日', report_challenging:'情绪最低日', settings:'设置', s_appearance:'外观', s_appearance_desc:'主题和显示偏好。', s_theme:'主题', s_dark_mode:'暗色模式', s_sound:'成功音效', s_particles:'环境粒子', s_parallax:'视差滚动', s_preferences:'偏好设置', s_preferences_desc:'默认和显示选项。', s_language:'语言', s_date_format:'日期格式', s_time_format:'时间格式', s_chart_days:'图表默认天数', s_reduce_motion:'减少动画', s_notifications:'启用通知（浏览器）', s_dashboard_widgets:'仪表板小组件', s_show_mood:'显示情绪图表', s_show_sleep:'显示睡眠图表', s_show_energy:'显示能量图表', s_custom_metrics:'自定义指标', s_custom_metrics_desc:'添加您自己的可追踪指标。', s_privacy:'数据与隐私', s_privacy_desc:'所有数据本地存储在您的设备上。', s_delete_all:'删除所有数据', s_favourite_tags:'收藏标签', s_default_activities:'默认活动', modal_full_edit:'\u270f\ufe0f 完整编辑', modal_journal_btn:'\ud83d\udcd3 日记', modal_close:'关闭', modal_cancel:'取消', modal_delete:'删除', modal_confirm:'确认', delete_entry:'删除记录', delete_entry_q:'删除记录？', cannot_undo:'此操作无法撤销。', full_delete_day:'删除整天记录？', full_delete_desc:'情绪、能量、睡眠、活动和日记将被永久删除。', full_delete_btn:'删除记录', are_you_sure:'您确定吗？', enter_passcode:'输入密码以确认', type_delete_label:'输入删除以确认', delete_all_title:'删除所有数据', delete_all_desc:'永久删除所有记录、日记、备份和设置。', delete_all_confirm:'删除一切', no_entry_day:'这天没有记录。', click_edit_checkin:'点击编辑以添加。', delete_entire_entry:'\ud83d\uddd1 删除这天的全部记录', pwa_install_text:'安装Aura以快速访问和离线使用。', pwa_not_now:'暂不', pwa_install_btn:'安装', pwa_update_text:'新版本可用。', pwa_reload:'重新加载', chart_avg_mood_month:'按月平均情绪', chart_mood_axis:'情绪变化（逐日）', chart_mood_axis_short:'变化', chart_mood_improved:'情绪提升了{n}分', chart_mood_dipped:'情绪下降了{n}分', chart_mood_1_10:'情绪（1\u201310）', chip_latest:'最近: {delta} vs 均', chip_range:'区间 {min}\u2013{max}', insights_what_data_shows:'数据揭示的内容', insight_sleep_heading:'睡眠', insight_activity_heading:'活动', insight_stability_heading:'情绪稳定性', insight_tags_heading:'标签', toast_lang:'语言已更新 \u2713', toast_date_fmt:'日期格式已更新 \u2713', toast_time_fmt:'时间格式已更新 \u2713', toast_saved:'已保存 \u2713', dow_need_more_data:'至少添加2周的记录以查看每周模式。', dow_no_data_label:'无数据', dow_average_label:'平均', dow_dataset_label:'平均情绪' };

    S.hi = { nav_tracking:'ट्रैकिंग', nav_analytics_label:'विश्लेषण', nav_explore:'अन्वेषण', nav_data_label:'डेटा', nav_overview:'अवलोकन', nav_checkin:'दैनिक चेक-इन', nav_checkin_short:'चेक-इन', nav_calendar:'कैलेंडर', nav_journal:'डायरी', nav_mood_trends:'मूड ट्रेंड', nav_sleep:'नींद विश्लेषण', nav_energy:'ऊर्जा पैटर्न', nav_insights:'अंतर्दृष्टि', nav_correlations:'सहसंबंध', nav_velocity:'मूड वेलोसिटी', nav_forecast:'पूर्वानुमान', nav_patterns:'मेरे पैटर्न', nav_seasonal:'मौसमी लय', nav_reports:'रिपोर्ट', nav_export:'निर्यात और बैकअप', nav_menu:'मेनू', nav_seasonal_short:'मौसमी', good_morning:'सुप्रभात', good_afternoon:'नमस्ते', good_evening:'शुभ संध्या', narrative_start:'पैटर्न देखने के लिए पहला चेक-इन दर्ज करें।', narrative_trend_up:'इस सप्ताह आपका मूड बेहतर हुआ है।', narrative_trend_down:'इस सप्ताह आपका मूड थोड़ा कम रहा।', narrative_steady:'इस सप्ताह आपका मूड स्थिर रहा।', no_checkin_today:'आज अभी तक कोई चेक-इन नहीं।', streak_days:'{n} दिन की लकीर \u2014 जारी रखें!', streak_day:'आपकी लकीर का दिन {n}।', daily_checkin:'दैनिक चेक-इन', checkin_subtitle:'अपना मूड, नींद और ऊर्जा दर्ज करें।', save_entry:'प्रविष्टि सहेजें', daily_summary:'दैनिक सारांश', low_mood:'कम मनोदशा', neutral:'तटस्थ', good_mood:'अच्छी मनोदशा', today:'आज', calendar_title:'कैलेंडर', calendar_subtitle:'दिनों, हफ्तों और महीनों में मूड इतिहास देखें।', calendar_year_heatmap:'वार्षिक हीटमैप', cal_year_heatmap:'वार्षिक हीटमैप', calendar_month_grid:'मासिक ग्रिड', cal_month_grid:'मासिक ग्रिड', calendar_week_timeline:'साप्ताहिक टाइमलाइन', cal_week_timeline:'साप्ताहिक टाइमलाइन', calendar_list_view:'सूची', cal_list:'सूची', year_in_mood_title:'मूड का वर्ष', cal_year_in_mood:'मूड का वर्ष', export_heatmap:'हीटमैप निर्यात करें', journal:'डायरी', journal_title:'डायरी', journal_page_subtitle:'स्वतंत्र रूप से लिखें \u2014 यह सिर्फ आपके लिए है।', journal_eyebrow:'आपके विचार', journal_one_per_day_sub:'प्रतिदिन एक प्रविष्टि।', journal_unsaved:'सहेजे नहीं गए बदलाव', save_journal:'डायरी सहेजें', edit_journal_entry:'डायरी प्रविष्टि संपादित करें', journal_saved_placeholder:'आज की डायरी प्रविष्टि पहले से सहेजी गई है।', one_journal_per_day:'प्रति दिन केवल एक डायरी प्रविष्टि।', add_photo:'\ud83d\udcf7 फ़ोटो जोड़ें', page_mood_subtitle:'आपके भावनात्मक स्वास्थ्य के पैटर्न।', page_sleep_subtitle:'आपकी नींद की गुणवत्ता और निरंतरता।', page_energy_subtitle:'दिनों में लय और सहनशक्ति।', page_velocity_h1:'मूड वेलोसिटी और स्थिरता', page_velocity_subtitle:'देखें मूड दिन-प्रतिदिन कैसे बदलता है।', page_corr_subtitle:'ट्रैक की गई मेट्रिक्स के बीच संबंध खोजें।', page_patterns_subtitle:'नींद, गतिविधि और मूड के पैटर्न।', page_seasonal_h1:'मौसमी और लयबद्ध विश्लेषण', page_seasonal_subtitle:'मूड, नींद और ऊर्जा में मौसमी बदलाव जानें।', page_forecast_subtitle:'हाल के डेटा के आधार पर पूर्वानुमान रुझान।', insights_eyebrow:'व्यक्तिगत विश्लेषण', insights_overview:'आपके डेटा से पैटर्न।', export_page_title:'निर्यात और बैकअप', export_page_subtitle:'आपका डेटा आपका है।', from_label:'से', to_label:'तक', tags_optional:'टैग (वैकल्पिक)', report_week:'सप्ताह', report_month:'माह', report_year:'वर्ष', report_export_pdf:'रिपोर्ट PDF में निर्यात करें', report_best_day:'सबसे अच्छा दिन', report_challenging:'कठिन दिन', settings:'सेटिंग्स', s_appearance:'दिखावट', s_appearance_desc:'थीम और प्रदर्शन प्राथमिकताएं।', s_theme:'थीम', s_dark_mode:'डार्क मोड', s_sound:'सफलता ध्वनि', s_particles:'परिवेश कण', s_parallax:'पैरेलेक्स स्क्रॉलिंग', s_preferences:'प्राथमिकताएं', s_preferences_desc:'डिफ़ॉल्ट विकल्प।', s_language:'भाषा', s_date_format:'दिनांक प्रारूप', s_time_format:'समय प्रारूप', s_chart_days:'चार्ट डिफ़ॉल्ट दिन', s_reduce_motion:'गति कम करें', s_notifications:'सूचनाएं सक्षम करें (ब्राउज़र)', s_dashboard_widgets:'डैशबोर्ड विजेट', s_show_mood:'मूड चार्ट दिखाएं', s_show_sleep:'नींद चार्ट दिखाएं', s_show_energy:'ऊर्जा चार्ट दिखाएं', s_custom_metrics:'कस्टम मेट्रिक्स', s_custom_metrics_desc:'अपनी खुद की मेट्रिक्स जोड़ें।', s_privacy:'डेटा और गोपनीयता', s_privacy_desc:'सभी डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।', s_delete_all:'सभी डेटा हटाएं', s_favourite_tags:'पसंदीदा टैग', s_default_activities:'डिफ़ॉल्ट गतिविधियां', modal_full_edit:'\u270f\ufe0f पूर्ण संपादन', modal_journal_btn:'\ud83d\udcd3 डायरी', modal_close:'बंद करें', modal_cancel:'रद्द करें', modal_delete:'हटाएं', modal_confirm:'पुष्टि करें', delete_entry:'प्रविष्टि हटाएं', delete_entry_q:'प्रविष्टि हटाएं?', cannot_undo:'यह क्रिया पूर्ववत नहीं की जा सकती।', full_delete_day:'पूरा दिन हटाएं?', full_delete_desc:'मूड, ऊर्जा, नींद, गतिविधियां और डायरी स्थायी रूप से हटाई जाएंगी।', full_delete_btn:'प्रविष्टि हटाएं', are_you_sure:'क्या आप सुनिश्चित हैं?', enter_passcode:'पुष्टि के लिए पासकोड दर्ज करें', type_delete_label:'पुष्टि के लिए DELETE टाइप करें', delete_all_title:'सभी डेटा हटाएं', delete_all_desc:'सभी प्रविष्टियां, डायरी, बैकअप और सेटिंग्स स्थायी रूप से हटाएं।', delete_all_confirm:'सब कुछ हटाएं', no_entry_day:'इस दिन के लिए कोई प्रविष्टि नहीं।', click_edit_checkin:'जोड़ने के लिए चेक-इन संपादित करें पर क्लिक करें।', delete_entire_entry:'\ud83d\uddd1 इस दिन की पूरी प्रविष्टि हटाएं', pwa_install_text:'Aura इंस्टॉल करें।', pwa_not_now:'अभी नहीं', pwa_install_btn:'इंस्टॉल करें', pwa_update_text:'नया संस्करण उपलब्ध है।', pwa_reload:'पुनः लोड करें', chart_avg_mood_month:'माह के अनुसार औसत मूड', chart_mood_axis:'मूड परिवर्तन', chart_mood_axis_short:'परि.', chart_mood_improved:'मूड {n} अंक बेहतर हुआ', chart_mood_dipped:'मूड {n} अंक कम हुआ', chart_mood_1_10:'मूड (1\u201310)', chip_latest:'हाल: {delta} बनाम औसत', chip_range:'दायरा {min}\u2013{max}', insights_what_data_shows:'आपके डेटा से पता चलता है', insight_sleep_heading:'नींद अंतर्दृष्टि', insight_activity_heading:'गतिविधि अंतर्दृष्टि', insight_stability_heading:'मूड स्थिरता', insight_tags_heading:'टैग अंतर्दृष्टि', toast_lang:'भाषा अपडेट हुई \u2713', toast_date_fmt:'दिनांक प्रारूप अपडेट हुआ \u2713', toast_time_fmt:'समय प्रारूप अपडेट हुआ \u2713', toast_saved:'सहेजा गया \u2713', dow_need_more_data:'साप्ताहिक पैटर्न देखने के लिए कम से कम 2 सप्ताह जोड़ें।', dow_no_data_label:'कोई डेटा नहीं', dow_average_label:'औसत', dow_dataset_label:'औसत मूड' };

    /* ════════════════════════════════════════════════════════════════════
       §2  AUTO-FILL MISSING KEYS FROM ENGLISH
       ─── Guarantees zero blank text for every locale ─────────────────
    ════════════════════════════════════════════════════════════════════ */
    var ALL_LOCALES = ['de','fr','es','it','pt','nl','pl','ru','tr','ja','zh','hi','ar'];
    ALL_LOCALES.forEach(function (l) {
        if (!S[l]) S[l] = {};
        Object.keys(S.en).forEach(function (k) {
            if (S[l][k] == null) S[l][k] = S.en[k];
        });
    });

    /* Publish for external use */
    window.AURA_STRINGS = S;

    /* ════════════════════════════════════════════════════════════════════
       §3  HELPERS
    ════════════════════════════════════════════════════════════════════ */
    var RTL_LOCALES = { ar:1, he:1, fa:1, ur:1 };

    function currentLocale() {
        return String(window.auraLocale || 'en').split('-')[0];
    }

    /* t(key, vars) — primary lookup with English fallback */
    function t(key, vars) {
        var l = currentLocale();
        var row = S[l] || S.en;
        var val = (row[key] != null) ? row[key] : (S.en[key] || key);
        if (!vars) return val;
        return val.replace(/\{(\w+)\}/g, function (_, k) {
            return vars[k] != null ? vars[k] : '';
        });
    }

    /* Expose globally so app.js / chart code can call window.__t */
    window.__t = t;
    window.getTranslation = function (key) { return t(key); };

    /* Localized months / days via Intl — used by charts */
    window.getLocalizedMonths = function (fmt) {
        var loc = String(window.auraLocale || 'en');
        return Array.from({ length: 12 }, function (_, i) {
            try { return new Intl.DateTimeFormat(loc, { month: fmt || 'short' }).format(new Date(2000, i, 1)); }
            catch (e) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]; }
        });
    };
    window.getLocalizedDays = function (fmt) {
        var loc = String(window.auraLocale || 'en');
        return Array.from({ length: 7 }, function (_, i) {
            try { return new Intl.DateTimeFormat(loc, { weekday: fmt || 'short' }).format(new Date(2000, 0, 2 + i)); }
            catch (e) { return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]; }
        });
    };
    window.getLocalizedDaysFull = function () {
        var loc = String(window.auraLocale || 'en');
        return Array.from({ length: 7 }, function (_, i) {
            try { return new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(new Date(2000, 0, 2 + i)); }
            catch (e) { return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]; }
        });
    };

    /* ════════════════════════════════════════════════════════════════════
       §4  RTL / LTR
    ════════════════════════════════════════════════════════════════════ */
    function applyRTL() {
        var l = currentLocale();
        var isRTL = !!RTL_LOCALES[l];
        document.documentElement.dir  = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = window.auraLocale || l;
    }

    /* ════════════════════════════════════════════════════════════════════
       §5  DOM ANNOTATOR
       Stamps data-i18n on elements that have no hook yet.
       Idempotent — safe to call on every navigate.
    ════════════════════════════════════════════════════════════════════ */
    function ann(el, key) {
        if (el && !el.getAttribute('data-i18n')) el.setAttribute('data-i18n', key);
    }
    function findText(sel, needle) {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) {
            if ((els[i].textContent || '').trim().indexOf(needle) === 0) return els[i];
        }
        return null;
    }
    function firstText(el) {
        if (!el) return '';
        for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim())
                return el.childNodes[i].textContent.trim();
        }
        return (el.textContent || '').trim();
    }

    function annotateAll() {
        /* ── Sidebar section labels ──────────────────────────────────── */
        document.querySelectorAll('.sidebar .section-label').forEach(function (el) {
            var tx = el.textContent.trim();
            if (tx === 'Tracking')  ann(el, 'nav_tracking');
            if (tx === 'Analytics') ann(el, 'nav_analytics_label');
            if (tx === 'Explore')   ann(el, 'nav_explore');
            if (tx === 'Data')      ann(el, 'nav_data_label');
        });

        /* ── Sidebar nav spans ───────────────────────────────────────── */
        var SB = { 'Overview':'nav_overview','Daily Check-In':'nav_checkin','Calendar':'nav_calendar','Journal':'nav_journal','Mood Trends':'nav_mood_trends','Sleep Analysis':'nav_sleep','Energy Patterns':'nav_energy','Insights':'nav_insights','Correlations':'nav_correlations','Mood Velocity':'nav_velocity','Forecast':'nav_forecast','My Patterns':'nav_patterns','Seasonal Rhythm':'nav_seasonal','Reports':'nav_reports','Settings':'settings','Export & Backup':'nav_export' };
        document.querySelectorAll('.sidebar .nav span:not(.nav-icon)').forEach(function (el) {
            var k = SB[el.textContent.trim()]; if (k) ann(el, k);
        });

        /* ── Bottom nav ─────────────────────────────────────────────── */
        var BN = { 'Overview':'nav_overview','Check-In':'nav_checkin_short','Calendar':'nav_calendar','Journal':'nav_journal','Menu':'nav_menu' };
        document.querySelectorAll('.bottom-nav button span:not(.bn-icon)').forEach(function (el) {
            var k = BN[el.textContent.trim()]; if (k) ann(el, k);
        });

        /* ── Dashboard ──────────────────────────────────────────────── */
        ann(document.querySelector('.des-title'),        'dash_welcome_title');
        ann(document.querySelector('.des-subtitle'),     'dash_welcome_subtitle');
        ann(document.querySelector('.des-cta-primary'),  'dash_start_checkin');
        ann(document.querySelector('.des-cta-secondary'),'dash_sample_data');
        document.querySelectorAll('.des-feature-text').forEach(function (el) {
            var tx = el.textContent.trim();
            if (tx.indexOf('Mood trends') === 0)   ann(el, 'dash_feat_mood');
            if (tx.indexOf('Sleep pattern') === 0) ann(el, 'dash_feat_sleep');
            if (tx.indexOf('Personalised') === 0)  ann(el, 'dash_feat_insights');
        });
        ann(document.querySelector('.dashboard-analytics-eyebrow'), 'dash_go_deeper');
        ann(document.querySelector('.dashboard-analytics-title'),   'nav_analytics_label');
        ann(document.querySelector('.dashboard-analytics-hint'),    'dash_analytics_hint');

        /* ── Check-in labels ────────────────────────────────────────── */
        var entry = document.getElementById('entry');
        if (entry) {
            ann(entry.querySelector('h1'), 'daily_checkin');
            ann(entry.querySelector('.page-hero-subtitle'), 'checkin_subtitle');
            ann(document.getElementById('entryProgressLabel'), 'checkin_progress_label');
            entry.querySelectorAll('.entry-section-heading').forEach(function (el) {
                var sec = el.closest('[id]');
                var id = sec ? sec.id : '';
                if (id === 'entrySectionMoodEnergy')      ann(el, 'checkin_mood_energy_heading');
                else if (id === 'entrySectionSleep')       ann(el, 'checkin_sleep_heading');
                else if (id === 'entrySectionActivitiesTags') ann(el, 'checkin_activities_tags_heading');
                else if (firstText(el) === 'Date')        ann(el, 'checkin_date_heading');
            });
            var LABEL_MAP = { 'Mood':'checkin_mood','Energy Level':'checkin_energy','Sleep Duration':'checkin_sleep_duration','Sleep Quality':'checkin_sleep_quality','Primary Sleep Time':'checkin_sleep_time','Primary Wake Time':'checkin_wake_time','Sleep Segments':'checkin_sleep_segments','Activities':'checkin_activities','Tags':'checkin_tags','Photos':'checkin_photos','Date':'checkin_date' };
            entry.querySelectorAll('label').forEach(function (el) {
                var k = LABEL_MAP[firstText(el)]; if (k) ann(el, k);
            });
        }

        /* ── Journal page ────────────────────────────────────────────── */
        ann(document.querySelector('.journal-hero-eyebrow'),  'journal_eyebrow');
        ann(document.querySelector('.journal-hero-subtitle'), 'journal_one_per_day_sub');
        ann(document.querySelector('#journalPageTitle'), 'journal_title');

        /* ── Analytics pages ─────────────────────────────────────────── */
        function annPage(id, h1Key, subKey, subSel) {
            var pg = document.getElementById(id); if (!pg) return;
            ann(pg.querySelector('h1'), h1Key);
            ann(pg.querySelector(subSel || '.page-subtitle,.page-hero-subtitle'), subKey);
        }
        annPage('mood',        'nav_mood_trends',  'page_mood_subtitle');
        annPage('sleep',       'nav_sleep',        'page_sleep_subtitle');
        annPage('energy',      'nav_energy',       'page_energy_subtitle');
        annPage('circadian',   'page_velocity_h1', 'page_velocity_subtitle', '.circadian-page-subtitle,.page-subtitle,.page-hero-subtitle');
        annPage('correlations','nav_correlations', 'page_corr_subtitle');
        annPage('patterns',    'nav_patterns',     'page_patterns_subtitle');
        annPage('seasonal',    'page_seasonal_h1', 'page_seasonal_subtitle', '.page-hero-subtitle,.page-subtitle');
        annPage('predictions', 'nav_forecast',     'page_forecast_subtitle', '.page-hero-subtitle,.page-subtitle');

        /* ── Insights ────────────────────────────────────────────────── */
        var ins = document.getElementById('insights');
        if (ins) {
            ann(ins.querySelector('h1'), 'nav_insights');
            ann(ins.querySelector('.insights-eyebrow'), 'insights_eyebrow');
            ann(ins.querySelector('.page-hero-subtitle,#insightsOverviewText'), 'insights_overview');
        }

        /* ── Export ──────────────────────────────────────────────────── */
        var dataPg = document.getElementById('data');
        if (dataPg) {
            ann(dataPg.querySelector('h1'), 'export_page_title');
            ann(dataPg.querySelector('.page-hero-subtitle,.page-subtitle'), 'export_page_subtitle');
        }

        /* ── Reports tabs ────────────────────────────────────────────── */
        document.querySelectorAll('.report-tabs button').forEach(function (el) {
            var tx = el.textContent.trim();
            if (tx === 'Week')  ann(el, 'report_week');
            if (tx === 'Month') ann(el, 'report_month');
            if (tx === 'Year')  ann(el, 'report_year');
        });

        /* ── Settings ────────────────────────────────────────────────── */
        var sp = document.getElementById('settings');
        if (sp) {
            ann(sp.querySelector('h1'), 'settings');
            var CARD_MAP = { 'Appearance':['s_appearance','s_appearance_desc'],'Preferences':['s_preferences','s_preferences_desc'],'Custom metrics':['s_custom_metrics','s_custom_metrics_desc'],'Data & Privacy':['s_privacy','s_privacy_desc'] };
            sp.querySelectorAll('.card').forEach(function (card) {
                var h3 = card.querySelector('h3'); if (!h3) return;
                var m = CARD_MAP[h3.textContent.trim()]; if (!m) return;
                ann(h3, m[0]);
                ann(card.querySelector('.card-desc'), m[1]);
            });
            var SL = { 'Theme':'s_theme','Dark mode':'s_dark_mode','Success sound':'s_sound','Ambient particles':'s_particles','Parallax scrolling':'s_parallax','Language':'s_language','Date format':'s_date_format','Time format':'s_time_format','Chart default days':'s_chart_days','Reduce motion':'s_reduce_motion','Enable notifications (browser)':'s_notifications','Show Mood chart':'s_show_mood','Show Sleep chart':'s_show_sleep','Show Energy chart':'s_show_energy','Favourite tags':'s_favourite_tags','Default activities':'s_default_activities' };
            sp.querySelectorAll('label').forEach(function (el) {
                var k = SL[firstText(el)]; if (k) ann(el, k);
            });
            sp.querySelectorAll('h4').forEach(function (el) {
                if (el.textContent.indexOf('Dashboard widgets') !== -1) ann(el, 's_dashboard_widgets');
            });
            sp.querySelectorAll('button').forEach(function (el) {
                if (el.textContent.trim() === 'Delete all my data') ann(el, 's_delete_all');
            });
        }

        /* ── Entry modal footer ──────────────────────────────────────── */
        ann(document.getElementById('entryModalEditBtn'),    'modal_full_edit');
        ann(document.getElementById('entryModalJournalBtn'), 'modal_journal_btn');
        ann(findText('.entry-modal-footer button', 'Close'),  'modal_close');

        /* ── Delete modals ───────────────────────────────────────────── */
        ann(document.getElementById('deleteEntryModalTitle'), 'delete_entry_q');
        ann(document.getElementById('deleteEntryModalDesc'),  'cannot_undo');
        ann(document.getElementById('deleteEntryCancelBtn'),  'modal_cancel');
        ann(document.getElementById('deleteEntryConfirmBtn'), 'modal_delete');
        ann(document.getElementById('fullEntryDeleteModalTitle'), 'full_delete_day');
        ann(document.getElementById('fullEntryDeleteModalDesc'),  'full_delete_desc');
        ann(document.getElementById('fullEntryDeleteConfirmBtn'), 'full_delete_btn');
        var fedM = document.getElementById('fullEntryDeleteModal');
        if (fedM) fedM.querySelectorAll('.btn-secondary').forEach(function (b) { if (b.textContent.trim() === 'Cancel') ann(b, 'modal_cancel'); });
        ann(document.getElementById('premiumConfirmTitle'), 'are_you_sure');
        var pcM = document.getElementById('premiumConfirmModal');
        if (pcM) pcM.querySelectorAll('button').forEach(function (b) {
            if (b.textContent.trim() === 'Cancel') ann(b, 'modal_cancel');
            if (b.textContent.trim() === 'Delete') ann(b, 'modal_delete');
        });
        ann(document.getElementById('deleteAllModalTitle'), 'delete_all_title');
        ann(document.getElementById('deleteAllModalDesc'),  'delete_all_desc');
        ann(document.querySelector('#deleteAllPasscodeWrap label'), 'enter_passcode');
        ann(document.querySelector('#deleteAllTypeWrap label'),     'type_delete_label');
        ann(findText('#deleteAllModal button', 'Delete all'), 'delete_all_confirm');
        ann(findText('#deleteAllModal .btn-secondary', 'Cancel'), 'modal_cancel');

        /* ── PWA banners ─────────────────────────────────────────────── */
        document.querySelectorAll('.pwa-banner-text').forEach(function (el) {
            var tx = el.textContent.trim();
            if (tx.indexOf('Install Aura') !== -1) ann(el, 'pwa_install_text');
            if (tx.indexOf('new version')  !== -1) ann(el, 'pwa_update_text');
        });
        document.querySelectorAll('.pwa-banner button').forEach(function (el) {
            var tx = el.textContent.trim();
            if (tx === 'Not now') ann(el, 'pwa_not_now');
            if (tx === 'Install') ann(el, 'pwa_install_btn');
            if (tx === 'Reload')  ann(el, 'pwa_reload');
        });
    }

    /* ════════════════════════════════════════════════════════════════════
       §6  APPLY — single function that writes every translation
    ════════════════════════════════════════════════════════════════════ */
    function applyI18n(locale) {
        var l = String(locale || window.auraLocale || 'en').split('-')[0];
        var row = S[l] || S.en;

        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = row[key] != null ? row[key] : S.en[key];
            if (val == null) return;
            if (el.getAttribute('data-i18n-placeholder')) { el.placeholder = val; return; }
            /* Safe first-text-node replacement — preserves icons, check-marks etc */
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

    /* Expose for use by other scripts */
    window.applyI18n = applyI18n;

    /* ════════════════════════════════════════════════════════════════════
       §7  JS-GENERATED CONTENT PATCHES
       Entry modal body and other innerHTML surfaces
    ════════════════════════════════════════════════════════════════════ */
    function patchShowEntryModal() {
        var orig = window.showEntryModal;
        if (typeof orig !== 'function' || orig._i18nPatched) return;
        orig._i18nPatched = true;
        window.showEntryModal = function () {
            var r = orig.apply(this, arguments);
            setTimeout(function () {
                var l = currentLocale();
                var row = S[l] || S.en;
                var body = document.getElementById('entryModalBody');
                if (!body) return;
                /* Delete-entire-entry button */
                body.querySelectorAll('.entry-modal-delete-btn').forEach(function (btn) {
                    if (row.delete_entire_entry) btn.textContent = row.delete_entire_entry;
                });
                /* Empty state text nodes */
                body.querySelectorAll('div').forEach(function (div) {
                    if (div.children.length) return;
                    var tx = (div.textContent || '').trim();
                    if (tx === 'No entry for this day.' && row.no_entry_day) div.textContent = row.no_entry_day;
                    else if (tx === 'Click Edit Check-In to add one.' && row.click_edit_checkin) div.textContent = row.click_edit_checkin;
                });
                /* Field labels */
                var FM = { 'Mood':'checkin_mood','Sleep':'checkin_sleep_duration','Energy':'checkin_energy','Activities':'checkin_activities','Tags':'checkin_tags','Journal':'journal','Photos':'checkin_photos' };
                body.querySelectorAll('.em-field-label').forEach(function (el) {
                    var k = FM[(el.textContent || '').trim()];
                    if (!k) return;
                    var v = row[k] || S.en[k];
                    if (v && v !== k) el.textContent = v;
                });
            }, 150);
            return r;
        };
    }

    /* Patch toast messages so they use translated strings */
    function patchShowToast() {
        var orig = window.showToast;
        if (typeof orig !== 'function' || orig._i18nPatched) return;
        orig._i18nPatched = true;
        window.showToast = function (msg) {
            var l = currentLocale();
            var row = S[l] || S.en;
            /* Map common English strings to translated equivalents */
            var MAP = {
                'Language updated ✓':   row.toast_lang,
                'Date format updated ✓':row.toast_date_fmt,
                'Time format updated ✓':row.toast_time_fmt,
                'Saved ✓':              row.toast_saved,
                'Saved':                row.toast_saved,
                'Deleted':              row.modal_delete + ' ✓'
            };
            return orig.call(this, MAP[msg] || msg);
        };
    }

    /* ════════════════════════════════════════════════════════════════════
       §8  MASTER RUN FUNCTION
    ════════════════════════════════════════════════════════════════════ */
    function runI18n(locale) {
        if (locale) window.auraLocale = String(locale).split('-')[0];
        applyRTL();
        annotateAll();
        applyI18n(window.auraLocale || 'en');
    }

    /* ════════════════════════════════════════════════════════════════════
       §9  WIRING — single savePreference + navigate wrapper
    ════════════════════════════════════════════════════════════════════ */
    function wire() {
        patchShowEntryModal();
        patchShowToast();

        /* Run once immediately */
        runI18n();

        /* Wrap savePreference — ONE time, guarded */
        var origSave = window.savePreference;
        if (typeof origSave === 'function' && !origSave._masterI18n) {
            window.savePreference = function (key, value) {
                var r = origSave.apply(this, arguments);
                if (key === 'locale') {
                    var loc = String(value || 'en');
                    if (loc === '_custom') {
                        var cEl = document.getElementById('prefLocaleCustom');
                        loc = cEl ? (cEl.value.trim() || 'en') : 'en';
                    }
                    /* Run after ALL existing timers (max 450 ms) */
                    setTimeout(function () { runI18n(loc); }, 700);
                }
                return r;
            };
            window.savePreference._masterI18n = true;
        }

        /* Wrap navigate — ONE time, guarded */
        var origNav = window.navigate;
        if (typeof origNav === 'function' && !origNav._masterI18n) {
            window.navigate = function (page) {
                var r = origNav.apply(this, arguments);
                setTimeout(runI18n, 600);
                return r;
            };
            window.navigate._masterI18n = true;
        }
    }

    /* ════════════════════════════════════════════════════════════════════
       §10  BOOT
    ════════════════════════════════════════════════════════════════════ */
    if (document.readyState !== 'loading' && window.navigate) {
        setTimeout(wire, 700);
    } else {
        document.addEventListener('DOMContentLoaded', function () {
            setTimeout(wire, 800);
        });
    }

    console.log('[Aura i18n] Single-source i18n system loaded — all languages, all pages.');
})();
