/* ═══════════════════════════════════════════════════════════════════════
   js/i18n_deep_patch.js  —  Aura Mood
   Patches every JS-generated string that cannot be reached via data-i18n.
   Load LAST — after i18n.js.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─── tiny helpers ──────────────────────────────────────────────── */
    function l() { return String(window.auraLocale || 'en').split('-')[0]; }

    function T(key, vars) {
        var locale = l();
        var row = DP[locale] || DP.en;
        var val;
        if (row && row[key] != null) {
            val = row[key];
        } else if (window.AURA_STRINGS && window.AURA_STRINGS[locale] && window.AURA_STRINGS[locale][key] != null) {
            val = window.AURA_STRINGS[locale][key];
        } else if (DP.en && DP.en[key] != null) {
            val = DP.en[key];
        } else {
            val = key;
        }
        if (!vars) return val;
        return val.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    }
    window.__dpT = T;

    function onReady(fn) {
        /* Run early so patched buildDashboardNarrative etc. are in place before runI18n (700ms) */
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 250); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 400); });
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
                setTimeout(function () {
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
                    if (insightEl && insightEl.textContent && insightEl.textContent.indexOf('tends to peak') >= 0) {
                        var chart2 = canvas && Chart.getChart ? Chart.getChart(canvas) : null;
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
                }, 120);
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

