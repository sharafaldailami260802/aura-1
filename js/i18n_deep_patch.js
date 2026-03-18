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
    /* French – full deep-patch coverage */
    DP.fr = {
        x_last_n:'Les {n} derniers jours', y_mood:'Humeur (1\u201310)', y_sleep:'Sommeil (h)', y_energy:'\u00c9nergie (1\u201310)', y_velocity:'Variation d\u2019humeur (quotidienne)',
        ds_mood:'Humeur', ds_sleep:'Sommeil', ds_energy:'\u00c9nergie', ds_avg_mood:'Humeur moyenne', ds_forecast:'Pr\u00e9vision', ds_lower:'Limite basse', ds_upper:'Limite haute', ds_trend:'Tendance',
        chip_avg:'Moy. {n}', chip_up:'\u2197 +{n} vs avant', chip_down:'\u2198 {n} vs avant', chip_latest:'Actuel\u00a0: {n} vs moy.', chip_range:'Plage {min}\u2013{max}', need_3:'3+ entr\u00e9es requises',
        vel_improved:'Humeur am\u00e9lior\u00e9e de {n} point{s}', vel_dipped:'Humeur en baisse de {n} point{s}', vel_no_change:'Aucun changement',
        vel_eyebrow:'TRAJECTOIRE', vel_heading:'Variation quotidienne', vel_subtitle:'Les barres au-dessus de z\u00e9ro signifient une am\u00e9lioration\u00a0; en dessous, un recul.',
        stab_eyebrow:'STABILIT\u00c9 14 JOURS', stab_stable:'Stable', stab_moderate:'Mod\u00e9r\u00e9', stab_volatile:'Volatile', stab_high_vol:'Tr\u00e8s volatile',
        stab_msg_stable:'Votre humeur a \u00e9t\u00e9 constante au cours des 14 derniers jours.', stab_msg_mod:'Quelques fluctuations sur 14 jours \u2014 dans la normale.', stab_msg_vol:'Variations d\u2019humeur notables sur 14 jours.', stab_msg_high:'Volatilit\u00e9 significative d\u00e9tect\u00e9e sur 14 jours.', stab_min_data:'Enregistrez au moins 5 jours de suite pour voir votre score de stabilit\u00e9.', stab_based_on:'Bas\u00e9 sur {n} entr\u00e9es des 14 derniers jours.',
        fc_days:'Jours de donn\u00e9es', fc_avg:'Moy. r\u00e9cente', fc_7day:'Pr\u00e9vision 7 jours', fc_variability:'Variabilit\u00e9',
        fc_trend_up_strong:'Votre humeur est sur une trajectoire ascendante stable.', fc_trend_up_gentle:'Il y a une l\u00e9g\u00e8re hausse dans votre humeur r\u00e9cente.', fc_trend_dn_strong:'Votre humeur tend progressivement \u00e0 la baisse.', fc_trend_dn_gentle:'Une l\u00e9g\u00e8re tendance \u00e0 la baisse sur les derni\u00e8res semaines.', fc_trend_steady:'Votre humeur est rest\u00e9e assez stable.',
        fc_stab_low:'Votre variabilit\u00e9 quotidienne est faible, la bande de pr\u00e9vision est \u00e9troite.', fc_stab_mid:'Quelques variations quotidiennes signifient que la plage r\u00e9elle peut varier.', fc_stab_high:'Votre humeur a \u00e9t\u00e9 tr\u00e8s variable \u2014 consid\u00e9rez cette pr\u00e9vision comme indicative.',
        fc_sleep_up:' Votre sommeil r\u00e9cent est sup\u00e9rieur \u00e0 votre moyenne, ce qui pousse la pr\u00e9vision \u00e0 la hausse.', fc_sleep_dn:' Votre sommeil r\u00e9cent est inf\u00e9rieur \u00e0 votre moyenne, ce qui tire la pr\u00e9vision vers le bas.',
        fc_pat_up:'Votre humeur grimpe progressivement \u2014 signe positif.', fc_pat_dn:'L\u00e9g\u00e8re tendance \u00e0 la baisse. V\u00e9rifiez vos habitudes de sommeil et d\u2019activit\u00e9.', fc_pat_stable:'Votre humeur est stable \u2014 un suivi r\u00e9gulier vous aide \u00e0 le voir clairement.',
        fc_low_var:'Faible variabilit\u00e9 quotidienne sugg\u00e8re un bon \u00e9quilibre.', fc_high_var:'Variabilit\u00e9 plus \u00e9lev\u00e9e signifie que la bande de pr\u00e9vision est plus large que d\u2019habitude.',
        fc_sleep_good:'Votre sommeil r\u00e9cent est meilleur que votre moyenne \u2014 cela est pris en compte.', fc_sleep_bad:'Votre sommeil r\u00e9cent est l\u00e9g\u00e8rement inf\u00e9rieur \u00e0 votre moyenne \u2014 cela abaisse l\u00e9g\u00e8rement la pr\u00e9vision.',
        fc_best_day:'Les {day}s tendent \u00e0 \u00eatre votre meilleur jour \u2014 cela est int\u00e9gr\u00e9 dans la pr\u00e9vision sp\u00e9cifique.', fc_based_on:'Cette pr\u00e9vision est bas\u00e9e sur vos {n} derniers jours enregistr\u00e9s. Plus vous suivez, plus c\u2019est pr\u00e9cis.',
        kicker_default:'ANALYSE', kicker_activity:'ANALYSE D\u2019ACTIVIT\u00c9', kicker_activity_p:'ACTIVIT\u00c9', kicker_sleep:'ANALYSE DU SOMMEIL', kicker_stability:'STABILIT\u00c9', kicker_tags:'\u00c9TIQUETTES',
        strength_strong:'TENDANCE FORTE', strength_moderate:'TENDANCE MOD\u00c9R\u00c9E', strength_emerging:'SIGNAL \u00c9MERGENT',
        insight_entry:'entr\u00e9e', insight_entries:'entr\u00e9es', insight_observed:'Observ\u00e9 sur {n} {entries}.',
        insight_title_energy_alignment:'Alignement \u00e9nergie-humeur', insight_desc_energy_alignment:'Les jours \u00e0 haute \u00e9nergie (7+) ont une humeur moyenne de {highMood} vs {lowMood} les jours \u00e0 faible \u00e9nergie. \u00c9nergie et humeur sont \u00e9troitement li\u00e9es dans vos donn\u00e9es.', insight_context_energy:'Bas\u00e9 sur {highN} entr\u00e9es \u00e0 haute \u00e9nergie et {lowN} \u00e0 faible \u00e9nergie.',
        insight_title_mood_variable:'Votre humeur a \u00e9t\u00e9 plus variable r\u00e9cemment', insight_desc_mood_variable:'Votre humeur a vari\u00e9 en moyenne de {stdDev} points jour apr\u00e8s jour cette semaine \u2014 plus que d\u2019habitude. La r\u00e9gularit\u00e9 du sommeil en est souvent la cause.', insight_nudge_volatility:'Le sommeil et l\u2019activit\u00e9 alimentent souvent la volatilit\u00e9 \u00e0 court terme.', insight_context_last_days:'Bas\u00e9 sur les {n} derniers jours.',
        insight_tag_lift:'Les jours \u00ab\u00a0{tag}\u00a0\u00bb vous font du bien', insight_tag_weigh:'Les jours \u00ab\u00a0{tag}\u00a0\u00bb vous p\u00e8sent', insight_desc_tag_lift:'Les jours taggu\u00e9s \u00ab\u00a0{tag}\u00a0\u00bb ont une humeur moyenne de {diff} points au-dessus de votre ligne de base. Signal fiable.', insight_desc_tag_weigh:'Les jours \u00ab\u00a0{tag}\u00a0\u00bb tirent votre moyenne d\u2019environ {diff} points. Portez attention \u00e0 ce que ces jours ont en commun.', insight_nudge_tag_weigh:'Remarquez ce que les jours \u00ab\u00a0{tag}\u00a0\u00bb ont en commun.', insight_context_tag_seen:'Vu dans {n} entr\u00e9es taggu\u00e9es.',
        sec_sleep_heading:'Analyses du sommeil', sec_sleep_title:'Analyses du sommeil', sec_sleep_desc:'Tendances entre le sommeil et l\u2019humeur.',
        sec_act_heading:'Analyses des activit\u00e9s', sec_act_title:'Analyses des activit\u00e9s', sec_act_desc:'Activit\u00e9s et niveaux d\u2019\u00e9nergie li\u00e9s \u00e0 l\u2019humeur.',
        sec_stab_heading:'Stabilit\u00e9 de l\u2019humeur', sec_stab_title:'Stabilit\u00e9 de l\u2019humeur', sec_stab_desc:'Signaux sur la volatilit\u00e9, la stabilit\u00e9 et les changements d\u2019humeur au quotidien.',
        sec_tags_heading:'Analyses des \u00e9tiquettes', sec_tags_title:'Analyses des \u00e9tiquettes', sec_tags_desc:'\u00c9tiquettes r\u00e9currentes associ\u00e9es \u00e0 des changements d\u2019humeur.',
        energy_section:'RYTHME ET ENDURANCE', energy_subtitle:'Niveaux d\u2019\u00e9nergie quotidiens.',
        journal_ph:'Qu\u2019est-ce qui a marqu\u00e9 aujourd\u2019hui\u00a0? Qu\u2019est-ce qui a affect\u00e9 votre humeur\u00a0? Pour quoi \u00eates-vous reconnaissant\u00a0?', save_hint:'Enregistr\u00e9 en cliquant sur <strong>Enregistrer l\u2019entr\u00e9e</strong>, ou appuyez sur \u2318S.', act_ph:'ex. exercice, lecture, travail (s\u00e9par\u00e9s par des virgules)', tag_ph:'Ajouter une \u00e9tiquette\u2026',
        modal_mood:'HUMEUR', modal_energy:'\u00c9NERGIE', modal_sleep:'SOMMEIL', modal_acts:'ACTIVIT\u00c9S', modal_tags:'\u00c9TIQUETTES', modal_hrs:'h', modal_edit:'Modifier l\u2019entr\u00e9e', modal_journal:'Journal', modal_del:'\ud83d\uddd1 Supprimer toute l\u2019entr\u00e9e de ce jour',
        recent:'ENTR\u00c9ES R\u00c9CENTES', tap_open:'Appuyer pour ouvrir', no_journal:'Aucun texte de journal enregistr\u00e9',
        no_checkin:'Pas encore de check-in aujourd\u2019hui.', tagging:'Vous avez beaucoup \u00e9tiquet\u00e9 \u00ab\u00a0{tag}\u00a0\u00bb derni\u00e8rement.',
        narrative_start:'Commencez votre premier check-in pour voir des tendances s\u2019afficher ici.', narrative_trend_up:'Votre humeur a progress\u00e9 cette semaine.', narrative_trend_down:'Votre humeur a l\u00e9g\u00e8rement baiss\u00e9 cette semaine.', narrative_steady:'Votre humeur est rest\u00e9e stable cette semaine.',
        narrative_logged:'Aujourd\u2019hui vous avez enregistr\u00e9 une humeur {moodLabel} de {n}.', narrative_strong:'forte', narrative_moderate:'mod\u00e9r\u00e9e', narrative_low:'basse',
        streak_days:'S\u00e9rie de {n} jours \u2014 continuez ainsi\u00a0!', streak_day:'Jour {n} de votre s\u00e9rie.',
        entry_list_empty:'Aucune entr\u00e9e de journal pour l\u2019instant.', entry_list_start:'Commencez votre premier check-in \u2192', no_entries_tagged:'Aucune entr\u00e9e avec l\u2019\u00e9tiquette \u00ab\u00a0{tag}\u00a0\u00bb pour l\u2019instant.', entry_edit:'Modifier', entry_delete:'Supprimer',
        fc_add_7:'Ajoutez au moins 7 jours de donn\u00e9es pour voir les pr\u00e9dictions.', fc_keep_tracking:'Continuez \u00e0 enregistrer pour d\u00e9couvrir des tendances et des d\u00e9clencheurs.',
        toast_saved:'Entr\u00e9e enregistr\u00e9e ✓', toast_journal_deleted:'Journal supprim\u00e9', toast_entry_deleted:'Entr\u00e9e supprim\u00e9e', toast_shared:'Contenu partag\u00e9 ajout\u00e9 au journal', toast_lang:'Langue mise \u00e0 jour ✓', toast_date:'Format de date mis \u00e0 jour ✓', toast_time:'Format d\u2019heure mis \u00e0 jour ✓',
        ds_not_enough:'Pas encore assez de donn\u00e9es pour g\u00e9n\u00e9rer un r\u00e9sum\u00e9.', ds_journal_only:'Vous avez enregistr\u00e9 une entr\u00e9e de journal aujourd\u2019hui. Aucune donn\u00e9e d\u2019humeur n\u2019a \u00e9t\u00e9 enregistr\u00e9e.', ds_photos_only:'Vous avez enregistr\u00e9 des photos pour ce jour, sans donn\u00e9es d\u2019humeur.', ds_mood_only:'Seule l\u2019humeur a \u00e9t\u00e9 enregistr\u00e9e aujourd\u2019hui.',
        dow_need_more:'Ajoutez au moins 2 semaines d\u2019entr\u00e9es pour voir vos tendances hebdomadaires.', dow_no_data:'Aucune donn\u00e9e', dow_average:'moyenne', dow_peak_dip:'Votre humeur tend \u00e0 atteindre un pic le {day1} et un creux le {day2}.',
        insight_empty:'D\u2019autres analyses appara\u00eetront au fur et \u00e0 mesure que vous enregistrez des entr\u00e9es. Suivez l\u2019humeur, le sommeil et les activit\u00e9s pour d\u00e9couvrir des tendances.', insight_collecting:'Les analyses appara\u00eetront une fois suffisamment de donn\u00e9es collect\u00e9es.',
        chart_empty_mood_msg:'Votre tendance d\u2019humeur appara\u00etra ici apr\u00e8s quelques jours enregistr\u00e9s.', chart_empty_sleep_msg:'Les tendances de sommeil \u00e9mergent une fois que vous commencez \u00e0 suivre quotidiennement.', chart_empty_energy_msg:'Les donn\u00e9es d\u2019\u00e9nergie donnent vie \u00e0 ce graphique \u2014 enregistrez votre premier check-in.', chart_empty_velocity_msg:'Suivez au moins deux jours cons\u00e9cutifs pour voir la variation jour apr\u00e8s jour.',
        chart_empty_default:'Ajoutez des entr\u00e9es pour voir ce graphique.', chart_empty_mood_cta:'Enregistrez votre premi\u00e8re humeur', chart_empty_sleep_cta:'Ajouter des donn\u00e9es de sommeil', chart_empty_energy_cta:'Enregistrez votre \u00e9nergie', chart_empty_velocity_cta:'Suivez 2+ jours d\u2019humeur'
    };

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
DP.it = {
        x_last_n:'Ultimi {n} giorni', y_mood:'Umore (1\u201310)', y_sleep:'Sonno (ore)', y_energy:'Energia (1\u201310)', y_velocity:'Variazione umore (giornaliera)',
        ds_mood:'Umore', ds_sleep:'Sonno', ds_energy:'Energia', ds_avg_mood:'Umore medio', ds_forecast:'Previsione', ds_lower:'Limite inferiore', ds_upper:'Limite superiore', ds_trend:'Tendenza',
        chip_avg:'Med. {n}', chip_up:'\u2197 +{n} vs prima', chip_down:'\u2198 {n} vs prima', chip_latest:'Ultimo: {n} vs media', chip_range:'Intervallo {min}\u2013{max}', need_3:'Servono 3+ voci',
        vel_improved:'Umore migliorato di {n} punt{s}', vel_dipped:'Umore calato di {n} punt{s}', vel_no_change:'Nessun cambiamento',
        vel_eyebrow:'TRAIETTORIA', vel_heading:'Variazione giornaliera', vel_subtitle:'Le barre sopra lo zero significano miglioramento; sotto significano calo.',
        stab_eyebrow:'STABILIT\u00c0 14 GG', stab_stable:'Stabile', stab_moderate:'Moderato', stab_volatile:'Volatile', stab_high_vol:'Molto volatile',
        stab_msg_stable:'Il tuo umore \u00e8 stato consistente negli ultimi 14 giorni.', stab_msg_mod:'Alcune fluttuazioni negli ultimi 14 giorni \u2014 nella norma.', stab_msg_vol:'Sbalzi notevoli negli ultimi 14 giorni.', stab_msg_high:'Volatilit\u00e0 significativa negli ultimi 14 giorni.', stab_min_data:'Registra almeno 5 giorni consecutivi per vedere il tuo punteggio di stabilit\u00e0.', stab_based_on:'Basato su {n} voci degli ultimi 14 giorni.',
        fc_days:'Giorni di dati', fc_avg:'Media recente', fc_7day:'Prev. 7 giorni', fc_variability:'Variabilit\u00e0',
        fc_trend_up_strong:'Il tuo umore \u00e8 in costante aumento.', fc_trend_up_gentle:'Leggera tendenza al rialzo nel tuo umore recente.', fc_trend_dn_strong:'Il tuo umore tende gradualmente al ribasso.', fc_trend_dn_gentle:'Leggera tendenza al ribasso nelle ultime settimane.', fc_trend_steady:'Il tuo umore \u00e8 rimasto abbastanza stabile.',
        fc_stab_low:'Bassa variabilit\u00e0 giornaliera, la banda di previsione \u00e8 stretta.', fc_stab_mid:'Alcune variazioni giornaliere significano che il range effettivo pu\u00f2 variare.', fc_stab_high:'Il tuo umore \u00e8 stato molto variabile \u2014 considera questa previsione come indicativa.',
        fc_sleep_up:' Il sonno recente \u00e8 superiore alla tua media, spingendo la previsione verso l\u2019alto.', fc_sleep_dn:' Il sonno recente \u00e8 inferiore alla tua media, tirando la previsione verso il basso.',
        fc_pat_up:'Il tuo umore sta salendo gradualmente \u2014 segnale positivo.', fc_pat_dn:'Leggera tendenza al ribasso. Vale la pena controllare il sonno e le attivit\u00e0.', fc_pat_stable:'Il tuo umore \u00e8 stabile \u2014 il monitoraggio costante ti aiuta a vederlo.',
        fc_low_var:'Bassa variabilit\u00e0 giornaliera suggerisce buon equilibrio.', fc_high_var:'Maggiore variabilit\u00e0 significa una banda di previsione pi\u00f9 ampia.',
        fc_sleep_good:'Il sonno recente \u00e8 migliore della tua media \u2014 questo \u00e8 considerato.', fc_sleep_bad:'Il sonno recente \u00e8 leggermente inferiore alla tua media \u2014 abbassa leggermente la previsione.',
        fc_best_day:'I {day} tendono a essere il tuo giorno migliore \u2014 \u00e8 integrato nella previsione.', fc_based_on:'Questa previsione si basa sugli ultimi {n} giorni registrati. Pi\u00f9 registri, pi\u00f9 \u00e8 accurata.',
        kicker_default:'INSIGHT', kicker_activity:'INSIGHT ATTIVIT\u00c0', kicker_activity_p:'ATTIVIT\u00c0', kicker_sleep:'INSIGHT SONNO', kicker_stability:'STABILIT\u00c0', kicker_tags:'TAG',
        strength_strong:'PATTERN FORTE', strength_moderate:'PATTERN MODERATO', strength_emerging:'SEGNALE EMERGENTE',
        insight_entry:'voce', insight_entries:'voci', insight_observed:'Osservato in {n} {entries}.',
        insight_title_energy_alignment:'Allineamento energia-umore', insight_desc_energy_alignment:'I giorni ad alta energia (7+) hanno un umore medio di {highMood} vs {lowMood} nei giorni a bassa energia. Energia e umore sono strettamente correlati.', insight_context_energy:'Basato su {highN} voci ad alta energia e {lowN} a bassa energia.',
        insight_title_mood_variable:'Il tuo umore \u00e8 stato pi\u00f9 variabile ultimamente', insight_desc_mood_variable:'Il tuo umore \u00e8 variato in media di {stdDev} punti giorno dopo giorno questa settimana \u2014 pi\u00f9 del solito. La regolarit\u00e0 del sonno \u00e8 spesso il fattore nascosto.', insight_nudge_volatility:'Sonno e attivit\u00e0 alimentano spesso la volatilit\u00e0 a breve termine.', insight_context_last_days:'Basato sugli ultimi {n} giorni.',
        insight_tag_lift:'I giorni \u00ab{tag}\u00bb tendono a sollevarti', insight_tag_weigh:'I giorni \u00ab{tag}\u00bb ti pesano', insight_desc_tag_lift:'Nei giorni con tag \u00ab{tag}\u00bb il tuo umore \u00e8 mediamente {diff} punti sopra la tua baseline.', insight_desc_tag_weigh:'I giorni \u00ab{tag}\u00bb abbassano la tua media di circa {diff} punti.', insight_nudge_tag_weigh:'Nota cosa hanno in comune i giorni \u00ab{tag}\u00bb.', insight_context_tag_seen:'Visto in {n} voci taggate.',
        sec_sleep_heading:'Insight sonno', sec_sleep_title:'Insight sonno', sec_sleep_desc:'Tendenze tra sonno e umore.',
        sec_act_heading:'Insight attivit\u00e0', sec_act_title:'Insight attivit\u00e0', sec_act_desc:'Attivit\u00e0 e schemi di energia correlati all\u2019umore.',
        sec_stab_heading:'Stabilit\u00e0 dell\u2019umore', sec_stab_title:'Stabilit\u00e0 dell\u2019umore', sec_stab_desc:'Segnali su volatilit\u00e0, stabilit\u00e0 e variazioni giornaliere.',
        sec_tags_heading:'Insight tag', sec_tags_title:'Insight tag', sec_tags_desc:'Tag ricorrenti associati a cambiamenti di umore.',
        energy_section:'RITMO E RESISTENZA', energy_subtitle:'Livelli di energia giornalieri.',
        journal_ph:'Cosa ha colpito oggi? Cosa ha influenzato il tuo umore? Per cosa sei grato?', save_hint:'Salvato cliccando su <strong>Salva voce</strong>, o premi \u2318S.', act_ph:'es. esercizio, lettura, lavoro (separati da virgola)', tag_ph:'Aggiungi un tag\u2026',
        modal_mood:'UMORE', modal_energy:'ENERGIA', modal_sleep:'SONNO', modal_acts:'ATTIVIT\u00c0', modal_tags:'TAG', modal_hrs:'ore', modal_edit:'Modifica voce', modal_journal:'Diario', modal_del:'\ud83d\uddd1 Elimina l\u2019intera voce di questo giorno',
        recent:'VOCI RECENTI', tap_open:'Tocca per aprire', no_journal:'Nessun testo diario salvato',
        no_checkin:'Nessun check-in ancora oggi.', tagging:'Hai taggato spesso \u00ab{tag}\u00bb ultimamente.',
        narrative_start:'Inizia il tuo primo check-in per vedere i pattern.', narrative_trend_up:'Il tuo umore \u00e8 migliorato questa settimana.', narrative_trend_down:'Il tuo umore \u00e8 leggermente calato questa settimana.', narrative_steady:'Il tuo umore \u00e8 rimasto stabile questa settimana.',
        narrative_logged:'Oggi hai registrato un umore {moodLabel} di {n}.', narrative_strong:'forte', narrative_moderate:'moderato', narrative_low:'basso',
        streak_days:'Serie di {n} giorni \u2014 continua cos\u00ec!', streak_day:'Giorno {n} della tua serie.',
        entry_list_empty:'Nessuna voce di diario ancora.', entry_list_start:'Inizia il tuo primo check-in \u2192', no_entries_tagged:'Nessuna voce con il tag \u00ab{tag}\u00bb ancora.', entry_edit:'Modifica', entry_delete:'Elimina',
        fc_add_7:'Aggiungi almeno 7 giorni di dati per vedere le previsioni.', fc_keep_tracking:'Continua a registrare per scoprire pattern e trigger.',
        toast_saved:'Voce salvata \u2713', toast_journal_deleted:'Diario eliminato', toast_entry_deleted:'Voce eliminata', toast_shared:'Contenuto condiviso aggiunto al diario', toast_lang:'Lingua aggiornata \u2713', toast_date:'Formato data aggiornato \u2713', toast_time:'Formato ora aggiornato \u2713',
        ds_not_enough:'Non ci sono ancora abbastanza dati per generare un riepilogo.', ds_journal_only:'Hai registrato una voce di diario oggi. Nessun dato di umore salvato.', ds_photos_only:'Hai salvato foto per questo giorno, senza dati di umore.', ds_mood_only:'Solo l\u2019umore \u00e8 stato registrato oggi.',
        dow_need_more:'Aggiungi almeno 2 settimane di voci per vedere i tuoi pattern settimanali.', dow_no_data:'Nessun dato', dow_average:'media', dow_peak_dip:'Il tuo umore tende a raggiungere il picco il {day1} e il minimo il {day2}.',
        insight_empty:'Altri insight appariranno man mano che registri pi\u00f9 voci.', insight_collecting:'Gli insight appariranno una volta raccolti abbastanza dati.',
        chart_empty_mood_msg:'La tendenza del tuo umore apparir\u00e0 qui dopo aver registrato alcuni giorni.', chart_empty_sleep_msg:'I pattern del sonno emergono una volta che inizi a monitorare quotidianamente.', chart_empty_energy_msg:'I dati di energia danno vita a questo grafico \u2014 registra il tuo primo check-in.', chart_empty_velocity_msg:'Registra almeno due giorni consecutivi per vedere la variazione giornaliera.',
        chart_empty_default:'Aggiungi voci per vedere questo grafico.', chart_empty_mood_cta:'Registra il tuo primo umore', chart_empty_sleep_cta:'Aggiungi dati sul sonno', chart_empty_energy_cta:'Registra la tua energia', chart_empty_velocity_cta:'Registra 2+ giorni di umore'
    };
DP.pt = {
        x_last_n:'\u00daltimos {n} dias', y_mood:'Humor (1\u201310)', y_sleep:'Sono (h)', y_energy:'Energia (1\u201310)', y_velocity:'Varia\u00e7\u00e3o de humor (di\u00e1ria)',
        ds_mood:'Humor', ds_sleep:'Sono', ds_energy:'Energia', ds_avg_mood:'Humor m\u00e9dio', ds_forecast:'Previs\u00e3o', ds_lower:'Limite inferior', ds_upper:'Limite superior', ds_trend:'Tend\u00eancia',
        chip_avg:'M\u00e9d. {n}', chip_up:'\u2197 +{n} vs antes', chip_down:'\u2198 {n} vs antes', chip_latest:'\u00daltimo: {n} vs m\u00e9d.', chip_range:'Intervalo {min}\u2013{max}', need_3:'3+ entradas necess\u00e1rias',
        vel_improved:'Humor melhorou {n} ponto{s}', vel_dipped:'Humor caiu {n} ponto{s}', vel_no_change:'Sem altera\u00e7\u00e3o',
        vel_eyebrow:'TRAJET\u00d3RIA', vel_heading:'Mudan\u00e7a di\u00e1ria', vel_subtitle:'Barras acima de zero = melhora; abaixo = queda.',
        stab_eyebrow:'ESTABILIDADE 14 DIAS', stab_stable:'Est\u00e1vel', stab_moderate:'Moderado', stab_volatile:'Vol\u00e1til', stab_high_vol:'Muito vol\u00e1til',
        stab_msg_stable:'O seu humor foi consistente nos \u00faltimos 14 dias.', stab_msg_mod:'Algumas flutua\u00e7\u00f5es nos \u00faltimos 14 dias \u2014 dentro do normal.', stab_msg_vol:'Varia\u00e7\u00f5es not\u00e1veis nos \u00faltimos 14 dias.', stab_msg_high:'Volatilidade significativa nos \u00faltimos 14 dias.', stab_min_data:'Registe pelo menos 5 dias consecutivos para ver a sua pontua\u00e7\u00e3o de estabilidade.', stab_based_on:'Baseado em {n} entradas dos \u00faltimos 14 dias.',
        fc_days:'Dias de dados', fc_avg:'M\u00e9dia recente', fc_7day:'Prev. 7 dias', fc_variability:'Variabilidade',
        fc_trend_up_strong:'O seu humor tem estado numa trajet\u00f3ria ascendente est\u00e1vel.', fc_trend_up_gentle:'H\u00e1 uma ligeira tend\u00eancia ascendente no seu humor recente.', fc_trend_dn_strong:'O seu humor tem tendido gradualmente para baixo.', fc_trend_dn_gentle:'Ligeira tend\u00eancia descendente nas \u00faltimas semanas.', fc_trend_steady:'O seu humor tem-se mantido bastante est\u00e1vel.',
        fc_stab_low:'A sua variabilidade di\u00e1ria \u00e9 baixa, a banda de previs\u00e3o \u00e9 estreita.', fc_stab_mid:'Algumas varia\u00e7\u00f5es di\u00e1rias significam que o intervalo real pode variar.', fc_stab_high:'O seu humor tem sido muito vari\u00e1vel \u2014 considere esta previs\u00e3o como indicativa.',
        fc_sleep_up:' O sono recente est\u00e1 acima da sua m\u00e9dia, empurrando a previs\u00e3o para cima.', fc_sleep_dn:' O sono recente est\u00e1 abaixo da sua m\u00e9dia, puxando a previs\u00e3o para baixo.',
        fc_pat_up:'O seu humor tem subido gradualmente \u2014 sinal positivo.', fc_pat_dn:'Ligeira tend\u00eancia descendente. Vale a pena verificar os padr\u00f5es de sono e atividade.', fc_pat_stable:'O seu humor est\u00e1 est\u00e1vel \u2014 o acompanhamento consistente ajuda a ver isso.',
        fc_low_var:'Baixa variabilidade di\u00e1ria sugere bom equil\u00edbrio.', fc_high_var:'Maior variabilidade significa uma banda de previs\u00e3o mais ampla.',
        fc_sleep_good:'O sono recente \u00e9 melhor que a sua m\u00e9dia \u2014 isto \u00e9 considerado.', fc_sleep_bad:'O sono recente est\u00e1 ligeiramente abaixo da sua m\u00e9dia \u2014 baixa ligeiramente a previs\u00e3o.',
        fc_best_day:'As {day}s tendem a ser o seu melhor dia \u2014 est\u00e1 integrado na previs\u00e3o.', fc_based_on:'Esta previs\u00e3o baseia-se nos seus \u00faltimos {n} dias registados. Quanto mais regista, mais precisa fica.',
        kicker_default:'INSIGHT', kicker_activity:'INSIGHT DE ATIVIDADE', kicker_activity_p:'ATIVIDADE', kicker_sleep:'INSIGHT DE SONO', kicker_stability:'ESTABILIDADE', kicker_tags:'ETIQUETAS',
        strength_strong:'PADR\u00c3O FORTE', strength_moderate:'PADR\u00c3O MODERADO', strength_emerging:'SINAL EMERGENTE',
        insight_entry:'entrada', insight_entries:'entradas', insight_observed:'Observado em {n} {entries}.',
        insight_title_energy_alignment:'Alinhamento energia-humor', insight_desc_energy_alignment:'Os dias de alta energia (7+) t\u00eam um humor m\u00e9dio de {highMood} vs {lowMood} nos dias de baixa energia.', insight_context_energy:'Baseado em {highN} entradas de alta energia e {lowN} de baixa energia.',
        insight_title_mood_variable:'O seu humor tem sido mais vari\u00e1vel ultimamente', insight_desc_mood_variable:'O seu humor variou em m\u00e9dia {stdDev} pontos dia-a-dia esta semana \u2014 mais do que o habitual.', insight_nudge_volatility:'O sono e a atividade frequentemente impulsionam a volatilidade a curto prazo.', insight_context_last_days:'Baseado nos \u00faltimos {n} dias.',
        insight_tag_lift:'Os dias de \u201c{tag}\u201d tendem a anim\u00e1-lo', insight_tag_weigh:'Os dias de \u201c{tag}\u201d pesam-lhe', insight_desc_tag_lift:'Nos dias com etiqueta \u201c{tag}\u201d o seu humor \u00e9 em m\u00e9dia {diff} pontos acima da sua linha de base.', insight_desc_tag_weigh:'Os dias de \u201c{tag}\u201d baixam a sua m\u00e9dia cerca de {diff} pontos.', insight_nudge_tag_weigh:'Note o que os dias de \u201c{tag}\u201d t\u00eam em comum.', insight_context_tag_seen:'Visto em {n} entradas com etiqueta.',
        sec_sleep_heading:'Insights de sono', sec_sleep_title:'Insights de sono', sec_sleep_desc:'Padr\u00f5es entre sono e humor.',
        sec_act_heading:'Insights de atividade', sec_act_title:'Insights de atividade', sec_act_desc:'Atividades e padr\u00f5es de energia ligados ao humor.',
        sec_stab_heading:'Estabilidade do humor', sec_stab_title:'Estabilidade do humor', sec_stab_desc:'Sinais sobre volatilidade, estabilidade e varia\u00e7\u00e3o di\u00e1ria.',
        sec_tags_heading:'Insights de etiquetas', sec_tags_title:'Insights de etiquetas', sec_tags_desc:'Etiquetas recorrentes associadas a mudan\u00e7as de humor.',
        energy_section:'RITMO E RESIST\u00caNCIA', energy_subtitle:'N\u00edveis de energia di\u00e1rios.',
        journal_ph:'O que se destacou hoje? O que afetou o seu humor? Pelo que \u00e9 grato?', save_hint:'Guardado ao clicar em <strong>Guardar entrada</strong>, ou prima \u2318S.', act_ph:'ex. exerc\u00edcio, leitura, trabalho (separados por v\u00edrgula)', tag_ph:'Adicionar etiqueta\u2026',
        modal_mood:'HUMOR', modal_energy:'ENERGIA', modal_sleep:'SONO', modal_acts:'ATIVIDADES', modal_tags:'ETIQUETAS', modal_hrs:'h', modal_edit:'Editar entrada', modal_journal:'Di\u00e1rio', modal_del:'\ud83d\uddd1 Eliminar toda a entrada deste dia',
        recent:'ENTRADAS RECENTES', tap_open:'Toque para abrir', no_journal:'Sem texto de di\u00e1rio guardado',
        no_checkin:'Sem check-in hoje ainda.', tagging:'Tem etiquetado \u201c{tag}\u201d muito ultimamente.',
        narrative_start:'Comece o seu primeiro check-in para ver padr\u00f5es.', narrative_trend_up:'O seu humor melhorou esta semana.', narrative_trend_down:'O seu humor baixou um pouco esta semana.', narrative_steady:'O seu humor foi est\u00e1vel esta semana.',
        narrative_logged:'Hoje registou um humor {moodLabel} de {n}.', narrative_strong:'forte', narrative_moderate:'moderado', narrative_low:'baixo',
        streak_days:'S\u00e9rie de {n} dias \u2014 continue assim!', streak_day:'Dia {n} da sua s\u00e9rie.',
        entry_list_empty:'Ainda sem entradas de di\u00e1rio.', entry_list_start:'Comece o seu primeiro check-in \u2192', no_entries_tagged:'Ainda sem entradas com a etiqueta \u201c{tag}\u201d.', entry_edit:'Editar', entry_delete:'Eliminar',
        fc_add_7:'Adicione pelo menos 7 dias de dados para ver previs\u00f5es.', fc_keep_tracking:'Continue a registar para descobrir padr\u00f5es e gatilhos.',
        toast_saved:'Entrada guardada \u2713', toast_journal_deleted:'Di\u00e1rio eliminado', toast_entry_deleted:'Entrada eliminada', toast_shared:'Conte\u00fado partilhado adicionado ao di\u00e1rio', toast_lang:'Idioma atualizado \u2713', toast_date:'Formato de data atualizado \u2713', toast_time:'Formato de hora atualizado \u2713',
        ds_not_enough:'Ainda n\u00e3o h\u00e1 dados suficientes para gerar um resumo.', ds_journal_only:'Registou uma entrada de di\u00e1rio hoje. Nenhum dado de humor foi guardado.', ds_photos_only:'Guardou fotos para este dia, sem dados de humor.', ds_mood_only:'Apenas o humor foi registado hoje.',
        dow_need_more:'Adicione pelo menos 2 semanas de entradas para ver os seus padr\u00f5es semanais.', dow_no_data:'Sem dados', dow_average:'m\u00e9dia', dow_peak_dip:'O seu humor tende a atingir o pico na {day1} e o m\u00ednimo na {day2}.',
        insight_empty:'Mais insights aparecer\u00e3o \u00e0 medida que registar mais entradas.', insight_collecting:'Insights aparecer\u00e3o quando houver dados suficientes.',
        chart_empty_mood_msg:'A sua tend\u00eancia de humor aparecer\u00e1 aqui ap\u00f3s registar alguns dias.', chart_empty_sleep_msg:'Os padr\u00f5es de sono emergem quando come\u00e7ar a registar diariamente.', chart_empty_energy_msg:'Os dados de energia d\u00e3o vida a este gr\u00e1fico \u2014 registe o seu primeiro check-in.', chart_empty_velocity_msg:'Registe pelo menos dois dias consecutivos para ver a varia\u00e7\u00e3o dia-a-dia.',
        chart_empty_default:'Adicione entradas para ver este gr\u00e1fico.', chart_empty_mood_cta:'Registe o seu primeiro humor', chart_empty_sleep_cta:'Adicionar dados de sono', chart_empty_energy_cta:'Registe a sua energia', chart_empty_velocity_cta:'Registe 2+ dias de humor'
    };
DP.nl = {
        x_last_n:'Laatste {n} dagen', y_mood:'Stemming (1\u201310)', y_sleep:'Slaap (uur)', y_energy:'Energie (1\u201310)', y_velocity:'Stemmingsverandering (dagelijks)',
        ds_mood:'Stemming', ds_sleep:'Slaap', ds_energy:'Energie', ds_avg_mood:'Gemiddelde stemming', ds_forecast:'Prognose', ds_lower:'Ondergrens', ds_upper:'Bovengrens', ds_trend:'Trend',
        chip_avg:'Gem. {n}', chip_up:'\u2197 +{n} vs eerder', chip_down:'\u2198 {n} vs eerder', chip_latest:'Huidig: {n} vs gem.', chip_range:'Bereik {min}\u2013{max}', need_3:'3+ vermeldingen nodig',
        vel_improved:'Stemming verbeterd met {n} punt{s}', vel_dipped:'Stemming gedaald met {n} punt{s}', vel_no_change:'Geen verandering',
        vel_eyebrow:'TRAJECT', vel_heading:'Dagelijkse verandering', vel_subtitle:'Staven boven nul = verbetering; eronder = daling.',
        stab_eyebrow:'STABILITEIT 14 D', stab_stable:'Stabiel', stab_moderate:'Gematigd', stab_volatile:'Variabel', stab_high_vol:'Zeer variabel',
        stab_msg_stable:'Je stemming was consistent de afgelopen 14 dagen.', stab_msg_mod:'Wat schommelingen de afgelopen 14 dagen \u2014 normaal bereik.', stab_msg_vol:'Merkbare stemmingswisselingen de afgelopen 14 dagen.', stab_msg_high:'Grote stemmingsvariabiliteit de afgelopen 14 dagen.', stab_min_data:'Registreer minstens 5 opeenvolgende dagen voor je stabiliteitsscore.', stab_based_on:'Gebaseerd op {n} invoer in de laatste 14 dagen.',
        fc_days:'Dagen data', fc_avg:'Recente gem.', fc_7day:'7-daagse prognose', fc_variability:'Variabiliteit',
        fc_trend_up_strong:'Je stemming is op een gestage stijgende lijn.', fc_trend_up_gentle:'Er is een lichte opwaartse drift in je recente stemming.', fc_trend_dn_strong:'Je stemming neigt geleidelijk naar beneden.', fc_trend_dn_gentle:'Er is een lichte neerwaartse drift de afgelopen weken.', fc_trend_steady:'Je stemming is vrij stabiel gebleven.',
        fc_stab_low:'Lage dagelijkse variabiliteit, de prognoseband is smal.', fc_stab_mid:'Enige variatie betekent dat het werkelijke bereik kan vari\u00ebren.', fc_stab_high:'Je stemming was erg variabel \u2014 beschouw deze prognose als indicatief.',
        fc_sleep_up:' Recente slaap is beter dan je gemiddelde, wat de prognose omhoog duwt.', fc_sleep_dn:' Recente slaap is slechter dan je gemiddelde, wat de prognose iets omlaag trekt.',
        fc_pat_up:'Je stemming stijgt geleidelijk \u2014 positief teken.', fc_pat_dn:'Lichte neerwaartse drift. Het loont de slaap- en activiteitspatronen te controleren.', fc_pat_stable:'Je stemming is stabiel \u2014 consistent bijhouden helpt je dit te zien.',
        fc_low_var:'Lage dagelijkse variabiliteit wijst op een goed evenwicht.', fc_high_var:'Hogere variabiliteit betekent een bredere prognoseband.',
        fc_sleep_good:'Recente slaap is beter dan je gemiddelde \u2014 dit wordt meegewogen.', fc_sleep_bad:'Recente slaap is iets onder je gemiddelde \u2014 dit verlaagt de prognose licht.',
        fc_best_day:'{day}en zijn doorgaans je sterkste dag \u2014 dit is verwerkt in de prognose.', fc_based_on:'Deze prognose is gebaseerd op je laatste {n} geregistreerde dagen. Hoe meer je bijhoudt, hoe nauwkeuriger.',
        kicker_default:'INZICHT', kicker_activity:'ACTIVITEITINZICHT', kicker_activity_p:'ACTIVITEIT', kicker_sleep:'SLAAPINZICHT', kicker_stability:'STABILITEIT', kicker_tags:'LABELS',
        strength_strong:'STERK PATROON', strength_moderate:'MATIG PATROON', strength_emerging:'OPKOMEND SIGNAAL',
        insight_entry:'invoer', insight_entries:'invoer', insight_observed:'Waargenomen bij {n} {entries}.',
        insight_title_energy_alignment:'Energie-stemmingsafstemming', insight_desc_energy_alignment:'Dagen met hoge energie (7+) hebben een gemiddelde stemming van {highMood} vs {lowMood} op dagen met lage energie.', insight_context_energy:'Gebaseerd op {highN} invoer met hoge energie en {lowN} met lage energie.',
        insight_title_mood_variable:'Je stemming was de laatste tijd wisselvallig', insight_desc_mood_variable:'Je stemming varieerde deze week gemiddeld met {stdDev} punten per dag \u2014 meer dan normaal.', insight_nudge_volatility:'Slaap en activiteit sturen vaak de korte termijn variabiliteit aan.', insight_context_last_days:'Gebaseerd op de laatste {n} dagen.',
        insight_tag_lift:'"{tag}"-dagen heffen je op', insight_tag_weigh:'"{tag}"-dagen wegen op je', insight_desc_tag_lift:'Op dagen met label "{tag}" is je stemming gemiddeld {diff} punten boven je basislijn.', insight_desc_tag_weigh:'"{tag}"-dagen trekken je gemiddelde circa {diff} punten omlaag.', insight_nudge_tag_weigh:'Let op wat "{tag}"-dagen gemeen hebben.', insight_context_tag_seen:'Gezien in {n} gelabelde invoer.',
        sec_sleep_heading:'Slaapinzichten', sec_sleep_title:'Slaapinzichten', sec_sleep_desc:'Patronen tussen slaap en stemming.',
        sec_act_heading:'Activiteitinzichten', sec_act_title:'Activiteitinzichten', sec_act_desc:'Activiteiten en energiepatronen gekoppeld aan stemming.',
        sec_stab_heading:'Stemmingsstabiliteit', sec_stab_title:'Stemmingsstabiliteit', sec_stab_desc:'Signalen over variabiliteit, stabiliteit en dagelijkse stemmingsverandering.',
        sec_tags_heading:'Labelinzichten', sec_tags_title:'Labelinzichten', sec_tags_desc:'Terugkerende labels geassocieerd met stemmingsverschuivingen.',
        energy_section:'RITME & UITHOUDINGSVERMOGEN', energy_subtitle:'Dagelijkse energieniveaus.',
        journal_ph:'Wat viel op vandaag? Wat be\u00efnvloedde je stemming? Waarvoor ben je dankbaar?', save_hint:'Opgeslagen bij klikken op <strong>Invoer opslaan</strong>, of druk op \u2318S.', act_ph:'bijv. sport, lezen, werk (komma-gescheiden)', tag_ph:'Label toevoegen\u2026',
        modal_mood:'STEMMING', modal_energy:'ENERGIE', modal_sleep:'SLAAP', modal_acts:'ACTIVITEITEN', modal_tags:'LABELS', modal_hrs:'uur', modal_edit:'Invoer bewerken', modal_journal:'Dagboek', modal_del:'\ud83d\uddd1 Volledige invoer voor deze dag verwijderen',
        recent:'RECENTE INVOER', tap_open:'Tik om te openen', no_journal:'Geen dagboektekst opgeslagen',
        no_checkin:'Nog geen check-in vandaag.', tagging:'Je hebt "{tag}" de laatste tijd veel gelabeld.',
        narrative_start:'Begin je eerste check-in om patronen te zien.', narrative_trend_up:'Je stemming verbeterde deze week.', narrative_trend_down:'Je stemming is iets gedaald deze week.', narrative_steady:'Je stemming was stabiel deze week.',
        narrative_logged:'Vandaag logde je een {moodLabel} stemming van {n}.', narrative_strong:'sterke', narrative_moderate:'matige', narrative_low:'lage',
        streak_days:'{n}-daagse reeks \u2014 ga zo door!', streak_day:'Dag {n} van je reeks.',
        entry_list_empty:'Nog geen dagboeknotities.', entry_list_start:'Begin je eerste check-in \u2192', no_entries_tagged:'Nog geen invoer met label "{tag}".', entry_edit:'Bewerken', entry_delete:'Verwijderen',
        fc_add_7:'Voeg minstens 7 dagen data toe om voorspellingen te zien.', fc_keep_tracking:'Blijf bijhouden om patronen en triggers te ontdekken.',
        toast_saved:'Invoer opgeslagen \u2713', toast_journal_deleted:'Dagboek verwijderd', toast_entry_deleted:'Invoer verwijderd', toast_shared:'Gedeelde inhoud toegevoegd aan dagboek', toast_lang:'Taal bijgewerkt \u2713', toast_date:'Datumnotatie bijgewerkt \u2713', toast_time:'Tijdnotatie bijgewerkt \u2713',
        ds_not_enough:'Nog niet genoeg data voor een samenvatting.', ds_journal_only:'Je hebt vandaag een dagboeknotitie gemaakt. Geen stemmingsdata opgeslagen.', ds_photos_only:'Je hebt foto\'s opgeslagen voor deze dag, zonder stemmingsdata.', ds_mood_only:'Alleen stemming is vandaag geregistreerd.',
        dow_need_more:'Voeg minstens 2 weken invoer toe om je wekelijkse patronen te zien.', dow_no_data:'Geen data', dow_average:'gemiddelde', dow_peak_dip:'Je stemming piekt doorgaans op {day1} en is laagst op {day2}.',
        insight_empty:'Meer inzichten verschijnen naarmate je meer invoer registreert.', insight_collecting:'Inzichten verschijnen zodra er voldoende data is verzameld.',
        chart_empty_mood_msg:'Je stemmingstrend verschijnt hier zodra je een paar dagen hebt gelogd.', chart_empty_sleep_msg:'Slaappatronen verschijnen zodra je dagelijks bijhoudt.', chart_empty_energy_msg:'Energiedata geeft dit diagram leven \u2014 log je eerste check-in.', chart_empty_velocity_msg:'Registreer minstens twee opeenvolgende dagen voor de dag-op-dag verandering.',
        chart_empty_default:'Voeg invoer toe om dit diagram te zien.', chart_empty_mood_cta:'Log je eerste stemming', chart_empty_sleep_cta:'Slaapdata toevoegen', chart_empty_energy_cta:'Registreer je energie', chart_empty_velocity_cta:'Registreer 2+ dagen stemming'
    };
DP.pl = {
        x_last_n:'Ostatnie {n} dni', y_mood:'Nastr\u00f3j (1\u201310)', y_sleep:'Sen (godz.)', y_energy:'Energia (1\u201310)', y_velocity:'Zmiana nastroju (dzienna)',
        ds_mood:'Nastr\u00f3j', ds_sleep:'Sen', ds_energy:'Energia', ds_avg_mood:'\u015aredni nastr\u00f3j', ds_forecast:'Prognoza', ds_lower:'Dolna granica', ds_upper:'G\u00f3rna granica', ds_trend:'Trend',
        chip_avg:'\u015ar. {n}', chip_up:'\u2197 +{n} vs wcze\u015bniej', chip_down:'\u2198 {n} vs wcze\u015bniej', chip_latest:'Aktualnie: {n} vs \u015ar.', chip_range:'Zakres {min}\u2013{max}', need_3:'Wymagane 3+ wpisy',
        vel_improved:'Nastr\u00f3j poprawi\u0142 si\u0119 o {n} punkt{s}', vel_dipped:'Nastr\u00f3j spad\u0142 o {n} punkt{s}', vel_no_change:'Brak zmian',
        vel_eyebrow:'TRAJEKTORIA', vel_heading:'Dzienna zmiana', vel_subtitle:'S\u0142upki powy\u017cej zera = poprawa; poni\u017cej = spadek.',
        stab_eyebrow:'STABILNO\u015a\u0106 14 DNI', stab_stable:'Stabilny', stab_moderate:'Umiarkowany', stab_volatile:'Zmienny', stab_high_vol:'Bardzo zmienny',
        stab_msg_stable:'Tw\u00f3j nastr\u00f3j by\u0142 sp\u00f3jny przez ostatnie 14 dni.', stab_msg_mod:'Pewne wahania w ci\u0105gu ostatnich 14 dni \u2014 w normalnym zakresie.', stab_msg_vol:'Znacz\u0105ce wahania nastroju w ci\u0105gu ostatnich 14 dni.', stab_msg_high:'Du\u017ca zmienno\u015b\u0107 nastroju w ci\u0105gu ostatnich 14 dni.', stab_min_data:'Rejestruj co najmniej 5 kolejnych dni, aby zobaczy\u0107 wynik stabilno\u015bci.', stab_based_on:'Oparty na {n} wpisach z ostatnich 14 dni.',
        fc_days:'Dni danych', fc_avg:'Ostatnia \u015br.', fc_7day:'Prognoza 7 dni', fc_variability:'Zmienno\u015b\u0107',
        fc_trend_up_strong:'Tw\u00f3j nastr\u00f3j jest na sta\u0142ej \u015bcie\u017cce wzrostowej.', fc_trend_up_gentle:'Istnieje lekka tendencja wzrostowa w Twoim ostatnim nastroju.', fc_trend_dn_strong:'Tw\u00f3j nastr\u00f3j stopniowo spada.', fc_trend_dn_gentle:'Lekka tendencja spadkowa w ostatnich tygodniach.', fc_trend_steady:'Tw\u00f3j nastr\u00f3j pozosta\u0142 do\u015b\u0107 stabilny.',
        fc_stab_low:'Niska dzienna zmienno\u015b\u0107, pasmo prognozy jest w\u0105skie.', fc_stab_mid:'Pewne wahania oznaczaj\u0105, \u017ce rzeczywisty zakres mo\u017ce si\u0119 r\u00f3\u017cni\u0107.', fc_stab_high:'Tw\u00f3j nastr\u00f3j by\u0142 bardzo zmienny \u2014 traktuj t\u0119 prognoz\u0119 jako orientacyjn\u0105.',
        fc_sleep_up:' Ostatni sen jest powy\u017cej Twojej \u015bredniej, co podnosi prognoz\u0119.', fc_sleep_dn:' Ostatni sen jest poni\u017cej Twojej \u015bredniej, co lekko obni\u017ca prognoz\u0119.',
        fc_pat_up:'Tw\u00f3j nastr\u00f3j stopniowo ro\u015bnie \u2014 pozytywny sygna\u0142.', fc_pat_dn:'Lekka tendencja spadkowa. Warto sprawdzi\u0107 wzorce snu i aktywno\u015bci.', fc_pat_stable:'Tw\u00f3j nastr\u00f3j jest stabilny \u2014 konsekwentne \u015bledzenie pomaga Ci to zobaczy\u0107.',
        fc_low_var:'Niska dzienna zmienno\u015b\u0107 sugeruje dobr\u0105 r\u00f3wnowag\u0119.', fc_high_var:'Wy\u017csza zmienno\u015b\u0107 oznacza szersze pasmo prognozy.',
        fc_sleep_good:'Ostatni sen jest lepszy ni\u017c Twoja \u015brednia \u2014 to jest uwzgl\u0119dnione.', fc_sleep_bad:'Ostatni sen jest nieco poni\u017cej Twojej \u015bredniej \u2014 lekko obni\u017ca prognoz\u0119.',
        fc_best_day:'{day}i maj\u0105 tendencj\u0119 do bycia Twoim najlepszym dniem \u2014 jest to wbudowane w prognoz\u0119.', fc_based_on:'Ta prognoza opiera si\u0119 na Twoich ostatnich {n} zarejestrowanych dniach.',
        kicker_default:'SPOSTRZEZENIE', kicker_activity:'SPOSTRZEZENIE AKTYWNO\u015aCI', kicker_activity_p:'AKTYWNO\u015a\u0106', kicker_sleep:'SPOSTRZEZENIE SNU', kicker_stability:'STABILNO\u015a\u0106', kicker_tags:'TAGI',
        strength_strong:'SILNY WZORZEC', strength_moderate:'UMIARKOWANY WZORZEC', strength_emerging:'NOWY SYGNA\u0141',
        insight_entry:'wpis', insight_entries:'wpis\u00f3w', insight_observed:'Zaobserwowane w {n} {entries}.',
        insight_title_energy_alignment:'Energia i nastr\u00f3j w synchronizacji', insight_desc_energy_alignment:'Dni o wysokiej energii (7+) maj\u0105 \u015bredni nastr\u00f3j {highMood} vs {lowMood} w dniach o niskiej energii.', insight_context_energy:'Na podstawie {highN} wpis\u00f3w o wysokiej energii i {lowN} o niskiej energii.',
        insight_title_mood_variable:'Tw\u00f3j nastr\u00f3j by\u0142 ostatnio bardziej zmienny', insight_desc_mood_variable:'Tw\u00f3j nastr\u00f3j zmienia\u0142 si\u0119 \u015brednio o {stdDev} punkt\u00f3w dziennie w tym tygodniu \u2014 bardziej ni\u017c zwykle.', insight_nudge_volatility:'Sen i aktywno\u015b\u0107 cz\u0119sto nap\u0119dzaj\u0105 kr\u00f3tkoterminow\u0105 zmienno\u015b\u0107.', insight_context_last_days:'Na podstawie ostatnich {n} dni.',
        insight_tag_lift:'Dni \u201e{tag}\u201d maj\u0105 tendencj\u0119 do podnoszenia Ci\u0119', insight_tag_weigh:'Dni \u201e{tag}\u201d Ci\u0119 przyt\u0142aczaj\u0105', insight_desc_tag_lift:'W dniach otagowanych \u201e{tag}\u201d Tw\u00f3j nastr\u00f3j jest \u015brednio {diff} punkt\u00f3w powy\u017cej linii bazowej.', insight_desc_tag_weigh:'Dni \u201e{tag}\u201d obni\u017caj\u0105 Twoj\u0105 \u015bredni\u0105 o ok. {diff} punkt\u00f3w.', insight_nudge_tag_weigh:'Zwr\u00f3\u0107 uwag\u0119, co maj\u0105 wsp\u00f3lnego dni \u201e{tag}\u201d.', insight_context_tag_seen:'Zaobserwowane w {n} otagowanych wpisach.',
        sec_sleep_heading:'Spostrzezenia snu', sec_sleep_title:'Spostrzezenia snu', sec_sleep_desc:'Wzorce mi\u0119dzy snem a nastrojem.',
        sec_act_heading:'Spostrzezenia aktywno\u015bci', sec_act_title:'Spostrzezenia aktywno\u015bci', sec_act_desc:'Aktywno\u015bci i wzorce energii powi\u0105zane z nastrojem.',
        sec_stab_heading:'Stabilno\u015b\u0107 nastroju', sec_stab_title:'Stabilno\u015b\u0107 nastroju', sec_stab_desc:'Sygna\u0142y dotycz\u0105ce zmienno\u015bci, stabilno\u015bci i codziennych zmian nastroju.',
        sec_tags_heading:'Spostrzezenia tag\u00f3w', sec_tags_title:'Spostrzezenia tag\u00f3w', sec_tags_desc:'Powtarzaj\u0105ce si\u0119 tagi zwi\u0105zane ze zmianami nastroju.',
        energy_section:'RYTM I WYTRZYMA\u0141O\u015a\u0106', energy_subtitle:'Dzienne poziomy energii.',
        journal_ph:'Co dzi\u015b wyb\u00f3j\u0142o? Co wp\u0142yn\u0119\u0142o na Tw\u00f3j nastr\u00f3j? Za co jeste\u015b wdzi\u0119czny?', save_hint:'Zapisano po klikni\u0119ciu <strong>Zapisz wpis</strong>, lub naci\u015bnij \u2318S.', act_ph:'np. \u0107wiczenia, czytanie, praca (oddzielone przecinkami)', tag_ph:'Dodaj tag\u2026',
        modal_mood:'NASTR\u00d3J', modal_energy:'ENERGIA', modal_sleep:'SEN', modal_acts:'AKTYWNO\u015aCI', modal_tags:'TAGI', modal_hrs:'godz.', modal_edit:'Edytuj wpis', modal_journal:'Dziennik', modal_del:'\ud83d\uddd1 Usu\u0144 ca\u0142y wpis z tego dnia',
        recent:'OSTATNIE WPISY', tap_open:'Dotknij, aby otworzy\u0107', no_journal:'Brak zapisanego tekstu dziennika',
        no_checkin:'Brak dzisiejszego check-inu.', tagging:'Ostatnio cz\u0119sto tagowa\u0142e\u015b/a\u015b \u201e{tag}\u201d.',
        narrative_start:'Zacznij sw\u00f3j pierwszy check-in, aby zobaczy\u0107 wzorce.', narrative_trend_up:'Tw\u00f3j nastr\u00f3j poprawi\u0142 si\u0119 w tym tygodniu.', narrative_trend_down:'Tw\u00f3j nastr\u00f3j lekko si\u0119 obni\u017cy\u0142 w tym tygodniu.', narrative_steady:'Tw\u00f3j nastr\u00f3j by\u0142 stabilny w tym tygodniu.',
        narrative_logged:'Dzi\u015b zarejestrowa\u0142e\u015b/a\u015b {moodLabel} nastr\u00f3j na poziomie {n}.', narrative_strong:'silny', narrative_moderate:'umiarkowany', narrative_low:'niski',
        streak_days:'Seria {n} dni \u2014 tak trzymaj!', streak_day:'Dzie\u0144 {n} Twojej serii.',
        entry_list_empty:'Jeszcze brak wpis\u00f3w w dzienniku.', entry_list_start:'Zacznij sw\u00f3j pierwszy check-in \u2192', no_entries_tagged:'Brak wpis\u00f3w z tagiem \u201e{tag}\u201d.', entry_edit:'Edytuj', entry_delete:'Usu\u0144',
        fc_add_7:'Dodaj co najmniej 7 dni danych, aby zobaczy\u0107 prognozy.', fc_keep_tracking:'Kontynuuj rejestracj\u0119, aby odkry\u0107 wzorce i wyzwalacze.',
        toast_saved:'Wpis zapisany \u2713', toast_journal_deleted:'Dziennik usuni\u0119ty', toast_entry_deleted:'Wpis usuni\u0119ty', toast_shared:'Udost\u0119pniona tre\u015b\u0107 dodana do dziennika', toast_lang:'J\u0119zyk zaktualizowany \u2713', toast_date:'Format daty zaktualizowany \u2713', toast_time:'Format czasu zaktualizowany \u2713',
        ds_not_enough:'Jeszcze za ma\u0142o danych, aby wygenerowa\u0107 podsumowanie.', ds_journal_only:'Zarejestrowa\u0142e\u015b/a\u015b wpis w dzienniku dzi\u015b. Brak danych o nastroju.', ds_photos_only:'Zapisa\u0142e\u015b/a\u015b zdj\u0119cia na ten dzie\u0144, bez danych o nastroju.', ds_mood_only:'Tylko nastr\u00f3j zosta\u0142 zarejestrowany dzi\u015b.',
        dow_need_more:'Dodaj co najmniej 2 tygodnie wpis\u00f3w, aby zobaczy\u0107 swoje tygodniowe wzorce.', dow_no_data:'Brak danych', dow_average:'\u015brednia', dow_peak_dip:'Tw\u00f3j nastr\u00f3j ma tendencj\u0119 do osi\u0105gania szczytu w {day1} i do minimum w {day2}.',
        insight_empty:'Wi\u0119cej spostrze\u017ce\u0144 pojawi si\u0119 w miar\u0119 dodawania wpis\u00f3w.', insight_collecting:'Spostrze\u017cenia pojawi\u0105 si\u0119 po zebraniu wystarczaj\u0105cej ilo\u015bci danych.',
        chart_empty_mood_msg:'Twoja tendencja nastroju pojawi si\u0119 tutaj po kilku dniach logowania.', chart_empty_sleep_msg:'Wzorce snu wy\u0142aniaj\u0105 si\u0119 po rozpocz\u0119ciu codziennego \u015bledzenia.', chart_empty_energy_msg:'Dane energii o\u017cywiaj\u0105 ten wykres \u2014 zaloguj sw\u00f3j pierwszy check-in.', chart_empty_velocity_msg:'Zarejestruj co najmniej dwa kolejne dni, aby zobaczy\u0107 zmian\u0119 dzie\u0144 po dniu.',
        chart_empty_default:'Dodaj wpisy, aby zobaczy\u0107 ten wykres.', chart_empty_mood_cta:'Zaloguj sw\u00f3j pierwszy nastr\u00f3j', chart_empty_sleep_cta:'Dodaj dane o \u015bnie', chart_empty_energy_cta:'Rejestruj energi\u0119', chart_empty_velocity_cta:'Rejestruj 2+ dni nastroju'
    };
DP.ru = {
        x_last_n:'\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 {n} \u0434\u043d\u0435\u0439', y_mood:'\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 (1\u201310)', y_sleep:'\u0421\u043e\u043d (\u0447)', y_energy:'\u042d\u043d\u0435\u0440\u0433\u0438\u044f (1\u201310)', y_velocity:'\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f (\u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u043e)',
        ds_mood:'\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435', ds_sleep:'\u0421\u043e\u043d', ds_energy:'\u042d\u043d\u0435\u0440\u0433\u0438\u044f', ds_avg_mood:'\u0421\u0440\u0435\u0434\u043d\u0435\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435', ds_forecast:'\u041f\u0440\u043e\u0433\u043d\u043e\u0437', ds_lower:'\u041d\u0438\u0436\u043d\u044f\u044f \u0433\u0440\u0430\u043d\u0438\u0446\u0430', ds_upper:'\u0412\u0435\u0440\u0445\u043d\u044f\u044f \u0433\u0440\u0430\u043d\u0438\u0446\u0430', ds_trend:'\u0422\u0440\u0435\u043d\u0434',
        chip_avg:'\u0421\u0440. {n}', chip_up:'\u2197 +{n} vs \u0440\u0430\u043d\u0435\u0435', chip_down:'\u2198 {n} vs \u0440\u0430\u043d\u0435\u0435', chip_latest:'\u0422\u0435\u043a\u0443\u0449\u0435\u0435: {n} vs \u0441\u0440.', chip_range:'\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d {min}\u2013{max}', need_3:'\u041d\u0443\u0436\u043d\u043e 3+ \u0437\u0430\u043f\u0438\u0441\u0438',
        vel_improved:'\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0443\u043b\u0443\u0447\u0448\u0438\u043b\u043e\u0441\u044c \u043d\u0430 {n} \u0431\u0430\u043b\u043b', vel_dipped:'\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0441\u043d\u0438\u0437\u0438\u043b\u043e\u0441\u044c \u043d\u0430 {n} \u0431\u0430\u043b\u043b', vel_no_change:'\u0411\u0435\u0437 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439',
        vel_eyebrow:'\u0422\u0420\u0410\u0415\u041a\u0422\u041e\u0420\u0418\u042f', vel_heading:'\u0415\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u043e\u0435 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435', vel_subtitle:'\u0421\u0442\u043e\u043b\u0431\u0446\u044b \u0432\u044b\u0448\u0435 \u043d\u0443\u043b\u044f = \u0443\u043b\u0443\u0447\u0448\u0435\u043d\u0438\u0435; \u043d\u0438\u0436\u0435 = \u0441\u043d\u0438\u0436\u0435\u043d\u0438\u0435.',
        stab_eyebrow:'\u0421\u0422\u0410\u0411\u0418\u041b\u042c\u041d\u041e\u0421\u0422\u042c 14 \u0414\u041d.', stab_stable:'\u0421\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e', stab_moderate:'\u0423\u043c\u0435\u0440\u0435\u043d\u043d\u043e', stab_volatile:'\u041f\u0435\u0440\u0435\u043c\u0435\u043d\u0447\u0438\u0432\u043e', stab_high_vol:'\u041e\u0447\u0435\u043d\u044c \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u0447\u0438\u0432\u043e',
        stab_msg_stable:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u044b\u043c \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 14 \u0434\u043d\u0435\u0439.', stab_msg_mod:'\u041d\u0435\u0431\u043e\u043b\u044c\u0448\u0438\u0435 \u043a\u043e\u043b\u0435\u0431\u0430\u043d\u0438\u044f \u0437\u0430 14 \u0434\u043d\u0435\u0439 \u2014 \u0432 \u043f\u0440\u0435\u0434\u0435\u043b\u0430\u0445 \u043d\u043e\u0440\u043c\u044b.', stab_msg_vol:'\u0417\u0430\u043c\u0435\u0442\u043d\u044b\u0435 \u043a\u043e\u043b\u0435\u0431\u0430\u043d\u0438\u044f \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f \u0437\u0430 14 \u0434\u043d\u0435\u0439.', stab_msg_high:'\u0417\u043d\u0430\u0447\u0438\u0442\u0435\u043b\u044c\u043d\u0430\u044f \u043d\u0435\u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f \u0437\u0430 14 \u0434\u043d\u0435\u0439.', stab_min_data:'\u041e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u0439\u0442\u0435 \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 5 \u0434\u043d\u0435\u0439 \u043f\u043e\u0434\u0440\u044f\u0434 \u0434\u043b\u044f \u043e\u0446\u0435\u043d\u043a\u0438 \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u0438.', stab_based_on:'\u041d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 {n} \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0437\u0430 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435 14 \u0434\u043d\u0435\u0439.',
        fc_days:'\u0414\u043d\u0435\u0439 \u0434\u0430\u043d\u043d\u044b\u0445', fc_avg:'\u041f\u043e\u0441\u043b\u0435\u0434\u043d. \u0441\u0440.', fc_7day:'\u041f\u0440\u043e\u0433\u043d\u043e\u0437 7 \u0434\u043d\u0435\u0439', fc_variability:'\u0412\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',
        fc_trend_up_strong:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043d\u0430 \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0439 \u0432\u043e\u0441\u0445\u043e\u0434\u044f\u0449\u0435\u0439 \u0442\u0440\u0430\u0435\u043a\u0442\u043e\u0440\u0438\u0438.', fc_trend_up_gentle:'\u041b\u0451\u0433\u043a\u0438\u0439 \u043f\u043e\u0434\u044a\u0451\u043c \u0432 \u0432\u0430\u0448\u0435\u043c \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0438.', fc_trend_dn_strong:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0435\u043f\u0435\u043d\u043d\u043e \u0441\u043d\u0438\u0436\u0430\u0435\u0442\u0441\u044f.', fc_trend_dn_gentle:'\u041b\u0451\u0433\u043a\u0430\u044f \u043d\u0438\u0441\u0445\u043e\u0434\u044f\u0449\u0430\u044f \u0442\u0435\u043d\u0434\u0435\u043d\u0446\u0438\u044f.', fc_trend_steady:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e.',
        fc_stab_low:'\u041d\u0438\u0437\u043a\u0430\u044f \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u0430\u044f \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c, \u043f\u043e\u043b\u043e\u0441\u0430 \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u0430 \u0443\u0437\u043a\u0430\u044f.', fc_stab_mid:'\u041d\u0435\u043a\u043e\u0442\u043e\u0440\u044b\u0435 \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0435 \u043a\u043e\u043b\u0435\u0431\u0430\u043d\u0438\u044f.', fc_stab_high:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u043e\u0447\u0435\u043d\u044c \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u0447\u0438\u0432\u044b\u043c \u2014 \u043f\u0440\u043e\u0433\u043d\u043e\u0437 \u043e\u0440\u0438\u0435\u043d\u0442\u0438\u0440\u043e\u0432\u043e\u0447\u043d\u044b\u0439.',
        fc_sleep_up:' \u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d \u0432\u044b\u0448\u0435 \u0432\u0430\u0448\u0435\u0439 \u0441\u0440\u0435\u0434\u043d\u0435\u0439, \u0447\u0442\u043e \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u0435\u0442 \u043f\u0440\u043e\u0433\u043d\u043e\u0437.', fc_sleep_dn:' \u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d \u043d\u0438\u0436\u0435 \u0432\u0430\u0448\u0435\u0439 \u0441\u0440\u0435\u0434\u043d\u0435\u0439, \u0447\u0442\u043e \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u0441\u043d\u0438\u0436\u0430\u0435\u0442 \u043f\u0440\u043e\u0433\u043d\u043e\u0437.',
        fc_pat_up:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043f\u043e\u0441\u0442\u0435\u043f\u0435\u043d\u043d\u043e \u0440\u0430\u0441\u0442\u0451\u0442 \u2014 \u043f\u043e\u0437\u0438\u0442\u0438\u0432\u043d\u044b\u0439 \u0437\u043d\u0430\u043a.', fc_pat_dn:'\u041b\u0451\u0433\u043a\u043e\u0435 \u0441\u043d\u0438\u0436\u0435\u043d\u0438\u0435. \u0421\u0442\u043e\u0438\u0442 \u043f\u0440\u043e\u0432\u0435\u0440\u0438\u0442\u044c \u0441\u043e\u043d \u0438 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c.', fc_pat_stable:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e \u2014 \u043f\u043e\u0441\u0442\u043e\u044f\u043d\u043d\u043e\u0435 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u043f\u043e\u043c\u043e\u0433\u0430\u0435\u0442 \u044d\u0442\u043e \u0432\u0438\u0434\u0435\u0442\u044c.',
        fc_low_var:'\u041d\u0438\u0437\u043a\u0430\u044f \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0443\u043a\u0430\u0437\u044b\u0432\u0430\u0435\u0442 \u043d\u0430 \u0445\u043e\u0440\u043e\u0448\u0435\u0435 \u0440\u0430\u0432\u043d\u043e\u0432\u0435\u0441\u0438\u0435.', fc_high_var:'\u0411\u043e\u043b\u044c\u0448\u0430\u044f \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0437\u043d\u0430\u0447\u0438\u0442 \u0431\u043e\u043b\u0435\u0435 \u0448\u0438\u0440\u043e\u043a\u0443\u044e \u043f\u043e\u043b\u043e\u0441\u0443.',
        fc_sleep_good:'\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d \u043b\u0443\u0447\u0448\u0435 \u0432\u0430\u0448\u0435\u0439 \u0441\u0440\u0435\u0434\u043d\u0435\u0439 \u2014 \u044d\u0442\u043e \u0443\u0447\u0442\u0435\u043d\u043e.', fc_sleep_bad:'\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0439 \u0441\u043e\u043d \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u0445\u0443\u0436\u0435 \u0441\u0440\u0435\u0434\u043d\u0435\u0433\u043e \u2014 \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u0441\u043d\u0438\u0436\u0430\u0435\u0442 \u043f\u0440\u043e\u0433\u043d\u043e\u0437.',
        fc_best_day:'{day} \u2014 \u0432\u0430\u0448 \u043b\u0443\u0447\u0448\u0438\u0439 \u0434\u0435\u043d\u044c \u2014 \u0432\u0441\u0442\u0440\u043e\u0435\u043d\u043e \u0432 \u043f\u0440\u043e\u0433\u043d\u043e\u0437.', fc_based_on:'\u041f\u0440\u043e\u0433\u043d\u043e\u0437 \u043e\u0441\u043d\u043e\u0432\u0430\u043d \u043d\u0430 {n} \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0445 \u0434\u043d\u044f\u0445.',
        kicker_default:'\u0418\u041d\u0421\u0410\u0419\u0422', kicker_activity:'\u0418\u041d\u0421\u0410\u0419\u0422 \u0410\u041a\u0422\u0418\u0412\u041d\u041e\u0421\u0422\u0418', kicker_activity_p:'\u0410\u041a\u0422\u0418\u0412\u041d\u041e\u0421\u0422\u042c', kicker_sleep:'\u0418\u041d\u0421\u0410\u0419\u0422 \u0421\u041d\u0410', kicker_stability:'\u0421\u0422\u0410\u0411\u0418\u041b\u042c\u041d\u041e\u0421\u0422\u042c', kicker_tags:'\u0422\u0415\u0413\u0418',
        strength_strong:'\u0421\u0418\u041b\u042c\u041d\u042b\u0419 \u041f\u0410\u0422\u0422\u0415\u0420\u041d', strength_moderate:'\u0423\u041c\u0415\u0420\u0415\u041d\u041d\u042b\u0419 \u041f\u0410\u0422\u0422\u0415\u0420\u041d', strength_emerging:'\u041d\u041e\u0412\u042b\u0419 \u0421\u0418\u0413\u041d\u0410\u041b',
        insight_entry:'\u0437\u0430\u043f\u0438\u0441\u044c', insight_entries:'\u0437\u0430\u043f\u0438\u0441\u0435\u0439', insight_observed:'\u041d\u0430\u0431\u043b\u044e\u0434\u0430\u043b\u043e\u0441\u044c \u0432 {n} {entries}.',
        insight_title_energy_alignment:'\u042d\u043d\u0435\u0440\u0433\u0438\u044f \u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0441\u0438\u043d\u0445\u0440\u043e\u043d\u0438\u0437\u0438\u0440\u043e\u0432\u0430\u043d\u044b', insight_desc_energy_alignment:'\u0412 \u0434\u043d\u0438 \u0432\u044b\u0441\u043e\u043a\u043e\u0439 \u044d\u043d\u0435\u0440\u0433\u0438\u0438 (7+) \u0441\u0440\u0435\u0434\u043d\u0435\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 {highMood} vs {lowMood} \u0432 \u0434\u043d\u0438 \u043d\u0438\u0437\u043a\u043e\u0439.', insight_context_energy:'\u041d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 {highN} \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0441 \u0432\u044b\u0441\u043e\u043a\u043e\u0439 \u044d\u043d\u0435\u0440\u0433\u0438\u0435\u0439 \u0438 {lowN} \u0441 \u043d\u0438\u0437\u043a\u043e\u0439.',
        insight_title_mood_variable:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u0431\u043e\u043b\u0435\u0435 \u043f\u0435\u0440\u0435\u043c\u0435\u043d\u0447\u0438\u0432\u044b\u043c', insight_desc_mood_variable:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043c\u0435\u043d\u044f\u043b\u043e\u0441\u044c \u0432 \u0441\u0440\u0435\u0434\u043d\u0435\u043c \u043d\u0430 {stdDev} \u0431\u0430\u043b\u043b\u043e\u0432 \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u043e.', insight_nudge_volatility:'\u0421\u043e\u043d \u0438 \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0447\u0430\u0441\u0442\u043e \u0432\u043b\u0438\u044f\u044e\u0442 \u043d\u0430 \u043a\u0440\u0430\u0442\u043a\u043e\u0441\u0440\u043e\u0447\u043d\u0443\u044e \u0432\u0430\u0440\u0438\u0430\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c.', insight_context_last_days:'\u041d\u0430 \u043e\u0441\u043d\u043e\u0432\u0435 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0445 {n} \u0434\u043d\u0435\u0439.',
        insight_tag_lift:'\u0414\u043d\u0438 \u00ab{tag}\u00bb \u043f\u043e\u0434\u043d\u0438\u043c\u0430\u044e\u0442 \u0432\u0430\u0441', insight_tag_weigh:'\u0414\u043d\u0438 \u00ab{tag}\u00bb \u0434\u0430\u0432\u044f\u0442 \u043d\u0430 \u0432\u0430\u0441', insight_desc_tag_lift:'\u0412 \u0434\u043d\u0438 \u0441 \u0442\u0435\u0433\u043e\u043c \u00ab{tag}\u00bb \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0432 \u0441\u0440\u0435\u0434\u043d\u0435\u043c {diff} \u0431\u0430\u043b\u043b\u043e\u0432 \u0432\u044b\u0448\u0435 \u0431\u0430\u0437\u043e\u0432\u043e\u0433\u043e.', insight_desc_tag_weigh:'\u0414\u043d\u0438 \u00ab{tag}\u00bb \u0441\u043d\u0438\u0436\u0430\u044e\u0442 \u0432\u0430\u0448\u0443 \u0441\u0440\u0435\u0434\u043d\u044e\u044e \u043f\u0440\u0438\u043c\u0435\u0440\u043d\u043e \u043d\u0430 {diff} \u0431\u0430\u043b\u043b\u0430.', insight_nudge_tag_weigh:'\u041e\u0431\u0440\u0430\u0442\u0438\u0442\u0435 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u0435 \u043d\u0430 \u043e\u0431\u0449\u0435\u0435 \u0432 \u0434\u043d\u044f\u0445 \u00ab{tag}\u00bb.', insight_context_tag_seen:'\u041d\u0430\u0431\u043b\u044e\u0434\u0430\u043b\u043e\u0441\u044c \u0432 {n} \u0437\u0430\u043f\u0438\u0441\u044f\u0445 \u0441 \u0442\u0435\u0433\u0430\u043c\u0438.',
        sec_sleep_heading:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0441\u043d\u0430', sec_sleep_title:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0441\u043d\u0430', sec_sleep_desc:'\u0417\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0438 \u0441\u043d\u0430 \u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f.',
        sec_act_heading:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438', sec_act_title:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0430\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438', sec_act_desc:'\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c \u0438 \u044d\u043d\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0437\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0438.',
        sec_stab_heading:'\u0421\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f', sec_stab_title:'\u0421\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f', sec_stab_desc:'\u0421\u0438\u0433\u043d\u0430\u043b\u044b \u0432\u043e\u043b\u0430\u0442\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u0438, \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u0438 \u0438 \u0435\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0445 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0439.',
        sec_tags_heading:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0442\u0435\u0433\u043e\u0432', sec_tags_title:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u0442\u0435\u0433\u043e\u0432', sec_tags_desc:'\u041f\u043e\u0432\u0442\u043e\u0440\u044f\u044e\u0449\u0438\u0435\u0441\u044f \u0442\u0435\u0433\u0438, \u0441\u0432\u044f\u0437\u0430\u043d\u043d\u044b\u0435 \u0441 \u0438\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u044f\u043c\u0438 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f.',
        energy_section:'\u0420\u0418\u0422\u041c \u0418 \u0412\u042b\u041d\u041e\u0421\u041b\u0418\u0412\u041e\u0421\u0422\u042c', energy_subtitle:'\u0415\u0436\u0435\u0434\u043d\u0435\u0432\u043d\u044b\u0435 \u0443\u0440\u043e\u0432\u043d\u0438 \u044d\u043d\u0435\u0440\u0433\u0438\u0438.',
        journal_ph:'\u0427\u0442\u043e \u0432\u044b\u0434\u0435\u043b\u0438\u043b\u043e\u0441\u044c \u0441\u0435\u0433\u043e\u0434\u043d\u044f? \u0427\u0442\u043e \u043f\u043e\u0432\u043b\u0438\u044f\u043b\u043e \u043d\u0430 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435? \u0417\u0430 \u0447\u0442\u043e \u0432\u044b \u0431\u043b\u0430\u0433\u043e\u0434\u0430\u0440\u043d\u044b?', save_hint:'\u0421\u043e\u0445\u0440\u0430\u043d\u044f\u0435\u0442\u0441\u044f \u043f\u0440\u0438 \u043d\u0430\u0436\u0430\u0442\u0438\u0438 \u043d\u0430 <strong>\u0421\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u0437\u0430\u043f\u0438\u0441\u044c</strong> \u0438\u043b\u0438 \u2318S.', act_ph:'\u043d\u0430\u043f\u0440.: \u0443\u043f\u0440\u0430\u0436\u043d\u0435\u043d\u0438\u044f, \u0447\u0442\u0435\u043d\u0438\u0435, \u0440\u0430\u0431\u043e\u0442\u0430 (\u0447\u0435\u0440\u0435\u0437 \u0437\u0430\u043f\u044f\u0442\u0443\u044e)', tag_ph:'\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u0435\u0433\u2026',
        modal_mood:'\u041d\u0410\u0421\u0422\u0420\u041e\u0415\u041d\u0418\u0415', modal_energy:'\u042d\u041d\u0415\u0420\u0413\u0418\u042f', modal_sleep:'\u0421\u041e\u041d', modal_acts:'\u0410\u041a\u0422\u0418\u0412\u041d\u041e\u0421\u0422\u0418', modal_tags:'\u0422\u0415\u0413\u0418', modal_hrs:'\u0447', modal_edit:'\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c', modal_journal:'\u0414\u043d\u0435\u0432\u043d\u0438\u043a', modal_del:'\ud83d\uddd1 \u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0432\u0441\u044e \u0437\u0430\u043f\u0438\u0441\u044c \u0437\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c',
        recent:'\u041f\u041e\u0421\u041b\u0415\u0414\u041d\u0418\u0415 \u0417\u0410\u041f\u0418\u0421\u0418', tap_open:'\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u0434\u043b\u044f \u043e\u0442\u043a\u0440\u044b\u0442\u0438\u044f', no_journal:'\u0422\u0435\u043a\u0441\u0442 \u0434\u043d\u0435\u0432\u043d\u0438\u043a\u0430 \u043d\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0451\u043d',
        no_checkin:'\u0427\u0435\u043a\u0438\u043d\u0430 \u0441\u0435\u0433\u043e\u0434\u043d\u044f \u0435\u0449\u0451 \u043d\u0435\u0442.', tagging:'\u0412\u044b \u0447\u0430\u0441\u0442\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0435 \u00ab{tag}\u00bb \u0432 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f.',
        narrative_start:'\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0432\u0435\u0441\u0442\u0438 \u0437\u0430\u043f\u0438\u0441\u0438, \u0447\u0442\u043e\u0431\u044b \u0443\u0432\u0438\u0434\u0435\u0442\u044c \u0437\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0438.', narrative_trend_up:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0443\u043b\u0443\u0447\u0448\u0438\u043b\u043e\u0441\u044c \u043d\u0430 \u044d\u0442\u043e\u0439 \u043d\u0435\u0434\u0435\u043b\u0435.', narrative_trend_down:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043d\u0435\u043c\u043d\u043e\u0433\u043e \u0441\u043d\u0438\u0437\u0438\u043b\u043e\u0441\u044c.', narrative_steady:'\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u044b\u043c.',
        narrative_logged:'\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0432\u044b \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043b\u0438 {moodLabel} \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 {n}.', narrative_strong:'\u0445\u043e\u0440\u043e\u0448\u0435\u0435', narrative_moderate:'\u0443\u043c\u0435\u0440\u0435\u043d\u043d\u043e\u0435', narrative_low:'\u043d\u0438\u0437\u043a\u043e\u0435',
        streak_days:'\u0421\u0435\u0440\u0438\u044f {n} \u0434\u043d\u0435\u0439 \u2014 \u043f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0439\u0442\u0435!', streak_day:'\u0414\u0435\u043d\u044c {n} \u0432\u0430\u0448\u0435\u0439 \u0441\u0435\u0440\u0438\u0438.',
        entry_list_empty:'\u0414\u043d\u0435\u0432\u043d\u0438\u043a\u043e\u0432\u044b\u0445 \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.', entry_list_start:'\u041d\u0430\u0447\u043d\u0438\u0442\u0435 \u0441\u0432\u043e\u0439 \u043f\u0435\u0440\u0432\u044b\u0439 \u0447\u0435\u043a\u0438\u043d \u2192', no_entries_tagged:'\u0417\u0430\u043f\u0438\u0441\u0435\u0439 \u0441 \u0442\u0435\u0433\u043e\u043c \u00ab{tag}\u00bb \u043f\u043e\u043a\u0430 \u043d\u0435\u0442.', entry_edit:'\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c', entry_delete:'\u0423\u0434\u0430\u043b\u0438\u0442\u044c',
        fc_add_7:'\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 7 \u0434\u043d\u0435\u0439 \u0434\u0430\u043d\u043d\u044b\u0445 \u0434\u043b\u044f \u043f\u0440\u043e\u0433\u043d\u043e\u0437\u043e\u0432.', fc_keep_tracking:'\u041f\u0440\u043e\u0434\u043e\u043b\u0436\u0430\u0439\u0442\u0435 \u043e\u0442\u0441\u043b\u0435\u0436\u0438\u0432\u0430\u043d\u0438\u0435 \u0434\u043b\u044f \u043e\u0431\u043d\u0430\u0440\u0443\u0436\u0435\u043d\u0438\u044f \u0437\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0435\u0439.',
        toast_saved:'\u0417\u0430\u043f\u0438\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430 \u2713', toast_journal_deleted:'\u0414\u043d\u0435\u0432\u043d\u0438\u043a \u0443\u0434\u0430\u043b\u0451\u043d', toast_entry_deleted:'\u0417\u0430\u043f\u0438\u0441\u044c \u0443\u0434\u0430\u043b\u0435\u043d\u0430', toast_shared:'\u0421\u043e\u0434\u0435\u0440\u0436\u0438\u043c\u043e\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u0434\u043d\u0435\u0432\u043d\u0438\u043a', toast_lang:'\u042f\u0437\u044b\u043a \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713', toast_date:'\u0424\u043e\u0440\u043c\u0430\u0442 \u0434\u0430\u0442\u044b \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713', toast_time:'\u0424\u043e\u0440\u043c\u0430\u0442 \u0432\u0440\u0435\u043c\u0435\u043d\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713',
        ds_not_enough:'\u0415\u0449\u0451 \u043d\u0435\u0434\u043e\u0441\u0442\u0430\u0442\u043e\u0447\u043d\u043e \u0434\u0430\u043d\u043d\u044b\u0445 \u0434\u043b\u044f \u0441\u0432\u043e\u0434\u043a\u0438.', ds_journal_only:'\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0432\u044b \u0434\u043e\u0431\u0430\u0432\u0438\u043b\u0438 \u0437\u0430\u043f\u0438\u0441\u044c \u0432 \u0434\u043d\u0435\u0432\u043d\u0438\u043a. \u0414\u0430\u043d\u043d\u044b\u0435 \u043e \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0438 \u043d\u0435 \u0437\u0430\u043f\u0438\u0441\u0430\u043d\u044b.', ds_photos_only:'\u0412\u044b \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u043b\u0438 \u0444\u043e\u0442\u043e \u0437\u0430 \u044d\u0442\u043e\u0442 \u0434\u0435\u043d\u044c, \u0431\u0435\u0437 \u0434\u0430\u043d\u043d\u044b\u0445 \u043e \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0438.', ds_mood_only:'\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0437\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u0442\u043e\u043b\u044c\u043a\u043e \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435.',
        dow_need_more:'\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u043d\u0435 \u043c\u0435\u043d\u0435\u0435 2 \u043d\u0435\u0434\u0435\u043b\u044c \u0437\u0430\u043f\u0438\u0441\u0435\u0439 \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u043d\u0435\u0434\u0435\u043b\u044c\u043d\u044b\u0445 \u0437\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0435\u0439.', dow_no_data:'\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445', dow_average:'\u0441\u0440\u0435\u0434\u043d\u044f\u044f', dow_peak_dip:'\u0421\u0430\u043c\u044b\u0439 \u0432\u044b\u0441\u043e\u043a\u0438\u0439 \u043d\u0430\u0441\u0442\u0440\u043e\u0439 \u2014 {day1}, \u0441\u0430\u043c\u044b\u0439 \u043d\u0438\u0437\u043a\u0438\u0439 \u2014 {day2}.',
        insight_empty:'\u0411\u043e\u043b\u044c\u0448\u0435 \u0438\u043d\u0441\u0430\u0439\u0442\u043e\u0432 \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u043f\u043e \u043c\u0435\u0440\u0435 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0437\u0430\u043f\u0438\u0441\u0435\u0439.', insight_collecting:'\u0418\u043d\u0441\u0430\u0439\u0442\u044b \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f \u043f\u043e\u0441\u043b\u0435 \u043d\u0430\u043a\u043e\u043f\u043b\u0435\u043d\u0438\u044f \u0434\u0430\u043d\u043d\u044b\u0445.',
        chart_empty_mood_msg:'\u0417\u0434\u0435\u0441\u044c \u043f\u043e\u044f\u0432\u0438\u0442\u0441\u044f \u0434\u0438\u043d\u0430\u043c\u0438\u043a\u0430 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f.', chart_empty_sleep_msg:'\u0417\u0430\u043a\u043e\u043d\u043e\u043c\u0435\u0440\u043d\u043e\u0441\u0442\u0438 \u0441\u043d\u0430 \u043f\u043e\u044f\u0432\u044f\u0442\u0441\u044f.', chart_empty_energy_msg:'\u0414\u0430\u043d\u043d\u044b\u0435 \u044d\u043d\u0435\u0440\u0433\u0438\u0438 \u043e\u0436\u0438\u0432\u044f\u0442 \u0433\u0440\u0430\u0444\u0438\u043a.', chart_empty_velocity_msg:'\u0417\u0430\u0444\u0438\u043a\u0441\u0438\u0440\u0443\u0439\u0442\u0435 \u0434\u0432\u0430 \u0434\u043d\u044f \u043f\u043e\u0434\u0440\u044f\u0434.', chart_empty_default:'\u0414\u043e\u0431\u0430\u0432\u044c\u0442\u0435 \u0437\u0430\u043f\u0438\u0441\u0438 \u0434\u043b\u044f \u043f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0430 \u0433\u0440\u0430\u0444\u0438\u043a\u0430.', chart_empty_mood_cta:'\u0417\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435', chart_empty_sleep_cta:'\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0434\u0430\u043d\u043d\u044b\u0435 \u0441\u043d\u0430', chart_empty_energy_cta:'\u0417\u0430\u043f\u0438\u0448\u0438\u0442\u0435 \u044d\u043d\u0435\u0440\u0433\u0438\u044e', chart_empty_velocity_cta:'\u0417\u0430\u043f\u0438\u0448\u0438\u0442\u0435 2+ \u0434\u043d\u044f'
    };
DP.tr = {
        x_last_n:'Son {n} g\u00fcn', y_mood:'Ruh hali (1\u201310)', y_sleep:'Uyku (saat)', y_energy:'Enerji (1\u201310)', y_velocity:'Ruh hali de\u011fi\u015fimi (g\u00fcnl\u00fck)',
        ds_mood:'Ruh hali', ds_sleep:'Uyku', ds_energy:'Enerji', ds_avg_mood:'Ortalama ruh hali', ds_forecast:'Tahmin', ds_lower:'Alt s\u0131n\u0131r', ds_upper:'\u00dcst s\u0131n\u0131r', ds_trend:'E\u011filim',
        chip_avg:'Ort. {n}', chip_up:'\u2197 +{n} vs \u00f6ncesi', chip_down:'\u2198 {n} vs \u00f6ncesi', chip_latest:'G\u00fcncel: {n} vs ort.', chip_range:'Aral\u0131k {min}\u2013{max}', need_3:'3+ giri\u015f gerekli',
        vel_improved:'Ruh hali {n} puan artt\u0131', vel_dipped:'Ruh hali {n} puan d\u00fc\u015ft\u00fc', vel_no_change:'De\u011fi\u015fiklik yok',
        vel_eyebrow:'Y\u00d6R\u00dcNGE', vel_heading:'G\u00fcnl\u00fck de\u011fi\u015fim', vel_subtitle:'S\u0131f\u0131r\u0131n \u00fcst\u00fcndeki \u00e7ubuklar iyile\u015fmeyi; alt\u0131ndakiler d\u00fc\u015f\u00fc\u015f\u00fc g\u00f6sterir.',
        stab_eyebrow:'14 G\u00dcNL\u00dcK \u0130ST\u0130KRAR', stab_stable:'\u0130stikrarl\u0131', stab_moderate:'Orta', stab_volatile:'De\u011fi\u015fken', stab_high_vol:'\u00c7ok de\u011fi\u015fken',
        stab_msg_stable:'Ruh haliniz son 14 g\u00fcnde tutarl\u0131yd\u0131.', stab_msg_mod:'Son 14 g\u00fcnde baz\u0131 dalgalanmalar \u2014 normal aral\u0131kta.', stab_msg_vol:'Son 14 g\u00fcnde belirgin ruh hali de\u011fi\u015fimleri.', stab_msg_high:'Son 14 g\u00fcnde \u00f6nemli ruh hali dalgalanmas\u0131 tespit edildi.', stab_min_data:'Stabilite puan\u0131n\u0131z\u0131 g\u00f6rmek i\u00e7in en az 5 ard\u0131\u015f\u0131k g\u00fcn kaydedin.', stab_based_on:'Son 14 g\u00fcnden {n} kayda dayanan.',
        fc_days:'Veri g\u00fcnleri', fc_avg:'Son ort.', fc_7day:'7 g\u00fcnl\u00fck tahmin', fc_variability:'De\u011fi\u015fkenlik',
        fc_trend_up_strong:'Ruh haliniz istikrarl\u0131 bir y\u00fckselme e\u011filiminde.', fc_trend_up_gentle:'Son ruh halinizde hafif bir y\u00fckselme var.', fc_trend_dn_strong:'Ruh haliniz yava\u015f\u00e7a a\u015fa\u011f\u0131 e\u011filiyor.', fc_trend_dn_gentle:'Son haftalarda hafif bir a\u015fa\u011f\u0131 e\u011filim var.', fc_trend_steady:'Ruh haliniz olduk\u00e7a dengeli seyretti.',
        fc_stab_low:'G\u00fcnl\u00fck de\u011fi\u015fkenli\u011finiz d\u00fc\u015f\u00fck, tahmin band\u0131 dar.', fc_stab_mid:'Baz\u0131 g\u00fcnl\u00fck varyasyonlar ger\u00e7ek aral\u0131\u011f\u0131n de\u011fi\u015febilece\u011fi anlam\u0131na gelir.', fc_stab_high:'Ruh haliniz \u00e7ok de\u011fi\u015fkendi \u2014 bu tahmini bir k\u0131lavuz olarak de\u011ferlendirin.',
        fc_sleep_up:' Son uykunuz ortalaman\u0131z\u0131n \u00fczerinde, bu tahmini yukar\u0131 iter.', fc_sleep_dn:' Son uykunuz ortalaman\u0131z\u0131n alt\u0131nda, bu tahmini hafif\u00e7e a\u015fa\u011f\u0131 \u00e7eker.',
        fc_pat_up:'Ruh haliniz yava\u015f\u00e7a y\u00fckseliyor \u2014 olumlu i\u015faret.', fc_pat_dn:'Hafif bir a\u015fa\u011f\u0131 e\u011filim var. Uyku ve aktivite d\u00fczenlerini kontrol etmekte fayda var.', fc_pat_stable:'Ruh haliniz dengeli \u2014 tutarl\u0131 takip bunu g\u00f6rmenize yard\u0131mc\u0131 olur.',
        fc_low_var:'D\u00fc\u015f\u00fck g\u00fcnl\u00fck de\u011fi\u015fkenlik iyi bir denge oldu\u011funu g\u00f6sterir.', fc_high_var:'Y\u00fcksek de\u011fi\u015fkenlik tahmin band\u0131n\u0131n daha geni\u015f oldu\u011fu anlam\u0131na gelir.',
        fc_sleep_good:'Son uykunuz ortalaman\u0131zdan daha iyi \u2014 bu hesaba kat\u0131lm\u0131\u015ft\u0131r.', fc_sleep_bad:'Son uykunuz ortalaman\u0131z\u0131n biraz alt\u0131nda \u2014 k\u0131sa vadeli tahmin hafif\u00e7e d\u00fc\u015f\u00fcyor.',
        fc_best_day:'{day}lar en g\u00fc\u00e7l\u00fc g\u00fcn\u00fcn\u00fcz olma e\u011filiminde \u2014 tahmine yans\u0131t\u0131ld\u0131.', fc_based_on:'Bu tahmin son {n} kaydedilmi\u015f g\u00fcn\u00fcn\u00fcze dayan\u0131r. Ne kadar \u00e7ok takip ederseniz o kadar keskinle\u015fir.',
        kicker_default:'\u00d6NG\u00d6R\u00dc', kicker_activity:'AKT\u0130V\u0130TE \u00d6NG\u00d6R\u00dcS\u00dc', kicker_activity_p:'AKT\u0130V\u0130TE', kicker_sleep:'UYKU \u00d6NG\u00d6R\u00dcS\u00dc', kicker_stability:'STAB\u0130L\u0130TE', kicker_tags:'ET\u0130KETLER',
        strength_strong:'G\u00dc\u00c7L\u00dc DESEN', strength_moderate:'ORTA DESEN', strength_emerging:'YEN\u0130 S\u0130NYAL',
        insight_entry:'kay\u0131t', insight_entries:'kay\u0131t', insight_observed:'{n} {entries} genelinde g\u00f6zlendi.',
        insight_title_energy_alignment:'Enerji-ruh hali uyumu', insight_desc_energy_alignment:'Y\u00fcksek enerjili g\u00fcnlerde (7+) ortalama ruh haliniz {highMood} iken d\u00fc\u015f\u00fck enerjili g\u00fcnlerde {lowMood}.', insight_context_energy:'{highN} y\u00fcksek enerjili kay\u0131t ve {lowN} d\u00fc\u015f\u00fck enerjili kaya\u0131ta dayanan.',
        insight_title_mood_variable:'Ruh haliniz son zamanlarda daha de\u011fi\u015fken', insight_desc_mood_variable:'Bu hafta ruh haliniz g\u00fcnden g\u00fcne ortalama {stdDev} puan de\u011fi\u015fti \u2014 normalden daha fazla.', insight_nudge_volatility:'Uyku ve aktivite k\u0131sa vadeli de\u011fi\u015fkenli\u011fi genellikle etkiler.', insight_context_last_days:'Son {n} g\u00fcne dayanan.',
        insight_tag_lift:'"{tag}" g\u00fcnleri sizi y\u00fckseltme e\u011filiminde', insight_tag_weigh:'"{tag}" g\u00fcnleri sizi olumsuz etkiliyor', insight_desc_tag_lift:'"{tag}" ile etiketlenen g\u00fcnlerde ruh haliniz baz \u00e7izginizin {diff} puan \u00fczerinde.', insight_desc_tag_weigh:'"{tag}" g\u00fcnleri ortalaman\u0131z\u0131 yakla\u015f\u0131k {diff} puan d\u00fc\u015f\u00fcr\u00fcyor.', insight_nudge_tag_weigh:'"{tag}" g\u00fcnlerinin ortak y\u00f6nlerine dikkat edin.', insight_context_tag_seen:'{n} etiketli kay\u0131tta g\u00f6r\u00fcld\u00fc.',
        sec_sleep_heading:'Uyku \u00f6ng\u00f6r\u00fcleri', sec_sleep_title:'Uyku \u00f6ng\u00f6r\u00fcleri', sec_sleep_desc:'Uyku ve ruh hali aras\u0131ndaki kal\u0131plar.',
        sec_act_heading:'Aktivite \u00f6ng\u00f6r\u00fcleri', sec_act_title:'Aktivite \u00f6ng\u00f6r\u00fcleri', sec_act_desc:'Ruh haliyle ba\u011flant\u0131l\u0131 aktivite ve enerji kal\u0131plar\u0131.',
        sec_stab_heading:'Ruh hali istikrar\u0131', sec_stab_title:'Ruh hali istikrar\u0131', sec_stab_desc:'Volatilite, istikrar ve g\u00fcnl\u00fck de\u011fi\u015fimlere ili\u015fkin sinyaller.',
        sec_tags_heading:'Etiket \u00f6ng\u00f6r\u00fcleri', sec_tags_title:'Etiket \u00f6ng\u00f6r\u00fcleri', sec_tags_desc:'Ruh hali de\u011fi\u015fiklikleriyle ili\u015fkili tekrar eden etiketler.',
        energy_section:'R\u0130T\u0130M VE DAYANIKLILIK', energy_subtitle:'G\u00fcnl\u00fck enerji seviyeleri.',
        journal_ph:'Bug\u00fcn ne \u00f6ne \u00e7\u0131kt\u0131? Ruh halinizi ne etkiledi? Neden minnettars\u0131n\u0131z?', save_hint:'<strong>Kay\u0131t \u00e7akdet</strong> t\u0131kland\u0131\u011f\u0131nda ya da \u2318S bas\u0131ld\u0131\u011f\u0131nda kaydedilir.', act_ph:'\u00f6rn. egzersiz, okuma, i\u015f (virg\u00fclle ayr\u0131lm\u0131\u015f)', tag_ph:'Etiket ekle\u2026',
        modal_mood:'RUH HAL\u0130', modal_energy:'ENERJ\u0130', modal_sleep:'UYKU', modal_acts:'AKT\u0130V\u0130TELER', modal_tags:'ET\u0130KETLER', modal_hrs:'saat', modal_edit:'Kay\u0131t d\u00fczenle', modal_journal:'G\u00fcnl\u00fck', modal_del:'\ud83d\uddd1 Bu g\u00fcne ait t\u00fcm kay\u0131t\u0131 sil',
        recent:'SON G\u0130R\u0130\u015eLER', tap_open:'A\u00e7mak i\u00e7in dokun', no_journal:'G\u00fcnl\u00fck metni kaydedilmedi',
        no_checkin:'Bug\u00fcn hen\u00fcz check-in yok.', tagging:'Son zamanlarda s\u0131k\u00e7a "{tag}" etiketi kulland\u0131n\u0131z.',
        narrative_start:'Kal\u0131plar\u0131 g\u00f6rmek i\u00e7in ilk check-in\'inizi kaydedin.', narrative_trend_up:'Ruh haliniz bu hafta iyile\u015fti.', narrative_trend_down:'Ruh haliniz bu hafta biraz d\u00fc\u015ft\u00fc.', narrative_steady:'Ruh haliniz bu hafta istikrarl\u0131yd\u0131.',
        narrative_logged:'Bug\u00fcn {moodLabel} d\u00fczeyde {n} ruh hali kaydettiniz.', narrative_strong:'g\u00fc\u00e7l\u00fc', narrative_moderate:'orta', narrative_low:'d\u00fc\u015f\u00fck',
        streak_days:'{n} g\u00fcnl\u00fck seri \u2014 devam edin!', streak_day:'Serinizin {n}. g\u00fcn\u00fc.',
        entry_list_empty:'Hen\u00fcz g\u00fcnl\u00fck giri\u015fi yok.', entry_list_start:'\u0130lk check-in\'inize ba\u015flay\u0131n \u2192', no_entries_tagged:'"{tag}" etiketi i\u00e7eren giri\u015f yok.', entry_edit:'D\u00fczenle', entry_delete:'Sil',
        fc_add_7:'Tahminleri g\u00f6rmek i\u00e7in en az 7 g\u00fcnl\u00fck veri ekleyin.', fc_keep_tracking:'Kal\u0131plar\u0131 ke\u015ffetmek i\u00e7in takibe devam edin.',
        toast_saved:'Kay\u0131t kaydedildi \u2713', toast_journal_deleted:'G\u00fcnl\u00fck silindi', toast_entry_deleted:'Kay\u0131t silindi', toast_shared:'Payla\u015f\u0131lan i\u00e7erik g\u00fcnl\u00fc\u011fe eklendi', toast_lang:'Dil g\u00fcncellendi \u2713', toast_date:'Tarih format\u0131 g\u00fcncellendi \u2713', toast_time:'Saat format\u0131 g\u00fcncellendi \u2713',
        ds_not_enough:'Hen\u00fcz \u00f6zet olu\u015fturmak i\u00e7in yeterli veri yok.', ds_journal_only:'Bug\u00fcn bir g\u00fcnl\u00fck giri\u015fi kaydettiniz. Ruh hali verisi kaydedilmedi.', ds_photos_only:'Bu g\u00fcn i\u00e7in ruh hali verisi olmadan foto\u011fraf kaydettiniz.', ds_mood_only:'Bug\u00fcn yaln\u0131zca ruh hali kaydedildi.',
        dow_need_more:'Haftal\u0131k kal\u0131plar\u0131 g\u00f6rmek i\u00e7in en az 2 haftal\u0131k giri\u015f ekleyin.', dow_no_data:'Veri yok', dow_average:'ortalama', dow_peak_dip:'Ruh haliniz genellikle {day1} g\u00fcnleri zirveye ula\u015f\u0131r ve {day2} g\u00fcnleri dipte olur.',
        insight_empty:'Daha fazla giri\u015f kaydettik\u00e7e daha fazla \u00f6ng\u00f6r\u00fc ortaya \u00e7\u0131kar.', insight_collecting:'Yeterli veri topland\u0131\u011f\u0131nda \u00f6ng\u00f6r\u00fcler g\u00f6r\u00fcnecek.',
        chart_empty_mood_msg:'Birka\u00e7 g\u00fcn kaydettikten sonra ruh hali trendi burada g\u00f6r\u00fcnecek.', chart_empty_sleep_msg:'G\u00fcnl\u00fck takibe ba\u015flad\u0131\u011f\u0131n\u0131zda uyku kal\u0131plar\u0131 ortaya \u00e7\u0131kar.', chart_empty_energy_msg:'Enerji verileri bu grafi\u011fe hayat verir \u2014 ilk check-in\'inizi kaydedin.', chart_empty_velocity_msg:'G\u00fcn g\u00fcne de\u011fi\u015fimi g\u00f6rmek i\u00e7in en az iki ard\u0131\u015f\u0131k g\u00fcn takip edin.',
        chart_empty_default:'Bu grafi\u011fi g\u00f6rmek i\u00e7in giri\u015f ekleyin.', chart_empty_mood_cta:'\u0130lk ruh halinizi kaydedin', chart_empty_sleep_cta:'Uyku verisi ekle', chart_empty_energy_cta:'Enerjinizi kay\u0131t edin', chart_empty_velocity_cta:'2+ g\u00fcn ruh hali kaydedin'
    };
DP.ja = {
        x_last_n:'\u904e\u53bb{n}\u65e5\u9593', y_mood:'\u6c17\u5206 (1\u201310)', y_sleep:'\u7761\u7720 (\u6642\u9593)', y_energy:'\u30a8\u30cd\u30eb\u30ae\u30fc (1\u201310)', y_velocity:'\u6c17\u5206\u5909\u5316 (\u65e5\u3005)',
        ds_mood:'\u6c17\u5206', ds_sleep:'\u7761\u7720', ds_energy:'\u30a8\u30cd\u30eb\u30ae\u30fc', ds_avg_mood:'\u5e73\u5747\u6c17\u5206', ds_forecast:'\u4e88\u6e2c', ds_lower:'\u4e0b\u9650', ds_upper:'\u4e0a\u9650', ds_trend:'\u30c8\u30ec\u30f3\u30c9',
        chip_avg:'\u5e73\u5747 {n}', chip_up:'\u2197 +{n} vs \u4ee5\u524d', chip_down:'\u2198 {n} vs \u4ee5\u524d', chip_latest:'\u73fe\u5728: {n} vs \u5e73\u5747', chip_range:'\u7bc4\u56f2 {min}\u2013{max}', need_3:'3\u4ef6\u4ee5\u4e0a\u5fc5\u8981',
        vel_improved:'\u6c17\u5206\u304c{n}\u30dd\u30a4\u30f3\u30c8\u6539\u5584', vel_dipped:'\u6c17\u5206\u304c{n}\u30dd\u30a4\u30f3\u30c8\u4e0b\u964d', vel_no_change:'\u5909\u5316\u306a\u3057',
        vel_eyebrow:'\u6c17\u5206\u306e\u8ecc\u8de1', vel_heading:'\u65e5\u3005\u306e\u5909\u5316', vel_subtitle:'\u30bc\u30ed\u4ee5\u4e0a\u306e\u30d0\u30fc\u306f\u6539\u5584\u3001\u4ee5\u4e0b\u306f\u4f4e\u4e0b\u3092\u793a\u3057\u307e\u3059\u3002',
        stab_eyebrow:'14\u65e5\u9593\u5b89\u5b9a\u6027', stab_stable:'\u5b89\u5b9a', stab_moderate:'\u666e\u901a', stab_volatile:'\u4e0d\u5b89\u5b9a', stab_high_vol:'\u975e\u5e38\u306b\u4e0d\u5b89\u5b9a',
        stab_msg_stable:'\u904e\u53bb14\u65e5\u9593\u3001\u6c17\u5206\u306f\u5b89\u5b9a\u3057\u3066\u3044\u307e\u3057\u305f\u3002', stab_msg_mod:'\u904e\u53bb14\u65e5\u9593\u306b\u82e5\u5e72\u306e\u5909\u52d5 \u2014 \u6b63\u5e38\u7bc4\u56f2\u5185\u3002', stab_msg_vol:'\u904e\u53bb14\u65e5\u9593\u306b\u76ee\u7acb\u3064\u6c17\u5206\u306e\u8d77\u4f0f\u3002', stab_msg_high:'\u904e\u53bb14\u65e5\u9593\u306b\u5927\u304d\u306a\u6c17\u5206\u306e\u4e0d\u5b89\u5b9a\u6027\u3002', stab_min_data:'\u5b89\u5b9a\u6027\u30b9\u30b3\u30a2\u306b\u306f5\u65e5\u4ee5\u4e0a\u9023\u7d9a\u3057\u3066\u8a18\u9332\u3057\u3066\u304f\u3060\u3055\u3044\u3002', stab_based_on:'\u904e\u53bb14\u65e5\u9593\u306e{n}\u4ef6\u306e\u8a18\u9332\u306b\u57fa\u3065\u304f\u3002',
        fc_days:'\u30c7\u30fc\u30bf\u65e5\u6570', fc_avg:'\u76f4\u8fd1\u5e73\u5747', fc_7day:'7\u65e5\u9593\u4e88\u6e2c', fc_variability:'\u5909\u52d5\u6027',
        fc_trend_up_strong:'\u6c17\u5206\u306f\u5b89\u5b9a\u7684\u306a\u4e0a\u6607\u8ecc\u9053\u306b\u3042\u308a\u307e\u3059\u3002', fc_trend_up_gentle:'\u8fd1\u9803\u306e\u6c17\u5206\u306b\u8efd\u3044\u4e0a\u6607\u50be\u5411\u304c\u3042\u308a\u307e\u3059\u3002', fc_trend_dn_strong:'\u6c17\u5206\u306f\u5f90\u3005\u306b\u4e0b\u6b20\u50be\u5411\u3067\u3059\u3002', fc_trend_dn_gentle:'\u8fd1\u9803\u306b\u8efd\u3044\u4e0b\u6b20\u50be\u5411\u304c\u3042\u308a\u307e\u3059\u3002', fc_trend_steady:'\u6c17\u5206\u306f\u6bd4\u8f03\u7684\u5b89\u5b9a\u3057\u3066\u3044\u307e\u3059\u3002',
        fc_stab_low:'\u65e5\u3005\u306e\u5909\u52d5\u6027\u304c\u4f4e\u304f\u3001\u4e88\u6e2c\u5e2f\u57df\u306f\u72ed\u3044\u3067\u3059\u3002', fc_stab_mid:'\u65e5\u3005\u306e\u5909\u52d5\u304c\u3042\u308a\u3001\u5b9f\u969b\u306e\u7bc4\u56f2\u306f\u5909\u308f\u308b\u53ef\u80fd\u6027\u304c\u3042\u308a\u307e\u3059\u3002', fc_stab_high:'\u6c17\u5206\u304c\u975e\u5e38\u306b\u5909\u52d5\u3057\u3084\u3059\u304b\u3063\u305f\u3068\u304d \u2014 \u3053\u306e\u4e88\u6e2c\u306f\u76ee\u5b89\u3068\u3057\u3066\u6271\u3063\u3066\u304f\u3060\u3055\u3044\u3002',
        fc_sleep_up:' \u8fd1\u9803\u306e\u7761\u7720\u306f\u5e73\u5747\u3092\u4e0a\u56de\u308a\u3001\u4e88\u6e2c\u3092\u4e0a\u3052\u3066\u3044\u307e\u3059\u3002', fc_sleep_dn:' \u8fd1\u9803\u306e\u7761\u7720\u306f\u5e73\u5747\u3092\u4e0b\u56de\u308a\u3001\u4e88\u6e2c\u3092\u5c11\u3057\u4e0b\u3052\u3066\u3044\u307e\u3059\u3002',
        fc_pat_up:'\u6c17\u5206\u304c\u5f90\u3005\u306b\u4e0a\u6607\u4e2d \u2014 \u826f\u3044\u50be\u5411\u3067\u3059\u3002', fc_pat_dn:'\u8efd\u3044\u4e0b\u6b20\u50be\u5411\u3002\u7761\u7720\u3068\u6d3b\u52d5\u30d1\u30bf\u30fc\u30f3\u3092\u78ba\u8a8d\u3059\u308b\u3068\u3044\u3044\u3067\u3057\u3087\u3046\u3002', fc_pat_stable:'\u6c17\u5206\u304c\u5b89\u5b9a \u2014 \u7d99\u7d9a\u7684\u306a\u8a18\u9332\u304c\u8a3c\u660e\u3057\u3066\u3044\u307e\u3059\u3002',
        fc_low_var:'\u65e5\u3005\u306e\u4f4e\u3044\u5909\u52d5\u6027\u306f\u826f\u3044\u30d0\u30e9\u30f3\u30b9\u3092\u793a\u3057\u307e\u3059\u3002', fc_high_var:'\u9ad8\u3044\u5909\u52d5\u6027\u306f\u4e88\u6e2c\u5e2f\u57df\u304c\u5e83\u304f\u306a\u308b\u3053\u3068\u3092\u610f\u5473\u3057\u307e\u3059\u3002',
        fc_sleep_good:'\u8fd1\u9803\u306e\u7761\u7720\u306f\u5e73\u5747\u3088\u308a\u826f\u3044 \u2014 \u8003\u616e\u6e08\u307f\u3067\u3059\u3002', fc_sleep_bad:'\u8fd1\u9803\u306e\u7761\u7720\u306f\u5e73\u5747\u3092\u5c11\u3057\u4e0b\u56de\u308a \u2014 \u8fd1\u672a\u6765\u306e\u4e88\u6e2c\u3092\u5c11\u3057\u4e0b\u3052\u307e\u3059\u3002',
        fc_best_day:'{day}\u66dc\u65e5\u304c\u6700\u3082\u5f37\u3044\u65e5\u306e\u50be\u5411 \u2014 \u65e5\u5225\u4e88\u6e2c\u306b\u53cd\u6620\u3055\u308c\u3066\u3044\u307e\u3059\u3002', fc_based_on:'\u3053\u306e\u4e88\u6e2c\u306f\u76f4\u8fd1{n}\u65e5\u9593\u306e\u8a18\u9332\u306b\u57fa\u3065\u3044\u3066\u3044\u307e\u3059\u3002',
        kicker_default:'\u30a4\u30f3\u30b5\u30a4\u30c8', kicker_activity:'\u6d3b\u52d5\u30a4\u30f3\u30b5\u30a4\u30c8', kicker_activity_p:'\u6d3b\u52d5', kicker_sleep:'\u7761\u7720\u30a4\u30f3\u30b5\u30a4\u30c8', kicker_stability:'\u5b89\u5b9a\u6027', kicker_tags:'\u30bf\u30b0',
        strength_strong:'\u5f37\u3044\u30d1\u30bf\u30fc\u30f3', strength_moderate:'\u4e2d\u7a0b\u5ea6\u306e\u30d1\u30bf\u30fc\u30f3', strength_emerging:'\u65b0\u3057\u3044\u30b7\u30b0\u30ca\u30eb',
        insight_entry:'\u4ef6', insight_entries:'\u4ef6', insight_observed:'{n}{entries}\u5168\u4f53\u3067\u89b3\u5bdf\u3055\u308c\u307e\u3057\u305f\u3002',
        insight_title_energy_alignment:'\u30a8\u30cd\u30eb\u30ae\u30fc\u30fb\u6c17\u5206\u306e\u9023\u52d5', insight_desc_energy_alignment:'\u9ad8\u30a8\u30cd\u30eb\u30ae\u30fc\u306e\u65e5(7+)\u306e\u5e73\u5747\u6c17\u5206\u306f{highMood}\u3001\u4f4e\u30a8\u30cd\u30eb\u30ae\u30fc\u65e5\u306f{lowMood}\u3067\u3059\u3002', insight_context_energy:'\u9ad8\u30a8\u30cd\u30eb\u30ae\u30fc{highN}\u4ef6\u3001\u4f4e\u30a8\u30cd\u30eb\u30ae\u30fc{lowN}\u4ef6\u3002',
        insight_title_mood_variable:'\u8fd1\u9803\u3001\u6c17\u5206\u306e\u8d77\u4f0f\u304c\u5897\u3048\u3066\u3044\u307e\u3059', insight_desc_mood_variable:'\u4eca\u9031\u306f1\u65e5\u5e73\u5747{stdDev}\u30dd\u30a4\u30f3\u30c8\u306e\u6c17\u5206\u5909\u52d5\u3002\u3044\u3064\u3082\u3088\u308a\u591a\u3044\u3067\u3059\u3002', insight_nudge_volatility:'\u7761\u7720\u3068\u6d3b\u52d5\u304c\u77ed\u671f\u5909\u52d5\u306e\u5927\u304d\u306a\u8981\u56e0\u3067\u3059\u3002', insight_context_last_days:'\u904e\u53bb{n}\u65e5\u9593\u306e\u30c7\u30fc\u30bf\u3002',
        insight_tag_lift:'"{tag}"\u306e\u65e5\u306f\u6c17\u5206\u3092\u4e0a\u3052\u308b\u50be\u5411', insight_tag_weigh:'"{tag}"\u306e\u65e5\u306f\u6c17\u5206\u3092\u4e0b\u3052\u308b\u50be\u5411', insight_desc_tag_lift:'"{tag}"\u30bf\u30b0\u306e\u65e5\u306f\u57fa\u6e96\u3088\u308a\u5e73\u5747{diff}\u30dd\u30a4\u30f3\u30c8\u9ad8\u3044\u3002', insight_desc_tag_weigh:'"{tag}"\u306e\u65e5\u306f\u5e73\u5747\u3092\u7d04{diff}\u30dd\u30a4\u30f3\u30c8\u4e0b\u3052\u308b\u3002', insight_nudge_tag_weigh:'"{tag}"\u306e\u65e5\u306b\u5171\u901a\u70b9\u3092\u63a2\u3063\u3066\u307f\u307e\u3057\u3087\u3046\u3002', insight_context_tag_seen:'{n}\u4ef6\u306e\u30bf\u30b0\u4ed8\u304d\u8a18\u9332\u3002',
        sec_sleep_heading:'\u7761\u7720\u30a4\u30f3\u30b5\u30a4\u30c8', sec_sleep_title:'\u7761\u7720\u30a4\u30f3\u30b5\u30a4\u30c8', sec_sleep_desc:'\u7761\u7720\u3068\u6c17\u5206\u306e\u30d1\u30bf\u30fc\u30f3\u3002',
        sec_act_heading:'\u6d3b\u52d5\u30a4\u30f3\u30b5\u30a4\u30c8', sec_act_title:'\u6d3b\u52d5\u30a4\u30f3\u30b5\u30a4\u30c8', sec_act_desc:'\u6c17\u5206\u3068\u9023\u52d5\u3059\u308b\u6d3b\u52d5\u3068\u30a8\u30cd\u30eb\u30ae\u30fc\u306e\u30d1\u30bf\u30fc\u30f3\u3002',
        sec_stab_heading:'\u6c17\u5206\u306e\u5b89\u5b9a\u6027', sec_stab_title:'\u6c17\u5206\u306e\u5b89\u5b9a\u6027', sec_stab_desc:'\u5909\u52d5\u6027\u3001\u5b89\u5b9a\u6027\u3001\u65e5\u5e38\u306e\u6c17\u5206\u5909\u5316\u306e\u30b7\u30b0\u30ca\u30eb\u3002',
        sec_tags_heading:'\u30bf\u30b0\u30a4\u30f3\u30b5\u30a4\u30c8', sec_tags_title:'\u30bf\u30b0\u30a4\u30f3\u30b5\u30a4\u30c8', sec_tags_desc:'\u6c17\u5206\u306e\u5909\u5316\u3068\u95a2\u9023\u3059\u308b\u30bf\u30b0\u306e\u30d1\u30bf\u30fc\u30f3\u3002',
        energy_section:'\u30ea\u30ba\u30e0\u3068\u30b9\u30bf\u30df\u30ca', energy_subtitle:'\u65e5\u3005\u306e\u30a8\u30cd\u30eb\u30ae\u30fc\u30ec\u30d9\u30eb\u3002',
        journal_ph:'\u4eca\u65e5\u5370\u8c61\u306b\u6b8b\u3063\u305f\u3053\u3068\u306f\uff1f\u6c17\u5206\u306b\u5f71\u97ff\u3057\u305f\u3053\u3068\u306f\uff1f\u611f\u8b1d\u3057\u3066\u3044\u308b\u3053\u3068\u306f\uff1f', save_hint:'<strong>\u8a18\u9332\u3092\u4fdd\u5b58</strong>\u30dc\u30bf\u30f3\u3092\u30af\u30ea\u30c3\u30af\u3059\u308b\u304b \u2318S\u3067\u4fdd\u5b58\u3002', act_ph:'\u4f8b: \u904b\u52d5\u3001\u8aad\u66f8\u3001\u4ed5\u4e8b (\u30ab\u30f3\u30de\u533a\u5207\u308a)', tag_ph:'\u30bf\u30b0\u3092\u8ffd\u52a0\u2026',
        modal_mood:'\u6c17\u5206', modal_energy:'\u30a8\u30cd\u30eb\u30ae\u30fc', modal_sleep:'\u7761\u7720', modal_acts:'\u6d3b\u52d5', modal_tags:'\u30bf\u30b0', modal_hrs:'\u6642\u9593', modal_edit:'\u8a18\u9332\u3092\u7de8\u96c6', modal_journal:'\u65e5\u8a18', modal_del:'\ud83d\uddd1 \u3053\u306e\u65e5\u306e\u8a18\u9332\u3092\u5168\u3066\u524a\u9664',
        recent:'\u6700\u8fd1\u306e\u8a18\u9332', tap_open:'\u30bf\u30c3\u30d7\u3057\u3066\u958b\u304f', no_journal:'\u65e5\u8a18\u30c6\u30ad\u30b9\u30c8\u306a\u3057',
        no_checkin:'\u4eca\u65e5\u306e\u30c1\u30a7\u30c3\u30af\u30a4\u30f3\u306f\u307e\u3060\u3067\u3059\u3002', tagging:'\u6700\u8fd1\u300c{tag}\u300d\u3092\u3088\u304f\u4f7f\u3063\u3066\u3044\u307e\u3059\u3002',
        narrative_start:'\u6700\u521d\u306e\u30c1\u30a7\u30c3\u30af\u30a4\u30f3\u3092\u8a18\u9332\u3057\u3066\u30d1\u30bf\u30fc\u30f3\u3092\u898b\u3064\u3051\u307e\u3057\u3087\u3046\u3002', narrative_trend_up:'\u4eca\u9031\u306f\u6c17\u5206\u304c\u4e0a\u6607\u3057\u3066\u3044\u307e\u3059\u3002', narrative_trend_down:'\u4eca\u9031\u306f\u6c17\u5206\u304c\u5c11\u3057\u4e0b\u3052\u3066\u3044\u307e\u3059\u3002', narrative_steady:'\u4eca\u9031\u306f\u6c17\u5206\u304c\u5b89\u5b9a\u3057\u3066\u3044\u307e\u3059\u3002',
        narrative_logged:'\u4eca\u65e5\u306f{moodLabel}\u6c17\u5206{n}\u3092\u8a18\u9332\u3057\u307e\u3057\u305f\u3002', narrative_strong:'\u5143\u6c17\u306a', narrative_moderate:'\u666e\u901a\u306e', narrative_low:'\u4f4e\u3044',
        streak_days:'{n}\u65e5\u9023\u7d9a \u2014 \u7d9a\u3051\u3066\uff01', streak_day:'\u30b9\u30c8\u30ea\u30fc\u30af{n}\u65e5\u76ee\u3002',
        entry_list_empty:'\u307e\u3060\u65e5\u8a18\u306f\u3042\u308a\u307e\u305b\u3093\u3002', entry_list_start:'\u6700\u521d\u306e\u30c1\u30a7\u30c3\u30af\u30a4\u30f3\u3092\u59cb\u3081\u307e\u3057\u3087\u3046 \u2192', no_entries_tagged:'"{tag}"\u30bf\u30b0\u306e\u8a18\u9332\u306f\u307e\u3060\u3042\u308a\u307e\u305b\u3093\u3002', entry_edit:'\u7de8\u96c6', entry_delete:'\u524a\u9664',
        fc_add_7:'\u4e88\u6e2c\u3092\u898b\u308b\u306b\u306f\u5c11\u306a\u304f\u30687\u65e5\u5206\u306e\u30c7\u30fc\u30bf\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002', fc_keep_tracking:'\u30d1\u30bf\u30fc\u30f3\u3092\u767a\u898b\u3059\u308b\u305f\u3081\u306b\u8a18\u9332\u3092\u7d9a\u3051\u307e\u3057\u3087\u3046\u3002',
        toast_saved:'\u8a18\u9332\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f \u2713', toast_journal_deleted:'\u65e5\u8a18\u3092\u524a\u9664\u3057\u307e\u3057\u305f', toast_entry_deleted:'\u8a18\u9332\u3092\u524a\u9664\u3057\u307e\u3057\u305f', toast_shared:'\u5171\u6709\u30b3\u30f3\u30c6\u30f3\u30c4\u3092\u65e5\u8a18\u306b\u8ffd\u52a0\u3057\u307e\u3057\u305f', toast_lang:'\u8a00\u8a9e\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713', toast_date:'\u65e5\u4ed8\u5f62\u5f0f\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713', toast_time:'\u6642\u523b\u5f62\u5f0f\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713',
        ds_not_enough:'\u307e\u3060\u30b5\u30de\u30ea\u30fc\u3092\u751f\u6210\u3059\u308b\u306b\u306f\u30c7\u30fc\u30bf\u304c\u4e0d\u5341\u5206\u3067\u3059\u3002', ds_journal_only:'\u4eca\u65e5\u306f\u65e5\u8a18\u3092\u8a18\u9332\u3057\u307e\u3057\u305f\u3002\u6c17\u5206\u30c7\u30fc\u30bf\u306f\u4fdd\u5b58\u3055\u308c\u3066\u3044\u307e\u305b\u3093\u3002', ds_photos_only:'\u5199\u771f\u3092\u4fdd\u5b58\u3057\u307e\u3057\u305f\u304c\u3001\u6c17\u5206\u30c7\u30fc\u30bf\u306f\u3042\u308a\u307e\u305b\u3093\u3002', ds_mood_only:'\u4eca\u65e5\u306f\u6c17\u5206\u306e\u307f\u8a18\u9332\u3057\u307e\u3057\u305f\u3002',
        dow_need_more:'\u9031\u306e\u30d1\u30bf\u30fc\u30f3\u3092\u898b\u308b\u306b\u306f\u5c11\u306a\u304f\u30682\u9031\u9593\u5206\u306e\u8a18\u9332\u3092\u8ffd\u52a0\u3057\u3066\u304f\u3060\u3055\u3044\u3002', dow_no_data:'\u30c7\u30fc\u30bf\u306a\u3057', dow_average:'\u5e73\u5747', dow_peak_dip:'\u6c17\u5206\u306f{day1}\u306b\u30d4\u30fc\u30af\u3001{day2}\u306b\u6700\u4f4e\u306b\u306a\u308b\u50be\u5411\u3002',
        insight_empty:'\u8a18\u9332\u3092\u5897\u3084\u3059\u306b\u3064\u308c\u3001\u3088\u308a\u591a\u304f\u306e\u30a4\u30f3\u30b5\u30a4\u30c8\u304c\u73fe\u308c\u307e\u3059\u3002', insight_collecting:'\u30c7\u30fc\u30bf\u304c\u5341\u5206\u306b\u96c6\u307e\u308b\u3068\u30a4\u30f3\u30b5\u30a4\u30c8\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002',
        chart_empty_mood_msg:'\u6570\u65e5\u8a18\u9332\u3059\u308b\u3068\u6c17\u5206\u30c8\u30ec\u30f3\u30c9\u304c\u8868\u793a\u3055\u308c\u307e\u3059\u3002', chart_empty_sleep_msg:'\u6bce\u65e5\u8a18\u9332\u3059\u308b\u3068\u7761\u7720\u30d1\u30bf\u30fc\u30f3\u304c\u898b\u3048\u3066\u304d\u307e\u3059\u3002', chart_empty_energy_msg:'\u30a8\u30cd\u30eb\u30ae\u30fc\u30c7\u30fc\u30bf\u3067\u30b0\u30e9\u30d5\u304c\u751f\u304d\u304b\u3048\u308a\u307e\u3059\u3002', chart_empty_velocity_msg:'\u5c11\u306a\u304f\u30682\u65e5\u9023\u7d9a\u3067\u8a18\u9332\u3059\u308b\u3068\u65e5\u5225\u5909\u5316\u304c\u898b\u3048\u307e\u3059\u3002',
        chart_empty_default:'\u30b0\u30e9\u30d5\u3092\u898b\u308b\u306b\u306f\u8a18\u9332\u3092\u8ffd\u52a0\u3002', chart_empty_mood_cta:'\u6700\u521d\u306e\u6c17\u5206\u3092\u8a18\u9332', chart_empty_sleep_cta:'\u7761\u7720\u30c7\u30fc\u30bf\u3092\u8ffd\u52a0', chart_empty_energy_cta:'\u30a8\u30cd\u30eb\u30ae\u30fc\u3092\u8a18\u9332', chart_empty_velocity_cta:'2\u65e5\u4ee5\u4e0a\u8a18\u9332'
    };
DP.zh = {
        x_last_n:'\u8fc7\u53bb{n}\u5929', y_mood:'\u60c5\u7eea (1\u201310)', y_sleep:'\u7761\u7720 (\u5c0f\u65f6)', y_energy:'\u80fd\u91cf (1\u201310)', y_velocity:'\u60c5\u7eea\u53d8\u5316 (\u6bcf\u65e5)',
        ds_mood:'\u60c5\u7eea', ds_sleep:'\u7761\u7720', ds_energy:'\u80fd\u91cf', ds_avg_mood:'\u5e73\u5747\u60c5\u7eea', ds_forecast:'\u9884\u6d4b', ds_lower:'\u4e0b\u9650', ds_upper:'\u4e0a\u9650', ds_trend:'\u8d8b\u52bf',
        chip_avg:'\u5747 {n}', chip_up:'\u2197 +{n} vs \u4e4b\u524d', chip_down:'\u2198 {n} vs \u4e4b\u524d', chip_latest:'\u5f53\u524d: {n} vs \u5747', chip_range:'\u8303\u56f4 {min}\u2013{max}', need_3:'\u9700\u89813+\u6761\u8bb0\u5f55',
        vel_improved:'\u60c5\u7eea\u63d0\u5347\u4e86{n}\u70b9', vel_dipped:'\u60c5\u7eea\u4e0b\u964d\u4e86{n}\u70b9', vel_no_change:'\u65e0\u53d8\u5316',
        vel_eyebrow:'\u60c5\u7eea\u8f68\u8ff9', vel_heading:'\u6bcf\u65e5\u53d8\u5316', vel_subtitle:'\u76f4\u65b9\u56fe\u5728\u96f6\u4ee5\u4e0a\u8868\u793a\u6539\u5584\uff0c\u5728\u96f6\u4ee5\u4e0b\u8868\u793a\u4e0b\u964d\u3002',
        stab_eyebrow:'14\u5929\u7a33\u5b9a\u6027', stab_stable:'\u7a33\u5b9a', stab_moderate:'\u4e2d\u7b49', stab_volatile:'\u6ce2\u52a8', stab_high_vol:'\u9ad8\u5ea6\u6ce2\u52a8',
        stab_msg_stable:'\u8fc7\u53bb14\u5929\u60a8\u7684\u60c5\u7eea\u4e00\u76f4\u5f88\u7a33\u5b9a\u3002', stab_msg_mod:'\u8fc7\u53bb14\u5929\u6709\u4e9b\u6ce2\u52a8\u2014\u5728\u6b63\u5e38\u8303\u56f4\u5185\u3002', stab_msg_vol:'\u8fc7\u53bb14\u5929\u6709\u660e\u663e\u7684\u60c5\u7eea\u8d77\u4f0f\u3002', stab_msg_high:'\u8fc7\u53bb14\u5929\u68c0\u6d4b\u5230\u660e\u663e\u7684\u60c5\u7eea\u4e0d\u7a33\u5b9a\u6027\u3002', stab_min_data:'\u81f3\u5c11\u8fde\u7eed\u8bb0\u5f555\u5929\u624d\u80fd\u67e5\u770b\u7a33\u5b9a\u6027\u8bc4\u5206\u3002', stab_based_on:'\u57fa\u4e8e\u8fc7\u53bb14\u5929\u7684{n}\u6761\u8bb0\u5f55\u3002',
        fc_days:'\u6570\u636e\u5929\u6570', fc_avg:'\u8fd1\u671f\u5747\u503c', fc_7day:'7\u5929\u9884\u6d4b', fc_variability:'\u6ce2\u52a8\u6027',
        fc_trend_up_strong:'\u60a8\u7684\u60c5\u7eea\u4e00\u76f4\u5904\u4e8e\u7a33\u5b9a\u4e0a\u5347\u7684\u8f68\u9053\u3002', fc_trend_up_gentle:'\u8fd1\u671f\u60c5\u7eea\u6709\u8f7b\u5fae\u4e0a\u5347\u8d8b\u52bf\u3002', fc_trend_dn_strong:'\u60a8\u7684\u60c5\u7eea\u6700\u8fd1\u6d17\u6e10\u4e0b\u964d\u3002', fc_trend_dn_gentle:'\u6700\u8fd1\u51e0\u5468\u6709\u8f7b\u5fae\u4e0b\u964d\u8d8b\u52bf\u3002', fc_trend_steady:'\u60a8\u7684\u60c5\u7eea\u4e00\u76f4\u76f8\u5bf9\u7a33\u5b9a\u3002',
        fc_stab_low:'\u65e5\u5e38\u6ce2\u52a8\u6027\u8f83\u4f4e\uff0c\u9884\u6d4b\u5e26\u5f88\u7a84\u3002', fc_stab_mid:'\u6709\u4e9b\u65e5\u5e38\u6ce2\u52a8\u610f\u5473\u7740\u5b9e\u9645\u8303\u56f4\u53ef\u80fd\u4e0d\u540c\u3002', fc_stab_high:'\u60a8\u7684\u60c5\u7eea\u53d8\u5316\u5f88\u5927\u2014\u8bf7\u628a\u8fd9\u4e2a\u9884\u6d4b\u4f5c\u4e3a\u5927\u81f4\u53c2\u8003\u3002',
        fc_sleep_up:' \u6700\u8fd1\u7761\u7720\u9ad8\u4e8e\u5e73\u5747\uff0c\u63d0\u5347\u4e86\u9884\u6d4b\u3002', fc_sleep_dn:' \u6700\u8fd1\u7761\u7720\u4f4e\u4e8e\u5e73\u5747\uff0c\u9884\u6d4b\u7565\u6709\u4e0b\u8c03\u3002',
        fc_pat_up:'\u60c5\u7eea\u5728\u9010\u6e10\u4e0a\u5347\u2014\u826f\u597d\u8ff9\u8c61\u3002', fc_pat_dn:'\u8f7b\u5fae\u4e0b\u964d\u8d8b\u52bf\u3002\u5efa\u8bae\u68c0\u67e5\u7761\u7720\u548c\u6d3b\u52a8\u89c4\u5f8b\u3002', fc_pat_stable:'\u60c5\u7eea\u7a33\u5b9a\u2014\u6301\u7eed\u8bb0\u5f55\u5e2e\u60a8\u770b\u6e05\u8fd9\u4e00\u70b9\u3002',
        fc_low_var:'\u65e5\u5e38\u6ce2\u52a8\u6027\u4f4e\uff0c\u8bf4\u660e\u5e73\u8861\u826f\u597d\u3002', fc_high_var:'\u8f83\u9ad8\u7684\u6ce2\u52a8\u6027\u610f\u5473\u7740\u9884\u6d4b\u5e26\u8f83\u5bbd\u3002',
        fc_sleep_good:'\u6700\u8fd1\u7761\u7720\u4f18\u4e8e\u5e73\u5747\u2014\u5df2\u7eb3\u5165\u8003\u8651\u3002', fc_sleep_bad:'\u6700\u8fd1\u7761\u7720\u7565\u4f4e\u4e8e\u5e73\u5747\u2014\u8fd1\u671f\u9884\u6d4b\u5c0f\u5e45\u4e0b\u8c03\u3002',
        fc_best_day:'{day}\u662f\u60a8\u8868\u73b0\u6700\u597d\u7684\u65e5\u5b50\u2014\u5df2\u5185\u7f6e\u4e8e\u9884\u6d4b\u3002', fc_based_on:'\u6b64\u9884\u6d4b\u57fa\u4e8e\u60a8\u6700\u8fd1{n}\u5929\u7684\u8bb0\u5f55\u3002\u8bb0\u5f55\u8d8a\u591a\u8d8a\u51c6\u786e\u3002',
        kicker_default:'\u6d1e\u5bdf', kicker_activity:'\u6d3b\u52a8\u6d1e\u5bdf', kicker_activity_p:'\u6d3b\u52a8', kicker_sleep:'\u7761\u7720\u6d1e\u5bdf', kicker_stability:'\u7a33\u5b9a\u6027', kicker_tags:'\u6807\u7b7e',
        strength_strong:'\u5f3a\u89c4\u5f8b', strength_moderate:'\u4e2d\u7b49\u89c4\u5f8b', strength_emerging:'\u65b0\u5174\u4fe1\u53f7',
        insight_entry:'\u6761', insight_entries:'\u6761', insight_observed:'\u5728{n}{entries}\u8bb0\u5f55\u4e2d\u89c2\u5bdf\u5230\u3002',
        insight_title_energy_alignment:'\u80fd\u91cf\u4e0e\u60c5\u7eea\u540c\u6b65', insight_desc_energy_alignment:'\u9ad8\u80fd\u91cf\u5929(7+)\u7684\u5e73\u5747\u60c5\u7eea\u4e3a{highMood}\uff0c\u4f4e\u80fd\u91cf\u5929\u4e3a{lowMood}\u3002', insight_context_energy:'\u57fa\u4e8e{highN}\u6761\u9ad8\u80fd\u91cf\u8bb0\u5f55\u548c{lowN}\u6761\u4f4e\u80fd\u91cf\u8bb0\u5f55\u3002',
        insight_title_mood_variable:'\u6700\u8fd1\u60c5\u7eea\u8d77\u4f0f\u8f83\u5927', insight_desc_mood_variable:'\u672c\u5468\u6bcf\u5929\u60c5\u7eea\u5e73\u5747\u6ce2\u52a8{stdDev}\u70b9\u2014\u6bd4\u5e73\u65f6\u5927\u3002', insight_nudge_volatility:'\u7761\u7720\u548c\u6d3b\u52a8\u6a21\u5f0f\u901a\u5e38\u5f71\u54cd\u77ed\u671f\u6ce2\u52a8\u6027\u3002', insight_context_last_days:'\u57fa\u4e8e\u6700\u8fd1{n}\u5929\u7684\u6570\u636e\u3002',
        insight_tag_lift:'"{tag}"\u7684\u65e5\u5b50\u8c8c\u4f3c\u80fd\u63d0\u5347\u5fc3\u60c5', insight_tag_weigh:'"{tag}"\u7684\u65e5\u5b50\u5bf9\u5fc3\u60c5\u6709\u8d1f\u9762\u5f71\u54cd', insight_desc_tag_lift:'\u6253\u4e86"{tag}"\u6807\u7b7e\u7684\u65e5\u5b50\u5fc3\u60c5\u5e73\u5747\u9ad8\u51fa\u57fa\u51c6{diff}\u70b9\u3002', insight_desc_tag_weigh:'"{tag}"\u7684\u65e5\u5b50\u5c06\u5e73\u5747\u5fc3\u60c5\u62c9\u4f4e\u7ea6{diff}\u70b9\u3002', insight_nudge_tag_weigh:'\u6ce8\u610f"{tag}"\u65e5\u5b50\u7684\u5171\u540c\u70b9\u3002', insight_context_tag_seen:'\u5728{n}\u6761\u5e26\u6807\u7b7e\u8bb0\u5f55\u4e2d\u89c2\u5bdf\u5230\u3002',
        sec_sleep_heading:'\u7761\u7720\u6d1e\u5bdf', sec_sleep_title:'\u7761\u7720\u6d1e\u5bdf', sec_sleep_desc:'\u7761\u7720\u4e0e\u60c5\u7eea\u95f4\u7684\u89c4\u5f8b\u3002',
        sec_act_heading:'\u6d3b\u52a8\u6d1e\u5bdf', sec_act_title:'\u6d3b\u52a8\u6d1e\u5bdf', sec_act_desc:'\u4e0e\u60c5\u7eea\u76f8\u5173\u7684\u6d3b\u52a8\u548c\u80fd\u91cf\u6a21\u5f0f\u3002',
        sec_stab_heading:'\u60c5\u7eea\u7a33\u5b9a\u6027', sec_stab_title:'\u60c5\u7eea\u7a33\u5b9a\u6027', sec_stab_desc:'\u5173\u4e8e\u6ce2\u52a8\u6027\u3001\u7a33\u5b9a\u6027\u548c\u6bcf\u65e5\u53d8\u5316\u7684\u4fe1\u53f7\u3002',
        sec_tags_heading:'\u6807\u7b7e\u6d1e\u5bdf', sec_tags_title:'\u6807\u7b7e\u6d1e\u5bdf', sec_tags_desc:'\u4e0e\u60c5\u7eea\u53d8\u5316\u76f8\u5173\u7684\u91cd\u590d\u6807\u7b7e\u3002',
        energy_section:'\u8282\u594f\u4e0e\u8010\u529b', energy_subtitle:'\u6bcf\u65e5\u80fd\u91cf\u6c34\u5e73\u3002',
        journal_ph:'\u4eca\u5929\u6709\u4ec0\u4e48\u7279\u522b\u7684\u4e8b\uff1f\u4ec0\u4e48\u5f71\u54cd\u4e86\u60a8\u7684\u5fc3\u60c5\uff1f\u611f\u6069\u7684\u4e8b\u662f\u4ec0\u4e48\uff1f', save_hint:'\u70b9\u51fb<strong>\u4fdd\u5b58\u8bb0\u5f55</strong>\u6216\u6309\u2318S\u4fdd\u5b58\u3002', act_ph:'\u4f8b\u5982\uff1a\u8fd0\u52a8\u3001\u9605\u8bfb\u3001\u5de5\u4f5c\uff08\u9017\u53f7\u5206\u9694\uff09', tag_ph:'\u6dfb\u52a0\u6807\u7b7e\u2026',
        modal_mood:'\u60c5\u7eea', modal_energy:'\u80fd\u91cf', modal_sleep:'\u7761\u7720', modal_acts:'\u6d3b\u52a8', modal_tags:'\u6807\u7b7e', modal_hrs:'\u5c0f\u65f6', modal_edit:'\u7f16\u8f91\u8bb0\u5f55', modal_journal:'\u65e5\u8bb0', modal_del:'\ud83d\uddd1 \u5220\u9664\u8fd9\u4e00\u5929\u7684\u6240\u6709\u8bb0\u5f55',
        recent:'\u8fd1\u671f\u8bb0\u5f55', tap_open:'\u70b9\u51fb\u6253\u5f00', no_journal:'\u65e0\u65e5\u8bb0\u6587\u672c',
        no_checkin:'\u4eca\u5929\u8fd8\u6ca1\u6253\u5361\u3002', tagging:'\u6700\u8fd1\u60a8\u7ecf\u5e38\u4f7f\u7528\u201c{tag}\u201d\u6807\u7b7e\u3002',
        narrative_start:'\u5f00\u59cb\u8bb0\u5f55\u60a8\u7684\u7b2c\u4e00\u6b21\u6253\u5361\u4ee5\u53d1\u73b0\u89c4\u5f8b\u3002', narrative_trend_up:'\u60a8\u672c\u5468\u7684\u60c5\u7eea\u6709\u6240\u6539\u5584\u3002', narrative_trend_down:'\u60a8\u672c\u5468\u7684\u60c5\u7eea\u6709\u6240\u4e0b\u964d\u3002', narrative_steady:'\u60a8\u672c\u5468\u7684\u60c5\u7eea\u4fdd\u6301\u7a33\u5b9a\u3002',
        narrative_logged:'\u4eca\u5929\u60a8\u8bb0\u5f55\u4e86{moodLabel}\u60c5\u7eea{n}\u5206\u3002', narrative_strong:'\u826f\u597d\u7684', narrative_moderate:'\u666e\u901a\u7684', narrative_low:'\u8f83\u4f4e\u7684',
        streak_days:'\u8fde\u7eed{n}\u5929\u2014\u52a0\u6cb9\uff01', streak_day:'\u8fde\u7eed\u6253\u5361\u7b2c{n}\u5929\u3002',
        entry_list_empty:'\u8fd8\u6ca1\u6709\u65e5\u8bb0\u8bb0\u5f55\u3002', entry_list_start:'\u5f00\u59cb\u7b2c\u4e00\u6b21\u6253\u5361 \u2192', no_entries_tagged:'\u8fd8\u6ca1\u6709\u6807\u7b7e\u201c{tag}\u201d\u7684\u8bb0\u5f55\u3002', entry_edit:'\u7f16\u8f91', entry_delete:'\u5220\u9664',
        fc_add_7:'\u6dfb\u52a07\u5929\u4ee5\u4e0a\u7684\u6570\u636e\u4ee5\u67e5\u770b\u9884\u6d4b\u3002', fc_keep_tracking:'\u7ee7\u7eed\u8bb0\u5f55\u4ee5\u53d1\u73b0\u89c4\u5f8b\u548c\u89e6\u53d1\u56e0\u7d20\u3002',
        toast_saved:'\u8bb0\u5f55\u5df2\u4fdd\u5b58 \u2713', toast_journal_deleted:'\u65e5\u8bb0\u5df2\u5220\u9664', toast_entry_deleted:'\u8bb0\u5f55\u5df2\u5220\u9664', toast_shared:'\u5171\u4eab\u5185\u5bb9\u5df2\u6dfb\u52a0\u5230\u65e5\u8bb0', toast_lang:'\u8bed\u8a00\u5df2\u66f4\u65b0 \u2713', toast_date:'\u65e5\u671f\u683c\u5f0f\u5df2\u66f4\u65b0 \u2713', toast_time:'\u65f6\u95f4\u683c\u5f0f\u5df2\u66f4\u65b0 \u2713',
        ds_not_enough:'\u8fd8\u6ca1\u6709\u8db3\u591f\u7684\u6570\u636e\u751f\u6210\u6458\u8981\u3002', ds_journal_only:'\u4eca\u5929\u60a8\u8bb0\u5f55\u4e86\u65e5\u8bb0\u3002\u65e0\u60c5\u7eea\u6570\u636e\u3002', ds_photos_only:'\u60a8\u4e3a\u8fd9\u4e00\u5929\u4fdd\u5b58\u4e86\u7167\u7247\uff0c\u6ca1\u6709\u60c5\u7eea\u6570\u636e\u3002', ds_mood_only:'\u4eca\u5929\u53ea\u8bb0\u5f55\u4e86\u60c5\u7eea\u3002',
        dow_need_more:'\u8bf7\u6dfb\u52a0\u81f3\u51752\u5468\u8bb0\u5f55\u4ee5\u67e5\u770b\u6bcf\u5468\u89c4\u5f8b\u3002', dow_no_data:'\u65e0\u6570\u636e', dow_average:'\u5e73\u5747', dow_peak_dip:'\u60a8\u7684\u60c5\u7eea\u5728{day1}\u8fbe\u5230\u9ad8\u5cf0\uff0c\u5728{day2}\u8fbe\u5230\u8c37\u5e95\u3002',
        insight_empty:'\u968f\u7740\u8bb0\u5f55\u589e\u52a0\uff0c\u66f4\u591a\u6d1e\u5bdf\u5c06\u663e\u73b0\u3002', insight_collecting:'\u6536\u96c6\u5230\u8db3\u591f\u6570\u636e\u540e\u6d1e\u5bdf\u5c06\u663e\u793a\u3002',
        chart_empty_mood_msg:'\u8bb0\u5f55\u51e0\u5929\u540e\u5c06\u663e\u793a\u60c5\u7eea\u8d8b\u52bf\u3002', chart_empty_sleep_msg:'\u6bcf\u65e5\u8bb0\u5f55\u540e\u7761\u7720\u89c4\u5f8b\u5c06\u5448\u73b0\u3002', chart_empty_energy_msg:'\u80fd\u91cf\u6570\u636e\u8ba9\u56fe\u8868\u751f\u52a8\u8d77\u6765\u3002', chart_empty_velocity_msg:'\u8fde\u7eed\u8bb0\u5f552\u5929\u4ee5\u67e5\u770b\u6bcf\u65e5\u53d8\u5316\u3002',
        chart_empty_default:'\u6dfb\u52a0\u8bb0\u5f55\u4ee5\u67e5\u770b\u56fe\u8868\u3002', chart_empty_mood_cta:'\u8bb0\u5f55\u7b2c\u4e00\u6b21\u60c5\u7eea', chart_empty_sleep_cta:'\u6dfb\u52a0\u7761\u7720\u6570\u636e', chart_empty_energy_cta:'\u8bb0\u5f55\u60a8\u7684\u80fd\u91cf', chart_empty_velocity_cta:'\u8bb0\u5f552+\u5929\u60c5\u7eea'
    };
DP.hi = {
        x_last_n:'\u092a\u093f\u091b\u0932\u0947 {n} \u0926\u093f\u0928', y_mood:'\u092e\u0942\u0921 (1\u201310)', y_sleep:'\u0928\u0940\u0902\u0926 (\u0918\u0902\u091f\u0947)', y_energy:'\u0909\u0930\u094d\u091c\u093e (1\u201310)', y_velocity:'\u092e\u0942\u0921 \u092c\u0926\u0932\u093e\u0935 (\u0926\u0948\u0928\u093f\u0915)',
        ds_mood:'\u092e\u0942\u0921', ds_sleep:'\u0928\u0940\u0902\u0926', ds_energy:'\u0909\u0930\u094d\u091c\u093e', ds_avg_mood:'\u0914\u0938\u0924 \u092e\u0942\u0921', ds_forecast:'\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940', ds_lower:'\u0928\u094d\u092f\u0942\u0928\u0924\u092e', ds_upper:'\u0905\u0927\u093f\u0915\u0924\u092e', ds_trend:'\u0930\u0941\u091d\u093e\u0928',
        chip_avg:'\u0914\u0938\u0924 {n}', chip_up:'\u2197 +{n} vs \u092a\u0939\u0932\u0947', chip_down:'\u2198 {n} vs \u092a\u0939\u0932\u0947', chip_latest:'\u0905\u092d\u0940: {n} vs \u0914\u0938\u0924', chip_range:'\u0930\u0947\u0902\u091c {min}\u2013{max}', need_3:'3+ \u090f\u0902\u091f\u094d\u0930\u0940 \u091a\u093e\u0939\u093f\u090f',
        vel_improved:'\u092e\u0942\u0921 {n} \u0905\u0902\u0915 \u092c\u0922\u093c\u093e', vel_dipped:'\u092e\u0942\u0921 {n} \u0905\u0902\u0915 \u0918\u091f\u093e', vel_no_change:'\u0915\u094b\u0908 \u092c\u0926\u0932\u093e\u0935 \u0928\u0939\u0940\u0902',
        vel_eyebrow:'\u092e\u0942\u0921 \u092a\u0925', vel_heading:'\u0926\u0948\u0928\u093f\u0915 \u092c\u0926\u0932\u093e\u0935', vel_subtitle:'\u0936\u0942\u0928\u094d\u092f \u0938\u0947 \u0909\u092a\u0930 = \u0938\u0941\u0927\u093e\u0930; \u0928\u0940\u091a\u0947 = \u0917\u093f\u0930\u093e\u0935\u091f\u0964',
        stab_eyebrow:'14 \u0926\u093f\u0928 \u0938\u094d\u0925\u093f\u0930\u0924\u093e', stab_stable:'\u0938\u094d\u0925\u093f\u0930', stab_moderate:'\u092e\u0927\u094d\u092f\u092e', stab_volatile:'\u0905\u0938\u094d\u0925\u093f\u0930', stab_high_vol:'\u0905\u0924\u094d\u092f\u0927\u093f\u0915 \u0905\u0938\u094d\u0925\u093f\u0930',
        stab_msg_stable:'\u092a\u093f\u091b\u0932\u0947 14 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u093e\u0964', stab_msg_mod:'\u092a\u093f\u091b\u0932\u0947 14 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0915\u0941\u091b \u0909\u0924\u093e\u0930-\u091a\u0922\u093c\u093e\u0935 \u2014 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0940\u092e\u093e \u092e\u0947\u0902\u0964', stab_msg_vol:'\u092a\u093f\u091b\u0932\u0947 14 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0909\u0932\u094d\u0932\u0947\u0916\u0928\u0940\u092f \u092e\u0942\u0921 \u0909\u0924\u093e\u0930-\u091a\u0922\u093c\u093e\u0935\u0964', stab_msg_high:'\u092a\u093f\u091b\u0932\u0947 14 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u092e\u0939\u0924\u094d\u0935\u092a\u0942\u0930\u094d\u0923 \u092e\u0942\u0921 \u0905\u0938\u094d\u0925\u093f\u0930\u0924\u093e\u0964', stab_min_data:'\u0938\u094d\u0925\u093f\u0930\u0924\u093e \u0938\u094d\u0915\u094b\u0930 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u092e \u0938\u0947 \u0915\u092e 5 \u0926\u093f\u0928 \u0932\u0917\u093e\u0924\u093e\u0930 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0947\u0902\u0964', stab_based_on:'\u092a\u093f\u091b\u0932\u0947 14 \u0926\u093f\u0928\u094b\u0902 \u0915\u0940 {n} \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930\u0964',
        fc_days:'\u0921\u0947\u091f\u093e \u0926\u093f\u0928', fc_avg:'\u0939\u093e\u0932 \u0915\u093e \u0914\u0938\u0924', fc_7day:'7 \u0926\u093f\u0928 \u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940', fc_variability:'\u0935\u0947\u0930\u093f\u090f\u092c\u093f\u0932\u093f\u091f\u0940',
        fc_trend_up_strong:'\u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930 \u0909\u0920\u093e\u0928 \u092a\u0930 \u0939\u0948\u0964', fc_trend_up_gentle:'\u0939\u093e\u0932 \u0915\u0947 \u092e\u0942\u0921 \u092e\u0947\u0902 \u0939\u0932\u094d\u0915\u0940 \u0909\u0928\u094d\u0928\u0924\u093f \u0939\u0948\u0964', fc_trend_dn_strong:'\u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u0928\u0940\u091a\u0947 \u0906 \u0930\u0939\u093e \u0939\u0948\u0964', fc_trend_dn_gentle:'\u0939\u093e\u0932\u093f\u092f\u093e \u0939\u092b\u094d\u0924\u094b\u0902 \u092e\u0947\u0902 \u0939\u0932\u094d\u0915\u0940 \u0917\u093f\u0930\u093e\u0935\u091f\u0964', fc_trend_steady:'\u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u0915\u093e\u092b\u0940 \u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u093e \u0939\u0948\u0964',
        fc_stab_low:'\u0915\u092e \u0926\u0948\u0928\u093f\u0915 \u0935\u0947\u0930\u093f\u090f\u092c\u093f\u0932\u093f\u091f\u0940\u2014\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0938\u0902\u0915\u0930\u0940 \u0939\u0948\u0964', fc_stab_mid:'\u0915\u0941\u091b \u0926\u0948\u0928\u093f\u0915 \u0909\u0924\u093e\u0930-\u091a\u0922\u093c\u093e\u0935 \u0939\u0948\u2014\u0935\u093e\u0938\u094d\u0924\u0935\u093f\u0915 \u0930\u0947\u0902\u091c \u092c\u0926\u0932 \u0938\u0915\u0924\u0940 \u0939\u0948\u0964', fc_stab_high:'\u092e\u0942\u0921 \u0915\u093e\u092b\u0940 \u0905\u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u093e\u2014\u0907\u0938\u0947 \u0905\u0928\u0941\u092e\u093e\u0928\u093f\u0924 \u092e\u093e\u0928\u0947\u0902\u0964',
        fc_sleep_up:' \u0939\u093e\u0932\u093f\u092f\u093e \u0928\u0940\u0902\u0926 \u0914\u0938\u0924 \u0938\u0947 \u0905\u0927\u093f\u0915\u2014\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0913\u0930 \u092c\u0947\u0939\u0924\u0930\u0964', fc_sleep_dn:' \u0939\u093e\u0932\u093f\u092f\u093e \u0928\u0940\u0902\u0926 \u0914\u0938\u0924 \u0938\u0947 \u0915\u092e\u2014\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0939\u0932\u094d\u0915\u0940 \u0928\u0940\u091a\u0947\u0964',
        fc_pat_up:'\u092e\u0942\u0921 \u0927\u0940\u0930\u0947-\u0927\u0940\u0930\u0947 \u0909\u0920 \u0930\u0939\u093e\u2014\u0905\u091a\u094d\u091b\u093e \u0938\u0902\u0915\u0947\u0924\u0964', fc_pat_dn:'\u0939\u0932\u094d\u0915\u0940 \u0917\u093f\u0930\u093e\u0935\u091f\u0964 \u0928\u0940\u0902\u0926 \u0914\u0930 \u0917\u0924\u093f\u0935\u093f\u0927\u093f \u091c\u093e\u0902\u091a\u0947\u0902\u0964', fc_pat_stable:'\u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930\u2014\u0928\u093f\u092f\u092e\u093f\u0924 \u091f\u094d\u0930\u0948\u0915\u093f\u0902\u0917 \u092e\u0926\u0926\u0917\u093e\u0930\u0964',
        fc_low_var:'\u0915\u092e \u0935\u0947\u0930\u093f\u090f\u092c\u093f\u0932\u093f\u091f\u0940 \u0905\u091a\u094d\u091b\u0947 \u0938\u0902\u0924\u0941\u0932\u0928 \u0915\u093e \u0938\u0902\u0915\u0947\u0924\u0964', fc_high_var:'\u0905\u0927\u093f\u0915 \u0935\u0947\u0930\u093f\u090f\u092c\u093f\u0932\u093f\u091f\u0940\u2014\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0906\u0902\u0915\u095c\u093e \u0905\u0927\u093f\u0915 \u091a\u094c\u0921\u093c\u093e\u0964',
        fc_sleep_good:'\u0939\u093e\u0932\u093f\u092f\u093e \u0928\u0940\u0902\u0926 \u0914\u0938\u0924 \u0938\u0947 \u092c\u0947\u0939\u0924\u0930\u2014\u092f\u0939 \u0927\u094d\u092f\u093e\u0928 \u092e\u0947\u0902 \u0932\u093f\u092f\u093e \u0917\u092f\u093e\u0964', fc_sleep_bad:'\u0939\u093e\u0932\u093f\u092f\u093e \u0928\u0940\u0902\u0926 \u0914\u0938\u0924 \u0938\u0947 \u0915\u092e\u2014\u091c\u0932\u094d\u0926 \u0915\u0940 \u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0939\u0932\u094d\u0915\u0940 \u0928\u0940\u091a\u0947\u0964',
        fc_best_day:'{day} \u0906\u092a\u0915\u093e \u0938\u0949\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u0926\u093f\u0928\u2014\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u092e\u0947\u0902 \u0936\u093e\u092e\u093f\u0932\u0964', fc_based_on:'\u092f\u0939 \u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0906\u092a\u0915\u0947 \u0905\u0902\u0924\u093f\u092e {n} \u0926\u093f\u0928\u094b\u0902 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930 \u0939\u0948\u0964',
        kicker_default:'\u0907\u0902\u0938\u093e\u0907\u091f', kicker_activity:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f \u0907\u0902\u0938\u093e\u0907\u091f', kicker_activity_p:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f', kicker_sleep:'\u0928\u0940\u0902\u0926 \u0907\u0902\u0938\u093e\u0907\u091f', kicker_stability:'\u0938\u094d\u0925\u093f\u0930\u0924\u093e', kicker_tags:'\u091f\u0948\u0917',
        strength_strong:'\u092e\u091c\u092c\u0942\u0924 \u092a\u0948\u091f\u0930\u094d\u0928', strength_moderate:'\u092e\u0927\u094d\u092f\u092e \u092a\u0948\u091f\u0930\u094d\u0928', strength_emerging:'\u0928\u092f\u093e \u0938\u0902\u0915\u0947\u0924',
        insight_entry:'\u090f\u0902\u091f\u094d\u0930\u0940', insight_entries:'\u090f\u0902\u091f\u094d\u0930\u0940', insight_observed:'{n} {entries} \u092e\u0947\u0902 \u0926\u0947\u0916\u093e \u0917\u092f\u093e\u0964',
        insight_title_energy_alignment:'\u0909\u0930\u094d\u091c\u093e-\u092e\u0942\u0921 \u0938\u0902\u0930\u0947\u0916\u0928', insight_desc_energy_alignment:'\u0909\u091a\u094d\u091a \u0909\u0930\u094d\u091c\u093e \u0926\u093f\u0928\u094b\u0902 (7+) \u092e\u0947\u0902 \u0914\u0938\u0924 \u092e\u0942\u0921 {highMood} \u0939\u0948, \u0915\u092e \u0909\u0930\u094d\u091c\u093e \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 {lowMood}\u0964', insight_context_energy:'{highN} \u0909\u091a\u094d\u091a-\u0909\u0930\u094d\u091c\u093e \u090f\u0902\u091f\u094d\u0930\u0940 \u0914\u0930 {lowN} \u0928\u093f\u092e\u094d\u0928-\u0909\u0930\u094d\u091c\u093e \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930\u0964',
        insight_title_mood_variable:'\u0939\u093e\u0932 \u092e\u0947\u0902 \u092e\u0942\u0921 \u0905\u0927\u093f\u0915 \u0905\u0938\u094d\u0925\u093f\u0930', insight_desc_mood_variable:'\u0907\u0938 \u0939\u092b\u094d\u0924\u0947 \u092e\u0942\u0921 \u0930\u094b\u091c\u093e\u0928\u093e \u0914\u0938\u0924 {stdDev} \u0905\u0902\u0915 \u092c\u0926\u0932\u093e\u2014\u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0947 \u0905\u0927\u093f\u0915\u0964', insight_nudge_volatility:'\u0928\u0940\u0902\u0926 \u0914\u0930 \u0917\u0924\u093f\u0935\u093f\u0927\u093f \u0905\u0915\u094d\u0938\u0930 \u0905\u0932\u094d\u092a\u0915\u093e\u0932\u093f\u0915 \u0905\u0938\u094d\u0925\u093f\u0930\u0924\u093e \u0915\u0947 \u0915\u093e\u0930\u0923 \u0939\u0948\u0902\u0964', insight_context_last_days:'\u092a\u093f\u091b\u0932\u0947 {n} \u0926\u093f\u0928\u094b\u0902 \u0915\u0947 \u0906\u0927\u093e\u0930 \u092a\u0930\u0964',
        insight_tag_lift:'"{tag}" \u0935\u093e\u0932\u0947 \u0926\u093f\u0928 \u092e\u0942\u0921 \u0909\u0920\u093e\u0924\u0947 \u0939\u0948\u0902', insight_tag_weigh:'"{tag}" \u0935\u093e\u0932\u0947 \u0926\u093f\u0928 \u092e\u0942\u0921 \u0918\u091f\u093e\u0924\u0947 \u0939\u0948\u0902', insight_desc_tag_lift:'"{tag}" \u091f\u0948\u0917 \u0935\u093e\u0932\u0947 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u092e\u0942\u0921 \u0914\u0938\u0924\u0928 {diff} \u0905\u0902\u0915 \u0913\u0930 \u0909\u092a\u0930\u0964', insight_desc_tag_weigh:'"{tag}" \u0935\u093e\u0932\u0947 \u0926\u093f\u0928 \u0914\u0938\u0924 \u0932\u0917\u092d\u0917 {diff} \u0905\u0902\u0915 \u0928\u0940\u091a\u0947 \u0939\u0948\u0902\u0964', insight_nudge_tag_weigh:'"{tag}" \u0935\u093e\u0932\u0947 \u0926\u093f\u0928\u094b\u0902 \u092e\u0947\u0902 \u0915\u094d\u092f\u093e \u0938\u092e\u093e\u0928 \u0939\u0948 \u0926\u0947\u0916\u0947\u0902\u0964', insight_context_tag_seen:'{n} \u091f\u0948\u0917 \u090f\u0902\u091f\u094d\u0930\u0940 \u092e\u0947\u0902 \u0926\u0947\u0916\u093e\u0964',
        sec_sleep_heading:'\u0928\u0940\u0902\u0926 \u0907\u0902\u0938\u093e\u0907\u091f', sec_sleep_title:'\u0928\u0940\u0902\u0926 \u0907\u0902\u0938\u093e\u0907\u091f', sec_sleep_desc:'\u0928\u0940\u0902\u0926 \u0914\u0930 \u092e\u0942\u0921 \u0915\u0947 \u092c\u0940\u091a \u092a\u0948\u091f\u0930\u094d\u0928\u0964',
        sec_act_heading:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f \u0907\u0902\u0938\u093e\u0907\u091f', sec_act_title:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f \u0907\u0902\u0938\u093e\u0907\u091f', sec_act_desc:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f \u0914\u0930 \u0909\u0930\u094d\u091c\u093e \u0915\u0947 \u092a\u0948\u091f\u0930\u094d\u0928 \u092e\u0942\u0921 \u0938\u0947 \u091c\u0941\u095c\u0947 \u0939\u0948\u0902\u0964',
        sec_stab_heading:'\u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930\u0924\u093e', sec_stab_title:'\u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930\u0924\u093e', sec_stab_desc:'\u0905\u0938\u094d\u0925\u093f\u0930\u0924\u093e, \u0938\u094d\u0925\u093f\u0930\u0924\u093e \u0914\u0930 \u0926\u0948\u0928\u093f\u0915 \u092c\u0926\u0932\u093e\u0935 \u0915\u0947 \u0938\u0902\u0915\u0947\u0924\u0964',
        sec_tags_heading:'\u091f\u0948\u0917 \u0907\u0902\u0938\u093e\u0907\u091f', sec_tags_title:'\u091f\u0948\u0917 \u0907\u0902\u0938\u093e\u0907\u091f', sec_tags_desc:'\u0928\u093f\u092f\u092e\u093f\u0924 \u091f\u0948\u0917 \u091c\u094b \u092e\u0942\u0921 \u092c\u0926\u0932\u093e\u0935 \u0938\u0947 \u091c\u0941\u095c\u0947 \u0939\u0948\u0902\u0964',
        energy_section:'\u0932\u092f \u0914\u0930 \u0938\u0939\u0928\u0936\u0940\u0932\u0924\u093e', energy_subtitle:'\u0926\u0948\u0928\u093f\u0915 \u0909\u0930\u094d\u091c\u093e \u0938\u094d\u0924\u0930\u0964',
        journal_ph:'\u0906\u091c \u0915\u094d\u092f\u093e \u0916\u093e\u0938 \u0930\u0939\u093e? \u0906\u092a\u0915\u0947 \u092e\u0942\u0921 \u092a\u0930 \u0915\u094d\u092f\u093e \u0905\u0938\u0930 \u092a\u095c\u093e? \u0915\u093f\u0938 \u092c\u093e\u0924 \u0915\u0947 \u0932\u093f\u090f \u0906\u092d\u093e\u0930\u0940 \u0939\u0948\u0902?', save_hint:'<strong>\u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947\u0935 \u0915\u0930\u0947\u0902</strong> \u0915\u094d\u0932\u093f\u0915 \u092f\u093e \u2318S \u0926\u092c\u093e\u0928\u0947 \u092a\u0930 \u0938\u0947\u0935\u0964', act_ph:'\u0909\u0926\u093e. \u0935\u094d\u092f\u093e\u092f\u093e\u092e, \u092a\u0922\u093c\u093e\u0908, \u0915\u093e\u092e (\u0915\u0949\u092e\u093e \u0938\u0947 \u0905\u0932\u0917)', tag_ph:'\u091f\u0948\u0917 \u091c\u094b\u095c\u0947\u0902\u2026',
        modal_mood:'\u092e\u0942\u0921', modal_energy:'\u0909\u0930\u094d\u091c\u093e', modal_sleep:'\u0928\u0940\u0902\u0926', modal_acts:'\u0917\u0924\u093f\u0935\u093f\u0927\u093f\u092f\u093e\u0902', modal_tags:'\u091f\u0948\u0917', modal_hrs:'\u0918\u0902\u091f\u0947', modal_edit:'\u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0947\u0902', modal_journal:'\u0921\u093e\u092f\u0930\u0940', modal_del:'\ud83d\uddd1 \u0907\u0938 \u0926\u093f\u0928 \u0915\u0940 \u092a\u0942\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0939\u091f\u093e\u090f\u0902',
        recent:'\u0939\u093e\u0932 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940', tap_open:'\u0916\u094b\u0932\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u091f\u0948\u092a \u0915\u0930\u0947\u0902', no_journal:'\u0915\u094b\u0908 \u0921\u093e\u092f\u0930\u0940 \u0928\u0939\u0940\u0902',
        no_checkin:'\u0906\u091c \u0905\u092d\u0940 \u0924\u0915 \u091a\u0947\u0915-\u0907\u0928 \u0928\u0939\u0940\u0902\u0964', tagging:'\u0906\u092a \u0939\u093e\u0932 \u092e\u0947\u0902 \u0905\u0915\u094d\u0938\u0930 "{tag}" \u091f\u0948\u0917 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964',
        narrative_start:'\u092a\u0948\u091f\u0930\u094d\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u092a\u0939\u0932\u093e \u091a\u0947\u0915-\u0907\u0928 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902\u0964', narrative_trend_up:'\u0907\u0938 \u0939\u092b\u094d\u0924\u0947 \u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u092c\u0939\u0924\u0930 \u0939\u0941\u0906\u0964', narrative_trend_down:'\u0907\u0938 \u0939\u092b\u094d\u0924\u0947 \u092e\u0942\u0921 \u0925\u094b\u095c\u093e \u0915\u092e \u0930\u0939\u093e\u0964', narrative_steady:'\u0907\u0938 \u0939\u092b\u094d\u0924\u0947 \u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u093e\u0964',
        narrative_logged:'\u0906\u091c \u0906\u092a\u0928\u0947 {moodLabel} \u092e\u0942\u0921 {n} \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u093f\u092f\u093e\u0964', narrative_strong:'\u0936\u0915\u094d\u0924\u093f\u0936\u093e\u0932\u0940', narrative_moderate:'\u092e\u0927\u094d\u092f\u092e', narrative_low:'\u0915\u092e',
        streak_days:'{n} \u0926\u093f\u0928 \u0915\u0940 \u0938\u094d\u091f\u094d\u0930\u0940\u0915\u2014\u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902!', streak_day:'\u0938\u094d\u091f\u094d\u0930\u0940\u0915 \u0915\u093e \u0926\u093f\u0928 {n}\u0964',
        entry_list_empty:'\u0905\u092d\u0940 \u0915\u094b\u0908 \u0921\u093e\u092f\u0930\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902\u0964', entry_list_start:'\u092a\u0939\u0932\u093e \u091a\u0947\u0915-\u0907\u0928 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902 \u2192', no_entries_tagged:'"{tag}" \u091f\u0948\u0917 \u0935\u093e\u0932\u0940 \u0915\u094b\u0908 \u090f\u0902\u091f\u094d\u0930\u0940 \u0928\u0939\u0940\u0902\u0964', entry_edit:'\u0938\u0902\u092a\u093e\u0926\u093f\u0924 \u0915\u0930\u0947\u0902', entry_delete:'\u0939\u091f\u093e\u090f\u0902',
        fc_add_7:'\u092d\u0935\u093f\u0937\u094d\u092f\u0935\u093e\u0923\u0940 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u092e \u0938\u0947 \u0915\u092e 7 \u0926\u093f\u0928 \u0915\u093e \u0921\u0947\u091f\u093e \u091c\u094b\u095c\u0947\u0902\u0964', fc_keep_tracking:'\u092a\u0948\u091f\u0930\u094d\u0928 \u0916\u094b\u091c\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902\u0964',
        toast_saved:'\u090f\u0902\u091f\u094d\u0930\u0940 \u0938\u0947\u0935 \u2713', toast_journal_deleted:'\u0921\u093e\u092f\u0930\u0940 \u0939\u091f\u093e\u092f\u0940', toast_entry_deleted:'\u090f\u0902\u091f\u094d\u0930\u0940 \u0939\u091f\u093e\u092f\u0940', toast_shared:'\u0936\u0947\u092f\u0930 \u0938\u093e\u092e\u0917\u094d\u0930\u0940 \u0921\u093e\u092f\u0930\u0940 \u092e\u0947\u0902 \u091c\u094b\u095c\u0940', toast_lang:'\u092d\u093e\u0937\u093e \u0905\u092a\u0921\u0947\u091f \u2713', toast_date:'\u0926\u093f\u0928\u093e\u0902\u0915 \u092b\u093c\u0949\u0930\u094d\u092e\u0947\u091f \u0905\u092a\u0921\u0947\u091f \u2713', toast_time:'\u0938\u092e\u092f \u092b\u093c\u0949\u0930\u094d\u092e\u0947\u091f \u0905\u092a\u0921\u0947\u091f \u2713',
        ds_not_enough:'\u0938\u093e\u0930\u093e\u0902\u0936 \u0915\u0947 \u0932\u093f\u090f \u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902\u0964', ds_journal_only:'\u0906\u091c \u0921\u093e\u092f\u0930\u0940 \u0932\u093f\u0916\u0940\u0964 \u092e\u0942\u0921 \u0928\u0939\u0940\u0902 \u0930\u093f\u0915\u0949\u0930\u094d\u0921\u0964', ds_photos_only:'\u092b\u093c\u094b\u091f\u094b \u0938\u0947\u0935 \u0915\u0940\u2014\u092e\u0942\u0921 \u0928\u0939\u0940\u0902\u0964', ds_mood_only:'\u0906\u091c \u0915\u0947\u0935\u0932 \u092e\u0942\u0921 \u0926\u0930\u094d\u091c \u0915\u093f\u092f\u093e\u0964',
        dow_need_more:'\u0938\u093e\u092a\u094d\u0924\u093e\u0939\u093f\u0915 \u092a\u0948\u091f\u0930\u094d\u0928 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f 2+ \u0939\u092b\u094d\u0924\u0947 \u0915\u0940 \u090f\u0902\u091f\u094d\u0930\u0940 \u091c\u094b\u095c\u0947\u0902\u0964', dow_no_data:'\u0915\u094b\u0908 \u0921\u0947\u091f\u093e \u0928\u0939\u0940\u0902', dow_average:'\u0914\u0938\u0924', dow_peak_dip:'\u0906\u092a\u0915\u093e \u092e\u0942\u0921 {day1} \u0915\u094b \u0938\u092c\u0938\u0947 \u0909\u091a\u094d\u091a \u0914\u0930 {day2} \u0915\u094b \u0928\u094d\u092f\u0942\u0928\u0924\u092e \u0939\u094b\u0924\u093e \u0939\u0948\u0964',
        insight_empty:'\u0905\u0927\u093f\u0915 \u090f\u0902\u091f\u094d\u0930\u0940 \u0915\u0947 \u0938\u093e\u0925 \u0914\u0930 \u0907\u0902\u0938\u093e\u0907\u091f \u0906\u090f\u0902\u0917\u0947\u0964', insight_collecting:'\u092a\u0930\u094d\u092f\u093e\u092a\u094d\u0924 \u0921\u0947\u091f\u093e \u0908\u0915\u091f\u094d\u0920\u093e \u0939\u094b\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u0907\u0902\u0938\u093e\u0907\u091f \u092e\u093f\u0932\u0947\u0902\u0917\u0947\u0964',
        chart_empty_mood_msg:'\u0915\u0941\u091b \u0926\u093f\u0928 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0928\u0947 \u0915\u0947 \u092c\u093e\u0926 \u092e\u0942\u0921 \u091f\u094d\u0930\u0947\u0902\u0921 \u0926\u093f\u0916\u0947\u0917\u093e\u0964', chart_empty_sleep_msg:'\u0930\u094b\u091c\u093e\u0928\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0928\u0947 \u0938\u0947 \u0928\u0940\u0902\u0926 \u0915\u0947 \u092a\u0948\u091f\u0930\u094d\u0928 \u0909\u092d\u0930\u0947\u0902\u0917\u0947\u0964', chart_empty_energy_msg:'\u0909\u0930\u094d\u091c\u093e \u0921\u0947\u091f\u093e \u0907\u0938 \u091a\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u091c\u093e\u0928 \u0921\u093e\u0932\u0924\u093e \u0939\u0948\u0964', chart_empty_velocity_msg:'\u0926\u093f\u0928-\u092a\u094d\u0930\u0924\u093f\u0926\u093f\u0928 \u092c\u0926\u0932\u093e\u0935 \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u0915\u092e \u0938\u0947 \u0915\u092e 2 \u0926\u093f\u0928 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0947\u0902\u0964',
        chart_empty_default:'\u091a\u093e\u0930\u094d\u091f \u0926\u0947\u0916\u0928\u0947 \u0915\u0947 \u0932\u093f\u090f \u090f\u0902\u091f\u094d\u0930\u0940 \u091c\u094b\u095c\u0947\u0902\u0964', chart_empty_mood_cta:'\u092a\u0939\u0932\u093e \u092e\u0942\u0921 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0947\u0902', chart_empty_sleep_cta:'\u0928\u0940\u0902\u0926 \u0921\u0947\u091f\u093e \u091c\u094b\u095c\u0947\u0902', chart_empty_energy_cta:'\u0909\u0930\u094d\u091c\u093e \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0947\u0902', chart_empty_velocity_cta:'2+ \u0926\u093f\u0928 \u0930\u093f\u0915\u0949\u0930\u094d\u0921 \u0915\u0930\u0947\u0902'
    };

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

