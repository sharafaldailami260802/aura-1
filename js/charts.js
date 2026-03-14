/**
 * Safe global Chart.js defaults and style helper.
 * Load this after Chart.js and before any chart is created.
 */
(function() {
    console.log('charts.js loaded');
    if (typeof Chart === 'undefined') return;

    Chart.defaults.font.family = "'DM Sans', sans-serif";
    Chart.defaults.font.size = 12;

    Chart.defaults.plugins.legend.display = false;

    function getCssVar(name, fallback) {
        try {
            var val = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
            return val || fallback;
        } catch (e) {
            return fallback;
        }
    }

    window.getAuraChartOptions = function getAuraChartOptions() {
        var isDark = document.documentElement.getAttribute('data-dark') === 'true';
        var text = getCssVar('--text', '#2C2C2C');
        var textMuted = getCssVar('--text-muted', '#4A4A4A');
        var border = getCssVar('--border', 'rgba(139, 157, 131, 0.15)');
        var gridColor = border;

        var tooltipBg = isDark
            ? 'rgba(15, 23, 42, 0.92)'
            : 'rgba(255, 255, 255, 0.96)';
        var tooltipBorder = isDark ? 'rgba(148, 163, 184, 0.25)' : 'rgba(0,0,0,0.08)';
        var tooltipTitleColor = isDark ? '#f1f5f9' : text;
        var tooltipBodyColor = isDark ? '#94a3b8' : textMuted;

        return {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: { top: 12, right: 16, bottom: 12, left: 16 }
            },
            interaction: {
                mode: 'index',
                intersect: false
            },
            animation: {
                duration: 400,
                easing: 'easeOutQuart'
            },
            scales: {
                x: {
                    grid: { display: false, color: gridColor },
                    border: { display: false },
                    ticks: {
                        font: { family: "'DM Sans', sans-serif", size: 11, weight: '500' },
                        color: textMuted,
                        padding: 10,
                        maxRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 8
                    }
                },
                y: {
                    grid: { color: gridColor, drawBorder: false },
                    border: { display: false },
                    ticks: {
                        font: { family: "'DM Sans', sans-serif", size: 11, weight: '500' },
                        color: textMuted,
                        padding: 10,
                        callback: undefined
                    }
                }
            },
            plugins: {
                tooltip: {
                    enabled: true,
                    backgroundColor: tooltipBg,
                    titleFont: { family: "'DM Sans', sans-serif", size: 13, weight: '600' },
                    bodyFont: { family: "'DM Sans', sans-serif", size: 13, weight: '400' },
                    titleColor: tooltipTitleColor,
                    bodyColor: tooltipBodyColor,
                    borderColor: tooltipBorder,
                    borderWidth: 1,
                    padding: 14,
                    cornerRadius: 12,
                    displayColors: false,
                    titleSpacing: 6,
                    boxPadding: 4
                },
                legend: {
                    display: false
                }
            }
        };
    };
})();

/**
 * Compute day-over-day mood velocity from entries.
 * Returns { velocities: number[], labels: string[] } for chart use.
 */
window.computeMoodVelocity = function computeMoodVelocity(entries) {
    if (!entries || typeof entries !== 'object') return { velocities: [], labels: [] };
    var dates = Object.keys(entries).sort();
    var velocities = [];
    var labels = [];
    for (var i = 1; i < dates.length; i++) {
        var prev = entries[dates[i - 1]] && entries[dates[i - 1]].mood;
        var curr = entries[dates[i]] && entries[dates[i]].mood;
        if (prev != null && curr != null && typeof prev === 'number' && typeof curr === 'number' && !isNaN(prev) && !isNaN(curr)) {
            velocities.push(curr - prev);
            var d = new Date(dates[i]);
            labels.push((d.getMonth() + 1) + '/' + d.getDate());
        }
    }
    return { velocities: velocities, labels: labels };
};

// Wrappers call the correct render functions directly (no indirection)
window.renderCorrelationsChart = function() {
    if (typeof window.renderCorrelations === 'function') {
        window.renderCorrelations();
    } else {
        console.warn('Correlations render function not found');
    }
};
window.renderCircadianChart = function() {
    if (typeof window.renderMoodVelocity === 'function') {
        window.renderMoodVelocity();
    } else {
        console.warn('Circadian render function not found');
    }
};
window.renderMoodVelocityChart = function() {
    if (typeof window.renderMoodVelocity === 'function') window.renderMoodVelocity();
};
