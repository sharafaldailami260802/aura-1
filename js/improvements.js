/**
 * Aura Mood — Improvements JS
 *
 * UI and behaviour enhancements: velocity chart colours, calendar/data-manager
 * fixes, modal button wiring, settings propagation (locale/date/time/theme),
 * translation fallback table for data-i18n, escape key and backdrop behaviour.
 * i18n.js is the single source of truth for translations when loaded.
 */
(function () {
    'use strict';

    /* ─── Wait for app to boot ───────────────────────────────────────── */
    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) {
            setTimeout(fn, 150);
            return;
        }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 700); });
    }

    /* ─── Colour helper ─────────────────────────────────────────────── */
    function hexToRgba(hex, alpha) {
        if (!hex || hex.indexOf('rgb') === 0) return hex || 'rgba(139,157,131,0.75)';
        var h = hex.replace('#', '');
        if (h.length !== 6) return hex;
        var r = parseInt(h.slice(0, 2), 16);
        var g = parseInt(h.slice(2, 4), 16);
        var b = parseInt(h.slice(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha != null ? alpha : 0.75) + ')';
    }

    /* ─── DB helper (own connection so we can read entries anywhere) ─── */
    var _db = null;
    function getDB() {
        if (_db) return _db;
        if (typeof Dexie === 'undefined') return null;
        try {
            var db = new Dexie('AuraAnalyticsDB');
            db.version(1).stores({ entries: 'id, date', appState: 'key', backupMeta: 'key' });
            db.version(2).stores({ entries: 'id, date', appState: 'key', backupMeta: 'key', backups: 'id' });
            _db = db;
            return db;
        } catch (e) { return null; }
    }

    function loadEntries(cb) {
        var db = getDB();
        if (!db) { cb({}); return; }
        db.entries.toArray().then(function (list) {
            var map = {};
            (list || []).forEach(function (e) { if (e && e.date) map[e.date] = e; });
            cb(map);
        }).catch(function () { cb({}); });
    }

    /* ═══════════════════════════════════════════════════════════════════
       1.  MOOD VELOCITY BAR COLOURS
           app.js exposes window.renderCircadian (not window.renderMoodVelocity).
       ═══════════════════════════════════════════════════════════════════ */
    onReady(function () {
        var orig = window.renderCircadian;
        if (typeof orig !== 'function') return;

        function applyVelocityColors() {
            var s = getComputedStyle(document.documentElement);
            var accent    = s.getPropertyValue('--accent').trim()            || '#8B9D83';
            var accentDark= s.getPropertyValue('--accent-dark').trim()       || '#6B7D63';
            var accentSec = s.getPropertyValue('--accent-secondary').trim()  || '#C97D60';
            var chart3    = s.getPropertyValue('--chart-3').trim()           || '#C97D60';
            var isDark    = document.documentElement.getAttribute('data-dark') === 'true';

            // 1. Velocity bar colours
            var chart = window.circadianChart;
            if (chart && chart.data && chart.data.datasets && chart.data.datasets[0]) {
                var velocities = chart.data.datasets[0].data;
                if (velocities && velocities.length) {
                    var pos     = hexToRgba(accent, 0.82);
                    var neg     = hexToRgba(chart3, 0.78);
                    var neutral = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(0,0,0,0.09)';
                    chart.data.datasets[0].backgroundColor = velocities.map(function (v) {
                        if (typeof v === 'number' && v > 0.5)  return pos;
                        if (typeof v === 'number' && v < -0.5) return neg;
                        return neutral;
                    });
                    chart.update('none');
                }
            }

            // 2. Stability score bar fill — app.js sets inline background using heat colours;
            //    override with accent palette to stay theme-consistent.
            var barFill = document.querySelector('#stabilityScorePanel .stability-score-bar-fill');
            if (barFill) {
                var pill = document.querySelector('#stabilityScorePanel .stability-pill');
                if (pill) {
                    if (pill.classList.contains('stable')) {
                        barFill.style.background = hexToRgba(accentDark, 0.85);
                    } else if (pill.classList.contains('moderate')) {
                        barFill.style.background = hexToRgba(accentSec, 0.75);
                    } else {
                        barFill.style.background = hexToRgba(chart3, 0.82);
                    }
                }
            }
        }

        window.renderCircadian = function () {
            var result = orig.apply(this, arguments);
            setTimeout(applyVelocityColors, 180);
            return result;
        };

        // Also wire up charts.js's renderMoodVelocityChart → renderCircadian
        window.renderMoodVelocity = window.renderCircadian;
    });

    /* ═══════════════════════════════════════════════════════════════════
       2.  SLEEP & ENERGY INSIGHT STRIPS
       ═══════════════════════════════════════════════════════════════════ */
    function safeAvg(arr) {
        if (!arr || !arr.length) return null;
        return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length;
    }

    function buildSleepInsights(entries) {
        var _t = typeof window.t === 'function' ? window.t : function(k, v) {
            if (!v) return k;
            return String(k).replace(/\{(\w+)\}/g, function(_, x) { return v[x] != null ? v[x] : ''; });
        };
        var dates = Object.keys(entries).sort();
        if (dates.length < 7) return null;

        var sleepNums = [];
        dates.forEach(function (d) {
            var e = entries[d];
            var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
            if (typeof s === 'number' && !isNaN(s) && s > 0) sleepNums.push(s);
        });
        if (sleepNums.length < 5) return null;

        var allAvg    = safeAvg(sleepNums);
        var recentAvg = safeAvg(sleepNums.slice(-7));
        var trend     = recentAvg - allAvg;
        var insights  = [];

        if (allAvg < 6.5) {
            insights.push({ icon: '⚠️', text: _t('sleep_insight_below_avg', { n: allAvg.toFixed(1) }), sub: _t('sleep_insight_below_sub') });
        } else {
            insights.push({ icon: '✨', text: _t('sleep_insight_healthy', { n: allAvg.toFixed(1) }), sub: _t('sleep_insight_healthy_sub') });
        }

        if (Math.abs(trend) > 0.4) {
            insights.push({
                icon: trend > 0 ? '📈' : '📉',
                text: trend > 0 ? _t('sleep_insight_trend_up', { n: trend.toFixed(1) }) : _t('sleep_insight_trend_down', { n: Math.abs(trend).toFixed(1) }),
                sub:  trend > 0 ? _t('sleep_insight_trend_up_sub') : _t('sleep_insight_trend_down_sub')
            });
        }

        var withMood = dates.filter(function (d) {
            var e = entries[d];
            var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
            return typeof s === 'number' && !isNaN(s) && typeof e.mood === 'number' && !isNaN(e.mood);
        });
        var sweetSpot = withMood.filter(function (d) {
            var s = entries[d].sleepTotal != null ? entries[d].sleepTotal : entries[d].sleep;
            return s >= 7 && s <= 8.5;
        });
        if (sweetSpot.length >= 3) {
            var ssAvgMood  = safeAvg(sweetSpot.map(function (d) { return entries[d].mood; }));
            var allAvgMood = safeAvg(withMood.map(function (d) { return entries[d].mood; }));
            if (ssAvgMood && allAvgMood && (ssAvgMood - allAvgMood) > 0.15) {
                insights.push({ icon: '🎯',
                    text: _t('sleep_insight_sweet_spot', { mood: ssAvgMood.toFixed(1), diff: (ssAvgMood - allAvgMood).toFixed(1) }),
                    sub:  _t('sleep_insight_sweet_spot_context', { n: sweetSpot.length })
                });
            }
        }

        return insights.slice(0, 3);
    }

    function buildEnergyInsights(entries) {
        var _t = typeof window.t === 'function' ? window.t : function(k, v) {
            if (!v) return k;
            return String(k).replace(/\{(\w+)\}/g, function(_, x) { return v[x] != null ? v[x] : ''; });
        };
        var dates = Object.keys(entries).sort();
        if (dates.length < 7) return null;

        var energyDates = dates.filter(function (d) { return entries[d] && typeof entries[d].energy === 'number' && !isNaN(entries[d].energy); });
        if (energyDates.length < 5) return null;

        var energies  = energyDates.map(function (d) { return entries[d].energy; });
        var allAvg    = safeAvg(energies);
        var recentAvg = safeAvg(energies.slice(-7));
        var trend     = recentAvg - allAvg;
        var insights  = [];

        var paired = energyDates.filter(function (d) { return typeof entries[d].mood === 'number' && !isNaN(entries[d].mood); });
        if (paired.length >= 7) {
            var xA = paired.map(function (d) { return entries[d].energy; });
            var yA = paired.map(function (d) { return entries[d].mood; });
            var n  = xA.length;
            var sx = 0, sy = 0, sxy = 0, sx2 = 0;
            for (var i = 0; i < n; i++) { sx += xA[i]; sy += yA[i]; sxy += xA[i] * yA[i]; sx2 += xA[i] * xA[i]; }
            var slope = (n * sx2 - sx * sx) ? (n * sxy - sx * sy) / (n * sx2 - sx * sx) : 0;
            if (Math.abs(slope) > 0.25) {
                var strength = Math.abs(slope) > 0.6 ? 'high' : 'moderate';
                insights.push({ icon: '⚡',
                    text: slope > 0 ? _t('energy_insight_corr_high', { strength: strength }) : _t('energy_insight_corr_low'),
                    sub: _t('energy_insight_corr_context', { n: n })
                });
            }
        }

        var avgTextKey = allAvg >= 7 ? 'energy_insight_avg_solid' : allAvg >= 5 ? 'energy_insight_avg_moderate' : 'energy_insight_avg_low';
        var avgSubKey  = allAvg < 5 ? 'energy_insight_avg_sub_low' : 'energy_insight_avg_sub_ok';
        insights.push({ icon: allAvg >= 6.5 ? '⚡' : '🔋',
            text: _t(avgTextKey, { n: allAvg.toFixed(1) }),
            sub:  _t(avgSubKey)
        });

        if (Math.abs(trend) > 0.4) {
            insights.push({ icon: trend > 0 ? '📈' : '📉',
                text: trend > 0 ? _t('energy_insight_trend_up', { n: '+' + trend.toFixed(1) }) : _t('energy_insight_trend_down', { n: trend.toFixed(1) }),
                sub:  trend < 0 ? _t('energy_insight_trend_down_sub') : _t('energy_insight_trend_up_sub')
            });
        }

        var sleepNums = [], energyNums = [];
        dates.forEach(function (d) {
            var e = entries[d];
            var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
            var en = e && e.energy;
            if (typeof s === 'number' && !isNaN(s) && typeof en === 'number' && !isNaN(en)) {
                sleepNums.push(s);
                energyNums.push(en);
            }
        });
        if (sleepNums.length >= 7) {
            var pairedSE = sleepNums.map(function (s, i) { return { x: s, y: energyNums[i] }; });
            var sorted = pairedSE.slice().sort(function (a, b) { return a.x - b.x; });
            var lowEnergy = safeAvg(sorted.slice(0, Math.floor(sorted.length / 2)).map(function (p) { return p.y; }));
            var highEnergy = safeAvg(sorted.slice(Math.ceil(sorted.length / 2)).map(function (p) { return p.y; }));
            if (lowEnergy != null && highEnergy != null) {
                var diff = highEnergy - lowEnergy;
                if (diff > 0.8) {
                    insights.push({ icon: '🔗',
                        text: _t('energy_insight_sleep_link'),
                        sub:  _t('energy_insight_sleep_link_sub', { n: diff.toFixed(1) })
                    });
                } else if (diff < -0.8) {
                    insights.push({ icon: '🤔',
                        text: _t('energy_insight_sleep_no_link'),
                        sub:  _t('energy_insight_sleep_no_link_sub')
                    });
                }
            }
        }

        return insights.slice(0, 3);
    }

    function renderInsights(pageId, insights) {
        var page = document.getElementById(pageId);
        if (!page) return;
        var stripId = pageId + 'InsightStrip';
        var container = document.getElementById(stripId);
        if (container) {
            container.style.display = (insights && insights.length) ? '' : 'none';
            if (!insights || !insights.length) return;
            container.innerHTML = insights.map(function (ins) {
                return '<div class="insight-strip-card">' +
                    '<span class="insight-strip-icon" aria-hidden="true">' + (ins.icon || '') + '</span>' +
                    '<div class="insight-strip-body">' +
                    '<p class="insight-strip-text">' + safe(ins.text) + '</p>' +
                    (ins.sub ? '<p class="insight-strip-sub">' + safe(ins.sub) + '</p>' : '') +
                    '</div></div>';
            }).join('');
            return;
        }
        var old = page.querySelector('.page-analytics-insights');
        if (old) old.remove();
        if (!insights || !insights.length) return;

        var _t = typeof window.t === 'function' ? window.t : function(k) { return k; };
        var strip = document.createElement('div');
        strip.className = 'page-analytics-insights';
        strip.innerHTML = '<h4>' + _t('insights_what_data_shows') + '</h4>' +
            insights.map(function (ins) {
                return '<div class="page-analytics-insight-row">' +
                    '<span class="page-analytics-insight-icon">' + ins.icon + '</span>' +
                    '<div><p class="page-analytics-insight-text">' + safe(ins.text) + '</p>' +
                    (ins.sub ? '<p class="page-analytics-insight-sub">' + safe(ins.sub) + '</p>' : '') +
                    '</div></div>';
            }).join('');

        var anchor = page.querySelector('.analytics-chart-card') || page.querySelector('.card');
        if (anchor && anchor.nextSibling) page.insertBefore(strip, anchor.nextSibling);
        else if (anchor) page.appendChild(strip);
        else page.appendChild(strip);
    }

    function safe(s) {
        return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    /* ═══════════════════════════════════════════════════════════════════
       3.  NAVIGATE HOOK — inject insights when sleep/energy pages open
       ═══════════════════════════════════════════════════════════════════ */
    onReady(function () {
        var origNav = window.navigate;
        if (typeof origNav !== 'function') return;

        window.navigate = function (page, btn) {
            var result = origNav.apply(this, arguments);

            if (page === 'sleep' || page === 'energy') {
                setTimeout(function () {
                    loadEntries(function (entries) {
                        if (Object.keys(entries).length < 7) return;
                        if (page === 'sleep') {
                            var ins = buildSleepInsights(entries);
                            if (ins) renderInsights('sleep', ins);
                        } else {
                            var ins = buildEnergyInsights(entries);
                            if (ins) renderInsights('energy', ins);
                        }
                    });
                }, 650);
            }

            return result;
        };
    });

    /* ═══════════════════════════════════════════════════════════════════
       4.  THEME / DARK MODE — re-render active charts after toggle
       ═══════════════════════════════════════════════════════════════════ */
    onReady(function () {
        function onThemeChange() {
            setTimeout(function () {
                if (typeof window.renderCharts === 'function') window.renderCharts();
                var active = document.querySelector('.page.active');
                if (!active) return;
                if (active.id === 'circadian' && typeof window.renderCircadian === 'function') window.renderCircadian();
                if (active.id === 'correlations') {
                    setTimeout(function () {
                        loadEntries(function (emap) {
                            if (typeof window.renderCorrPair === 'function') {
                                var activePairBtn = document.querySelector('.corr-pair-tab.active');
                                var pair = activePairBtn ? activePairBtn.dataset.pair : 'sleep-mood';
                                window.renderCorrPair(pair, emap);
                            } else if (typeof window.renderCorrelations === 'function') {
                                window.renderCorrelations();
                            }
                        });
                    }, 200);
                }
                if (active.id === 'seasonal') {
                    if (typeof window.renderSeasonal === 'function') window.renderSeasonal();
                    if (typeof window.renderYearOverYear === 'function') window.renderYearOverYear();
                }
            }, 380);
        }
        ['darkModeToggle', 'darkModeTogglePage'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('click', onThemeChange);
        });
    });

    /* ═══════════════════════════════════════════════════════════════════
       6.  REPORT TABS — enforce inactive button appearance
           setReportTab toggles .btn / .btn-secondary but some base styles
           override with higher specificity; fix with inline style guards.
       ═══════════════════════════════════════════════════════════════════ */
    onReady(function () {
        var reportTabs = document.querySelector('#reports .report-tabs');
        if (!reportTabs) return;

        function syncTabs() {
            reportTabs.querySelectorAll('button').forEach(function (btn) {
                var isActive = btn.classList.contains('active') || btn.classList.contains('btn') && !btn.classList.contains('btn-secondary');
                if (isActive) {
                    btn.removeAttribute('style');
                } else {
                    btn.style.cssText = 'background:transparent!important;color:var(--text-muted)!important;box-shadow:none!important;font-weight:500!important;border:none!important;';
                }
            });
        }

        new MutationObserver(syncTabs).observe(reportTabs, { attributes: true, subtree: true, attributeFilter: ['class'] });
        syncTabs();
    });

    /* ═══════════════════════════════════════════════════════════════════
       7.  ESCAPE KEY — close entry modal
       ═══════════════════════════════════════════════════════════════════ */
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        var em = document.getElementById('entryModal');
        if (em && em.classList.contains('show') && typeof window.closeEntryModal === 'function') {
            window.closeEntryModal();
        }
    });

    /* ═══════════════════════════════════════════════════════════════════
       8.  CALENDAR — month-grid context hint
       ═══════════════════════════════════════════════════════════════════ */
    onReady(function () {
        var panel = document.getElementById('calendarMonthPanel');
        if (!panel || panel.querySelector('.aura-month-hint')) return;
        var container = panel.querySelector('.calendar-container');
        if (!container) return;
        var hint = document.createElement('p');
        hint.className = 'aura-month-hint';
        hint.style.cssText = 'font-size:.85rem;color:var(--text-muted);margin:0 0 var(--space-md);line-height:1.5;';
        var _tHint = typeof window.t === 'function' ? window.t : function(k) { return k; };
        hint.textContent = _tHint('calendar_month_hint');
        var grid = container.querySelector('.month-grid');
        if (grid) container.insertBefore(hint, grid);
    });

    /* ═══════════════════════════════════════════════════════════════════
       9.  SIDEBAR SAFETY — ensure toggleDeepDive never throws
       ═══════════════════════════════════════════════════════════════════ */
    if (!window.toggleDeepDive) {
        window.toggleDeepDive = function () {
            var toggle = document.getElementById('deepDiveToggle');
            var group  = document.getElementById('deepDiveGroup');
            if (!toggle || !group) return;
            var exp = toggle.getAttribute('aria-expanded') === 'true';
            toggle.setAttribute('aria-expanded', String(!exp));
            group.setAttribute('aria-hidden', String(exp));
            try { localStorage.setItem('auraDeepDiveOpen', String(!exp)); } catch (_) {}
        };
    }

    console.log('[Aura Improvements] Loaded — velocity, insights, locale/theme propagation, report tabs, escape key patched.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH A — JS enhancements (IIFE, non-breaking)
   1. Tag chip UI: converts #tags text input into visual pill chips
   2. Journal page: hero date nav (prev/next day)
   3. Heatmap: refresh cell colours on theme change
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 200); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 800); });
    }

    /* ── 1. TAG CHIP UI ──────────────────────────────────────────────── */
    onReady(function () {
        var realInput = document.getElementById('tags');
        if (!realInput) return;
        if (document.getElementById('tagChipInputWrap')) return; // already init

        // Build the visual wrapper right after the original input
        var wrap = document.createElement('div');
        wrap.id = 'tagChipInputWrap';
        wrap.className = 'tag-chip-input-wrap';
        wrap.setAttribute('aria-label', 'Tags');

        var textInput = document.createElement('input');
        textInput.type = 'text';
        textInput.className = 'tag-chip-text-input';
        textInput.placeholder = 'Add a tag…';
        textInput.setAttribute('autocomplete', 'off');
        textInput.setAttribute('spellcheck', 'false');

        wrap.appendChild(textInput);
        realInput.parentNode.insertBefore(wrap, realInput.nextSibling);

        function getChips() {
            return Array.from(wrap.querySelectorAll('.tag-chip-live'));
        }

        function syncToReal() {
            var tags = getChips().map(function (c) { return c.dataset.tag; }).join(', ');
            realInput.value = tags;
            // Trigger change so app.js picks it up
            realInput.dispatchEvent(new Event('input', { bubbles: true }));
            realInput.dispatchEvent(new Event('change', { bubbles: true }));
        }

        function addTag(raw) {
            var tag = raw.replace(/^#+/, '').trim().toLowerCase();
            if (!tag) return;
            // Prevent duplicates
            if (getChips().some(function (c) { return c.dataset.tag === tag; })) return;

            var chip = document.createElement('span');
            chip.className = 'tag-chip-live';
            chip.dataset.tag = tag;
            chip.innerHTML = '#' + tag +
                '<button class="tag-chip-live-remove" aria-label="Remove ' + tag + '" tabindex="-1">×</button>';
            chip.querySelector('.tag-chip-live-remove').addEventListener('click', function (e) {
                e.stopPropagation();
                chip.style.transform = 'scale(0.8)';
                chip.style.opacity = '0';
                chip.style.transition = 'all 0.14s ease';
                setTimeout(function () { chip.remove(); syncToReal(); }, 140);
            });
            wrap.insertBefore(chip, textInput);
            syncToReal();
        }

        function parseTags(str) {
            return str.split(/[,\s]+/).filter(Boolean);
        }

        textInput.addEventListener('keydown', function (e) {
            if ((e.key === 'Enter' || e.key === ',') && textInput.value.trim()) {
                e.preventDefault();
                parseTags(textInput.value).forEach(addTag);
                textInput.value = '';
            }
            if (e.key === 'Backspace' && !textInput.value) {
                var chips = getChips();
                if (chips.length) chips[chips.length - 1].remove();
                syncToReal();
            }
        });

        textInput.addEventListener('blur', function () {
            if (textInput.value.trim()) {
                parseTags(textInput.value).forEach(addTag);
                textInput.value = '';
            }
        });

        wrap.addEventListener('click', function () { textInput.focus(); });

        // Sync existing value from realInput (in case form is prepopulated)
        function loadFromReal() {
            var existing = realInput.value.trim();
            wrap.querySelectorAll('.tag-chip-live').forEach(function (c) { c.remove(); });
            if (existing) parseTags(existing).forEach(addTag);
        }
        loadFromReal();

        // Watch for programmatic updates to #tags (app.js may set it on load)
        var obs = new MutationObserver(function () { });
        // Poll once after page is shown — handles edit mode
        var origNav = window.navigate;
        if (typeof origNav === 'function') {
            window.navigate = function (page) {
                var r = origNav.apply(this, arguments);
                if (page === 'entry') setTimeout(loadFromReal, 400);
                return r;
            };
        }

        // Expose globally so suggestion chips can use it
        window.auraAddTagChip = addTag;

        // Patch tag-suggestion chips: clicking one should also add a chip
        // (suggestions are rendered by app.js into #tagSuggestions)
        document.addEventListener('click', function (e) {
            var chip = e.target.closest('#tagSuggestions .em-tag-chip');
            if (!chip) return;
            var label = chip.textContent.replace(/^#+/, '').trim();
            if (label) addTag(label);
        });
    });

    /* ── 2. JOURNAL PAGE: prev/next day navigation ───────────────────── */
    onReady(function () {
        var prevBtn = document.getElementById('journalPrevDay');
        var nextBtn = document.getElementById('journalNextDay');
        var heroDate = document.getElementById('journalHeroDate');
        if (!prevBtn || !nextBtn) return;

        function formatHeroDate(dateStr) {
            if (!dateStr) return '';
            try {
                var d = new Date(dateStr + 'T12:00:00');
                return d.toLocaleDateString(window.auraLocale || undefined, { weekday: 'short', month: 'long', day: 'numeric' });
            } catch (e) { return dateStr; }
        }

        function updateHeroDate() {
            if (heroDate && typeof window.currentJournalDate !== 'undefined') {
                heroDate.textContent = formatHeroDate(window.currentJournalDate);
            }
        }

        // Hook into existing prev/next if they exist in app.js
        function shiftDay(delta) {
            // Try to use app.js journal date functions
            if (typeof window.journalNavigateDay === 'function') {
                window.journalNavigateDay(delta);
                setTimeout(updateHeroDate, 200);
                return;
            }
            // Fallback: read the date from journalEntryMeta text
            var meta = document.getElementById('journalEntryMeta');
            var metaText = meta ? meta.textContent.trim() : '';
            var match = metaText.match(/\d{4}-\d{2}-\d{2}/);
            var base = match ? match[0] : (typeof window.currentJournalDate !== 'undefined' ? window.currentJournalDate : new Date().toISOString().slice(0,10));
            var d = new Date(base + 'T12:00:00');
            d.setDate(d.getDate() + delta);
            var newDate = d.toISOString().slice(0,10);
            // Open journal for that date via app.js if possible
            if (typeof window.openJournalForDate === 'function') {
                window.openJournalForDate(newDate);
            } else if (typeof window.navigateTo === 'function') {
                window.navigateTo('journal', newDate);
            }
            setTimeout(updateHeroDate, 200);
        }

        prevBtn.addEventListener('click', function () { shiftDay(-1); });
        nextBtn.addEventListener('click', function () { shiftDay(+1); });

        // Update hero date whenever journal page is opened
        var origNav2 = window.navigate;
        if (typeof origNav2 === 'function') {
            window.navigate = function (page) {
                var r = origNav2.apply(this, arguments);
                if (page === 'journal') setTimeout(updateHeroDate, 350);
                return r;
            };
        }
        updateHeroDate();
    });

    /* ── 3. HEATMAP: re-apply cells on theme change ──────────────────── */
    onReady(function () {
        function onThemeChange2() {
            setTimeout(function () {
                if (typeof window.renderYearHeatmap === 'function') window.renderYearHeatmap();
            }, 420);
        }
        ['darkModeToggle', 'darkModeTogglePage'].forEach(function (id) {
            var el = document.getElementById(id);
            if (el) el.addEventListener('click', onThemeChange2);
        });
    });

    console.log('[Aura Improvements Batch A] Tags, journal nav, heatmap theming loaded.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH B — Correlations metric-pair toggle + Seasonal deviation chart
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 200); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 900); });
    }

    /* ── Colour helpers ─────────────────────────────────────────────── */
    function cssVar(name) {
        return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }
    function hexToRgba(hex, a) {
        if (!hex || hex.indexOf('rgb') === 0) return hex || 'rgba(139,157,131,0.7)';
        var h = hex.replace('#', '');
        if (h.length !== 6) return hex;
        return 'rgba(' + parseInt(h.slice(0,2),16) + ',' + parseInt(h.slice(2,4),16) + ',' + parseInt(h.slice(4,6),16) + ',' + a + ')';
    }
    function colorA(name, a) { return hexToRgba(cssVar(name), a); }

    /* ── DB helper ──────────────────────────────────────────────────── */
    function loadEntries(cb) {
        if (typeof Dexie === 'undefined') { cb({}); return; }
        try {
            var db = new Dexie('AuraAnalyticsDB');
            db.version(1).stores({ entries:'id,date', appState:'key', backupMeta:'key' });
            db.version(2).stores({ entries:'id,date', appState:'key', backupMeta:'key', backups:'id' });
            db.entries.toArray().then(function(list) {
                var map = {};
                (list || []).forEach(function(e) { if (e && e.date) map[e.date] = e; });
                cb(map);
            }).catch(function() { cb({}); });
        } catch(e) { cb({}); }
    }

    /* ─────────────────────────────────────────────────────────────────
       1. CORRELATIONS: metric-pair toggle
    ───────────────────────────────────────────────────────────────── */
    var corrChartInst = null;

    function getPairConfig() {
        var _tPC = typeof window.t === 'function' ? window.t : function(k) { return k; };
        return {
            'sleep-mood': {
                xKey:   function(e) { return e.sleepTotal != null ? e.sleepTotal : e.sleep; },
                yKey:   function(e) { return e.mood; },
                xLabel: _tPC('y_sleep'), yLabel: _tPC('y_mood'),
                xMin: 0, xMax: 12, yMin: 1, yMax: 10,
                label:  _tPC('corr_label_sleep_mood'),
                desc:   _tPC('corr_desc_sleep_mood'),
                color:  '--chart-1'
            },
            'sleep-energy': {
                xKey:   function(e) { return e.sleepTotal != null ? e.sleepTotal : e.sleep; },
                yKey:   function(e) { return e.energy; },
                xLabel: _tPC('y_sleep'), yLabel: _tPC('y_energy'),
                xMin: 0, xMax: 12, yMin: 1, yMax: 10,
                label:  _tPC('corr_label_sleep_energy'),
                desc:   _tPC('corr_desc_sleep_energy'),
                color:  '--accent-secondary'
            },
            'mood-energy': {
                xKey:   function(e) { return e.mood; },
                yKey:   function(e) { return e.energy; },
                xLabel: _tPC('y_mood'), yLabel: _tPC('y_energy'),
                xMin: 1, xMax: 10, yMin: 1, yMax: 10,
                label:  _tPC('corr_label_mood_energy'),
                desc:   _tPC('corr_desc_mood_energy'),
                color:  '--chart-3'
            }
        };
    }
    var PAIR_CONFIG = getPairConfig();

    function computeR2(xs, ys) {
        if (!xs || !ys || xs.length < 3) return null;
        var n = xs.length;
        var mx = xs.reduce(function(a,b){return a+b;},0)/n;
        var my = ys.reduce(function(a,b){return a+b;},0)/n;
        var num=0, dxdx=0, dydy=0;
        for(var i=0;i<n;i++) { num+=(xs[i]-mx)*(ys[i]-my); dxdx+=(xs[i]-mx)*(xs[i]-mx); dydy+=(ys[i]-my)*(ys[i]-my); }
        if(!dxdx||!dydy) return 0;
        var r = num/Math.sqrt(dxdx*dydy);
        return r*r;
    }

    function regressionLine(xs, ys, xMin, xMax) {
        if (!xs || xs.length < 3) return null;
        var n = xs.length;
        var mx = xs.reduce(function(a,b){return a+b;},0)/n;
        var my = ys.reduce(function(a,b){return a+b;},0)/n;
        var num=0, den=0;
        for(var i=0;i<n;i++){ num+=(xs[i]-mx)*(ys[i]-my); den+=(xs[i]-mx)*(xs[i]-mx); }
        if(!den) return null;
        var slope = num/den, intercept = my - slope*mx;
        return [{x: xMin, y: slope*xMin+intercept}, {x: xMax, y: slope*xMax+intercept}];
    }

    function renderCorrPair(pairKey, emap) {
        var canvas = document.getElementById('correlationsChart');
        if (!canvas) return;
        PAIR_CONFIG = getPairConfig();
        var cfg = PAIR_CONFIG[pairKey];
        if (!cfg) return;
        var _tCRP = typeof window.t === 'function' ? window.t : function(k) { return k; };

        var dates = Object.keys(emap).sort();
        var xs = [], ys = [];
        dates.forEach(function(d) {
            var e = emap[d];
            var x = cfg.xKey(e), y = cfg.yKey(e);
            if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
                xs.push(x); ys.push(y);
            }
        });

        var r2 = computeR2(xs, ys);
        var badge = document.getElementById('corrR2Badge');
        if (badge) {
            badge.textContent = r2 != null ? _tCRP('r2_badge', { n: (r2*100).toFixed(1) }) : (xs.length < 3 ? _tCRP('corr_need_entries') : '');
        }
        var descEl = document.getElementById('corrPairDesc');
        if (descEl) descEl.textContent = cfg.desc;

        var c1 = cssVar(cfg.color);
        var pts = xs.map(function(x,i){ return {x:x, y:ys[i]}; });
        var reg = regressionLine(xs, ys, cfg.xMin, cfg.xMax);
        var isDark = document.documentElement.getAttribute('data-dark') === 'true';

        var datasets = [{
            label: cfg.label,
            data: pts.length ? pts : [{x: cfg.xMin, y: (cfg.yMin+cfg.yMax)/2}],
            backgroundColor: hexToRgba(c1, 0.32),
            borderColor: c1,
            pointRadius: 5, pointHoverRadius: 8,
            pointBorderWidth: 1.5,
            pointBorderColor: hexToRgba(c1, 0.7),
            type: 'scatter'
        }];
        if (reg) datasets.push({
            label: _tCRP('corr_trend_label'),
            data: reg,
            type: 'line',
            borderColor: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.28)',
            borderWidth: 2,
            borderDash: [5, 4],
            pointRadius: 0, pointHoverRadius: 0,
            fill: false, tension: 0
        });

        if (corrChartInst) { corrChartInst.destroy(); corrChartInst = null; }
        var existing = window.Chart && window.Chart.getChart && window.Chart.getChart(canvas);
        if (existing) existing.destroy();

        if (typeof Chart === 'undefined') return;
        corrChartInst = new Chart(canvas, {
            type: 'scatter',
            data: { datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                parsing: false,
                animation: { duration: 380, easing: 'easeOutQuart' },
                layout: { padding: { top: 8, right: 16, bottom: 8, left: 8 } },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: function(items) {
                                var pt = items[0] && items[0].raw;
                                if (!pt || typeof pt.x !== 'number') return cfg.label;
                                return pt.x.toFixed(1) + ' ' + cfg.xLabel.split(' ')[0] + ' · ' + cfg.yLabel.split(' ')[0] + ' ' + pt.y;
                            },
                            label: function(ctx) {
                                if (ctx.raw && typeof ctx.raw.x === 'number') return cfg.xLabel + ': ' + ctx.raw.x.toFixed(1) + ', ' + cfg.yLabel + ': ' + ctx.raw.y;
                                return ctx.dataset.label || '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear', min: cfg.xMin, max: cfg.xMax,
                        title: { display: true, text: cfg.xLabel, font: { size: 11, weight: '600' }, color: cssVar('--text-muted') },
                        grid: { display: false },
                        ticks: { maxTicksLimit: 7, font: { size: 11 }, padding: 8, color: cssVar('--text-muted') }
                    },
                    y: {
                        min: cfg.yMin, max: cfg.yMax,
                        title: { display: true, text: cfg.yLabel, font: { size: 11, weight: '600' }, color: cssVar('--text-muted') },
                        grid: { color: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)' },
                        ticks: { maxTicksLimit: 6, font: { size: 11 }, padding: 8, color: cssVar('--text-muted') }
                    }
                }
            }
        });
    }
    if (typeof renderCorrPair === 'function') window.renderCorrPair = renderCorrPair;

    var _corrCurrentPair = 'sleep-mood';
    var _corrCachedEntries = null;

    onReady(function () {
        var tabs = document.getElementById('corrPairTabs');
        if (!tabs) return;

        var currentPair = _corrCurrentPair;
        var cachedEntries = _corrCachedEntries;

        function switchPair(pairKey) {
            currentPair = pairKey;
            _corrCurrentPair = pairKey;
            tabs.querySelectorAll('.corr-pair-tab').forEach(function(btn) {
                var active = btn.dataset.pair === pairKey;
                btn.classList.toggle('active', active);
                btn.setAttribute('aria-selected', String(active));
            });
            if (cachedEntries) renderCorrPair(pairKey, cachedEntries);
        }

        tabs.addEventListener('click', function(e) {
            var btn = e.target.closest('.corr-pair-tab');
            if (!btn || !btn.dataset.pair) return;
            switchPair(btn.dataset.pair);
        });

        // Hook into navigate so we reload entries each time correlations opens
        var origNav = window.navigate;
        if (typeof origNav === 'function') {
            window.navigate = function(page) {
                var r = origNav.apply(this, arguments);
                if (page === 'correlations') {
                    setTimeout(function() {
                        loadEntries(function(emap) {
                            cachedEntries = emap;
                            _corrCachedEntries = emap;
                            renderCorrPair(currentPair, emap);
                        });
                    }, 400);
                }
                return r;
            };
        }

        // Also intercept window.renderCorrelations re-calls (theme change etc.)
        var origRender = window.renderCorrelations;
        if (typeof origRender === 'function') {
            window.renderCorrelations = function() {
                var r = origRender.apply(this, arguments);
                setTimeout(function() {
                    loadEntries(function(emap) {
                        cachedEntries = emap;
                        _corrCachedEntries = emap;
                        renderCorrPair(currentPair, emap);
                    });
                }, 250);
                return r;
            };
        }
    });

    /* ─────────────────────────────────────────────────────────────────
       2. SEASONAL DEVIATION: sine-wave style monthly deviation chart
    ───────────────────────────────────────────────────────────────── */
    var devChartInst = null;

    var METRIC_CFG = {
        mood:   { key: 'mood',   label: 'Mood',   colorVar: '--chart-1',          scale: 10 },
        sleep:  { key: 'sleep',  label: 'Sleep',  colorVar: '--accent-secondary',  scale: 12,
                  extract: function(e) { return e.sleepTotal != null ? e.sleepTotal : e.sleep; } },
        energy: { key: 'energy', label: 'Energy', colorVar: '--chart-3',           scale: 10 }
    };

    function buildDevDataset(metricKey, emap) {
        var cfg = METRIC_CFG[metricKey];
        if (!cfg) return null;
        var months = [0,1,2,3,4,5,6,7,8,9,10,11];
        var buckets = months.map(function() { return []; });
        Object.keys(emap).forEach(function(date) {
            var e = emap[date];
            var val = cfg.extract ? cfg.extract(e) : e[cfg.key];
            if (typeof val !== 'number' || isNaN(val)) return;
            var m = new Date(date + 'T12:00:00').getMonth();
            buckets[m].push(val);
        });
        var avgs = buckets.map(function(b) { return b.length ? b.reduce(function(a,v){return a+v;},0)/b.length : null; });
        var allVals = avgs.filter(function(v){return v!=null;});
        if (!allVals.length) return null;
        var mean = allVals.reduce(function(a,b){return a+b;},0)/allVals.length;
        var devs = avgs.map(function(v) { return v != null ? parseFloat((v - mean).toFixed(2)) : null; });

        // Smooth with simple 3-point average for sine-wave feel
        var smooth = devs.map(function(v, i) {
            if (v == null) return null;
            var prev = devs[(i + 11) % 12], next = devs[(i + 1) % 12];
            var vals = [v];
            if (prev != null) vals.push(prev);
            if (next != null) vals.push(next);
            return parseFloat((vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(2));
        });

        var c = cssVar(cfg.colorVar);
        return {
            label: cfg.label,
            data: smooth,
            borderColor: c,
            backgroundColor: hexToRgba(c, 0.12),
            borderWidth: 2.5,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointBackgroundColor: hexToRgba(c, 0.9),
            pointBorderColor: c,
            pointBorderWidth: 1.5,
            tension: 0.45,
            fill: true
        };
    }

    function renderSeasonalDeviation(emap, activeMetrics) {
        var canvas = document.getElementById('seasonalDeviationChart');
        if (!canvas) return;
        if (devChartInst) { devChartInst.destroy(); devChartInst = null; }
        var existing = window.Chart && window.Chart.getChart && window.Chart.getChart(canvas);
        if (existing) existing.destroy();
        if (typeof Chart === 'undefined') return;

        var rangeEl = document.getElementById('seasonalDevRange');
        var rangeDays = rangeEl ? parseInt(rangeEl.value, 10) : 0;
        var filteredMap = emap;
        if (rangeDays > 0) {
            var cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - rangeDays);
            var cutoffStr = cutoff.toISOString().split('T')[0];
            filteredMap = {};
            Object.keys(emap).forEach(function (d) {
                if (d >= cutoffStr) filteredMap[d] = emap[d];
            });
        }

        var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        var datasets = [];
        activeMetrics.forEach(function(m) {
            var ds = buildDevDataset(m, filteredMap);
            if (ds) datasets.push(ds);
        });

        var isDark = document.documentElement.getAttribute('data-dark') === 'true';
        var gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
        var tickColor = cssVar('--text-muted');

        devChartInst = new Chart(canvas, {
            type: 'line',
            data: { labels: months, datasets: datasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                animation: { duration: 500, easing: 'easeOutQuart' },
                interaction: { mode: 'index', intersect: false },
                layout: { padding: { top: 12, right: 16, bottom: 8, left: 8 } },
                plugins: {
                    legend: {
                        display: datasets.length > 1,
                        position: 'top',
                        align: 'end',
                        labels: { boxWidth: 12, boxHeight: 12, borderRadius: 6, padding: 16, font: { size: 11 }, color: tickColor }
                    },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: function(items) { return items[0] ? months[items[0].dataIndex] : ''; },
                            label: function(ctx) {
                                var v = ctx.raw;
                                if (v == null) return ctx.dataset.label + ': no data';
                                var sign = v >= 0 ? '+' : '';
                                return ctx.dataset.label + ': ' + sign + v.toFixed(2) + ' vs your average';
                            }
                        }
                    },
                    // Zero reference line via annotation-less approach: drawn in afterDraw
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { size: 11 }, color: tickColor, padding: 8 }
                    },
                    y: {
                        grid: { color: gridColor },
                        ticks: {
                            font: { size: 11 }, color: tickColor, padding: 8,
                            callback: function(v) {
                                var sign = v > 0 ? '+' : '';
                                return sign + v.toFixed(1);
                            }
                        },
                        title: { display: true, text: (typeof window.t === 'function' ? window.t : function(k){return k;})('corr_deviation_label'), font: { size: 10, weight: '600' }, color: tickColor }
                    }
                }
            },
            plugins: [{
                // Draw zero baseline
                id: 'zeroLine',
                afterDraw: function(chart) {
                    var yAxis = chart.scales['y'];
                    if (!yAxis) return;
                    var y0 = yAxis.getPixelForValue(0);
                    var ctx = chart.ctx;
                    var ca = chart.chartArea;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(ca.left, y0);
                    ctx.lineTo(ca.right, y0);
                    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.28)' : 'rgba(0,0,0,0.25)';
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([4, 4]);
                    ctx.stroke();
                    ctx.restore();
                }
            }]
        });
    }

    onReady(function () {
        var container = document.querySelector('.seasonal-deviation-card');
        if (!container) return;

        var cachedEntries = null;
        function getActiveMetrics() {
            return Array.from(container.querySelectorAll('.seasonal-dev-toggle input:checked'))
                        .map(function(cb) { return cb.value; });
        }

        function refresh() {
            if (!cachedEntries) return;
            var active = getActiveMetrics();
            renderSeasonalDeviation(cachedEntries, active.length ? active : ['mood']);
        }

        // Toggle checkboxes
        container.querySelectorAll('.seasonal-dev-toggle input[type="checkbox"]').forEach(function(cb) {
            cb.addEventListener('change', function() {
                // Always keep at least one active
                var checked = getActiveMetrics();
                if (!checked.length) { cb.checked = true; }
                refresh();
            });
        });

        var rangeEl = document.getElementById('seasonalDevRange');
        if (rangeEl) {
            rangeEl.addEventListener('change', function() { refresh(); });
        }

        // Hook navigate
        var origNav2 = window.navigate;
        if (typeof origNav2 === 'function') {
            window.navigate = function(page) {
                var r = origNav2.apply(this, arguments);
                if (page === 'seasonal') {
                    setTimeout(function() {
                        loadEntries(function(emap) {
                            cachedEntries = emap;
                            refresh();
                        });
                    }, 400);
                }
                return r;
            };
        }
    });

    console.log('[Aura Improvements Batch B] Correlations toggle + seasonal deviation loaded.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH C — Calendar edit modal fixes + button functionality
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 120); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 800); });
    }

    /* ─────────────────────────────────────────────────────────────────────
       1. FIX: closePremiumConfirm not exposed to window
          The premium confirm modal cancel button (in index.html) calls
          closePremiumConfirm() inline, but app.js never attaches it to
          window — so clicking Cancel did nothing. Patch it here.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        // Wait for app.js to finish its own window-expose block
        setTimeout(function () {
            if (typeof window.closePremiumConfirm !== 'function') {
                // Find it in closure scope via the modal element itself
                window.closePremiumConfirm = function () {
                    var modal = document.getElementById('premiumConfirmModal');
                    if (modal) {
                        modal.classList.remove('show');
                        modal.setAttribute('aria-hidden', 'true');
                    }
                };
            }
        }, 300);
    });

    /* ─────────────────────────────────────────────────────────────────────
       2. FIX: Entry modal footer buttons — ensure onclick handlers resolve
          even if the global function name differs across app versions.
          We bind via event delegation so we never rely on inline onclick.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        var overlay = document.getElementById('entryModal');
        if (!overlay) return;

        overlay.addEventListener('click', function (e) {
            // "Full Edit" button
            var editBtn = e.target.closest('#entryModalEditBtn');
            if (editBtn) {
                e.preventDefault();
                var dateStr = window.entryModalDate || '';
                if (!dateStr) return;
                if (typeof window.openEntryForDate === 'function') {
                    window.openEntryForDate(dateStr);
                } else if (typeof window.navigateTo === 'function') {
                    window.navigateTo('entry', dateStr);
                }
                return;
            }

            // "Journal" button
            var journalBtn = e.target.closest('#entryModalJournalBtn');
            if (journalBtn) {
                e.preventDefault();
                var dateStr = window.entryModalDate || '';
                if (!dateStr) return;
                if (typeof window.openJournalEntryFromModal === 'function') {
                    window.openJournalEntryFromModal(dateStr);
                } else if (typeof window.navigateTo === 'function') {
                    window.navigateTo('journal', dateStr);
                }
                return;
            }

            // Close / btn-neutral
            var closeBtn = e.target.closest('.entry-modal-close, .btn-neutral');
            if (closeBtn && closeBtn.closest('#entryModal')) {
                e.preventDefault();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                return;
            }
        });
    });

    /* ─────────────────────────────────────────────────────────────────────
       3. FIX: Calendar record action buttons (Edit Check-In / Edit Journal)
          and recent-entry list buttons (Edit / Delete) — patch via event
          delegation on document so dynamically rendered lists are covered.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        document.addEventListener('click', function (e) {

            // ── Calendar record: Edit Check-In
            var calEdit = e.target.closest('.calendar-record-action:not(.btn-secondary)');
            if (calEdit) {
                // Only handle if it has no working onclick already (check for data-date or ancestor)
                var card = calEdit.closest('.calendar-record-card');
                var dateStr = card && card.getAttribute('data-date');
                // If app.js rendered inline onclick, it will fire before this — so only
                // act as a safety net when navigateTo is available but the date is missing
                if (dateStr && typeof window.navigateTo === 'function') {
                    e.stopPropagation();
                    window.navigateTo('entry', dateStr);
                }
                return;
            }

            // ── Calendar record: Edit Journal
            var calJournal = e.target.closest('.calendar-record-action.btn-secondary');
            if (calJournal) {
                var card = calJournal.closest('.calendar-record-card');
                var dateStr = card && card.getAttribute('data-date');
                if (dateStr && typeof window.navigateTo === 'function') {
                    e.stopPropagation();
                    window.navigateTo('journal', dateStr);
                }
                return;
            }

            // ── Entry list: Edit (journal) button
            var entryEdit = e.target.closest('.entry-record-action');
            if (entryEdit) {
                var item = entryEdit.closest('[data-date]');
                var dateStr = item && item.getAttribute('data-date');
                if (dateStr && typeof window.openJournalEntry === 'function') {
                    e.stopPropagation();
                    window.openJournalEntry(dateStr);
                }
                return;
            }

            // ── Entry list: Delete button
            var entryDel = e.target.closest('.entry-record-delete');
            if (entryDel) {
                var item = entryDel.closest('[data-date]');
                var dateStr = item && item.getAttribute('data-date');
                if (dateStr && typeof window.openDeleteEntryModal === 'function') {
                    e.stopPropagation();
                    window.openDeleteEntryModal(dateStr, entryDel);
                }
                return;
            }
        }, true); // capture phase so we run before app.js bubble handlers
    });

    /* ─────────────────────────────────────────────────────────────────────
       4. FIX: Data Manager date selection — auto-apply preview on change.
          #settingsDataManagerDate change should trigger renderDataManagerPreview
          without requiring a separate button press.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        setTimeout(function () {
            var dateInput = document.getElementById('settingsDataManagerDate');
            if (!dateInput || dateInput._batchCBound) return;
            dateInput._batchCBound = true;

            function triggerPreview() {
                // Use app.js's own function if available
                if (typeof window.selectSettingsDataManagerDate === 'function') {
                    window.selectSettingsDataManagerDate();
                    return;
                }
                // Fallback: read value and call renderDataManagerPreview
                var val = dateInput.value || '';
                if (val && typeof window.renderDataManagerPreview === 'function') {
                    window.renderDataManagerPreview(val);
                }
            }

            dateInput.addEventListener('change', triggerPreview);
            dateInput.addEventListener('input', function () {
                // debounce for typed input
                clearTimeout(dateInput._previewTimer);
                dateInput._previewTimer = setTimeout(triggerPreview, 350);
            });
        }, 600);
    });

    /* ─────────────────────────────────────────────────────────────────────
       5. UX: Escape key closes any open modal (entry modal, premium confirm,
          delete modals) — a consistent premium-app behaviour.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        document.addEventListener('keydown', function (e) {
            if (e.key !== 'Escape') return;

            // premiumConfirmModal
            var pcm = document.getElementById('premiumConfirmModal');
            if (pcm && pcm.classList.contains('show')) {
                if (typeof window.closePremiumConfirm === 'function') window.closePremiumConfirm();
                return;
            }
            // entryModal
            var em = document.getElementById('entryModal');
            if (em && em.classList.contains('show')) {
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                return;
            }
            // fullEntryDeleteModal
            var fed = document.getElementById('fullEntryDeleteModal');
            if (fed && fed.classList.contains('show')) {
                if (typeof window.closeFullEntryDeleteModal === 'function') window.closeFullEntryDeleteModal();
                return;
            }
            // deleteEntryModal
            var dem = document.getElementById('deleteEntryModal');
            if (dem && dem.classList.contains('show')) {
                if (typeof window.closeDeleteEntryModal === 'function') window.closeDeleteEntryModal();
                return;
            }
        });
    });

    /* ─────────────────────────────────────────────────────────────────────
       6. UX: Backdrop click on premiumConfirmModal closes it.
          Inline onclick on the overlay calls closePremiumConfirm(); we ensure
          that function is on window (see closePremiumConfirm patch above). This listener is a fallback.
    ───────────────────────────────────────────────────────────────────── */
    onReady(function () {
        var pcm = document.getElementById('premiumConfirmModal');
        if (!pcm || pcm._batchCBound) return;
        pcm._batchCBound = true;
        pcm.addEventListener('click', function (e) {
            if (e.target === pcm && typeof window.closePremiumConfirm === 'function') {
                window.closePremiumConfirm();
            }
        });
    });

    /* ── Forecast: show patterns card when renderPredictions populates it ── */
    (function patchForecastPatterns() {
        function onReady(fn) {
            if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 200); return; }
            document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 900); });
        }
        onReady(function () {
            var orig = window.renderPredictions;
            if (typeof orig !== 'function') return;
            window.renderPredictions = function () {
                var result = orig.apply(this, arguments);
                setTimeout(function () {
                    var patternsEl = document.getElementById('predictionPatterns');
                    var patternsCard = document.getElementById('predictionPatternsCard');
                    if (patternsEl && patternsCard) {
                        var hasContent = (patternsEl.textContent || '').trim().length > 0;
                        patternsCard.style.display = hasContent ? '' : 'none';
                    }
                }, 100);
                return result;
            };
        });
    })();

    console.log('[Aura Improvements Batch C] Modal fixes + button delegation loaded.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH D — Settings propagation fixes
   1. Language: use full translation table on initial load
   2. Date format: refresh ALL date-bearing surfaces, not just active page
   3. Time format: refresh dynamically-added sleep segment inputs
   4. Theme: rerender active analytics chart after colour change
   5. Visual feedback: toast on settings save
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function onReady(fn) {
        if (document.readyState !== 'loading' && window.navigate) { setTimeout(fn, 300); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 1000); });
    }

    /* ── Fallback translation table for data-i18n (i18n.js is authoritative when loaded) ── */
    var T_FULL = {
        en: { save_entry:'Save Entry', calendar_title:'Calendar', calendar_subtitle:'Explore your mood history across days, weeks and months.', daily_checkin:'Daily Check-In', journal:'Journal', settings:'Settings', daily_summary:'Daily Summary', export_heatmap:'Export Heatmap', delete_entry:'Delete Entry', low_mood:'Low mood', neutral:'Neutral', good_mood:'Good mood', today:'Today', edit_journal_entry:'Edit journal entry', journal_saved_placeholder:'Your journal entry for today has already been saved.', one_journal_per_day:'Only one journal entry can be created per day.', add_photo:'📷 Add Photo' },
        de: { save_entry:'Eintrag speichern', calendar_title:'Kalender', calendar_subtitle:'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.', daily_checkin:'Tages-Check-in', journal:'Tagebuch', settings:'Einstellungen', daily_summary:'Tageszusammenfassung', export_heatmap:'Heatmap exportieren', delete_entry:'Eintrag löschen', low_mood:'Niedrige Stimmung', neutral:'Neutral', good_mood:'Gute Stimmung', today:'Heute', edit_journal_entry:'Tagebucheintrag bearbeiten', journal_saved_placeholder:'Dein Tagebucheintrag wurde bereits gespeichert.', one_journal_per_day:'Pro Tag kann nur ein Tagebucheintrag erstellt werden.', add_photo:'📷 Foto hinzufügen' },
        fr: { save_entry:'Enregistrer', calendar_title:'Calendrier', calendar_subtitle:'Explorez votre historique d\'humeur par jour, semaine et mois.', daily_checkin:'Bilan du jour', journal:'Journal', settings:'Paramètres', daily_summary:'Résumé du jour', export_heatmap:'Exporter la heatmap', delete_entry:'Supprimer', low_mood:'Humeur basse', neutral:'Neutre', good_mood:'Bonne humeur', today:'Aujourd\'hui', edit_journal_entry:'Modifier l\'entrée', journal_saved_placeholder:'Votre entrée a déjà été enregistrée.', one_journal_per_day:'Un seul entrée par jour.', add_photo:'📷 Ajouter une photo' },
        es: { save_entry:'Guardar entrada', calendar_title:'Calendario', calendar_subtitle:'Explora tu historial de ánimo por días, semanas y meses.', daily_checkin:'Registro diario', journal:'Diario', settings:'Ajustes', daily_summary:'Resumen del día', export_heatmap:'Exportar mapa de calor', delete_entry:'Eliminar', low_mood:'Ánimo bajo', neutral:'Neutral', good_mood:'Buen ánimo', today:'Hoy', edit_journal_entry:'Editar entrada', journal_saved_placeholder:'Tu entrada ya ha sido guardada.', one_journal_per_day:'Solo una entrada por día.', add_photo:'📷 Añadir foto' },
        it: { save_entry:'Salva voce', calendar_title:'Calendario', calendar_subtitle:'Esplora la storia dell\'umore per giorni, settimane e mesi.', daily_checkin:'Check-in quotidiano', journal:'Diario', settings:'Impostazioni', daily_summary:'Riepilogo quotidiano', export_heatmap:'Esporta heatmap', delete_entry:'Elimina', low_mood:'Umore basso', neutral:'Neutro', good_mood:'Buon umore', today:'Oggi', edit_journal_entry:'Modifica voce', journal_saved_placeholder:'La voce è già stata salvata.', one_journal_per_day:'Una sola voce per giorno.', add_photo:'📷 Aggiungi foto' },
        pt: { save_entry:'Guardar entrada', calendar_title:'Calendário', calendar_subtitle:'Explore o historial de humor por dias, semanas e meses.', daily_checkin:'Check-in diário', journal:'Diário', settings:'Definições', daily_summary:'Resumo diário', export_heatmap:'Exportar heatmap', delete_entry:'Eliminar', low_mood:'Humor baixo', neutral:'Neutro', good_mood:'Bom humor', today:'Hoje', edit_journal_entry:'Editar entrada', journal_saved_placeholder:'A entrada já foi guardada.', one_journal_per_day:'Apenas uma entrada por dia.', add_photo:'📷 Adicionar foto' },
        nl: { save_entry:'Invoer opslaan', calendar_title:'Kalender', calendar_subtitle:'Verken uw stemmingsgeschiedenis per dag, week en maand.', daily_checkin:'Dagelijkse check-in', journal:'Dagboek', settings:'Instellingen', daily_summary:'Dagelijks overzicht', export_heatmap:'Heatmap exporteren', delete_entry:'Verwijderen', low_mood:'Lage stemming', neutral:'Neutraal', good_mood:'Goede stemming', today:'Vandaag', edit_journal_entry:'Dagboek bewerken', journal_saved_placeholder:'De dagboekvermelding is al opgeslagen.', one_journal_per_day:'Eén dagboekvermelding per dag.', add_photo:'📷 Foto toevoegen' },
        pl: { save_entry:'Zapisz wpis', calendar_title:'Kalendarz', calendar_subtitle:'Przeglądaj historię nastroju po dniach, tygodniach i miesiącach.', daily_checkin:'Codzienny check-in', journal:'Dziennik', settings:'Ustawienia', daily_summary:'Podsumowanie dnia', export_heatmap:'Eksportuj heatmapę', delete_entry:'Usuń', low_mood:'Zły nastrój', neutral:'Neutralny', good_mood:'Dobry nastrój', today:'Dziś', edit_journal_entry:'Edytuj wpis', journal_saved_placeholder:'Wpis w dzienniku jest już zapisany.', one_journal_per_day:'Jeden wpis w dzienniku na dzień.', add_photo:'📷 Dodaj zdjęcie' },
        ru: { save_entry:'Сохранить запись', calendar_title:'Календарь', calendar_subtitle:'Изучайте историю настроения за дни, недели и месяцы.', daily_checkin:'Ежедневный чек-ин', journal:'Дневник', settings:'Настройки', daily_summary:'Итог дня', export_heatmap:'Экспорт тепловой карты', delete_entry:'Удалить', low_mood:'Плохое настроение', neutral:'Нейтрально', good_mood:'Хорошее настроение', today:'Сегодня', edit_journal_entry:'Редактировать запись', journal_saved_placeholder:'Запись уже сохранена.', one_journal_per_day:'Одна запись в день.', add_photo:'📷 Добавить фото' },
        tr: { save_entry:'Kaydı kaydet', calendar_title:'Takvim', calendar_subtitle:'Gün, hafta ve aylara göre ruh hali geçmişinizi keşfedin.', daily_checkin:'Günlük kontrol', journal:'Günlük', settings:'Ayarlar', daily_summary:'Günlük özet', export_heatmap:'Isı haritası dışa aktar', delete_entry:'Sil', low_mood:'Düşük ruh hali', neutral:'Nötr', good_mood:'İyi ruh hali', today:'Bugün', edit_journal_entry:'Günlük girişini düzenle', journal_saved_placeholder:'Günlük girişiniz zaten kaydedildi.', one_journal_per_day:'Günde yalnızca bir günlük girişi.', add_photo:'📷 Fotoğraf ekle' },
        ja: { save_entry:'保存', calendar_title:'カレンダー', calendar_subtitle:'日、週、月ごとのムード履歴を確認する。', daily_checkin:'デイリーチェックイン', journal:'日記', settings:'設定', daily_summary:'1日のまとめ', export_heatmap:'ヒートマップを書き出す', delete_entry:'削除', low_mood:'低い気分', neutral:'普通', good_mood:'良い気分', today:'今日', edit_journal_entry:'日記を編集', journal_saved_placeholder:'今日の日記はすでに保存されています。', one_journal_per_day:'1日に作成できる日記は1件のみです。', add_photo:'📷 写真を追加' },
        zh: { save_entry:'保存记录', calendar_title:'日历', calendar_subtitle:'按日、周、月浏览心情历史。', daily_checkin:'每日打卡', journal:'日记', settings:'设置', daily_summary:'每日总结', export_heatmap:'导出热力图', delete_entry:'删除记录', low_mood:'情绪低落', neutral:'中性', good_mood:'情绪良好', today:'今天', edit_journal_entry:'编辑日记', journal_saved_placeholder:'今天的日记已保存。', one_journal_per_day:'每天只能创建一条日记。', add_photo:'📷 添加照片' },
        hi: { save_entry:'प्रविष्टि सहेजें', calendar_title:'कैलेंडर', calendar_subtitle:'दिनों, हफ्तों और महीनों में अपना मूड इतिहास देखें।', daily_checkin:'दैनिक चेक-इन', journal:'डायरी', settings:'सेटिंग्स', daily_summary:'दैनिक सारांश', export_heatmap:'हीटमैप निर्यात करें', delete_entry:'प्रविष्टि हटाएं', low_mood:'कम मनोदशा', neutral:'तटस्थ', good_mood:'अच्छी मनोदशा', today:'आज', edit_journal_entry:'डायरी प्रविष्टि संपादित करें', journal_saved_placeholder:'आज की डायरी प्रविष्टि पहले से सहेजी गई है।', one_journal_per_day:'प्रति दिन केवल एक डायरी प्रविष्टि।', add_photo:'📷 फ़ोटो जोड़ें' },
        ar: { save_entry:'حفظ الإدخال', calendar_title:'التقويم', calendar_subtitle:'استعرض سجل مزاجك عبر الأيام والأسابيع والأشهر.', daily_checkin:'الفحص اليومي', journal:'اليوميات', settings:'الإعدادات', daily_summary:'ملخص اليوم', export_heatmap:'تصدير خريطة الحرارة', delete_entry:'حذف الإدخال', low_mood:'مزاج منخفض', neutral:'محايد', good_mood:'مزاج جيد', today:'اليوم', edit_journal_entry:'تعديل إدخال اليوميات', journal_saved_placeholder:'تم حفظ إدخال يومياتك لهذا اليوم بالفعل.', one_journal_per_day:'إدخال يوميات واحد فقط في اليوم.', add_photo:'📷 إضافة صورة' }
    };

    /* Settings page keys (s_*) — merged into T_FULL so all locales have them */
    var T_SETTINGS = {
        en: { s_appearance:'Appearance', s_appearance_desc:'Theme and display preferences.', s_theme:'Theme', s_dark_mode:'Dark mode', s_sound:'Success sound', s_particles:'Ambient particles', s_parallax:'Parallax scrolling', s_preferences:'Preferences', s_preferences_desc:'Defaults and display options.', s_language:'Language', s_date_format:'Date format', s_time_format:'Time format', s_chart_days:'Chart default days', s_reduce_motion:'Reduce motion', s_notifications:'Enable notifications (browser)', s_dashboard_widgets:'Dashboard widgets', s_show_mood:'Show Mood chart', s_show_sleep:'Show Sleep chart', s_show_energy:'Show Energy chart', s_custom_metrics:'Custom metrics', s_custom_metrics_desc:'Add your own trackable metrics (e.g. anxiety, pain, productivity).', s_privacy:'Data & Privacy', s_privacy_desc:'All data is stored locally on your device.', s_delete_all:'Delete all my data' },
        de: { s_appearance:'Aussehen', s_appearance_desc:'Design und Anzeigeeinstellungen.', s_theme:'Design', s_dark_mode:'Dunkelmodus', s_sound:'Erfolgston', s_particles:'Umgebungspartikel', s_parallax:'Parallax-Scrollen', s_preferences:'Einstellungen', s_preferences_desc:'Standard- und Anzeigeoptionen.', s_language:'Sprache', s_date_format:'Datumsformat', s_time_format:'Zeitformat', s_chart_days:'Standardzeitraum', s_reduce_motion:'Bewegung reduzieren', s_notifications:'Benachrichtigungen aktivieren', s_dashboard_widgets:'Dashboard-Widgets', s_show_mood:'Stimmungsdiagramm anzeigen', s_show_sleep:'Schlafdiagramm anzeigen', s_show_energy:'Energiediagramm anzeigen', s_custom_metrics:'Eigene Metriken', s_custom_metrics_desc:'Füge eigene Metriken hinzu (z. B. Angst, Schmerz, Produktivität).', s_privacy:'Daten & Datenschutz', s_privacy_desc:'Alle Daten werden lokal auf deinem Gerät gespeichert.', s_delete_all:'Alle Daten löschen' },
        fr: { s_appearance:'Apparence', s_appearance_desc:'Thème et préférences d\'affichage.', s_theme:'Thème', s_dark_mode:'Mode sombre', s_sound:'Son de succès', s_particles:'Particules ambiantes', s_parallax:'Défilement parallaxe', s_preferences:'Préférences', s_preferences_desc:'Options par défaut et d\'affichage.', s_language:'Langue', s_date_format:'Format de date', s_time_format:'Format de l\'heure', s_chart_days:'Jours par défaut du graphique', s_reduce_motion:'Réduire les animations', s_notifications:'Activer les notifications (navigateur)', s_dashboard_widgets:'Widgets du tableau de bord', s_show_mood:'Afficher le graphique d\'humeur', s_show_sleep:'Afficher le graphique de sommeil', s_show_energy:'Afficher le graphique d\'énergie', s_custom_metrics:'Métriques personnalisées', s_custom_metrics_desc:'Ajoutez vos propres métriques (ex. anxiété, douleur, productivité).', s_privacy:'Données & Confidentialité', s_privacy_desc:'Toutes les données sont stockées localement sur votre appareil.', s_delete_all:'Supprimer toutes mes données' },
        es: { s_appearance:'Apariencia', s_appearance_desc:'Tema y preferencias de visualización.', s_theme:'Tema', s_dark_mode:'Modo oscuro', s_sound:'Sonido de éxito', s_particles:'Partículas ambientales', s_parallax:'Desplazamiento parallax', s_preferences:'Preferencias', s_preferences_desc:'Opciones predeterminadas y de visualización.', s_language:'Idioma', s_date_format:'Formato de fecha', s_time_format:'Formato de hora', s_chart_days:'Días predeterminados del gráfico', s_reduce_motion:'Reducir movimiento', s_notifications:'Activar notificaciones (navegador)', s_dashboard_widgets:'Widgets del panel', s_show_mood:'Mostrar gráfico de ánimo', s_show_sleep:'Mostrar gráfico de sueño', s_show_energy:'Mostrar gráfico de energía', s_custom_metrics:'Métricas personalizadas', s_custom_metrics_desc:'Añade tus propias métricas (p. ej. ansiedad, dolor, productividad).', s_privacy:'Datos y Privacidad', s_privacy_desc:'Todos los datos se almacenan localmente en tu dispositivo.', s_delete_all:'Eliminar todos mis datos' },
        it: { s_appearance:'Aspetto', s_appearance_desc:'Tema e preferenze di visualizzazione.', s_theme:'Tema', s_dark_mode:'Modalità scura', s_sound:'Suono di successo', s_particles:'Particelle ambientali', s_parallax:'Scorrimento parallasse', s_preferences:'Preferenze', s_preferences_desc:'Opzioni predefinite e di visualizzazione.', s_language:'Lingua', s_date_format:'Formato data', s_time_format:'Formato ora', s_chart_days:'Giorni predefiniti grafico', s_reduce_motion:'Riduci movimento', s_notifications:'Abilita notifiche (browser)', s_dashboard_widgets:'Widget dashboard', s_show_mood:'Mostra grafico umore', s_show_sleep:'Mostra grafico sonno', s_show_energy:'Mostra grafico energia', s_custom_metrics:'Metriche personalizzate', s_custom_metrics_desc:'Aggiungi le tue metriche (es. ansia, dolore, produttività).', s_privacy:'Dati e Privacy', s_privacy_desc:'Tutti i dati sono archiviati localmente sul tuo dispositivo.', s_delete_all:'Elimina tutti i miei dati' },
        pt: { s_appearance:'Aparência', s_appearance_desc:'Tema e preferências de exibição.', s_theme:'Tema', s_dark_mode:'Modo escuro', s_sound:'Som de sucesso', s_particles:'Partículas ambiente', s_parallax:'Rolagem parallax', s_preferences:'Preferências', s_preferences_desc:'Opções padrão e de exibição.', s_language:'Idioma', s_date_format:'Formato de data', s_time_format:'Formato de hora', s_chart_days:'Dias padrão do gráfico', s_reduce_motion:'Reduzir movimento', s_notifications:'Ativar notificações (navegador)', s_dashboard_widgets:'Widgets do painel', s_show_mood:'Mostrar gráfico de humor', s_show_sleep:'Mostrar gráfico de sono', s_show_energy:'Mostrar gráfico de energia', s_custom_metrics:'Métricas personalizadas', s_custom_metrics_desc:'Adicione suas próprias métricas (ex. ansiedade, dor, produtividade).', s_privacy:'Dados e Privacidade', s_privacy_desc:'Todos os dados são armazenados localmente no seu dispositivo.', s_delete_all:'Eliminar todos os meus dados' },
        ja: { s_appearance:'外観', s_appearance_desc:'テーマと表示設定。', s_theme:'テーマ', s_dark_mode:'ダークモード', s_sound:'成功音', s_particles:'環境パーティクル', s_parallax:'パララックス', s_preferences:'設定', s_preferences_desc:'デフォルトと表示オプション。', s_language:'言語', s_date_format:'日付形式', s_time_format:'時刻形式', s_chart_days:'グラフのデフォルト日数', s_reduce_motion:'モーション軽減', s_notifications:'通知を有効にする', s_dashboard_widgets:'ダッシュボードウィジェット', s_show_mood:'気分グラフを表示', s_show_sleep:'睡眠グラフを表示', s_show_energy:'エネルギーグラフを表示', s_custom_metrics:'カスタム指標', s_custom_metrics_desc:'独自の指標を追加（例：不安、痛み、生産性）。', s_privacy:'データとプライバシー', s_privacy_desc:'すべてのデータはデバイスにローカル保存されます。', s_delete_all:'すべてのデータを削除' },
        zh: { s_appearance:'外观', s_appearance_desc:'主题和显示偏好。', s_theme:'主题', s_dark_mode:'深色模式', s_sound:'成功音效', s_particles:'环境粒子', s_parallax:'视差滚动', s_preferences:'偏好设置', s_preferences_desc:'默认和显示选项。', s_language:'语言', s_date_format:'日期格式', s_time_format:'时间格式', s_chart_days:'图表默认天数', s_reduce_motion:'减少动效', s_notifications:'启用通知（浏览器）', s_dashboard_widgets:'仪表板小部件', s_show_mood:'显示情绪图表', s_show_sleep:'显示睡眠图表', s_show_energy:'显示精力图表', s_custom_metrics:'自定义指标', s_custom_metrics_desc:'添加自定义指标（例如焦虑、疼痛、生产力）。', s_privacy:'数据与隐私', s_privacy_desc:'所有数据本地存储在您的设备上。', s_delete_all:'删除我的所有数据' },
        ru: { s_appearance:'Внешний вид', s_appearance_desc:'Тема и настройки отображения.', s_theme:'Тема', s_dark_mode:'Тёмный режим', s_sound:'Звук успеха', s_particles:'Частицы', s_parallax:'Параллакс', s_preferences:'Настройки', s_preferences_desc:'Параметры по умолчанию и отображения.', s_language:'Язык', s_date_format:'Формат даты', s_time_format:'Формат времени', s_chart_days:'Дней на графике', s_reduce_motion:'Уменьшить анимацию', s_notifications:'Включить уведомления', s_dashboard_widgets:'Виджеты панели', s_show_mood:'Показать график настроения', s_show_sleep:'Показать график сна', s_show_energy:'Показать график энергии', s_custom_metrics:'Пользовательские метрики', s_custom_metrics_desc:'Добавьте собственные метрики (напр. тревога, боль, продуктивность).', s_privacy:'Данные и конфиденциальность', s_privacy_desc:'Все данные хранятся локально на вашем устройстве.', s_delete_all:'Удалить все мои данные' },
        tr: { s_appearance:'Görünüm', s_appearance_desc:'Tema ve görüntüleme tercihleri.', s_theme:'Tema', s_dark_mode:'Karanlık mod', s_sound:'Başarı sesi', s_particles:'Ortam partikülleri', s_parallax:'Paralaks kaydırma', s_preferences:'Tercihler', s_preferences_desc:'Varsayılan ve görüntüleme seçenekleri.', s_language:'Dil', s_date_format:'Tarih biçimi', s_time_format:'Saat biçimi', s_chart_days:'Grafik varsayılan günler', s_reduce_motion:'Hareketi azalt', s_notifications:'Bildirimleri etkinleştir (tarayıcı)', s_dashboard_widgets:'Gösterge paneli widget\'ları', s_show_mood:'Ruh hali grafiğini göster', s_show_sleep:'Uyku grafiğini göster', s_show_energy:'Enerji grafiğini göster', s_custom_metrics:'Özel metrikler', s_custom_metrics_desc:'Kendi metriklerinizi ekleyin (örn. kaygı, ağrı, üretkenlik).', s_privacy:'Veri ve Gizlilik', s_privacy_desc:'Tüm veriler cihazınızda yerel olarak saklanır.', s_delete_all:'Tüm verilerimi sil' },
        ar: { s_appearance:'المظهر', s_appearance_desc:'السمة وتفضيلات العرض.', s_theme:'السمة', s_dark_mode:'الوضع المظلم', s_sound:'صوت النجاح', s_particles:'الجسيمات المحيطة', s_parallax:'التمرير المتوازي', s_preferences:'التفضيلات', s_preferences_desc:'الخيارات الافتراضية وخيارات العرض.', s_language:'اللغة', s_date_format:'تنسيق التاريخ', s_time_format:'تنسيق الوقت', s_chart_days:'الأيام الافتراضية للمخطط', s_reduce_motion:'تقليل الحركة', s_notifications:'تفعيل الإشعارات (المتصفح)', s_dashboard_widgets:'أدوات لوحة التحكم', s_show_mood:'عرض مخطط المزاج', s_show_sleep:'عرض مخطط النوم', s_show_energy:'عرض مخطط الطاقة', s_custom_metrics:'مقاييس مخصصة', s_custom_metrics_desc:'أضف مقاييسك الخاصة (مثل القلق، الألم، الإنتاجية).', s_privacy:'البيانات والخصوصية', s_privacy_desc:'يتم تخزين جميع البيانات محليًا على جهازك.', s_delete_all:'حذف جميع بياناتي' },
        nl: { s_appearance:'Weergave', s_appearance_desc:'Thema en weergavevoorkeuren.', s_theme:'Thema', s_dark_mode:'Donkere modus', s_sound:'Succesgeluid', s_particles:'Omgevingsdeeltjes', s_parallax:'Parallax scrollen', s_preferences:'Voorkeuren', s_preferences_desc:'Standaard- en weergaveopties.', s_language:'Taal', s_date_format:'Datumnotatie', s_time_format:'Tijdnotatie', s_chart_days:'Standaard dagen grafiek', s_reduce_motion:'Beweging verminderen', s_notifications:'Meldingen inschakelen (browser)', s_dashboard_widgets:'Dashboard-widgets', s_show_mood:'Stemmingsgrafiek tonen', s_show_sleep:'Slaapgrafiek tonen', s_show_energy:'Energiegrafiek tonen', s_custom_metrics:'Aangepaste metrieken', s_custom_metrics_desc:'Voeg eigen metrieken toe (bijv. angst, pijn, productiviteit).', s_privacy:'Gegevens en privacy', s_privacy_desc:'Alle gegevens worden lokaal op uw apparaat opgeslagen.', s_delete_all:'Al mijn gegevens verwijderen' },
        pl: { s_appearance:'Wygląd', s_appearance_desc:'Motyw i preferencje wyświetlania.', s_theme:'Motyw', s_dark_mode:'Tryb ciemny', s_sound:'Dźwięk sukcesu', s_particles:'Cząsteczki tła', s_parallax:'Przewijanie paralaksy', s_preferences:'Preferencje', s_preferences_desc:'Opcje domyślne i wyświetlania.', s_language:'Język', s_date_format:'Format daty', s_time_format:'Format czasu', s_chart_days:'Domyślna liczba dni wykresu', s_reduce_motion:'Ogranicz ruch', s_notifications:'Włącz powiadomienia (przeglądarka)', s_dashboard_widgets:'Widżety panelu', s_show_mood:'Pokaż wykres nastroju', s_show_sleep:'Pokaż wykres snu', s_show_energy:'Pokaż wykres energii', s_custom_metrics:'Niestandardowe metryki', s_custom_metrics_desc:'Dodaj własne metryki (np. lęk, ból, produktywność).', s_privacy:'Dane i prywatność', s_privacy_desc:'Wszystkie dane są przechowywane lokalnie na Twoim urządzeniu.', s_delete_all:'Usuń wszystkie moje dane' },
        hi: { s_appearance:'दिखावट', s_appearance_desc:'थीम और प्रदर्शन प्राथमिकताएं।', s_theme:'थीम', s_dark_mode:'डार्क मोड', s_sound:'सफलता ध्वनि', s_particles:'परिवेश कण', s_parallax:'पैरलैक्स स्क्रॉलिंग', s_preferences:'प्राथमिकताएं', s_preferences_desc:'डिफ़ॉल्ट और प्रदर्शन विकल्प।', s_language:'भाषा', s_date_format:'तारीख प्रारूप', s_time_format:'समय प्रारूप', s_chart_days:'चार्ट डिफ़ॉल्ट दिन', s_reduce_motion:'गति कम करें', s_notifications:'सूचनाएं सक्षम करें (ब्राउज़र)', s_dashboard_widgets:'डैशबोर्ड विजेट', s_show_mood:'मूड चार्ट दिखाएं', s_show_sleep:'नींद चार्ट दिखाएं', s_show_energy:'ऊर्जा चार्ट दिखाएं', s_custom_metrics:'कस्टम मेट्रिक्स', s_custom_metrics_desc:'अपने मेट्रिक्स जोड़ें (जैसे चिंता, दर्द, उत्पादकता)।', s_privacy:'डेटा और गोपनीयता', s_privacy_desc:'सभी डेटा आपके डिवाइस पर स्थानीय रूप से संग्रहीत है।', s_delete_all:'मेरा सारा डेटा हटाएं' }
    };
    Object.keys(T_SETTINGS).forEach(function (loc) {
        if (T_FULL[loc]) {
            Object.assign(T_FULL[loc], T_SETTINGS[loc]);
        } else {
            T_FULL[loc] = Object.assign({}, T_FULL['en'], T_SETTINGS[loc]);
        }
    });
    Object.assign(T_FULL['en'], T_SETTINGS['en']);

    /* Extended translations: nav, dashboard, entry, settings, export, insights, reports, calendar */
    var T_EXTRA = {
        en: { tracking:'Tracking', analytics_section:'Analytics', explore_section:'Explore', data_section:'Data', overview:'Overview', mood_trends:'Mood Trends', sleep_analysis:'Sleep Analysis', energy_patterns:'Energy Patterns', correlations:'Correlations', mood_velocity:'Mood Velocity', forecast:'Forecast', my_patterns:'My Patterns', seasonal_rhythm:'Seasonal Rhythm', reports:'Reports', export_backup:'Export & Backup', welcome_title:'Welcome to Aura Mood', welcome_subtitle:'Track your mood, sleep, and energy every day. Patterns emerge after a week. Insights sharpen over a month.', start_checkin_btn:"Start today's check-in →", explore_sample_btn:'Explore with sample data', feature_mood:'Mood trends & forecasting', feature_sleep:'Sleep pattern analysis', feature_insights:'Personalised insights', mood_today:'Mood Today', sleep_duration:'Sleep Duration', energy_level:'Energy Level', streak:'Streak', view_full:'View full →', mood_timeline:'Mood Timeline', sleep_patterns:'Sleep Patterns', energy_flow:'Energy Flow', go_deeper:'Go deeper', analytics_title:'Analytics', analytics_hint:'Explore patterns, correlations, and forecasts from your data.', entry_subtitle:'Log your mood, sleep, and energy. One entry per day — quick or detailed, your choice.', fill_sections:'Fill in the sections below', date_heading:'Date', mood_energy_heading:'Mood & Energy', mood_label:'Mood', energy_label:'Energy Level', sleep_heading:'Sleep', sleep_duration_label:'Sleep Duration', sleep_quality_label:'Sleep Quality', primary_sleep_time:'Primary Sleep Time', primary_wake_time:'Primary Wake Time', sleep_segments_label:'Sleep Segments', add_sleep_segment:'+ Add Sleep Segment', activities_tags_heading:'Activities & Tags', appearance_card:'Appearance', appearance_desc:'Theme and display preferences.', preferences_card:'Preferences', preferences_desc:'Defaults and display options.', theme_label:'Theme', dark_mode_label:'Dark mode', success_sound:'Success sound', ambient_particles:'Ambient particles', parallax_scrolling:'Parallax scrolling', language_label:'Language', export_page_title:'Export & Backup', export_page_subtitle:'Your data belongs to you. Download, back up, or import at any time.', download_eyebrow:'Download', export_data_title:'Export data', export_data_desc:'Download entries as JSON or CSV. Optionally filter by date range or tags.', from_label:'From', to_label:'To', tags_optional:'Tags (optional)', export_json:'Export as JSON', export_csv:'Export as CSV', backups_eyebrow:'Auto-saved', backups_title:'Backups', last_backup_label:'Last backup', backup_desc:'A JSON backup is created automatically every 24 hours. The last 7 are kept in your browser.', download_backup_now:'Download backup now', restore_label:'Restore from a previous backup', import_eyebrow:'Migrate', import_title:'Import data', import_desc:'Import from Aura Mood JSON/CSV, or from Daylio and Bearable exports. You\'ll see a preview before anything is imported.', good_morning:'Good morning', good_afternoon:'Good afternoon', good_evening:'Good evening', narrative_start:'Start logging your first check-in to see patterns emerge here.', narrative_trend_up:'Your mood has been climbing this week.', narrative_trend_down:'Your mood has dipped a little this week.', insights_hero_eyebrow:'Personal Analytics', insights_hero_subtitle:'Patterns from your data. The more you log, the sharper these become.', insights_empty:'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.', report_year_title:'Year in review', export_report_pdf:'Export report as PDF', calendar_year_heatmap:'Year heatmap', calendar_month_grid:'Month grid', calendar_week_timeline:'Week timeline', calendar_list_view:'List', year_in_mood_title:'Year in Mood', year_in_mood_subtitle:'Track your mood consistency across the past year.', current_streak_label:'Current streak', delete_all_data_btn:'Delete all my data', settings_title:'Settings', summary_eyebrow:'Summary', export_btn_label:'↓ Export', activities_label:'Activities', tags_label:'Tags', pref_default_sleep_time:'Default sleep time', pref_default_wake_time:'Default wake time', pref_show_mood_chart:'Show Mood chart', pref_show_sleep_chart:'Show Sleep chart', pref_show_energy_chart:'Show Energy chart', pref_reduce_motion:'Reduce motion', pref_notifications:'Enable notifications (browser)', dashboard_widgets_title:'Dashboard widgets' },
        de: { tracking:'Erfassung', analytics_section:'Analysen', explore_section:'Entdecken', data_section:'Daten', overview:'Überblick', mood_trends:'Stimmungstrends', sleep_analysis:'Schlafanalyse', energy_patterns:'Energiemuster', correlations:'Korrelationen', mood_velocity:'Stimmungsänderung', forecast:'Prognose', my_patterns:'Meine Muster', seasonal_rhythm:'Saisonrhythmus', reports:'Berichte', export_backup:'Export & Backup', welcome_title:'Willkommen bei Aura Mood', welcome_subtitle:'Erfasse täglich Stimmung, Schlaf und Energie. Nach einer Woche zeigen sich Muster, nach einem Monat werden Einblicke klarer.', start_checkin_btn:'Heutigen Check-in starten →', explore_sample_btn:'Mit Beispieldaten erkunden', feature_mood:'Stimmungstrends & Prognose', feature_sleep:'Schlafmusteranalyse', feature_insights:'Personalisierte Einblicke', mood_today:'Stimmung heute', sleep_duration:'Schlafdauer', energy_level:'Energielevel', streak:'Serie', view_full:'Ganz anzeigen →', mood_timeline:'Stimmungsverlauf', sleep_patterns:'Schlafmuster', energy_flow:'Energieverlauf', go_deeper:'Mehr erfahren', analytics_title:'Analysen', analytics_hint:'Muster, Korrelationen und Prognosen aus deinen Daten erkunden.', entry_subtitle:'Erfasse Stimmung, Schlaf und Energie. Ein Eintrag pro Tag — kurz oder ausführlich.', fill_sections:'Fülle die Abschnitte unten aus', date_heading:'Datum', mood_energy_heading:'Stimmung & Energie', mood_label:'Stimmung', energy_label:'Energielevel', sleep_heading:'Schlaf', sleep_duration_label:'Schlafdauer', sleep_quality_label:'Schlafqualität', primary_sleep_time:'Hauptschlafzeit', primary_wake_time:'Aufwachzeit', sleep_segments_label:'Schlafsegmente', add_sleep_segment:'+ Schlafsegment hinzufügen', activities_tags_heading:'Aktivitäten & Tags', appearance_card:'Darstellung', appearance_desc:'Theme und Anzeige.', preferences_card:'Einstellungen', preferences_desc:'Standardwerte und Anzeigeoptionen.', theme_label:'Theme', dark_mode_label:'Dunkelmodus', success_sound:'Erfolgston', ambient_particles:'Ambiente-Partikel', parallax_scrolling:'Parallax-Scrolling', language_label:'Sprache', export_page_title:'Export & Backup', export_page_subtitle:'Deine Daten gehören dir. Jederzeit herunterladen, sichern oder importieren.', download_eyebrow:'Download', export_data_title:'Daten exportieren', export_data_desc:'Einträge als JSON oder CSV herunterladen. Optional nach Datum oder Tags filtern.', from_label:'Von', to_label:'Bis', tags_optional:'Tags (optional)', export_json:'Als JSON exportieren', export_csv:'Als CSV exportieren', backups_eyebrow:'Automatisch gespeichert', backups_title:'Backups', last_backup_label:'Letztes Backup', backup_desc:'Ein JSON-Backup wird automatisch alle 24 Stunden erstellt. Die letzten 7 werden im Browser gespeichert.', download_backup_now:'Jetzt Backup herunterladen', restore_label:'Aus einem früheren Backup wiederherstellen', import_eyebrow:'Migrieren', import_title:'Daten importieren', import_desc:'Aus Aura Mood JSON/CSV oder Daylio-/Bearable-Exporten importieren. Vorschau vor dem Import.', good_morning:'Guten Morgen', good_afternoon:'Guten Tag', good_evening:'Guten Abend', narrative_start:'Erfasse deinen ersten Check-in, damit hier Muster erscheinen.', narrative_trend_up:'Deine Stimmung ist diese Woche gestiegen.', narrative_trend_down:'Deine Stimmung ist diese Woche etwas gesunken.', insights_hero_eyebrow:'Persönliche Analysen', insights_hero_subtitle:'Muster aus deinen Daten. Je mehr du erfasst, desto schärfer werden sie.', insights_empty:'Weitere Einblicke erscheinen, sobald du mehr Einträge erfasst. Erfasse Stimmung, Schlaf und Aktivitäten.', report_year_title:'Jahresrückblick', export_report_pdf:'Bericht als PDF exportieren', calendar_year_heatmap:'Jahres-Heatmap', calendar_month_grid:'Monatsansicht', calendar_week_timeline:'Wochenzeitstrahl', calendar_list_view:'Liste', year_in_mood_title:'Jahr in Stimmung', year_in_mood_subtitle:'Stimmungskonsistenz im letzten Jahr.', current_streak_label:'Aktuelle Serie', delete_all_data_btn:'Alle meine Daten löschen', settings_title:'Einstellungen', summary_eyebrow:'Zusammenfassung', export_btn_label:'↓ Exportieren', activities_label:'Aktivitäten', tags_label:'Tags', pref_default_sleep_time:'Standard-Schlafzeit', pref_default_wake_time:'Standard-Aufwachzeit', pref_show_mood_chart:'Stimmungsdiagramm anzeigen', pref_show_sleep_chart:'Schlafdiagramm anzeigen', pref_show_energy_chart:'Energiediagramm anzeigen', pref_reduce_motion:'Bewegung reduzieren', pref_notifications:'Benachrichtigungen (Browser)', dashboard_widgets_title:'Dashboard-Widgets' },
        fr: { tracking:'Suivi', analytics_section:'Analyses', explore_section:'Explorer', data_section:'Données', overview:'Vue d\'ensemble', mood_trends:'Tendances d\'humeur', sleep_analysis:'Analyse du sommeil', energy_patterns:'Schémas d\'énergie', correlations:'Corrélations', mood_velocity:'Variation d\'humeur', forecast:'Prévisions', my_patterns:'Mes schémas', seasonal_rhythm:'Rythme saisonnier', reports:'Rapports', export_backup:'Export et sauvegarde', welcome_title:'Bienvenue sur Aura Mood', welcome_subtitle:'Suivez votre humeur, sommeil et énergie chaque jour. Les tendances apparaissent après une semaine.', start_checkin_btn:'Commencer le bilan du jour →', explore_sample_btn:'Explorer avec des données d\'exemple', feature_mood:'Tendances et prévisions d\'humeur', feature_sleep:'Analyse des habitudes de sommeil', feature_insights:'Aperçus personnalisés', mood_today:'Humeur aujourd\'hui', sleep_duration:'Durée du sommeil', energy_level:'Niveau d\'énergie', streak:'Série', view_full:'Voir tout →', mood_timeline:'Évolution de l\'humeur', sleep_patterns:'Schémas de sommeil', energy_flow:'Énergie', go_deeper:'Aller plus loin', analytics_title:'Analyses', analytics_hint:'Explorez tendances, corrélations et prévisions à partir de vos données.', entry_subtitle:'Enregistrez humeur, sommeil et énergie. Un bilan par jour.', fill_sections:'Remplissez les sections ci-dessous', date_heading:'Date', mood_energy_heading:'Humeur et énergie', mood_label:'Humeur', energy_label:'Niveau d\'énergie', sleep_heading:'Sommeil', sleep_duration_label:'Durée du sommeil', sleep_quality_label:'Qualité du sommeil', primary_sleep_time:'Heure de coucher', primary_wake_time:'Heure de réveil', sleep_segments_label:'Segments de sommeil', add_sleep_segment:'+ Ajouter un segment', activities_tags_heading:'Activités et tags', appearance_card:'Apparence', appearance_desc:'Thème et affichage.', preferences_card:'Préférences', preferences_desc:'Options par défaut et affichage.', theme_label:'Thème', dark_mode_label:'Mode sombre', success_sound:'Son de succès', ambient_particles:'Particules', parallax_scrolling:'Parallaxe', language_label:'Langue', export_page_title:'Export et sauvegarde', export_page_subtitle:'Vos données vous appartiennent. Téléchargez, sauvegardez ou importez à tout moment.', download_eyebrow:'Télécharger', export_data_title:'Exporter les données', export_data_desc:'Téléchargez en JSON ou CSV. Filtrez par date ou tags si besoin.', from_label:'De', to_label:'À', tags_optional:'Tags (optionnel)', export_json:'Exporter en JSON', export_csv:'Exporter en CSV', backups_eyebrow:'Sauvegardé auto', backups_title:'Sauvegardes', last_backup_label:'Dernière sauvegarde', backup_desc:'Une sauvegarde JSON est créée automatiquement toutes les 24 h. Les 7 dernières sont conservées.', download_backup_now:'Télécharger la sauvegarde', restore_label:'Restaurer depuis une sauvegarde', import_eyebrow:'Migrer', import_title:'Importer des données', import_desc:'Importer depuis Aura Mood JSON/CSV ou exports Daylio/Bearable. Aperçu avant import.', good_morning:'Bonjour', good_afternoon:'Bon après-midi', good_evening:'Bonsoir', narrative_start:'Enregistrez votre premier bilan pour voir les tendances ici.', narrative_trend_up:'Votre humeur a monté cette semaine.', narrative_trend_down:'Votre humeur a un peu baissé cette semaine.', insights_hero_eyebrow:'Analyses personnelles', insights_hero_subtitle:'Tendances issues de vos données. Plus vous enregistrez, plus c\'est précis.', insights_empty:'D\'autres aperçus apparaîtront avec plus d\'entrées. Suivez humeur, sommeil et activités.', report_year_title:'Bilan de l\'année', export_report_pdf:'Exporter le rapport en PDF', calendar_year_heatmap:'Heatmap année', calendar_month_grid:'Mois', calendar_week_timeline:'Semaine', calendar_list_view:'Liste', year_in_mood_title:'L\'année en humeur', year_in_mood_subtitle:'Cohérence de l\'humeur sur l\'année passée.', current_streak_label:'Série actuelle', delete_all_data_btn:'Supprimer toutes mes données', settings_title:'Paramètres', summary_eyebrow:'Résumé', export_btn_label:'↓ Exporter', activities_label:'Activités', tags_label:'Tags', pref_default_sleep_time:'Heure de coucher par défaut', pref_default_wake_time:'Heure de réveil par défaut', pref_show_mood_chart:'Afficher le graphique d\'humeur', pref_show_sleep_chart:'Afficher le graphique de sommeil', pref_show_energy_chart:'Afficher le graphique d\'énergie', pref_reduce_motion:'Réduire les animations', pref_notifications:'Notifications (navigateur)', dashboard_widgets_title:'Widgets du tableau de bord' },
        es: { tracking:'Seguimiento', analytics_section:'Análisis', explore_section:'Explorar', data_section:'Datos', overview:'Resumen', mood_trends:'Tendencias de ánimo', sleep_analysis:'Análisis de sueño', energy_patterns:'Patrones de energía', correlations:'Correlaciones', mood_velocity:'Cambio de ánimo', forecast:'Pronóstico', my_patterns:'Mis patrones', seasonal_rhythm:'Ritmo estacional', reports:'Informes', export_backup:'Exportar y copia de seguridad', welcome_title:'Bienvenido a Aura Mood', welcome_subtitle:'Registra tu ánimo, sueño y energía cada día. Los patrones aparecen tras una semana.', start_checkin_btn:'Empezar el registro de hoy →', explore_sample_btn:'Explorar con datos de ejemplo', feature_mood:'Tendencias y pronóstico de ánimo', feature_sleep:'Análisis de patrones de sueño', feature_insights:'Insights personalizados', mood_today:'Ánimo hoy', sleep_duration:'Duración del sueño', energy_level:'Nivel de energía', streak:'Racha', view_full:'Ver completo →', mood_timeline:'Línea de ánimo', sleep_patterns:'Patrones de sueño', energy_flow:'Flujo de energía', go_deeper:'Profundizar', analytics_title:'Análisis', analytics_hint:'Explora patrones, correlaciones y pronósticos de tus datos.', entry_subtitle:'Registra ánimo, sueño y energía. Una entrada al día.', fill_sections:'Completa las secciones de abajo', date_heading:'Fecha', mood_energy_heading:'Ánimo y energía', mood_label:'Ánimo', energy_label:'Nivel de energía', sleep_heading:'Sueño', sleep_duration_label:'Duración del sueño', sleep_quality_label:'Calidad del sueño', primary_sleep_time:'Hora de dormir', primary_wake_time:'Hora de despertar', sleep_segments_label:'Segmentos de sueño', add_sleep_segment:'+ Añadir segmento', activities_tags_heading:'Actividades y etiquetas', appearance_card:'Apariencia', appearance_desc:'Tema y visualización.', preferences_card:'Preferencias', preferences_desc:'Opciones por defecto y visualización.', theme_label:'Tema', dark_mode_label:'Modo oscuro', success_sound:'Sonido de éxito', ambient_particles:'Partículas', parallax_scrolling:'Parallax', language_label:'Idioma', export_page_title:'Exportar y copia de seguridad', export_page_subtitle:'Tus datos son tuyos. Descarga, respalda o importa cuando quieras.', download_eyebrow:'Descargar', export_data_title:'Exportar datos', export_data_desc:'Descarga entradas en JSON o CSV. Opcionalmente filtra por fecha o etiquetas.', from_label:'Desde', to_label:'Hasta', tags_optional:'Etiquetas (opcional)', export_json:'Exportar como JSON', export_csv:'Exportar como CSV', backups_eyebrow:'Guardado auto', backups_title:'Copias de seguridad', last_backup_label:'Última copia', backup_desc:'Se crea una copia JSON automática cada 24 h. Se guardan las últimas 7.', download_backup_now:'Descargar copia ahora', restore_label:'Restaurar desde una copia anterior', import_eyebrow:'Migrar', import_title:'Importar datos', import_desc:'Importa desde JSON/CSV de Aura Mood o exportaciones Daylio/Bearable. Vista previa antes de importar.', good_morning:'Buenos días', good_afternoon:'Buenas tardes', good_evening:'Buenas noches', narrative_start:'Registra tu primera entrada para ver patrones aquí.', narrative_trend_up:'Tu ánimo ha subido esta semana.', narrative_trend_down:'Tu ánimo ha bajado un poco esta semana.', insights_hero_eyebrow:'Análisis personal', insights_hero_subtitle:'Patrones de tus datos. Cuanto más registres, más precisos serán.', insights_empty:'Más insights al registrar más entradas. Registra ánimo, sueño y actividades.', report_year_title:'Resumen del año', export_report_pdf:'Exportar informe como PDF', calendar_year_heatmap:'Heatmap del año', calendar_month_grid:'Vista mes', calendar_week_timeline:'Línea semanal', calendar_list_view:'Lista', year_in_mood_title:'Año en ánimo', year_in_mood_subtitle:'Consistencia de tu ánimo en el último año.', current_streak_label:'Racha actual', delete_all_data_btn:'Eliminar todos mis datos', settings_title:'Ajustes', summary_eyebrow:'Resumen', export_btn_label:'↓ Exportar', activities_label:'Actividades', tags_label:'Etiquetas', pref_default_sleep_time:'Hora de sueño por defecto', pref_default_wake_time:'Hora de despertar por defecto', pref_show_mood_chart:'Mostrar gráfico de ánimo', pref_show_sleep_chart:'Mostrar gráfico de sueño', pref_show_energy_chart:'Mostrar gráfico de energía', pref_reduce_motion:'Reducir movimiento', pref_notifications:'Notificaciones (navegador)', dashboard_widgets_title:'Widgets del panel' }
    };
    T_EXTRA.tr = { tracking:'Takip', analytics_section:'Analitik', explore_section:'Keşfet', data_section:'Veri', overview:'Genel bakış', mood_trends:'Ruh hali trendleri', sleep_analysis:'Uyku analizi', energy_patterns:'Enerji desenleri', correlations:'Korelasyonlar', mood_velocity:'Ruh hali hızı', forecast:'Tahmin', my_patterns:'Kalıplarım', seasonal_rhythm:'Mevsimsel ritim', reports:'Raporlar', export_backup:'Dışa aktar & Yedek', insights:'Öngörüler', settings:'Ayarlar', daily_checkin:'Günlük kontrol', journal:'Günlük', calendar_title:'Takvim', good_morning:'Günaydın', good_afternoon:'İyi günler', good_evening:'İyi akşamlar', current_streak_label:'Mevcut seri', export_btn_label:'↓ Dışa aktar', activities_label:'Aktiviteler', tags_label:'Etiketler', summary_eyebrow:'Özet', settings_title:'Ayarlar', delete_all_data_btn:'Tüm verilerimi sil', year_in_mood_title:'Yılın ruh hali', download_backup_now:'Yedeği şimdi indir', restore_label:'Önceki yedekten geri yükle', import_title:'Veri içe aktar', import_eyebrow:'Taşı', narrative_start:'Buraya ilk girişini ekle.', narrative_trend_up:'Bu hafta ruh halin yükseldi.', narrative_trend_down:'Bu hafta ruh halin biraz düştü.', pref_default_sleep_time:'Varsayılan uyku saati', pref_default_wake_time:'Varsayılan uyanış saati', dashboard_widgets_title:'Gösterge paneli widget\'ları', report_year_title:'Yıl özeti', export_report_pdf:'Raporu PDF olarak dışa aktar', calendar_year_heatmap:'Yıllık ısı haritası', calendar_month_grid:'Aylık ızgara', calendar_week_timeline:'Haftalık zaman çizelgesi', calendar_list_view:'Liste' };
    T_EXTRA.it = { tracking:'Monitoraggio', analytics_section:'Analisi', explore_section:'Esplora', data_section:'Dati', overview:'Panoramica', mood_trends:'Tendenze umore', sleep_analysis:'Analisi sonno', energy_patterns:'Schemi energia', correlations:'Correlazioni', mood_velocity:'Variazione umore', forecast:'Previsione', my_patterns:'I miei schemi', seasonal_rhythm:'Ritmo stagionale', reports:'Rapporti', export_backup:'Esporta & Backup', insights:'Intuizioni', settings:'Impostazioni', daily_checkin:'Check-in giornaliero', journal:'Diario', calendar_title:'Calendario', current_streak_label:'Serie attuale', export_btn_label:'↓ Esporta', activities_label:'Attività', tags_label:'Tag', settings_title:'Impostazioni', delete_all_data_btn:'Elimina tutti i dati', good_morning:'Buongiorno', good_afternoon:'Buon pomeriggio', good_evening:'Buona sera' };
    T_EXTRA.pt = { tracking:'Monitoramento', analytics_section:'Análise', explore_section:'Explorar', data_section:'Dados', overview:'Visão geral', mood_trends:'Tendências de humor', sleep_analysis:'Análise do sono', energy_patterns:'Padrões de energia', correlations:'Correlações', mood_velocity:'Variação de humor', forecast:'Previsão', my_patterns:'Meus padrões', seasonal_rhythm:'Ritmo sazonal', reports:'Relatórios', export_backup:'Exportar & Backup', insights:'Insights', settings:'Configurações', daily_checkin:'Check-in diário', journal:'Diário', calendar_title:'Calendário', current_streak_label:'Sequência atual', export_btn_label:'↓ Exportar', activities_label:'Atividades', tags_label:'Tags', settings_title:'Configurações', delete_all_data_btn:'Excluir todos os dados', good_morning:'Bom dia', good_afternoon:'Boa tarde', good_evening:'Boa noite' };
    T_EXTRA.nl = { tracking:'Bijhouden', analytics_section:'Analyse', explore_section:'Verkennen', data_section:'Gegevens', overview:'Overzicht', mood_trends:'Stemmingstrends', sleep_analysis:'Slaapanalyse', energy_patterns:'Energiepatronen', correlations:'Correlaties', mood_velocity:'Stemmingsverandering', forecast:'Voorspelling', my_patterns:'Mijn patronen', seasonal_rhythm:'Seizoensritme', reports:'Rapporten', export_backup:'Exporteren & Backup', insights:'Inzichten', settings:'Instellingen', daily_checkin:'Dagelijkse check-in', journal:'Dagboek', calendar_title:'Kalender', current_streak_label:'Huidige reeks', export_btn_label:'↓ Exporteren', activities_label:'Activiteiten', tags_label:'Tags', settings_title:'Instellingen', delete_all_data_btn:'Verwijder alle gegevens', good_morning:'Goedemorgen', good_afternoon:'Goedemiddag', good_evening:'Goedenavond' };
    T_EXTRA.pl = { tracking:'Śledzenie', analytics_section:'Analityka', explore_section:'Odkryj', data_section:'Dane', overview:'Przegląd', mood_trends:'Trendy nastroju', sleep_analysis:'Analiza snu', energy_patterns:'Wzorce energii', correlations:'Korelacje', mood_velocity:'Zmiana nastroju', forecast:'Prognoza', my_patterns:'Moje wzorce', seasonal_rhythm:'Rytm sezonowy', reports:'Raporty', export_backup:'Eksport & Kopia', insights:'Spostrzeżenia', settings:'Ustawienia', daily_checkin:'Codzienny check-in', journal:'Dziennik', calendar_title:'Kalendarz', current_streak_label:'Aktualna seria', export_btn_label:'↓ Eksportuj', activities_label:'Aktywności', tags_label:'Tagi', settings_title:'Ustawienia', delete_all_data_btn:'Usuń wszystkie dane', good_morning:'Dzień dobry', good_afternoon:'Dzień dobry', good_evening:'Dobry wieczór' };
    T_EXTRA.ru = { tracking:'Отслеживание', analytics_section:'Аналитика', explore_section:'Исследовать', data_section:'Данные', overview:'Обзор', mood_trends:'Тенденции настроения', sleep_analysis:'Анализ сна', energy_patterns:'Энергетические паттерны', correlations:'Корреляции', mood_velocity:'Изменение настроения', forecast:'Прогноз', my_patterns:'Мои паттерны', seasonal_rhythm:'Сезонный ритм', reports:'Отчёты', export_backup:'Экспорт & Резервная копия', insights:'Выводы', settings:'Настройки', daily_checkin:'Ежедневная отметка', journal:'Дневник', calendar_title:'Календарь', current_streak_label:'Текущая серия', export_btn_label:'↓ Экспорт', activities_label:'Активности', tags_label:'Теги', settings_title:'Настройки', delete_all_data_btn:'Удалить все данные', good_morning:'Доброе утро', good_afternoon:'Добрый день', good_evening:'Добрый вечер' };
    T_EXTRA.ja = { tracking:'トラッキング', analytics_section:'分析', explore_section:'探索', data_section:'データ', overview:'概要', mood_trends:'ムードトレンド', sleep_analysis:'睡眠分析', energy_patterns:'エネルギーパターン', correlations:'相関', mood_velocity:'ムード変化', forecast:'予測', my_patterns:'マイパターン', seasonal_rhythm:'季節のリズム', reports:'レポート', export_backup:'エクスポート & バックアップ', insights:'インサイト', settings:'設定', daily_checkin:'デイリーチェックイン', journal:'日記', calendar_title:'カレンダー', current_streak_label:'現在の連続', export_btn_label:'↓ エクスポート', activities_label:'活動', tags_label:'タグ', settings_title:'設定', delete_all_data_btn:'すべてのデータを削除', good_morning:'おはようございます', good_afternoon:'こんにちは', good_evening:'こんばんは' };
    T_EXTRA.zh = { tracking:'追踪', analytics_section:'分析', explore_section:'探索', data_section:'数据', overview:'概览', mood_trends:'情绪趋势', sleep_analysis:'睡眠分析', energy_patterns:'能量模式', correlations:'相关性', mood_velocity:'情绪变化', forecast:'预测', my_patterns:'我的模式', seasonal_rhythm:'季节节律', reports:'报告', export_backup:'导出 & 备份', insights:'洞察', settings:'设置', daily_checkin:'每日打卡', journal:'日记', calendar_title:'日历', current_streak_label:'当前连续', export_btn_label:'↓ 导出', activities_label:'活动', tags_label:'标签', settings_title:'设置', delete_all_data_btn:'删除所有数据', good_morning:'早上好', good_afternoon:'下午好', good_evening:'晚上好' };
    T_EXTRA.ar = { tracking:'التتبع', analytics_section:'التحليلات', explore_section:'استكشاف', data_section:'البيانات', overview:'نظرة عامة', mood_trends:'اتجاهات المزاج', sleep_analysis:'تحليل النوم', energy_patterns:'أنماط الطاقة', correlations:'الارتباطات', mood_velocity:'تغيير المزاج', forecast:'التنبؤ', my_patterns:'أنماطي', seasonal_rhythm:'الإيقاع الموسمي', reports:'التقارير', export_backup:'تصدير & نسخ احتياطي', insights:'رؤى', settings:'الإعدادات', daily_checkin:'الفحص اليومي', journal:'اليوميات', calendar_title:'التقويم', current_streak_label:'السلسلة الحالية', export_btn_label:'↓ تصدير', activities_label:'الأنشطة', tags_label:'العلامات', settings_title:'الإعدادات', delete_all_data_btn:'حذف كل البيانات', good_morning:'صباح الخير', good_afternoon:'مساء الخير', good_evening:'مساء النور' };
    T_EXTRA.hi = { tracking:'ट्रैकिंग', analytics_section:'विश्लेषण', explore_section:'अन्वेषण', data_section:'डेटा', overview:'अवलोकन', mood_trends:'मूड रुझान', sleep_analysis:'नींद विश्लेषण', energy_patterns:'ऊर्जा पैटर्न', correlations:'सहसंबंध', mood_velocity:'मूड परिवर्तन', forecast:'पूर्वानुमान', my_patterns:'मेरे पैटर्न', seasonal_rhythm:'मौसमी लय', reports:'रिपोर्ट', export_backup:'निर्यात & बैकअप', insights:'अंतर्दृष्टि', settings:'सेटिंग्स', daily_checkin:'दैनिक चेक-इन', journal:'डायरी', calendar_title:'कैलेंडर', current_streak_label:'वर्तमान स्ट्रीक', export_btn_label:'↓ निर्यात', activities_label:'गतिविधियां', tags_label:'टैग', settings_title:'सेटिंग्स', delete_all_data_btn:'सारा डेटा हटाएं', good_morning:'सुप्रभात', good_afternoon:'नमस्कार', good_evening:'शुभ संध्या' };
    /* Safe text-node replacement preserving child elements */
    function applyAllTranslations(locale) {
        if (typeof window.runI18n === 'function') {
            window.runI18n(locale);
            return;
        }
        var loc = String(locale || 'en').split('-')[0];
        var t = Object.assign({}, T_FULL[loc] || T_FULL['en'], T_EXTRA[loc] || {});
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = t[key];
            if (val == null) return;
            if (el.getAttribute('data-i18n-placeholder')) { el.placeholder = val; return; }
            /* Replace first non-empty text node only — preserves ✓ check spans etc. */
            var replaced = false;
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) {
                    el.childNodes[i].textContent = val + ' ';
                    replaced = true;
                    break;
                }
            }
            if (!replaced && !el.children.length) el.textContent = val;
        });
    }

    /* Expose translation helper for JS-rendered text (e.g. dashboard greeting) */
    function getTranslation(key) {
        var loc = String(window.auraLocale || 'en').split('-')[0];
        if (typeof window._auraI18nLookup === 'function') {
            var v = window._auraI18nLookup(key, loc);
            if (v != null) return v;
        }
        var t = Object.assign({}, T_FULL[loc] || T_FULL['en'], T_EXTRA[loc] || {});
        var val = t[key];
        return val != null ? val : key;
    }
    window.getTranslation = getTranslation;
    window.applyAllTranslations = applyAllTranslations;

    /* Replace app.js applyTranslations so locale change uses full table (all locales) */
    (function () {
        var orig = window.applyTranslations;
        if (typeof orig !== 'function') return;
        window.applyTranslations = function () {
            var loc = window.auraLocale || (typeof window.getLocale === 'function' ? window.getLocale() : 'en');
            applyAllTranslations(loc);
        };
    })();

    /* Refresh all date-bearing elements across the whole app */
    function refreshAllDates() {
        if (typeof window.refreshAllDateInputsDisplay === 'function') window.refreshAllDateInputsDisplay();

        if (typeof window.renderEntryList === 'function') window.renderEntryList();
        if (typeof window.renderCalendarCurrentView === 'function') window.renderCalendarCurrentView();
        if (typeof window.renderSettingsDataManagerRecent === 'function') window.renderSettingsDataManagerRecent();
        if (typeof window.updateLastBackupDisplay === 'function') window.updateLastBackupDisplay();
        if (typeof window.renderBackupList === 'function') window.renderBackupList();

        var em = document.getElementById('entryModal');
        if (em && em.classList.contains('show') && window.entryModalDate && typeof window.showEntryModal === 'function') {
            window.showEntryModal(window.entryModalDate);
        }

        if (typeof window.renderDataManagerPreview === 'function' && typeof window.getDataManagerSelectedDate === 'function') {
            window.renderDataManagerPreview(window.getDataManagerSelectedDate());
        }
    }

    /* Refresh all time-bearing elements including dynamic sleep segments */
    function refreshAllTimes() {
        if (typeof window.refreshAllTimeInputsDisplay === 'function') window.refreshAllTimeInputsDisplay();

        document.querySelectorAll('.sleep-start, .sleep-end').forEach(function (inp) {
            var stored = inp.getAttribute('data-aura-time');
            if (stored && typeof window.setTimeInputDisplay === 'function') {
                window.setTimeInputDisplay(inp, stored);
            }
        });

        ['prefDefaultSleep', 'prefDefaultWake'].forEach(function (id) {
            var el = document.getElementById(id);
            if (!el) return;
            var stored = el.getAttribute('data-aura-time');
            if (stored && typeof window.setTimeInputDisplay === 'function') {
                window.setTimeInputDisplay(el, stored);
            }
        });

        if (typeof window.renderSleepTimeline === 'function') window.renderSleepTimeline();

        if (typeof window.renderBackupList === 'function') window.renderBackupList();
        if (typeof window.updateLastBackupDisplay === 'function') window.updateLastBackupDisplay();

        var em = document.getElementById('entryModal');
        if (em && em.classList.contains('show') && window.entryModalDate && typeof window.showEntryModal === 'function') {
            window.showEntryModal(window.entryModalDate);
        }
    }

    /* Rerender the currently visible analytics chart after theme change */
    function refreshActiveChart() {
        var active = document.querySelector('.page.active');
        if (!active) return;
        var id = active.id;
        setTimeout(function () {
            if (id === 'circadian' && typeof window.renderCircadian === 'function') window.renderCircadian();
            if (id === 'correlations') {
                if (typeof window.renderCorrPair === 'function' && window._corrCachedEntries) {
                    var btn = document.querySelector('.corr-pair-tab.active');
                    var pair = btn ? btn.dataset.pair : 'sleep-mood';
                    window.renderCorrPair(pair, window._corrCachedEntries);
                } else if (typeof window.renderCorrelations === 'function') {
                    window.renderCorrelations();
                }
            }
            if (id === 'seasonal' && typeof window.renderSeasonal === 'function') window.renderSeasonal();
            if (id === 'patterns') {
                if (typeof window.renderRadarChart === 'function') window.renderRadarChart();
                if (typeof window.renderDistributionChart === 'function') window.renderDistributionChart();
                if (typeof window.renderDayOfWeekChart === 'function') window.renderDayOfWeekChart();
            }
        }, 350);
    }

    /* ── 1. Patch loadPreferencesIntoUI for correct initial-load translations ── */
    onReady(function () {
        var origLoad = window.loadPreferencesIntoUI;
        if (typeof origLoad !== 'function') return;
        window.loadPreferencesIntoUI = function () {
            var result = origLoad.apply(this, arguments);
            setTimeout(function () {
                var loc = window.auraLocale || 'en';
                applyAllTranslations(loc);
            }, 150);
            return result;
        };
    });

    /* ── 2. Patch savePreference for non-locale UI helpers only ───────────── */
    onReady(function () {
        var origSave = window.savePreference;
        if (typeof origSave !== 'function') return;
        /* If i18n.js has already wrapped savePreference as the master i18n handler,
           do not wrap again here. This avoids clobbering the runI18n-on-locale-change
           behavior and keeps there being exactly one authoritative wrapper. */
        if (origSave._masterI18n) return;

        window.savePreference = function (key, value) {
            var result = origSave.apply(this, arguments);

            setTimeout(function () {
                if (key === 'dateFormat') {
                    refreshAllDates();
                    if (typeof window.showToast === 'function') window.showToast('Date format updated ✓');
                }

                if (key === 'timeFormat') {
                    refreshAllTimes();
                    if (typeof window.showToast === 'function') window.showToast('Time format updated ✓');
                }

                if (key === 'locale') {
                    var loc = String(value != null ? value : 'en').split('-')[0];
                    window.auraLocale = loc;
                    if (typeof window.Chart !== 'undefined' && window.Chart.instances) {
                        Object.keys(window.Chart.instances).forEach(function (id) { window.Chart.instances[id].destroy(); });
                    }
                    applyAllTranslations(loc);
                }

                if (key === 'reduceMotion') {
                    var qlToolbar = document.querySelector('.ql-toolbar');
                    if (qlToolbar) qlToolbar.style.transition = value ? 'none' : '';
                }
            }, 80);

            return result;
        };
    });

    /* ── 3. Patch setTheme / toggleDark to refresh active analytics chart ── */
    onReady(function () {
        var origSetTheme = window.setTheme;
        if (typeof origSetTheme === 'function') {
            window.setTheme = function (name) {
                var r = origSetTheme.apply(this, arguments);
                refreshActiveChart();
                return r;
            };
        }

        var origToggleDark = window.toggleDark;
        if (typeof origToggleDark === 'function') {
            window.toggleDark = function () {
                var r = origToggleDark.apply(this, arguments);
                refreshActiveChart();
                return r;
            };
            window.toggleDarkFromPage = window.toggleDark;
        }
    });

    /* ── 4. Settings page: show visual feedback chip when any select changes ── */
    onReady(function () {
        var settingsPage = document.getElementById('settings');
        if (!settingsPage) return;

        var selectors = ['#themeSelect', '#prefDateFormat', '#prefTimeFormat', '#prefChartDays'];
        selectors.forEach(function (sel) {
            var el = document.querySelector(sel);
            if (!el || el._settingsFeedbackBound) return;
            el._settingsFeedbackBound = true;
            el.addEventListener('change', function () {
                el.style.transition = 'box-shadow 0.18s ease';
                el.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 35%, transparent)';
                setTimeout(function () { el.style.boxShadow = ''; }, 800);
            });
        });
    });

    /* ── 5. On navigate to settings: always apply full translations ─────────── */
    onReady(function () {
        var origNav = window.navigate;
        if (typeof origNav !== 'function') return;
        window.navigate = function (page) {
            var r = origNav.apply(this, arguments);
            if (page === 'settings') {
                setTimeout(function () {
                    applyAllTranslations(window.auraLocale || 'en');
                }, 200);
            }
            return r;
        };
    });

    console.log('[Aura] Settings propagation: locale, dateFormat, timeFormat, theme patched.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   Entry modal: stepper inputs + bullet-proof footer buttons
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    /* ── 1. Upgrade number inputs → custom stepper when edit row opens ── */
    function upgradeStepperInputs(editRow) {
        var inp = editRow.querySelector('.em-inline-input[type="number"]');
        if (!inp || inp.dataset.stepperUpgraded) return;
        inp.dataset.stepperUpgraded = '1';

        var min  = parseFloat(inp.getAttribute('min'))  || 0;
        var max  = parseFloat(inp.getAttribute('max'))  || 10;
        var step = parseFloat(inp.getAttribute('step')) || 0.5;

        var wrap = document.createElement('div');
        wrap.className = 'em-stepper-wrap';
        inp.parentNode.insertBefore(wrap, inp);

        var btnMinus = document.createElement('button');
        btnMinus.type = 'button';
        btnMinus.className = 'em-stepper-btn';
        btnMinus.setAttribute('aria-label', 'Decrease');
        btnMinus.textContent = '−';

        var divL = document.createElement('span');
        divL.className = 'em-stepper-divider';

        var divR = document.createElement('span');
        divR.className = 'em-stepper-divider';

        var btnPlus = document.createElement('button');
        btnPlus.type = 'button';
        btnPlus.className = 'em-stepper-btn';
        btnPlus.setAttribute('aria-label', 'Increase');
        btnPlus.textContent = '+';

        wrap.appendChild(btnMinus);
        wrap.appendChild(divL);
        wrap.appendChild(inp);         // move input inside wrap
        wrap.appendChild(divR);
        wrap.appendChild(btnPlus);

        function clamp(v) {
            return Math.round(Math.min(max, Math.max(min, v)) / step) * step;
        }
        function nudge(dir) {
            var cur = parseFloat(inp.value) || min;
            inp.value = clamp(cur + dir * step).toFixed(
                step % 1 !== 0 ? String(step).split('.')[1].length : 0
            );
            inp.dispatchEvent(new Event('input', { bubbles: true }));
        }

        btnMinus.addEventListener('click', function (e) { e.preventDefault(); nudge(-1); });
        btnPlus.addEventListener('click',  function (e) { e.preventDefault(); nudge(+1); });

        /* Long-press repeat */
        var repeatTimer;
        function startRepeat(dir) {
            repeatTimer = setInterval(function () { nudge(dir); }, 120);
        }
        function stopRepeat() { clearInterval(repeatTimer); }
        btnMinus.addEventListener('mousedown',  function () { startRepeat(-1); });
        btnPlus.addEventListener('mousedown',   function () { startRepeat(+1); });
        ['mouseup', 'mouseleave', 'touchend'].forEach(function (ev) {
            btnMinus.addEventListener(ev, stopRepeat);
            btnPlus.addEventListener(ev,  stopRepeat);
        });
    }

    /* Watch for .em-inline-edit-row getting the "open" class */
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (m) {
            if (m.type === 'attributes' && m.attributeName === 'class') {
                var el = m.target;
                if (el.classList.contains('em-inline-edit-row') && el.classList.contains('open')) {
                    upgradeStepperInputs(el);
                }
            }
        });
    });

    function attachStepperObserver() {
        var body = document.getElementById('entryModalBody');
        /* Re-observe when body innerHTML is replaced (new emFieldRow render) */
        var bodyObserver = new MutationObserver(function () {
            document.querySelectorAll('.em-inline-edit-row').forEach(function (row) {
                observer.observe(row, { attributes: true });
            });
        });
        if (body) {
            bodyObserver.observe(body, { childList: true, subtree: false });
        }
        /* Also catch rows already in DOM */
        document.querySelectorAll('.em-inline-edit-row').forEach(function (row) {
            observer.observe(row, { attributes: true });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachStepperObserver);
    } else {
        attachStepperObserver();
    }

    /* Footer buttons handled by BATCH F only — no rebind/defineProperty here */
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH F — DEFINITIVE button fix + full modal redesign wiring
   Strategy: wrap showEntryModal at window.load (after app.js has fully
   run) and set onclick directly with date captured at call time.
   No delegation, no flags, no stopPropagation — just clean direct binding.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function applyButtonBindings(dateStr) {
        var editBtn    = document.getElementById('entryModalEditBtn');
        var journalBtn = document.getElementById('entryModalJournalBtn');
        var closeBtns  = document.querySelectorAll('#entryModal .entry-modal-footer .btn-neutral, #entryModal .entry-modal-close');

        if (editBtn) {
            editBtn.onclick = null;
            editBtn.addEventListener('click', function handler(e) {
                e.stopPropagation();
                editBtn.removeEventListener('click', handler);
                if (typeof window.openEntryForDate === 'function') {
                    window.openEntryForDate(dateStr);
                } else {
                    if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                    setTimeout(function () {
                        var btn = document.querySelector('.bottom-nav button[data-page="entry"], .sidebar .nav[data-page="entry"]');
                        if (typeof window.navigate === 'function') window.navigate('entry', btn);
                    }, 60);
                }
            });
            var _tEB = typeof window.t === 'function' ? window.t : function(k) { return k; };
            editBtn.textContent = _tEB('edit_entry_btn');
        }

        if (journalBtn) {
            journalBtn.onclick = null;
            journalBtn.addEventListener('click', function handler(e) {
                e.stopPropagation();
                journalBtn.removeEventListener('click', handler);
                if (typeof window.openJournalEntryFromModal === 'function') {
                    window.openJournalEntryFromModal(dateStr);
                } else {
                    if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                    setTimeout(function () {
                        var btn = document.querySelector('.bottom-nav button[data-page="journal"], .sidebar .nav[data-page="journal"]');
                        if (typeof window.navigate === 'function') window.navigate('journal', btn);
                    }, 60);
                }
            });
            var _tJB = typeof window.t === 'function' ? window.t : function(k) { return k; };
            journalBtn.textContent = _tJB('nav_journal');
        }

        closeBtns.forEach(function (btn) {
            btn.onclick = function (e) {
                e.stopPropagation();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
            };
            var _tCB = typeof window.t === 'function' ? window.t : function(k) { return k; };
            if (btn.classList.contains('btn-neutral')) btn.textContent = _tCB('close');
        });
    }

    function patchShowEntryModal() {
        var orig = window.showEntryModal;
        if (!orig || orig._batchFPatched) return;

        window.showEntryModal = function (dateStr) {
            orig.call(this, dateStr);
            /* Set bindings after the modal has rendered */
            requestAnimationFrame(function () {
                applyButtonBindings(dateStr);
            });
        };
        window.showEntryModal._batchFPatched = true;

        /* Also expose showEntryModalFromJournal wrapper */
        var origJ = window.showEntryModalFromJournal;
        if (origJ && !origJ._batchFPatched) {
            window.showEntryModalFromJournal = function (dateStr) {
                origJ.call(this, dateStr);
                requestAnimationFrame(function () { applyButtonBindings(dateStr); });
            };
            window.showEntryModalFromJournal._batchFPatched = true;
        }
    }

    /* Wait for app.js to fully run and expose functions */
    if (document.readyState === 'complete') {
        setTimeout(patchShowEntryModal, 300);
    } else {
        window.addEventListener('load', function () {
            setTimeout(patchShowEntryModal, 300);
        });
    }
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH G — NUCLEAR button fix
   All previous batches (C/D/E/F) layered broken state on each other.
   cloneNode() wipes every accumulated listener in one shot.
   We then set a single onclick that reads window.entryModalDate live.
   Footer is never re-rendered by showEntryModal so one-time bind is safe.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function fixButtons() {
        /* ── Edit Entry ─────────────────────────────────────────────── */
        var editOld = document.getElementById('entryModalEditBtn');
        if (editOld) {
            var editNew = editOld.cloneNode(false); // false = no children
            editNew.textContent = 'Edit Entry';
            editNew.className   = editOld.className;
            editNew.id          = 'entryModalEditBtn';
            editNew.type        = 'button';
            editNew.style.cssText = editOld.style.cssText;
            editOld.parentNode.replaceChild(editNew, editOld);

            editNew.onclick = function (e) {
                e.stopPropagation();
                var d = window.entryModalDate;
                if (!d) return;
                if (typeof window.openEntryForDate === 'function') {
                    window.openEntryForDate(d);
                } else {
                    if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                    setTimeout(function () {
                        if (typeof window.navigate === 'function') window.navigate('entry', document.querySelector('.bottom-nav button[data-page="entry"]'));
                    }, 60);
                }
            };
        }

        /* ── Journal ────────────────────────────────────────────────── */
        var jOld = document.getElementById('entryModalJournalBtn');
        if (jOld) {
            var jNew = jOld.cloneNode(false);
            jNew.textContent = 'Journal';
            jNew.className   = jOld.className;
            jNew.id          = 'entryModalJournalBtn';
            jNew.type        = 'button';
            jNew.style.cssText = jOld.style.cssText;
            jOld.parentNode.replaceChild(jNew, jOld);

            jNew.onclick = function (e) {
                e.stopPropagation();
                var d = window.entryModalDate;
                if (!d) return;
                if (typeof window.openJournalEntryFromModal === 'function') {
                    window.openJournalEntryFromModal(d);
                } else {
                    if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                    setTimeout(function () {
                        if (typeof window.navigate === 'function') window.navigate('journal', document.querySelector('.bottom-nav button[data-page="journal"]'));
                    }, 60);
                }
            };
        }

        /* ── Close ──────────────────────────────────────────────────── */
        document.querySelectorAll('#entryModal .entry-modal-footer .btn-neutral').forEach(function (btn) {
            var c = btn.cloneNode(true);
            btn.parentNode.replaceChild(c, btn);
            c.onclick = function (e) {
                e.stopPropagation();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
            };
        });

        document.querySelectorAll('#entryModal .entry-modal-close').forEach(function (btn) {
            var c = btn.cloneNode(true);
            btn.parentNode.replaceChild(c, btn);
            c.onclick = function (e) {
                e.stopPropagation();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
            };
        });
    }

    /* Run once after everything has loaded */
    if (document.readyState === 'complete') {
        setTimeout(fixButtons, 600);
    } else {
        window.addEventListener('load', function () { setTimeout(fixButtons, 600); });
    }

    /* Safety: also run once the first time the modal becomes visible */
    var _once = false;
    var _obs = new MutationObserver(function () {
        var m = document.getElementById('entryModal');
        if (m && m.classList.contains('show') && !_once) {
            _once = true;
            _obs.disconnect();
            fixButtons();
        }
    });
    document.addEventListener('DOMContentLoaded', function () {
        var m = document.getElementById('entryModal');
        if (m) _obs.observe(m, { attributes: true, attributeFilter: ['class'] });
    });

})();
