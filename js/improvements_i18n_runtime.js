/* ═══════════════════════════════════════════════════════════════════════
   improvements_i18n_runtime.js  —  Complete runtime i18n for Aura Mood
   Load this LAST, after all other scripts.

   Covers everything reachable from outside app.js:
   • INSIGHT_SECTION_META (reassigned)
   • getInsightStrength / buildInsightCardHtml (replaced)
   • createInsightCandidate (replaced)
   • renderDayOfWeekChart (replaced)
   • renderInsightsResult (replaced — translates insight texts post-engine)
   • buildDashboardNarrative / buildDashboardGreeting (replaced)
   • buildDailySummary (replaced for non-EN)
   • showToast (replaced)
   • All data-i18n elements (reapplied on navigate + locale change)
   • Month names in charts via Intl
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ─────────────────────────────────────────────────────────────────
       §0.  Utilities
    ───────────────────────────────────────────────────────────────── */
    function onReady(fn, delay) {
        delay = delay || 400;
        if (document.readyState !== 'loading' && window.navigate) {
            setTimeout(fn, delay); return;
        }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, delay + 600); });
    }

    function loc() {
        return String(window.auraLocale || 'en').split('-')[0];
    }

    /* ─────────────────────────────────────────────────────────────────
       §1.  Master translation table
       Rules for translators:
         • Use natural phrasing — never word-for-word literal
         • Template vars: {n}, {tag}, {label}, {delta}, {diff}, {avg},
           {count}, {day1}, {day2}, {v}, {list}, {s} (plural suffix)
         • Provide ALL keys — missing keys fall back to English
    ───────────────────────────────────────────────────────────────── */
    var T = {};

    /* ══════════ ENGLISH ══════════ */
    T.en = {
        /* Dashboard */
        good_morning: 'Good morning',
        good_afternoon: 'Good afternoon',
        good_evening: 'Good evening',
        narrative_start: 'Start logging your first check-in to see patterns emerge here.',
        narrative_trend_up: 'Your mood has been climbing this week.',
        narrative_trend_down: 'Your mood has dipped a little this week.',
        narrative_steady: 'Your mood has been steady this week.',
        narrative_logged_mood: 'Today you logged {moodLabel} mood of {n}.',
        narrative_strong_mood: 'a strong',
        narrative_moderate_mood: 'a moderate',
        narrative_low_mood: 'a low',
        no_checkin_today: 'No check-in yet today.',
        tagging_recently: 'You\u2019ve been tagging \u201c{tag}\u201d a lot lately.',
        streak_days: '{n}-day streak \u2014 keep it up.',
        streak_day: 'Day {n} of your streak.',
        /* Insight sections */
        insight_sec_sleep_heading: 'Sleep Insights',
        insight_sec_sleep_title: 'Sleep Insights',
        insight_sec_sleep_desc: 'Patterns between sleep timing, duration, fragmentation, and mood.',
        insight_sec_activity_heading: 'Activity Insights',
        insight_sec_activity_title: 'Activity Insights',
        insight_sec_activity_desc: 'Activities and daily energy patterns that appear linked to mood.',
        insight_sec_stability_heading: 'Mood Stability Insights',
        insight_sec_stability_title: 'Mood Stability Insights',
        insight_sec_stability_desc: 'Signals around recent volatility, stability, and day-to-day mood change.',
        insight_sec_tags_heading: 'Tag Insights',
        insight_sec_tags_title: 'Tag Insights',
        insight_sec_tags_desc: 'Recurring tags that appear associated with shifts in mood.',
        /* Insight strength */
        strength_strong: 'Strong pattern',
        strength_moderate: 'Moderate pattern',
        strength_emerging: 'Emerging signal',
        /* Insight defaults */
        insight_kicker_default: 'Insight',
        insight_observed_across: 'Observed across {n} {entries}.',
        insight_entry: 'entry',
        insight_entries: 'entries',
        /* Insight empty */
        insight_empty: 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.',
        insight_collecting: 'Insights will appear once enough data has been collected.',
        /* Insight titles & descriptions — sleep */
        insight_sleep_sweet_spot_title: 'Your sweet spot for sleep',
        insight_sleep_sweet_spot_desc: 'On nights you get {label} of sleep, your mood the next day averages {diff} above your usual baseline.',
        insight_sleep_sweet_spot_fallback: 'On nights you get {label} of sleep, your mood tends to be higher than your usual baseline.',
        insight_sleep_quality_title: 'Sleep Quality',
        insight_sleep_quality_good_desc: 'Higher sleep quality scores appear linked to better moods — a {diff}-point average boost.',
        insight_sleep_quality_bad_desc: 'Lower sleep quality tends to correlate with lower mood on those days.',
        insight_sleep_fragmented_title: 'Fragmented vs Consolidated Sleep',
        insight_sleep_fragmented_good_desc: 'Surprisingly, fragmented nights don\u2019t seem to hurt your mood. Your body may adapt well.',
        insight_sleep_fragmented_bad_desc: 'Fragmented sleep appears to weigh on your mood. Consolidating your sleep may help.',
        insight_sleep_fragmented_nudge: 'Protecting sleep continuity may help stabilise your mood.',
        insight_sleep_bedtime_title: 'Bedtime Timing',
        insight_sleep_bedtime_early_desc: 'Earlier bedtimes tend to be associated with higher mood.',
        insight_sleep_bedtime_late_desc: 'Later bedtimes appear linked to slightly higher mood in your recent data.',
        insight_sleep_bedtime_kicker: 'Sleep Insight',
        insight_sleep_bedtime_context: 'Based on bedtime patterns observed across {n} entries.',
        insight_sleep_fragmented_context: 'Compared {fragmented} fragmented and {consolidated} consolidated nights.',
        /* Insight titles & descriptions — activity */
        insight_activity_good_title: '{label} days are better days',
        insight_activity_bad_title: '{label} correlates with lower mood',
        insight_activity_good_desc: 'Your {label} days average a mood of {avg} \u2014 that\u2019s {diff} above your overall average of {overall}.',
        insight_activity_bad_desc: 'Days with {label} in your log often show a slightly lower mood.',
        insight_activity_kicker: 'Activity',
        insight_activity_good_nudge: 'Keep prioritising it.',
        insight_activity_context: 'Logged {label} on {n} {days}.',
        insight_day: 'day',
        insight_days: 'days',
        /* Insight titles & descriptions — tags */
        insight_tag_good_title: '\u201c{label}\u201d days tend to lift you',
        insight_tag_bad_title: '\u201c{label}\u201d days weigh on you',
        insight_tag_good_desc: 'On days tagged \u201c{label}\u201d your mood averages {diff} points above your baseline. It\u2019s a reliable signal.',
        insight_tag_bad_desc: '\u201c{label}\u201d days drag your average down by about {diff} points. Worth paying attention to what those days have in common.',
        insight_tag_kicker: 'Tags',
        insight_tag_bad_nudge: 'Worth noticing what \u201c{label}\u201d days have in common.',
        insight_tag_context: 'Seen across {n} tagged {entries}.',
        /* Insight titles & descriptions — stability */
        insight_stability_volatile_title: 'Some emotional turbulence lately',
        insight_stability_volatile_desc: 'Day-to-day variance of {n} points this week \u2014 higher than usual. Sleep consistency is often the hidden driver of this.',
        insight_stability_volatile_nudge: 'Sleep and activity levels often drive short-term volatility.',
        insight_stability_stable_title: 'You\u2019ve been emotionally consistent',
        insight_stability_stable_desc: 'Day-to-day variance of just {n} points this week \u2014 your most consistent stretch recently. Whatever rhythm you\u2019re in right now, it\u2019s working.',
        insight_stability_stable_nudge: 'Whatever you\u2019re doing, it\u2019s working.',
        insight_stability_kicker: 'Stability',
        insight_stability_context: 'Based on the last {n} days.',
        /* Day of week chart */
        dow_need_more_data: 'Add at least 2 weeks of entries to see your weekly patterns.',
        dow_peak_dip: 'Your mood tends to peak on {day1}s and dip on {day2}s.',
        dow_no_data_label: 'No data',
        dow_average_label: 'average',
        dow_dataset_label: 'Average mood',
        /* Daily summary */
        ds_not_enough: 'Not enough data to generate a summary yet.',
        ds_journal_only: 'You recorded a journal entry today. No mood data was logged.',
        ds_photos_only: 'You saved photos for this day, with no mood data logged.',
        ds_mood_only: 'Mood was recorded today without additional metrics.',
        ds_mood_high: 'Your mood was slightly higher than your recent average.',
        ds_mood_low: 'Your mood came in a little lower than your recent average.',
        ds_mood_steady: 'Your mood was in line with your recent average.',
        ds_mood_first: 'Your first mood entry \u2014 great start.',
        ds_sleep_high: 'Sleep duration was slightly above your typical range.',
        ds_sleep_low: 'Sleep duration was slightly below your typical range.',
        ds_sleep_steady: 'Sleep duration was close to your typical range.',
        ds_sleep_recorded: 'Sleep was recorded for the day.',
        ds_sleep_segmented: ', and it was split into multiple segments.',
        ds_energy_and: ', and {energy} energy.',
        ds_energy_only: 'Energy was recorded today without a matching mood entry.',
        ds_activities_tags: 'Today included activities like \u201c{activities}\u201d and tags such as \u201c{tags}\u201d.',
        ds_activities_only: 'Today included activities: \u201c{activities}\u201d.',
        ds_tags_only: 'Today included tags: \u201c{tags}\u201d.',
        ds_journal_saved: 'A journal note was saved.',
        /* Toasts */
        toast_lang: 'Language updated \u2713',
        toast_date_fmt: 'Date format updated \u2713',
        toast_time_fmt: 'Time format updated \u2713',
        toast_saved: 'Saved \u2713',
        /* Report */
        report_best_day: 'Best day',
        report_challenging: 'Challenging day (lowest mood)',
    };

    /* ══════════ GERMAN ══════════ */
    T.de = {
        good_morning: 'Guten Morgen',
        good_afternoon: 'Guten Tag',
        good_evening: 'Guten Abend',
        narrative_start: 'Starte deinen ersten Eintrag, um hier Muster zu sehen.',
        narrative_trend_up: 'Deine Stimmung ist diese Woche gestiegen.',
        narrative_trend_down: 'Deine Stimmung ist diese Woche etwas gesunken.',
        narrative_steady: 'Deine Stimmung war diese Woche stabil.',
        narrative_logged_mood: 'Heute hast du eine {moodLabel} Stimmung von {n} eingetragen.',
        narrative_strong_mood: 'hohe',
        narrative_moderate_mood: 'mittlere',
        narrative_low_mood: 'niedrige',
        no_checkin_today: 'Heute noch kein Check-in.',
        tagging_recently: 'Du verwendest in letzter Zeit oft den Tag \u201e{tag}\u201c.',
        streak_days: '{n} Tage in Folge \u2014 weiter so!',
        streak_day: 'Tag {n} deiner Serie.',
        insight_sec_sleep_heading: 'Schlaf',
        insight_sec_sleep_title: 'Schlaf-Einblicke',
        insight_sec_sleep_desc: 'Zusammenh\u00e4nge zwischen Schlafzeiten, Dauer, Unterbrechungen und Stimmung.',
        insight_sec_activity_heading: 'Aktivit\u00e4ten',
        insight_sec_activity_title: 'Aktivit\u00e4ts-Einblicke',
        insight_sec_activity_desc: 'Aktivit\u00e4ten und Energiemuster, die mit deiner Stimmung zusammenh\u00e4ngen.',
        insight_sec_stability_heading: 'Stabilit\u00e4t',
        insight_sec_stability_title: 'Stimmungsstabilit\u00e4t',
        insight_sec_stability_desc: 'Signale rund um Schwankungen und t\u00e4gliche Ver\u00e4nderungen deiner Stimmung.',
        insight_sec_tags_heading: 'Tags',
        insight_sec_tags_title: 'Tag-Einblicke',
        insight_sec_tags_desc: 'Wiederkehrende Tags, die mit Stimmungsver\u00e4nderungen zusammenzuh\u00e4ngen scheinen.',
        strength_strong: 'Starkes Muster',
        strength_moderate: 'Moderates Muster',
        strength_emerging: 'Schwaches Signal',
        insight_kicker_default: 'Einblick',
        insight_observed_across: 'Beobachtet \u00fcber {n} {entries}.',
        insight_entry: 'Eintrag',
        insight_entries: 'Eintr\u00e4ge',
        insight_empty: 'Weitere Einblicke erscheinen, wenn du mehr Eintr\u00e4ge gemacht hast. Erfasse Stimmung, Schlaf und Aktivit\u00e4ten.',
        insight_collecting: 'Einblicke erscheinen, sobald gen\u00fcgend Daten vorhanden sind.',
        insight_sleep_sweet_spot_title: 'Dein optimaler Schlaf',
        insight_sleep_sweet_spot_desc: 'An N\u00e4chten mit {label} Schlaf ist deine Stimmung am n\u00e4chsten Tag durchschnittlich {diff} \u00fcber deiner \u00fcblichen Basis.',
        insight_sleep_sweet_spot_fallback: 'An N\u00e4chten mit {label} Schlaf tendiert deine Stimmung h\u00f6her als \u00fcblich.',
        insight_sleep_quality_title: 'Schlafqualit\u00e4t',
        insight_sleep_quality_good_desc: 'H\u00f6here Schlafqualit\u00e4t h\u00e4ngt mit besserer Stimmung zusammen \u2014 durchschnittlich {diff} Punkte mehr.',
        insight_sleep_quality_bad_desc: 'Schlechtere Schlafqualit\u00e4t geht an diesen Tagen oft mit niedrigerer Stimmung einher.',
        insight_sleep_fragmented_title: 'Fragmentierter vs. durchgehender Schlaf',
        insight_sleep_fragmented_good_desc: '\u00dcberraschenderweise scheint fragmentierter Schlaf deine Stimmung nicht zu beeintr\u00e4chtigen.',
        insight_sleep_fragmented_bad_desc: 'Unterbrochener Schlaf scheint deine Stimmung zu belasten. Durchgehender Schlaf k\u00f6nnte helfen.',
        insight_sleep_fragmented_nudge: 'Durchgehender Schlaf k\u00f6nnte deine Stimmung stabilisieren.',
        insight_sleep_bedtime_title: 'Schlafenszeit',
        insight_sleep_bedtime_early_desc: 'Fr\u00fcheres Schlafengehen scheint mit besserer Stimmung verbunden zu sein.',
        insight_sleep_bedtime_late_desc: 'Sp\u00e4teres Schlafengehen zeigt in deinen Daten einen leichten Stimmungsvorteil.',
        insight_sleep_bedtime_kicker: 'Schlaf',
        insight_sleep_bedtime_context: 'Basierend auf Schlafzeitmustern aus {n} Eintr\u00e4gen.',
        insight_sleep_fragmented_context: 'Verglichen: {fragmented} unterbrochene und {consolidated} durchgehende N\u00e4chte.',
        insight_activity_good_title: '{label}-Tage sind bessere Tage',
        insight_activity_bad_title: '{label} h\u00e4ngt mit niedrigerer Stimmung zusammen',
        insight_activity_good_desc: 'An deinen {label}-Tagen betr\u00e4gt deine Stimmung durchschnittlich {avg} \u2014 das sind {diff} \u00fcber deinem Gesamtdurchschnitt von {overall}.',
        insight_activity_bad_desc: 'Tage mit {label} in deinem Protokoll zeigen oft eine etwas niedrigere Stimmung.',
        insight_activity_kicker: 'Aktivit\u00e4t',
        insight_activity_good_nudge: 'Behalte es bei.',
        insight_activity_context: '{label} wurde an {n} {days} eingetragen.',
        insight_day: 'Tag',
        insight_days: 'Tagen',
        insight_tag_good_title: '\u201e{label}\u201c-Tage heben deine Stimmung',
        insight_tag_bad_title: '\u201e{label}\u201c-Tage dr\u00fccken auf die Stimmung',
        insight_tag_good_desc: 'An Tagen mit dem Tag \u201e{label}\u201c liegt deine Stimmung durchschnittlich {diff} Punkte \u00fcber deiner Basis.',
        insight_tag_bad_desc: '\u201e{label}\u201c-Tage senken deinen Durchschnitt um etwa {diff} Punkte. Es lohnt sich, diese Tage genauer zu betrachten.',
        insight_tag_kicker: 'Tags',
        insight_tag_bad_nudge: 'Es lohnt sich, herauszufinden, was diese Tage gemeinsam haben.',
        insight_tag_context: '\u00dcber {n} getaggte {entries} beobachtet.',
        insight_stability_volatile_title: 'Etwas emotionale Turbulenzen zuletzt',
        insight_stability_volatile_desc: 'T\u00e4gliche Schwankung von {n} Punkten diese Woche \u2014 h\u00f6her als \u00fcblich. Oft steckt Schlafunregelm\u00e4\u00dfigkeit dahinter.',
        insight_stability_volatile_nudge: 'Schlaf und Aktivit\u00e4tsniveau beeinflussen kurzfristige Schwankungen.',
        insight_stability_stable_title: 'Du warst diese Woche emotional stabil',
        insight_stability_stable_desc: 'T\u00e4gliche Schwankung von nur {n} Punkten \u2014 deine konstanteste Phase zuletzt. Was auch immer du gerade machst, es funktioniert.',
        insight_stability_stable_nudge: 'Was auch immer du gerade machst \u2014 es funktioniert.',
        insight_stability_kicker: 'Stabilit\u00e4t',
        insight_stability_context: 'Basierend auf den letzten {n} Tagen.',
        dow_need_more_data: 'F\u00fcge mindestens 2 Wochen Eintr\u00e4ge hinzu, um deine w\u00f6chentlichen Muster zu sehen.',
        dow_peak_dip: 'Deine Stimmung erreicht meist am {day1} ihren H\u00f6hepunkt und sinkt am {day2}.',
        dow_no_data_label: 'Keine Daten',
        dow_average_label: 'Durchschnitt',
        dow_dataset_label: 'Durchschnittliche Stimmung',
        ds_not_enough: 'Noch nicht gen\u00fcgend Daten f\u00fcr eine Zusammenfassung.',
        ds_journal_only: 'Du hast heute einen Tagebucheintrag verfasst. Keine Stimmungsdaten.',
        ds_photos_only: 'Du hast heute Fotos gespeichert, aber keine Stimmungsdaten eingetragen.',
        ds_mood_only: 'Heute wurde nur die Stimmung ohne weitere Metriken erfasst.',
        ds_mood_high: 'Deine Stimmung lag etwas \u00fcber deinem letzten Durchschnitt.',
        ds_mood_low: 'Deine Stimmung lag etwas unter deinem letzten Durchschnitt.',
        ds_mood_steady: 'Deine Stimmung lag im \u00fcblichen Bereich.',
        ds_mood_first: 'Erster Stimmungseintrag \u2014 guter Start.',
        ds_sleep_high: 'Schlafdauer lag etwas \u00fcber deinem \u00fcblichen Bereich.',
        ds_sleep_low: 'Schlafdauer lag etwas unter deinem \u00fcblichen Bereich.',
        ds_sleep_steady: 'Schlafdauer lag im \u00fcblichen Bereich.',
        ds_sleep_recorded: 'Schlaf wurde heute erfasst.',
        ds_sleep_segmented: ', aufgeteilt in mehrere Phasen.',
        ds_energy_and: ', mit einer Energie von {energy}.',
        ds_energy_only: 'Energie wurde heute ohne Stimmungseintrag erfasst.',
        ds_activities_tags: 'Heute: Aktivit\u00e4ten wie \u201e{activities}\u201c und Tags wie \u201e{tags}\u201c.',
        ds_activities_only: 'Heutige Aktivit\u00e4ten: \u201e{activities}\u201c.',
        ds_tags_only: 'Heutige Tags: \u201e{tags}\u201c.',
        ds_journal_saved: 'Ein Tagebucheintrag wurde gespeichert.',
        toast_lang: 'Sprache aktualisiert \u2713',
        toast_date_fmt: 'Datumsformat aktualisiert \u2713',
        toast_time_fmt: 'Zeitformat aktualisiert \u2713',
        toast_saved: 'Gespeichert \u2713',
        report_best_day: 'Bester Tag',
        report_challenging: 'Schwieriger Tag (niedrigste Stimmung)',
    };

    /* ══════════ FRENCH ══════════ */
    T.fr = {
        good_morning: 'Bonjour',
        good_afternoon: 'Bon apr\u00e8s-midi',
        good_evening: 'Bonsoir',
        narrative_start: 'Lance ton premier bilan pour voir des tendances appara\u00eetre ici.',
        narrative_trend_up: 'Ton humeur a progress\u00e9 cette semaine.',
        narrative_trend_down: 'Ton humeur a l\u00e9g\u00e8rement baiss\u00e9 cette semaine.',
        narrative_steady: 'Ton humeur est rest\u00e9e stable cette semaine.',
        narrative_logged_mood: 'Aujourd\u2019hui, tu as enregistr\u00e9 une humeur {moodLabel} de {n}.',
        narrative_strong_mood: 'haute',
        narrative_moderate_mood: 'mod\u00e9r\u00e9e',
        narrative_low_mood: 'basse',
        no_checkin_today: 'Aucun bilan aujourd\u2019hui encore.',
        tagging_recently: 'Tu utilises souvent l\u2019\u00e9tiquette \u00ab\u00a0{tag}\u00a0\u00bb ces derniers temps.',
        streak_days: '{n}\u00a0jours d\u2019affil\u00e9e \u2014 continue\u00a0!',
        streak_day: 'Jour\u00a0{n} de ta s\u00e9rie.',
        insight_sec_sleep_heading: 'Sommeil',
        insight_sec_sleep_title: 'Insights sommeil',
        insight_sec_sleep_desc: 'Liens entre la dur\u00e9e, la fragmentation du sommeil et l\u2019humeur.',
        insight_sec_activity_heading: 'Activit\u00e9s',
        insight_sec_activity_title: 'Insights activit\u00e9s',
        insight_sec_activity_desc: 'Activit\u00e9s et niveaux d\u2019\u00e9nergie qui semblent li\u00e9s \u00e0 ton humeur.',
        insight_sec_stability_heading: 'Stabilit\u00e9',
        insight_sec_stability_title: 'Stabilit\u00e9 \u00e9motionnelle',
        insight_sec_stability_desc: 'Signaux autour de la volatilit\u00e9 et des changements d\u2019humeur quotidiens.',
        insight_sec_tags_heading: '\u00c9tiquettes',
        insight_sec_tags_title: 'Insights \u00e9tiquettes',
        insight_sec_tags_desc: '\u00c9tiquettes r\u00e9currentes associ\u00e9es \u00e0 des variations d\u2019humeur.',
        strength_strong: 'Signal fort',
        strength_moderate: 'Signal mod\u00e9r\u00e9',
        strength_emerging: 'Signal faible',
        insight_kicker_default: 'Insight',
        insight_observed_across: 'Observ\u00e9 sur {n} {entries}.',
        insight_entry: 'entr\u00e9e',
        insight_entries: 'entr\u00e9es',
        insight_empty: 'D\u2019autres insights appara\u00eetront avec plus d\u2019entr\u00e9es. Suis ton humeur, sommeil et activit\u00e9s.',
        insight_collecting: 'Les insights appara\u00eetront une fois assez de donn\u00e9es collect\u00e9es.',
        insight_sleep_sweet_spot_title: 'Ton id\u00e9al de sommeil',
        insight_sleep_sweet_spot_desc: 'Les nuits o\u00f9 tu dors {label}, ton humeur le lendemain est en moyenne {diff} au-dessus de ta base habituelle.',
        insight_sleep_sweet_spot_fallback: 'Les nuits o\u00f9 tu dors {label}, ton humeur tend \u00e0 \u00eatre meilleure qu\u2019\u00e0 l\u2019ordinaire.',
        insight_sleep_quality_title: 'Qualit\u00e9 du sommeil',
        insight_sleep_quality_good_desc: 'Une meilleure qualit\u00e9 de sommeil semble li\u00e9e \u00e0 une meilleure humeur \u2014 en moyenne {diff} points de plus.',
        insight_sleep_quality_bad_desc: 'Une qualit\u00e9 de sommeil plus faible tend \u00e0 correspondre \u00e0 une humeur plus basse ces jours-l\u00e0.',
        insight_sleep_fragmented_title: 'Sommeil fragment\u00e9 vs continu',
        insight_sleep_fragmented_good_desc: 'Fait inattendu : le sommeil fragment\u00e9 ne semble pas affecter ton humeur.',
        insight_sleep_fragmented_bad_desc: 'Le sommeil fragment\u00e9 semble peser sur ton humeur. Privil\u00e9gier un sommeil continu pourrait aider.',
        insight_sleep_fragmented_nudge: 'Prot\u00e9ger la continuit\u00e9 du sommeil pourrait stabiliser ton humeur.',
        insight_sleep_bedtime_title: 'Heure du coucher',
        insight_sleep_bedtime_early_desc: 'Se coucher plus t\u00f4t semble associ\u00e9 \u00e0 une meilleure humeur.',
        insight_sleep_bedtime_late_desc: 'Se coucher plus tard semble li\u00e9 \u00e0 une humeur l\u00e9g\u00e8rement meilleure dans tes donn\u00e9es r\u00e9centes.',
        insight_sleep_bedtime_kicker: 'Sommeil',
        insight_sleep_bedtime_context: 'Bas\u00e9 sur {n} entr\u00e9es avec des donn\u00e9es de coucher.',
        insight_sleep_fragmented_context: 'Comparaison\u00a0: {fragmented} nuits fragment\u00e9es et {consolidated} continues.',
        insight_activity_good_title: 'Les journ\u00e9es {label} sont tes meilleures',
        insight_activity_bad_title: '{label} correspond \u00e0 une humeur plus basse',
        insight_activity_good_desc: 'Tes journ\u00e9es {label} affichent une humeur moyenne de {avg} \u2014 soit {diff} au-dessus de ta moyenne de {overall}.',
        insight_activity_bad_desc: 'Les journ\u00e9es avec {label} dans ton journal montrent souvent une humeur l\u00e9g\u00e8rement plus basse.',
        insight_activity_kicker: 'Activit\u00e9',
        insight_activity_good_nudge: 'Continue \u00e0 en faire une priorit\u00e9.',
        insight_activity_context: '{label} enregistr\u00e9 {n} {days}.',
        insight_day: 'jour',
        insight_days: 'jours',
        insight_tag_good_title: 'Les jours \u00ab\u00a0{label}\u00a0\u00bb boostent ton humeur',
        insight_tag_bad_title: 'Les jours \u00ab\u00a0{label}\u00a0\u00bb p\u00e8sent sur ton humeur',
        insight_tag_good_desc: 'Les jours tagg\u00e9s \u00ab\u00a0{label}\u00a0\u00bb, ton humeur est en moyenne {diff} points au-dessus de ta base.',
        insight_tag_bad_desc: 'Les jours \u00ab\u00a0{label}\u00a0\u00bb tirent ta moyenne vers le bas d\u2019environ {diff} points.',
        insight_tag_kicker: '\u00c9tiquettes',
        insight_tag_bad_nudge: 'Observe ce que ces journ\u00e9es ont en commun.',
        insight_tag_context: 'Observ\u00e9 sur {n} {entries} tagg\u00e9es.',
        insight_stability_volatile_title: 'Quelques turbulences \u00e9motionnelles r\u00e9cemment',
        insight_stability_volatile_desc: 'Variation quotidienne de {n} points cette semaine \u2014 plus \u00e9lev\u00e9e que d\u2019habitude. Le sommeil irr\u00e9gulier en est souvent la cause.',
        insight_stability_volatile_nudge: 'Le sommeil et l\u2019activit\u00e9 influencent fortement les variations d\u2019humeur.',
        insight_stability_stable_title: 'Tu es \u00e9motionnellement stable',
        insight_stability_stable_desc: 'Variation de seulement {n} points cette semaine \u2014 ta p\u00e9riode la plus stable r\u00e9cemment. Ce que tu fais, \u00e7a marche.',
        insight_stability_stable_nudge: 'Ce que tu fais en ce moment, \u00e7a fonctionne.',
        insight_stability_kicker: 'Stabilit\u00e9',
        insight_stability_context: 'Bas\u00e9 sur les {n} derniers jours.',
        dow_need_more_data: 'Ajoute au moins 2 semaines d\u2019entr\u00e9es pour voir tes tendances hebdomadaires.',
        dow_peak_dip: 'Ton humeur culmine g\u00e9n\u00e9ralement le {day1} et baisse le {day2}.',
        dow_no_data_label: 'Pas de donn\u00e9es',
        dow_average_label: 'moyenne',
        dow_dataset_label: 'Humeur moyenne',
        ds_not_enough: 'Pas assez de donn\u00e9es pour g\u00e9n\u00e9rer un r\u00e9sum\u00e9.',
        ds_journal_only: 'Tu as \u00e9crit dans ton journal aujourd\u2019hui. Aucune donn\u00e9e d\u2019humeur.',
        ds_photos_only: 'Tu as sauvegard\u00e9 des photos sans donn\u00e9es d\u2019humeur.',
        ds_mood_only: 'Seule l\u2019humeur a \u00e9t\u00e9 enregistr\u00e9e aujourd\u2019hui.',
        ds_mood_high: 'Ton humeur \u00e9tait l\u00e9g\u00e8rement au-dessus de ta moyenne r\u00e9cente.',
        ds_mood_low: 'Ton humeur \u00e9tait l\u00e9g\u00e8rement en dessous de ta moyenne r\u00e9cente.',
        ds_mood_steady: 'Ton humeur \u00e9tait dans ta plage habituelle.',
        ds_mood_first: 'Premi\u00e8re entr\u00e9e d\u2019humeur \u2014 bon d\u00e9but\u00a0!',
        ds_sleep_high: 'Dur\u00e9e de sommeil l\u00e9g\u00e8rement au-dessus de ta plage habituelle.',
        ds_sleep_low: 'Dur\u00e9e de sommeil l\u00e9g\u00e8rement en dessous de ta plage habituelle.',
        ds_sleep_steady: 'Dur\u00e9e de sommeil dans ta plage habituelle.',
        ds_sleep_recorded: 'Sommeil enregistr\u00e9 pour aujourd\u2019hui.',
        ds_sleep_segmented: ', r\u00e9parti en plusieurs p\u00e9riodes.',
        ds_energy_and: ', avec une \u00e9nergie de {energy}.',
        ds_energy_only: '\u00c9nergie enregistr\u00e9e sans donn\u00e9e d\u2019humeur.',
        ds_activities_tags: 'Activit\u00e9s\u00a0: \u00ab\u00a0{activities}\u00a0\u00bb et \u00e9tiquettes\u00a0: \u00ab\u00a0{tags}\u00a0\u00bb.',
        ds_activities_only: 'Activit\u00e9s\u00a0: \u00ab\u00a0{activities}\u00a0\u00bb.',
        ds_tags_only: '\u00c9tiquettes\u00a0: \u00ab\u00a0{tags}\u00a0\u00bb.',
        ds_journal_saved: 'Une note de journal a \u00e9t\u00e9 enregistr\u00e9e.',
        toast_lang: 'Langue mise \u00e0 jour \u2713',
        toast_date_fmt: 'Format de date mis \u00e0 jour \u2713',
        toast_time_fmt: 'Format d\u2019heure mis \u00e0 jour \u2713',
        toast_saved: 'Enregistr\u00e9 \u2713',
        report_best_day: 'Meilleure journ\u00e9e',
        report_challenging: 'Journ\u00e9e difficile (humeur la plus basse)',
    };

    /* ══════════ SPANISH ══════════ */
    T.es = {
        good_morning: 'Buenos d\u00edas', good_afternoon: 'Buenas tardes', good_evening: 'Buenas noches',
        narrative_start: 'Empieza tu primer registro para ver patrones aqu\u00ed.', narrative_trend_up: 'Tu \u00e1nimo ha subido esta semana.', narrative_trend_down: 'Tu \u00e1nimo ha bajado un poco esta semana.', narrative_steady: 'Tu \u00e1nimo ha sido estable esta semana.', narrative_logged_mood: 'Hoy registraste un \u00e1nimo {moodLabel} de {n}.', narrative_strong_mood: 'alto', narrative_moderate_mood: 'moderado', narrative_low_mood: 'bajo', no_checkin_today: 'Sin registro hoy todav\u00eda.', tagging_recently: 'Has usado mucho la etiqueta \u00ab{tag}\u00bb \u00faltimamente.', streak_days: '{n} d\u00edas seguidos \u2014 \u00a1sigue as\u00ed!', streak_day: 'D\u00eda {n} de tu racha.',
        insight_sec_sleep_heading: 'Sue\u00f1o', insight_sec_sleep_title: 'Insights de sue\u00f1o', insight_sec_sleep_desc: 'Relaciones entre el sue\u00f1o y el estado de \u00e1nimo.', insight_sec_activity_heading: 'Actividad', insight_sec_activity_title: 'Insights de actividad', insight_sec_activity_desc: 'Actividades y niveles de energ\u00eda vinculados al \u00e1nimo.', insight_sec_stability_heading: 'Estabilidad', insight_sec_stability_title: 'Estabilidad an\u00edmica', insight_sec_stability_desc: 'Se\u00f1ales sobre volatilidad y cambios diarios de \u00e1nimo.', insight_sec_tags_heading: 'Etiquetas', insight_sec_tags_title: 'Insights de etiquetas', insight_sec_tags_desc: 'Etiquetas recurrentes asociadas a cambios de \u00e1nimo.',
        strength_strong: 'Patr\u00f3n fuerte', strength_moderate: 'Patr\u00f3n moderado', strength_emerging: 'Se\u00f1al d\u00e9bil',
        insight_kicker_default: 'Insight', insight_observed_across: 'Observado en {n} {entries}.', insight_entry: 'registro', insight_entries: 'registros', insight_empty: 'M\u00e1s insights aparecer\u00e1n con m\u00e1s registros. Sigue tu \u00e1nimo, sue\u00f1o y actividades.', insight_collecting: 'Los insights aparecer\u00e1n cuando haya suficientes datos.',
        insight_sleep_sweet_spot_title: 'Tu punto \u00f3ptimo de sue\u00f1o', insight_sleep_sweet_spot_desc: 'Las noches con {label} de sue\u00f1o, tu \u00e1nimo al d\u00eda siguiente promedia {diff} sobre tu base habitual.', insight_sleep_sweet_spot_fallback: 'Con {label} de sue\u00f1o, tu \u00e1nimo tiende a ser mejor de lo habitual.',
        insight_sleep_quality_title: 'Calidad del sue\u00f1o', insight_sleep_quality_good_desc: 'Mayor calidad de sue\u00f1o parece vinculada a mejor \u00e1nimo \u2014 un promedio de {diff} puntos m\u00e1s.', insight_sleep_quality_bad_desc: 'Menor calidad de sue\u00f1o tiende a coincidir con un \u00e1nimo m\u00e1s bajo.',
        insight_sleep_fragmented_title: 'Sue\u00f1o fragmentado vs continuo', insight_sleep_fragmented_good_desc: 'Sorprendentemente, el sue\u00f1o fragmentado no parece afectar tu \u00e1nimo.', insight_sleep_fragmented_bad_desc: 'El sue\u00f1o fragmentado parece pesar sobre tu \u00e1nimo.', insight_sleep_fragmented_nudge: 'Proteger la continuidad del sue\u00f1o podr\u00eda estabilizar tu \u00e1nimo.',
        insight_sleep_bedtime_title: 'Hora de dormir', insight_sleep_bedtime_early_desc: 'Acostarse m\u00e1s temprano parece asociado a mejor \u00e1nimo.', insight_sleep_bedtime_late_desc: 'Acostarse m\u00e1s tarde parece vinculado a un \u00e1nimo ligeramente mejor.', insight_sleep_bedtime_kicker: 'Sue\u00f1o', insight_sleep_bedtime_context: 'Basado en patrones de {n} registros.', insight_sleep_fragmented_context: '{fragmented} noches fragmentadas y {consolidated} continuas comparadas.',
        insight_activity_good_title: 'Los d\u00edas de {label} son mejores', insight_activity_bad_title: '{label} se asocia con menor \u00e1nimo', insight_activity_good_desc: 'Tus d\u00edas de {label} promedian un \u00e1nimo de {avg} \u2014 {diff} sobre tu promedio de {overall}.', insight_activity_bad_desc: 'Los d\u00edas con {label} en tu registro suelen mostrar un \u00e1nimo algo menor.', insight_activity_kicker: 'Actividad', insight_activity_good_nudge: 'Sigue priorizando esto.', insight_activity_context: '{label} registrado en {n} {days}.', insight_day: 'd\u00eda', insight_days: 'd\u00edas',
        insight_tag_good_title: 'Los d\u00edas \u00ab{label}\u00bb levantan tu \u00e1nimo', insight_tag_bad_title: 'Los d\u00edas \u00ab{label}\u00bb pesan sobre tu \u00e1nimo', insight_tag_good_desc: 'En d\u00edas con \u00ab{label}\u00bb tu \u00e1nimo promedia {diff} puntos sobre tu base.', insight_tag_bad_desc: 'Los d\u00edas con \u00ab{label}\u00bb arrastran tu promedio hacia abajo unos {diff} puntos.', insight_tag_kicker: 'Etiquetas', insight_tag_bad_nudge: 'Vale la pena ver qu\u00e9 tienen en com\u00fan esos d\u00edas.', insight_tag_context: 'Visto en {n} {entries} etiquetadas.',
        insight_stability_volatile_title: 'Algo de turbulencia emocional \u00faltimamente', insight_stability_volatile_desc: 'Variaci\u00f3n diaria de {n} puntos esta semana \u2014 m\u00e1s alta de lo habitual.', insight_stability_volatile_nudge: 'El sue\u00f1o y la actividad suelen impulsar la volatilidad a corto plazo.', insight_stability_stable_title: 'Has sido emocionalmente consistente', insight_stability_stable_desc: 'Variaci\u00f3n de solo {n} puntos esta semana \u2014 tu tramo m\u00e1s consistente. Lo que est\u00e1s haciendo funciona.', insight_stability_stable_nudge: 'Sea lo que sea que est\u00e1s haciendo, funciona.', insight_stability_kicker: 'Estabilidad', insight_stability_context: 'Basado en los \u00faltimos {n} d\u00edas.',
        dow_need_more_data: 'A\u00f1ade al menos 2 semanas de registros para ver tus patrones semanales.', dow_peak_dip: 'Tu \u00e1nimo tiende a alcanzar su punto \u00e1lgido el {day1} y caer el {day2}.', dow_no_data_label: 'Sin datos', dow_average_label: 'promedio', dow_dataset_label: '\u00c1nimo promedio',
        ds_not_enough: 'No hay suficientes datos para generar un resumen.', ds_journal_only: 'Hoy escribiste en tu diario. Sin datos de \u00e1nimo.', ds_photos_only: 'Guardaste fotos sin datos de \u00e1nimo.', ds_mood_only: 'Solo se registr\u00f3 el \u00e1nimo hoy.', ds_mood_high: 'Tu \u00e1nimo estuvo ligeramente por encima de tu promedio reciente.', ds_mood_low: 'Tu \u00e1nimo estuvo ligeramente por debajo de tu promedio reciente.', ds_mood_steady: 'Tu \u00e1nimo estuvo en tu rango habitual.', ds_mood_first: 'Primer registro de \u00e1nimo \u2014 \u00a1buen comienzo!', ds_sleep_high: 'Duraci\u00f3n del sue\u00f1o ligeramente por encima de tu rango.', ds_sleep_low: 'Duraci\u00f3n del sue\u00f1o ligeramente por debajo de tu rango.', ds_sleep_steady: 'Duraci\u00f3n del sue\u00f1o dentro de tu rango habitual.', ds_sleep_recorded: 'Sue\u00f1o registrado hoy.', ds_sleep_segmented: ', dividido en varios segmentos.', ds_energy_and: ', con una energ\u00eda de {energy}.', ds_energy_only: 'Energ\u00eda registrada sin \u00e1nimo hoy.', ds_activities_tags: 'Actividades: \u00ab{activities}\u00bb y etiquetas: \u00ab{tags}\u00bb.', ds_activities_only: 'Actividades: \u00ab{activities}\u00bb.', ds_tags_only: 'Etiquetas: \u00ab{tags}\u00bb.', ds_journal_saved: 'Se guard\u00f3 una nota en el diario.',
        toast_lang: 'Idioma actualizado \u2713', toast_date_fmt: 'Formato de fecha actualizado \u2713', toast_time_fmt: 'Formato de hora actualizado \u2713', toast_saved: 'Guardado \u2713', report_best_day: 'Mejor d\u00eda', report_challenging: 'D\u00eda dif\u00edcil (menor \u00e1nimo)',
    };

    /* ══════════ ARABIC ══════════ */
    T.ar = {
        good_morning: '\u0635\u0628\u0627\u062d \u0627\u0644\u062e\u064a\u0631', good_afternoon: '\u0645\u0633\u0627\u0621 \u0627\u0644\u062e\u064a\u0631', good_evening: '\u0645\u0633\u0627\u0621 \u0627\u0644\u0646\u0648\u0631',
        narrative_start: '\u0627\u0628\u062f\u0623 \u0628\u062a\u0633\u062c\u064a\u0644 \u0623\u0648\u0644 \u064a\u0648\u0645\u0643 \u0644\u062a\u0631\u0649 \u0627\u0644\u0623\u0646\u0645\u0627\u0637 \u062a\u0638\u0647\u0631 \u0647\u0646\u0627.', narrative_trend_up: '\u062a\u062d\u0633\u064f\u0651\u0646 \u0645\u0632\u0627\u062c\u0643 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', narrative_trend_down: '\u0627\u0646\u062e\u0641\u0636 \u0645\u0632\u0627\u062c\u0643 \u0642\u0644\u064a\u0644\u0627\u064b \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', narrative_steady: '\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u0633\u062a\u0642\u0631\u064b\u0627 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', narrative_logged_mood: '\u0633\u062c\u0644\u062a\u064e \u0627\u0644\u064a\u0648\u0645 \u0645\u0632\u0627\u062c\u064b\u0627 {moodLabel} \u0628\u0642\u064a\u0645\u0629 {n}.', narrative_strong_mood: '\u0645\u0631\u062a\u0641\u0639', narrative_moderate_mood: '\u0645\u062a\u0648\u0633\u0637', narrative_low_mood: '\u0645\u0646\u062e\u0641\u0636',
        no_checkin_today: '\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0633\u062c\u064a\u0644 \u0644\u0644\u064a\u0648\u0645 \u0628\u0639\u062f.', tagging_recently: '\u0643\u0646\u062a \u062a\u0633\u062a\u062e\u062f\u0645 \u0648\u0633\u0645 \u201c{tag}\u201d \u0643\u062b\u064a\u0631\u064b\u0627 \u0645\u0624\u062e\u0631\u064b\u0627.', streak_days: '{n} \u0623\u064a\u0627\u0645 \u0645\u062a\u062a\u0627\u0644\u064a\u0629 \u2014 \u0648\u0627\u0635\u0644!', streak_day: '\u0627\u0644\u064a\u0648\u0645 {n} \u0645\u0646 \u0633\u0644\u0633\u0644\u062a\u0643.',
        insight_sec_sleep_heading: '\u0627\u0644\u0646\u0648\u0645', insight_sec_sleep_title: '\u0631\u0624\u0649 \u0627\u0644\u0646\u0648\u0645', insight_sec_sleep_desc: '\u0623\u0646\u0645\u0627\u0637 \u0628\u064a\u0646 \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0645\u0632\u0627\u062c.', insight_sec_activity_heading: '\u0627\u0644\u0646\u0634\u0627\u0637', insight_sec_activity_title: '\u0631\u0624\u0649 \u0627\u0644\u0646\u0634\u0627\u0637', insight_sec_activity_desc: '\u0627\u0644\u0623\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u0627\u0644\u0645\u0632\u0627\u062c.', insight_sec_stability_heading: '\u0627\u0644\u0627\u0633\u062a\u0642\u0631\u0627\u0631', insight_sec_stability_title: '\u0627\u0633\u062a\u0642\u0631\u0627\u0631 \u0627\u0644\u0645\u0632\u0627\u062c', insight_sec_stability_desc: '\u0625\u0634\u0627\u0631\u0627\u062a \u062d\u0648\u0644 \u062a\u0630\u0628\u0630\u0628 \u0627\u0644\u0645\u0632\u0627\u062c.', insight_sec_tags_heading: '\u0627\u0644\u0648\u0633\u0648\u0645', insight_sec_tags_title: '\u0631\u0624\u0649 \u0627\u0644\u0648\u0633\u0648\u0645', insight_sec_tags_desc: '\u0648\u0633\u0648\u0645 \u0645\u062a\u0643\u0631\u0631\u0629 \u0645\u0631\u062a\u0628\u0637\u0629 \u0628\u062a\u063a\u064a\u064f\u0651\u0631\u0627\u062a \u0627\u0644\u0645\u0632\u0627\u062c.',
        strength_strong: '\u0646\u0645\u0637 \u0642\u0648\u064a', strength_moderate: '\u0646\u0645\u0637 \u0645\u062a\u0648\u0633\u0637', strength_emerging: '\u0625\u0634\u0627\u0631\u0629 \u0636\u0639\u064a\u0641\u0629',
        insight_kicker_default: '\u0631\u0624\u064a\u0629', insight_observed_across: '\u0644\u0648\u062d\u0638 \u0639\u0628\u0631 {n} {entries}.', insight_entry: '\u062a\u0633\u062c\u064a\u0644', insight_entries: '\u062a\u0633\u062c\u064a\u0644\u0627\u062a', insight_empty: '\u0633\u062a\u0638\u0647\u0631 \u0631\u0624\u0649 \u0623\u0643\u062b\u0631 \u0628\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u062a\u0633\u062c\u064a\u0644\u0627\u062a.', insight_collecting: '\u0633\u062a\u0638\u0647\u0631 \u0627\u0644\u0631\u0624\u0649 \u0628\u0639\u062f \u062c\u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0643\u0627\u0641\u064a\u0629.',
        insight_sleep_sweet_spot_title: '\u0645\u062f\u0629 \u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u062b\u0644\u0649 \u0644\u0643', insight_sleep_sweet_spot_desc: '\u0641\u064a \u0627\u0644\u0644\u064a\u0627\u0644\u064a \u0627\u0644\u062a\u064a \u062a\u0646\u0627\u0645 \u0641\u064a\u0647\u0627 {label}\u060c \u064a\u0643\u0648\u0646 \u0645\u0632\u0627\u062c\u0643 \u0641\u064a \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u062a\u0627\u0644\u064a {diff} \u0641\u0648\u0642 \u0642\u0627\u0639\u062f\u062a\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f\u0629.', insight_sleep_sweet_spot_fallback: '\u0628\u0646\u0648\u0645 {label}\u060c \u064a\u0645\u064a\u0644 \u0645\u0632\u0627\u062c\u0643 \u0644\u0644\u0627\u0631\u062a\u0641\u0627\u0639.',
        insight_sleep_quality_title: '\u062c\u0648\u062f\u0629 \u0627\u0644\u0646\u0648\u0645', insight_sleep_quality_good_desc: '\u062c\u0648\u062f\u0629 \u0646\u0648\u0645 \u0623\u0639\u0644\u0649 = \u0645\u0632\u0627\u062c \u0623\u0641\u0636\u0644 \u2014 \u0628\u0641\u0627\u0631\u0642 {diff} \u0646\u0642\u0637\u0629.', insight_sleep_quality_bad_desc: '\u0636\u0639\u0641 \u062c\u0648\u062f\u0629 \u0627\u0644\u0646\u0648\u0645 \u064a\u062a\u0632\u0627\u0645\u0646 \u0645\u0639 \u0627\u0646\u062e\u0641\u0627\u0636 \u0627\u0644\u0645\u0632\u0627\u062c.',
        insight_sleep_fragmented_title: '\u0646\u0648\u0645 \u0645\u062a\u0642\u0637\u0639 \u0645\u0642\u0627\u0628\u0644 \u0645\u062a\u0648\u0627\u0635\u0644', insight_sleep_fragmented_good_desc: '\u0645\u0641\u0627\u062c\u0626\u0629: \u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u062a\u0642\u0637\u0639 \u0644\u0627 \u064a\u0624\u062b\u0631 \u0639\u0644\u0649 \u0645\u0632\u0627\u062c\u0643.', insight_sleep_fragmented_bad_desc: '\u064a\u0628\u062f\u0648 \u0623\u0646 \u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u062a\u0642\u0637\u0639 \u064a\u0624\u062b\u0631 \u0633\u0644\u0628\u064b\u0627 \u0639\u0644\u0649 \u0645\u0632\u0627\u062c\u0643.', insight_sleep_fragmented_nudge: '\u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u062a\u0648\u0627\u0635\u0644 \u0642\u062f \u064a\u0633\u0627\u0639\u062f \u0641\u064a \u0627\u0633\u062a\u0642\u0631\u0627\u0631 \u0645\u0632\u0627\u062c\u0643.',
        insight_sleep_bedtime_title: '\u0648\u0642\u062a \u0627\u0644\u0646\u0648\u0645', insight_sleep_bedtime_early_desc: '\u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u0628\u0643\u0651\u0631 \u064a\u0631\u062a\u0628\u0637 \u0628\u0645\u0632\u0627\u062c \u0623\u0641\u0636\u0644.', insight_sleep_bedtime_late_desc: '\u0627\u0644\u0646\u0648\u0645 \u0627\u0644\u0645\u062a\u0623\u062e\u0651\u0631 \u064a\u0631\u062a\u0628\u0637 \u0628\u0645\u0632\u0627\u062c \u0623\u0641\u0636\u0644 \u0642\u0644\u064a\u0644\u0627\u064b.', insight_sleep_bedtime_kicker: '\u0646\u0648\u0645', insight_sleep_bedtime_context: '\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0623\u0646\u0645\u0627\u0637 \u0639\u0628\u0631 {n} \u062a\u0633\u062c\u064a\u0644\u0627\u062a.', insight_sleep_fragmented_context: '\u0645\u0642\u0627\u0631\u0646\u0629 {fragmented} \u0644\u064a\u0644\u0629 \u0645\u062a\u0642\u0637\u0639\u0629 \u0648{consolidated} \u0645\u062a\u0648\u0627\u0635\u0644\u0629.',
        insight_activity_good_title: '\u0623\u064a\u0627\u0645 {label} \u0647\u064a \u0623\u0641\u0636\u0644 \u0623\u064a\u0627\u0645\u0643', insight_activity_bad_title: '{label} \u064a\u0631\u062a\u0628\u0637 \u0628\u0627\u0646\u062e\u0641\u0627\u0636 \u0627\u0644\u0645\u0632\u0627\u062c', insight_activity_good_desc: '\u0623\u064a\u0627\u0645 {label} \u062a\u0633\u062c\u0651\u0644 \u0645\u0632\u0627\u062c\u064b\u0627 \u0645\u062a\u0648\u0633\u0637\u064b\u0627 {avg} \u2014 \u0628\u0641\u0627\u0631\u0642 {diff} \u0641\u0648\u0642 \u0645\u062a\u0648\u0633\u0637\u0643 {overall}.', insight_activity_bad_desc: '\u0623\u064a\u0627\u0645 {label} \u062a\u064f\u0638\u0647\u0631 \u0639\u0627\u062f\u0629\u064b \u0645\u0632\u0627\u062c\u064b\u0627 \u0623\u062f\u0646\u0649 \u0642\u0644\u064a\u0644\u0627\u064b.', insight_activity_kicker: '\u0646\u0634\u0627\u0637', insight_activity_good_nudge: '\u0648\u0627\u0635\u0644 \u0627\u0644\u0623\u0648\u0644\u0648\u064a\u0629 \u0644\u0647.', insight_activity_context: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 {label} \u0641\u064a {n} {days}.', insight_day: '\u064a\u0648\u0645', insight_days: '\u0623\u064a\u0627\u0645',
        insight_tag_good_title: '\u0623\u064a\u0627\u0645 \u201c{label}\u201d \u062a\u0631\u0641\u0639 \u0645\u0632\u0627\u062c\u0643', insight_tag_bad_title: '\u0623\u064a\u0627\u0645 \u201c{label}\u201d \u062a\u062b\u0642\u0644 \u0639\u0644\u0649 \u0645\u0632\u0627\u062c\u0643', insight_tag_good_desc: '\u0641\u064a \u0623\u064a\u0627\u0645 \u201c{label}\u201d\u060c \u064a\u0628\u0644\u063a \u0645\u0632\u0627\u062c\u0643 {diff} \u0646\u0642\u0637\u0629 \u0641\u0648\u0642 \u0642\u0627\u0639\u062f\u062a\u0643.', insight_tag_bad_desc: '\u0623\u064a\u0627\u0645 \u201c{label}\u201d \u062a\u062e\u0641\u0636 \u0645\u062a\u0648\u0633\u0637\u0643 \u0628\u062d\u0648\u0627\u0644\u064a {diff} \u0646\u0642\u0637\u0629.', insight_tag_kicker: '\u0648\u0633\u0648\u0645', insight_tag_bad_nudge: '\u0644\u0627\u062d\u0638 \u0645\u0627 \u064a\u0634\u062a\u0631\u0643 \u0641\u064a\u0647 \u0647\u0630\u0647 \u0627\u0644\u0623\u064a\u0627\u0645.', insight_tag_context: '\u0644\u0648\u062d\u0638 \u0641\u064a {n} {entries} \u0645\u0648\u0633\u0648\u0645\u0629.',
        insight_stability_volatile_title: '\u0628\u0639\u0636 \u0627\u0644\u062a\u0642\u0644\u0628\u0627\u062a \u0627\u0644\u0639\u0627\u0637\u0641\u064a\u0629 \u0645\u0624\u062e\u0631\u064b\u0627', insight_stability_volatile_desc: '\u062a\u0630\u0628\u0630\u0628 \u064a\u0648\u0645\u064a {n} \u0646\u0642\u0637\u0629 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 \u2014 \u0623\u0639\u0644\u0649 \u0645\u0646 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.', insight_stability_volatile_nudge: '\u0639\u0627\u062f\u0629\u064b \u0645\u0627 \u064a\u0643\u0648\u0646 \u0627\u0644\u0646\u0648\u0645 \u0648\u0627\u0644\u0646\u0634\u0627\u0637 \u0633\u0628\u0628 \u0627\u0644\u062a\u0642\u0644\u0628\u0627\u062a.', insight_stability_stable_title: '\u0644\u0642\u062f \u0643\u0646\u062a \u0645\u062a\u0633\u0642\u064b\u0651\u0627 \u0639\u0627\u0637\u0641\u064a\u064b\u0651\u0627', insight_stability_stable_desc: '\u062a\u0630\u0628\u0630\u0628 \u0641\u0642\u0637 {n} \u0646\u0642\u0637\u0629 \u2014 \u0623\u0643\u062b\u0631 \u0641\u062a\u0631\u0627\u062a\u0643 \u062b\u0628\u0627\u062a\u064b\u0627. \u0645\u0627 \u062a\u0641\u0639\u0644\u0647 \u064a\u0633\u064a\u0631 \u0628\u0634\u0643\u0644 \u062c\u064a\u062f.', insight_stability_stable_nudge: '\u0645\u0627 \u062a\u0641\u0639\u0644\u0647 \u064a\u0639\u0645\u0644 \u0628\u0634\u0643\u0644 \u062c\u064a\u062f.', insight_stability_kicker: '\u0627\u0633\u062a\u0642\u0631\u0627\u0631', insight_stability_context: '\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 \u0622\u062e\u0631 {n} \u0623\u064a\u0627\u0645.',
        dow_need_more_data: '\u0623\u0636\u0641 \u0633\u062c\u0644\u0627\u062a \u0644\u0623\u0633\u0628\u0648\u0639\u064a\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644 \u0644\u0631\u0624\u064a\u0629 \u0623\u0646\u0645\u0627\u0637\u0643 \u0627\u0644\u0623\u0633\u0628\u0648\u0639\u064a\u0629.', dow_peak_dip: '\u064a\u0645\u064a\u0644 \u0645\u0632\u0627\u062c\u0643 \u0644\u0644\u0630\u0631\u0648\u0629 \u064a\u0648\u0645 {day1} \u0648\u0627\u0644\u0627\u0646\u062e\u0641\u0627\u0636 \u064a\u0648\u0645 {day2}.', dow_no_data_label: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a', dow_average_label: '\u0645\u062a\u0648\u0633\u0637', dow_dataset_label: '\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u0645\u0632\u0627\u062c',
        ds_not_enough: '\u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0643\u0627\u0641\u064a\u0629 \u0628\u0639\u062f.', ds_journal_only: '\u0633\u062c\u0651\u0644\u062a \u0645\u0644\u0627\u062d\u0638\u0629 \u064a\u0648\u0645\u064a\u0629. \u0644\u0627 \u062a\u0648\u062c\u062f \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0632\u0627\u062c.', ds_photos_only: '\u062d\u0641\u0638\u062a \u0635\u0648\u0631\u064b\u0627 \u062f\u0648\u0646 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0632\u0627\u062c.', ds_mood_only: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0645\u0632\u0627\u062c \u0641\u0642\u0637 \u0627\u0644\u064a\u0648\u0645.', ds_mood_high: '\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0623\u0639\u0644\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643 \u0627\u0644\u0623\u062e\u064a\u0631.', ds_mood_low: '\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0623\u062f\u0646\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0645\u062a\u0648\u0633\u0637\u0643 \u0627\u0644\u0623\u062e\u064a\u0631.', ds_mood_steady: '\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.', ds_mood_first: '\u0623\u0648\u0644 \u062a\u0633\u062c\u064a\u0644 \u0645\u0632\u0627\u062c \u2014 \u0628\u062f\u0627\u064a\u0629 \u0631\u0627\u0626\u0639\u0629!', ds_sleep_high: '\u0645\u062f\u0629 \u0627\u0644\u0646\u0648\u0645 \u0623\u0639\u0644\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0646\u0637\u0627\u0642\u0643.', ds_sleep_low: '\u0645\u062f\u0629 \u0627\u0644\u0646\u0648\u0645 \u0623\u062f\u0646\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0646\u0637\u0627\u0642\u0643.', ds_sleep_steady: '\u0645\u062f\u0629 \u0627\u0644\u0646\u0648\u0645 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.', ds_sleep_recorded: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0646\u0648\u0645.', ds_sleep_segmented: '\u060c \u0645\u0648\u0632\u0651\u0639\u064b\u0627 \u0639\u0644\u0649 \u0639\u062f\u0629 \u0641\u062a\u0631\u0627\u062a.', ds_energy_and: '\u060c \u0648\u0637\u0627\u0642\u0629 {energy}.', ds_energy_only: '\u062a\u0645 \u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u0637\u0627\u0642\u0629 \u062f\u0648\u0646 \u0628\u064a\u0627\u0646\u0627\u062a \u0645\u0632\u0627\u062c.', ds_activities_tags: '\u0627\u0644\u0623\u0646\u0634\u0637\u0629: \u201c{activities}\u201d \u0648\u0627\u0644\u0648\u0633\u0648\u0645: \u201c{tags}\u201d.', ds_activities_only: '\u0627\u0644\u0623\u0646\u0634\u0637\u0629: \u201c{activities}\u201d.', ds_tags_only: '\u0627\u0644\u0648\u0633\u0648\u0645: \u201c{tags}\u201d.', ds_journal_saved: '\u062a\u0645 \u062d\u0641\u0638 \u0645\u0644\u0627\u062d\u0638\u0629 \u064a\u0648\u0645\u064a\u0629.',
        toast_lang: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0644\u063a\u0629 \u2713', toast_date_fmt: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u2713', toast_time_fmt: '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0648\u0642\u062a \u2713', toast_saved: '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u2713', report_best_day: '\u0623\u0641\u0636\u0644 \u064a\u0648\u0645', report_challenging: '\u064a\u0648\u0645 \u0635\u0639\u0628 (\u0623\u062f\u0646\u0649 \u0645\u0632\u0627\u062c)',
    };

    /* Auto-fill missing keys from English for all locales */
    ['de','fr','es','it','pt','nl','pl','ru','tr','ja','zh','hi','ar'].forEach(function (l) {
        if (!T[l]) T[l] = {};
        Object.keys(T.en).forEach(function (k) {
            if (T[l][k] == null) T[l][k] = T.en[k];
        });
    });

    /* ─────────────────────────────────────────────────────────────────
       §2.  Translation helper
    ───────────────────────────────────────────────────────────────── */
    function t(key, vars) {
        var l = loc();
        var row = T[l] || T.en;
        var val = (row[key] != null) ? row[key] : (T.en[key] || key);
        if (!vars) return val;
        return val.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    }

    window.__t = t;
    window.getTranslation = function (key) { return t(key); };

    /* Localized month names via Intl (no hardcoded arrays) */
    window.getLocalizedMonths = function (fmt) {
        var l = String(window.auraLocale || 'en');
        return Array.from({ length: 12 }, function (_, i) {
            try { return new Intl.DateTimeFormat(l, { month: fmt || 'short' }).format(new Date(2000, i, 1)); }
            catch (e) { return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]; }
        });
    };

    /* Localized day names via Intl */
    window.getLocalizedDays = function (fmt) {
        var l = String(window.auraLocale || 'en');
        return Array.from({ length: 7 }, function (_, i) {
            try { return new Intl.DateTimeFormat(l, { weekday: fmt || 'short' }).format(new Date(2000, 0, 2 + i)); }
            catch (e) { return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][i]; }
        });
    };

    window.getLocalizedDaysFull = function () {
        var l = String(window.auraLocale || 'en');
        return Array.from({ length: 7 }, function (_, i) {
            try { return new Intl.DateTimeFormat(l, { weekday: 'long' }).format(new Date(2000, 0, 2 + i)); }
            catch (e) { return ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][i]; }
        });
    };

    /* ─────────────────────────────────────────────────────────────────
       §3.  Patch functions — applied once on ready, re-applied on locale change
    ───────────────────────────────────────────────────────────────── */
    function applyPatches() {

        /* ── 3a. INSIGHT_SECTION_META ─────────────────────────────── */
        if (window.INSIGHT_SECTION_META) {
            window.INSIGHT_SECTION_META.sleep = {
                heading: t('insight_sec_sleep_heading'),
                title:   t('insight_sec_sleep_title'),
                description: t('insight_sec_sleep_desc'),
                icon: '☾'
            };
            window.INSIGHT_SECTION_META.activity = {
                heading: t('insight_sec_activity_heading'),
                title:   t('insight_sec_activity_title'),
                description: t('insight_sec_activity_desc'),
                icon: '◌'
            };
            window.INSIGHT_SECTION_META.stability = {
                heading: t('insight_sec_stability_heading'),
                title:   t('insight_sec_stability_title'),
                description: t('insight_sec_stability_desc'),
                icon: '◔'
            };
            window.INSIGHT_SECTION_META.tags = {
                heading: t('insight_sec_tags_heading'),
                title:   t('insight_sec_tags_title'),
                description: t('insight_sec_tags_desc'),
                icon: '#'
            };
        }

        /* ── 3b. getInsightStrength ───────────────────────────────── */
        window.getInsightStrength = function (score) {
            if (score >= 5) return { label: t('strength_strong'),   width: 100 };
            if (score >= 3) return { label: t('strength_moderate'), width: 68  };
            return              { label: t('strength_emerging'),   width: 38  };
        };

        /* ── 3c. buildInsightCardHtml ─────────────────────────────── */
        window.buildInsightCardHtml = function (insight) {
            var strengthMap = {
                strong:   { label: t('strength_strong'),   width: 100, cls: 'insight-strength-strong'   },
                moderate: { label: t('strength_moderate'), width: 62,  cls: 'insight-strength-moderate' },
                emerging: { label: t('strength_emerging'), width: 32,  cls: 'insight-strength-emerging' }
            };
            var s = strengthMap[insight.strength || 'emerging'];
            var esc = window.escapeHtml || function (x) { return String(x).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); };
            var nudgeHtml = insight.nudge ? '<p class="insight-nudge">' + esc(insight.nudge) + '</p>' : '';
            return '<div class="card insight-detail-card">' +
                '<div class="insight-detail-header">' +
                    '<div class="insight-detail-title-wrap">' +
                        '<span class="insight-icon-badge" data-section="' + esc(insight.section) + '" aria-hidden="true">' + esc(insight.icon || '\u2022') + '</span>' +
                        '<div>' +
                            '<span class="insight-detail-kicker">' + esc(insight.kicker || t('insight_kicker_default')) + '</span>' +
                            '<h4 class="insight-detail-title">' + esc(insight.title) + '</h4>' +
                        '</div>' +
                    '</div>' +
                    '<div class="insight-strength">' +
                        '<span class="insight-strength-label ' + s.cls + '">' + s.label + '</span>' +
                        '<div class="insight-strength-bar"><div class="insight-strength-fill" style="width:' + s.width + '%;"></div></div>' +
                    '</div>' +
                '</div>' +
                '<p class="insight-detail-text">' + esc(insight.description) + '</p>' +
                nudgeHtml +
                '<p class="insight-detail-context">' + esc(insight.context) + '</p>' +
            '</div>';
        };

        /* ── 3d. createInsightCandidate ───────────────────────────── */
        window.createInsightCandidate = function (section, title, description, supportCount, score, options) {
            options = options || {};
            var n = supportCount;
            var entryWord = n === 1 ? t('insight_entry') : t('insight_entries');
            return {
                section:      section,
                title:        title,
                description:  description,
                supportCount: n,
                score:        score,
                kicker:       options.kicker || t('insight_kicker_default'),
                icon:         options.icon || ((window.INSIGHT_SECTION_META && window.INSIGHT_SECTION_META[section] && window.INSIGHT_SECTION_META[section].icon) || '\u2022'),
                context:      options.context || t('insight_observed_across', { n: n, entries: entryWord }),
                nudge:        options.nudge || '',
                strength:     score >= 5 ? 'strong' : score >= 3 ? 'moderate' : 'emerging'
            };
        };

        /* ── 3e. correlationInsightsEngine — patch empty state + sections ── */
        if (window.correlationInsightsEngine) {
            var _origAnalyze = window.correlationInsightsEngine.analyze;
            if (_origAnalyze && !_origAnalyze._i18nPatched) {
                window.correlationInsightsEngine.analyze = function (records) {
                    var result = _origAnalyze.apply(this, arguments);
                    /* Translate the summary / message fields */
                    if (result) {
                        if (!records || records.length < (window.MIN_INSIGHT_RECORDS || 5)) {
                            result.summary = t('insight_empty');
                            result.message = t('insight_collecting');
                        } else {
                            if (result.summary === 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.') {
                                result.summary = t('insight_empty');
                            }
                        }
                        /* Translate insight titles and descriptions */
                        if (result.sections) {
                            result.sections.forEach(function (section) {
                                /* Update section meta */
                                var meta = window.INSIGHT_SECTION_META && window.INSIGHT_SECTION_META[section.key];
                                if (meta) section.title = meta.title;
                                if (section.insights) {
                                    section.insights.forEach(function (ins) {
                                        translateInsightCandidate(ins);
                                    });
                                }
                            });
                        }
                        if (result.overview) {
                            result.overview.forEach(function (ins) { translateInsightCandidate(ins); });
                        }
                    }
                    return result;
                };
                window.correlationInsightsEngine.analyze._i18nPatched = true;
            }
        }

        /* ── 3f. renderInsightsResult — translate empty states ────── */
        var _origRender = window.renderInsightsResult;
        if (_origRender && !_origRender._i18nPatched) {
            window.renderInsightsResult = function (result) {
                var overviewTextEl = document.getElementById('insightsOverviewText');
                _origRender.apply(this, arguments);
                if (overviewTextEl && (!result || !result.sections || !result.sections.length)) {
                    overviewTextEl.textContent = t('insight_empty');
                }
            };
            window.renderInsightsResult._i18nPatched = true;
        }

        /* ── 3g. renderDayOfWeekChart — localized day names ──────── */
        var _origDow = window.renderDayOfWeekChart;
        if (_origDow && !_origDow._i18nPatched) {
            window.renderDayOfWeekChart = function () {
                _origDow.apply(this, arguments);
                setTimeout(function () {
                    var canvas = document.getElementById('dowChart');
                    if (!canvas) return;
                    var c = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
                    if (!c) return;
                    var shortDays = window.getLocalizedDays('short');
                    c.data.labels = shortDays;
                    if (c.data.datasets && c.data.datasets[0]) {
                        c.data.datasets[0].label = t('dow_dataset_label');
                    }
                    /* Translate tooltip */
                    var fullDays = window.getLocalizedDaysFull();
                    if (c.options && c.options.plugins && c.options.plugins.tooltip && c.options.plugins.tooltip.callbacks) {
                        c.options.plugins.tooltip.callbacks.label = function (ctx) {
                            var v = ctx.raw;
                            var day = fullDays[ctx.dataIndex] || shortDays[ctx.dataIndex];
                            if (v == null) return day + ': ' + t('dow_no_data_label');
                            return day + ': ' + v.toFixed(1) + ' ' + t('dow_average_label');
                        };
                    }
                    c.update('none');
                    /* Also translate the insight text */
                    var insightEl = document.getElementById('dowChartInsight');
                    if (insightEl && insightEl.textContent) {
                        /* The original set English day names — find best/worst and re-render */
                        var avgs = c.data.datasets[0].data;
                        var best = -1, worst = 11, bestIdx = -1, worstIdx = -1;
                        avgs.forEach(function (v, i) {
                            if (v == null) return;
                            if (v > best) { best = v; bestIdx = i; }
                            if (v < worst) { worst = v; worstIdx = i; }
                        });
                        if (bestIdx >= 0 && worstIdx >= 0 && bestIdx !== worstIdx) {
                            insightEl.textContent = t('dow_peak_dip', { day1: fullDays[bestIdx], day2: fullDays[worstIdx] });
                        }
                    }
                    /* "Need more data" message */
                    var card = canvas.closest('.card');
                    if (card) {
                        var noDataMsg = card.querySelector('.dow-no-data-msg');
                        if (noDataMsg) noDataMsg.textContent = t('dow_need_more_data');
                    }
                }, 100);
            };
            window.renderDayOfWeekChart._i18nPatched = true;
        }

        /* ── 3h. buildDashboardGreeting ──────────────────────────── */
        window.buildDashboardGreeting = function () {
            var hour = new Date().getHours();
            if (hour < 12) return t('good_morning');
            if (hour < 17) return t('good_afternoon');
            return t('good_evening');
        };

        /* ── 3i. buildDashboardNarrative ─────────────────────────── */
        window.buildDashboardNarrative = function () {
            if (typeof entries === 'undefined' || !entries) return t('narrative_start');
            var allDates = Object.keys(entries).sort();
            if (!allDates.length) return t('narrative_start');

            var today = (typeof getLocalTodayYMD === 'function') ? getLocalTodayYMD() : new Date().toISOString().split('T')[0];
            var todayEntry = entries[today];

            /* Trend */
            var last7 = allDates.filter(function (d) { return d <= today; }).slice(-7);
            var last7Moods = last7.map(function (d) { return entries[d] && entries[d].mood; }).filter(function (m) { return typeof m === 'number' && !isNaN(m); });
            var trendText = '';
            if (last7Moods.length >= 4) {
                var half = Math.floor(last7Moods.length / 2);
                var firstAvg = last7Moods.slice(0, half).reduce(function (a, b) { return a + b; }, 0) / half;
                var secondAvg = last7Moods.slice(half).reduce(function (a, b) { return a + b; }, 0) / (last7Moods.length - half);
                var diff = secondAvg - firstAvg;
                if (diff > 0.5)       trendText = t('narrative_trend_up');
                else if (diff < -0.5) trendText = t('narrative_trend_down');
                else                  trendText = t('narrative_steady');
            }

            /* Today's mood */
            var todayText = '';
            if (todayEntry && todayEntry.mood != null) {
                var moodVal = todayEntry.mood;
                var moodLabel = moodVal >= 7.5 ? t('narrative_strong_mood') : moodVal >= 5 ? t('narrative_moderate_mood') : t('narrative_low_mood');
                todayText = t('narrative_logged_mood', { moodLabel: moodLabel, n: moodVal.toFixed(1) });
            } else {
                todayText = t('no_checkin_today');
            }

            /* Top tag */
            var tagCounts = {};
            last7.forEach(function (d) {
                ((entries[d] && entries[d].tags) || []).forEach(function (tag) { tagCounts[tag] = (tagCounts[tag] || 0) + 1; });
            });
            var topTag = Object.keys(tagCounts).sort(function (a, b) { return tagCounts[b] - tagCounts[a]; })[0];
            var tagText = topTag ? t('tagging_recently', { tag: topTag }) : '';

            /* Streak */
            var streak = 0;
            var checkDate = new Date(); checkDate.setHours(0, 0, 0, 0);
            var fmt = typeof formatLocalDateYMD === 'function' ? formatLocalDateYMD : function (d) { return d.toISOString().split('T')[0]; };
            if (!entries[fmt(checkDate)]) checkDate.setDate(checkDate.getDate() - 1);
            while (entries[fmt(checkDate)]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
            var streakText = streak >= 3 ? t('streak_days', { n: streak }) : streak > 0 ? t('streak_day', { n: streak }) : '';

            return [todayText, trendText, tagText, streakText].filter(Boolean).slice(0, 3).join(' ');
        };

        /* ── 3j. buildDailySummary for non-EN ────────────────────── */
        if (loc() !== 'en') {
            var _origSummary = window._origBuildDailySummaryData || window.buildDailySummaryData;
            if (_origSummary && !_origSummary._i18nPatched) {
                /* Save original so we can always call it for EN */
                window._origBuildDailySummaryData = _origSummary;
                window.buildDailySummaryData = function (dateStr) {
                    if (loc() === 'en') return window._origBuildDailySummaryData.apply(this, arguments);
                    var entry = (typeof entries !== 'undefined' && entries) ? entries[dateStr] : null;
                    if (!entry) return { text: t('ds_not_enough'), sentenceCount: 0, isEmpty: true };
                    var hasJournal = typeof notesValueToPlainText === 'function' ? !!notesValueToPlainText(entry).trim() : false;
                    var hasPhotos = Array.isArray(entry.photos) && entry.photos.length > 0;
                    var hasMood = entry.mood != null && !isNaN(Number(entry.mood));
                    var hasEnergy = entry.energy != null && !isNaN(Number(entry.energy));
                    var sleepVal = entry.sleepTotal != null ? entry.sleepTotal : entry.sleep;
                    var hasSleep = sleepVal != null && !isNaN(Number(sleepVal));
                    var hasTags = Array.isArray(entry.tags) && entry.tags.length > 0;
                    var hasActs = Array.isArray(entry.activities) && entry.activities.length > 0;
                    var hasContent = hasMood || hasEnergy || hasSleep || hasTags || hasActs || hasJournal || hasPhotos;
                    if (!hasContent) return { text: t('ds_not_enough'), sentenceCount: 0, isEmpty: true };
                    if (!hasMood && !hasEnergy && !hasSleep && !hasTags && !hasActs) {
                        return { text: hasJournal ? t('ds_journal_only') : t('ds_photos_only'), sentenceCount: 1, isEmpty: false };
                    }
                    if (hasMood && !hasEnergy && !hasSleep && !hasTags && !hasActs && !hasJournal) {
                        return { text: t('ds_mood_only'), sentenceCount: 1, isEmpty: false };
                    }
                    var sentences = [];
                    if (hasMood) {
                        var avg = typeof getDailySummaryAverage === 'function' ? getDailySummaryAverage(dateStr, 'mood') : null;
                        var diff = avg != null ? Number(entry.mood) - avg : 0;
                        var moodSent = avg != null && diff > 0.75 ? t('ds_mood_high') :
                                       avg != null && diff < -0.75 ? t('ds_mood_low') :
                                       avg != null ? t('ds_mood_steady') : t('ds_mood_first');
                        if (hasEnergy) moodSent = moodSent.replace(/\.$/, '') + t('ds_energy_and', { energy: Number(entry.energy).toFixed(1) });
                        sentences.push(moodSent);
                    } else if (hasEnergy) {
                        sentences.push(t('ds_energy_only'));
                    }
                    if (hasSleep) {
                        var savg = typeof getDailySummaryAverage === 'function' ? getDailySummaryAverage(dateStr, 'sleep') : null;
                        var sd = savg != null ? Number(sleepVal) - savg : 0;
                        var sleepSent = savg != null && sd > 0.75 ? t('ds_sleep_high') :
                                        savg != null && sd < -0.75 ? t('ds_sleep_low') :
                                        savg != null ? t('ds_sleep_steady') : t('ds_sleep_recorded');
                        var segs = (entry.sleepSegments || []).length;
                        if (segs > 1) sleepSent = sleepSent.replace(/\.$/, '') + t('ds_sleep_segmented');
                        sentences.push(sleepSent);
                    }
                    var actList = hasActs ? entry.activities.slice(0, 3).join(', ') : '';
                    var tagList = hasTags ? entry.tags.slice(0, 3).join(', ') : '';
                    if (hasActs && hasTags) sentences.push(t('ds_activities_tags', { activities: actList, tags: tagList }));
                    else if (hasActs) sentences.push(t('ds_activities_only', { activities: actList }));
                    else if (hasTags) sentences.push(t('ds_tags_only', { tags: tagList }));
                    if (hasJournal) sentences.push(t('ds_journal_saved'));
                    return { text: sentences.join(' '), sentenceCount: sentences.length, isEmpty: false };
                };
                window.buildDailySummaryData._i18nPatched = true;
            }
        }

        /* ── 3k. showToast ───────────────────────────────────────── */
        var _origToast = window._origShowToast || window.showToast;
        if (_origToast && !window._origShowToast) window._origShowToast = _origToast;
        if (window._origShowToast) {
            window.showToast = function (msg) {
                var MAP = {
                    'Language updated \u2713': 'toast_lang',
                    'Language updated': 'toast_lang',
                    'Date format updated \u2713': 'toast_date_fmt',
                    'Date format updated': 'toast_date_fmt',
                    'Time format updated \u2713': 'toast_time_fmt',
                    'Time format updated': 'toast_time_fmt',
                    'Saved \u2713': 'toast_saved',
                    'Saved': 'toast_saved',
                };
                var key = MAP[String(msg).trim()];
                return window._origShowToast.call(this, key ? t(key) : msg);
            };
        }

        /* ── 3l. Seasonal + YoY charts: localized months ─────────── */
        ['seasonalChart', 'yoyChart'].forEach(function (id) {
            var canvas = document.getElementById(id);
            if (!canvas) return;
            var c = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
            if (!c) return;
            c.data.labels = window.getLocalizedMonths('short');
            if (c.data.datasets && c.data.datasets[0]) {
                c.data.datasets[0].label = t('chart_avg_mood_month') || c.data.datasets[0].label;
            }
            c.update('none');
        });

        /* ── 3m. Invalidate insight cache so engine re-runs translated ── */
        if (window.insightsEngineCacheSignature !== undefined) {
            window.insightsEngineCacheSignature = '';
            window.insightsEngineCacheResult = null;
        }
    }

    /* ─────────────────────────────────────────────────────────────────
       §4.  Translate individual insight candidate (post-engine)
    ───────────────────────────────────────────────────────────────── */
    function translateInsightCandidate(ins) {
        if (!ins || loc() === 'en') return;
        /* Strength labels */
        if (ins.strength === 'strong')   ins.kicker = ins.kicker; /* keep section kicker */
        /* Context line */
        var n = ins.supportCount || 0;
        var entryWord = n === 1 ? t('insight_entry') : t('insight_entries');
        if (/^Observed across \d/.test(ins.context || '')) {
            ins.context = t('insight_observed_across', { n: n, entries: entryWord });
        }
        /* Section-specific kickers */
        var kicMap = {
            'Sleep Insight': t('insight_sleep_bedtime_kicker'),
            'Sleep':         t('insight_sleep_bedtime_kicker'),
            'Activity':      t('insight_activity_kicker'),
            'Tags':          t('insight_tag_kicker'),
            'Stability':     t('insight_stability_kicker'),
            'Insight':       t('insight_kicker_default'),
        };
        if (kicMap[ins.kicker]) ins.kicker = kicMap[ins.kicker];
        /* Title patterns */
        var titleMap = [
            [/^Your sweet spot for sleep$/,               t('insight_sleep_sweet_spot_title')],
            [/^Sleep Quality$/,                           t('insight_sleep_quality_title')],
            [/^Fragmented vs Consolidated Sleep$/,        t('insight_sleep_fragmented_title')],
            [/^Bedtime Timing$/,                          t('insight_sleep_bedtime_title')],
            [/^Some emotional turbulence lately$/,        t('insight_stability_volatile_title')],
            [/^You've been emotionally consistent$/,      t('insight_stability_stable_title')],
        ];
        titleMap.forEach(function (pair) { if (pair[0].test(ins.title || '')) ins.title = pair[1]; });
        /* Activity/tag dynamic titles */
        var mActGood = ins.title && ins.title.match(/^(.+) days are better days$/);
        if (mActGood) ins.title = t('insight_activity_good_title', { label: mActGood[1] });
        var mActBad = ins.title && ins.title.match(/^(.+) correlates with lower mood$/);
        if (mActBad) ins.title = t('insight_activity_bad_title', { label: mActBad[1] });
        var mTagGood = ins.title && ins.title.match(/^\u201c(.+)\u201d days tend to lift you$/);
        if (mTagGood) ins.title = t('insight_tag_good_title', { label: mTagGood[1] });
        var mTagBad = ins.title && ins.title.match(/^\u201c(.+)\u201d days weigh on you$/);
        if (mTagBad) ins.title = t('insight_tag_bad_title', { label: mTagBad[1] });
        /* Description patterns */
        var descMap = [
            [/Earlier bedtimes tend to be associated with higher mood/, t('insight_sleep_bedtime_early_desc')],
            [/Later bedtimes appear linked to slightly higher mood/,    t('insight_sleep_bedtime_late_desc')],
            [/Surprisingly, fragmented nights don/,                     t('insight_sleep_fragmented_good_desc')],
            [/Fragmented sleep appears to weigh on/,                    t('insight_sleep_fragmented_bad_desc')],
            [/Higher sleep quality scores appear linked/,               ins.description], /* keep numbers, replace on match below */
            [/Day-to-day variance of .+ points this week.*higher/,     null], /* volatility */
            [/Day-to-day variance of just .+ points/,                  null], /* stable */
        ];
        /* Sleep quality */
        var mSQ = (ins.description || '').match(/Higher sleep quality scores appear linked.*?(\d[\d.]*)\s*[\-\u2014]/);
        if (mSQ) ins.description = t('insight_sleep_quality_good_desc', { diff: mSQ[1] });
        var mSQBad = /Lower sleep quality tends/.test(ins.description || '');
        if (mSQBad) ins.description = t('insight_sleep_quality_bad_desc', { diff: '' });
        /* Fragmented */
        var mFrag = (ins.context || '').match(/Compared (\d+) fragmented and (\d+) consolidated/);
        if (mFrag) ins.context = t('insight_sleep_fragmented_context', { fragmented: mFrag[1], consolidated: mFrag[2] });
        /* Bedtime context */
        var mBC = (ins.context || '').match(/Based on bedtime patterns observed across (\d+) entries/);
        if (mBC) ins.context = t('insight_sleep_bedtime_context', { n: mBC[1] });
        /* Stability */
        var mVolatile = (ins.description || '').match(/Day-to-day variance of ([\d.]+) points this week.*higher/);
        if (mVolatile) { ins.description = t('insight_stability_volatile_desc', { n: mVolatile[1] }); ins.nudge = t('insight_stability_volatile_nudge'); }
        var mStable = (ins.description || '').match(/Day-to-day variance of just ([\d.]+) points/);
        if (mStable) { ins.description = t('insight_stability_stable_desc', { n: mStable[1] }); ins.nudge = t('insight_stability_stable_nudge'); }
        /* Stability context */
        var mSC = (ins.context || '').match(/Based on the last (\d+) days/);
        if (mSC) ins.context = t('insight_stability_context', { n: mSC[1] });
        /* Tag/activity descriptions */
        var mTagGoodDesc = (ins.description || '').match(/On days tagged .+? your mood averages ([\d.]+) points above your baseline/);
        if (mTagGoodDesc) {
            var tagLabel = (ins.title || '').replace(t('insight_tag_good_title', { label: '' }), '').replace(/[""]/g, '').trim();
            if (!tagLabel) tagLabel = ins.title;
            ins.description = t('insight_tag_good_desc', { label: tagLabel, diff: mTagGoodDesc[1] });
        }
        var mTagBadDesc = (ins.description || '').match(/drag your average down by about ([\d.]+) points/);
        if (mTagBadDesc) {
            var tagLabelB = (ins.title || '').replace(t('insight_tag_bad_title', { label: '' }), '').replace(/[""]/g, '').trim();
            ins.description = t('insight_tag_bad_desc', { label: tagLabelB, diff: mTagBadDesc[1] });
            ins.nudge = t('insight_tag_bad_nudge', { label: tagLabelB });
        }
        /* Tag/activity context */
        var mTagCtx = (ins.context || '').match(/Seen across (\d+) tagged (.+)$/);
        if (mTagCtx) {
            var ew = Number(mTagCtx[1]) === 1 ? t('insight_entry') : t('insight_entries');
            ins.context = t('insight_tag_context', { n: mTagCtx[1], entries: ew });
        }
        var mActCtx = (ins.context || '').match(/Logged .+ on (\d+) (day|days)\.$/);
        if (mActCtx) {
            var dw = Number(mActCtx[1]) === 1 ? t('insight_day') : t('insight_days');
            ins.context = t('insight_activity_context', { label: ins.title ? ins.title.split(' ')[0] : '', n: mActCtx[1], days: dw });
        }
    }

    /* ─────────────────────────────────────────────────────────────────
       §5.  Boot + locale change hook
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        applyPatches();

        /* Hook savePreference */
        var _origSave = window.savePreference;
        if (typeof _origSave === 'function' && !_origSave._i18nRuntimePatched) {
            window.savePreference = function (key, value) {
                var result = _origSave.apply(this, arguments);
                if (key === 'locale') {
                    var l = String(value || 'en');
                    if (l === '_custom') {
                        var el = document.getElementById('prefLocaleCustom');
                        l = el ? (el.value.trim() || 'en') : 'en';
                    }
                    window.auraLocale = l;
                    setTimeout(function () {
                        /* Re-apply all patches with new locale */
                        /* Reset patched flags so functions get re-wrapped */
                        if (window.renderDayOfWeekChart) delete window.renderDayOfWeekChart._i18nPatched;
                        if (window.renderInsightsResult) delete window.renderInsightsResult._i18nPatched;
                        if (window.buildDailySummaryData) delete window.buildDailySummaryData._i18nPatched;
                        applyPatches();
                        /* Refresh live UI */
                        var greetingEl = document.getElementById('dashboardGreeting');
                        if (greetingEl) greetingEl.textContent = window.buildDashboardGreeting();
                        var narrativeEl = document.getElementById('dashboardNarrative');
                        if (narrativeEl) narrativeEl.textContent = window.buildDashboardNarrative();
                        /* Re-render DOW chart if visible */
                        var dowCanvas = document.getElementById('dowChart');
                        if (dowCanvas && dowCanvas.offsetParent !== null && typeof window.renderDayOfWeekChart === 'function') {
                            window.renderDayOfWeekChart();
                        }
                        /* Re-run insights if visible */
                        if (typeof window.renderInsights === 'function') {
                            var insightsPage = document.getElementById('insights');
                            if (insightsPage && !insightsPage.hidden) window.renderInsights();
                        }
                    }, 150);
                }
                return result;
            };
            window.savePreference._i18nRuntimePatched = true;
        }
    }, 600);

    /* ─────────────────────────────────────────────────────────────────
       §6.  Patch buildSleepInsights + buildEnergyInsights in improvements.js
            These are separate from app.js's insight engine and generate
            their own fully-hardcoded English strips on Sleep/Energy pages.
    ───────────────────────────────────────────────────────────────── */

    /* Add sleep/energy strip translations to the master table */
    var SE = {
        en: {
            sleep_avg_low:      'Your average sleep is {n} hours \u2014 below the recommended 7\u20139h.',
            sleep_avg_low_sub:  'Even small improvements tend to lift mood the following day.',
            sleep_avg_ok:       'Your average sleep is {n} hours \u2014 within a healthy range.',
            sleep_avg_ok_sub:   'Consistency matters more than duration; try to keep your bedtime within a 30-minute window.',
            sleep_trend_up:     'Sleep improved by {n}h this week vs your average.',
            sleep_trend_up_sub: 'Keep it up \u2014 sustained rest builds resilience.',
            sleep_trend_dn:     'Sleep dropped by {n}h this week vs your average.',
            sleep_trend_dn_sub: 'Check for late screens or stress cutting your sleep short.',
            sleep_sweet:        '7\u20138.5h nights are your sweet spot: mood averages {avg} \u2014 {diff} above your overall average.',
            sleep_sweet_sub:    'Based on {n} nights in that range.',
            energy_mood_high:   'Your energy and mood track closely together ({strength} correlation).',
            energy_mood_low:    'Interesting: your energy and mood don\u2019t always align \u2014 worth exploring why.',
            energy_mood_sub:    'Logged across {n} days with both metrics.',
            energy_avg_high:    'Your energy averages {n}/10 \u2014 a solid baseline.',
            energy_avg_mid:     'Your energy averages {n}/10 \u2014 moderate and manageable.',
            energy_avg_low:     'Your energy averages {n}/10 \u2014 lower than optimal.',
            energy_avg_sub_low: 'Activity, sleep quality, and hydration are often the biggest levers.',
            energy_avg_sub_ok:  'Keep tracking to see what days feel most energised.',
            energy_trend_up:    'Energy trending up this week (+{n} vs average).',
            energy_trend_dn:    'Energy dipped this week ({n} vs average).',
            energy_trend_up_sub:'Whatever you\u2019re doing \u2014 keep it up.',
            energy_trend_dn_sub:'Watch for sleep deficits or increased stress.',
            energy_sleep_link:  'More sleep tends to come with higher energy for you.',
            energy_sleep_link_sub: 'On nights with more sleep, your energy the next day averages {n} points higher.',
            energy_sleep_nolink:'Your energy doesn\u2019t closely track your sleep duration.',
            energy_sleep_nolink_sub: 'Other factors \u2014 activity, stress, or timing \u2014 may matter more for you.',
            strength_high: 'high',
            strength_moderate: 'moderate',
        },
        de: {
            sleep_avg_low:      'Dein durchschnittlicher Schlaf betr\u00e4gt {n} Stunden \u2014 unter den empfohlenen 7\u20139h.',
            sleep_avg_low_sub:  'Schon kleine Verbesserungen heben die Stimmung am n\u00e4chsten Tag.',
            sleep_avg_ok:       'Dein durchschnittlicher Schlaf betr\u00e4gt {n} Stunden \u2014 ein gesunder Bereich.',
            sleep_avg_ok_sub:   'Regelm\u00e4\u00dfigkeit z\u00e4hlt mehr als Dauer; versuche, deine Schlafenszeit um 30 Minuten konstant zu halten.',
            sleep_trend_up:     'Schlaf diese Woche um {n} Std. verbessert \u2014 \u00fcber deinem Durchschnitt.',
            sleep_trend_up_sub: 'Weiter so \u2014 regelm\u00e4\u00dfiger Schlaf st\u00e4rkt die Belastbarkeit.',
            sleep_trend_dn:     'Schlaf diese Woche um {n} Std. gesunken \u2014 unter deinem Durchschnitt.',
            sleep_trend_dn_sub: 'Pr\u00fcfe, ob sp\u00e4te Bildschirmzeit oder Stress deinen Schlaf verk\u00fcrzen.',
            sleep_sweet:        '7\u20138,5h-N\u00e4chte sind dein optimaler Bereich: Stimmung im Schnitt {avg} \u2014 {diff} \u00fcber deinem Gesamtdurchschnitt.',
            sleep_sweet_sub:    'Basierend auf {n} N\u00e4chten in diesem Bereich.',
            energy_mood_high:   'Deine Energie und Stimmung entwickeln sich \u00e4hnlich ({strength} Korrelation).',
            energy_mood_low:    'Interessant: Energie und Stimmung stimmen bei dir nicht immer \u00fcberein \u2014 es lohnt sich nachzuforschen.',
            energy_mood_sub:    '\u00dcber {n} Tage mit beiden Metriken erfasst.',
            energy_avg_high:    'Deine Energie liegt im Schnitt bei {n}/10 \u2014 eine solide Basis.',
            energy_avg_mid:     'Deine Energie liegt im Schnitt bei {n}/10 \u2014 moderat und handhabbar.',
            energy_avg_low:     'Deine Energie liegt im Schnitt bei {n}/10 \u2014 niedriger als optimal.',
            energy_avg_sub_low: 'Aktivit\u00e4t, Schlafqualit\u00e4t und Hydration sind oft die gr\u00f6\u00dften Stellschrauben.',
            energy_avg_sub_ok:  'Behalte das Tracken bei, um deine energiereichsten Tage zu erkennen.',
            energy_trend_up:    'Energie diese Woche steigend (+{n} vs. Durchschnitt).',
            energy_trend_dn:    'Energie diese Woche gesunken ({n} vs. Durchschnitt).',
            energy_trend_up_sub:'Was auch immer du gerade machst \u2014 mach weiter so.',
            energy_trend_dn_sub:'Achte auf Schlafdefizite oder erh\u00f6hten Stress.',
            energy_sleep_link:  'Mehr Schlaf geht bei dir oft mit mehr Energie einher.',
            energy_sleep_link_sub: 'An Tagen nach mehr Schlaf liegt deine Energie im Schnitt {n} Punkte h\u00f6her.',
            energy_sleep_nolink:'Deine Energie folgt nicht eng deiner Schlafdauer.',
            energy_sleep_nolink_sub: 'Andere Faktoren \u2014 Aktivit\u00e4t, Stress oder Timing \u2014 k\u00f6nnten f\u00fcr dich wichtiger sein.',
            strength_high: 'stark',
            strength_moderate: 'moderat',
        },
        fr: {
            sleep_avg_low:      'Ton sommeil moyen est de {n} heures \u2014 en dessous des 7\u20139h recommand\u00e9es.',
            sleep_avg_low_sub:  'M\u00eame de petites am\u00e9liorations tendent \u00e0 booster l\u2019humeur le lendemain.',
            sleep_avg_ok:       'Ton sommeil moyen est de {n} heures \u2014 dans une plage saine.',
            sleep_avg_ok_sub:   'La r\u00e9gularit\u00e9 compte plus que la dur\u00e9e ; essaie de te coucher \u00e0 \u00b130 minutes pr\u00e8s.',
            sleep_trend_up:     'Sommeil am\u00e9lior\u00e9 de {n}h cette semaine vs ta moyenne.',
            sleep_trend_up_sub: 'Continue \u2014 un repos r\u00e9gulier renforce la r\u00e9silience.',
            sleep_trend_dn:     'Sommeil r\u00e9duit de {n}h cette semaine vs ta moyenne.',
            sleep_trend_dn_sub: 'V\u00e9rifie si les \u00e9crans tardifs ou le stress r\u00e9duisent ton sommeil.',
            sleep_sweet:        'Les nuits de 7\u20138,5h sont ton id\u00e9al\u00a0: humeur de {avg} en moyenne \u2014 {diff} au-dessus de ta moyenne globale.',
            sleep_sweet_sub:    'Bas\u00e9 sur {n} nuits dans cette plage.',
            energy_mood_high:   'Ton \u00e9nergie et ton humeur \u00e9voluent de concert ({strength} corr\u00e9lation).',
            energy_mood_low:    'Curieux\u00a0: ton \u00e9nergie et ton humeur ne s\u2019alignent pas toujours \u2014 vaut la peine d\u2019explorer.',
            energy_mood_sub:    'Observ\u00e9 sur {n} jours avec les deux m\u00e9triques.',
            energy_avg_high:    'Ton \u00e9nergie est en moyenne de {n}/10 \u2014 une bonne base.',
            energy_avg_mid:     'Ton \u00e9nergie est en moyenne de {n}/10 \u2014 mod\u00e9r\u00e9e et g\u00e9rable.',
            energy_avg_low:     'Ton \u00e9nergie est en moyenne de {n}/10 \u2014 en dessous de l\u2019optimal.',
            energy_avg_sub_low: 'L\u2019activit\u00e9, la qualit\u00e9 du sommeil et l\u2019hydratation sont souvent les leviers cl\u00e9s.',
            energy_avg_sub_ok:  'Continue \u00e0 tracker pour voir quels jours tu te sens le plus \u00e9nergis\u00e9.',
            energy_trend_up:    '\u00c9nergie en hausse cette semaine (+{n} vs moyenne).',
            energy_trend_dn:    '\u00c9nergie en baisse cette semaine ({n} vs moyenne).',
            energy_trend_up_sub:'Quoi que tu fasses \u2014 continue.',
            energy_trend_dn_sub:'Surveille les d\u00e9ficits de sommeil ou le stress accru.',
            energy_sleep_link:  'Plus de sommeil tend \u00e0 aller de pair avec plus d\u2019\u00e9nergie chez toi.',
            energy_sleep_link_sub: 'Apr\u00e8s les nuits avec plus de sommeil, ton \u00e9nergie est en moyenne {n} points plus haute.',
            energy_sleep_nolink:'Ton \u00e9nergie ne suit pas \u00e9troitement ta dur\u00e9e de sommeil.',
            energy_sleep_nolink_sub: 'D\u2019autres facteurs \u2014 activit\u00e9, stress, timing \u2014 comptent peut-\u00eatre plus pour toi.',
            strength_high: '\u00e9lev\u00e9e',
            strength_moderate: 'mod\u00e9r\u00e9e',
        },
        es: {
            sleep_avg_low: 'Tu sue\u00f1o promedio es de {n} horas \u2014 por debajo de las 7\u20139h recomendadas.', sleep_avg_low_sub: 'Incluso peque\u00f1as mejoras tienden a elevar el \u00e1nimo al d\u00eda siguiente.', sleep_avg_ok: 'Tu sue\u00f1o promedio es de {n} horas \u2014 dentro de un rango saludable.', sleep_avg_ok_sub: 'La consistencia importa m\u00e1s que la duraci\u00f3n; intenta acostarte a \u00b130 minutos.', sleep_trend_up: 'Sue\u00f1o mejorado {n}h esta semana vs tu promedio.', sleep_trend_up_sub: 'Sigue as\u00ed \u2014 el descanso sostenido genera resiliencia.', sleep_trend_dn: 'Sue\u00f1o reducido {n}h esta semana vs tu promedio.', sleep_trend_dn_sub: 'Comprueba si las pantallas nocturnas o el estr\u00e9s acortan tu sue\u00f1o.', sleep_sweet: 'Las noches de 7\u20138,5h son tu punto dulce: \u00e1nimo promedio {avg} \u2014 {diff} sobre tu media global.', sleep_sweet_sub: 'Basado en {n} noches en ese rango.', energy_mood_high: 'Tu energ\u00eda y tu \u00e1nimo evolucionan juntos ({strength} correlaci\u00f3n).', energy_mood_low: 'Curioso: energ\u00eda y \u00e1nimo no siempre se alinean \u2014 vale la pena explorar por qu\u00e9.', energy_mood_sub: 'Observado en {n} d\u00edas con ambas m\u00e9tricas.', energy_avg_high: 'Tu energ\u00eda promedia {n}/10 \u2014 una base s\u00f3lida.', energy_avg_mid: 'Tu energ\u00eda promedia {n}/10 \u2014 moderada y manejable.', energy_avg_low: 'Tu energ\u00eda promedia {n}/10 \u2014 menor de lo \u00f3ptimo.', energy_avg_sub_low: 'Actividad, calidad del sue\u00f1o e hidrataci\u00f3n suelen ser las palancas clave.', energy_avg_sub_ok: 'Sigue rastreando para ver qu\u00e9 d\u00edas te sientes m\u00e1s energ\u00e9tico.', energy_trend_up: 'Energ\u00eda en alza esta semana (+{n} vs promedio).', energy_trend_dn: 'Energ\u00eda baj\u00f3 esta semana ({n} vs promedio).', energy_trend_up_sub: 'Sea lo que sea que est\u00e1s haciendo \u2014 contin\u00faa.', energy_trend_dn_sub: 'Vigila los d\u00e9ficits de sue\u00f1o o el estr\u00e9s elevado.', energy_sleep_link: 'M\u00e1s sue\u00f1o suele ir acompa\u00f1ado de m\u00e1s energ\u00eda para ti.', energy_sleep_link_sub: 'Despu\u00e9s de noches con m\u00e1s sue\u00f1o, tu energ\u00eda promedia {n} puntos m\u00e1s alta.', energy_sleep_nolink: 'Tu energ\u00eda no sigue de cerca tu duraci\u00f3n de sue\u00f1o.', energy_sleep_nolink_sub: 'Otros factores \u2014 actividad, estr\u00e9s o timing \u2014 pueden importar m\u00e1s para ti.', strength_high: 'alta', strength_moderate: 'moderada',
        },
        ar: {
            sleep_avg_low: '\u0645\u062a\u0648\u0633\u0637 \u0646\u0648\u0645\u0643 {n} \u0633\u0627\u0639\u0627\u062a \u2014 \u062f\u0648\u0646 \u0627\u0644\u0645\u0648\u0635\u0649 7\u20139 \u0633\u0627\u0639\u0627\u062a.', sleep_avg_low_sub: '\u062d\u062a\u0649 \u062a\u062d\u0633\u064a\u0646\u0627\u062a \u0635\u063a\u064a\u0631\u0629 \u062a\u0631\u0641\u0639 \u0627\u0644\u0645\u0632\u0627\u062c \u0641\u064a \u0627\u0644\u064a\u0648\u0645 \u0627\u0644\u062a\u0627\u0644\u064a.', sleep_avg_ok: '\u0645\u062a\u0648\u0633\u0637 \u0646\u0648\u0645\u0643 {n} \u0633\u0627\u0639\u0627\u062a \u2014 \u0636\u0645\u0646 \u0646\u0637\u0627\u0642 \u0635\u062d\u064a.', sleep_avg_ok_sub: '\u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0645 \u0623\u0647\u0645 \u0645\u0646 \u0627\u0644\u0645\u062f\u0629\u061b \u062d\u0627\u0648\u0644 \u0627\u0644\u0646\u0648\u0645 \u0641\u064a \u0648\u0642\u062a \u0645\u062a\u0642\u0627\u0631\u0628 \u062f\u0627\u0626\u0645\u064b\u0627.', sleep_trend_up: '\u062a\u062d\u0633\u064f\u0651\u0646 \u0627\u0644\u0646\u0648\u0645 {n} \u0633\u0627\u0639\u0629 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', sleep_trend_up_sub: '\u0648\u0627\u0635\u0644 \u2014 \u0627\u0644\u0631\u0627\u062d\u0629 \u0627\u0644\u0645\u0646\u062a\u0638\u0645\u0629 \u062a\u0628\u0646\u064a \u0627\u0644\u0645\u0631\u0648\u0646\u0629.', sleep_trend_dn: '\u0627\u0646\u062e\u0641\u0636 \u0627\u0644\u0646\u0648\u0645 {n} \u0633\u0627\u0639\u0629 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.', sleep_trend_dn_sub: '\u062a\u062d\u0642\u0642 \u0645\u0645\u0627 \u0625\u0630\u0627 \u0643\u0627\u0646\u062a \u0627\u0644\u0634\u0627\u0634\u0627\u062a \u0627\u0644\u0645\u062a\u0623\u062e\u0631\u0629 \u0623\u0648 \u0627\u0644\u062a\u0648\u062a\u0631 \u064a\u0642\u0644\u0635\u0627\u0646 \u0646\u0648\u0645\u0643.', sleep_sweet: '\u0644\u064a\u0627\u0644\u064a 7\u20138\u00d45 \u0633\u0627\u0639\u0627\u062a \u0647\u064a \u0627\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u062b\u0627\u0644\u064a: \u0645\u0632\u0627\u062c {avg} \u2014 \u0628\u0641\u0627\u0631\u0642 {diff} \u0641\u0648\u0642 \u0645\u062a\u0648\u0633\u0637\u0643 \u0627\u0644\u0639\u0627\u0645.', sleep_sweet_sub: '\u0628\u0646\u0627\u0621\u064b \u0639\u0644\u0649 {n} \u0644\u064a\u0644\u0629 \u0641\u064a \u0647\u0630\u0627 \u0627\u0644\u0646\u0637\u0627\u0642.', energy_mood_high: '\u0637\u0627\u0642\u062a\u0643 \u0648\u0645\u0632\u0627\u062c\u0643 \u064a\u062a\u0637\u0648\u0631\u0627\u0646 \u0628\u0627\u0646\u0633\u062c\u0627\u0645 ({strength}).', energy_mood_low: '\u0645\u062b\u064a\u0631 \u0644\u0644\u0627\u0647\u062a\u0645\u0627\u0645: \u0637\u0627\u0642\u062a\u0643 \u0648\u0645\u0632\u0627\u062c\u0643 \u0644\u0627 \u064a\u062a\u0648\u0627\u0641\u0642\u0627\u0646 \u062f\u0627\u0626\u0645\u064b\u0627.', energy_mood_sub: '\u0644\u0648\u062d\u0638 \u0639\u0628\u0631 {n} \u0623\u064a\u0627\u0645.', energy_avg_high: '\u0637\u0627\u0642\u062a\u0643 \u0641\u064a \u0627\u0644\u0645\u062a\u0648\u0633\u0637 {n}/10 \u2014 \u0642\u0627\u0639\u062f\u0629 \u0642\u0648\u064a\u0629.', energy_avg_mid: '\u0637\u0627\u0642\u062a\u0643 \u0641\u064a \u0627\u0644\u0645\u062a\u0648\u0633\u0637 {n}/10 \u2014 \u0645\u0639\u062a\u062f\u0644\u0629.', energy_avg_low: '\u0637\u0627\u0642\u062a\u0643 \u0641\u064a \u0627\u0644\u0645\u062a\u0648\u0633\u0637 {n}/10 \u2014 \u0623\u0642\u0644 \u0645\u0646 \u0627\u0644\u0645\u062b\u0627\u0644\u064a.', energy_avg_sub_low: '\u0627\u0644\u0646\u0634\u0627\u0637\u060c \u062c\u0648\u062f\u0629 \u0627\u0644\u0646\u0648\u0645\u060c \u0648\u0627\u0644\u062a\u0631\u0637\u064a\u0628 \u0647\u064a \u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u0623\u0643\u062b\u0631 \u062a\u0623\u062b\u064a\u0631\u064b\u0627.', energy_avg_sub_ok: '\u0648\u0627\u0635\u0644 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0644\u0645\u0639\u0631\u0641\u0629 \u0623\u0643\u062b\u0631 \u0623\u064a\u0627\u0645\u0643 \u0637\u0627\u0642\u0629\u064b.', energy_trend_up: '\u0627\u0644\u0637\u0627\u0642\u0629 \u0641\u064a \u0627\u0631\u062a\u0641\u0627\u0639 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 (+{n} \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u062a\u0648\u0633\u0637).', energy_trend_dn: '\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0646\u062e\u0641\u0636\u062a \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639 ({n} \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u062a\u0648\u0633\u0637).', energy_trend_up_sub: '\u0645\u0647\u0645\u0627 \u0643\u0646\u062a \u062a\u0641\u0639\u0644 \u2014 \u0648\u0627\u0635\u0644.', energy_trend_dn_sub: '\u0627\u0646\u062a\u0628\u0647 \u0644\u0639\u062c\u0632 \u0627\u0644\u0646\u0648\u0645 \u0623\u0648 \u0627\u0644\u062a\u0648\u062a\u0631 \u0627\u0644\u0645\u062a\u0632\u0627\u064a\u062f.', energy_sleep_link: '\u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0646\u0648\u0645 \u064a\u0635\u0627\u062d\u0628\u0647 \u0639\u0627\u062f\u0629\u064b \u0645\u0632\u064a\u062f \u0645\u0646 \u0627\u0644\u0637\u0627\u0642\u0629 \u0644\u062f\u064a\u0643.', energy_sleep_link_sub: '\u0628\u0639\u062f \u0644\u064a\u0627\u0644\u064a \u0646\u0648\u0645 \u0623\u0637\u0648\u0644\u060c \u062a\u0643\u0648\u0646 \u0637\u0627\u0642\u062a\u0643 \u0623\u0639\u0644\u0649 \u0628\u0645\u062a\u0648\u0633\u0637 {n} \u0646\u0642\u0627\u0637.', energy_sleep_nolink: '\u0637\u0627\u0642\u062a\u0643 \u0644\u0627 \u062a\u062a\u0628\u0639 \u0645\u062f\u0629 \u0646\u0648\u0645\u0643 \u0639\u0646 \u0643\u062b\u0628.', energy_sleep_nolink_sub: '\u0639\u0648\u0627\u0645\u0644 \u0623\u062e\u0631\u0649 \u0642\u062f \u062a\u0643\u0648\u0646 \u0623\u0643\u062b\u0631 \u062a\u0623\u062b\u064a\u0631\u064b\u0627 \u0628\u0627\u0644\u0646\u0633\u0628\u0629 \u0644\u0643.', strength_high: '\u0639\u0627\u0644\u064a', strength_moderate: '\u0645\u062a\u0648\u0633\u0637',
        },
    };

    /* Auto-fill missing SE keys from English */
    ['de','fr','es','it','pt','nl','pl','ru','tr','ja','zh','hi','ar'].forEach(function (l) {
        if (!SE[l]) SE[l] = {};
        Object.keys(SE.en).forEach(function (k) { if (SE[l][k] == null) SE[l][k] = SE.en[k]; });
    });

    function se(key, vars) {
        var l = loc();
        var row = SE[l] || SE.en;
        var val = (row[key] != null) ? row[key] : (SE.en[key] || key);
        if (!vars) return val;
        return val.replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ''; });
    }

    onReady(function () {

        /* ── Replace buildSleepInsights ──────────────────────────── */
        if (typeof window.buildSleepInsights === 'function' && !window.buildSleepInsights._i18nPatched) {
            window.buildSleepInsights = function (entries) {
                var dates = Object.keys(entries).sort();
                if (dates.length < 7) return null;
                var sleepNums = [];
                dates.forEach(function (d) {
                    var e = entries[d];
                    var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
                    if (typeof s === 'number' && !isNaN(s) && s > 0) sleepNums.push(s);
                });
                if (sleepNums.length < 5) return null;
                var safeAvg = function (arr) { return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : null; };
                var allAvg    = safeAvg(sleepNums);
                var recentAvg = safeAvg(sleepNums.slice(-7));
                var trend     = recentAvg - allAvg;
                var insights  = [];
                if (allAvg < 6.5) {
                    insights.push({ icon: '\u26a0\ufe0f', text: se('sleep_avg_low', { n: allAvg.toFixed(1) }), sub: se('sleep_avg_low_sub') });
                } else {
                    insights.push({ icon: '\u2728', text: se('sleep_avg_ok', { n: allAvg.toFixed(1) }), sub: se('sleep_avg_ok_sub') });
                }
                if (Math.abs(trend) > 0.4) {
                    insights.push({
                        icon: trend > 0 ? '\ud83d\udcc8' : '\ud83d\udcc9',
                        text: trend > 0 ? se('sleep_trend_up', { n: trend.toFixed(1) }) : se('sleep_trend_dn', { n: Math.abs(trend).toFixed(1) }),
                        sub:  trend > 0 ? se('sleep_trend_up_sub') : se('sleep_trend_dn_sub')
                    });
                }
                var withMood = dates.filter(function (d) { var e = entries[d]; var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep); return typeof s === 'number' && !isNaN(s) && typeof e.mood === 'number' && !isNaN(e.mood); });
                var sweetSpot = withMood.filter(function (d) { var s = entries[d].sleepTotal != null ? entries[d].sleepTotal : entries[d].sleep; return s >= 7 && s <= 8.5; });
                if (sweetSpot.length >= 3) {
                    var ssAvgMood  = safeAvg(sweetSpot.map(function (d) { return entries[d].mood; }));
                    var allAvgMood = safeAvg(withMood.map(function (d) { return entries[d].mood; }));
                    if (ssAvgMood && allAvgMood && (ssAvgMood - allAvgMood) > 0.15) {
                        insights.push({ icon: '\ud83c\udfaf', text: se('sleep_sweet', { avg: ssAvgMood.toFixed(1), diff: (ssAvgMood - allAvgMood).toFixed(1) }), sub: se('sleep_sweet_sub', { n: sweetSpot.length }) });
                    }
                }
                return insights.slice(0, 3);
            };
            window.buildSleepInsights._i18nPatched = true;
        }

        /* ── Replace buildEnergyInsights ─────────────────────────── */
        if (typeof window.buildEnergyInsights === 'function' && !window.buildEnergyInsights._i18nPatched) {
            window.buildEnergyInsights = function (entries) {
                var dates = Object.keys(entries).sort();
                if (dates.length < 7) return null;
                var energyDates = dates.filter(function (d) { return entries[d] && typeof entries[d].energy === 'number' && !isNaN(entries[d].energy); });
                if (energyDates.length < 5) return null;
                var safeAvg = function (arr) { return arr.length ? arr.reduce(function (a, b) { return a + b; }, 0) / arr.length : null; };
                var energies  = energyDates.map(function (d) { return entries[d].energy; });
                var allAvg    = safeAvg(energies);
                var recentAvg = safeAvg(energies.slice(-7));
                var trend     = recentAvg - allAvg;
                var insights  = [];
                var paired = energyDates.filter(function (d) { return typeof entries[d].mood === 'number' && !isNaN(entries[d].mood); });
                if (paired.length >= 7) {
                    var xA = paired.map(function (d) { return entries[d].energy; });
                    var yA = paired.map(function (d) { return entries[d].mood; });
                    var n = xA.length, sx = 0, sy = 0, sxy = 0, sx2 = 0;
                    for (var i = 0; i < n; i++) { sx += xA[i]; sy += yA[i]; sxy += xA[i] * yA[i]; sx2 += xA[i] * xA[i]; }
                    var slope = (n * sx2 - sx * sx) ? (n * sxy - sx * sy) / (n * sx2 - sx * sx) : 0;
                    if (Math.abs(slope) > 0.25) {
                        var strength = Math.abs(slope) > 0.6 ? se('strength_high') : se('strength_moderate');
                        insights.push({ icon: '\u26a1', text: slope > 0 ? se('energy_mood_high', { strength: strength }) : se('energy_mood_low'), sub: se('energy_mood_sub', { n: n }) });
                    }
                }
                var avgText = allAvg >= 7 ? se('energy_avg_high', { n: allAvg.toFixed(1) }) : allAvg >= 5 ? se('energy_avg_mid', { n: allAvg.toFixed(1) }) : se('energy_avg_low', { n: allAvg.toFixed(1) });
                var avgSub  = allAvg < 5 ? se('energy_avg_sub_low') : se('energy_avg_sub_ok');
                insights.push({ icon: allAvg >= 6.5 ? '\u26a1' : '\ud83d\udd0b', text: avgText, sub: avgSub });
                if (Math.abs(trend) > 0.4) {
                    insights.push({ icon: trend > 0 ? '\ud83d\udcc8' : '\ud83d\udcc9', text: trend > 0 ? se('energy_trend_up', { n: trend.toFixed(1) }) : se('energy_trend_dn', { n: trend.toFixed(1) }), sub: trend < 0 ? se('energy_trend_dn_sub') : se('energy_trend_up_sub') });
                }
                var sleepNums2 = [], energyNums2 = [];
                dates.forEach(function (d) { var e = entries[d]; var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep); var en = e && e.energy; if (typeof s === 'number' && !isNaN(s) && typeof en === 'number' && !isNaN(en)) { sleepNums2.push(s); energyNums2.push(en); } });
                if (sleepNums2.length >= 7) {
                    var paired2 = sleepNums2.map(function (s, i) { return { x: s, y: energyNums2[i] }; });
                    var sorted2 = paired2.slice().sort(function (a, b) { return a.x - b.x; });
                    var half = Math.floor(sorted2.length / 2);
                    var lowE  = safeAvg(sorted2.slice(0, half).map(function (p) { return p.y; }));
                    var highE = safeAvg(sorted2.slice(Math.ceil(sorted2.length / 2)).map(function (p) { return p.y; }));
                    if (lowE != null && highE != null) {
                        var diff2 = highE - lowE;
                        if (diff2 > 0.8)       insights.push({ icon: '\ud83d\udd17', text: se('energy_sleep_link'), sub: se('energy_sleep_link_sub', { n: diff2.toFixed(1) }) });
                        else if (diff2 < -0.8) insights.push({ icon: '\ud83e\udd14', text: se('energy_sleep_nolink'), sub: se('energy_sleep_nolink_sub') });
                    }
                }
                return insights.slice(0, 3);
            };
            window.buildEnergyInsights._i18nPatched = true;
        }

    }, 700);

    console.log('[Aura i18n Runtime] All JS-generated strings patched — insights, charts, narrative, daily summary, toasts, sleep/energy strips.');
})();
