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
            var chart = window.circadianChart;
            if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[0]) return;
            var s = getComputedStyle(document.documentElement);
            var accent = s.getPropertyValue('--accent').trim() || '#8B9D83';
            var chart3 = s.getPropertyValue('--chart-3').trim() || '#C97D60';
            var isDark = document.documentElement.getAttribute('data-dark') === 'true';
            var pos = hexToRgba(accent, 0.82);
            var neg = hexToRgba(chart3, 0.78);
            var neutral = isDark ? 'rgba(148,163,184,0.22)' : 'rgba(0,0,0,0.09)';
            var velocities = chart.data.datasets[0].data;
            if (!velocities || !velocities.length) return;
            chart.data.datasets[0].backgroundColor = velocities.map(function (v) {
                if (typeof v === 'number' && v > 0.5)  return pos;
                if (typeof v === 'number' && v < -0.5) return neg;
                return neutral;
            });
            chart.update('none');
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

        return insights.slice(0, 3);
    }

    function renderInsights(pageId, insights) {
        var page = document.getElementById(pageId);
        if (!page) return;
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
                if (active.id === 'correlations' && typeof window.renderCorrelations === 'function') window.renderCorrelations();
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
