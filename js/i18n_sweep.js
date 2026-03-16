/* ═══════════════════════════════════════════════════════════════════════
   js/i18n_sweep.js  v2  —  Aura Mood  ·  Dynamic content translation
   Load AFTER i18n.js. Handles every JS-rendered string in the DOM.
═══════════════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    function loc() { return String(window.auraLocale || 'en').split('-')[0]; }
    function tr(key, vars) { return (typeof window.__t === 'function' ? window.__t(key, vars) : null) || ''; }

    /* ═══════════════════════════════════════════════════════════════════
       §1  EXACT STRING MAP  (fixed UI strings rendered by JS)
    ═══════════════════════════════════════════════════════════════════ */
    var E = {};
    function add(en, t) { E[en] = t; }

    /* Chart card headers */
    add('TREND & TRAJECTORY',{de:'TREND & VERLAUF',fr:'TENDANCE & TRAJECTOIRE',es:'TENDENCIA Y TRAYECTORIA',it:'TENDENZA E TRAIETTORIA',pt:'TENDÊNCIA E TRAJETÓRIA',nl:'TREND & TRAJECT',pl:'TREND I TRAJEKTORIA',ru:'ТРЕНД И ТРАЕКТОРИЯ',tr:'TREND VE TRAJEKTORİ',ja:'トレンドと軌跡',zh:'趋势与轨迹',hi:'ट्रेंड और ट्रेजेक्टरी',ar:'الاتجاه والمسار'});
    add('Your mood over time.',{de:'Deine Stimmung im Zeitverlauf.',fr:"Votre humeur au fil du temps.",es:'Tu ánimo a lo largo del tiempo.',it:'Il tuo umore nel tempo.',pt:'O seu humor ao longo do tempo.',nl:'Jouw stemming in de loop van de tijd.',pl:'Twój nastrój w czasie.',ru:'Ваше настроение со временем.',tr:'Zaman içinde ruh haliniz.',ja:'時系列の気分。',zh:'随时间变化的情绪。',hi:'समय के साथ आपका मूड।',ar:'مزاجك عبر الوقت.'});
    add('RECOVERY & CONSISTENCY',{de:'ERHOLUNG & KONSISTENZ',fr:'RÉCUPÉRATION & COHÉRENCE',es:'RECUPERACIÓN Y CONSISTENCIA',it:'RECUPERO E CONSISTENZA',pt:'RECUPERAÇÃO E CONSISTÊNCIA',nl:'HERSTEL & CONSISTENTIE',pl:'REGENERACJA I SPÓJNOŚĆ',ru:'ВОССТАНОВЛЕНИЕ И ПОСТОЯНСТВО',tr:'İYİLEŞME VE TUTARLILIK',ja:'回復と一貫性',zh:'恢复与一致性',hi:'रिकवरी और संगतता',ar:'التعافي والاتساق'});
    add('Sleep duration and consistency.',{de:'Schlafdauer und Konsistenz.',fr:"Durée et cohérence du sommeil.",es:'Duración y consistencia del sueño.',it:'Durata e costanza del sonno.',pt:'Duração e consistência do sono.',nl:'Slaapduur en consistentie.',pl:'Czas trwania i spójność snu.',ru:'Продолжительность и постоянство сна.',tr:'Uyku süresi ve tutarlılığı.',ja:'睡眠時間と一貫性。',zh:'睡眠时长和一致性。',hi:'नींद की अवधि और संगतता।',ar:'مدة النوم واتساقه.'});
    add('Energy levels over time.',{de:'Energieniveaus im Zeitverlauf.',fr:"Niveaux d'énergie au fil du temps.",es:'Niveles de energía a lo largo del tiempo.',it:'Livelli di energia nel tempo.',pt:'Níveis de energia ao longo do tempo.',nl:'Energieniveaus in de loop van de tijd.',pl:'Poziomy energii w czasie.',ru:'Уровни энергии со временем.',tr:'Zaman içinde enerji seviyeleri.',ja:'時系列のエネルギーレベル。',zh:'随时间变化的能量水平。',hi:'समय के साथ ऊर्जा स्तर।',ar:'مستويات الطاقة عبر الوقت.'});
    add('Last 7 days',{de:'Letzte 7 Tage',fr:'7 derniers jours',es:'Últimos 7 días',it:'Ultimi 7 giorni',pt:'Últimos 7 dias',nl:'Laatste 7 dagen',pl:'Ostatnie 7 dni',ru:'Последние 7 дней',tr:'Son 7 gün',ja:'過去7日間',zh:'最近7天',hi:'पिछले 7 दिन',ar:'آخر 7 أيام'});
    add('Last 14 days',{de:'Letzte 14 Tage',fr:'14 derniers jours',es:'Últimos 14 días',it:'Ultimi 14 giorni',pt:'Últimos 14 dias',nl:'Laatste 14 dagen',pl:'Ostatnie 14 dni',ru:'Последние 14 дней',tr:'Son 14 gün',ja:'過去14日間',zh:'最近14天',hi:'पिछले 14 दिन',ar:'آخर 14 يوم'});
    add('Last 30 days',{de:'Letzte 30 Tage',fr:'30 derniers jours',es:'Últimos 30 días',it:'Ultimi 30 giorni',pt:'Últimos 30 dias',nl:'Laatste 30 dagen',pl:'Ostatnie 30 dni',ru:'Последние 30 дней',tr:'Son 30 gün',ja:'過去30日間',zh:'最近30天',hi:'पिछले 30 दिन',ar:'آخر 30 يوم'});
    add('Last 90 days',{de:'Letzte 90 Tage',fr:'90 derniers jours',es:'Últimos 90 días',it:'Ultimi 90 giorni',pt:'Últimos 90 dias',nl:'Laatste 90 dagen',pl:'Ostatnie 90 dni',ru:'Последние 90 дней',tr:'Son 90 gün',ja:'過去90日間',zh:'最近90天',hi:'पिछले 90 दिन',ar:'آخर 90 يوم'});

    /* Insights hero */
    add('Insights',{de:'Einblicke',fr:'Insights',es:'Perspectivas',it:'Approfondimenti',pt:'Insights',nl:'Inzichten',pl:'Spostrzeżenia',ru:'Инсайты',tr:'Öngörüler',ja:'インサイト',zh:'洞察',hi:'अंतर्दृष्टि',ar:'الرؤى'});
    add("Here's what your data says so far. The more consistently you log, the sharper and more personal these patterns become.",{de:'Hier ist, was deine Daten bisher zeigen. Je regelmäßiger du aufzeichnest, desto schärfer und persönlicher werden diese Muster.',fr:"Voici ce que vos données révèlent jusqu'ici. Plus vous enregistrez régulièrement, plus ces patterns deviennent précis.",es:'Esto es lo que dicen tus datos hasta ahora. Cuanto más regularmente registres, más nítidos se vuelven estos patrones.',it:'Ecco cosa dicono i tuoi dati finora. Più registri regolarmente, più i pattern diventano precisi.',pt:'Isto é o que os seus dados revelam até agora. Quanto mais regularmente registar, mais precisos ficam estes padrões.',nl:'Dit is wat jouw data tot nu toe laat zien. Hoe regelmatiger je logt, hoe scherper deze patronen worden.',pl:'Oto co mówią Twoje dane do tej pory. Im regularniej zapisujesz, tym ostrzejsze stają się te wzorce.',ru:'Вот что говорят ваши данные на данный момент. Чем регулярнее вы ведёте записи, тем точнее становятся паттерны.',tr:'Verilerinizin şimdiye kadar söyledikleri. Ne kadar düzenli kayıt tutarsanız, bu desenler o kadar keskin hale gelir.',ja:'これまでのデータが示すもの。継続的に記録するほど、パターンが鮮明になります。',zh:'这是您的数据目前揭示的内容。记录越规律，这些模式就越清晰。',hi:'यहाँ आपका डेटा अब तक क्या कहता है।',ar:'إليك ما تكشفه بياناتك حتى الآن. كلما سجّلت بانتظام أكثر، كلما أصبحت هذه الأنماط أوضح.'});

    /* Insight section eyebrows */
    add('SLEEP INSIGHTS',{de:'SCHLAF-EINBLICKE',fr:'INSIGHTS SOMMEIL',es:'PERSPECTIVAS DE SUEÑO',it:'APPROFONDIMENTI SONNO',pt:'INSIGHTS DE SONO',nl:'SLAAP-INZICHTEN',pl:'SPOSTRZEŻENIA SNU',ru:'ИНСАЙТЫ О СНЕ',tr:'UYKU ÖNGÖRÜLERİ',ja:'睡眠インサイト',zh:'睡眠洞察',hi:'नींद अंतर्दृष्टि',ar:'رؤى النوم'});
    add('Sleep Insights',{de:'Schlaf-Einblicke',fr:'Insights Sommeil',es:'Perspectivas de sueño',it:'Approfondimenti sonno',pt:'Insights de sono',nl:'Slaap-inzichten',pl:'Spostrzeżenia snu',ru:'Инсайты о сне',tr:'Uyku öngörüleri',ja:'睡眠インサイト',zh:'睡眠洞察',hi:'नींद अंतर्दृष्टि',ar:'رؤى النوم'});
    add('Patterns between sleep timing, duration, fragmentation, and mood.',{de:'Muster zwischen Schlafzeiten, Dauer, Fragmentierung und Stimmung.',fr:"Patterns entre le timing, la durée, la fragmentation du sommeil et l'humeur.",es:'Patrones entre el horario, duración, fragmentación del sueño y el ánimo.',it:"Pattern tra il timing, la durata, la frammentazione del sonno e l'umore.",pt:'Padrões entre o timing, duração, fragmentação do sono e humor.',nl:'Patronen tussen slaaptiming, -duur, -fragmentatie en stemming.',pl:'Wzorce między harmonogramem snu, czasem trwania, fragmentacją a nastrojem.',ru:'Паттерны между временем, продолжительностью, фрагментацией сна и настроением.',tr:'Uyku zamanlaması, süresi, parçalanması ve ruh hali arasındaki desenler.',ja:'睡眠のタイミング、時間、断片化、気分の間のパターン。',zh:'睡眠时间、时长、碎片化和情绪之间的模式。',hi:'नींद के समय, अवधि, विखंडन और मूड के बीच पैटर्न।',ar:'الأنماط بين توقيت النوم ومدته وتشتته والمزاج.'});
    add('ACTIVITY INSIGHTS',{de:'AKTIVITÄTS-EINBLICKE',fr:'INSIGHTS ACTIVITÉ',es:'PERSPECTIVAS DE ACTIVIDAD',it:'APPROFONDIMENTI ATTIVITÀ',pt:'INSIGHTS DE ATIVIDADE',nl:'ACTIVITEIT-INZICHTEN',pl:'SPOSTRZEŻENIA AKTYWNOŚCI',ru:'ИНСАЙТЫ ОБ АКТИВНОСТИ',tr:'AKTİVİTE ÖNGÖRÜLERİ',ja:'活動インサイト',zh:'活动洞察',hi:'गतिविधि अंतर्दृष्टि',ar:'رؤى النشاط'});
    add('Activity Insights',{de:'Aktivitäts-Einblicke',fr:'Insights Activité',es:'Perspectivas de actividad',it:'Approfondimenti attività',pt:'Insights de atividade',nl:'Activiteit-inzichten',pl:'Spostrzeżenia aktywności',ru:'Инсайты об активности',tr:'Aktivite öngörüleri',ja:'活動インサイト',zh:'活动洞察',hi:'गतिविधि अंतर्दृष्टि',ar:'رؤى النشاط'});
    add('Activities and daily energy patterns that appear linked to mood.',{de:'Aktivitäten und Energiemuster, die mit der Stimmung zusammenhängen.',fr:"Activités et patterns d'énergie quotidiens liés à l'humeur.",es:'Actividades y patrones de energía diarios vinculados al ánimo.',it:"Attività e pattern energetici giornalieri legati all'umore.",pt:'Atividades e padrões de energia diários ligados ao humor.',nl:'Activiteiten en dagelijkse energiepatronen die gekoppeld lijken aan stemming.',pl:'Aktywności i codzienne wzorce energetyczne powiązane z nastrojem.',ru:'Активности и ежедневные паттерны энергии, связанные с настроением.',tr:'Ruh haliyle bağlantılı görünen aktiviteler ve günlük enerji desenleri.',ja:'気分と関連する活動と日々のエネルギーパターン。',zh:'与情绪相关的活动和日常能量模式。',hi:'मूड से जुड़े गतिविधियां और दैनिक ऊर्जा पैटर्न।',ar:'الأنشطة وأنماط الطاقة اليومية المرتبطة بالمزاج.'});
    add('TAG INSIGHTS',{de:'TAG-EINBLICKE',fr:'INSIGHTS ÉTIQUETTES',es:'PERSPECTIVAS DE ETIQUETAS',it:'APPROFONDIMENTI TAG',pt:'INSIGHTS DE ETIQUETAS',nl:'LABEL-INZICHTEN',pl:'SPOSTRZEŻENIA TAGÓW',ru:'ИНСАЙТЫ О ТЕГАХ',tr:'ETİKET ÖNGÖRÜLERİ',ja:'タグインサイト',zh:'标签洞察',hi:'टैग अंतर्दृष्टि',ar:'رؤى الوسوم'});
    add('Tag Insights',{de:'Tag-Einblicke',fr:'Insights Étiquettes',es:'Perspectivas de etiquetas',it:'Approfondimenti tag',pt:'Insights de etiquetas',nl:'Label-inzichten',pl:'Spostrzeżenia tagów',ru:'Инсайты о тегах',tr:'Etiket öngörüleri',ja:'タグインサイト',zh:'标签洞察',hi:'टैग अंतर्दृष्टि',ar:'رؤى الوسوم'});
    add('Recurring tags that appear associated with shifts in mood.',{de:'Wiederkehrende Tags, die mit Stimmungsveränderungen assoziiert sind.',fr:"Tags récurrents qui semblent associés aux changements d'humeur.",es:'Etiquetas recurrentes que parecen asociadas a cambios de ánimo.',it:"Tag ricorrenti che sembrano associati ai cambiamenti d'umore.",pt:'Etiquetas recorrentes que parecem associadas a mudanças de humor.',nl:'Terugkerende labels die lijken samen te hangen met stemmingsverschuivingen.',pl:'Powtarzające się tagi powiązane ze zmianami nastroju.',ru:'Повторяющиеся теги, связанные с изменениями настроения.',tr:'Ruh hali değişimleriyle ilişkili görünen yinelenen etiketler.',ja:'気分の変化と関連するタグのパターン。',zh:'与情绪变化相关的重复标签。',hi:'मूड में बदलाव से जुड़े बार-बार दिखने वाले टैग।',ar:'الوسوم المتكررة التي تبدو مرتبطة بتقلبات المزاج.'});
    add('MOOD STABILITY INSIGHTS',{de:'STIMMUNGSSTABILITÄT',fr:'STABILITÉ ÉMOTIONNELLE',es:'ESTABILIDAD EMOCIONAL',it:"STABILITÀ DELL'UMORE",pt:'ESTABILIDADE EMOCIONAL',nl:'EMOTIONELE STABILITEIT',pl:'STABILNOŚĆ NASTROJU',ru:'СТАБИЛЬНОСТЬ НАСТРОЕНИЯ',tr:'RUH HALİ İSTİKRARI',ja:'気分の安定性',zh:'情绪稳定性',hi:'मूड स्थिरता',ar:'استقرار المزاج'});
    add('Mood Stability Insights',{de:'Stimmungsstabilität',fr:'Stabilité émotionnelle',es:'Estabilidad emocional',it:"Stabilità dell'umore",pt:'Estabilidade emocional',nl:'Emotionele stabiliteit',pl:'Stabilność nastroju',ru:'Стабильность настроения',tr:'Ruh hali istikrarı',ja:'気分の安定性',zh:'情绪稳定性',hi:'मूड स्थिरता',ar:'استقرار المزاج'});
    add('Mood variance and emotional consistency.',{de:'Stimmungsschwankungen und emotionale Konsistenz.',fr:"Variance d'humeur et cohérence émotionnelle.",es:'Varianza del ánimo y consistencia emocional.',it:"Varianza dell'umore e consistenza emotiva.",pt:'Variação de humor e consistência emocional.',nl:'Stemmingsvariatie en emotionele consistentie.',pl:'Zmienność nastroju i spójność emocjonalna.',ru:'Изменчивость настроения и эмоциональная стабильность.',tr:'Ruh hali varyansı ve duygusal tutarlılık.',ja:'気分のばらつきと感情の安定性。',zh:'情绪方差和情感一致性。',hi:'मूड विचरण और भावनात्मक संगतता।',ar:'تقلبات المزاج والاتساق العاطفي.'});

    /* Insight badges */
    add('STRONG PATTERN',{de:'STARKES MUSTER',fr:'PATTERN FORT',es:'PATRÓN FUERTE',it:'PATTERN FORTE',pt:'PADRÃO FORTE',nl:'STERK PATROON',pl:'SILNY WZORZEC',ru:'СИЛЬНЫЙ ПАТТЕРН',tr:'GÜÇLÜ DESEN',ja:'強いパターン',zh:'强模式',hi:'मजबूत पैटर्न',ar:'نمط قوي'});
    add('MODERATE PATTERN',{de:'MODERATES MUSTER',fr:'PATTERN MODÉRÉ',es:'PATRÓN MODERADO',it:'PATTERN MODERATO',pt:'PADRÃO MODERADO',nl:'MATIG PATROON',pl:'UMIARKOWANY WZORZEC',ru:'УМЕРЕННЫЙ ПАТТЕРН',tr:'ORTA DESEN',ja:'中程度のパターン',zh:'中等模式',hi:'मध्यम पैटर्न',ar:'نمط معتدل'});
    add('EMERGING SIGNAL',{de:'AUFKOMMENDES SIGNAL',fr:'SIGNAL ÉMERGENT',es:'SEÑAL EMERGENTE',it:'SEGNALE EMERGENTE',pt:'SINAL EMERGENTE',nl:'OPKOMEND SIGNAAL',pl:'WSCHODZĄCY SYGNAŁ',ru:'ПОЯВЛЯЮЩИЙСЯ СИГНАЛ',tr:'ORTAYA ÇIKAN SİNYAL',ja:'新興シグナル',zh:'新兴信号',hi:'उभरता संकेत',ar:'إشارة ناشئة'});
    add('STRONG CORRELATION',{de:'STARKE KORRELATION',fr:'FORTE CORRÉLATION',es:'FUERTE CORRELACIÓN',it:'FORTE CORRELAZIONE',pt:'FORTE CORRELAÇÃO',nl:'STERKE CORRELATIE',pl:'SILNA KORELACJA',ru:'СИЛЬНАЯ КОРРЕЛЯЦИЯ',tr:'GÜÇLÜ KORELASYON',ja:'強い相関',zh:'强相关',hi:'मजबूत सहसंबंध',ar:'ارتباط قوي'});

    /* Insight card kickers */
    add('SLEEP',{de:'SCHLAF',fr:'SOMMEIL',es:'SUEÑO',it:'SONNO',pt:'SONO',nl:'SLAAP',pl:'SEN',ru:'СОН',tr:'UYKU',ja:'睡眠',zh:'睡眠',hi:'नींद',ar:'النوم'});
    add('ACTIVITY INSIGHT',{de:'AKTIVITÄTS-EINBLICK',fr:'INSIGHT ACTIVITÉ',es:'PERSPECTIVA DE ACTIVIDAD',it:'APPROFONDIMENTO ATTIVITÀ',pt:'INSIGHT DE ATIVIDADE',nl:'ACTIVITEIT-INZICHT',pl:'SPOSTRZEŻENIE AKTYWNOŚCI',ru:'ИНСАЙТ ОБ АКТИВНОСТИ',tr:'AKTİVİTE ÖNGÖRÜSÜ',ja:'活動インサイト',zh:'活动洞察',hi:'गतिविधि अंतर्दृष्टि',ar:'رؤية النشاط'});
    add('ACTIVITY',{de:'AKTIVITÄT',fr:'ACTIVITÉ',es:'ACTIVIDAD',it:'ATTIVITÀ',pt:'ATIVIDADE',nl:'ACTIVITEIT',pl:'AKTYWNOŚĆ',ru:'АКТИВНОСТЬ',tr:'AKTİVİTE',ja:'活動',zh:'活动',hi:'गतिविधि',ar:'النشاط'});
    add('STABILITY',{de:'STABILITÄT',fr:'STABILITÉ',es:'ESTABILIDAD',it:'STABILITÀ',pt:'ESTABILIDADE',nl:'STABILITEIT',pl:'STABILNOŚĆ',ru:'СТАБИЛЬНОСТЬ',tr:'İSTİKRAR',ja:'安定性',zh:'稳定性',hi:'स्थिरता',ar:'الاستقرار'});
    add('TAGS',{de:'TAGS',fr:'ÉTIQUETTES',es:'ETIQUETAS',it:'TAG',pt:'ETIQUETAS',nl:'LABELS',pl:'TAGI',ru:'ТЕГИ',tr:'ETİKETLER',ja:'タグ',zh:'标签',hi:'टैग',ar:'الوسوم'});

    /* Correlations */
    add('RELATIONSHIP STRENGTH',{de:'ZUSAMMENHANGSSTÄRKE',fr:'FORCE DE RELATION',es:'FUERZA DE RELACIÓN',it:'FORZA DELLA RELAZIONE',pt:'FORÇA DA RELAÇÃO',nl:'RELATIESTERKTE',pl:'SIŁA ZWIĄZKU',ru:'СИЛА СВЯЗИ',tr:'İLİŞKİ GÜCÜ',ja:'関係の強さ',zh:'关系强度',hi:'संबंध शक्ति',ar:'قوة العلاقة'});
    add('Correlation overview (R²)',{de:'Korrelationsübersicht (R²)',fr:'Aperçu des corrélations (R²)',es:'Resumen de correlaciones (R²)',it:'Panoramica correlazioni (R²)',pt:'Visão geral das correlações (R²)',nl:'Correlatie-overzicht (R²)',pl:'Przegląd korelacji (R²)',ru:'Обзор корреляций (R²)',tr:'Korelasyon özeti (R²)',ja:'相関概要（R²）',zh:'相关性概览（R²）',hi:'सहसंबंध अवलोकन (R²)',ar:'نظرة عامة على الارتباطات (R²)'});
    add('Higher R² = stronger connection between the two metrics.',{de:'Höheres R² = stärkere Verbindung zwischen beiden Metriken.',fr:'R² plus élevé = connexion plus forte entre les deux métriques.',es:'R² más alto = conexión más fuerte entre las dos métricas.',it:'R² più alto = connessione più forte tra le due metriche.',pt:'R² mais alto = conexão mais forte entre as duas métricas.',nl:'Hoger R² = sterkere verbinding tussen de twee statistieken.',pl:'Wyższe R² = silniejszy związek między dwiema metrykami.',ru:'Более высокое R² = более сильная связь между двумя показателями.',tr:'Daha yüksek R² = iki metrik arasında daha güçlü bağlantı.',ja:'R²が高いほど2つの指標間の関係が強い。',zh:'R²越高，两个指标之间的联系越强。',hi:'उच्च R² = दो मेट्रिक्स के बीच मजबूत संबंध।',ar:'R² الأعلى = ارتباط أقوى بين المقياسين.'});
    add('Sleep × Mood',{de:'Schlaf × Stimmung',fr:'Sommeil × Humeur',es:'Sueño × Ánimo',it:'Sonno × Umore',pt:'Sono × Humor',nl:'Slaap × Stemming',pl:'Sen × Nastrój',ru:'Сон × Настроение',tr:'Uyku × Ruh hali',ja:'睡眠 × 気分',zh:'睡眠 × 情绪',hi:'नींद × मूड',ar:'النوم × المزاج'});
    add('Sleep × Energy',{de:'Schlaf × Energie',fr:'Sommeil × Énergie',es:'Sueño × Energía',it:'Sonno × Energia',pt:'Sono × Energia',nl:'Slaap × Energie',pl:'Sen × Energia',ru:'Сон × Энергия',tr:'Uyku × Enerji',ja:'睡眠 × エネルギー',zh:'睡眠 × 能量',hi:'नींद × ऊर्जा',ar:'النوم × الطاقة'});
    add('Mood × Energy',{de:'Stimmung × Energie',fr:'Humeur × Énergie',es:'Ánimo × Energía',it:'Umore × Energia',pt:'Humor × Energia',nl:'Stemming × Energie',pl:'Nastrój × Energia',ru:'Настроение × Энергия',tr:'Ruh hali × Enerji',ja:'気分 × エネルギー',zh:'情绪 × 能量',hi:'मूड × ऊर्जा',ar:'المزاج × الطاقة'});
    add('How your sleep duration relates to next-day mood.',{de:'Wie deine Schlafdauer mit der Stimmung am nächsten Tag zusammenhängt.',fr:"Comment la durée de votre sommeil est liée à l'humeur du lendemain.",es:'Cómo tu duración del sueño se relaciona con el ánimo del día siguiente.',it:"Come la durata del sonno si relaziona all'umore del giorno successivo.",pt:'Como a duração do sono se relaciona com o humor do dia seguinte.',nl:'Hoe jouw slaapduur samenhangt met de stemming de volgende dag.',pl:'Jak czas snu wpływa na nastrój następnego dnia.',ru:'Как продолжительность сна связана с настроением на следующий день.',tr:'Uyku süreniz ertesi günkü ruh hali ile nasıl ilişkili.',ja:'睡眠時間が翌日の気分に与える影響。',zh:'睡眠时长与次日情绪的关系。',hi:'आपकी नींद की अवधि अगले दिन के मूड से कैसे संबंधित है।',ar:'كيف ترتبط مدة نومك بمزاجك في اليوم التالي.'});
    add('How your sleep duration relates to next-day energy.',{de:'Wie deine Schlafdauer mit der Energie am nächsten Tag zusammenhängt.',fr:"Comment la durée de votre sommeil est liée à l'énergie du lendemain.",es:'Cómo tu duración del sueño se relaciona con la energía del día siguiente.',it:"Come la durata del sonno si relaziona all'energia del giorno successivo.",pt:'Como a duração do sono se relaciona com a energia do dia seguinte.',nl:'Hoe jouw slaapduur samenhangt met de energie de volgende dag.',pl:'Jak czas snu wpływa na energię następnego dnia.',ru:'Как продолжительность сна связана с энергией на следующий день.',tr:'Uyku süreniz ertesi günkü enerji ile nasıl ilişkili.',ja:'睡眠時間が翌日のエネルギーに与える影響。',zh:'睡眠时长与次日能量的关系。',hi:'नींद की अवधि अगले दिन की ऊर्जा से कैसे संबंधित है।',ar:'كيف ترتبط مدة نومك بطاقتك في اليوم التالي.'});
    add('How your mood and energy track together.',{de:'Wie Stimmung und Energie zusammenhängen.',fr:"Comment votre humeur et votre énergie évoluent ensemble.",es:'Cómo tu ánimo y energía evolucionan juntos.',it:"Come umore ed energia si muovono insieme.",pt:'Como o humor e a energia evoluem juntos.',nl:'Hoe jouw stemming en energie samenhangen.',pl:'Jak nastrój i energia współtworzą się ze sobą.',ru:'Как настроение и энергия связаны между собой.',tr:'Ruh haliniz ve enerjiniz birlikte nasıl hareket ediyor.',ja:'気分とエネルギーの相互関係。',zh:'情绪与能量如何共同变化。',hi:'आपका मूड और ऊर्जा एक साथ कैसे चलते हैं।',ar:'كيف يتتبع مزاجك وطاقتك بعضهما.'});
    add('↓ EXPORT PNG',{de:'↓ PNG EXPORTIEREN',fr:'↓ EXPORTER PNG',es:'↓ EXPORTAR PNG',it:'↓ ESPORTA PNG',pt:'↓ EXPORTAR PNG',nl:'↓ PNG EXPORTEREN',pl:'↓ EKSPORTUJ PNG',ru:'↓ ЭКСПОРТ PNG',tr:'↓ PNG İHRAÇ ET',ja:'↓ PNGを書き出す',zh:'↓ 导出PNG',hi:'↓ PNG निर्यात',ar:'↓ تصدير PNG'});

    /* Correlation matrix labels */
    add('Mood',{de:'Stimmung',fr:'Humeur',es:'Ánimo',it:'Umore',pt:'Humor',nl:'Stemming',pl:'Nastrój',ru:'Настроение',tr:'Ruh hali',ja:'気分',zh:'情绪',hi:'मूड',ar:'المزاج'});
    add('Sleep',{de:'Schlaf',fr:'Sommeil',es:'Sueño',it:'Sonno',pt:'Sono',nl:'Slaap',pl:'Sen',ru:'Сон',tr:'Uyku',ja:'睡眠',zh:'睡眠',hi:'नींद',ar:'النوم'});
    add('Energy',{de:'Energie',fr:'Énergie',es:'Energía',it:'Energia',pt:'Energia',nl:'Energie',pl:'Energia',ru:'Энергия',tr:'Enerji',ja:'エネルギー',zh:'能量',hi:'ऊर्जा',ar:'الطاقة'});
    add('Activities',{de:'Aktivitäten',fr:'Activités',es:'Actividades',it:'Attività',pt:'Atividades',nl:'Activiteiten',pl:'Aktywności',ru:'Активности',tr:'Aktiviteler',ja:'活動',zh:'活动',hi:'गतिविधियां',ar:'الأنشطة'});

    /* Seasonal */
    add('SEASONAL PATTERN',{de:'SAISONALES MUSTER',fr:'PATTERN SAISONNIER',es:'PATRÓN ESTACIONAL',it:'PATTERN STAGIONALE',pt:'PADRÃO SAZONAL',nl:'SEIZOENSPATROON',pl:'WZORZEC SEZONOWY',ru:'СЕЗОННЫЙ ПАТТЕРН',tr:'MEVSİMSEL DESEN',ja:'季節パターン',zh:'季节性模式',hi:'मौसमी पैटर्न',ar:'النمط الموسمي'});
    add('Monthly rhythm',{de:'Monatlicher Rhythmus',fr:'Rythme mensuel',es:'Ritmo mensual',it:'Ritmo mensile',pt:'Ritmo mensal',nl:'Maandelijks ritme',pl:'Miesięczny rytm',ru:'Месячный ритм',tr:'Aylık ritim',ja:'月次リズム',zh:'月度节律',hi:'मासिक लय',ar:'الإيقاع الشهري'});
    add('How each metric drifts above or below your personal average across the year — great for spotting SAD-like or seasonal patterns.',{de:'Wie sich jede Kennzahl über das Jahr vom persönlichen Durchschnitt entfernt — ideal zum Erkennen saisonaler Muster.',fr:"Comment chaque métrique dérive au-dessus ou en dessous de votre moyenne personnelle au cours de l'année.",es:'Cómo cada métrica se desvía de tu promedio personal a lo largo del año.',it:"Come ogni metrica si discosta sopra o sotto la media personale nel corso dell'anno.",pt:'Como cada métrica varia acima ou abaixo da média pessoal ao longo do ano.',nl:'Hoe elke statistiek boven of onder jouw persoonlijk gemiddelde afwijkt door het jaar heen.',pl:'Jak każda metryka odbiega powyżej lub poniżej Twojej osobistej średniej przez cały rok.',ru:'Как каждый показатель отклоняется выше или ниже личного среднего в течение года.',tr:'Her metriğin yıl boyunca kişisel ortalamanızın üstüne veya altına nasıl kaydığı.',ja:'各指標が年間を通じて個人平均からどれだけ乖離するか。',zh:'每个指标在全年中如何偏离个人平均值。',hi:'प्रत्येक मेट्रिक वर्ष भर में आपके व्यक्तिगत औसत से ऊपर या नीचे कैसे जाती है।',ar:'كيف تنحرف كل مقياس فوق أو دون المتوسط الشخصي عبر السنة.'});
    add('History',{de:'Verlauf',fr:'Historique',es:'Historial',it:'Cronologia',pt:'Histórico',nl:'Geschiedenis',pl:'Historia',ru:'История',tr:'Geçmiş',ja:'履歴',zh:'历史',hi:'इतिहास',ar:'السجل'});
    add('All time',{de:'Alle Zeiten',fr:'Tout le temps',es:'Todo el tiempo',it:'Tutto il tempo',pt:'Todo o tempo',nl:'Alle tijd',pl:'Cały czas',ru:'Всё время',tr:'Tüm zaman',ja:'全期間',zh:'所有时间',hi:'सभी समय',ar:'كل الوقت'});
    add('Deviation from average',{de:'Abweichung vom Durchschnitt',fr:'Déviation par rapport à la moyenne',es:'Desviación del promedio',it:'Deviazione dalla media',pt:'Desvio da média',nl:'Afwijking van gemiddelde',pl:'Odchylenie od średniej',ru:'Отклонение от среднего',tr:'Ortalamadan sapma',ja:'平均からの偏差',zh:'偏离平均值',hi:'औसत से विचलन',ar:'الانحراف عن المتوسط'});
    add('Values show deviation from your personal average for that metric. Zero = your baseline.',{de:'Werte zeigen die Abweichung vom persönlichen Durchschnitt. Null = deine Baseline.',fr:"Les valeurs montrent l'écart par rapport à votre moyenne personnelle. Zéro = votre référence.",es:'Los valores muestran la desviación de tu promedio personal. Cero = tu línea base.',it:'I valori mostrano la deviazione dalla media personale. Zero = la tua baseline.',pt:'Os valores mostram o desvio da sua média pessoal. Zero = a sua linha de base.',nl:'Waarden tonen afwijking van jouw persoonlijk gemiddelde. Nul = jouw basislijn.',pl:'Wartości pokazują odchylenie od osobistej średniej. Zero = twoja linia bazowa.',ru:'Значения показывают отклонение от личного среднего. Ноль = ваша базовая линия.',tr:'Değerler kişisel ortalamanızdan sapmayı gösterir. Sıfır = sizin temeliniz.',ja:'値は個人平均からの偏差を示す。ゼロ = ベースライン。',zh:'数值显示偏离个人平均值的程度。零 = 基准线。',hi:'मान आपके व्यक्तिगत औसत से विचलन दिखाते हैं। शून्य = बेसलाइन।',ar:'تُظهر القيم الانحراف عن متوسطك الشخصي. الصفر = خط أساسك.'});

    /* Weekly Rhythm (My Patterns page) */
    add('Weekly Rhythm',{de:'Wöchentlicher Rhythmus',fr:'Rythme hebdomadaire',es:'Ritmo semanal',it:'Ritmo settimanale',pt:'Ritmo semanal',nl:'Wekelijks ritme',pl:'Tygodniowy rytm',ru:'Еженедельный ритм',tr:'Haftalık ritim',ja:'週次リズム',zh:'每周节律',hi:'साप्ताहिक लय',ar:'الإيقاع الأسبوعي'});
    add('Which days tend to feel better or harder.',{de:'Welche Tage sich tendenziell besser oder schwerer anfühlen.',fr:'Quels jours ont tendance à mieux se passer ou à être plus difficiles.',es:'Qué días tienden a sentirse mejor o más difíciles.',it:'Quali giorni tendono a sentirsi meglio o più difficili.',pt:'Que dias tendem a sentir-se melhor ou mais difíceis.',nl:'Welke dagen doorgaans beter of moeilijker aanvoelen.',pl:'Które dni wydają się lepsze lub trudniejsze.',ru:'Какие дни, как правило, ощущаются лучше или тяжелее.',tr:'Hangi günler daha iyi veya daha zor hissettiriyor.',ja:'どの曜日が気分よく、またはつらく感じるか。',zh:'哪些天倾向于感觉更好或更难。',hi:'कौन से दिन बेहतर या कठिन लगते हैं।',ar:'الأيام التي تميل إلى أن تشعر فيها بتحسن أو بصعوبة.'});

    /* Circadian / Sleep timing grid */
    add('How your mood relates to when you sleep and wake.',{de:'Wie deine Stimmung damit zusammenhängt, wann du schläfst und aufwachst.',fr:"Comment votre humeur est liée à quand vous dormez et vous réveillez.",es:'Cómo tu ánimo se relaciona con cuándo duermes y despiertas.',it:'Come il tuo umore si relaziona a quando dormi e ti svegli.',pt:'Como o seu humor se relaciona com quando dorme e acorda.',nl:'Hoe jouw stemming samenhangt met wanneer je slaapt en wakker wordt.',pl:'Jak nastrój wiąże się z porami snu i budzenia.',ru:'Как настроение связано с тем, когда вы спите и просыпаетесь.',tr:'Ruh halinizin ne zaman uyuduğunuzla ve uyandığınızla nasıl ilişkili olduğu.',ja:'気分と睡眠・起床時刻の関係。',zh:'情绪与睡眠和醒来时间的关系。',hi:'आपका मूड कब सोते और जागते हैं से कैसे संबंधित है।',ar:'كيف يرتبط مزاجك بأوقات نومك واستيقاظك.'});
    add('WAKE TIME',{de:'AUFWACHZEIT',fr:'HEURE DE RÉVEIL',es:'HORA DE DESPERTAR',it:'ORA DI SVEGLIA',pt:'HORA DE ACORDAR',nl:'WEKTIJD',pl:'PORA WSTAWANIA',ru:'ВРЕМЯ ПРОБУЖДЕНИЯ',tr:'UYANMA SAATİ',ja:'起床時刻',zh:'起床时间',hi:'जागने का समय',ar:'وقت الاستيقاظ'});
    add('BEDTIME',{de:'SCHLAFENSZEIT',fr:'HEURE DU COUCHER',es:'HORA DE DORMIR',it:'ORA DI ANDARE A LETTO',pt:'HORA DE DEITAR',nl:'BEDTIJD',pl:'PORA SNU',ru:'ВРЕМЯ ОТХОДА КО СНУ',tr:'YATMA SAATİ',ja:'就寝時刻',zh:'就寝时间',hi:'सोने का समय',ar:'وقت النوم'});
    add('Night',{de:'Nacht',fr:'Nuit',es:'Noche',it:'Notte',pt:'Noite',nl:'Nacht',pl:'Noc',ru:'Ночь',tr:'Gece',ja:'深夜',zh:'夜间',hi:'रात',ar:'ليل'});
    add('Early AM',{de:'Früher Morgen',fr:'Tôt le matin',es:'Madrugada',it:'Prima mattina',pt:'Madrugada',nl:'Vroege ochtend',pl:'Wczesny ranek',ru:'Раннее утро',tr:'Erkenden',ja:'早朝',zh:'凌晨',hi:'सुबह जल्दी',ar:'فجر'});
    add('Morning',{de:'Morgen',fr:'Matin',es:'Mañana',it:'Mattina',pt:'Manhã',nl:'Ochtend',pl:'Ranek',ru:'Утро',tr:'Sabah',ja:'朝',zh:'早晨',hi:'सुबह',ar:'صباح'});
    add('Afternoon',{de:'Nachmittag',fr:'Après-midi',es:'Tarde',it:'Pomeriggio',pt:'Tarde',nl:'Middag',pl:'Popołudnie',ru:'День',tr:'Öğleden sonra',ja:'午後',zh:'下午',hi:'दोपहर',ar:'ظهر'});
    add('Evening',{de:'Abend',fr:'Soir',es:'Tarde-noche',it:'Sera',pt:'Noite',nl:'Avond',pl:'Wieczór',ru:'Вечер',tr:'Akşam',ja:'夕方',zh:'傍晚',hi:'शाम',ar:'مساء'});
    add('Late Night',{de:'Späte Nacht',fr:'Nuit tardive',es:'Noche tardía',it:'Tarda notte',pt:'Noite tardia',nl:'Late avond',pl:'Późna noc',ru:'Поздняя ночь',tr:'Geç gece',ja:'深夜遅く',zh:'深夜',hi:'देर रात',ar:'منتصف الليل'});
    add('Average Mood:',{de:'Ø Stimmung:',fr:'Humeur moy. :',es:'Ánimo prom.:',it:'Umore medio:',pt:'Humor méd.:',nl:'Gem. stemming:',pl:'Śr. nastrój:',ru:'Ср. настроение:',tr:'Ort. ruh hali:',ja:'平均気分:',zh:'平均情绪:',hi:'औसत मूड:',ar:'متوسط المزاج:'});
    add('Entries:',{de:'Einträge:',fr:'Entrées :',es:'Entradas:',it:'Voci:',pt:'Entradas:',nl:'Invoeren:',pl:'Wpisy:',ru:'Записей:',tr:'Kayıtlar:',ja:'エントリー:',zh:'记录:',hi:'प्रविष्टियां:',ar:'الإدخالات:'});
    add('Keine Daten',{de:'Keine Daten',fr:'Aucune donnée',es:'Sin datos',it:'Nessun dato',pt:'Sem dados',nl:'Geen data',pl:'Brak danych',ru:'Нет данных',tr:'Veri yok',ja:'データなし',zh:'无数据',hi:'कोई डेटा नहीं',ar:'لا بيانات'});
    add('No data',{de:'Keine Daten',fr:'Aucune donnée',es:'Sin datos',it:'Nessun dato',pt:'Sem dados',nl:'Geen data',pl:'Brak danych',ru:'Нет данных',tr:'Veri yok',ja:'データなし',zh:'无数据',hi:'कोई डेटा नहीं',ar:'لا بيانات'});

    /* Misc */
    add('Average mood',{de:'Durchschnittliche Stimmung',fr:'Humeur moyenne',es:'Ánimo promedio',it:'Umore medio',pt:'Humor médio',nl:'Gemiddelde stemming',pl:'Średni nastrój',ru:'Среднее настроение',tr:'Ortalama ruh hali',ja:'平均気分',zh:'平均情绪',hi:'औसत मूड',ar:'متوسط المزاج'});
    add('Based on the last 7 days.',{de:'Basierend auf den letzten 7 Tagen.',fr:'Basé sur les 7 derniers jours.',es:'Basado en los últimos 7 días.',it:'Basato sugli ultimi 7 giorni.',pt:'Com base nos últimos 7 dias.',nl:'Gebaseerd op de laatste 7 dagen.',pl:'Na podstawie ostatnich 7 dni.',ru:'На основе последних 7 дней.',tr:'Son 7 güne göre.',ja:'過去7日間に基づく。',zh:'基于最近7天。',hi:'पिछले 7 दिनों के आधार पर।',ar:'بناءً على آخر 7 أيام.'});
    add('Keep tracking to see what days feel most energised.',{de:'Halte weiter Aufzeichnungen, um zu sehen, an welchen Tagen du dich am energiegeladensten fühlst.',fr:"Continuez à suivre pour voir quels jours vous vous sentez le plus énergisé.",es:'Sigue registrando para ver qué días te sientes con más energía.',it:'Continua a monitorare per vedere quali giorni ti senti più energico.',pt:'Continue a monitorizar para ver em que dias se sente mais energético.',nl:'Blijf bijhouden om te zien op welke dagen je je het meest energiek voelt.',pl:'Śledź dalej, aby zobaczyć, które dni czujesz się najbardziej energiczny.',ru:'Продолжайте отслеживать, чтобы увидеть, в какие дни вы чувствуете себя наиболее энергичным.',tr:'En enerjik hissettiğiniz günleri görmek için takip etmeye devam edin.',ja:'最もエネルギッシュに感じる日を見るために記録を続けてください。',zh:'继续追踪，了解哪些天感觉最有活力。',hi:'यह देखने के लिए ट्रैक करते रहें कि किन दिनों में आप सबसे अधिक ऊर्जावान हैं।',ar:'استمر في التتبع لترى الأيام الأعلى طاقة.'});

    /* Sleep page nudge strings */
    add('Consistency matters more than duration; try to keep your bedtime within a 30-minute window.',{de:'Regelmäßigkeit ist wichtiger als Dauer; versuche, deine Schlafenszeit in einem 30-Minuten-Fenster zu halten.',fr:"La régularité compte plus que la durée ; essayez de maintenir votre heure de coucher dans une fenêtre de 30 minutes.",es:'La regularidad importa más que la duración; intenta mantener tu hora de dormir dentro de una ventana de 30 minutos.',it:'La regolarità conta più della durata; cerca di mantenere la tua ora di coricarti in una finestra di 30 minuti.',pt:'A regularidade importa mais do que a duração; tente manter a hora de deitar numa janela de 30 minutos.',nl:'Regelmaat is belangrijker dan duur; probeer je bedtijd binnen een venster van 30 minuten te houden.',pl:'Regularność jest ważniejsza niż czas trwania; staraj się utrzymywać porę snu w oknie 30 minut.',ru:'Регулярность важнее продолжительности; старайтесь придерживаться времени отхода ко сну в пределах 30 минут.',tr:'Düzenlilik, süreden daha önemlidir; uyku saatinizi 30 dakikalık bir pencerede tutmaya çalışın.',ja:'規則性が持続時間より重要です。就寝時刻を30分以内に保ってください。',zh:'规律比时长更重要；尽量将就寝时间保持在30分钟的窗口内。',hi:'नियमितता अवधि से अधिक मायने रखती है; अपने सोने के समय को 30 मिनट की विंडो में रखने की कोशिश करें।',ar:'الانتظام أهم من المدة؛ حاول الحفاظ على وقت نومك ضمن نافذة 30 دقيقة.'});
    add('Keep it up — sustained rest builds resilience.',{de:'Weiter so — anhaltende Erholung baut Resilienz auf.',fr:"Continuez ainsi — un repos soutenu renforce la résilience.",es:'Sigue así — el descanso sostenido construye resiliencia.',it:'Continua così — il riposo sostenuto costruisce resilienza.',pt:'Continue assim — o descanso sustentado constrói resiliência.',nl:'Ga zo door — aanhoudende rust bouwt veerkracht op.',pl:'Tak dalej — trwały odpoczynek buduje odporność.',ru:'Продолжайте в том же духе — устойчивый отдых укрепляет жизнестойкость.',tr:'Böyle devam edin — sürekli dinlenme dayanıklılık oluşturur.',ja:'このまま続けましょう。持続的な休息が回復力を高めます。',zh:'继续保持——持续的休息建立抗压能力。',hi:'ऐसे ही जारी रखें — निरंतर आराम से लचीलापन बनता है।',ar:'استمر على هذا النهج — الراحة المستدامة تبني المرونة.'});

    /* Insight nudge fixed strings */
    add('Sleep and activity levels often drive short-term volatility.',{de:'Schlaf- und Aktivitätsniveaus treiben kurzfristige Schwankungen an.',fr:"Les niveaux de sommeil et d'activité alimentent souvent la volatilité à court terme.",es:'Los niveles de sueño y actividad suelen impulsar la volatilidad a corto plazo.',it:"I livelli di sonno e attività spesso guidano la volatilità a breve termine.",pt:'Os níveis de sono e atividade muitas vezes impulsionam a volatilidade a curto prazo.',nl:'Slaap- en activiteitsniveaus sturen vaak kortetermijnvolatiliteit.',pl:'Poziomy snu i aktywności często napędzają krótkoterminową zmienność.',ru:'Уровни сна и активности часто вызывают краткосрочные колебания.',tr:'Uyku ve aktivite seviyeleri genellikle kısa vadeli oynaklığı yönlendirir.',ja:'睡眠と活動レベルが短期的な変動を引き起こすことが多い。',zh:'睡眠和活动水平常常导致短期波动。',hi:'नींद और गतिविधि के स्तर अक्सर अल्पकालिक अस्थिरता को प्रेरित करते हैं।',ar:'مستويات النوم والنشاط كثيراً ما تقود التقلبات قصيرة المدى.'});
    add("Whatever you're doing, it's working.",{de:'Was auch immer du tust, es funktioniert.',fr:"Quoi que vous fassiez, ça marche.",es:'Lo que sea que estés haciendo, está funcionando.',it:"Qualunque cosa tu stia facendo, sta funzionando.",pt:'O que quer que esteja a fazer, está a funcionar.',nl:'Wat je ook doet, het werkt.',pl:'Cokolwiek robisz, to działa.',ru:'Что бы вы ни делали, это работает.',tr:'Her ne yapıyorsanız, işe yarıyor.',ja:'何をやっていても、うまくいっています。',zh:'不管你在做什么，它都有效。',hi:'आप जो भी कर रहे हैं, वह काम कर रहा है।',ar:'مهما كنت تفعل، فهو ينجح.'});
    add('Keep prioritising it.',{de:'Priorisiere es weiter.',fr:'Continuez à lui accorder la priorité.',es:'Sigue priorizándolo.',it:'Continua a dargli la priorità.',pt:'Continue a priorizá-lo.',nl:'Blijf er prioriteit aan geven.',pl:'Nadal traktuj to priorytetowo.',ru:'Продолжайте уделять этому приоритетное внимание.',tr:'Önceliklendirmeye devam edin.',ja:'引き続き優先してください。',zh:'继续优先考虑它。',hi:'इसे प्राथमिकता देते रहें।',ar:'استمر في إعطائه الأولوية.'});

    /* ═══════════════════════════════════════════════════════════════════
       §2  CHIP / DYNAMIC PATTERN TRANSLATIONS
    ═══════════════════════════════════════════════════════════════════ */
    var CL = {
        avg:    {de:'Ø',fr:'Moy',es:'Prom',it:'Med',pt:'Méd',nl:'Gem',pl:'Śr',ru:'Ср',tr:'Ort',ja:'平均',zh:'均',hi:'औसत',ar:'متوسط'},
        latest: {de:'Aktuell',fr:'Récent',es:'Reciente',it:'Recente',pt:'Recente',nl:'Huidig',pl:'Ostatni',ru:'Последний',tr:'Son',ja:'最新',zh:'最近',hi:'हालिया',ar:'الأخير'},
        vsAvg:  {de:'vs Ø',fr:'vs moy',es:'vs prom',it:'vs med',pt:'vs méd',nl:'vs gem',pl:'vs śr',ru:'vs ср',tr:'vs ort',ja:'vs 平均',zh:'vs 均',hi:'vs औसत',ar:'مقابل المتوسط'},
        range:  {de:'Bereich',fr:'Plage',es:'Rango',it:'Intervallo',pt:'Intervalo',nl:'Bereik',pl:'Zakres',ru:'Диапазон',tr:'Aralık',ja:'範囲',zh:'范围',hi:'दायरा',ar:'النطاق'},
        seenAcross:{de:'Gesehen in',fr:'Vu dans',es:'Visto en',it:'Visto in',pt:'Visto em',nl:'Gezien in',pl:'Widziano w',ru:'Встречается в',tr:'Görüldü',ja:'確認',zh:'出现于',hi:'में देखा',ar:'ظهر في'},
        tagged: {de:'markierten',fr:'tagués',es:'etiquetadas',it:'taggati',pt:'marcadas',nl:'getagde',pl:'otagowanych',ru:'помеченных',tr:'etiketlenmiş',ja:'タグ付きの',zh:'标记的',hi:'टैग किए',ar:'موسومة'},
        entries:{de:'Einträge',fr:'entrées',es:'entradas',it:'voci',pt:'entradas',nl:'invoeren',pl:'wpisów',ru:'записей',tr:'kayıt',ja:'エントリー',zh:'记录',hi:'प्रविष्टियां',ar:'إدخالات'},
        entry:  {de:'Eintrag',fr:'entrée',es:'entrada',it:'voce',pt:'entrada',nl:'invoer',pl:'wpis',ru:'запись',tr:'kayıt',ja:'エントリー',zh:'记录',hi:'प्रविष्टि',ar:'إدخال'},
        nights: {de:'Nächte',fr:'nuits',es:'noches',it:'notti',pt:'noites',nl:'nachten',pl:'nocy',ru:'ночей',tr:'gece',ja:'夜',zh:'夜',hi:'रातें',ar:'ليالٍ'},
        night:  {de:'Nacht',fr:'nuit',es:'noche',it:'notte',pt:'noite',nl:'nacht',pl:'noc',ru:'ночь',tr:'gece',ja:'夜',zh:'夜',hi:'रात',ar:'ليلة'},
        basedOn:{de:'Basierend auf',fr:'Basé sur',es:'Basado en',it:'Basato su',pt:'Com base em',nl:'Gebaseerd op',pl:'Na podstawie',ru:'На основе',tr:'Baz alınan',ja:'基準:',zh:'基于',hi:'आधार पर',ar:'بناءً على'},
        loggedAcross:{de:'Erfasst über',fr:'Enregistré sur',es:'Registrado en',it:'Registrato su',pt:'Registado em',nl:'Geregistreerd over',pl:'Zarejestrowano przez',ru:'Зафиксировано за',tr:'Kayıt yapılan',ja:'記録日数:',zh:'记录',hi:'रिकॉर्ड किया',ar:'سُجّل خلال'},
        bothMetrics:{de:'Tagen mit beiden Metriken.',fr:'jours avec les deux métriques.',es:'días con ambas métricas.',it:'giorni con entrambe le metriche.',pt:'dias com ambas as métricas.',nl:'dagen met beide statistieken.',pl:'dni z obydwoma metrykami.',ru:'дней с обоими показателями.',tr:'gün her iki metrikle.',ja:'日（両方の指標）。',zh:'天（两项指标）。',hi:'दिन दोनों मेट्रिक्स के साथ।',ar:'يوماً بكلا المقياسين.'},
        yourMoodPeaks:{de:'Deine Stimmung erreicht tendenziell am',fr:'Votre humeur atteint son pic le',es:'Tu ánimo tiende a alcanzar su punto álgido el',it:'Il tuo umore tende a raggiungere il picco il',pt:'O seu humor tende a atingir o pico na',nl:'Jouw stemming bereikt zijn hoogtepunt op',pl:'Twój nastrój osiąga szczyt w',ru:'Ваше настроение обычно достигает пика в',tr:'Ruh haliniz en yüksek noktaya',ja:'気分は',zh:'你的情绪在',hi:'आपका मूड',ar:'يميل مزاجك للذروة'},
        andDip:{de:'ihren Höhepunkt und sinkt am',fr:'et son creux le',es:'y tiende a caer el',it:'e tende a calare il',pt:'e cai na',nl:'en zijn dieptepunt op',pl:'a spada w',ru:'и падает в',tr:'ulaşır ve en düşük noktaya',ja:'にピークを迎え',zh:'达到顶峰，在',hi:'पर चोटी पर पहुंचता है और',ar:'وينخفض يوم'},
        sleepAvgHealthy:{de:'Dein durchschnittlicher Schlaf beträgt {n} Stunden — im gesunden Bereich.',fr:"Votre sommeil moyen est de {n} heures — dans une plage saine.",es:'Tu sueño promedio es de {n} horas — dentro de un rango saludable.',it:'Il tuo sonno medio è di {n} ore — in un intervallo sano.',pt:'O seu sono médio é de {n} horas — dentro de um intervalo saudável.',nl:'Jouw gemiddelde slaap is {n} uur — binnen een gezond bereik.',pl:'Twój średni sen wynosi {n} godzin — w zdrowym zakresie.',ru:'Средняя продолжительность вашего сна составляет {n} часов — в здоровом диапазоне.',tr:'Ortalama uyku süreniz {n} saat — sağlıklı bir aralıkta.',ja:'平均睡眠は{n}時間 — 健康的な範囲内です。',zh:'您的平均睡眠为{n}小时 — 在健康范围内。',hi:'आपकी औसत नींद {n} घंटे है — स्वस्थ दायरे में।',ar:'متوسط نومك {n} ساعة — ضمن النطاق الصحي.'},
        sleepImproved:{de:'Schlaf verbesserte sich diese Woche um {n}h gegenüber deinem Durchschnitt.',fr:"Le sommeil s'est amélioré de {n}h cette semaine par rapport à votre moyenne.",es:'El sueño mejoró en {n}h esta semana respecto a tu promedio.',it:'Il sonno è migliorato di {n}h questa settimana rispetto alla media.',pt:'O sono melhorou {n}h esta semana em relação à sua média.',nl:'Slaap verbeterde deze week met {n}u ten opzichte van jouw gemiddelde.',pl:'Sen poprawił się o {n}h w tym tygodniu w porównaniu do średniej.',ru:'Сон улучшился на {n}ч на этой неделе по сравнению со средним.',tr:'Bu hafta uyku ortalamanıza kıyasla {n}s iyileşti.',ja:'今週の睡眠は平均より{n}h改善しました。',zh:'本周睡眠比平均水平改善了{n}小时。',hi:'इस सप्ताह नींद में आपके औसत की तुलना में {n}h सुधार हुआ।',ar:'تحسّن النوم هذا الأسبوع بمقدار {n} ساعة مقارنة بمتوسطك.'},
        stabilityVolatileDesc:{de:'Die tägliche Schwankung betrug diese Woche {n} Punkte — höher als gewöhnlich. Schlafroutine ist oft der versteckte Treiber.',fr:"La variance quotidienne était de {n} points cette semaine — plus élevée que d'habitude. La régularité du sommeil en est souvent le facteur caché.",es:'La varianza día a día fue de {n} puntos esta semana — mayor de lo habitual. La consistencia del sueño suele ser el factor oculto.',it:'La varianza giornaliera è stata di {n} punti questa settimana — più alta del solito. La regolarità del sonno è spesso il fattore nascosto.',pt:'A variância diária foi de {n} pontos esta semana — acima do habitual. A consistência do sono é frequentemente o fator oculto.',nl:'De dagelijkse variantie was {n} punten deze week — hoger dan gewoonlijk. Slaapregelmaat is vaak de verborgen oorzaak.',pl:'Dzienna wariancja wynosiła {n} punktów w tym tygodniu — wyższa niż zwykle. Regularność snu jest często ukrytym czynnikiem.',ru:'Ежедневная дисперсия составила {n} баллов на этой неделе — выше обычного. Регулярность сна часто является скрытым фактором.',tr:'Bu hafta günlük varyans {n} puan oldu — normalden yüksek. Uyku düzenliliği genellikle gizli etkendir.',ja:'今週の日次分散は{n}ポイントで、通常より高い。睡眠の規則性が隠れた要因であることが多い。',zh:'本周日常方差为{n}分——高于平常。睡眠规律通常是隐藏的驱动因素。',hi:'इस सप्ताह दैनिक विचरण {n} अंक था — सामान्य से अधिक। नींद की नियमितता अक्सर छिपा हुआ कारक होती है।',ar:'بلغ التباين اليومي هذا الأسبوع {n} نقاط — أعلى من المعتاد. انتظام النوم كثيراً ما يكون العامل الخفي.'},
        tagBadDesc:{de:'„{label}"-Tage ziehen deinen Durchschnitt um etwa {diff} Punkte nach unten. Es lohnt sich zu beachten, was diese Tage gemeinsam haben.',fr:'Les jours « {label} » font baisser votre moyenne d\'environ {diff} points. Cela vaut la peine d\'observer ce que ces jours ont en commun.',es:'Los días "{label}" reducen tu promedio en aproximadamente {diff} puntos. Vale la pena prestar atención a lo que tienen en común.',it:'I giorni "{label}" trascinano la tua media verso il basso di circa {diff} punti. Vale la pena notare cosa hanno in comune.',pt:'Os dias "{label}" arrastam a sua média para baixo em cerca de {diff} pontos. Vale a pena notar o que esses dias têm em comum.',nl:'"{label}"-dagen trekken jouw gemiddelde met ongeveer {diff} punten omlaag. Het is de moeite waard te letten op wat die dagen gemeen hebben.',pl:'Dni "{label}" obniżają Twój średni nastrój o około {diff} punktów. Warto zwrócić uwagę na to, co te dni mają wspólnego.',ru:'Дни "{label}" снижают ваш средний показатель примерно на {diff} балла. Стоит обратить внимание на то, что общего у этих дней.',tr:'"{label}" günleri ortalamanızı yaklaşık {diff} puan düşürüyor. Bu günlerin ortak özelliklerine dikkat etmeye değer.',ja:'「{label}」の日は平均を約{diff}ポイント下げます。これらの日の共通点に注目する価値があります。',zh:'""{label}"天将您的平均值拉低约{diff}分。值得关注这些天有什么共同点。',hi:'"{label}" दिन आपके औसत को लगभग {diff} अंक नीचे खींचते हैं। इन दिनों में क्या समान है, इस पर ध्यान देना उचित है।',ar:'أيام "{label}" تسحب متوسطك لأسفل بحوالي {diff} نقطة. يستحق الأمر الانتباه إلى ما تشترك فيه هذه الأيام.'},
        tagBadNudge:{de:'Es lohnt sich zu beachten, was „{label}"-Tage gemeinsam haben.',fr:'Il vaut la peine de remarquer ce que les jours « {label} » ont en commun.',es:'Vale la pena notar qué tienen en común los días "{label}".',it:'Vale la pena notare cosa hanno in comune i giorni "{label}".',pt:'Vale a pena notar o que os dias "{label}" têm em comum.',nl:'Het is de moeite waard op te merken wat "{label}"-dagen gemeen hebben.',pl:'Warto zauważyć, co mają wspólnego dni "{label}".',ru:'Стоит заметить, что общего у дней "{label}".',tr:'"{label}" günlerinin ortak özelliklerini fark etmeye değer.',ja:'「{label}」の日の共通点に注目する価値があります。',zh:'值得注意"{label}"天有什么共同点。',hi:'यह ध्यान देने योग्य है कि "{label}" दिनों में क्या समान है।',ar:'يستحق الأمر ملاحظة ما تشترك فيه أيام "{label}".'},
    };

    function translateDynamic(text, l) {
        var avg=CL.avg[l]||'Avg', latest=CL.latest[l]||'Latest',
            vsAvg=CL.vsAvg[l]||'vs avg', range=CL.range[l]||'Range', m;

        /* Chip: "Avg 6.8" */
        m = text.match(/^Avg\s+([\d.]+)$/);
        if (m) return avg + '\u00a0' + m[1];

        /* Chip: "Latest: +5.1 vs avg" */
        m = text.match(/^Latest:\s+([+-][\d.]+)\s+vs\s+avg$/);
        if (m) return latest + ': ' + m[1] + ' ' + vsAvg;

        /* Chip: "Range 5.0–12.0" */
        m = text.match(/^Range\s+([\d.]+[–\-][\d.]+)$/);
        if (m) return range + ' ' + m[1];

        /* "Seen across N tagged entries." */
        m = text.match(/^Seen across (\d+) tagged (entry|entries)\./i);
        if (m) {
            var eW = parseInt(m[1])===1 ? (CL.entry[l]||'entry') : (CL.entries[l]||'entries');
            return (CL.seenAcross[l]||'Seen across')+' '+m[1]+' '+(CL.tagged[l]||'tagged')+' '+eW+'.';
        }

        /* "Logged across 97 days with both metrics." */
        m = text.match(/^Logged across (\d+) days with both metrics\./);
        if (m) return (CL.loggedAcross[l]||'Logged across')+' '+m[1]+' '+(CL.bothMetrics[l]||'days with both metrics.');

        /* "Based on 17 nights in that range." */
        m = text.match(/^Based on (\d+) (night|nights)\s+(.*)/i);
        if (m) {
            var nW = parseInt(m[1])===1 ? (CL.night[l]||'night') : (CL.nights[l]||'nights');
            return (CL.basedOn[l]||'Based on')+' '+m[1]+' '+nW+' '+m[3];
        }

        /* "Based on N higher-energy entries and M lower-energy entries." */
        m = text.match(/^Based on (\d+) higher-energy entries? and (\d+) lower-energy entries?\./);
        if (m) {
            var tpls = {
                de:'Basierend auf '+m[1]+' energiereichen Einträgen und '+m[2]+' energiearmen Einträgen.',
                fr:'Basé sur '+m[1]+' entrées à haute énergie et '+m[2]+' entrées à faible énergie.',
                es:'Basado en '+m[1]+' entradas de alta energía y '+m[2]+' de baja energía.',
                ar:'بناءً على '+m[1]+' إدخال طاقة مرتفعة و'+m[2]+' إدخال طاقة منخفضة.'
            };
            return tpls[l] || text;
        }

        /* "Logged X on N days." */
        m = text.match(/^Logged (.+) on (\d+) days?\./);
        if (m) {
            var loggedTpls = {
                de:''+m[1]+' an '+m[2]+' Tagen aufgezeichnet.',
                fr:''+m[1]+' enregistré sur '+m[2]+' jours.',
                es:''+m[1]+' registrado en '+m[2]+' días.',
                ar:'تم تسجيل '+m[1]+' على مدى '+m[2]+' أيام.'
            };
            return loggedTpls[l] || text;
        }

        /* "Your average sleep is N hours — within a healthy range." */
        m = text.match(/^Your average sleep is ([\d.]+) hours\s*[—-]+\s*within a healthy range\.$/);
        if (m && CL.sleepAvgHealthy[l]) return CL.sleepAvgHealthy[l].replace('{n}', m[1]);

        /* "Sleep improved by Nh this week vs your average." */
        m = text.match(/^Sleep improved by ([\d.]+)h this week vs your average\.$/);
        if (m && CL.sleepImproved[l]) return CL.sleepImproved[l].replace('{n}', m[1]);

        /* "Your mood tends to peak on Xs and dip on Ys." */
        m = text.match(/^Your mood tends to peak on (.+?)(s|days) and dip on (.+?)(s|days)\./);
        if (m) {
            var peakDay = m[1], dipDay = m[3];
            var tpls2 = {
                de:'Deine Stimmung erreicht tendenziell am '+peakDay+' ihren Höhepunkt und sinkt am '+dipDay+'.',
                fr:'Votre humeur atteint son pic le '+peakDay+' et son creux le '+dipDay+'.',
                es:'Tu ánimo tiende a alcanzar su punto álgido el '+peakDay+' y a caer el '+dipDay+'.',
                ar:'يميل مزاجك للذروة يوم '+peakDay+' وينخفض يوم '+dipDay+'.'
            };
            return tpls2[l] || text;
        }

        /* "Day-to-day variance of N points this past week — higher than usual/your usual pattern..." */
        m = text.match(/^Day-to-day variance of ([\d.]+) points this( past)? week/);
        if (m && CL.stabilityVolatileDesc[l]) return CL.stabilityVolatileDesc[l].replace('{n}', m[1]);

        /* '"X" days drag your average down by about N points...' */
        m = text.match(/^["""](.+?)["""] days drag your average down by about ([\d.]+) points/);
        if (m && CL.tagBadDesc[l]) return CL.tagBadDesc[l].replace('{label}', m[1]).replace('{diff}', m[2]);

        /* 'Worth noticing what "X" days have in common.' */
        m = text.match(/^Worth noticing what ["""](.+?)["""] days have in common\./);
        if (m && CL.tagBadNudge[l]) return CL.tagBadNudge[l].replace('{label}', m[1]);

        /* Circadian tooltip: "Bedtime · EarlyAM · Average Mood: — · Entries: 0" */
        m = text.match(/^(Bedtime|Wake time) · (.+) · Average Mood: (.+) · Entries: (\d+)$/);
        if (m) {
            var typeLabel = m[1] === 'Bedtime' ? (E['BEDTIME'] && E['BEDTIME'][l] || m[1]) : (E['WAKE TIME'] && E['WAKE TIME'][l] || m[1]);
            var timeLabel = E[m[2]] && E[m[2]][l] ? E[m[2]][l] : m[2];
            var avgLabel = E['Average Mood:'] && E['Average Mood:'][l] ? E['Average Mood:'][l] : 'Average Mood:';
            var entLabel = E['Entries:'] && E['Entries:'][l] ? E['Entries:'][l] : 'Entries:';
            return typeLabel + ' · ' + timeLabel + ' · ' + avgLabel + ' ' + m[3] + ' · ' + entLabel + ' ' + m[4];
        }

        return null;
    }

    /* ═══════════════════════════════════════════════════════════════════
       §3  NARRATIVE SENTENCE MAP
       Maps individual English narrative sentences to window.__t keys.
       Used by the narrative re-patcher.
    ═══════════════════════════════════════════════════════════════════ */
    var NARRATIVE_KEYS = [
        { key: 'no_checkin_today',
          test: function(s) { return /^No check-?in yet today\.?$/.test(s) ? {} : null; } },
        { key: 'narrative_trend_up',
          test: function(s) { return s === 'Your mood has been climbing this week.' ? {} : null; } },
        { key: 'narrative_trend_down',
          test: function(s) { return s === 'Your mood has dipped a little this week.' ? {} : null; } },
        { key: 'narrative_steady',
          test: function(s) { return s === 'Your mood has been steady this week.' ? {} : null; } },
        { key: 'narrative_start',
          test: function(s) { return s.indexOf('Start logging your first') === 0 ? {} : null; } },
        { key: 'tagging_recently',
          test: function(s) {
              var m = s.match(/^You'?ve been tagging ["""](.+?)["""] a lot lately\.?$/);
              return m ? { tag: m[1] } : null;
          }},
        { key: 'streak_days',
          test: function(s) {
              var m = s.match(/^(\d+)[- ]day streak[^.]*\.?$/i);
              return m ? { n: m[1], s: '' } : null;
          }},
        { key: 'streak_day',
          test: function(s) {
              var m = s.match(/^Day (\d+) of your streak\.?$/);
              return m ? { n: m[1] } : null;
          }},
    ];

    function translateNarrativeSentence(sentence, l) {
        var trimmed = sentence.trim().replace(/\.$/, '');
        for (var i = 0; i < NARRATIVE_KEYS.length; i++) {
            var entry = NARRATIVE_KEYS[i];
            var vars = entry.test(trimmed + '.') || entry.test(trimmed);
            if (vars) {
                var translated = tr(entry.key, vars);
                if (translated && translated !== entry.key) return translated;
            }
        }
        /* Fall through to exact match */
        var exact = E[trimmed + '.'];
        if (exact && exact[l]) return exact[l];
        exact = E[trimmed];
        if (exact && exact[l]) return exact[l];
        return null;
    }

    function translateNarrativeText(text, l) {
        if (!text || !text.trim()) return text;
        /* Split on ". " followed by capital or known start chars */
        var parts = text.split(/\.\s+(?=[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ\u0410-\u042F\u0600-\u06FF0-9""])/);
        var changed = false;
        var result = parts.map(function(part, idx) {
            var clean = part.trim().replace(/\.$/, '');
            if (!clean) return part;
            var t = translateNarrativeSentence(clean, l);
            if (t && t !== clean) { changed = true; return t; }
            return part;
        });
        return changed ? result.join(' ') : text;
    }

    /* ═══════════════════════════════════════════════════════════════════
       §4  DOM SWEEP
    ═══════════════════════════════════════════════════════════════════ */
    var SKIP = {SCRIPT:1,STYLE:1,INPUT:1,TEXTAREA:1,SELECT:1,CANVAS:1,CODE:1,PRE:1,SVG:1};

    function sweepNode(root, l) {
        var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
            acceptNode: function(node) {
                var p = node.parentElement;
                if (!p || SKIP[p.tagName]) return NodeFilter.FILTER_REJECT;
                return NodeFilter.FILTER_ACCEPT;
            }
        }, false);
        var nodes = [];
        var n;
        while ((n = walker.nextNode())) nodes.push(n);
        nodes.forEach(function(node) {
            var raw = node.textContent;
            var text = raw.trim();
            if (!text || text.length < 2) return;

            /* 1. Exact match */
            if (E[text] && E[text][l]) {
                if (raw !== E[text][l]) node.textContent = E[text][l];
                return;
            }

            /* 2. Dynamic pattern */
            var dyn = translateDynamic(text, l);
            if (dyn && dyn !== text) { node.textContent = dyn; return; }

            /* 3. Narrative sentence splitting (for multi-sentence text nodes) */
            if (text.indexOf('. ') !== -1 && text.length > 40) {
                var nt = translateNarrativeText(text, l);
                if (nt && nt !== text) node.textContent = nt;
            }
        });
    }

    function sweep() {
        var l = loc();
        if (l === 'en') return;
        sweepNode(document.body, l);
    }

    /* ═══════════════════════════════════════════════════════════════════
       §5  buildDashboardNarrative RE-PATCH
       Override so individual sentences use window.__t (AURA_STRINGS).
    ═══════════════════════════════════════════════════════════════════ */
    function patchNarrative() {
        var orig = window.buildDashboardNarrative;
        if (typeof orig !== 'function' || orig._sweepV2) return;
        orig._sweepV2 = true;
        window.buildDashboardNarrative = function() {
            var result = orig.apply(this, arguments);
            var l = loc();
            if (l === 'en' || !result) return result;
            return translateNarrativeText(String(result), l);
        };
    }

    /* ═══════════════════════════════════════════════════════════════════
       §6  SECTION META PATCH (insight section headers)
    ═══════════════════════════════════════════════════════════════════ */
    function patchSectionMeta() {
        var l = loc();
        if (l === 'en' || !window.INSIGHT_SECTION_META) return;
        var meta = window.INSIGHT_SECTION_META;
        var map = {
            sleep:     ['SLEEP INSIGHTS',     'Sleep Insights',          'Patterns between sleep timing, duration, fragmentation, and mood.'],
            activity:  ['ACTIVITY INSIGHTS',  'Activity Insights',       'Activities and daily energy patterns that appear linked to mood.'],
            tags:      ['TAG INSIGHTS',        'Tag Insights',            'Recurring tags that appear associated with shifts in mood.'],
            stability: ['MOOD STABILITY INSIGHTS','Mood Stability Insights','Mood variance and emotional consistency.']
        };
        Object.keys(map).forEach(function(k) {
            if (!meta[k]) return;
            var m = map[k];
            if (E[m[0]] && E[m[0]][l]) meta[k].eyebrow = E[m[0]][l];
            if (E[m[1]] && E[m[1]][l]) meta[k].title   = E[m[1]][l];
            if (E[m[2]] && E[m[2]][l]) meta[k].desc    = E[m[2]][l];
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       §7  MutationObserver — re-sweep when content changes
    ═══════════════════════════════════════════════════════════════════ */
    var sweepTimer = null;
    function scheduleSweep() {
        if (sweepTimer) return;
        sweepTimer = setTimeout(function() {
            sweepTimer = null;
            var l = loc();
            if (l !== 'en') sweep();
        }, 80);
    }

    function startObserver() {
        var l = loc();
        if (l === 'en') return;
        var obs = new MutationObserver(function(mutations) {
            var relevant = mutations.some(function(m) {
                if (m.addedNodes.length) return true;
                if (m.type === 'characterData') return true;
                return false;
            });
            if (relevant) scheduleSweep();
        });
        obs.observe(document.body, { childList: true, subtree: true, characterData: false });
        window._i18nObserver = obs;
    }

    /* ═══════════════════════════════════════════════════════════════════
       §8  WIRING
    ═══════════════════════════════════════════════════════════════════ */
    function run() {
        patchNarrative();
        patchSectionMeta();
        sweep();
    }

    function boot() {
        setTimeout(run, 800);
        startObserver();

        var origNav = window.navigate;
        if (typeof origNav === 'function' && !origNav._sweepV2) {
            window.navigate = function() {
                var r = origNav.apply(this, arguments);
                setTimeout(run, 500);
                setTimeout(run, 1500);
                return r;
            };
            window.navigate._sweepV2 = true;
        }

        var origSave = window.savePreference;
        if (typeof origSave === 'function' && !origSave._sweepV2) {
            window.savePreference = function(key, value) {
                var r = origSave.apply(this, arguments);
                if (key === 'locale') {
                    /* Restart observer for new locale */
                    if (window._i18nObserver) { window._i18nObserver.disconnect(); }
                    setTimeout(function() { run(); startObserver(); }, 900);
                    setTimeout(run, 1800);
                }
                return r;
            };
            origSave._sweepV2 = true;
        }
    }

    if (document.readyState !== 'loading' && window.navigate) {
        setTimeout(boot, 150);
    } else {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(boot, 250); });
    }

    window.i18nSweep = run;
    console.log('[Aura i18n Sweep v2] Full dynamic content sweeper loaded.');
})();
