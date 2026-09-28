'use strict';
/* Urban Luxury Stay — réglages et contenu modifiables. */
/* ═════════ RÉGLAGES À MODIFIER ═════════ */
window.ULS_CONFIG={
  brand:'Urban Luxury Stay',
  email:'urbanluxurystay@gmail.com',
  whatsapp:'212784345538',
  instagram:'https://www.instagram.com/urbanluxurystay.ma/',
  tiktok:'https://www.tiktok.com/@urbanluxurystay',
  // ── Hero (écran d'accueil) ──
  // Photo plein écran (ex. CFC de nuit). Mettez votre fichier dans images/hero/ puis indiquez son nom ici.
  // Si le fichier est absent, une animation de secours s'affiche.
  heroImage:'images/hero/cfc-night.jpg',
  // Option vidéo (à la place de la photo) : videz heroImage:'' puis indiquez par ex. 'assets/hero.mp4'
  heroVideo:'',
  // Images des blocs en arche (laissez '' pour garder l'illustration)
  images:{loyalty:'',guide:'',about:''},

// ── FAQ ──
faq_title:[
  'FAQ',
  'FAQ',
  'الأسئلة الشائعة'
],

faq_sub:[
  'Toutes les réponses à vos questions sur nos appartements, nos services et votre séjour à Casablanca.',
  'All the answers to your questions about our apartments, services and your stay in Casablanca.',
  'جميع الإجابات عن أسئلتكم حول شققنا وخدماتنا وإقامتكم في الدار البيضاء.'
],

faq_booking:[
  'Réservation',
  'Booking',
  'الحجز'
],

faq_how:[
  'Comment réserver un appartement ?',
  'How can I book an apartment?',
  'كيف يمكنني حجز شقة؟'
],

faq_how_a:[
  'Réservez directement sur notre site. Nous vous confirmerons la disponibilité et vous enverrons un lien de paiement sécurisé pour finaliser votre réservation.',
  'Book directly through our website. We will confirm availability and send you a secure payment link to complete your reservation.',
  'يمكنكم الحجز مباشرة عبر موقعنا. سنؤكد لكم التوفر ونرسل لكم رابط دفع آمن لإتمام الحجز.'
],

faq_cancel:[
  'Quels sont les délais d’annulation ?',
  'What is the cancellation policy?',
  'ما هي شروط الإلغاء؟'
],

faq_cancel_a:[
  'L’annulation est gratuite jusqu’à 3 jours avant l’arrivée. Entre 3 et 2 jours avant l’arrivée, 50 % du montant est retenu. Moins de 2 jours avant l’arrivée, le montant total est retenu.',
  'Cancellation is free up to 3 days before arrival. Between 3 and 2 days before arrival, 50% of the total amount is retained. Less than 2 days before arrival, the full amount is retained.',
  'الإلغاء مجاني حتى 3 أيام قبل الوصول. بين 3 ويومين قبل الوصول، يتم الاحتفاظ بنسبة 50% من المبلغ. أقل من يومين قبل الوصول، يتم الاحتفاظ بالمبلغ كاملاً.'
],

faq_modify:[
  'Puis-je modifier mes dates après réservation ?',
  'Can I change my dates after booking?',
  'هل يمكنني تغيير تواريخ إقامتي بعد الحجز؟'
],

faq_modify_a:[
  'Oui, les modifications de dates sont possibles sous réserve de disponibilité, jusqu’à 7 jours avant l’arrivée.',
  'Yes, date changes are possible subject to availability, up to 7 days before arrival.',
  'نعم، يمكن تعديل تواريخ الإقامة حسب التوفر، وذلك حتى 7 أيام قبل الوصول.'
],

faq_times:[
  'Quelle est l’heure d’arrivée et de départ ?',
  'What are the check-in and check-out times?',
  'ما هي أوقات تسجيل الوصول والمغادرة؟'
],

faq_times_a:[
  'Le check-in est à partir de 15h et le check-out avant 12h.',
  'Check-in is from 3 PM and check-out is before 12 PM.',
  'تسجيل الوصول ابتداءً من الساعة 3 مساءً، وتسجيل المغادرة قبل الساعة 12 ظهرًا.'
],

faq_payment:[
  'Paiement & tarifs',
  'Payment & pricing',
  'الدفع والأسعار'
],

faq_methods:[
  'Quels modes de paiement acceptez-vous ?',
  'What payment methods do you accept?',
  'ما هي طرق الدفع المتاحة؟'
],

faq_methods_a:[
  'Nous acceptons le virement bancaire, la carte bancaire via un lien sécurisé et le paiement en espèces à l’arrivée. Un acompte de 30 % est demandé à la réservation.',
  'We accept bank transfer, credit or debit card via a secure payment link, and cash payment upon arrival. A 30% deposit is required at the time of booking.',
  'نقبل التحويل البنكي، والبطاقة البنكية عبر رابط دفع آمن، والدفع نقداً عند الوصول. يُطلب دفع عربون بنسبة 30% عند الحجز.'
],

faq_fees:[
  'Le prix inclut-il tous les frais ?',
  'Does the price include all fees?',
  'هل السعر يشمل جميع الرسوم؟'
],

faq_fees_a:[
  'Oui. Le Wi-Fi, le ménage, les charges et les taxes sont inclus. Aucun frais caché. Les services supplémentaires sont facturés séparément.',
  'Yes. Wi-Fi, cleaning, utilities and taxes are included. There are no hidden fees. Additional services are charged separately.',
  'نعم. يشمل السعر خدمة الواي فاي والتنظيف والمصاريف والضرائب. لا توجد أي رسوم مخفية. الخدمات الإضافية تُحتسب بشكل منفصل.'
],

faq_services:[
  'Services',
  'Services',
  'الخدمات'
],

faq_special:[
  'Proposez-vous des services pour les occasions spéciales ?',
  'Do you offer services for special occasions?',
  'هل تقدمون خدمات للمناسبات الخاصة؟'
],

faq_special_a:[
  'Oui. Nous proposons des services personnalisés pour les anniversaires, la Saint-Valentin et autres occasions spéciales. Ces services sont disponibles sur demande et facturés séparément.',
  'Yes. We offer personalized services for birthdays, Valentine’s Day and other special occasions. These services are available upon request and are charged separately.',
  'نعم. نقدم خدمات مخصصة لأعياد الميلاد، عيد الحب ومختلف المناسبات الخاصة. تتوفر هذه الخدمات عند الطلب ويتم احتسابها بشكل منفصل.'
],

  // ── Tarification dynamique ──
  // Majoration appliquée aux nuits de vendredi et samedi (1.25 = +25%).
  weekendMultiplier:1.25,
  // Jours de la semaine considérés « week-end » (0=dimanche … 6=samedi). La nuit du dimanche vers lundi reste au tarif de semaine.
  weekendNights:[5,6],
  // Périodes de haute saison, au format MM-DD (se répète chaque année). Modifiez / ajoutez des lignes librement.
  highSeason:[
    {from:'06-15',to:'09-15',multiplier:1.3,label:{fr:'Haute saison été',en:'Summer high season',ar:'موسم الصيف المرتفع'}}
  ],
  // Dates ponctuelles plus chères (Saint-Valentin, réveillon, etc.), au format MM-DD.
  specialDates:[
    {date:'02-14',multiplier:1.6,label:{fr:'Saint-Valentin',en:'Valentine’s Day',ar:'عيد الحب'}},
    {date:'12-31',multiplier:1.6,label:{fr:'Réveillon du Nouvel An',en:'New Year’s Eve',ar:'ليلة رأس السنة'}}
  ],
  scrubDistance:3200,                             // distance de scroll pour parcourir toute la vidéo
  pointsPerNight:10,
  freeNightAt:10
};


// ── Logements ──
// photos : liste des images de la fiche (la 1re sert de vignette). Exemple :
//   photos:['images/apartments/penthouse-marina/1.jpg','images/apartments/penthouse-marina/2.jpg']
// Tant que la liste est vide, une illustration s'affiche à la place.
// reviews (optionnel) : vos vrais avis, sous la forme {n:'Prénom N.',y:2026,m:7,r:5,x:['texte FR','texte EN','texte AR']}
window.ULS_APTS=[
 {id:'villa-anfa-royale',name:'Villa Anfa Royale',type:'villa',area:'Anfa',price:4000,guests:12,bedrooms:6,beds:6,baths:9,size:550,view:'sea',hs:3,seed:8,photos:['images/apartments/villa-anfa-royale/piscine.PNG',
  'images/apartments/villa-anfa-royale/vu1.png',
  'images/apartments/villa-anfa-royale/entrer1.PNG',
  'images/apartments/villa-anfa-royale/entrer2.PNG',
  'images/apartments/villa-anfa-royale/jardin.PNG',
  'images/apartments/villa-anfa-royale/salon.PNG',
  'images/apartments/villa-anfa-royale/miroir.png',
  'images/apartments/villa-anfa-royale/jardin2.png',
  'images/apartments/villa-anfa-royale/jardin3.png',
  'images/apartments/villa-anfa-royale/salleamanger.jpg',
  'images/apartments/villa-anfa-royale/jardin4.png',
  'images/apartments/villa-anfa-royale/chambre1.png',
  'images/apartments/villa-anfa-royale/salon2.png',
  'images/apartments/villa-anfa-royale/toilette1.png',
  'images/apartments/villa-anfa-royale/toilette2.png',
  'images/apartments/villa-anfa-royale/elevator.png',
  'images/apartments/villa-anfa-royale/chambre2.png',
  'images/apartments/villa-anfa-royale/chambre3.png',
  'images/apartments/villa-anfa-royale/vu2.png',
  'images/apartments/villa-anfa-royale/chambre4.png',
  'images/apartments/villa-anfa-royale/escalier.png',
  'images/apartments/villa-anfa-royale/chambre5.png',
  'images/apartments/villa-anfa-royale/salon4.png',
  'images/apartments/villa-anfa-royale/tapis.png',
  'images/apartments/villa-anfa-royale/garage.png'
 ],
  // Périodes déjà réservées pour ce logement : à compléter à la main après CHAQUE confirmation WhatsApp.
  // Exemple : {from:'2026-10-05',to:'2026-10-08'}  (from inclus, to = jour de départ, exclu)
  blockedDates:[],
  desc:['Villa contemporaine dans le quartier résidentiel d’Anfa, avec piscine privée et jardin paysager. Idéale pour les familles et les séjours entre amis, avec un service digne d’un palace.','A contemporary villa in the residential district of Anfa, with a private pool and landscaped garden. Ideal for families and stays with friends, with palace-level service.','فيلا عصرية في حي أنفا السكني، بمسبح خاص وحديقة منسقة. مثالية للعائلات والإقامات مع الأصدقاء، بخدمة بمستوى القصور.'],
  am:['wifi','ac','pool','garden','kitchen','parking','concierge','washer','tv','linen','elevator','security']},
{id:'suite-corniche-ocean',name:'Princesses Signature',type:'apartment',area:'Princesses',price:600,guests:3,bedrooms:1,beds:1,baths:1,size:75,view:'city',hs:1,seed:1,photos:['images/apartments/suite-corniche-ocean/chambre3.jpg',
  'images/apartments/suite-corniche-ocean/salon.jpg',
  'images/apartments/suite-corniche-ocean/entrer.PNG',
  'images/apartments/suite-corniche-ocean/cuisine.jpg',
  'images/apartments/suite-corniche-ocean/chambre1.jpg',
  'images/apartments/suite-corniche-ocean/chambre2.jpg',
  'images/apartments/suite-corniche-ocean/toilette1.jpg',
  'images/apartments/suite-corniche-ocean/toilette2.jpg',
  'images/apartments/suite-corniche-ocean/equipement.jpg',
  'images/apartments/suite-corniche-ocean/balcon.jpg'
 ],
  // Périodes déjà réservées pour ce logement : à compléter à la main après CHAQUE confirmation WhatsApp.
  // Exemple : {from:'2026-10-05',to:'2026-10-08'}  (from inclus, to = jour de départ, exclu)
  blockedDates:[],
  desc:['Studio lumineux au cœur du quartier Les Princesses, à Casablanca. Un espace élégant et chaleureux, avec un salon ouvert sur un balcon.','Bright studio in the heart of the Les Princesses neighborhood in Casablanca. An elegant and welcoming space, with a living room opening onto a balcony.','استوديو مضيء في قلب حي الأميرات بالدار البيضاء. مساحة أنيقة ودافئة، مع غرفة معيشة تطل على شرفة.'],
  reviews:[{n:'Noura S.',y:2026,m:6,r:5,x:['Très belle adresse, calme et bien située. On a adoré la lumière et le balcon.','A very beautiful address, calm and well located. We loved the light and the balcony.','عنوان جميل جدًا، هادئ وموقعه ممتاز. أعجبنا الضوء والشرفة.']},{n:'Samir D.',y:2026,m:9,r:5,x:['Appartement très propre et très confortable. La communication avec l’équipe était parfaite.','Very clean and very comfortable apartment. Communication with the team was perfect.','شقة نظيفة ومريحة جدًا. التواصل مع الفريق كان ممتازًا.']},{n:'Hajar M.',y:2026,m:10,r:4,x:['La décoration pour l’anniversaire était magnifique. L’appartement avait une ambiance très chic et accueillante.','The anniversary decoration was amazing. The apartment had a very chic and welcoming atmosphere.','كانت الزينة الخاصة بعيد الميلاد رائعة. كانت الشقة أنيقة جدًا وودودة.']},{n:'Thomas R.',y:2026,m:3,r:5,x:['Une adresse rare : le confort d’un hôtel cinq étoiles avec l’espace d’un studio.','A rare address: the comfort of a five-star hotel with the space of a studio.','عنوان نادر: راحة فندق خمس نجوم مع مساحة استوديو.']},{n:'Amina K.',y:2026,m:11,r:5,x:['Très belle expérience, très bien accueillis et très satisfait de l’ambiance générale.','A very good experience, warmly welcomed and very satisfied with the overall atmosphere.','تجربة رائعة جدًا، استقبلنا بطريقة ممتازة ونحن راضون جدًا عن الجو العام.']}],
  am:['wifi','ac','terrace','kitchen','coffee','tv','linen','security','washer']},
 {id:'bourgogne-signature',name:'Studio Val Fleuri Signature',type:'apartment',area:'Val fleuri',price:700,weekendPrice:800,guests:3,bedrooms:1,beds:1,baths:1,size:110,view:'city',hs:1,seed:6,photos:['images/apartments/bourgogne-signature/salon3.JPG',
  'images/apartments/bourgogne-signature/salon2.JPG',
  'images/apartments/bourgogne-signature/salon4.JPG',
  'images/apartments/bourgogne-signature/sal.JPG',
  'images/apartments/bourgogne-signature/salon6.JPG',
  'images/apartments/bourgogne-signature/salon.JPG',
  'images/apartments/bourgogne-signature/cuisinee.JPG',
  'images/apartments/bourgogne-signature/cuisine.JPG',
  'images/apartments/bourgogne-signature/cuisine2.JPG',
  'images/apartments/bourgogne-signature/cuisine5.JPG',
  'images/apartments/bourgogne-signature/chambre1.JPG',
  'images/apartments/bourgogne-signature/chambre2.JPG',
  'images/apartments/bourgogne-signature/chambre3.JPG',
  'images/apartments/bourgogne-signature/chambre6.JPG',
  'images/apartments/bourgogne-signature/chambre7.JPG',
  'images/apartments/bourgogne-signature/toilette1.JPG',
  'images/apartments/bourgogne-signature/toilette2.JPG'
 ],
  // Périodes déjà réservées pour ce logement : à compléter à la main après CHAQUE confirmation WhatsApp.
  // Exemple : {from:'2026-10-05',to:'2026-10-08'}  (from inclus, to = jour de départ, exclu)
  blockedDates:[],
  desc:['Studio signature dans le quartier Val fleuri, au calme et proche de tout. Une chambre raffinée, un lit confortable et un salon pensé pour recevoir.','Studio signature in the Val fleuri district, quiet and close to everything. One refined bedroom, one comfortable bed and a living room made for entertaining.','استوديو مميز في حي فال فلوري، هادئ وقريب من كل شيء. غرفة نوم راقية، سرير مريح، وصالون مصمم لاستقبال الضيوف.'],
  reviews:[{n:'Leila B.',y:2026,m:5,r:5,x:['Très beau logement, bien décoré et idéalement placé pour visiter la ville.','A very beautiful apartment, well decorated and ideally located to explore the city.','مسكن جميل جدًا، مزين بشكل رائع وموقعه مثالي لاستكشاف المدينة.']},{n:'Omar C.',y:2026,m:7,r:4.8,x:['Accueil agréable, appartement fonctionnel et très confortable. On a beaucoup apprécié le calme.','Friendly welcome, functional and very comfortable apartment. We really appreciated the calm.','استقبال لطيف، شقة عملية ومريحة جدًا. أحببنا الهدوء كثيرًا.']}],
  am:['wifi','ac','kitchen','coffee','tv','linen','washer','security']}
];

// ── Avis d'exemple (à remplacer par de vrais avis, ou utilisez le champ reviews de chaque logement) ──
window.ULS_REVIEWS=[
 {n:'Sarah M.',y:2026,m:7,r:5,x:['Un séjour parfait. Le logement est encore plus beau que sur les photos et l’équipe est aux petits soins.','A perfect stay. The place is even better than the photos and the team looks after every detail.','إقامة مثالية. المسكن أجمل من الصور والفريق يهتم بأدق التفاصيل.']},
 {n:'Karim B.',y:2026,m:8,r:5,x:['Emplacement idéal, literie exceptionnelle, ménage impeccable. Nous reviendrons.','Ideal location, exceptional bedding, spotless cleaning. We will be back.','موقع ممتاز وفراش استثنائي ونظافة لا تشوبها شائبة. سنعود بالتأكيد.']},
 {n:'Julien D.',y:2026,m:6,r:4,x:['Très élégant et très calme. Le check-in via WhatsApp s’est fait sans aucune attente.','Very elegant and very quiet. Check-in via WhatsApp was smooth, with no waiting.','أنيق وهادئ جدًا. تمّ تسجيل الوصول عبر واتساب بسلاسة ودون انتظار.']},
 {n:'Nadia E.',y:2026,m:5,r:5,x:['La conciergerie a tout organisé pour notre anniversaire : un vrai service de palace.','The concierge organised everything for our anniversary: true palace-level service.','نظّم الكونسييرج كل شيء لعيد زواجنا: خدمة بمستوى القصور حقًا.']},
 {n:'Marwa A.',y:2026,m:5,r:5,x:['Rien à dire au top.','Nothing to say, it was top-notch.','لا يوجد ما يقال، كان رائعًا تمامًا.']}
];

// ── Guide Casablanca (à vérifier / compléter) : c = catégorie, n = nom, d = [fr, en, ar] ──
window.ULS_GUIDE=[
 {c:'restaurants',n:'Rick’s Café',d:['Bar-restaurant inspiré du film Casablanca : piano, ambiance cinéma et cuisine soignée.','A bar-restaurant inspired by the film Casablanca: piano, cinematic mood and refined cooking.','مطعم وبار مستوحى من فيلم «كازابلانكا»: بيانو وأجواء سينمائية ومطبخ راقٍ.']},
 {c:'restaurants',n:'La Sqala',d:['Ancien bastion transformé en restaurant-jardin marocain, face au port.','An old bastion turned into a Moroccan garden restaurant facing the port.','حصن قديم تحوّل إلى مطعم مغربي بحديقة يطل على الميناء.']},
 {c:'restaurants',n:'Le Cabestan',d:['Institution de la Corniche : poissons et fruits de mer face à l’océan.','A Corniche institution: fish and seafood facing the ocean.','مطعم عريق في الكورنيش: أسماك ومأكولات بحرية أمام المحيط.']},
 {c:'restaurants',n:'Restaurant Al Mounia',d:['Cuisine marocaine traditionnelle dans une adresse historique du centre-ville.','Traditional Moroccan cuisine at a historic downtown address.','مطبخ مغربي تقليدي في عنوان تاريخي وسط المدينة.']},
 {c:'cafes',n:'Pâtisserie Bennis Habous',d:['Pâtisseries marocaines et thé à la menthe dans le quartier des Habous.','Moroccan pastries and mint tea in the Habous quarter.','حلويات مغربية وشاي بالنعناع في حي الأحباس.']},
 {c:'cafes',n:'Le Petit Poucet',d:['Café-restaurant historique, connu pour avoir accueilli Saint-Exupéry.','A historic café-restaurant, known for having welcomed Saint-Exupéry.','مقهى ومطعم تاريخي اشتهر باستقباله سانت إكزوبيري.']},
 {c:'sights',n:'Mosquée Hassan II',d:['Symbole de la ville, posée sur l’Atlantique. Visites guidées ouvertes aux non-musulmans.','The city’s landmark, standing over the Atlantic. Guided tours are open to non-Muslims.','رمز المدينة المطل على الأطلسي. تُنظَّم زيارات مرشدة لغير المسلمين.']},
 {c:'sights',n:'Corniche d’Aïn Diab',d:['La promenade en bord d’océan, idéale au coucher du soleil.','The seaside promenade, ideal at sunset.','ممشى الكورنيش على المحيط، مثالي عند الغروب.']},
 {c:'sights',n:'Quartier des Habous',d:['La nouvelle médina : arcades, boutiques d’artisanat et architecture néo-mauresque.','The “new medina”: arcades, craft shops and neo-Moorish architecture.','«المدينة الجديدة»: أروقة ومتاجر حرف وعمارة مغربية جديدة.']},
 {c:'sights',n:'Place Mohammed V',d:['Cœur administratif de la ville, entouré de bâtiments Art déco.','The city’s administrative heart, surrounded by Art Deco buildings.','القلب الإداري للمدينة تحيط به مبانٍ بطراز الآرت ديكو.']},
 {c:'museums',n:'Musée Abderrahman Slaoui',d:['Affiches, objets décoratifs et arts marocains dans une belle demeure.','Posters, decorative objects and Moroccan arts in a beautiful house.','ملصقات وقطع زخرفية وفنون مغربية في دار جميلة.']},
 {c:'museums',n:'Musée du Judaïsme Marocain',d:['Un lieu unique dans le monde arabe, dédié à l’histoire des juifs du Maroc.','A unique place in the Arab world, devoted to the history of Moroccan Jews.','مكان فريد في العالم العربي مخصص لتاريخ يهود المغرب.']},
 {c:'museums',n:'Villa des Arts',d:['Expositions d’art contemporain dans une villa Art déco.','Contemporary art exhibitions in an Art Deco villa.','معارض فن معاصر في فيلا بطراز الآرت ديكو.']},
 {c:'rooftops',n:'Sky 28',d:['Bar panoramique en haut d’une tour, avec vue sur toute la ville.','A panoramic bar at the top of a tower, overlooking the whole city.','بار بانورامي في أعلى برج يطل على المدينة بأكملها.']},
 {c:'shopping',n:'Morocco Mall',d:['L’un des plus grands centres commerciaux d’Afrique, au bord de l’océan.','One of Africa’s largest shopping malls, by the ocean.','من أكبر المراكز التجارية في إفريقيا، على ضفة المحيط.']},
 {c:'shopping',n:'Marina Shopping',d:['Boutiques et restaurants au bord du port de plaisance.','Boutiques and restaurants by the marina.','متاجر ومطاعم على ضفة ميناء اليخوت.']},
 {c:'shopping',n:'Anfa Place',d:['Centre commercial en front de mer, sur la Corniche.','A seafront shopping centre on the Corniche.','مركز تجاري مطل على البحر في الكورنيش.']},
 {c:'activities',n:'Royal Golf d’Anfa',d:['Un parcours historique au cœur de la ville.','A historic course in the heart of the city.','ملعب غولف تاريخي في قلب المدينة.']},
 {c:'activities',n:'Hammam traditionnel',d:['Gommage au savon noir et massage : le rituel marocain de détente.','Black-soap scrub and massage: the Moroccan ritual of relaxation.','تقشير بالصابون البلدي ومساج: طقس الاسترخاء المغربي.']},
 {c:'activities',n:'Excursion à El Jadida',d:['Une journée pour découvrir la Cité portugaise, classée à l’UNESCO.','A day trip to discover the Portuguese City, a UNESCO site.','رحلة يوم لاكتشاف المدينة البرتغالية المصنفة لدى اليونسكو.']}
];
