/* ═══════════════════════════════════════════════════════════════════════
   js/i18n_deep_patch.js  —  Aura Mood
   Patches every JS-generated string that cannot be reached via data-i18n.
   Load LAST — after i18n.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─── delegate to unified window.t, with DP as secondary fallback ── */
    function T(key, vars) {
        var locale = String(window.auraLocale || 'en').split('-')[0];
        /* Primary: S table via window.t */
        if (typeof window.t === 'function') {
            var result = window.t(key, vars);
            /* window.t returns key itself when key is missing from S table — check DP */
            if (result !== key) return result;
        }
        /* Secondary: DP table (locale → English → key) */
        var row = DP[locale] || DP.en;
        var val = (row && row[key] != null) ? row[key] : ((DP.en && DP.en[key] != null) ? DP.en[key] : key);
        if (!vars) return val;
        return val.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    }
    /* Don't overwrite window.t — it's already set by i18n.js */
    if (!window.__dpT) window.__dpT = T;

    function onReady(fn) {
        /* Run synchronously so all wrappers are in place before i18n.js wire() fires */
        if (document.readyState !== 'loading') { fn(); return; }
        document.addEventListener('DOMContentLoaded', fn);
    }

    /* ═══════════════════════════════════════════════════════════════════
       §1  TRANSLATION TABLE
    ═══════════════════════════════════════════════════════════════════ */
    var DP = {};

    DP.en = {
        /* Chart axis + dataset */
        x_last_n:        'Last {n} days',
        y_mood:          'Mood (1–10)',
        y_sleep:         'Sleep (hrs)',
        y_energy:        'Energy (1–10)',
        y_velocity:      'Mood change (day-over-day)',
        ds_mood:         'Mood',
        ds_sleep:        'Sleep',
        ds_energy:       'Energy',
        ds_avg_mood:     'Average mood',
        ds_forecast:     'Forecast',
        ds_lower:        'Lower',
        ds_upper:        'Upper',
        ds_trend:        'Trend',
        chip_avg:        'Avg {n}',
        chip_up:         '↗ Up {n} vs earlier',
        chip_down:       '↘ Down {n} vs earlier',
        chip_latest:     'Latest: {n} vs avg',
        chip_range:      'Range {min}–{max}',
        need_3:          'Need 3+ entries',
        /* Velocity chart tooltip */
        vel_improved:    'Mood improved by {n} point{s}',
        vel_dipped:      'Mood dipped by {n} point{s}',
        vel_no_change:   'No change',
        /* Velocity page */
        vel_eyebrow:     'MOOD TRAJECTORY',
        vel_heading:     'Day-to-day change',
        vel_subtitle:    'Bars above zero mean mood is improving; bars below mean it’s dipping.',
        /* Stability panel */
        stab_eyebrow:    '14-DAY STABILITY',
        stab_stable:     'Stable',
        stab_moderate:   'Moderate',
        stab_volatile:   'Volatile',
        stab_high_vol:   'High volatility',
        stab_msg_stable: 'Your mood has been consistent over the last 14 days.',
        stab_msg_mod:    'Some fluctuation in the last 14 days — within a normal range.',
        stab_msg_vol:    'Notable mood swings in the last 14 days. Sleep patterns may be a factor.',
        stab_msg_high:   'Significant mood volatility detected over the last 14 days.',
        stab_min_data:   'Track at least 5 days in a row to see your stability score.',
        stab_based_on:   'Based on {n} entries over the last 14 days.',
        /* Forecast chips */
        fc_days:         'Days of data',
        fc_avg:          'Recent avg',
        fc_7day:         '7-day forecast',
        fc_variability:  'Variability',
        /* Forecast interpretation */
        fc_trend_up_strong:   'Your mood has been on a steady upward trajectory.',
        fc_trend_up_gentle:   'There’s a gentle upward drift in your recent mood.',
        fc_trend_dn_strong:   'Your mood has been gradually trending downward lately.',
        fc_trend_dn_gentle:   'There’s a slight downward drift over recent weeks.',
        fc_trend_steady:      'Your mood has been holding fairly steady.',
        fc_stab_low:          'Your day-to-day variability is low, so the forecast band is narrow.',
        fc_stab_mid:          'Some day-to-day variability means the actual range could vary.',
        fc_stab_high:         'Your mood has been quite variable, so treat this forecast as a rough guide.',
        fc_sleep_up:          ' Recent sleep is above your average, which nudges the forecast up.',
        fc_sleep_dn:          ' Recent sleep is below your average, which pulls the forecast down slightly.',
        fc_pat_up:            'Your mood has been climbing gradually — a positive sign.',
        fc_pat_dn:            'There’s a gentle downward drift lately. Worth checking in on sleep and activity patterns.',
        fc_pat_stable:        'Your mood has been stable — consistent tracking is helping you see this clearly.',
        fc_low_var:           'Low day-to-day variability suggests good equilibrium.',
        fc_high_var:          'Higher variability in your recent data means the forecast range is wider than usual.',
        fc_sleep_good:        'Your recent sleep is better than your average — this is factored into the upward nudge.',
        fc_sleep_bad:         'Your recent sleep is a bit below your average — this slightly lowers the near-term forecast.',
        fc_best_day:          '{day}s tend to be your strongest day — this is built into the day-specific forecast.',
        fc_based_on:          'This forecast is based on your last {n} logged days. The more you track, the sharper it gets.',
        /* Insight badges */
        kicker_default:     'INSIGHT',
        kicker_activity:    'ACTIVITY INSIGHT',
        kicker_activity_p:  'ACTIVITY',
        kicker_sleep:       'SLEEP INSIGHT',
        kicker_stability:   'STABILITY',
        kicker_tags:        'TAGS',
        strength_strong:    'STRONG PATTERN',
        strength_moderate:  'MODERATE PATTERN',
        strength_emerging:  'EMERGING SIGNAL',
        insight_entry:      'entry',
        insight_entries:    'entries',
        insight_observed:   'Observed across {n} {entries}.',
        /* Insight card title/description (for i18n keys from engine) */
        insight_title_energy_alignment:    'Energy Alignment',
        insight_desc_energy_alignment:     'Your high-energy days (7+) average a mood of {highMood} vs {lowMood} on low-energy days. Energy and mood track together closely in your data.',
        insight_context_energy:            'Based on {highN} high-energy entries and {lowN} low-energy entries.',
        insight_title_mood_variable:       'Your mood has been more variable lately',
        insight_desc_mood_variable:        'Your mood swung by an average of {stdDev} points day-to-day this past week — higher than your usual pattern. Sleep consistency is often the hidden driver of this.',
        insight_nudge_volatility:          'Sleep and activity levels often drive short-term volatility.',
        insight_context_last_days:         'Based on the last {n} days.',
        insight_tag_lift:                  '"{tag}" days tend to lift you',
        insight_tag_weigh:                 '"{tag}" days weigh on you',
        insight_desc_tag_lift:              'On days tagged "{tag}" your mood averages {diff} points above your baseline. It\'s a reliable signal.',
        insight_desc_tag_weigh:            '"{tag}" days drag your average down by about {diff} points. Worth paying attention to what those days have in common.',
        insight_nudge_tag_weigh:           'Worth noticing what "{tag}" days have in common.',
        insight_context_tag_seen:          'Seen in {n} tagged entries.',
        /* Insight section meta */
        sec_sleep_heading:  'Sleep Insights',
        sec_sleep_title:    'Sleep Insights',
        sec_sleep_desc:     'Patterns between sleep and mood.',
        sec_act_heading:    'Activity Insights',
        sec_act_title:      'Activity Insights',
        sec_act_desc:       'Activities and energy patterns that connect with mood.',
        sec_stab_heading:   'Mood Stability',
        sec_stab_title:     'Mood Stability',
        sec_stab_desc:      'Signals around recent volatility, stability, and day-to-day mood change.',
        sec_tags_heading:   'Tag Insights',
        sec_tags_title:     'Tag Insights',
        sec_tags_desc:      'Recurring tags that appear associated with shifts in mood.',
        /* Energy section */
        energy_section:     'RHYTHM & STAMINA',
        energy_subtitle:    'Daily energy levels.',
        /* Check-in form */
        journal_ph:     'What stood out today? What affected your mood? What are you grateful for?',
        save_hint:      'Saved when you click <strong>Save Entry</strong> below, or press ⌘S.',
        act_ph:         'e.g. exercise, reading, work (comma-separated)',
        tag_ph:         'Add a tag…',
        /* Entry modal */
        modal_mood:     'MOOD',
        modal_energy:   'ENERGY',
        modal_sleep:    'SLEEP',
        modal_acts:     'ACTIVITIES',
        modal_tags:     'TAGS',
        modal_hrs:      'hrs',
        modal_edit:     'Edit Entry',
        modal_journal:  'Journal',
        modal_del:      '🗑 Delete entire entry for this day',
        /* Data page */
        recent:         'RECENT ENTRIES',
        tap_open:       'Tap to open',
        no_journal:     'No journal text saved',
        /* Dashboard narrative */
        no_checkin:     'No check-in yet today.',
        tagging:        'You’ve been tagging “{tag}” a lot lately.'
    };

    /* German – full deep-patch coverage */
    DP.de = {
        x_last_n:'Letzte {n} Tage', y_mood:'Stimmung (1–10)', y_sleep:'Schlaf (Std.)', y_energy:'Energie (1–10)', y_velocity:'Stimmungsveränderung (täglich)', ds_mood:'Stimmung', ds_sleep:'Schlaf', ds_energy:'Energie', ds_avg_mood:'Durchschnittliche Stimmung', ds_forecast:'Prognose', ds_lower:'Unteres Band', ds_upper:'Oberes Band', ds_trend:'Trend',
        chip_avg:'Ø {n}', chip_up:'↗ +{n} vs früher', chip_down:'↘ {n} vs früher', chip_latest:'Aktuell: {n} vs Ø', chip_range:'Bereich {min}–{max}', need_3:'Mindestens 3 Einträge',
        vel_improved:'Stimmung um {n} Punkt{s} gestiegen', vel_dipped:'Stimmung um {n} Punkt{s} gesunken', vel_no_change:'Keine Veränderung',
        vel_eyebrow:'STIMMUNGSVERLAUF', vel_heading:'Tägliche Veränderung', vel_subtitle:'Balken über null = Verbesserung; darunter = Rückgang.',
        stab_eyebrow:'14-TAGE-STABILITÄT', stab_stable:'Stabil', stab_moderate:'Moderat', stab_volatile:'Volatil', stab_high_vol:'Sehr volatil',
        stab_msg_stable:'Deine Stimmung war in den letzten 14 Tagen konsistent.', stab_msg_mod:'Leichte Schwankungen in den letzten 14 Tagen — im Normalbereich.', stab_msg_vol:'Merkliche Stimmungsschwankungen in den letzten 14 Tagen. Schlafmuster können ein Faktor sein.', stab_msg_high:'Erhebliche Stimmungsvolatilität in den letzten 14 Tagen festgestellt.', stab_min_data:'Erfasse mindestens 5 Tage in Folge, um deinen Stabilitätswert zu sehen.', stab_based_on:'Basierend auf {n} Einträgen der letzten 14 Tage.',
        fc_days:'Datentage', fc_avg:'Aktueller Ø', fc_7day:'7-Tage-Prognose', fc_variability:'Variabilität',
        fc_trend_up_strong:'Deine Stimmung befindet sich auf einem stetigen Aufwärtstrend.', fc_trend_up_gentle:'Es gibt einen leichten Aufwärtsdrift in deiner letzten Stimmung.', fc_trend_dn_strong:'Deine Stimmung zeigt zuletzt einen langsamen Abwärtstrend.', fc_trend_dn_gentle:'Es gibt einen leichten Abwärtsdrift über die letzten Wochen.', fc_trend_steady:'Deine Stimmung war zuletzt recht stabil.',
        fc_stab_low:'Deine tägliche Variabilität ist gering, daher ist das Prognoseband schmal.', fc_stab_mid:'Einige tägliche Schwankungen bedeuten, dass der tatsächliche Bereich variieren kann.', fc_stab_high:'Deine Stimmung war sehr variabel — betrachte diese Prognose als grobe Richtlinie.',
        fc_sleep_up:' Dein letzter Schlaf liegt über deinem Durchschnitt, was die Prognose nach oben schiebt.', fc_sleep_dn:' Dein letzter Schlaf liegt unter deinem Durchschnitt, was die Prognose leicht nach unten zieht.',
        fc_pat_up:'Deine Stimmung steigt langsam — ein positives Zeichen.', fc_pat_dn:'Es gibt einen leichten Abwärtsdrift. Es lohnt sich, Schlaf- und Aktivitätsmuster zu überprüfen.', fc_pat_stable:'Deine Stimmung war stabil — konsequentes Erfassen hilft dir, das zu erkennen.',
        fc_low_var:'Geringe tägliche Variabilität deutet auf gutes Gleichgewicht hin.', fc_high_var:'Höhere Variabilität bedeutet, dass das Prognoseband breiter als üblich ist.',
        fc_sleep_good:'Dein letzter Schlaf ist besser als dein Durchschnitt — das fließt in die Aufwärtskorrektur ein.', fc_sleep_bad:'Dein letzter Schlaf ist etwas unter deinem Durchschnitt — das senkt die kurzfristige Prognose leicht.',
        fc_best_day:'{day}e sind tendenziell dein stärkster Tag — das ist in der tagespezifischen Prognose berücksichtigt.', fc_based_on:'Diese Prognose basiert auf deinen letzten {n} erfassten Tagen. Je mehr du erfasst, desto schärfer wird sie.',
        kicker_default:'EINBLICK', kicker_activity:'AKTIVITÄTS-EINBLICK', kicker_activity_p:'AKTIVITÄT', kicker_sleep:'SCHLAF-EINBLICK', kicker_stability:'STABILITÄT', kicker_tags:'TAGS',
        strength_strong:'STARKES MUSTER', strength_moderate:'MODERATES MUSTER', strength_emerging:'AUFKOMMENDES MUSTER',
        insight_entry:'Eintrag', insight_entries:'Einträge', insight_observed:'Beobachtet in {n} {entries}.',
        sec_sleep_heading:'Schlaf-Einblicke', sec_sleep_title:'Schlaf-Einblicke', sec_sleep_desc:'Muster zwischen Schlaf und Stimmung.',
        sec_act_heading:'Aktivitäts-Einblicke', sec_act_title:'Aktivitäts-Einblicke', sec_act_desc:'Aktivitäten und Energiemuster, die mit der Stimmung zusammenhängen.',
        sec_stab_heading:'Stimmungsstabilität', sec_stab_title:'Stimmungsstabilität', sec_stab_desc:'Signale zu aktueller Volatilität, Stabilität und täglichen Stimmungsänderungen.',
        sec_tags_heading:'Tag-Einblicke', sec_tags_title:'Tag-Einblicke', sec_tags_desc:'Wiederkehrende Tags, die mit Stimmungsänderungen verbunden sind.',
        energy_section:'RHYTHMUS & AUSDAUER', energy_subtitle:'Tägliche Energieniveaus.',
        journal_ph:'Was war heute bedeutsam? Was hat deine Stimmung beeinflusst? Wofür bist du dankbar?', save_hint:'Gespeichert, wenn du auf <strong>Eintrag speichern</strong> klickst oder ⌘S drückst.', act_ph:'z.\u00A0B. Sport, Lesen, Arbeit (kommagetrennt)', tag_ph:'Tag hinzufügen…',
        modal_mood:'STIMMUNG', modal_energy:'ENERGIE', modal_sleep:'SCHLAF', modal_acts:'AKTIVITÄTEN', modal_tags:'TAGS', modal_hrs:'Std.', modal_edit:'Eintrag bearbeiten', modal_journal:'Tagebuch', modal_del:'🗑 Gesamten Eintrag für diesen Tag löschen',
        recent:'LETZTE EINTRÄGE', tap_open:'Tippen zum Öffnen', no_journal:'Kein Tagebuchtext gespeichert',
        no_checkin:'Noch kein Check-in heute.', tagging:'Du hast „{tag}“ in letzter Zeit oft getaggt.',
        /* Extras used only by deep patch */
        narrative_start:'Beginne mit deinem ersten Check-in, um hier Muster zu sehen.',
        narrative_trend_up:'Deine Stimmung ist diese Woche gestiegen.',
        narrative_trend_down:'Deine Stimmung ist diese Woche etwas gesunken.',
        narrative_steady:'Deine Stimmung war diese Woche stabil.',
        narrative_logged:'Heute hast du eine {moodLabel} Stimmung von {n} erfasst.',
        narrative_strong:'starke',
        narrative_moderate:'mittlere',
        narrative_low:'niedrige',
        streak_days:'{n}-Tage-Serie — weiter so.',
        streak_day:'Tag {n} deiner Serie.',
        entry_list_empty:'Noch keine Tagebucheinträge.',
        entry_list_start:'Starte deinen ersten Check-in →',
        no_entries_tagged:'Noch keine Einträge mit dem Tag „{tag}“.',
        entry_edit:'Bearbeiten',
        entry_delete:'Löschen',
        fc_add_7:'Füge mindestens 7 Tage Daten hinzu, um Vorhersagen zu sehen.',
        fc_keep_tracking:'Bleib beim Erfassen, um Muster und Auslöser zu entdecken.',
        toast_saved:'Eintrag gespeichert ✓',
        toast_journal_deleted:'Tagebuch gelöscht',
        toast_entry_deleted:'Eintrag gelöscht',
        toast_shared:'Geteilte Inhalte zum Tagebuch hinzugefügt',
        toast_lang:'Sprache aktualisiert ✓',
        toast_date:'Datumsformat aktualisiert ✓',
        toast_time:'Zeitformat aktualisiert ✓',
        ds_not_enough:'Noch nicht genug Daten, um eine Zusammenfassung zu erstellen.',
        ds_journal_only:'Du hast heute einen Tagebucheintrag erfasst. Es wurden keine Stimmungsdaten gespeichert.',
        ds_photos_only:'Du hast Fotos für diesen Tag gespeichert, ohne weitere Daten.',
        ds_mood_only:'Für heute wurde nur die Stimmung erfasst.',
        dow_need_more:'Füge mindestens 2 Wochen Einträge hinzu, um deine Wochenmuster zu sehen.',
        dow_no_data:'Keine Daten',
        dow_average:'Durchschnitt',
        dow_peak_dip:'Deine Stimmung ist an {day1} am höchsten und an {day2} am niedrigsten.',
        insight_title_energy_alignment:'Energie-Stimmungs-Einklang',
        insight_desc_energy_alignment:'An Tagen mit hoher Energie (7+) liegt deine Stimmung im Schnitt bei {highMood} vs {lowMood} an energiearmen Tagen. Energie und Stimmung gehen in deinen Daten eng einher.',
        insight_context_energy:'Basierend auf {highN} Einträgen mit hoher und {lowN} mit niedriger Energie.',
        insight_title_mood_variable:'Deine Stimmung war zuletzt wechselhafter',
        insight_desc_mood_variable:'Deine Stimmung schwankte diese Woche im Schnitt um {stdDev} Punkte von Tag zu Tag — mehr als sonst. Schlafkonsistenz ist oft der versteckte Treiber.',
        insight_nudge_volatility:'Schlaf und Aktivität beeinflussen oft die kurzfristige Volatilität.',
        insight_context_last_days:'Basierend auf den letzten {n} Tagen.',
        insight_tag_lift:'„{tag}“-Tage heben dich tendenziell',
        insight_tag_weigh:'„{tag}“-Tage belasten dich',
        insight_desc_tag_lift:'An Tagen mit Tag „{tag}“ liegt deine Stimmung im Schnitt {diff} Punkte über deinem Basiswert. Ein zuverlässiges Signal.',
        insight_desc_tag_weigh:'„{tag}“-Tage ziehen deinen Schnitt um etwa {diff} Punkte nach unten. Achte darauf, was diese Tage gemeinsam haben.',
        insight_nudge_tag_weigh:'Achte darauf, was „{tag}“-Tage gemeinsam haben.',
        insight_context_tag_seen:'In {n} getaggten Einträgen.',
        insight_empty:'Weitere Einblicke erscheinen, wenn du mehr Einträge mit Stimmung, Schlaf und Aktivitäten erfasst.',
        insight_collecting:'Sobald genügend Daten vorhanden sind, werden hier Einblicke angezeigt.',
        chart_empty_mood_msg:'Dein Stimmungsverlauf erscheint hier, sobald du einige Tage erfasst hast.',
        chart_empty_sleep_msg:'Schlafmuster werden sichtbar, sobald du täglich protokollierst.',
        chart_empty_energy_msg:'Energiedaten erwecken dieses Diagramm zum Leben — erfasse deinen ersten Check-in.',
        chart_empty_velocity_msg:'Erfasse mindestens zwei aufeinanderfolgende Tage, um die Tagesveränderung zu sehen.',
        chart_empty_default:'Füge Einträge hinzu, um dieses Diagramm zu sehen.',
        chart_empty_mood_cta:'Ersten Stimmungswert erfassen',
        chart_empty_sleep_cta:'Schlafdaten hinzufügen',
        chart_empty_energy_cta:'Energie erfassen',
        chart_empty_velocity_cta:'Mindestens 2 Tage erfassen'
    };

    /* Extra keys for wrappers (narrative, entry list, toast, forecast, daily summary, chart empty) */
    Object.assign(DP.en, {
        narrative_start: 'Start logging your first check-in to see patterns emerge here.',
        narrative_trend_up: 'Your mood has been climbing this week.',
        narrative_trend_down: 'Your mood has dipped a little this week.',
        narrative_steady: 'Your mood has been steady this week.',
        narrative_logged: 'Today you logged {moodLabel} mood of {n}.',
        narrative_strong: 'a strong',
        narrative_moderate: 'a moderate',
        narrative_low: 'a low',
        streak_days: '{n}-day streak—keep it up.',
        streak_day: 'Day {n} of your streak.',
        entry_list_empty: 'No journal entries yet.',
        entry_list_start: 'Start your first check-in →',
        no_entries_tagged: 'No entries tagged "{tag}" yet.',
        entry_edit: 'Edit',
        entry_delete: 'Delete',
        fc_add_7: 'Add at least 7 days of data to see predictions.',
        fc_keep_tracking: 'Keep tracking to discover patterns and triggers.',
        toast_saved: 'Entry saved successfully ✓',
        toast_journal_deleted: 'Journal deleted',
        toast_entry_deleted: 'Entry deleted',
        toast_shared: 'Shared content added to journal',
        toast_lang: 'Language updated ✓',
        toast_date: 'Date format updated ✓',
        toast_time: 'Time format updated ✓',
        ds_not_enough: 'Not enough data to generate a summary yet.',
        ds_journal_only: 'You recorded a journal entry today. No mood data was logged.',
        ds_photos_only: 'You saved photos for this day, with no mood data logged.',
        ds_mood_only: 'Mood was recorded today without additional metrics.',
        dow_need_more: 'Add at least 2 weeks of entries to see your weekly patterns.',
        dow_no_data: 'No data',
        dow_average: 'average',
        dow_peak_dip: 'Your mood tends to peak on {day1}s and dip on {day2}s.',
        insight_empty: 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.',
        insight_collecting: 'Insights will appear once enough data has been collected.',
        chart_empty_mood_msg: 'Your mood trend will appear here once you have logged a few days.',
        chart_empty_sleep_msg: 'Sleep patterns emerge once you start tracking daily.',
        chart_empty_energy_msg: 'Energy data gives this chart life — log your first check-in.',
        chart_empty_velocity_msg: 'Track at least two consecutive days to see day-over-day change.',
        chart_empty_default: 'Add entries to see this chart.',
        chart_empty_mood_cta: 'Log your first mood',
        chart_empty_sleep_cta: 'Add sleep data',
        chart_empty_energy_cta: 'Track your energy',
        chart_empty_velocity_cta: 'Track 2+ days of mood'
    });

    /* French – insight card strings */
    DP.fr = DP.fr || {};
    Object.assign(DP.fr, {
        insight_title_energy_alignment: 'Alignement énergie',
        insight_desc_energy_alignment: 'Les jours à haute énergie (7+) ont une humeur moyenne de {highMood} vs {lowMood} les jours à faible énergie. Énergie et humeur sont étroitement liées dans vos données.',
        insight_context_energy: 'Basé sur {highN} entrées à haute énergie et {lowN} à faible énergie.',
        insight_title_mood_variable: 'Votre humeur a été plus variable récemment',
        insight_desc_mood_variable: 'Votre humeur a varié en moyenne de {stdDev} points au jour le jour cette semaine — plus que d\'habitude. La régularité du sommeil en est souvent la cause.',
        insight_nudge_volatility: 'Le sommeil et l\'activité alimentent souvent la volatilité à court terme.',
        insight_context_last_days: 'Basé sur les {n} derniers jours.',
        insight_tag_lift: 'Les jours « {tag} » vous font du bien',
        insight_tag_weigh: 'Les jours « {tag} » vous pèsent',
        insight_desc_tag_lift: 'Les jours tagués « {tag} » ont une humeur moyenne de {diff} points au-dessus de votre baseline. Signal fiable.',
        insight_desc_tag_weigh: 'Les jours « {tag} » tirent votre moyenne d\'environ {diff} points. Portez attention à ce que ces jours ont en commun.',
        insight_nudge_tag_weigh: 'Remarquez ce que les jours « {tag} » ont en commun.',
        insight_context_tag_seen: 'Vu dans {n} entrées taguées.'
    });

    /* Spanish */
    DP.es = {
        x_last_n:'Últimos {n} días', y_mood:'Ánimo (1–10)', y_sleep:'Sueño (horas)', y_energy:'Energía (1–10)', y_velocity:'Cambio de ánimo (diario)',
        ds_mood:'Ánimo', ds_sleep:'Sueño', ds_energy:'Energía', ds_avg_mood:'Ánimo promedio', ds_forecast:'Pronóstico', ds_lower:'Límite inferior', ds_upper:'Límite superior', ds_trend:'Tendencia',
        chip_avg:'Prom. {n}', chip_up:'↗ +{n} vs antes', chip_down:'↘ {n} vs antes', chip_latest:'Último: {n} vs prom.', chip_range:'Rango {min}–{max}', need_3:'Se necesitan 3+ entradas',
        vel_improved:'Ánimo mejoró {n} punto{s}', vel_dipped:'Ánimo bajó {n} punto{s}', vel_no_change:'Sin cambio',
        vel_eyebrow:'TRAYECTORIA', vel_heading:'Cambio diario', vel_subtitle:'Barras sobre cero = mejora; debajo = bajada.',
        stab_eyebrow:'ESTABILIDAD 14 DÍAS', stab_stable:'Estable', stab_moderate:'Moderado', stab_volatile:'Volátil', stab_high_vol:'Muy volátil',
        stab_msg_stable:'Tu ánimo ha sido consistente en los últimos 14 días.', stab_msg_mod:'Algunas fluctuaciones en los últimos 14 días — dentro del rango normal.', stab_msg_vol:'Cambios notables en los últimos 14 días. Los patrones de sueño pueden ser un factor.', stab_msg_high:'Volatilidad significativa detectada en los últimos 14 días.', stab_min_data:'Registra al menos 5 días seguidos para ver tu puntuación de estabilidad.', stab_based_on:'Basado en {n} entradas de los últimos 14 días.',
        fc_days:'Días de datos', fc_avg:'Prom. reciente', fc_7day:'Pronóstico 7 días', fc_variability:'Variabilidad',
        fc_trend_up_strong:'Tu ánimo ha estado en una trayectoria ascendente constante.', fc_trend_up_gentle:'Hay una suave tendencia al alza en tu ánimo reciente.', fc_trend_dn_strong:'Tu ánimo ha tendido gradualmente a la baja últimamente.', fc_trend_dn_gentle:'Hay una ligera tendencia a la baja en las últimas semanas.', fc_trend_steady:'Tu ánimo se ha mantenido bastante estable.',
        fc_stab_low:'Tu variabilidad diaria es baja, por lo que la banda de pronóstico es estrecha.', fc_stab_mid:'Alguna variabilidad diaria significa que el rango real puede variar.', fc_stab_high:'Tu ánimo ha sido muy variable — toma este pronóstico como guía aproximada.',
        fc_sleep_up:' Tu sueño reciente está por encima de tu promedio, lo que empuja el pronóstico al alza.', fc_sleep_dn:' Tu sueño reciente está por debajo de tu promedio, lo que baja un poco el pronóstico.',
        fc_pat_up:'Tu ánimo ha ido subiendo gradualmente — una señal positiva.', fc_pat_dn:'Hay una ligera tendencia a la baja. Vale la pena revisar los patrones de sueño y actividad.', fc_pat_stable:'Tu ánimo ha sido estable — el seguimiento consistente te ayuda a verlo claramente.',
        fc_low_var:'La baja variabilidad diaria sugiere buen equilibrio.', fc_high_var:'Mayor variabilidad significa que la banda de pronóstico es más amplia de lo usual.',
        fc_sleep_good:'Tu sueño reciente es mejor que tu promedio — esto se refleja en el ajuste al alza.', fc_sleep_bad:'Tu sueño reciente está algo por debajo de tu promedio — esto baja levemente el pronóstico a corto plazo.',
        fc_best_day:'Los {day}s tienden a ser tu día más fuerte — esto está incorporado en el pronóstico específico.', fc_based_on:'Este pronóstico se basa en tus últimos {n} días registrados. Cuanto más registres, más preciso será.',
        kicker_default:'PERSPECTIVA', kicker_activity:'PERSPECTIVA DE ACTIVIDAD', kicker_activity_p:'ACTIVIDAD', kicker_sleep:'PERSPECTIVA DE SUEÑO', kicker_stability:'ESTABILIDAD', kicker_tags:'ETIQUETAS',
        strength_strong:'PATRÓN FUERTE', strength_moderate:'PATRÓN MODERADO', strength_emerging:'SEÑAL EMERGENTE',
        insight_entry:'entrada', insight_entries:'entradas', insight_observed:'Observado en {n} {entries}.',
        insight_title_energy_alignment:'Alineación de energía', insight_desc_energy_alignment:'Tus días de alta energía (7+) promedian un ánimo de {highMood} vs {lowMood} en días de baja energía. Energía y ánimo van juntos en tus datos.', insight_context_energy:'Basado en {highN} entradas de alta energía y {lowN} de baja energía.',
        insight_title_mood_variable:'Tu ánimo ha sido más variable últimamente', insight_desc_mood_variable:'Tu ánimo varió en promedio {stdDev} puntos día a día esta semana — más de lo habitual. La consistencia del sueño suele ser el factor oculto.', insight_nudge_volatility:'El sueño y la actividad suelen impulsar la volatilidad a corto plazo.', insight_context_last_days:'Basado en los últimos {n} días.',
        insight_tag_lift:'Los días de "{tag}" tienden a animarte', insight_tag_weigh:'Los días de "{tag}" te pesan', insight_desc_tag_lift:'En días etiquetados con "{tag}" tu ánimo promedia {diff} puntos por encima de tu línea base. Es una señal confiable.', insight_desc_tag_weigh:'Los días de "{tag}" bajan tu promedio unos {diff} puntos. Vale la pena observar qué tienen en común.', insight_nudge_tag_weigh:'Observa qué tienen en común los días de "{tag}".', insight_context_tag_seen:'Visto en {n} entradas etiquetadas.',
        sec_sleep_heading:'Perspectivas de sueño', sec_sleep_title:'Perspectivas de sueño', sec_sleep_desc:'Patrones entre sueño y ánimo.',
        sec_act_heading:'Perspectivas de actividad', sec_act_title:'Perspectivas de actividad', sec_act_desc:'Actividades y patrones de energía que se conectan con el ánimo.',
        sec_stab_heading:'Estabilidad del ánimo', sec_stab_title:'Estabilidad del ánimo', sec_stab_desc:'Señales sobre volatilidad reciente, estabilidad y cambio diario del ánimo.',
        sec_tags_heading:'Perspectivas de etiquetas', sec_tags_title:'Perspectivas de etiquetas', sec_tags_desc:'Etiquetas recurrentes asociadas con cambios en el ánimo.',
        energy_section:'RITMO Y RESISTENCIA', energy_subtitle:'Niveles de energía diarios.',
        journal_ph:'¿Qué destacó hoy? ¿Qué afectó tu ánimo? ¿Por qué estás agradecido?', save_hint:'Guardado al hacer clic en <strong>Guardar entrada</strong>, o presiona ⌘S.', act_ph:'ej. ejercicio, lectura, trabajo (separados por comas)', tag_ph:'Añadir etiqueta…',
        modal_mood:'ÁNIMO', modal_energy:'ENERGÍA', modal_sleep:'SUEÑO', modal_acts:'ACTIVIDADES', modal_tags:'ETIQUETAS', modal_hrs:'hrs', modal_edit:'Editar entrada', modal_journal:'Diario', modal_del:'🗑 Eliminar toda la entrada de este día',
        recent:'ENTRADAS RECIENTES', tap_open:'Toca para abrir', no_journal:'Sin texto de diario guardado',
        no_checkin:'No hay check-in hoy todavía.', tagging:'Has etiquetado "{tag}" mucho últimamente.',
        narrative_start:'Empieza registrando tu primer check-in para ver patrones aquí.', narrative_trend_up:'Tu ánimo ha ido subiendo esta semana.', narrative_trend_down:'Tu ánimo ha bajado un poco esta semana.', narrative_steady:'Tu ánimo ha sido estable esta semana.',
        narrative_logged:'Hoy registraste un ánimo de {n} ({moodLabel}).', narrative_strong:'alto', narrative_moderate:'moderado', narrative_low:'bajo',
        streak_days:'Racha de {n} días — ¡sigue así!', streak_day:'Día {n} de tu racha.',
        entry_list_empty:'Aún no hay entradas de diario.', entry_list_start:'Comienza tu primer check-in →', no_entries_tagged:'Aún no hay entradas con la etiqueta "{tag}".', entry_edit:'Editar', entry_delete:'Eliminar',
        fc_add_7:'Agrega al menos 7 días de datos para ver predicciones.', fc_keep_tracking:'Sigue registrando para descubrir patrones y desencadenantes.',
        toast_saved:'Entrada guardada ✓', toast_journal_deleted:'Diario eliminado', toast_entry_deleted:'Entrada eliminada', toast_shared:'Contenido compartido añadido al diario', toast_lang:'Idioma actualizado ✓', toast_date:'Formato de fecha actualizado ✓', toast_time:'Formato de hora actualizado ✓',
        ds_not_enough:'No hay suficientes datos para generar un resumen todavía.', ds_journal_only:'Registraste una entrada de diario hoy. No se guardaron datos de ánimo.', ds_photos_only:'Guardaste fotos para este día, sin datos de ánimo.', ds_mood_only:'Solo se registró el ánimo hoy.',
        dow_need_more:'Agrega al menos 2 semanas de entradas para ver tus patrones semanales.', dow_no_data:'Sin datos', dow_average:'promedio', dow_peak_dip:'Tu ánimo tiende a alcanzar su punto máximo los {day1}s y el mínimo los {day2}s.',
        insight_empty:'Aparecerán más perspectivas al registrar entradas adicionales. Registra ánimo, sueño y actividades para descubrir patrones.', insight_collecting:'Las perspectivas aparecerán cuando haya suficientes datos.',
        chart_empty_mood_msg:'Tu tendencia de ánimo aparecerá aquí una vez que hayas registrado algunos días.', chart_empty_sleep_msg:'Los patrones de sueño emergen una vez que empieces a seguirlos diariamente.', chart_empty_energy_msg:'Los datos de energía dan vida a este gráfico — registra tu primer check-in.', chart_empty_velocity_msg:'Registra al menos dos días consecutivos para ver el cambio día a día.',
        chart_empty_default:'Agrega entradas para ver este gráfico.', chart_empty_mood_cta:'Registra tu primer ánimo', chart_empty_sleep_cta:'Añadir datos de sueño', chart_empty_energy_cta:'Registra tu energía', chart_empty_velocity_cta:'Registra 2+ días de ánimo'
    };

    /* Arabic */
    DP.ar = {
        x_last_n:'\u0622\u062e\u0631 {n} \u064a\u0648\u0645\u0627\u064b', y_mood:'\u0627\u0644\u0645\u0632\u0627\u062c (1\u201310)', y_sleep:'\u0627\u0644\u0646\u0648\u0645 (\u0633\u0627\u0639\u0627\u062a)', y_energy:'\u0627\u0644\u0637\u0627\u0642\u0629 (1\u201310)', y_velocity:'\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0645\u0632\u0627\u062c (\u064a\u0648\u0645\u064a\u0627\u064b)',
        ds_mood:'\u0627\u0644\u0645\u0632\u0627\u062c', ds_sleep:'\u0627\u0644\u0646\u0648\u0645', ds_energy:'\u0627\u0644\u0637\u0627\u0642\u0629', ds_avg_mood:'\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u0645\u0632\u0627\u062c', ds_forecast:'\u062a\u0648\u0642\u0639', ds_lower:'\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u062f\u0646\u0649', ds_upper:'\u0627\u0644\u062d\u062f \u0627\u0644\u0623\u0639\u0644\u0649', ds_trend:'\u0627\u062a\u062c\u0627\u0647',
        chip_avg:'\u0645\u062a\u0648\u0633\u0637 {n}', chip_up:'\u2197 +{n} \u0645\u0642\u0627\u0631\u0646\u0629\u064b \u0628\u0627\u0644\u0633\u0627\u0628\u0642', chip_down:'\u2198 {n} \u0645\u0642\u0627\u0631\u0646\u0629\u064b \u0628\u0627\u0644\u0633\u0627\u0628\u0642', chip_latest:'\u0627\u0644\u0623\u062e\u064a\u0631: {n} \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u062a\u0648\u0633\u0637', chip_range:'\u0646\u0637\u0627\u0642 {min}\u2013{max}', need_3:'\u064a\u0644\u0632\u0645 3 \u0633\u062c\u0644\u0627\u062a \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644',
        vel_improved:'\u062a\u062d\u0633\u0651\u0646 \u0627\u0644\u0645\u0632\u0627\u062c \u0628\u0645\u0642\u062f\u0627\u0631 {n} \u0646\u0642\u0637\u0629', vel_dipped:'\u0627\u0646\u062e\u0641\u0636 \u0627\u0644\u0645\u0632\u0627\u062c \u0628\u0645\u0642\u062f\u0627\u0631 {n} \u0646\u0642\u0637\u0629', vel_no_change:'\u0644\u0627 \u062a\u063a\u064a\u064a\u0631',
        vel_eyebrow:'\u0645\u0633\u0627\u0631 \u0627\u0644\u0645\u0632\u0627\u062c', vel_heading:'\u0627\u0644\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645\u064a', vel_subtitle:'\u0627\u0644\u0623\u0639\u0645\u062f\u0629 \u0641\u0648\u0642 \u0627\u0644\u0635\u0641\u0631 \u062a\u0639\u0646\u064a \u062a\u062d\u0633\u0646\u0627\u064b\u060c \u0648\u062a\u062d\u062a\u0647\u0627 \u062a\u0639\u0646\u064a \u0627\u0646\u062e\u0641\u0627\u0636\u0627\u064b.',
        stab_eyebrow:'\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629 14 \u064a\u0648\u0645\u0627\u064b', stab_stable:'\u0645\u0633\u062a\u0642\u0631', stab_moderate:'\u0645\u0639\u062a\u062f\u0644', stab_volatile:'\u0645\u062a\u0642\u0644\u0628', stab_high_vol:'\u0634\u062f\u064a\u062f \u0627\u0644\u062a\u0642\u0644\u0628',
        stab_msg_stable:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u062a\u0633\u0642\u0627\u064b \u062e\u0644\u0627\u0644 \u0627\u0644\u0640 14 \u064a\u0648\u0645\u0627\u064b \u0627\u0644\u0645\u0627\u0636\u064a\u0629.', stab_msg_mod:'\u062a\u0630\u0628\u0630\u0628\u0627\u062a \u0637\u0641\u064a\u0641\u0629 \u062e\u0644\u0627\u0644 \u0627\u0644\u0640 14 \u064a\u0648\u0645\u0627\u064b \u2014 \u0636\u0645\u0646 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0637\u0628\u064a\u0639\u064a.', stab_msg_vol:'\u062a\u0630\u0628\u0630\u0628\u0627\u062a \u0645\u0644\u062d\u0648\u0638\u0629 \u062e\u0644\u0627\u0644 \u0627\u0644\u0640 14 \u064a\u0648\u0645\u0627\u064b. \u0642\u062f \u062a\u0643\u0648\u0646 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0646\u0648\u0645 \u0639\u0627\u0645\u0644\u0627\u064b.', stab_msg_high:'\u062a\u0630\u0628\u0630\u0628 \u0643\u0628\u064a\u0631 \u0641\u064a \u0627\u0644\u0645\u0632\u0627\u062c \u062e\u0644\u0627\u0644 \u0627\u0644\u0640 14 \u064a\u0648\u0645\u0627\u064b \u0627\u0644\u0645\u0627\u0636\u064a\u0629.', stab_min_data:'\u0633\u062c\u0644 5 \u0623\u064a\u0627\u0645 \u0645\u062a\u062a\u0627\u0644\u064a\u0629 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0631\u0624\u064a\u0629 \u062f\u0631\u062c\u0629 \u0627\u0644\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629.', stab_based_on:'\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 {n} \u0633\u062c\u0644 \u0641\u064a \u0622\u062e\u0631 14 \u064a\u0648\u0645\u0627\u064b.',
        fc_days:'\u0623\u064a\u0627\u0645 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a', fc_avg:'\u0645\u062a\u0648\u0633\u0637 \u0623\u062e\u064a\u0631', fc_7day:'\u062a\u0648\u0642\u0639\u0627\u062a 7 \u0623\u064a\u0627\u0645', fc_variability:'\u062a\u063a\u064a\u064a\u0631\u064a\u0629',
        fc_trend_up_strong:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0641\u064a \u0645\u0633\u0627\u0631 \u062a\u0635\u0627\u0639\u062f\u064a \u062b\u0627\u0628\u062a.', fc_trend_up_gentle:'\u062b\u0645\u0629 \u0627\u0631\u062a\u0641\u0627\u0639 \u0637\u0641\u064a\u0641 \u0641\u064a \u0645\u0632\u0627\u062c\u0643 \u0627\u0644\u0623\u062e\u064a\u0631.', fc_trend_dn_strong:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u064a\u062a\u062c\u0647 \u062a\u062f\u0631\u064a\u062c\u064a\u0627\u064b \u0646\u062d\u0648 \u0627\u0644\u0623\u0633\u0641\u0644.', fc_trend_dn_gentle:'\u062b\u0645\u0629 \u0627\u0646\u062e\u0641\u0627\u0636 \u062e\u0641\u064a\u0641 \u062e\u0644\u0627\u0644 \u0627\u0644\u0623\u0633\u0627\u0628\u064a\u0639 \u0627\u0644\u0623\u062e\u064a\u0631\u0629.', fc_trend_steady:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u0633\u062a\u0642\u0631\u0627\u064b \u0625\u0644\u0649 \u062d\u062f \u0645\u0639\u0642\u0648\u0644.',
        fc_stab_low:'\u062a\u063a\u064a\u064a\u0631\u064a\u062a\u0643 \u0627\u0644\u064a\u0648\u0645\u064a\u0629 \u0645\u0646\u062e\u0641\u0636\u0629\u060c \u0644\u0630\u0627 \u0641\u0646\u0637\u0627\u0642 \u0627\u0644\u062a\u0648\u0642\u0639 \u0636\u064a\u0642.', fc_stab_mid:'\u0628\u0639\u0636 \u0627\u0644\u062a\u063a\u064a\u0631\u0627\u062a \u0627\u0644\u064a\u0648\u0645\u064a\u0629 \u062a\u0639\u0646\u064a \u0623\u0646 \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0641\u0639\u0644\u064a \u0642\u062f \u064a\u062e\u062a\u0644\u0641.', fc_stab_high:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u062a\u0642\u0644\u0628\u0627\u064b \u062c\u062f\u0627\u064b \u2014 \u062a\u0639\u0627\u0645\u0644 \u0645\u0639 \u0647\u0630\u0627 \u0627\u0644\u062a\u0648\u0642\u0639 \u0643\u062f\u0644\u064a\u0644 \u062a\u0642\u0631\u064a\u0628\u064a.',
        fc_sleep_up:' \u0646\u0648\u0645\u0643 \u0627\u0644\u0623\u062e\u064a\u0631 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643\u060c \u0645\u0645\u0627 \u064a\u062f\u0641\u0639 \u0627\u0644\u062a\u0648\u0642\u0639 \u0644\u0644\u0623\u0639\u0644\u0649.', fc_sleep_dn:' \u0646\u0648\u0645\u0643 \u0627\u0644\u0623\u062e\u064a\u0631 \u0623\u0642\u0644 \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643\u060c \u0645\u0645\u0627 \u064a\u062e\u0641\u0636 \u0627\u0644\u062a\u0648\u0642\u0639 \u0642\u0644\u064a\u0644\u0627\u064b.',
        fc_pat_up:'\u0645\u0632\u0627\u062c\u0643 \u064a\u062a\u062d\u0633\u0646 \u062a\u062f\u0631\u064a\u062c\u064a\u0627\u064b \u2014 \u0625\u0634\u0627\u0631\u0629 \u0625\u064a\u062c\u0627\u0628\u064a\u0629.', fc_pat_dn:'\u062b\u0645\u0629 \u0627\u0646\u062e\u0641\u0627\u0636 \u062e\u0641\u064a\u0641. \u064a\u0633\u062a\u062d\u0633\u0646 \u0645\u0631\u0627\u062c\u0639\u0629 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0646\u0634\u0627\u0637.', fc_pat_stable:'\u0645\u0632\u0627\u062c\u0643 \u0645\u0633\u062a\u0642\u0631 \u2014 \u0627\u0644\u062a\u062a\u0628\u0639 \u0627\u0644\u0645\u0646\u062a\u0638\u0645 \u064a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0631\u0624\u064a\u0629 \u0630\u0644\u0643 \u0628\u0648\u0636\u0648\u062d.',
        fc_low_var:'\u0627\u0646\u062e\u0641\u0627\u0636 \u0627\u0644\u062a\u063a\u064a\u0631\u064a\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629 \u064a\u0634\u064a\u0631 \u0625\u0644\u0649 \u062a\u0648\u0627\u0632\u0646 \u062c\u064a\u062f.', fc_high_var:'\u062a\u063a\u064a\u0631\u064a\u0629 \u0623\u0639\u0644\u0649 \u062a\u0639\u0646\u064a \u0646\u0637\u0627\u0642 \u062a\u0648\u0642\u0639 \u0623\u0648\u0633\u0639 \u0645\u0646 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.',
        fc_sleep_good:'\u0646\u0648\u0645\u0643 \u0627\u0644\u0623\u062e\u064a\u0631 \u0623\u0641\u0636\u0644 \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643 \u2014 \u0647\u0630\u0627 \u064a\u0646\u0639\u0643\u0633 \u0641\u064a \u0627\u0644\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u062a\u0635\u0627\u0639\u062f\u064a.', fc_sleep_bad:'\u0646\u0648\u0645\u0643 \u0627\u0644\u0623\u062e\u064a\u0631 \u0623\u0642\u0644 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643 \u2014 \u0647\u0630\u0627 \u064a\u062e\u0641\u0636 \u0627\u0644\u062a\u0648\u0642\u0639 \u0642\u0644\u064a\u0644\u0627\u064b.',
        fc_best_day:'\u0623\u064a\u0627\u0645 \u0627\u0644{day} \u062a\u0645\u064a\u0644 \u0644\u062a\u0643\u0648\u0646 \u0623\u0642\u0648\u0649 \u0623\u064a\u0627\u0645\u0643 \u2014 \u0647\u0630\u0627 \u0645\u062f\u0645\u062c \u0641\u064a \u0627\u0644\u062a\u0648\u0642\u0639 \u0627\u0644\u062e\u0627\u0635 \u0628\u0627\u0644\u064a\u0648\u0645.', fc_based_on:'\u0647\u0630\u0627 \u0627\u0644\u062a\u0648\u0642\u0639 \u0645\u0628\u0646\u064a \u0639\u0644\u0649 \u0622\u062e\u0631 {n} \u064a\u0648\u0645\u0627\u064b \u0645\u0633\u062c\u0644\u0629.',
        kicker_default:'\u0631\u0624\u064a\u0629', kicker_activity:'\u0631\u0624\u064a\u0629 \u0627\u0644\u0646\u0634\u0627\u0637', kicker_activity_p:'\u0627\u0644\u0646\u0634\u0627\u0637', kicker_sleep:'\u0631\u0624\u064a\u0629 \u0627\u0644\u0646\u0648\u0645', kicker_stability:'\u0627\u0644\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629', kicker_tags:'\u0627\u0644\u0648\u0633\u0648\u0645',
        strength_strong:'\u0646\u0645\u0637 \u0642\u0648\u064a', strength_moderate:'\u0646\u0645\u0637 \u0645\u0639\u062a\u062f\u0644', strength_emerging:'\u0625\u0634\u0627\u0631\u0629 \u0646\u0627\u0634\u0626\u0629',
        insight_entry:'\u0633\u062c\u0644', insight_entries:'\u0633\u062c\u0644\u0627\u062a', insight_observed:'\u0644\u0648\u062d\u0638 \u0639\u0628\u0631 {n} {entries}.',
        insight_title_energy_alignment:'\u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0637\u0627\u0642\u0629', insight_desc_energy_alignment:'\u0623\u064a\u0627\u0645 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0631\u062a\u0641\u0639\u0629 (7+) \u0645\u062a\u0648\u0633\u0637 \u0645\u0632\u0627\u062c\u0647\u0627 {highMood} \u0645\u0642\u0627\u0628\u0644 {lowMood} \u0641\u064a \u0623\u064a\u0627\u0645 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u0646\u062e\u0641\u0636\u0629.', insight_context_energy:'\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 {highN} \u0633\u062c\u0644 \u0637\u0627\u0642\u0629 \u0645\u0631\u062a\u0641\u0639\u0629 \u0648{lowN} \u0645\u0646\u062e\u0641\u0636\u0629.',
        insight_title_mood_variable:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0623\u0643\u062b\u0631 \u062a\u0630\u0628\u0630\u0628\u0627\u064b \u0645\u0624\u062e\u0631\u0627\u064b', insight_desc_mood_variable:'\u062a\u0630\u0628\u0630\u0628 \u0645\u0632\u0627\u062c\u0643 \u0628\u0645\u0639\u062f\u0644 {stdDev} \u0646\u0642\u0637\u0629 \u064a\u0648\u0645\u064a\u0627\u064b \u2014 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0645\u0639\u062a\u0627\u062f. \u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u0646\u062a\u0638\u0645 \u0643\u062b\u064a\u0631\u0627\u064b \u0645\u0627 \u064a\u0643\u0648\u0646 \u0627\u0644\u0645\u062d\u0631\u0643 \u0627\u0644\u062e\u0641\u064a.', insight_nudge_volatility:'\u0643\u062b\u064a\u0631\u0627\u064b \u0645\u0627 \u062a\u0624\u062b\u0631 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0646\u0634\u0627\u0637 \u0639\u0644\u0649 \u0627\u0644\u062a\u0630\u0628\u0630\u0628.', insight_context_last_days:'\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0622\u062e\u0631 {n} \u064a\u0648\u0645\u0627\u064b.',
        insight_tag_lift:'"{tag}" \u064a\u0631\u0641\u0639 \u0645\u0632\u0627\u062c\u0643', insight_tag_weigh:'"{tag}" \u064a\u062b\u0642\u0644 \u0643\u0627\u0647\u0644\u0643', insight_desc_tag_lift:'\u0623\u064a\u0627\u0645 \u0627\u0644\u0648\u0633\u0645 "{tag}" \u0645\u0639\u062f\u0644 \u0645\u0632\u0627\u062c\u0643 {diff} \u0646\u0642\u0637\u0629 \u0641\u0648\u0642 \u062e\u0637\u0643 \u0627\u0644\u0623\u0633\u0627\u0633\u064a.', insight_desc_tag_weigh:'\u0623\u064a\u0627\u0645 "{tag}" \u062a\u062e\u0641\u0636 \u0645\u062a\u0648\u0633\u0637\u0643 \u0628\u0646\u062d\u0648 {diff} \u0646\u0642\u0637\u0629.', insight_nudge_tag_weigh:'\u0644\u0627\u062d\u0638 \u0645\u0627 \u062a\u0634\u062a\u0631\u0643 \u0641\u064a\u0647 \u0623\u064a\u0627\u0645 "{tag}".', insight_context_tag_seen:'\u0644\u0648\u062d\u0638 \u0641\u064a {n} \u0633\u062c\u0644 \u0645\u0648\u0633\u0648\u0645.',
        sec_sleep_heading:'\u0631\u0624\u0649 \u0627\u0644\u0646\u0648\u0645', sec_sleep_title:'\u0631\u0624\u0649 \u0627\u0644\u0646\u0648\u0645', sec_sleep_desc:'\u0623\u0646\u0645\u0627\u0637 \u0628\u064a\u0646 \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0645\u0632\u0627\u062c.',
        sec_act_heading:'\u0631\u0624\u0649 \u0627\u0644\u0646\u0634\u0627\u0637', sec_act_title:'\u0631\u0624\u0649 \u0627\u0644\u0646\u0634\u0627\u0637', sec_act_desc:'\u0623\u0646\u0634\u0637\u0629 \u0648\u0623\u0646\u0645\u0627\u0637 \u0637\u0627\u0642\u0629 \u062a\u0631\u062a\u0628\u0637 \u0628\u0627\u0644\u0645\u0632\u0627\u062c.',
        sec_stab_heading:'\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629 \u0627\u0644\u0645\u0632\u0627\u062c', sec_stab_title:'\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629 \u0627\u0644\u0645\u0632\u0627\u062c', sec_stab_desc:'\u0625\u0634\u0627\u0631\u0627\u062a \u062d\u0648\u0644 \u0627\u0644\u062a\u0630\u0628\u0630\u0628 \u0648\u0627\u0644\u0627\u0633\u062a\u0642\u0631\u0627\u0631\u064a\u0629 \u0648\u0627\u0644\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645\u064a.',
        sec_tags_heading:'\u0631\u0624\u0649 \u0627\u0644\u0648\u0633\u0648\u0645', sec_tags_title:'\u0631\u0624\u0649 \u0627\u0644\u0648\u0633\u0648\u0645', sec_tags_desc:'\u0648\u0633\u0648\u0645 \u0645\u062a\u0643\u0631\u0631\u0629 \u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u062a\u063a\u064a\u064a\u0631\u0627\u062a \u0627\u0644\u0645\u0632\u0627\u062c.',
        energy_section:'\u0627\u0644\u0625\u064a\u0642\u0627\u0639 \u0648\u0627\u0644\u062a\u062d\u0645\u0644', energy_subtitle:'\u0645\u0633\u062a\u0648\u064a\u0627\u062a \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u064a\u0648\u0645\u064a\u0629.',
        journal_ph:'\u0645\u0627 \u0627\u0644\u0630\u064a \u0628\u0631\u0632 \u0627\u0644\u064a\u0648\u0645\u061f \u0645\u0627 \u0627\u0644\u0630\u064a \u0623\u062b\u0651\u0631 \u0641\u064a \u0645\u0632\u0627\u062c\u0643\u061f \u0628\u0645\u0627\u0630\u0627 \u062a\u0634\u0639\u0631 \u0628\u0627\u0644\u0627\u0645\u062a\u0646\u0627\u0646\u061f', act_ph:'\u0645\u062b\u0627\u0644: \u0631\u064a\u0627\u0636\u0629\u060c \u0642\u0631\u0627\u0621\u0629\u060c \u0639\u0645\u0644 (\u0645\u0641\u0635\u0648\u0644\u0629 \u0628\u0641\u0648\u0627\u0635\u0644)', tag_ph:'\u0623\u0636\u0641 \u0648\u0633\u0645\u0627\u064b\u2026',
        modal_mood:'\u0627\u0644\u0645\u0632\u0627\u062c', modal_energy:'\u0627\u0644\u0637\u0627\u0642\u0629', modal_sleep:'\u0627\u0644\u0646\u0648\u0645', modal_acts:'\u0627\u0644\u0623\u0646\u0634\u0637\u0629', modal_tags:'\u0627\u0644\u0648\u0633\u0648\u0645', modal_hrs:'\u0633\u0627\u0639\u0629', modal_edit:'\u062a\u0639\u062f\u064a\u0644 \u0627\u0644\u0633\u062c\u0644', modal_journal:'\u0627\u0644\u064a\u0648\u0645\u064a\u0629', modal_del:'\ud83d\uddd1 \u062d\u0630\u0641 \u0643\u0627\u0645\u0644 \u0633\u062c\u0644 \u0647\u0630\u0627 \u0627\u0644\u064a\u0648\u0645',
        recent:'\u0627\u0644\u0633\u062c\u0644\u0627\u062a \u0627\u0644\u0623\u062e\u064a\u0631\u0629', tap_open:'\u0627\u0646\u0642\u0631 \u0644\u0644\u0641\u062a\u062d', no_journal:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u0635\u0648\u0635 \u064a\u0648\u0645\u064a\u0629 \u0645\u062d\u0641\u0648\u0638\u0629',
        no_checkin:'\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0633\u062c\u064a\u0644 \u062d\u062a\u0649 \u0627\u0644\u0622\u0646.', tagging:'\u0644\u0642\u062f \u0648\u0633\u0645\u062a \u201c{tag}\u201d \u0643\u062b\u064a\u0631\u0627\u064b \u0645\u0624\u062e\u0631\u0627\u064b.',
        narrative_start:'\u0627\u0628\u062f\u0623 \u0628\u062a\u0633\u062c\u064a\u0644 \u0623\u0648\u0644 \u062a\u0633\u062c\u064a\u0644 \u0644\u0643 \u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u0623\u0646\u0645\u0627\u0637.', narrative_trend_up:'\u0645\u0632\u0627\u062c\u0643 \u0641\u064a \u062a\u062d\u0633\u0646 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', narrative_trend_down:'\u0627\u0646\u062e\u0641\u0636 \u0645\u0632\u0627\u062c\u0643 \u0642\u0644\u064a\u0644\u0627\u064b \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', narrative_steady:'\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u0633\u062a\u0642\u0631\u0627\u064b \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.',
        narrative_logged:'\u0633\u062c\u0644\u062a \u0627\u0644\u064a\u0648\u0645 \u0645\u0632\u0627\u062c\u0627\u064b {moodLabel} \u0628\u0645\u0642\u062f\u0627\u0631 {n}.', narrative_strong:'\u0642\u0648\u064a', narrative_moderate:'\u0645\u0639\u062a\u062f\u0644', narrative_low:'\u0645\u0646\u062e\u0641\u0636',
        streak_days:'\u062a\u0633\u0644\u0633\u0644 {n} \u064a\u0648\u0645\u0627\u064b \u2014 \u0627\u0633\u062a\u0645\u0631!', streak_day:'\u0627\u0644\u064a\u0648\u0645 {n} \u0645\u0646 \u062a\u0633\u0644\u0633\u0644\u0643.',
        entry_list_empty:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0645\u0630\u0643\u0631\u0627\u062a \u064a\u0648\u0645\u064a\u0629 \u0628\u0639\u062f.', entry_list_start:'\u0627\u0628\u062f\u0623 \u0623\u0648\u0644 \u062a\u0633\u062c\u064a\u0644 \u2190', no_entries_tagged:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0633\u062c\u0644\u0627\u062a \u0645\u0648\u0633\u0648\u0645\u0629 \u0628\u0640\u201c{tag}\u201d \u0628\u0639\u062f.', entry_edit:'\u062a\u0639\u062f\u064a\u0644', entry_delete:'\u062d\u0630\u0641',
        fc_add_7:'\u0623\u0636\u0641 7 \u0623\u064a\u0627\u0645 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u062a\u0648\u0642\u0639\u0627\u062a.', fc_keep_tracking:'\u0648\u0627\u0635\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0644\u0627\u0643\u062a\u0634\u0627\u0641 \u0627\u0644\u0623\u0646\u0645\u0627\u0637 \u0648\u0627\u0644\u0645\u062d\u0641\u0632\u0627\u062a.',
        toast_saved:'\u062a\u0645 \u062d\u0641\u0638 \u0627\u0644\u0633\u062c\u0644 \u2713', toast_journal_deleted:'\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u064a\u0648\u0645\u064a\u0629', toast_entry_deleted:'\u062a\u0645 \u062d\u0630\u0641 \u0627\u0644\u0633\u062c\u0644', toast_lang:'\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0644\u063a\u0629 \u2713', toast_date:'\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u2713', toast_time:'\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0648\u0642\u062a \u2713',
        ds_not_enough:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0643\u0627\u0641\u064a\u0629 \u0644\u0625\u0646\u0634\u0627\u0621 \u0645\u0644\u062e\u0635 \u0628\u0639\u062f.', ds_journal_only:'\u0633\u062c\u0644\u062a \u0645\u0630\u0643\u0631\u0629 \u064a\u0648\u0645\u064a\u0629 \u0627\u0644\u064a\u0648\u0645. \u0644\u0645 \u064a\u062a\u0645 \u062d\u0641\u0638 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0632\u0627\u062c.', ds_mood_only:'\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0645\u0632\u0627\u062c \u0641\u0642\u0637 \u0627\u0644\u064a\u0648\u0645.',
        dow_need_more:'\u0623\u0636\u0641 \u0623\u0633\u0628\u0648\u0639\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064a\u0629.', dow_no_data:'\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a', dow_average:'\u0645\u062a\u0648\u0633\u0637', dow_peak_dip:'\u0645\u0632\u0627\u062c\u0643 \u0641\u064a \u0623\u0639\u0644\u0649 \u0645\u0633\u062a\u0648\u064a\u0627\u062a\u0647 \u064a\u0648\u0645 {day1} \u0648\u0623\u062f\u0646\u0627\u0647\u0627 \u064a\u0648\u0645 {day2}.',
        insight_empty:'\u0633\u062a\u0638\u0647\u0631 \u0627\u0644\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0631\u0624\u0649 \u0628\u062a\u0633\u062c\u064a\u0644 \u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0633\u062c\u0644\u0627\u062a.', insight_collecting:'\u0633\u062a\u0638\u0647\u0631 \u0627\u0644\u0631\u0624\u0649 \u0639\u0646\u062f \u062c\u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0643\u0627\u0641\u064a\u0629.',
        chart_empty_mood_msg:'\u0633\u062a\u0638\u0647\u0631 \u0627\u062a\u062c\u0627\u0647\u0627\u062a \u0645\u0632\u0627\u062c\u0643 \u0647\u0646\u0627 \u0628\u0639\u062f \u062a\u0633\u062c\u064a\u0644 \u0628\u0636\u0639\u0629 \u0623\u064a\u0627\u0645.', chart_empty_sleep_msg:'\u062a\u0638\u0647\u0631 \u0623\u0646\u0645\u0627\u0637 \u0627\u0644\u0646\u0648\u0645 \u0639\u0646\u062f \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u064a\u0648\u0645\u064a.', chart_empty_energy_msg:'\u0633\u062c\u0644 \u0623\u0648\u0644 \u062a\u0633\u062c\u064a\u0644 \u0644\u0625\u062d\u064a\u0627\u0621 \u0647\u0630\u0627 \u0627\u0644\u0631\u0633\u0645 \u0627\u0644\u0628\u064a\u0627\u0646\u064a.', chart_empty_velocity_msg:'\u0633\u062c\u0644 \u064a\u0648\u0645\u064a\u0646 \u0645\u062a\u062a\u0627\u0644\u064a\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0631\u0624\u064a\u0629 \u0627\u0644\u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u064a\u0648\u0645\u064a.', chart_empty_default:'\u0623\u0636\u0641 \u0633\u062c\u0644\u0627\u062a \u0644\u0631\u0624\u064a\u0629 \u0647\u0630\u0627 \u0627\u0644\u0631\u0633\u0645.',
        chart_empty_mood_cta:'\u0633\u062c\u0644 \u0623\u0648\u0644 \u0645\u0632\u0627\u062c', chart_empty_sleep_cta:'\u0623\u0636\u0641 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0646\u0648\u0645', chart_empty_energy_cta:'\u062a\u062a\u0628\u0639 \u0637\u0627\u0642\u062a\u0643', chart_empty_velocity_cta:'\u0633\u062c\u0644 2+ \u064a\u0648\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u0645\u0632\u0627\u062c'
    };

    /* Italian / Portuguese / Dutch / Polish / Russian / Turkish — critical DP keys */
    DP.it = { vel_eyebrow:'TRAIETTORIA', vel_heading:'Variazione giornaliera', vel_subtitle:'Le barre sopra lo zero significano miglioramento; sotto significano calo.', stab_eyebrow:'STABILITÀ 14 GG', stab_stable:'Stabile', stab_moderate:'Moderato', stab_volatile:'Volatile', stab_high_vol:'Molto volatile', stab_msg_stable:'Il tuo umore è stato consistente negli ultimi 14 giorni.', stab_msg_mod:'Alcune fluttuazioni negli ultimi 14 giorni — nella norma.', stab_msg_vol:'Sbalzi notevoli negli ultimi 14 giorni.', stab_msg_high:'Volatilità significativa negli ultimi 14 giorni.', stab_min_data:'Registra almeno 5 giorni consecutivi per vedere il tuo punteggio di stabilità.', stab_based_on:'Basato su {n} voci degli ultimi 14 giorni.', energy_section:'RITMO E RESISTENZA', energy_subtitle:'Livelli di energia giornalieri.', journal_ph:'Cosa ha colpito oggi? Cosa ha influenzato il tuo umore? Per cosa sei grato?', act_ph:'es. esercizio, lettura, lavoro (separati da virgola)', tag_ph:'Aggiungi un tag…', no_checkin:'Nessun check-in ancora oggi.', narrative_start:'Inizia il tuo primo check-in per vedere i pattern.', narrative_trend_up:'Il tuo umore è migliorato questa settimana.', narrative_trend_down:'Il tuo umore è leggermente calato questa settimana.', narrative_steady:'Il tuo umore è rimasto stabile questa settimana.' };
    DP.pt = { vel_eyebrow:'TRAJETÓRIA', vel_heading:'Mudança diária', vel_subtitle:'Barras acima de zero = melhora; abaixo = queda.', stab_eyebrow:'ESTABILIDADE 14 DIAS', stab_stable:'Estável', stab_moderate:'Moderado', stab_volatile:'Volátil', stab_high_vol:'Muito volátil', stab_msg_stable:'O seu humor foi consistente nos últimos 14 dias.', stab_msg_mod:'Algumas flutuações nos últimos 14 dias — dentro do normal.', stab_msg_vol:'Variações notáveis nos últimos 14 dias.', stab_msg_high:'Volatilidade significativa nos últimos 14 dias.', stab_min_data:'Registe pelo menos 5 dias consecutivos para ver a sua pontuação de estabilidade.', stab_based_on:'Baseado em {n} entradas dos últimos 14 dias.', energy_section:'RITMO E RESISTÊNCIA', energy_subtitle:'Níveis de energia diários.', journal_ph:'O que se destacou hoje? O que afetou o seu humor? Pelo que é grato?', act_ph:'ex. exercício, leitura, trabalho (separados por vírgula)', tag_ph:'Adicionar etiqueta…', no_checkin:'Sem check-in ainda hoje.', narrative_start:'Comece o seu primeiro check-in para ver padrões.', narrative_trend_up:'O seu humor melhorou esta semana.', narrative_trend_down:'O seu humor baixou um pouco esta semana.', narrative_steady:'O seu humor foi estável esta semana.' };
    DP.nl = { vel_eyebrow:'TRAJECT', vel_heading:'Dagelijkse verandering', vel_subtitle:'Staven boven nul = verbetering; eronder = daling.', stab_eyebrow:'STABILITEIT 14 D', stab_stable:'Stabiel', stab_moderate:'Gematigd', stab_volatile:'Variabel', stab_high_vol:'Zeer variabel', stab_msg_stable:'Je stemming was consistent de afgelopen 14 dagen.', stab_msg_mod:'Wat schommelingen de afgelopen 14 dagen — normaal bereik.', stab_msg_vol:'Merkbare stemmingswisselingen de afgelopen 14 dagen.', stab_msg_high:'Grote stemmingsvariabiliteit de afgelopen 14 dagen.', stab_min_data:'Registreer minstens 5 opeenvolgende dagen voor je stabiliteitsscore.', stab_based_on:'Gebaseerd op {n} invoer in de laatste 14 dagen.', energy_section:'RITME & UITHOUDINGSVERMOGEN', energy_subtitle:'Dagelijkse energieniveaus.', journal_ph:'Wat viel op vandaag? Wat beïnvloedde je stemming? Waarvoor ben je dankbaar?', act_ph:'bijv. sport, lezen, werk (komma-gescheiden)', tag_ph:'Label toevoegen…', no_checkin:'Nog geen check-in vandaag.', narrative_start:'Begin je eerste check-in om patronen te zien.', narrative_trend_up:'Je stemming verbeterde deze week.', narrative_trend_down:'Je stemming is iets gedaald deze week.', narrative_steady:'Je stemming was stabiel deze week.' };
    DP.pl = { vel_eyebrow:'TRAJEKTORIA', vel_heading:'Dzienna zmiana', vel_subtitle:'Słupki powyżej zera = poprawa; poniżej = spadek.', stab_eyebrow:'STABILNOŚĆ 14 DNI', stab_stable:'Stabilny', stab_moderate:'Umiarkowany', stab_volatile:'Zmienny', stab_high_vol:'Bardzo zmienny', stab_msg_stable:'Twój nastrój był spójny przez ostatnie 14 dni.', stab_msg_mod:'Pewne wahania w ciągu ostatnich 14 dni — w normalnym zakresie.', stab_msg_vol:'Znaczne wahania nastroju w ciągu ostatnich 14 dni.', stab_msg_high:'Duża zmienność nastroju w ciągu ostatnich 14 dni.', stab_min_data:'Rejestruj co najmniej 5 kolejnych dni, aby zobaczyć wynik stabilności.', stab_based_on:'Oparty na {n} wpisach z ostatnich 14 dni.', energy_section:'RYTM I WYTRZYMAŁOŚĆ', energy_subtitle:'Dzienne poziomy energii.', journal_ph:'Co dziś wyróżniało? Co wpłynęło na Twój nastrój? Za co jesteś wdzięczny?', act_ph:'np. ćwiczenia, czytanie, praca (oddzielone przecinkami)', tag_ph:'Dodaj tag…', no_checkin:'Brak dzisiejszego check-inu.', narrative_start:'Zacznij swój pierwszy check-in, aby zobaczyć wzorce.', narrative_trend_up:'Twój nastrój poprawił się w tym tygodniu.', narrative_trend_down:'Twój nastrój lekko się obniżył w tym tygodniu.', narrative_steady:'Twój nastrój był stabilny w tym tygodniu.' };
    DP.ru = { vel_eyebrow:'ТРАЕКТОРИЯ', vel_heading:'Изменение за день', vel_subtitle:'Столбцы выше нуля = улучшение; ниже = снижение.', stab_eyebrow:'СТАБИЛЬНОСТЬ 14 ДН.', stab_stable:'Стабильно', stab_moderate:'Умеренно', stab_volatile:'Переменчиво', stab_high_vol:'Очень переменчиво', stab_msg_stable:'Ваше настроение было стабильным последние 14 дней.', stab_msg_mod:'Небольшие колебания за 14 дней — в пределах нормы.', stab_msg_vol:'Заметные колебания настроения за 14 дней.', stab_msg_high:'Значительная нестабильность настроения за 14 дней.', stab_min_data:'Отслеживайте не менее 5 дней подряд для оценки стабильности.', stab_based_on:'На основе {n} записей за последние 14 дней.', energy_section:'РИТМ И ВЫНОСЛИВОСТЬ', energy_subtitle:'Ежедневные уровни энергии.', journal_ph:'Что выделилось сегодня? Что повлияло на настроение? За что вы благодарны?', act_ph:'например: упражнения, чтение, работа (через запятую)', tag_ph:'Добавить тег…', no_checkin:'Чекина сегодня ещё нет.', narrative_start:'Начните первый чекин, чтобы увидеть закономерности.', narrative_trend_up:'Ваше настроение улучшилось на этой неделе.', narrative_trend_down:'Ваше настроение немного снизилось на этой неделе.', narrative_steady:'Ваше настроение было стабильным на этой неделе.' };
    DP.tr = { vel_eyebrow:'YÖRÜNGE', vel_heading:'Günlük değişim', vel_subtitle:'Sıfırın üstündeki çubuklar iyileşmeyi; altındakiler düşüşü gösterir.', stab_eyebrow:'14 GÜNLÜK İSTİKRAR', stab_stable:'İstikrarlı', stab_moderate:'Orta', stab_volatile:'Değişken', stab_high_vol:'Çok değişken', stab_msg_stable:'Ruh haliniz son 14 günde tutarlıydı.', stab_msg_mod:'Son 14 günde bazı dalgalanmalar — normal aralıkta.', stab_msg_vol:'Son 14 günde belirgin ruh hali değişimleri.', stab_msg_high:'Son 14 günde önemli ruh hali dalgalanması tespit edildi.', stab_min_data:'Stabilitenizi görmek için en az 5 ardışık gün kaydedin.', stab_based_on:'Son 14 günden {n} kayda dayalı.', energy_section:'RİTİM VE DAYANIKLILIK', energy_subtitle:'Günlük enerji seviyeleri.', journal_ph:'Bugün ne öne çıktı? Ruh halinizi ne etkiledi? Neden minnettarsınız?', act_ph:'örn. egzersiz, okuma, iş (virgülle ayrılmış)', tag_ph:'Etiket ekle…', no_checkin:'Bugün henüz check-in yok.', narrative_start:'Kalıpları görmek için ilk check-in\'inizi kaydedin.', narrative_trend_up:'Ruh haliniz bu hafta iyileşti.', narrative_trend_down:'Ruh haliniz bu hafta biraz düştü.', narrative_steady:'Ruh haliniz bu hafta istikrarlıydı.' };
    DP.ja = { vel_eyebrow:'気分の軌跡', vel_heading:'日々の変化', vel_subtitle:'ゼロより上のバーは改善、下は低下を示します。', stab_eyebrow:'14日間安定性', stab_stable:'安定', stab_moderate:'普通', stab_volatile:'不安定', stab_high_vol:'非常に不安定', stab_msg_stable:'過去14日間、気分は安定していました。', stab_msg_mod:'過去14日間に若干の変動 — 正常範囲内です。', stab_msg_vol:'過去14日間に顕著な気分変動があります。', stab_msg_high:'過去14日間に大きな気分の不安定性が検出されました。', stab_min_data:'安定性スコアを表示するには5日以上連続して記録してください。', stab_based_on:'過去14日間の{n}件のエントリーに基づきます。', energy_section:'リズムとスタミナ', energy_subtitle:'日々のエネルギーレベル。', journal_ph:'今日印象に残ったことは？気分に影響したことは？感謝していることは？', act_ph:'例: 運動、読書、仕事（カンマ区切り）', tag_ph:'タグを追加…', no_checkin:'今日はまだチェックインがありません。', narrative_start:'最初のチェックインを記録してパターンを確認しましょう。', narrative_trend_up:'今週は気分が上がっています。', narrative_trend_down:'今週は気分が少し下がっています。', narrative_steady:'今週は気分が安定しています。' };
    DP.zh = { vel_eyebrow:'情绪轨迹', vel_heading:'每日变化', vel_subtitle:'柱状图在零上方表示改善，在下方表示下降。', stab_eyebrow:'14天稳定性', stab_stable:'稳定', stab_moderate:'中等', stab_volatile:'波动', stab_high_vol:'高度波动', stab_msg_stable:'过去14天您的情绪一直稳定。', stab_msg_mod:'过去14天有些波动 — 在正常范围内。', stab_msg_vol:'过去14天有明显的情绪波动。', stab_msg_high:'过去14天检测到显著的情绪波动。', stab_min_data:'至少连续记录5天以查看稳定性评分。', stab_based_on:'基于过去14天的{n}条记录。', energy_section:'节奏与耐力', energy_subtitle:'每日能量水平。', journal_ph:'今天有什么特别的？什么影响了你的情绪？你感激什么？', act_ph:'例如：运动、阅读、工作（逗号分隔）', tag_ph:'添加标签…', no_checkin:'今天还没有打卡。', narrative_start:'开始记录第一次打卡，在这里看到模式的出现。', narrative_trend_up:'您的情绪本周有所改善。', narrative_trend_down:'您的情绪本周略有下降。', narrative_steady:'您的情绪本周保持稳定。' };
    DP.hi = { vel_eyebrow:'मूड पथ', vel_heading:'दैनिक परिवर्तन', vel_subtitle:'शून्य से ऊपर की पट्टियां सुधार, नीचे की गिरावट दर्शाती हैं।', stab_eyebrow:'14-दिन स्थिरता', stab_stable:'स्थिर', stab_moderate:'मध्यम', stab_volatile:'अस्थिर', stab_high_vol:'बहुत अस्थिर', stab_msg_stable:'पिछले 14 दिनों में आपका मूड स्थिर रहा।', stab_msg_mod:'पिछले 14 दिनों में कुछ उतार-चढ़ाव — सामान्य सीमा में।', stab_msg_vol:'पिछले 14 दिनों में उल्लेखनीय मूड परिवर्तन।', stab_msg_high:'पिछले 14 दिनों में महत्वपूर्ण मूड अस्थिरता।', stab_min_data:'स्थिरता स्कोर देखने के लिए कम से कम 5 दिन लगातार रिकॉर्ड करें।', stab_based_on:'पिछले 14 दिनों की {n} प्रविष्टियों पर आधारित।', energy_section:'लय और सहनशक्ति', energy_subtitle:'दैनिक ऊर्जा स्तर।', journal_ph:'आज क्या खास था? आपके मूड पर क्या असर पड़ा? किस बात के लिए आभारी हैं?', act_ph:'उदा. व्यायाम, पढ़ाई, काम (कॉमा से अलग)', tag_ph:'टैग जोड़ें…', no_checkin:'आज अभी तक कोई चेक-इन नहीं।', narrative_start:'पैटर्न देखने के लिए पहला चेक-इन दर्ज करें।', narrative_trend_up:'इस सप्ताह आपका मूड बेहतर हुआ है।', narrative_trend_down:'इस सप्ताह आपका मूड थोड़ा कम रहा।', narrative_steady:'इस सप्ताह आपका मूड स्थिर रहा।' };

    /* Ensure every locale has every key (use English where missing so UI is never blank or key names) */
    ['de','fr','es','it','pt','nl','pl','ru','tr','ja','zh','hi','ar'].forEach(function (lc) {
        if (!DP[lc]) DP[lc] = {};
        Object.keys(DP.en).forEach(function (k) { if (DP[lc][k] == null) DP[lc][k] = DP.en[k]; });
    });

    /* ═══════════════════════════════════════════════════════════════════
       §2  PATCH FUNCTIONS
    ═══════════════════════════════════════════════════════════════════ */
    var esc = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
    var labelToY = { 'Mood (1–10)': 'y_mood', 'Sleep (hrs)': 'y_sleep', 'Energy (1–10)': 'y_energy', 'Mood change (day-over-day)': 'y_velocity' };
    var labelToDs = { 'Mood': 'ds_mood', 'Sleep': 'ds_sleep', 'Energy': 'ds_energy', 'Mood Change': 'ds_velocity' };
    var chartEmptyKey = { 'Mood': 'mood', 'Sleep': 'sleep', 'Energy': 'energy', 'Mood Change': 'velocity' };
    var toastMap = {
        'Entry saved successfully ✓': 'toast_saved',
        'Journal deleted': 'toast_journal_deleted',
        'Entry deleted': 'toast_entry_deleted',
        'Shared content added to journal': 'toast_shared',
        'Language updated ✓': 'toast_lang',
        'Date format updated ✓': 'toast_date',
        'Time format updated ✓': 'toast_time'
    };

    onReady(function () {
        /* ── createChart: translate scaleOpts (yTitle, xTitle) and dataset label ── */
        if (typeof window.createChart === 'function' && !window.createChart._dpWrapped) {
            var _createChart = window.createChart;
            window.createChart = function (id, label, data, dates, color, scaleOpts, datasetOpts) {
                var so = scaleOpts ? Object.assign({}, scaleOpts) : {};
                if (so.yTitle && labelToY[so.yTitle]) so.yTitle = T(labelToY[so.yTitle]);
                else if (so.yTitle === 'Mood (1–10)') so.yTitle = T('y_mood');
                else if (so.yTitle === 'Sleep (hrs)') so.yTitle = T('y_sleep');
                else if (so.yTitle === 'Energy (1–10)') so.yTitle = T('y_energy');
                if (so.xTitle && so.xTitle.indexOf('Last ') === 0) {
                    var n = so.xTitle.replace(/\D/g, '');
                    if (n) so.xTitle = T('x_last_n', { n: n });
                }
                return _createChart(id, label, data, dates, color, so, datasetOpts);
            };
            window.createChart._dpWrapped = true;
        }

        /* ── renderChartEmptyState: translate overlay text after render ── */
        if (typeof window.renderChartEmptyState === 'function' && !window.renderChartEmptyState._dpWrapped) {
            var _renderEmpty = window.renderChartEmptyState;
            window.renderChartEmptyState = function (canvas, chartLabel) {
                _renderEmpty(canvas, chartLabel);
                var wrap = canvas && canvas.closest ? canvas.closest('.comparison-chart-wrap, .analytics-chart-wrap, .mood-trends-chart-wrap, .mood-velocity-chart-wrap, .chart-container') || canvas.parentElement;
                if (!wrap) return;
                var overlay = wrap.querySelector('.chart-empty-overlay');
                if (!overlay) return;
                var key = chartEmptyKey[chartLabel] || 'default';
                var msgEl = overlay.querySelector('.chart-empty-text');
                var ctaEl = overlay.querySelector('.chart-empty-cta');
                if (msgEl) msgEl.textContent = T('chart_empty_' + key + '_msg') || T('chart_empty_default');
                if (ctaEl && key !== 'default') ctaEl.textContent = (T('chart_empty_' + key + '_cta') || ctaEl.textContent) + ' →';
            };
            window.renderChartEmptyState._dpWrapped = true;
        }

        /* ── renderMoodVelocity: after run, translate stability panel ── */
        if (typeof window.renderMoodVelocity === 'function' && !window.renderMoodVelocity._dpWrapped) {
            var _renderVel = window.renderMoodVelocity;
            window.renderMoodVelocity = function () {
                _renderVel();
                var panel = document.getElementById('stabilityScorePanel');
                if (!panel) return;
                var eyebrow = document.getElementById('stabilityEyebrow');
                if (eyebrow) eyebrow.textContent = T('stab_eyebrow');
                var pill = panel.querySelector('.stability-pill');
                if (pill) {
                    var c = pill.className;
                    var key = c.indexOf('stable') >= 0 ? 'stab_stable' : c.indexOf('moderate') >= 0 ? 'stab_moderate' : c.indexOf('high-volatility') >= 0 ? 'stab_high_vol' : 'stab_volatile';
                    pill.textContent = T(key);
                }
                var expl = panel.querySelector('.stability-score-explanation');
                if (expl && pill) {
                    var k = pill.className.indexOf('stable') >= 0 ? 'stab_msg_stable' : pill.className.indexOf('moderate') >= 0 ? 'stab_msg_mod' : pill.className.indexOf('high-volatility') >= 0 ? 'stab_msg_high' : 'stab_msg_vol';
                    expl.textContent = T(k);
                }
                var meta = panel.querySelector('.stability-score-meta');
                if (meta) {
                    var num = (meta.textContent.match(/\d+/) || [])[0] || '0';
                    meta.textContent = T('stab_based_on', { n: num });
                }
                var emptyP = panel.querySelector('.stability-score-empty');
                if (emptyP) emptyP.textContent = T('stab_min_data');
            };
            window.renderMoodVelocity._dpWrapped = true;
        }

        /* ── renderPredictions: translate chips and <7 days messages ── */
        if (typeof window.renderPredictions === 'function' && !window.renderPredictions._dpWrapped) {
            var _renderPred = window.renderPredictions;
            window.renderPredictions = function () {
                _renderPred();
                var noteEl = document.getElementById('predictionNote');
                var patternsEl = document.getElementById('predictionPatterns');
                if (noteEl && noteEl.textContent.indexOf('Add at least 7') >= 0) noteEl.textContent = T('fc_add_7');
                if (patternsEl && patternsEl.textContent.indexOf('Keep tracking') >= 0) patternsEl.textContent = T('fc_keep_tracking');
                var row = document.getElementById('predictionSummaryRow');
                if (row) {
                    var chips = row.querySelectorAll('.prediction-stat-chip .prediction-stat-label');
                    var chipKeys = { 'Days of data': 'fc_days', 'Recent avg': 'fc_avg', '7-day forecast': 'fc_7day', 'Variability': 'fc_variability' };
                    for (var i = 0; i < chips.length; i++) {
                        var lab = chipKeys[chips[i].textContent];
                        if (lab) chips[i].textContent = T(lab);
                    }
                }
            };
            window.renderPredictions._dpWrapped = true;
        }

        /* ── buildInsightCardHtml ── */
        if (typeof window.buildInsightCardHtml === 'function' && !window.buildInsightCardHtml._dpWrapped) {
            var _buildCard = window.buildInsightCardHtml;
            window.buildInsightCardHtml = function (insight) {
                var strengthMap = { strong: { label: T('strength_strong'), width: 100, class: 'insight-strength-strong' }, moderate: { label: T('strength_moderate'), width: 62, class: 'insight-strength-moderate' }, emerging: { label: T('strength_emerging'), width: 32, class: 'insight-strength-emerging' } };
                var s = strengthMap[insight.strength || 'emerging'];
                var kicker = insight.kicker || T('kicker_default');
                var titleStr = insight.titleKey ? T(insight.titleKey, insight.titleVars || {}) : insight.title;
                var descStr = insight.descKey ? T(insight.descKey, insight.descVars || {}) : insight.description;
                var contextStr = insight.contextKey ? T(insight.contextKey, insight.contextVars || {}) : insight.context;
                var nudgeStr = insight.nudgeKey ? T(insight.nudgeKey, insight.nudgeVars || {}) : insight.nudge;
                var nudgeHtml = nudgeStr ? '<p class="insight-nudge">' + esc(nudgeStr) + '</p>' : '';
                return '<div class="card insight-detail-card">' +
                    '<div class="insight-detail-header"><div class="insight-detail-title-wrap">' +
                    '<span class="insight-icon-badge" data-section="' + esc(insight.section) + '" aria-hidden="true">' + esc(insight.icon || '•') + '</span><div>' +
                    '<span class="insight-detail-kicker">' + esc(kicker) + '</span>' +
                    '<h4 class="insight-detail-title">' + esc(titleStr) + '</h4></div></div>' +
                    '<div class="insight-strength"><span class="insight-strength-label ' + s.class + '">' + s.label + '</span>' +
                    '<div class="insight-strength-bar"><div class="insight-strength-fill" style="width:' + s.width + '%;"></div></div></div></div>' +
                    '<p class="insight-detail-text">' + esc(descStr) + '</p>' + nudgeHtml +
                    '<p class="insight-detail-context">' + esc(contextStr) + '</p></div>';
            };
            window.buildInsightCardHtml._dpWrapped = true;
        }

        /* ── createInsightCandidate ── */
        if (typeof window.createInsightCandidate === 'function' && !window.createInsightCandidate._dpWrapped) {
            var _createCand = window.createInsightCandidate;
            window.createInsightCandidate = function (section, title, description, supportCount, score, options) {
                options = options || {};
                var entryWord = supportCount === 1 ? T('insight_entry') : T('insight_entries');
                options.context = options.context || T('insight_observed', { n: supportCount, entries: entryWord });
                return _createCand(section, title, description, supportCount, score, options);
            };
            window.createInsightCandidate._dpWrapped = true;
        }

        /* ── renderEntryList: post-process translated strings ── */
        if (typeof window.renderEntryList === 'function' && !window.renderEntryList._dpWrapped) {
            var _renderList = window.renderEntryList;
            window.renderEntryList = function () {
                _renderList();
                var ul = document.getElementById('entryList');
                if (!ul) return;
                var emptyLi = ul.querySelector('.entry-list-empty-state');
                if (emptyLi) {
                    var p = emptyLi.querySelector('p');
                    if (p) p.textContent = T('entry_list_empty');
                    var btn = emptyLi.querySelector('button');
                    if (btn) btn.textContent = T('entry_list_start');
                }
                var subs = ul.querySelectorAll('.entry-record-subtitle');
                for (var i = 0; i < subs.length; i++) { if (subs[i].textContent === 'No journal text saved') subs[i].textContent = T('no_journal'); }
                var edits = ul.querySelectorAll('.entry-record-action');
                for (var j = 0; j < edits.length; j++) { if (edits[j].textContent === 'Edit') edits[j].textContent = T('entry_edit'); }
                var dels = ul.querySelectorAll('.entry-record-delete');
                for (var k = 0; k < dels.length; k++) { if (dels[k].textContent === 'Delete') dels[k].textContent = T('entry_delete'); }
                var mutedLi = ul.querySelector('li[style*="color: var(--text-muted)"]');
                if (mutedLi && mutedLi.textContent.indexOf('No entries tagged') >= 0) mutedLi.textContent = T('no_entries_tagged', { tag: (window.filterByTag || '') });
            };
            window.renderEntryList._dpWrapped = true;
        }

        /* ── buildDashboardNarrative ── */
        if (typeof window.buildDashboardNarrative === 'function' && !window.buildDashboardNarrative._dpWrapped) {
            var _buildNarr = window.buildDashboardNarrative;
            window.buildDashboardNarrative = function () {
                var t = function (k, v) { return T(k, v); };
                var allDates = typeof entries !== 'undefined' && entries ? Object.keys(entries).sort() : [];
                if (!allDates.length) return T('narrative_start');
                var today = typeof getLocalTodayYMD === 'function' ? getLocalTodayYMD() : new Date().toISOString().split('T')[0];
                var todayEntry = entries[today];
                var last7 = allDates.filter(function (d) { return d <= today; }).slice(-7);
                var last7Moods = last7.map(function (d) { return entries[d] && entries[d].mood; }).filter(function (m) { return typeof m === 'number' && !isNaN(m); });
                var trendText = '';
                if (last7Moods.length >= 4) {
                    var half = Math.floor(last7Moods.length / 2);
                    var firstAvg = last7Moods.slice(0, half).reduce(function (a, b) { return a + b; }, 0) / half;
                    var secondAvg = last7Moods.slice(half).reduce(function (a, b) { return a + b; }, 0) / (last7Moods.length - half);
                    var diff = secondAvg - firstAvg;
                    if (diff > 0.5) trendText = T('narrative_trend_up');
                    else if (diff < -0.5) trendText = T('narrative_trend_down');
                    else trendText = T('narrative_steady');
                }
                var todayText = '';
                if (todayEntry && todayEntry.mood != null) {
                    var moodLabel = todayEntry.mood >= 7.5 ? T('narrative_strong') : todayEntry.mood >= 5 ? T('narrative_moderate') : T('narrative_low');
                    todayText = T('narrative_logged', { moodLabel: moodLabel, n: todayEntry.mood.toFixed(1) });
                } else todayText = T('no_checkin');
                var tagCounts = {};
                last7.forEach(function (d) { ((entries[d] && entries[d].tags) || []).forEach(function (tag) { tagCounts[tag] = (tagCounts[tag] || 0) + 1; }); });
                var topTag = Object.keys(tagCounts).sort(function (a, b) { return tagCounts[b] - tagCounts[a]; })[0];
                var tagText = topTag ? T('tagging', { tag: topTag }) : '';
                var streak = 0;
                var checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
                var fmt = typeof formatLocalDateYMD === 'function' ? formatLocalDateYMD : function (d) { return d.toISOString().split('T')[0]; };
                if (!entries[fmt(checkDate)]) checkDate.setDate(checkDate.getDate() - 1);
                while (entries[fmt(checkDate)]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
                var streakText = streak >= 3 ? T('streak_days', { n: streak }) : streak > 0 ? T('streak_day', { n: streak }) : '';
                return [todayText, trendText, tagText, streakText].filter(Boolean).slice(0, 3).join(' ');
            };
            window.buildDashboardNarrative._dpWrapped = true;
        }

        /* ── showToast ── */
        if (typeof window.showToast === 'function' && !window.showToast._dpWrapped) {
            var _showToast = window.showToast;
            window.showToast = function (message) {
                var key = toastMap[message];
                _showToast(key ? T(key) : message);
            };
            window.showToast._dpWrapped = true;
        }

        /* ── renderDayOfWeekChart: translate no-data msg, dataset label, tooltip, insight ── */
        if (typeof window.renderDayOfWeekChart === 'function' && !window.renderDayOfWeekChart._dpWrapped) {
            var _renderDow = window.renderDayOfWeekChart;
            window.renderDayOfWeekChart = function () {
                _renderDow();
                /* Chart.js renders synchronously — translate immediately, no setTimeout needed */
                var noDataMsg = document.querySelector('.dow-no-data-msg');
                if (noDataMsg) noDataMsg.textContent = T('dow_need_more');
                var canvas = document.getElementById('dowChart');
                if (!canvas) return;
                var chart = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
                if (chart && chart.data && chart.data.datasets && chart.data.datasets[0]) {
                    chart.data.datasets[0].label = T('ds_avg_mood');
                    if (chart.options && chart.options.plugins && chart.options.plugins.tooltip && chart.options.plugins.tooltip.callbacks) {
                        var fullDays = (typeof window.getLocalizedDaysFull === 'function' && window.getLocalizedDaysFull()) || ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                        chart.options.plugins.tooltip.callbacks.label = function (ctx) {
                            var v = ctx.raw;
                            var day = fullDays[ctx.dataIndex] || '';
                            if (v == null) return day + ': ' + T('dow_no_data');
                            return day + ': ' + v.toFixed(1) + ' ' + T('dow_average');
                        };
                    }
                    chart.update('none');
                }
                var insightEl = document.getElementById('dowChartInsight');
                if (insightEl && insightEl.textContent) {
                    var canvas2 = document.getElementById('dowChart');
                    var chart2 = canvas2 && Chart.getChart ? Chart.getChart(canvas2) : null;
                    if (chart2 && chart2.data && chart2.data.datasets && chart2.data.datasets[0]) {
                        var avgs = chart2.data.datasets[0].data;
                        var fullDays2 = (typeof window.getLocalizedDaysFull === 'function' && window.getLocalizedDaysFull()) || ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
                        var best = -1, worst = 11, bestIdx = -1, worstIdx = -1;
                        for (var bi = 0; bi < avgs.length; bi++) {
                            if (avgs[bi] != null) { if (avgs[bi] > best) { best = avgs[bi]; bestIdx = bi; } if (avgs[bi] < worst) { worst = avgs[bi]; worstIdx = bi; } }
                        }
                        if (bestIdx >= 0 && worstIdx >= 0 && bestIdx !== worstIdx) insightEl.textContent = T('dow_peak_dip', { day1: fullDays2[bestIdx], day2: fullDays2[worstIdx] });
                    }
                }
            };
            window.renderDayOfWeekChart._dpWrapped = true;
        }

        /* ── buildDailySummaryData: translate result.text for known strings ── */
        if (typeof window.buildDailySummaryData === 'function' && !window.buildDailySummaryData._dpWrapped) {
            var _buildSummary = window.buildDailySummaryData;
            window.buildDailySummaryData = function (dateStr) {
                var out = _buildSummary(dateStr);
                if (out && out.text) {
                    if (out.text === 'Not enough data to generate a summary yet.') out.text = T('ds_not_enough');
                    else if (out.text.indexOf('journal entry today') >= 0 && out.text.indexOf('No mood data') >= 0) out.text = T('ds_journal_only');
                    else if (out.text.indexOf('saved photos') >= 0) out.text = T('ds_photos_only');
                    else if (out.text === 'Mood was recorded today without additional metrics.') out.text = T('ds_mood_only');
                }
                return out;
            };
            window.buildDailySummaryData._dpWrapped = true;
        }

        /* ── correlationInsightsEngine.analyze: translate empty result ── */
        if (window.correlationInsightsEngine && typeof window.correlationInsightsEngine.analyze === 'function' && !window.correlationInsightsEngine.analyze._dpWrapped) {
            var _analyze = window.correlationInsightsEngine.analyze;
            window.correlationInsightsEngine.analyze = function (records) {
                var result = _analyze.apply(this, arguments);
                if (result && (!records || records.length < (window.MIN_INSIGHT_RECORDS || 5))) {
                    result.summary = T('insight_empty');
                    result.message = T('insight_collecting');
                } else if (result && result.summary === 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.') {
                    result.summary = T('insight_empty');
                }
                return result;
            };
            window.correlationInsightsEngine.analyze._dpWrapped = true;
        }
    });

})();

