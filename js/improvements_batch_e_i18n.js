/* ═══════════════════════════════════════════════════════════════════════
   BATCH E — Complete i18n: every word, every page, every language
   ───────────────────────────────────────────────────────────────────────
   How it works
   1.  annotateAll()   — walks the live DOM and stamps data-i18n on every
                         text node that currently has no translation hook.
                         Idempotent: safe to call repeatedly.
   2.  applyBatchE()   — reads window.auraLocale and rewrites every
                         data-i18n element using the T_E table below.
                         Uses the same safe first-text-node replacement
                         that Batch D uses (preserves child elements).
   3.  Hooks           — called on DOMContentLoaded, on every navigate(),
                         and on every savePreference('locale', …).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 600); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 1400); });
    }

    /* ── Stamp a data-i18n key on el only if one isn't already there ── */
    function ann(el, key) {
        if (el && !el.getAttribute('data-i18n')) el.setAttribute('data-i18n', key);
    }

    /* ── Find first element whose trimmed text starts with `text` ────── */
    function findText(sel, text) {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) {
            if ((els[i].textContent || '').trim().indexOf(text) === 0) return els[i];
        }
        return null;
    }

    /* ── Get the first non-empty text node content of el ─────────────── */
    function firstText(el) {
        if (!el) return '';
        for (var i = 0; i < el.childNodes.length; i++) {
            if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim())
                return el.childNodes[i].textContent.trim();
        }
        return (el.textContent || '').trim();
    }

    /* ════════════════════════════════════════════════════════════════════
       STEP 1 — annotateAll()
       Stamps data-i18n on every translatable element in the DOM.
       Called once on boot and again after each navigate() so that
       dynamically-rendered pages also get annotated.
    ════════════════════════════════════════════════════════════════════ */
    function annotateAll() {

        /* ── Sidebar section labels ─────────────────────────────────── */
        document.querySelectorAll('.sidebar .section-label').forEach(function (el) {
            var t = el.textContent.trim();
            if (t === 'Tracking')  ann(el, 'nav_tracking');
            if (t === 'Analytics') ann(el, 'nav_analytics_label');
            if (t === 'Explore')   ann(el, 'nav_explore');
            if (t === 'Data')      ann(el, 'nav_data_label');
        });

        /* ── Sidebar nav item text spans ────────────────────────────── */
        var SIDEBAR_MAP = {
            'Overview':'nav_overview','Daily Check-In':'nav_checkin',
            'Calendar':'nav_calendar','Journal':'nav_journal',
            'Mood Trends':'nav_mood_trends','Sleep Analysis':'nav_sleep',
            'Energy Patterns':'nav_energy','Insights':'nav_insights',
            'Correlations':'nav_correlations','Mood Velocity':'nav_velocity',
            'Forecast':'nav_forecast','My Patterns':'nav_patterns',
            'Seasonal Rhythm':'nav_seasonal','Reports':'nav_reports',
            'Settings':'settings','Export & Backup':'nav_export'
        };
        document.querySelectorAll('.sidebar .nav span:not(.nav-icon)').forEach(function (el) {
            var key = SIDEBAR_MAP[el.textContent.trim()];
            if (key) ann(el, key);
        });

        /* ── Bottom nav ─────────────────────────────────────────────── */
        var BN_MAP = {
            'Overview':'nav_overview','Check-In':'nav_checkin_short',
            'Calendar':'nav_calendar','Journal':'nav_journal','Menu':'nav_menu'
        };
        document.querySelectorAll('.bottom-nav button span:not(.bn-icon)').forEach(function (el) {
            var key = BN_MAP[el.textContent.trim()];
            if (key) ann(el, key);
        });

        /* ── Dashboard empty state ──────────────────────────────────── */
        ann(document.querySelector('.des-title'),       'dash_welcome_title');
        ann(document.querySelector('.des-subtitle'),    'dash_welcome_subtitle');
        ann(document.querySelector('.des-cta-primary'), 'dash_start_checkin');
        ann(document.querySelector('.des-cta-secondary'),'dash_sample_data');
        document.querySelectorAll('.des-feature-text').forEach(function (el) {
            var t = el.textContent.trim();
            if (t.indexOf('Mood trends') === 0)       ann(el, 'dash_feat_mood');
            if (t.indexOf('Sleep pattern') === 0)     ann(el, 'dash_feat_sleep');
            if (t.indexOf('Personalised') === 0)      ann(el, 'dash_feat_insights');
        });

        /* ── Dashboard analytics nav block ─────────────────────────── */
        ann(document.querySelector('.dashboard-analytics-eyebrow'), 'dash_go_deeper');
        ann(document.querySelector('.dashboard-analytics-title'),   'nav_analytics_label');
        ann(document.querySelector('.dashboard-analytics-hint'),    'dash_analytics_hint');

        var TILE_LABEL_MAP = {
            'Insights':'nav_insights','Correlations':'nav_correlations',
            'Forecast':'nav_forecast','My Patterns':'nav_patterns',
            'Seasonal':'nav_seasonal_short','Mood Velocity':'nav_velocity'
        };
        var TILE_DESC_MAP = {
            'Patterns from your data':'tile_insights_desc',
            'Sleep, mood & energy links':'tile_corr_desc',
            'Where your mood may go':'tile_forecast_desc',
            'Sleep timeline & rhythms':'tile_patterns_desc',
            'Monthly & yearly rhythm':'tile_seasonal_desc',
            'Day-to-day change':'tile_velocity_desc'
        };
        document.querySelectorAll('.dashboard-nav-tile-label').forEach(function (el) {
            var key = TILE_LABEL_MAP[el.textContent.trim()];
            if (key) ann(el, key);
        });
        document.querySelectorAll('.dashboard-nav-tile-desc').forEach(function (el) {
            var key = TILE_DESC_MAP[el.textContent.trim()];
            if (key) ann(el, key);
        });

        /* ── Daily Check-In ─────────────────────────────────────────── */
        var entry = document.getElementById('entry');
        if (entry) {
            ann(entry.querySelector('h1'), 'daily_checkin');
            ann(entry.querySelector('.page-hero-subtitle'), 'checkin_subtitle');
            entry.querySelectorAll('p').forEach(function (p) {
                if ((p.textContent || '').trim().indexOf('One entry per day') === 0) ann(p, 'checkin_desc');
            });
            ann(document.getElementById('entryProgressLabel'), 'checkin_progress_label');

            /* Section headings */
            entry.querySelectorAll('.entry-section-heading').forEach(function (el) {
                var section = el.closest('[id]');
                var id = section ? section.id : '';
                if (id === 'entrySectionMoodEnergy') ann(el, 'checkin_mood_energy_heading');
                else if (id === 'entrySectionSleep') ann(el, 'checkin_sleep_heading');
                else if (id === 'entrySectionActivitiesTags') ann(el, 'checkin_activities_tags_heading');
                else if (id === 'entrySectionJournal') { /* already has data-i18n="journal" */ }
                else {
                    var ft = firstText(el);
                    if (ft === 'Date') ann(el, 'checkin_date_heading');
                }
            });

            /* Labels */
            var LABEL_MAP = {
                'Date':'checkin_date','Mood':'checkin_mood','Energy Level':'checkin_energy',
                'Sleep Duration':'checkin_sleep_duration','Sleep Quality':'checkin_sleep_quality',
                'Primary Sleep Time':'checkin_sleep_time','Primary Wake Time':'checkin_wake_time',
                'Sleep Segments':'checkin_sleep_segments','Activities':'checkin_activities',
                'Tags':'checkin_tags','Photos':'checkin_photos'
            };
            entry.querySelectorAll('label').forEach(function (el) {
                var key = LABEL_MAP[firstText(el)];
                if (key) ann(el, key);
            });

            /* Tag suggestions */
            var tagHint = document.querySelector('#tagSuggestionsLabel .tag-suggestions-hint');
            if (tagHint) ann(tagHint, 'checkin_tap_to_add');
            var tagLabel = document.getElementById('tagSuggestionsLabel');
            if (tagLabel && !tagLabel.querySelector('[data-i18n="checkin_suggested_tags"]')) {
                for (var i = 0; i < tagLabel.childNodes.length; i++) {
                    var cn = tagLabel.childNodes[i];
                    if (cn.nodeType === 3 && cn.textContent.trim()) {
                        var sp = document.createElement('span');
                        sp.setAttribute('data-i18n', 'checkin_suggested_tags');
                        sp.textContent = cn.textContent;
                        tagLabel.replaceChild(sp, cn);
                        break;
                    }
                }
            }

            /* Journal card inside check-in */
            ann(entry.querySelector('.journal-card-title'),    'checkin_daily_reflection');
            ann(entry.querySelector('.journal-card-subtitle'), 'checkin_reflection_desc');
            ann(entry.querySelector('.journal-preview-eyebrow'), 'checkin_saved_reflection');
            ann(findText('#entry .journal-secondary-link', 'Open full journal'), 'checkin_open_journal');

            /* Sleep helpers */
            ann(findText('#entry .form-hint', 'Use segments'), 'checkin_sleep_hint');
            ann(entry.querySelector('.sleep-segments-intro'), 'checkin_sleep_segments_intro');
            ann(document.getElementById('addSleepSegmentBtn'), 'checkin_add_segment');
            ann(entry.querySelector('.daily-summary-text'), 'checkin_no_summary');

            /* Undo / Redo / shortcut */
            var undoBtn = document.getElementById('undoBtn');
            var redoBtn = document.getElementById('redoBtn');
            if (undoBtn) ann(undoBtn.querySelector('span:first-child'), 'undo');
            if (redoBtn) ann(redoBtn.querySelector('span:first-child'), 'redo');
            ann(entry.querySelector('.shortcut-hint'), 'checkin_save_hint');
        }

        /* ── Calendar ───────────────────────────────────────────────── */
        var CAL_TAB_MAP = {
            'Year heatmap':'cal_year_heatmap','Month grid':'cal_month_grid',
            'Week timeline':'cal_week_timeline','List':'cal_list'
        };
        document.querySelectorAll('.calendar-view-tabs button').forEach(function (el) {
            var key = CAL_TAB_MAP[el.textContent.trim()];
            if (key) ann(el, key);
        });
        ann(document.querySelector('.heatmap-section-title'),    'cal_year_in_mood');
        ann(document.querySelector('.heatmap-section-subtitle'), 'cal_year_subtitle');

        /* ── Journal page ───────────────────────────────────────────── */
        var jp = document.getElementById('journal');
        if (jp) {
            ann(jp.querySelector('.journal-hero-subtitle'), 'journal_page_subtitle');
            ann(document.getElementById('journalUnsavedIndicator'), 'journal_unsaved');
            ann(document.getElementById('saveJournalBtn'), 'save_journal');
        }

        /* ── Analytics / content pages ──────────────────────────────── */
        function annPage(id, h1key, subkey, subSel) {
            var pg = document.getElementById(id);
            if (!pg) return;
            ann(pg.querySelector('h1'), h1key);
            if (subkey) {
                var subEl = pg.querySelector(subSel || '.page-subtitle,.page-hero-subtitle');
                ann(subEl, subkey);
            }
        }
        annPage('mood',         'nav_mood_trends',  'page_mood_subtitle');
        annPage('sleep',        'nav_sleep',        'page_sleep_subtitle');
        annPage('energy',       'nav_energy',       'page_energy_subtitle');
        annPage('circadian',    'page_velocity_h1', 'page_velocity_subtitle', '.circadian-page-subtitle');
        annPage('correlations', 'nav_correlations', 'page_corr_subtitle');
        annPage('patterns',     'nav_patterns',     'page_patterns_subtitle');
        annPage('seasonal',     'page_seasonal_h1', 'page_seasonal_subtitle', '.page-hero-subtitle');
        annPage('predictions',  'nav_forecast',     'page_forecast_subtitle', '.page-hero-subtitle,.page-subtitle');
        annPage('reports',      'nav_reports',      null);
        var insightsPage = document.getElementById('insights');
        if (insightsPage) {
            ann(insightsPage.querySelector('h1'), 'nav_insights');
            ann(insightsPage.querySelector('.insights-eyebrow'), 'insights_eyebrow');
            ann(insightsPage.querySelector('.page-hero-subtitle, #insightsOverviewText'), 'insights_overview');
            insightsPage.querySelectorAll('.insights-hero-chip').forEach(function (el) {
                var t = (el.textContent || '').trim();
                if (t.indexOf('Correlations') !== -1)  ann(el.querySelector('span:not([aria-hidden])') || el, 'nav_correlations');
                if (t.indexOf('My Patterns') !== -1)   ann(el.querySelector('span:not([aria-hidden])') || el, 'nav_patterns');
                if (t.indexOf('Forecast') !== -1)      ann(el.querySelector('span:not([aria-hidden])') || el, 'nav_forecast');
            });
        }
        var dataPage = document.getElementById('data');
        if (dataPage) {
            ann(dataPage.querySelector('h1'), 'nav_export');
            ann(dataPage.querySelector('.page-hero-subtitle'), 'page_export_subtitle');
        }

        /* ── Reports tabs ───────────────────────────────────────────── */
        document.querySelectorAll('.report-tabs button').forEach(function (el) {
            var t = el.textContent.trim();
            if (t === 'Week')  ann(el, 'report_week');
            if (t === 'Month') ann(el, 'report_month');
            if (t === 'Year')  ann(el, 'report_year');
        });
        ann(findText('.report-pdf-row .btn', 'Export report'), 'report_export_pdf');

        /* ── Settings page ──────────────────────────────────────────── */
        var sp = document.getElementById('settings');
        if (sp) {
            ann(sp.querySelector('h1'), 'settings');
            var CARD_MAP = {
                'Appearance':    ['s_appearance',     's_appearance_desc'],
                'Preferences':   ['s_preferences',    's_preferences_desc'],
                'Custom metrics':['s_custom_metrics', 's_custom_metrics_desc'],
                'Data & Privacy':['s_privacy',        's_privacy_desc']
            };
            sp.querySelectorAll('.card').forEach(function (card) {
                var h3 = card.querySelector('h3');
                if (!h3) return;
                var m = CARD_MAP[h3.textContent.trim()];
                if (!m) return;
                ann(h3, m[0]);
                var desc = card.querySelector('.card-desc');
                if (desc && m[1]) ann(desc, m[1]);
            });
            var SET_LABEL_MAP = {
                'Theme':'s_theme','Dark mode':'s_dark_mode',
                'Success sound':'s_sound','Ambient particles':'s_particles',
                'Parallax scrolling':'s_parallax','Language':'s_language',
                'Date format':'s_date_format','Time format':'s_time_format',
                'Chart default days':'s_chart_days','Reduce motion':'s_reduce_motion',
                'Enable notifications (browser)':'s_notifications',
                'Show Mood chart':'s_show_mood','Show Sleep chart':'s_show_sleep',
                'Show Energy chart':'s_show_energy','Favourite tags':'s_favourite_tags',
                'Default activities':'s_default_activities'
            };
            sp.querySelectorAll('label').forEach(function (el) {
                var key = SET_LABEL_MAP[firstText(el)];
                if (key) ann(el, key);
            });
            sp.querySelectorAll('h4').forEach(function (el) {
                if (el.textContent.indexOf('Dashboard widgets') !== -1) ann(el, 's_dashboard_widgets');
            });
            sp.querySelectorAll('button').forEach(function (el) {
                if (el.textContent.trim() === 'Delete all my data') ann(el, 's_delete_all');
            });
        }

        /* ── Entry modal footer ─────────────────────────────────────── */
        ann(document.getElementById('entryModalEditBtn'),    'modal_full_edit');
        ann(document.getElementById('entryModalJournalBtn'), 'modal_journal');
        ann(findText('.entry-modal-footer button', 'Close'),  'modal_close');

        /* ── Delete-all modal ───────────────────────────────────────── */
        ann(document.getElementById('deleteAllModalTitle'), 'delete_all_title');
        ann(document.getElementById('deleteAllModalDesc'),  'delete_all_desc');
        ann(findText('#deleteAllModal .btn-danger, #deleteAllModal .btn', 'Delete all'), 'delete_all_confirm');
        ann(findText('#deleteAllModal .btn-secondary, #deleteAllModal button', 'Cancel'), 'modal_cancel');

        /* ── PWA banners ────────────────────────────────────────────── */
        document.querySelectorAll('.pwa-banner-text').forEach(function (el) {
            var t = el.textContent.trim();
            if (t.indexOf('Install Aura') !== -1) ann(el, 'pwa_install_text');
            if (t.indexOf('new version')  !== -1) ann(el, 'pwa_update_text');
        });
        document.querySelectorAll('.pwa-banner button').forEach(function (el) {
            var t = el.textContent.trim();
            if (t === 'Not now') ann(el, 'pwa_not_now');
            if (t === 'Install') ann(el, 'pwa_install_btn');
            if (t === 'Reload')  ann(el, 'pwa_reload');
        });
    }

    /* ════════════════════════════════════════════════════════════════════
       STEP 2 — applyBatchE(locale)
       Safe first-text-node replacement — identical to Batch D strategy
       so child elements (checkmarks, icons, etc.) are never destroyed.
    ════════════════════════════════════════════════════════════════════ */
    function applyBatchE(locale) {
        var loc = String(locale || 'en').split('-')[0];
        var t = T_E[loc] || T_E['en'];
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = t[key];
            if (val == null) return;
            /* placeholder shortcut */
            if (el.getAttribute('data-i18n-placeholder')) { el.placeholder = val; return; }
            /* replace first non-empty text node — preserves child elements */
            var replaced = false;
            for (var i = 0; i < el.childNodes.length; i++) {
                var cn = el.childNodes[i];
                if (cn.nodeType === 3 && cn.textContent.trim()) {
                    cn.textContent = val + ' ';
                    replaced = true;
                    break;
                }
            }
            if (!replaced && !el.children.length) el.textContent = val;
        });
    }

    /* ════════════════════════════════════════════════════════════════════
       STEP 3 — Full translation table  T_E
       Keys are grouped: nav / dashboard / check-in / calendar / journal /
       analytics-pages / settings / modals / pwa / legacy-compat
    ════════════════════════════════════════════════════════════════════ */
    var T_E = {

/* ──────────────────────────────── ENGLISH ─────────────────────────── */
en: {
    /* Nav */
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
    /* Check-In */
    daily_checkin:'Daily Check-In',
    checkin_subtitle:'Log your mood, sleep, and energy.',
    checkin_desc:'One entry per day — quick or detailed, your choice.',
    checkin_progress_label:'Fill in the sections below',
    checkin_date_heading:'Date', checkin_date:'Date',
    checkin_mood_energy_heading:'Mood & Energy',
    checkin_sleep_heading:'Sleep',
    checkin_activities_tags_heading:'Activities & Tags',
    checkin_mood:'Mood', checkin_energy:'Energy Level',
    checkin_sleep_duration:'Sleep Duration', checkin_sleep_quality:'Sleep Quality',
    checkin_sleep_time:'Primary Sleep Time', checkin_wake_time:'Primary Wake Time',
    checkin_sleep_segments:'Sleep Segments',
    checkin_activities:'Activities', checkin_tags:'Tags', checkin_photos:'Photos',
    checkin_suggested_tags:'Suggested tags', checkin_tap_to_add:'Tap to add',
    checkin_daily_reflection:'Daily Reflection',
    checkin_reflection_desc:'Capture how the day felt, what mattered, and what you noticed.',
    checkin_saved_reflection:'Saved reflection',
    checkin_open_journal:'Open full journal',
    checkin_sleep_hint:'Use segments to track fragmented or polyphasic sleep.',
    checkin_sleep_segments_intro:'Capture split or interrupted sleep in separate segments.',
    checkin_add_segment:'+ Add Sleep Segment',
    checkin_save_hint:'⌘S to save',
    checkin_no_summary:'Not enough data to generate a summary yet.',
    undo:'Undo', redo:'Redo',
    /* Calendar */
    calendar_title:'Calendar',
    calendar_subtitle:'Explore your mood history across days, weeks and months.',
    cal_year_heatmap:'Year heatmap', cal_month_grid:'Month grid',
    cal_week_timeline:'Week timeline', cal_list:'List',
    cal_year_in_mood:'Year in Mood',
    cal_year_subtitle:'Track your mood consistency across the past year',
    /* Journal */
    journal:'Journal',
    journal_page_subtitle:'Write freely — this is only for you.',
    journal_unsaved:'Unsaved changes',
    save_journal:'Save Journal',
    save_entry:'Save Entry',
    edit_journal_entry:'Edit journal entry',
    journal_saved_placeholder:'Your journal entry for today has already been saved.',
    one_journal_per_day:'Only one journal entry can be created per day.',
    add_photo:'📷 Add Photo',
    /* Analytics pages */
    nav_mood_trends:'Mood Trends',
    page_mood_subtitle:'Patterns and trends in your emotional wellbeing.',
    nav_sleep:'Sleep Analysis',
    page_sleep_subtitle:'Quality and consistency of your rest.',
    nav_energy:'Energy Patterns',
    page_energy_subtitle:'Rhythm and stamina across days.',
    page_velocity_h1:'Mood Velocity & Stability',
    page_velocity_subtitle:'See how your mood shifts day to day and how stable you feel over two weeks.',
    nav_correlations:'Correlations',
    page_corr_subtitle:'Discover relationships between your tracked metrics.',
    nav_patterns:'My Patterns',
    page_patterns_subtitle:'Sleep, activity and mood patterns.',
    page_seasonal_h1:'Seasonal & Rhythm Analysis',
    page_seasonal_subtitle:'Uncover how your mood, sleep and energy shift across seasons and years.',
    nav_forecast:'Forecast',
    page_forecast_subtitle:'Predictive trends based on your recent data.',
    insights_eyebrow:'Personal Analytics',
    insights_overview:'Patterns from your data. The more you log, the sharper these become.',
    nav_export:'Export & Backup',
    page_export_subtitle:'Your data belongs to you. Download, back up, or import at any time.',
    /* Reports */
    nav_reports:'Reports',
    report_week:'Week', report_month:'Month', report_year:'Year',
    report_export_pdf:'Export report as PDF',
    /* Modals */
    modal_full_edit:'✏️ Full Edit', modal_journal:'📓 Journal', modal_close:'Close',
    modal_cancel:'Cancel',
    delete_all_title:'Delete all my data',
    delete_all_desc:'This permanently deletes all entries, journal, backups, and settings.',
    delete_all_confirm:'Delete everything',
    delete_entry:'Delete Entry',
    /* Daily summary */
    daily_summary:'Daily Summary',
    /* Mood labels */
    low_mood:'Low mood', neutral:'Neutral', good_mood:'Good mood', today:'Today',
    export_heatmap:'Export Heatmap',
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
    s_privacy_desc:'All data is stored locally on your device. Nothing is sent to any server.',
    s_delete_all:'Delete all my data',
    s_favourite_tags:'Favourite tags', s_default_activities:'Default activities',
    /* PWA */
    pwa_install_text:'Install Aura for quick access and offline use.',
    pwa_not_now:'Not now', pwa_install_btn:'Install',
    pwa_update_text:'A new version is available.', pwa_reload:'Reload'
},

/* ─────────────────────────────── GERMAN ──────────────────────────── */
de: {
    nav_tracking:'Tracking', nav_analytics_label:'Analytik',
    nav_explore:'Erkunden', nav_data_label:'Daten',
    nav_overview:'Übersicht', nav_checkin:'Tages-Check-in', nav_checkin_short:'Check-in',
    nav_calendar:'Kalender', nav_journal:'Tagebuch', nav_mood_trends:'Stimmungstrends',
    nav_sleep:'Schlafanalyse', nav_energy:'Energiemuster', nav_insights:'Einblicke',
    nav_correlations:'Korrelationen', nav_velocity:'Stimmungsveränderung', nav_forecast:'Prognose',
    nav_patterns:'Meine Muster', nav_seasonal:'Saisonaler Rhythmus', nav_reports:'Berichte',
    nav_export:'Export & Sicherung', nav_menu:'Menü', nav_seasonal_short:'Saisonal',
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
    daily_checkin:'Tages-Check-in',
    checkin_subtitle:'Erfasse deine Stimmung, deinen Schlaf und deine Energie.',
    checkin_desc:'Ein Eintrag pro Tag — kurz oder detailliert, du entscheidest.',
    checkin_progress_label:'Fülle die Abschnitte unten aus',
    checkin_date_heading:'Datum', checkin_date:'Datum',
    checkin_mood_energy_heading:'Stimmung & Energie',
    checkin_sleep_heading:'Schlaf',
    checkin_activities_tags_heading:'Aktivitäten & Tags',
    checkin_mood:'Stimmung', checkin_energy:'Energieniveau',
    checkin_sleep_duration:'Schlafdauer', checkin_sleep_quality:'Schlafqualität',
    checkin_sleep_time:'Hauptschlafzeit', checkin_wake_time:'Hauptaufwachzeit',
    checkin_sleep_segments:'Schlafphasen',
    checkin_activities:'Aktivitäten', checkin_tags:'Tags', checkin_photos:'Fotos',
    checkin_suggested_tags:'Vorgeschlagene Tags', checkin_tap_to_add:'Tippen zum Hinzufügen',
    checkin_daily_reflection:'Tagesreflexion',
    checkin_reflection_desc:'Halte fest, wie der Tag war, was wichtig war und was du bemerkt hast.',
    checkin_saved_reflection:'Gespeicherte Reflexion',
    checkin_open_journal:'Vollständiges Tagebuch öffnen',
    checkin_sleep_hint:'Verwende Segmente für fragmentierten oder polyphasischen Schlaf.',
    checkin_sleep_segments_intro:'Erfasse geteilten oder unterbrochenen Schlaf in separaten Segmenten.',
    checkin_add_segment:'+ Schlafphase hinzufügen',
    checkin_save_hint:'⌘S zum Speichern',
    checkin_no_summary:'Noch nicht genug Daten für eine Zusammenfassung.',
    undo:'Rückgängig', redo:'Wiederholen',
    calendar_title:'Kalender',
    calendar_subtitle:'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.',
    cal_year_heatmap:'Jahres-Heatmap', cal_month_grid:'Monatsgitter',
    cal_week_timeline:'Wochen-Timeline', cal_list:'Liste',
    cal_year_in_mood:'Jahr in Stimmung',
    cal_year_subtitle:'Verfolge deine Stimmungskonsistenz über das vergangene Jahr',
    journal:'Tagebuch',
    journal_page_subtitle:'Schreibe frei — das ist nur für dich.',
    journal_unsaved:'Ungespeicherte Änderungen',
    save_journal:'Tagebuch speichern',
    save_entry:'Eintrag speichern',
    edit_journal_entry:'Tagebucheintrag bearbeiten',
    journal_saved_placeholder:'Dein Tagebucheintrag für heute wurde bereits gespeichert.',
    one_journal_per_day:'Pro Tag kann nur ein Tagebucheintrag erstellt werden.',
    add_photo:'📷 Foto hinzufügen',
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
    page_export_subtitle:'Deine Daten gehören dir. Lade sie jederzeit herunter, sichere oder importiere sie.',
    nav_reports:'Berichte',
    report_week:'Woche', report_month:'Monat', report_year:'Jahr',
    report_export_pdf:'Bericht als PDF exportieren',
    modal_full_edit:'✏️ Vollständig bearbeiten', modal_journal:'📓 Tagebuch', modal_close:'Schließen',
    modal_cancel:'Abbrechen',
    delete_all_title:'Alle Daten löschen',
    delete_all_desc:'Alle Einträge, Tagebücher, Sicherungen und Einstellungen werden dauerhaft gelöscht.',
    delete_all_confirm:'Alles löschen',
    delete_entry:'Eintrag löschen',
    daily_summary:'Tageszusammenfassung',
    low_mood:'Niedrige Stimmung', neutral:'Neutral', good_mood:'Gute Stimmung', today:'Heute',
    export_heatmap:'Heatmap exportieren',
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
    s_favourite_tags:'Lieblingstags', s_default_activities:'Standard-Aktivitäten',
    pwa_install_text:'Aura installieren für schnellen Zugang und Offline-Nutzung.',
    pwa_not_now:'Nicht jetzt', pwa_install_btn:'Installieren',
    pwa_update_text:'Eine neue Version ist verfügbar.', pwa_reload:'Neu laden'
},

/* ─────────────────────────────── FRENCH ──────────────────────────── */
fr: {
    nav_tracking:'Suivi', nav_analytics_label:'Analytique',
    nav_explore:'Explorer', nav_data_label:'Données',
    nav_overview:"Vue d'ensemble", nav_checkin:'Bilan du jour', nav_checkin_short:'Bilan',
    nav_calendar:'Calendrier', nav_journal:'Journal', nav_mood_trends:"Tendances d'humeur",
    nav_sleep:'Analyse du sommeil', nav_energy:'Énergie', nav_insights:'Perspectives',
    nav_correlations:'Corrélations', nav_velocity:"Vélocité d'humeur", nav_forecast:'Prévisions',
    nav_patterns:'Mes habitudes', nav_seasonal:'Rythme saisonnier', nav_reports:'Rapports',
    nav_export:'Export & Sauvegarde', nav_menu:'Menu', nav_seasonal_short:'Saisonnier',
    dash_welcome_title:'Bienvenue sur Aura Mood',
    dash_welcome_subtitle:"Suivez votre humeur, votre sommeil et votre énergie chaque jour. Les tendances émergent après une semaine.",
    dash_start_checkin:'Commencer le bilan du jour →',
    dash_sample_data:'Explorer avec des données exemple',
    dash_feat_mood:"Tendances d'humeur & prévisions",
    dash_feat_sleep:'Analyse des patterns de sommeil',
    dash_feat_insights:'Perspectives personnalisées',
    dash_go_deeper:'Aller plus loin',
    dash_analytics_hint:'Explorez tendances, corrélations et prévisions depuis vos données.',
    tile_insights_desc:'Tendances de vos données',
    tile_corr_desc:"Liens sommeil, humeur & énergie",
    tile_forecast_desc:"Où va votre humeur",
    tile_patterns_desc:'Timeline & rythmes de sommeil',
    tile_seasonal_desc:'Rythme mensuel & annuel',
    tile_velocity_desc:'Changement jour par jour',
    daily_checkin:'Bilan du jour',
    checkin_subtitle:'Notez votre humeur, votre sommeil et votre énergie.',
    checkin_desc:'Une entrée par jour — courte ou détaillée, à votre choix.',
    checkin_progress_label:'Remplissez les sections ci-dessous',
    checkin_date_heading:'Date', checkin_date:'Date',
    checkin_mood_energy_heading:'Humeur & Énergie',
    checkin_sleep_heading:'Sommeil',
    checkin_activities_tags_heading:'Activités & Tags',
    checkin_mood:'Humeur', checkin_energy:"Niveau d'énergie",
    checkin_sleep_duration:'Durée du sommeil', checkin_sleep_quality:'Qualité du sommeil',
    checkin_sleep_time:'Heure de coucher principale', checkin_wake_time:'Heure de réveil principale',
    checkin_sleep_segments:'Segments de sommeil',
    checkin_activities:'Activités', checkin_tags:'Tags', checkin_photos:'Photos',
    checkin_suggested_tags:'Tags suggérés', checkin_tap_to_add:'Appuyer pour ajouter',
    checkin_daily_reflection:'Réflexion du jour',
    checkin_reflection_desc:"Notez comment s'est passée la journée, ce qui a compté, ce que vous avez remarqué.",
    checkin_saved_reflection:'Réflexion sauvegardée',
    checkin_open_journal:'Ouvrir le journal complet',
    checkin_sleep_hint:'Utilisez des segments pour un sommeil fragmenté ou polyphasique.',
    checkin_sleep_segments_intro:'Capturez un sommeil divisé ou interrompu en segments séparés.',
    checkin_add_segment:'+ Ajouter un segment de sommeil',
    checkin_save_hint:'⌘S pour sauvegarder',
    checkin_no_summary:"Pas encore assez de données pour générer un résumé.",
    undo:'Annuler', redo:'Rétablir',
    calendar_title:'Calendrier',
    calendar_subtitle:"Explorez votre historique d'humeur par jour, semaine et mois.",
    cal_year_heatmap:'Carte thermique annuelle', cal_month_grid:'Grille mensuelle',
    cal_week_timeline:'Chronologie hebdomadaire', cal_list:'Liste',
    cal_year_in_mood:"Année en humeur",
    cal_year_subtitle:"Suivez votre constance d'humeur sur l'année passée",
    journal:'Journal',
    journal_page_subtitle:"Écrivez librement — c'est seulement pour vous.",
    journal_unsaved:'Modifications non sauvegardées',
    save_journal:'Sauvegarder le journal',
    save_entry:'Enregistrer',
    edit_journal_entry:"Modifier l'entrée du journal",
    journal_saved_placeholder:'Votre entrée a déjà été enregistrée.',
    one_journal_per_day:'Un seule entrée de journal peut être créée par jour.',
    add_photo:'📷 Ajouter une photo',
    page_mood_subtitle:"Tendances et patterns de votre bien-être émotionnel.",
    page_sleep_subtitle:'Qualité et régularité de votre repos.',
    page_energy_subtitle:'Rythme et endurance au fil des jours.',
    page_velocity_h1:"Vélocité & Stabilité de l'Humeur",
    page_velocity_subtitle:'Voyez comment votre humeur évolue de jour en jour.',
    page_corr_subtitle:'Découvrez les relations entre vos métriques suivies.',
    page_patterns_subtitle:"Patterns de sommeil, d'activité et d'humeur.",
    page_seasonal_h1:'Analyse saisonnière & Rythme',
    page_seasonal_subtitle:"Découvrez comment votre humeur, sommeil et énergie évoluent selon les saisons.",
    page_forecast_subtitle:'Tendances prédictives basées sur vos données récentes.',
    insights_eyebrow:'Analytique personnelle',
    insights_overview:"Tendances de vos données. Plus vous enregistrez, plus elles s'affinent.",
    page_export_subtitle:"Vos données vous appartiennent. Téléchargez, sauvegardez ou importez à tout moment.",
    nav_reports:'Rapports',
    report_week:'Semaine', report_month:'Mois', report_year:'Année',
    report_export_pdf:'Exporter le rapport en PDF',
    modal_full_edit:'✏️ Modifier', modal_journal:'📓 Journal', modal_close:'Fermer',
    modal_cancel:'Annuler',
    delete_all_title:'Supprimer toutes mes données',
    delete_all_desc:'Supprime définitivement toutes les entrées, le journal, les sauvegardes et les paramètres.',
    delete_all_confirm:'Tout supprimer',
    delete_entry:"Supprimer l'entrée",
    daily_summary:'Résumé du jour',
    low_mood:'Humeur basse', neutral:'Neutre', good_mood:'Bonne humeur', today:"Aujourd'hui",
    export_heatmap:'Exporter la heatmap',
    settings:'Paramètres',
    s_appearance:'Apparence', s_appearance_desc:"Thème et préférences d'affichage.",
    s_theme:'Thème', s_dark_mode:'Mode sombre',
    s_sound:'Son de succès', s_particles:'Particules ambiantes', s_parallax:'Défilement parallaxe',
    s_preferences:'Préférences', s_preferences_desc:"Options par défaut et d'affichage.",
    s_language:'Langue', s_date_format:'Format de date', s_time_format:"Format de l'heure",
    s_chart_days:'Jours par défaut du graphique', s_reduce_motion:'Réduire les animations',
    s_notifications:'Activer les notifications (navigateur)',
    s_dashboard_widgets:'Widgets du tableau de bord',
    s_show_mood:"Afficher le graphique d'humeur", s_show_sleep:'Afficher le graphique de sommeil', s_show_energy:"Afficher le graphique d'énergie",
    s_custom_metrics:'Métriques personnalisées',
    s_custom_metrics_desc:'Ajoutez vos propres métriques (ex. anxiété, douleur, productivité).',
    s_privacy:'Données & Confidentialité',
    s_privacy_desc:'Toutes les données sont stockées localement sur votre appareil.',
    s_delete_all:'Supprimer toutes mes données',
    s_favourite_tags:'Tags favoris', s_default_activities:'Activités par défaut',
    pwa_install_text:"Installez Aura pour un accès rapide et hors ligne.",
    pwa_not_now:'Pas maintenant', pwa_install_btn:'Installer',
    pwa_update_text:'Une nouvelle version est disponible.', pwa_reload:'Recharger'
},

/* ───────────────────────────── SPANISH ───────────────────────────── */
es: {
    nav_tracking:'Seguimiento', nav_analytics_label:'Analíticas',
    nav_explore:'Explorar', nav_data_label:'Datos',
    nav_overview:'Resumen', nav_checkin:'Registro diario', nav_checkin_short:'Registro',
    nav_calendar:'Calendario', nav_journal:'Diario', nav_mood_trends:'Tendencias de ánimo',
    nav_sleep:'Análisis de sueño', nav_energy:'Patrones de energía', nav_insights:'Perspectivas',
    nav_correlations:'Correlaciones', nav_velocity:'Velocidad del ánimo', nav_forecast:'Pronóstico',
    nav_patterns:'Mis patrones', nav_seasonal:'Ritmo estacional', nav_reports:'Informes',
    nav_export:'Exportar y copia', nav_menu:'Menú', nav_seasonal_short:'Estacional',
    dash_welcome_title:'Bienvenido a Aura Mood',
    dash_welcome_subtitle:'Registra tu ánimo, sueño y energía cada día. Los patrones emergen tras una semana.',
    dash_start_checkin:'Empezar el registro de hoy →',
    dash_sample_data:'Explorar con datos de muestra',
    dash_feat_mood:'Tendencias de ánimo y pronósticos',
    dash_feat_sleep:'Análisis de patrones de sueño',
    dash_feat_insights:'Perspectivas personalizadas',
    dash_go_deeper:'Profundizar',
    dash_analytics_hint:'Explora patrones, correlaciones y pronósticos desde tus datos.',
    tile_insights_desc:'Patrones de tus datos',
    tile_corr_desc:'Vínculos sueño, ánimo y energía',
    tile_forecast_desc:'Hacia dónde va tu ánimo',
    tile_patterns_desc:'Línea de tiempo de sueño',
    tile_seasonal_desc:'Ritmo mensual y anual',
    tile_velocity_desc:'Cambio día a día',
    daily_checkin:'Registro diario',
    checkin_subtitle:'Registra tu ánimo, sueño y energía.',
    checkin_desc:'Una entrada por día — corta o detallada, a tu elección.',
    checkin_progress_label:'Completa las secciones abajo',
    checkin_date_heading:'Fecha', checkin_date:'Fecha',
    checkin_mood_energy_heading:'Ánimo y Energía',
    checkin_sleep_heading:'Sueño',
    checkin_activities_tags_heading:'Actividades y Etiquetas',
    checkin_mood:'Ánimo', checkin_energy:'Nivel de energía',
    checkin_sleep_duration:'Duración del sueño', checkin_sleep_quality:'Calidad del sueño',
    checkin_sleep_time:'Hora principal de dormir', checkin_wake_time:'Hora principal de despertar',
    checkin_sleep_segments:'Segmentos de sueño',
    checkin_activities:'Actividades', checkin_tags:'Etiquetas', checkin_photos:'Fotos',
    checkin_suggested_tags:'Etiquetas sugeridas', checkin_tap_to_add:'Toca para añadir',
    checkin_daily_reflection:'Reflexión diaria',
    checkin_reflection_desc:'Captura cómo fue el día, qué importó y qué notaste.',
    checkin_saved_reflection:'Reflexión guardada',
    checkin_open_journal:'Abrir el diario completo',
    checkin_sleep_hint:'Usa segmentos para el sueño fragmentado o polifásico.',
    checkin_sleep_segments_intro:'Captura el sueño dividido o interrumpido en segmentos separados.',
    checkin_add_segment:'+ Añadir segmento de sueño',
    checkin_save_hint:'⌘S para guardar',
    checkin_no_summary:'Todavía no hay suficientes datos para generar un resumen.',
    undo:'Deshacer', redo:'Rehacer',
    calendar_title:'Calendario',
    calendar_subtitle:'Explora tu historial de ánimo por días, semanas y meses.',
    cal_year_heatmap:'Mapa de calor anual', cal_month_grid:'Cuadrícula mensual',
    cal_week_timeline:'Línea de tiempo semanal', cal_list:'Lista',
    cal_year_in_mood:'Año en estado de ánimo',
    cal_year_subtitle:'Sigue la consistencia de tu ánimo durante el año pasado',
    journal:'Diario',
    journal_page_subtitle:'Escribe libremente — esto es solo para ti.',
    journal_unsaved:'Cambios sin guardar',
    save_journal:'Guardar diario',
    save_entry:'Guardar entrada',
    edit_journal_entry:'Editar entrada del diario',
    journal_saved_placeholder:'Tu entrada del diario de hoy ya ha sido guardada.',
    one_journal_per_day:'Solo se puede crear una entrada de diario por día.',
    add_photo:'📷 Añadir foto',
    page_mood_subtitle:'Patrones y tendencias de tu bienestar emocional.',
    page_sleep_subtitle:'Calidad y consistencia de tu descanso.',
    page_energy_subtitle:'Ritmo y resistencia a lo largo de los días.',
    page_velocity_h1:'Velocidad y Estabilidad del Ánimo',
    page_velocity_subtitle:'Ve cómo tu ánimo cambia día a día.',
    page_corr_subtitle:'Descubre relaciones entre tus métricas registradas.',
    page_patterns_subtitle:'Patrones de sueño, actividad y ánimo.',
    page_seasonal_h1:'Análisis Estacional y de Ritmo',
    page_seasonal_subtitle:'Descubre cómo tu ánimo, sueño y energía cambian según las estaciones.',
    page_forecast_subtitle:'Tendencias predictivas basadas en tus datos recientes.',
    insights_eyebrow:'Analítica personal',
    insights_overview:'Patrones de tus datos. Cuanto más registres, más precisos se vuelven.',
    page_export_subtitle:'Tus datos son tuyos. Descarga, respalda o importa en cualquier momento.',
    nav_reports:'Informes',
    report_week:'Semana', report_month:'Mes', report_year:'Año',
    report_export_pdf:'Exportar informe como PDF',
    modal_full_edit:'✏️ Edición completa', modal_journal:'📓 Diario', modal_close:'Cerrar',
    modal_cancel:'Cancelar',
    delete_all_title:'Eliminar todos mis datos',
    delete_all_desc:'Elimina permanentemente todas las entradas, el diario, las copias y los ajustes.',
    delete_all_confirm:'Eliminar todo',
    delete_entry:'Eliminar entrada',
    daily_summary:'Resumen del día',
    low_mood:'Ánimo bajo', neutral:'Neutral', good_mood:'Buen ánimo', today:'Hoy',
    export_heatmap:'Exportar mapa de calor',
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
    pwa_install_text:'Instala Aura para acceso rápido y uso sin conexión.',
    pwa_not_now:'Ahora no', pwa_install_btn:'Instalar',
    pwa_update_text:'Hay una nueva versión disponible.', pwa_reload:'Recargar'
},

/* ────────────────────────────── ITALIAN ──────────────────────────── */
it: {
    nav_tracking:'Monitoraggio', nav_analytics_label:'Analitiche',
    nav_explore:'Esplora', nav_data_label:'Dati',
    nav_overview:'Panoramica', nav_checkin:'Check-in giornaliero', nav_checkin_short:'Check-in',
    nav_calendar:'Calendario', nav_journal:'Diario', nav_mood_trends:'Tendenze umore',
    nav_sleep:'Analisi sonno', nav_energy:'Schemi energia', nav_insights:'Approfondimenti',
    nav_correlations:'Correlazioni', nav_velocity:'Velocità umore', nav_forecast:'Previsioni',
    nav_patterns:'I miei schemi', nav_seasonal:'Ritmo stagionale', nav_reports:'Rapporti',
    nav_export:'Esporta e backup', nav_menu:'Menu', nav_seasonal_short:'Stagionale',
    dash_welcome_title:'Benvenuto su Aura Mood',
    dash_welcome_subtitle:'Traccia il tuo umore, sonno ed energia ogni giorno. I pattern emergono dopo una settimana.',
    dash_start_checkin:"Inizia il check-in di oggi →",
    dash_sample_data:'Esplora con dati di esempio',
    dash_feat_mood:'Tendenze umore e previsioni',
    dash_feat_sleep:'Analisi schemi sonno',
    dash_feat_insights:'Approfondimenti personalizzati',
    dash_go_deeper:'Approfondisci',
    dash_analytics_hint:'Esplora schemi, correlazioni e previsioni dai tuoi dati.',
    tile_insights_desc:'Schemi dai tuoi dati',
    tile_corr_desc:'Link sonno, umore ed energia',
    tile_forecast_desc:'Dove va il tuo umore',
    tile_patterns_desc:'Timeline e ritmi del sonno',
    tile_seasonal_desc:'Ritmo mensile e annuale',
    tile_velocity_desc:'Cambiamento giorno per giorno',
    daily_checkin:'Check-in giornaliero',
    checkin_subtitle:'Registra il tuo umore, sonno ed energia.',
    checkin_desc:'Una voce al giorno — breve o dettagliata, a tua scelta.',
    checkin_progress_label:'Compila le sezioni qui sotto',
    checkin_date_heading:'Data', checkin_date:'Data',
    checkin_mood_energy_heading:'Umore ed Energia',
    checkin_sleep_heading:'Sonno',
    checkin_activities_tags_heading:'Attività e Tag',
    checkin_mood:'Umore', checkin_energy:'Livello di energia',
    checkin_sleep_duration:'Durata del sonno', checkin_sleep_quality:'Qualità del sonno',
    checkin_sleep_time:'Ora di sonno principale', checkin_wake_time:'Ora di sveglia principale',
    checkin_sleep_segments:'Segmenti di sonno',
    checkin_activities:'Attività', checkin_tags:'Tag', checkin_photos:'Foto',
    checkin_suggested_tags:'Tag suggeriti', checkin_tap_to_add:'Tocca per aggiungere',
    checkin_daily_reflection:'Riflessione giornaliera',
    checkin_reflection_desc:"Cattura come è andata la giornata, cosa è contato e cosa hai notato.",
    checkin_saved_reflection:'Riflessione salvata',
    checkin_open_journal:'Apri il diario completo',
    checkin_sleep_hint:'Usa segmenti per il sonno frammentato o polifasico.',
    checkin_sleep_segments_intro:'Cattura il sonno diviso o interrotto in segmenti separati.',
    checkin_add_segment:'+ Aggiungi segmento di sonno',
    checkin_save_hint:'⌘S per salvare',
    checkin_no_summary:'Dati insufficienti per generare un riepilogo.',
    undo:'Annulla', redo:'Ripristina',
    calendar_title:'Calendario',
    calendar_subtitle:"Esplora la tua cronologia dell'umore per giorni, settimane e mesi.",
    cal_year_heatmap:'Heatmap annuale', cal_month_grid:'Griglia mensile',
    cal_week_timeline:'Cronologia settimanale', cal_list:'Lista',
    cal_year_in_mood:"Anno in umore",
    cal_year_subtitle:"Monitora la consistenza dell'umore nell'anno passato",
    journal:'Diario',
    journal_page_subtitle:'Scrivi liberamente — è solo per te.',
    journal_unsaved:'Modifiche non salvate',
    save_journal:'Salva diario',
    save_entry:'Salva voce',
    edit_journal_entry:'Modifica voce diario',
    journal_saved_placeholder:"La tua voce del diario per oggi è già salvata.",
    one_journal_per_day:'Si può creare una sola voce al giorno.',
    add_photo:'📷 Aggiungi foto',
    page_mood_subtitle:'Schemi e tendenze del tuo benessere emotivo.',
    page_sleep_subtitle:'Qualità e costanza del tuo riposo.',
    page_energy_subtitle:'Ritmo e resistenza nei giorni.',
    page_velocity_h1:"Velocità e Stabilità dell'Umore",
    page_velocity_subtitle:'Vedi come il tuo umore cambia di giorno in giorno.',
    page_corr_subtitle:'Scopri le relazioni tra le metriche monitorate.',
    page_patterns_subtitle:'Schemi di sonno, attività e umore.',
    page_seasonal_h1:'Analisi Stagionale e Ritmo',
    page_seasonal_subtitle:'Scopri come umore, sonno ed energia cambiano con le stagioni.',
    page_forecast_subtitle:'Tendenze predittive basate sui tuoi dati recenti.',
    insights_eyebrow:'Analitiche personali',
    insights_overview:'Pattern dai tuoi dati. Più registri, più diventano precisi.',
    page_export_subtitle:'I tuoi dati ti appartengono. Scarica, esegui backup o importa in qualsiasi momento.',
    nav_reports:'Rapporti',
    report_week:'Settimana', report_month:'Mese', report_year:'Anno',
    report_export_pdf:'Esporta rapporto come PDF',
    modal_full_edit:'✏️ Modifica completa', modal_journal:'📓 Diario', modal_close:'Chiudi',
    modal_cancel:'Annulla',
    delete_all_title:'Elimina tutti i miei dati',
    delete_all_desc:'Elimina definitivamente tutte le voci, il diario, i backup e le impostazioni.',
    delete_all_confirm:'Elimina tutto',
    delete_entry:'Elimina voce',
    daily_summary:'Riepilogo giornaliero',
    low_mood:'Umore basso', neutral:'Neutro', good_mood:'Buon umore', today:'Oggi',
    export_heatmap:'Esporta heatmap',
    settings:'Impostazioni',
    s_appearance:'Aspetto', s_appearance_desc:'Tema e preferenze di visualizzazione.',
    s_theme:'Tema', s_dark_mode:'Modalità scura',
    s_sound:'Suono di successo', s_particles:'Particelle ambientali', s_parallax:'Scorrimento parallasse',
    s_preferences:'Preferenze', s_preferences_desc:'Opzioni predefinite e di visualizzazione.',
    s_language:'Lingua', s_date_format:'Formato data', s_time_format:'Formato ora',
    s_chart_days:'Giorni predefiniti grafico', s_reduce_motion:'Riduci movimento',
    s_notifications:'Abilita notifiche (browser)',
    s_dashboard_widgets:'Widget dashboard',
    s_show_mood:'Mostra grafico umore', s_show_sleep:'Mostra grafico sonno', s_show_energy:'Mostra grafico energia',
    s_custom_metrics:'Metriche personalizzate',
    s_custom_metrics_desc:'Aggiungi le tue metriche (es. ansia, dolore, produttività).',
    s_privacy:'Dati e Privacy',
    s_privacy_desc:'Tutti i dati sono archiviati localmente sul tuo dispositivo.',
    s_delete_all:'Elimina tutti i miei dati',
    s_favourite_tags:'Tag preferiti', s_default_activities:'Attività predefinite',
    pwa_install_text:'Installa Aura per accesso rapido e uso offline.',
    pwa_not_now:'Non ora', pwa_install_btn:'Installa',
    pwa_update_text:'È disponibile una nuova versione.', pwa_reload:'Ricarica'
},

/* ──────────────────────────── PORTUGUESE ─────────────────────────── */
pt: {
    nav_tracking:'Rastreamento', nav_analytics_label:'Analíticos',
    nav_explore:'Explorar', nav_data_label:'Dados',
    nav_overview:'Visão geral', nav_checkin:'Registo diário', nav_checkin_short:'Registo',
    nav_calendar:'Calendário', nav_journal:'Diário', nav_mood_trends:'Tendências de humor',
    nav_sleep:'Análise de sono', nav_energy:'Padrões de energia', nav_insights:'Perspetivas',
    nav_correlations:'Correlações', nav_velocity:'Velocidade do humor', nav_forecast:'Previsão',
    nav_patterns:'Os meus padrões', nav_seasonal:'Ritmo sazonal', nav_reports:'Relatórios',
    nav_export:'Exportar e cópia', nav_menu:'Menu', nav_seasonal_short:'Sazonal',
    dash_welcome_title:'Bem-vindo ao Aura Mood',
    dash_welcome_subtitle:'Registe o seu humor, sono e energia diariamente.',
    dash_start_checkin:'Iniciar registo de hoje →',
    dash_sample_data:'Explorar com dados de exemplo',
    dash_feat_mood:'Tendências de humor e previsões',
    dash_feat_sleep:'Análise de padrões de sono',
    dash_feat_insights:'Perspetivas personalizadas',
    dash_go_deeper:'Aprofundar',
    dash_analytics_hint:'Explore padrões, correlações e previsões dos seus dados.',
    tile_insights_desc:'Padrões dos seus dados',
    tile_corr_desc:'Vínculos sono, humor e energia',
    tile_forecast_desc:'Para onde vai o seu humor',
    tile_patterns_desc:'Linha do tempo de sono',
    tile_seasonal_desc:'Ritmo mensal e anual',
    tile_velocity_desc:'Mudança dia a dia',
    daily_checkin:'Registo diário',
    checkin_subtitle:'Registe o seu humor, sono e energia.',
    checkin_desc:'Uma entrada por dia — curta ou detalhada, à sua escolha.',
    checkin_progress_label:'Preencha as secções abaixo',
    checkin_date_heading:'Data', checkin_date:'Data',
    checkin_mood_energy_heading:'Humor e Energia',
    checkin_sleep_heading:'Sono',
    checkin_activities_tags_heading:'Atividades e Tags',
    checkin_mood:'Humor', checkin_energy:'Nível de energia',
    checkin_sleep_duration:'Duração do sono', checkin_sleep_quality:'Qualidade do sono',
    checkin_sleep_time:'Hora principal de dormir', checkin_wake_time:'Hora principal de acordar',
    checkin_sleep_segments:'Segmentos de sono',
    checkin_activities:'Atividades', checkin_tags:'Tags', checkin_photos:'Fotos',
    checkin_suggested_tags:'Tags sugeridas', checkin_tap_to_add:'Toque para adicionar',
    checkin_daily_reflection:'Reflexão diária',
    checkin_reflection_desc:'Capture como foi o dia, o que importou e o que notou.',
    checkin_saved_reflection:'Reflexão guardada',
    checkin_open_journal:'Abrir diário completo',
    checkin_sleep_hint:'Use segmentos para sono fragmentado ou polifásico.',
    checkin_sleep_segments_intro:'Capture sono dividido ou interrompido em segmentos separados.',
    checkin_add_segment:'+ Adicionar segmento de sono',
    checkin_save_hint:'⌘S para guardar',
    checkin_no_summary:'Dados insuficientes para gerar um resumo.',
    undo:'Desfazer', redo:'Refazer',
    calendar_title:'Calendário',
    calendar_subtitle:'Explore o seu historial de humor por dias, semanas e meses.',
    cal_year_heatmap:'Mapa de calor anual', cal_month_grid:'Grelha mensal',
    cal_week_timeline:'Linha do tempo semanal', cal_list:'Lista',
    cal_year_in_mood:'Ano em humor',
    cal_year_subtitle:'Acompanhe a consistência do humor no último ano',
    journal:'Diário',
    journal_page_subtitle:'Escreva livremente — é só para si.',
    journal_unsaved:'Alterações não guardadas',
    save_journal:'Guardar diário',
    save_entry:'Guardar entrada',
    edit_journal_entry:'Editar entrada do diário',
    journal_saved_placeholder:'A sua entrada do diário já foi guardada.',
    one_journal_per_day:'Só pode ser criada uma entrada por dia.',
    add_photo:'📷 Adicionar foto',
    page_mood_subtitle:'Padrões e tendências do seu bem-estar emocional.',
    page_sleep_subtitle:'Qualidade e consistência do seu descanso.',
    page_energy_subtitle:'Ritmo e resistência ao longo dos dias.',
    page_velocity_h1:'Velocidade e Estabilidade do Humor',
    page_velocity_subtitle:'Veja como o seu humor muda de dia para dia.',
    page_corr_subtitle:'Descubra relações entre as suas métricas registadas.',
    page_patterns_subtitle:'Padrões de sono, atividade e humor.',
    page_seasonal_h1:'Análise Sazonal e de Ritmo',
    page_seasonal_subtitle:'Descubra como o seu humor, sono e energia mudam com as estações.',
    page_forecast_subtitle:'Tendências preditivas baseadas nos seus dados recentes.',
    insights_eyebrow:'Analítica pessoal',
    insights_overview:'Padrões dos seus dados. Quanto mais registar, mais precisos ficam.',
    page_export_subtitle:'Os seus dados são seus. Descarregue, faça backup ou importe a qualquer momento.',
    nav_reports:'Relatórios',
    report_week:'Semana', report_month:'Mês', report_year:'Ano',
    report_export_pdf:'Exportar relatório como PDF',
    modal_full_edit:'✏️ Edição completa', modal_journal:'📓 Diário', modal_close:'Fechar',
    modal_cancel:'Cancelar',
    delete_all_title:'Eliminar todos os meus dados',
    delete_all_desc:'Elimina permanentemente todas as entradas, diário, cópias e definições.',
    delete_all_confirm:'Eliminar tudo',
    delete_entry:'Eliminar entrada',
    daily_summary:'Resumo diário',
    low_mood:'Humor baixo', neutral:'Neutro', good_mood:'Bom humor', today:'Hoje',
    export_heatmap:'Exportar mapa de calor',
    settings:'Definições',
    s_appearance:'Aparência', s_appearance_desc:'Tema e preferências de exibição.',
    s_theme:'Tema', s_dark_mode:'Modo escuro',
    s_sound:'Som de sucesso', s_particles:'Partículas ambiente', s_parallax:'Rolagem parallax',
    s_preferences:'Preferências', s_preferences_desc:'Opções padrão e de exibição.',
    s_language:'Idioma', s_date_format:'Formato de data', s_time_format:'Formato de hora',
    s_chart_days:'Dias padrão do gráfico', s_reduce_motion:'Reduzir movimento',
    s_notifications:'Ativar notificações (navegador)',
    s_dashboard_widgets:'Widgets do painel',
    s_show_mood:'Mostrar gráfico de humor', s_show_sleep:'Mostrar gráfico de sono', s_show_energy:'Mostrar gráfico de energia',
    s_custom_metrics:'Métricas personalizadas',
    s_custom_metrics_desc:'Adicione as suas próprias métricas.',
    s_privacy:'Dados e Privacidade',
    s_privacy_desc:'Todos os dados são armazenados localmente no seu dispositivo.',
    s_delete_all:'Eliminar todos os meus dados',
    s_favourite_tags:'Tags favoritas', s_default_activities:'Atividades predefinidas',
    pwa_install_text:'Instale o Aura para acesso rápido e uso offline.',
    pwa_not_now:'Agora não', pwa_install_btn:'Instalar',
    pwa_update_text:'Uma nova versão está disponível.', pwa_reload:'Recarregar'
},

/* ────────────────────────────── JAPANESE ─────────────────────────── */
ja: {
    nav_tracking:'トラッキング', nav_analytics_label:'分析',
    nav_explore:'探索', nav_data_label:'データ',
    nav_overview:'概要', nav_checkin:'デイリーチェックイン', nav_checkin_short:'チェックイン',
    nav_calendar:'カレンダー', nav_journal:'日記', nav_mood_trends:'気分トレンド',
    nav_sleep:'睡眠分析', nav_energy:'エネルギーパターン', nav_insights:'インサイト',
    nav_correlations:'相関関係', nav_velocity:'気分の変化', nav_forecast:'予測',
    nav_patterns:'マイパターン', nav_seasonal:'季節リズム', nav_reports:'レポート',
    nav_export:'エクスポート＆バックアップ', nav_menu:'メニュー', nav_seasonal_short:'季節',
    dash_welcome_title:'Aura Moodへようこそ',
    dash_welcome_subtitle:'毎日の気分、睡眠、エネルギーを記録しましょう。1週間後にパターンが見えてきます。',
    dash_start_checkin:'今日のチェックインを開始 →',
    dash_sample_data:'サンプルデータで探索',
    dash_feat_mood:'気分トレンドと予測',
    dash_feat_sleep:'睡眠パターン分析',
    dash_feat_insights:'パーソナルインサイト',
    dash_go_deeper:'深く掘り下げる',
    dash_analytics_hint:'データからパターン、相関関係、予測を探索しましょう。',
    tile_insights_desc:'データからのパターン',
    tile_corr_desc:'睡眠・気分・エネルギーの関係',
    tile_forecast_desc:'気分の行方',
    tile_patterns_desc:'睡眠タイムラインとリズム',
    tile_seasonal_desc:'月次・年次リズム',
    tile_velocity_desc:'日々の変化',
    daily_checkin:'デイリーチェックイン',
    checkin_subtitle:'気分、睡眠、エネルギーを記録しましょう。',
    checkin_desc:'1日1エントリー — 短くても詳しくても、あなた次第。',
    checkin_progress_label:'以下のセクションを記入してください',
    checkin_date_heading:'日付', checkin_date:'日付',
    checkin_mood_energy_heading:'気分とエネルギー',
    checkin_sleep_heading:'睡眠',
    checkin_activities_tags_heading:'アクティビティとタグ',
    checkin_mood:'気分', checkin_energy:'エネルギー',
    checkin_sleep_duration:'睡眠時間', checkin_sleep_quality:'睡眠の質',
    checkin_sleep_time:'主な就寝時刻', checkin_wake_time:'主な起床時刻',
    checkin_sleep_segments:'睡眠セグメント',
    checkin_activities:'アクティビティ', checkin_tags:'タグ', checkin_photos:'写真',
    checkin_suggested_tags:'提案タグ', checkin_tap_to_add:'タップして追加',
    checkin_daily_reflection:'今日の振り返り',
    checkin_reflection_desc:'今日どんな日だったか、何が大切だったか、何に気づいたかを記録しましょう。',
    checkin_saved_reflection:'保存された振り返り',
    checkin_open_journal:'日記を全て開く',
    checkin_sleep_hint:'断続的または多相睡眠はセグメントを使って記録してください。',
    checkin_sleep_segments_intro:'分割または中断した睡眠を別々のセグメントで記録します。',
    checkin_add_segment:'＋睡眠セグメントを追加',
    checkin_save_hint:'⌘Sで保存',
    checkin_no_summary:'まだサマリーを生成するのに十分なデータがありません。',
    undo:'元に戻す', redo:'やり直す',
    calendar_title:'カレンダー',
    calendar_subtitle:'日、週、月ごとのムード履歴を確認する。',
    cal_year_heatmap:'年間ヒートマップ', cal_month_grid:'月別グリッド',
    cal_week_timeline:'週のタイムライン', cal_list:'リスト',
    cal_year_in_mood:'気分の1年',
    cal_year_subtitle:'過去1年間の気分の一貫性を追跡',
    journal:'日記',
    journal_page_subtitle:'自由に書いてください — あなただけのものです。',
    journal_unsaved:'未保存の変更',
    save_journal:'日記を保存',
    save_entry:'保存',
    edit_journal_entry:'日記を編集',
    journal_saved_placeholder:'今日の日記はすでに保存されています。',
    one_journal_per_day:'1日に作成できる日記は1件のみです。',
    add_photo:'📷 写真を追加',
    page_mood_subtitle:'感情的なウェルビーイングのパターンとトレンド。',
    page_sleep_subtitle:'休息の質と一貫性。',
    page_energy_subtitle:'日々のリズムとスタミナ。',
    page_velocity_h1:'気分の速度と安定性',
    page_velocity_subtitle:'気分が日々どのように変化するかを確認。',
    page_corr_subtitle:'追跡した指標間の関係を発見。',
    page_patterns_subtitle:'睡眠、活動、気分のパターン。',
    page_seasonal_h1:'季節とリズム分析',
    page_seasonal_subtitle:'季節によって気分、睡眠、エネルギーがどう変化するかを発見。',
    page_forecast_subtitle:'最近のデータに基づく予測トレンド。',
    insights_eyebrow:'パーソナル分析',
    insights_overview:'データからのパターン。記録が増えるほど、より正確になります。',
    page_export_subtitle:'データはあなたのものです。いつでもダウンロード、バックアップ、インポートが可能です。',
    nav_reports:'レポート',
    report_week:'週', report_month:'月', report_year:'年',
    report_export_pdf:'レポートをPDFでエクスポート',
    modal_full_edit:'✏️ 全体編集', modal_journal:'📓 日記', modal_close:'閉じる',
    modal_cancel:'キャンセル',
    delete_all_title:'全データを削除',
    delete_all_desc:'全てのエントリー、日記、バックアップ、設定を完全に削除します。',
    delete_all_confirm:'全て削除',
    delete_entry:'削除',
    daily_summary:'1日のまとめ',
    low_mood:'低い気分', neutral:'普通', good_mood:'良い気分', today:'今日',
    export_heatmap:'ヒートマップを書き出す',
    settings:'設定',
    s_appearance:'外観', s_appearance_desc:'テーマと表示設定。',
    s_theme:'テーマ', s_dark_mode:'ダークモード',
    s_sound:'成功音', s_particles:'環境パーティクル', s_parallax:'パララックス',
    s_preferences:'設定', s_preferences_desc:'デフォルトと表示オプション。',
    s_language:'言語', s_date_format:'日付形式', s_time_format:'時刻形式',
    s_chart_days:'グラフのデフォルト日数', s_reduce_motion:'モーション軽減',
    s_notifications:'通知を有効にする',
    s_dashboard_widgets:'ダッシュボードウィジェット',
    s_show_mood:'気分グラフを表示', s_show_sleep:'睡眠グラフを表示', s_show_energy:'エネルギーグラフを表示',
    s_custom_metrics:'カスタム指標',
    s_custom_metrics_desc:'独自の指標を追加（例：不安、痛み、生産性）。',
    s_privacy:'データとプライバシー',
    s_privacy_desc:'すべてのデータはデバイスにローカル保存されます。',
    s_delete_all:'全データを削除',
    s_favourite_tags:'お気に入りタグ', s_default_activities:'デフォルトのアクティビティ',
    pwa_install_text:'Auraをインストールしてすばやくアクセスしましょう。',
    pwa_not_now:'後で', pwa_install_btn:'インストール',
    pwa_update_text:'新しいバージョンがあります。', pwa_reload:'再読み込み'
},

/* ───────────────────────────── CHINESE ───────────────────────────── */
zh: {
    nav_tracking:'记录', nav_analytics_label:'分析',
    nav_explore:'探索', nav_data_label:'数据',
    nav_overview:'概览', nav_checkin:'每日打卡', nav_checkin_short:'打卡',
    nav_calendar:'日历', nav_journal:'日记', nav_mood_trends:'情绪趋势',
    nav_sleep:'睡眠分析', nav_energy:'能量模式', nav_insights:'洞察',
    nav_correlations:'相关性', nav_velocity:'情绪变化速度', nav_forecast:'预测',
    nav_patterns:'我的模式', nav_seasonal:'季节规律', nav_reports:'报告',
    nav_export:'导出与备份', nav_menu:'菜单', nav_seasonal_short:'季节',
    dash_welcome_title:'欢迎来到 Aura Mood',
    dash_welcome_subtitle:'每天记录您的情绪、睡眠和能量。一周后规律开始显现。',
    dash_start_checkin:'开始今天的打卡 →',
    dash_sample_data:'使用示例数据探索',
    dash_feat_mood:'情绪趋势与预测',
    dash_feat_sleep:'睡眠模式分析',
    dash_feat_insights:'个性化洞察',
    dash_go_deeper:'深入分析',
    dash_analytics_hint:'从您的数据中探索模式、相关性和预测。',
    tile_insights_desc:'您数据中的模式',
    tile_corr_desc:'睡眠、情绪和能量的联系',
    tile_forecast_desc:'情绪的走向',
    tile_patterns_desc:'睡眠时间轴与规律',
    tile_seasonal_desc:'月度和年度节律',
    tile_velocity_desc:'每日变化',
    daily_checkin:'每日打卡',
    checkin_subtitle:'记录您的情绪、睡眠和能量。',
    checkin_desc:'每天一条记录 — 简短或详细，由您决定。',
    checkin_progress_label:'填写以下各部分',
    checkin_date_heading:'日期', checkin_date:'日期',
    checkin_mood_energy_heading:'情绪与能量',
    checkin_sleep_heading:'睡眠',
    checkin_activities_tags_heading:'活动和标签',
    checkin_mood:'情绪', checkin_energy:'能量水平',
    checkin_sleep_duration:'睡眠时长', checkin_sleep_quality:'睡眠质量',
    checkin_sleep_time:'主要入睡时间', checkin_wake_time:'主要醒来时间',
    checkin_sleep_segments:'睡眠片段',
    checkin_activities:'活动', checkin_tags:'标签', checkin_photos:'照片',
    checkin_suggested_tags:'建议标签', checkin_tap_to_add:'点击添加',
    checkin_daily_reflection:'每日反思',
    checkin_reflection_desc:'记录今天的感受、重要的事情以及您注意到的。',
    checkin_saved_reflection:'已保存的反思',
    checkin_open_journal:'打开完整日记',
    checkin_sleep_hint:'使用片段记录碎片化或多相睡眠。',
    checkin_sleep_segments_intro:'在单独的片段中记录分段或中断的睡眠。',
    checkin_add_segment:'+ 添加睡眠片段',
    checkin_save_hint:'⌘S 保存',
    checkin_no_summary:'数据不足，暂无法生成摘要。',
    undo:'撤销', redo:'重做',
    calendar_title:'日历',
    calendar_subtitle:'按日、周、月浏览心情历史。',
    cal_year_heatmap:'年度热力图', cal_month_grid:'月度网格',
    cal_week_timeline:'周时间轴', cal_list:'列表',
    cal_year_in_mood:'年度情绪',
    cal_year_subtitle:'追踪过去一年的情绪一致性',
    journal:'日记',
    journal_page_subtitle:'自由书写 — 这只属于您。',
    journal_unsaved:'未保存的更改',
    save_journal:'保存日记',
    save_entry:'保存记录',
    edit_journal_entry:'编辑日记',
    journal_saved_placeholder:'今天的日记已保存。',
    one_journal_per_day:'每天只能创建一条日记。',
    add_photo:'📷 添加照片',
    page_mood_subtitle:'您情绪健康的模式和趋势。',
    page_sleep_subtitle:'您休息的质量和一致性。',
    page_energy_subtitle:'每日的节律和耐力。',
    page_velocity_h1:'情绪速度与稳定性',
    page_velocity_subtitle:'查看您的情绪如何日复一日地变化。',
    page_corr_subtitle:'发现您追踪的各项指标之间的关系。',
    page_patterns_subtitle:'睡眠、活动和情绪模式。',
    page_seasonal_h1:'季节与节律分析',
    page_seasonal_subtitle:'发现您的情绪、睡眠和能量如何随季节变化。',
    page_forecast_subtitle:'基于近期数据的预测趋势。',
    insights_eyebrow:'个人分析',
    insights_overview:'您数据中的模式。记录越多，越精准。',
    page_export_subtitle:'您的数据属于您。随时下载、备份或导入。',
    nav_reports:'报告',
    report_week:'周', report_month:'月', report_year:'年',
    report_export_pdf:'将报告导出为PDF',
    modal_full_edit:'✏️ 完整编辑', modal_journal:'📓 日记', modal_close:'关闭',
    modal_cancel:'取消',
    delete_all_title:'删除我的所有数据',
    delete_all_desc:'永久删除所有条目、日记、备份和设置。',
    delete_all_confirm:'删除一切',
    delete_entry:'删除记录',
    daily_summary:'每日总结',
    low_mood:'情绪低落', neutral:'中性', good_mood:'情绪良好', today:'今天',
    export_heatmap:'导出热力图',
    settings:'设置',
    s_appearance:'外观', s_appearance_desc:'主题和显示偏好。',
    s_theme:'主题', s_dark_mode:'深色模式',
    s_sound:'成功音效', s_particles:'环境粒子', s_parallax:'视差滚动',
    s_preferences:'偏好设置', s_preferences_desc:'默认和显示选项。',
    s_language:'语言', s_date_format:'日期格式', s_time_format:'时间格式',
    s_chart_days:'图表默认天数', s_reduce_motion:'减少动效',
    s_notifications:'启用通知（浏览器）',
    s_dashboard_widgets:'仪表板小部件',
    s_show_mood:'显示情绪图表', s_show_sleep:'显示睡眠图表', s_show_energy:'显示精力图表',
    s_custom_metrics:'自定义指标',
    s_custom_metrics_desc:'添加您自己的指标（例如焦虑、疼痛、生产力）。',
    s_privacy:'数据与隐私',
    s_privacy_desc:'所有数据本地存储在您的设备上。',
    s_delete_all:'删除我的所有数据',
    s_favourite_tags:'收藏标签', s_default_activities:'默认活动',
    pwa_install_text:'安装 Aura 以便快速访问和离线使用。',
    pwa_not_now:'暂不', pwa_install_btn:'安装',
    pwa_update_text:'有新版本可用。', pwa_reload:'重新加载'
},

/* ────────────────────────────── RUSSIAN ──────────────────────────── */
ru: {
    nav_tracking:'Отслеживание', nav_analytics_label:'Аналитика',
    nav_explore:'Исследовать', nav_data_label:'Данные',
    nav_overview:'Обзор', nav_checkin:'Дневной чекин', nav_checkin_short:'Чекин',
    nav_calendar:'Календарь', nav_journal:'Дневник', nav_mood_trends:'Тренды настроения',
    nav_sleep:'Анализ сна', nav_energy:'Паттерны энергии', nav_insights:'Инсайты',
    nav_correlations:'Корреляции', nav_velocity:'Скорость настроения', nav_forecast:'Прогноз',
    nav_patterns:'Мои паттерны', nav_seasonal:'Сезонный ритм', nav_reports:'Отчёты',
    nav_export:'Экспорт и резервная копия', nav_menu:'Меню', nav_seasonal_short:'Сезонный',
    dash_welcome_title:'Добро пожаловать в Aura Mood',
    dash_welcome_subtitle:'Отслеживайте настроение, сон и энергию каждый день. Паттерны появятся через неделю.',
    dash_start_checkin:'Начать сегодняшний чекин →',
    dash_sample_data:'Исследовать с тестовыми данными',
    dash_feat_mood:'Тренды настроения и прогнозы',
    dash_feat_sleep:'Анализ паттернов сна',
    dash_feat_insights:'Персонализированные инсайты',
    dash_go_deeper:'Углубиться',
    dash_analytics_hint:'Исследуйте паттерны, корреляции и прогнозы из ваших данных.',
    tile_insights_desc:'Паттерны из ваших данных',
    tile_corr_desc:'Связи сна, настроения и энергии',
    tile_forecast_desc:'Куда движется настроение',
    tile_patterns_desc:'Хронология и ритмы сна',
    tile_seasonal_desc:'Месячный и годовой ритм',
    tile_velocity_desc:'Изменение день за днём',
    daily_checkin:'Дневной чекин',
    checkin_subtitle:'Запишите настроение, сон и энергию.',
    checkin_desc:'Одна запись в день — короткая или подробная, на ваш выбор.',
    checkin_progress_label:'Заполните разделы ниже',
    checkin_date_heading:'Дата', checkin_date:'Дата',
    checkin_mood_energy_heading:'Настроение и Энергия',
    checkin_sleep_heading:'Сон',
    checkin_activities_tags_heading:'Активности и Теги',
    checkin_mood:'Настроение', checkin_energy:'Уровень энергии',
    checkin_sleep_duration:'Продолжительность сна', checkin_sleep_quality:'Качество сна',
    checkin_sleep_time:'Основное время сна', checkin_wake_time:'Основное время пробуждения',
    checkin_sleep_segments:'Сегменты сна',
    checkin_activities:'Активности', checkin_tags:'Теги', checkin_photos:'Фото',
    checkin_suggested_tags:'Предложенные теги', checkin_tap_to_add:'Нажать для добавления',
    checkin_daily_reflection:'Ежедневная рефлексия',
    checkin_reflection_desc:'Запишите, как прошёл день, что было важным и что вы заметили.',
    checkin_saved_reflection:'Сохранённая рефлексия',
    checkin_open_journal:'Открыть полный дневник',
    checkin_sleep_hint:'Используйте сегменты для фрагментированного или полифазного сна.',
    checkin_sleep_segments_intro:'Фиксируйте прерывистый сон в отдельных сегментах.',
    checkin_add_segment:'+ Добавить сегмент сна',
    checkin_save_hint:'⌘S для сохранения',
    checkin_no_summary:'Пока недостаточно данных для создания сводки.',
    undo:'Отменить', redo:'Повторить',
    calendar_title:'Календарь',
    calendar_subtitle:'Просматривайте историю настроения по дням, неделям и месяцам.',
    cal_year_heatmap:'Годовая тепловая карта', cal_month_grid:'Месячная сетка',
    cal_week_timeline:'Недельная хронология', cal_list:'Список',
    cal_year_in_mood:'Год в настроении',
    cal_year_subtitle:'Отслеживайте постоянство настроения за прошедший год',
    journal:'Дневник',
    journal_page_subtitle:'Пишите свободно — это только для вас.',
    journal_unsaved:'Несохранённые изменения',
    save_journal:'Сохранить дневник',
    save_entry:'Сохранить запись',
    edit_journal_entry:'Редактировать запись дневника',
    journal_saved_placeholder:'Запись дневника на сегодня уже сохранена.',
    one_journal_per_day:'В день можно создать только одну запись дневника.',
    add_photo:'📷 Добавить фото',
    page_mood_subtitle:'Паттерны и тренды вашего эмоционального благополучия.',
    page_sleep_subtitle:'Качество и постоянство вашего отдыха.',
    page_energy_subtitle:'Ритм и выносливость в течение дней.',
    page_velocity_h1:'Скорость и Стабильность Настроения',
    page_velocity_subtitle:'Посмотрите, как ваше настроение меняется день за днём.',
    page_corr_subtitle:'Откройте связи между отслеживаемыми показателями.',
    page_patterns_subtitle:'Паттерны сна, активности и настроения.',
    page_seasonal_h1:'Сезонный и Ритмический Анализ',
    page_seasonal_subtitle:'Узнайте, как ваше настроение, сон и энергия меняются по сезонам.',
    page_forecast_subtitle:'Прогнозные тренды на основе ваших последних данных.',
    insights_eyebrow:'Персональная аналитика',
    insights_overview:'Паттерны из ваших данных. Чем больше вы записываете, тем точнее они становятся.',
    page_export_subtitle:'Ваши данные принадлежат вам. Скачивайте, создавайте резервные копии или импортируйте в любое время.',
    nav_reports:'Отчёты',
    report_week:'Неделя', report_month:'Месяц', report_year:'Год',
    report_export_pdf:'Экспортировать отчёт в PDF',
    modal_full_edit:'✏️ Полное редактирование', modal_journal:'📓 Дневник', modal_close:'Закрыть',
    modal_cancel:'Отмена',
    delete_all_title:'Удалить все мои данные',
    delete_all_desc:'Безвозвратно удаляет все записи, дневник, резервные копии и настройки.',
    delete_all_confirm:'Удалить всё',
    delete_entry:'Удалить запись',
    daily_summary:'Дневная сводка',
    low_mood:'Низкое настроение', neutral:'Нейтральный', good_mood:'Хорошее настроение', today:'Сегодня',
    export_heatmap:'Экспортировать тепловую карту',
    settings:'Настройки',
    s_appearance:'Внешний вид', s_appearance_desc:'Тема и настройки отображения.',
    s_theme:'Тема', s_dark_mode:'Тёмный режим',
    s_sound:'Звук успеха', s_particles:'Частицы', s_parallax:'Параллакс',
    s_preferences:'Настройки', s_preferences_desc:'Параметры по умолчанию и отображения.',
    s_language:'Язык', s_date_format:'Формат даты', s_time_format:'Формат времени',
    s_chart_days:'Дней на графике', s_reduce_motion:'Уменьшить анимацию',
    s_notifications:'Включить уведомления (браузер)',
    s_dashboard_widgets:'Виджеты панели',
    s_show_mood:'Показать график настроения', s_show_sleep:'Показать график сна', s_show_energy:'Показать график энергии',
    s_custom_metrics:'Пользовательские метрики',
    s_custom_metrics_desc:'Добавьте собственные метрики (напр. тревога, боль, продуктивность).',
    s_privacy:'Данные и конфиденциальность',
    s_privacy_desc:'Все данные хранятся локально на вашем устройстве.',
    s_delete_all:'Удалить все мои данные',
    s_favourite_tags:'Избранные теги', s_default_activities:'Стандартные активности',
    pwa_install_text:'Установите Aura для быстрого доступа и работы офлайн.',
    pwa_not_now:'Не сейчас', pwa_install_btn:'Установить',
    pwa_update_text:'Доступна новая версия.', pwa_reload:'Обновить'
},

/* ────────────────────────────── TURKISH ──────────────────────────── */
tr: {
    nav_tracking:'Takip', nav_analytics_label:'Analitik',
    nav_explore:'Keşfet', nav_data_label:'Veri',
    nav_overview:'Genel Bakış', nav_checkin:'Günlük kontrol', nav_checkin_short:'Kontrol',
    nav_calendar:'Takvim', nav_journal:'Günlük', nav_mood_trends:'Ruh Hali Trendleri',
    nav_sleep:'Uyku Analizi', nav_energy:'Enerji Kalıpları', nav_insights:'Öngörüler',
    nav_correlations:'Korelasyonlar', nav_velocity:'Ruh Hali Hızı', nav_forecast:'Tahmin',
    nav_patterns:'Kalıplarım', nav_seasonal:'Mevsimsel Ritim', nav_reports:'Raporlar',
    nav_export:'Dışa Aktar ve Yedekle', nav_menu:'Menü', nav_seasonal_short:'Mevsimsel',
    dash_welcome_title:"Aura Mood'a Hoş Geldiniz",
    dash_welcome_subtitle:'Her gün ruh halinizi, uykunuzu ve enerjinizi takip edin. Kalıplar bir hafta sonra ortaya çıkar.',
    dash_start_checkin:"Bugünün kontrolünü başlat →",
    dash_sample_data:'Örnek verilerle keşfet',
    dash_feat_mood:'Ruh hali trendleri ve tahminler',
    dash_feat_sleep:'Uyku kalıpları analizi',
    dash_feat_insights:'Kişiselleştirilmiş öngörüler',
    dash_go_deeper:'Daha derine in',
    dash_analytics_hint:'Verilerinizdeki kalıpları, korelasyonları ve tahminleri keşfedin.',
    tile_insights_desc:'Verilerinizdeki kalıplar',
    tile_corr_desc:'Uyku, ruh hali ve enerji bağlantıları',
    tile_forecast_desc:'Ruh halinizin gidebileceği yer',
    tile_patterns_desc:'Uyku zaman çizelgesi ve ritimleri',
    tile_seasonal_desc:'Aylık ve yıllık ritim',
    tile_velocity_desc:'Günden güne değişim',
    daily_checkin:'Günlük kontrol',
    checkin_subtitle:'Ruh halinizi, uykunuzu ve enerjinizi kaydedin.',
    checkin_desc:'Günde bir giriş — kısa ya da ayrıntılı, sizin seçiminiz.',
    checkin_progress_label:'Aşağıdaki bölümleri doldurun',
    checkin_date_heading:'Tarih', checkin_date:'Tarih',
    checkin_mood_energy_heading:'Ruh Hali ve Enerji',
    checkin_sleep_heading:'Uyku',
    checkin_activities_tags_heading:'Aktiviteler ve Etiketler',
    checkin_mood:'Ruh hali', checkin_energy:'Enerji seviyesi',
    checkin_sleep_duration:'Uyku süresi', checkin_sleep_quality:'Uyku kalitesi',
    checkin_sleep_time:'Ana uyku saati', checkin_wake_time:'Ana uyanma saati',
    checkin_sleep_segments:'Uyku segmentleri',
    checkin_activities:'Aktiviteler', checkin_tags:'Etiketler', checkin_photos:'Fotoğraflar',
    checkin_suggested_tags:'Önerilen etiketler', checkin_tap_to_add:'Eklemek için dokun',
    checkin_daily_reflection:'Günlük Yansıma',
    checkin_reflection_desc:'Günün nasıl geçtiğini, neyin önemli olduğunu ve neler fark ettiğinizi kaydedin.',
    checkin_saved_reflection:'Kaydedilen yansıma',
    checkin_open_journal:'Tam günlüğü aç',
    checkin_sleep_hint:'Parçalı veya polifazik uyku için segmentleri kullanın.',
    checkin_sleep_segments_intro:'Bölünmüş veya kesintili uykuyu ayrı segmentlerde kaydedin.',
    checkin_add_segment:'+ Uyku segmenti ekle',
    checkin_save_hint:'⌘S kaydetmek için',
    checkin_no_summary:'Özet oluşturmak için henüz yeterli veri yok.',
    undo:'Geri al', redo:'Yinele',
    calendar_title:'Takvim',
    calendar_subtitle:'Günlük, haftalık ve aylık ruh hali geçmişinizi keşfedin.',
    cal_year_heatmap:'Yıllık ısı haritası', cal_month_grid:'Aylık ızgara',
    cal_week_timeline:'Haftalık zaman çizelgesi', cal_list:'Liste',
    cal_year_in_mood:'Ruh Halinde Yıl',
    cal_year_subtitle:'Geçen yıl boyunca ruh hali tutarlılığınızı takip edin',
    journal:'Günlük',
    journal_page_subtitle:'Özgürce yazın — bu sadece size ait.',
    journal_unsaved:'Kaydedilmemiş değişiklikler',
    save_journal:'Günlüğü kaydet',
    save_entry:'Kaydı kaydet',
    edit_journal_entry:'Günlük girişini düzenle',
    journal_saved_placeholder:'Bugünkü günlük girişiniz zaten kaydedildi.',
    one_journal_per_day:'Günde yalnızca bir günlük girişi oluşturulabilir.',
    add_photo:'📷 Fotoğraf ekle',
    page_mood_subtitle:'Duygusal iyiliğinizdeki kalıplar ve eğilimler.',
    page_sleep_subtitle:'Dinlenmenizin kalitesi ve tutarlılığı.',
    page_energy_subtitle:'Günler boyunca ritim ve dayanıklılık.',
    page_velocity_h1:'Ruh Hali Hızı ve İstikrarı',
    page_velocity_subtitle:'Ruh halinizin günden güne nasıl değiştiğini görün.',
    page_corr_subtitle:'İzlenen metrikleriniz arasındaki ilişkileri keşfedin.',
    page_patterns_subtitle:'Uyku, aktivite ve ruh hali kalıpları.',
    page_seasonal_h1:'Mevsimsel ve Ritim Analizi',
    page_seasonal_subtitle:'Ruh halinizin, uykunuzun ve enerjinizin mevsimlere göre nasıl değiştiğini keşfedin.',
    page_forecast_subtitle:'Son verilerinize dayalı tahmin eğilimleri.',
    insights_eyebrow:'Kişisel Analitik',
    insights_overview:'Verilerinizdeki kalıplar. Ne kadar çok kayıt tutarsanız, o kadar net olur.',
    page_export_subtitle:'Verileriniz size aittir. İstediğiniz zaman indirin, yedekleyin veya içe aktarın.',
    nav_reports:'Raporlar',
    report_week:'Hafta', report_month:'Ay', report_year:'Yıl',
    report_export_pdf:'Raporu PDF olarak dışa aktar',
    modal_full_edit:'✏️ Tam düzenle', modal_journal:'📓 Günlük', modal_close:'Kapat',
    modal_cancel:'İptal',
    delete_all_title:'Tüm verilerimi sil',
    delete_all_desc:'Tüm girişleri, günlüğü, yedekleri ve ayarları kalıcı olarak siler.',
    delete_all_confirm:'Her şeyi sil',
    delete_entry:'Kaydı sil',
    daily_summary:'Günlük özet',
    low_mood:'Düşük ruh hali', neutral:'Nötr', good_mood:'İyi ruh hali', today:'Bugün',
    export_heatmap:'Isı haritasını dışa aktar',
    settings:'Ayarlar',
    s_appearance:'Görünüm', s_appearance_desc:'Tema ve görüntüleme tercihleri.',
    s_theme:'Tema', s_dark_mode:'Karanlık mod',
    s_sound:'Başarı sesi', s_particles:'Ortam partikülleri', s_parallax:'Paralaks kaydırma',
    s_preferences:'Tercihler', s_preferences_desc:'Varsayılan ve görüntüleme seçenekleri.',
    s_language:'Dil', s_date_format:'Tarih biçimi', s_time_format:'Saat biçimi',
    s_chart_days:'Grafik varsayılan günler', s_reduce_motion:'Hareketi azalt',
    s_notifications:'Bildirimleri etkinleştir (tarayıcı)',
    s_dashboard_widgets:"Gösterge paneli widget'ları",
    s_show_mood:'Ruh hali grafiğini göster', s_show_sleep:'Uyku grafiğini göster', s_show_energy:'Enerji grafiğini göster',
    s_custom_metrics:'Özel metrikler',
    s_custom_metrics_desc:'Kendi metriklerinizi ekleyin (örn. kaygı, ağrı, üretkenlik).',
    s_privacy:'Veri ve Gizlilik',
    s_privacy_desc:'Tüm veriler cihazınızda yerel olarak saklanır.',
    s_delete_all:'Tüm verilerimi sil',
    s_favourite_tags:'Favori etiketler', s_default_activities:'Varsayılan aktiviteler',
    pwa_install_text:'Hızlı erişim ve çevrimdışı kullanım için Aura\'yı yükleyin.',
    pwa_not_now:'Şimdi değil', pwa_install_btn:'Yükle',
    pwa_update_text:'Yeni bir sürüm mevcut.', pwa_reload:'Yenile'
},

/* ────────────────────────────── ARABIC ───────────────────────────── */
ar: {
    nav_tracking:'التتبع', nav_analytics_label:'التحليلات',
    nav_explore:'استكشاف', nav_data_label:'البيانات',
    nav_overview:'نظرة عامة', nav_checkin:'الفحص اليومي', nav_checkin_short:'تسجيل',
    nav_calendar:'التقويم', nav_journal:'اليوميات', nav_mood_trends:'اتجاهات المزاج',
    nav_sleep:'تحليل النوم', nav_energy:'أنماط الطاقة', nav_insights:'الرؤى',
    nav_correlations:'الارتباطات', nav_velocity:'سرعة المزاج', nav_forecast:'التوقعات',
    nav_patterns:'أنماطي', nav_seasonal:'الإيقاع الموسمي', nav_reports:'التقارير',
    nav_export:'تصدير ونسخ احتياطي', nav_menu:'القائمة', nav_seasonal_short:'موسمي',
    dash_welcome_title:'مرحباً بك في Aura Mood',
    dash_welcome_subtitle:'تتبع مزاجك ونومك وطاقتك كل يوم. تظهر الأنماط بعد أسبوع.',
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
    daily_checkin:'الفحص اليومي',
    checkin_subtitle:'سجّل مزاجك ونومك وطاقتك.',
    checkin_desc:'إدخال واحد في اليوم — مختصر أو مفصّل، الاختيار لك.',
    checkin_progress_label:'أكمل الأقسام أدناه',
    checkin_date_heading:'التاريخ', checkin_date:'التاريخ',
    checkin_mood_energy_heading:'المزاج والطاقة',
    checkin_sleep_heading:'النوم',
    checkin_activities_tags_heading:'الأنشطة والوسوم',
    checkin_mood:'المزاج', checkin_energy:'مستوى الطاقة',
    checkin_sleep_duration:'مدة النوم', checkin_sleep_quality:'جودة النوم',
    checkin_sleep_time:'وقت النوم الرئيسي', checkin_wake_time:'وقت الاستيقاظ الرئيسي',
    checkin_sleep_segments:'أجزاء النوم',
    checkin_activities:'الأنشطة', checkin_tags:'الوسوم', checkin_photos:'الصور',
    checkin_suggested_tags:'وسوم مقترحة', checkin_tap_to_add:'اضغط للإضافة',
    checkin_daily_reflection:'التأمل اليومي',
    checkin_reflection_desc:'سجّل كيف كان يومك، وما الذي أهمّك، وما الذي لاحظته.',
    checkin_saved_reflection:'التأمل المحفوظ',
    checkin_open_journal:'فتح اليوميات الكاملة',
    checkin_sleep_hint:'استخدم الأجزاء لتتبع النوم المتقطع أو متعدد الأطوار.',
    checkin_sleep_segments_intro:'سجّل النوم المنقسم أو المتقطع في أجزاء منفصلة.',
    checkin_add_segment:'+ إضافة جزء نوم',
    checkin_save_hint:'⌘S للحفظ',
    checkin_no_summary:'لا تكفي البيانات بعد لإنشاء ملخص.',
    undo:'تراجع', redo:'إعادة',
    calendar_title:'التقويم',
    calendar_subtitle:'استعرض سجل مزاجك عبر الأيام والأسابيع والأشهر.',
    cal_year_heatmap:'خريطة حرارة سنوية', cal_month_grid:'شبكة شهرية',
    cal_week_timeline:'الجدول الزمني الأسبوعي', cal_list:'قائمة',
    cal_year_in_mood:'عام في المزاج',
    cal_year_subtitle:'تتبع اتساق مزاجك خلال العام الماضي',
    journal:'اليوميات',
    journal_page_subtitle:'اكتب بحرية — هذا لك وحدك.',
    journal_unsaved:'تغييرات غير محفوظة',
    save_journal:'حفظ اليوميات',
    save_entry:'حفظ الإدخال',
    edit_journal_entry:'تعديل إدخال اليوميات',
    journal_saved_placeholder:'تم حفظ إدخال يومياتك لهذا اليوم بالفعل.',
    one_journal_per_day:'يمكن إنشاء إدخال يوميات واحد فقط في اليوم.',
    add_photo:'📷 إضافة صورة',
    page_mood_subtitle:'الأنماط والاتجاهات في صحتك العاطفية.',
    page_sleep_subtitle:'جودة واتساق راحتك.',
    page_energy_subtitle:'الإيقاع والقدرة على التحمل عبر الأيام.',
    page_velocity_h1:'سرعة واستقرار المزاج',
    page_velocity_subtitle:'انظر كيف يتغير مزاجك من يوم لآخر.',
    page_corr_subtitle:'اكتشف العلاقات بين المقاييس المتتبعة.',
    page_patterns_subtitle:'أنماط النوم والنشاط والمزاج.',
    page_seasonal_h1:'التحليل الموسمي والإيقاعي',
    page_seasonal_subtitle:'اكتشف كيف يتغير مزاجك ونومك وطاقتك عبر المواسم.',
    page_forecast_subtitle:'اتجاهات تنبؤية بناءً على بياناتك الأخيرة.',
    insights_eyebrow:'التحليلات الشخصية',
    insights_overview:'أنماط من بياناتك. كلما سجّلت أكثر، كانت أوضح.',
    page_export_subtitle:'بياناتك ملكك. قم بالتنزيل أو النسخ الاحتياطي أو الاستيراد في أي وقت.',
    nav_reports:'التقارير',
    report_week:'أسبوع', report_month:'شهر', report_year:'سنة',
    report_export_pdf:'تصدير التقرير بصيغة PDF',
    modal_full_edit:'✏️ تعديل كامل', modal_journal:'📓 اليوميات', modal_close:'إغلاق',
    modal_cancel:'إلغاء',
    delete_all_title:'حذف جميع بياناتي',
    delete_all_desc:'يحذف بشكل دائم جميع الإدخالات واليوميات والنسخ الاحتياطية والإعدادات.',
    delete_all_confirm:'حذف كل شيء',
    delete_entry:'حذف الإدخال',
    daily_summary:'ملخص اليوم',
    low_mood:'مزاج منخفض', neutral:'محايد', good_mood:'مزاج جيد', today:'اليوم',
    export_heatmap:'تصدير خريطة الحرارة',
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
    pwa_install_text:'ثبّت Aura للوصول السريع والاستخدام دون اتصال.',
    pwa_not_now:'ليس الآن', pwa_install_btn:'تثبيت',
    pwa_update_text:'إصدار جديد متاح.', pwa_reload:'إعادة تحميل'
}

    }; /* end T_E */

    /* ════════════════════════════════════════════════════════════════════
       WIRING — annotate + apply on boot, on navigate, on locale change
    ════════════════════════════════════════════════════════════════════ */
    function runAll() {
        annotateAll();
        applyBatchE(window.auraLocale || 'en');
    }

    onReady(function () {
        /* 1. Run once on boot */
        runAll();

        /* 2. Re-run on every page navigation */
        var origNav = window.navigate;
        if (typeof origNav === 'function' && !origNav._batchEPatched) {
            window.navigate = function (page) {
                var r = origNav.apply(this, arguments);
                setTimeout(runAll, 250);
                return r;
            };
            window.navigate._batchEPatched = true;
        }

        /* 3. Re-run when locale changes via savePreference */
        var origSave = window.savePreference;
        if (typeof origSave === 'function' && !origSave._batchELocalePatched) {
            window.savePreference = function (key, value) {
                var result = origSave.apply(this, arguments);
                if (key === 'locale') {
                    var loc = String(value || 'en');
                    if (loc === '_custom') {
                        var customEl = document.getElementById('prefLocaleCustom');
                        loc = customEl ? (customEl.value.trim() || 'en') : 'en';
                    }
                    window.auraLocale = loc;
                    setTimeout(runAll, 120);
                }
                return result;
            };
            window.savePreference._batchELocalePatched = true;
        }
    });

    console.log('[Aura Batch E] Complete i18n loaded — all pages, all languages.');
})();
