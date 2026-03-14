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

    /* ─── Unit suffix map ─────────────────────────────────────────────────── */
    var CHART_UNITS = {
        'Mood':        '/ 10',
        'Energy':      '/ 10',
        'Sleep':       'hrs',
        'Mood Change': 'pts',
        'Frequency':   '',
        'Average mood': '/ 10',
        'Forecast':    '/ 10',
        'Sleep vs Mood':      '',
        'Activity vs Energy': ''
    };

    /* ─── Date label → readable title ────────────────────────────────────── */
    function prettifyChartDate(raw) {
        if (!raw || typeof raw !== 'string') return raw;
        /* "M/D" or "M/D/YYYY" short date from createChart */
        var parts = raw.split('/');
        if (parts.length >= 2) {
            var month = parseInt(parts[0], 10);
            var day   = parseInt(parts[1], 10);
            if (!isNaN(month) && !isNaN(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
                var MONTHS = ['January','February','March','April','May',
                              'June','July','August','September','October',
                              'November','December'];
                return MONTHS[month - 1] + ' ' + day;
            }
        }
        /* Already a full date string or bar label (Mon, Jan…) */
        return raw;
    }

    /* ─── Format a numeric chart value with its unit ─────────────────────── */
    function formatChartValue(value, datasetLabel) {
        if (value == null || value === '' || isNaN(Number(value))) return '—';
        var n    = Number(value);
        var unit = CHART_UNITS[datasetLabel] || '';
        var formatted;
        if (Number.isInteger(n)) {
            formatted = String(n);
        } else {
            formatted = n.toFixed(1);
        }
        return unit ? formatted + ' ' + unit : formatted;
    }

    window.getAuraChartOptions = function getAuraChartOptions() {
        var isDark = document.documentElement.getAttribute('data-dark') === 'true';
        var text      = getCssVar('--text',       '#2C2C2C');
        var textMuted = getCssVar('--text-muted', '#4A4A4A');
        var border    = getCssVar('--border',     'rgba(139, 157, 131, 0.15)');
        var surface   = getCssVar('--surface',    '#FFFEF9');
        var gridColor = border;

        var tooltipBg = isDark
            ? 'rgba(30, 41, 59, 0.97)'
            : 'rgba(255, 255, 255, 0.98)';
        var tooltipBorder = isDark
            ? 'rgba(148, 163, 184, 0.22)'
            : 'rgba(0, 0, 0, 0.09)';
        var tooltipTitleColor = isDark ? '#f1f5f9' : text;
        var tooltipBodyColor  = isDark ? '#94a3b8' : textMuted;

        return {
            responsive: true,
            maintainAspectRatio: false,

            /* ── Enter-from-zero animation ─────────────────────────────────── */
            animation: {
                duration: 500,
                easing: 'easeOutQuart',
                /* Line/bar charts animate points in from y=0 */
                y: {
                    from: function(ctx) {
                        if (ctx.type !== 'data') return undefined;
                        /* Only animate on first draw, not updates */
                        if (ctx.mode === 'active') return undefined;
                        var scale = ctx.chart.scales.y;
                        return scale ? scale.getPixelForValue(scale.min || 0) : undefined;
                    }
                }
            },

            layout: {
                padding: { top: 12, right: 16, bottom: 12, left: 16 }
            },

            interaction: {
                mode: 'index',
                intersect: false
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

                    /* ── Typography ──────────────────────────────────────────── */
                    titleFont:  { family: "'DM Sans', sans-serif", size: 13, weight: '600' },
                    bodyFont:   { family: "'DM Sans', sans-serif", size: 12, weight: '400' },
                    footerFont: { family: "'DM Sans', sans-serif", size: 11, weight: '400' },

                    /* ── Colors ──────────────────────────────────────────────── */
                    titleColor:  tooltipTitleColor,
                    bodyColor:   tooltipBodyColor,
                    footerColor: tooltipBodyColor,
                    borderColor: tooltipBorder,
                    borderWidth: 1,

                    /* ── Layout ──────────────────────────────────────────────── */
                    padding:      { top: 10, right: 14, bottom: 10, left: 14 },
                    cornerRadius: 12,
                    caretSize:    5,
                    caretPadding: 8,
                    displayColors: true,
                    boxWidth:  8,
                    boxHeight: 8,
                    boxPadding: 4,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    titleSpacing: 4,
                    bodySpacing:  6,

                    /* ── Callbacks ───────────────────────────────────────────── */
                    callbacks: {
                        title: function(items) {
                            if (!items || !items.length) return '';
                            var raw = items[0].label || '';
                            return prettifyChartDate(raw);
                        },
                        label: function(ctx) {
                            var label = ctx.dataset.label || '';
                            var value = ctx.parsed && ctx.parsed.y != null ? ctx.parsed.y : ctx.raw;
                            var formatted = formatChartValue(value, label);
                            if (!label) return '  ' + formatted;

                            // Add contextual suffix based on value
                            var suffix = '';
                            if (label === 'Mood' || label === 'Energy') {
                                var n = Number(value);
                                if (!isNaN(n)) {
                                    if (n >= 8) suffix = ' \u2014 great';
                                    else if (n >= 6) suffix = ' \u2014 good';
                                    else if (n <= 3) suffix = ' \u2014 tough day';
                                }
                            }
                            if (label === 'Sleep') {
                                var h = Number(value);
                                if (!isNaN(h)) {
                                    if (h >= 8) suffix = ' \u2014 well rested';
                                    else if (h < 6) suffix = ' \u2014 short night';
                                }
                            }
                            return '  ' + label + '  \xb7  ' + formatted + suffix;
                        }
                    }
                },
                legend: {
                    display: false
                }
            }
        };
    };

    /* ─── Expose helpers for use in app.js tooltip overrides ─────────────── */
    window.auraChartPrettifyDate  = prettifyChartDate;
    window.auraChartFormatValue   = formatChartValue;
    window.auraChartUnits         = CHART_UNITS;

    /* ─── Average reference line plugin ───────────────────────────────────── */
    if (typeof Chart !== 'undefined' && Chart.register) {
        Chart.register({
            id: 'auraAverageLine',
            afterDraw: function(chart) {
                if (!chart.config.options || !chart.config.options._auraShowAvgLine) return;
                var ctx = chart.ctx;
                var datasets = chart.data.datasets;
                if (!datasets || !datasets.length) return;
                var d = datasets[0].data.filter(function(v) { return v != null && !isNaN(Number(v)); }).map(Number);
                if (d.length < 3) return;
                var avg = d.reduce(function(a, b) { return a + b; }, 0) / d.length;
                var yScale = chart.scales.y;
                var ca = chart.chartArea;
                if (!yScale || !ca) return;
                var y = yScale.getPixelForValue(avg);
                ctx.save();
                ctx.setLineDash([4, 4]);
                ctx.strokeStyle = 'rgba(139,157,131,0.45)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ca.left, y);
                ctx.lineTo(ca.right, y);
                ctx.stroke();
                ctx.restore();
            }
        });
    }
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
            var _vp = dates[i].split('-');
            var _VM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            labels.push(_VM[parseInt(_vp[1], 10) - 1] + ' ' + parseInt(_vp[2], 10));
        }
    }
    return { velocities: velocities, labels: labels };
};

/* ─── Render-function wrappers (unchanged) ───────────────────────────────── */
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

/**
 * Analyse a data array and return annotation chips for display below a chart.
 * @param {Array<number|null>} data - the chart data values
 * @param {string} metricLabel - 'Mood', 'Sleep', 'Energy', etc.
 * @returns {Array<{text: string, sentiment: 'positive'|'negative'|'neutral'}>}
 */
window.buildChartAnnotations = function buildChartAnnotations(data, metricLabel) {
    if (!Array.isArray(data) || !data.length) return [];
    var valid = data.filter(function(v) { return v != null && !isNaN(Number(v)); }).map(Number);
    if (valid.length < 3) return [];

    var chips = [];
    var avg = valid.reduce(function(a, b) { return a + b; }, 0) / valid.length;
    var last = valid[valid.length - 1];
    var firstHalf = valid.slice(0, Math.floor(valid.length / 2));
    var secondHalf = valid.slice(Math.floor(valid.length / 2));
    var firstAvg = firstHalf.reduce(function(a, b) { return a + b; }, 0) / firstHalf.length;
    var secondAvg = secondHalf.reduce(function(a, b) { return a + b; }, 0) / secondHalf.length;
    var trend = secondAvg - firstAvg;

    // Average chip
    chips.push({ text: 'Avg ' + avg.toFixed(1), sentiment: 'neutral' });

    // Trend chip
    if (Math.abs(trend) >= 0.3) {
        var direction = trend > 0 ? '\u2197 Up' : '\u2198 Down';
        var sign = trend > 0 ? '+' : '';
        chips.push({
            text: direction + ' ' + sign + trend.toFixed(1) + ' vs earlier',
            sentiment: trend > 0 ? 'positive' : 'negative'
        });
    }

    // Latest vs average
    var latestDiff = last - avg;
    if (Math.abs(latestDiff) >= 0.4) {
        var vsAvgText = (latestDiff > 0 ? '+' : '') + latestDiff.toFixed(1) + ' vs avg';
        chips.push({ text: 'Latest: ' + vsAvgText, sentiment: latestDiff > 0 ? 'positive' : 'negative' });
    }

    // Range chip
    var min = Math.min.apply(null, valid);
    var max = Math.max.apply(null, valid);
    chips.push({ text: 'Range ' + min.toFixed(1) + '\u2013' + max.toFixed(1), sentiment: 'neutral' });

    return chips.slice(0, 4);
};

/**
 * Render annotation chips below a chart canvas.
 * @param {HTMLElement} canvas - the chart canvas element
 * @param {Array} chips - from buildChartAnnotations()
 */
window.renderChartAnnotationBar = function renderChartAnnotationBar(canvas, chips) {
    if (!canvas || !chips || !chips.length) return;
    var wrap = canvas.parentElement;
    if (!wrap) return;

    // Remove any existing annotation bar
    var existing = wrap.querySelector('.chart-annotation-bar');
    if (existing) existing.remove();

    var bar = document.createElement('div');
    bar.className = 'chart-annotation-bar';
    chips.forEach(function(chip) {
        var el = document.createElement('span');
        el.className = 'chart-annotation-chip ' + (chip.sentiment || 'neutral');
        el.innerHTML = '<span class="chart-annotation-dot"></span>' + chip.text;
        bar.appendChild(el);
    });
    wrap.appendChild(bar);
};
