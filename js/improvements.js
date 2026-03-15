/**
 * Aura Mood — Improvements JS (v2)
 *
 * Fixed bugs from v1:
 *  - Velocity color patch now targets window.renderCircadian (correct exposed name)
 *  - Entries loaded via own Dexie connection (not broken closure ref)
 *  - Language translation uses safe text-node replacement (preserves child elements)
 *  - Theme toggle re-renders all active charts
 *  - Report tabs get inline-style enforcement for inactive state
 *  - Escape key closes entry modal
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
           app.js exposes:  window.renderCircadian = renderMoodVelocity
           (NOT window.renderMoodVelocity — that was the bug in v1)
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

        // Baseline
        if (allAvg < 6.5) {
            insights.push({ icon: '⚠️', text: 'Your average sleep is ' + allAvg.toFixed(1) + ' hours — below the recommended 7–9h.', sub: 'Even small improvements tend to lift mood the following day.' });
        } else {
            insights.push({ icon: '✨', text: 'Your average sleep is ' + allAvg.toFixed(1) + ' hours — within a healthy range.', sub: 'Consistency matters more than duration; try to keep your bedtime within a 30-minute window.' });
        }

        // Trend
        if (Math.abs(trend) > 0.4) {
            insights.push({
                icon: trend > 0 ? '📈' : '📉',
                text: trend > 0 ? 'Sleep improved by ' + trend.toFixed(1) + 'h this week vs your average.' : 'Sleep dropped by ' + Math.abs(trend).toFixed(1) + 'h this week vs your average.',
                sub:  trend > 0 ? 'Keep it up — sustained rest builds resilience.' : 'Check for late screens or stress cutting your sleep short.'
            });
        }

        // Sweet spot
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
                insights.push({ icon: '🎯', text: '7–8.5h nights are your sweet spot: mood averages ' + ssAvgMood.toFixed(1) + ' — ' + (ssAvgMood - allAvgMood).toFixed(1) + ' above your overall average.', sub: 'Based on ' + sweetSpot.length + ' nights in that range.' });
            }
        }

        return insights.slice(0, 3);
    }

    function buildEnergyInsights(entries) {
        var dates = Object.keys(entries).sort();
        if (dates.length < 7) return null;

        var energyDates = dates.filter(function (d) { return entries[d] && typeof entries[d].energy === 'number' && !isNaN(entries[d].energy); });
        if (energyDates.length < 5) return null;

        var energies  = energyDates.map(function (d) { return entries[d].energy; });
        var allAvg    = safeAvg(energies);
        var recentAvg = safeAvg(energies.slice(-7));
        var trend     = recentAvg - allAvg;
        var insights  = [];

        // Energy–mood link
        var paired = energyDates.filter(function (d) { return typeof entries[d].mood === 'number' && !isNaN(entries[d].mood); });
        if (paired.length >= 7) {
            var xA = paired.map(function (d) { return entries[d].energy; });
            var yA = paired.map(function (d) { return entries[d].mood; });
            var n  = xA.length;
            var sx = 0, sy = 0, sxy = 0, sx2 = 0;
            for (var i = 0; i < n; i++) { sx += xA[i]; sy += yA[i]; sxy += xA[i] * yA[i]; sx2 += xA[i] * xA[i]; }
            var slope = (n * sx2 - sx * sx) ? (n * sxy - sx * sy) / (n * sx2 - sx * sx) : 0;
            if (Math.abs(slope) > 0.25) {
                insights.push({ icon: '⚡', text: slope > 0 ? 'Your energy and mood track closely together (' + (Math.abs(slope) > 0.6 ? 'high' : 'moderate') + ' correlation).' : 'Interesting: your energy and mood don\'t always align — worth exploring why.', sub: 'Logged across ' + n + ' days with both metrics.' });
            }
        }

        // Baseline
        insights.push({ icon: allAvg >= 6.5 ? '⚡' : '🔋', text: 'Your energy averages ' + allAvg.toFixed(1) + '/10' + (allAvg >= 7 ? ' — a solid baseline.' : allAvg >= 5 ? ' — moderate and manageable.' : ' — lower than optimal.'), sub: allAvg < 5 ? 'Activity, sleep quality, and hydration are often the biggest levers.' : 'Keep tracking to see what days feel most energised.' });

        // Trend
        if (Math.abs(trend) > 0.4) {
            insights.push({ icon: trend > 0 ? '📈' : '📉', text: trend > 0 ? 'Energy trending up this week (+' + trend.toFixed(1) + ' vs average).' : 'Energy dipped this week (' + trend.toFixed(1) + ' vs average).', sub: trend < 0 ? 'Watch for sleep deficits or increased stress.' : 'Whatever you\'re doing — keep it up.' });
        }

        // Energy–sleep correlation hint
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
            var paired = sleepNums.map(function (s, i) { return { x: s, y: energyNums[i] }; });
            var sorted = paired.slice().sort(function (a, b) { return a.x - b.x; });
            var lowEnergy = safeAvg(sorted.slice(0, Math.floor(sorted.length / 2)).map(function (p) { return p.y; }));
            var highEnergy = safeAvg(sorted.slice(Math.ceil(sorted.length / 2)).map(function (p) { return p.y; }));
            if (lowEnergy != null && highEnergy != null) {
                var diff = highEnergy - lowEnergy;
                if (diff > 0.8) {
                    insights.push({ icon: '🔗', text: 'More sleep tends to come with higher energy for you.', sub: 'On nights with more sleep, your energy the next day averages ' + diff.toFixed(1) + ' points higher.' });
                } else if (diff < -0.8) {
                    insights.push({ icon: '🤔', text: 'Your energy doesn\'t closely track your sleep duration.', sub: 'Other factors — activity, stress, or timing — may matter more for you.' });
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

        var strip = document.createElement('div');
        strip.className = 'page-analytics-insights';
        strip.innerHTML = '<h4>What your data shows</h4>' +
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
       5.  LANGUAGE — safe per-text-node replacement that preserves child
           elements, plus translated strings for all supported languages
       ═══════════════════════════════════════════════════════════════════ */
    var T = {
        en: { save_entry:'Save Entry', calendar_title:'Calendar', calendar_subtitle:'Explore your mood history across days, weeks and months.', daily_checkin:'Daily Check-In', journal:'Journal', settings:'Settings', daily_summary:'Daily Summary', export_heatmap:'Export Heatmap', delete_entry:'Delete Entry', low_mood:'Low mood', neutral:'Neutral', good_mood:'Good mood', today:'Today', edit_journal_entry:'Edit journal entry', journal_saved_placeholder:'Your journal entry for today has already been saved.', one_journal_per_day:'Only one journal entry can be created per day.', add_photo:'📷 Add Photo' },
        de: { save_entry:'Eintrag speichern', calendar_title:'Kalender', calendar_subtitle:'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.', daily_checkin:'Tages-Check-in', journal:'Tagebuch', settings:'Einstellungen', daily_summary:'Tageszusammenfassung', export_heatmap:'Heatmap exportieren', delete_entry:'Eintrag löschen', low_mood:'Niedrige Stimmung', neutral:'Neutral', good_mood:'Gute Stimmung', today:'Heute', edit_journal_entry:'Tagebucheintrag bearbeiten', journal_saved_placeholder:'Dein Tagebucheintrag wurde bereits gespeichert.', one_journal_per_day:'Pro Tag kann nur ein Tagebucheintrag erstellt werden.', add_photo:'📷 Foto hinzufügen' },
        fr: { save_entry:'Enregistrer', calendar_title:'Calendrier', calendar_subtitle:'Explorez votre historique d\'humeur par jour, semaine et mois.', daily_checkin:'Bilan du jour', journal:'Journal', settings:'Paramètres', daily_summary:'Résumé du jour', export_heatmap:'Exporter la heatmap', delete_entry:'Supprimer l\'entrée', low_mood:'Humeur basse', neutral:'Neutre', good_mood:'Bonne humeur', today:'Aujourd\'hui', edit_journal_entry:'Modifier l\'entrée', journal_saved_placeholder:'Votre entrée a déjà été enregistrée.', one_journal_per_day:'Un seul entrée de journal par jour.', add_photo:'📷 Ajouter une photo' },
        es: { save_entry:'Guardar entrada', calendar_title:'Calendario', calendar_subtitle:'Explora tu historial de ánimo por días, semanas y meses.', daily_checkin:'Registro diario', journal:'Diario', settings:'Ajustes', daily_summary:'Resumen del día', export_heatmap:'Exportar mapa de calor', delete_entry:'Eliminar entrada', low_mood:'Ánimo bajo', neutral:'Neutral', good_mood:'Buen ánimo', today:'Hoy', edit_journal_entry:'Editar entrada', journal_saved_placeholder:'Tu entrada ya ha sido guardada.', one_journal_per_day:'Solo se puede crear una entrada por día.', add_photo:'📷 Añadir foto' },
        it: { save_entry:'Salva voce', calendar_title:'Calendario', calendar_subtitle:'Esplora la storia dell\'umore per giorni, settimane e mesi.', daily_checkin:'Check-in quotidiano', journal:'Diario', settings:'Impostazioni', daily_summary:'Riepilogo quotidiano', export_heatmap:'Esporta heatmap', delete_entry:'Elimina voce', low_mood:'Umore basso', neutral:'Neutro', good_mood:'Buon umore', today:'Oggi', edit_journal_entry:'Modifica voce', journal_saved_placeholder:'La voce è già stata salvata.', one_journal_per_day:'Una sola voce per giorno.', add_photo:'📷 Aggiungi foto' },
        pt: { save_entry:'Guardar entrada', calendar_title:'Calendário', calendar_subtitle:'Explore o historial de humor por dias, semanas e meses.', daily_checkin:'Check-in diário', journal:'Diário', settings:'Definições', daily_summary:'Resumo diário', export_heatmap:'Exportar heatmap', delete_entry:'Eliminar entrada', low_mood:'Humor baixo', neutral:'Neutro', good_mood:'Bom humor', today:'Hoje', edit_journal_entry:'Editar entrada', journal_saved_placeholder:'A entrada já foi guardada.', one_journal_per_day:'Apenas uma entrada por dia.', add_photo:'📷 Adicionar foto' },
        nl: { save_entry:'Invoer opslaan', calendar_title:'Kalender', calendar_subtitle:'Verken uw stemmingsgeschiedenis per dag, week en maand.', daily_checkin:'Dagelijkse check-in', journal:'Dagboek', settings:'Instellingen', daily_summary:'Dagelijks overzicht', export_heatmap:'Heatmap exporteren', delete_entry:'Verwijder invoer', low_mood:'Lage stemming', neutral:'Neutraal', good_mood:'Goede stemming', today:'Vandaag', edit_journal_entry:'Dagboek bewerken', journal_saved_placeholder:'De dagboekvermelding is al opgeslagen.', one_journal_per_day:'Eén dagboekvermelding per dag.', add_photo:'📷 Foto toevoegen' },
        pl: { save_entry:'Zapisz wpis', calendar_title:'Kalendarz', calendar_subtitle:'Przeglądaj historię nastroju po dniach, tygodniach i miesiącach.', daily_checkin:'Codzienny check-in', journal:'Dziennik', settings:'Ustawienia', daily_summary:'Podsumowanie dnia', export_heatmap:'Eksportuj heatmapę', delete_entry:'Usuń wpis', low_mood:'Zły nastrój', neutral:'Neutralny', good_mood:'Dobry nastrój', today:'Dziś', edit_journal_entry:'Edytuj wpis', journal_saved_placeholder:'Wpis w dzienniku jest już zapisany.', one_journal_per_day:'Jeden wpis w dzienniku na dzień.', add_photo:'📷 Dodaj zdjęcie' },
        ru: { save_entry:'Сохранить запись', calendar_title:'Календарь', calendar_subtitle:'Изучайте историю настроения за дни, недели и месяцы.', daily_checkin:'Ежедневный чек-ин', journal:'Дневник', settings:'Настройки', daily_summary:'Итог дня', export_heatmap:'Экспорт тепловой карты', delete_entry:'Удалить запись', low_mood:'Плохое настроение', neutral:'Нейтрально', good_mood:'Хорошее настроение', today:'Сегодня', edit_journal_entry:'Редактировать запись', journal_saved_placeholder:'Запись уже сохранена.', one_journal_per_day:'Одна запись в день.', add_photo:'📷 Добавить фото' },
        tr: { save_entry:'Kaydı kaydet', calendar_title:'Takvim', calendar_subtitle:'Gün, hafta ve aylara göre ruh hali geçmişinizi keşfedin.', daily_checkin:'Günlük kontrol', journal:'Günlük', settings:'Ayarlar', daily_summary:'Günlük özet', export_heatmap:'Isı haritası dışa aktar', delete_entry:'Kaydı sil', low_mood:'Düşük ruh hali', neutral:'Nötr', good_mood:'İyi ruh hali', today:'Bugün', edit_journal_entry:'Günlük girişini düzenle', journal_saved_placeholder:'Günlük girişiniz zaten kaydedildi.', one_journal_per_day:'Günde yalnızca bir günlük girişi.', add_photo:'📷 Fotoğraf ekle' },
        ja: { save_entry:'保存', calendar_title:'カレンダー', calendar_subtitle:'日、週、月ごとのムード履歴を確認する。', daily_checkin:'デイリーチェックイン', journal:'日記', settings:'設定', daily_summary:'1日のまとめ', export_heatmap:'ヒートマップを書き出す', delete_entry:'削除', low_mood:'低い気分', neutral:'普通', good_mood:'良い気分', today:'今日', edit_journal_entry:'日記を編集', journal_saved_placeholder:'今日の日記はすでに保存されています。', one_journal_per_day:'1日に作成できる日記は1件のみです。', add_photo:'📷 写真を追加' },
        zh: { save_entry:'保存记录', calendar_title:'日历', calendar_subtitle:'按日、周、月浏览心情历史。', daily_checkin:'每日打卡', journal:'日记', settings:'设置', daily_summary:'每日总结', export_heatmap:'导出热力图', delete_entry:'删除记录', low_mood:'情绪低落', neutral:'中性', good_mood:'情绪良好', today:'今天', edit_journal_entry:'编辑日记', journal_saved_placeholder:'今天的日记已保存。', one_journal_per_day:'每天只能创建一条日记。', add_photo:'📷 添加照片' }
    };

    function applyTranslationsSafe(locale) {
        var loc = String(locale || 'en').split('-')[0];
        var t = T[loc] || T['en'];
        document.querySelectorAll('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var val = t[key];
            if (val == null) return;
            // Placeholder replacement
            if (el.getAttribute('data-i18n-placeholder')) {
                el.placeholder = val;
                return;
            }
            // Find first text node and replace only that — preserves child elements like the ✓ check dot
            var replaced = false;
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim()) {
                    el.childNodes[i].textContent = val + ' ';
                    replaced = true;
                    break;
                }
            }
            // Fallback: no text nodes, no children — set textContent directly
            if (!replaced && !el.children.length) {
                el.textContent = val;
            }
        });
    }

    onReady(function () {
        var origSavePref = window.savePreference;
        if (typeof origSavePref !== 'function') return;
        window.savePreference = function (key, value) {
            var result = origSavePref.apply(this, arguments);
            if (key === 'locale') {
                setTimeout(function () {
                    applyTranslationsSafe(value);
                    if (typeof window.showToast === 'function') window.showToast('Language updated ✓');
                }, 80);
            }
            return result;
        };
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
        hint.textContent = 'Click any day to view or edit that entry. Colour indicates mood — green = high, amber = mid, terracotta = low.';
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

    console.log('[Aura Improvements v2] Loaded — velocity, insights, i18n, dark-mode charts, report tabs, escape key all patched.');
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
                return d.toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' });
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

    var PAIR_CONFIG = {
        'sleep-mood': {
            xKey:   function(e) { return e.sleepTotal != null ? e.sleepTotal : e.sleep; },
            yKey:   function(e) { return e.mood; },
            xLabel: 'Sleep (hours)', yLabel: 'Mood (1–10)',
            xMin: 0, xMax: 12, yMin: 1, yMax: 10,
            label:  'Sleep vs Mood',
            desc:   'How your sleep duration relates to next-day mood.',
            color:  '--chart-1'
        },
        'sleep-energy': {
            xKey:   function(e) { return e.sleepTotal != null ? e.sleepTotal : e.sleep; },
            yKey:   function(e) { return e.energy; },
            xLabel: 'Sleep (hours)', yLabel: 'Energy (1–10)',
            xMin: 0, xMax: 12, yMin: 1, yMax: 10,
            label:  'Sleep vs Energy',
            desc:   'How much sleep affects your energy levels.',
            color:  '--accent-secondary'
        },
        'mood-energy': {
            xKey:   function(e) { return e.mood; },
            yKey:   function(e) { return e.energy; },
            xLabel: 'Mood (1–10)', yLabel: 'Energy (1–10)',
            xMin: 1, xMax: 10, yMin: 1, yMax: 10,
            label:  'Mood vs Energy',
            desc:   'The relationship between how you feel emotionally and your physical energy.',
            color:  '--chart-3'
        }
    };

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
        var cfg = PAIR_CONFIG[pairKey];
        if (!cfg) return;

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
            badge.textContent = r2 != null ? 'R² = ' + (r2*100).toFixed(1) + '%' : (xs.length < 3 ? 'Need 3+ entries' : '');
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
            label: 'Trend',
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
                        title: { display: true, text: 'Deviation from average', font: { size: 10, weight: '600' }, color: tickColor }
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
          modals.html cancel button calls closePremiumConfirm() inline,
          but app.js never puts it on window — so clicking Cancel on the
          delete-field confirm modal does nothing. Patch it here.
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
          (The div has onclick="if(event.target===this)closePremiumConfirm()"
           but closePremiumConfirm wasn't on window — fixed by patch #1 above.
           This is a belt-and-suspenders fallback.)
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

    /* ── Full translation table (mirrors improvements.js v2 T object) ── */
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

    /* Safe text-node replacement preserving child elements */
    function applyAllTranslations(locale) {
        var loc = String(locale || 'en').split('-')[0];
        var t = T_FULL[loc] || T_FULL['en'];
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

    /* ── 2. Patch savePreference for comprehensive propagation ─────────────── */
    onReady(function () {
        var origSave = window.savePreference;
        if (typeof origSave !== 'function') return;

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
                    var loc = String(value || 'en');
                    if (loc === '_custom') {
                        var customEl = document.getElementById('prefLocaleCustom');
                        loc = customEl ? (customEl.value.trim() || 'en') : 'en';
                    }
                    applyAllTranslations(loc);
                    if (window.quillEditor) {
                        var placeholder = T_FULL[loc.split('-')[0]] && T_FULL[loc.split('-')[0]]['journal']
                            ? 'Write something about your ' + (loc.startsWith('de') ? 'Tag' : 'day') + '…'
                            : 'Write something about your day…';
                        var qlBlank = document.querySelector('.ql-editor.ql-blank');
                        if (qlBlank) qlBlank.setAttribute('data-placeholder', placeholder);
                    }
                    if (typeof window.renderCalendarCurrentView === 'function') window.renderCalendarCurrentView();
                    if (typeof window.renderHeatmap === 'function') window.renderHeatmap();
                    if (typeof window.showToast === 'function') window.showToast('Language updated ✓');
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

    console.log('[Aura Batch D] Settings propagation: locale, dateFormat, timeFormat, theme fully patched.');
})();

/* ═══════════════════════════════════════════════════════════════════════
   BATCH D — Entry modal: stepper inputs + bullet-proof footer buttons
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

    /* ── 2. Bullet-proof footer button binding ───────────────────────── */
    /* Overwrite inline onclick attrs so they always use the live date  */
    function rebindFooterButtons() {
        var editBtn    = document.getElementById('entryModalEditBtn');
        var journalBtn = document.getElementById('entryModalJournalBtn');
        var closeBtn   = document.querySelector('#entryModal .btn-neutral');

        if (editBtn && !editBtn._batchDBound) {
            editBtn._batchDBound = true;
            editBtn.removeAttribute('onclick');
            editBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var d = window.entryModalDate || '';
                if (!d) return;
                if (typeof window.openEntryForDate === 'function') window.openEntryForDate(d);
                else if (typeof window.navigateTo === 'function') window.navigateTo('entry', d);
            });
        }

        if (journalBtn && !journalBtn._batchDBound) {
            journalBtn._batchDBound = true;
            journalBtn.removeAttribute('onclick');
            journalBtn.addEventListener('click', function (e) {
                e.preventDefault();
                var d = window.entryModalDate || '';
                if (!d) return;
                if (typeof window.openJournalEntryFromModal === 'function') window.openJournalEntryFromModal(d);
                else if (typeof window.navigateTo === 'function') window.navigateTo('journal', d);
            });
        }

        if (closeBtn && !closeBtn._batchDBound) {
            closeBtn._batchDBound = true;
            closeBtn.removeAttribute('onclick');
            closeBtn.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
            });
        }

        /* Also fix the header × button */
        var headerClose = document.querySelector('#entryModal .entry-modal-close');
        if (headerClose && !headerClose._batchDBound) {
            headerClose._batchDBound = true;
            headerClose.removeAttribute('onclick');
            headerClose.addEventListener('click', function (e) {
                e.preventDefault();
                if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
            });
        }
    }

    /* Bind on load and re-bind whenever the modal opens */
    function onReady(fn) {
        if (document.readyState !== 'loading') { setTimeout(fn, 150); return; }
        document.addEventListener('DOMContentLoaded', function () { setTimeout(fn, 500); });
    }
    onReady(rebindFooterButtons);

    /* Re-bind after any showEntryModal call (modal may have been re-rendered) */
    var _origShow = window.showEntryModal;
    Object.defineProperty(window, 'showEntryModal', {
        configurable: true,
        get: function () { return _origShow; },
        set: function (fn) {
            _origShow = fn;
        }
    });
    /* Patch via overlay click observer as a fallback */
    document.addEventListener('click', function (e) {
        var overlay = e.target.closest('.entry-modal-overlay');
        if (overlay) setTimeout(rebindFooterButtons, 80);
    }, true);

    /* ── 3. Strip emoji prefixes from footer button text ─────────────── */
    function cleanFooterLabels() {
        var map = {
            entryModalEditBtn:    'Full Edit',
            entryModalJournalBtn: 'Journal'
        };
        Object.keys(map).forEach(function (id) {
            var btn = document.getElementById(id);
            if (btn && btn.textContent.trim() !== map[id]) {
                /* Preserve only the text node, strip emoji */
                btn.textContent = map[id];
            }
        });
    }
    onReady(cleanFooterLabels);

})();
