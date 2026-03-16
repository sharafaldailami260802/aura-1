/* ═══════════════════════════════════════════════════════════════════════
   improvements_i18n_final.js  —  Definitive i18n patch for Aura Mood
   ───────────────────────────────────────────────────────────────────────
   Covers every English string that bypasses data-i18n attributes:
   • Dashboard greeting / narrative (steady, tag, streak sentences)
   • Chart dataset labels & axis titles (mood velocity, seasonal)
   • Month abbreviations (via Intl — no hardcoded arrays)
   • Chart tooltip callbacks (mood improved / dipped)
   • Annotation chips (Latest vs avg, Range)
   • Insights "What your data shows" heading
   • Insight section headings (Sleep / Activity / Stability / Tags)
   • Daily summary — simplified but fully translated for non-EN
   • All toast messages (language updated, date format, time format)
   • Exposes window.__t() and window.getTranslation() helpers
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';
    if (window._auraI18nMaster) return; // i18n.js is authoritative

    /* ─────────────────────────────────────────────────────────────────
       §1.  Complete dynamic-string translation table
       Keys not present in a locale fall back to English.
    ───────────────────────────────────────────────────────────────── */
    var TD = {

/* ═══════════ ENGLISH ═══════════ */
en: {
    /* Dashboard narrative */
    narrative_steady:   'Your mood has been steady this week.',
    no_checkin_today:   'No check-in yet today.',
    tagging_recently:   'You\'ve been tagging \u201c{tag}\u201d a lot lately.',
    streak_days:        '{n}-day streak \u2014 keep it up.',
    streak_day:         'Day {n} of your streak.',
    /* Charts */
    chart_avg_mood_month:   'Average Mood by Month',
    chart_mood_axis:        'Mood change (day-over-day)',
    chart_mood_axis_short:  'Change',
    chart_mood_improved:    'Mood improved by {n} point{s}',
    chart_mood_dipped:      'Mood dipped by {n} point{s}',
    chart_mood_1_10:        'Mood (1\u201310)',
    chip_latest:            'Latest: {delta} vs avg',
    chip_range:             'Range {min}\u2013{max}',
    /* Insights */
    insights_what_data_shows: 'What your data shows',
    insight_sleep_heading:    'Sleep Insights',
    insight_activity_heading: 'Activity Insights',
    insight_stability_heading:'Mood Stability Insights',
    insight_tags_heading:     'Tag Insights',
    /* Daily summary */
    ds_mood:       'Mood: {v}/10',
    ds_sleep:      'Sleep: {v} hrs',
    ds_energy:     'Energy: {v}/10',
    ds_above_avg:  'Slightly above your usual range.',
    ds_below_avg:  'Slightly below your usual range.',
    ds_on_avg:     'Within your typical range.',
    ds_first:      'First entry — great start.',
    ds_tags:       'Tags: {list}.',
    ds_activities: 'Activities: {list}.',
    ds_journal:    'A journal note was saved.',
    ds_multi_sleep:'Sleep was split across multiple segments.',
    /* Toasts */
    toast_lang:      'Language updated \u2713',
    toast_date_fmt:  'Date format updated \u2713',
    toast_time_fmt:  'Time format updated \u2713',
    toast_saved:     'Saved \u2713',
    /* Report */
    report_best_day:      'Best day',
    report_challenging:   'Challenging day (lowest mood)',
},

/* ═══════════ GERMAN ═══════════ */
de: {
    narrative_steady:   'Deine Stimmung war diese Woche stabil.',
    no_checkin_today:   'Noch kein Check-in heute.',
    tagging_recently:   'Du verwendest in letzter Zeit oft den Tag \u201e{tag}\u201c.',
    streak_days:        '{n} Tage in Folge \u2014 weiter so!',
    streak_day:         'Tag {n} deiner Serie.',
    chart_avg_mood_month:   'Durchschnittliche Stimmung pro Monat',
    chart_mood_axis:        'Stimmungsver\u00e4nderung (t\u00e4glich)',
    chart_mood_axis_short:  'Ver\u00e4nderung',
    chart_mood_improved:    'Stimmung um {n} Punkt{s} gestiegen',
    chart_mood_dipped:      'Stimmung um {n} Punkt{s} gesunken',
    chart_mood_1_10:        'Stimmung (1\u201310)',
    chip_latest:            'Aktuell: {delta} vs. \u00d8',
    chip_range:             'Spanne {min}\u2013{max}',
    insights_what_data_shows: 'Was deine Daten zeigen',
    insight_sleep_heading:    'Schlaf-Einblicke',
    insight_activity_heading: 'Aktivit\u00e4ts-Einblicke',
    insight_stability_heading:'Stimmungsstabilit\u00e4t',
    insight_tags_heading:     'Tag-Einblicke',
    ds_mood:       'Stimmung: {v}/10',
    ds_sleep:      'Schlaf: {v} Std.',
    ds_energy:     'Energie: {v}/10',
    ds_above_avg:  'Etwas \u00fcber deinem gew\u00f6hnlichen Bereich.',
    ds_below_avg:  'Etwas unter deinem gew\u00f6hnlichen Bereich.',
    ds_on_avg:     'Im \u00fcblichen Bereich.',
    ds_first:      'Erster Eintrag \u2014 guter Start.',
    ds_tags:       'Tags: {list}.',
    ds_activities: 'Aktivit\u00e4ten: {list}.',
    ds_journal:    'Ein Tagebucheintrag wurde gespeichert.',
    ds_multi_sleep:'Der Schlaf war in mehrere Phasen aufgeteilt.',
    toast_lang:      'Sprache aktualisiert \u2713',
    toast_date_fmt:  'Datumsformat aktualisiert \u2713',
    toast_time_fmt:  'Zeitformat aktualisiert \u2713',
    toast_saved:     'Gespeichert \u2713',
    report_best_day:    'Bester Tag',
    report_challenging: 'Schwieriger Tag (niedrigste Stimmung)',
},

/* ═══════════ FRENCH ═══════════ */
fr: {
    narrative_steady:   'Ton humeur est rest\u00e9e stable cette semaine.',
    no_checkin_today:   'Pas encore de bilan aujourd\u2019hui.',
    tagging_recently:   'Tu utilises souvent le tag \u00ab\u00a0{tag}\u00a0\u00bb ces derniers temps.',
    streak_days:        '{n} jours d\u2019affil\u00e9e \u2014 continue\u00a0!',
    streak_day:         'Jour {n} de ta s\u00e9rie.',
    chart_avg_mood_month:   'Humeur moyenne par mois',
    chart_mood_axis:        'Variation d\u2019humeur (jour apr\u00e8s jour)',
    chart_mood_axis_short:  'Variation',
    chart_mood_improved:    'Humeur en hausse de {n} point{s}',
    chart_mood_dipped:      'Humeur en baisse de {n} point{s}',
    chart_mood_1_10:        'Humeur (1\u201310)',
    chip_latest:            'R\u00e9cent\u00a0: {delta} vs moy.',
    chip_range:             '\u00c9cart {min}\u2013{max}',
    insights_what_data_shows: 'Ce que tes donn\u00e9es r\u00e9v\u00e8lent',
    insight_sleep_heading:    'Sommeil',
    insight_activity_heading: 'Activit\u00e9s',
    insight_stability_heading:'Stabilit\u00e9 \u00e9motionnelle',
    insight_tags_heading:     '\u00c9tiquettes',
    ds_mood:       'Humeur\u00a0: {v}/10',
    ds_sleep:      'Sommeil\u00a0: {v}\u00a0h',
    ds_energy:     '\u00c9nergie\u00a0: {v}/10',
    ds_above_avg:  'L\u00e9g\u00e8rement au-dessus de ta moyenne.',
    ds_below_avg:  'L\u00e9g\u00e8rement en dessous de ta moyenne.',
    ds_on_avg:     'Dans ta plage habituelle.',
    ds_first:      'Premi\u00e8re entr\u00e9e \u2014 bon d\u00e9but\u00a0!',
    ds_tags:       '\u00c9tiquettes\u00a0: {list}.',
    ds_activities: 'Activit\u00e9s\u00a0: {list}.',
    ds_journal:    'Une note de journal a \u00e9t\u00e9 enregistr\u00e9e.',
    ds_multi_sleep:'Le sommeil \u00e9tait fractionn\u00e9 en plusieurs p\u00e9riodes.',
    toast_lang:      'Langue mise \u00e0 jour \u2713',
    toast_date_fmt:  'Format de date mis \u00e0 jour \u2713',
    toast_time_fmt:  'Format d\u2019heure mis \u00e0 jour \u2713',
    toast_saved:     'Enregistr\u00e9 \u2713',
    report_best_day:    'Meilleure journ\u00e9e',
    report_challenging: 'Journ\u00e9e difficile (humeur la plus basse)',
},

/* ═══════════ SPANISH ═══════════ */
es: {
    narrative_steady:   'Tu estado de \u00e1nimo ha sido estable esta semana.',
    no_checkin_today:   'A\u00fan no hay registro hoy.',
    tagging_recently:   'Has usado mucho la etiqueta \u00ab{tag}\u00bb \u00faltimamente.',
    streak_days:        '{n} d\u00edas seguidos \u2014 \u00a1sigue as\u00ed!',
    streak_day:         'D\u00eda {n} de tu racha.',
    chart_avg_mood_month:   'Estado de \u00e1nimo medio por mes',
    chart_mood_axis:        'Cambio de \u00e1nimo (d\u00eda a d\u00eda)',
    chart_mood_axis_short:  'Cambio',
    chart_mood_improved:    '\u00c1nimo mejor\u00f3 {n} punto{s}',
    chart_mood_dipped:      '\u00c1nimo baj\u00f3 {n} punto{s}',
    chart_mood_1_10:        '\u00c1nimo (1\u201310)',
    chip_latest:            '\u00daltimo: {delta} vs prom.',
    chip_range:             'Rango {min}\u2013{max}',
    insights_what_data_shows: 'Lo que muestran tus datos',
    insight_sleep_heading:    'Sue\u00f1o',
    insight_activity_heading: 'Actividad',
    insight_stability_heading:'Estabilidad an\u00edmica',
    insight_tags_heading:     'Etiquetas',
    ds_mood:       '\u00c1nimo: {v}/10',
    ds_sleep:      'Sue\u00f1o: {v} h',
    ds_energy:     'Energ\u00eda: {v}/10',
    ds_above_avg:  'Ligeramente por encima de tu promedio.',
    ds_below_avg:  'Ligeramente por debajo de tu promedio.',
    ds_on_avg:     'Dentro de tu rango habitual.',
    ds_first:      'Primera entrada \u2014 \u00a1buen comienzo!',
    ds_tags:       'Etiquetas: {list}.',
    ds_activities: 'Actividades: {list}.',
    ds_journal:    'Se guard\u00f3 una nota en el diario.',
    ds_multi_sleep:'El sue\u00f1o estuvo dividido en varios tramos.',
    toast_lang:      'Idioma actualizado \u2713',
    toast_date_fmt:  'Formato de fecha actualizado \u2713',
    toast_time_fmt:  'Formato de hora actualizado \u2713',
    toast_saved:     'Guardado \u2713',
    report_best_day:    'Mejor d\u00eda',
    report_challenging: 'D\u00eda dif\u00edcil (menor \u00e1nimo)',
},

/* ═══════════ ITALIAN ═══════════ */
it: {
    narrative_steady:   'Il tuo umore \u00e8 rimasto stabile questa settimana.',
    no_checkin_today:   'Nessun check-in ancora oggi.',
    tagging_recently:   'Hai usato spesso il tag \u201c{tag}\u201d ultimamente.',
    streak_days:        '{n} giorni di fila \u2014 continua cos\u00ec!',
    streak_day:         'Giorno {n} della tua serie.',
    chart_avg_mood_month:   'Umore medio per mese',
    chart_mood_axis:        'Variazione umore (giorno per giorno)',
    chart_mood_axis_short:  'Variazione',
    chart_mood_improved:    'Umore migliorato di {n} punto{s}',
    chart_mood_dipped:      'Umore calato di {n} punto{s}',
    chart_mood_1_10:        'Umore (1\u201310)',
    chip_latest:            'Recente: {delta} vs media',
    chip_range:             'Intervallo {min}\u2013{max}',
    insights_what_data_shows: 'Cosa mostrano i tuoi dati',
    insight_sleep_heading:    'Sonno',
    insight_activity_heading: 'Attivit\u00e0',
    insight_stability_heading:'Stabilit\u00e0 dell\u2019umore',
    insight_tags_heading:     'Tag',
    ds_mood:       'Umore: {v}/10',
    ds_sleep:      'Sonno: {v} ore',
    ds_energy:     'Energia: {v}/10',
    ds_above_avg:  'Leggermente sopra la tua media.',
    ds_below_avg:  'Leggermente sotto la tua media.',
    ds_on_avg:     'Nel tuo intervallo abituale.',
    ds_first:      'Prima registrazione \u2014 ottimo inizio!',
    ds_tags:       'Tag: {list}.',
    ds_activities: 'Attivit\u00e0: {list}.',
    ds_journal:    '\u00c8 stata salvata una nota nel diario.',
    ds_multi_sleep:'Il sonno era suddiviso in pi\u00f9 segmenti.',
    toast_lang:      'Lingua aggiornata \u2713',
    toast_date_fmt:  'Formato data aggiornato \u2713',
    toast_time_fmt:  'Formato ora aggiornato \u2713',
    toast_saved:     'Salvato \u2713',
    report_best_day:    'Giorno migliore',
    report_challenging: 'Giorno difficile (umore pi\u00f9 basso)',
},

/* ═══════════ PORTUGUESE ═══════════ */
pt: {
    narrative_steady:   'O seu humor esteve est\u00e1vel esta semana.',
    no_checkin_today:   'Nenhum registo hoje ainda.',
    tagging_recently:   'Tem usado muito a etiqueta \u201c{tag}\u201d \u00faltimamente.',
    streak_days:        '{n} dias seguidos \u2014 continue assim!',
    streak_day:         'Dia {n} da sua sequ\u00eancia.',
    chart_avg_mood_month:   'Humor m\u00e9dio por m\u00eas',
    chart_mood_axis:        'Varia\u00e7\u00e3o de humor (dia a dia)',
    chart_mood_axis_short:  'Varia\u00e7\u00e3o',
    chart_mood_improved:    'Humor melhorou {n} ponto{s}',
    chart_mood_dipped:      'Humor caiu {n} ponto{s}',
    chart_mood_1_10:        'Humor (1\u201310)',
    chip_latest:            '\u00daltimo: {delta} vs m\u00e9d.',
    chip_range:             'Intervalo {min}\u2013{max}',
    insights_what_data_shows: 'O que os seus dados mostram',
    insight_sleep_heading:    'Sono',
    insight_activity_heading: 'Atividade',
    insight_stability_heading:'Estabilidade emocional',
    insight_tags_heading:     'Etiquetas',
    ds_mood:       'Humor: {v}/10',
    ds_sleep:      'Sono: {v} h',
    ds_energy:     'Energia: {v}/10',
    ds_above_avg:  'Ligeiramente acima da sua m\u00e9dia.',
    ds_below_avg:  'Ligeiramente abaixo da sua m\u00e9dia.',
    ds_on_avg:     'Dentro do seu intervalo habitual.',
    ds_first:      'Primeiro registo \u2014 \u00f3timo come\u00e7o!',
    ds_tags:       'Etiquetas: {list}.',
    ds_activities: 'Atividades: {list}.',
    ds_journal:    'Foi guardada uma nota no di\u00e1rio.',
    ds_multi_sleep:'O sono foi dividido em v\u00e1rios segmentos.',
    toast_lang:      'Idioma atualizado \u2713',
    toast_date_fmt:  'Formato de data atualizado \u2713',
    toast_time_fmt:  'Formato de hora atualizado \u2713',
    toast_saved:     'Guardado \u2713',
    report_best_day:    'Melhor dia',
    report_challenging: 'Dia dif\u00edcil (humor mais baixo)',
},

/* ═══════════ DUTCH ═══════════ */
nl: {
    narrative_steady:   'Je stemming was stabiel deze week.',
    no_checkin_today:   'Nog geen check-in vandaag.',
    tagging_recently:   'Je gebruikt de tag \u201e{tag}\u201c de laatste tijd veel.',
    streak_days:        '{n} dagen op rij \u2014 ga zo door!',
    streak_day:         'Dag {n} van je reeks.',
    chart_avg_mood_month:   'Gemiddelde stemming per maand',
    chart_mood_axis:        'Stemmingsverschil (dag op dag)',
    chart_mood_axis_short:  'Verschil',
    chart_mood_improved:    'Stemming verbeterd met {n} punt{s}',
    chart_mood_dipped:      'Stemming gedaald met {n} punt{s}',
    chart_mood_1_10:        'Stemming (1\u201310)',
    chip_latest:            'Recent: {delta} vs gem.',
    chip_range:             'Bereik {min}\u2013{max}',
    insights_what_data_shows: 'Wat je gegevens laten zien',
    insight_sleep_heading:    'Slaap',
    insight_activity_heading: 'Activiteit',
    insight_stability_heading:'Stemmingsstabiliteit',
    insight_tags_heading:     'Tags',
    ds_mood:       'Stemming: {v}/10',
    ds_sleep:      'Slaap: {v} uur',
    ds_energy:     'Energie: {v}/10',
    ds_above_avg:  'Iets boven je gebruikelijke bereik.',
    ds_below_avg:  'Iets onder je gebruikelijke bereik.',
    ds_on_avg:     'Binnen je gebruikelijke bereik.',
    ds_first:      'Eerste invoer \u2014 goed begin!',
    ds_tags:       'Tags: {list}.',
    ds_activities: 'Activiteiten: {list}.',
    ds_journal:    'Er is een dagboeknotitie opgeslagen.',
    ds_multi_sleep:'De slaap was verdeeld over meerdere segmenten.',
    toast_lang:      'Taal bijgewerkt \u2713',
    toast_date_fmt:  'Datumnotatie bijgewerkt \u2713',
    toast_time_fmt:  'Tijdnotatie bijgewerkt \u2713',
    toast_saved:     'Opgeslagen \u2713',
    report_best_day:    'Beste dag',
    report_challenging: 'Moeilijke dag (laagste stemming)',
},

/* ═══════════ POLISH ═══════════ */
pl: {
    narrative_steady:   'Tw\u00f3j nastr\u00f3j by\u0142 stabilny w tym tygodniu.',
    no_checkin_today:   'Brak wpisu na dzi\u015b.',
    tagging_recently:   'Ostatnio cz\u0119sto u\u017cywasz tagu \u201e{tag}\u201c.',
    streak_days:        '{n} dni z rz\u0119du \u2014 tak trzymaj!',
    streak_day:         'Dzie\u0144 {n} twojej serii.',
    chart_avg_mood_month:   '\u015arednin nastroju w miesi\u0105cu',
    chart_mood_axis:        'Zmiana nastroju (dzie\u0144 po dniu)',
    chart_mood_axis_short:  'Zmiana',
    chart_mood_improved:    'Nastr\u00f3j poprawi\u0142 si\u0119 o {n} pkt',
    chart_mood_dipped:      'Nastr\u00f3j obni\u017cy\u0142 si\u0119 o {n} pkt',
    chart_mood_1_10:        'Nastr\u00f3j (1\u201310)',
    chip_latest:            'Ostatni: {delta} vs \u015brednia',
    chip_range:             'Zakres {min}\u2013{max}',
    insights_what_data_shows: 'Co pokazuj\u0105 twoje dane',
    insight_sleep_heading:    'Sen',
    insight_activity_heading: 'Aktywno\u015b\u0107',
    insight_stability_heading:'Stabilno\u015b\u0107 nastroju',
    insight_tags_heading:     'Tagi',
    ds_mood:       'Nastr\u00f3j: {v}/10',
    ds_sleep:      'Sen: {v} godz.',
    ds_energy:     'Energia: {v}/10',
    ds_above_avg:  'Nieco powy\u017cej Twojej \u015bredniej.',
    ds_below_avg:  'Nieco poni\u017cej Twojej \u015bredniej.',
    ds_on_avg:     'W Twoim typowym zakresie.',
    ds_first:      'Pierwszy wpis \u2014 \u015bwietny pocz\u0105tek!',
    ds_tags:       'Tagi: {list}.',
    ds_activities: 'Aktywno\u015bci: {list}.',
    ds_journal:    'Zapisano notatk\u0119 w dzienniku.',
    ds_multi_sleep:'Sen by\u0142 podzielony na kilka segment\u00f3w.',
    toast_lang:      'J\u0119zyk zaktualizowany \u2713',
    toast_date_fmt:  'Format daty zaktualizowany \u2713',
    toast_time_fmt:  'Format czasu zaktualizowany \u2713',
    toast_saved:     'Zapisano \u2713',
    report_best_day:    'Najlepszy dzie\u0144',
    report_challenging: 'Trudny dzie\u0144 (najni\u017cszy nastr\u00f3j)',
},

/* ═══════════ RUSSIAN ═══════════ */
ru: {
    narrative_steady:   '\u0412\u0430\u0448\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0431\u044b\u043b\u043e \u0441\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u044b\u043c \u043d\u0430 \u044d\u0442\u043e\u0439 \u043d\u0435\u0434\u0435\u043b\u0435.',
    no_checkin_today:   '\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0435\u0449\u0451 \u043d\u0435\u0442 \u0437\u0430\u043f\u0438\u0441\u0438.',
    tagging_recently:   '\u0412 \u043f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435 \u0432\u0440\u0435\u043c\u044f \u0432\u044b \u0447\u0430\u0441\u0442\u043e \u0438\u0441\u043f\u043e\u043b\u044c\u0437\u0443\u0435\u0442\u0435 \u0442\u0435\u0433 \u00ab{tag}\u00bb.',
    streak_days:        '{n} \u0434\u043d\u0435\u0439 \u043f\u043e\u0434\u0440\u044f\u0434 \u2014 \u0442\u0430\u043a \u0434\u0435\u0440\u0436\u0430\u0442\u044c!',
    streak_day:         '\u0414\u0435\u043d\u044c {n} \u0432\u0430\u0448\u0435\u0439 \u0441\u0435\u0440\u0438\u0438.',
    chart_avg_mood_month:   '\u0421\u0440\u0435\u0434\u043d\u0435\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u043f\u043e \u043c\u0435\u0441\u044f\u0446\u0430\u043c',
    chart_mood_axis:        '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f (\u0434\u0435\u043d\u044c \u0437\u0430 \u0434\u043d\u0451\u043c)',
    chart_mood_axis_short:  '\u0418\u0437\u043c\u0435\u043d\u0435\u043d\u0438\u0435',
    chart_mood_improved:    '\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0443\u043b\u0443\u0447\u0448\u0438\u043b\u043e\u0441\u044c \u043d\u0430 {n} \u043f\u0443\u043d\u043a\u0442\u0430',
    chart_mood_dipped:      '\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 \u0443\u043f\u0430\u043b\u043e \u043d\u0430 {n} \u043f\u0443\u043d\u043a\u0442\u0430',
    chart_mood_1_10:        '\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435 (1\u201310)',
    chip_latest:            '\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0435\u0435: {delta} \u043e\u0442 \u0441\u0440.',
    chip_range:             '\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d {min}\u2013{max}',
    insights_what_data_shows: '\u0427\u0442\u043e \u043f\u043e\u043a\u0430\u0437\u044b\u0432\u0430\u044e\u0442 \u0432\u0430\u0448\u0438 \u0434\u0430\u043d\u043d\u044b\u0435',
    insight_sleep_heading:    '\u0421\u043e\u043d',
    insight_activity_heading: '\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u044c',
    insight_stability_heading:'\u0421\u0442\u0430\u0431\u0438\u043b\u044c\u043d\u043e\u0441\u0442\u044c \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u044f',
    insight_tags_heading:     '\u0422\u0435\u0433\u0438',
    ds_mood:       '\u041d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435: {v}/10',
    ds_sleep:      '\u0421\u043e\u043d: {v} \u0447.',
    ds_energy:     '\u042d\u043d\u0435\u0440\u0433\u0438\u044f: {v}/10',
    ds_above_avg:  '\u041d\u0435\u043c\u043d\u043e\u0433\u043e \u0432\u044b\u0448\u0435 \u0432\u0430\u0448\u0435\u0433\u043e \u043e\u0431\u044b\u0447\u043d\u043e\u0433\u043e \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d\u0430.',
    ds_below_avg:  '\u041d\u0435\u043c\u043d\u043e\u0433\u043e \u043d\u0438\u0436\u0435 \u0432\u0430\u0448\u0435\u0433\u043e \u043e\u0431\u044b\u0447\u043d\u043e\u0433\u043e \u0434\u0438\u0430\u043f\u0430\u0437\u043e\u043d\u0430.',
    ds_on_avg:     '\u0412 \u043f\u0440\u0435\u0434\u0435\u043b\u0430\u0445 \u043d\u043e\u0440\u043c\u044b.',
    ds_first:      '\u041f\u0435\u0440\u0432\u0430\u044f \u0437\u0430\u043f\u0438\u0441\u044c \u2014 \u043e\u0442\u043b\u0438\u0447\u043d\u043e\u0435 \u043d\u0430\u0447\u0430\u043b\u043e!',
    ds_tags:       '\u0422\u0435\u0433\u0438: {list}.',
    ds_activities: '\u0410\u043a\u0442\u0438\u0432\u043d\u043e\u0441\u0442\u0438: {list}.',
    ds_journal:    '\u0417\u0430\u043f\u0438\u0441\u044c \u0432 \u0434\u043d\u0435\u0432\u043d\u0438\u043a\u0435 \u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430.',
    ds_multi_sleep:'\u0421\u043e\u043d \u0431\u044b\u043b \u0440\u0430\u0437\u0431\u0438\u0442 \u043d\u0430 \u043d\u0435\u0441\u043a\u043e\u043b\u044c\u043a\u043e \u043e\u0442\u0440\u0435\u0437\u043a\u043e\u0432.',
    toast_lang:      '\u042f\u0437\u044b\u043a \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713',
    toast_date_fmt:  '\u0424\u043e\u0440\u043c\u0430\u0442 \u0434\u0430\u0442\u044b \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713',
    toast_time_fmt:  '\u0424\u043e\u0440\u043c\u0430\u0442 \u0432\u0440\u0435\u043c\u0435\u043d\u0438 \u043e\u0431\u043d\u043e\u0432\u043b\u0451\u043d \u2713',
    toast_saved:     '\u0421\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u043e \u2713',
    report_best_day:    '\u041b\u0443\u0447\u0448\u0438\u0439 \u0434\u0435\u043d\u044c',
    report_challenging: '\u0421\u043b\u043e\u0436\u043d\u044b\u0439 \u0434\u0435\u043d\u044c (\u043d\u0430\u0438\u043d\u0438\u0437\u0448\u0435\u0435 \u043d\u0430\u0441\u0442\u0440\u043e\u0435\u043d\u0438\u0435)',
},

/* ═══════════ TURKISH ═══════════ */
tr: {
    narrative_steady:   'Bu hafta ruh haliniz istikrarl\u0131yd\u0131.',
    no_checkin_today:   'Bug\u00fcn hen\u00fcz giri\u015f yok.',
    tagging_recently:   'Son zamanlarda \u201c{tag}\u201d etiketini s\u0131k kullan\u0131yorsunuz.',
    streak_days:        '{n} g\u00fcnl\u00fck seri \u2014 devam edin!',
    streak_day:         'Serinizin {n}. g\u00fcn\u00fc.',
    chart_avg_mood_month:   'Ayl\u0131k ortalama ruh hali',
    chart_mood_axis:        'Ruh hali de\u011fi\u015fimi (g\u00fcnl\u00fck)',
    chart_mood_axis_short:  'De\u011fi\u015fim',
    chart_mood_improved:    'Ruh hali {n} puan y\u00fckseldi',
    chart_mood_dipped:      'Ruh hali {n} puan d\u00fc\u015ft\u00fc',
    chart_mood_1_10:        'Ruh hali (1\u201310)',
    chip_latest:            'Son: {delta} vs ort.',
    chip_range:             'Aral\u0131k {min}\u2013{max}',
    insights_what_data_shows: 'Verileriniz ne g\u00f6steriyor',
    insight_sleep_heading:    'Uyku',
    insight_activity_heading: 'Aktivite',
    insight_stability_heading:'Ruh hali istikrar\u0131',
    insight_tags_heading:     'Etiketler',
    ds_mood:       'Ruh hali: {v}/10',
    ds_sleep:      'Uyku: {v} saat',
    ds_energy:     'Enerji: {v}/10',
    ds_above_avg:  'Ortalaman\u0131z\u0131n biraz \u00fczerinde.',
    ds_below_avg:  'Ortalaman\u0131z\u0131n biraz alt\u0131nda.',
    ds_on_avg:     'Tipik aral\u0131\u011f\u0131n\u0131zda.',
    ds_first:      '\u0130lk kay\u0131t \u2014 harika ba\u015flang\u0131\u00e7!',
    ds_tags:       'Etiketler: {list}.',
    ds_activities: 'Aktiviteler: {list}.',
    ds_journal:    'G\u00fcnl\u00fckte bir not kaydedildi.',
    ds_multi_sleep:'Uyku birden fazla par\u00e7aya b\u00f6l\u00fcnd\u00fc.',
    toast_lang:      'Dil g\u00fcncellendi \u2713',
    toast_date_fmt:  'Tarih format\u0131 g\u00fcncellendi \u2713',
    toast_time_fmt:  'Saat format\u0131 g\u00fcncellendi \u2713',
    toast_saved:     'Kaydedildi \u2713',
    report_best_day:    'En iyi g\u00fcn',
    report_challenging: 'Zorlu g\u00fcn (en d\u00fc\u015f\u00fck ruh hali)',
},

/* ═══════════ JAPANESE ═══════════ */
ja: {
    narrative_steady:   '\u4eca\u9031\u306e\u6c17\u5206\u306f\u5b89\u5b9a\u3057\u3066\u3044\u307e\u3057\u305f\u3002',
    no_checkin_today:   '\u4eca\u65e5\u306f\u307e\u3060\u30c1\u30a7\u30c3\u30af\u30a4\u30f3\u304c\u3042\u308a\u307e\u305b\u3093\u3002',
    tagging_recently:   '\u6700\u8fd1\u300c{tag}\u300d\u30bf\u30b0\u3092\u3088\u304f\u4f7f\u3063\u3066\u3044\u307e\u3059\u3002',
    streak_days:        '{n}\u65e5\u9023\u7d9a \u2014 \u3053\u306e\u8abf\u5b50\u3067\uff01',
    streak_day:         '\u9023\u7d9a{n}\u65e5\u76ee\u3002',
    chart_avg_mood_month:   '\u6708\u5225\u5e73\u5747\u6c17\u5206',
    chart_mood_axis:        '\u6c17\u5206\u306e\u5909\u5316\uff08\u65e5\u5225\uff09',
    chart_mood_axis_short:  '\u5909\u5316',
    chart_mood_improved:    '\u6c17\u5206\u304c {n} \u30dd\u30a4\u30f3\u30c8\u6539\u5584',
    chart_mood_dipped:      '\u6c17\u5206\u304c {n} \u30dd\u30a4\u30f3\u30c8\u4f4e\u4e0b',
    chart_mood_1_10:        '\u6c17\u5206\uff081\u201310\uff09',
    chip_latest:            '\u76f4\u8fd1: {delta} vs \u5e73\u5747',
    chip_range:             '\u7bc4\u56f2 {min}\u2013{max}',
    insights_what_data_shows: '\u30c7\u30fc\u30bf\u304c\u793a\u3059\u3082\u306e',
    insight_sleep_heading:    '\u7761\u7720',
    insight_activity_heading: '\u6d3b\u52d5',
    insight_stability_heading:'\u6c17\u5206\u306e\u5b89\u5b9a\u6027',
    insight_tags_heading:     '\u30bf\u30b0',
    ds_mood:       '\u6c17\u5206: {v}/10',
    ds_sleep:      '\u7761\u7720: {v}\u6642\u9593',
    ds_energy:     '\u30a8\u30cd\u30eb\u30ae\u30fc: {v}/10',
    ds_above_avg:  '\u901a\u5e38\u3088\u308a\u5c11\u3057\u9ad8\u3081\u3002',
    ds_below_avg:  '\u901a\u5e38\u3088\u308a\u5c11\u3057\u4f4e\u3081\u3002',
    ds_on_avg:     '\u901a\u5e38\u306e\u7bc4\u56f2\u5185\u3002',
    ds_first:      '\u521d\u56de\u8a18\u9332 \u2014 \u3044\u3044\u30b9\u30bf\u30fc\u30c8\uff01',
    ds_tags:       '\u30bf\u30b0: {list}\u3002',
    ds_activities: '\u6d3b\u52d5: {list}\u3002',
    ds_journal:    '\u65e5\u8a18\u306e\u30e1\u30e2\u304c\u4fdd\u5b58\u3055\u308c\u307e\u3057\u305f\u3002',
    ds_multi_sleep:'\u7761\u7720\u306f\u8907\u6570\u306e\u30bb\u30b0\u30e1\u30f3\u30c8\u306b\u5206\u304b\u308c\u307e\u3057\u305f\u3002',
    toast_lang:      '\u8a00\u8a9e\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713',
    toast_date_fmt:  '\u65e5\u4ed8\u5f62\u5f0f\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713',
    toast_time_fmt:  '\u6642\u523b\u5f62\u5f0f\u3092\u66f4\u65b0\u3057\u307e\u3057\u305f \u2713',
    toast_saved:     '\u4fdd\u5b58\u3057\u307e\u3057\u305f \u2713',
    report_best_day:    '\u6700\u9ad8\u306e\u65e5',
    report_challenging: '\u6700\u4f4e\u6c17\u5206\u306e\u65e5',
},

/* ═══════════ CHINESE ═══════════ */
zh: {
    narrative_steady:   '\u672c\u5468\u4f60\u7684\u60c5\u7eea\u4fdd\u6301\u5e73\u7a33\u3002',
    no_checkin_today:   '\u4eca\u5929\u8fd8\u6ca1\u6709\u6253\u5361\u8bb0\u5f55\u3002',
    tagging_recently:   '\u4f60\u6700\u8fd1\u7ecf\u5e38\u4f7f\u7528\u6807\u7b7e\u201c{tag}\u201d\u3002',
    streak_days:        '\u8fde\u7eed {n} \u5929\uff0c\u7ee7\u7eed\u52a0\u6cb9\uff01',
    streak_day:         '\u8fde\u7eed\u7b2c {n} \u5929\u3002',
    chart_avg_mood_month:   '\u6bcf\u6708\u5e73\u5747\u60c5\u7eea',
    chart_mood_axis:        '\u60c5\u7eea\u53d8\u5316\uff08\u9010\u65e5\uff09',
    chart_mood_axis_short:  '\u53d8\u5316',
    chart_mood_improved:    '\u60c5\u7eea\u63d0\u5347\u4e86 {n} \u5206',
    chart_mood_dipped:      '\u60c5\u7eea\u4e0b\u964d\u4e86 {n} \u5206',
    chart_mood_1_10:        '\u60c5\u7eea\uff081\u201310\uff09',
    chip_latest:            '\u6700\u8fd1: {delta} vs \u5747',
    chip_range:             '\u533a\u95f4 {min}\u2013{max}',
    insights_what_data_shows: '\u6570\u636e\u63ed\u793a\u7684\u5185\u5bb9',
    insight_sleep_heading:    '\u7761\u7720',
    insight_activity_heading: '\u6d3b\u52a8',
    insight_stability_heading:'\u60c5\u7eea\u7a33\u5b9a\u6027',
    insight_tags_heading:     '\u6807\u7b7e',
    ds_mood:       '\u60c5\u7eea: {v}/10',
    ds_sleep:      '\u7761\u7720: {v} \u5c0f\u65f6',
    ds_energy:     '\u7cbe\u529b: {v}/10',
    ds_above_avg:  '\u7565\u9ad8\u4e8e\u5e73\u5e38\u6c34\u5e73\u3002',
    ds_below_avg:  '\u7565\u4f4e\u4e8e\u5e73\u5e38\u6c34\u5e73\u3002',
    ds_on_avg:     '\u5728\u6b63\u5e38\u8303\u56f4\u5185\u3002',
    ds_first:      '\u7b2c\u4e00\u6761\u8bb0\u5f55\uff0c\u5f88\u597d\u7684\u5f00\u59cb\uff01',
    ds_tags:       '\u6807\u7b7e\uff1a{list}\u3002',
    ds_activities: '\u6d3b\u52a8\uff1a{list}\u3002',
    ds_journal:    '\u5df2\u4fdd\u5b58\u65e5\u8bb0\u7b14\u8bb0\u3002',
    ds_multi_sleep:'\u7761\u7720\u5206\u6210\u591a\u4e2a\u7247\u6bb5\u3002',
    toast_lang:      '\u8bed\u8a00\u5df2\u66f4\u65b0 \u2713',
    toast_date_fmt:  '\u65e5\u671f\u683c\u5f0f\u5df2\u66f4\u65b0 \u2713',
    toast_time_fmt:  '\u65f6\u95f4\u683c\u5f0f\u5df2\u66f4\u65b0 \u2713',
    toast_saved:     '\u5df2\u4fdd\u5b58 \u2713',
    report_best_day:    '\u6700\u4f73\u5929',
    report_challenging: '\u60c5\u7eea\u6700\u4f4e\u5929',
},

/* ═══════════ ARABIC ═══════════ */
ar: {
    narrative_steady:   '\u0643\u0627\u0646 \u0645\u0632\u0627\u062c\u0643 \u0645\u0633\u062a\u0642\u0631\u064b\u0627 \u0647\u0630\u0627 \u0627\u0644\u0623\u0633\u0628\u0648\u0639.',
    no_checkin_today:   '\u0644\u0627 \u064a\u0648\u062c\u062f \u062a\u0633\u062c\u064a\u0644 \u0644\u0644\u064a\u0648\u0645 \u0628\u0639\u062f.',
    tagging_recently:   '\u0644\u0642\u062f \u0643\u0646\u062a \u062a\u0633\u062a\u062e\u062f\u0645 \u0648\u0633\u0645 \u201c{tag}\u201d \u0643\u062b\u064a\u0631\u064b\u0627 \u0645\u0624\u062e\u0631\u064b\u0627.',
    streak_days:        '{n} \u0623\u064a\u0627\u0645 \u0645\u062a\u062a\u0627\u0644\u064a\u0629 \u2014 \u0627\u0633\u062a\u0645\u0631!',
    streak_day:         '\u0627\u0644\u064a\u0648\u0645 {n} \u0645\u0646 \u0633\u0644\u0633\u0644\u062a\u0643.',
    chart_avg_mood_month:   '\u0645\u062a\u0648\u0633\u0637 \u0627\u0644\u0645\u0632\u0627\u062c \u0627\u0644\u0634\u0647\u0631\u064a',
    chart_mood_axis:        '\u062a\u063a\u064a\u0651\u0631 \u0627\u0644\u0645\u0632\u0627\u062c (\u064a\u0648\u0645\u064b\u0627 \u0628\u064a\u0648\u0645)',
    chart_mood_axis_short:  '\u062a\u063a\u064a\u064f\u0651\u0631',
    chart_mood_improved:    '\u062a\u062d\u0633\u0651\u0646 \u0627\u0644\u0645\u0632\u0627\u062c \u0628\u0645\u0642\u062f\u0627\u0631 {n} \u0646\u0642\u0637\u0629',
    chart_mood_dipped:      '\u0627\u0646\u062e\u0641\u0636 \u0627\u0644\u0645\u0632\u0627\u062c \u0628\u0645\u0642\u062f\u0627\u0631 {n} \u0646\u0642\u0637\u0629',
    chart_mood_1_10:        '\u0627\u0644\u0645\u0632\u0627\u062c (1\u201310)',
    chip_latest:            '\u0627\u0644\u0623\u062e\u064a\u0631: {delta} \u0645\u0642\u0627\u0628\u0644 \u0627\u0644\u0645\u062a\u0648\u0633\u0637',
    chip_range:             '\u0627\u0644\u0646\u0637\u0627\u0642 {min}\u2013{max}',
    insights_what_data_shows: '\u0645\u0627 \u062a\u0643\u0634\u0641\u0647 \u0628\u064a\u0627\u0646\u0627\u062a\u0643',
    insight_sleep_heading:    '\u0627\u0644\u0646\u0648\u0645',
    insight_activity_heading: '\u0627\u0644\u0646\u0634\u0627\u0637',
    insight_stability_heading:'\u0627\u0633\u062a\u0642\u0631\u0627\u0631 \u0627\u0644\u0645\u0632\u0627\u062c',
    insight_tags_heading:     '\u0627\u0644\u0648\u0633\u0648\u0645',
    ds_mood:       '\u0627\u0644\u0645\u0632\u0627\u062c: {v}/10',
    ds_sleep:      '\u0627\u0644\u0646\u0648\u0645: {v} \u0633.',
    ds_energy:     '\u0627\u0644\u0637\u0627\u0642\u0629: {v}/10',
    ds_above_avg:  '\u0623\u0639\u0644\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0645\u0639\u062f\u0644\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.',
    ds_below_avg:  '\u0623\u062f\u0646\u0649 \u0642\u0644\u064a\u0644\u0627\u064b \u0645\u0646 \u0645\u0639\u062f\u0644\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.',
    ds_on_avg:     '\u0636\u0645\u0646 \u0646\u0637\u0627\u0642\u0643 \u0627\u0644\u0645\u0639\u062a\u0627\u062f.',
    ds_first:      '\u0623\u0648\u0644 \u062a\u0633\u062c\u064a\u0644 \u2014 \u0628\u062f\u0627\u064a\u0629 \u0631\u0627\u0626\u0639\u0629!',
    ds_tags:       '\u0627\u0644\u0648\u0633\u0648\u0645: {list}.',
    ds_activities: '\u0627\u0644\u0623\u0646\u0634\u0637\u0629: {list}.',
    ds_journal:    '\u062a\u0645 \u062d\u0641\u0638 \u0645\u0644\u0627\u062d\u0638\u0629 \u064a\u0648\u0645\u064a\u0629.',
    ds_multi_sleep:'\u0627\u0646\u0642\u0633\u0645 \u0627\u0644\u0646\u0648\u0645 \u0625\u0644\u0649 \u0639\u062f\u0629 \u0641\u062a\u0631\u0627\u062a.',
    toast_lang:      '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u0627\u0644\u0644\u063a\u0629 \u2713',
    toast_date_fmt:  '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u062a\u0627\u0631\u064a\u062e \u2713',
    toast_time_fmt:  '\u062a\u0645 \u062a\u062d\u062f\u064a\u062b \u062a\u0646\u0633\u064a\u0642 \u0627\u0644\u0648\u0642\u062a \u2713',
    toast_saved:     '\u062a\u0645 \u0627\u0644\u062d\u0641\u0638 \u2713',
    report_best_day:    '\u0623\u0641\u0636\u0644 \u064a\u0648\u0645',
    report_challenging: '\u064a\u0648\u0645 \u0635\u0639\u0628 (\u0623\u062f\u0646\u0649 \u0645\u0632\u0627\u062c)',
},

/* ═══════════ HINDI ═══════════ */
hi: {
    narrative_steady:   '\u0907\u0938 \u0938\u092a\u094d\u0924\u093e\u0939 \u0906\u092a\u0915\u093e \u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930 \u0930\u0939\u093e\u0964',
    no_checkin_today:   '\u0906\u091c \u0905\u092d\u0940 \u0924\u0915 \u0915\u094b\u0908 \u091a\u0947\u0915-\u0907\u0928 \u0928\u0939\u0940\u0902\u0964',
    tagging_recently:   '\u0906\u092a \u0939\u093e\u0932 \u092e\u0947\u0902 \u201c{tag}\u201d \u091f\u0948\u0917 \u092c\u0939\u0941\u0924 \u0907\u0938\u094d\u0924\u0947\u092e\u093e\u0932 \u0915\u0930 \u0930\u0939\u0947 \u0939\u0948\u0902\u0964',
    streak_days:        '{n} \u0926\u093f\u0928 \u0915\u0940 \u0932\u0915\u0940\u0930 \u2014 \u091c\u093e\u0930\u0940 \u0930\u0916\u0947\u0902!',
    streak_day:         '\u0906\u092a\u0915\u0940 \u0932\u0915\u0940\u0930 \u0915\u093e {n}\u0935\u093e\u0901 \u0926\u093f\u0928\u0964',
    chart_avg_mood_month:   '\u092e\u093e\u0938\u093f\u0915 \u0914\u0938\u0924 \u092e\u0942\u0921',
    chart_mood_axis:        '\u092e\u0942\u0921 \u092c\u0926\u0932\u093e\u0935 (\u0926\u0948\u0928\u093f\u0915)',
    chart_mood_axis_short:  '\u092c\u0926\u0932\u093e\u0935',
    chart_mood_improved:    '\u092e\u0942\u0921 {n} \u0905\u0902\u0915 \u092c\u0922\u093c\u093e',
    chart_mood_dipped:      '\u092e\u0942\u0921 {n} \u0905\u0902\u0915 \u0918\u091f\u093e',
    chart_mood_1_10:        '\u092e\u0942\u0921 (1\u201310)',
    chip_latest:            '\u0924\u093e\u091c\u093e: {delta} vs \u0914\u0938\u0924',
    chip_range:             '\u0938\u0940\u092e\u093e {min}\u2013{max}',
    insights_what_data_shows: '\u0906\u092a\u0915\u093e \u0921\u0947\u091f\u093e \u0915\u094d\u092f\u093e \u0926\u093f\u0916\u093e\u0924\u093e \u0939\u0948',
    insight_sleep_heading:    '\u0928\u0940\u0902\u0926',
    insight_activity_heading: '\u0917\u0924\u093f\u0935\u093f\u0927\u093f',
    insight_stability_heading:'\u092e\u0942\u0921 \u0938\u094d\u0925\u093f\u0930\u0924\u093e',
    insight_tags_heading:     '\u091f\u0948\u0917',
    ds_mood:       '\u092e\u0942\u0921: {v}/10',
    ds_sleep:      '\u0928\u0940\u0902\u0926: {v} \u0918\u0902.',
    ds_energy:     '\u090a\u0930\u094d\u091c\u093e: {v}/10',
    ds_above_avg:  '\u0906\u092a\u0915\u0940 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0940\u092e\u093e \u0938\u0947 \u0925\u094b\u0921\u093c\u093e \u0913\u092a\u0930\u0964',
    ds_below_avg:  '\u0906\u092a\u0915\u0940 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0940\u092e\u093e \u0938\u0947 \u0925\u094b\u0921\u093c\u093e \u0928\u0940\u091a\u0947\u0964',
    ds_on_avg:     '\u0906\u092a\u0915\u0940 \u0938\u093e\u092e\u093e\u0928\u094d\u092f \u0938\u0940\u092e\u093e \u092e\u0947\u0902\u0964',
    ds_first:      '\u092a\u0939\u0932\u0940 \u092a\u094d\u0930\u0935\u093f\u0937\u094d\u091f\u093f \u2014 \u0936\u093e\u0928\u0926\u093e\u0930 \u0936\u0941\u0930\u0941\u0906\u0924!',
    ds_tags:       '\u091f\u0948\u0917: {list}\u0964',
    ds_activities: '\u0917\u0924\u093f\u0935\u093f\u0927\u093f\u092f\u093e\u0901: {list}\u0964',
    ds_journal:    '\u0921\u093e\u092f\u0930\u0940 \u0928\u094b\u091f \u0938\u0941\u0930\u0915\u094d\u0937\u093f\u0924 \u0915\u0940 \u0917\u0908\u0964',
    ds_multi_sleep:'\u0928\u0940\u0902\u0926 \u0915\u0908 \u0939\u093f\u0938\u094d\u0938\u094b\u0902 \u092e\u0947\u0902 \u092c\u0902\u091f\u0940 \u0925\u0940\u0964',
    toast_lang:      '\u092d\u093e\u0937\u093e \u0905\u092a\u0921\u0947\u091f \u0939\u0941\u0908 \u2713',
    toast_date_fmt:  '\u0924\u093e\u0930\u0940\u0916 \u092a\u094d\u0930\u093e\u0930\u0942\u092a \u0905\u092a\u0921\u0947\u091f \u0939\u0941\u0906 \u2713',
    toast_time_fmt:  '\u0938\u092e\u092f \u092a\u094d\u0930\u093e\u0930\u0942\u092a \u0905\u092a\u0921\u0947\u091f \u0939\u0941\u0906 \u2713',
    toast_saved:     '\u0938\u0939\u0947\u091c\u093e \u0917\u092f\u093e \u2713',
    report_best_day:    '\u0938\u092c\u0938\u0947 \u0905\u091a\u094d\u091b\u093e \u0926\u093f\u0928',
    report_challenging: '\u0915\u0920\u093f\u0928 \u0926\u093f\u0928 (\u0938\u092c\u0938\u0947 \u0915\u092e \u092e\u0942\u0921)',
}

    }; /* end TD */

    /* ─────────────────────────────────────────────────────────────────
       §2.  Translation helper  window.__t(key, vars?)
       Falls back through locale → base-locale → en.
       vars = { n: 3, tag: 'exercise', delta: '+1.2', min: '3.0', max: '8.5', v: '7.2', list: 'x, y', s: '' }
    ───────────────────────────────────────────────────────────────── */
    function resolve(key) {
        var loc = String(window.auraLocale || 'en').split('-')[0];
        var row = TD[loc] || TD['en'];
        return (row && row[key] != null) ? row[key] : ((TD['en'] && TD['en'][key]) || key);
    }

    function fill(tpl, vars) {
        if (!vars) return tpl;
        return tpl.replace(/\{(\w+)\}/g, function (_, k) {
            return vars[k] != null ? vars[k] : '';
        });
    }

    window.__t = function (key, vars) { return fill(resolve(key), vars); };

    /* Also wire getTranslation used by app.js buildDashboardGreeting */
    window.getTranslation = function (key) { return window.__t(key); };

    /* ─────────────────────────────────────────────────────────────────
       §3.  Localized month names via Intl  (no hardcoded arrays)
    ───────────────────────────────────────────────────────────────── */
    window.getLocalizedMonths = function (fmt) {
        var loc = String(window.auraLocale || 'en');
        return Array.from({ length: 12 }, function (_, i) {
            try {
                return new Intl.DateTimeFormat(loc, { month: fmt || 'short' }).format(new Date(2000, i, 1));
            } catch (e) {
                return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i];
            }
        });
    };

    /* ─────────────────────────────────────────────────────────────────
       §4.  Patch buildDashboardNarrative — add missing "steady" + tag + streak
    ───────────────────────────────────────────────────────────────── */
    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 500); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 1200); });
    }

    onReady(function () {
        var origNarrative = window.buildDashboardNarrative;
        if (typeof origNarrative === 'function' && !origNarrative._i18nFinalPatched) {
            window.buildDashboardNarrative = function () {
                /* Run original to get structure — then fix the English fragments */
                var result = origNarrative.apply(this, arguments);
                /* Replace hardcoded English steady/streak/tag sentences */
                result = result
                    .replace(/Your mood has been steady this week\./g,     window.__t('narrative_steady'))
                    .replace(/No check-in yet today\./g,                   window.__t('no_checkin_today'))
                    .replace(/(\d+)-day streak[—\u2014]keep it up\./g,     function (_, n) { return window.__t('streak_days', { n: n }); })
                    .replace(/Day (\d+) of your streak\./g,                function (_, n) { return window.__t('streak_day',  { n: n }); })
                    .replace(/You've been tagging\s*\u201c([^""\u201d]+)\u201d a lot lately\./g, function (_, tag) { return window.__t('tagging_recently', { tag: tag }); });
                return result;
            };
            window.buildDashboardNarrative._i18nFinalPatched = true;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §5.  Patch renderSeasonalPatterns — localized months + translated label
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origSeasonal = window.renderSeasonalPatterns;
        if (typeof origSeasonal === 'function' && !origSeasonal._i18nFinalPatched) {
            window.renderSeasonalPatterns = function () {
                /* Swap the month array before the original runs */
                var savedMonths = window._auraMonthsEn;
                /* patch the months used inside — we inject into the global scope
                   the original fn reads from a local const so we must post-patch the chart */
                var result = origSeasonal.apply(this, arguments);
                /* After render: relabel the chart dataset and axis */
                setTimeout(function () {
                    var canvas = document.getElementById('seasonalChart');
                    if (!canvas) return;
                    var c = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
                    if (!c) return;
                    /* Month labels */
                    c.data.labels = window.getLocalizedMonths('short');
                    /* Dataset label */
                    if (c.data.datasets && c.data.datasets[0]) {
                        c.data.datasets[0].label = window.__t('chart_avg_mood_month');
                    }
                    /* Y-axis title */
                    if (c.options && c.options.scales && c.options.scales.y && c.options.scales.y.title) {
                        c.options.scales.y.title.text = window.__t('chart_mood_1_10');
                    }
                    c.update('none');
                }, 80);
                return result;
            };
            window.renderSeasonalPatterns._i18nFinalPatched = true;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §6.  Patch renderYearOverYear — localized month labels
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origYoY = window.renderYearOverYear;
        if (typeof origYoY === 'function' && !origYoY._i18nFinalPatched) {
            window.renderYearOverYear = function () {
                var result = origYoY.apply(this, arguments);
                setTimeout(function () {
                    var canvas = document.getElementById('yoyChart');
                    if (!canvas) return;
                    var c = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
                    if (!c) return;
                    c.data.labels = window.getLocalizedMonths('short');
                    c.update('none');
                }, 80);
                return result;
            };
            window.renderYearOverYear._i18nFinalPatched = true;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §7.  Patch Mood Velocity chart — axis title + tooltip strings
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origVelocity = window.renderMoodVelocity;
        if (typeof origVelocity === 'function' && !origVelocity._i18nFinalPatched) {
            window.renderMoodVelocity = function () {
                var result = origVelocity.apply(this, arguments);
                setTimeout(function () {
                    var canvas = document.getElementById('circadianChart');
                    if (!canvas) return;
                    var c = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(canvas) : null;
                    if (!c) return;
                    /* Y-axis title */
                    if (c.options && c.options.scales && c.options.scales.y && c.options.scales.y.title) {
                        c.options.scales.y.title.text = window.__t('chart_mood_axis');
                    }
                    /* Tooltip callback — wrap to translate */
                    if (c.options && c.options.plugins && c.options.plugins.tooltip) {
                        var origLabel = c.options.plugins.tooltip.callbacks && c.options.plugins.tooltip.callbacks.label;
                        if (origLabel && !origLabel._i18nFinalPatched) {
                            c.options.plugins.tooltip.callbacks.label = function (ctx) {
                                var v = ctx.raw;
                                if (typeof v !== 'number') return (ctx.dataset.label || '') + ': ' + v;
                                var abs = Math.abs(v).toFixed(1);
                                var plural = Math.abs(v) !== 1 ? 's' : '';
                                if (v > 0) return window.__t('chart_mood_improved', { n: abs, s: plural });
                                if (v < 0) return window.__t('chart_mood_dipped',   { n: abs, s: plural });
                                return window.__t('chart_mood_axis_short') + ': 0';
                            };
                            c.options.plugins.tooltip.callbacks.label._i18nFinalPatched = true;
                        }
                    }
                    c.update('none');
                }, 80);
                return result;
            };
            window.renderMoodVelocity._i18nFinalPatched = true;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §8.  Patch buildChartAnnotations chips — Latest / Range
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origAnnotations = window.buildChartAnnotations;
        if (typeof origAnnotations === 'function' && !origAnnotations._i18nFinalPatched) {
            window.buildChartAnnotations = function (data, opts) {
                var chips = origAnnotations.apply(this, arguments);
                if (!chips || !chips.length) return chips;
                return chips.map(function (chip) {
                    var text = chip.text || '';
                    /* Latest: +X vs avg  →  locale */
                    var mLatest = text.match(/^Latest:\s*([^\s]+)\s+vs avg/);
                    if (mLatest) {
                        return Object.assign({}, chip, { text: window.__t('chip_latest', { delta: mLatest[1] }) });
                    }
                    /* Range X–Y  →  locale */
                    var mRange = text.match(/^Range\s+([0-9.]+)\u2013([0-9.]+)/);
                    if (mRange) {
                        return Object.assign({}, chip, { text: window.__t('chip_range', { min: mRange[1], max: mRange[2] }) });
                    }
                    return chip;
                });
            };
            window.buildChartAnnotations._i18nFinalPatched = true;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §9.  Patch insights "What your data shows" heading + section names
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        /* Patch the injected strip heading */
        var origInjector = null;
        /* MutationObserver approach: translate heading whenever it appears */
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                m.addedNodes.forEach(function (node) {
                    if (node.nodeType !== 1) return;
                    /* "What your data shows" h4 */
                    var h4s = node.tagName === 'H4' ? [node] : Array.from(node.querySelectorAll('h4'));
                    h4s.forEach(function (h4) {
                        if (/what your data shows/i.test(h4.textContent)) {
                            h4.textContent = window.__t('insights_what_data_shows');
                        }
                    });
                    /* Insight section headings */
                    var headings = node.tagName === 'H3' ? [node] : Array.from(node.querySelectorAll('h3'));
                    headings.forEach(function (h3) {
                        translateInsightHeading(h3);
                    });
                });
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });

        function translateInsightHeading(el) {
            var t = (el.textContent || '').trim();
            if (/^sleep insights$/i.test(t))             el.textContent = window.__t('insight_sleep_heading');
            else if (/^activity insights$/i.test(t))     el.textContent = window.__t('insight_activity_heading');
            else if (/^mood stability insights$/i.test(t))el.textContent = window.__t('insight_stability_heading');
            else if (/^tag insights$/i.test(t))          el.textContent = window.__t('insight_tags_heading');
        }

        /* Also retroactively translate anything already rendered */
        document.querySelectorAll('h4').forEach(function (h4) {
            if (/what your data shows/i.test(h4.textContent)) {
                h4.textContent = window.__t('insights_what_data_shows');
            }
        });
        document.querySelectorAll('h3').forEach(translateInsightHeading);
    });

    /* ─────────────────────────────────────────────────────────────────
       §10.  Patch daily summary builder for non-EN locales
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origSummary = window.buildDailySummary;
        if (typeof origSummary !== 'function') return;
        if (origSummary._i18nFinalPatched) return;

        window.buildDailySummary = function (dateStr) {
            var loc = String(window.auraLocale || 'en').split('-')[0];
            /* English: use original prose */
            if (loc === 'en') return origSummary.apply(this, arguments);

            /* Non-English: build a simple fully-translated version */
            try {
                var entry = (typeof entries !== 'undefined') ? entries[dateStr] : null;
                if (!entry) return origSummary.apply(this, arguments);

                var t = window.__t;
                var parts = [];

                /* Mood */
                if (entry.mood != null) {
                    var moodLine = t('ds_mood', { v: Number(entry.mood).toFixed(1) });
                    /* Compare to average */
                    var avgMood = _calcAvg(dateStr, 'mood');
                    if (avgMood != null) {
                        var diff = Number(entry.mood) - avgMood;
                        if (diff > 0.75)      moodLine += ' ' + t('ds_above_avg');
                        else if (diff < -0.75) moodLine += ' ' + t('ds_below_avg');
                        else                   moodLine += ' ' + t('ds_on_avg');
                    } else {
                        moodLine += ' ' + t('ds_first');
                    }
                    parts.push(moodLine);
                }

                /* Sleep */
                if (entry.sleep != null) {
                    var sleepHrs = Number(entry.sleep).toFixed(1);
                    var sleepLine = t('ds_sleep', { v: sleepHrs });
                    var avgSleep = _calcAvg(dateStr, 'sleep');
                    if (avgSleep != null) {
                        var sdiff = Number(entry.sleep) - avgSleep;
                        if (sdiff > 0.75)      sleepLine += ' ' + t('ds_above_avg');
                        else if (sdiff < -0.75) sleepLine += ' ' + t('ds_below_avg');
                        else                    sleepLine += ' ' + t('ds_on_avg');
                    }
                    var segCount = (entry.sleepSegments || []).length;
                    if (segCount > 1) sleepLine += ' ' + t('ds_multi_sleep');
                    parts.push(sleepLine);
                }

                /* Energy */
                if (entry.energy != null) {
                    parts.push(t('ds_energy', { v: Number(entry.energy).toFixed(1) }));
                }

                /* Activities + tags */
                var actList = (entry.activities || []).slice(0, 3).join(', ');
                var tagList = (entry.tags || []).slice(0, 3).join(', ');
                if (actList) parts.push(t('ds_activities', { list: actList }));
                if (tagList) parts.push(t('ds_tags', { list: tagList }));

                /* Journal note */
                var hasJournal = entry.journalHtml && entry.journalHtml.replace(/<[^>]+>/g,'').trim().length > 0;
                if (hasJournal) parts.push(t('ds_journal'));

                return parts.join(' ');
            } catch (err) {
                /* Fallback to original if anything goes wrong */
                return origSummary.apply(this, arguments);
            }
        };
        window.buildDailySummary._i18nFinalPatched = true;

        /* Helper: rolling average of a field over last 30 days excluding dateStr */
        function _calcAvg(dateStr, field) {
            if (typeof entries === 'undefined') return null;
            var vals = [];
            Object.keys(entries).sort().forEach(function (d) {
                if (d < dateStr && entries[d] && entries[d][field] != null) vals.push(Number(entries[d][field]));
            });
            vals = vals.slice(-30);
            if (!vals.length) return null;
            return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       §11.  Patch showToast — all toast messages use __t keys
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origToast = window.showToast;
        if (typeof origToast !== 'function') return;
        if (origToast._i18nFinalPatched) return;

        var TOAST_MAP = {
            'Language updated':         'toast_lang',
            'Language updated \u2713':  'toast_lang',
            'Date format updated':      'toast_date_fmt',
            'Date format updated \u2713':'toast_date_fmt',
            'Time format updated':      'toast_time_fmt',
            'Time format updated \u2713':'toast_time_fmt',
            'Saved':                    'toast_saved',
            'Saved \u2713':             'toast_saved',
        };

        window.showToast = function (msg) {
            var key = TOAST_MAP[String(msg).trim()];
            return origToast.call(this, key ? window.__t(key) : msg);
        };
        window.showToast._i18nFinalPatched = true;
    });

    /* ─────────────────────────────────────────────────────────────────
       §12.  Report content — Best day / Challenging day labels
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origReportContent = window.generateWeeklyReportContent || window.buildReportContent;
        if (!origReportContent) return;
        var fnName = window.generateWeeklyReportContent ? 'generateWeeklyReportContent' : 'buildReportContent';
        if (window[fnName]._i18nFinalPatched) return;

        var orig = window[fnName];
        window[fnName] = function () {
            var result = orig.apply(this, arguments);
            if (typeof result === 'string') {
                result = result
                    .replace(/Best day:/g,                     window.__t('report_best_day') + ':')
                    .replace(/Challenging day \(lowest mood\):/g, window.__t('report_challenging') + ':');
            }
            return result;
        };
        window[fnName]._i18nFinalPatched = true;
    });

    /* ─────────────────────────────────────────────────────────────────
       §13.  Re-run all patches when locale changes
    ───────────────────────────────────────────────────────────────── */
    onReady(function () {
        var origSave = window.savePreference;
        if (typeof origSave !== 'function') return;
        if (origSave._i18nFinalLocalePatch) return;

        window.savePreference = function (key, value) {
            var result = origSave.apply(this, arguments);
            if (key === 'locale') {
                var loc = String(value || 'en');
                if (loc === '_custom') {
                    var el = document.getElementById('prefLocaleCustom');
                    loc = el ? (el.value.trim() || 'en') : 'en';
                }
                window.auraLocale = loc;

                /* Re-translate any already-rendered dynamic strings */
                setTimeout(function () {
                    /* "What your data shows" */
                    document.querySelectorAll('h4').forEach(function (h4) {
                        if (/what your data shows/i.test(h4.textContent) ||
                            /* already translated to any language — re-translate */
                            h4.closest('.page-analytics-insights')) {
                            h4.textContent = window.__t('insights_what_data_shows');
                        }
                    });
                    /* Insight section headings */
                    document.querySelectorAll('.page-analytics-insights h3').forEach(function (h3) {
                        /* Map back from any translated heading by checking siblings */
                        var card = h3.closest('[class*="insight"]');
                        if (!card) return;
                        var icon = card.querySelector('[class*="icon"]');
                        if (!icon) return;
                        var ic = (icon.textContent || '').trim();
                        if (ic === '\u2600' || ic === '\u263e' || ic === '☾') h3.textContent = window.__t('insight_sleep_heading');
                        else if (ic === '\u25cc' || ic === '◌') h3.textContent = window.__t('insight_activity_heading');
                        else if (ic === '\u25d4' || ic === '◔') h3.textContent = window.__t('insight_stability_heading');
                        else h3.textContent = window.__t('insight_tags_heading');
                    });
                    /* Refresh dashboard narrative */
                    var narrativeEl = document.getElementById('dashboardNarrative');
                    if (narrativeEl && typeof window.buildDashboardNarrative === 'function') {
                        narrativeEl.textContent = window.buildDashboardNarrative();
                    }
                    /* Refresh greeting */
                    var greetingEl = document.getElementById('dashboardGreeting');
                    if (greetingEl && typeof window.buildDashboardGreeting === 'function') {
                        greetingEl.textContent = window.buildDashboardGreeting();
                    }
                    /* Refresh seasonal chart if visible */
                    if (typeof window.renderSeasonalPatterns === 'function') {
                        var seasonalPage = document.getElementById('seasonal');
                        if (seasonalPage && !seasonalPage.hidden) {
                            window.renderSeasonalPatterns();
                        } else {
                            /* Patch the chart labels directly */
                            var sc = document.getElementById('seasonalChart');
                            if (sc) {
                                var ch = typeof Chart !== 'undefined' && Chart.getChart ? Chart.getChart(sc) : null;
                                if (ch) {
                                    ch.data.labels = window.getLocalizedMonths('short');
                                    if (ch.data.datasets && ch.data.datasets[0]) {
                                        ch.data.datasets[0].label = window.__t('chart_avg_mood_month');
                                    }
                                    ch.update('none');
                                }
                            }
                        }
                    }
                }, 200);
            }
            return result;
        };
        window.savePreference._i18nFinalLocalePatch = true;
    });

    console.log('[Aura i18n Final] All dynamic strings patched — charts, narrative, toasts, insights, daily summary.');
})();
