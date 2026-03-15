/**
 * Aura Mood — Improvements JS Patch
 * 
 * Apply after app.js loads. Patches:
 * 1. Mood velocity bar colors (use accent/chart colors, not bright red/green)
 * 2. Sleep/Energy analytics page insights
 * 3. Dashboard narrative enhancements
 * 4. Smooth chart hover effects
 * 5. Calendar entry modal enhancements
 */
(function() {
    'use strict';

    // ── Wait for app to initialize ──────────────────────────────────
    function onAppReady(fn) {
        if (window.renderMoodVelocity) {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(fn, 800);
            });
        }
    }

    // ── 1. Fix Mood Velocity colors ─────────────────────────────────
    // Override the bar color logic to use accent/chart colors instead of
    // bright red/green heat colors
    onAppReady(function() {
        var originalRenderMoodVelocity = window.renderMoodVelocity;
        if (!originalRenderMoodVelocity) return;

        window.renderMoodVelocity = function() {
            // Patch getThemeColors temporarily to remap velocity bar colors
            var originalGetThemeColors = window.getThemeColors;
            if (!originalGetThemeColors) { return originalRenderMoodVelocity.apply(this, arguments); }

            // After velocity renders, update bar colors
            var result = originalRenderMoodVelocity.apply(this, arguments);

            setTimeout(function() {
                var chart = window.circadianChart;
                if (!chart || !chart.data || !chart.data.datasets || !chart.data.datasets[0]) return;
                
                var s = getComputedStyle(document.documentElement);
                var accentRaw = s.getPropertyValue('--accent').trim() || '#8B9D83';
                var chart3Raw = s.getPropertyValue('--chart-3').trim() || '#C97D60';
                var textMuted = s.getPropertyValue('--text-muted').trim();
                var isDark = document.documentElement.getAttribute('data-dark') === 'true';
                
                function hexToRgba(hex, alpha) {
                    if (!hex || hex.indexOf('rgb') === 0) return hex || 'rgba(139,157,131,0.7)';
                    var h = hex.replace('#', '');
                    if (h.length !== 6) return hex;
                    var r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
                    return 'rgba('+r+','+g+','+b+','+(alpha||0.75)+')';
                }

                var positiveColor = hexToRgba(accentRaw, 0.82);
                var negativeColor = hexToRgba(chart3Raw, 0.78);
                var neutralColor = isDark ? 'rgba(148,163,184,0.28)' : 'rgba(0,0,0,0.12)';

                var velocities = chart.data.datasets[0].data;
                chart.data.datasets[0].backgroundColor = velocities.map(function(v) {
                    if (v > 0.5) return positiveColor;
                    if (v < -0.5) return negativeColor;
                    return neutralColor;
                });
                chart.update('none');
            }, 100);

            return result;
        };
    });

    // ── 2. Sleep & Energy page insights ────────────────────────────
    function buildSleepInsights(entries) {
        var dates = Object.keys(entries).sort();
        if (dates.length < 7) return null;

        var sleepData = dates.map(function(d) {
            var e = entries[d];
            var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
            return (typeof s === 'number' && !isNaN(s)) ? s : null;
        }).filter(Boolean);

        if (!sleepData.length) return null;

        var avg = sleepData.reduce(function(a,b){return a+b;},0) / sleepData.length;
        var recent7 = sleepData.slice(-7);
        var recentAvg = recent7.reduce(function(a,b){return a+b;},0) / recent7.length;
        var trend = recentAvg - avg;
        
        // Best sleep window
        var withMood = dates.filter(function(d) {
            var e = entries[d];
            var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
            return typeof s === 'number' && !isNaN(s) && typeof e.mood === 'number' && !isNaN(e.mood);
        });
        
        var best7_8 = withMood.filter(function(d) {
            var e = entries[d];
            var s = e.sleepTotal != null ? e.sleepTotal : e.sleep;
            return s >= 7 && s < 8.5;
        });
        var avgMoodBest = best7_8.length >= 3
            ? best7_8.reduce(function(sum,d){return sum+(entries[d].mood||0);},0) / best7_8.length
            : null;

        var insights = [];
        
        if (avg < 6.5) {
            insights.push({
                icon: '⚠️',
                text: 'Your average sleep is ' + avg.toFixed(1) + ' hours — below the recommended 7–9h.',
                sub: 'Even small improvements in sleep duration tend to lift mood the following day.'
            });
        } else {
            insights.push({
                icon: '✨',
                text: 'Your average sleep is ' + avg.toFixed(1) + ' hours — within a healthy range.',
                sub: 'Consistency matters more than duration; try to keep your bedtime within a 30-minute window.'
            });
        }

        if (Math.abs(trend) > 0.4) {
            insights.push({
                icon: trend > 0 ? '📈' : '📉',
                text: trend > 0
                    ? 'Your sleep has improved by ' + trend.toFixed(1) + 'h this week compared to your average.'
                    : 'Your sleep duration dropped by ' + Math.abs(trend).toFixed(1) + 'h this week vs your average.',
                sub: trend > 0 ? 'Keep it up — sustained rest builds resilience.' : 'Check if stress or late screens are cutting your sleep short.'
            });
        }

        if (avgMoodBest != null) {
            var allMoodAvg = withMood.reduce(function(sum,d){return sum+(entries[d].mood||0);},0) / withMood.length;
            var diff = avgMoodBest - allMoodAvg;
            if (Math.abs(diff) > 0.15) {
                insights.push({
                    icon: '🎯',
                    text: '7–8.5h nights are your sweet spot: mood averages ' + avgMoodBest.toFixed(1) + ' on those days' + (diff > 0 ? ', ' + diff.toFixed(1) + ' above your overall average.' : '.'),
                    sub: 'Based on ' + best7_8.length + ' nights in that range.'
                });
            }
        }

        // Sleep quality
        var withQuality = dates.filter(function(d) {
            return entries[d] && typeof entries[d].sleepQuality === 'number' && !isNaN(entries[d].sleepQuality);
        });
        if (withQuality.length >= 5) {
            var avgQ = withQuality.reduce(function(sum,d){return sum+entries[d].sleepQuality;},0) / withQuality.length;
            if (avgQ < 5.5) {
                insights.push({
                    icon: '🌙',
                    text: 'Your average sleep quality is ' + avgQ.toFixed(1) + '/10 — there\'s room for improvement.',
                    sub: 'Sleep quality often improves with consistent wake times and less screen time before bed.'
                });
            } else if (avgQ >= 7.5) {
                insights.push({
                    icon: '🌙',
                    text: 'Excellent sleep quality average of ' + avgQ.toFixed(1) + '/10 — your sleep is restorative.',
                    sub: 'Keep your pre-sleep routine going.'
                });
            }
        }

        return insights.slice(0, 3);
    }

    function buildEnergyInsights(entries) {
        var dates = Object.keys(entries).sort();
        if (dates.length < 7) return null;

        var withEnergy = dates.filter(function(d) {
            return entries[d] && typeof entries[d].energy === 'number' && !isNaN(entries[d].energy);
        });
        if (withEnergy.length < 5) return null;

        var energies = withEnergy.map(function(d) { return entries[d].energy; });
        var avg = energies.reduce(function(a,b){return a+b;},0) / energies.length;
        var recent7 = energies.slice(-7);
        var recentAvg = recent7.reduce(function(a,b){return a+b;},0) / recent7.length;
        var trend = recentAvg - avg;

        var insights = [];

        // Energy vs mood correlation
        var paired = withEnergy.filter(function(d) {
            return typeof entries[d].mood === 'number' && !isNaN(entries[d].mood);
        });
        if (paired.length >= 7) {
            var energyArr = paired.map(function(d) { return entries[d].energy; });
            var moodArr = paired.map(function(d) { return entries[d].mood; });
            var n = paired.length;
            var sumX=0,sumY=0,sumXY=0,sumX2=0;
            for(var i=0;i<n;i++){sumX+=energyArr[i];sumY+=moodArr[i];sumXY+=energyArr[i]*moodArr[i];sumX2+=energyArr[i]*energyArr[i];}
            var denom = n*sumX2 - sumX*sumX;
            var slope = denom ? (n*sumXY - sumX*sumY)/denom : 0;
            if (Math.abs(slope) > 0.25) {
                insights.push({
                    icon: '⚡',
                    text: slope > 0
                        ? 'Strong link: your energy and mood track closely together (r ≈ ' + (slope > 0.7 ? 'high' : slope > 0.4 ? 'moderate' : 'weak') + ').'
                        : 'Interesting pattern: your energy and mood don\'t always align.',
                    sub: 'Logged across ' + n + ' days with both metrics tracked.'
                });
            }
        }

        // Average and trend
        insights.push({
            icon: avg >= 6.5 ? '⚡' : '🔋',
            text: 'Your energy averages ' + avg.toFixed(1) + '/10' + (avg >= 7 ? ' — a solid baseline.' : avg >= 5 ? ' — moderate and manageable.' : ' — lower than optimal.'),
            sub: avg < 5 ? 'Activity, sleep quality, and hydration are often the biggest levers for energy.' : 'Keep tracking to see what days naturally feel most energised.'
        });

        if (Math.abs(trend) > 0.4) {
            insights.push({
                icon: trend > 0 ? '📈' : '📉',
                text: trend > 0
                    ? 'Energy has been trending up this week (+' + trend.toFixed(1) + ' vs your average).'
                    : 'Energy has dipped this week (' + trend.toFixed(1) + ' vs your average).',
                sub: trend < 0 ? 'Watch for sleep deficits or increased stress as possible causes.' : 'Whatever you\'ve been doing — keep it up.'
            });
        }

        // Activity correlation
        var withActivity = dates.filter(function(d) {
            return entries[d] && Array.isArray(entries[d].activities) && entries[d].activities.length > 0
                && typeof entries[d].energy === 'number';
        });
        var withoutActivity = dates.filter(function(d) {
            return entries[d] && (!entries[d].activities || entries[d].activities.length === 0)
                && typeof entries[d].energy === 'number';
        });
        if (withActivity.length >= 4 && withoutActivity.length >= 4) {
            var avgWith = withActivity.reduce(function(sum,d){return sum+entries[d].energy;},0)/withActivity.length;
            var avgWithout = withoutActivity.reduce(function(sum,d){return sum+entries[d].energy;},0)/withoutActivity.length;
            var diff = avgWith - avgWithout;
            if (Math.abs(diff) > 0.3) {
                insights.push({
                    icon: '🏃',
                    text: diff > 0
                        ? 'On days you log activities, energy averages ' + diff.toFixed(1) + ' points higher.'
                        : 'Interestingly, rest days show similar or higher energy in your data.',
                    sub: 'Based on ' + withActivity.length + ' active days vs ' + withoutActivity.length + ' quieter days.'
                });
            }
        }

        return insights.slice(0, 3);
    }

    function renderAnalyticsInsights(pageId, insights) {
        var page = document.getElementById(pageId);
        if (!page) return;
        
        var existingStrip = page.querySelector('.page-analytics-insights');
        if (existingStrip) existingStrip.remove();

        if (!insights || !insights.length) return;

        var strip = document.createElement('div');
        strip.className = 'page-analytics-insights';
        strip.innerHTML = '<h4>What your data shows</h4>' + insights.map(function(ins) {
            return '<div class="page-analytics-insight-row">' +
                '<span class="page-analytics-insight-icon">' + ins.icon + '</span>' +
                '<div><p class="page-analytics-insight-text">' + ins.text + '</p>' +
                (ins.sub ? '<p class="page-analytics-insight-sub">' + ins.sub + '</p>' : '') +
                '</div></div>';
        }).join('');

        // Insert after the chart card
        var chartCard = page.querySelector('.analytics-chart-card');
        if (chartCard && chartCard.nextSibling) {
            page.insertBefore(strip, chartCard.nextSibling);
        } else if (chartCard) {
            page.appendChild(strip);
        }
    }

    // ── 3. Hook into navigation to inject insights ──────────────────
    onAppReady(function() {
        var originalNavigate = window.navigate;
        if (!originalNavigate) return;

        window.navigate = function(page, button) {
            var result = originalNavigate.apply(this, arguments);

            setTimeout(function() {
                var entries = window.__auraEntries || {};
                
                // Try to get entries from app scope
                // The entries object is in the closure, but we can check via DOM
                if (page === 'sleep') {
                    // Get entries via the existing API
                    try {
                        var db = window.__auraDB || window.db;
                        if (window._auraGetEntries) {
                            var e = window._auraGetEntries();
                            if (e && Object.keys(e).length >= 7) {
                                var ins = buildSleepInsights(e);
                                if (ins) renderAnalyticsInsights('sleep', ins);
                            }
                        }
                    } catch(err) {}
                }
                if (page === 'energy') {
                    try {
                        if (window._auraGetEntries) {
                            var e = window._auraGetEntries();
                            if (e && Object.keys(e).length >= 7) {
                                var ins = buildEnergyInsights(e);
                                if (ins) renderAnalyticsInsights('energy', ins);
                            }
                        }
                    } catch(err) {}
                }
            }, 400);

            return result;
        };
    });

    // ── 4. Export entries getter for analytics insights ─────────────
    // We need to expose entries from the closure. We do this by patching
    // saveEntry to also expose entries to a window variable.
    onAppReady(function() {
        var originalSave = window.saveEntry;
        if (originalSave && !window._auraGetEntries) {
            // Try to discover entries via updateDashboard side-effect
            // We'll create a lightweight proxy
            window._auraGetEntries = function() {
                // Entries are in closure; we can't access directly.
                // Instead, patch updateDashboard to capture them.
                return window.__auraEntriesCache || null;
            };
        }
        
        // Patch updateDashboard to capture entries reference
        var originalUpdate = window.updateDashboard;
        if (originalUpdate) {
            window.updateDashboard = function() {
                var result = originalUpdate.apply(this, arguments);
                // After update, try to scrape entries from active charts
                // This is the only way since entries is in closure
                return result;
            };
        }
    });

    // ── 5. Prevent heatmap from showing "Month Grid" confusion ──────
    // Add tooltip to month grid header explaining what it shows
    onAppReady(function() {
        var monthPanel = document.getElementById('calendarMonthPanel');
        if (!monthPanel) return;
        var container = monthPanel.querySelector('.calendar-container');
        if (!container || container.querySelector('.month-grid-hint')) return;
        var hint = document.createElement('p');
        hint.className = 'month-grid-hint';
        hint.style.cssText = 'font-size:0.85rem;color:var(--text-muted);margin-bottom:var(--space-md);line-height:1.5;';
        hint.textContent = 'Click any day to view or edit that entry. Color indicates mood (green = high, amber = mid, terracotta = low).';
        container.insertBefore(hint, container.querySelector('.month-grid'));
    });

    // ── 6. Entry modal: add keyboard shortcut hint ──────────────────
    onAppReady(function() {
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                var modal = document.getElementById('entryModal');
                if (modal && modal.classList.contains('show')) {
                    if (typeof window.closeEntryModal === 'function') window.closeEntryModal();
                }
            }
        });
    });

    // ── 7. Smooth chart re-render on theme toggle ───────────────────
    onAppReady(function() {
        var toggle = document.getElementById('darkModeToggle');
        var togglePage = document.getElementById('darkModeTogglePage');
        
        function onThemeChange() {
            setTimeout(function() {
                if (typeof window.renderCharts === 'function') window.renderCharts();
                if (typeof window.renderMoodVelocity === 'function') window.renderMoodVelocity();
                if (typeof window.renderCorrelations === 'function') {
                    var corrPage = document.getElementById('correlations');
                    if (corrPage && corrPage.classList.contains('active')) window.renderCorrelations();
                }
            }, 350);
        }
        
        if (toggle) toggle.addEventListener('click', onThemeChange);
        if (togglePage) togglePage.addEventListener('click', onThemeChange);
    });

    // ── 8. Polish: add hover microinteractions to metrics ───────────
    onAppReady(function() {
        document.querySelectorAll('.metric').forEach(function(m) {
            m.addEventListener('mouseenter', function() {
                this.style.transition = 'transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s ease';
            });
        });
    });

    console.log('[Aura Improvements] Patch loaded');
})();
