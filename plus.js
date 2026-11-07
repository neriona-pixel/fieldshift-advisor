/* FieldShift Advisor – PLUS layer: EN/FR/AR, dark mode, farm helper chatbot, own-words priorities,
   equipment, risk meters + risk calendar + risk map. Load AFTER the main script: <script src="plus.js"></script> */
(() => {
"use strict";
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const LS = (k, v) => { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} };
let lang = LS("fs-lang") || "en", dark = LS("fs-theme") === "dark";
const LI = () => ["en", "fr", "ar"].indexOf(lang);
const tr = (a, b, c) => [a, b, c][LI()];
const T = (a, b, c) => `<span data-t="${[a, b, c].join("¦")}">${a}</span>`;
const cl = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const ok = () => typeof climate !== "undefined" && !!climate;
const hue = v => `hsl(${120 - 110 * v} 55% 42%)`;
const lv = v => v < .34 ? tr("Low", "Faible", "منخفض") : v < .67 ? tr("Medium", "Moyen", "متوسط") : tr("High", "Élevé", "مرتفع");

/* ---------- CSS ---------- */
const css = document.createElement("style");
css.textContent = `
.hdr-tools{display:flex;gap:8px;align-items:center}
.hdr-tools select,.hdr-tools button{width:auto;margin:0;padding:7px 12px;font-size:13px;border-radius:18px;border:1px solid rgba(255,255,255,.55);background:transparent;color:#fff;cursor:pointer}
.hdr-tools option{color:#000}
textarea{width:100%;padding:10px;border:1px solid #bdc9bd;border-radius:7px;background:var(--panel);color:var(--text);font:14px Arial,Tahoma,sans-serif}
.fs-chk{font-weight:400!important;display:flex!important;gap:8px;align-items:center;margin:7px 0!important}
.fs-sum{border-inline-start:6px solid var(--green2)}.fs-sum p{font-size:16px;line-height:1.7}
.fs-sum button,#fsApply{width:auto;padding:8px 14px;font-size:13px}
.fs-g{display:grid;grid-template-columns:120px 1fr 70px;gap:4px 10px;align-items:center;margin:11px 0}
.fs-g small{grid-column:1/-1;color:var(--muted);font-size:12px}
.fs-bar{height:13px;background:var(--line);border-radius:7px;overflow:hidden}.fs-bar i{display:block;height:100%;border-radius:7px}
.fs-cal{display:grid;grid-template-columns:75px repeat(12,minmax(34px,1fr));gap:3px;font-size:11px;text-align:center;min-width:560px}
.fs-cal b{align-self:center;text-align:start}.fs-cal i{display:block;height:24px;border-radius:4px}
#fsBot{position:fixed;inset-inline-end:18px;bottom:18px;z-index:2000;font-family:Arial,Tahoma,sans-serif}
#fsBot button{width:auto;margin:0}
#fsFab{width:58px!important;height:58px;border-radius:50%;font-size:26px;padding:0;box-shadow:0 4px 14px rgba(0,0,0,.3)}
#fsBox{position:absolute;bottom:70px;inset-inline-end:0;width:min(350px,calc(100vw - 36px));height:min(480px,70vh);display:flex;flex-direction:column;background:var(--panel);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 30px rgba(0,0,0,.3);overflow:hidden}
#fsBox[hidden]{display:none}
.fs-head{background:var(--green2);color:#fff;padding:11px 14px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
.fs-head button{background:none;font-size:20px;padding:0 6px}
#fsMsgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.fs-m{max-width:88%;padding:9px 12px;border-radius:12px;font-size:14px;line-height:1.5;background:var(--green-light);color:var(--text)}
.fs-m.u{align-self:flex-end;background:var(--green2);color:#fff}
#fsChips{padding:0 10px 6px;display:flex;flex-wrap:wrap;gap:5px}
#fsChips button{font-size:12px;padding:5px 9px;border-radius:14px;background:var(--green-light);color:var(--green);border:1px solid var(--line)}
.fs-in{display:flex;gap:6px;padding:9px;border-top:1px solid var(--line)}
.fs-in input{flex:1;min-width:0;padding:9px;border:1px solid var(--line);border-radius:8px;background:var(--panel);color:var(--text);font-size:14px}
html[dir=rtl] .strategy ul{padding-right:18px;padding-left:0}
html[dir=rtl] body{font-family:Tahoma,Arial,sans-serif}
[data-theme=dark]{--bg:#0f1511;--panel:#172019;--green:#8fd19a;--green2:#3f9a47;--green-light:#1f3324;--orange-light:#3a2a14;--text:#e6efe6;--muted:#b0bdb1;--line:#2b392d}
[data-theme=dark] header{background:#1b3a25}
[data-theme=dark] button{background:#2e7d32}
[data-theme=dark] .preset-row button.preset,[data-theme=dark] #fsChips button{background:var(--green-light);color:var(--green)}
[data-theme=dark] .hdr-tools button,[data-theme=dark] .hdr-tools select{background:transparent}
[data-theme=dark] .kpi,[data-theme=dark] .strategy,[data-theme=dark] .dash-box,[data-theme=dark] select,[data-theme=dark] textarea{background:#1b261d;color:var(--text);border-color:var(--line)}
[data-theme=dark] .strategy.best{background:#203526}
[data-theme=dark] .crop-pill,[data-theme=dark] .confidence{background:#24382a;color:#cfe8d3}
[data-theme=dark] .status{color:#d6ecd9}
[data-theme=dark] .status.error{background:#3d1b18;color:#ffb4ab}
[data-theme=dark] .status.warning{background:#3a2a14;color:#ffd7a8}
[data-theme=dark] .disclaimer{background:#2a2218;color:#e8d3b8}
[data-theme=dark] .scenario-result{color:var(--text)}
[data-theme=dark] .leaflet-tile-pane{filter:invert(1) hue-rotate(180deg) brightness(.85) contrast(.9)}`;
document.head.appendChild(css);

/* ---------- DICTIONARY (English ¦ Français ¦ العربية) for the original page ---------- */
const D = `Adapting farms with NASA data¦Adapter les fermes grâce aux données NASA¦تكييف المزارع بالاعتماد على بيانات ناسا
From climate data to smarter crop rotations¦Des données climatiques à de meilleures rotations¦من بيانات المناخ إلى دورات زراعية أذكى
1. Select a field¦1. Choisir un champ¦1. اختر حقلك
2. Farm context¦2. Votre exploitation¦2. وضع مزرعتك
3. Your priorities¦3. Vos priorités¦3. أولوياتك
4. Climate insights from NASA POWER¦4. Le climat vu par NASA POWER¦4. المناخ حسب ناسا
5. Compare four rotation strategies¦5. Comparer quatre rotations¦5. قارن أربع دورات زراعية
5b. Decision dashboard¦5b. Tableau de décision¦5ب. لوحة القرار
6. Bare-soil exposure through the year¦6. Sol nu au fil de l’année¦6. التربة العارية خلال السنة
7. Climate scenario explorer¦7. Simulateur de climat¦7. محاكاة تغيّر المناخ
8. Data glossary¦8. Glossaire¦8. شرح المصطلحات
Current crop¦Culture actuelle¦المحصول الحالي
Soil type¦Type de sol¦نوع التربة
Irrigation availability¦Eau d’irrigation disponible¦توفر ماء الري
Loam¦Limoneux¦تربة لومية
Sandy soil¦Sol sableux¦تربة رملية
Clay soil¦Sol argileux¦تربة طينية
Limited¦Limitée¦قليل
Moderate¦Moyenne¦متوسط
Abundant¦Abondante¦وفير
Water saving¦Économie d’eau¦توفير الماء
Income¦Revenu¦الدخل
Nitrogen fixation¦Fixation d’azote¦تثبيت النيتروجين
Erosion control¦Contrôle de l’érosion¦مقاومة التعرية
Soil organic matter¦Matière organique du sol¦المادة العضوية في التربة
Forage production¦Production de fourrage¦إنتاج العلف
Compare crop rotations¦Comparer les rotations¦قارن الدورات
Average annual precipitation¦Pluie annuelle moyenne¦معدل المطر السنوي
mm / year¦mm / an¦ملم / سنة
Hot days¦Jours très chauds¦أيام شديدة الحرارة
Frost days¦Jours de gel¦أيام الصقيع
Frost-free season¦Saison sans gel¦موسم بلا صقيع
Typical frost dates¦Dates habituelles de gel¦مواعيد الصقيع المعتادة
Root-zone wetness¦Humidité au niveau des racines¦رطوبة منطقة الجذور
Monthly precipitation¦Pluie par mois¦المطر الشهري
Monthly temperature¦Température par mois¦الحرارة الشهرية
Annual heat and frost days¦Jours de chaleur et de gel par an¦أيام الحر والصقيع كل سنة
Compare rotations¦Comparer les rotations¦مقارنة الدورات
Reveal trade-offs¦Voir les compromis¦كشف المفاضلات
Understand risk¦Comprendre le risque¦فهم المخاطر
Make uncertainty visible¦Rendre l’incertitude visible¦إظهار عدم اليقين
Four-year rotation¦Rotation sur 4 ans¦دورة من 4 سنوات
NASA climate evidence¦Preuves climatiques NASA¦أدلة المناخ من ناسا
Potential benefits¦Avantages possibles¦الفوائد المحتملة
Gaps and local risks¦Lacunes et risques locaux¦نقص المعلومات والمخاطر المحلية
Year-by-year robustness¦Solidité année par année¦الثبات من سنة لأخرى
Highest relative score¦Meilleur score relatif¦أعلى نقطة نسبية
Reference rotation (existing practice)¦Rotation de référence (pratique actuelle)¦الدورة المرجعية (ممارستك الحالية)
Potential bare soil¦Sol possiblement nu¦تربة قد تكون عارية
Potentially bare¦Peut-être nu¦قد تكون عارية
Covered soil¦Sol couvert¦تربة مغطاة
Covered¦Couvert¦مغطاة
Temperature change¦Variation de température¦تغير الحرارة
Precipitation change¦Variation de pluie¦تغير المطر
Hypothetical climate conditions¦Conditions climatiques hypothétiques¦ظروف مناخية افتراضية
Decision-support prototype — not an agronomic prescription.¦Outil d’aide à la décision — pas une ordonnance agronomique.¦أداة مساعدة على القرار — وليست وصفة زراعية.
Year ¦An ¦السنة 
Alfalfa¦Luzerne¦البرسيم الحجازي
Barley¦Orge¦الشعير
Winter wheat¦Blé d’hiver¦القمح الشتوي
Oats¦Avoine¦الشوفان
Triticale forage¦Triticale fourrager¦التريتيكال العلفي
Silage corn¦Maïs ensilage¦ذرة السيلاج
Sorghum¦Sorgho¦الذرة الرفيعة
Soybean¦Soja¦فول الصويا
Forage pea¦Pois fourrager¦البازلاء العلفية
Safflower¦Carthame¦القرطم
Sunflower¦Tournesol¦عباد الشمس
Rye cover crop¦Seigle couvert¦الجاودار (تغطية)
Hairy vetch cover crop¦Vesce velue couvert¦البيقية (تغطية)
Water-efficient rotation¦Rotation économe en eau¦دورة موفرة للماء
Soil-health rotation¦Rotation santé du sol¦دورة لصحة التربة
Income and forage rotation¦Rotation revenu et fourrage¦دورة للدخل والعلف
Continuous alfalfa¦Luzerne en continu¦برسيم متواصل`.split("\n").map(l => l.split("¦"));
D.push(
["heat stress","stress thermique","إجهاد حراري"],["winter frost","gel d’hiver","صقيع الشتاء"],["water stress","stress hydrique","إجهاد مائي"],
["short frost-free season","saison sans gel courte","موسم بلا صقيع قصير"],["high water demand vs low rainfall","forte demande en eau et peu de pluie","حاجة كبيرة للماء مع مطر قليل"],
["thin margin","marge faible","هامش ضيق"],["short by","il manque","ينقص"],["low water demand","consommer peu d’eau","استهلاك ماء قليل"],
["soil health","la santé du sol","صحة التربة"],["income and forage","le revenu et le fourrage","الدخل والعلف"],
["GWETROOT","Humidité du sol","رطوبة التربة","Soil wetness"],["Precipitation (mm)","Pluie (mm)","المطر (ملم)"],
["Maximum temperature (°C)","Température max (°C)","أعلى حرارة (°م)"],["Hot days >35°C","Jours > 35 °C","أيام فوق 35°"],["Frost days <0°C","Jours < 0 °C","أيام تحت 0°"],
["Median score","Score médian","النقطة الوسطى"],["Score range (min–max)","Écart des scores (min–max)","مدى النقاط (أدنى–أعلى)"],["· median","· médiane","· الوسيط"],
["Nitrogen","Azote","النيتروجين"],["Organic matter","Matière organique","المادة العضوية"],["Forage","Fourrage","العلف"],["Climate resilience","Résistance au climat","تحمل المناخ"],
["Waiting for climate data...","En attente des données…","في انتظار البيانات…"],["Building rotations...","Préparation des rotations…","جارٍ إعداد الدورات…"],
["/ 100 (median)","/ 100 (médiane)","/ 100 (الوسيط)"]);
D.sort((a, b) => b[0].length - a[0].length);

/* Sentence patterns: [regex, French, Arabic, English-simplified]. $n = raw group, @n = translated group. null = keep English. */
const mon = x => new Date(2021, "JanFebMarAprMayJunJulAugSepOctNovDec".indexOf(x) / 3, 1).toLocaleDateString(lang, { month: "short" });
const P = [
[/^Explore climate conditions at$/, "Explorez le climat de", "اكتشف مناخ"],
[/^, and compare crop rotations[\s\S]*$/, ", et comparez les rotations proposées pour cet endroit et votre culture actuelle.", "، وقارن الدورات الزراعية المقترحة لهذا المكان ولمحصولك الحالي."],
[/^Click anywhere on the map[\s\S]*$/, "Touchez la carte ou choisissez un lieu pour charger 10 ans de météo à cet endroit. La zone couverte est large (environ 50 km) : comparez avec votre propre champ.", "المس الخريطة أو اختر مكانا لتحميل 10 سنوات من الطقس هناك. المنطقة واسعة (نحو 50 كم) فقارنها بحقلك.", "Tap the map, or pick a place, to load the last 10 years of weather there. It covers a wide area (about 50 km), so compare it with your own field."],
[/^Selected location: (.*)$/, "Lieu choisi : $1", "المكان المختار: $1"],
[/^Demo field — (.*)$/, "Champ de démonstration — $1", "حقل تجريبي — $1"],
[/^Field: (.*)$/, "Champ : $1", "الحقل: $1"],
[/^Your current crop becomes year 1[\s\S]*$/, "Votre culture actuelle est l’année 1 de chaque rotation proposée. « Même culture chaque année » sert de référence (votre pratique actuelle). Les propositions se recalculent quand vous changez le lieu, la culture, le sol, l’eau ou le climat.", "محصولك الحالي هو السنة الأولى في كل دورة مقترحة، و«نفس المحصول كل سنة» هو المرجع (ممارستك الحالية). تُحسب الاقتراحات من جديد عند تغيير المكان أو المحصول أو التربة أو الماء أو المناخ."],
[/^Adjust the importance of each objective[\s\S]*$/, "Réglez l’importance de chaque objectif de 1 à 5. Cela classe les rotations.", "حدد أهمية كل هدف من 1 إلى 5. وعلى أساسها تُرتب الدورات."],
[/^Relative scores combine[\s\S]*$/, "Les notes comparent les rotations selon vos priorités et le climat des 10 dernières années. Ce ne sont pas des rendements prévus ni des gains garantis.", "النقاط تقارن الدورات حسب أولوياتك ومناخ آخر 10 سنوات. ليست محاصيل متوقعة ولا أرباحا مضمونة.", "Scores compare the rotations using your priorities and the weather of the last 10 years. They are not predicted harvests or guaranteed profit."],
[/^Four views of the same comparison[\s\S]*$/, "Quatre façons de voir la même comparaison. Ce sont des scores relatifs, pas des rendements prévus.", "أربع طرق لرؤية المقارنة نفسها. هي نقاط نسبية وليست محاصيل متوقعة.", "Four ways to look at the same comparison. These are relative scores, not predicted harvests."],
[/^MODULE 0(\d)$/, "ÉTAPE $1", "الوحدة $1"],
[/^Median relative score over[\s\S]*$/, "Score médian sur les 10 dernières années.", "النقطة الوسطى خلال آخر 10 سنوات.", "Middle score over the last 10 years."],
[/^Average crop ratings per rotation[\s\S]*$/, "Qualités moyennes de chaque rotation (0 à 5). Aucune ne gagne partout.", "متوسط صفات كل دورة (من 0 إلى 5). لا توجد دورة تتفوق في كل شيء."],
[/^Lowest to highest yearly score[\s\S]*$/, "Du pire au meilleur score selon les années. Une barre longue = résultat qui dépend beaucoup de la météo.", "من أدنى إلى أعلى نقطة حسب السنوات. الشريط الطويل يعني أن النتيجة تتأثر كثيرا بالطقس."],
[/^Orange = weaker year, green = stronger year\. Weakest year for the top-ranked rotation \((\w)\): (\d+), score ([\d.]+), with (\d+) hot days, (\d+) frost days and a (\d+)-day frost-free season\.$/, "Orange = année plus faible, vert = année plus forte. Année la plus difficile pour la rotation n°1 ($1) : $2, score $3, avec $4 jours très chauds, $5 jours de gel et $6 jours sans gel.", "البرتقالي = سنة أضعف، والأخضر = سنة أقوى. أصعب سنة للدورة الأولى ($1): $2، النقطة $3، مع $4 يوما شديد الحرارة و$5 يوم صقيع و$6 يوما بلا صقيع."],
[/^Average monthly accumulated precipitation[\s\S]*$/, "Pluie moyenne de chaque mois (mm).", "متوسط المطر في كل شهر (ملم)."],
[/^GWETROOT is a relative soil wetness[\s\S]*$/, "Humidité du sol autour des racines. C’est une estimation, pas une mesure dans votre champ.", "رطوبة التربة حول الجذور. هذا تقدير وليس قياسا في حقلك.", "How wet the soil is around the roots. It is an estimate, not a measurement in your field."],
[/^Monthly average of daily maximum[\s\S]*$/, "Température maximale moyenne de chaque mois (°C).", "متوسط أعلى حرارة في اليوم لكل شهر (°م)."],
[/^Annual number of days above[\s\S]*$/, "Nombre de jours très chauds et de jours de gel chaque année.", "عدد الأيام الشديدة الحرارة وأيام الصقيع كل سنة.", "Number of very hot days and freezing days each year."],
[/^T2M_MAX above 35°C \/ year$/, "jours > 35 °C par an", "يوما فوق 35° في السنة", "days above 35°C per year"],
[/^T2M_MIN below 0°C \/ year$/, "jours < 0 °C par an", "يوما تحت 0° في السنة", "days below 0°C per year"],
[/^days between last and first frost$/, "jours entre le dernier et le premier gel", "أيام بين آخر وأول صقيع"],
[/^last spring → first autumn \(median\)$/, "dernier gel du printemps → premier gel d’automne", "آخر صقيع ربيعي ← أول صقيع خريفي", "last spring frost → first autumn frost"],
[/^GWETROOT indicator$/, "0 = sec, 1 = humide", "0 = جاف، 1 = رطب", "0 = dry, 1 = wet"],
[/^4\. Climate insights from NASA POWER$/, "4. Le climat chez vous", "4. مناخ منطقتك", "4. Your local climate"],
[/^NASA climate evidence$/, "Faits sur le climat", "حقائق عن المناخ", "Climate facts"],
[/^Decision-support prototype — not an agronomic prescription\.$/, "Outil d’aide à la décision — pas une ordonnance agronomique.", "أداة مساعدة على القرار — وليست وصفة زراعية.", "A helper for your decisions — not a farming prescription."],
[/^NASA POWER climate data are useful[\s\S]*$/, "Ce sont des estimations pour une grande zone. Elles ne remplacent ni vos analyses de sol, ni vos relevés d’eau, ni les conseils d’un expert local. Vérifiez toujours sur place avant de décider.", "هذه تقديرات لمنطقة واسعة، ولا تغني عن تحليل تربتك وسجلات مياهك ونصيحة خبير محلي. تحقق دائما على الأرض قبل أن تقرر.", "These are estimates for a wide area. They do not replace your soil tests, your water records or advice from a local expert. Always check on the ground before you decide."],
[/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/, m => mon(m[1]), m => mon(m[1])],
[/^Illustrative calendar for a cover-management[\s\S]*$/, "Calendrier d’exemple pour la gestion du couvert du sol. C’est un exemple de planification, pas une mesure réelle.", "تقويم توضيحي لإدارة تغطية التربة. هو مثال للتخطيط وليس قياسا فعليا."],
[/^Explore a hypothetical change[\s\S]*$/, "Imaginez un changement de température et de pluie. Les rotations, les scores et le tableau se mettent à jour. C’est un exercice, pas une prévision du climat.", "تخيل تغيرا في الحرارة والمطر. تتحدث الدورات والنقاط واللوحة معه. هذا تمرين وليس توقعا للمناخ."],
[/^Annual precipitation: (\d+) mm\/year \((.*)\)$/, "Pluie annuelle : $1 mm/an ($2)", "المطر السنوي: $1 ملم/سنة ($2)"],
[/^Temperature shift: (.*)$/, "Variation de température : $1", "تغير الحرارة: $1"],
[/^Hot days above 35°C: (\d+) days\/year · Frost days: (\d+) days\/year · Frost-free season: (\d+) days$/, "Jours > 35 °C : $1/an · Jours de gel : $2/an · Saison sans gel : $3 jours", "أيام فوق 35°: $1 في السنة · أيام الصقيع: $2 في السنة · موسم بلا صقيع: $3 يوما"],
[/^The generated rotations, scores and dashboard above[\s\S]*$/, "Les rotations, scores et tableaux ci-dessus sont recalculés avec ces conditions. C’est un exercice de sensibilité : il ne prédit ni les rendements ni la météo future.", "تُعاد الدورات والنقاط واللوحات أعلاه بهذه الظروف. هذا تمرين حساسية: لا يتوقع المحاصيل ولا الطقس المستقبلي."],
[/^Best candidate for low water demand[\s\S]*$/, "La meilleure option ici pour consommer peu d’eau et résister à la sécheresse.", "أفضل خيار هنا لاستهلاك ماء قليل وتحمل الجفاف."],
[/^Best candidate for nitrogen, erosion[\s\S]*$/, "La meilleure option ici pour l’azote, contre l’érosion et pour la matière organique.", "أفضل خيار هنا للنيتروجين ومقاومة التعرية والمادة العضوية."],
[/^Best candidate for revenue and forage[\s\S]*$/, "La meilleure option ici pour le revenu et le fourrage.", "أفضل خيار هنا للدخل وإنتاج العلف."],
[/^Baseline: the current crop every year[\s\S]*$/, "Référence : la culture actuelle chaque année (votre pratique), notée comme les autres.", "المرجع: المحصول الحالي كل سنة (ممارستك)، ويُقيَّم مثل الباقي."],
[/^Why it is here: it is your existing practice[\s\S]*$/, "Pourquoi : c’est votre pratique actuelle ; toutes les autres sont comparées à elle.", "لماذا هنا: هي ممارستك الحالية، وتقارن بها كل الدورات الأخرى."],
[/^Why it was suggested: best of (\d+) candidate rotations for (.*), using only crops that fit this site.s frost-free season\.$/, "Pourquoi suggérée : la meilleure de $1 rotations testées pour @2, avec seulement des cultures adaptées à la saison sans gel d’ici.", "سبب الاقتراح: الأفضل بين $1 دورة جُرّبت من أجل @2، باستعمال محاصيل تناسب موسم ما بلا صقيع هنا فقط."],
[/^([A-D]\. )?Continuous (.+)$/, "$1@2 en continu", "$1@2 متواصل"],
[/^Beats continuous (.+) in (\d+) of (\d+) years$/, "Fait mieux que @1 en continu $2 années sur $3", "تتفوق على @1 المتواصل في $2 من $3 سنوات"],
[/^Score range (\d+)–(\d+):\s*([\d.]+)–([\d.]+)$/, "Scores de $1 à $2 : de $3 à $4", "النقاط من $1 إلى $2: من $3 إلى $4"],
[/^(\d+) hot days \(>35°C\), (\d+) frost days and a (\d+)-day frost-free season per year in this scenario$/, "$1 jours très chauds (> 35 °C), $2 jours de gel et une saison sans gel de $3 jours par an", "$1 يوما شديد الحرارة (فوق 35°) و$2 يوم صقيع وموسم بلا صقيع من $3 يوما في السنة"],
[/^No crop in this rotation is strongly climate-exposed here$/, "Aucune culture de cette rotation n’est fortement exposée au climat ici", "لا يوجد محصول في هذه الدورة معرض بشدة للمناخ هنا"],
[/^Most climate-exposed crop: (.+) \((.+), −([\d.]+) pts\)$/, "Culture la plus exposée : @1 (@2, −$3 pts)", "أكثر محصول تعرضا: @1 (@2، −$3 نقطة)"],
[/^Average annual precipitation: (\d+) mm$/, "Pluie annuelle moyenne : $1 mm", "متوسط المطر السنوي: $1 ملم"],
[/^Simplest to manage[\s\S]*$/, "Plus simple à gérer : une culture, un calendrier, un seul matériel", "الأسهل إدارة: محصول واحد وجدول واحد ومعدات واحدة"],
[/^Nitrogen-fixing legume in the sequence: (.+)$/, "Légumineuse fixatrice d’azote dans la séquence : @1", "بقوليات تثبت النيتروجين في الدورة: @1"],
[/^Cover-crop phase \((.+)\) protects soil between cash crops$/, "Phase de couvert (@1) : protège le sol entre les cultures de vente", "مرحلة محصول تغطية (@1) تحمي التربة بين المحاصيل الرئيسية"],
[/^(\d+) crop families help break pest and disease cycles$/, "$1 familles de cultures aident à casser les cycles de parasites et de maladies", "$1 عائلات من المحاصيل تساعد على قطع دورات الآفات والأمراض"],
[/^Lower average water-demand rating than the baseline \(([\d.]+) vs ([\d.]+), scale 1–5\)$/, "Besoin en eau moyen plus faible que la référence ($1 contre $2, échelle 1–5)", "حاجة أقل للماء من المرجع ($1 مقابل $2 على مقياس 1–5)"],
[/^Drought-tolerant crops: (.+)$/, "Cultures tolérantes à la sécheresse : @1", "محاصيل تتحمل الجفاف: @1"],
[/^Higher average income rating than the baseline \(([\d.]+) vs ([\d.]+)\)$/, "Revenu moyen plus élevé que la référence ($1 contre $2)", "دخل أعلى من المرجع ($1 مقابل $2)"],
[/^Strong forage production potential$/, "Bon potentiel de production de fourrage", "إمكانية جيدة لإنتاج العلف"],
[/^Good erosion control[\s\S]*$/, "Bon contrôle de l’érosion (note moyenne d’au moins 4 sur 5)", "مقاومة جيدة للتعرية (المتوسط 4 من 5 أو أكثر)"],
[/^Diversifies the crop sequence[\s\S]*$/, "Diversifie la succession de cultures par rapport à la référence", "ينوّع تتابع المحاصيل مقارنة بالمرجع"],
[/^Same crop every year[\s\S]*$/, "Même culture chaque année : le risque de parasites, de maladies et d’appauvrissement du sol augmente", "نفس المحصول كل سنة: تزداد مخاطر الآفات والأمراض واستنزاف التربة"],
[/^(.+) needs about (\d+) frost-free days; this site averages (\d+) \((.+)\)$/, "@1 demande environ $2 jours sans gel ; ici en moyenne $3 (@4)", "@1 يحتاج نحو $2 يوما بلا صقيع؛ هنا المتوسط $3 (@4)"],
[/^(.+) demand a lot of water in a dry climate \((\d+) mm\/year\): check irrigation rights and supply$/, "@1 demandent beaucoup d’eau en climat sec ($2 mm/an) : vérifiez vos droits d’eau et l’approvisionnement", "@1 تحتاج ماء كثيرا في مناخ جاف ($2 ملم/سنة): تحقق من حقوق الري والإمداد"],
[/^(.+) is heat-sensitive and this site averages (\d+) hot days per year$/, "@1 supporte mal la chaleur et ici il y a en moyenne $2 jours très chauds par an", "@1 حساس للحرارة وهنا في المتوسط $2 يوما شديد الحرارة في السنة"],
[/^Local market and equipment for (.+) should be verified$/, "Vérifiez le marché local et le matériel pour @1", "تحقق من السوق المحلي والمعدات لـ @1"],
[/^Crop timing, soil tests and water rights need local validation$/, "Calendrier des cultures, analyses de sol et droits d’eau : à valider sur place", "مواعيد الزراعة وتحاليل التربة وحقوق الماء تحتاج تأكيدا محليا"],
[/^Indicative: relatively stable$/, "Indicatif : plutôt stable", "تقديري: مستقر نسبيا"],
[/^Indicative: moderate variability$/, "Indicatif : variabilité moyenne", "تقديري: تقلب متوسط"],
[/^Indicative: high variability$/, "Indicatif : forte variabilité", "تقديري: تقلب كبير"],
[/^Climate data loaded successfully · (\d+) years.*$/, "Données météo prêtes ($1 ans d’historique).", "بيانات الطقس جاهزة ($1 سنوات من السجل)."],
[/^NASA POWER data loaded · (.*) · (\d+) years.*$/, "Données météo prêtes pour $1 ($2 ans d’historique).", "بيانات الطقس جاهزة لـ $1 ($2 سنوات من السجل)."],
[/^Fetching 10 years of NASA POWER data for (.*)…$/, "Chargement de 10 ans de météo pour $1…", "جارٍ تحميل 10 سنوات من الطقس لـ $1…", "Loading 10 years of weather for $1…"],
[/^Could not load NASA POWER data for this point[\s\S]*Still showing (.*)\.$/, "Impossible de charger la météo de ce point. On garde $1.", "تعذر تحميل طقس هذه النقطة. نبقي على $1.", "Could not load the weather for this point. Still showing $1."],
[/^Unable to load climate data[\s\S]*$/, "Impossible de charger les données météo. Vérifiez votre connexion.", "تعذر تحميل بيانات الطقس. تحقق من الاتصال بالإنترنت.", "Could not load the weather data. Check your internet connection."]
];
const trl = x => x.split(", ").map(y => { let t = trs(y); if (t === y) { t = trs(y[0].toUpperCase() + y.slice(1)); if (lang === "fr") t = t.toLowerCase(); } return t; }).join(lang === "ar" ? "، " : ", ");
function trs(s) {
  const t = s.trim();
  if (!t) return s;
  const lead = s.slice(0, s.indexOf(t)), trail = s.slice(lead.length + t.length), K = lang === "fr" ? 1 : lang === "ar" ? 2 : 3;
  let out;
  for (const p of P) {
    const m = t.match(p[0]), tp = p[K];
    if (m && tp != null) { out = typeof tp === "function" ? tp(m) : tp.replace(/([$@])(\d)/g, (x, k, n) => k === "@" ? trl(m[n] || "") : (m[n] || "")); break; }
  }
  if (out === undefined) {
    out = t;
    for (const d of D) { const to = d[K]; if (to != null && out.includes(d[0])) out = out.split(d[0]).join(to); }
  }
  return lead + out + trail;
}

/* Build note, rewritten in plain words (no technical numbers) */
window.renderBuildNote = function (built, settings, mean) {
  const el = $("#buildNote"), cur = crops[settings.current], ff = Math.round(mean.frostFree), n = c => trs(c.name);
  let h = tr(`Starting from your current crop (${n(cur)}), I tried ${built.evaluated} rotations using only crops that can grow in a season of about ${ff} frost-free days, and kept the best one for each goal.`,
    `En partant de votre culture actuelle (${n(cur)}), j’ai essayé ${built.evaluated} rotations avec seulement des cultures qui peuvent pousser pendant environ ${ff} jours sans gel, et gardé la meilleure pour chaque objectif.`,
    `انطلاقا من محصولك الحالي (${n(cur)}) جرّبت ${built.evaluated} دورة باستعمال محاصيل تنمو في موسم من نحو ${ff} يوما بلا صقيع فقط، وأبقيت الأفضل لكل هدف.`);
  if (built.excluded.length) h += " " + tr("Left out here (season too short): ", "Écartées ici (saison trop courte) : ", "استُبعدت هنا (الموسم قصير): ") + built.excluded.map(k => n(crops[k])).join(tr(", ", ", ", "، ")) + ".";
  el.className = "status nt";
  if (cur.minFF > mean.frostFree) {
    h += " " + tr(`Warning: ${n(cur)} needs about ${cur.minFF} frost-free days but this place has about ${ff}. The baseline loses points for it.`, `Attention : ${n(cur)} demande environ ${cur.minFF} jours sans gel mais ici il y en a environ ${ff}. La référence perd des points.`, `تنبيه: ${n(cur)} يحتاج نحو ${cur.minFF} يوما بلا صقيع وهنا نحو ${ff} فقط. لذلك تخسر الدورة المرجعية نقاطا.`);
    el.className = "status warning nt";
  }
  el.textContent = h;
};

const store = new WeakMap();
function tx(n) {
  let s = store.get(n);
  if (!s || n.data !== s.out) { s = { src: n.data, out: n.data }; store.set(n, s); }
  const o = trs(s.src);
  s.out = o;
  if (n.data !== o) n.data = o;
}
function translate() {
  obs.disconnect();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    if (!n.data.trim()) continue;
    const p = n.parentElement;
    if (!p || p.closest("script,style,textarea,[data-t],.nt")) continue;
    tx(n);
  }
  $$("[data-t]").forEach(e => { e.textContent = e.dataset.t.split("¦")[LI()]; });
  $$("[data-ph]").forEach(e => { e.placeholder = e.dataset.ph.split("¦")[LI()]; });
  obs.observe(document.body, { childList: true, subtree: true, characterData: true });
}
let tm;
const obs = new MutationObserver(() => { clearTimeout(tm); tm = setTimeout(translate, 60); });

/* ---------- UI BUILD ---------- */
const EQ = [
  ["tractor", "Tractor", "Tracteur", "جرار"],
  ["drip", "Drip or sprinkler irrigation", "Irrigation goutte à goutte ou aspersion", "ري بالتنقيط أو بالرش"],
  ["combine", "Combine harvester (grain)", "Moissonneuse-batteuse (grain)", "حاصدة حبوب"],
  ["baler", "Baler or silage machine (forage)", "Presse à balles ou ensileuse (fourrage)", "آلة كبس أو سيلاج (علف)"],
  ["livestock", "I have animals (I can use forage)", "J’ai du bétail (j’utilise le fourrage)", "عندي ماشية (أستعمل العلف)"]
];
const NEED = { combine: ["wheat", "barley", "oats", "soybean", "safflower", "sunflower"], baler: ["alfalfa", "triticale", "sorghum", "corn", "pea"], drip: ["alfalfa", "corn", "soybean"] };
const eq = k => { const e = $("#eq_" + k); return !e || e.checked; };

function build() {
  const hdr = $(".header-inner");
  hdr.insertAdjacentHTML("beforeend", `<div class="hdr-tools"><select id="fsLang" aria-label="Language"><option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option></select><button id="fsTheme" aria-label="Theme">🌓</button></div>`);
  const Lc = $(".left-column"), R = $(".right-column");

  R.insertAdjacentHTML("afterbegin", `<section class="panel fs-sum"><h2>${T("In simple words", "En mots simples", "بكلمات بسيطة")}</h2><p id="fsSumTxt" class="nt"></p><button id="fsSpeak">🔊 ${T("Read aloud", "Lire à voix haute", "اقرأ بصوت عال")}</button></section>`);

  Lc.insertAdjacentHTML("beforeend", `<section class="panel"><h2>${T("My farm: my words, my tools", "Ma ferme : mes mots, mes outils", "مزرعتي: كلماتي ومعداتي")}</h2>
    <label for="fsWords">${T("Tell me what matters to you, in your own words", "Dites ce qui compte pour vous, avec vos mots", "اكتب ما يهمك بكلماتك")}</label>
    <textarea id="fsWords" rows="3" data-ph="Example: I have little water and I want to protect my soil¦Exemple : j’ai peu d’eau et je veux protéger mon sol¦مثال: عندي ماء قليل وأريد حماية تربتي"></textarea>
    <button id="fsApply">${T("Use my words", "Utiliser mes mots", "استعمل كلماتي")}</button>
    <div id="fsUnd" class="map-note nt"></div>
    <label>${T("Equipment I can use", "Matériel que je peux utiliser", "المعدات المتوفرة عندي")}</label>
    ${EQ.map(e => `<label class="fs-chk"><input type="checkbox" id="eq_${e[0]}" ${e[0] === "livestock" ? "" : "checked"}> ${T(e[1], e[2], e[3])}</label>`).join("")}
    <div id="fsEqNote" class="map-note nt"></div></section>`);

  $("#timeline").closest(".panel").insertAdjacentHTML("beforebegin", `<section class="panel"><h2>${T("Risks for my farm", "Les risques pour ma ferme", "المخاطر على مزرعتي")}</h2>
    <p class="map-note">${T("Green is low, orange is medium, red is high. The coloured circle on the map shows the overall risk at your field.", "Vert = faible, orange = moyen, rouge = élevé. Le cercle coloré sur la carte montre le risque global de votre champ.", "الأخضر منخفض والبرتقالي متوسط والأحمر مرتفع. الدائرة الملونة على الخريطة تبين الخطر العام في حقلك.")}</p>
    <div id="fsRisk" class="nt"></div>
    <h3 style="margin-top:18px">${T("Risk calendar: which months are dangerous?", "Calendrier des risques : quels mois sont dangereux ?", "تقويم المخاطر: أي الأشهر خطرة؟")}</h3>
    <div class="heat-wrap"><div id="fsCal" class="fs-cal nt"></div></div></section>`);

  $(".glossary").insertAdjacentHTML("beforebegin", `<section class="panel glossary"><h2>${T("NASA data in simple words", "Les données NASA en mots simples", "بيانات ناسا بكلمات بسيطة")}</h2>
    <details><summary>${T("Satellite or ground measurement?", "Satellite ou mesure au sol ?", "قمر صناعي أم قياس على الأرض؟")}</summary><p>${T("Satellites see a large area (here about 50 km wide) every day for many years. A rain gauge or soil probe in your field sees only one spot but is very exact. Using both together is best: NASA shows the big picture, you know your field.", "Les satellites voient une grande zone (ici environ 50 km) chaque jour pendant des années. Un pluviomètre ou une sonde dans votre champ voit un seul endroit mais très précisément. Le mieux est de combiner les deux : la NASA donne la vue d’ensemble, vous connaissez votre champ.", "الأقمار الصناعية ترى مساحة كبيرة (هنا نحو 50 كم) كل يوم ولسنوات. أما مقياس المطر أو مجس التربة في حقلك فيرى نقطة واحدة بدقة عالية. الأفضل الجمع بينهما: ناسا تعطي الصورة الكبيرة وأنت تعرف حقلك.")}</p></details>
    <details><summary>${T("More NASA data we can add next", "Autres données NASA à ajouter", "بيانات ناسا أخرى يمكن إضافتها")}</summary><p>${T("SMAP (soil moisture), GPM (rain), ECOSTRESS (plant heat stress), Landsat and MODIS (is the crop green and healthy? – NDVI), GRACE-FO (underground water), SRTM (slopes where soil washes away). They would all be resampled to one common grid so they can be combined.", "SMAP (humidité du sol), GPM (pluie), ECOSTRESS (stress thermique des plantes), Landsat et MODIS (la culture est-elle verte et saine ? – NDVI), GRACE-FO (eau souterraine), SRTM (pentes où le sol s’érode). Tout serait ramené sur une grille commune pour être combiné.", "SMAP (رطوبة التربة)، GPM (المطر)، ECOSTRESS (إجهاد النبات من الحرارة)، Landsat وMODIS (هل المحصول أخضر وسليم؟ NDVI)، GRACE-FO (المياه الجوفية)، SRTM (المنحدرات التي تجرف التربة). كلها تُوحَّد في شبكة واحدة ليسهل الجمع بينها.")}</p></details>
    <details><summary>${T("Where YOUR judgment matters most", "Là où VOTRE avis compte le plus", "أين يكون رأيك أنت الأهم")}</summary><p>${T("Water rights, local prices and buyers, your soil test, pests you already know, and your machines. The tool finds patterns; you and a local advisor decide.", "Droits d’eau, prix et acheteurs locaux, analyse de votre sol, parasites que vous connaissez, et vos machines. L’outil repère des tendances ; vous et un conseiller local décidez.", "حقوق المياه، الأسعار والمشترون محليا، تحليل تربتك، الآفات التي تعرفها، ومعداتك. الأداة تكشف الأنماط، وأنت ومرشد محلي تقرران.")}</p></details></section>`);

  document.body.insertAdjacentHTML("beforeend", `<div id="fsBot"><div id="fsBox" hidden><div class="fs-head"><span>🌾 ${T("Farm helper", "Assistant ferme", "مساعد المزرعة")}</span><button id="fsX">×</button></div><div id="fsMsgs" class="nt"></div><div id="fsChips" class="nt"></div><div class="fs-in"><input id="fsQ" data-ph="Ask me anything…¦Posez votre question…¦اسألني أي شيء…"><button id="fsSend">➤</button></div></div><button id="fsFab" aria-label="Chat">💬</button></div>`);
}

/* ---------- OWN-WORDS PRIORITIES ---------- */
const KW = {
  water: /water|drought|dry|eau|sécher|irrig|ماء|مياه|جفاف|ري/,
  income: /money|income|profit|market|revenu|argent|vend|دخل|مال|ربح|بيع/,
  nitrogen: /nitrogen|fertili|legum|azote|engrais|نيتروجين|سماد|بقول/,
  erosion: /erosion|wind|érosion|vent|تعرية|ريح|رياح/,
  organic: /organic|soil|humus|\bsol\b|matière|تربة|خصوبة/,
  forage: /forage|animal|livestock|cattle|fourrage|bétail|علف|ماشية|أبقار/
};
const KN = { water: ["water saving", "économie d’eau", "توفير الماء"], income: ["income", "revenu", "الدخل"], nitrogen: ["nitrogen", "azote", "النيتروجين"], erosion: ["erosion control", "contrôle de l’érosion", "مقاومة التعرية"], organic: ["soil health", "santé du sol", "صحة التربة"], forage: ["forage", "fourrage", "العلف"] };
function applyWords() {
  const q = $("#fsWords").value.toLowerCase(), hit = Object.keys(KW).filter(k => KW[k].test(q));
  const u = $("#fsUnd");
  if (!hit.length) { u.textContent = tr("I did not find a priority in your words. Try words like water, money, soil, animals, wind.", "Je n’ai pas trouvé de priorité. Essayez : eau, argent, sol, animaux, vent.", "لم أجد أولوية في كلامك. جرب كلمات مثل: ماء، مال، تربة، حيوانات، ريح."); return; }
  Object.keys(KW).forEach(k => { const el = $("#" + k + "Weight"); if (el) { el.value = hit.includes(k) ? 5 : 2; $("#" + k + "Value").textContent = el.value; } });
  $("#waterWeight").dispatchEvent(new Event("input"));
  u.textContent = tr("I understood: ", "J’ai compris : ", "فهمت: ") + hit.map(k => KN[k][LI()]).join(", ") + tr(" (set to maximum, the sliders above were updated).", " (mis au maximum, les curseurs ont été mis à jour).", " (وُضعت على الحد الأقصى وتم تحديث المؤشرات أعلاه).");
}

/* ---------- EQUIPMENT (changes the scores) ---------- */
function gap(rot) {
  let p = 0;
  rot.forEach(c => {
    if (!eq("tractor")) p += 2;
    for (const k in NEED) if (NEED[k].includes(c) && !eq(k)) p += 2.5;
  });
  return p / rot.length;
}
const _sc = window.scoreStrategy;
window.scoreStrategy = function (s, ctx, se, w) {
  let v = _sc(s, ctx, se, w);
  const cs = s.rotation.map(k => crops[k]);
  v -= gap(s.rotation);
  if ($("#eq_livestock") && $("#eq_livestock").checked) v += (cs.reduce((a, c) => a + c.forage, 0) / cs.length - 3) * .8;
  return cl(v, 0, 100);
};
function eqNote() {
  const miss = Object.keys(NEED).filter(k => !eq(k)), el = $("#fsEqNote");
  if (!ok() || !miss.length) { el.textContent = tr("All crops are possible with your equipment.", "Toutes les cultures sont possibles avec votre matériel.", "كل المحاصيل ممكنة بمعداتك."); return; }
  const names = [...new Set(miss.flatMap(k => NEED[k]))].map(k => crops[k].name);
  el.textContent = tr("Without some equipment, these crops lose points: ", "Sans certains équipements, ces cultures perdent des points : ", "بدون بعض المعدات تخسر هذه المحاصيل نقاطا: ") + names.join(", ") + ".";
}

/* ---------- RISK ---------- */
function rd() {
  if (!ok()) return null;
  const sc = getScenario(), m = meanContext(sc), r = climate.annualRainValues;
  const sd = Math.sqrt(r.reduce((s, v) => s + (v - climate.avgRain) ** 2, 0) / r.length);
  return [
    { n: tr("Heat", "Chaleur", "الحرارة"), v: cl(m.heat / 60), d: tr(`About ${Math.round(m.heat)} days a year pass 35°C. Very hot days can scorch leaves and cut yield.`, `Environ ${Math.round(m.heat)} jours par an dépassent 35 °C. Les jours très chauds brûlent les feuilles et réduisent le rendement.`, `نحو ${Math.round(m.heat)} يوما في السنة تتجاوز 35 درجة. الحر الشديد يحرق الأوراق ويقلل المحصول.`) },
    { n: tr("Frost", "Gel", "الصقيع"), v: cl(1 - m.frostFree / 240), d: tr(`Frost-free season: about ${Math.round(m.frostFree)} days. A short season is dangerous for crops that need long warm months.`, `Saison sans gel : environ ${Math.round(m.frostFree)} jours. Une saison courte est risquée pour les cultures qui ont besoin de longs mois chauds.`, `موسم بلا صقيع: نحو ${Math.round(m.frostFree)} يوما. الموسم القصير خطر على المحاصيل التي تحتاج أشهرا دافئة طويلة.`) },
    { n: tr("Dry spells", "Sécheresse", "الجفاف"), v: cl((1 - m.rain / 700) * (1 + sc.temp * .05)), d: tr(`Rain: about ${Math.round(m.rain)} mm a year. Little rain means water may run short for thirsty crops.`, `Pluie : environ ${Math.round(m.rain)} mm par an. Peu de pluie : l’eau peut manquer pour les cultures gourmandes.`, `المطر: نحو ${Math.round(m.rain)} ملم في السنة. المطر القليل يعني أن الماء قد ينقص للمحاصيل العطشى.`) },
    { n: tr("Rain swings", "Pluie irrégulière", "تقلب المطر"), v: cl(sd / (climate.avgRain || 1) / .6), d: tr("How much rain changes from one year to the next. Big swings make plans less certain.", "À quel point la pluie change d’une année à l’autre. De grands écarts rendent les plans moins sûrs.", "مقدار تغير المطر من سنة لأخرى. التقلب الكبير يجعل التخطيط أقل يقينا.") }
  ];
}
let rc;
function risk() {
  const g = rd(), box = $("#fsRisk"), cal = $("#fsCal");
  if (!g) return;
  const all = g.reduce((s, x) => s + x.v, 0) / g.length;
  box.innerHTML = `<div class="fs-g"><b>${tr("Overall", "Global", "الإجمالي")}</b><div class="fs-bar"><i style="width:${Math.max(4, all * 100)}%;background:${hue(all)}"></i></div><b>${lv(all)}</b></div>` +
    g.map(x => `<div class="fs-g"><b>${x.n}</b><div class="fs-bar"><i style="width:${Math.max(4, x.v * 100)}%;background:${hue(x.v)}"></i></div><b>${lv(x.v)}</b><small>${x.d}</small></div>`).join("");

  const sc = getScenario(), loc = ["en", "fr", "ar"][LI()];
  const mons = climate.monthlyRows.map((m, i) => ({
    name: new Date(2021, i, 1).toLocaleDateString(loc, { month: "short" }),
    h: cl((m.temperature + sc.temp - 28) / 12),
    c: cl((8 - (m.temperature + sc.temp)) / 16),
    d: cl(1 - m.rain * (1 + sc.rain / 100) / 45) * .6 + cl(1 - m.wetness) * .4
  }));
  const row = (lab, key) => `<b>${lab}</b>` + mons.map(m => `<i style="background:${hue(m[key])}" title="${m.name}: ${lv(m[key])}"></i>`).join("");
  cal.innerHTML = `<span></span>` + mons.map(m => `<span>${m.name}</span>`).join("") +
    row(tr("Heat", "Chaleur", "الحر"), "h") + row(tr("Cold", "Froid", "البرد"), "c") + row(tr("Dry", "Sec", "الجفاف"), "d");

  if (typeof L !== "undefined" && typeof map !== "undefined") {
    if (rc) rc.remove();
    rc = L.circle([currentPlace.lat, currentPlace.lon], { radius: 35000, color: hue(all), fillColor: hue(all), fillOpacity: .25, weight: 2 }).addTo(map)
      .bindTooltip(tr("Overall risk", "Risque global", "الخطر العام") + ": " + lv(all));
  }
}

/* ---------- SIMPLE SUMMARY ---------- */
function sum() {
  const el = $("#fsSumTxt");
  if (!ok()) { el.textContent = tr("Loading NASA data…", "Chargement des données NASA…", "جارٍ تحميل بيانات ناسا…"); return; }
  const m = meanContext(getScenario()), h = $(".strategy.best h3"), b = (h ? h.textContent : "").replace(/^[A-D]\.\s*/, "");
  const R = Math.round(m.rain), H = Math.round(m.heat), F = Math.round(m.frost);
  el.textContent = tr(
    `Your area gets about ${R} mm of rain a year, ${H} very hot days and ${F} freezing days. With what you told me, the choice to look at first is “${b}”. It is a suggestion to talk over with a local advisor, not an order: you know your land best.`,
    `Votre zone reçoit environ ${R} mm de pluie par an, ${H} jours très chauds et ${F} jours de gel. Selon ce que vous m’avez dit, le choix à regarder en premier est « ${b} ». C’est une suggestion à discuter avec un conseiller local, pas un ordre : vous connaissez mieux votre terre.`,
    `منطقتك تتلقى نحو ${R} ملم من المطر في السنة، و${H} يوما شديد الحرارة، و${F} يوما من الصقيع. حسب ما أخبرتني به، أول خيار تنظر فيه هو «${b}». هذا اقتراح تناقشه مع مرشد محلي وليس أمرا: أنت أعرف بأرضك.`);
}

/* ---------- CHATBOT ---------- */
function say(txt, who) {
  const m = document.createElement("div");
  m.className = "fs-m" + (who === "u" ? " u" : "");
  m.textContent = txt;
  $("#fsMsgs").appendChild(m);
  $("#fsMsgs").scrollTop = 1e6;
}
function bot(q0) {
  const q = " " + q0.toLowerCase() + " ", w = (...k) => k.some(x => q.includes(x));
  const m = ok() ? meanContext(getScenario()) : null;
  const h = $(".strategy.best h3"), best = (h ? h.textContent : "").replace(/^[A-D]\.\s*/, "");
  if (w(" hello", " hi ", "salut", "bonjour", "salam", "مرحبا", "سلام", "أهلا", "اهلا"))
    return tr("Hello! I’m your farm helper. Ask me about water, heat, frost, risks, or which rotation to try.", "Bonjour ! Je suis votre assistant. Posez-moi vos questions sur l’eau, la chaleur, le gel, les risques ou la rotation à essayer.", "مرحبا! أنا مساعدك في المزرعة. اسألني عن الماء أو الحرارة أو الصقيع أو المخاطر أو أي دورة زراعية تجرب.");
  if (w("cover", "couvert", "غطاء", "تغطية"))
    return tr("A cover crop (like rye or vetch) is planted between main crops to protect bare soil from wind and sun. Vetch also adds nitrogen to the soil, like free fertilizer.", "Un couvert végétal (seigle, vesce) est semé entre les cultures pour protéger le sol nu du vent et du soleil. La vesce apporte aussi de l’azote, comme un engrais gratuit.", "محصول التغطية (مثل الجاودار أو البيقية) يُزرع بين المحاصيل الرئيسية ليحمي التربة العارية من الريح والشمس. والبيقية تضيف النيتروجين للتربة كسماد مجاني.");
  if (w("wetness", "gwetroot", "humid", "رطوبة"))
    return tr("“Root-zone wetness” is NASA’s estimate of how wet the soil is where roots grow, from 0 (dry) to 1 (wet). It comes from a model, not from a probe in your field.", "L’« humidité des racines » est l’estimation de la NASA de l’humidité du sol là où poussent les racines, de 0 (sec) à 1 (humide). Elle vient d’un modèle, pas d’une sonde dans votre champ.", "«رطوبة منطقة الجذور» هي تقدير ناسا لمدى رطوبة التربة حيث تنمو الجذور، من 0 (جافة) إلى 1 (رطبة). مصدرها نموذج حسابي وليس مجسا في حقلك.");
  if (w("nasa", "power", "satellite", "ناسا", "قمر"))
    return tr("NASA POWER gives 10 years of daily weather for any point on the map. It covers about 50 km, so compare it with what you see in your own field.", "NASA POWER donne 10 ans de météo quotidienne pour tout point de la carte. Il couvre environ 50 km, comparez-le avec ce que vous voyez dans votre champ.", "NASA POWER يعطي 10 سنوات من الطقس اليومي لأي نقطة على الخريطة. يغطي نحو 50 كم، فقارنه بما تراه في حقلك.");
  if (w("equip", "tractor", "machine", "matériel", "tracteur", "جرار", "معدات", "آلة"))
    return tr("Tell me what machines you have in “My farm”. If you have no baler or combine, the crops that need them lose points.", "Indiquez votre matériel dans « Ma ferme ». Sans presse ou moissonneuse, les cultures qui en ont besoin perdent des points.", "حدد معداتك في «مزرعتي». إذا لم تملك آلة كبس أو حاصدة فالمحاصيل التي تحتاجها تخسر نقاطا.");
  if (w("sure", "uncertain", "confiance", "incertitude", "fiable", "متأكد", "شك", "يقين"))
    return tr("These are estimates, not promises. In the uncertainty chart, a long bar means the result depends a lot on the weather. Always check with a local advisor.", "Ce sont des estimations, pas des promesses. Dans le graphique d’incertitude, une barre longue signifie que le résultat dépend beaucoup de la météo. Vérifiez toujours avec un conseiller local.", "هذه تقديرات وليست وعودا. في مخطط عدم اليقين، الشريط الطويل يعني أن النتيجة تعتمد كثيرا على الطقس. راجع دائما مرشدا محليا.");
  if (!m) return tr("I am still loading the NASA data, try again in a moment.", "Je charge encore les données NASA, réessayez dans un instant.", "ما زلت أحمّل بيانات ناسا، حاول بعد لحظة.");
  if (w("risk", "risqu", "danger", "خطر", "مخاطر")) {
    const g = rd().sort((a, b) => b.v - a.v)[0];
    return tr(`Open “Risks for my farm”. Your biggest worry right now is: ${g.n} (${lv(g.v)}).`, `Ouvrez « Les risques pour ma ferme ». Votre plus grand souci actuellement : ${g.n} (${lv(g.v)}).`, `افتح «المخاطر على مزرعتي». أكبر ما يقلقك الآن: ${g.n} (${lv(g.v)}).`);
  }
  if (w("best", "recommend", "which", "meilleur", "conseil", "quelle", "أفضل", "انصح", "نصيحة", "دورة"))
    return tr(`Right now “${best}” scores highest for your priorities. A rotation changes the crop each year so the soil can rest and pests lose their cycle. Open its card to see why, the risks, and what we do not know yet.`, `Pour l’instant « ${best} » a le meilleur score selon vos priorités. Une rotation change de culture chaque année pour reposer le sol et casser le cycle des parasites. Ouvrez sa fiche pour voir pourquoi, les risques et ce que nous ignorons.`, `حاليا «${best}» هي الأعلى نقاطا حسب أولوياتك. الدورة الزراعية تغير المحصول كل سنة لترتاح التربة وتنقطع دورة الآفات. افتح بطاقتها لترى السبب والمخاطر وما لا نعرفه بعد.`);
  if (w("water", "rain", "eau", "pluie", "ماء", "مطر", "ري"))
    return tr(`Your area gets about ${Math.round(m.rain)} mm of rain a year${m.rain < 400 ? ", which is dry" : ""}. Crops that need little water (sorghum, barley) lower your risk; thirsty ones (alfalfa, corn) need good irrigation. Move “Water saving” to 5 to see the change.`, `Votre zone reçoit environ ${Math.round(m.rain)} mm de pluie par an${m.rain < 400 ? ", ce qui est sec" : ""}. Les cultures peu gourmandes (sorgho, orge) réduisent le risque ; les gourmandes (luzerne, maïs) demandent une bonne irrigation. Mettez « Économie d’eau » à 5 pour voir.`, `منطقتك تتلقى نحو ${Math.round(m.rain)} ملم من المطر في السنة${m.rain < 400 ? "، وهذا جاف" : ""}. المحاصيل القليلة الماء (الذرة الرفيعة، الشعير) تقلل الخطر، والعطشى (البرسيم، الذرة) تحتاج ريا جيدا. ارفع «توفير الماء» إلى 5 لترى الفرق.`);
  if (w("heat", "hot", "chaleur", "chaud", "حر", "حرارة"))
    return tr(`About ${Math.round(m.heat)} days a year go above 35°C. Sorghum and safflower cope well; peas and oats suffer. Try the temperature slider (+2°C) to see a hotter future.`, `Environ ${Math.round(m.heat)} jours par an dépassent 35 °C. Sorgho et carthame supportent bien ; pois et avoine souffrent. Essayez le curseur de température (+2 °C) pour voir un avenir plus chaud.`, `نحو ${Math.round(m.heat)} يوما في السنة تتجاوز 35 درجة. الذرة الرفيعة والقرطم تتحمل جيدا، أما البازلاء والشوفان فتتأثر. جرب مؤشر الحرارة (+2) لترى مستقبلا أدفأ.`);
  if (w("frost", "cold", "gel", "froid", "صقيع", "برد"))
    return tr(`Your frost-free season is about ${Math.round(m.frostFree)} days (last spring frost ~ ${climate.lastSpringText}, first autumn frost ~ ${climate.firstAutumnText}). A crop that needs more days than that is a risk.`, `Votre saison sans gel dure environ ${Math.round(m.frostFree)} jours (dernier gel ~ ${climate.lastSpringText}, premier gel d’automne ~ ${climate.firstAutumnText}). Une culture qui demande plus de jours est risquée.`, `موسمك بلا صقيع نحو ${Math.round(m.frostFree)} يوما (آخر صقيع ربيعي ~ ${climate.lastSpringText} وأول صقيع خريفي ~ ${climate.firstAutumnText}). المحصول الذي يحتاج أياما أكثر معرض للخطر.`);
  return tr("I’m not sure I understood. Try: “which rotation is best?”, “is there a frost risk?” or “what is a cover crop?”", "Je ne suis pas sûr d’avoir compris. Essayez : « quelle rotation choisir ? », « y a-t-il un risque de gel ? » ou « c’est quoi un couvert végétal ? »", "لست متأكدا أنني فهمت. جرب: «ما أفضل دورة زراعية؟» أو «هل هناك خطر صقيع؟» أو «ما هو محصول التغطية؟»");
}
function chips() {
  const c = [
    tr("Which rotation is best?", "Quelle rotation choisir ?", "ما أفضل دورة زراعية؟"),
    tr("Is my area risky?", "Ma zone est-elle risquée ?", "هل منطقتي خطرة؟"),
    tr("What is a cover crop?", "C’est quoi un couvert végétal ?", "ما هو محصول التغطية؟"),
    tr("What does wetness mean?", "Que veut dire humidité du sol ?", "ما معنى رطوبة التربة؟")
  ];
  $("#fsChips").innerHTML = c.map(t => `<button>${t}</button>`).join("");
  $$("#fsChips button").forEach(b => b.addEventListener("click", () => ask(b.textContent)));
}
function ask(t) {
  t = t.trim();
  if (!t) return;
  say(t, "u");
  $("#fsQ").value = "";
  setTimeout(() => say(bot(t), "b"), 350);
}

/* ---------- LANGUAGE / THEME / REFRESH ---------- */
function skin(c) {
  if (!c) return;
  const tx = dark ? "#e6efe6" : "#26352b", mu = dark ? "#b0bdb1" : "#4a4a4a", gr = dark ? "#2b392d" : "#e7ebe5", o = c.options;
  for (const k in (o.scales || {})) {
    const s = o.scales[k];
    if (s.ticks) s.ticks.color = mu;
    if (s.grid) s.grid.color = gr;
    if (s.pointLabels) s.pointLabels.color = tx;
    if (s.angleLines) s.angleLines.color = gr;
  }
  if (o.plugins && o.plugins.legend && o.plugins.legend.labels) o.plugins.legend.labels.color = tx;
  c.update("none");
}
const _cc = window.createChart;
window.createChart = function (id, type, labels, datasets, opts) {
  const f = x => typeof x === "string" ? trs(x) : x;
  _cc(id, type, labels.map(f), datasets.map(d => ({ ...d, label: f(d.label) })), opts);
  skin(charts[id]);
};

function refresh() { sum(); risk(); eqNote(); }
function setLang(l) {
  lang = l; LS("fs-lang", l);
  document.documentElement.lang = l;
  document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
  $("#fsLang").value = l;
  translate(); chips(); refresh();
  $("#fsMsgs").innerHTML = "";
  say(bot("hello"), "b");
}
function setTheme(d) {
  dark = d; LS("fs-theme", d ? "dark" : "light");
  document.documentElement.dataset.theme = d ? "dark" : "light";
  $("#fsTheme").textContent = d ? "☀️" : "🌙";
  Object.values(charts).forEach(skin);
}

/* ---------- START ---------- */
build();
$("#fsLang").addEventListener("change", e => setLang(e.target.value));
$("#fsTheme").addEventListener("click", () => setTheme(!dark));
$("#fsApply").addEventListener("click", applyWords);
$$("[id^=eq_]").forEach(e => e.addEventListener("change", () => { eqNote(); $("#waterWeight").dispatchEvent(new Event("input")); }));
$("#fsFab").addEventListener("click", () => { $("#fsBox").hidden = !$("#fsBox").hidden; });
$("#fsX").addEventListener("click", () => { $("#fsBox").hidden = true; });
$("#fsSend").addEventListener("click", () => ask($("#fsQ").value));
$("#fsQ").addEventListener("keydown", e => { if (e.key === "Enter") ask(e.target.value); });
$("#fsSpeak").addEventListener("click", () => {
  if (!window.speechSynthesis) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance($("#fsSumTxt").textContent);
  u.lang = { en: "en-US", fr: "fr-FR", ar: "ar-SA" }[lang];
  speechSynthesis.speak(u);
});
new MutationObserver(() => { clearTimeout(window.__fsr); window.__fsr = setTimeout(refresh, 80); })
  .observe($("#strategyResults"), { childList: true });

setTheme(dark);
setLang(lang);
})();