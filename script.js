(()=>{'use strict';

/* Réglages et contenu : voir config.js */
const CONFIG=window.ULS_CONFIG;

/* ═════════ OUTILS ═════════ */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const LANGS=['fr','en','ar'], LOC={fr:'fr-FR',en:'en-GB',ar:'ar-u-nu-latn'};
let lang='fr';
try{const s=localStorage.getItem('uls_lang');if(LANGS.includes(s))lang=s;else{const n=(navigator.language||'fr').slice(0,2);if(LANGS.includes(n))lang=n}}catch(e){}
const LI=()=>LANGS.indexOf(lang);
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const today=iso(new Date());
const addDays=(s,n)=>{const d=new Date(s+'T00:00:00');d.setDate(d.getDate()+n);return iso(d)};
const nightsBetween=(a,b)=>a&&b?Math.round((new Date(b+'T00:00:00')-new Date(a+'T00:00:00'))/864e5):0;
function monthDay(d){return d.slice(5)}
function inRangeMD(md,from,to){return from<=to?(md>=from&&md<=to):(md>=from||md<=to)}
function nightInfo(dateStr){
  const P=CONFIG||{};let mult=1,label=null;
  const dow=new Date(dateStr+'T00:00:00').getDay();
  if((P.specialDates||[]).some(s=>s.date===monthDay(dateStr)&&s.multiplier>mult)){const s=(P.specialDates||[]).find(s=>s.date===monthDay(dateStr)&&s.multiplier>mult);if(s){mult=s.multiplier;label=s.label;}}
  if(mult===1)(P.highSeason||[]).forEach(s=>{if(inRangeMD(monthDay(dateStr),s.from,s.to)&&s.multiplier>mult){mult=s.multiplier;label=s.label}});
  if(mult===1){if((P.weekendNights||[]).includes(dow))mult=P.weekendMultiplier||1}
  if((CONFIG && CONFIG.apartmentBaseRates) && (window.ULS_APTS||[]).some(apt => apt.type === 'apartment' && apt.id === (window.ULS_APTS.find(a=>a.id===dateStr)?'':''))){ }
  return{mult,label};
}
function apartmentNightPrice(apt,dateStr){
  if(!apt || apt.type !== 'apartment') return null;
  const dow=new Date(dateStr+'T00:00:00').getDay();
  const base = apt.price || 600;
  const isWeekend = (CONFIG.weekendNights||[]).includes(dow);
  if(isWeekend){
    if(typeof apt.weekendPrice === 'number') return apt.weekendPrice;
    return Math.round(base * (CONFIG.weekendMultiplier || 1));
  }
  return base;
}
function villaNightPrice(apt,dateStr){
  if(!apt || apt.type !== 'villa') return null;
  const dow=new Date(dateStr+'T00:00:00').getDay();
  const base = apt.price || 4000;
  const isWeekend = (CONFIG.weekendNights||[]).includes(dow);
  if(isWeekend){
    if(typeof apt.weekendPrice === 'number') return apt.weekendPrice;
    return Math.round(base * (CONFIG.weekendMultiplier || 1));
  }
  return base;
}
function propertyNightPrice(apt,dateStr){
  if(!apt) return null;
  return villaNightPrice(apt,dateStr) ?? apartmentNightPrice(apt,dateStr) ?? Math.round((apt.price || 0) * (nightInfo(dateStr).mult || 1));
}
function nightsList(a,b){const r=[];let d=a;while(d<b){r.push(d);d=addDays(d,1)}return r}
function bookingNightRate(apt,inD,outD){
  const nights=nightsList(inD,outD);
  if(!nights.length) return apt && apt.price ? apt.price : 0;
  const rates=nights.map(d=>propertyNightPrice(apt,d)).filter(v=>v!==null);
  if(!rates.length) return apt && apt.price ? apt.price : 0;
  const unique=[...new Set(rates)];
  return unique.length===1 ? unique[0] : rates[0];
}
function calcStay(apt,inD,outD){
  const nights=nightsList(inD,outD);let total=0,special=false;
  nights.forEach(d=>{
    const baseRate = propertyNightPrice(apt, d);
    const p = baseRate !== null ? baseRate : Math.round((apt.price || 0) * (nightInfo(d).mult || 1));
    total += p;
    if(baseRate === null && (nightInfo(d).mult || 1) > 1) special = true;
  });
  return{n:nights.length,total,special};
}
function normalizeBlockedRange(r){
  if(!r || !r.from || !r.to) return null;
  const from = String(r.from).slice(0,10);
  const to = String(r.to).slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || to <= from) return null;
  return { from, to };
}
function dateNights(fromDate, toDate){
  if(!fromDate || !toDate || fromDate >= toDate) return [];
  const nights=[];
  let d=new Date(fromDate+'T00:00:00');
  const end=new Date(toDate+'T00:00:00');
  while(d < end){
    nights.push(iso(d));
    d.setDate(d.getDate()+1);
  }
  return nights;
}
function isBlocked(apt,inD,outD){
  if(!apt || !inD || !outD || inD >= outD) return false;
  const candidateNights = new Set(dateNights(inD, outD));
  return (apt.blockedDates||[])
    .map(normalizeBlockedRange)
    .filter(Boolean)
    .some(r => dateNights(r.from, r.to).some(date => candidateNights.has(date)));
}
function overlapsBlockedRange(apt, fromDate, toDate){
  if(!apt || !fromDate || !toDate || fromDate >= toDate) return false;
  const candidateNights = new Set(dateNights(fromDate, toDate));
  return (apt.blockedDates||[])
    .map(normalizeBlockedRange)
    .filter(Boolean)
    .some(r => dateNights(r.from, r.to).some(date => candidateNights.has(date)));
}
function isDateBlocked(apt,dateStr,field='in'){
  if(!dateStr || !apt) return false;
  const target = String(dateStr).slice(0,10);
  return (apt.blockedDates||[])
    .map(normalizeBlockedRange)
    .filter(Boolean)
    .some(r => {
      const nightMatch = dateNights(r.from, r.to).includes(target);
      if(field === 'out') return nightMatch && target !== r.from;
      return nightMatch;
    });
}
function clearBlockedDateSelection(apt,input,field){
  if(!input||!apt)return;
  const val=input.value;
  if(!val) return;
  if(field==='in' && isDateBlocked(apt,val)){
    input.value='';
    bk.in='';
    S.in='';
    input.setCustomValidity(t('e_unavailable'));
    return true;
  }
  if(field==='out' && isDateBlocked(apt,val)){
    input.value='';
    bk.out='';
    S.out='';
    input.setCustomValidity(t('e_unavailable'));
    return true;
  }
  input.setCustomValidity('');
  return false;
}

const fmtDate=s=>{const p=s.split('-');return p[2]+'/'+p[1]+'/'+p[0]};
const money=n=>(n).toLocaleString(lang==='fr'?'fr-FR':'en-US')+(lang==='ar'?' درهم':' MAD');
const ic=(p,f)=>'<svg class="ic" viewBox="0 0 24 24" fill="'+(f||'none')+'" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+p+'</svg>';
const I={
  heart:ic('<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z"/>'),
  share:ic('<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/>'),
  users:ic('<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>'),
  bed:ic('<path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>'),
  bath:ic('<path d="M9 6 6.5 3.5a1.5 1.5 0 0 0-1-.5C4.7 3 4 3.7 4 4.5V12M10 5 8 7M2 12h20v3a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4v-3zM7 19l-1 2M17 19l1 2"/>'),
  area:ic('<path d="M3 3h18v18H3z"/><path d="M3 9h6M3 15h6M9 3v6M15 3v6"/>'),
  star:ic('<polygon points="12 2 15.1 8.6 22 9.3 17 14 18.5 21 12 17.5 5.5 21 7 14 2 9.3 8.9 8.6"/>','currentColor'),
  insta:ic('<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>'),
  tiktok:ic('<path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 3c.4 2.6 2.2 4.4 5 4.6"/>'),
  wa:ic('<path d="M3 21l1.7-5A9 9 0 1 1 8 19.3z"/><path d="M9 9c0 3.5 3 6 6 6l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"/>'),
  mail:ic('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>'),
  pin:ic('<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  arrow:ic('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  chev:ic('<path d="M9 5l7 7-7 7"/>'),
  cam:ic('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
  menu:ic('<path d="M3 7h18M3 12h18M3 17h18"/>'),
  x:ic('<path d="M6 6l12 12M18 6L6 18"/>')
};

/* ═════════ TRADUCTIONS  [fr, en, ar] ═════════ */
const T={
nav_home:['Accueil','Home','الرئيسية'],
nav_apts:['Logements','Properties','العقارات'],
nav_guide:['Guide Casablanca','Casablanca guide','دليل الدار البيضاء'],
nav_loyalty:['Fidélité','Loyalty','الولاء'],
my_points:['Mes points','My points','نقاطي'],
points_phone:['Entrez votre numéro de téléphone :','Enter your phone number:','أدخل رقم هاتفك:'],
points_none:['Aucune réservation trouvée pour ce numéro.','No reservation found for this number.','لم يتم العثور على أي حجز لهذا الرقم.'],
points_error:['Une erreur est survenue : ','An error occurred: ','حدث خطأ: '],
points_total:['Vos points : ','Your points: ','نقاطك: '],
points_nights:['Nuit(s) confirmée(s) : ','Confirmed night(s): ','الليالي المؤكدة: '],
points_remaining:['Encore ','Only ','متبقي '],
points_before:[' point(s) avant votre nuit offerte.',' point(s) before your free night.',' نقطة قبل ليلتك المجانية.'],
nav_about:['À propos','About','من نحن'],
nav_faq:['FAQ','FAQ','الأسئلة الشائعة'],
faq_how:['Comment réserver un appartement ?','How can I book an apartment?','كيف يمكنني حجز شقة؟'],
faq_how_a:['Réservez directement sur notre site. Nous vous confirmerons la disponibilité et vous enverrons un lien de paiement sécurisé pour finaliser votre réservation.','Book directly through our website. We will confirm availability and send you a secure payment link to complete your reservation.','يمكنكم الحجز مباشرة عبر موقعنا. سنؤكد لكم التوفر ونرسل لكم رابط دفع آمن لإتمام الحجز.'],
faq_cancel:['Quels sont les délais d’annulation ?','What is the cancellation policy?','ما هي شروط الإلغاء؟'],
faq_cancel_a:['L’annulation est gratuite jusqu’à 3 jours avant l’arrivée. Entre 3 et 2 jours avant l’arrivée, 50 % du montant est retenu. Moins de 2 jours avant l’arrivée, le montant total est retenu.','Cancellation is free up to 3 days before arrival. Between 3 and 2 days before arrival, 50% of the total amount is retained. Less than 2 days before arrival, the full amount is retained.','الإلغاء مجاني حتى 3 أيام قبل الوصول. بين 3 ويومين قبل الوصول، يتم الاحتفاظ بنسبة 50% من المبلغ. أقل من يومين قبل الوصول، يتم الاحتفاظ بالمبلغ كاملاً.'],

faq_modify:['Puis-je modifier mes dates après réservation ?','Can I change my dates after booking?','هل يمكنني تغيير تواريخ إقامتي بعد الحجز؟'],
faq_modify_a:['Oui, les modifications de dates sont possibles sous réserve de disponibilité, jusqu’à 7 jours avant l’arrivée.','Yes, date changes are possible subject to availability, up to 7 days before arrival.','نعم، يمكن تعديل تواريخ الإقامة حسب التوفر، وذلك حتى 7 أيام قبل الوصول.'],

faq_times:['Quelle est l’heure d’arrivée et de départ ?','What are the check-in and check-out times?','ما هي أوقات تسجيل الوصول والمغادرة؟'],
faq_times_a:['Le check-in est à partir de 15h et le check-out avant 12h.','Check-in is from 3 PM and check-out is before 12 PM.','تسجيل الوصول ابتداءً من الساعة 3 مساءً، وتسجيل المغادرة قبل الساعة 12 ظهرًا.'],

faq_methods:['Quels modes de paiement acceptez-vous ?','What payment methods do you accept?','ما هي طرق الدفع المتاحة؟'],
faq_methods_a:['Nous acceptons le virement bancaire, la carte bancaire via un lien sécurisé et le paiement en espèces à l’arrivée. Un acompte de 30 % est demandé à la réservation.','We accept bank transfer, credit or debit card via a secure payment link, and cash payment upon arrival. A 30% deposit is required at the time of booking.','نقبل التحويل البنكي، والبطاقة البنكية عبر رابط دفع آمن، والدفع نقداً عند الوصول. يُطلب دفع عربون بنسبة 30% عند الحجز.'],

faq_fees:['Le prix inclut-il tous les frais ?','Does the price include all fees?','هل السعر يشمل جميع الرسوم؟'],
faq_fees_a:['Oui. Le Wi-Fi, le ménage, les charges et les taxes sont inclus. Aucun frais caché. Les services supplémentaires sont facturés séparément.','Yes. Wi-Fi, cleaning, utilities and taxes are included. There are no hidden fees. Additional services are charged separately.','نعم. يشمل السعر خدمة الواي فاي والتنظيف والمصاريف والضرائب. لا توجد أي رسوم مخفية. الخدمات الإضافية تُحتسب بشكل منفصل.'],

faq_special:['Proposez-vous des services pour les occasions spéciales ?','Do you offer services for special occasions?','هل تقدمون خدمات للمناسبات الخاصة؟'],
faq_special_a:['Oui. Nous proposons des services personnalisés pour les anniversaires, la Saint-Valentin et autres occasions spéciales. Ces services sont disponibles sur demande et facturés séparément.','Yes. We offer personalized services for birthdays, Valentine’s Day and other special occasions. These services are available upon request and are charged separately.','نعم، نقدم خدمات مخصصة لأعياد الميلاد، عيد الحب ومختلف المناسبات الخاصة. تتوفر هذه الخدمات عند الطلب ويتم احتسابها بشكل منفصل.'],
nav_contact:['Contact','Contact','اتصل بنا'],
hero_title:['ENTRÉE DANS L’ÉLÉGANCE','STEP INTO ELEGANCE','ادخل إلى عالم الأناقة'],
hero_tag:['BIENVENUE CHEZ URBAN LUXURY STAY','WELCOME TO URBAN LUXURY STAY','مرحباً بكم في Urban Luxury Stay'],
hero_hint:['DÉCOUVRIR','DISCOVER','اكتشف'],
s_arrival:['Arrivée','Check-in','الوصول'],
s_departure:['Départ','Check-out','المغادرة'],
s_guests:['Voyageurs','Guests','المسافرون'],
feat_title:['Nos adresses d’exception','Our signature addresses','عناويننا المميزة'],
see_all:['Voir tous les logements','See all stays','عرض كل المساكن'],
val_title:['Le luxe se joue dans les détails','Luxury lives in the details','الفخامة تكمن في التفاصيل'],
v1:['Sélection exigeante','Hand-picked homes','اختيار دقيق'],
v1t:['Chaque logement est visité, testé et validé par notre équipe.','Every property is visited, tested and approved by our team.','كل مسكن يتم زيارته واختباره واعتماده من فريقنا.'],
v2:['Ménage hôtelier inclus','Hotel-grade cleaning included','تنظيف بمعايير فندقية مشمول'],
v2t:['Linge de maison, produits d’accueil et ménage compris dans chaque séjour.','Linens, welcome amenities and cleaning included in every stay.','مفروشات ومستلزمات استقبال وتنظيف مشمولة في كل إقامة.'],
v3:['Conciergerie sur WhatsApp','Concierge on WhatsApp','كونسييرج عبر واتساب'],
v3t:['Une équipe joignable avant, pendant et après votre séjour.','A team you can reach before, during and after your stay.','فريق متاح قبل إقامتك وأثناءها وبعدها.'],
v4:['Programme fidélité','Loyalty rewards','برنامج الولاء'],
v4t:['Plus vous séjournez, plus vous gagnez : bons d’achat et nuits offertes.','The more you stay, the more you earn: vouchers and free nights.','كلما أقمتَ أكثر ربحتَ أكثر: قسائم شراء وليالٍ مجانية.'],
lt_title:['10 points, une nuit offerte','10 points, one free night','10 نقاط، ليلة مجانية'],
lt_text:['Chaque nuit passée chez nous vous rapproche d’une récompense : bons d’achat, avantages et nuits offertes.','Every night with us brings you closer to a reward: vouchers, perks and free nights.','كل ليلة تقضيها عندنا تقرّبك من مكافأة: قسائم ومزايا وليالٍ مجانية.'],
lt_cta:['Découvrir le programme','Discover the programme','اكتشف البرنامج'],
ap_title:['Studios et villas','Studios and villas','استوديوهات وفيلات'],
ap_sub:['Choisissez votre adresse à Casablanca.','Choose your address in Casablanca.','اختر عنوانك في الدار البيضاء.'],
f_all:['Tous','All','الكل'],f_apartment:['Studios','Studios','استوديوهات'],f_villa:['Villas','Villas','فيلات'],
f_fav:['Favoris','Saved','المفضلة'],
f_guests:['Voyageurs minimum','Minimum guests','الحد الأدنى للمسافرين'],
none:['Aucun logement ne correspond à ces critères. Modifiez les filtres.','No stay matches these filters. Try changing them.','لا يوجد مسكن يطابق هذه المعايير. غيّر الفلاتر.'],
per_night:['/ nuit','/ night','/ الليلة'],
u_guests:['voyageurs','guests','مسافرين'],u_guests_s:['voyageur','guest','مسافر'],u_bed:['chambres','bedrooms','غرف نوم'],u_bed_s:['chambre','bedroom','غرفة نوم'],u_beds:['lits','beds','أسرّة'],u_beds_s:['lit','bed','سرير'],u_bath:['salles de bain','bathrooms','حمامات'],u_bath_s:['salle de bain','bathroom','حمام'],
type_apartment:['Studio','Studio','استوديو'],type_villa:['Villa','Villa','فيلا'],
back:['Tous les logements','All stays','كل المساكن'],
save:['Sauvegarder','Save','حفظ'],saved:['Sauvegardé','Saved','تم الحفظ'],
share:['Partager','Share','مشاركة'],copied:['Lien copié','Link copied','تم نسخ الرابط'],
about_stay:['À propos de ce logement','About this stay','عن هذا المسكن'],
d_features:['Caractéristiques','Features','المواصفات'],
d_amen:['Équipements','Amenities','التجهيزات'],
d_reviews:['Avis des voyageurs','Guest reviews','تقييمات الضيوف'],
reviews_n:['avis','reviews','تقييم'],
f_size:['Surface','Size','المساحة'],f_checkin:['Arrivée dès','Check-in from','الوصول من'],f_checkout:['Départ avant','Check-out by','المغادرة قبل'],f_view:['Vue','View','الإطلالة'],f_clean:['Ménage','Cleaning','التنظيف'],f_clean_v:['Inclus','Included','مشمول'],f_capacity:['Capacité','Capacity','السعة'],f_area:['Quartier','Area','الحي'],
v_sea:['Océan','Ocean','المحيط'],v_city:['Ville','City','المدينة'],v_garden:['Jardin','Garden','الحديقة'],v_pool:['Piscine','Pool','المسبح'],v_marina:['Marina','Marina','المارينا'],
b_title:['Réserver','Book','احجز'],
b_from:['À partir de','From','ابتداءً من'],
b_cap:['Capacité maximale : {n} voyageurs. Ménage inclus.','Maximum capacity: {n} guests. Cleaning included.','السعة القصوى: {n} مسافرين. التنظيف مشمول.'],
b_nights:['{n} nuit(s) × {p}','{n} night(s) × {p}','{n} ليلة × {p}'],
b_total:['Total','Total','المجموع'],
b_name:['Nom complet','Full name','الاسم الكامل'],
b_send:['Confirmer sur WhatsApp','Confirm on WhatsApp','التأكيد عبر واتساب'],
b_nopay:['Aucun paiement en ligne : la réservation se confirme sur WhatsApp.','No online payment: the booking is confirmed on WhatsApp.','لا دفع عبر الإنترنت: يتم تأكيد الحجز عبر واتساب.'],
b_pts:['Ce séjour vous fait gagner {n} point(s) fidélité.','This stay earns you {n} loyalty point(s).','هذه الإقامة تمنحك {n} نقطة ولاء.'],
e_dates:['Choisissez vos dates d’arrivée et de départ.','Choose your arrival and departure dates.','اختر تاريخي الوصول والمغادرة.'],
price_note:['Tarifs plus élevés le week-end, en haute saison et lors de certaines dates (Saint-Valentin, réveillon…).','Higher rates on weekends, during high season and on certain dates (Valentine’s Day, New Year’s Eve…).','أسعار أعلى في عطلة نهاية الأسبوع وفي المواسم المرتفعة وفي تواريخ معينة (عيد الحب، رأس السنة…).'],
e_unavailable:['Ces dates sont déjà réservées pour ce logement. Choisissez d’autres dates.','These dates are already booked for this stay. Please choose other dates.','هذه التواريخ محجوزة بالفعل لهذا المسكن. اختر تواريخ أخرى.'],
e_guests:['Le nombre de voyageurs dépasse la capacité du logement.','The number of guests exceeds the capacity.','عدد المسافرين يتجاوز سعة المسكن.'],
e_name:['Indiquez votre nom complet.','Enter your full name.','أدخل اسمك الكامل.'],
e_id:['Ajoutez la photo de votre carte nationale.','Add a photo of your national ID card.','أضف صورة بطاقتك الوطنية.'],
b_after:['WhatsApp s’ouvre avec votre demande. Joignez la photo de votre carte nationale dans la conversation.','WhatsApp opens with your request. Attach your ID photo in the conversation.','يُفتح واتساب بطلبك. أرفق صورة بطاقتك في المحادثة.'],
b_shareid:['Envoyer la photo par WhatsApp','Send the photo via WhatsApp','إرسال الصورة عبر واتساب'],
g_title:['Guide Casablanca','Casablanca guide','دليل الدار البيضاء'],
g_sub:['Nos adresses pour vivre la ville pendant votre séjour.','Our addresses to live the city during your stay.','عناويننا لتعيش المدينة خلال إقامتك.'],
g_all:['Tout','All','الكل'],
c_restaurants:['Restaurants','Restaurants','مطاعم'],c_cafes:['Cafés','Cafés','مقاهٍ'],c_sights:['Lieux à visiter','Places to visit','أماكن للزيارة'],c_museums:['Musées','Museums','متاحف'],c_rooftops:['Rooftops','Rooftops','أسطح بانورامية'],c_shopping:['Shopping','Shopping','تسوق'],c_activities:['Activités','Activities','أنشطة'],
g_maps:['Ouvrir sur Maps','Open in Maps','فتح في الخرائط'],
g_note:['Besoin d’une réservation ou d’une recommandation ? Écrivez à la conciergerie sur WhatsApp.','Need a booking or a recommendation? Message the concierge on WhatsApp.','تحتاج حجزًا أو توصية؟ راسل الكونسييرج عبر واتساب.'],
l_title:['Urban Privilège','Urban Privilège','Urban Privilège'],
l_sub:['Chaque nuit compte. Plus vous séjournez chez nous, plus vos récompenses grandissent.','Every night counts. The more you stay with us, the bigger your rewards.','كل ليلة لها قيمة. كلما أقمتَ عندنا أكثر كبرت مكافآتك.'],
l_s1:['Séjournez','Stay','أقم'],l_s1t:['Une nuit passée = 10 points.','One night stayed = 10 points.','ليلة واحدة = 10 نقاط.'],
l_s2:['Cumulez','Collect','اجمع'],l_s2t:['Vos points s’additionnent d’un séjour à l’autre.','Your points add up from one stay to the next.','تتراكم نقاطك من إقامة إلى أخرى.'],
l_s3:['Profitez','Enjoy','استمتع'],l_s3t:['Bons d’achat, avantages et nuits offertes.','Vouchers, perks and free nights.','قسائم شراء ومزايا وليالٍ مجانية.'],
l_rewards:['Vos récompenses','Your rewards','مكافآتك'],
r100:['Bon d’achat de 50 DH',' 50 MAD gift voucher','نقطة: قسيمة شراء بقيمة 50 درهم'],
r300:['Bon d’achat de 200 DH',' 200 MAD gift voucher',' نقطة: قسيمة شراء بقيمة 200 درهم'],
r1000:['Nuit gratuite dans le studio de votre choix','One free night in the studio of your choice',' نقطة: ليلة مجانية في الاستوديو الذي تختاره'],
r3000:['Transport gratuit de l’aéroport au bien réservé (entre 14h et 23h aller)','Free airport transfer to the reserved property (outbound between 2 PM and 11 PM)',' نقطة: انتقال مجاني من المطار إلى العقار المحجوز (ذهابًا بين 14:00 و23:00)'],
l_pts:['pts','pts','نقطة'],l_unlocked:['Débloqué','Unlocked','مفتوح'],
l_sim:['Calculez vos points','Calculate your points','احسب نقاطك'],
l_nights:['Nuits séjournées','Nights stayed','الليالي المقضاة'],
l_yours:['Vos points','Your points','نقاطك'],
l_next:['Encore {n} point(s) avant votre prochaine nuit gratuite dans le studio de votre choix.','{n} more point(s) until your next free night in the studio of your choice.','باقي {n} نقطة حتى ليلتك المجانية التالية في الاستوديو الذي تختاره.'],
l_won:['Récompense(s) débloquée(s) : {n}.','Reward(s) unlocked: {n}.','المكافآت المفتوحة: {n}.'],
l_join:['Rejoindre le programme','Join the programme','انضم إلى البرنامج'],
l_note:['Les points sont crédités après chaque séjour confirmé.','Points are credited after each confirmed stay.','تُضاف النقاط بعد كل إقامة مؤكدة.'],
a_title:['À propos','About us','من نحن'],
a_h:['Le luxe urbain, à Casablanca','Urban luxury, in Casablanca','الفخامة الحضرية في الدار البيضاء'],
a_p1:['Urban Luxury Stay est né d’une idée simple : offrir à Casablanca le niveau de service d’un hôtel de prestige, avec la liberté et l’intimité d’un appartement ou d’une villa.','Urban Luxury Stay was born from a simple idea: bring Casablanca the service standard of a prestige hotel, with the freedom and privacy of an apartment or villa.','وُلدت Urban Luxury Stay من فكرة بسيطة: تقديم مستوى خدمة فندق راقٍ في الدار البيضاء، مع حرية وخصوصية شقة أو فيلا.'],
a_p2:['Chaque adresse est choisie pour son emplacement, son design et son confort. De la réservation au départ, notre équipe reste à votre écoute pour que votre séjour se déroule sans le moindre détail à gérer.','Each address is chosen for its location, design and comfort. From booking to check-out, our team stays by your side so your stay runs without a single detail to manage.','يتم اختيار كل عنوان لموقعه وتصميمه وراحته. من الحجز حتى المغادرة، يبقى فريقنا إلى جانبك لتمر إقامتك دون أي تفصيل يشغلك.'],
ct_title:['Contact','Contact','اتصل بنا'],
ct_sub:['Une question ? Écrivez-nous, nous répondons rapidement.','A question? Write to us, we reply quickly.','لديك سؤال؟ راسلنا وسنرد بسرعة.'],
ct_name:['Votre nom','Your name','اسمك'],ct_msg:['Votre message','Your message','رسالتك'],
ct_send:['Envoyer sur WhatsApp','Send on WhatsApp','أرسل عبر واتساب'],
ct_email:['E-mail','Email','البريد الإلكتروني'],ct_addr:['Adresse','Address','العنوان'],ct_addr_v:['Casablanca, Maroc','Casablanca, Morocco','الدار البيضاء، المغرب'],
ct_wa:['WhatsApp','WhatsApp','واتساب'],ct_follow:['Suivez-nous','Follow us','تابعنا'],
ft_tag:['Location d’appartements et de villas de luxe à Casablanca.','Luxury apartment and villa rentals in Casablanca.','تأجير شقق وفيلات فاخرة في الدار البيضاء.'],
ft_rights:['Tous droits réservés.','All rights reserved.','جميع الحقوق محفوظة.'],
ft_explore:['Explorer','Explore','استكشف'],
menu_close:['Fermer','Close','إغلاق']
};
const t=(k,v)=>{const a=T[k];let s=a?(a[LI()]||a[0]):k;if(v)for(const x in v)s=s.split('{'+x+'}').join(v[x]);return s};
const L=a=>a[LI()]||a[0];

/* ═════════ DONNÉES : logements (exemples à remplacer) ═════════ */
const AM={
 wifi:['Wi-Fi fibre','Fibre Wi-Fi','واي فاي ألياف'],ac:['Climatisation','Air conditioning','تكييف'],pool:['Piscine privée','Private pool','مسبح خاص'],
 kitchen:['Cuisine équipée','Fully equipped kitchen','مطبخ مجهز'],parking:['Parking privé','Private parking','موقف خاص'],elevator:['Ascenseur','Elevator','مصعد'],
 tv:['Smart TV et streaming','Smart TV and streaming','تلفاز ذكي وبث'],washer:['Lave-linge','Washing machine','غسالة'],gym:['Salle de sport','Gym','قاعة رياضة'],
 concierge:['Conciergerie','Concierge','كونسييرج'],security:['Sécurité 24h/24','24/7 security','أمن على مدار الساعة'],terrace:['Terrasse','Terrace','تراس'],
 garden:['Jardin paysager','Landscaped garden','حديقة منسقة'],breakfast:['Petit-déjeuner sur demande','Breakfast on request','فطور عند الطلب'],coffee:['Machine à café','Coffee machine','ماكينة قهوة'],
 linen:['Linge de maison hôtelier','Hotel-grade linens','مفروشات بمعايير فندقية'],safe:['Coffre-fort','Safe','خزنة'],bbq:['Barbecue','Barbecue','شواء']
};
const APTS=window.ULS_APTS;
const POOL=window.ULS_REVIEWS;
const revs=a=>a.reviews&&a.reviews.length?a.reviews:[0,1,2,3].map(i=>POOL[(a.seed+i)%POOL.length]);
const rating=a=>{const r=revs(a);return r.reduce((s,x)=>s+x.r,0)/r.length};
function normalizeAptKey(value) {
  if (!value && value !== 0) return '';
  const s = String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  return s.replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

async function hydrateBlockedDates(){
  if(!window.ULS_DATABASE || typeof window.ULS_DATABASE.getBlockedDates !== 'function') return;
  if(blockedDatesLoading) return;
  blockedDatesLoading = true;

  try {
    const remote = await window.ULS_DATABASE.getBlockedDates();
    if(!remote || typeof remote !== 'object') return;

    const aliases = {};
    APTS.forEach(apt => {
      aliases[normalizeAptKey(apt.id)] = apt.id;
      aliases[normalizeAptKey(apt.name)] = apt.id;
    });

    APTS.forEach(apt => {
      const local = Array.isArray(apt.blockedDates) ? apt.blockedDates : [];
      const keys = [apt.id, apt.name, normalizeAptKey(apt.id), normalizeAptKey(apt.name)];
      const incoming = keys.flatMap(key => remote[key] || []).concat(
        Object.entries(remote).flatMap(([k, items]) => normalizeAptKey(k) === normalizeAptKey(apt.id) || normalizeAptKey(k) === normalizeAptKey(apt.name) ? (items || []) : [])
      ).map(item => ({
        from: String(item.from || item.start || '').slice(0, 10),
        to: String(item.to || item.end || '').slice(0, 10)
      })).filter(item => item.from && item.to);

      const merged = [...local, ...incoming]
        .map(normalizeBlockedRange)
        .filter(Boolean)
        .sort((a, b) => a.from.localeCompare(b.from));
      apt.blockedDates = merged;
    });

    const a = typeof curApt === 'function' ? curApt() : null;
    if (a) {
      renderAvailabilityCalendar(a);
      updateBooking();
    }
  } finally {
    blockedDatesLoading = false;
  }
}

/* ═════════ VISUELS SVG (à remplacer par vos vraies photos) ═════════ */
function rng(seed){let s=(seed>>>0)||1;return()=>{s^=s<<13;s>>>=0;s^=s>>>17;s^=s<<5;s>>>=0;return s/4294967296}}
let AN=0;
function art(sc,seed){
  const u='g'+(++AN),r=rng(seed*131+sc*17+5),G='#c9a24b',GL='#ecd28f';
  const defs='<defs><linearGradient id="'+u+'s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset=".55" stop-color="#2b1e0a"/><stop offset="1" stop-color="#b98a35"/></linearGradient>'+
   '<radialGradient id="'+u+'r"><stop offset="0" stop-color="'+GL+'" stop-opacity=".95"/><stop offset="1" stop-color="'+G+'" stop-opacity="0"/></radialGradient>'+
   '<linearGradient id="'+u+'w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#211b10"/><stop offset="1" stop-color="#050505"/></linearGradient>'+
   '<linearGradient id="'+u+'f" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".6"/></linearGradient></defs>';
  let b='';
  if(sc===0){
    const cx=220+r()*360|0;
    b+='<rect width="800" height="600" fill="url(#'+u+'s)"/><circle cx="'+cx+'" cy="330" r="170" fill="url(#'+u+'r)"/><circle cx="'+cx+'" cy="330" r="46" fill="'+GL+'"/>';
    let x=-10;while(x<810){const w=34+r()*50,h=110+r()*300;
      b+='<rect x="'+x+'" y="'+(520-h)+'" width="'+w+'" height="'+h+'" fill="#070707"/>';
      for(let wy=520-h+14;wy<505;wy+=26)for(let wx=x+7;wx<x+w-9;wx+=14)if(r()>.62)b+='<rect x="'+wx+'" y="'+wy+'" width="5" height="9" fill="'+G+'" opacity="'+(.35+r()*.6).toFixed(2)+'"/>';
      x+=w+3}
    b+='<rect y="520" width="800" height="80" fill="#050403"/>';
    for(let i=0;i<7;i++)b+='<rect x="'+(cx-90+r()*180|0)+'" y="'+(530+i*10)+'" width="'+(30+r()*90|0)+'" height="2" fill="'+GL+'" opacity=".35"/>';
  }else if(sc===1){
    b+='<rect width="800" height="600" fill="url(#'+u+'w)"/><rect x="470" y="70" width="290" height="340" fill="url(#'+u+'s)"/>';
    let x=470;while(x<760){const w=20+r()*26,h=60+r()*150;b+='<rect x="'+x+'" y="'+(410-h)+'" width="'+w+'" height="'+h+'" fill="#080808"/>';x+=w+2}
    b+='<path d="M470 70H760V410H470zM615 70V410M470 240H760" fill="none" stroke="'+G+'" stroke-width="3"/>'+
     '<rect y="430" width="800" height="170" fill="#0a0906"/><ellipse cx="270" cy="500" rx="240" ry="46" fill="#1a140a" stroke="'+G+'" stroke-opacity=".35"/>'+
     '<rect x="80" y="292" width="350" height="70" rx="14" fill="#3a2f1c"/><rect x="70" y="340" width="370" height="96" rx="16" fill="#2a2216"/>'+
     '<rect x="110" y="308" width="70" height="46" rx="8" fill="'+G+'" opacity=".85"/><rect x="330" y="308" width="70" height="46" rx="8" fill="#efe9dc" opacity=".9"/>'+
     '<rect x="176" y="472" width="190" height="12" fill="'+G+'"/><rect x="190" y="484" width="6" height="30" fill="'+G+'"/><rect x="346" y="484" width="6" height="30" fill="'+G+'"/>'+
     '<circle cx="40" cy="150" r="70" fill="url(#'+u+'r)"/><rect x="38" y="150" width="4" height="290" fill="'+G+'"/><path d="M14 150h52l-10-46H24z" fill="'+GL+'"/>';
  }else if(sc===2){
    b+='<rect width="800" height="600" fill="url(#'+u+'w)"/><rect x="170" y="90" width="460" height="250" rx="8" fill="#2a2113"/>';
    for(let i=0;i<7;i++)b+='<rect x="'+(200+i*62)+'" y="104" width="2" height="222" fill="'+G+'" opacity=".35"/>';
    b+='<rect y="450" width="800" height="150" fill="#0a0906"/><rect x="130" y="290" width="540" height="170" rx="10" fill="#efe9dc"/><rect x="130" y="380" width="540" height="82" fill="#3a2f1c"/><rect x="130" y="372" width="540" height="12" fill="'+G+'"/>'+
     '<rect x="170" y="262" width="200" height="60" rx="14" fill="#fff"/><rect x="430" y="262" width="200" height="60" rx="14" fill="#fff"/>'+
     '<rect x="60" y="340" width="52" height="110" fill="#1d170c" stroke="'+G+'" stroke-opacity=".4"/><rect x="688" y="340" width="52" height="110" fill="#1d170c" stroke="'+G+'" stroke-opacity=".4"/>'+
     '<circle cx="86" cy="300" r="60" fill="url(#'+u+'r)"/><circle cx="714" cy="300" r="60" fill="url(#'+u+'r)"/><rect x="72" y="306" width="28" height="30" fill="'+GL+'"/><rect x="700" y="306" width="28" height="30" fill="'+GL+'"/>';
  }else if(sc===3){
    b+='<rect width="800" height="600" fill="url(#'+u+'s)"/><circle cx="560" cy="300" r="190" fill="url(#'+u+'r)"/><circle cx="560" cy="300" r="52" fill="'+GL+'"/>'+
     '<rect y="330" width="800" height="270" fill="#0a0806"/><rect x="90" y="390" width="620" height="150" fill="#12333a"/>';
    for(let i=0;i<9;i++)b+='<rect x="'+(110+r()*440|0)+'" y="'+(398+i*15)+'" width="'+(50+r()*140|0)+'" height="2" fill="'+GL+'" opacity=".4"/>';
    b+='<rect x="90" y="382" width="620" height="8" fill="#efe9dc"/>'+
     '<rect x="120" y="556" width="130" height="18" rx="4" fill="#efe9dc"/><rect x="270" y="556" width="130" height="18" rx="4" fill="#efe9dc"/>'+
     '<path d="M600 330l50-120 50 120z" fill="'+G+'"/><rect x="648" y="210" width="4" height="150" fill="#efe9dc"/>';
  }else{
    b+='<rect width="800" height="600" fill="url(#'+u+'w)"/>';
    for(let i=0;i<6;i++)b+='<path d="M'+(r()*800|0)+' 0Q'+(r()*800|0)+' '+(200+r()*200|0)+' '+(r()*800|0)+' 600" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="'+(1+r()*3|0)+'"/>';
    b+='<path d="M290 390V190a110 110 0 0 1 220 0V390z" fill="#2b2215" stroke="'+G+'" stroke-width="3"/><path d="M310 380V192a90 90 0 0 1 180 0V380z" fill="url(#'+u+'s)" opacity=".7"/>'+
     '<rect y="470" width="800" height="130" fill="#0a0906"/><ellipse cx="400" cy="480" rx="230" ry="52" fill="#efe9dc"/><ellipse cx="400" cy="474" rx="205" ry="40" fill="#cfc6b1"/>'+
     '<path d="M400 470V400q0-24 26-24h12" fill="none" stroke="'+G+'" stroke-width="7" stroke-linecap="round"/>'+
     '<circle cx="90" cy="220" r="70" fill="url(#'+u+'r)"/><circle cx="710" cy="220" r="70" fill="url(#'+u+'r)"/><rect x="86" y="220" width="8" height="200" fill="'+G+'"/><rect x="706" y="220" width="8" height="200" fill="'+G+'"/>';
  }
  return '<svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" aria-hidden="true">'+defs+b+'<rect width="800" height="600" fill="url(#'+u+'f)"/></svg>';
}
const scenesFor=a=>[0,1,2,3,4].map(s=>(s+a.hs)%5);
const galN=a=>(a.photos&&a.photos.length)?a.photos.length:5;
// Affiche la photo n°i du logement (dossier images/) ou, à défaut, l'illustration
function pic(a,i){
  const p=a.photos&&a.photos[i],sc=scenesFor(a)[i%5];
  return p?'<img src="'+esc(p)+'" alt="'+esc(a.name)+'" data-sc="'+sc+'" data-seed="'+a.seed+'" decoding="async">':art(sc,a.seed);
}
// Image d'un bloc en arche (config.images) ou illustration
function blockPic(key,sc,seed){
  const p=CONFIG.images&&CONFIG.images[key];
  return p?'<img src="'+esc(p)+'" alt="" data-sc="'+sc+'" data-seed="'+seed+'" decoding="async">':art(sc,seed);
}
// Si une image est introuvable, on remet l'illustration
document.addEventListener('error',e=>{
  const im=e.target;
  if(im&&im.tagName==='IMG'&&im.dataset&&im.dataset.sc){const d=document.createElement('div');d.style.cssText='width:100%;height:100%';d.innerHTML=art(+im.dataset.sc,+im.dataset.seed);im.replaceWith(d)}
},true);

/* ═════════ GUIDE CASABLANCA (à valider / compléter) ═════════ */
const GUIDE=Array.isArray(window.ULS_GUIDE)?window.ULS_GUIDE:[];
const CATS=['restaurants','cafes','sights','museums','rooftops','shopping','activities'];
const REWARDS=[{p:100,k:'r100'},{p:300,k:'r300'},{p:1000,k:'r1000'},{p:3000,k:'r3000'}];

/* ═════════ ÉTAT ═════════ */
let favs=new Set();try{favs=new Set(JSON.parse(localStorage.getItem('uls_favs')||'[]'))}catch(e){}
const saveFavs=()=>{try{localStorage.setItem('uls_favs',JSON.stringify([...favs]))}catch(e){}};
const S={in:'',out:'',guests:2};
const F={type:'all',guests:1,fav:false};
let gcat='all';
let bk={aptId:null,in:'',out:'',guests:2,name:'',file:null,idUrl:null,tried:false};
let bookingMonth = new Date();
let blockedDatesLoading = false;
bookingMonth.setDate(1);
const CT={name:'',msg:''};
let simN=0,galIdx=0;
const wa=text=>'https://wa.me/'+CONFIG.whatsapp+'?text='+encodeURIComponent(text);
const toast=m=>{const e=$('#toast');e.textContent=m;e.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('show'),2400)};

/* ═════════ HERO : modèle fourni ═════════ */
const Hero=(()=>{
  const el=$('#hero'),video=$('#hVideo'),imgEl=$('#hImg'),imgMode=!!CONFIG.heroImage,fbEl=$('#hFb'),titleEl=$('#hTitle'),tagEl=$('#hTag'),hintEl=$('#hHint'),barEl=$('#hBar'),fbL=$('#fbL'),fbR=$('#fbR'),fbGlow=$('#fbGlow');
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  let duration=0,target=0,cur=0,started=false,seeking=false,pending=null,locked=false,savedY=0,touchY=0,raf=0,active=false,ready=false,fbOn=false,inited=false,endedAt=0,lastT=-1;
  const menuOpen=()=>document.body.classList.contains('menu-open');
  const now=()=>performance.now();
  const canLeave=()=>target>=1&&cur>=.985&&endedAt&&now()-endedAt>900;

  function fbSvg(){
    const r=rng(42);let b='<svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="fs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#05070d"/><stop offset=".7" stop-color="#1b1408"/><stop offset="1" stop-color="#3a2a0e"/></linearGradient></defs><rect width="1600" height="900" fill="url(#fs)"/>';
    let x=-10;while(x<1610){const w=46+r()*80,h=180+r()*520;b+='<rect x="'+x+'" y="'+(900-h)+'" width="'+w+'" height="'+h+'" fill="#06070a"/>';
      for(let wy=900-h+18;wy<880;wy+=30)for(let wx=x+9;wx<x+w-10;wx+=16)if(r()>.66)b+='<rect x="'+wx+'" y="'+wy+'" width="6" height="11" fill="#c9a24b" opacity="'+(.3+r()*.6).toFixed(2)+'"/>';
      x+=w+4}
    return b+'</svg>';
  }
  function showFallback(){if(ready||fbOn)return;fbOn=true;fbEl.style.opacity='1'}
  function init(){
    if(inited)return;inited=true;
    fbL.innerHTML=fbSvg();fbR.innerHTML=fbSvg();
    if(imgMode){
      video.style.display='none';imgEl.hidden=false;
      imgEl.addEventListener('load',()=>{ready=true;imgEl.style.opacity='1';fbEl.style.opacity='0'});
      imgEl.addEventListener('error',showFallback);
      imgEl.src=CONFIG.heroImage;
    }else if(!CONFIG.heroVideo){
      showFallback();
    }else{
    video.muted=true;video.src=CONFIG.heroVideo;
    video.addEventListener('loadeddata',()=>{duration=video.duration||0;ready=true;video.style.opacity='1';fbEl.style.opacity='0';if(reduce)video.currentTime=duration*.92});
    video.addEventListener('error',showFallback);
    video.addEventListener('seeked',()=>{seeking=false;if(pending!==null){const tt=pending;pending=null;seeking=true;video.currentTime=tt}});
    // iOS Safari : play puis pause immédiat pour forcer le chargement
    try{const p=video.play();if(p&&p.then)p.then(()=>video.pause()).catch(()=>{});else video.pause()}catch(e){}
    }
    setTimeout(()=>{if(!ready)showFallback()},4500);
    window.addEventListener('wheel',onWheel,{passive:false});
    window.addEventListener('touchstart',onTS,{passive:true});
    window.addEventListener('touchmove',onTM,{passive:false});
    el.addEventListener('touchstart',onTS,{passive:true,capture:true});
    el.addEventListener('touchmove',onTM,{passive:false,capture:true});
    window.addEventListener('keydown',onKey);
  }
  function seekTo(tt){if(seeking){pending=tt;return}seeking=true;video.currentTime=tt}
  function lock(){
    if(locked)return;locked=true;savedY=window.scrollY;
    const b=document.body.style;b.position='fixed';b.top='calc(env(safe-area-inset-top,0px) - '+savedY+'px)';b.left='0';b.right='0';b.width='100%';b.height='100%';b.overscrollBehavior='none';
    el.style.touchAction='none';
  }
  function unlock(){
    if(!locked)return;locked=false;
    const b=document.body.style;b.position='';b.top='';b.left='';b.right='';b.width='';b.height='';b.overscrollBehavior='';
    el.style.touchAction='pan-y';window.scrollTo(0,savedY);
  }
  function add(d){
    target=clamp(target+d/CONFIG.scrubDistance,0,1);
    if(target>.001)started=true;
    if(target>=1){if(!endedAt)endedAt=now()}else endedAt=0;
  }
  function onWheel(e){
    if(!active||reduce||menuOpen())return;
    if(locked){
      if(e.deltaY>0&&canLeave()){unlock();return}
      add(e.deltaY);e.preventDefault();
    }else if(window.scrollY<=0&&e.deltaY<0){lock();add(e.deltaY);e.preventDefault()}
  }
  function onTS(e){touchY=e.touches[0]?e.touches[0].clientY:0}
  function onTM(e){
    if(!active||reduce||menuOpen())return;
    const y=e.touches[0]?e.touches[0].clientY:touchY,d=touchY-y;touchY=y;
    if(locked){
      if(d>0&&canLeave()){unlock();return}
      add(d);e.preventDefault();
    }else if(window.scrollY<=0&&d<0){lock();add(d);e.preventDefault()}
  }
  function onKey(e){
    if(!active||!locked||reduce||menuOpen())return;
    if(/INPUT|TEXTAREA|SELECT|BUTTON|A/.test((e.target&&e.target.tagName)||''))return;
    const m={ArrowDown:220,PageDown:800,' ':800,ArrowUp:-220,PageUp:-800,End:1e9,Home:-1e9};
    if(!(e.key in m))return;
    if(m[e.key]>0&&canLeave()){unlock();return}
    add(m[e.key]);e.preventDefault();
  }
  function frame(){
    cur+=(target-cur)*.24;if(Math.abs(target-cur)<.0004)cur=target;
    if(imgMode)imgEl.style.transform='scale('+(1.02+cur*.12)+')';
    if(!imgMode&&duration>0&&ready){const tt=Math.min(cur*duration,Math.max(0,duration-.05));if(Math.abs(tt-lastT)>.01){lastT=tt;seekTo(tt)}}
    if(!imgMode)video.style.transform='scale('+(1+cur*.06)+')';
    const tt=1-clamp(cur/.35,0,1);
    titleEl.style.opacity=String(tt);
    titleEl.style.transform='translateY('+((1-tt)*-24)+'px) scale('+(.96+tt*.04)+')';
    titleEl.style.filter='blur('+((1-tt)*10)+'px)';
    hintEl.style.opacity=(!started||target>=.995)?'1':'0';
    const tg=clamp((cur-.82)/.18,0,1);
    tagEl.style.opacity=String(tg);
    tagEl.style.transform='translateY('+((1-tg)*20)+'px) scale('+(.97+tg*.03)+')';
    tagEl.style.filter='blur('+((1-tg)*8)+'px)';
    barEl.style.transform='scaleX('+cur+')';
    if(fbOn){fbL.style.transform='translate3d('+(-cur*100)+'%,0,0)';fbR.style.transform='translate3d('+(cur*100)+'%,0,0)';fbGlow.style.opacity=String(.3+cur*.55);fbGlow.style.transform='scale('+(1+cur*.35)+')'}
    raf=requestAnimationFrame(frame);
  }
  function applyFinal(){
    titleEl.style.opacity='0';tagEl.style.opacity='1';tagEl.style.filter='none';tagEl.style.transform='none';hintEl.style.opacity='0';barEl.style.transform='scaleX(1)';
    fbL.style.transform='translate3d(-100%,0,0)';fbR.style.transform='translate3d(100%,0,0)';fbGlow.style.opacity='1';
  }
  return{
    show(){
      init();el.hidden=false;
      if(active)return;active=true;
      if(reduce){target=cur=1;if(imgMode)imgEl.style.transform='scale(1.1)';applyFinal();return}
      if(target<1)lock();else el.style.touchAction='pan-y';
      if(!raf)raf=requestAnimationFrame(frame);
    },
    hide(){active=false;unlock();el.hidden=true;cancelAnimationFrame(raf);raf=0},
    isLocked:()=>locked
  };
})();

/* ═════════ NAV / FOOTER ═════════ */
const ROUTES=[['home','nav_home','#/'],['apartments','nav_apts','#/apartments'],['loyalty','nav_loyalty','#/loyalty'],['about','nav_about','#/about'],['faq','nav_faq','#/faq'],['contact','nav_contact','#/contact']];
const parse=()=>{const p=(location.hash||'#/').slice(1).split('/').filter(Boolean);let n=p[0]||'home';if(n==='apartment'&&!p[1])n='apartments';return{name:n,id:p[1]}};
function renderChrome(){
  const cur=parse().name==='apartment'?'apartments':parse().name;
  const lk=(r,cls)=>'<a href="'+r[2]+'" class="'+(cls||'')+(cur===r[0]?' on':'')+'" data-r="'+r[0]+'">'+t(r[1])+'</a>';
const mesPoints='<button type="button" class="btn" data-mes-points>'+t('my_points')+'</button>';  $('#nav').innerHTML='<a class="logo" href="#/" data-r="home" aria-label="'+CONFIG.brand+'"><span class="lg1">URBAN</span><span class="lg2">LUXURY STAY</span></a>'+
'<nav class="links" aria-label="Menu">'+ROUTES.map(r=>lk(r)).join('')+mesPoints+'</nav>'+    '<div class="nav-r"><div class="lang" role="group" aria-label="Langue">'+LANGS.map(l=>'<button data-lang="'+l+'" class="'+(l===lang?'on':'')+'" aria-pressed="'+(l===lang)+'">'+l.toUpperCase()+'</button>').join('')+'</div>'+
    '<button class="burger" id="burger" aria-label="Menu">'+I.menu+'</button></div>';
  $('#mnav').innerHTML='<button class="x" id="mclose" aria-label="'+t('menu_close')+'">'+I.x+'</button>'+ROUTES.map(r=>lk(r)).join('');
  $('#footer').innerHTML='<div class="wrap"><div class="f-grid"><div><a class="logo" href="#/" style="align-items:flex-start" data-r="home"><span class="lg1">URBAN</span><span class="lg2">LUXURY STAY</span></a><p>'+t('ft_tag')+'</p></div>'+
    '<div><h4>'+t('ft_explore')+'</h4><ul>'+ROUTES.slice(1).map(r=>'<li><a href="'+r[2]+'">'+t(r[1])+'</a></li>').join('')+'</ul></div>'+
    '<div><h4>'+t('ct_follow')+'</h4><ul><li><a href="'+CONFIG.instagram+'" target="_blank" rel="noopener">Instagram</a></li><li><a href="'+CONFIG.tiktok+'" target="_blank" rel="noopener">TikTok</a></li><li><a href="mailto:'+CONFIG.email+'">'+esc(CONFIG.email)+'</a></li><li><a href="'+wa('')+'" target="_blank" rel="noopener">WhatsApp</a></li></ul></div></div>'+
    '<div class="f-bot"><span>© 2026 '+CONFIG.brand+'. '+t('ft_rights')+'</span><span>Casablanca</span></div></div>';
  updateNav();
}
function updateNav(){$('#nav').classList.toggle('solid',parse().name!=='home'||window.scrollY>40)}
function setLang(l){
  lang=l;try{localStorage.setItem('uls_lang',l)}catch(e){}
  document.documentElement.lang=l;document.documentElement.dir=l==='ar'?'rtl':'ltr';
  applyI18n();renderChrome();render(true);
}
function applyI18n(){$$('[data-i]').forEach(e=>e.textContent=t(e.dataset.i))}

/* ═════════ VUES ═════════ */
const countLabel=(key,count)=>{
  const singular = Array.isArray(T[key+'_s']) ? T[key+'_s'] : null;
  const plural = Array.isArray(T[key]) ? T[key] : null;
  const chosen = count === 1 ? (singular || plural) : (plural || singular);
  if (!chosen) return String(count);
  return chosen[LI()] ?? chosen[0] ?? String(count);
};
function aptCard(a){
  const r=rating(a);
  return '<article class="apt"><div class="phw"><a class="ph" href="#/apartment/'+a.id+'" aria-label="'+esc(a.name)+'">'+pic(a,0)+'<span class="tag">'+t('type_'+a.type)+'</span></a>'+
   '<button class="heart '+(favs.has(a.id)?'on':'')+'" data-fav="'+a.id+'" aria-label="'+t('save')+'">'+I.heart+'</button></div>'+
   '<div class="cb"><h3><a href="#/apartment/'+a.id+'" style="text-decoration:none">'+esc(a.name)+'</a></h3><p class="area">'+a.area+', Casablanca</p>'+
   '<ul class="stats"><li>'+I.users+a.guests+' '+countLabel('u_guests',a.guests)+'</li><li>'+I.bed+a.bedrooms+' '+countLabel('u_bed',a.bedrooms)+'</li></ul>'+
   '<div class="pr"><span><b>'+money(a.price)+'</b> <span class="muted">'+t('per_night')+'</span></span><span class="rt">'+I.star+'<span>'+r.toFixed(1)+'</span></span></div><p class="price-note">'+t('price_note')+'</p></div></article>';
}
function guestOpts(max,sel){let o='';for(let i=1;i<=max;i++)o+='<option value="'+i+'"'+(i===sel?' selected':'')+'>'+i+'</option>';return o}

function homeView(){
  return '<div class="view">'+
  '<section class="sec dark" style="padding-top:clamp(56px,7vw,96px)"><div class="wrap"><div class="rule"></div><h2 class="title" style="margin-bottom:clamp(36px,5vw,64px)">'+t('feat_title')+'</h2><div class="grid">'+APTS.map(aptCard).join('')+'</div></div></section>'+
  '<section class="sec light"><div class="wrap"><div class="rule"></div><h2 class="title" style="max-width:16ch">'+t('val_title')+'</h2><div class="vals">'+
    [1,2,3,4].map(i=>'<div class="val"><h3>'+t('v'+i)+'</h3><p>'+t('v'+i+'t')+'</p></div>').join('')+'</div></div></section>'+
  '<section class="sec dark"><div class="wrap"><div class="band"><div><div class="mega">10</div><h2 class="title">'+t('lt_title')+'</h2><p class="lead">'+t('lt_text')+'</p><p style="margin-top:34px"><a class="btn solid" href="#/loyalty">'+t('lt_cta')+'</a></p></div><div class="arch">'+blockPic('loyalty',0,21)+'</div></div></div></section>'+
 '</div>';
}
function aptsView(){
  const list=APTS.filter(a=>(F.type==='all'||a.type===F.type)&&a.guests>=F.guests&&(!F.fav||favs.has(a.id)));
  return '<div class="page dark view"><div class="wrap"><div class="rule"></div><h1 class="title">'+t('ap_title')+'</h1><p class="lead">'+t('ap_sub')+'</p>'+
   '<div class="filters">'+['all','apartment','villa'].map(k=>'<button class="chip '+(F.type===k?'on':'')+'" data-type="'+k+'">'+t('f_'+k)+'</button>').join('')+
   '<button class="chip '+(F.fav?'on':'')+'" data-favf="1">'+I.heart+t('f_fav')+'</button>'+
   '<label class="gsel">'+t('f_guests')+'<select id="fGuests">'+guestOpts(10,F.guests)+'</select></label></div>'+
   '<div class="grid">'+(list.map(aptCard).join('')||'<p class="lead">'+t('none')+'</p>')+'</div></div></div>';
}
function galleryHTML(a){
  const N=galN(a);
  let th='';for(let i=0;i<N;i++)th+='<button data-gi="'+i+'" class="'+(i===galIdx?'on':'')+'" aria-label="'+(i+1)+'">'+pic(a,i)+'</button>';
  return '<div class="gal"><div class="g-main" id="gMain"><div id="gArt" style="width:100%;height:100%">'+pic(a,galIdx)+'</div>'+
   '<button class="g-nav p" data-gnav="-1" aria-label="‹">'+I.chev+'</button><button class="g-nav n" data-gnav="1" aria-label="›">'+I.chev+'</button><span class="g-count" id="gCount" dir="ltr">'+(galIdx+1)+' / '+N+'</span></div>'+
   '<div class="g-th">'+th+'</div></div>';
}
function detailView(a){
  initBooking(a);galIdx=0;
  const r=rating(a),rv=revs(a);
  const dfmt=x=>new Date(x.y,x.m-1,1).toLocaleDateString(LOC[lang],{month:'long',year:'numeric'});
  const feats=[[t('f_capacity'),a.guests+' '+countLabel('u_guests',a.guests)],[t('f_view'),t('v_'+a.view)],[t('f_area'),a.area],[t('f_checkin'),'15:00'],[t('f_checkout'),'12:00'],[t('f_clean'),t('f_clean_v')]];
  return '<div class="page dark view"><div class="wrap"><a class="back" href="#/apartments">'+I.chev+t('back')+'</a>'+
   '<div class="d-head"><div><div class="kicker">'+t('type_'+a.type)+', '+a.area+'</div><h1 class="title" style="margin-top:8px">'+esc(a.name)+'</h1><div class="meta"><span class="st">'+I.star+'</span><b>'+r.toFixed(1)+'</b><span>('+rv.length+' '+t('reviews_n')+')</span></div></div>'+
   '<div class="d-act"><button class="ghost '+(favs.has(a.id)?'on':'')+'" data-fav="'+a.id+'">'+I.heart+'<span>'+(favs.has(a.id)?t('saved'):t('save'))+'</span></button><button class="ghost" id="shareBtn">'+I.share+'<span>'+t('share')+'</span></button></div></div>'+
   galleryHTML(a)+
   '<div class="d-grid"><div>'+
    '<div class="d-sec"><ul class="facts"><li>'+I.users+a.guests+' '+countLabel('u_guests',a.guests)+'</li><li>'+I.bed+a.bedrooms+' '+countLabel('u_bed',a.bedrooms)+'</li><li>'+I.bed+a.beds+' '+countLabel('u_beds',a.beds)+'</li><li>'+I.bath+a.baths+' '+countLabel('u_bath',a.baths)+'</li></ul><h2>'+t('about_stay')+'</h2><p>'+L(a.desc)+'</p></div>'+
    '<div class="d-sec"><h2>'+t('d_features')+'</h2><div class="feat">'+feats.map(f=>'<div><span>'+f[0]+'</span><b style="font-weight:500">'+f[1]+'</b></div>').join('')+'</div></div>'+
    '<div class="d-sec"><h2>'+t('d_amen')+'</h2><ul class="amen">'+a.am.map(k=>'<li>'+L(AM[k])+'</li>').join('')+'</ul></div>'+
    '<div class="d-sec"><h2>'+t('d_reviews')+'</h2><div class="rv-sum"><b>'+r.toFixed(1)+'</b><span class="muted">'+rv.length+' '+t('reviews_n')+'</span></div>'+
     rv.map(x=>'<div class="rev"><div class="rev-h"><b>'+x.n+'</b><span>'+dfmt(x)+'</span></div><div class="st" aria-label="'+x.r+'/5">'+'★'.repeat(x.r)+'<span style="opacity:.25">'+'★'.repeat(5-x.r)+'</span></div><p>'+L(x.x)+'</p></div>').join('')+'</div>'+
   '</div><aside class="book" id="book">'+bookingHTML(a)+'</aside></div></div>'+
   '<div class="mbar"><div><span class="muted" style="font-size:13px">'+t('b_from')+'</span><br><b>'+money(a.price)+'</b> <span class="muted">'+t('per_night')+'</span></div><a class="btn solid" href="#book" data-goto="book">'+t('b_title')+'</a></div></div>';
}
function initBooking(a){
  if(bk.aptId!==a.id){
    if(bk.idUrl){try{URL.revokeObjectURL(bk.idUrl)}catch(e){}}
    bk={aptId:a.id,in:S.in||'',out:S.out||'',guests:Math.min(S.guests||2,a.guests),name:bk.name||'',file:null,idUrl:null,tried:false};
  }
}
function bookingHTML(a){
  return '<div class="b-price"><span>'+t('b_from')+'</span><b>'+money(a.price)+'</b><span>'+t('per_night')+'</span></div>'+
   '<div class="b-row"><label>'+t('s_arrival')+'<input type="date" id="bkIn" min="'+today+'" value="'+bk.in+'"></label><label>'+t('s_departure')+'<input type="date" id="bkOut" min="'+(bk.in?addDays(bk.in,1):addDays(today,1))+'" value="'+bk.out+'"></label></div>'+
   '<div class="date-status" id="bkBlockedStatus"></div>'+
   '<div class="date-calendar" id="bkCalendar"></div>'+
   '<div class="field"><label>'+t('s_guests')+'<select id="bkGuests">'+guestOpts(a.guests,bk.guests)+'</select></label><p class="hint">'+t('b_cap',{n:a.guests})+'</p></div>'+
   '<div class="field"><label>'+t('b_name')+'<input id="bkName" autocomplete="name" value="'+esc(bk.name)+'"></label></div>'+
   '<img id="bkImg" alt="" '+(bk.idUrl?'src="'+bk.idUrl+'"':'hidden')+'>'+
   '<div class="lines" id="bkLines"></div>'+
   '<p class="err" id="bkErr" role="alert"></p>'+
   '<a class="btn solid full" id="bkSend" href="#" target="_blank" rel="noopener">'+I.wa+t('b_send')+'</a>'+
   '<p class="hint">'+t('b_nopay')+'</p>'+
   '<div id="bkAfter"></div>';
}
const curApt=()=>APTS.find(a=>a.id===bk.aptId);
function bkValidate(a){
  if(!bk.in||!bk.out||nightsBetween(bk.in,bk.out)<1)return'e_dates';
  if(isBlocked(a,bk.in,bk.out))return'e_unavailable';
  if(bk.guests<1||bk.guests>a.guests)return'e_guests';
  if(!bk.name.trim())return'e_name';
  return null;
}
function waBooking(a){
  const c=calcStay(a,bk.in,bk.out);
return 'Bonjour '+CONFIG.brand+',\nJe souhaite réserver :\n- Logement : '+a.name+' ('+a.area+')\n- Arrivée : '+fmtDate(bk.in)+'\n- Départ : '+fmtDate(bk.out)+'\n- Voyageurs : '+bk.guests+'\n- Durée : '+c.n+' nuit(s)\n- Total : '+c.total.toLocaleString('fr-FR')+' MAD (ménage inclus)\n- Nom : '+bk.name.trim()+'\n\nVeuillez ajouter votre pièce d’identité afin de confirmer votre réservation.';}
function collectBlockedDates(a){
  const blocked=new Set();
  const ranges=(a&&a.blockedDates||[]).filter(r=>r&&r.from&&r.to);
  ranges.forEach(r => {
    dateNights(r.from, r.to).forEach(date => blocked.add(date));
  });
  return blocked;
}
function renderBlockedRanges(a){
  const box=$('#bkBlockedStatus');
  if(!box || !a) return;
  const ranges=(a.blockedDates||[]).filter(r=>r&&r.from&&r.to);
  if(!ranges.length){
    box.innerHTML='';
    return;
  }
  if(bk.tried && (bk.in || bk.out)){
    box.innerHTML='<div class="date-status--compact">Date non disponible</div>';
    return;
  }
  box.innerHTML='';
}
function renderAvailabilityCalendar(a){
  const cal=$('#bkCalendar');
  if(!cal || !a) return;
  const blocked=collectBlockedDates(a);
  const selectingOut = Boolean(bk.in && !bk.out);
  const y=bookingMonth.getFullYear();
  const m=bookingMonth.getMonth();
  const first=new Date(y,m,1);
  const last=new Date(y,m+1,0);
  const leading=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<leading;i++)cells.push('<span class="date-empty"></span>');
  for(let d=1;d<=last.getDate();d++){
    const date=new Date(y,m,d);
    const isoKey=iso(date);
    const past = date<new Date(today+'T00:00:00');
    const blockedPermanent = blocked.has(isoKey) && isDateBlocked(a, isoKey, selectingOut ? 'out' : 'in');
    const beforeArrival = selectingOut && bk.in && isoKey <= bk.in;
    const departureOverlap = selectingOut && bk.in && overlapsBlockedRange(a, bk.in, isoKey);
    const disabled = past || blockedPermanent || beforeArrival || departureOverlap;
    const clickAttr=disabled ? '' : ' data-date="'+isoKey+'"';
    cells.push('<button type="button" class="date-day '+(disabled?'date-day--blocked':'date-day--open')+'"'+clickAttr+' title="'+(disabled?'Indisponible':'Disponible')+'" '+(disabled?'disabled':'')+'>'+d+'</button>');
  }
  const monthLabel = first.toLocaleDateString(lang==='fr'?'fr-FR':'en-US',{month:'long',year:'numeric'});
  const days=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  cal.innerHTML='<div class="date-calendar__nav"><button type="button" class="date-month-arrow" data-cal-nav="-1" aria-label="Mois précédent">‹</button><div class="date-calendar__month">'+monthLabel+'</div><button type="button" class="date-month-arrow" data-cal-nav="1" aria-label="Mois suivant">›</button></div><div class="date-calendar__header">'+days.map(d=>'<span>'+d+'</span>').join('')+'</div><div class="date-calendar__grid">'+cells.join('')+'</div>';
}
function selectDateFromCalendar(dateStr){
  const a=curApt();
  if(!a || !dateStr) return;
  const selectionMode = bk.in && !bk.out ? 'out' : 'in';
  if(dateStr < today) return;
  if(selectionMode === 'in' && isDateBlocked(a,dateStr,'in')) return;
  if(selectionMode === 'out'){
    if(!bk.in || dateStr <= bk.in) return;
    if(isDateBlocked(a,dateStr,'out')) return;
    if(overlapsBlockedRange(a, bk.in, dateStr)) return;
  }
  if(!bk.in || bk.out){
    bk.in=dateStr; bk.out='';
  } else if(dateStr < bk.in){
    bk.in=dateStr; bk.out='';
  } else {
    bk.out=dateStr;
  }
  const inEl=$('#bkIn');
  const outEl=$('#bkOut');
  if(inEl){inEl.value=bk.in;} 
  if(outEl){outEl.value=bk.out; outEl.min=bk.in?addDays(bk.in,1):addDays(today,1);} 
  S.in=bk.in; S.out=bk.out;
  updateBooking();
}
function updateBooking(){
  const a=curApt();if(!a||!$('#bkLines'))return;
  renderBlockedRanges(a);
  renderAvailabilityCalendar(a);
  const n=Math.max(0,nightsBetween(bk.in,bk.out)),err=bkValidate(a);
  let lines='';
  if(n>0&&!(err==='e_dates')){
    const c=calcStay(a,bk.in,bk.out);
    const nightPrice=bookingNightRate(a,bk.in,bk.out);
    lines='<div><span>'+t('b_nights',{n:c.n,p:money(nightPrice)})+'</span><span>'+money(c.total)+'</span></div>'+
      (c.special?'<div class="muted" style="font-size:13.5px">'+t('price_note')+'</div>':'')+
      '<div><span>'+t('f_clean')+'</span><span>'+t('f_clean_v')+'</span></div><div class="tot"><span>'+t('b_total')+'</span><span>'+money(c.total)+'</span></div><div class="muted" style="font-size:14px">'+t('b_pts',{n:c.n*CONFIG.pointsPerNight})+'</div>';
  }
  $('#bkLines').innerHTML=lines;
  $('#bkErr').textContent=bk.tried&&err?t(err):'';
  const s=$('#bkSend');s.setAttribute('aria-disabled',err?'true':'false');s.href=err?'#':wa(waBooking(a));
  const im=$('#bkImg');if(bk.idUrl){im.src=bk.idUrl;im.hidden=false}else im.hidden=true;
}
function guideView(){
  const list=Array.isArray(GUIDE)?GUIDE.filter(p=>gcat==='all'||(p&&p.c===gcat)):[];
  const empty = !list.length;
  return '<div class="page light view"><div class="wrap"><div class="rule"></div><h1 class="title">'+t('g_title')+'</h1><p class="lead">'+t('g_sub')+'</p>'+
   '<div class="tabs">'+['all'].concat(CATS).map(c=>'<button class="chip '+(gcat===c?'on':'')+'" data-cat="'+c+'">'+(c==='all'?t('g_all'):t('c_'+c))+'</button>').join('')+'</div>'+
   (empty ? '<p class="lead">'+t('none')+'</p>' : '<div class="places">'+list.map(p=>'<article class="place"><span class="cat">'+t('c_'+(p.c||'activities'))+'</span><h3>'+(p.n||'')+'</h3><p>'+L(p.d||[])+'</p><a href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent((p.n||'Casablanca')+' Casablanca')+'" target="_blank" rel="noopener">'+I.pin+t('g_maps')+'</a></article>').join('')+'</div>')+
   '<p class="gnote"><a href="'+wa('Bonjour, j’aimerais une recommandation à Casablanca.')+'" target="_blank" rel="noopener" style="color:var(--acc)">'+t('g_note')+'</a></p></div></div>';
}
function simHTML(){
  const pts=simN*CONFIG.pointsPerNight;
  const target = 1000;
  const rem = Math.max(0, target - pts);
  const pct = Math.min(100, (pts / target) * 100);
  const free = pts >= target ? 1 : 0;
  const msg = free > 0 ? t('l_won',{n:free}) : t('l_next',{n:rem});
  return {pts:pts,pct:pct,msg:msg};
}
function loyaltyView(){
  const s=simHTML();
  return '<div class="page dark view"><div class="wrap"><div class="rule"></div><h1 class="title">'+t('l_title')+'</h1><p class="lead">'+t('l_sub')+'</p>'+
   '<div class="steps" style="margin-top:56px">'+[1,2,3].map(i=>'<div class="step"><h3>'+t('l_s'+i)+'</h3><p>'+t('l_s'+i+'t')+'</p></div>').join('')+'</div>'+
   '<div class="loy"><div><h2 class="h3">'+t('l_rewards')+'</h2><ul class="ladder" id="ladder">'+REWARDS.map(r=>'<li data-p="'+r.p+'" class="'+(s.pts>=r.p?'on':'')+'"><span class="pt">'+r.p+'<small>'+t('l_pts')+'</small></span><span>'+t(r.k)+'</span><span class="ck">'+t('l_unlocked')+'</span></li>').join('')+'</ul></div>'+
   '<div class="sim"><h2 class="h3" style="margin-bottom:24px">'+t('l_sim')+'</h2><label for="simRange"><span>'+t('l_nights')+'</span></label><input type="range" id="simRange" min="0" max="300" value="'+simN+'">'+
   '<div class="big" id="simPts">'+s.pts+'</div><div class="muted">'+t('l_yours')+'</div><div class="bar"><i id="simBar" style="width:'+s.pct+'%"></i></div><p class="msg" id="simMsg">'+s.msg+'</p>'+
'<p class="hint muted" style="font-size:14px;margin-top:14px">'+t('l_note')+'</p></div></div></div></div>';}
function aboutView(){
  return '<div class="page light view"><div class="wrap"><div class="band" style="align-items:start"><div class="prose"><div class="rule"></div><h1 class="title" style="margin-bottom:34px">'+t('a_h')+'</h1><p>'+t('a_p1')+'</p><p>'+t('a_p2')+'</p></div><div class="arch">'+blockPic('about',0,14)+'</div></div>'+
   '<div class="vals">'+[1,2,3,4].map(i=>'<div class="val"><h3>'+t('v'+i)+'</h3><p>'+t('v'+i+'t')+'</p></div>').join('')+'</div></div></div>';
}
function waContact(){return 'Bonjour '+CONFIG.brand+',\n'+(CT.name?'Je m’appelle '+CT.name+'.\n':'')+CT.msg}
function contactView(){
  return '<div class="page dark view"><div class="wrap"><div class="two"><div><div class="rule"></div><h1 class="title">'+t('ct_title')+'</h1><p class="lead">'+t('ct_sub')+'</p>'+
   '<ul class="ct-list"><li>'+I.mail+'<div><small>'+t('ct_email')+'</small><a href="mailto:'+CONFIG.email+'">'+esc(CONFIG.email)+'</a></div></li>'+
   '<li>'+I.wa+'<div><small>'+t('ct_wa')+'</small><a href="'+wa('')+'" target="_blank" rel="noopener">+'+CONFIG.whatsapp+'</a></div></li>'+
   '<li>'+I.pin+'<div><small>'+t('ct_addr')+'</small>'+t('ct_addr_v')+'</div></li>'+
   '<li>'+I.insta+'<div><small>'+t('ct_follow')+'</small><div class="soc" style="margin-top:8px"><a href="'+CONFIG.instagram+'" target="_blank" rel="noopener" aria-label="Instagram">'+I.insta+'</a><a href="'+CONFIG.tiktok+'" target="_blank" rel="noopener" aria-label="TikTok">'+I.tiktok+'</a></div></div></li></ul></div>'+
   '<div><div class="fld"><label for="cName">'+t('ct_name')+'</label><input id="cName" autocomplete="name" value="'+esc(CT.name)+'"></div><div class="fld"><label for="cMsg">'+t('ct_msg')+'</label><textarea id="cMsg" style="min-height:160px">'+esc(CT.msg)+'</textarea></div>'+
   '<a class="btn solid" id="cSend" target="_blank" rel="noopener" href="'+wa(waContact())+'">'+I.wa+t('ct_send')+'</a></div></div></div></div>';
}
function faqView(){
  return '<div class="page dark view"><div class="wrap"><div class="rule"></div><h1 class="title">FAQ</h1><p class="lead">Toutes les réponses à vos questions sur nos appartements, nos services et votre séjour à Casablanca.</p><div id="faqList"></div></div></div>';
}
function renderFAQ(){
  const box=$('#faqList');
  if(!box) return;

  const faqs=[
    ['faq_how','faq_how_a'],
    ['faq_cancel','faq_cancel_a'],
    ['faq_modify','faq_modify_a'],
    ['faq_times','faq_times_a'],
    ['faq_methods','faq_methods_a'],
    ['faq_fees','faq_fees_a'],
    ['faq_special','faq_special_a']
  ];

  box.innerHTML=faqs.map(([q,a])=>
    '<div class="faq-item">'+
    '<button type="button" class="faq-q">'+t(q)+'<span>+</span></button>'+
    '<div class="faq-a" style="display:none">'+t(a)+'</div>'+
    '</div>'
  ).join('');
}

/* ═════════ ROUTEUR ═════════ */
function render(keep){
  const r=parse(),app=$('#app');
  document.body.dataset.route=r.name;
  if(r.name!=='home')Hero.hide();
  let html;
  switch(r.name){
    case'home':html=homeView();break;
    case'apartments':html=aptsView();break;
    case'apartment':{const a=APTS.find(x=>x.id===r.id);html=a?detailView(a):aptsView();break}
    case'loyalty':html=loyaltyView();break;
    case'about':html=aboutView();break;
    case'faq':html=faqView();break;
    case'contact':html=contactView();break;
    default:html=homeView();
  }
  app.innerHTML=html;
  if(!keep)window.scrollTo(0,0);
  if(['apartments','apartment','loyalty','about','faq','contact'].indexOf(r.name)<0)Hero.show();
  renderChrome();
  if(r.name==='apartment'){
    updateBooking();
    if (window.ULS_DATABASE && typeof window.ULS_DATABASE.getBlockedDates === 'function') {
      hydrateBlockedDates().catch(() => {});
    }
  }
  if(r.name==='faq')renderFAQ();
}
document.addEventListener('click',e=>{
  const q=e.target.closest('.faq-q');
  if(!q)return;

  const a=q.nextElementSibling;
  const s=q.querySelector('span');

  const open=a.style.display!=='none';

  a.style.display=open?'none':'block';
  s.textContent=open?'+':'−';
});
window.addEventListener('hashchange',()=>{document.body.classList.remove('menu-open');render(false)});
window.addEventListener('scroll',updateNav,{passive:true});
if('scrollRestoration' in history)history.scrollRestoration='manual';

/* ═════════ ÉVÉNEMENTS ═════════ */
document.addEventListener('click',e=>{
  const tg=e.target;
  const calNav=tg.closest('[data-cal-nav]');
  if(calNav){
    e.preventDefault();
    const dir=Number(calNav.dataset.calNav)||0;
    bookingMonth.setMonth(bookingMonth.getMonth()+dir);
    const a=curApt();
    if(a){renderAvailabilityCalendar(a);}
    return;
  }
  const dateCell=tg.closest('.date-day--open');
  if(dateCell && dateCell.dataset.date){
    e.preventDefault();
    selectDateFromCalendar(dateCell.dataset.date);
    return;
  }
  const fav=tg.closest('[data-fav]');
  if(fav){e.preventDefault();const id=fav.dataset.fav;if(favs.has(id))favs.delete(id);else favs.add(id);saveFavs();
    $$('[data-fav="'+id+'"]').forEach(b=>{b.classList.toggle('on',favs.has(id));const sp=$('span',b);if(sp)sp.textContent=favs.has(id)?t('saved'):t('save')});
    if(F.fav&&parse().name==='apartments')render(true);return}
  const lg=tg.closest('[data-lang]');if(lg){setLang(lg.dataset.lang);return}
  if(tg.closest('#burger')){document.body.classList.add('menu-open');return}
  if(tg.closest('#mclose')){document.body.classList.remove('menu-open');return}
  const nl=tg.closest('a[data-r]');
if(nl){e.preventDefault();document.body.classList.remove('menu-open');location.hash=nl.getAttribute('href');return}
  const ty=tg.closest('[data-type]');if(ty){F.type=ty.dataset.type;render(true);return}
  if(tg.closest('[data-favf]')){F.fav=!F.fav;render(true);return}
  const gi=tg.closest('[data-gi]');if(gi){setGal(+gi.dataset.gi);return}
  const gn=tg.closest('[data-gnav]');if(gn){const ga=APTS.find(x=>x.id===parse().id);if(ga){const N=galN(ga);setGal((galIdx+ +gn.dataset.gnav+N)%N)}return}
  const gt=tg.closest('[data-goto]');if(gt){e.preventDefault();const b=$('#book');if(b)b.scrollIntoView({behavior:'smooth',block:'start'});return}
  if(tg.closest('#shareBtn')){shareApt();return}
  const sd=tg.closest('#bkSend');

if(sd){

  const a=curApt();
  const err=a&&bkValidate(a);

  if(err){
    e.preventDefault();
    bk.tried=true;
    updateBooking();
    return;
  }

  e.preventDefault();

  window.open(wa(waBooking(a)), '_blank');

  $('#bkAfter').innerHTML='<div class="ok-note">'+t('b_after')+'</div>';

  return;
}
});
function setGal(i){
  const a=curApt()||APTS.find(x=>x.id===parse().id);if(!a)return;galIdx=i;
  $('#gArt').innerHTML=pic(a,i);$('#gCount').textContent=(i+1)+' / '+galN(a);
  $$('.g-th button').forEach((b,k)=>b.classList.toggle('on',k===i));
}
async function shareApt(){
  const a=APTS.find(x=>x.id===parse().id);const url=location.href;
  try{if(navigator.share){await navigator.share({title:a.name+' — '+CONFIG.brand,url});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(url);toast(t('copied'))}catch(e){toast(url)}
}
document.addEventListener('input',e=>{
  const id=e.target.id;
  if(id==='bkIn'){
    const a=curApt();
    if(a && e.target.value && (e.target.value < today || isDateBlocked(a,e.target.value,'in'))){
      e.target.setCustomValidity(t('e_unavailable'));
      e.target.value='';
      bk.in='';
      S.in='';
      bk.out='';
      S.out='';
      updateBooking();
      return;
    }
    bk.in=e.target.value;S.in=bk.in;
    if(bk.out && bk.out <= bk.in){ bk.out=''; S.out=''; }
    const o=$('#bkOut');
    o.min=bk.in?addDays(bk.in,1):addDays(today,1);
    o.value=bk.out;
    S.out=bk.out;
    updateBooking();
  }
  else if(id==='bkOut'){
    const a=curApt();
    if(a && e.target.value && (!bk.in || e.target.value <= bk.in || isDateBlocked(a,e.target.value,'out') || overlapsBlockedRange(a, bk.in, e.target.value))){
      e.target.setCustomValidity(t('e_unavailable'));
      e.target.value='';
      bk.out='';
      S.out='';
      updateBooking();
      return;
    }
    bk.out=e.target.value;S.out=bk.out;updateBooking()
  }
  else if(id==='bkName'){bk.name=e.target.value;updateBooking()}
  else if(id==='simRange'){simN=+e.target.value;const s=simHTML();const simNEl=$('#simN');if(simNEl) simNEl.textContent=simN;$('#simPts').textContent=s.pts;$('#simBar').style.width=s.pct+'%';$('#simMsg').textContent=s.msg;$$('#ladder li').forEach(li=>li.classList.toggle('on',s.pts>=+li.dataset.p))}
  else if(id==='cName'){CT.name=e.target.value;$('#cSend').href=wa(waContact())}
  else if(id==='cMsg'){CT.msg=e.target.value;$('#cSend').href=wa(waContact())}
});
document.addEventListener('change',e=>{
  const id=e.target.id;
  if(id==='fGuests'){F.guests=+e.target.value;render(true)}
  else if(id==='bkGuests'){bk.guests=+e.target.value;S.guests=bk.guests;updateBooking()}
  else if(id==='bkFile'){const f=e.target.files&&e.target.files[0];if(f){if(bk.idUrl){try{URL.revokeObjectURL(bk.idUrl)}catch(x){}}bk.file=f;bk.idUrl=URL.createObjectURL(f);updateBooking()}}
});

/* ═════════ DÉMARRAGE ═════════ */
document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';
applyI18n();
render(false);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    hydrateBlockedDates().catch(() => {});
  });
} else {
  hydrateBlockedDates().catch(() => {});
}
})();

/* ═════════ MES POINTS ═════════ */

async function afficherMesPoints(){

const phone = prompt('Entrez votre numéro de téléphone :');
  if(!phone) return;

  try{

    const data = await ULS_DATABASE.getClient(phone);
    const points = Number(data && data.points) || 0;

    alert('Vos points : ' + points);

    return;

  }catch(error){

    alert(
  'Une erreur est survenue : ' +
error.message
);

  }

}
document.addEventListener('click',function(e){

  const btn = e.target.closest('[data-mes-points]');

  if(btn){
    e.preventDefault();
    afficherMesPoints();
  }

});