(function() {
    console.log('app.js loaded');
    function hide() {
        var s = document.getElementById('splash');
        if (s && !s.classList.contains('hide')) {
            s.classList.add('hide');
            setTimeout(function() { s.setAttribute('aria-hidden', 'true'); }, 520);
        }
    }
    window.hideSplash = hide;
    var splash = document.getElementById('splash');
    if (splash) splash.removeAttribute('aria-hidden');
})();

window.addEventListener('error', function(e) {
    console.error('[Aura] Runtime error:', e.message, e.filename, e.lineno, e.colno, e.error);
    if (window.hideSplash) window.hideSplash();
});
window.addEventListener('unhandledrejection', function(e) {
    console.error('[Aura] Unhandled promise rejection:', e.reason);
    if (window.hideSplash) window.hideSplash();
});

    function initApp() {
// DailyRecord interface: one record per date containing mood, energy, sleep, activities, tags, journal, and photos.
const DB_NAME = 'AuraAnalyticsDB';
const DB_VERSION = 1;
var db;
try {
    db = new Dexie(DB_NAME);
    db.version(1).stores({
        entries: 'id, date',
        appState: 'key',
        backupMeta: 'key'
    });
    db.version(2).stores({
        entries: 'id, date',
        appState: 'key',
        backupMeta: 'key',
        backups: 'id'
    });
} catch (dbErr) {
    console.error('[Aura Mood] Database initialization failed:', dbErr);
    try {
        if (typeof Dexie !== 'undefined') {
            db = new Dexie(DB_NAME + '_fallback');
            db.version(1).stores({ entries: 'id, date', appState: 'key', backupMeta: 'key', backups: 'id' });
        }
    } catch (e2) {
        console.error('[Aura Mood] Database fallback failed:', e2);
        db = null;
    }
}
if (!db) {
    var noop = function() { return Promise.resolve(); };
    var emptyArr = function() { return Promise.resolve([]); };
    var emptyVal = function() { return Promise.resolve(null); };
    db = {
        entries: { toArray: emptyArr, bulkPut: noop, get: emptyVal },
        appState: { get: emptyVal, put: noop },
        backupMeta: { get: emptyVal },
        backups: { toArray: emptyArr }
    };
}

function cloneJsonSafe(value, fallback) {
    if (value == null) return fallback;
    try { return JSON.parse(JSON.stringify(value)); } catch (e) { return fallback; }
}
function getRecordJournalHtml(record) {
    if (!record) return '';
    if (record.journal != null) return String(record.journal);
    if (record.notes != null) return String(record.notes);
    return '';
}
function serializeDailyRecord(record) {
    if (!record || !record.date) return null;
    var journalHtml = getRecordJournalHtml(record);
    var sleepSegments = Array.isArray(record.sleepSegments) ? record.sleepSegments.filter(function(seg) {
        return seg && (seg.start || seg.end);
    }).map(function(seg) {
        return { start: seg.start || '', end: seg.end || '' };
    }) : [];
    var totals = computeSleepTotalsFromSegments(sleepSegments);
    var sleepTotal = totals && !totals.error ? totals.totalHours : (record.sleepTotal != null ? record.sleepTotal : record.sleep);
    sleepTotal = clampSleepTotal(sleepTotal);
    return {
        id: record.date,
        date: record.date,
        recordType: 'dailyRecord',
        schemaVersion: 1,
        mood: record.mood,
        sleep: sleepTotal,
        sleepTotal: sleepTotal,
        sleepSegmentCount: sleepSegments.length,
        sleepSegments: sleepSegments,
        sleepQuality: record.sleepQuality,
        sleepTime: record.sleepTime || '',
        wakeTime: record.wakeTime || '',
        energy: record.energy,
        customMetrics: cloneJsonSafe(record.customMetrics, {}) || {},
        activities: Array.isArray(record.activities) ? record.activities.slice() : [],
        journal: journalHtml,
        notes: journalHtml,
        tags: Array.isArray(record.tags) ? record.tags.slice() : [],
        photos: Array.isArray(record.photos) ? cloneJsonSafe(record.photos, []) : [],
        updatedAt: record.updatedAt || new Date().toISOString()
    };
}
function normalizeDailyRecord(raw, dateOverride) {
    var date = dateOverride || (raw && (raw.date || raw.id));
    if (!date) return null;
    var journalHtml = raw ? (raw.journal != null ? raw.journal : (raw.notes != null ? raw.notes : '')) : '';
    var sleepSegments = raw && Array.isArray(raw.sleepSegments) ? raw.sleepSegments.filter(function(seg) {
        return seg && (seg.start || seg.end);
    }).map(function(seg) {
        return { start: seg.start || '', end: seg.end || '' };
    }) : [];
    if (!sleepSegments.length && raw && raw.sleepTime && raw.wakeTime) {
        sleepSegments = [{ start: raw.sleepTime, end: raw.wakeTime }];
    }
    var totals = computeSleepTotalsFromSegments(sleepSegments);
    var computedSleep = totals && !totals.error ? totals.totalHours : null;
    var sleepTotal = computedSleep != null ? computedSleep : (raw && raw.sleepTotal != null ? raw.sleepTotal : (raw && raw.sleep != null ? raw.sleep : raw && raw.sleepDuration));
    sleepTotal = clampSleepTotal(sleepTotal);
    return {
        id: date,
        date: date,
        recordType: 'dailyRecord',
        schemaVersion: 1,
        mood: raw ? raw.mood : undefined,
        sleep: sleepTotal,
        sleepTotal: sleepTotal,
        sleepSegmentCount: sleepSegments.length,
        sleepSegments: sleepSegments,
        sleepQuality: raw ? raw.sleepQuality : undefined,
        sleepTime: raw && raw.sleepTime ? raw.sleepTime : '',
        wakeTime: raw && raw.wakeTime ? raw.wakeTime : '',
        energy: raw ? raw.energy : undefined,
        customMetrics: raw && raw.customMetrics ? cloneJsonSafe(raw.customMetrics, {}) : {},
        activities: raw && Array.isArray(raw.activities) ? raw.activities.slice() : [],
        journal: journalHtml,
        notes: journalHtml,
        tags: raw && Array.isArray(raw.tags) ? raw.tags.slice() : [],
        photos: raw && Array.isArray(raw.photos) ? cloneJsonSafe(raw.photos, []) : [],
        updatedAt: raw && raw.updatedAt ? raw.updatedAt : null
    };
}
function createDailyRecord(dateStr) {
    return normalizeDailyRecord({
        id: dateStr,
        date: dateStr,
        customMetrics: {},
        activities: [],
        tags: [],
        photos: [],
        journal: ''
    }, dateStr);
}
function mergeLegacyStandaloneJournal(records, journalHtml, photosList) {
    var text = journalHtml || '';
    var photos = Array.isArray(photosList) ? photosList : [];
    if (!text && !photos.length) return records || [];
    var list = Array.isArray(records) ? records.slice() : [];
    var dated = list.map(function(item) { return item && (item.date || item.id); }).filter(Boolean).sort();
    var targetDate = dated.length ? dated[dated.length - 1] : new Date().toISOString().split('T')[0];
    var index = list.findIndex(function(item) { return item && (item.date || item.id) === targetDate; });
    var base = index >= 0 ? normalizeDailyRecord(list[index], targetDate) : createDailyRecord(targetDate);
    var next = applyDailyRecordPatch(base, {
        journal: text || getRecordJournalHtml(base),
        photos: photos.length ? photos : (base.photos || [])
    });
    if (index >= 0) list[index] = next;
    else list.push(next);
    return list;
}
function applyDailyRecordPatch(record, patch) {
    var next = normalizeDailyRecord(record || createDailyRecord((patch && patch.date) || (record && record.date)));
    Object.keys(patch || {}).forEach(function(key) {
        if (patch[key] === undefined) return;
        if (key === 'date') return;
        if (key === 'journal') {
            next.journal = patch[key] || '';
            next.notes = next.journal;
            return;
        }
        next[key] = Array.isArray(patch[key]) ? cloneJsonSafe(patch[key], []) : (typeof patch[key] === 'object' && patch[key] !== null ? cloneJsonSafe(patch[key], {}) : patch[key]);
    });
    return normalizeDailyRecord(next, next.date);
}
var dailySummaryCache = {};
function invalidateDailySummaryCache(dateStr) {
    if (dateStr) {
        delete dailySummaryCache[dateStr];
        return;
    }
    dailySummaryCache = {};
}
function getDailySummaryHash(seed) {
    var text = String(seed || '');
    var total = 0;
    for (var i = 0; i < text.length; i++) total = (total + text.charCodeAt(i) * (i + 1)) % 2147483647;
    return total;
}
function getDailySummaryVariant(dateStr, key, options) {
    if (!Array.isArray(options) || !options.length) return '';
    return options[getDailySummaryHash(String(dateStr || '') + ':' + key) % options.length];
}
function getDailySummaryAverage(dateStr, field) {
    var keys = Object.keys(entries).filter(function(key) {
        if (key === dateStr) return false;
        var value = entries[key] && entries[key][field];
        return value != null && !isNaN(Number(value));
    }).sort();
    var recentKeys = keys.filter(function(key) { return key < dateStr; }).slice(-14);
    var sourceKeys = recentKeys.length ? recentKeys : keys.slice(-14);
    if (!sourceKeys.length) return null;
    var sum = 0;
    for (var i = 0; i < sourceKeys.length; i++) sum += Number(entries[sourceKeys[i]][field]);
    return sum / sourceKeys.length;
}
function summarizeDailySummaryList(items, fallbackPrefix) {
    var list = (items || []).map(function(item) { return String(item || '').trim(); }).filter(Boolean);
    if (!list.length) return '';
    if (list.length === 1) return list[0];
    if (list.length === 2) return list[0] + ' and ' + list[1];
    return (fallbackPrefix || '') + list.slice(0, 2).join(', ') + ', and ' + list[2];
}
function buildDailySummaryData(dateStr) {
    var entry = dateStr && entries[dateStr] ? normalizeDailyRecord(entries[dateStr], dateStr) : null;
    if (!entry) {
        return {
            text: 'Not enough data to generate a summary yet.',
            sentenceCount: 0,
            isEmpty: true
        };
    }
    var cacheKey = dateStr;
    if (dailySummaryCache[cacheKey]) return dailySummaryCache[cacheKey];
    var journalText = notesValueToPlainText(entry).trim();
    var hasJournal = !!journalText;
    var hasPhotos = Array.isArray(entry.photos) && entry.photos.length > 0;
    var hasMood = entry.mood != null && !isNaN(Number(entry.mood));
    var hasEnergy = entry.energy != null && !isNaN(Number(entry.energy));
    var sleepValue = entry.sleepTotal != null ? entry.sleepTotal : entry.sleep;
    var hasSleep = sleepValue != null && !isNaN(Number(sleepValue));
    var hasTags = Array.isArray(entry.tags) && entry.tags.length > 0;
    var hasActivities = Array.isArray(entry.activities) && entry.activities.length > 0;
    var hasContent = hasMood || hasEnergy || hasSleep || hasTags || hasActivities || hasJournal || hasPhotos;
    if (!hasContent) {
        dailySummaryCache[cacheKey] = {
            text: 'Not enough data to generate a summary yet.',
            sentenceCount: 0,
            isEmpty: true
        };
        return dailySummaryCache[cacheKey];
    }
    if (!hasMood && !hasEnergy && !hasSleep && !hasTags && !hasActivities && (hasJournal || hasPhotos)) {
        dailySummaryCache[cacheKey] = {
            text: hasJournal ? 'You recorded a journal entry today. No mood data was logged.' : 'You saved photos for this day, with no mood data logged.',
            sentenceCount: 2,
            isEmpty: false
        };
        return dailySummaryCache[cacheKey];
    }
    if (hasMood && !hasEnergy && !hasSleep && !hasTags && !hasActivities && !hasJournal && !hasPhotos) {
        dailySummaryCache[cacheKey] = {
            text: 'Mood was recorded today without additional metrics.',
            sentenceCount: 1,
            isEmpty: false
        };
        return dailySummaryCache[cacheKey];
    }
    var sentences = [];
    if (hasMood || hasEnergy) {
        var moodSentence = '';
        if (hasMood) {
            var moodAverage = getDailySummaryAverage(dateStr, 'mood');
            var moodDiff = moodAverage == null ? 0 : Number(entry.mood) - moodAverage;
            if (moodAverage != null && moodDiff > 0.75) {
                moodSentence = getDailySummaryVariant(dateStr, 'mood-high', [
                    'Your mood was slightly higher than your recent average.',
                    'Mood sat a bit above your recent average today.',
                    'You logged a somewhat higher mood than usual today.'
                ]);
            } else if (moodAverage != null && moodDiff < -0.75) {
                moodSentence = getDailySummaryVariant(dateStr, 'mood-low', [
                    'Your mood came in a little lower than your recent average.',
                    'Mood landed slightly below your recent average today.',
                    'You logged a somewhat lower mood than usual today.'
                ]);
            } else if (moodAverage != null) {
                moodSentence = getDailySummaryVariant(dateStr, 'mood-stable', [
                    'Your mood stayed close to your recent average today.',
                    'Mood remained fairly steady compared with recent days.',
                    'Your mood held near its recent baseline today.'
                ]);
            } else {
                moodSentence = getDailySummaryVariant(dateStr, 'mood-recorded', [
                    'Mood was recorded for today.',
                    'You logged your mood for the day.',
                    'Today includes a mood check-in.'
                ]);
            }
        }
        if (hasEnergy && hasMood) {
            var energyDiff = Number(entry.energy) - Number(entry.mood);
            var energyClause = '';
            if (energyDiff > 1.25) {
                energyClause = getDailySummaryVariant(dateStr, 'energy-high', [
                    'energy levels were higher than mood',
                    'energy ran a bit ahead of mood',
                    'energy came in stronger than mood'
                ]);
            } else if (energyDiff < -1.25) {
                energyClause = getDailySummaryVariant(dateStr, 'energy-low', [
                    'energy levels were lower than mood',
                    'energy trailed behind mood',
                    'energy came in a bit below mood'
                ]);
            } else {
                energyClause = getDailySummaryVariant(dateStr, 'energy-aligned', [
                    'energy levels were aligned with mood',
                    'energy stayed in step with mood',
                    'energy tracked closely with mood'
                ]);
            }
            moodSentence = moodSentence ? moodSentence.replace(/\.$/, '') + ', and ' + energyClause + '.' : 'Energy was recorded today.';
        } else if (hasEnergy && !hasMood) {
            moodSentence = getDailySummaryVariant(dateStr, 'energy-only', [
                'Energy was recorded today without a matching mood entry.',
                'You logged energy today, without a mood reading alongside it.',
                'Energy was tracked today even though mood was not recorded.'
            ]);
        }
        if (moodSentence) sentences.push(moodSentence);
    }
    if (hasSleep) {
        var sleepAverage = getDailySummaryAverage(dateStr, 'sleepTotal') || getDailySummaryAverage(dateStr, 'sleep');
        var sleepDiff = sleepAverage == null ? 0 : Number(sleepValue) - sleepAverage;
        var sleepSentence = '';
        if (sleepAverage != null && sleepDiff > 0.75) {
            sleepSentence = getDailySummaryVariant(dateStr, 'sleep-high', [
                'Sleep duration was slightly above your typical range.',
                'You slept a bit longer than usual.',
                'Sleep duration came in a little above your recent average.'
            ]);
        } else if (sleepAverage != null && sleepDiff < -0.75) {
            sleepSentence = getDailySummaryVariant(dateStr, 'sleep-low', [
                'Sleep duration was slightly below your typical range.',
                'You slept a bit less than usual.',
                'Sleep duration came in a little below your recent average.'
            ]);
        } else if (sleepAverage != null) {
            sleepSentence = getDailySummaryVariant(dateStr, 'sleep-steady', [
                'Sleep duration was close to your typical range.',
                'Sleep duration stayed near your recent average.',
                'Your sleep duration was within your usual range.'
            ]);
        } else {
            sleepSentence = getDailySummaryVariant(dateStr, 'sleep-recorded', [
                'Sleep was recorded for the day.',
                'You logged sleep for this date.',
                'Sleep data was captured for today.'
            ]);
        }
        var segmentCount = entry.sleepSegmentCount != null ? entry.sleepSegmentCount : (entry.sleepSegments || []).length;
        if (segmentCount > 1) {
            sleepSentence = sleepSentence.replace(/\.$/, '') + ', and it was split into multiple segments.';
        }
        sentences.push(sleepSentence);
    }
    if (hasTags || hasActivities || hasJournal) {
        var detailSentence = '';
        if (hasTags && hasActivities) {
            detailSentence = 'Today included activities like "' + summarizeDailySummaryList(entry.activities.slice(0, 3)) + '" and tags such as "' + summarizeDailySummaryList(entry.tags.slice(0, 3)) + '".';
        } else if (hasTags) {
            detailSentence = 'Today included tags such as "' + summarizeDailySummaryList(entry.tags.slice(0, 3)) + '".';
        } else if (hasActivities) {
            detailSentence = 'Today included activities like "' + summarizeDailySummaryList(entry.activities.slice(0, 3)) + '".';
        }
        if (detailSentence) sentences.push(detailSentence);
    }
    if (hasJournal) {
        sentences.push(getDailySummaryVariant(dateStr, 'journal-reflection', [
            'You also recorded a journal reflection today. Reviewing these notes over time may reveal useful patterns.',
            'You wrote a journal entry for this day. These reflections can help spot patterns over time.',
            'A journal reflection was saved today. Revisiting it later may reveal useful insights.'
        ]));
    } else if (sentences.length > 0) {
        sentences.push(getDailySummaryVariant(dateStr, 'journal-prompt', [
            'Consider writing a short reflection in the journal to capture today.',
            'You might add a journal note below to capture how today felt.',
            'Writing a quick reflection in the journal could help you remember this day.'
        ]));
    }
    sentences = sentences.filter(Boolean).slice(0, 4);
    var result = {
        text: sentences.length ? sentences.join(' ') : 'Not enough data to generate a summary yet.',
        sentenceCount: sentences.length,
        isEmpty: !sentences.length
    };
    dailySummaryCache[cacheKey] = result;
    return result;
}
function renderEntryDailySummary(dateStr) {
    var card = document.getElementById('entryDailySummaryCard');
    var textEl = document.getElementById('entryDailySummaryText');
    if (!card || !textEl) return;
    if (!dateStr || !entries[dateStr] || entryDirty) {
        card.hidden = true;
        card.classList.remove('summary-visible');
        return;
    }
    var summary = buildDailySummaryData(dateStr);
    textEl.textContent = summary && summary.text ? summary.text : 'Not enough data to generate a summary yet.';
    card.hidden = false;
    card.classList.add('summary-visible');
}
async function persistDailyRecord(record) {
    var normalized = normalizeDailyRecord(record);
    if (!normalized) return null;
    normalized.updatedAt = new Date().toISOString();
    entries[normalized.date] = normalized;
    invalidateDailySummaryCache();
    await db.entries.put(serializeDailyRecord(normalized));
    return normalized;
}
async function upsertDailyRecord(dateStr, patch) {
    var base = entries[dateStr] ? normalizeDailyRecord(entries[dateStr], dateStr) : createDailyRecord(dateStr);
    var next = applyDailyRecordPatch(base, patch || {});
    return persistDailyRecord(next);
}
async function migrateLegacyJournalAppState() {
    var journalRow = await db.appState.get('journalContent');
    var photosRow = await db.appState.get('journalPhotos');
    var journalHtml = journalRow && journalRow.value ? journalRow.value : '';
    var legacyPhotos = photosRow && Array.isArray(photosRow.value) ? photosRow.value : [];
    if (!journalHtml && !legacyPhotos.length) return;
    var targetDate = getDefaultJournalEntryDate() || new Date().toISOString().split('T')[0];
    var record = entries[targetDate] ? normalizeDailyRecord(entries[targetDate], targetDate) : createDailyRecord(targetDate);
    if (!getRecordJournalHtml(record) && !(record.photos || []).length) {
        await upsertDailyRecord(targetDate, {
            journal: journalHtml,
            photos: legacyPhotos
        });
    }
    try { await db.appState.delete('journalContent'); } catch (e) {}
    try { await db.appState.delete('journalPhotos'); } catch (e) {}
}

let entries = {};
let correlationsChartInstance = null;
let activityEnergyChartInstance = null;
let pendingPhotos = [];
let importPreviewData = null;

var tfLoaded = false;
function loadTensorFlow() {
    if (typeof tf !== 'undefined') { tfLoaded = true; return Promise.resolve(); }
    if (tfLoaded) return Promise.resolve();
    return new Promise(function(resolve, reject) {
        var s = document.createElement('script');
        s.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
        s.onload = function() { tfLoaded = true; resolve(); };
        s.onerror = function() { reject(new Error('TensorFlow failed to load')); };
        document.head.appendChild(s);
    });
}

function openDeleteAllModal() {
    document.getElementById('deleteAllModal').classList.add('show');
    document.getElementById('deleteAllPassword').value = '';
    document.getElementById('deleteAllTypeConfirm').value = '';
    document.getElementById('deleteAllModalError').classList.remove('show');
    document.getElementById('deleteAllModalError').textContent = '';
    db.appState.get('passcodeHash').then(function(row) {
        var hasPasscode = !!(row && row.value);
        document.getElementById('deleteAllPasscodeWrap').style.display = hasPasscode ? 'block' : 'none';
        document.getElementById('deleteAllTypeWrap').style.display = hasPasscode ? 'none' : 'block';
    });
}
function closeDeleteAllModal() {
    document.getElementById('deleteAllModal').classList.remove('show');
}
var pendingDeleteEntryId = null;
var pendingDeleteEntryDate = null;
var pendingDeleteEntryTrigger = null;
var deleteEntryInFlight = false;
function isDeleteEntryModalOpen() {
    var modal = document.getElementById('deleteEntryModal');
    return !!(modal && modal.classList.contains('show'));
}
function formatDeleteEntryMetric(value) {
    if (value == null || value === '') return '';
    var num = Number(value);
    if (!isNaN(num)) return Math.round(num) === num ? String(num) : num.toFixed(1);
    return String(value);
}
function getEntryKeyById(entryId) {
    if (!entryId) return null;
    if (entries[entryId]) return entryId;
    var keys = Object.keys(entries);
    for (var i = 0; i < keys.length; i++) {
        if (entries[keys[i]] && entries[keys[i]].id === entryId) return keys[i];
    }
    return null;
}
function updateDeleteEntryModalContent(entryKey) {
    var title = document.getElementById('deleteEntryModalTitle');
    var preview = document.getElementById('deleteEntryModalPreview');
    var desc = document.getElementById('deleteEntryModalDesc');
    var entry = entryKey ? entries[entryKey] : null;
    var formattedDate = formatDisplayDate(entryKey || (entry && entry.date) || '', window.auraDateFormat || 'MD');
    if (title) title.textContent = formattedDate ? 'Delete Journal - ' + formattedDate + '?' : 'Delete Journal?';
    if (desc) desc.textContent = 'This will permanently remove the journal text and journal photos for this day. This action cannot be undone.';
    if (!preview) return;
    var lines = [];
    if (entry && entry.mood != null) {
        lines.push('<div class="modal-preview-line"><span class="modal-preview-label">Mood:</span> ' + escapeHtml(formatDeleteEntryMetric(entry.mood)) + '</div>');
    }
    var sleepValue = entry ? (entry.sleepTotal != null ? entry.sleepTotal : entry.sleep) : null;
    if (sleepValue != null && sleepValue !== '') {
        lines.push('<div class="modal-preview-line"><span class="modal-preview-label">Sleep:</span> ' + escapeHtml(formatDeleteEntryMetric(sleepValue)) + ' hours</div>');
    }
    if (entry && Array.isArray(entry.tags) && entry.tags.length) {
        lines.push('<div class="modal-preview-line"><span class="modal-preview-label">Tags:</span> ' + escapeHtml(entry.tags.join(', ')) + '</div>');
    }
    preview.innerHTML = lines.join('');
    preview.hidden = lines.length === 0;
}
function getDeleteEntryModalFocusableElements() {
    var modal = document.getElementById('deleteEntryModal');
    if (!modal) return [];
    return Array.prototype.slice.call(modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
        .filter(function(el) { return el.offsetParent !== null; });
}
function openDeleteEntryModal(dateStr, triggerEl) {
    if (!entries[dateStr]) return;
    var modal = document.getElementById('deleteEntryModal');
    if (!modal) return;
    var entry = entries[dateStr];
    deleteEntryInFlight = false;
    pendingDeleteEntryId = (entry && entry.id) || dateStr;
    pendingDeleteEntryDate = dateStr;
    pendingDeleteEntryTrigger = triggerEl || document.activeElement || null;
    updateDeleteEntryModalContent(dateStr);
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function() {
        var focusables = getDeleteEntryModalFocusableElements();
        if (focusables[0]) focusables[0].focus();
    });
}
function closeDeleteEntryModal(restoreFocus) {
    var modal = document.getElementById('deleteEntryModal');
    if (!modal) return;
    var shouldRestoreFocus = restoreFocus !== false;
    var focusTarget = pendingDeleteEntryTrigger;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    pendingDeleteEntryId = null;
    pendingDeleteEntryDate = null;
    pendingDeleteEntryTrigger = null;
    if (shouldRestoreFocus) {
        setTimeout(function() {
            if (focusTarget && document.contains(focusTarget)) {
                focusTarget.focus();
                return;
            }
            var list = document.getElementById('entryList');
            if (list && typeof list.focus === 'function') list.focus();
        }, 0);
    }
}
async function confirmDeleteEntryFromModal() {
    if (!pendingDeleteEntryId || deleteEntryInFlight) return;
    deleteEntryInFlight = true;
    var entryId = pendingDeleteEntryId;
    closeDeleteEntryModal(false);
    try {
        await deleteJournalEntry(entryId);
    } finally {
        deleteEntryInFlight = false;
    }
    var list = document.getElementById('entryList');
    if (list && typeof list.focus === 'function') list.focus();
}
function hashPasscode(p) {
    return Promise.resolve(btoa(unescape(encodeURIComponent(p))));
}
function confirmDeleteAll() {
    var err = document.getElementById('deleteAllModalError');
    db.appState.get('passcodeHash').then(function(row) {
        var hasPasscode = !!(row && row.value);
        if (hasPasscode) {
            var input = document.getElementById('deleteAllPassword').value;
            hashPasscode(input).then(function(h) {
                if (h !== row.value) {
                    err.textContent = 'Incorrect passcode';
                    err.classList.add('show');
                    return;
                }
                clearAllData().catch(function(e) { console.error(e); });
            });
        } else {
            if (document.getElementById('deleteAllTypeConfirm').value.trim() !== 'DELETE') {
                err.textContent = 'Type DELETE to confirm';
                err.classList.add('show');
                return;
            }
            clearAllData().catch(function(e) { console.error(e); });
        }
    });
}
async function clearAllData() {
    console.log('Deleting all data...');
    closeDeleteAllModal();
    try {
        await db.entries.clear();
        await db.appState.clear();
        await db.backupMeta.clear();
        if (db.backups) await db.backups.clear();
    } catch (e) {
        console.error('IndexedDB clear error:', e);
    }
    try {
        localStorage.clear();
    } catch (e) {
        console.error('localStorage clear error:', e);
    }
    entries = {};
    invalidateDailySummaryCache();
    if (typeof renderHeatmap === 'function') renderHeatmap();
    if (typeof renderEntryList === 'function') renderEntryList();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderCharts === 'function') renderCharts();
    if (typeof generateInsights === 'function') generateInsights();
    try {
        var count = await db.entries.count();
        console.log('Entries after clear:', count);
    } catch (e) {}
    location.reload();
}

function applyTheme(themeName, dark) {
    document.documentElement.setAttribute('data-theme', themeName || 'aura');
    document.documentElement.setAttribute('data-dark', dark ? 'true' : 'false');
    localStorage.setItem('auraTheme', themeName || 'aura');
    localStorage.setItem('auraDark', dark ? 'true' : 'false');
    if (typeof renderCharts === 'function') renderCharts();
}
async function saveThemeToDb(themeName, dark) {
    await db.appState.put({ key: 'theme', value: themeName || 'aura' });
    await db.appState.put({ key: 'darkMode', value: !!dark });
}
function setTheme(name) {
    var dark = document.documentElement.getAttribute('data-dark') === 'true';
    applyTheme(name, dark);
    saveThemeToDb(name, dark);
    var sel = document.getElementById('themeSelect');
    if (sel) sel.value = name;
}
function toggleDark() {
    var dark = document.documentElement.getAttribute('data-dark') !== 'true';
    applyTheme(document.documentElement.getAttribute('data-theme') || 'aura', dark);
    saveThemeToDb(document.documentElement.getAttribute('data-theme'), dark);
    syncDarkToggleButtons();
}
function toggleDarkFromPage() {
    toggleDark();
}
function syncDarkToggleButtons() {
    var dark = document.documentElement.getAttribute('data-dark') === 'true';
    [ 'darkModeToggle', 'darkModeTogglePage' ].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.setAttribute('aria-pressed', dark);
    });
}

document.getElementById('darkModeToggle').addEventListener('click', toggleDark);

document.getElementById('photoInput').addEventListener('change', function(e) {
    const files = e.target.files;
    if (!files || !files.length) return;
    pendingPhotos = [];
    const preview = document.getElementById('photoPreviews');
    preview.innerHTML = '';
    for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const r = new FileReader();
        r.onload = function() {
            pendingPhotos.push(r.result);
            const img = document.createElement('img');
            img.src = r.result;
            img.alt = 'Photo preview';
            img.loading = 'lazy';
            preview.appendChild(img);
        };
        r.readAsDataURL(f);
    }
});

async function loadAllEntries() {
    if (!db || !db.entries) { entries = {}; return; }
    try {
        const list = await db.entries.toArray();
        entries = {};
        invalidateDailySummaryCache();
        var migrated = [];
        list.forEach(function(raw) {
            var normalized = normalizeDailyRecord(raw);
            if (!normalized) return;
            entries[normalized.date] = normalized;
            if (
                raw.recordType !== 'dailyRecord' ||
                raw.schemaVersion !== 1 ||
                raw.id !== normalized.date ||
                raw.journal !== normalized.journal ||
                raw.notes !== normalized.journal ||
                !Array.isArray(raw.sleepSegments)
            ) {
                migrated.push(serializeDailyRecord(normalized));
            }
        });
        if (migrated.length) {
            await db.entries.bulkPut(migrated);
        }
    } catch (e) {
        console.error('[Aura Mood] loadAllEntries failed:', e);
        entries = {};
    }
}

async function migrateFromLocalStorage() {
    try {
        const stored = localStorage.getItem("auraEntries");
        if (!stored) return;
        const old = JSON.parse(stored);
        const toPut = [];
        for (const date of Object.keys(old)) {
            const o = old[date];
            toPut.push(serializeDailyRecord(normalizeDailyRecord({
                id: date,
                date: date,
                mood: o.mood,
                sleep: o.sleep,
                sleepQuality: o.sleepQuality,
                sleepTime: o.sleepTime || '23:00',
                wakeTime: o.wakeTime || '07:00',
                energy: o.energy,
                activities: o.activities || [],
                journal: o.journal != null ? o.journal : (o.notes || ''),
                tags: o.tags || [],
                photos: o.photos || []
            }, date)));
        }
        if (toPut.length) {
            await db.entries.bulkPut(toPut);
            await loadAllEntries();
        }
        localStorage.removeItem("auraEntries");
    } catch (e) { console.warn('Migration skipped', e); }
}

const SAMPLE_ACTIVITIES = ['exercise', 'meditation', 'reading', 'cooking', 'socializing', 'walking', 'work', 'yoga', 'music', 'studying'];
const SAMPLE_TAGS = ['productive', 'tired', 'happy', 'stressed', 'relaxed', 'focused', 'anxious', 'grateful', 'motivated', 'social'];
const SAMPLE_NOTES = ['Good day overall', 'Felt balanced', 'Busy but okay', 'Restful evening', 'Productive morning'];
function pick(arr, minCount, maxCount) {
    var n = minCount + Math.floor(Math.random() * (maxCount - minCount + 1));
    var copy = arr.slice();
    for (var i = copy.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = copy[i]; copy[i] = copy[j]; copy[j] = t;
    }
    return copy.slice(0, Math.min(n, copy.length));
}
async function addSampleData() {
    var today = new Date().toISOString().split('T')[0];
    var existing = await db.entries.get(today);
    var start = new Date();
    start.setDate(start.getDate() - 90);
    var toPut = [];
    for (var d = 0; d < 90; d++) {
        var date = new Date(start);
        date.setDate(date.getDate() + d);
        var dateStr = date.toISOString().split('T')[0];
        if (dateStr === today && existing) continue;
        var dayOfWeek = date.getDay();
        var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        var dayIndex = d;
        var trend = 0.015 * dayIndex;
        var baseMood = 5.5 + trend + (Math.random() * 2 - 1);
        if (Math.random() < 0.1) baseMood = 2 + Math.random() * 2;
        else if (isWeekend) baseMood += 0.5 + Math.random() * 0.5;
        // Select activities first — some boost mood significantly
        var activities = pick(SAMPLE_ACTIVITIES, 1, 3);
        var tags = pick(SAMPLE_TAGS, 0, 2);
        // Activity effects on mood (for detectable correlations)
        if (activities.indexOf('exercise') >= 0) baseMood += 0.8 + Math.random() * 0.4;
        if (activities.indexOf('meditation') >= 0) baseMood += 0.5 + Math.random() * 0.3;
        if (activities.indexOf('yoga') >= 0) baseMood += 0.6 + Math.random() * 0.3;
        if (activities.indexOf('socializing') >= 0) baseMood += 0.4 + Math.random() * 0.5;
        if (activities.indexOf('studying') >= 0) baseMood -= 0.3 + Math.random() * 0.3;
        // Tag effects
        if (tags.indexOf('stressed') >= 0) baseMood -= 0.9 + Math.random() * 0.5;
        if (tags.indexOf('anxious') >= 0) baseMood -= 0.7 + Math.random() * 0.4;
        if (tags.indexOf('grateful') >= 0) baseMood += 0.6 + Math.random() * 0.3;
        if (tags.indexOf('happy') >= 0) baseMood += 0.5 + Math.random() * 0.3;
        var mood = Math.max(1, Math.min(10, Math.round(baseMood * 10) / 10));
        // Sleep: derive from realistic overnight segment(s); never use random sleepHours for the record
        var desiredDurationHours = isWeekend
            ? 7.5 + Math.random() * 1.5
            : 6.0 + Math.random() * 1.5;
        if (Math.random() < 0.15) desiredDurationHours = 4.5 + Math.random() * 1;
        desiredDurationHours = Math.max(5, Math.min(10, desiredDurationHours));
        var desiredDurationMins = Math.round(desiredDurationHours * 60);
        // Sleep time in evening/night: 21:00–00:30 (21*60 to 0*60+30)
        var sleepMins = 21 * 60 + Math.floor(Math.random() * (3 * 60 + 31));
        if (sleepMins >= 24 * 60) sleepMins -= 24 * 60;
        var sh = Math.floor(sleepMins / 60), sm = sleepMins % 60;
        var sleepTime = (sh < 10 ? '0' : '') + sh + ':' + (sm < 10 ? '0' : '') + sm;
        // Wake = sleep + duration (cross midnight)
        var wakeMins = sleepMins + desiredDurationMins;
        if (wakeMins >= 24 * 60) wakeMins -= 24 * 60;
        var wh = Math.floor(wakeMins / 60), wm = wakeMins % 60;
        var wakeTime = (wh < 10 ? '0' : '') + wh + ':' + (wm < 10 ? '0' : '') + wm;
        var sleepSegments = [{ start: sleepTime, end: wakeTime }];
        var totals = computeSleepTotalsFromSegments(sleepSegments);
        var sleepTotalHours = totals && !totals.error ? totals.totalHours : desiredDurationHours;
        sleepTotalHours = clampSleepTotal(sleepTotalHours);
        if (sleepTotalHours != null) sleepTotalHours = Math.round(sleepTotalHours * 10) / 10;
        else sleepTotalHours = Math.round(desiredDurationHours * 10) / 10;
        var sleepQuality = Math.floor(4 + (sleepTotalHours - 5) / 4 * 5 + Math.random() * 2);
        sleepQuality = Math.max(1, Math.min(10, sleepQuality));
        // Energy: use computed sleep total
        var energy = mood * 0.65 + (sleepTotalHours - 5) * 0.4 + Math.random() * 2 - 0.5;
        energy = Math.max(1.5, Math.min(10, energy));
        energy = Math.round(energy * 10) / 10;
        var notes = Math.random() < 0.2 ? SAMPLE_NOTES[Math.floor(Math.random() * SAMPLE_NOTES.length)] : '';
        toPut.push(serializeDailyRecord(normalizeDailyRecord({
            id: dateStr,
            date: dateStr,
            mood: mood,
            sleep: sleepTotalHours,
            sleepQuality: sleepQuality,
            sleepTime: sleepTime,
            wakeTime: wakeTime,
            sleepSegments: sleepSegments,
            energy: energy,
            customMetrics: {},
            activities: activities,
            journal: notes,
            tags: tags,
            photos: []
        }, dateStr)));
    }
    await db.entries.bulkPut(toPut);
    await loadAllEntries();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof renderCharts === 'function') renderCharts();
    if (typeof renderHeatmap === 'function') renderHeatmap();
    if (typeof generateInsights === 'function') generateInsights(true);
    showToast('90 days of sample data added ✓');
}

async function initStorage() {
    try {
        console.log('[Aura] App starting');
        if (!db) { console.warn('[Aura] No database, skipping init'); return; }
        await migrateFromLocalStorage();
        console.log('[Aura] Database ready');
        await loadAllEntries();
        console.log('[Aura] Entries loaded');
        await migrateLegacyJournalAppState();
        var themeRow = await db.appState.get('theme');
    var darkRow = await db.appState.get('darkMode');
    var themeName = (themeRow && themeRow.value) ? themeRow.value : 'sunset';
    var dark = (darkRow && darkRow.value !== undefined) ? !!darkRow.value : true;
    applyTheme(themeName, dark);
    var sel = document.getElementById('themeSelect');
    if (sel) sel.value = themeName;
    document.documentElement.setAttribute('data-dark', dark ? 'true' : 'false');
    localStorage.setItem('auraDark', dark ? 'true' : 'false');
    if (!themeRow || !themeRow.value) await db.appState.put({ key: 'theme', value: 'sunset' });
    if (darkRow === undefined || darkRow.value === undefined) await db.appState.put({ key: 'darkMode', value: true });
    syncDarkToggleButtons();
    var soundRow = await db.appState.get('soundEnabled');
    window.auraSoundEnabled = !!(soundRow && soundRow.value);
    var soundToggle = document.getElementById('soundEnabledToggle');
    if (soundToggle) soundToggle.checked = window.auraSoundEnabled;
    var particlesRow = await db.appState.get('particlesEnabled');
    var particlesOn = (particlesRow && particlesRow.value !== undefined) ? !!particlesRow.value : true;
    if (particlesRow === undefined || particlesRow.value === undefined) await db.appState.put({ key: 'particlesEnabled', value: true });
    var particlesToggle = document.getElementById('particlesEnabledToggle');
    if (particlesToggle) particlesToggle.checked = particlesOn;
    var particlesWrap = document.getElementById('ambientParticles');
    if (particlesWrap) particlesWrap.style.display = particlesOn ? 'block' : 'none';
    if (particlesOn) startAmbientParticles();
    var parallaxRow = await db.appState.get('parallaxEnabled');
    var parallaxOn = !!(parallaxRow && parallaxRow.value);
    var parallaxToggle = document.getElementById('parallaxEnabledToggle');
    if (parallaxToggle) parallaxToggle.checked = parallaxOn;
    document.body.classList.toggle('parallax', parallaxOn);
    if (parallaxOn) {
        updateParallax();
        if (!parallaxScrollHandler) {
            parallaxScrollHandler = function() { updateParallax(); };
            window.addEventListener('scroll', parallaxScrollHandler, { passive: true });
        }
    }
    var dateFmt = await getPreference('dateFormat');
    var timeFmt = await getPreference('timeFormat');
    window.auraDateFormat = (dateFmt === 'DM' || dateFmt === 'MD' || dateFmt === 'YMD') ? dateFmt : 'MD';
    window.auraTimeFormat = (timeFmt === '12' || timeFmt === '24') ? timeFmt : '12';
    checkDailyBackup();
    const lastBackup = await db.backupMeta.get('lastBackup');
    const el = document.getElementById('lastBackupDate');
    if (el) el.textContent = lastBackup ? formatDisplayDateTime(lastBackup.value, window.auraDateFormat, window.auraTimeFormat) : 'Never';
    var passcodeRow = await db.appState.get('passcodeHash');
    var encRow = await db.appState.get('encryptEntries');
    var privRow = await db.appState.get('privateMode');
    var retRow = await db.appState.get('dataRetention');
    var passcodeEl = document.getElementById('passcodeLockEnabled');
    if (passcodeEl) passcodeEl.checked = !!(passcodeRow && passcodeRow.value);
    var encEl = document.getElementById('encryptEntriesToggle');
    if (encEl) encEl.checked = !!(encRow && encRow.value);
    var privEl = document.getElementById('privateModeToggle');
    if (privEl) privEl.checked = !!(privRow && privRow.value);
    window.auraPrivateMode = !!(privRow && privRow.value);
    var retEl = document.getElementById('dataRetention');
    if (retEl && retRow && retRow.value) retEl.value = retRow.value;
    await applyDataRetention();
    var reduceMotionRow = await db.appState.get('pref_reduceMotion');
    applyReduceMotion(!!(reduceMotionRow && reduceMotionRow.value));
    var chartDaysRow = await db.appState.get('pref_chartDays');
    window.auraChartDays = (chartDaysRow && chartDaysRow.value) ? parseInt(chartDaysRow.value, 10) : 30;
    applyDashboardLayout();
    if (passcodeRow && passcodeRow.value) {
        document.getElementById('passcodeLockScreen').style.display = 'flex';
        document.getElementById('passcodeLockScreen').setAttribute('aria-hidden', 'false');
    }
        console.log('[Aura] Init storage complete');
    } catch (err) {
        console.error('[Aura] initStorage failed:', err);
    }
}

document.addEventListener('keydown', function(e) {
    if (isDeleteEntryModalOpen()) {
        if (e.key === 'Escape') {
            e.preventDefault();
            closeDeleteEntryModal();
            return;
        }
        if (e.key === 'Tab') {
            var focusables = getDeleteEntryModalFocusableElements();
            if (!focusables.length) {
                e.preventDefault();
                return;
            }
            var first = focusables[0];
            var last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
                return;
            }
            if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
                return;
            }
        }
    }
    if (e.metaKey || e.ctrlKey) {
        if (e.key === 's') {
            e.preventDefault();
            /* Unified save: full Daily Check-In including journal (#notes), from anywhere on entry page. */
            if (document.getElementById('entry').classList.contains('active')) saveEntry();
            return;
        }
        if (e.key === 'z') {
            e.preventDefault();
            if (document.getElementById('entry').classList.contains('active') && document.activeElement && document.activeElement.closest('.form')) {
                if (e.shiftKey) entryRedo();
                else entryUndo();
            }
            return;
        }
    }
});
window.addEventListener('beforeunload', function(e) {
    if (!journalDirty && !entryDirty) return;
    e.preventDefault();
    e.returnValue = journalDirty ? 'You have unsaved journal changes. Leave without saving?' : 'You have unsaved changes. Leave without saving?';
    return e.returnValue;
});

var entryHistoryDebounce;
function schedulePushHistory() {
    clearTimeout(entryHistoryDebounce);
    entryHistoryDebounce = setTimeout(pushEntryHistory, 800);
}

(function setupEntryFormHistory() {
    var form = document.getElementById('entry');
    if (!form) return;
    form.addEventListener('input', schedulePushHistory);
    form.addEventListener('change', schedulePushHistory);
})();

// Analytics chart renderer per page. Circadian and correlations are called only after page activation (see navigate); do not change that timing for presentation fixes.
function renderAnalyticsCharts(page) {
    if (page === 'circadian') console.log('[debug] renderAnalyticsCharts: page=circadian, calling renderMoodVelocity');
    if (page === 'correlations') console.log('[debug] renderAnalyticsCharts: page=correlations, calling renderCorrelations');
    if (page === 'mood') {
        if (typeof renderMoodChart === 'function') renderMoodChart();
        if (typeof renderMoodVelocityChart === 'function') renderMoodVelocityChart();
    }
    if (page === 'correlations') {
        if (typeof renderCorrelations === 'function') renderCorrelations();
    }
    if (page === 'circadian') {
        if (typeof renderMoodVelocity === 'function') renderMoodVelocity();
    }
    if (page === 'sleep') {
        if (typeof renderSleepChart === 'function') renderSleepChart();
    }
    if (page === 'energy') {
        if (typeof renderEnergyChart === 'function') renderEnergyChart();
    }
}

function navigate(page, button) {
    closeSidebar();
    var pageEl = document.getElementById(page);
    if (!pageEl) return;
    var activePage = document.querySelector('.page.active');
    if (activePage && activePage.id === 'entry' && page !== 'entry') {
        if (!confirmDiscardEntryChanges()) return;
        if (entryDirty) discardEntryUnsavedChanges();
    }
    if (activePage && activePage.id === 'journal' && page !== 'journal') {
        if (!confirmDiscardJournalChanges()) return;
        if (journalDirty) openJournalEntry(getWorkingEntryDate(), { force: true });
    }
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    document.querySelectorAll('.nav').forEach(function(n) { n.classList.remove('active'); });
    pageEl.classList.add('active');
    if (button) button.classList.add('active');
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    document.querySelectorAll('.bottom-nav button[data-page]').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-page') === page);
    });
    document.querySelectorAll('.mobile-nav-item').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-page') === page);
    });
    document.querySelectorAll('.sidebar .nav').forEach(function(btn) {
        if (btn.classList.contains('active')) btn.setAttribute('aria-current', 'page');
        else btn.removeAttribute('aria-current');
    });

    if (page === 'circadian') console.log('[debug] navigating to circadian');
    if (page === 'correlations') console.log('[debug] navigating to correlations');
    // Circadian/correlations: double rAF after 60ms so the page is visible before measuring; hidden-page rendering was fragile. Do not change this for styling.
    function runAnalyticsCharts() {
        if (page === 'circadian' || page === 'correlations') {
            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    renderAnalyticsCharts(page);
                });
            });
        } else {
            setTimeout(function() { renderAnalyticsCharts(page); }, 60);
        }
    }
    setTimeout(runAnalyticsCharts, 60);

    if (page === 'dashboard') {
        updateDashboard();
        renderCharts();
        generateInsights();
    } else if (page === 'mood') {
        renderCharts();
        generateInsights();
    } else if (page === 'correlations') {
        // Chart render via renderAnalyticsCharts (setTimeout 60)
    } else if (page === 'circadian') {
        // Chart render via renderAnalyticsCharts (setTimeout 60)
    } else if (page === 'predictions') {
        loadTensorFlow().then(function() { renderPredictions(); }).catch(function() { renderPredictions(); });
    } else if (page === 'patterns') {
        renderRadarChart();
        renderDistributionChart();
        renderSleepTimeline();
        renderTimeHeatmap();
        renderDayOfWeekChart();
    } else if (page === 'entry') {
        (renderCustomMetricsInEntryForm() || Promise.resolve()).then(function() {
            var activeDate = getWorkingEntryDate();
            return Promise.all([
                Promise.resolve(activeDate),
                loadDraft(activeDate),
                db.appState.get('defaultSleepTime'),
                db.appState.get('defaultWakeTime')
            ]);
        }).then(function(results) {
            var activeDate = results[0];
            var draftState = results[1];
            var defaultSleep = results[2] && results[2].value;
            var defaultWake = results[3] && results[3].value;
            loadEntryIntoCheckInForm(activeDate, {
                draftState: draftState,
                defaultSleepTime: defaultSleep,
                defaultWakeTime: defaultWake
            });
            setEntryDirty(!!draftState);
            pushEntryHistory();
            updateUndoRedoButtons();
            updateEntryProgressUI();
            updateSupportRail();
        });
        initEntrySectionState();
        startDraftAutoSave();
        renderTagSuggestions();
    } else if (page === 'calendar') {
        setCalendarView(calendarViewState || 'year');
        renderCalendarCurrentView();
    }
    else if (page === 'journal') {
        if (!quillEditor) initJournalEditor();
        else ensureJournalEntrySelection(false);
        renderTagCloud();
        renderEntryList();
    }
    else if (page === 'settings') {
        loadPreferencesIntoUI();
        renderCustomMetricsList();
        var sel = document.getElementById('themeSelect');
        if (sel) sel.value = document.documentElement.getAttribute('data-theme') || 'aura';
        syncDarkToggleButtons();
    }
    else if (page === 'data') {
        updateLastBackupDisplay();
        renderBackupList();
    } else if (page === 'seasonal') {
        renderSeasonal();
        renderYearOverYear();
        var from = document.getElementById('customRangeFrom');
        var to = document.getElementById('customRangeTo');
        if (from && to) {
            if (!from.value) {
                var t = new Date();
                to.value = t.toISOString().split('T')[0];
                t.setDate(t.getDate() - 30);
                from.value = t.toISOString().split('T')[0];
            }
            renderCustomRangeChart();
        }
    } else if (page === 'reports') {
        setReportTab(reportTabState || 'weekly');
        renderReportsContent();
    } else if (page === 'insights') {
        generateInsights();
    }
}

function openSidebar() {
    var sb = document.querySelector('.sidebar');
    var ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.add('open');
    if (ov) { ov.classList.add('show'); ov.setAttribute('aria-hidden', 'false'); }
    document.body.style.overflow = 'hidden';
}
function closeSidebar() {
    var sb = document.querySelector('.sidebar');
    var ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.remove('open');
    if (ov) { ov.classList.remove('show'); ov.setAttribute('aria-hidden', 'true'); }
    document.body.style.overflow = '';
}
function navigateFromBottom(page, btn) {
    var navBtn = document.querySelector('.nav[onclick*="' + page + '"]');
    navigate(page, navBtn || null);
}
(function() {
    var mobileNav = document.querySelector('.mobile-nav');
    if (!mobileNav) return;
    mobileNav.addEventListener('click', function(e) {
        var item = e.target.closest('.mobile-nav-item');
        if (!item) return;
        var page = item.getAttribute('data-page');
        if (!page) return;
        var navBtn = document.querySelector('.sidebar .nav[onclick*="' + page + '"]');
        navigate(page, navBtn || null);
    });
})();

var pullStartY = 0;
function setupPullToRefresh() {
    var main = document.querySelector('main');
    if (!main) return;
    main.addEventListener('touchstart', function(e) {
        if (main.scrollTop === 0) pullStartY = e.touches[0].clientY;
    }, { passive: true });
    main.addEventListener('touchend', function(e) {
        if (main.scrollTop !== 0) return;
        var endY = e.changedTouches[0].clientY;
        if (endY - pullStartY > 80) {
            pullStartY = 0;
            refreshAppData();
        }
    }, { passive: true });
}
function refreshAppData() {
    loadAllEntries().then(function() {
        updateDashboard();
        if (typeof renderCharts === 'function') renderCharts();
        if (typeof renderHeatmap === 'function') renderCalendarCurrentView();
        if (typeof renderEntryList === 'function') renderEntryList();
        if (typeof generateInsights === 'function') generateInsights(true);
        showToast('Refreshed');
    });
}
setupPullToRefresh();

var SWIPEABLE_PAGES = ['dashboard', 'entry', 'calendar', 'journal'];
var touchStartX = 0, touchStartY = 0, touchStartTime = 0;
function setupSwipeNavigate() {
    var main = document.querySelector('main');
    if (!main) return;
    main.addEventListener('touchstart', function(e) {
        if (e.target.closest('.entry-list-item, .modal-overlay, .entry-modal-overlay, .search-modal-overlay')) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
    }, { passive: true });
    main.addEventListener('touchend', function(e) {
        if (e.target.closest('.entry-list-item, .modal-overlay, .entry-modal-overlay, .search-modal-overlay')) return;
        var endX = e.changedTouches[0].clientX;
        var endY = e.changedTouches[0].clientY;
        var dx = endX - touchStartX;
        var dy = endY - touchStartY;
        if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx)) return;
        var activePage = document.querySelector('.page.active');
        if (!activePage) return;
        var id = activePage.id;
        var idx = SWIPEABLE_PAGES.indexOf(id);
        if (idx === -1) return;
        var nextBtn = null;
        if (dx > 60 && idx > 0) {
            nextBtn = document.querySelector('.nav[onclick*="' + SWIPEABLE_PAGES[idx - 1] + '"]');
            if (nextBtn) navigate(SWIPEABLE_PAGES[idx - 1], nextBtn);
        } else if (dx < -60 && idx < SWIPEABLE_PAGES.length - 1) {
            nextBtn = document.querySelector('.nav[onclick*="' + SWIPEABLE_PAGES[idx + 1] + '"]');
            if (nextBtn) navigate(SWIPEABLE_PAGES[idx + 1], nextBtn);
        }
    }, { passive: true });
}
setupSwipeNavigate();

function setupModalSwipeDismiss() {
    document.querySelectorAll('.modal-overlay, .entry-modal-overlay, .search-modal-overlay').forEach(function(overlay) {
        var startY = 0;
        overlay.addEventListener('touchstart', function(e) {
            if (e.target !== overlay) return;
            startY = e.touches[0].clientY;
        }, { passive: true });
        overlay.addEventListener('touchend', function(e) {
            if (e.target !== overlay) return;
            var endY = e.changedTouches[0].clientY;
            if (endY - startY > 80) {
                if (overlay.id === 'deleteAllModal') closeDeleteAllModal();
                else if (overlay.id === 'deleteEntryModal') closeDeleteEntryModal();
                else if (overlay.id === 'importPreviewModal') closeImportPreviewModal();
                else if (overlay.id === 'searchModal') overlay.classList.remove('show');
                else if (overlay.id === 'entryModal') closeEntryModal();
                else if (overlay.id === 'fullEntryDeleteModal') closeFullEntryDeleteModal();
            }
        }, { passive: true });
    });
}
setupModalSwipeDismiss();

var entrySwipeStartX = 0;
function setupEntryListTouch() {
    var ul = document.getElementById('entryList');
    if (!ul) return;
    ul.querySelectorAll('.entry-list-item').forEach(function(li) {
        var row = li.querySelector('.entry-row-content');
        if (!row) return;
        var date = li.getAttribute('data-date');
        var longPressTimer = null;
        li.addEventListener('touchstart', function(e) {
            entrySwipeStartX = e.touches[0].clientX;
            longPressTimer = setTimeout(function() {
                longPressTimer = null;
                showEntryContextMenu(e.touches[0].clientX, e.touches[0].clientY, date);
            }, 500);
        }, { passive: true });
        li.addEventListener('touchmove', function(e) {
            if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null; }
            var x = e.touches[0].clientX;
            var dx = x - entrySwipeStartX;
            if (dx < 0) row.style.transform = 'translateX(' + Math.max(dx, -72) + 'px)';
        }, { passive: true });
        li.addEventListener('touchend', function(e) {
            if (longPressTimer) clearTimeout(longPressTimer);
            var endX = e.changedTouches[0].clientX;
            var dx = endX - entrySwipeStartX;
            if (dx < -50) row.style.transform = 'translateX(-72px)';
            else row.style.transform = '';
        }, { passive: true });
        li.addEventListener('click', function(e) {
            if (contextMenuJustShown) return;
            if (!e.target.closest('.entry-delete, .context-menu')) showEntryModalFromJournal(date);
        });
    });
}
var contextMenuJustShown = false;
function showEntryContextMenu(x, y, dateStr) {
    contextMenuJustShown = true;
    setTimeout(function() { contextMenuJustShown = false; }, 400);
    var existing = document.getElementById('contextMenu');
    if (existing) existing.remove();
    var menu = document.createElement('div');
    menu.id = 'contextMenu';
    menu.className = 'context-menu';
    menu.style.left = Math.min(x, window.innerWidth - 160) + 'px';
    menu.style.top = Math.min(y, window.innerHeight - 120) + 'px';
    menu.innerHTML = '<button type="button" onclick="openJournalEntry(\'' + dateStr.replace(/'/g, "\\'") + '\'); closeContextMenu()">Open journal</button><button type="button" class="danger" onclick="openDeleteEntryModal(\'' + dateStr.replace(/'/g, "\\'") + '\'); closeContextMenu()">Delete journal</button>';
    document.body.appendChild(menu);
    var close = function() { menu.remove(); document.removeEventListener('click', close); document.removeEventListener('touchstart', close); };
    setTimeout(function() { document.addEventListener('click', close); document.addEventListener('touchstart', close, { once: true }); }, 100);
}
function closeContextMenu() {
    var m = document.getElementById('contextMenu');
    if (m) m.remove();
}

function hideSplash() {
    if (typeof window.hideSplash === 'function') window.hideSplash();
    else {
        var splash = document.getElementById('splash');
        if (splash && !splash.classList.contains('hide')) {
            splash.classList.add('hide');
            setTimeout(function() { splash.setAttribute('aria-hidden', 'true'); }, 520);
        }
    }
}

(function runSplash() {
    try {
        var splash = document.getElementById('splash');
        if (!splash) return;
        if (!splash.classList.contains('hide')) splash.removeAttribute('aria-hidden');
        setTimeout(function() { if (window.hideSplash) window.hideSplash(); }, 2600);
    } catch (e) { if (typeof window.hideSplash === 'function') window.hideSplash(); }
})();

(function initAuraDatePicker() {
    var picker = document.getElementById('auraDatePicker');
    if (!picker) return;
    var currentInput = null;
    var viewYear = 0, viewMonth = 0;
    function toYMD(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
    function parseValue(v) {
        if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
        var p = v.split('-').map(Number);
        return new Date(p[0], p[1] - 1, p[2]);
    }
    function buildPickerDOM() {
        var loc = typeof getLocale === 'function' ? getLocale() : 'en';
        var WDAYS = typeof getLocaleWeekdayNames === 'function' ? getLocaleWeekdayNames(loc, getFirstDayOfWeek()) : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        var strings = typeof getLocaleStrings === 'function' ? getLocaleStrings(loc) : { clear: 'Clear', today: 'Today' };
        picker.innerHTML = '<div class="aura-dp-header"><span class="aura-dp-title" id="auraDpTitle"></span><div class="aura-dp-nav"><button type="button" class="aura-dp-nav-btn" id="auraDpPrev" aria-label="Previous month">&lsaquo;</button><button type="button" class="aura-dp-nav-btn" id="auraDpNext" aria-label="Next month">&rsaquo;</button></div></div><div class="aura-dp-weekdays">' + WDAYS.map(function(w){ return '<span>' + w + '</span>'; }).join('') + '</div><div class="aura-dp-days" id="auraDpDays"></div><div class="aura-dp-footer"><button type="button" class="aura-dp-footer-btn" id="auraDpClear">' + strings.clear + '</button><button type="button" class="aura-dp-footer-btn" id="auraDpToday">' + strings.today + '</button></div>';
    }
    function renderDays() {
        var container = document.getElementById('auraDpDays');
        var titleEl = document.getElementById('auraDpTitle');
        if (!container || !titleEl) return;
        var loc = typeof getLocale === 'function' ? getLocale() : 'en';
        var MONTHS = typeof getLocaleMonthNames === 'function' ? getLocaleMonthNames(loc, true) : ['January','February','March','April','May','June','July','August','September','October','November','December'];
        titleEl.textContent = MONTHS[viewMonth] + ' ' + viewYear;
        var first = new Date(viewYear, viewMonth, 1);
        var last = new Date(viewYear, viewMonth + 1, 0);
        var start = new Date(first);
        var dow = first.getDay();
        var firstDay = typeof getFirstDayOfWeek === 'function' ? getFirstDayOfWeek() : 1;
        var diff = (dow - firstDay + 7) % 7;
        start.setDate(first.getDate() - diff);
        var raw = currentInput ? getDateInputValue(currentInput) : '';
        var selected = raw ? parseValue(raw) : null;
        var today = new Date();
        today.setHours(0,0,0,0);
        var html = '';
        for (var i = 0; i < 42; i++) {
            var d = new Date(start);
            d.setDate(start.getDate() + i);
            var y = d.getFullYear(), m = d.getMonth(), day = d.getDate();
            var isOther = m !== viewMonth;
            var isToday = d.getTime() === today.getTime();
            var isSel = selected && selected.getFullYear() === y && selected.getMonth() === m && selected.getDate() === day;
            var cls = 'aura-dp-day';
            if (isOther) cls += ' other-month';
            if (isToday) cls += ' today';
            if (isSel) cls += ' selected';
            var ymd = toYMD(d);
            html += '<button type="button" class="' + cls + '" data-ymd="' + ymd + '">' + day + '</button>';
        }
        container.innerHTML = html;
        container.querySelectorAll('.aura-dp-day').forEach(function(btn) {
            btn.addEventListener('click', function() {
                if (currentInput) { setDateInputDisplay(currentInput, this.getAttribute('data-ymd')); currentInput.dispatchEvent(new Event('change', { bubbles: true })); }
                closePicker();
            });
        });
    }
    function openPicker(input) {
        currentInput = input;
        var raw = getDateInputValue(input);
        var val = raw ? parseValue(raw) : null;
        var d = val || new Date();
        viewYear = d.getFullYear();
        viewMonth = d.getMonth();
        buildPickerDOM();
        renderDays();
        document.getElementById('auraDpPrev').addEventListener('click', function() {
            viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; }
            renderDays();
        });
        document.getElementById('auraDpNext').addEventListener('click', function() {
            viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; }
            renderDays();
        });
        document.getElementById('auraDpToday').addEventListener('click', function() {
            if (currentInput) { setDateInputDisplay(currentInput, toYMD(new Date())); currentInput.dispatchEvent(new Event('change', { bubbles: true })); }
            closePicker();
        });
        document.getElementById('auraDpClear').addEventListener('click', function() {
            if (currentInput) { currentInput.removeAttribute('data-aura-date'); currentInput.value = ''; currentInput.dispatchEvent(new Event('change', { bubbles: true })); }
            closePicker();
        });
        picker.setAttribute('aria-hidden', 'false');
        picker.style.display = 'block';
        var rect = input.getBoundingClientRect();
        var pickerRect = picker.getBoundingClientRect();
        var left = rect.left;
        var top = rect.bottom + 6;
        if (top + pickerRect.height > window.innerHeight) top = rect.top - pickerRect.height - 6;
        if (left + pickerRect.width > window.innerWidth) left = window.innerWidth - pickerRect.width - 12;
        if (left < 12) left = 12;
        picker.style.left = left + 'px';
        picker.style.top = top + 'px';
    }
    function closePicker() {
        picker.setAttribute('aria-hidden', 'true');
        picker.style.display = 'none';
        currentInput = null;
    }
    document.addEventListener('click', function(e) {
        if (e.target.closest('.aura-date-input')) {
            e.preventDefault();
            openPicker(e.target.closest('.aura-date-input'));
        } else if (!e.target.closest('#auraDatePicker') && picker.getAttribute('aria-hidden') === 'false') {
            closePicker();
        }
    });
    document.querySelectorAll('.aura-date-input').forEach(function(inp) {
        inp.addEventListener('blur', function() {
            var v = getDateInputValue(this);
            if (v) setDateInputDisplay(this, v);
            else {
                var prev = this.getAttribute('data-aura-date');
                if (prev) setDateInputDisplay(this, prev);
                else { this.value = ''; this.removeAttribute('data-aura-date'); }
            }
        });
    });
})();

(function initAuraTimePicker() {
    var picker = document.getElementById('auraTimePicker');
    if (!picker) return;
    var currentInput = null;
    var currentHour = 0, currentMinute = 0;
    var currentPeriod = 'AM';
    function pad(n) { return String(n).padStart(2, '0'); }
    function parseTime(v) {
        if (!v || typeof v !== 'string') return { h: 0, m: 0 };
        var parts = v.trim().split(':');
        var h = parseInt(parts[0], 10);
        var m = parts[1] ? parseInt(parts[1], 10) : 0;
        if (isNaN(h)) h = 0; if (isNaN(m)) m = 0;
        h = Math.max(0, Math.min(23, h)); m = Math.max(0, Math.min(59, m));
        return { h: h, m: m };
    }
    function buildPicker() {
        var is12 = (window.auraTimeFormat || '12') === '12';
        var html = '<div class="aura-tp-header"><p class="aura-tp-title">Select time</p>' +
            '<div class="aura-tp-ampm"' + (is12 ? '' : ' style="display:none"') + '>' +
            '<button type="button" id="auraTpAm" class="aura-tp-ampm-btn' + (currentPeriod === 'AM' ? ' selected' : '') + '">AM</button>' +
            '<button type="button" id="auraTpPm" class="aura-tp-ampm-btn' + (currentPeriod === 'PM' ? ' selected' : '') + '">PM</button>' +
            '</div></div>' +
            '<div class="aura-tp-columns"><div class="aura-tp-col" id="auraTpHours"></div><div class="aura-tp-col" id="auraTpMinutes"></div></div>';
        picker.innerHTML = html;
        var hoursEl = document.getElementById('auraTpHours');
        var minsEl = document.getElementById('auraTpMinutes');
        if (is12) {
            for (var h12 = 1; h12 <= 12; h12++) {
                var btnH = document.createElement('button');
                btnH.type = 'button';
                var displayHour = (currentHour % 12) || 12;
                btnH.className = 'aura-tp-option' + (h12 === displayHour ? ' selected' : '');
                btnH.textContent = pad(h12);
                btnH.setAttribute('data-hour12', h12);
                btnH.addEventListener('click', function() {
                    var hSel = parseInt(this.getAttribute('data-hour12'), 10);
                    if (currentPeriod === 'PM' && hSel !== 12) currentHour = hSel + 12;
                    else if (currentPeriod === 'AM' && hSel === 12) currentHour = 0;
                    else currentHour = hSel;
                    if (currentInput) {
                        setTimeInputDisplay(currentInput, pad(currentHour) + ':' + pad(currentMinute));
                        currentInput.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                    closeTimePicker();
                });
                hoursEl.appendChild(btnH);
            }
        } else {
            for (var h = 0; h < 24; h++) {
                var btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'aura-tp-option' + (h === currentHour ? ' selected' : '');
                btn.textContent = pad(h);
                btn.setAttribute('data-hour', h);
                btn.addEventListener('click', function() {
                    currentHour = parseInt(this.getAttribute('data-hour'), 10);
                    if (currentInput) { setTimeInputDisplay(currentInput, pad(currentHour) + ':' + pad(currentMinute)); currentInput.dispatchEvent(new Event('change', { bubbles: true })); }
                    closeTimePicker();
                });
                hoursEl.appendChild(btn);
            }
        }
        for (var m = 0; m < 60; m++) {
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'aura-tp-option' + (m === currentMinute ? ' selected' : '');
            btn.textContent = pad(m);
            btn.setAttribute('data-minute', m);
            btn.addEventListener('click', function() {
                currentMinute = parseInt(this.getAttribute('data-minute'), 10);
                if (currentInput) { setTimeInputDisplay(currentInput, pad(currentHour) + ':' + pad(currentMinute)); currentInput.dispatchEvent(new Event('change', { bubbles: true })); }
                closeTimePicker();
            });
            minsEl.appendChild(btn);
        }
        if (is12) {
            var amBtn = document.getElementById('auraTpAm');
            var pmBtn = document.getElementById('auraTpPm');
            function updateAmPmButtons() {
                if (!amBtn || !pmBtn) return;
                if (currentPeriod === 'AM') {
                    amBtn.classList.add('selected');
                    pmBtn.classList.remove('selected');
                } else {
                    pmBtn.classList.add('selected');
                    amBtn.classList.remove('selected');
                }
            }
            function updateHourSelection() {
                var hoursElLocal = document.getElementById('auraTpHours');
                if (!hoursElLocal) return;
                var displayHour = (currentHour % 12) || 12;
                hoursElLocal.querySelectorAll('[data-hour12]').forEach(function(btn) {
                    var hVal = parseInt(btn.getAttribute('data-hour12'), 10);
                    btn.classList.toggle('selected', hVal === displayHour);
                });
            }
            if (amBtn) amBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (currentPeriod === 'AM') return;
                currentPeriod = 'AM';
                if (currentHour >= 12) currentHour = currentHour - 12;
                if (typeof setStickyAmPm === 'function') setStickyAmPm('AM');
                if (currentInput) {
                    setTimeInputDisplay(currentInput, pad(currentHour) + ':' + pad(currentMinute));
                    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                updateAmPmButtons();
                updateHourSelection();
            });
            if (pmBtn) pmBtn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (currentPeriod === 'PM') return;
                currentPeriod = 'PM';
                if (currentHour < 12) currentHour = currentHour + 12;
                if (typeof setStickyAmPm === 'function') setStickyAmPm('PM');
                if (currentInput) {
                    setTimeInputDisplay(currentInput, pad(currentHour) + ':' + pad(currentMinute));
                    currentInput.dispatchEvent(new Event('change', { bubbles: true }));
                }
                updateAmPmButtons();
                updateHourSelection();
            });
        }
    }
    function openTimePicker(input) {
        currentInput = input;
        var canonical = typeof getTimeInputValue === 'function' ? getTimeInputValue(input) : (input.value || '');
        if (!canonical || canonical === '00:00') {
            var sticky = (typeof getStickyAmPm === 'function' ? getStickyAmPm() : 'PM');
            currentPeriod = sticky;
            currentHour = sticky === 'PM' ? 23 : 0;
            currentMinute = 0;
        } else {
            var parsed = parseTime(canonical);
            currentHour = parsed.h;
            currentMinute = parsed.m;
            currentPeriod = currentHour >= 12 ? 'PM' : 'AM';
        }
        buildPicker();
        picker.setAttribute('aria-hidden', 'false');
        picker.style.display = 'block';
        var rect = input.getBoundingClientRect();
        var pickerRect = picker.getBoundingClientRect();
        var left = rect.left;
        var top = rect.bottom + 6;
        if (top + pickerRect.height > window.innerHeight) top = rect.top - pickerRect.height - 6;
        if (left + pickerRect.width > window.innerWidth) left = window.innerWidth - pickerRect.width - 12;
        if (left < 12) left = 12;
        picker.style.left = left + 'px';
        picker.style.top = top + 'px';
    }
    function closeTimePicker() {
        picker.setAttribute('aria-hidden', 'true');
        picker.style.display = 'none';
        currentInput = null;
    }
    document.addEventListener('click', function(e) {
        if (e.target.closest('.aura-time-input')) {
            e.preventDefault();
            openTimePicker(e.target.closest('.aura-time-input'));
        } else if (!e.target.closest('#auraTimePicker') && picker.getAttribute('aria-hidden') === 'false') {
            closeTimePicker();
        }
    });
    document.querySelectorAll('.aura-time-input').forEach(function(inp) {
        inp.addEventListener('blur', function() {
            var v = parseTimeToHHmm(this.value);
            if (v) setTimeInputDisplay(this, v);
            else {
                var prev = this.getAttribute('data-aura-time');
                if (prev) setTimeInputDisplay(this, prev);
                else { this.value = ''; this.removeAttribute('data-aura-time'); }
            }
        });
    });
    var prefSleep = document.getElementById('prefDefaultSleep');
    var prefWake = document.getElementById('prefDefaultWake');
    if (prefSleep) prefSleep.addEventListener('change', function() { savePreference('defaultSleepTime', getTimeInputValue(this) || this.value); });
    if (prefWake) prefWake.addEventListener('change', function() { savePreference('defaultWakeTime', getTimeInputValue(this) || this.value); });
})();

function shouldShowAddToHomeBanner() {
    try {
        if (window.matchMedia('(display-mode: standalone)').matches) return false;
        if (navigator.standalone) return false;
        if (!window.matchMedia('(max-width: 768px)').matches) return false;
        if (localStorage.getItem('auraDismissAddToHome')) return false;
        return true;
    } catch (e) { return false; }
}
function dismissAddToHomeBanner() {
    try { localStorage.setItem('auraDismissAddToHome', '1'); } catch (e) {}
    var b = document.getElementById('addToHomeBanner');
    if (b) b.classList.remove('show');
}
function maybeShowAddToHomeBanner() {
    if (!shouldShowAddToHomeBanner()) return;
    var b = document.getElementById('addToHomeBanner');
    if (b) setTimeout(function() { b.classList.add('show'); }, 1500);
}
maybeShowAddToHomeBanner();

function showFieldError(field, message) {
    var el = document.getElementById('entry' + field.charAt(0).toUpperCase() + field.slice(1)) || document.getElementById('entry' + field);
    var errEl = document.getElementById('error-' + field);
    if (el) el.classList.add('input-error');
    if (errEl) { errEl.textContent = message; errEl.style.display = 'block'; }
}
function clearFieldError(field) {
    var id = field === 'mood' ? 'entryMood' : field === 'sleep' ? 'entrySleep' : null;
    var el = id ? document.getElementById(id) : null;
    var errEl = document.getElementById('error-' + field);
    if (el) el.classList.remove('input-error');
    if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
}
function validateForm() {
    clearFieldError('mood');
    clearFieldError('sleep');
    var mood = parseFloat(document.getElementById('entryMood').value);
    var sleep = parseFloat(document.getElementById('entrySleep').value);
    var valid = true;
    if (isNaN(mood) || mood < 1 || mood > 10) {
        showFieldError('mood', 'Mood must be between 1 and 10.');
        valid = false;
    }
    if (isNaN(sleep) || sleep < 0 || sleep > 24) {
        showFieldError('sleep', 'Sleep duration must be between 0 and 24 hours.');
        valid = false;
    }
    // Additional validation for sleep segments happens in saveEntry so we can surface detailed errors.
    return valid;
}
var entryDirty = false;
var entrySaveInFlight = false;
var entryStateLoadInProgress = false;
var entryTouchedFields = { mood: false, energy: false, sleep: false };
var currentCheckInEntryDate = null;
function setEntryDirty(dirty) {
    entryDirty = !!dirty;
    if (entryDirty) renderEntryDailySummary(getWorkingEntryDate());
}
function getWorkingEntryDate() {
    var dateInput = document.getElementById('date');
    var inputDate = dateInput ? getDateInputValue(dateInput) : '';
    return inputDate || currentCheckInEntryDate || currentJournalEntryDate || new Date().toISOString().split('T')[0];
}
function setWorkingEntryDate(dateStr) {
    var nextDate = dateStr || new Date().toISOString().split('T')[0];
    var dateInput = document.getElementById('date');
    currentCheckInEntryDate = nextDate;
    if (dateInput && getDateInputValue(dateInput) !== nextDate) {
        setDateInputDisplay(dateInput, nextDate);
    }
}
function notesValueToPlainText(value) {
    var text = value;
    if (value && typeof value === 'object') text = getRecordJournalHtml(value);
    text = text || '';
    if (!text) return '';
    if (String(text).indexOf('<') !== 0) return String(text);
    var div = document.createElement('div');
    div.innerHTML = String(text);
    return (div.textContent || div.innerText || '').trim();
}
function renderEntryPhotoPreviews(list) {
    var preview = document.getElementById('photoPreviews');
    if (!preview) return;
    var items = Array.isArray(list) ? list : [];
    preview.innerHTML = items.map(function(item) {
        var src = typeof item === 'string' ? item : (item && (item.thumb || item.data)) || '';
        if (!src) return '';
        return '<img src="' + escapeHtml(src) + '" alt="Photo preview">';
    }).join('');
}
function buildEntryFormStateForDate(dateStr, defaultSleepTime, defaultWakeTime) {
    var entry = entries[dateStr];
    if (!entry) {
        return {
            date: dateStr,
            mood: 5,
            sleep: 7,
            sleepQuality: 5,
            sleepTime: defaultSleepTime || '23:00',
            wakeTime: defaultWakeTime || '07:00',
            energy: 5,
            activities: '',
            tags: '',
            notes: '',
            sleepSegments: [],
            customMetrics: {}
        };
    }
    return {
        date: dateStr,
        mood: entry.mood != null ? entry.mood : 5,
        sleep: entry.sleep != null ? entry.sleep : 7,
        sleepQuality: entry.sleepQuality != null ? entry.sleepQuality : 5,
        sleepTime: entry.sleepTime || defaultSleepTime || '23:00',
        wakeTime: entry.wakeTime || defaultWakeTime || '07:00',
        energy: entry.energy != null ? entry.energy : 5,
        activities: Array.isArray(entry.activities) ? entry.activities.join(', ') : (entry.activities || ''),
        tags: Array.isArray(entry.tags) ? entry.tags.join(' ') : (entry.tags || ''),
        notes: notesValueToPlainText(entry),
        sleepSegments: Array.isArray(entry.sleepSegments) ? entry.sleepSegments : [],
        customMetrics: entry.customMetrics || {}
    };
}
function loadEntryIntoCheckInForm(dateStr, options) {
    options = options || {};
    var nextDate = dateStr || getWorkingEntryDate();
    setWorkingEntryDate(nextDate);
    currentCheckInEntryDate = nextDate;
    var state = options.draftState || buildEntryFormStateForDate(nextDate, options.defaultSleepTime, options.defaultWakeTime);
    setEntryFormState(state);
    pendingPhotos = [];
    renderEntryPhotoPreviews(entries[nextDate] && Array.isArray(entries[nextDate].photos) ? entries[nextDate].photos : []);
    resetEntryProgressTracking(null);
    setEntryDirty(false);
    updateEntryProgressUI();
    syncEntryJournalPreview(nextDate);
    renderEntryDailySummary(nextDate);
}
function discardEntryUnsavedChanges() {
    loadEntryIntoCheckInForm(currentCheckInEntryDate || getWorkingEntryDate());
}
var entryJournalPreviewMode = false;
function updateJournalEmptyState() {
    var notesEl = document.getElementById('notes');
    var wrap = notesEl && notesEl.closest('.journal-editor-wrap');
    if (!wrap) return;
    var hasContent = (notesEl.value || '').trim().length > 0;
    wrap.classList.toggle('has-content', !!hasContent);
}
function syncEntryJournalPreview(dateStr) {
    var previewWrap = document.getElementById('journalPreviewWrap');
    var notesEl = document.getElementById('notes');
    if (!previewWrap || !notesEl) return;
    var entry = dateStr && entries[dateStr];
    var hasSavedJournal = entry && notesValueToPlainText(entry).trim().length > 0;
    entryJournalPreviewMode = !!hasSavedJournal;
    if (entryJournalPreviewMode) {
        previewWrap.style.display = 'block';
        previewWrap.setAttribute('aria-hidden', 'false');
        notesEl.style.display = 'none';
        notesEl.value = '';
    } else {
        previewWrap.style.display = 'none';
        previewWrap.setAttribute('aria-hidden', 'true');
        notesEl.style.display = 'block';
    }
    updateJournalEmptyState();
}
function entryJournalStartEdit() {
    var dateStr = getWorkingEntryDate();
    if (!dateStr) return;
    var entry = entries[dateStr];
    var notesEl = document.getElementById('notes');
    var previewWrap = document.getElementById('journalPreviewWrap');
    if (!notesEl || !previewWrap) return;
    entryJournalPreviewMode = false;
    previewWrap.style.display = 'none';
    previewWrap.setAttribute('aria-hidden', 'true');
    notesEl.style.display = 'block';
    notesEl.value = entry ? notesValueToPlainText(entry) : '';
    updateJournalEmptyState();
}
function confirmDiscardEntryChanges() {
    if (!entryDirty) return true;
    return window.confirm('You have unsaved changes.\nLeave without saving?');
}
function resetEntryProgressTracking(state) {
    entryTouchedFields = { mood: false, energy: false, sleep: false };
    if (state) {
        entryTouchedFields.mood = state.mood != null && state.mood !== '';
        entryTouchedFields.energy = state.energy != null && state.energy !== '';
        entryTouchedFields.sleep = state.sleep != null && state.sleep !== '';
    }
    updateEntryProgressUI();
}
function markEntryFieldTouched(field) {
    if (!field || entryStateLoadInProgress) return;
    entryTouchedFields[field] = true;
    updateEntryProgressUI();
}
function getEntryCompletionState() {
    var activities = (document.getElementById('activities').value || '').trim();
    var tags = (document.getElementById('tags').value || '').trim();
    var notes = (document.getElementById('notes').value || '').trim();
    var sleepSegments = getSleepSegmentsFromForm();
    var completed = {
        mood: !!entryTouchedFields.mood,
        energy: !!entryTouchedFields.energy,
        sleep: !!entryTouchedFields.sleep || sleepSegments.length > 0,
        activities: !!activities,
        tags: !!tags,
        journal: !!notes
    };
    var count = Object.keys(completed).reduce(function(sum, key) {
        return sum + (completed[key] ? 1 : 0);
    }, 0);
    return {
        count: count,
        percent: count === 6 ? 100 : Math.round((count / 6) * 100),
        sections: {
            moodEnergy: completed.mood && completed.energy,
            sleep: completed.sleep,
            activitiesTags: completed.activities && completed.tags,
            journal: completed.journal
        }
    };
}
function updateEntryProgressUI() {
    try {
        var state = getEntryCompletionState();
        if (!state) return;

        // Progress bar (mobile)
        var fill = document.getElementById('entryProgressBarFill');
        var label = document.getElementById('entryProgressLabel');
        if (fill) fill.style.width = state.percent + '%';
        if (label) {
            var filledSections = Object.keys(state.sections).filter(function(k) { return state.sections[k]; }).length;
            label.textContent = filledSections + ' of 4 sections filled';
        }

        // Section check dots
        var sectionMap = {
            'entrySectionMoodEnergy':    { key: 'moodEnergy',    checkId: 'checkMoodEnergy'    },
            'entrySectionSleep':         { key: 'sleep',         checkId: 'checkSleep'         },
            'entrySectionActivitiesTags':{ key: 'activitiesTags',checkId: 'checkActivitiesTags'},
            'entrySectionJournal':       { key: 'journal',       checkId: 'checkJournal'       }
        };
        Object.keys(sectionMap).forEach(function(sectionId) {
            var map = sectionMap[sectionId];
            var wrap = document.getElementById(sectionId);
            var check = document.getElementById(map.checkId);
            var complete = !!state.sections[map.key];
            if (wrap) wrap.classList.toggle('section-complete', complete);
            if (check) check.style.borderColor = complete ? 'var(--accent)' : 'var(--border)';
        });
    } catch(e) {
        // Never throw from UI update
    }
}

// Sleep Segments: form-state UI only. Segment cards can look "complete" once both times are valid;
// this is intentional feedback that the segment is fully entered, not that it has been persisted.
// Actual saving happens only when the user saves the daily entry (main save flow). Do not write to Dexie here.

function getSleepSegmentsFromForm() {
    var container = document.getElementById('sleepSegmentsList');
    if (!container) return [];
    var cards = container.querySelectorAll('.sleep-segment-card');
    var segments = [];
    cards.forEach(function(card) {
        var startInput = card.querySelector('.sleep-start');
        var endInput = card.querySelector('.sleep-end');
        if (!startInput || !endInput) return;
        var start = getTimeInputValue(startInput);
        var end = getTimeInputValue(endInput);
        if (start && end) {
            segments.push({ start: start, end: end });
        }
    });
    return segments;
}
function parseRawHHMMForSegment(str) {
    var m = ('' + (str || '')).trim().match(/^(\d{1,2}):(\d{2})/);
    if (!m) return '';
    var h = parseInt(m[1], 10), mn = parseInt(m[2], 10);
    if (h < 0 || h > 23 || mn < 0 || mn > 59) return '';
    return ('0' + h).slice(-2) + ':' + ('0' + mn).slice(-2);
}
function timeToMinutesForSegment(hhmm) {
    var parts = (hhmm || '').split(':');
    if (parts.length < 2) return NaN;
    var h = parseInt(parts[0], 10), m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return NaN;
    return h * 60 + m;
}
function formatSegmentDurationMinutes(totalMinutes) {
    var minutes = Math.max(0, Math.round(totalMinutes || 0));
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (!mins) return hours + 'h';
    if (!hours) return mins + 'm';
    return hours + 'h ' + mins + 'm';
}
function evaluateSleepSegmentCard(card) {
    if (!card) return { state: 'empty', durationMinutes: null };
    var startInput = card.querySelector('.sleep-start');
    var endInput = card.querySelector('.sleep-end');
    if (!startInput || !endInput) return { state: 'empty', durationMinutes: null };
    var startStr = getTimeInputValue(startInput);
    var endStr = getTimeInputValue(endInput);
    if (!startStr || !endStr) return { state: 'incomplete', durationMinutes: null };
    var startCanonical = parseRawHHMMForSegment(startStr);
    var endCanonical = parseRawHHMMForSegment(endStr);
    if (!startCanonical || !endCanonical) return { state: 'invalid', durationMinutes: null };
    var startMin = timeToMinutesForSegment(startCanonical);
    var endMin = timeToMinutesForSegment(endCanonical);
    if (!isFinite(startMin) || !isFinite(endMin)) return { state: 'invalid', durationMinutes: null };
    if (endMin <= startMin) endMin += 24 * 60;
    if (endMin <= startMin) return { state: 'invalid', durationMinutes: null };
    var durationMinutes = Math.min(Math.max(0, endMin - startMin), 720);
    return { state: 'complete', durationMinutes: durationMinutes };
}
function refreshSleepSegmentCardUI(card) {
    if (!card) return;
    var meta = card.querySelector('.sleep-segment-meta');
    var durationEl = card.querySelector('.sleep-segment-duration');
    var statusEl = card.querySelector('.sleep-segment-status');
    var result = evaluateSleepSegmentCard(card);
    card.classList.remove('sleep-segment-card--draft', 'sleep-segment-card--invalid', 'sleep-segment-card--complete');
    if (result.state === 'empty' || result.state === 'incomplete') {
        card.classList.add('sleep-segment-card--draft');
        if (durationEl) durationEl.textContent = '';
        if (statusEl) statusEl.textContent = 'Enter start and end time';
    } else if (result.state === 'invalid') {
        card.classList.add('sleep-segment-card--invalid');
        if (durationEl) durationEl.textContent = '';
        if (statusEl) statusEl.textContent = 'Check times';
    } else {
        card.classList.add('sleep-segment-card--complete');
        if (durationEl) durationEl.textContent = result.durationMinutes != null ? formatSegmentDurationMinutes(result.durationMinutes) : '';
        if (statusEl) statusEl.textContent = 'Segment complete';
    }
}
function bindDynamicAuraTimeInput(input) {
    if (!input || input.getAttribute('data-aura-bound') === 'true') return;
    input.setAttribute('data-aura-bound', 'true');
    input.addEventListener('blur', function() {
        var v = parseTimeToHHmm(this.value);
        if (v) setTimeInputDisplay(this, v);
        else {
            var prev = this.getAttribute('data-aura-time');
            if (prev) setTimeInputDisplay(this, prev);
            else {
                this.value = '';
                this.removeAttribute('data-aura-time');
            }
        }
    });
    input.addEventListener('input', function() {
        var digits = (this.value || '').replace(/\D/g, '').slice(0, 4);
        if (digits.length >= 3) this.value = digits.slice(0, 2) + ':' + digits.slice(2);
        else this.value = digits;
    });
}
function updateSleepSegmentSummary() {
    var summaryEl = document.getElementById('sleepSegmentSummary');
    var errorEl = document.getElementById('sleepSegmentsError');
    if (!summaryEl) return;
    var segments = getSleepSegmentsFromForm();
    var result = computeSleepTotalsFromSegments(segments);
    if (errorEl) {
        errorEl.textContent = result.error || '';
        errorEl.style.display = result.error ? 'block' : 'none';
    }
    if (result.error) {
        summaryEl.textContent = '';
        updateSupportRail();
        return;
    }
    if (segments.length === 0) {
        summaryEl.textContent = '';
        updateSupportRail();
        return;
    }
    if (result.count === 0) {
        summaryEl.textContent = 'Add start and end times to complete each segment.';
        updateSupportRail();
        return;
    }
    if (result.count === 1) {
        summaryEl.textContent = 'Total sleep: ' + result.totalHours + 'h (1 segment)';
        updateSupportRail();
        return;
    }
    summaryEl.textContent = 'Total sleep: ' + result.totalHours + 'h across ' + result.count + ' segments.';
    updateSupportRail();
}
function updateAddSleepSegmentButton() {
    var btn = document.getElementById('addSleepSegmentBtn');
    var container = document.getElementById('sleepSegmentsList');
    if (!btn || !container) return;
    var count = container.querySelectorAll('.sleep-segment-card').length;
    btn.disabled = count >= 3;
    btn.textContent = count > 0 ? '+ Add Another Segment' : '+ Add Sleep Segment';
}
function bindSleepSegmentInputs(card) {
    if (!card) return;
    var inputs = card.querySelectorAll('.sleep-start, .sleep-end');
    inputs.forEach(function(inp) {
        bindDynamicAuraTimeInput(inp);
        inp.addEventListener('input', function() {
            refreshSleepSegmentCardUI(card);
            updateSleepSegmentSummary();
        });
        inp.addEventListener('change', function() {
            refreshSleepSegmentCardUI(card);
            updateSleepSegmentSummary();
        });
    });
    refreshSleepSegmentCardUI(card);
}
function buildSleepSegmentCard(index, startVal, endVal) {
    var card = document.createElement('div');
    card.className = 'sleep-segment-card sleep-segment-card--draft';
    card.innerHTML =
        '<span class="sleep-segment-label">Segment ' + index + '</span>' +
        '<div class="sleep-segment-row">' +
            '<div class="sleep-segment-times">' +
                '<div class="sleep-segment-field">' +
                    '<span class="sleep-segment-field-label">Start Time</span>' +
                    '<input type="text" class="aura-time-input form-input sleep-start" placeholder="Start Time" aria-label="Segment ' + index + ' start time">' +
                '</div>' +
                '<span class="sleep-segment-arrow" aria-hidden="true">→</span>' +
                '<div class="sleep-segment-field">' +
                    '<span class="sleep-segment-field-label">End Time</span>' +
                    '<input type="text" class="aura-time-input form-input sleep-end" placeholder="End Time" aria-label="Segment ' + index + ' end time">' +
                '</div>' +
            '</div>' +
            '<button type="button" class="sleep-segment-remove" onclick="removeSleepSegment(this)">Delete Segment</button>' +
        '</div>' +
        '<div class="sleep-segment-meta">' +
            '<span class="sleep-segment-duration" aria-hidden="true"></span>' +
            '<span class="sleep-segment-status">Enter start and end time</span>' +
        '</div>';
    var startInput = card.querySelector('.sleep-start');
    var endInput = card.querySelector('.sleep-end');
    if (startInput && startVal) setTimeInputDisplay(startInput, startVal);
    if (endInput && endVal) setTimeInputDisplay(endInput, endVal);
    bindSleepSegmentInputs(card);
    return card;
}
function renumberSleepSegments(container) {
    if (!container) return;
    container.querySelectorAll('.sleep-segment-card').forEach(function(card, i) {
        var index = i + 1;
        var label = card.querySelector('.sleep-segment-label');
        var startInput = card.querySelector('.sleep-start');
        var endInput = card.querySelector('.sleep-end');
        if (label) label.textContent = 'Segment ' + index;
        if (startInput) startInput.setAttribute('aria-label', 'Segment ' + index + ' start time');
        if (endInput) endInput.setAttribute('aria-label', 'Segment ' + index + ' end time');
    });
}
function setSleepSegmentsInForm(segments) {
    var container = document.getElementById('sleepSegmentsList');
    if (!container) return;
    container.innerHTML = '';
    var segs = Array.isArray(segments) ? segments.slice(0, 3) : [];
    segs.forEach(function(seg, i) {
        var card = buildSleepSegmentCard(i + 1, seg.start, seg.end);
        container.appendChild(card);
        refreshSleepSegmentCardUI(card);
    });
    renumberSleepSegments(container);
    updateSleepSegmentSummary();
    updateAddSleepSegmentButton();
}
function addSleepSegment() {
    var container = document.getElementById('sleepSegmentsList');
    if (!container) return;
    var existing = container.querySelectorAll('.sleep-segment-card').length;
    if (existing >= 3) return;
    var index = existing + 1;
    var card = buildSleepSegmentCard(index, '', '');
    container.appendChild(card);
    renumberSleepSegments(container);
    updateSleepSegmentSummary();
    updateAddSleepSegmentButton();
    var startInput = card.querySelector('.sleep-start');
    if (startInput) startInput.focus();
}
function removeSleepSegment(btn) {
    var card = btn && btn.closest('.sleep-segment-card');
    if (card && card.parentNode) {
        card.parentNode.removeChild(card);
        var container = document.getElementById('sleepSegmentsList');
        if (container) {
            renumberSleepSegments(container);
        }
        updateSleepSegmentSummary();
        updateAddSleepSegmentButton();
    }
}
function roundToHalf(n) {
    var x = parseFloat(n);
    if (isNaN(x)) return n;
    return Math.round(x * 2) / 2;
}
function roundMoodEnergySleepQuality(n) {
    var x = roundToHalf(n);
    if (isNaN(x)) return 5;
    return Math.max(1, Math.min(10, x));
}
window.roundToHalf = roundToHalf;
window.roundMoodEnergySleepQuality = roundMoodEnergySleepQuality;
function clampSleepTotal(h) {
    if (h == null || typeof h !== 'number' || isNaN(h)) return null;
    if (h < 0) return null;
    // Hard cap: maximum realistic sleep is 12 hours (single or fragmented)
    return Math.min(h, 12);
}
function computeSleepTotalsFromSegments(segments) {
    if (!Array.isArray(segments) || !segments.length) {
        return { totalHours: null, count: 0, error: null };
    }
    function timeToMinutes(hhmm) {
        var parts = (hhmm || '').split(':');
        if (parts.length < 2) return NaN;
        var h = parseInt(parts[0], 10);
        var m = parseInt(parts[1], 10);
        if (isNaN(h) || isNaN(m)) return NaN;
        return h * 60 + m;
    }
    // Use direct HH:MM parser — parseTimeToHHmm applies sticky AM/PM which 
    // corrupts overnight wake times (06:30 -> 18:30 if stickyAmPm is PM -> 19+ hour sleeps!)
    function parseRawHHMM(str) {
        var m = ('' + (str || '')).trim().match(/^(\d{1,2}):(\d{2})/);
        if (!m) return '';
        var h = parseInt(m[1], 10), mn = parseInt(m[2], 10);
        if (h < 0 || h > 23 || mn < 0 || mn > 59) return '';
        return ('0'+h).slice(-2) + ':' + ('0'+mn).slice(-2);
    }
    var intervals = [];
    for (var i = 0; i < segments.length; i++) {
        var seg = segments[i];
        var startCanonical = parseRawHHMM(seg.start);
        var endCanonical = parseRawHHMM(seg.end);
        if (!startCanonical || !endCanonical) {
            return { totalHours: null, count: 0, error: 'Sleep segments must have valid start and end times.' };
        }
        var startMin = timeToMinutes(startCanonical);
        var endMin = timeToMinutes(endCanonical);
        if (!isFinite(startMin) || !isFinite(endMin)) {
            return { totalHours: null, count: 0, error: 'Sleep segments must have valid start and end times.' };
        }
        if (endMin <= startMin) {
            endMin += 24 * 60;
        }
        if (endMin <= startMin) {
            return { totalHours: null, count: 0, error: 'Sleep segment end time must be after start time.' };
        }
        intervals.push({ start: startMin, end: endMin });
    }
    intervals.sort(function(a, b) { return a.start - b.start; });
    for (var j = 1; j < intervals.length; j++) {
        if (intervals[j].start < intervals[j - 1].end) {
            return { totalHours: null, count: 0, error: 'Sleep segments must not overlap.' };
        }
    }
    var totalMinutes = intervals.reduce(function(sum, seg) { return sum + Math.max(0, seg.end - seg.start); }, 0);
    // Hard cap total across all segments at 12h (720 mins)
    totalMinutes = Math.min(totalMinutes, 720);
    var totalHours = Math.round(totalMinutes / 60 * 10) / 10;
    return { totalHours: totalHours, count: intervals.length, error: null };
}

function getEntryFormState() {
    var state = {
        date: getDateInputValue(document.getElementById('date')),
        mood: roundMoodEnergySleepQuality(parseFloat(document.getElementById('entryMood').value)),
        sleep: document.getElementById('entrySleep').value,
        sleepQuality: roundMoodEnergySleepQuality(parseFloat(document.getElementById('sleepQuality').value)),
        sleepTime: getTimeInputValue(document.getElementById('sleepTime')),
        wakeTime: getTimeInputValue(document.getElementById('wakeTime')),
        energy: roundMoodEnergySleepQuality(parseFloat(document.getElementById('entryEnergy').value)),
        activities: document.getElementById('activities').value,
        tags: document.getElementById('tags').value,
        notes: document.getElementById('notes').value
    };
    state.sleepSegments = getSleepSegmentsFromForm();
    var totals = computeSleepTotalsFromSegments(state.sleepSegments);
    if (!totals.error && totals.totalHours != null) {
        state.sleepTotal = totals.totalHours;
        state.sleepSegmentCount = totals.count;
    }
    state.customMetrics = {};
    document.querySelectorAll('[data-metric-id]').forEach(function(el) {
        var id = el.getAttribute('data-metric-id');
        var type = el.getAttribute('data-metric-type');
        if (id) state.customMetrics[id] = type === 'yesno' ? (el.checked ? 1 : 0) : parseFloat(el.value);
    });
    return state;
}
function setEntryFormState(s) {
    if (!s) return;
    entryStateLoadInProgress = true;
    setDateInputDisplay(document.getElementById('date'), s.date || '');
    var moodVal = roundMoodEnergySleepQuality(parseFloat(s.mood) || 5);
    document.getElementById('entryMood').value = moodVal;
    var sleepVal = s.sleep != null ? parseFloat(s.sleep) : 7;
    if (typeof sleepVal !== 'number' || isNaN(sleepVal) || sleepVal < 0 || sleepVal > 12) sleepVal = 7;
    document.getElementById('entrySleep').value = sleepVal;
    var sleepQualityVal = roundMoodEnergySleepQuality(parseFloat(s.sleepQuality) || 5);
    document.getElementById('sleepQuality').value = sleepQualityVal;
    setTimeInputDisplay(document.getElementById('sleepTime'), s.sleepTime || '23:00');
    setTimeInputDisplay(document.getElementById('wakeTime'), s.wakeTime || '07:00');
    setSleepSegmentsInForm(s.sleepSegments || []);
    var energyVal = roundMoodEnergySleepQuality(parseFloat(s.energy) || 5);
    document.getElementById('entryEnergy').value = energyVal;
    document.getElementById('activities').value = s.activities || '';
    document.getElementById('tags').value = s.tags || '';
    document.getElementById('notes').value = s.notes || '';
    updateJournalEmptyState();
    document.getElementById('moodValue').innerText = moodVal;
    document.getElementById('sleepValue').innerText = sleepVal;
    document.getElementById('sleepQualityValue').innerText = sleepQualityVal;
    document.getElementById('energyValue').innerText = energyVal;
    if (s.customMetrics && typeof s.customMetrics === 'object') {
        Object.keys(s.customMetrics).forEach(function(id) {
            var el = document.getElementById('customMetric_' + id);
            var valEl = document.getElementById('customMetricVal_' + id);
            if (el) {
                if (el.type === 'checkbox') el.checked = !!s.customMetrics[id];
                else { el.value = s.customMetrics[id]; if (valEl) valEl.innerText = s.customMetrics[id]; }
            }
        });
    }
    entryStateLoadInProgress = false;
    updateEntryProgressUI();
    updateSupportRail();
}

var entryHistory = [];
var entryHistoryIndex = -1;
var ENTRY_HISTORY_MAX = 20;
function pushEntryHistory() {
    var state = getEntryFormState();
    var serializedState = JSON.stringify(state);
    if (entryHistoryIndex < entryHistory.length - 1) entryHistory = entryHistory.slice(0, entryHistoryIndex + 1);
    if (entryHistory[entryHistory.length - 1] === serializedState) {
        updateUndoRedoButtons();
        return;
    }
    entryHistory.push(serializedState);
    if (entryHistory.length > ENTRY_HISTORY_MAX) entryHistory.shift();
    entryHistoryIndex = entryHistory.length - 1;
    updateUndoRedoButtons();
}
function entryUndo() {
    if (entryHistoryIndex <= 0) return;
    entryHistoryIndex--;
    setEntryFormState(JSON.parse(entryHistory[entryHistoryIndex]));
    updateUndoRedoButtons();
}
function entryRedo() {
    if (entryHistoryIndex >= entryHistory.length - 1) return;
    entryHistoryIndex++;
    setEntryFormState(JSON.parse(entryHistory[entryHistoryIndex]));
    updateUndoRedoButtons();
}
function updateUndoRedoButtons() {
    var undoBtn = document.getElementById('undoBtn');
    var redoBtn = document.getElementById('redoBtn');
    if (undoBtn) undoBtn.disabled = entryHistoryIndex <= 0;
    if (redoBtn) redoBtn.disabled = entryHistoryIndex >= entryHistory.length - 1;
}

var ENTRY_SECTION_KEYS = {
    entrySectionMoodEnergy: 'auraEntrySectionMoodEnergyOpen',
    entrySectionSleep: 'auraEntrySectionSleepOpen',
    entrySectionActivitiesTags: 'auraEntrySectionActivitiesTagsOpen',
    entrySectionJournal: 'auraEntrySectionJournalOpen'
};
function toggleEntrySection(sectionId) {
    var wrap = document.getElementById(sectionId);
    if (!wrap || !wrap.classList.contains('collapsible-mobile')) return;
    var isExpanded = wrap.classList.toggle('expanded');
    var btn = wrap.querySelector('.entry-section-header');
    if (btn) btn.setAttribute('aria-expanded', isExpanded);
    try {
        var key = ENTRY_SECTION_KEYS[sectionId];
        if (key) sessionStorage.setItem(key, isExpanded ? 'true' : 'false');
    } catch (e) {}
}
function initEntrySectionState() {
    ['entrySectionMoodEnergy', 'entrySectionSleep', 'entrySectionActivitiesTags', 'entrySectionJournal'].forEach(function(sectionId) {
        var wrap = document.getElementById(sectionId);
        if (!wrap) return;
        var btn = wrap.querySelector('.entry-section-header');
        if (window.matchMedia('(max-width: 768px)').matches) {
            wrap.classList.remove('expanded');
            if (btn) btn.setAttribute('aria-expanded', 'false');
        } else {
            wrap.classList.add('expanded');
            if (btn) btn.setAttribute('aria-expanded', 'true');
        }
    });
}
(function setupEntryFormUX() {
    var form = document.getElementById('entry');
    if (!form) return;
    function handleInteraction(target) {
        if (!target || entryStateLoadInProgress) return;
        if (target.id === 'date') {
            var nextDate = getDateInputValue(target) || new Date().toISOString().split('T')[0];
            if (nextDate === currentCheckInEntryDate) return;
            if (!confirmDiscardEntryChanges()) {
                setDateInputDisplay(target, currentCheckInEntryDate || getWorkingEntryDate());
                return;
            }
            loadEntryIntoCheckInForm(nextDate);
            return;
        }
        if (target.id === 'entryMood') markEntryFieldTouched('mood');
        if (target.id === 'entryEnergy') markEntryFieldTouched('energy');
        if (target.id === 'entrySleep' || target.id === 'sleepTime' || target.id === 'wakeTime' || target.classList.contains('sleep-start') || target.classList.contains('sleep-end')) {
            markEntryFieldTouched('sleep');
        }
        setEntryDirty(true);
        updateEntryProgressUI();
        updateSupportRail();
    }
    form.addEventListener('input', function(e) { handleInteraction(e.target); });
    form.addEventListener('change', function(e) { handleInteraction(e.target); });
})();

function updateSupportRail() {
    var dateEl = document.getElementById('supportRailDate');
    var draftEl = document.getElementById('supportRailDraft');
    var moodEl = document.getElementById('supportRailMood');
    var energyEl = document.getElementById('supportRailEnergy');
    var sleepEl = document.getElementById('supportRailSleep');
    var tagsEl = document.getElementById('supportRailTags');
    var reflectionEl = document.getElementById('supportRailReflection');
    if (!dateEl) return;
    var dateInput = document.getElementById('date');
    var dateVal = dateInput ? getDateInputValue(dateInput) : '';
    dateEl.textContent = dateVal ? dateVal : '—';
    if (draftEl) draftEl.textContent = entryDirty ? 'Unsaved changes' : 'No unsaved changes';
    if (moodEl) {
        var m = document.getElementById('entryMood');
        moodEl.textContent = m && m.value !== '' ? m.value : '—';
    }
    if (energyEl) {
        var e = document.getElementById('entryEnergy');
        energyEl.textContent = e && e.value !== '' ? e.value : '—';
    }
    if (sleepEl) {
        var sv = document.getElementById('sleepValue');
        var segs = getSleepSegmentsFromForm();
        var segCount = segs && segs.length ? segs.length : 0;
        var sleepStr = sv ? sv.innerText : (document.getElementById('entrySleep') ? document.getElementById('entrySleep').value : '—');
        sleepEl.textContent = sleepStr !== '' && sleepStr != null ? (segCount > 0 ? sleepStr + ' hrs (' + segCount + ' segment' + (segCount !== 1 ? 's' : '') + ')' : sleepStr + ' hrs') : '—';
    }
    if (tagsEl) {
        var t = document.getElementById('tags');
        var tagStr = t && t.value ? t.value.trim() : '';
        tagsEl.textContent = tagStr ? (tagStr.length > 40 ? tagStr.slice(0, 37) + '…' : tagStr) : '—';
    }
    if (reflectionEl) {
        var n = document.getElementById('notes');
        reflectionEl.textContent = n && (n.value || '').trim().length > 0 ? 'Started' : 'Not yet';
    }
}

var draftTimer;
function startDraftAutoSave() {
    if (draftTimer) clearInterval(draftTimer);
    draftTimer = setInterval(async function() {
        var state = getEntryFormState();
        if (!state.date) return;
        try {
            await db.appState.put({ key: 'entryDraft', value: state });
            var ind = document.getElementById('draftIndicator');
            if (ind) { ind.textContent = 'Draft saved'; ind.setAttribute('aria-live', 'polite'); }
        } catch (e) {}
    }, 10000);
}
function loadDraft(dateStr) {
    return db.appState.get('entryDraft').then(function(row) {
        if (row && row.value) {
            if (!dateStr || row.value.date === dateStr) return row.value;
        }
        return null;
    });
}

function getSuggestedTags() {
    var seen = {};
    Object.keys(entries).forEach(function(d) {
        (entries[d].tags || []).forEach(function(t) {
            if (t) seen[t] = (seen[t] || 0) + 1;
        });
    });
    return Object.keys(seen).sort(function(a, b) { return seen[b] - seen[a]; }).slice(0, 12);
}
function renderTagSuggestions() {
    var container = document.getElementById('tagSuggestions');
    var labelEl = document.getElementById('tagSuggestionsLabel');
    if (!container) return;
    var tags = getSuggestedTags();
    if (labelEl) labelEl.style.display = tags.length ? 'block' : 'none';
    if (tags.length === 0) { container.innerHTML = ''; return; }
    container.innerHTML = tags.map(function(t) {
        var c = getTagColorForSuggestions(t);
        return '<span class="em-tag-chip" role="button" tabindex="0" onclick="addSuggestedTag(\'' + t.replace(/'/g, "\\'") + '\')" ' +
            'style="background:' + c.background + ';border:1px solid ' + c.borderColor + ';color:' + c.textColor +
            ';--chip-sheen-color:' + (c.sheenColor || c.traceColor || 'rgba(230,230,230,0.9)') + '">' +
            '<span class="tag-hash-icon" style="background:' + c.hashIconBackground + ';color:' + c.textColor + ';opacity:0.8">#</span>' + escapeHtml(t) + '</span>';
    }).join('');
}
function addSuggestedTag(tag) {
    var input = document.getElementById('tags');
    var cur = (input.value || '').trim();
    var add = (cur ? cur + ' ' : '') + '#' + tag;
    input.value = add;
}

async function saveEntry() {
    if (entrySaveInFlight) return;
    var saveBtn = document.getElementById('saveEntryBtn');
    var originalSaveLabel = saveBtn ? saveBtn.textContent : '';
    const date = getWorkingEntryDate();
    if (!date) {
        showToast('Please select a date.');
        return;
    }
    entrySaveInFlight = true;
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
    }
    try {
        setWorkingEntryDate(date);
        var existingEntry = entries[date] ? normalizeDailyRecord(entries[date], date) : createDailyRecord(date);
        var sleepSegments = getSleepSegmentsFromForm();
        var sleepTotals = computeSleepTotalsFromSegments(sleepSegments);
        if (sleepTotals.error) {
            showFieldError('sleep', sleepTotals.error);
            return;
        }
        var isNewRecord = !entries[date];
        var sleepEdited = isNewRecord || !!entryTouchedFields.sleep || sleepSegments.length > 0;
        var sleepTotal = sleepTotals.totalHours;
        var sleepSegmentCount = sleepTotals.count;
        if (sleepEdited && sleepTotal != null) {
            var sleepSlider = document.getElementById('entrySleep');
            if (sleepSlider) {
                var displayVal = Math.max(0, Math.min(12, sleepTotal));
                sleepSlider.value = displayVal;
                var sleepValueEl = document.getElementById('sleepValue');
                if (sleepValueEl) sleepValueEl.innerText = displayVal;
            }
        }
        
        const activitiesRaw = (document.getElementById('activities').value || '').trim();
        const activities = activitiesRaw ? activitiesRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
        const tagsRaw = (document.getElementById('tags').value || '').trim();
        const tags = tagsRaw ? tagsRaw.split(/[\s,#]+/).map(s => s.replace(/^#/, '').trim()).filter(Boolean) : [];
        
        var customMetrics = {};
        document.querySelectorAll('[data-metric-id]').forEach(function(el) {
            var id = el.getAttribute('data-metric-id');
            var type = el.getAttribute('data-metric-type');
            if (id) customMetrics[id] = type === 'yesno' ? (el.checked ? 1 : 0) : parseFloat(el.value);
        });
        const entry = applyDailyRecordPatch(existingEntry, {
            id: date,
            date: date,
            customMetrics: customMetrics,
            activities: activities,
            tags: tags
        });
        if (isNewRecord || entryTouchedFields.mood) entry.mood = roundMoodEnergySleepQuality(parseFloat(document.getElementById('entryMood').value));
        if (isNewRecord || entryTouchedFields.energy) entry.energy = roundMoodEnergySleepQuality(parseFloat(document.getElementById('entryEnergy').value));
        if (sleepEdited) {
            var rawSleep = sleepTotal != null ? sleepTotal : parseFloat(document.getElementById('entrySleep').value);
            var clampedSleep = clampSleepTotal(rawSleep);
            entry.sleep = clampedSleep;
            entry.sleepTotal = clampedSleep;
            entry.sleepSegmentCount = sleepSegmentCount;
            entry.sleepSegments = sleepSegments;
            entry.sleepQuality = roundMoodEnergySleepQuality(parseFloat(document.getElementById('sleepQuality').value));
            entry.sleepTime = getTimeInputValue(document.getElementById('sleepTime'));
            entry.wakeTime = getTimeInputValue(document.getElementById('wakeTime'));
        }
        var notesInputValue = document.getElementById('notes').value || '';
        var existingPlainNotes = notesValueToPlainText(existingEntry);
        if (currentJournalEntryDate === date && quillEditor) {
            entry.journal = getJournalTextHtml();
            entry.notes = entry.journal;
            entry.photos = journalPhotos.slice();
        } else if (entryJournalPreviewMode) {
            entry.journal = getRecordJournalHtml(existingEntry);
            entry.notes = entry.journal;
            entry.photos = (existingEntry.photos && existingEntry.photos.length) ? existingEntry.photos.slice() : (pendingPhotos.length ? pendingPhotos.slice() : []);
        } else {
            entry.journal = notesInputValue === existingPlainNotes ? getRecordJournalHtml(existingEntry) : notesInputValue;
            entry.notes = entry.journal;
            entry.photos = pendingPhotos.length ? pendingPhotos.slice() : (existingEntry.photos || []);
        }
    entry.sleepSegments = Array.isArray(entry.sleepSegments) ? entry.sleepSegments : [];
    entry.sleepSegmentCount = entry.sleepSegments.length;
    await persistDailyRecord(entry);
    pendingPhotos = [];
    document.getElementById('photoInput').value = '';
    renderEntryPhotoPreviews(entry.photos || []);
    // Must set dirty=false before renderEntryDailySummary so the summary card displays
    setEntryDirty(false);
    renderEntryDailySummary(date);
    entryJournalPreviewMode = true;
    syncEntryJournalPreview(date);
    if (entry.sleepTime) await db.appState.put({ key: 'defaultSleepTime', value: entry.sleepTime });
    if (entry.wakeTime) await db.appState.put({ key: 'defaultWakeTime', value: entry.wakeTime });
    try { await db.appState.delete('entryDraft'); } catch (e) {}
    var ind = document.getElementById('draftIndicator');
    if (ind) ind.textContent = '';
    resetEntryProgressTracking(null);
    pushEntryHistory();
    updateUndoRedoButtons();
    updateEntryProgressUI();
    showToast('Entry saved successfully ✓');
    renderHeatmap();
    generateInsights();
    updateDashboard();
    renderTagSuggestions();
    } finally {
        entrySaveInFlight = false;
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.textContent = originalSaveLabel || 'Save Entry';
        }
    }
}

function plainTextToJournalHtml(text) {
    if (!text || typeof text !== 'string') return '';
    var t = text.trim();
    if (!t) return '';
    var lines = t.split(/\n/);
    return lines.map(function(l) { return '<p>' + escapeHtml(l) + '</p>'; }).join('');
}

async function saveJournalEntry() {
    /* Single save path: journal is persisted by saveEntry() with the rest of the Daily Check-In. */
    return saveEntry();
}

function showToast(message) {
    hapticFeedback();
    if (window.auraSoundEnabled) playSuccessSound();
    var msg = document.getElementById('successMessage');
    msg.textContent = message;
    msg.classList.add('show');
    setTimeout(function() { msg.classList.remove('show'); msg.textContent = 'Entry saved successfully ✓'; }, 3000);
}

function hapticFeedback() {
    try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {}
}

function playSuccessSound() {
    try {
        var ctx = new (window.AudioContext || window.webkitAudioContext)();
        var o = ctx.createOscillator();
        var g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = 523; o.type = 'sine';
        g.gain.setValueAtTime(0.08, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
    } catch (e) {}
}

function animateValue(el, from, to, duration, suffix) {
    if (!el) return;
    suffix = suffix || '';
    if (typeof from !== 'number' || typeof to !== 'number' || isNaN(from)) {
        el.innerText = (to === undefined || to === null ? from : to) + suffix;
        return;
    }
    var integerOnly = (to === Math.floor(to) && suffix === '');
    var start = performance.now();
    function step(now) {
        var t = Math.min((now - start) / duration, 1);
        t = 1 - Math.pow(1 - t, 2);
        var val = from + (to - from) * t;
        el.innerText = (integerOnly ? Math.round(val) : (Math.round(val * 10) / 10)) + suffix;
        if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
}

function fireConfetti() {
    var canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    hapticFeedback();
    if (window.auraSoundEnabled) playSuccessSound();
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var colors = ['#8B9D83', '#6B7D63', '#C97D60', '#D4AF37', '#B5C4AE'];
    for (var i = 0; i < 80; i++) {
        particles.push({
            x: w / 2, y: h / 2,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 14 - 4,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 4 + Math.random() * 6,
            life: 1
        });
    }
    var start = performance.now();
    function loop(now) {
        var dt = (now - start) / 1000;
        start = now;
        ctx.clearRect(0, 0, w, h);
        particles.forEach(function(p) {
            p.x += p.vx * 60 * dt;
            p.y += p.vy * 60 * dt;
            p.vy += 80 * dt;
            p.life -= 0.015;
            if (p.life <= 0) return;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        if (particles.some(function(p) { return p.life > 0; })) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}

function setSoundEnabled(enabled) {
    window.auraSoundEnabled = !!enabled;
    db.appState.put({ key: 'soundEnabled', value: enabled });
}

var ambientParticlesRAF = null;
function setParticlesEnabled(enabled) {
    db.appState.put({ key: 'particlesEnabled', value: enabled });
    var wrap = document.getElementById('ambientParticles');
    if (!wrap) return;
    wrap.style.display = enabled ? 'block' : 'none';
    if (ambientParticlesRAF) {
        cancelAnimationFrame(ambientParticlesRAF);
        ambientParticlesRAF = null;
    }
    if (enabled) startAmbientParticles();
}

function startAmbientParticles() {
    var wrap = document.getElementById('ambientParticles');
    var canvas = document.getElementById('particlesCanvas');
    if (!wrap || !canvas || wrap.style.display === 'none') return;
    var w = canvas.width = window.innerWidth;
    var h = canvas.height = window.innerHeight;
    var ctx = canvas.getContext('2d');
    var particles = [];
    var colors = ['rgba(139,157,131,0.4)', 'rgba(196,125,96,0.35)', 'rgba(212,175,55,0.3)'];
    for (var i = 0; i < 40; i++) {
        particles.push({
            x: Math.random() * w, y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            r: 1 + Math.random() * 2,
            color: colors[i % colors.length]
        });
    }
    function loop() {
        if (!wrap || wrap.style.display === 'none') return;
        if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
            w = canvas.width = window.innerWidth;
            h = canvas.height = window.innerHeight;
        }
        ctx.clearRect(0, 0, w, h);
        particles.forEach(function(p) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ambientParticlesRAF = requestAnimationFrame(loop);
    }
    loop();
}

var parallaxScrollHandler = null;
function setParallaxEnabled(enabled) {
    db.appState.put({ key: 'parallaxEnabled', value: enabled });
    document.body.classList.toggle('parallax', !!enabled);
    if (enabled) {
        updateParallax();
        if (!parallaxScrollHandler) {
            parallaxScrollHandler = function() { updateParallax(); };
            window.addEventListener('scroll', parallaxScrollHandler, { passive: true });
        }
    } else {
        if (parallaxScrollHandler) {
            window.removeEventListener('scroll', parallaxScrollHandler);
            parallaxScrollHandler = null;
        }
        var main = document.querySelector('main');
        if (main) main.style.transform = '';
    }
}
function updateParallax() {
    if (!document.body.classList.contains('parallax')) return;
    var main = document.querySelector('main');
    if (!main) return;
    var y = window.scrollY || window.pageYOffset;
    main.style.transform = 'translate3d(0, ' + (y * 0.06) + 'px, 0)';
}

var lastStreakMilestone = 0;

function buildDashboardGreeting() {
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    return greeting;
}

function buildDashboardNarrative() {
    var allDates = Object.keys(entries).sort();
    if (!allDates.length) return 'Start logging your first check-in to see patterns emerge here.';

    var today = new Date().toISOString().split('T')[0];
    var todayEntry = entries[today];

    // Recent 7-day mood trend
    var last7 = allDates.filter(function(d) { return d <= today; }).slice(-7);
    var last7Moods = last7.map(function(d) { return entries[d] && entries[d].mood; }).filter(function(m) { return typeof m === 'number' && !isNaN(m); });

    var trendText = '';
    if (last7Moods.length >= 4) {
        var firstHalf = last7Moods.slice(0, Math.floor(last7Moods.length / 2));
        var secondHalf = last7Moods.slice(Math.floor(last7Moods.length / 2));
        var firstAvg = firstHalf.reduce(function(a, b) { return a + b; }, 0) / firstHalf.length;
        var secondAvg = secondHalf.reduce(function(a, b) { return a + b; }, 0) / secondHalf.length;
        var diff = secondAvg - firstAvg;
        if (diff > 0.5) trendText = 'Your mood has been climbing this week.';
        else if (diff < -0.5) trendText = 'Your mood has dipped a little this week.';
        else trendText = 'Your mood has been steady this week.';
    }

    // Streak
    var streak = 0;
    var checkDate = new Date();
    if (!entries[checkDate.toISOString().split('T')[0]]) checkDate.setDate(checkDate.getDate() - 1);
    while (entries[checkDate.toISOString().split('T')[0]]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
    }

    // Today's status
    var todayText = '';
    if (todayEntry && todayEntry.mood != null) {
        var moodLabel = todayEntry.mood >= 7.5 ? 'a strong' : todayEntry.mood >= 5 ? 'a moderate' : 'a low';
        todayText = 'Today you logged ' + moodLabel + ' mood of ' + todayEntry.mood.toFixed(1) + '.';
    } else {
        todayText = 'No check-in yet today.';
    }

    // Best tag recently
    var tagCounts = {};
    last7.forEach(function(d) {
        (entries[d] && entries[d].tags || []).forEach(function(t) { tagCounts[t] = (tagCounts[t] || 0) + 1; });
    });
    var topTag = Object.keys(tagCounts).sort(function(a, b) { return tagCounts[b] - tagCounts[a]; })[0];
    var tagText = topTag ? 'You\'ve been tagging \u201c' + topTag + '\u201d a lot lately.' : '';

    var streakText = streak >= 3 ? streak + '-day streak\u2014keep it up.' : streak > 0 ? 'Day ' + streak + ' of your streak.' : '';

    var parts = [todayText, trendText, tagText, streakText].filter(Boolean);
    return parts.slice(0, 3).join(' ');
}

function updateDashboard() {
    var noDataFloating = document.getElementById('noDataFloatingBanner');
    if (noDataFloating && Object.keys(entries).length > 0) noDataFloating.classList.remove('show');

    // Smart greeting + narrative
    var greetingEl = document.getElementById('dashboardGreeting');
    var narrativeEl = document.getElementById('dashboardNarrative');
    if (greetingEl) greetingEl.textContent = buildDashboardGreeting();
    if (narrativeEl) {
        narrativeEl.classList.add('loading');
        var narrative = buildDashboardNarrative();
        narrativeEl.textContent = narrative;
        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                narrativeEl.classList.remove('loading');
            });
        });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayData = entries[today];
    var moodEl = document.getElementById('todayMood');
    var sleepEl = document.getElementById('todaySleep');
    var energyEl = document.getElementById('todayEnergy');
    var streakEl = document.getElementById('streak');
    var progressEl = document.getElementById('streakProgress');
    
    [moodEl, sleepEl, energyEl, streakEl].forEach(function(el) {
        if (!el) return;
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '0';
        requestAnimationFrame(function() {
            el.classList.remove('skeleton');
            requestAnimationFrame(function() {
                el.style.opacity = '1';
            });
        });
    });
    if (todayData) {
        var curM = parseFloat(moodEl.innerText);
        var curS = parseFloat(sleepEl.innerText);
        var curE = parseFloat(energyEl.innerText);
        animateValue(moodEl, isNaN(curM) ? todayData.mood : curM, todayData.mood, 0.5);
        animateValue(sleepEl, isNaN(curS) ? todayData.sleep : curS, todayData.sleep, 0.5);
        animateValue(energyEl, isNaN(curE) ? todayData.energy : curE, todayData.energy, 0.5);
    } else {
        moodEl.innerText = '--';
        sleepEl.innerText = '--';
        energyEl.innerText = '--';
        // Show gentle prompt on metric cards if no entries at all
        var hasAnyEntry = Object.keys(entries).length > 0;
        var grid = document.querySelector('#dashboard .metrics');
        if (grid) grid.classList.toggle('metrics-no-data', !hasAnyEntry);
    }

    // Tint the mood metric card based on today's mood value
    var moodCard = moodEl && moodEl.closest('.metric');
    if (moodCard) {
        var moodNum = todayData && todayData.mood != null ? Number(todayData.mood) : null;
        moodCard.removeAttribute('style');
        if (moodNum != null && !isNaN(moodNum)) {
            var hue = moodNum >= 7 ? 'var(--heat-good)' : moodNum >= 4 ? 'var(--heat-mid)' : 'var(--heat-bad)';
            moodCard.style.borderColor = 'color-mix(in srgb, ' + hue + ' 30%, var(--border))';
            moodCard.style.background = 'color-mix(in srgb, ' + hue + ' 6%, var(--surface))';
        }
    }
    
    var streak = 0;
    var checkDate = new Date();
    var todayStr2 = checkDate.toISOString().split('T')[0];
    // If today has no entry yet, start the streak check from yesterday
    // so yesterday's streak still shows (streak doesn't break until tomorrow)
    if (!entries[todayStr2]) {
        checkDate.setDate(checkDate.getDate() - 1);
    }
    while (true) {
        var dateStr = checkDate.toISOString().split('T')[0];
        if (entries[dateStr]) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }
    var prevStreak = parseInt(streakEl.innerText, 10);
    if (isNaN(prevStreak)) prevStreak = 0;
    animateValue(streakEl, prevStreak, streak, 0.6, '');
    
    // Progress bar = % toward the next milestone (clear, intuitive)
    var pct = 0;
    if (streak >= 100) {
        pct = 100;
    } else if (streak >= 50) {
        pct = ((streak - 50) / 50) * 100; // 50→100
    } else if (streak >= 30) {
        pct = ((streak - 30) / 20) * 100; // 30→50
    } else if (streak >= 14) {
        pct = ((streak - 14) / 16) * 100; // 14→30
    } else if (streak >= 7) {
        pct = ((streak - 7) / 7) * 100; // 7→14
    } else {
        pct = (streak / 7) * 100; // 0→7
    }
    if (progressEl) progressEl.style.width = Math.min(100, Math.max(0, pct)) + '%';
    var labelsEl = document.getElementById('streakProgressLabels');
    if (labelsEl) {
        var fromLabel = prevMilestone === 0 ? 'Start' : prevMilestone + 'd';
        labelsEl.innerHTML = '<span>' + fromLabel + '</span><span>' + nextMilestone + ' days</span>';
    }
    
    if (streak < lastStreakMilestone) lastStreakMilestone = streak;
    if ([7, 50, 100].indexOf(streak) >= 0 && streak > lastStreakMilestone) {
        lastStreakMilestone = streak;
        fireConfetti();
    }
    // Update milestone label
    var milestoneEl = document.getElementById('streakMilestoneLabel');
    if (milestoneEl) {
        var nextM = streak >= 100 ? 100 : streak >= 50 ? 100 : streak >= 30 ? 50 : streak >= 14 ? 30 : streak >= 7 ? 14 : 7;
        var daysLeft = nextM - streak;
        if (streak >= 100) milestoneEl.textContent = '🏆 Century streak!';
        else if (streak >= 50) milestoneEl.textContent = '⭐ ' + daysLeft + ' days to 100';
        else if (streak >= 30) milestoneEl.textContent = '🎯 ' + daysLeft + ' days to 50';
        else if (streak >= 14) milestoneEl.textContent = '🔥 ' + daysLeft + ' days to 30';
        else if (streak >= 7) milestoneEl.textContent = '✨ ' + daysLeft + ' days to 14';
        else if (streak > 0) milestoneEl.textContent = daysLeft + ' days to first milestone';
        else milestoneEl.textContent = 'Start tracking to build a streak';
    }
    if (typeof renderMoodVelocity === 'function') renderMoodVelocity();
    if (typeof renderDayOfWeekChart === 'function') renderDayOfWeekChart();
}

var calendarViewState = 'year';
var calendarMonthDate = new Date();
var calendarWeekStart = new Date();
(function initCalendarWeek() {
    var d = new Date();
    var day = d.getDay();
    var diff = d.getDate() - day + (day === 0 ? -6 : 1);
    calendarWeekStart = new Date(d.setDate(diff));
    calendarWeekStart.setHours(0,0,0,0);
})();
var entryModalDate = '';

function setCalendarView(view, button) {
    calendarViewState = view || calendarViewState;
    document.querySelectorAll('.calendar-view-tabs button').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-view') === calendarViewState);
    });
    document.getElementById('calendarYearPanel').classList.toggle('active', calendarViewState === 'year');
    document.getElementById('calendarMonthPanel').classList.toggle('active', calendarViewState === 'month');
    document.getElementById('calendarWeekPanel').classList.toggle('active', calendarViewState === 'week');
    document.getElementById('calendarListPanel').classList.toggle('active', calendarViewState === 'list');
    renderCalendarCurrentView();
}

function renderCalendarCurrentView() {
    if (calendarViewState === 'year') renderHeatmap();
    else if (calendarViewState === 'month') renderMonthGrid();
    else if (calendarViewState === 'week') renderWeekTimeline();
    else if (calendarViewState === 'list') renderCalendarList();
}

function moodToRgb(mood) {
    if (mood == null || mood === undefined) return null;
    var m = Math.max(1, Math.min(10, parseFloat(mood)));
    var r, g, b;
    if (m <= 5) {
        var t = (m - 1) / 4;
        r = Math.round(201 + (212 - 201) * t);
        g = Math.round(125 + (175 - 125) * t);
        b = Math.round(96 + (55 - 96) * t);
    } else {
        var t = (m - 5) / 5;
        r = Math.round(212 + (139 - 212) * t);
        g = Math.round(175 + (157 - 175) * t);
        b = Math.round(55 + (131 - 55) * t);
    }
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function getBestWorstDates() {
    var best = null, worst = null;
    var dates = Object.keys(entries);
    for (var i = 0; i < dates.length; i++) {
        var m = entries[dates[i]].mood;
        if (m != null) {
            if (best === null || m > (entries[best] && entries[best].mood)) best = dates[i];
            if (worst === null || m < (entries[worst] && entries[worst].mood)) worst = dates[i];
        }
    }
    return { best: best, worst: worst };
}

function getStreakAtDate(dateStr) {
    var d = new Date(dateStr + 'T12:00:00');
    var count = 0;
    while (true) {
        var s = d.toISOString().split('T')[0];
        if (entries[s]) count++;
        else break;
        d.setDate(d.getDate() - 1);
    }
    return count;
}

function showDayPreview(e, dateStr) {
    var tip = document.getElementById('dayPreviewTooltip');
    if (!tip) return;
    var entry = entries[dateStr];
    var dateLabel = dateStr ? (function() {
        var p = dateStr.split('-').map(Number);
        var d = new Date(p[0], p[1] - 1, p[2]);
        return d.toLocaleDateString(typeof getLocale === 'function' ? getLocale() : 'en', { weekday: 'short', month: 'short', day: 'numeric' });
    })() : dateStr;
    var msg = '';
    if (entry) {
        msg = '<strong>' + dateLabel + '</strong>';
        var sleepTotal = entry.sleepTotal != null ? entry.sleepTotal : entry.sleep;
        var segCount = entry.sleepSegmentCount != null ? entry.sleepSegmentCount : (entry.sleepSegments && entry.sleepSegments.length) || 0;
        var sleepLabel = sleepTotal != null ? sleepTotal.toFixed(1) + 'h' : '–';
        if (sleepTotal != null && segCount > 1) sleepLabel += ' (' + segCount + ' segments)';
        msg += '<span>Mood: ' + (entry.mood != null ? entry.mood.toFixed(1) : '–') + '</span>';
        msg += '<span>Energy: ' + (entry.energy != null ? entry.energy.toFixed(1) : '–') + '</span>';
        msg += '<span>Sleep: ' + sleepLabel + '</span>';
    } else {
        msg = '<strong>' + dateLabel + '</strong><span>No entry — click to add</span>';
    }
    tip.innerHTML = msg;
    tip.style.display = 'block';
    tip.style.left = (e.pageX + 12) + 'px';
    tip.style.top = (e.pageY + 12) + 'px';
    tip.setAttribute('aria-hidden', 'false');
}
function hideDayPreview() {
    var tip = document.getElementById('dayPreviewTooltip');
    if (tip) { tip.style.display = 'none'; tip.setAttribute('aria-hidden', 'true'); }
}

// journalMode = true when opened from the journal entry list (shows journal button, deletes journal only)
var entryModalJournalMode = false;
function showEntryModalFromJournal(dateStr) {
    entryModalJournalMode = true;
    showEntryModal(dateStr);
}
function showEntryModal(dateStr) {
    entryModalDate = dateStr;
    var modal = document.getElementById('entryModal');
    var title = document.getElementById('entryModalTitle');
    var subtitle = document.getElementById('entryModalSubtitle');
    var body = document.getElementById('entryModalBody');
    var editBtn = document.getElementById('entryModalEditBtn');
    var journalBtn = document.getElementById('entryModalJournalBtn');
    var entry = entries[dateStr];
    
    // Format date nicely
    var d = new Date(dateStr + 'T12:00:00');
    var dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    var monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    title.textContent = dayNames[d.getDay()] + ', ' + monthNames[d.getMonth()] + ' ' + d.getDate();
    if (subtitle) subtitle.textContent = dateStr;
    
    if (editBtn) editBtn.style.display = '';
    if (journalBtn) {
        var hasJournalForMode = entry && !!(notesValueToPlainText(entry) || (Array.isArray(entry.photos) && entry.photos.length));
        journalBtn.style.display = (entryModalJournalMode || hasJournalForMode) ? '' : 'none';
    }
    
    if (entry) {
        var sleepTotal = entry.sleepTotal != null ? entry.sleepTotal : entry.sleep;
        var segCount = entry.sleepSegmentCount != null ? entry.sleepSegmentCount : (entry.sleepSegments && entry.sleepSegments.length) || 0;
        var sleepLabel = sleepTotal != null ? '<strong>' + sleepTotal.toFixed(1) + '</strong> hrs' : '–';
        if (sleepTotal != null && segCount > 1) sleepLabel += ' <span style="font-size:0.85em;opacity:0.85;">(' + segCount + ' segments)</span>';
        var journalPreview = notesValueToPlainText(entry);
        var hasJournal = !!(journalPreview || (Array.isArray(entry.photos) && entry.photos.length));
        var safeDate = dateStr.replace(/'/g,'\\\'');
        
        function emFieldRow(icon, label, valueHtml, fieldKey, editHint, editType, deleteOnly) {
            var actions = '';
            if (deleteOnly) {
                actions = '<div class="em-field-actions"><button class="em-btn em-del" title="Delete ' + label + '" onclick="deleteMetric(\'' + safeDate + '\',\'' + fieldKey + '\')" aria-label="Delete ' + label + '">🗑</button></div>';
            } else if (editHint !== false) {
                actions = '<div class="em-field-actions">' +
                '<button class="em-btn" title="Edit ' + label + '" onclick="editMetric(\'' + safeDate + '\',\'' + fieldKey + '\')" aria-label="Edit ' + label + '">✏️</button>' +
                '<button class="em-btn em-del" title="Delete ' + label + '" onclick="deleteMetric(\'' + safeDate + '\',\'' + fieldKey + '\')" aria-label="Delete ' + label + '">🗑</button>' +
                '</div>';
            }
            var inputEl = '';
            if (editHint !== false && !deleteOnly) {
                var isText = editType === 'tags' || editType === 'text';
                if (isText) {
                    inputEl = '<input class="em-inline-input" type="text" id="em-input-' + fieldKey + '" placeholder="' + escapeHtml(editHint || '') + '" />';
                } else if (fieldKey === 'sleep') {
                    inputEl = '<input class="em-inline-input" type="number" min="0" max="12" step="0.1" id="em-input-' + fieldKey + '" placeholder="0–12 hours" />';
                } else {
                    inputEl = '<input class="em-inline-input" type="number" min="1" max="10" step="0.5" id="em-input-' + fieldKey + '" placeholder="' + (editHint || '1–10 (0.5 steps)') + '" />';
                }
            }
            return '<div class="em-field-row" data-field="' + fieldKey + '">' +
                '<span class="em-field-icon">' + icon + '</span>' +
                '<span class="em-field-label">' + label + '</span>' +
                '<span class="em-field-value em-score" id="em-val-' + fieldKey + '">' + valueHtml + '</span>' +
                actions +
                '</div>' +
                (inputEl ? '<div class="em-inline-edit-row" id="em-edit-' + fieldKey + '" data-field="' + fieldKey + '" data-date="' + escapeHtml(dateStr) + '">' +
                inputEl +
                '<button type="button" class="btn btn-secondary em-save-btn" data-field="' + fieldKey + '">Save</button>' +
                '<button type="button" class="btn btn-neutral em-cancel-btn" data-field="' + fieldKey + '">✕</button>' +
                '</div>' : '');
        }
        
        // Build tag chips
        var tagsHtml = '–';
        if (Array.isArray(entry.tags) && entry.tags.length) {
            tagsHtml = entry.tags.map(function(t) {
                var c = getTagColor(t);
                return '<span class="em-tag-chip" style="background:' + c.background + ';border:1px solid ' + c.borderColor + ';color:' + c.textColor + '">' +
                    '<span class="tag-hash-icon" style="background:' + c.hashIconBackground + ';color:' + c.textColor + ';opacity:0.85">#</span>' + escapeHtml(t) + '</span>';
            }).join('');
        }
        
        var activitiesHtml = '';
        if (Array.isArray(entry.activities) && entry.activities.length) {
            activitiesHtml = escapeHtml(entry.activities.join(', '));
        }
        
        body.innerHTML =
            emFieldRow('😊', 'Mood', (entry.mood != null ? '<strong>' + roundMoodEnergySleepQuality(entry.mood).toFixed(1) + '</strong><span style="font-size:0.8em;opacity:0.5;font-family:var(--font-body);"> /10</span>' : '–'), 'mood', '1–10') +
            emFieldRow('⚡', 'Energy', (entry.energy != null ? '<strong>' + roundMoodEnergySleepQuality(entry.energy).toFixed(1) + '</strong><span style="font-size:0.8em;opacity:0.5;font-family:var(--font-body);"> /10</span>' : '–'), 'energy', '1–10') +
            emFieldRow('🌙', 'Sleep', sleepLabel, 'sleep', '0–12 hours') +
            (activitiesHtml ? emFieldRow('🏃', 'Activities', activitiesHtml, 'activities', 'activity1, activity2', 'tags') : '') +
            emFieldRow('🏷️', 'Tags', tagsHtml, 'tags', 'e.g. happy, calm', 'tags') +
            (hasJournal ? 
                emFieldRow('📓', 'Journal', '<span style="font-size:0.88rem;line-height:1.5;color:var(--text-muted);">' + (window.auraPrivateMode ? '••••••' : escapeHtml(String(journalPreview).slice(0, 140)) + (journalPreview.length > 140 ? '…' : '')) + '</span>', 'journal', false, false, true) : '') +
            '<button type="button" class="btn btn-danger entry-modal-delete-btn" onclick="emDeleteAll(\'' + safeDate + '\')">🗑 Delete entire entry for this day</button>';
    } else {
        body.innerHTML = '<div style="padding:24px 22px;color:var(--text-muted);text-align:center;">' +
            '<div style="font-size:2rem;margin-bottom:8px;">📭</div>' +
            '<div style="font-size:0.95rem;">No entry for this day.</div>' +
            '<div style="font-size:0.85rem;margin-top:4px;">Click Edit Check-In to add one.</div>' +
            '</div>';
        if (journalBtn) journalBtn.style.display = 'none';
    }
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    var closeBtn = modal.querySelector('.entry-modal-close');
    if (closeBtn) closeBtn.focus();
}
(function bindEntryModalInlineEditDelegation() {
    function handleBodyClick(e) {
        var saveBtn = e.target.closest('.em-save-btn');
        if (saveBtn) {
            e.preventDefault();
            e.stopPropagation();
            var row = saveBtn.closest('.em-inline-edit-row');
            var field = saveBtn.getAttribute('data-field') || (row && row.getAttribute('data-field'));
            var dateStr = (row && row.getAttribute('data-date')) || entryModalDate;
            if (field && dateStr && typeof emSaveField === 'function') emSaveField(dateStr, field);
            return;
        }
        var cancelBtn = e.target.closest('.em-cancel-btn');
        if (cancelBtn) {
            e.preventDefault();
            e.stopPropagation();
            var field = cancelBtn.getAttribute('data-field');
            if (field && typeof emCloseEdit === 'function') emCloseEdit(field);
        }
    }
    document.addEventListener('DOMContentLoaded', function() {
        var body = document.getElementById('entryModalBody');
        if (!body || body._emDelegateBound) return;
        body._emDelegateBound = true;
        body.addEventListener('click', handleBodyClick);
    });
    var body = document.getElementById('entryModalBody');
    if (body && !body._emDelegateBound) {
        body._emDelegateBound = true;
        body.addEventListener('click', handleBodyClick);
    }
})();

// Premium field inline edit/delete helpers
function emOpenEdit(dateStr, field) {
    var editRow = document.getElementById('em-edit-' + field);
    if (!editRow) return;
    // Close other open editors
    document.querySelectorAll('.em-inline-edit-row.open').forEach(function(r) { r.classList.remove('open'); });
    var entry = entries[dateStr];
    var inp = document.getElementById('em-input-' + field);
    if (inp && entry) {
        if (field === 'tags') inp.value = Array.isArray(entry.tags) ? entry.tags.join(', ') : '';
        else if (field === 'activities') inp.value = Array.isArray(entry.activities) ? entry.activities.join(', ') : '';
        else if (field === 'mood') inp.value = entry.mood != null ? roundMoodEnergySleepQuality(entry.mood) : '';
        else if (field === 'energy') inp.value = entry.energy != null ? roundMoodEnergySleepQuality(entry.energy) : '';
        else if (field === 'sleep') inp.value = (entry.sleepTotal != null ? entry.sleepTotal : entry.sleep) || '';
    }
    editRow.classList.add('open');
    if (inp) { inp.focus(); inp.select(); }
}
function emCloseEdit(field) {
    var editRow = document.getElementById('em-edit-' + field);
    if (editRow) editRow.classList.remove('open');
}
async function emSaveField(dateStr, field) {
    var inp = document.getElementById('em-input-' + field);
    if (!inp) return;
    var val = inp.value.trim();
    var update = {};
    if (field === 'tags') {
        var tags = val.split(/[,\s]+/).map(function(t) { return t.replace(/^#/, '').trim(); }).filter(Boolean);
        update.tags = tags;
    } else if (field === 'mood') {
        var n = parseFloat(val);
        if (isNaN(n) || n < 1 || n > 10) { showToast('Enter a value between 1 and 10'); return; }
        update.mood = roundMoodEnergySleepQuality(n);
    } else if (field === 'energy') {
        var n = parseFloat(val);
        if (isNaN(n) || n < 1 || n > 10) { showToast('Enter a value between 1 and 10'); return; }
        update.energy = roundMoodEnergySleepQuality(n);
    } else if (field === 'sleep') {
        var n = parseFloat(val);
        if (isNaN(n) || n < 0 || n > 12) { showToast('Sleep must be 0–12 hours'); return; }
        update.sleep = Math.round(n * 10) / 10;
        update.sleepTotal = update.sleep;
        update.sleepSegments = [];
        update.sleepSegmentCount = 0;
    } else if (field === 'activities') {
        var acts = val.split(/[,]+/).map(function(t) { return t.trim(); }).filter(Boolean);
        update.activities = acts;
    }
    if (Object.keys(update).length === 0) return;
    try {
        await upsertDailyRecord(dateStr, update);
        emCloseEdit(field);
        showEntryModal(dateStr);
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof renderCharts === 'function') renderCharts();
        if (typeof renderEntryList === 'function') renderEntryList();
        showToast('Saved ✓');
    } catch (err) {
        console.error('[Aura] emSaveField error:', err);
        showToast('Save failed. Try again.');
    }
}
function emDeleteField(dateStr, field) {
    var labels = { mood: 'Mood', energy: 'Energy', sleep: 'Sleep data', tags: 'Tags', activities: 'Activities', journal: 'Journal entry' };
    showPremiumConfirm(
        'Delete this value?',
        'This action cannot be undone.',
        'Delete',
        function() {
            var update = {};
            if (field === 'mood') update.mood = null;
            else if (field === 'energy') update.energy = null;
            else if (field === 'sleep') { update.sleep = null; update.sleepTotal = null; update.sleepSegments = []; }
            else if (field === 'tags') update.tags = [];
            else if (field === 'activities') update.activities = [];
            else if (field === 'journal') { update.journal = ''; update.photos = []; }
            upsertDailyRecord(dateStr, update).then(function() {
                if (typeof loadAllEntries === 'function') loadAllEntries();
                if (typeof updateDashboard === 'function') updateDashboard();
                if (typeof renderCharts === 'function') renderCharts();
                showEntryModal(dateStr);
                showToast('Deleted');
            });
        }
    );
}
function editMetric(entryDate, field) {
    emOpenEdit(entryDate, field);
}
function deleteMetric(entryDate, field) {
    emDeleteField(entryDate, field);
}
function emDeleteAll(dateStr) {
    closeEntryModal();
    openFullEntryDeleteConfirm(dateStr);
}
function openJournalEntryFromModal(dateStr) {
    closeEntryModal();
    entryModalJournalMode = false;
    openJournalEntry(dateStr || entryModalDate);
}
function openDeleteEntryModalFromEntryModal(dateStr) {
    closeEntryModal();
    entryModalJournalMode = false;
    openDeleteEntryModal(dateStr || entryModalDate);
}
function closeEntryModal() {
    entryModalJournalMode = false;
    var modal = document.getElementById('entryModal');
    if (modal) { modal.setAttribute('aria-hidden', 'true'); modal.classList.remove('show'); }
}
function closeModal() {
    closeEntryModal();
}
var _premiumConfirmCallback = null;
function showPremiumConfirm(title, desc, btnLabel, onConfirm) {
    var modal = document.getElementById('premiumConfirmModal');
    var titleEl = document.getElementById('premiumConfirmTitle');
    var descEl = document.getElementById('premiumConfirmDesc');
    var okBtn = document.getElementById('premiumConfirmOkBtn');
    if (!modal) { if (onConfirm && confirm(title + '\n' + desc)) onConfirm(); return; }
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = desc;
    if (okBtn) { okBtn.textContent = btnLabel || 'Confirm'; }
    _premiumConfirmCallback = onConfirm;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    if (okBtn) { okBtn.onclick = function() { closePremiumConfirm(); if (_premiumConfirmCallback) _premiumConfirmCallback(); }; okBtn.focus(); }
}
function closePremiumConfirm() {
    var modal = document.getElementById('premiumConfirmModal');
    if (modal) { modal.classList.remove('show'); modal.setAttribute('aria-hidden', 'true'); }
}
function openEntryForDate(dateStr) {
    closeEntryModal();
    var dateInput = document.getElementById('date');
    var targetDate = dateStr || entryModalDate || getWorkingEntryDate();
    if (dateInput) setDateInputDisplay(dateInput, targetDate);
    setWorkingEntryDate(targetDate);
    navigate('entry');
}
function editEntry(dateStr) {
    openEntryForDate(dateStr);
}
function navigateTo(page, entryDate) {
    var dateStr = entryDate || entryModalDate;
    if (page === 'entry') {
        openEntryForDate(dateStr);
    } else if (page === 'journal') {
        closeEntryModal();
        entryModalJournalMode = false;
        openJournalEntry(dateStr || entryModalDate);
    }
}

var pendingFullEntryDeleteDate = '';
var lastDeletedEntryBackup = null;
var undoToastTimeout = null;
function openFullEntryDeleteConfirm(dateStr) {
    if (!dateStr || !entries[dateStr]) return;
    closeEntryModal();
    pendingFullEntryDeleteDate = dateStr;
    var modal = document.getElementById('fullEntryDeleteModal');
    if (modal) {
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(function() {
            var btn = document.getElementById('fullEntryDeleteConfirmBtn');
            if (btn) btn.focus();
        });
    }
}
function closeFullEntryDeleteModal() {
    var modal = document.getElementById('fullEntryDeleteModal');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }
    pendingFullEntryDeleteDate = '';
}
async function confirmFullEntryDeleteFromModal() {
    var dateStr = pendingFullEntryDeleteDate;
    if (!dateStr || !entries[dateStr]) {
        closeFullEntryDeleteModal();
        return;
    }
    var entry = entries[dateStr];
    var backup = serializeDailyRecord(normalizeDailyRecord(entry, dateStr));
    closeFullEntryDeleteModal();
    try {
        await db.entries.delete(entry.id);
    } catch (e) {}
    await loadAllEntries();
    invalidateDailySummaryCache();
    if (currentJournalEntryDate === dateStr) {
        currentJournalEntryDate = null;
        if (typeof ensureJournalEntrySelection === 'function') ensureJournalEntrySelection(true);
    }
    renderHeatmap();
    renderEntryList();
    if (typeof renderCalendarList === 'function') renderCalendarList();
    updateDashboard();
    if (typeof renderCharts === 'function') renderCharts();
    if (typeof generateInsights === 'function') generateInsights();
    lastDeletedEntryBackup = backup;
    showUndoToast();
}
function showUndoToast() {
    if (undoToastTimeout) clearTimeout(undoToastTimeout);
    var el = document.getElementById('undoToast');
    if (el) {
        el.classList.add('show');
        el.setAttribute('aria-hidden', 'false');
    }
    undoToastTimeout = setTimeout(function() {
        hideUndoToast();
        lastDeletedEntryBackup = null;
    }, 4500);
}
function hideUndoToast() {
    var el = document.getElementById('undoToast');
    if (el) {
        el.classList.remove('show');
        el.setAttribute('aria-hidden', 'true');
    }
    if (undoToastTimeout) { clearTimeout(undoToastTimeout); undoToastTimeout = null; }
}
function undoLastDeletedEntry() {
    var backup = lastDeletedEntryBackup;
    if (!backup) return;
    hideUndoToast();
    lastDeletedEntryBackup = null;
    db.entries.put(backup).then(function() { return loadAllEntries(); }).then(function() {
        invalidateDailySummaryCache();
        renderHeatmap();
        renderEntryList();
        updateDashboard();
        if (typeof renderCharts === 'function') renderCharts();
        if (typeof generateInsights === 'function') generateInsights();
        showToast('Entry restored');
    }).catch(function(e) { console.error(e); });
}

function calendarMonthPrev() {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() - 1);
    renderMonthGrid();
}
function calendarMonthNext() {
    calendarMonthDate.setMonth(calendarMonthDate.getMonth() + 1);
    renderMonthGrid();
}
function renderMonthGrid() {
    var container = document.getElementById('monthGrid');
    if (!container) return;
    var year = calendarMonthDate.getFullYear();
    var month = calendarMonthDate.getMonth();
    document.getElementById('calendarMonthTitle').textContent = new Date(year, month).toLocaleDateString(typeof getLocale === 'function' ? getLocale() : 'en', { month: 'long', year: 'numeric' });
    var first = new Date(year, month, 1);
    var last = new Date(year, month + 1, 0);
    var firstDayOfWeek = typeof getFirstDayOfWeek === 'function' ? getFirstDayOfWeek() : 1;
    var startDay = (first.getDay() - firstDayOfWeek + 7) % 7;
    var daysInMonth = last.getDate();
    var weekdays = typeof getLocaleWeekdayNames === 'function' ? getLocaleWeekdayNames(typeof getLocale === 'function' ? getLocale() : 'en', firstDayOfWeek) : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    var html = weekdays.map(function(w) { return '<div class="weekday">' + w + '</div>'; }).join('');
    var i, d;
    for (i = 0; i < startDay; i++) html += '<div class="day-cell empty"></div>';
    var todayStr = new Date().toISOString().split('T')[0];
    var bw = getBestWorstDates();
    for (d = 1; d <= daysInMonth; d++) {
        var date = new Date(year, month, d);
        var dateStr = date.toISOString().split('T')[0];
        var entry = entries[dateStr];
        var mood = entry && entry.mood != null ? entry.mood : null;
        var bg = mood != null ? moodToRgb(mood) : 'var(--sand)';
        var extra = '';
        if (dateStr === todayStr) extra += ' today';
        if (dateStr === bw.best) extra += ' best-day';
        if (dateStr === bw.worst) extra += ' worst-day';
        html += '<div class="day-cell' + extra + '" style="background:' + (bg || 'var(--sand)') + '" data-date="' + dateStr + '" onclick="showEntryModal(\'' + dateStr + '\')" onmouseenter="showDayPreview(event,\'' + dateStr + '\')" onmouseleave="hideDayPreview()">' + d + '</div>';
    }
    container.innerHTML = html;
}

function calendarWeekPrev() {
    calendarWeekStart.setDate(calendarWeekStart.getDate() - 7);
    renderWeekTimeline();
}
function calendarWeekNext() {
    calendarWeekStart.setDate(calendarWeekStart.getDate() + 7);
    renderWeekTimeline();
}
function renderWeekTimeline() {
    var container = document.getElementById('weekTimeline');
    if (!container) return;
    var start = new Date(calendarWeekStart);
    var end = new Date(start);
    end.setDate(end.getDate() + 6);
    var loc = typeof getLocale === 'function' ? getLocale() : 'en';
    var weekOfStr = typeof getLocaleStrings === 'function' ? getLocaleStrings(loc).weekOf : 'Week of ';
    document.getElementById('calendarWeekTitle').textContent = weekOfStr + start.toLocaleDateString(loc, { month: 'short', day: 'numeric', year: 'numeric' });
    var html = '';
    for (var i = 0; i < 7; i++) {
        var d = new Date(start);
        d.setDate(d.getDate() + i);
        var dateStr = d.toISOString().split('T')[0];
        var entry = entries[dateStr];
        var mood = entry && entry.mood != null ? entry.mood : 0;
        var sleep = entry && entry.sleep != null ? entry.sleep : 0;
        var energy = entry && entry.energy != null ? entry.energy : 0;
        var moodH = Math.max(6, (mood / 10) * 34);
        var sleepH = Math.max(6, (sleep / 12) * 34);
        var energyH = Math.max(6, (energy / 10) * 34);
        html += '<div class="week-row" onclick="showEntryModal(\'' + dateStr + '\')" onmouseenter="showDayPreview(event,\'' + dateStr + '\')" onmouseleave="hideDayPreview()">';
        html += '<span class="week-date">' + d.toLocaleDateString(typeof getLocale === 'function' ? getLocale() : 'en', { weekday: 'short', month: 'short', day: 'numeric' }) + '</span>';
        html += '<div class="week-bars">';
        html += '<div class="week-bar" style="height:' + moodH + 'px;background:var(--heat-good);" title="Mood ' + mood + '"></div>';
        html += '<div class="week-bar" style="height:' + sleepH + 'px;background:var(--chart-2);" title="Sleep ' + sleep + 'h"></div>';
        html += '<div class="week-bar" style="height:' + energyH + 'px;background:var(--accent);" title="Energy ' + energy + '"></div>';
        html += '</div></div>';
    }
    container.innerHTML = html;
}

function renderCalendarList() {
    var ul = document.getElementById('calendarEntryList');
    if (!ul) return;
    var dates = Object.keys(entries).sort().reverse();
    var todayStr = new Date().toISOString().split('T')[0];
    var dateFmt = window.auraDateFormat || 'MD';
    ul.innerHTML = dates.map(function(dateStr) {
        var e = entries[dateStr];
        var moodStr = e && e.mood != null ? e.mood.toFixed(1) : '–';
        var energyStr = e && e.energy != null ? e.energy.toFixed(1) : '–';
        var metricsText = 'Mood ' + moodStr + ' · Energy ' + energyStr;
        var displayDate = formatDisplayDate(dateStr, dateFmt);
        var safeDate = dateStr.replace(/'/g, "\\'");
        return '<li onclick="showEntryModal(\'' + safeDate + '\')"><div class="entry-row-content"><span class="entry-date">' + escapeHtml(displayDate) + (dateStr === todayStr ? ' (today)' : '') + '</span><span class="entry-list-metrics">' + escapeHtml(metricsText) + '</span></div></li>';
    }).join('') || '<li style="color: var(--text-muted); cursor: default; padding: var(--space-md);">No entries yet.</li>';
}

function exportHeatmapPNG() {
    var container = document.getElementById('yearHeatmap');
    if (!container || !container.children.length) return;
    var cellW = 14;
    var gap = 6;
    var cols = 53;
    var total = container.children.length;
    var rows = Math.ceil(total / cols);
    var w = cols * (cellW + gap) - gap;
    var h = rows * (cellW + gap) - gap;
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    var ctx = canvas.getContext('2d');
    var todayStr = new Date().toISOString().split('T')[0];
    var bw = getBestWorstDates();
    for (var i = 0; i < container.children.length; i++) {
        var wrap = container.children[i];
        var dayEl = wrap.querySelector('.day');
        if (!dayEl) continue;
        var r = Math.floor(i / cols);
        var c = i % cols;
        var x = c * (cellW + gap);
        var y = r * (cellW + gap);
        var bg = dayEl.style.backgroundColor || getComputedStyle(dayEl).backgroundColor;
        ctx.fillStyle = bg;
        ctx.fillRect(x, y, cellW, cellW);
        var dateStr = dayEl.dataset.date;
        if (dateStr === todayStr) {
            ctx.strokeStyle = 'rgba(107,125,99,0.9)';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellW, cellW);
        }
    }
    var a = document.createElement('a');
    a.download = 'aura-heatmap-' + new Date().toISOString().split('T')[0] + '.png';
    a.href = canvas.toDataURL('image/png');
    a.click();
}

// Render Heatmap
function renderHeatmap() {
    const container = document.getElementById('yearHeatmap');
    const monthsRow = document.getElementById('yearHeatmapMonths');
    if (!container) return;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const todayStr = today.toISOString().split('T')[0];
    
    // Start grid with January: Sunday of the week that contains Jan 1 of current year
    var year = today.getFullYear();
    var gridStartDate = new Date(year, 0, 1); // Jan 1
    var startDow = gridStartDate.getDay();
    gridStartDate.setDate(gridStartDate.getDate() - startDow);
    
    var totalDays = 53 * 7;
    var weekCount = 53;
    var gridEndDate = new Date(gridStartDate);
    gridEndDate.setDate(gridEndDate.getDate() + totalDays - 1);
    
    var locale = typeof getLocale === 'function' ? getLocale() : 'en';
    var monthNamesShort = typeof getLocaleMonthNames === 'function' ? getLocaleMonthNames(locale, false) : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    
    // Build month label row — one entry per column (week)
    // Each column = 7 days. Show month name when month changes.
    var colWidthPct = (100 / weekCount).toFixed(4) + '%';
    
    if (monthsRow) {
        monthsRow.innerHTML = '';
        var lastMonth = -1;
        for (var col = 0; col < weekCount; col++) {
            var weekStart = new Date(gridStartDate);
            weekStart.setDate(weekStart.getDate() + col * 7);
            // Check if month changes in this column
            var monthLabel = '';
            for (var r = 0; r < 7; r++) {
                var checkDay = new Date(weekStart);
                checkDay.setDate(checkDay.getDate() + r);
                if (checkDay.getMonth() !== lastMonth && checkDay.getDate() <= 7) {
                    monthLabel = monthNamesShort[checkDay.getMonth()];
                    lastMonth = checkDay.getMonth();
                    break;
                }
                // Also catch month change mid-week
                if (r > 0 && checkDay.getDate() === 1) {
                    monthLabel = monthNamesShort[checkDay.getMonth()];
                    lastMonth = checkDay.getMonth();
                    break;
                }
            }
            if (!monthLabel && lastMonth < 0) {
                monthLabel = monthNamesShort[weekStart.getMonth()];
                lastMonth = weekStart.getMonth();
            }
            var cell = document.createElement('div');
            cell.className = 'month-cell';
            cell.textContent = monthLabel;
            cell.style.cssText = 'flex: 0 0 ' + colWidthPct + '; text-align: left; padding-left: 1px; overflow: hidden;';
            monthsRow.appendChild(cell);
        }
    }
    
    container.innerHTML = '';
    var bw = getBestWorstDates();
    var streakToday = 0;
    var checkDate = new Date(today);
    while (true) {
        var ds = checkDate.toISOString().split('T')[0];
        if (entries[ds]) { streakToday++; checkDate.setDate(checkDate.getDate() - 1); }
        else break;
    }
    var hintEl = document.getElementById('heatmapStreakHint');
    if (hintEl) hintEl.textContent = streakToday >= 0 ? streakToday + ' days' : '';
    
    // Render all 53*7 cells in column-first order (grid-auto-flow: column)
    // Grid: 7 rows (Sun-Sat), fills column by column left to right
    for (var day = 0; day < totalDays; day++) {
        var cellDate = new Date(gridStartDate);
        cellDate.setDate(cellDate.getDate() + day);
        var dateStr = cellDate.toISOString().split('T')[0];
        var isFuture = cellDate > today;
        
        const wrap = document.createElement('div');
        wrap.className = 'day-wrap';
        if (isFuture) { wrap.className += ' heatmap-empty'; }
        wrap.title = isFuture ? '' : dateStr;
        var streakHere = !isFuture && typeof getStreakAtDate === 'function' ? getStreakAtDate(dateStr) : 0;
        if (streakHere > 1) wrap.setAttribute('data-streak', 'true');
        
        const div = document.createElement('div');
        div.classList.add('day');
        div.dataset.date = dateStr;
        
        if (!isFuture) {
            const entry = entries[dateStr];
            if (entry && entry.mood != null) {
                if (entry.mood >= 7) div.classList.add('good');
                else if (entry.mood >= 4) div.classList.add('mid');
                else div.classList.add('bad');
            }
            if (dateStr === todayStr) div.classList.add('today');
            if (dateStr === bw.best) div.classList.add('best-day');
            if (dateStr === bw.worst) div.classList.add('worst-day');
            
            div.onclick = (function(ds) { return function() { showEntryModal(ds); }; })(dateStr);
            div.onmouseenter = (function(ds) { return function(e) { showDayPreview(e, ds); }; })(dateStr);
            div.onmouseleave = hideDayPreview;
        }
        
        wrap.appendChild(div);
        container.appendChild(wrap);
    }
    (function setupHeatmapScrollHint() {
        var wrap = document.querySelector('.year-heatmap-scroll-wrap');
        var hint = document.getElementById('heatmapScrollHint');
        if (!wrap || !hint) return;
        try {
            if (localStorage.getItem('auraHeatmapScrollSeen') === 'true') hint.classList.add('hidden');
        } catch (e) {}
        if (wrap._heatmapScrollHintDone) return;
        wrap._heatmapScrollHintDone = true;
        wrap.addEventListener('scroll', function onHeatmapScroll() {
            try {
                localStorage.setItem('auraHeatmapScrollSeen', 'true');
            } catch (e) {}
            hint.classList.add('hidden');
        }, { once: true });
    })();
}

var entryListShown = 200;
var ENTRY_LIST_CHUNK = 200;
function renderEntryList() {
    var ul = document.getElementById('entryList');
    if (!ul) return;
    var dates = Object.keys(entries).sort().reverse();
    if (filterByTag) dates = dates.filter(function(d) { return (entries[d].tags || []).indexOf(filterByTag) >= 0; });
    var total = dates.length;
    if (total === 0) {
        if (filterByTag) {
            ul.innerHTML = '<li style="color: var(--text-muted); padding: var(--space-md) 0; font-size: 0.9rem;">No entries tagged \u201c' + escapeHtml(filterByTag) + '\u201d yet.</li>';
        } else {
            ul.innerHTML = '<li class="entry-list-empty-state" style="padding: var(--space-lg) 0; text-align: center;">' +
                '<div style="font-size: 2rem; margin-bottom: var(--space-sm); opacity: 0.3;" aria-hidden="true">📔</div>' +
                '<p style="margin: 0 0 var(--space-sm); color: var(--text-muted); font-size: 0.9rem;">No journal entries yet.</p>' +
                '<button type="button" class="btn btn-secondary" onclick="navigate(\'entry\')" style="font-size: 0.85rem; height: 36px; padding: 0 14px;">Start your first check-in \u2192</button>' +
                '</li>';
        }
        return;
    }
    var show = total <= ENTRY_LIST_CHUNK ? total : Math.min(entryListShown, total);
    var slice = dates.slice(0, show);
    var dateFmt = window.auraDateFormat || 'MD';
    ul.innerHTML = slice.map(function(date) {
        var e = entries[date];
        var displayDate = formatDisplayDate(date, dateFmt);
        var moodStr = e && e.mood != null ? e.mood.toFixed(1) : '–';
        var energyStr = e && e.energy != null ? e.energy.toFixed(1) : '–';
        var metricsText = 'Mood ' + moodStr + ' · Energy ' + energyStr;
        var safeDate = date.replace(/'/g, "\\'");
        var activeClass = date === currentJournalEntryDate ? ' active' : '';
        return '<li class="entry-list-item' + activeClass + '" data-date="' + date + '"><div class="entry-row-swipe"><div class="entry-row-content"><span class="entry-date">' + escapeHtml(displayDate) + '</span><div class="entry-list-right"><span class="entry-list-metrics">' + escapeHtml(metricsText) + '</span><button type="button" class="entry-delete" title="Delete journal" aria-label="Delete journal for ' + date + '" onclick="event.stopPropagation(); openDeleteEntryModal(\'' + safeDate + '\', this)">🗑️</button></div></div></div></li>';
    }).join('');
    if (total > ENTRY_LIST_CHUNK && show < total) {
        var remaining = total - show;
        ul.innerHTML += '<li class="entry-list-load-more"><button type="button" class="btn-secondary" onclick="entryListLoadMore()">Load more (' + remaining + ' remaining)</button></li>';
    }
    if (typeof setupEntryListTouch === 'function') setupEntryListTouch();
}
function entryListLoadMore() {
    entryListShown += ENTRY_LIST_CHUNK;
    renderEntryList();
}

async function deleteJournalEntry(entryId) {
    var entryKey = getEntryKeyById(entryId);
    if (!entryKey || !entries[entryKey]) return;
    await upsertDailyRecord(entryKey, { journal: '', photos: [] });
    if (getWorkingEntryDate() === entryKey) renderEntryDailySummary(entryKey);
    renderHeatmap();
    if (currentJournalEntryDate === entryKey) {
        openJournalEntry(entryKey, { force: true });
    } else {
        renderEntryList();
    }
    updateDashboard();
    showToast('Journal deleted');
}

async function deleteEntry(entryId) {
    var entryKey = getEntryKeyById(entryId);
    if (!entryKey) return;
    await db.entries.delete(entryId);
    await loadAllEntries();
    invalidateDailySummaryCache();
    if (currentJournalEntryDate === entryKey) {
        currentJournalEntryDate = null;
        ensureJournalEntrySelection(true);
    }
    renderHeatmap();
    renderEntryList();
    if (typeof renderCalendarList === 'function') renderCalendarList();
    updateDashboard();
    if (typeof renderCharts === 'function') renderCharts();
    if (typeof generateInsights === 'function') generateInsights();
    showToast('Entry deleted');
}

// Chart Configuration - theme-aware
function getThemeColors() {
    const s = getComputedStyle(document.documentElement);
    const accent = s.getPropertyValue('--accent').trim() || '#8B9D83';
    var gridColor = 'rgba(139, 157, 131, 0.1)';
    try {
        if (accent.indexOf('rgb') === 0) {
            var m = accent.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (m) gridColor = 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',0.1)';
        } else if (accent.indexOf('#') === 0 && accent.length >= 7) {
            var r = parseInt(accent.slice(1, 3), 16), g = parseInt(accent.slice(3, 5), 16), b = parseInt(accent.slice(5, 7), 16);
            gridColor = 'rgba(' + r + ',' + g + ',' + b + ',0.1)';
        }
    } catch (e) {}
    var isDark = document.documentElement.getAttribute('data-dark') === 'true';
    if (isDark) {
        gridColor = 'rgba(255,255,255,0.08)';
    } else {
        gridColor = 'rgba(0,0,0,0.08)';
    }
    var textColor = s.getPropertyValue('--text-muted').trim() || '#4A4A4A';
    var textPrimaryColor = s.getPropertyValue('--text').trim() || '#1a1a1a';
    if (isDark) {
        textColor = 'rgba(255,255,255,0.7)';
        textPrimaryColor = 'rgba(255,255,255,0.9)';
    }
    function colorWithAlpha(cssColor, alpha) {
        if (!cssColor) return isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)';
        var m = cssColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (m) return 'rgba(' + m[1] + ',' + m[2] + ',' + m[3] + ',' + alpha + ')';
        var hex = cssColor.replace(/^#/, '');
        if (hex.length === 6) {
            var r = parseInt(hex.slice(0, 2), 16), g = parseInt(hex.slice(2, 4), 16), b = parseInt(hex.slice(4, 6), 16);
            return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
        }
        return isDark ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.12)';
    }
    var muted = s.getPropertyValue('--text-muted').trim();
    return {
        chart1: s.getPropertyValue('--chart-1').trim() || '#8B9D83',
        chart2: s.getPropertyValue('--chart-2').trim() || '#6B7D63',
        chart3: s.getPropertyValue('--chart-3').trim() || '#C97D60',
        heatGood: s.getPropertyValue('--heat-good').trim() || '#8B9D83',
        heatMid: s.getPropertyValue('--heat-mid').trim() || '#D4AF37',
        heatBad: s.getPropertyValue('--heat-bad').trim() || '#C97D60',
        text: textColor,
        textPrimary: textPrimaryColor,
        grid: gridColor,
        surface: s.getPropertyValue('--surface').trim() || '#fff',
        barNeutral: colorWithAlpha(muted || textColor, isDark ? 0.32 : 0.18)
    };
}
var clearCornerArtifactPlugin = {
    id: 'clearCornerArtifact',
    afterDraw: function(chart) {
        var ctx = chart.ctx;
        var ca = chart.chartArea;
        if (!ca) return;
        var parentBg = chart && chart.canvas && chart.canvas.parentElement
            ? getComputedStyle(chart.canvas.parentElement).backgroundColor
            : '';
        var fillColor = parentBg && parentBg !== 'rgba(0, 0, 0, 0)'
            ? parentBg
            : ((getThemeColors && getThemeColors().surface) || '#fff');
        var w = 38;
        var h = 14;
        ctx.save();
        ctx.fillStyle = fillColor;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
};
if (typeof Chart !== 'undefined' && Chart.register) Chart.register(clearCornerArtifactPlugin);
function getChartConfig(overrides) {
    var o = overrides || {};
    var c = getThemeColors();

    var tickFont      = { size: 11, family: "'DM Sans', sans-serif", weight: '500' };
    var axisTitleFont = { size: 11, weight: '600', family: "'DM Sans', sans-serif" };
    var integerTicks  = o.integerTicks !== false;
    var yMin   = o.yMin  != null ? o.yMin  : 0;
    var yMax   = o.yMax  != null ? o.yMax  : null;
    var yStep  = o.yStep != null ? o.yStep : 1;
    var isDark = document.documentElement.getAttribute('data-dark') === 'true';

    var gridOpts   = { color: c.grid || (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'), drawBorder: false, lineWidth: 1 };
    var borderOpts = { display: false };

    /* ── Y axis ─────────────────────────────────────────────────────── */
    var yConfig = {
        type: (o.yMin != null || o.yMax != null) ? 'linear' : undefined,
        min: yMin,
        beginAtZero: yMin === 0,
        grid:   gridOpts,
        border: borderOpts,
        title: o.yTitle ? {
            display: true,
            text:    o.yTitle,
            font:    axisTitleFont,
            color:   c.text || (isDark ? '#94a3b8' : '#4A4A4A'),
            padding: { bottom: 6 }
        } : { display: false },
        ticks: {
            font:    tickFont,
            color:   c.text || (isDark ? '#94a3b8' : '#4A4A4A'),
            padding: 8,
            callback: integerTicks
                ? function(val) { return Number.isInteger(val) ? val : ''; }
                : undefined,
            stepSize: integerTicks ? yStep : undefined
        }
    };
    if (yMax != null) yConfig.max = yMax;

    /* ── X axis ─────────────────────────────────────────────────────── */
    var xConfig = {
        type: (o.xMin != null || o.xMax != null) ? 'linear' : 'category',
        grid:   gridOpts,
        border: borderOpts,
        title: o.xTitle ? {
            display: true,
            text:    o.xTitle,
            font:    axisTitleFont,
            color:   c.text || (isDark ? '#94a3b8' : '#4A4A4A'),
            padding: { top: 6 }
        } : { display: false },
        ticks: {
            font:  tickFont,
            color: c.text || (isDark ? '#94a3b8' : '#4A4A4A'),
            padding: 8,
            autoSkip: true,
            maxTicksLimit: 8
        }
    };
    if (o.xMin != null) xConfig.min = o.xMin;
    if (o.xMax != null) xConfig.max = o.xMax;

    /* ── Merge with global defaults from charts.js ───────────────────── */
    var globalStyle = typeof getAuraChartOptions === 'function'
        ? getAuraChartOptions()
        : {};

    var merged = Object.assign({}, globalStyle, {
        layout: { padding: { top: 10, bottom: 10, left: 10, right: 10 } },
        scales: {
            y: yConfig,
            x: xConfig,
            r: {
                min:    o.rMin != null ? o.rMin : 0,
                max:    o.rMax != null ? o.rMax : 10,
                grid:   gridOpts,
                border: borderOpts,
                ticks: {
                    font:     tickFont,
                    color:    c.text || (isDark ? '#94a3b8' : '#4A4A4A'),
                    padding:  8,
                    stepSize: o.rStep != null ? o.rStep : 1,
                    callback: function(val) { return Number.isInteger(val) ? val : ''; }
                }
            }
        }
    });

    /* Preserve tooltip from globalStyle; allow zoom plugin */
    try {
        merged.plugins = Object.assign(
            {},
            globalStyle.plugins || {},
            {
                zoom: {
                    zoom: { pinch: { enabled: true }, mode: 'y' },
                    pan:  { enabled: true, mode: 'y' }
                }
            }
        );
    } catch (e) {
        merged.plugins = globalStyle.plugins || {};
    }

    return merged;
}
let chartConfig = getChartConfig();

// Create Charts — scaleOpts: { yMin, yMax, yStep, yTitle }; datasetOpts: optional overrides for dataset
function createChart(id, label, data, dates, color, scaleOpts, datasetOpts) {
    if (!id || !label) return;
    const ctx = document.getElementById(id);
    if (!ctx) return;

    // Destroy any previous instance
    try {
        const existing = Chart.getChart(ctx);
        if (existing) existing.destroy();
    } catch (e) {}

    // Remove any stale empty-state overlay
    const wrap = ctx.closest('.comparison-chart-wrap, .analytics-chart-wrap, .mood-trends-chart-wrap, .mood-velocity-chart-wrap, .chart-container') || ctx.parentElement;
    if (wrap) {
        const old = wrap.querySelector('.chart-empty-overlay');
        if (old) old.remove();
    }

    if (!Array.isArray(data)) data = [];
    if (!Array.isArray(dates)) dates = [];

    // Show premium empty state instead of a broken/flat chart
    const hasData = data.some(function(v) { return v != null && !isNaN(Number(v)); });
    if (!hasData) {
        renderChartEmptyState(ctx, label);
        return;
    }

    var opts = getChartConfig(scaleOpts || {});
    if (id && id.indexOf('Full') >= 0) opts._auraShowAvgLine = true;
    var baseDataset = {
        label: label,
        data: data,
        borderColor: color,
        backgroundColor: (color && color.length === 7) ? color + '20' : (color || '#8B9D83') + '20',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        cubicInterpolationMode: 'monotone',
        pointRadius: 0,
        pointHoverRadius: 5
    };
    if (datasetOpts && typeof datasetOpts === 'object') {
        Object.keys(datasetOpts).forEach(function(k) { baseDataset[k] = datasetOpts[k]; });
    }
    try {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [baseDataset]
            },
            options: opts,
            plugins: [{
                id: 'chartGradientFill',
                beforeDatasetDraw: function(chart, args) {
                    if (args.index !== 0 || !chart.ctx || !chart.scales.y) return;
                    var meta = chart.getDatasetMeta(0);
                    if (!meta.dataset) return;
                    var yScale = chart.scales.y;
                    var lineColor = meta.dataset.options.borderColor || '#8B9D83';
                    var gradient = chart.ctx.createLinearGradient(0, yScale.top, 0, yScale.bottom);
                    gradient.addColorStop(0, lineColor);
                    gradient.addColorStop(1, 'transparent');
                    meta.dataset.options.backgroundColor = gradient;
                }
            }]
        });
    } catch (chartErr) {
        console.warn('[Aura] createChart failed for ' + id, chartErr);
    }
}

function renderChartEmptyState(canvas, chartLabel) {
    var wrap = canvas.closest('.comparison-chart-wrap, .analytics-chart-wrap, .mood-trends-chart-wrap, .mood-velocity-chart-wrap, .chart-container') || canvas.parentElement;
    if (!wrap) return;
    if (wrap.querySelector('.chart-empty-overlay')) return;
    var pos = getComputedStyle(wrap).position;
    if (pos === 'static') wrap.style.position = 'relative';

    var ctaMap = {
        'Mood':   { text: 'Log your first mood', page: 'entry' },
        'Sleep':  { text: 'Add sleep data',       page: 'entry' },
        'Energy': { text: 'Track your energy',    page: 'entry' },
        'Mood Change': { text: 'Track 2+ days of mood', page: 'entry' }
    };
    var iconMap = { 'Mood': '🌿', 'Sleep': '🌙', 'Energy': '⚡', 'Mood Change': '📈' };
    var msgMap = {
        'Mood':        'Your mood trend will appear here once you\u2019ve logged a few days.',
        'Sleep':       'Sleep patterns emerge once you start tracking daily.',
        'Energy':      'Energy data gives this chart life \u2014 log your first check-in.',
        'Mood Change': 'Track at least two consecutive days to see day-over-day change.'
    };

    var icon = iconMap[chartLabel] || '📊';
    var msg  = msgMap[chartLabel]  || 'Add entries to see this chart.';
    var cta  = ctaMap[chartLabel];

    var overlay = document.createElement('div');
    overlay.className = 'chart-empty-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML =
        '<span class="chart-empty-icon" aria-hidden="true">' + icon + '</span>' +
        '<p class="chart-empty-text">' + escapeHtml(msg) + '</p>' +
        (cta ? '<button type="button" class="chart-empty-cta" onclick="navigate(\'' + cta.page + '\')">' + escapeHtml(cta.text) + ' \u2192</button>' : '');
    wrap.appendChild(overlay);
}

function renderCharts() {
    try {
        if (typeof entries === 'undefined' || entries === null || typeof entries !== 'object') {
            console.log('[debug] renderCharts: early return (entries not ready)');
            return;
        }
        if (typeof Chart === 'undefined') {
            console.log('[debug] renderCharts: early return (Chart undefined)');
            return;
        }
    const colors = getThemeColors();
    chartConfig = getChartConfig();
    var chartDays = (typeof window.auraChartDays === 'number' && window.auraChartDays > 0) ? window.auraChartDays : 30;
    const dates = Object.keys(entries).sort().slice(-chartDays);
    const mood = dates.map(d => (entries[d] && entries[d].mood != null) ? entries[d].mood : null);
    const sleep = dates.map(d => {
        var e = entries[d];
        var s = e && (e.sleepTotal != null ? e.sleepTotal : e.sleep);
        var num = typeof s === 'number' && !isNaN(s) ? s : null;
        return clampSleepTotal(num);
    });
    const energy = dates.map(d => (entries[d] && entries[d].energy != null) ? entries[d].energy : null);
    
    var _CM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const shortDates = dates.map(d => {
        const parts = d.split('-');
        return _CM[parseInt(parts[1], 10) - 1] + ' ' + parseInt(parts[2], 10);
    });

    var _xLabel = 'Last ' + chartDays + ' days';
    createChart('moodChart',     'Mood',   mood,  shortDates, colors.chart1, { yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)',    xTitle: _xLabel, integerTicks: true  });
    createChart('sleepChart',    'Sleep',  sleep, shortDates, colors.chart2, { yMin: 0, yMax: 12, yStep: 1, yTitle: 'Sleep (hrs)',     xTitle: _xLabel, integerTicks: false });
    createChart('energyChart',   'Energy', energy,shortDates, colors.chart3, { yMin: 1, yMax: 10, yStep: 1, yTitle: 'Energy (1–10)',   xTitle: _xLabel, integerTicks: true  });

    createChart('moodChartFull', 'Mood',   mood,  shortDates, colors.chart1, { yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)',    xTitle: _xLabel, integerTicks: true  });
    createChart('sleepChartFull','Sleep',  sleep, shortDates, colors.chart2, { yMin: 0, yMax: 12, yStep: 1, yTitle: 'Sleep (hrs)',     xTitle: _xLabel, integerTicks: false });
    createChart('energyChartFull','Energy',energy,shortDates, colors.chart3, { yMin: 1, yMax: 10, yStep: 1, yTitle: 'Energy (1–10)',   xTitle: _xLabel, integerTicks: true  });

    // Render annotation bars on the full analytics charts
    if (typeof buildChartAnnotations === 'function' && typeof renderChartAnnotationBar === 'function') {
        requestAnimationFrame(function() {
            var charts = [
                { id: 'moodChartFull',   data: mood,   label: 'Mood'   },
                { id: 'sleepChartFull',  data: sleep,  label: 'Sleep'  },
                { id: 'energyChartFull', data: energy, label: 'Energy' }
            ];
            charts.forEach(function(c) {
                var canvas = document.getElementById(c.id);
                if (!canvas) return;
                var chips = buildChartAnnotations(c.data, c.label);
                renderChartAnnotationBar(canvas, chips);
            });
        });
    }
    
    renderMoodVelocity();
    
    // Day-of-Week chart
    renderDayOfWeekChart();
    
    // Seasonal Chart
    renderSeasonal();
    } catch (chartErr) {
        console.warn('[Aura] renderCharts failed', chartErr);
    }
}

function renderCorrelations() {
    try {
        if (typeof entries === 'undefined' || entries === null || typeof entries !== 'object') return;
        if (typeof Chart === 'undefined') return;
        var colors = getThemeColors();
        var chartDays = (typeof window.auraChartDays === 'number' && window.auraChartDays > 0) ? window.auraChartDays : 30;
        var dates = Object.keys(entries).sort().slice(-chartDays);
        // Correlation: Sleep vs Mood
        var correlationCanvas = document.getElementById('correlationsChart');
        if (!correlationCanvas) {
            console.warn('Correlations canvas not found');
        } else {
            var validSleep = [], validMood = [];
            dates.forEach(function(d) {
                var s = entries[d].sleepTotal != null ? entries[d].sleepTotal : entries[d].sleep;
                if (typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 24 && entries[d].mood != null) {
                    validSleep.push(s);
                    validMood.push(entries[d].mood);
                }
            });
            var r2SmEl = document.getElementById('r2SleepMood');
            if (validSleep.length < 3) {
                if (r2SmEl) r2SmEl.textContent = 'Need at least 3 entries with sleep and mood to show correlation.';
            }
            var r2Sm = validSleep.length >= 3 ? computeR2(validSleep, validMood) : null;
            if (r2SmEl && validSleep.length >= 3) r2SmEl.textContent = r2Sm != null ? 'R² = ' + (r2Sm * 100).toFixed(1) + '%' : '';
            var smReg = validSleep.length >= 3 ? computeRegressionLine(validSleep, validMood, 0, 12) : null;
            var correlationValues = validSleep.length ? validSleep.map(function(s, i) { return { x: s, y: validMood[i] }; }) : [{ x: 0, y: 5 }];
            var corrDatasets = [{
                label: 'Sleep vs Mood',
                data: correlationValues,
                backgroundColor: colors.chart1 ? (colors.chart1.length === 7 ? colors.chart1 + '40' : colors.chart1 + '40') : 'rgba(139, 157, 131, 0.35)',
                borderColor: colors.chart1 || '#8B9D83',
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBorderWidth: 1.5,
                pointBorderColor: colors.chart1 ? (colors.chart1.length === 7 ? colors.chart1 + '99' : colors.chart1) : 'rgba(139, 157, 131, 0.7)',
                type: 'scatter'
            }];
            if (smReg) corrDatasets.push({ label: 'Trend', data: smReg, type: 'line', borderColor: colors.text || colors.chart2 || '#6B7D63', borderWidth: 2, tension: 0.35, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, fill: false });
            if (correlationsChartInstance) {
                correlationsChartInstance.destroy();
                correlationsChartInstance = null;
            }
            var existingCorr = Chart.getChart(correlationCanvas);
            if (existingCorr) existingCorr.destroy();
            var optionsCorr = {
                responsive: true,
                maintainAspectRatio: false,
                parsing: false,
                animation: { duration: 400 },
                layout: { padding: { top: 8, right: 12, bottom: 8, left: 12 } },
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: function(items) {
                                if (!items.length) return '';
                                var pt = items[0].raw;
                                return typeof pt.x === 'number' && typeof pt.y === 'number' ? pt.x.toFixed(1) + ' h sleep · Mood ' + pt.y : 'Sleep vs Mood';
                            },
                            label: function(ctx) {
                                if (ctx.raw && typeof ctx.raw.x === 'number' && typeof ctx.raw.y === 'number') return 'Sleep ' + ctx.raw.x.toFixed(1) + ' h, Mood ' + ctx.raw.y;
                                return ctx.dataset.label || '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 12,
                        title: { display: true, text: 'Sleep (hours)', font: { size: 12, weight: '500' } },
                        grid: { display: false },
                        ticks: { maxTicksLimit: 7, font: { size: 11 }, padding: 8 }
                    },
                    y: {
                        min: 1,
                        max: 10,
                        title: { display: true, text: 'Mood (1–10)', font: { size: 12, weight: '500' } },
                        grid: { color: colors.grid || 'rgba(0,0,0,0.06)' },
                        ticks: { maxTicksLimit: 6, font: { size: 11 }, padding: 8 }
                    }
                }
            };
            correlationsChartInstance = new Chart(correlationCanvas, {
                type: 'scatter',
                data: { datasets: corrDatasets },
                options: optionsCorr
            });
            console.log('Correlation chart rendered');
        }
        // Activity vs Energy (correlations page)
        var activityEnergyCtx = document.getElementById('activityEnergyChart');
        if (activityEnergyCtx && dates.length) {
            var actCounts = dates.map(function(d) { return (entries[d].activities && entries[d].activities.length) || 0; });
            var energyArr = dates.map(function(d) { return entries[d].energy; });
            var r2AE = computeR2(actCounts, energyArr);
            var r2AEEl = document.getElementById('r2ActivityEnergy');
            if (r2AEEl) r2AEEl.textContent = r2AE != null ? 'R² = ' + (r2AE * 100).toFixed(1) + '%' : '';
            var aeReg = computeRegressionLine(actCounts, energyArr, 0, 10);
            var aeDatasets = [{
                label: 'Activity vs Energy',
                data: dates.map(function(d, i) { return { x: actCounts[i], y: energyArr[i] }; }),
                backgroundColor: colors.chart3 ? (colors.chart3.length === 7 ? colors.chart3 + '40' : colors.chart3 + '40') : 'rgba(201, 125, 96, 0.35)',
                borderColor: colors.chart3 || '#C97D60',
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBorderWidth: 1.5,
                pointBorderColor: colors.chart3 ? (colors.chart3.length === 7 ? colors.chart3 + '99' : colors.chart3) : 'rgba(201, 125, 96, 0.7)',
                type: 'scatter'
            }];
            if (aeReg) aeDatasets.push({ label: 'Trend', data: aeReg, type: 'line', borderColor: colors.text || colors.chart2 || '#6B7D63', borderWidth: 2, tension: 0.35, borderDash: [6, 4], pointRadius: 0, pointHoverRadius: 0, fill: false });
            if (activityEnergyChartInstance) {
                activityEnergyChartInstance.destroy();
                activityEnergyChartInstance = null;
            }
            var existingAE = Chart.getChart(activityEnergyCtx);
            if (existingAE) existingAE.destroy();
            var optionsAE = {
                responsive: true,
                maintainAspectRatio: false,
                parsing: false,
                animation: { duration: 400 },
                layout: { padding: { top: 8, right: 12, bottom: 8, left: 12 } },
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        enabled: true,
                        callbacks: {
                            title: function(items) {
                                if (!items.length) return '';
                                var pt = items[0].raw;
                                return typeof pt.x === 'number' && typeof pt.y === 'number' ? pt.x + ' activities · Energy ' + pt.y : 'Activity vs Energy';
                            },
                            label: function(ctx) {
                                if (ctx.raw && typeof ctx.raw.x === 'number' && typeof ctx.raw.y === 'number') return 'Activities ' + ctx.raw.x + ', Energy ' + ctx.raw.y;
                                return ctx.dataset.label || '';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: 0,
                        max: 8,
                        title: { display: true, text: 'Activities', font: { size: 12, weight: '500' } },
                        grid: { display: false },
                        ticks: { maxTicksLimit: 5, font: { size: 11 }, padding: 8 }
                    },
                    y: {
                        min: 1,
                        max: 10,
                        title: { display: true, text: 'Energy (1–10)', font: { size: 12, weight: '500' } },
                        grid: { color: colors.grid || 'rgba(0,0,0,0.06)' },
                        ticks: { maxTicksLimit: 6, font: { size: 11 }, padding: 8 }
                    }
                }
            };
            activityEnergyChartInstance = new Chart(activityEnergyCtx, {
                type: 'scatter',
                data: { datasets: aeDatasets },
                options: optionsAE
            });
        }
        renderCorrelationMatrix();
    } catch (e) {
        console.warn('[Aura] renderCorrelations failed', e);
    }
}

function computeRegressionLine(xArr, yArr, xMin, xMax) {
    var validX = [], validY = [];
    for (var i = 0; i < xArr.length; i++) {
        var x = xArr[i], y = yArr[i];
        if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
            validX.push(x); validY.push(y);
        }
    }
    var n = validX.length;
    if (n < 3) return null;
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (var j = 0; j < n; j++) { sumX += validX[j]; sumY += validY[j]; sumXY += validX[j] * validY[j]; sumX2 += validX[j] * validX[j]; }
    var denom = n * sumX2 - sumX * sumX;
    if (denom === 0) return null;
    var slope = (n * sumXY - sumX * sumY) / denom;
    var intercept = (sumY - slope * sumX) / n;
    // Get unique x values sorted, clamped to range
    var allX = validX.slice().sort(function(a,b){return a-b;});
    var x0 = Math.max(xMin != null ? xMin : allX[0], allX[0]);
    var x1 = Math.min(xMax != null ? xMax : allX[allX.length-1], allX[allX.length-1]);
    return [{ x: x0, y: slope * x0 + intercept }, { x: x1, y: slope * x1 + intercept }];
}

function computeR2(xArr, yArr) {
    var validX = [], validY = [];
    for (var i = 0; i < xArr.length; i++) {
        var x = xArr[i], y = yArr[i];
        if (typeof x === 'number' && !isNaN(x) && typeof y === 'number' && !isNaN(y)) {
            validX.push(x); validY.push(y);
        }
    }
    var n = validX.length;
    if (n < 3) return null;
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (var i = 0; i < n; i++) {
        sumX += validX[i]; sumY += validY[i];
        sumXY += validX[i] * validY[i];
        sumX2 += validX[i] * validX[i]; sumY2 += validY[i] * validY[i];
    }
    var meanX = sumX / n, meanY = sumY / n;
    var ssTot = 0, ssRes = 0;
    for (var j = 0; j < n; j++) {
        ssTot += (validY[j] - meanY) * (validY[j] - meanY);
    }
    var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    var intercept = meanY - slope * meanX;
    for (var k = 0; k < n; k++) {
        var pred = slope * validX[k] + intercept;
        ssRes += (validY[k] - pred) * (validY[k] - pred);
    }
    return ssTot === 0 ? null : Math.max(0, 1 - ssRes / ssTot);
}

function exportChartPNG(chartId) {
    var canvas = document.getElementById(chartId);
    if (!canvas) return;
    var chart = Chart.getChart(canvas);
    if (chart) {
        var url = chart.toBase64Image('image/png');
        var a = document.createElement('a');
        a.href = url;
        a.download = chartId + '-' + new Date().toISOString().split('T')[0] + '.png';
        a.click();
    }
}

function renderCorrelationMatrix() {
    var el = document.getElementById('correlationMatrix');
    if (!el) return;
    var data = Object.keys(entries).sort().map(function(d) { return entries[d]; });
    if (data.length < 5) { el.innerHTML = '<p style="color: var(--text-muted);">Need more entries for correlation matrix.</p>'; return; }
    getCustomMetrics().then(function(list) {
        var custom = list.filter(function(m) { return m.visible && m.type === 'scale'; });
        var labels = ['Mood', 'Sleep', 'Energy', 'Activities'].concat(custom.map(function(m) { return m.name; }));
        var N = labels.length;
        var arrays = [
            data.map(function(e) { return e.mood; }),
            data.map(function(e) { return e.sleep; }),
            data.map(function(e) { return e.energy; }),
            data.map(function(e) { return (e.activities && e.activities.length) || 0; })
        ];
        custom.forEach(function(m) {
            arrays.push(data.map(function(e) {
                var v = e.customMetrics && e.customMetrics[m.id];
                return (v != null && v !== '') ? Number(v) : NaN;
            }));
        });
        var grid = [];
        for (var r = 0; r < N; r++) {
            var row = [labels[r]];
            for (var c = 0; c < N; c++) {
                var r2 = r === c ? 1 : computeR2(arrays[r], arrays[c]);
                row.push(r2 == null ? '—' : (r2 * 100).toFixed(0) + '%');
            }
            grid.push(row);
        }
        var header = [''].concat(labels);
        var html = '<div class="matrix-row" style="grid-template-columns: 100px repeat(' + N + ', 1fr);">' + header.map(function(h) { return '<span class="cell">' + escapeHtml(h) + '</span>'; }).join('') + '</div>';
        for (var i = 0; i < grid.length; i++) {
            var cls = grid[i].map(function(v, j) {
                if (j === 0) return 'cell';
                if (typeof v === 'string' && v !== '—') {
                    var pct = parseFloat(v);
                    return pct >= 30 ? 'cell high' : 'cell';
                }
                return 'cell';
            });
            html += '<div class="matrix-row" style="grid-template-columns: 100px repeat(' + N + ', 1fr);">' + grid[i].map(function(v, j) { return '<span class="' + cls[j] + '">' + v + '</span>'; }).join('') + '</div>';
        }
        el.innerHTML = html;
    });
}

function renderMoodVelocity() {
    console.log('[debug] renderMoodVelocity called');
    if (typeof entries === 'undefined' || entries === null || typeof entries !== 'object') {
        console.warn('[debug] renderMoodVelocity: entries not ready');
        return;
    }
    var velocityCanvas = document.getElementById('circadianChart');
    var panelEl = document.getElementById('stabilityScorePanel');
    console.log('[debug] renderMoodVelocity: canvas found=', !!velocityCanvas, 'canvas size=', velocityCanvas ? (velocityCanvas.offsetWidth + 'x' + velocityCanvas.offsetHeight) : 'n/a', 'panelEl found=', !!panelEl);
    if (!velocityCanvas) {
        console.warn('Circadian canvas not found');
        return;
    }
    if (!panelEl) {
        console.warn('[debug] renderMoodVelocity: stabilityScorePanel not found, returning early');
        return;
    }
    var existingCircadian = typeof Chart !== 'undefined' && Chart.getChart(velocityCanvas);
    if (existingCircadian) existingCircadian.destroy();
    if (window.circadianChart && typeof window.circadianChart.destroy === 'function') window.circadianChart.destroy();
    window.circadianChart = null;
    var velocityCtx = velocityCanvas;
    var colors = getThemeColors();
    var chartDays = (typeof window.auraChartDays === 'number' && window.auraChartDays > 0) ? window.auraChartDays : 30;
    var dates = Object.keys(entries).sort().slice(-chartDays);
    var velocities = [];
    var labels = [];
    if (typeof window.computeMoodVelocity === 'function') {
        var subset = {};
        dates.forEach(function(d) { subset[d] = entries[d]; });
        var result = window.computeMoodVelocity(subset);
        velocities = result.velocities || [];
        labels = result.labels || [];
    }
    if (!velocities.length && !labels.length) {
        for (var i = 1; i < dates.length; i++) {
            var m0 = entries[dates[i - 1]] && entries[dates[i - 1]].mood;
            var m1 = entries[dates[i]] && entries[dates[i]].mood;
            if (typeof m0 === 'number' && !isNaN(m0) && typeof m1 === 'number' && !isNaN(m1)) {
                velocities.push(m1 - m0);
                var d = new Date(dates[i]);
                labels.push((d.getMonth() + 1) + '/' + d.getDate());
            }
        }
    }
    if (!velocities || velocities.length === 0) {
        console.warn('No mood velocity data available');
        labels = ['No data'];
        velocities = [0];
    }
    console.log('[debug] renderMoodVelocity: dataset length=', labels.length, 'velocities.length=', velocities.length);
    function hexToRgba(hex, alpha) {
        if (!hex || hex.indexOf('rgb') === 0) return hex || 'rgba(0,0,0,0.2)';
        var h = hex.replace('#', '');
        if (h.length !== 6) return hex;
        var r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
        return 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha != null ? alpha : 0.75) + ')';
    }
    var barColors = velocities.map(function(v) {
        if (v > 0.5) return hexToRgba(colors.heatGood, 0.78);
        if (v < -0.5) return hexToRgba(colors.heatBad, 0.78);
        return colors.barNeutral;
    });
    var existingVel = Chart.getChart(velocityCtx);
    if (existingVel) existingVel.destroy();
    var velocityChartData = { labels: labels, velocities: velocities };
    var moodVelocityPlugin = {
        id: 'moodVelocityAnnotations',
        afterDraw: function(chart) {
            var ctx = chart.ctx;
            var yScale = chart.scales.y;
            if (!yScale || !chart.chartArea) return;
            var ca = chart.chartArea;
            var y0 = yScale.getPixelForValue(0);
            var y2 = yScale.getPixelForValue(2);
            var yMinus2 = yScale.getPixelForValue(-2);
            ctx.save();
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = colors.textPrimary || colors.text;
            ctx.setLineDash([]);
            ctx.globalAlpha = 1;
            ctx.beginPath();
            ctx.moveTo(ca.left, y0);
            ctx.lineTo(ca.right, y0);
            ctx.stroke();
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.strokeStyle = colors.text || colors.grid;
            ctx.globalAlpha = 0.4;
            ctx.beginPath();
            ctx.moveTo(ca.left, y2);
            ctx.lineTo(ca.right, y2);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(ca.left, yMinus2);
            ctx.lineTo(ca.right, yMinus2);
            ctx.stroke();
            ctx.globalAlpha = 1;
            var vel = velocityChartData.velocities;
            var xScale = chart.scales.x;
            if (xScale && vel && vel.length) {
                var barW = (xScale.getPixelForValue(1) - xScale.getPixelForValue(0)) || 20;
                var i = 0, j;
                while (i < vel.length) {
                    j = i;
                    while (j < vel.length && vel[j] > 1) j++;
                    if (j - i >= 3) {
                        var xL = xScale.getPixelForValue(i) - barW / 2;
                        var xR = xScale.getPixelForValue(j - 1) + barW / 2;
                        ctx.fillStyle = colors.heatGood;
                        ctx.globalAlpha = 0.06;
                        ctx.fillRect(xL, ca.top, xR - xL, ca.bottom - ca.top);
                    }
                    i = j + 1;
                }
                i = 0;
                while (i < vel.length) {
                    j = i;
                    while (j < vel.length && vel[j] < -1) j++;
                    if (j - i >= 3) {
                        xL = xScale.getPixelForValue(i) - barW / 2;
                        xR = xScale.getPixelForValue(j - 1) + barW / 2;
                        ctx.fillStyle = colors.heatBad;
                        ctx.globalAlpha = 0.06;
                        ctx.fillRect(xL, ca.top, xR - xL, ca.bottom - ca.top);
                    }
                    i = j + 1;
                }
                ctx.globalAlpha = 1;
            }
            ctx.restore();
        }
    };
    try {
    window.circadianChart = new Chart(velocityCtx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Mood Change',
                data: velocities,
                backgroundColor: barColors,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: (function() {
            var globalStyle = typeof getAuraChartOptions === 'function' ? getAuraChartOptions() : {};
            var existingOptions = {
                layout: { padding: { top: 12, bottom: 12, left: 12, right: 12 } },
                scales: {
                    y: {
                        min: -5,
                        max: 5,
                        border: { display: false },
                        title: { display: true, text: 'Mood change (day-over-day)', font: { size: 12, weight: '500' }, color: colors.textPrimary || colors.text },
                        grid: { color: colors.grid || 'rgba(0,0,0,0.06)', drawTicks: true },
                        ticks: { font: { size: 11 }, color: colors.text, padding: 8, stepSize: 1, maxTicksLimit: 6 }
                    },
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 11 }, color: colors.text, padding: 8, maxRotation: 45, autoSkip: true, maxTicksLimit: 8 },
                        barPercentage: 0.82,
                        categoryPercentage: 0.85
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            title: function(items) {
                                if (!items.length) return '';
                                var idx = items[0].dataIndex;
                                return labels[idx] || 'Day';
                            },
                            label: function(ctx) {
                                var v = ctx.raw;
                                if (typeof v !== 'number') return ctx.dataset.label + ': ' + v;
                                if (v > 0) return 'Mood improved by ' + v.toFixed(1) + ' point' + (v !== 1 ? 's' : '');
                                if (v < 0) return 'Mood dipped by ' + Math.abs(v).toFixed(1) + ' point' + (v !== -1 ? 's' : '');
                                return 'No change';
                            }
                        }
                    }
                }
            };
            var merged = { ...globalStyle, ...existingOptions };
            merged.plugins = merged.plugins || {};
            merged.plugins.tooltip = { ...(merged.plugins.tooltip || {}), ...(existingOptions.plugins.tooltip || {}) };
            return merged;
        })(),
        plugins: [moodVelocityPlugin]
    });
    console.log('[debug] renderMoodVelocity: Chart created');
    if (window.circadianChart && typeof window.circadianChart.resize === 'function') {
        requestAnimationFrame(function() { window.circadianChart.resize(); });
    }
    } catch (chartErr) {
        console.error('[debug] renderMoodVelocity: Chart.js error', chartErr);
    }
    var today = new Date().toISOString().split('T')[0];
    var fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    var fromStr = fourteenDaysAgo.toISOString().split('T')[0];
    var last14 = Object.keys(entries).filter(function(d) { return d >= fromStr && d <= today; }).sort();
    var mood14 = last14.map(function(d) { return entries[d].mood; }).filter(function(m) { return typeof m === 'number' && !isNaN(m); });
    if (mood14.length < 5) {
        panelEl.innerHTML = '<p class="stability-score-empty">Track at least 5 days in a row to see your stability score.</p>';
        return;
    }
    var sum = mood14.reduce(function(a, b) { return a + b; }, 0);
    var mean = sum / mood14.length;
    var variance = mood14.reduce(function(acc, m) { return acc + (m - mean) * (m - mean); }, 0) / mood14.length;
    var stdDev = Math.sqrt(variance);
    var score = Math.round((1 - Math.min(stdDev / 3, 1)) * 100);
    var labelText = '';
    var pillClass = '';
    var barColor = '';
    var message = '';
    if (score >= 80) {
        labelText = 'Stable';
        pillClass = 'stable';
        barColor = colors.heatGood;
        message = 'Your mood has been consistent over the last 14 days.';
    } else if (score >= 50) {
        labelText = 'Moderate';
        pillClass = 'moderate';
        barColor = colors.heatMid;
        message = 'Some fluctuation in the last 14 days — within a normal range.';
    } else if (score >= 20) {
        labelText = 'Volatile';
        pillClass = 'volatile';
        barColor = colors.heatBad;
        message = 'Notable mood swings in the last 14 days. Sleep patterns may be a factor.';
    } else {
        labelText = 'High volatility';
        pillClass = 'high-volatility';
        barColor = colors.heatBad;
        message = 'Significant mood volatility detected over the last 14 days.';
    }
    panelEl.innerHTML =
        '<div class="stability-score-block">' +
        '<p class="stability-eyebrow">14-day stability</p>' +
        '<div class="stability-score-primary">' +
        '<span class="stability-score-value">' + score + '</span>' +
        '<span class="stability-pill ' + pillClass + '">' + labelText + '</span>' +
        '</div>' +
        '<div class="stability-score-bar-wrap"><div class="stability-score-bar-fill" style="width:' + score + '%;background:' + barColor + ';"></div></div>' +
        '<p class="stability-score-explanation">' + message + '</p>' +
        '<p class="stability-score-meta">Based on ' + mood14.length + ' entries over the last 14 days.</p>' +
        '</div>';
}

function renderSeasonal() {
    const seasonalCtx = document.getElementById('seasonalChart');
    if (!seasonalCtx) return;
    const colors = getThemeColors();
    const existingSea = Chart.getChart(seasonalCtx);
    if (existingSea) existingSea.destroy();
    
    const monthlyData = {};
    Object.keys(entries).forEach(date => {
        const month = new Date(date).getMonth();
        if (!monthlyData[month]) monthlyData[month] = [];
        monthlyData[month].push(entries[date].mood);
    });
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const avgByMonth = months.map((m, i) => {
        const data = monthlyData[i];
        return data ? data.reduce((a, b) => a + b, 0) / data.length : 0;
    });
    
    new Chart(seasonalCtx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [{
                label: 'Average Mood by Month',
                data: avgByMonth,
                backgroundColor: colors.chart1,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: getChartConfig({ yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)' })
    });
}

function getEntryYears() {
    var years = {};
    Object.keys(entries).forEach(function(date) {
        var y = new Date(date).getFullYear();
        years[y] = true;
    });
    return Object.keys(years).map(Number).sort(function(a,b) { return b - a; });
}

function renderYearOverYear() {
    var y1 = document.getElementById('yoyYear1');
    var y2 = document.getElementById('yoyYear2');
    var canvas = document.getElementById('yoyChart');
    if (!y1 || !y2 || !canvas) return;
    var years = getEntryYears();
    if (years.length === 0) years = [new Date().getFullYear(), new Date().getFullYear() - 1];
    y1.innerHTML = years.map(function(y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
    y2.innerHTML = years.map(function(y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');
    if (years.length >= 2) { y1.value = years[0]; y2.value = years[1]; }
    var year1 = parseInt(y1.value, 10) || years[0];
    var year2 = parseInt(y2.value, 10) || years[1];
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    function avgForYearMonth(y, m) {
        var list = [];
        Object.keys(entries).forEach(function(date) {
            var d = new Date(date);
            if (d.getFullYear() === y && d.getMonth() === m && entries[date].mood != null) list.push(entries[date].mood);
        });
        return list.length ? list.reduce(function(a,b) { return a + b; }, 0) / list.length : null;
    }
    var data1 = months.map(function(_, m) { return avgForYearMonth(year1, m); });
    var data2 = months.map(function(_, m) { return avgForYearMonth(year2, m); });
    var colors = getThemeColors();
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                { label: String(year1), data: data1, backgroundColor: colors.chart1, borderRadius: 8, borderSkipped: false },
                { label: String(year2), data: data2, backgroundColor: colors.chart2, borderRadius: 8, borderSkipped: false }
            ]
        },
        options: getChartConfig({ yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)' })
    });
}

function renderCustomRangeChart() {
    var fromEl = document.getElementById('customRangeFrom');
    var toEl = document.getElementById('customRangeTo');
    var canvas = document.getElementById('customRangeChart');
    if (!fromEl || !toEl || !canvas) return;
    var fromStr = getDateInputValue(fromEl);
    var toStr = getDateInputValue(toEl);
    if (!fromStr || !toStr) return;
    var dates = Object.keys(entries).filter(function(d) { return d >= fromStr && d <= toStr; }).sort();
    if (dates.length === 0) return;
    var colors = getThemeColors();
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    new Chart(canvas, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                { label: 'Mood', data: dates.map(function(d) { return entries[d].mood; }), borderColor: colors.chart1, fill: false, tension: 0.35, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5 },
                { label: 'Sleep (h)', data: dates.map(function(d) { return entries[d].sleep; }), borderColor: colors.chart2, fill: false, tension: 0.35, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5 },
                { label: 'Energy', data: dates.map(function(d) { return entries[d].energy; }), borderColor: colors.chart3, fill: false, tension: 0.35, borderWidth: 3, pointRadius: 0, pointHoverRadius: 5 }
            ]
        },
        options: getChartConfig({ yMin: 0, yMax: 12, yStep: 1, yTitle: 'Score / Hours' })
    });
}

var reportTabState = 'weekly';
function setReportTab(tab, button) {
    reportTabState = tab || reportTabState;
    document.querySelectorAll('.report-tabs button').forEach(function(b) {
        b.classList.toggle('active', b.getAttribute('data-report') === reportTabState);
        b.classList.toggle('btn', b.getAttribute('data-report') === reportTabState);
        b.classList.toggle('btn-secondary', b.getAttribute('data-report') !== reportTabState);
    });
    document.getElementById('reportWeekly').style.display = reportTabState === 'weekly' ? 'block' : 'none';
    document.getElementById('reportMonthly').style.display = reportTabState === 'monthly' ? 'block' : 'none';
    document.getElementById('reportYear').style.display = reportTabState === 'year' ? 'block' : 'none';
    renderReportsContent();
}

function renderReportsContent() {
    if (reportTabState === 'weekly') renderReportWeekly();
    else if (reportTabState === 'monthly') renderReportMonthly();
    else if (reportTabState === 'year') renderReportYear();
}

function renderReportWeekly() {
    var el = document.getElementById('reportWeeklyContent');
    if (!el) return;
    var end = new Date();
    var start = new Date();
    start.setDate(start.getDate() - 6);
    var dates = [];
    for (var d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().split('T')[0]);
    }
    var list = dates.filter(function(d) { return entries[d]; });
    var moodSum = 0, moodCount = 0, sleepSum = 0, sleepCount = 0, energySum = 0, energyCount = 0;
    list.forEach(function(d) {
        var e = entries[d];
        if (e.mood != null && !isNaN(Number(e.mood))) { moodSum += Number(e.mood); moodCount++; }
        var s = e.sleepTotal != null ? e.sleepTotal : e.sleep;
        if (typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 24) { sleepSum += s; sleepCount++; }
        if (e.energy != null && !isNaN(Number(e.energy))) { energySum += Number(e.energy); energyCount++; }
    });
    var avgMood = moodCount ? (moodSum / moodCount).toFixed(1) : '–';
    var avgSleep = sleepCount ? (sleepSum / sleepCount).toFixed(1) : '–';
    var avgEnergy = energyCount ? (energySum / energyCount).toFixed(1) : '–';
    el.innerHTML = '<p style="margin-bottom: var(--space-md);"><strong>Days tracked:</strong> ' + list.length + ' of 7</p>' +
        '<p><strong>Average mood:</strong> ' + avgMood + '</p><p><strong>Average sleep:</strong> ' + avgSleep + ' hrs</p><p><strong>Average energy:</strong> ' + avgEnergy + '</p>';
}

function renderReportMonthly() {
    var el = document.getElementById('reportMonthlyContent');
    if (!el) return;
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth();
    var dates = Object.keys(entries).filter(function(d) {
        var x = new Date(d);
        return x.getFullYear() === year && x.getMonth() === month;
    });
    var avgMood = dates.length ? (dates.reduce(function(a,d) { return a + (entries[d].mood || 0); }, 0) / dates.length).toFixed(1) : '–';
    var sleepSum = 0, sleepCount = 0;
    dates.forEach(function(d) {
        var e = entries[d];
        var s = e.sleepTotal != null ? e.sleepTotal : e.sleep;
        if (typeof s === 'number' && !isNaN(s) && s >= 0 && s <= 24) { sleepSum += s; sleepCount++; }
    });
    var avgSleep = sleepCount ? (sleepSum / sleepCount).toFixed(1) : '–';
    var monthName = new Date(year, month).toLocaleDateString(typeof getLocale === 'function' ? getLocale() : 'en', { month: 'long' });
    el.innerHTML = '<p style="margin-bottom: var(--space-md);"><strong>' + monthName + ' ' + year + '</strong></p>' +
        '<p><strong>Entries:</strong> ' + dates.length + '</p><p><strong>Average mood:</strong> ' + avgMood + '</p><p><strong>Average sleep:</strong> ' + avgSleep + ' hrs</p>';
}

function renderReportYear() {
    var el = document.getElementById('reportYearContent');
    if (!el) return;
    var year = new Date().getFullYear();
    var dates = Object.keys(entries).filter(function(d) { return new Date(d).getFullYear() === year; });
    var avgMood = dates.length ? (dates.reduce(function(a,d) { return a + (entries[d].mood || 0); }, 0) / dates.length).toFixed(1) : '–';
    var best = getBestWorstDates();
    var streak = 0;
    var check = new Date();
    while (entries[check.toISOString().split('T')[0]]) { streak++; check.setDate(check.getDate() - 1); }
    el.innerHTML = '<p style="font-size: 1.2rem; margin-bottom: var(--space-md);"><strong>Your ' + year + ' in numbers</strong></p>' +
        '<p><strong>Total days tracked:</strong> ' + dates.length + '</p>' +
        '<p><strong>Average mood:</strong> ' + avgMood + '</p>' +
        '<p><strong>Current streak:</strong> ' + streak + ' days</p>' +
        (best.best ? '<p><strong>Best day:</strong> ' + best.best + '</p>' : '') +
        (best.worst ? '<p><strong>Challenging day (lowest mood):</strong> ' + best.worst + '</p>' : '');
}

function exportReportPNG(panelId) {
    var panel = document.getElementById(panelId);
    if (!panel || typeof html2canvas === 'undefined') {
        try {
            var script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
            script.onload = function() { exportReportPNG(panelId); };
            document.head.appendChild(script);
        } catch (e) {}
        return;
    }
    html2canvas(panel).then(function(canvas) {
        var a = document.createElement('a');
        a.download = 'aura-report-' + panelId + '-' + new Date().toISOString().split('T')[0] + '.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
    });
}

function exportReportPDF() {
    if (typeof jspdf === 'undefined') {
        var script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        script.onload = function() { exportReportPDF(); };
        document.head.appendChild(script);
        return;
    }
    var JsPDF = window.jspdf && window.jspdf.jsPDF ? window.jspdf.jsPDF : null;
    if (!JsPDF) return;
    var doc = new JsPDF();
    var y = 20;
    doc.setFontSize(18);
    doc.text('Aura Mood — Report', 20, y); y += 15;
    doc.setFontSize(11);
    var content = document.getElementById('reportWeeklyContent');
    if (content) doc.text(content.innerText || content.textContent || '', 20, y);
    doc.save('aura-report-' + new Date().toISOString().split('T')[0] + '.pdf');
}

// Generate Insights
var insightsEngineCacheSignature = '';
var insightsEngineCacheResult = null;
var MIN_INSIGHT_RECORDS = 5;
var INSIGHT_SECTION_META = {
    sleep: {
        heading: 'Sleep Insights',
        title: 'Sleep Insights',
        description: 'Patterns between sleep timing, duration, fragmentation, and mood.',
        icon: '☾'
    },
    activity: {
        heading: 'Activity Insights',
        title: 'Activity Insights',
        description: 'Activities and daily energy patterns that appear linked to mood.',
        icon: '◌'
    },
    stability: {
        heading: 'Mood Stability Insights',
        title: 'Mood Stability Insights',
        description: 'Signals around recent volatility, stability, and day-to-day mood change.',
        icon: '◔'
    },
    tags: {
        heading: 'Tag Insights',
        title: 'Tag Insights',
        description: 'Recurring tags that appear associated with shifts in mood.',
        icon: '#'
    }
};
function averageMoodForRecords(records) {
    if (!records || !records.length) return null;
    var sum = 0;
    var count = 0;
    records.forEach(function(record) {
        if (!record || typeof record.mood !== 'number' || isNaN(record.mood)) return;
        sum += record.mood;
        count++;
    });
    return count ? (sum / count) : null;
}
function standardDeviation(values) {
    if (!values || !values.length) return null;
    var mean = values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
    var variance = values.reduce(function(sum, value) {
        return sum + Math.pow(value - mean, 2);
    }, 0) / values.length;
    return Math.sqrt(variance);
}
function getInsightRecords() {
    return Object.keys(entries).sort().map(function(date) {
        return entries[date];
    }).filter(function(record) {
        return record && typeof record.mood === 'number' && !isNaN(record.mood);
    });
}
function getInsightSignature() {
    return Object.keys(entries).sort().map(function(date) {
        var record = entries[date] || {};
        return [
            date,
            record.updatedAt || '',
            record.mood != null ? record.mood : '',
            record.sleep != null ? record.sleep : '',
            record.energy != null ? record.energy : '',
            (record.sleepSegments || []).length,
            (record.tags || []).join('|'),
            (record.activities || []).join('|'),
            getRecordJournalHtml(record).length
        ].join(':');
    }).join('||');
}
function getInsightStrength(score) {
    if (score >= 5) return { label: 'Strong pattern', width: 100 };
    if (score >= 3) return { label: 'Moderate pattern', width: 68 };
    return { label: 'Weak pattern', width: 38 };
}
function buildInsightCardHtml(insight) {
    var strengthMap = {
        strong:   { label: 'Strong pattern',   width: 100, class: 'insight-strength-strong'   },
        moderate: { label: 'Moderate pattern', width: 62,  class: 'insight-strength-moderate' },
        emerging: { label: 'Emerging signal',  width: 32,  class: 'insight-strength-emerging' }
    };
    var s = strengthMap[insight.strength || 'emerging'];

    var nudgeHtml = insight.nudge
        ? '<p class="insight-nudge">' + escapeHtml(insight.nudge) + '</p>'
        : '';

    return '<div class="card insight-detail-card">' +
        '<div class="insight-detail-header">' +
            '<div class="insight-detail-title-wrap">' +
                '<span class="insight-icon-badge" data-section="' + escapeHtml(insight.section) + '" aria-hidden="true">' + escapeHtml(insight.icon || '\u2022') + '</span>' +
                '<div>' +
                    '<span class="insight-detail-kicker">' + escapeHtml(insight.kicker || 'Insight') + '</span>' +
                    '<h4 class="insight-detail-title">' + escapeHtml(insight.title) + '</h4>' +
                '</div>' +
            '</div>' +
            '<div class="insight-strength">' +
                '<span class="insight-strength-label ' + s.class + '">' + s.label + '</span>' +
                '<div class="insight-strength-bar"><div class="insight-strength-fill" style="width:' + s.width + '%;"></div></div>' +
            '</div>' +
        '</div>' +
        '<p class="insight-detail-text">' + escapeHtml(insight.description) + '</p>' +
        nudgeHtml +
        '<p class="insight-detail-context">' + escapeHtml(insight.context) + '</p>' +
    '</div>';
}
function buildInsightsOverviewHtml(result) {
    if (!result || !result.overview || !result.overview.length) {
        return '<p class="insight-empty">' + escapeHtml((result && result.message) || 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.') + '</p>';
    }
    return '<div class="insights-summary-grid">' + result.overview.map(buildInsightCardHtml).join('') + '</div>';
}
function buildInsightsDashboardHtml(result) {
    if (!result || !result.sections || !result.sections.length) {
        return '<p class="insight-empty">' + escapeHtml((result && result.message) || 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.') + '</p>';
    }
    return result.sections.map(function(section) {
        var meta = INSIGHT_SECTION_META[section.key] || { heading: section.title, title: section.title, description: '' };
        return '<section class="insights-section">' +
            '<div>' +
                '<p class="insights-section-heading">' + escapeHtml(meta.heading) + '</p>' +
                '<h2 class="insights-section-title">' + escapeHtml(meta.title) + '</h2>' +
                (meta.description ? '<p class="insights-section-description">' + escapeHtml(meta.description) + '</p>' : '') +
            '</div>' +
            '<div class="insight-cards-grid">' + section.insights.map(buildInsightCardHtml).join('') + '</div>' +
        '</section>';
    }).join('');
}
function renderInsightsResult(result) {
    var analyticsHtml = buildInsightsOverviewHtml(result);
    var dashboardHtml = buildInsightsDashboardHtml(result);
    var analyticsEl = document.getElementById('analyticsInsightsContent');
    var dashboardEl = document.getElementById('insightsDashboardContent');
    var overviewTextEl = document.getElementById('insightsOverviewText');
    if (analyticsEl) analyticsEl.innerHTML = analyticsHtml;
    if (dashboardEl) dashboardEl.innerHTML = dashboardHtml;
    if (overviewTextEl) overviewTextEl.textContent = (result && result.summary) || 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.';
}
function createInsightCandidate(section, title, description, supportCount, score, options) {
    options = options || {};
    var entryWord = supportCount === 1 ? 'entry' : 'entries';
    return {
        section: section,
        title: title,
        description: description,
        supportCount: supportCount,
        score: score,
        kicker: options.kicker || 'Insight',
        icon: options.icon || ((INSIGHT_SECTION_META[section] && INSIGHT_SECTION_META[section].icon) || '•'),
        context: options.context || ('Observed across ' + supportCount + ' ' + entryWord + '.'),
        nudge: options.nudge || '',
        strength: score >= 5 ? 'strong' : score >= 3 ? 'moderate' : 'emerging'
    };
}
var correlationInsightsEngine = {
    analyze: function(records) {
        if (!records || records.length < MIN_INSIGHT_RECORDS) {
            return {
                overview: [],
                sections: [],
                summary: 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.',
                message: 'Insights will appear once enough data has been collected.'
            };
        }
        var candidates = [];
        var overallMood = averageMoodForRecords(records);
        var minGroup = 3;
        var sleepBuckets = [
            { label: '<5h', test: function(v) { return v < 5; } },
            { label: '5-6h', test: function(v) { return v >= 5 && v < 6; } },
            { label: '6-7h', test: function(v) { return v >= 6 && v < 7; } },
            { label: '7-8h', test: function(v) { return v >= 7 && v < 8; } },
            { label: '8-9h', test: function(v) { return v >= 8 && v < 9; } },
            { label: '9h+', test: function(v) { return v >= 9; } }
        ];
        var bucketRows = sleepBuckets.map(function(bucket) {
            var matching = records.filter(function(record) {
                var sleepValue = typeof record.sleepTotal === 'number' && !isNaN(record.sleepTotal) ? record.sleepTotal : record.sleep;
                return typeof sleepValue === 'number' && !isNaN(sleepValue) && bucket.test(sleepValue);
            });
            return {
                label: bucket.label,
                records: matching,
                avg: averageMoodForRecords(matching)
            };
        }).filter(function(bucket) {
            return bucket.records.length >= minGroup && bucket.avg != null;
        });
        if (bucketRows.length >= 2) {
            var bestBucket = bucketRows.slice().sort(function(a, b) { return b.avg - a.avg; })[0];
            var bestBucketDiff = bestBucket.avg - overallMood;
            if (bestBucketDiff >= 0.15) {
                candidates.push(createInsightCandidate(
                    'sleep',
                    'Your sweet spot for sleep',
                    'When you sleep ' + bestBucket.label + ', your mood tends to be noticeably higher than your average.',
                    records.filter(function(record) {
                        var sleepValue = typeof record.sleepTotal === 'number' && !isNaN(record.sleepTotal) ? record.sleepTotal : record.sleep;
                        return typeof sleepValue === 'number' && !isNaN(sleepValue);
                    }).length,
                    bestBucketDiff * Math.sqrt(bestBucket.records.length),
                    {
                        kicker: 'Sleep',
                        icon: '\u263d',
                        nudge: 'Try to aim for ' + bestBucket.label + ' when you can.',
                        context: 'Based on ' + bestBucket.records.length + ' nights in that range.'
                    }
                ));
            }
        }
        var fragmented = records.filter(function(record) {
            return (record.sleepSegments || []).length >= 2;
        });
        var consolidated = records.filter(function(record) {
            return (record.sleepSegments || []).length === 1;
        });
        if (fragmented.length >= minGroup && consolidated.length >= minGroup) {
            var fragmentedAvg = averageMoodForRecords(fragmented);
            var consolidatedAvg = averageMoodForRecords(consolidated);
            var fragmentedDiff = fragmentedAvg - consolidatedAvg;
            if (Math.abs(fragmentedDiff) >= 0.15) {
                candidates.push(createInsightCandidate(
                    'sleep',
                    fragmentedDiff < 0 ? 'Interrupted sleep affects your day' : 'You handle split sleep well',
                    fragmentedDiff < 0
                        ? 'On nights when your sleep was fragmented, your mood the next day was lower on average.'
                        : 'Interestingly, split sleep nights don\'t seem to drag your mood down much.',
                    fragmented.length + consolidated.length,
                    Math.abs(fragmentedDiff) * Math.sqrt(fragmented.length + consolidated.length),
                    {
                        kicker: 'Sleep',
                        icon: '\u263d',
                        nudge: fragmentedDiff < 0 ? 'Protecting sleep continuity may help stabilise your mood.' : '',
                        context: 'Compared ' + fragmented.length + ' fragmented and ' + consolidated.length + ' consolidated nights.'
                    }
                ));
            }
        }
        var earlyBedRecords = records.filter(function(record) {
            var bedtime = sleepTimelineMinutesFromTime(record.sleepTime || ((record.sleepSegments || [])[0] || {}).start || '');
            return bedtime != null && bedtime >= (18 * 60);
        });
        var lateBedRecords = records.filter(function(record) {
            var bedtime = sleepTimelineMinutesFromTime(record.sleepTime || ((record.sleepSegments || [])[0] || {}).start || '');
            return bedtime != null && bedtime > 60 && bedtime < (12 * 60);
        });
        if (earlyBedRecords.length >= minGroup && lateBedRecords.length >= minGroup) {
            var earlyAvg = averageMoodForRecords(earlyBedRecords);
            var lateAvg = averageMoodForRecords(lateBedRecords);
            var bedtimeDiff = earlyAvg - lateAvg;
            if (Math.abs(bedtimeDiff) >= 0.15) {
                candidates.push(createInsightCandidate(
                    'sleep',
                    'Bedtime Timing',
                    bedtimeDiff > 0
                        ? 'Earlier bedtimes tend to be associated with higher mood.'
                        : 'Later bedtimes appear linked to slightly higher mood in your recent data.',
                    earlyBedRecords.length + lateBedRecords.length,
                    Math.abs(bedtimeDiff) * Math.sqrt(earlyBedRecords.length + lateBedRecords.length),
                    {
                        kicker: 'Sleep Insight',
                        context: 'Based on bedtime patterns observed across ' + (earlyBedRecords.length + lateBedRecords.length) + ' entries.'
                    }
                ));
            }
        }
        var tagStats = {};
        records.forEach(function(record) {
            var seen = {};
            (record.tags || []).forEach(function(tag) {
                var key = String(tag || '').trim().toLowerCase();
                if (!key || seen[key]) return;
                seen[key] = true;
                if (!tagStats[key]) tagStats[key] = { label: String(tag).trim(), records: [] };
                tagStats[key].records.push(record);
            });
        });
        Object.keys(tagStats).forEach(function(key) {
            var stat = tagStats[key];
            if (!stat || stat.records.length < minGroup) return;
            var avgWith = averageMoodForRecords(stat.records);
            var diff = avgWith - overallMood;
            if (Math.abs(diff) < 0.20) return;
            candidates.push(createInsightCandidate(
                'tags',
                diff > 0 ? '\u201c' + stat.label + '\u201d days tend to lift you' : '\u201c' + stat.label + '\u201d days weigh on you',
                diff > 0
                    ? 'Days you tag \u201c' + stat.label + '\u201d tend to show higher mood than your average.'
                    : 'Days tagged \u201c' + stat.label + '\u201d often coincide with a dip in mood.',
                stat.records.length,
                Math.abs(diff) * Math.sqrt(stat.records.length),
                {
                    kicker: 'Tags',
                    icon: '#',
                    nudge: diff < 0 ? 'Worth noticing what \u201c' + stat.label + '\u201d days have in common.' : '',
                    context: 'Seen across ' + stat.records.length + ' tagged ' + (stat.records.length === 1 ? 'entry' : 'entries') + '.'
                }
            ));
        });
        var activityStats = {};
        records.forEach(function(record) {
            var seen = {};
            (record.activities || []).forEach(function(activity) {
                var key = String(activity || '').trim().toLowerCase();
                if (!key || seen[key]) return;
                seen[key] = true;
                if (!activityStats[key]) activityStats[key] = { label: String(activity).trim(), records: [] };
                activityStats[key].records.push(record);
            });
        });
        Object.keys(activityStats).forEach(function(key) {
            var stat = activityStats[key];
            if (!stat || stat.records.length < minGroup) return;
            var avgWith = averageMoodForRecords(stat.records);
            var diff = avgWith - overallMood;
            if (Math.abs(diff) < 0.20) return;
            candidates.push(createInsightCandidate(
                'activity',
                diff > 0 ? stat.label + ' days are better days' : stat.label + ' correlates with lower mood',
                diff > 0
                    ? 'Days that include ' + stat.label + ' tend to be associated with a better mood overall.'
                    : 'Days with ' + stat.label + ' in your log often show a slightly lower mood.',
                stat.records.length,
                Math.abs(diff) * Math.sqrt(stat.records.length),
                {
                    kicker: 'Activity',
                    icon: '\u25cb',
                    nudge: diff > 0 ? 'Keep prioritising it.' : '',
                    context: 'Logged ' + stat.label + ' on ' + stat.records.length + ' ' + (stat.records.length === 1 ? 'day' : 'days') + '.'
                }
            ));
        });
        var highEnergy = records.filter(function(record) { return typeof record.energy === 'number' && !isNaN(record.energy) && record.energy >= 7; });
        var lowEnergy = records.filter(function(record) { return typeof record.energy === 'number' && !isNaN(record.energy) && record.energy <= 5; });
        if (highEnergy.length >= minGroup && lowEnergy.length >= minGroup) {
            var highEnergyAvg = averageMoodForRecords(highEnergy);
            var lowEnergyAvg = averageMoodForRecords(lowEnergy);
            var energyDiff = highEnergyAvg - lowEnergyAvg;
            if (Math.abs(energyDiff) >= 0.20) {
                candidates.push(createInsightCandidate(
                    'activity',
                    'Energy Alignment',
                    energyDiff > 0
                        ? 'Higher-energy days tend to be associated with better mood.'
                        : 'Lower-energy days appear linked to better mood in your recent data.',
                    highEnergy.length + lowEnergy.length,
                    Math.abs(energyDiff) * Math.sqrt(highEnergy.length + lowEnergy.length),
                    {
                        kicker: 'Activity Insight',
                        context: 'Based on ' + highEnergy.length + ' higher-energy entries and ' + lowEnergy.length + ' lower-energy entries.'
                    }
                ));
            }
        }
        var recentRecords = records.slice(-7);
        if (recentRecords.length >= 5) {
            var recentStdDev = standardDeviation(recentRecords.map(function(record) { return record.mood; }));
            if (recentStdDev != null) {
                if (recentStdDev >= 1.8) {
                    candidates.push(createInsightCandidate(
                        'stability',
                        'Your mood has been more variable lately',
                        'The last week shows more day-to-day swings than usual. That\'s worth paying attention to.',
                        recentRecords.length,
                        recentStdDev * Math.sqrt(recentRecords.length),
                        {
                            kicker: 'Stability',
                            icon: '\u25d4',
                            nudge: 'Sleep and activity levels often drive short-term volatility.',
                            context: 'Based on the last ' + recentRecords.length + ' days.'
                        }
                    ));
                } else if (recentStdDev <= 1.1) {
                    candidates.push(createInsightCandidate(
                        'stability',
                        'You\'ve been emotionally consistent',
                        'Your mood has stayed relatively stable recently \u2014 a sign of good equilibrium.',
                        recentRecords.length,
                        (1.4 - recentStdDev) * Math.sqrt(recentRecords.length),
                        {
                            kicker: 'Stability',
                            icon: '\u25d4',
                            nudge: 'Whatever you\'re doing, it\'s working.',
                            context: 'Based on the last ' + recentRecords.length + ' days.'
                        }
                    ));
                }
            }
        }
        var byTitle = {};
        candidates.forEach(function(candidate) {
            if (!candidate || !candidate.score) return;
            var key = candidate.section + '|' + candidate.title;
            if (!byTitle[key] || byTitle[key].score < candidate.score) {
                byTitle[key] = candidate;
            }
        });
        var ranked = Object.keys(byTitle).map(function(key) { return byTitle[key]; }).sort(function(a, b) {
            return b.score - a.score;
        });
        var sectionOrder = ['sleep', 'activity', 'stability', 'tags'];
        var sections = [];
        var totalShown = 0;
        sectionOrder.forEach(function(sectionKey) {
            if (totalShown >= 8) return;
            var sectionInsights = ranked.filter(function(candidate) {
                return candidate.section === sectionKey;
            }).slice(0, Math.min(3, 8 - totalShown));
            if (!sectionInsights.length) return;
            totalShown += sectionInsights.length;
            sections.push({
                key: sectionKey,
                title: INSIGHT_SECTION_META[sectionKey] ? INSIGHT_SECTION_META[sectionKey].title : sectionKey,
                insights: sectionInsights
            });
        });
        var overview = sections.reduce(function(list, section) {
            return list.concat(section.insights);
        }, []).sort(function(a, b) {
            return b.score - a.score;
        }).slice(0, 3);
        if (!ranked.length) {
            return {
                overview: [],
                sections: [],
                summary: 'More insights will appear as you record additional entries. Track mood, sleep, and activities to uncover patterns.',
                message: 'No strong patterns stand out yet. Keep tracking to uncover clearer relationships.'
            };
        }
        return {
            overview: overview,
            sections: sections,
            summary: 'Here are the clearest patterns currently visible in your daily records. These insights are directional and become more reliable as you log more data.',
            message: ''
        };
    }
};
function generateInsights(force) {
    try {
        var signature = getInsightSignature();
        if (!force && insightsEngineCacheResult && insightsEngineCacheSignature === signature) {
            renderInsightsResult(insightsEngineCacheResult);
            return insightsEngineCacheResult;
        }
        var result = correlationInsightsEngine.analyze(getInsightRecords());
        insightsEngineCacheSignature = signature;
        insightsEngineCacheResult = result;
        renderInsightsResult(result);
        return result;
    } catch (e) {
        console.error('[Aura] generateInsights error:', e);
    }
}

function renderPredictions() {
    try {
    var dates = Object.keys(entries).sort().filter(function(d) {
        return entries[d] && typeof entries[d].mood === 'number' && !isNaN(entries[d].mood);
    }).slice(-60);
    var noteEl = document.getElementById('predictionNote');
    var patternsEl = document.getElementById('predictionPatterns');
    if (dates.length < 7) {
        if (noteEl) noteEl.textContent = 'Add at least 7 days of data to see predictions.';
        if (patternsEl) patternsEl.textContent = 'Keep tracking to discover patterns and triggers.';
        return;
    }
    var mood = dates.map(function(d) { return entries[d].mood; });
    var indices = mood.map(function(_, i) { return i; });
    var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, n = mood.length;
    for (var i = 0; i < n; i++) {
        sumX += indices[i]; sumY += mood[i];
        sumXY += indices[i] * mood[i]; sumX2 += indices[i] * indices[i];
    }
    var slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    var intercept = sumY / n - slope * (sumX / n);
    var residuals = mood.map(function(y, i) { return y - (slope * i + intercept); });
    var variance = residuals.reduce(function(a, r) { return a + r * r; }, 0) / n;
    var std = Math.sqrt(variance) || 1;
    var next7 = [];
    for (var j = 1; j <= 7; j++) {
        next7.push(slope * (n - 1 + j) + intercept);
    }
    if (typeof tf !== 'undefined') {
        try {
            var t = tf.tensor1d(next7);
            next7 = Array.from(t.dataSync());
            t.dispose();
        } catch (e) {}
    }
    var lastDate = new Date(dates[dates.length - 1]);
    var labels = [];
    var upper = [], lower = [];
    for (var k = 0; k < 7; k++) {
        var d = new Date(lastDate);
        d.setDate(d.getDate() + k + 1);
        labels.push((d.getMonth() + 1) + '/' + d.getDate());
        upper.push(Math.min(10, next7[k] + 1.5 * std));
        lower.push(Math.max(0, next7[k] - 1.5 * std));
    }
    var predCtx = document.getElementById('predictionChart');
    if (predCtx) {
        var existing = Chart.getChart(predCtx);
        if (existing) existing.destroy();
        var colors = getThemeColors();
        var bandFill = (colors.chart2 && colors.chart2.indexOf('#') === 0 && colors.chart2.length === 7) ? colors.chart2 + '18' : 'rgba(107,114,128,0.12)';
        var baseOpts = getChartConfig({ yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)' });
        baseOpts.plugins = baseOpts.plugins || {};
        baseOpts.plugins.tooltip = baseOpts.plugins.tooltip || {};
        baseOpts.plugins.tooltip.callbacks = Object.assign({}, baseOpts.plugins.tooltip.callbacks, {
            label: function(ctx) {
                if (ctx.datasetIndex === 0) return 'Forecast: ' + Number(ctx.raw).toFixed(1);
                if (ctx.datasetIndex === 1) {
                    var lo = ctx.chart.data.datasets[1].data[ctx.dataIndex];
                    var hi = ctx.chart.data.datasets[2].data[ctx.dataIndex];
                    return 'Expected range: ' + Number(lo).toFixed(1) + ' – ' + Number(hi).toFixed(1);
                }
                return null;
            }
        });
        baseOpts.plugins.tooltip.filter = function(tooltipItems) {
            return tooltipItems.filter(function(item) { return item.datasetIndex !== 2; });
        };
        new Chart(predCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Forecast', data: next7, borderColor: colors.chart1 || colors.textPrimary, backgroundColor: 'transparent', fill: false, tension: 0.35, borderWidth: 2.5, pointRadius: 2, pointHoverRadius: 6, pointBackgroundColor: colors.chart1 || colors.textPrimary, pointBorderColor: colors.surface || colors.chart1, pointBorderWidth: 1 },
                    { label: 'Lower', data: lower, borderColor: 'transparent', fill: '+1', backgroundColor: bandFill, tension: 0.35, borderWidth: 0, pointRadius: 0, pointHoverRadius: 0 },
                    { label: 'Upper', data: upper, borderColor: 'transparent', fill: false, tension: 0.35, borderWidth: 0, pointRadius: 0, pointHoverRadius: 0 }
                ]
            },
            options: baseOpts
        });
    }
    if (noteEl) noteEl.textContent = '';

    // Summary stat chips
    var summaryRow = document.getElementById('predictionSummaryRow');
    if (summaryRow && n >= 7) {
        var avgMood = mood.reduce(function(a,b){return a+b;},0) / n;
        var nextAvg = next7.reduce(function(a,b){return a+b;},0) / 7;
        var chips = [
            { label: 'Days of data', value: String(n) },
            { label: 'Recent avg', value: avgMood.toFixed(1) },
            { label: '7-day forecast', value: nextAvg.toFixed(1) },
            { label: 'Variability', value: '\xb1' + std.toFixed(1) }
        ];
        summaryRow.innerHTML = chips.map(function(c) {
            return '<div class="prediction-stat-chip"><span class="prediction-stat-label">' + escapeHtml(c.label) + '</span><span class="prediction-stat-value">' + escapeHtml(c.value) + '</span></div>';
        }).join('');
    }

    // Interpretation block
    var interpEl = document.getElementById('predictionInterpretation');
    var interpTextEl = document.getElementById('predictionInterpretationText');
    if (interpEl && interpTextEl && n >= 7) {
        var trendDesc = '';
        if (slope > 0.04) trendDesc = 'Your mood has been on a steady upward trajectory.';
        else if (slope > 0.01) trendDesc = 'There\u2019s a gentle upward drift in your recent mood.';
        else if (slope < -0.04) trendDesc = 'Your mood has been gradually trending downward lately.';
        else if (slope < -0.01) trendDesc = 'There\u2019s a slight downward drift over recent weeks.';
        else trendDesc = 'Your mood has been holding fairly steady.';

        var stabilityDesc = std < 1 ? 'Your day-to-day variability is low, so the forecast band is narrow.' :
                             std < 2 ? 'Some day-to-day variability means the actual range could vary.' :
                                       'Your mood has been quite variable, so treat this forecast as a rough guide.';

        interpTextEl.textContent = trendDesc + ' ' + stabilityDesc;
        interpEl.style.display = '';
    }

    // Pattern text (richer)
    var patternText = [];
    if (slope > 0.02) patternText.push('Your mood has been climbing gradually \u2014 a positive sign.');
    else if (slope < -0.02) patternText.push('There\u2019s a gentle downward drift lately. Worth checking in on sleep and activity patterns.');
    else patternText.push('Your mood has been stable \u2014 consistent tracking is helping you see this clearly.');

    if (std < 1) patternText.push('Low day-to-day variability suggests good equilibrium.');
    else if (std > 2) patternText.push('Higher variability in your recent data means the forecast range is wider than usual.');

    patternText.push('This forecast is based on your last ' + n + ' logged days. The more you track, the sharper it gets.');

    if (patternsEl) patternsEl.innerHTML = patternText.join(' ');
    } catch (e) {
        console.error('[Aura] renderPredictions error:', e);
    }
}

var radarModeState = 'weekly';
var selectedRadarMonth = null;
var MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function getCurrentRadarMonth() {
    var d = new Date();
    var y = d.getFullYear();
    var m = d.getMonth();
    return y + '-' + (m < 9 ? '0' : '') + (m + 1);
}
function getRadarMonthsWithEntries() {
    var keys = Object.keys(entries);
    var seen = {};
    keys.forEach(function(dateStr) {
        var d = new Date(dateStr + 'T12:00:00');
        var y = d.getFullYear();
        var m = d.getMonth();
        var key = y + '-' + (m < 9 ? '0' : '') + (m + 1);
        seen[key] = { year: y, month: m };
    });
    return Object.keys(seen).sort().reverse().map(function(k) { return seen[k]; });
}
function getWeeklyRadarData() {
    var today = new Date();
    today.setHours(23, 59, 59, 999);
    var sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var byDay = days.map(function() { return []; });
    Object.keys(entries).forEach(function(dateStr) {
        var d = new Date(dateStr + 'T12:00:00');
        if (d < sevenDaysAgo || d > today) return;
        var e = entries[dateStr];
        var mood = e.mood;
        if (typeof mood !== 'number' || isNaN(mood)) return;
        byDay[d.getDay()].push(mood);
    });
    var avg = byDay.map(function(arr) {
        return arr.length ? arr.reduce(function(a, b) { return a + b; }, 0) / arr.length : null;
    });
    return { avg: avg, entryCount: byDay.reduce(function(s, arr) { return s + arr.length; }, 0) };
}
function getMonthlyRadarData(month, year) {
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var byDay = days.map(function() { return []; });
    Object.keys(entries).forEach(function(dateStr) {
        var d = new Date(dateStr + 'T12:00:00');
        if (d.getMonth() !== month || d.getFullYear() !== year) return;
        var e = entries[dateStr];
        var mood = e.mood;
        if (typeof mood !== 'number' || isNaN(mood)) return;
        byDay[d.getDay()].push(mood);
    });
    var avg = byDay.map(function(arr) {
        return arr.length ? arr.reduce(function(a, b) { return a + b; }, 0) / arr.length : null;
    });
    var entryCount = byDay.reduce(function(s, arr) { return s + arr.length; }, 0);
    return { avg: avg, entryCount: entryCount };
}
function formatRadarMonth(value) {
    if (!value) return '';
    var parts = value.split('-');
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    if (isNaN(year) || isNaN(month) || month < 0 || month > 11) return value;
    return MONTH_NAMES[month] + ' ' + year;
}
function populateMonthPicker() {
    var list = document.querySelector('.radar-month-picker .month-list');
    var label = document.getElementById('radarSelectedMonthLabel');
    if (!list) return;
    var months = getRadarMonthsWithEntries();
    var optionValues = months.map(function(o) { return o.year + '-' + (o.month < 9 ? '0' : '') + (o.month + 1); });
    if (!selectedRadarMonth && optionValues.length > 0) selectedRadarMonth = getCurrentRadarMonth();
    if (selectedRadarMonth && optionValues.indexOf(selectedRadarMonth) === -1) selectedRadarMonth = optionValues[0] || null;
    list.innerHTML = '';
    months.forEach(function(o) {
        var val = o.year + '-' + (o.month < 9 ? '0' : '') + (o.month + 1);
        var option = document.createElement('div');
        option.className = 'month-option' + (val === selectedRadarMonth ? ' active' : '');
        option.textContent = MONTH_NAMES[o.month] + ' ' + o.year;
        option.setAttribute('data-value', val);
        option.setAttribute('role', 'option');
        list.appendChild(option);
    });
    if (label) label.textContent = formatRadarMonth(selectedRadarMonth) || (optionValues.length ? formatRadarMonth(optionValues[0]) : '');
}
function updateRadarTitle() {
    var titleEl = document.getElementById('radarTitle');
    if (!titleEl) return;
    if (radarModeState === 'weekly') {
        titleEl.textContent = 'Mood Patterns — Last 7 Days';
    } else {
        var monthLabel = formatRadarMonth(selectedRadarMonth);
        titleEl.textContent = monthLabel ? monthLabel + ' Mood Overview' : 'Monthly Mood Overview';
    }
}
function renderRadarChart() {
    var ctx = document.getElementById('radarChart');
    var wrap = document.getElementById('radarChartWrap');
    var emptyEl = document.getElementById('radarChartEmpty');
    var contextLabel = document.getElementById('radarChartContextLabel');
    var controls = document.getElementById('radarControls');
    var monthSelectWrap = document.getElementById('radarMonthSelectWrap');
    var monthTrigger = document.getElementById('radarMonthTrigger');
    var monthPopover = document.getElementById('radarMonthPopover');
    var monthList = controls ? controls.querySelector('.month-list') : null;
    if (!ctx || !wrap || !emptyEl || !contextLabel) return;
    populateMonthPicker();
    if (controls && !controls._radarBound) {
        controls._radarBound = true;
        controls.querySelectorAll('.radar-mode').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var mode = btn.getAttribute('data-mode');
                radarModeState = mode;
                controls.classList.toggle('radar-mode-weekly', mode === 'weekly');
                controls.querySelectorAll('.radar-mode').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-mode') === mode); });
                if (monthSelectWrap) monthSelectWrap.style.display = mode === 'monthly' ? '' : 'none';
                if (monthPopover) monthPopover.classList.add('hidden');
                renderRadarChart();
            });
        });
        if (monthTrigger && monthPopover) {
            monthTrigger.addEventListener('click', function(e) {
                e.stopPropagation();
                monthPopover.classList.toggle('hidden');
                monthTrigger.setAttribute('aria-expanded', monthPopover.classList.contains('hidden') ? 'false' : 'true');
            });
        }
        if (monthList) {
            monthList.addEventListener('click', function(e) {
                var opt = e.target.closest('.month-option');
                if (!opt) return;
                var val = opt.getAttribute('data-value');
                selectedRadarMonth = val;
                var labelEl = document.getElementById('radarSelectedMonthLabel');
                if (labelEl) labelEl.textContent = opt.textContent;
                monthPopover.classList.add('hidden');
                if (monthTrigger) monthTrigger.setAttribute('aria-expanded', 'false');
                renderRadarChart();
            });
        }
        document.addEventListener('click', function closeMonthPopover(e) {
            if (monthPopover && !e.target.closest('.radar-month-picker')) {
                monthPopover.classList.add('hidden');
                if (monthTrigger) monthTrigger.setAttribute('aria-expanded', 'false');
            }
        });
    }
    if (controls) controls.classList.toggle('radar-mode-weekly', radarModeState === 'weekly');
    if (monthSelectWrap) monthSelectWrap.style.display = radarModeState === 'monthly' ? '' : 'none';
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var result;
    var contextText;
    if (radarModeState === 'weekly') {
        result = getWeeklyRadarData();
        contextText = 'Weekly Balance (Last 7 Days)';
    } else {
        var val = selectedRadarMonth;
        if (!val) {
            var months = getRadarMonthsWithEntries();
            if (months.length === 0) { val = null; } else { var m = months[0]; val = m.year + '-' + (m.month < 9 ? '0' : '') + (m.month + 1); selectedRadarMonth = val; }
        }
        if (!val) {
            result = { avg: days.map(function() { return null; }), entryCount: 0 };
            contextText = 'Monthly';
        } else {
            var parts = val.split('-');
            var year = parseInt(parts[0], 10);
            var month = parseInt(parts[1], 10) - 1;
            result = getMonthlyRadarData(month, year);
            contextText = MONTH_NAMES[month] + ' ' + year + ' Overview';
        }
    }
    contextLabel.textContent = contextText || 'Weekly Balance (Last 7 Days)';
    updateRadarTitle();
    if (result.entryCount === 0) {
        emptyEl.style.display = 'block';
        wrap.style.display = 'none';
        var existing = Chart.getChart(ctx);
        if (existing) existing.destroy();
        return;
    }
    emptyEl.style.display = 'none';
    wrap.style.display = 'block';
    var avg = result.avg;
    var filled = avg.slice();
    var hasNull = filled.some(function(v) { return v == null; });
    if (hasNull) {
        var sum = 0, n = 0;
        filled.forEach(function(v) { if (v != null) { sum += v; n++; } });
        var fallback = n ? sum / n : 1;
        for (var i = 0; i < filled.length; i++) if (filled[i] == null) filled[i] = fallback;
    }
    var existing = Chart.getChart(ctx);
    if (existing) existing.destroy();
    var colors = getThemeColors();
    var gridColor = colors.grid || 'rgba(0,0,0,0.06)';
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: days,
            datasets: [
                {
                    label: 'Average mood',
                    data: filled,
                    borderColor: colors.chart1,
                    backgroundColor: colors.chart1 + '22',
                    borderWidth: 2,
                    tension: 0.2,
                    pointBackgroundColor: colors.chart1,
                    pointBorderColor: colors.surface || colors.chart1,
                    pointBorderWidth: 1.5,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    pointHoverBorderWidth: 1.5,
                    pointHoverBackgroundColor: colors.chart1,
                    pointHoverBorderColor: colors.surface
                }
            ]
        },
        options: (function() {
            var globalStyle = typeof getAuraChartOptions === 'function' ? getAuraChartOptions() : {};
            var existingOptions = {
                layout: { padding: { top: 14, bottom: 14, left: 14, right: 14 } },
                plugins: {
                    ...globalStyle.plugins,
                    tooltip: {
                        ...(globalStyle.plugins && globalStyle.plugins.tooltip),
                        callbacks: {
                            label: function(context) {
                                var v = context.raw;
                                return 'Average mood: ' + (typeof v === 'number' && !isNaN(v) ? v.toFixed(1) : v);
                            }
                        }
                    }
                },
                scales: {
                    x: { grid: { display: false }, border: { display: false } },
                    y: { grid: { color: gridColor }, border: { display: false } },
                    r: {
                        min: 1,
                        max: 10,
                        border: { display: false },
                        angleLines: { color: gridColor, lineWidth: 0.5 },
                        grid: { color: gridColor, drawBorder: false, lineWidth: 0.5 },
                        ticks: {
                            stepSize: 1,
                            font: { size: 11, family: "'DM Sans', sans-serif" },
                            color: colors.text,
                            padding: 8,
                            backdropColor: 'transparent',
                            backdropPadding: 2,
                            callback: function(v) { return Number.isInteger(v) ? v : ''; }
                        },
                        pointLabels: {
                            font: { size: 12, family: "'DM Sans', sans-serif", weight: '500' },
                            color: colors.textPrimary || colors.text,
                            padding: 6
                        }
                    }
                }
            };
            return { ...globalStyle, ...existingOptions };
        })()
    });
}

function renderDistributionChart() {
    var ctx = document.getElementById('distributionChart');
    if (!ctx) return;
    var moods = Object.keys(entries).map(function(d) { return entries[d].mood; }).filter(function(m) { return typeof m === 'number' && !isNaN(m); });
    if (moods.length === 0) {
        var parent = ctx.parentElement;
        if (parent) {
            ctx.style.display = 'none';
            var summaryEl = document.getElementById('distributionChartSummary');
            if (summaryEl) summaryEl.textContent = '';
            var existingMsg = parent.querySelector('.chart-empty-message');
            if (!existingMsg) {
                var msg = document.createElement('p');
                msg.className = 'chart-empty-message';
                msg.style.color = 'var(--text-muted)';
                msg.style.fontSize = '0.9rem';
                msg.style.marginTop = 'var(--space-sm)';
                msg.textContent = 'No mood data yet. Add entries to see your mood distribution.';
                parent.appendChild(msg);
            }
        }
        return;
    }
    ctx.style.display = 'block';
    var parentMsg = ctx.parentElement && ctx.parentElement.querySelector('.chart-empty-message');
    if (parentMsg) parentMsg.remove();
    var moodBuckets = new Array(10).fill(0);
    moods.forEach(function(m) {
        var bucketIndex = Math.round(m) - 1;
        if (bucketIndex >= 0 && bucketIndex <= 9) moodBuckets[bucketIndex]++;
    });
    var chartLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    var colors = getThemeColors();
    var barColor = colors.chart1 || getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim() || '#8B9D83';
    var existing = Chart.getChart(ctx);
    if (existing) existing.destroy();
    var hoverAlpha = (barColor && barColor.indexOf('#') === 0 && barColor.length === 7) ? barColor + 'dd' : barColor;
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: chartLabels,
            datasets: [{
                label: 'Frequency',
                data: moodBuckets,
                backgroundColor: barColor,
                hoverBackgroundColor: hoverAlpha,
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: (function() {
            var globalStyle = typeof getAuraChartOptions === 'function' ? getAuraChartOptions() : {};
            var gridColor = colors.grid || 'rgba(0,0,0,0.06)';
            var existingOptions = {
                layout: { padding: { top: 12, bottom: 12, left: 12, right: 12 } },
                plugins: {
                    ...globalStyle.plugins,
                    tooltip: {
                        ...(globalStyle.plugins && globalStyle.plugins.tooltip),
                        callbacks: {
                            label: function(context) {
                                var count = context.raw;
                                var moodLevel = context.label;
                                return 'Mood ' + moodLevel + ': ' + count + ' entr' + (count !== 1 ? 'ies' : 'y') + '.';
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Mood level', font: { size: 11, weight: '600' }, color: colors.textPrimary || colors.text },
                        grid: { display: false },
                        border: { display: false },
                        ticks: { font: { size: 11 }, color: colors.text, padding: 8, autoSkip: false, maxTicksLimit: 10 },
                        barPercentage: 0.82,
                        categoryPercentage: 0.9
                    },
                    y: {
                        min: 0,
                        title: { display: true, text: 'Frequency', font: { size: 11, weight: '600' }, color: colors.textPrimary || colors.text },
                        grid: { color: gridColor },
                        border: { display: false },
                        ticks: { font: { size: 11 }, color: colors.text, padding: 8, stepSize: 1 }
                    }
                }
            };
            return { ...globalStyle, ...existingOptions };
        })()
    });
    var maxCount = Math.max.apply(null, moodBuckets);
    var modeMood = 1;
    for (var j = 9; j >= 0; j--) {
        if (moodBuckets[j] === maxCount) { modeMood = j + 1; break; }
    }
    var daysAt8Plus = (moodBuckets[7] || 0) + (moodBuckets[8] || 0) + (moodBuckets[9] || 0);
    var summaryEl = document.getElementById('distributionChartSummary');
    if (summaryEl) summaryEl.textContent = 'You most frequently feel a ' + modeMood + ' — and you\'ve had ' + daysAt8Plus + ' day' + (daysAt8Plus !== 1 ? 's' : '') + ' at an 8 or above.';
}

var sleepTimelineRangeDays = 30;
function formatSleepTimelineDuration(totalMinutes) {
    var minutes = Math.max(0, Math.round(totalMinutes || 0));
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    if (!mins) return hours + 'h';
    if (!hours) return mins + 'm';
    return hours + 'h ' + mins + 'm';
}
function sleepTimelineMinutesFromTime(value) {
    var hhmm = parseTimeToHHmm(value || '');
    if (!hhmm) return null;
    var parts = hhmm.split(':');
    var hours = parseInt(parts[0], 10);
    var minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    return (hours * 60) + minutes;
}
function parseSleepSegmentTime(str) {
    // Direct 24h HH:MM parser for stored sleep segment times
    // Avoids parseTimeToHHmm which applies sticky AM/PM and corrupts morning hours
    if (!str || typeof str !== 'string') return '';
    var m = str.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!m) return '';
    var h = parseInt(m[1], 10), min = parseInt(m[2], 10);
    if (h < 0 || h > 23 || min < 0 || min > 59) return '';
    return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
}
function splitSleepTimelineSegment(segment) {
    if (!segment) return null;
    var start = parseSleepSegmentTime(segment.start || '') || parseTimeToHHmm(segment.start || '');
    var end = parseSleepSegmentTime(segment.end || '') || parseTimeToHHmm(segment.end || '');
    if (!start || !end) return null;
    var startMinutes = sleepTimelineMinutesFromTime(start);
    var endMinutes = sleepTimelineMinutesFromTime(end);
    if (startMinutes == null || endMinutes == null || startMinutes === endMinutes) return null;
    var durationMinutes;
    if (endMinutes > startMinutes) {
        durationMinutes = endMinutes - startMinutes;
    } else {
        durationMinutes = (1440 - startMinutes) + endMinutes;
    }
    durationMinutes = Math.min(Math.max(0, durationMinutes), 720);
    return {
        start: start,
        end: end,
        durationMinutes: durationMinutes,
        blocks: endMinutes > startMinutes
            ? [{ start: startMinutes, end: endMinutes }]
            : [
                { start: startMinutes, end: 1440 },
                { start: 0, end: endMinutes }
            ]
    };
}
function getSleepTimelineRecords(rangeDays) {
    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var start = new Date(today);
    start.setDate(start.getDate() - ((rangeDays || 30) - 1));
    var fromStr = start.toISOString().split('T')[0];
    return Object.keys(entries).filter(function(date) {
        return date >= fromStr;
    }).sort().reverse().map(function(date) {
        var record = entries[date];
        var segments = (record && Array.isArray(record.sleepSegments) ? record.sleepSegments : []).map(splitSleepTimelineSegment).filter(Boolean);
        // Fallback: synthesize one segment from sleepTime + wakeTime if no explicit segments
        if (!segments.length && record && record.sleepTime && record.wakeTime) {
            var synth = splitSleepTimelineSegment({ start: record.sleepTime, end: record.wakeTime });
            if (synth) segments = [synth];
        }
        if (!segments.length) return null;
        return {
            date: date,
            record: record,
            segments: segments
        };
    }).filter(Boolean).slice(0, rangeDays || 30);
}
function updateSleepTimelineTooltipPosition(tipEl, x, y) {
    if (!tipEl) return;
    tipEl.style.left = Math.min(x + 14, window.innerWidth - 220) + 'px';
    tipEl.style.top = Math.max(12, y - 18) + 'px';
    tipEl.style.transform = 'translateY(-100%)';
}
function showSleepTimelineTooltip(target, segment, event) {
    var tipEl = document.getElementById('sleepTimelineTooltip');
    if (!tipEl || !segment) return;
    tipEl.innerHTML =
        '<div style="font-weight: 600; margin-bottom: 4px;">Sleep Segment</div>' +
        '<div>Start: ' + escapeHtml(formatDisplayTime(segment.start, window.auraTimeFormat || '12')) + '</div>' +
        '<div>End: ' + escapeHtml(formatDisplayTime(segment.end, window.auraTimeFormat || '12')) + '</div>' +
        '<div>Duration: ' + escapeHtml(formatSleepTimelineDuration(segment.durationMinutes)) + '</div>';
    tipEl.classList.add('show');
    tipEl.setAttribute('aria-hidden', 'false');
    var rect = target.getBoundingClientRect();
    updateSleepTimelineTooltipPosition(tipEl, event && event.clientX != null ? event.clientX : (rect.left + rect.width / 2), event && event.clientY != null ? event.clientY : rect.top);
}
function hideSleepTimelineTooltip() {
    var tipEl = document.getElementById('sleepTimelineTooltip');
    if (!tipEl) return;
    tipEl.classList.remove('show');
    tipEl.setAttribute('aria-hidden', 'true');
}
function setSleepTimelineRange(days, button) {
    sleepTimelineRangeDays = days || 30;
    var controls = document.getElementById('sleepTimelineControls');
    if (controls) {
        controls.querySelectorAll('button[data-range]').forEach(function(btn) {
            var active = parseInt(btn.getAttribute('data-range'), 10) === sleepTimelineRangeDays;
            btn.classList.toggle('btn', active);
            btn.classList.toggle('btn-secondary', !active);
        });
    }
    renderSleepTimeline();
}
function renderSleepTimeline() {
    var el = document.getElementById('sleepTimelineChart');
    if (!el) return;
    var controls = document.getElementById('sleepTimelineControls');
    if (controls) {
        controls.querySelectorAll('button[data-range]').forEach(function(btn) {
            var active = parseInt(btn.getAttribute('data-range'), 10) === sleepTimelineRangeDays;
            btn.classList.toggle('btn', active);
            btn.classList.toggle('btn-secondary', !active);
        });
    }
    var rows = getSleepTimelineRecords(sleepTimelineRangeDays);
    if (!rows.length) {
        el.innerHTML = '<p class="sleep-timeline-empty">No sleep data yet.<br>Add sleep segments in the Daily Check-In to see patterns.</p>';
        hideSleepTimelineTooltip();
        return;
    }
    var axisLabels = [
        { label: '00:00', left: '0%' },
        { label: '06:00', left: '25%' },
        { label: '12:00', left: '50%' },
        { label: '18:00', left: '75%' },
        { label: '24:00', left: '100%' }
    ];
    el.innerHTML = '';
    var axis = document.createElement('div');
    axis.className = 'sleep-timeline-axis';
    axis.innerHTML =
        '<div></div>' +
        '<div class="sleep-timeline-axis-labels">' +
            axisLabels.map(function(item) {
                return '<span style="left:' + item.left + ';">' + item.label + '</span>';
            }).join('') +
        '</div>' +
        '<div></div>';
    el.appendChild(axis);
    rows.forEach(function(row, rowIndex) {
        var rowEl = document.createElement('div');
        rowEl.className = 'sleep-timeline-row';
        var moodText = row.record && row.record.mood != null ? ('Mood ' + formatDeleteEntryMetric(row.record.mood)) : '';
        rowEl.innerHTML =
            '<div class="sleep-timeline-date">' + escapeHtml(formatDisplayDate(row.date, window.auraDateFormat || 'MD')) + '</div>' +
            '<div class="sleep-timeline-track"></div>' +
            '<div class="sleep-timeline-mood">' + escapeHtml(moodText) + '</div>';
        var trackEl = rowEl.querySelector('.sleep-timeline-track');
        row.segments.forEach(function(segment, segIndex) {
            segment.blocks.forEach(function(block, blockIndex) {
                var blockEl = document.createElement('button');
                blockEl.type = 'button';
                blockEl.className = 'sleep-timeline-segment';
                blockEl.style.left = ((block.start / 1440) * 100) + '%';
                blockEl.style.width = Math.max(((block.end - block.start) / 1440) * 100, 1.2) + '%';
                blockEl.style.animationDelay = ((rowIndex * 25) + (segIndex * 40) + (blockIndex * 10)) + 'ms';
                blockEl.setAttribute('aria-label', 'Sleep segment from ' + segment.start + ' to ' + segment.end + ', duration ' + formatSleepTimelineDuration(segment.durationMinutes));
                blockEl.addEventListener('mouseenter', function(e) { showSleepTimelineTooltip(blockEl, segment, e); });
                blockEl.addEventListener('mousemove', function(e) { showSleepTimelineTooltip(blockEl, segment, e); });
                blockEl.addEventListener('mouseleave', hideSleepTimelineTooltip);
                blockEl.addEventListener('focus', function() { showSleepTimelineTooltip(blockEl, segment); });
                blockEl.addEventListener('blur', hideSleepTimelineTooltip);
                blockEl.addEventListener('click', function(e) {
                    e.preventDefault();
                    showSleepTimelineTooltip(blockEl, segment, e);
                    setTimeout(hideSleepTimelineTooltip, 2200);
                });
                trackEl.appendChild(blockEl);
            });
        });
        el.appendChild(rowEl);
    });
}

function formatHourRange(hour) {
    var h1 = hour % 12; var am1 = hour < 12; var s1 = (h1 === 0 ? '12' : String(h1)) + (am1 ? 'am' : 'pm');
    var hour2 = (hour + 1) % 24; var h2 = hour2 % 12; var am2 = hour2 < 12; var s2 = (h2 === 0 ? '12' : String(h2)) + (am2 ? 'am' : 'pm');
    return s1 + '–' + s2;
}
var TIME_OF_DAY_BUCKETS = [
    { label: 'Night', range: [0, 3] },
    { label: 'Early AM', range: [4, 7] },
    { label: 'Morning', range: [8, 11] },
    { label: 'Afternoon', range: [12, 15] },
    { label: 'Evening', range: [16, 19] },
    { label: 'Late Night', range: [20, 23] }
];
function getBucketIndexForHour(hour) {
    for (var i = 0; i < TIME_OF_DAY_BUCKETS.length; i++) {
        var r = TIME_OF_DAY_BUCKETS[i].range;
        if (hour >= r[0] && hour <= r[1]) return i;
    }
    return -1;
}
function renderDayOfWeekChart() {
    var canvas = document.getElementById('dowChart');
    var insightEl = document.getElementById('dowChartInsight');
    var card = canvas ? canvas.closest('.card') : null;
    if (!canvas || !card) return;
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var fullNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var buckets = [[], [], [], [], [], [], []];
    var allDates = Object.keys(entries);
    allDates.forEach(function(d) {
        var e = entries[d];
        if (!e || typeof e.mood !== 'number' || isNaN(e.mood)) return;
        var day = new Date(d + 'T12:00:00').getDay();
        buckets[day].push(e.mood);
    });
    var totalEntries = allDates.filter(function(d) {
        var e = entries[d];
        return e && typeof e.mood === 'number' && !isNaN(e.mood);
    }).length;
    var noDataMsg = card.querySelector('.dow-no-data-msg');
    if (totalEntries < 14) {
        canvas.style.display = 'none';
        if (insightEl) insightEl.textContent = '';
        if (!noDataMsg) {
            noDataMsg = document.createElement('p');
            noDataMsg.className = 'dow-no-data-msg';
            noDataMsg.style.cssText = 'color: var(--text-muted); font-size: 0.9rem; padding: var(--space-md) 0;';
            noDataMsg.textContent = 'Add at least 2 weeks of entries to see your weekly patterns.';
            canvas.parentNode.insertBefore(noDataMsg, canvas);
        }
        var existingChart = Chart.getChart(canvas);
        if (existingChart) existingChart.destroy();
        return;
    }
    canvas.style.display = '';
    if (noDataMsg) noDataMsg.remove();
    var avgs = buckets.map(function(arr) {
        if (!arr.length) return null;
        return arr.reduce(function(a, b) { return a + b; }, 0) / arr.length;
    });
    var colors = getThemeColors();
    var barColors = avgs.map(function(v, i) {
        if (v === null) return colors.chart1 + '40';
        if (i === 0 || i === 6) return colors.chart2 + 'b3';
        return colors.chart1;
    });
    var existing = Chart.getChart(canvas);
    if (existing) existing.destroy();
    var baseOpts = getChartConfig({ yMin: 1, yMax: 10, yStep: 1, yTitle: 'Mood (1–10)' });
    baseOpts.plugins = baseOpts.plugins || {};
    baseOpts.plugins.tooltip = baseOpts.plugins.tooltip || {};
    baseOpts.plugins.tooltip.callbacks = Object.assign({}, baseOpts.plugins.tooltip.callbacks, {
        label: function(ctx) {
            var v = ctx.raw;
            var day = fullNames[ctx.dataIndex] || dayNames[ctx.dataIndex];
            if (v == null) return day + ': No data';
            return day + ': ' + v.toFixed(1) + ' average';
        }
    });
    baseOpts.scales = baseOpts.scales || {};
    baseOpts.scales.x = baseOpts.scales.x || {};
    baseOpts.scales.x.ticks = Object.assign({}, baseOpts.scales.x.ticks, { autoSkip: false, maxTicksLimit: 7 });
    baseOpts.scales.x.barPercentage = 0.78;
    baseOpts.scales.x.categoryPercentage = 0.88;
    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: dayNames,
            datasets: [{
                label: 'Average mood',
                data: avgs,
                backgroundColor: barColors,
                hoverBackgroundColor: barColors.map(function(c) {
                    if (!c) return c;
                    if (c.indexOf('#') === 0 && c.length === 7) return c + 'e6';
                    return c;
                }),
                borderRadius: 10,
                borderSkipped: false
            }]
        },
        options: baseOpts
    });
    var best = -1, worst = 11, bestIdx = -1, worstIdx = -1;
    avgs.forEach(function(v, i) {
        if (v === null) return;
        if (v > best) { best = v; bestIdx = i; }
        if (v < worst) { worst = v; worstIdx = i; }
    });
    if (insightEl && bestIdx >= 0 && worstIdx >= 0 && bestIdx !== worstIdx) {
        insightEl.textContent = 'Your mood tends to peak on ' + fullNames[bestIdx] + 's and dip on ' + fullNames[worstIdx] + 's.';
    } else if (insightEl) {
        insightEl.textContent = '';
    }
}
function renderTimeHeatmap() {
    var el = document.getElementById('timeHeatmap');
    if (!el) return;
    var colors = getThemeColors();
    // Use wakeTime for mood-by-wake-time analysis (more meaningful than sleep onset)
    var wakeBuckets = [
        { sum: 0, count: 0 }, { sum: 0, count: 0 },
        { sum: 0, count: 0 }, { sum: 0, count: 0 },
        { sum: 0, count: 0 }, { sum: 0, count: 0 }
    ];
    var sleepBuckets = [
        { sum: 0, count: 0 }, { sum: 0, count: 0 },
        { sum: 0, count: 0 }, { sum: 0, count: 0 },
        { sum: 0, count: 0 }, { sum: 0, count: 0 }
    ];
    var entryList = Object.keys(entries).map(function(d) { return entries[d]; });
    entryList.forEach(function(entry) {
        var mood = entry.mood;
        if (typeof mood !== 'number' || isNaN(mood)) return;
        // Wake time → mood by wake-up hour
        var wakeStr = entry.wakeTime || (entry.sleepSegments && entry.sleepSegments[0] && entry.sleepSegments[0].end) || '';
        if (wakeStr) {
            var wParts = wakeStr.split(':');
            var wHour = parseInt(wParts[0], 10);
            if (!isNaN(wHour) && wHour >= 0 && wHour <= 23) {
                var wIdx = getBucketIndexForHour(wHour);
                if (wIdx >= 0) { wakeBuckets[wIdx].sum += mood; wakeBuckets[wIdx].count++; }
            }
        }
        // Sleep time → mood by bedtime hour
        var sleepStr = entry.sleepTime || (entry.sleepSegments && entry.sleepSegments[0] && entry.sleepSegments[0].start) || '';
        if (sleepStr) {
            var sParts = sleepStr.split(':');
            var sHour = parseInt(sParts[0], 10);
            if (!isNaN(sHour) && sHour >= 0 && sHour <= 23) {
                var sIdx = getBucketIndexForHour(sHour);
                if (sIdx >= 0) { sleepBuckets[sIdx].sum += mood; sleepBuckets[sIdx].count++; }
            }
        }
    });
    var hasWake = wakeBuckets.some(function(b) { return b.count > 0; });
    var hasSleep = sleepBuckets.some(function(b) { return b.count > 0; });
    if (!hasWake && !hasSleep) {
        el.innerHTML = '<p class="chart-empty-message" style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">No time data yet. Add sleep/wake times in the Daily Check-In to see patterns.</p>';
        return;
    }
    wakeBuckets.forEach(function(b) { b.average = b.count ? b.sum / b.count : null; });
    sleepBuckets.forEach(function(b) { b.average = b.count ? b.sum / b.count : null; });
    el.innerHTML = '';
    var heatGood = colors.heatGood || getComputedStyle(document.documentElement).getPropertyValue('--heat-good').trim() || '#8B9D83';
    var heatMid = colors.heatMid || getComputedStyle(document.documentElement).getPropertyValue('--heat-mid').trim() || '#D4AF37';
    var heatBad = colors.heatBad || getComputedStyle(document.documentElement).getPropertyValue('--heat-bad').trim() || '#C97D60';
    function makeCellColor(avg) {
        if (avg == null) return 'var(--bg)';
        if (avg >= 7.5) return heatGood;
        if (avg >= 5) return heatMid;
        return heatBad;
    }
    function renderRow(label, buckets) {
        var row = document.createElement('div');
        row.className = 'time-heatmap-row';
        var rowLabel = document.createElement('div');
        rowLabel.className = 'time-heatmap-row-label';
        rowLabel.textContent = label;
        row.appendChild(rowLabel);
        var cells = document.createElement('div');
        cells.className = 'time-heatmap-cells';
        for (var i = 0; i < 6; i++) {
            var b = buckets[i];
            var meta = TIME_OF_DAY_BUCKETS[i];
            var cell = document.createElement('div');
            cell.className = 'time-heatmap-cell heatmap-animate';
            cell.style.animationDelay = (i * 40) + 'ms';
            var labelSpan = document.createElement('span');
            labelSpan.className = 'time-label';
            labelSpan.textContent = meta.label;
            cell.appendChild(labelSpan);
            var avgSpan = document.createElement('span');
            avgSpan.className = 'time-avg';
            if (b.average != null) {
                avgSpan.textContent = 'Avg ' + b.average.toFixed(1);
                cell.style.backgroundColor = makeCellColor(b.average);
                cell.style.opacity = '1';
            } else {
                avgSpan.textContent = 'No data';
                cell.style.backgroundColor = 'var(--bg)';
                cell.style.opacity = '0.4';
            }
            cell.appendChild(avgSpan);
            var tooltipLines = label + ' · ' + meta.label + '\nAverage Mood: ' + (b.average != null ? b.average.toFixed(1) : '—') + '\nEntries: ' + b.count;
            cell.setAttribute('data-time-tooltip', tooltipLines);
            cell.setAttribute('title', tooltipLines.replace(/\n/g, ' · '));
            cells.appendChild(cell);
        }
        row.appendChild(cells);
        return row;
    }
    if (hasWake) el.appendChild(renderRow('Wake time', wakeBuckets));
    if (hasSleep) el.appendChild(renderRow('Bedtime', sleepBuckets));
    var tipEl = document.getElementById('timeHeatmapTooltip');
    if (!tipEl) {
        tipEl = document.createElement('div');
        tipEl.id = 'timeHeatmapTooltip';
        tipEl.setAttribute('role', 'tooltip');
        tipEl.className = 'time-heatmap-tooltip';
        document.body.appendChild(tipEl);
        tipEl._hide = function() { tipEl.classList.remove('show'); };
        document.addEventListener('click', tipEl._hide);
    }
    var hide = tipEl._hide;
    el.querySelectorAll('.time-heatmap-cell').forEach(function(c) {
        var showTip = function(e) {
            e.stopPropagation();
            var text = c.getAttribute('data-time-tooltip');
            if (!text) return;
            tipEl.innerHTML = text.split('\n').map(function(line) { return '<div>' + line + '</div>'; }).join('');
            var rect = c.getBoundingClientRect();
            tipEl.style.left = (rect.left + rect.width / 2) + 'px';
            tipEl.style.top = (rect.top - 8) + 'px';
            tipEl.style.transform = 'translate(-50%, -100%)';
            tipEl.classList.add('show');
            setTimeout(hide, 2500);
        };
        c.addEventListener('mouseenter', showTip);
        c.addEventListener('focus', showTip);
        c.addEventListener('click', showTip);
    });
}

var quillEditor = null;
var journalPhotos = [];
var currentJournalEntryDate = null;
var journalDirty = false;
var journalLoadInProgress = false;

function normalizeJournalPhotoList(list) {
    return (Array.isArray(list) ? list : []).map(function(item, idx) {
        if (!item) return null;
        if (typeof item === 'string') {
            return { id: 'jp-' + idx + '-' + Math.random().toString(36).slice(2, 8), data: item, thumb: item };
        }
        if (item.data) {
            return {
                id: item.id || ('jp-' + idx + '-' + Math.random().toString(36).slice(2, 8)),
                data: item.data,
                thumb: item.thumb || item.data
            };
        }
        return null;
    }).filter(Boolean);
}
function getDefaultJournalEntryDate() {
    var today = new Date().toISOString().split('T')[0];
    if (entries[today]) return today;
    var dates = Object.keys(entries).sort().reverse();
    return dates.length ? dates[0] : null;
}
function getJournalTextHtml() {
    if (!quillEditor) return '';
    var text = quillEditor.getText().trim();
    return text ? quillEditor.root.innerHTML : '';
}
function updateJournalWordCount() {
    if (!quillEditor) return;
    var text = quillEditor.getText();
    var words = text.trim() ? text.trim().split(/\s+/).length : 0;
    var el = document.getElementById('journalWordCount');
    if (el) el.textContent = words + ' word' + (words !== 1 ? 's' : '');
}
function updateJournalMeta() {
    var titleEl = document.getElementById('journalPageTitle');
    var metaEl = document.getElementById('journalEntryMeta');
    var saveBtn = document.getElementById('saveJournalBtn');
    var photoBtn = document.getElementById('journalPhotoAddBtn');
    var unsavedEl = document.getElementById('journalUnsavedIndicator');
    var hasDate = !!currentJournalEntryDate;
    var formattedDate = hasDate ? formatDisplayDate(currentJournalEntryDate, window.auraDateFormat || 'MD') : '';
    if (titleEl) titleEl.textContent = formattedDate ? 'Journal — ' + formattedDate : 'Journal';
    if (metaEl) {
        metaEl.textContent = hasDate
            ? 'Write something about your day…'
            : 'Select a date in Daily Check-In to start writing.';
    }
    if (saveBtn) saveBtn.disabled = !hasDate || !journalDirty;
    if (photoBtn) photoBtn.disabled = !hasDate;
    if (unsavedEl) unsavedEl.hidden = !hasDate || !journalDirty;
    if (quillEditor) quillEditor.enable(!!hasDate);
}
function setJournalDirty(dirty) {
    journalDirty = !!dirty;
    updateJournalMeta();
}
function confirmDiscardJournalChanges() {
    if (!journalDirty) return true;
    return window.confirm('You have unsaved journal changes.\nLeave without saving?');
}
function openJournalEntry(dateStr, options) {
    options = options || {};
    if (!options.force && !confirmDiscardJournalChanges()) return false;
    currentJournalEntryDate = dateStr || getWorkingEntryDate();
    if (currentJournalEntryDate) setWorkingEntryDate(currentJournalEntryDate);
    journalLoadInProgress = true;
    if (quillEditor) {
        var entry = currentJournalEntryDate ? entries[currentJournalEntryDate] : null;
        var html = getRecordJournalHtml(entry);
        if (html && html.indexOf('<') === 0) quillEditor.root.innerHTML = html;
        else quillEditor.setText(html || '');
    }
    journalPhotos = normalizeJournalPhotoList(currentJournalEntryDate && entries[currentJournalEntryDate] ? entries[currentJournalEntryDate].photos : []);
    renderJournalPhotos();
    updateJournalWordCount();
    journalLoadInProgress = false;
    setJournalDirty(false);
    renderEntryList();
    return true;
}
function ensureJournalEntrySelection(force) {
    var workingDate = getWorkingEntryDate();
    if (force || currentJournalEntryDate !== workingDate) {
        openJournalEntry(workingDate, { force: true });
        return;
    }
    updateJournalMeta();
}
function initJournalEditor() {
    var container = document.getElementById('journalEditor');
    if (!container || quillEditor) return;
    quillEditor = new Quill('#journalEditor', {
        theme: 'snow',
        placeholder: 'Write something about your day…',
        modules: {
            toolbar: [
                [{ header: [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['clean']
            ]
        }
    });
    quillEditor.on('text-change', function(delta, oldDelta, source) {
        updateJournalWordCount();
        if (source === 'user' && !journalLoadInProgress) setJournalDirty(true);
    });
    document.getElementById('journalPhotoInput').addEventListener('change', handleJournalPhotoUpload);
    ensureJournalEntrySelection(true);
    updateJournalWordCount();
}

async function saveJournal() {
    if (!currentJournalEntryDate) return;
    var entry = await upsertDailyRecord(currentJournalEntryDate, {
        journal: getJournalTextHtml(),
        photos: journalPhotos.slice()
    });
    if (getWorkingEntryDate() === currentJournalEntryDate) {
        var notesInput = document.getElementById('notes');
        if (notesInput) notesInput.value = notesValueToPlainText(entry);
        renderEntryPhotoPreviews(entry.photos || []);
        renderEntryDailySummary(currentJournalEntryDate);
    }
    setJournalDirty(false);
    renderHeatmap();
    renderEntryList();
    updateDashboard();
    showToast('Journal saved');
}

function compressImage(base64, maxW, quality) {
    return new Promise(function(resolve) {
        var img = new Image();
        img.onload = function() {
            var w = img.width, h = img.height;
            if (w > maxW) { h = (h * maxW) / w; w = maxW; }
            var c = document.createElement('canvas');
            c.width = w; c.height = h;
            c.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(c.toDataURL('image/jpeg', quality || 0.8));
        };
        img.onerror = function() { resolve(base64); };
        img.src = base64;
    });
}

function handleJournalPhotoUpload(e) {
    if (!currentJournalEntryDate) {
        // Set to today's date if not set
        currentJournalEntryDate = new Date().toISOString().split('T')[0];
        setWorkingEntryDate(currentJournalEntryDate);
    }
    var files = e.target.files;
    if (!files || !files.length) return;
    for (var i = 0; i < files.length; i++) {
        (function(idx) {
            var fr = new FileReader();
            fr.onload = function() {
                compressImage(fr.result, 800, 0.8).then(function(compressed) {
                    compressImage(fr.result, 240, 0.7).then(function(thumb) {
                        journalPhotos.push({ id: Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2), data: compressed, thumb: thumb });
                        renderJournalPhotos();
                        setJournalDirty(true);
                    });
                });
            };
            fr.readAsDataURL(files[idx]);
        })(i);
    }
    e.target.value = '';
}

function renderJournalPhotos() {
    var el = document.getElementById('journalPhotoThumbs');
    if (!el) return;
    if (!journalPhotos.length) {
        el.innerHTML = '<div class="journal-photo-empty"><span class="journal-photo-empty-icon" aria-hidden="true">📷</span><span>No photos yet</span></div>';
        return;
    }
    el.innerHTML = journalPhotos.map(function(p) {
        return '<div class="journal-photo-thumb-wrap"><img class="journal-photo-thumb" src="' + escapeHtml(p.thumb) + '" alt="Journal photo" loading="lazy" onclick="showJournalPhotoFull(\'' + p.id + '\')"><button type="button" class="journal-photo-delete" aria-label="Delete photo" onclick="deleteJournalPhoto(\'' + p.id + '\')">×</button></div>';
    }).join('');
}

function showJournalPhotoFull(id) {
    var p = journalPhotos.find(function(x) { return x.id === id; });
    if (!p) return;
    var w = window.open('', '_blank', 'width=800,height=600');
    w.document.write('<img src="' + p.data.replace(/"/g, '&quot;') + '" style="max-width:100%;height:auto;">');
}

function deleteJournalPhoto(id) {
    journalPhotos = journalPhotos.filter(function(x) { return x.id !== id; });
    renderJournalPhotos();
    setJournalDirty(true);
}

function getTagColor(tag) {
    if (!tag || typeof tag !== 'string') return TAG_COLOR_PALETTE[0];
    var idx = 0;
    for (var i = 0; i < tag.length; i++) idx = (idx * 31 + tag.charCodeAt(i)) & 0xFFFFFFF;
    var palette = TAG_COLOR_PALETTE;
    var c = palette[Math.abs(idx) % palette.length];
    return {
        background: c.background,
        borderColor: c.borderColor,
        textColor: c.textColor,
        hashIconBackground: c.hashIconBackground
    };
}

// Tag color palette – soft tinted backgrounds for tag cloud and saved tags
function _tagColor(hex, bgOpacity, borderOpacity, hashOpacity) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return {
        background: 'rgba(' + r + ',' + g + ',' + b + ',' + (bgOpacity != null ? bgOpacity : 0.16) + ')',
        borderColor: 'rgba(' + r + ',' + g + ',' + b + ',' + (borderOpacity != null ? borderOpacity : 0.38) + ')',
        textColor: hex,
        hashIconBackground: 'rgba(' + r + ',' + g + ',' + b + ',' + (hashOpacity != null ? hashOpacity : 0.24) + ')'
    };
}
var TAG_COLOR_PALETTE = [
    _tagColor('#5B8E7D'),   // green
    _tagColor('#4A7FA5'),   // blue
    _tagColor('#7C6FAB'),   // purple
    _tagColor('#9B7A8A'),   // muted pink
    _tagColor('#5A8A85'),   // teal
    _tagColor('#9A7E5A'),   // amber
    _tagColor('#9A6B5C'),   // muted red
    _tagColor('#5A8A92'),   // cyan
    _tagColor('#7A6A9A'),   // violet
    _tagColor('#6A7A4A'),   // lime
    _tagColor('#9A6A4A'),   // orange
    _tagColor('#5A5A8A')   // indigo
];
/* Suggestion chips: luxury muted families, richer depth, static premium edge */
function _tagColorMuted(hex, bgOpacity, borderOpacity, hashOpacity) {
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    var edgeN = 0.88;
    var er = Math.min(255, Math.round(r + (255 - r) * edgeN));
    var eg = Math.min(255, Math.round(g + (255 - g) * edgeN));
    var eb = Math.min(255, Math.round(b + (255 - b) * edgeN));
    return {
        background: 'rgba(' + r + ',' + g + ',' + b + ',' + (bgOpacity != null ? bgOpacity : 0.18) + ')',
        borderColor: 'rgba(' + r + ',' + g + ',' + b + ',' + (borderOpacity != null ? borderOpacity : 0.28) + ')',
        textColor: hex,
        hashIconBackground: 'rgba(' + r + ',' + g + ',' + b + ',' + (hashOpacity != null ? hashOpacity : 0.22) + ')',
        sheenColor: 'rgba(' + er + ',' + eg + ',' + eb + ',0.95)'
    };
}
// Families: sage/olive, indigo/violet, mauve/rose, amber/bronze, slate/blue-green – no one dramatically brighter
var TAG_COLOR_PALETTE_MUTED = [
    _tagColorMuted('#5C7568'),   /* sage */
    _tagColorMuted('#5A6380'),   /* indigo */
    _tagColorMuted('#7A6578'),   /* mauve */
    _tagColorMuted('#8A7358'),   /* amber */
    _tagColorMuted('#4E7278'),   /* slate */
    _tagColorMuted('#6B7A6A'),   /* olive */
    _tagColorMuted('#6A6088'),   /* violet */
    _tagColorMuted('#8A6A72'),   /* rose */
    _tagColorMuted('#7A6A52'),   /* bronze */
    _tagColorMuted('#4A6E78'),   /* blue-green */
    _tagColorMuted('#6E7860'),   /* herb */
    _tagColorMuted('#5A6A7A')   /* steel */
];
function getTagColorForSuggestions(tag) {
    if (!tag || typeof tag !== 'string') return TAG_COLOR_PALETTE_MUTED[0];
    var idx = 0;
    for (var i = 0; i < tag.length; i++) idx = (idx * 31 + tag.charCodeAt(i)) & 0xFFFFFFF;
    var c = TAG_COLOR_PALETTE_MUTED[Math.abs(idx) % TAG_COLOR_PALETTE_MUTED.length];
    return { background: c.background, borderColor: c.borderColor, textColor: c.textColor, hashIconBackground: c.hashIconBackground, sheenColor: c.sheenColor };
}
var filterByTag = null;
function renderTagCloud() {
    var el = document.getElementById('tagCloud');
    if (!el) return;
    var counts = {};
    Object.keys(entries).forEach(function(d) {
        (entries[d].tags || []).forEach(function(t) {
            if (t) counts[t] = (counts[t] || 0) + 1;
        });
    });
    var tags = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a]; });
    if (!tags.length) {
        el.innerHTML = '<span style="color: var(--text-muted); font-size: 1rem;">No tags yet. Add tags to your entries to see them here.</span>';
        return;
    }
    var maxCount = counts[tags[0]] || 1;
    var minCount = counts[tags[tags.length - 1]] || 1;
    el.innerHTML = tags.map(function(t) {
        var c = getTagColor(t);
        var active = filterByTag === t;
        return '<span class="em-tag-chip' + (active ? ' em-tag-chip-active' : '') + '" role="button" tabindex="0" aria-pressed="' + (active ? 'true' : 'false') + '" ' +
            'style="background:' + c.background + ';border:1px solid ' + c.borderColor + ';color:' + c.textColor + '" ' +
            'onclick="setFilterTag(\'' + String(t).replace(/'/g, "\\'") + '\')" ' +
            'onkeydown="if(event.key===\'Enter\'||event.key===\' \'){setFilterTag(\'' + String(t).replace(/'/g, "\\'") + '\');event.preventDefault();}">' +
            '<span class="tag-hash-icon" style="background:' + c.hashIconBackground + ';color:' + c.textColor + ';opacity:0.85">#</span>' + String(t).replace(/</g, '&lt;') +
            ' <span class="tag-count">' + counts[t] + '</span></span>';
    }).join('');
}

function setFilterTag(tag) {
    filterByTag = filterByTag === tag ? null : tag;
    renderTagCloud();
    renderEntryList();
}

function runSearch() {
    var q = (document.getElementById('searchQuery').value || '').toLowerCase().trim();
    var from = document.getElementById('searchDateFrom').value;
    var to = document.getElementById('searchDateTo').value;
    var moodMin = document.getElementById('searchMoodMin').value;
    var moodMax = document.getElementById('searchMoodMax').value;
    var tagStr = (document.getElementById('searchTags').value || '').toLowerCase().trim();
    var tagFilter = tagStr ? tagStr.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    var dates = Object.keys(entries).sort();
    var out = dates.filter(function(d) {
        var e = entries[d];
        if (from && d < from) return false;
        if (to && d > to) return false;
        if (moodMin && e.mood < parseFloat(moodMin)) return false;
        if (moodMax && e.mood > parseFloat(moodMax)) return false;
        if (tagFilter.length) {
            var et = (e.tags || []).map(function(t) { return t.toLowerCase(); });
            if (!tagFilter.every(function(t) { return et.indexOf(t) >= 0; })) return false;
        }
        if (q) {
            var text = getRecordJournalHtml(e) + ' ' + (e.activities || []).join(' ') + ' ' + (e.tags || []).join(' ');
            if (text.toLowerCase().indexOf(q) < 0) return false;
        }
        return true;
    });
    var resultsEl = document.getElementById('searchResults');
    if (!resultsEl) return;
    resultsEl.innerHTML = out.length === 0 ? '<p style="color: var(--text-muted);">No entries match.</p>' : out.map(function(d) {
        var e = entries[d];
        var journalText = notesValueToPlainText(e);
        var preview = journalText.slice(0, 80) + (journalText.length > 80 ? '…' : '');
        var label = e.mood != null ? ('Mood ' + e.mood) : (journalText ? 'Journal entry' : 'Daily record');
        return '<div class="result-item" onclick="navigateToEntry(\'' + d + '\')">' + d + ' — ' + label + '<br><small style="color: var(--text-muted);">' + preview + '</small></div>';
    }).join('');
}

function navigateToEntry(dateStr) {
    document.getElementById('searchModal').classList.remove('show');
    setWorkingEntryDate(dateStr);
    navigate('entry');
    setDateInputDisplay(document.getElementById('date'), dateStr);
}

document.addEventListener('keydown', function(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('searchModal').classList.toggle('show');
        if (document.getElementById('searchModal').classList.contains('show')) {
            document.getElementById('searchQuery').focus();
            document.getElementById('searchModal').setAttribute('aria-hidden', 'false');
        } else {
            document.getElementById('searchModal').setAttribute('aria-hidden', 'true');
        }
    }
    if (e.key === 'Escape') {
        if (document.getElementById('searchModal').classList.contains('show')) {
            document.getElementById('searchModal').classList.remove('show');
            document.getElementById('searchModal').setAttribute('aria-hidden', 'true');
        }
        if (document.getElementById('fullEntryDeleteModal').classList.contains('show')) closeFullEntryDeleteModal();
        else if (document.getElementById('entryModal').classList.contains('show')) closeEntryModal();
    }
    if (e.key === 'Tab') {
        var modal = document.querySelector('.modal-overlay.show, .search-modal-overlay.show, .entry-modal-overlay.show');
        if (!modal || !modal.contains(document.activeElement)) return;
        var focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusables.length === 0) return;
        var first = focusables[0], last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
});

function debounce(fn, ms) {
    var t;
    return function() {
        var a = arguments;
        clearTimeout(t);
        t = setTimeout(function() { fn.apply(null, a); }, ms);
    };
}
var runSearchDebounced = debounce(runSearch, 300);

function triggerJournalPhotoInput() {
    var el = document.getElementById('journalPhotoInput');
    if (el) el.click();
}

(function initSearchDebounce() {
    var q = document.getElementById('searchQuery');
    if (q) q.addEventListener('input', runSearchDebounced);
})();

// Daily backup: if 24h passed, download JSON
async function checkDailyBackup() {
    const row = await db.backupMeta.get('lastBackup');
    const last = row ? row.value : 0;
    const now = Date.now();
    if (now - last >= 24 * 60 * 60 * 1000) {
        await doBackupDownload();
        await db.backupMeta.put({ key: 'lastBackup', value: now });
        saveBackupToStore();
    }
    updateLastBackupDisplay();
}
function updateLastBackupDisplay() {
    db.backupMeta.get('lastBackup').then(row => {
        const el = document.getElementById('lastBackupDate');
        if (el) el.textContent = row ? formatDisplayDateTime(row.value, window.auraDateFormat, window.auraTimeFormat) : 'Never';
        var reminder = document.getElementById('backupReminder');
        if (reminder) {
            var show = !row || (Date.now() - row.value >= 24 * 60 * 60 * 1000);
            reminder.classList.toggle('show', !!show);
        }
    });
}
async function doBackupDownload() {
    const payload = await buildExportPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'mood-backup-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
}
async function saveBackupToStore() {
    try {
        if (!db.backups) return;
        var payload = await buildExportPayload();
        var id = Date.now();
        await db.backups.put({ id: id, timestamp: id, data: JSON.stringify(payload) });
        var all = await db.backups.toArray();
        all.sort(function(a, b) { return b.id - a.id; });
        for (var i = 7; i < all.length; i++) {
            await db.backups.delete(all[i].id);
        }
    } catch (e) { console.warn('saveBackupToStore', e); }
}
function renderBackupList() {
    var ul = document.getElementById('backupList');
    if (!ul || !db.backups) return;
    db.backups.toArray().then(function(list) {
        list.sort(function(a, b) { return b.id - a.id; });
        var df = window.auraDateFormat || 'MD';
        var tf = window.auraTimeFormat || '12';
        ul.innerHTML = list.length === 0 ? '<li style="color: var(--text-muted);">No backups stored yet. Download a backup to keep it here.</li>' : list.map(function(b) {
            var disp = formatDisplayDateTime(b.timestamp, df, tf);
            return '<li><span>' + disp + '</span><button type="button" class="btn-secondary" onclick="restoreBackup(' + b.id + ')">Restore</button></li>';
        }).join('');
    });
}
async function restoreBackup(id) {
    if (!confirm('Restore this backup? Current data will be replaced.')) return;
    try {
        var b = await db.backups.get(id);
        if (!b || !b.data) return;
        var payload = JSON.parse(b.data);
        var list = Array.isArray(payload.entries) ? payload.entries : (payload.entries ? Object.values(payload.entries) : []);
        await db.entries.clear();
        var normalized = mergeLegacyStandaloneJournal(list, payload.journal, payload.journalPhotos).map(function(e) {
            return serializeDailyRecord(normalizeDailyRecord(e));
        });
        await db.entries.bulkPut(normalized);
        await loadAllEntries();
        if (quillEditor && currentJournalEntryDate && entries[currentJournalEntryDate]) { quillEditor.root.innerHTML = getRecordJournalHtml(entries[currentJournalEntryDate]); updateJournalWordCount(); }
        renderJournalPhotos();
        renderHeatmap();
        renderEntryList();
        updateDashboard();
        generateInsights();
        showToast('Backup restored');
    } catch (e) { alert('Restore failed: ' + e.message); }
}
function downloadBackupNow() {
    registerBackupSync();
    doBackupDownload().then(function() {
        saveBackupToStore();
        db.backupMeta.put({ key: 'lastBackup', value: Date.now() });
        updateLastBackupDisplay();
        renderBackupList();
        const msg = document.getElementById('successMessage');
        msg.textContent = 'Backup downloaded ✓';
        msg.classList.add('show');
        setTimeout(() => { msg.classList.remove('show'); msg.textContent = 'Entry saved successfully ✓'; }, 3000);
    });
}

async function buildExportPayload(fromDate, toDate, tagsFilter) {
    var list = await db.entries.toArray();
    if (fromDate || toDate || (tagsFilter && tagsFilter.length)) {
        list = list.filter(function(e) {
            if (fromDate && e.date < fromDate) return false;
            if (toDate && e.date > toDate) return false;
            if (tagsFilter && tagsFilter.length) {
                var et = (e.tags || []).map(function(t) { return t.toLowerCase(); });
                if (!tagsFilter.some(function(t) { return et.indexOf(t.toLowerCase()) >= 0; })) return false;
            }
            return true;
        });
    }
    return {
        entries: list.map(function(e) { return serializeDailyRecord(normalizeDailyRecord(e)); }),
        journal: '',
        journalPhotos: [],
        exportedAt: new Date().toISOString()
    };
}

function getExportFilters() {
    var from = document.getElementById('exportDateFrom');
    var to = document.getElementById('exportDateTo');
    var tagsEl = document.getElementById('exportTags');
    var fromDate = (from && getDateInputValue(from)) || null;
    var toDate = (to && getDateInputValue(to)) || null;
    var tagsFilter = tagsEl && tagsEl.value.trim() ? tagsEl.value.split(/[\s,]+/).filter(Boolean) : null;
    return { fromDate: fromDate, toDate: toDate, tagsFilter: tagsFilter };
}

async function exportJSON() {
    var f = getExportFilters();
    const payload = await buildExportPayload(f.fromDate, f.toDate, f.tagsFilter);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aura-export-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(a.href);
}

async function exportCSV() {
    var f = getExportFilters();
    var list = (await buildExportPayload(f.fromDate, f.toDate, f.tagsFilter)).entries;
    const headers = ['date','mood','sleep','sleepQuality','sleepTime','wakeTime','energy','activities','journal','tags'];
    const rows = [headers.join(',')];
    list.forEach(e => {
        var record = normalizeDailyRecord(e);
        rows.push([
            record.date,
            record.mood,
            record.sleep != null ? record.sleep : '',
            record.sleepQuality != null ? record.sleepQuality : '',
            (record.sleepTime || '').replace(/,/g, ';'),
            (record.wakeTime || '').replace(/,/g, ';'),
            record.energy,
            (record.activities || []).join(';'),
            getRecordJournalHtml(record).replace(/,/g, ';').replace(/\n/g, ' '),
            (record.tags || []).join(';')
        ].join(','));
    });
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'aura-export-' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(a.href);
}

async function importData() {
    if (!importPreviewData || !importPreviewData.entries) return;
    var mode = importPreviewData.mode;
    var conflict = (document.querySelector('input[name="importConflict"]:checked') || {}).value || 'overwrite';
    var resultEl = document.getElementById('importResult');
    try {
        var imported = importPreviewData.entries;
        function normEntry(e) {
            return serializeDailyRecord(normalizeDailyRecord(e));
        }
        var normalized;
        if (mode === 'replace') {
            normalized = mergeLegacyStandaloneJournal(imported, importPreviewData.journal, importPreviewData.journalPhotos).map(normEntry);
        } else {
            var existing = await db.entries.toArray();
            var byDate = {};
            existing.forEach(function(e) { byDate[e.date] = e; });
            imported.forEach(function(e) {
                var ex = byDate[e.date];
                if (!ex) { byDate[e.date] = e; return; }
                if (conflict === 'keep') return;
                if (conflict === 'newer') {
                    var exVal = ex.updatedAt || ex.date;
                    var impVal = e.updatedAt || e.date;
                    if (impVal <= exVal) return;
                }
                byDate[e.date] = e;
            });
            normalized = mergeLegacyStandaloneJournal(Object.keys(byDate).map(function(k) { return byDate[k]; }), importPreviewData.journal, importPreviewData.journalPhotos).map(normEntry);
        }
        await db.entries.clear();
        await db.entries.bulkPut(normalized);
        await loadAllEntries();
        closeImportPreviewModal();
        resultEl.textContent = 'Imported ' + normalized.length + ' entries.';
        document.getElementById('importFile').value = '';
        renderHeatmap();
        generateInsights();
        updateDashboard();
        renderEntryList();
    } catch (err) {
        resultEl.textContent = 'Import failed: ' + err.message;
    }
}

function parseDaylioCSV(text) {
    var lines = text.split('\n').filter(function(l) { return l.trim(); });
    if (lines.length < 2) return [];
    var headers = lines[0].toLowerCase().split(',').map(function(h) { return h.trim(); });
    var dateIdx = headers.findIndex(function(h) { return h === 'date' || h === 'full_date' || h === 'day'; });
    var moodIdx = headers.findIndex(function(h) { return h === 'mood' || h === 'mood_value'; });
    if (dateIdx < 0) return [];
    var out = [];
    for (var i = 1; i < lines.length; i++) {
        var cells = lines[i].split(',').map(function(c) { return c.replace(/^"|"$/g, '').trim(); });
        var dateStr = cells[dateIdx];
        if (!dateStr) continue;
        if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {}
        else if (dateStr.match(/\d{4}-\d{2}-\d{2}/)) dateStr = dateStr.match(/\d{4}-\d{2}-\d{2}/)[0];
        else continue;
        var get = function(name) { var idx = headers.indexOf(name); return idx >= 0 ? (cells[idx] || '') : ''; };
        out.push({
            id: dateStr, date: dateStr,
            mood: parseFloat(cells[moodIdx]) || 5,
            sleep: parseFloat(get('sleep') || get('sleep_hours')) || 7,
            sleepQuality: 5, sleepTime: '23:00', wakeTime: '07:00',
            energy: 5,
            activities: (get('activities') || get('activities_1')).split(';').filter(Boolean),
            journal: get('journal') || get('note') || get('notes') || '',
            tags: [], photos: []
        });
    }
    return out;
}
function parseBearableExport(text) {
    try {
        var data = JSON.parse(text);
        var list = data.mood_entries || data.entries || (data.data && data.data.mood) || [];
        if (!Array.isArray(list)) return [];
        return list.map(function(e) {
            var d = e.date || e.timestamp || e.day;
            if (typeof d === 'number') d = new Date(d).toISOString().split('T')[0];
            else if (d && d.length > 10) d = d.slice(0, 10);
            if (!d || d.length !== 10) return null;
            return {
                id: d, date: d,
                mood: parseFloat(e.mood) || parseFloat(e.mood_value) || 5,
                sleep: parseFloat(e.sleep) || parseFloat(e.sleep_hours) || 7,
                sleepQuality: 5, sleepTime: '23:00', wakeTime: '07:00',
                energy: parseFloat(e.energy) || 5,
                activities: e.activities || [],
                journal: e.journal || e.notes || e.note || '',
                tags: e.tags || [],
                photos: e.photos || []
            };
        }).filter(Boolean);
    } catch (e) { return []; }
}

function previewImport() {
    var input = document.getElementById('importFile');
    var resultEl = document.getElementById('importResult');
    if (!input.files.length) { resultEl.textContent = 'Please choose a file.'; return; }
    var file = input.files[0];
    file.text().then(function(text) {
        var imported = [];
        var format = 'aura';
        if (file.name.toLowerCase().endsWith('.json')) {
            try {
                var data = JSON.parse(text);
                if (data.mood_entries || (data.data && data.data.mood)) { format = 'bearable'; imported = parseBearableExport(text); }
                else { imported = Array.isArray(data.entries) ? data.entries : (data.entries ? Object.values(data.entries) : []); }
            } catch (e) { resultEl.textContent = 'Invalid JSON: ' + e.message; return; }
        } else {
            imported = parseDaylioCSV(text);
            if (imported.length > 0) format = 'daylio';
            else {
                var lines = text.split('\n').filter(function(l) { return l.trim(); });
                if (lines.length >= 2) {
                    var headers = lines[0].toLowerCase();
                    if (headers.indexOf('date') >= 0) {
                        for (var i = 1; i < lines.length; i++) {
                            var cells = lines[i].split(',').map(function(c) { return c.replace(/^"|"$/g, '').trim(); });
                            var dateIdx = lines[0].toLowerCase().split(',').map(function(h) { return h.trim(); }).indexOf('date');
                            var date = dateIdx >= 0 ? cells[dateIdx] : '';
                            if (!date || date.length < 10) continue;
                            date = date.slice(0, 10);
                            var get = function(name) { var idx = lines[0].toLowerCase().split(',').map(function(h) { return h.trim(); }).indexOf(name); return idx >= 0 ? (cells[idx] || '') : ''; };
                            imported.push({ id: date, date: date, mood: parseFloat(get('mood')) || 5, sleep: parseFloat(get('sleep')) || 7, sleepQuality: 5, sleepTime: '23:00', wakeTime: '07:00', energy: parseFloat(get('energy')) || 5, activities: (get('activities') || '').split(';').filter(Boolean), journal: get('journal') || get('notes') || '', tags: (get('tags') || '').split(';').filter(Boolean), photos: [] });
                        }
                    }
                }
            }
        }
        var journal = '';
        var journalPhotos = [];
        if (file.name.toLowerCase().endsWith('.json')) {
            try {
                var data = JSON.parse(text);
                journal = data.journal || '';
                journalPhotos = data.journalPhotos || [];
            } catch (e) {}
        }
        importPreviewData = { entries: imported, journal: journal, journalPhotos: journalPhotos };
        document.getElementById('importPreviewSummary').textContent = 'Found ' + imported.length + ' entries (' + format + ' format).';
        var sample = imported.slice(0, 5).map(function(e) { return e.date + ' — Mood ' + (e.mood != null ? e.mood : '–'); }).join('\n');
        document.getElementById('importPreviewSample').textContent = sample || 'No entries.';
        document.getElementById('importPreviewModal').classList.add('show');
    }).catch(function(e) { resultEl.textContent = 'Could not read file: ' + e.message; });
}
function closeImportPreviewModal() {
    document.getElementById('importPreviewModal').classList.remove('show');
}
function confirmImportMerge() {
    importPreviewData.mode = 'merge';
    importData();
}
function confirmImportReplace() {
    importPreviewData.mode = 'replace';
    importData();
}

function togglePasscodeLock(enabled) {
    if (enabled) {
        document.getElementById('setPasscodeModal').classList.add('show');
        document.getElementById('setPasscodeNew').value = '';
        document.getElementById('setPasscodeConfirm').value = '';
        document.getElementById('setPasscodeError').textContent = '';
    } else {
        db.appState.delete('passcodeHash');
        document.getElementById('passcodeLockEnabled').checked = false;
    }
}
function closeSetPasscodeModal() {
    document.getElementById('setPasscodeModal').classList.remove('show');
    document.getElementById('passcodeLockEnabled').checked = false;
}
function savePasscode() {
    var newP = document.getElementById('setPasscodeNew').value;
    var conf = document.getElementById('setPasscodeConfirm').value;
    var err = document.getElementById('setPasscodeError');
    if (newP.length < 4 || newP.length > 8) { err.textContent = 'Passcode must be 4–8 characters'; return; }
    if (newP !== conf) { err.textContent = 'Passcodes do not match'; return; }
    hashPasscode(newP).then(function(h) {
        db.appState.put({ key: 'passcodeHash', value: h });
        closeSetPasscodeModal();
        document.getElementById('passcodeLockEnabled').checked = true;
    });
}
function unlockWithPasscode() {
    var input = document.getElementById('passcodeUnlockInput').value;
    hashPasscode(input).then(function(h) {
        db.appState.get('passcodeHash').then(function(row) {
            if (row && row.value === h) {
                document.getElementById('passcodeLockScreen').style.display = 'none';
                document.getElementById('passcodeLockScreen').setAttribute('aria-hidden', 'true');
                document.getElementById('passcodeUnlockInput').value = '';
            }
        });
    });
}
function setEncryptEntries(enabled) {
    db.appState.put({ key: 'encryptEntries', value: !!enabled });
}
function setPrivateMode(enabled) {
    db.appState.put({ key: 'privateMode', value: !!enabled });
    if (typeof renderEntryList === 'function') renderEntryList();
}
function setDataRetention(value) {
    db.appState.put({ key: 'dataRetention', value: value });
    applyDataRetention();
}
async function applyDataRetention() {
    var row = await db.appState.get('dataRetention');
    var days = row && row.value ? parseInt(row.value, 10) : 0;
    if (!days || days <= 0) return;
    var cut = new Date();
    cut.setDate(cut.getDate() - days);
    var cutStr = cut.toISOString().split('T')[0];
    var list = await db.entries.toArray();
    var toDelete = list.filter(function(e) { return e.date < cutStr; });
    for (var i = 0; i < toDelete.length; i++) await db.entries.delete(toDelete[i].id);
    if (toDelete.length) await loadAllEntries();
}

function getCustomMetrics() {
    return db.appState.get('customMetrics').then(function(row) {
        return Array.isArray(row && row.value) ? row.value : [];
    });
}
function setCustomMetrics(arr) {
    return db.appState.put({ key: 'customMetrics', value: arr });
}
function addCustomMetric() {
    var nameInput = document.getElementById('newMetricName');
    var name = (nameInput && nameInput.value || '').trim();
    if (!name) { showToast('Enter a metric name.'); return; }
    var typeSelect = document.getElementById('newMetricType');
    var type = (typeSelect && typeSelect.value) || 'scale';
    getCustomMetrics().then(function(list) {
        var id = 'cm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
        list.push({ id: id, name: name, type: type, visible: true });
        return setCustomMetrics(list);
    }).then(function() {
        if (nameInput) nameInput.value = '';
        renderCustomMetricsList();
        renderCustomMetricsInEntryForm();
        showToast('Metric added.');
    });
}
function removeCustomMetric(id) {
    getCustomMetrics().then(function(list) {
        list = list.filter(function(m) { return m.id !== id; });
        return setCustomMetrics(list);
    }).then(function() {
        renderCustomMetricsList();
        renderCustomMetricsInEntryForm();
    });
}
function toggleMetricVisible(id) {
    getCustomMetrics().then(function(list) {
        var m = list.find(function(x) { return x.id === id; });
        if (m) { m.visible = !m.visible; return setCustomMetrics(list); }
    }).then(function() {
        renderCustomMetricsList();
        renderCustomMetricsInEntryForm();
    });
}
function renderCustomMetricsList() {
    var el = document.getElementById('customMetricsList');
    if (!el) return;
    getCustomMetrics().then(function(list) {
        if (list.length === 0) { el.innerHTML = '<li style="color: var(--text-muted); padding: var(--space-sm) 0;">No custom metrics yet. Add one above.</li>'; return; }
        el.innerHTML = list.map(function(m) {
            var typeLabel = m.type === 'yesno' ? 'Yes/No' : '1–10';
            var visLabel = m.visible ? 'Hide' : 'Show';
            return '<li><span class="metric-name">' + escapeHtml(m.name) + '</span> <span class="metric-type">' + typeLabel + '</span> <span class="metric-actions"><button type="button" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 8px;" onclick="toggleMetricVisible(\'' + m.id + '\')">' + visLabel + '</button> <button type="button" class="btn-secondary" style="font-size: 0.85rem; padding: 4px 8px;" onclick="removeCustomMetric(\'' + m.id + '\')">Remove</button></span></li>';
        }).join('');
    });
}
function renderCustomMetricsInEntryForm() {
    var wrap = document.getElementById('customMetricsFormWrap');
    if (!wrap) return Promise.resolve();
    return getCustomMetrics().then(function(list) {
        var visible = list.filter(function(m) { return m.visible; });
        if (visible.length === 0) { wrap.innerHTML = ''; return; }
        var date = document.getElementById('date') && getDateInputValue(document.getElementById('date'));
        var existing = (date && entries[date] && entries[date].customMetrics) ? entries[date].customMetrics : {};
        wrap.innerHTML = visible.map(function(m) {
            var val = existing[m.id];
            if (m.type === 'yesno') {
                var checked = val === 1 || val === true;
                return '<div class="form-group"><label class="checkbox-label"><input type="checkbox" id="customMetric_' + m.id + '" data-metric-id="' + m.id + '" data-metric-type="yesno" ' + (checked ? 'checked' : '') + '> ' + escapeHtml(m.name) + '</label></div>';
            }
            var v = (val != null && val !== '') ? Number(val) : 5;
            return '<div class="form-group"><label>' + escapeHtml(m.name) + ' <span class="form-value" id="customMetricVal_' + m.id + '">' + v + '</span></label><input type="range" min="1" max="10" value="' + v + '" id="customMetric_' + m.id + '" data-metric-id="' + m.id + '" data-metric-type="scale" oninput="document.getElementById(\'customMetricVal_' + m.id + '\').innerText=this.value"></div>';
        }).join('');
    });
}
function escapeHtml(s) {
    if (!s) return '';
    var div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function getPreference(key) {
    return db.appState.get('pref_' + key).then(function(row) { return row && row.value; });
}
function getLocale() {
    var loc = window.auraLocale;
    if (loc && loc !== '_custom') return loc;
    var custom = document.getElementById('prefLocaleCustom');
    if (custom && custom.value && custom.value.trim()) return custom.value.trim();
    return 'en';
}
function getLocaleMonthNames(locale, longForm) {
    locale = locale || getLocale();
    var names = [];
    for (var i = 0; i < 12; i++) {
        var d = new Date(2000, i, 1);
        names.push(d.toLocaleDateString(locale, { month: longForm ? 'long' : 'short' }));
    }
    return names;
}
function getFirstDayOfWeek() {
    return 1;
}
function getLocaleWeekdayNames(locale, firstDayOfWeek) {
    locale = locale || getLocale();
    firstDayOfWeek = firstDayOfWeek === undefined ? getFirstDayOfWeek() : firstDayOfWeek;
    var names = [];
    for (var i = 0; i < 7; i++) {
        var day = (firstDayOfWeek + i) % 7;
        var d = new Date(2000, 0, 2 + day);
        names.push(d.toLocaleDateString(locale, { weekday: 'short' }));
    }
    return names;
}
function getLocaleStrings(locale) {
    locale = (locale || getLocale()).split('-')[0];
    var strings = { clear: 'Clear', today: 'Today', weekOf: 'Week of ' };
    if (locale === 'de') { strings.clear = 'Löschen'; strings.today = 'Heute'; strings.weekOf = 'Woche vom '; }
    else if (locale === 'fr') { strings.clear = 'Effacer'; strings.today = 'Aujourd\'hui'; strings.weekOf = 'Semaine du '; }
    else if (locale === 'es') { strings.clear = 'Borrar'; strings.today = 'Hoy'; strings.weekOf = 'Semana del '; }
    else if (locale === 'it') { strings.clear = 'Cancella'; strings.today = 'Oggi'; strings.weekOf = 'Settimana del '; }
    else if (locale === 'pt') { strings.clear = 'Limpar'; strings.today = 'Hoje'; strings.weekOf = 'Semana de '; }
    else if (locale === 'nl') { strings.clear = 'Wissen'; strings.today = 'Vandaag'; strings.weekOf = 'Week van '; }
    else if (locale === 'pl') { strings.clear = 'Wyczyść'; strings.today = 'Dziś'; strings.weekOf = 'Tydzień '; }
    else if (locale === 'ru') { strings.clear = 'Очистить'; strings.today = 'Сегодня'; strings.weekOf = 'Неделя '; }
    else if (locale === 'ja') { strings.clear = 'クリア'; strings.today = '今日'; strings.weekOf = ''; }
    else if (locale === 'zh') { strings.clear = '清除'; strings.today = '今天'; strings.weekOf = ''; }
    else if (locale === 'ar') { strings.clear = 'مسح'; strings.today = 'اليوم'; strings.weekOf = 'أسبوع '; }
    else if (locale === 'tr') { strings.clear = 'Temizle'; strings.today = 'Bugün'; strings.weekOf = 'Hafta: '; }
    else if (locale === 'hi') { strings.clear = 'साफ़ करें'; strings.today = 'आज'; strings.weekOf = 'सप्ताह: '; }
    return strings;
}
var localeDropdownLabels = { 'en': 'English', 'de': 'Deutsch', 'fr': 'Français', 'es': 'Español', 'it': 'Italiano', 'pt': 'Português', 'pt-BR': 'Português (Brasil)', 'nl': 'Nederlands', 'pl': 'Polski', 'ru': 'Русский', 'ja': '日本語', 'zh': '中文', 'zh-CN': '中文 (简体)', 'ar': 'العربية', 'tr': 'Türkçe', 'hi': 'हिन्दी', '_custom': 'Custom (BCP 47)...' };
var translations = {
    en: {
        save_entry: 'Save Entry',
        calendar_title: 'Calendar',
        calendar_subtitle: 'Explore your mood history across days, weeks and months.',
        daily_checkin: 'Daily Check-In',
        journal: 'Journal',
        journal_title: 'Journal',
        settings: 'Settings',
        daily_summary: 'Daily Summary',
        export_heatmap: 'Export Heatmap',
        delete_entry: 'Delete Entry',
        low_mood: 'Low mood',
        neutral: 'Neutral',
        good_mood: 'Good mood',
        today: 'Today',
        edit_journal_entry: 'Edit journal entry',
        journal_saved_placeholder: 'Your journal entry for today has already been saved.',
        one_journal_per_day: 'Only one journal entry can be created per day.',
        add_photo: '📷 Add Photo'
    },
    de: {
        save_entry: 'Eintrag speichern',
        calendar_title: 'Kalender',
        calendar_subtitle: 'Entdecke deine Stimmungsverläufe nach Tagen, Wochen und Monaten.',
        daily_checkin: 'Tages-Check-in',
        journal: 'Tagebuch',
        journal_title: 'Tagebuch',
        settings: 'Einstellungen',
        daily_summary: 'Tageszusammenfassung',
        export_heatmap: 'Heatmap exportieren',
        delete_entry: 'Eintrag löschen',
        low_mood: 'Niedrige Stimmung',
        neutral: 'Neutral',
        good_mood: 'Gute Stimmung',
        today: 'Heute',
        edit_journal_entry: 'Tagebucheintrag bearbeiten',
        journal_saved_placeholder: 'Dein Tagebucheintrag für heute wurde bereits gespeichert.',
        one_journal_per_day: 'Pro Tag kann nur ein Tagebucheintrag erstellt werden.',
        add_photo: '📷 Foto hinzufügen'
    },
    fr: {
        save_entry: 'Enregistrer',
        calendar_title: 'Calendrier',
        calendar_subtitle: 'Explorez votre historique d\'humeur par jour, semaine et mois.',
        daily_checkin: 'Bilan du jour',
        journal: 'Journal',
        journal_title: 'Journal',
        settings: 'Paramètres',
        daily_summary: 'Résumé du jour',
        export_heatmap: 'Exporter la heatmap',
        delete_entry: 'Supprimer l\'entrée',
        low_mood: 'Humeur basse',
        neutral: 'Neutre',
        good_mood: 'Bonne humeur',
        today: 'Aujourd\'hui',
        edit_journal_entry: 'Modifier l\'entrée du journal',
        journal_saved_placeholder: 'Votre entrée du journal pour aujourd\'hui a déjà été enregistrée.',
        one_journal_per_day: 'Un seul entrée de journal peut être créée par jour.',
        add_photo: '📷 Ajouter une photo'
    },
    es: {
        save_entry: 'Guardar entrada',
        calendar_title: 'Calendario',
        calendar_subtitle: 'Explora tu historial de ánimo por días, semanas y meses.',
        daily_checkin: 'Registro diario',
        journal: 'Diario',
        journal_title: 'Diario',
        settings: 'Ajustes',
        daily_summary: 'Resumen del día',
        export_heatmap: 'Exportar mapa de calor',
        delete_entry: 'Eliminar entrada',
        low_mood: 'Ánimo bajo',
        neutral: 'Neutral',
        good_mood: 'Buen ánimo',
        today: 'Hoy',
        edit_journal_entry: 'Editar entrada del diario',
        journal_saved_placeholder: 'Tu entrada del diario de hoy ya ha sido guardada.',
        one_journal_per_day: 'Solo se puede crear una entrada de diario por día.',
        add_photo: '📷 Añadir foto'
    }
};
function applyTranslations() {
    var loc = (typeof getLocale === 'function' ? getLocale() : 'en').split('-')[0];
    var t = translations[loc] || translations.en;
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
        var key = el.getAttribute('data-i18n');
        var val = t[key];
        if (val !== undefined && val !== null) {
            if (el.getAttribute('data-i18n-placeholder')) el.placeholder = val;
            else el.textContent = val;
        }
    });
}
function updateLocaleDropdownValue(val) {
    var v = (val && String(val)) || 'en';
    var trigger = document.getElementById('localeDropdownTrigger');
    var labelEl = trigger ? trigger.querySelector('.locale-dropdown-label') : null;
    var list = document.getElementById('localeDropdownList');
    if (labelEl) labelEl.textContent = localeDropdownLabels[v] || v;
    if (list) {
        list.querySelectorAll('.locale-dropdown-option').forEach(function(opt) {
            opt.setAttribute('aria-selected', opt.getAttribute('data-value') === v);
            opt.querySelector('.check').style.visibility = opt.getAttribute('data-value') === v ? 'visible' : 'hidden';
        });
    }
    var custom = document.getElementById('prefLocaleCustom');
    if (custom) {
        if (v === '_custom') { custom.style.display = 'block'; custom.focus(); }
        else { custom.style.display = 'none'; }
    }
}
function toggleLocaleCustom(valueOrSelectEl) {
    var custom = document.getElementById('prefLocaleCustom');
    if (!custom) return;
    var isCustom = valueOrSelectEl === '_custom' || (valueOrSelectEl && valueOrSelectEl.value === '_custom');
    if (isCustom) {
        custom.style.display = 'block';
        custom.focus();
    } else {
        custom.style.display = 'none';
    }
}
(function initLocaleDropdown() {
    var wrap = document.getElementById('localeDropdown');
    var trigger = document.getElementById('localeDropdownTrigger');
    var list = document.getElementById('localeDropdownList');
    if (!wrap || !trigger || !list) return;
    var options = list.querySelectorAll('.locale-dropdown-option');
    function open() {
        wrap.classList.add('open');
        wrap.setAttribute('aria-expanded', 'true');
        trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
        wrap.classList.remove('open');
        wrap.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-expanded', 'false');
    }
    function selectValue(value, label) {
        var v = value === '_custom' ? (document.getElementById('prefLocaleCustom').value.trim() || 'en') : value;
        window.auraLocale = (v && v !== '_custom') ? v : 'en';
        savePreference('locale', v);
        updateLocaleDropdownValue(v === '_custom' ? '_custom' : value);
        toggleLocaleCustom(v === '_custom' ? '_custom' : value);
        close();
    }
    trigger.addEventListener('click', function(e) {
        e.preventDefault();
        if (wrap.classList.contains('open')) close();
        else open();
    });
    list.querySelectorAll('.locale-dropdown-option').forEach(function(opt) {
        opt.addEventListener('click', function(e) {
            e.preventDefault();
            var val = opt.getAttribute('data-value');
            var label = (opt.querySelector('span') && !opt.querySelector('span').classList.contains('check')) ? opt.querySelector('span').textContent : localeDropdownLabels[val];
            selectValue(val, label);
        });
    });
    document.addEventListener('click', function(e) {
        if (wrap.classList.contains('open') && !wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function(e) {
        if (!wrap.classList.contains('open')) return;
        if (e.key === 'Escape') { e.preventDefault(); close(); trigger.focus(); return; }
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            var current = list.querySelector('.locale-dropdown-option[aria-selected="true"]');
            var idx = current ? Array.prototype.indexOf.call(options, current) : -1;
            if (!list.contains(document.activeElement)) {
                idx = e.key === 'ArrowDown' ? (idx < 0 ? 0 : idx) : (idx < 0 ? options.length - 1 : idx);
            } else {
                if (e.key === 'ArrowDown') idx = Math.min(idx + 1, options.length - 1);
                else idx = Math.max(idx - 1, 0);
            }
            options[idx].setAttribute('aria-selected', 'true');
            list.querySelectorAll('.locale-dropdown-option').forEach(function(o, i) { o.setAttribute('aria-selected', i === idx); o.querySelector('.check').style.visibility = i === idx ? 'visible' : 'hidden'; });
            options[idx].focus();
        }
        if (e.key === 'Enter' && document.activeElement && document.activeElement.getAttribute('role') === 'option') {
            e.preventDefault();
            var val = document.activeElement.getAttribute('data-value');
            selectValue(val);
        }
    });
    options.forEach(function(opt) {
        opt.querySelector('.check').style.visibility = opt.getAttribute('aria-selected') === 'true' ? 'visible' : 'hidden';
    });
})();
function formatDisplayDate(dateStr, format) {
    if (!dateStr) return '';
    var fmt = format || window.auraDateFormat || 'MD';
    var parts = String(dateStr).split(/[-/.]/);
    if (parts.length < 3) return dateStr;
    var y = parts[0], m = parts[1], d = parts[2];
    if (fmt === 'DM') return d + '.' + m + '.' + y;
    if (fmt === 'YMD') return y + '-' + m + '-' + d;
    return m + '/' + d + '/' + y;
}
function getDatePlaceholder() {
    var fmt = window.auraDateFormat || 'MD';
    if (fmt === 'DM') return '__.__.____';
    if (fmt === 'YMD') return '____-__-__';
    return '__/__/____';
}
function formatDisplayTime(timeStr, format) {
    if (!timeStr) return '';
    var fmt = format || window.auraTimeFormat || '12';
    var parts = String(timeStr).split(':');
    var h = parseInt(parts[0], 10) || 0;
    var m = parts[1] ? parseInt(parts[1], 10) || 0 : 0;
    if (fmt === '24') return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    var ap = h >= 12 ? 'PM' : 'AM';
    var h12 = h % 12; if (h12 === 0) h12 = 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
}
function formatDisplayDateTime(timestamp, dateFormat, timeFormat) {
    if (timestamp == null) return '';
    var d = new Date(timestamp);
    var dateStr = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    var timeStr = String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    return formatDisplayDate(dateStr, dateFormat) + ' ' + formatDisplayTime(timeStr, timeFormat);
}
function parseDateToYYYYMMDD(raw, format) {
    if (!raw || typeof raw !== 'string') return '';
    raw = raw.trim().replace(/\./g, '/');
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    var parts = raw.split(/[/-]/);
    if (parts.length !== 3) return '';
    var y, m, d;
    if (parts[0].length === 4) { y = parts[0]; m = parts[1]; d = parts[2]; }
    else {
        var fmt = format || window.auraDateFormat || 'MD';
        if (parts[2].length !== 4) return '';
        if (fmt === 'DM') { d = parts[0]; m = parts[1]; y = parts[2]; }
        else if (fmt === 'YMD') { y = parts[0]; m = parts[1]; d = parts[2]; }
        else { m = parts[0]; d = parts[1]; y = parts[2]; }
    }
    var yy = String(y).padStart(4, '0');
    var mm = String(parseInt(m, 10)).padStart(2, '0');
    var dd = String(parseInt(d, 10)).padStart(2, '0');
    if (parseInt(mm, 10) < 1 || parseInt(mm, 10) > 12) return '';
    if (parseInt(dd, 10) < 1 || parseInt(dd, 10) > 31) return '';
    var dObj = new Date(yy + '-' + mm + '-' + dd);
    if (isNaN(dObj.getTime())) return '';
    return yy + '-' + mm + '-' + dd;
}
function getDateInputValue(input) {
    if (!input) return '';
    var val = (input.value || '').trim();
    var parsed = parseDateToYYYYMMDD(val, window.auraDateFormat);
    if (parsed) return parsed;
    var raw = input.getAttribute('data-aura-date');
    if (raw) return raw;
    return '';
}
function setDateInputDisplay(input, yyyyMmDd) {
    if (!input) return;
    if (!yyyyMmDd) { input.removeAttribute('data-aura-date'); input.value = ''; if (typeof getDatePlaceholder === 'function') input.placeholder = getDatePlaceholder(); return; }
    input.setAttribute('data-aura-date', yyyyMmDd);
    input.value = formatDisplayDate(yyyyMmDd, window.auraDateFormat || 'MD');
}
function refreshDateInputPlaceholders() {
    var ph = typeof getDatePlaceholder === 'function' ? getDatePlaceholder() : '__/__/____';
    document.querySelectorAll('.aura-date-input').forEach(function(inp) { inp.placeholder = ph; });
}
function refreshAllDateInputsDisplay() {
    refreshDateInputPlaceholders();
    document.querySelectorAll('.aura-date-input').forEach(function(inp) {
        var val = getDateInputValue(inp);
        if (val) setDateInputDisplay(inp, val);
    });
}
function getStickyAmPm() {
    if (window.auraLastTimePeriod === undefined) {
        try { window.auraLastTimePeriod = localStorage.getItem('auraLastTimePeriod') || 'PM'; } catch (e) { window.auraLastTimePeriod = 'PM'; }
    }
    return window.auraLastTimePeriod;
}
function setStickyAmPm(period) {
    window.auraLastTimePeriod = period;
    try { localStorage.setItem('auraLastTimePeriod', period); } catch (e) {}
}
function parseTimeToHHmm(str) {
    if (!str || typeof str !== 'string') return '';
    getStickyAmPm();
    var s = str.trim();
    var apMatch = s.match(/\s*(am|pm)\s*$/i);
    var ap = apMatch ? apMatch[1].toLowerCase() : '';
    if (ap) s = s.replace(/\s*(am|pm)\s*$/i, '').trim();
    var digitsOnly = s.replace(/\D/g, '');
    if (digitsOnly.length >= 1 && digitsOnly.length <= 4 && s.indexOf(':') === -1) {
        var hStr, mStr;
        if (digitsOnly.length <= 2) {
            hStr = digitsOnly;
            mStr = '00';
        } else if (digitsOnly.length === 3) {
            hStr = digitsOnly.slice(0, 1);
            mStr = digitsOnly.slice(1);
        } else {
            hStr = digitsOnly.slice(0, 2);
            mStr = digitsOnly.slice(2);
        }
        s = hStr + ':' + (mStr.length === 1 ? mStr + '0' : mStr);
    }
    var m24 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (m24) {
        var h = parseInt(m24[1], 10);
        var m = parseInt(m24[2], 10);
        if (h < 0 || h > 23 || m < 0 || m > 59) return '';
        if (ap === 'pm') {
            if (h !== 12) h += 12;
            setStickyAmPm('PM');
        } else if (ap === 'am') {
            if (h === 12) h = 0;
            setStickyAmPm('AM');
        } else if (h <= 12) {
            var sticky = getStickyAmPm();
            if (sticky === 'PM' && h !== 12) h += 12;
            else if (sticky === 'AM' && h === 12) h = 0;
        }
        return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
    }
    var m12 = s.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(am|pm)?$/i);
    if (m12) {
        var h = parseInt(m12[1], 10);
        var min = parseInt(m12[2], 10);
        if (min < 0 || min > 59) return '';
        var ap2 = (m12[3] || ap || '').toLowerCase();
        if (ap2 === 'pm') { if (h !== 12) h += 12; setStickyAmPm('PM'); }
        else if (ap2 === 'am') { if (h === 12) h = 0; setStickyAmPm('AM'); }
        else if (h <= 12) {
            var sticky = getStickyAmPm();
            if (sticky === 'PM' && h !== 12) h += 12;
            else if (sticky === 'AM' && h === 12) h = 0;
        }
        h = Math.max(0, Math.min(23, h));
        return String(h).padStart(2, '0') + ':' + String(min).padStart(2, '0');
    }
    return '';
}
function getTimeInputValue(input) {
    if (!input) return '';
    var raw = input.getAttribute('data-aura-time');
    if (raw) return raw;
    var parsed = parseTimeToHHmm(input.value || '');
    if (parsed) return parsed;
    return (input.value || '').trim();
}
function setTimeInputDisplay(input, hhmm) {
    if (!input) return;
    if (!hhmm) { input.removeAttribute('data-aura-time'); input.value = ''; return; }
    var canonical = parseTimeToHHmm(hhmm) || hhmm;
    if (!/^\d{2}:\d{2}$/.test(canonical)) canonical = hhmm;
    input.setAttribute('data-aura-time', canonical);
    input.value = formatDisplayTime(canonical, window.auraTimeFormat || '12');
}
function refreshAllTimeInputsDisplay() {
    document.querySelectorAll('.aura-time-input').forEach(function(inp) {
        var val = getTimeInputValue(inp);
        if (val) setTimeInputDisplay(inp, val);
    });
}
(function initDateAndTimeMasks() {
    function applyDateMask(inp) {
        var v = inp.value || '';
        var digits = v.replace(/\D/g, '');
        if (digits.length > 8) digits = digits.slice(0, 8);
        if (digits.length === 0) { inp.value = ''; inp.placeholder = getDatePlaceholder(); return; }
        var fmt = window.auraDateFormat || 'MD';
        var out;
        if (fmt === 'YMD') {
            out = digits.slice(0, 4);
            if (digits.length > 4) out += '-' + digits.slice(4, 6);
            if (digits.length > 6) out += '-' + digits.slice(6, 8);
        } else if (fmt === 'DM') {
            out = digits.slice(0, 2);
            if (digits.length > 2) out += '.' + digits.slice(2, 4);
            if (digits.length > 4) out += '.' + digits.slice(4, 8);
        } else {
            out = digits.slice(0, 2);
            if (digits.length > 2) out += '/' + digits.slice(2, 4);
            if (digits.length > 4) out += '/' + digits.slice(4, 8);
        }
        inp.value = out;
        inp.setSelectionRange(out.length, out.length);
    }
    function applyTimeMask(inp) {
        var v = inp.value || '';
        var apMatch = v.match(/\s*(am|pm)\s*$/i);
        var ap = apMatch ? (apMatch[1].toUpperCase() === 'PM' ? ' PM' : ' AM') : '';
        var digits = v.replace(/\D/g, '');
        if (digits.length > 4) digits = digits.slice(0, 4);
        if (digits.length === 0) { inp.value = ap.trim(); return; }
        var out;
        if (digits.length <= 2) {
            out = digits;
        } else if (digits.length === 3) {
            var h1 = digits.slice(0, 1);
            var m1 = digits.slice(1);
            out = h1 + ':' + m1;
        } else { // 4
            var h2 = digits.slice(0, 2);
            var m2 = digits.slice(2);
            out = h2 + ':' + m2;
        }
        if (ap) out += ' ' + ap;
        inp.value = out;
        inp.setSelectionRange(out.length, out.length);
    }
    document.querySelectorAll('.aura-date-input').forEach(function(inp) {
        inp.addEventListener('input', function() { applyDateMask(this); });
    });
    document.querySelectorAll('.aura-time-input').forEach(function(inp) {
        inp.addEventListener('input', function() { applyTimeMask(this); });
    });
})();
async function savePreference(key, value) {
    var v = value;
    if (typeof value === 'boolean') v = value;
    else if (typeof value === 'number') v = value;
    else if (value === undefined || value === null) v = '';
    else v = String(value);
    if (key === 'dateFormat') {
        if (v !== 'MD' && v !== 'DM' && v !== 'YMD') v = 'MD';
        window.auraDateFormat = v;
        if (typeof refreshAllDateInputsDisplay === 'function') refreshAllDateInputsDisplay();
        if (typeof renderEntryList === 'function') renderEntryList();
        if (typeof renderBackupList === 'function') renderBackupList();
        if (typeof renderCalendarList === 'function') renderCalendarList();
        updateLastBackupDisplay();
    }
    if (key === 'timeFormat') {
        if (v !== '12' && v !== '24') v = '12';
        window.auraTimeFormat = v;
        if (typeof refreshAllTimeInputsDisplay === 'function') refreshAllTimeInputsDisplay();
        if (typeof renderEntryList === 'function') renderEntryList();
        if (typeof renderBackupList === 'function') renderBackupList();
        updateLastBackupDisplay();
    }
    if (key === 'defaultSleepTime' || key === 'defaultWakeTime') {
        try { await db.appState.put({ key: key, value: v }); } catch (e) { console.warn('savePreference failed', key, e); }
        var sleepEl = document.getElementById('sleepTime');
        var wakeEl = document.getElementById('wakeTime');
        if (key === 'defaultSleepTime' && sleepEl) { setTimeInputDisplay(sleepEl, v); }
        if (key === 'defaultWakeTime' && wakeEl) { setTimeInputDisplay(wakeEl, v); }
    } else {
        try { await db.appState.put({ key: 'pref_' + key, value: v }); } catch (e) { console.warn('savePreference failed', key, e); }
    }
    if (key === 'reduceMotion') applyReduceMotion(!!v);
    if (key === 'chartDays') { window.auraChartDays = parseInt(v, 10) || 30; if (typeof renderCharts === 'function') renderCharts(); }
    if (key === 'locale') {
        window.auraLocale = (v && v !== '_custom') ? v : 'en';
        if (typeof applyTranslations === 'function') applyTranslations();
        if (typeof renderCalendarCurrentView === 'function') renderCalendarCurrentView();
        if (typeof renderMonthGrid === 'function') renderMonthGrid();
        if (typeof renderWeekTimeline === 'function') renderWeekTimeline();
        if (typeof renderHeatmap === 'function') renderHeatmap();
        if (typeof renderCalendarList === 'function') renderCalendarList();
    }
    if (key === 'notifications' && !!v) {
        try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) {}
    }
}
function loadPreferencesIntoUI() {
    Promise.all([
        getPreference('locale'),
        getPreference('dateFormat'),
        getPreference('timeFormat'),
        db.appState.get('defaultSleepTime'),
        db.appState.get('defaultWakeTime'),
        getPreference('favoriteTags'),
        getPreference('chartDays'),
        getPreference('reduceMotion'),
        getPreference('notifications'),
        getDashboardLayout()
    ]).then(function(results) {
        var el;
        var localeVal = results[0];
        if (localeVal !== undefined && localeVal !== null) {
            window.auraLocale = String(localeVal);
            var listEl = document.getElementById('localeDropdownList');
            var hasOption = listEl && listEl.querySelector('.locale-dropdown-option[data-value="' + localeVal + '"]');
            if (hasOption) {
                updateLocaleDropdownValue(localeVal);
                var customEl = document.getElementById('prefLocaleCustom');
                if (customEl) customEl.style.display = 'none';
            } else {
                updateLocaleDropdownValue('_custom');
                el = document.getElementById('prefLocaleCustom');
                if (el) { el.value = localeVal; el.style.display = 'block'; }
            }
        } else {
            window.auraLocale = 'en';
            updateLocaleDropdownValue('en');
        }
        if (results[1] !== undefined && results[1] !== null) { var df = String(results[1]); window.auraDateFormat = (df === 'DM' || df === 'MD' || df === 'YMD') ? df : 'MD'; el = document.getElementById('prefDateFormat'); if (el) el.value = window.auraDateFormat; }
        if (results[2] !== undefined && results[2] !== null) { var tf = String(results[2]); window.auraTimeFormat = (tf === '12' || tf === '24') ? tf : '12'; el = document.getElementById('prefTimeFormat'); if (el) el.value = window.auraTimeFormat; }
        if (results[3] && results[3].value) { el = document.getElementById('prefDefaultSleep'); if (el) setTimeInputDisplay(el, results[3].value); }
        if (results[4] && results[4].value) { el = document.getElementById('prefDefaultWake'); if (el) setTimeInputDisplay(el, results[4].value); }
        if (results[5] !== undefined) { el = document.getElementById('prefFavoriteTags'); if (el) el.value = results[5] || ''; }
        if (results[6] !== undefined) { window.auraChartDays = parseInt(results[6], 10) || 30; el = document.getElementById('prefChartDays'); if (el) el.value = results[6] || '30'; }
        el = document.getElementById('prefReduceMotion'); if (el) el.checked = !!results[7];
        el = document.getElementById('prefNotifications'); if (el) el.checked = !!results[8];
        applyReduceMotion(!!results[7]);
        var layout = results[9];
        if (layout && layout.visible) {
            el = document.getElementById('prefWidgetMood'); if (el) el.checked = layout.visible.mood !== false;
            el = document.getElementById('prefWidgetSleep'); if (el) el.checked = layout.visible.sleep !== false;
            el = document.getElementById('prefWidgetEnergy'); if (el) el.checked = layout.visible.energy !== false;
        }
        if (typeof applyTranslations === 'function') applyTranslations();
    });
}
function applyReduceMotion(on) {
    document.documentElement.classList.toggle('reduce-motion', !!on);
}

function getDashboardLayout() {
    return db.appState.get('dashboardLayout').then(function(row) {
        return row && row.value ? row.value : { order: ['mood', 'sleep', 'energy'], visible: { mood: true, sleep: true, energy: true } };
    });
}
function setDashboardLayout(layout) {
    return db.appState.put({ key: 'dashboardLayout', value: layout });
}

// --- PWA: Install prompt, update notifications, share target, background sync ---
var deferredInstallPrompt = null;
var swRegistration = null;
window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (!window.matchMedia('(display-mode: standalone)').matches) {
        var ban = document.getElementById('pwaInstallBanner');
        if (ban) ban.classList.add('show');
    }
});
window.addEventListener('appinstalled', function() {
    deferredInstallPrompt = null;
    var ban = document.getElementById('pwaInstallBanner');
    if (ban) ban.classList.remove('show');
});
function dismissPwaInstallBanner() {
    localStorage.setItem('auraPwaInstallDismissed', 'true');
    var ban = document.getElementById('pwaInstallBanner');
    if (ban) ban.classList.remove('show');
}
function installPwa() {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then(function(choice) {
        if (choice.outcome === 'accepted') dismissPwaInstallBanner();
        deferredInstallPrompt = null;
    });
}
function reloadForPwaUpdate() {
    if (swRegistration && swRegistration.waiting) swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
}
function showPwaUpdateBanner() {
    var ban = document.getElementById('pwaUpdateBanner');
    if (ban) ban.classList.add('show');
}
var NO_DATA_BANNER_KEY = 'auraNoDataBannerDismissed';
function dismissNoDataBanner() {
    try { localStorage.setItem(NO_DATA_BANNER_KEY, 'true'); } catch (e) {}
    var ban = document.getElementById('noDataFloatingBanner');
    if (ban) ban.classList.remove('show');
}
function showNoDataBannerIfNeeded() {
    if (Object.keys(entries).length > 0) return;
    try { if (localStorage.getItem(NO_DATA_BANNER_KEY) === 'true') return; } catch (e) {}
    var ban = document.getElementById('noDataFloatingBanner');
    if (ban) ban.classList.add('show');
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js', { scope: './' }).then(function(reg) {
        swRegistration = reg;
        if (reg.waiting) showPwaUpdateBanner();
        reg.addEventListener('updatefound', function() {
            var worker = reg.installing;
            if (!worker) return;
            worker.addEventListener('statechange', function() {
                if (worker.state === 'installed' && navigator.serviceWorker.controller) showPwaUpdateBanner();
            });
        });
        navigator.serviceWorker.addEventListener('controllerchange', function() {
            showToast('App updated. Refreshing…');
            setTimeout(function() { window.location.reload(); }, 800);
        });
    }).catch(function() {});
    navigator.serviceWorker.addEventListener('message', function(event) {
        if (event.data && event.data.type === 'AURA_SW_UPDATED') {
            showToast('App updated. Refreshing…');
            setTimeout(function() { window.location.reload(); }, 800);
        }
        if (event.data && event.data.type === 'AURA_BACKUP_SYNC') {
            if (typeof checkDailyBackup === 'function') checkDailyBackup();
        }
    });
}
(function handleShareTarget() {
    var params = new URLSearchParams(window.location.search);
    var title = params.get('title') || '';
    var text = params.get('text') || '';
    var url = params.get('url') || '';
    if (!title && !text && !url) return;
    var content = [title, text, url].filter(Boolean).join('\n');
    if (!content) return;
    var targetDate = (typeof getWorkingEntryDate === 'function' && getWorkingEntryDate()) || new Date().toISOString().split('T')[0];
    Promise.resolve().then(function() {
        var existing = entries[targetDate] ? getRecordJournalHtml(entries[targetDate]) : '';
        var appended = existing ? (existing + '\n\n--- Shared ---\n' + content) : content;
        return upsertDailyRecord(targetDate, { journal: appended });
    }).then(function() {
        if (typeof showToast === 'function') showToast('Shared content added to journal');
        if (typeof navigate === 'function') navigate('journal');
        if (window.history && window.history.replaceState) window.history.replaceState({}, document.title, window.location.pathname || './index.html');
    });
})();
(function setupNotificationPermission() {
    document.getElementById('prefNotifications') && document.getElementById('prefNotifications').addEventListener('change', function() {
        if (this.checked && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    });
})();
function registerBackupSync() {
    if (swRegistration && swRegistration.sync && typeof swRegistration.sync.register === 'function') {
        swRegistration.sync.register('aura-backup').catch(function() {});
    }
}

function applyDashboardLayout() {
    var grid = document.querySelector('#dashboard .dashboard-grid');
    if (!grid) return;
    getDashboardLayout().then(function(layout) {
        var order = layout.order || ['mood', 'sleep', 'energy'];
        var visible = layout.visible || { mood: true, sleep: true, energy: true };
        var cards = [];
        order.forEach(function(key) {
            var card = grid.querySelector('[data-widget="' + key + '"]');
            if (card) {
                card.style.display = visible[key] !== false ? 'block' : 'none';
                cards.push(card);
            }
        });
        cards.forEach(function(c) { grid.appendChild(c); });
    });
}
function saveDashboardVisible(widgetKey, visible) {
    getDashboardLayout().then(function(layout) {
        layout.visible = layout.visible || {};
        layout.visible[widgetKey] = !!visible;
        return setDashboardLayout(layout);
    }).then(function() { applyDashboardLayout(); });
}

// Initialize — central boot with staged startup; splash hides after a short branded reveal
var splashHidden = false;
var splashHideTimer = null;

function ensureOverviewVisible() {
    var main = document.querySelector('main');
    if (!main) return;
    var activePage = main.querySelector('.page.active');
    if (!activePage) {
        var dashboard = document.getElementById('dashboard');
        if (dashboard) {
            dashboard.classList.add('active');
            document.querySelectorAll('.nav[data-page], .bottom-nav button[data-page], .mobile-nav-item[data-page]').forEach(function(b) {
                b.classList.toggle('active', b.getAttribute('data-page') === 'dashboard');
            });
        }
    }
}

function finishSplash() {
    if (splashHidden) return;
    splashHidden = true;
    if (splashHideTimer) { clearTimeout(splashHideTimer); splashHideTimer = null; }
    if (typeof window.hideSplash === 'function') window.hideSplash();
    ensureOverviewVisible();
}

function startApp() {
    console.log('[Aura] Boot started');
    splashHideTimer = setTimeout(finishSplash, 1200);
    
    Promise.resolve()
        .then(function() {
            return initStorage();
        })
        .then(function() {
            return (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
        })
        .then(function() {
            try {
                if (typeof refreshAllDateInputsDisplay === 'function') refreshAllDateInputsDisplay();
                if (typeof refreshAllTimeInputsDisplay === 'function') refreshAllTimeInputsDisplay();
                var dateEl = document.getElementById('date');
                if (dateEl && !dateEl.getAttribute('data-aura-date')) setDateInputDisplay(dateEl, new Date().toISOString().slice(0, 10));
                var notesEl = document.getElementById('notes');
                if (notesEl && typeof updateJournalEmptyState === 'function') {
                    notesEl.addEventListener('input', updateJournalEmptyState);
                    notesEl.addEventListener('change', updateJournalEmptyState);
                }
                ensureOverviewVisible();
                console.log('[Aura] UI ready');
            } catch (e) {
                console.warn('[Aura] Stage 2 (UI) failed', e);
            }
        })
        .then(function() {
            try {
                if (typeof updateDashboard === 'function') updateDashboard();
            } catch (e) { console.warn('[Aura] updateDashboard failed', e); }
            try {
                if (typeof renderCharts === 'function') renderCharts();
            } catch (e) { console.warn('[Aura] renderCharts failed', e); }
            try {
                if (typeof renderHeatmap === 'function') renderHeatmap();
            } catch (e) { console.warn('[Aura] renderHeatmap failed', e); }
            try {
                if (typeof generateInsights === 'function') generateInsights();
            } catch (e) { console.warn('[Aura] generateInsights failed', e); }
            try {
                if (typeof renderEntryList === 'function') renderEntryList();
            } catch (e) { console.warn('[Aura] renderEntryList failed', e); }
            setTimeout(function() {
                try { if (typeof showNoDataBannerIfNeeded === 'function') showNoDataBannerIfNeeded(); } catch (e) {}
            }, 800);
            console.log('[Aura] Charts rendered');
        })
        .then(function() {
            console.log('[Aura] Boot finished');
        })
        .catch(function(err) {
            console.error('[Aura] Boot error', err);
        });
}


// === Expose functions to global scope for inline onclick handlers ===
// All app logic is inside initApp() closure; these assignments make functions
// accessible from onclick="..." attributes in the HTML.
if (typeof addCustomMetric === 'function') window.addCustomMetric = addCustomMetric;
if (typeof addSampleData === 'function') window.addSampleData = addSampleData;
if (typeof addSleepSegment === 'function') window.addSleepSegment = addSleepSegment;
if (typeof addSuggestedTag === 'function') window.addSuggestedTag = addSuggestedTag;
if (typeof applyTheme === 'function') window.applyTheme = applyTheme;
if (typeof calendarMonthNext === 'function') window.calendarMonthNext = calendarMonthNext;
if (typeof calendarMonthPrev === 'function') window.calendarMonthPrev = calendarMonthPrev;
if (typeof calendarWeekNext === 'function') window.calendarWeekNext = calendarWeekNext;
if (typeof calendarWeekPrev === 'function') window.calendarWeekPrev = calendarWeekPrev;
if (typeof clearFieldError === 'function') window.clearFieldError = clearFieldError;
if (typeof closeContextMenu === 'function') window.closeContextMenu = closeContextMenu;
if (typeof closeDeleteAllModal === 'function') window.closeDeleteAllModal = closeDeleteAllModal;
if (typeof closeDeleteEntryModal === 'function') window.closeDeleteEntryModal = closeDeleteEntryModal;
if (typeof closeEntryModal === 'function') window.closeEntryModal = closeEntryModal;
if (typeof closeModal === 'function') window.closeModal = closeModal;
if (typeof editMetric === 'function') window.editMetric = editMetric;
if (typeof deleteMetric === 'function') window.deleteMetric = deleteMetric;
if (typeof navigateTo === 'function') window.navigateTo = navigateTo;
if (typeof closeFullEntryDeleteModal === 'function') window.closeFullEntryDeleteModal = closeFullEntryDeleteModal;
if (typeof closeImportPreviewModal === 'function') window.closeImportPreviewModal = closeImportPreviewModal;
if (typeof closeSetPasscodeModal === 'function') window.closeSetPasscodeModal = closeSetPasscodeModal;
if (typeof closeSidebar === 'function') window.closeSidebar = closeSidebar;
if (typeof confirmDeleteAll === 'function') window.confirmDeleteAll = confirmDeleteAll;
if (typeof confirmDeleteEntryFromModal === 'function') window.confirmDeleteEntryFromModal = confirmDeleteEntryFromModal;
if (typeof confirmFullEntryDeleteFromModal === 'function') window.confirmFullEntryDeleteFromModal = confirmFullEntryDeleteFromModal;
if (typeof confirmImportMerge === 'function') window.confirmImportMerge = confirmImportMerge;
if (typeof confirmImportReplace === 'function') window.confirmImportReplace = confirmImportReplace;
if (typeof deleteJournalPhoto === 'function') window.deleteJournalPhoto = deleteJournalPhoto;
if (typeof dismissAddToHomeBanner === 'function') window.dismissAddToHomeBanner = dismissAddToHomeBanner;
if (typeof dismissNoDataBanner === 'function') window.dismissNoDataBanner = dismissNoDataBanner;
if (typeof dismissPwaInstallBanner === 'function') window.dismissPwaInstallBanner = dismissPwaInstallBanner;
if (typeof downloadBackupNow === 'function') window.downloadBackupNow = downloadBackupNow;
if (typeof entryJournalStartEdit === 'function') window.entryJournalStartEdit = entryJournalStartEdit;
if (typeof entryListLoadMore === 'function') window.entryListLoadMore = entryListLoadMore;
if (typeof entryRedo === 'function') window.entryRedo = entryRedo;
if (typeof entryUndo === 'function') window.entryUndo = entryUndo;
if (typeof exportCSV === 'function') window.exportCSV = exportCSV;
if (typeof exportChartPNG === 'function') window.exportChartPNG = exportChartPNG;
if (typeof exportHeatmapPNG === 'function') window.exportHeatmapPNG = exportHeatmapPNG;
if (typeof exportJSON === 'function') window.exportJSON = exportJSON;
if (typeof exportReportPDF === 'function') window.exportReportPDF = exportReportPDF;
if (typeof exportReportPNG === 'function') window.exportReportPNG = exportReportPNG;
if (typeof generateInsights === 'function') window.generateInsights = generateInsights;
if (typeof renderPredictions === 'function') window.renderPredictions = renderPredictions;
if (typeof renderTimeHeatmap === 'function') window.renderTimeHeatmap = renderTimeHeatmap;
if (typeof renderSleepTimeline === 'function') window.renderSleepTimeline = renderSleepTimeline;
if (typeof computeRegressionLine === 'function') window.computeRegressionLine = computeRegressionLine;
if (typeof installPwa === 'function') window.installPwa = installPwa;
if (typeof loadAllEntries === 'function') window.loadAllEntries = loadAllEntries;
if (typeof navigate === 'function') window.navigate = navigate;
if (typeof navigateFromBottom === 'function') window.navigateFromBottom = navigateFromBottom;
if (typeof navigateToEntry === 'function') window.navigateToEntry = navigateToEntry;
if (typeof openDeleteAllModal === 'function') window.openDeleteAllModal = openDeleteAllModal;
if (typeof openDeleteEntryModal === 'function') window.openDeleteEntryModal = openDeleteEntryModal;
if (typeof openEntryForDate === 'function') window.openEntryForDate = openEntryForDate;
if (typeof openFullEntryDeleteConfirm === 'function') window.openFullEntryDeleteConfirm = openFullEntryDeleteConfirm;
if (typeof openJournalEntry === 'function') window.openJournalEntry = openJournalEntry;
if (typeof openSidebar === 'function') window.openSidebar = openSidebar;
if (typeof previewImport === 'function') window.previewImport = previewImport;
if (typeof reloadForPwaUpdate === 'function') window.reloadForPwaUpdate = reloadForPwaUpdate;
if (typeof removeCustomMetric === 'function') window.removeCustomMetric = removeCustomMetric;
if (typeof removeSleepSegment === 'function') window.removeSleepSegment = removeSleepSegment;
if (typeof renderCalendarCurrentView === 'function') window.renderCalendarCurrentView = renderCalendarCurrentView;
if (typeof renderDayOfWeekChart === 'function') window.renderDayOfWeekChart = renderDayOfWeekChart;
if (typeof renderCharts === 'function') window.renderCharts = renderCharts;
if (typeof renderCorrelations === 'function') window.renderCorrelations = renderCorrelations;
if (typeof renderMoodVelocity === 'function') window.renderCircadian = renderMoodVelocity;
window.renderMoodChart = function() { if (typeof window.renderCharts === 'function') window.renderCharts(); };
window.renderSleepChart = function() { if (typeof window.renderCharts === 'function') window.renderCharts(); };
window.renderEnergyChart = function() { if (typeof window.renderCharts === 'function') window.renderCharts(); };
if (typeof renderCustomRangeChart === 'function') window.renderCustomRangeChart = renderCustomRangeChart;
if (typeof renderEntryList === 'function') window.renderEntryList = renderEntryList;
if (typeof renderHeatmap === 'function') window.renderHeatmap = renderHeatmap;
if (typeof renderTagCloud === 'function') window.renderTagCloud = renderTagCloud;
if (typeof renderYearOverYear === 'function') window.renderYearOverYear = renderYearOverYear;
if (typeof restoreBackup === 'function') window.restoreBackup = restoreBackup;
if (typeof runSearch === 'function') window.runSearch = runSearch;
if (typeof saveDashboardVisible === 'function') window.saveDashboardVisible = saveDashboardVisible;
if (typeof saveEntry === 'function') window.saveEntry = saveEntry;
if (typeof saveJournalEntry === 'function') window.saveJournalEntry = saveJournalEntry;
if (typeof saveJournal === 'function') window.saveJournal = saveJournal;
if (typeof savePasscode === 'function') window.savePasscode = savePasscode;
if (typeof savePreference === 'function') window.savePreference = savePreference;
if (typeof setCalendarView === 'function') window.setCalendarView = setCalendarView;
if (typeof setDataRetention === 'function') window.setDataRetention = setDataRetention;
if (typeof setEncryptEntries === 'function') window.setEncryptEntries = setEncryptEntries;
if (typeof setFilterTag === 'function') window.setFilterTag = setFilterTag;
if (typeof setParallaxEnabled === 'function') window.setParallaxEnabled = setParallaxEnabled;
if (typeof setParticlesEnabled === 'function') window.setParticlesEnabled = setParticlesEnabled;
if (typeof setPrivateMode === 'function') window.setPrivateMode = setPrivateMode;
if (typeof setReportTab === 'function') window.setReportTab = setReportTab;
if (typeof setSleepTimelineRange === 'function') window.setSleepTimelineRange = setSleepTimelineRange;
if (typeof setSoundEnabled === 'function') window.setSoundEnabled = setSoundEnabled;
if (typeof setTheme === 'function') window.setTheme = setTheme;
if (typeof showEntryModal === 'function') window.showEntryModal = showEntryModal;
if (typeof showEntryModalFromJournal === 'function') window.showEntryModalFromJournal = showEntryModalFromJournal;
if (typeof openJournalEntryFromModal === 'function') window.openJournalEntryFromModal = openJournalEntryFromModal;
if (typeof openDeleteEntryModalFromEntryModal === 'function') window.openDeleteEntryModalFromEntryModal = openDeleteEntryModalFromEntryModal;
if (typeof showJournalPhotoFull === 'function') window.showJournalPhotoFull = showJournalPhotoFull;
if (typeof startApp === 'function') window.startApp = startApp;
if (typeof toggleDark === 'function') window.toggleDark = toggleDark;
if (typeof toggleDarkFromPage === 'function') window.toggleDarkFromPage = toggleDarkFromPage;
if (typeof toggleEntrySection === 'function') window.toggleEntrySection = toggleEntrySection;
if (typeof toggleMetricVisible === 'function') window.toggleMetricVisible = toggleMetricVisible;
if (typeof togglePasscodeLock === 'function') window.togglePasscodeLock = togglePasscodeLock;
if (typeof triggerJournalPhotoInput === 'function') window.triggerJournalPhotoInput = triggerJournalPhotoInput;
if (typeof undoLastDeletedEntry === 'function') window.undoLastDeletedEntry = undoLastDeletedEntry;
if (typeof unlockWithPasscode === 'function') window.unlockWithPasscode = unlockWithPasscode;
if (typeof updateDashboard === 'function') window.updateDashboard = updateDashboard;
if (typeof installPwa === 'function') window.triggerPwaInstall = installPwa;
// === End expose ===

startApp();
    } // end initApp()

    // Boot: run initApp() once the DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
try {
    initApp();
} catch (err) {
    console.error('[Aura] initApp failed:', err);
    var s = document.getElementById('splash');
    if (s) { s.classList.add('hide'); setTimeout(function() { s.style.display = 'none'; }, 500); }
}
    });

