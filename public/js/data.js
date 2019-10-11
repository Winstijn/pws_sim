//
//  PWS AI
//  data.js
//
//  Created by Winstijn Smit
//  Copyright © 2019 Kaziaat B.V. All rights reserved.
//



__AI_COUNT = 1000

// This will contain the pixelArray of the current track.
__TRACK_INDEX = 0
__TRACK_PIXELS = []
// __SIM_RESOLUTION = { width: 700, heigth: 700} 




var testTrack = `[{"0":98,"1":486},{"0":98,"1":487},{"0":98,"1":488},{"0":98,"1":488},{"0":98,"1":489},{"0":98,"1":494},{"0":97,"1":500},{"0":95,"1":508},{"0":92,"1":518},{"0":91,"1":522},{"0":89,"1":531},{"0":89,"1":535},{"0":88,"1":545},{"0":87,"1":552},{"0":87,"1":557},{"0":87,"1":561},{"0":87,"1":566},{"0":87,"1":569},{"0":87,"1":572},{"0":88,"1":575},{"0":88,"1":579},{"0":89,"1":583},{"0":91,"1":587},{"0":92,"1":590},{"0":95,"1":595},{"0":97,"1":600},{"0":101,"1":605},{"0":105,"1":610},{"0":108,"1":612},{"0":112,"1":615},{"0":115,"1":617},{"0":118,"1":618},{"0":121,"1":619},{"0":124,"1":621},{"0":130,"1":621},{"0":135,"1":622},{"0":139,"1":623},{"0":144,"1":623},{"0":148,"1":623},{"0":154,"1":623},{"0":160,"1":623},{"0":168,"1":623},{"0":180,"1":620},{"0":193,"1":617},{"0":205,"1":613},{"0":215,"1":609},{"0":223,"1":605},{"0":231,"1":599},{"0":243,"1":587},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":572},{"0":257,"1":571},{"0":257,"1":567},{"0":258,"1":562},{"0":258,"1":557},{"0":259,"1":553},{"0":260,"1":549},{"0":260,"1":544},{"0":262,"1":540},{"0":264,"1":534},{"0":265,"1":531},{"0":266,"1":527},{"0":267,"1":524},{"0":268,"1":522},{"0":270,"1":520},{"0":271,"1":517},{"0":275,"1":514},{"0":277,"1":513},{"0":281,"1":511},{"0":284,"1":510},{"0":288,"1":508},{"0":293,"1":508},{"0":298,"1":507},{"0":303,"1":507},{"0":307,"1":507},{"0":311,"1":507},{"0":315,"1":507},{"0":317,"1":507},{"0":320,"1":507},{"0":322,"1":508},{"0":325,"1":509},{"0":329,"1":510},{"0":332,"1":511},{"0":335,"1":512},{"0":337,"1":514},{"0":339,"1":515},{"0":341,"1":517},{"0":343,"1":519},{"0":345,"1":522},{"0":348,"1":526},{"0":350,"1":529},{"0":352,"1":532},{"0":353,"1":535},{"0":354,"1":537},{"0":358,"1":542},{"0":361,"1":546},{"0":364,"1":549},{"0":366,"1":553},{"0":369,"1":557},{"0":371,"1":561},{"0":374,"1":565},{"0":377,"1":571},{"0":382,"1":577},{"0":387,"1":584},{"0":394,"1":592},{"0":400,"1":600},{"0":404,"1":604},{"0":406,"1":606},{"0":407,"1":607},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":406,"1":608},{"0":409,"1":608},{"0":415,"1":607},{"0":422,"1":606},{"0":426,"1":605},{"0":431,"1":604},{"0":436,"1":602},{"0":441,"1":600},{"0":445,"1":598},{"0":449,"1":595},{"0":455,"1":591},{"0":460,"1":587},{"0":466,"1":582},{"0":470,"1":579},{"0":473,"1":575},{"0":476,"1":571},{"0":479,"1":568},{"0":482,"1":564},{"0":483,"1":561},{"0":484,"1":558},{"0":485,"1":557},{"0":485,"1":555},{"0":485,"1":554},{"0":485,"1":552},{"0":485,"1":548},{"0":485,"1":545},{"0":484,"1":541},{"0":483,"1":538},{"0":482,"1":536},{"0":481,"1":534},{"0":479,"1":531},{"0":478,"1":530},{"0":477,"1":527},{"0":475,"1":524},{"0":473,"1":521},{"0":471,"1":517},{"0":469,"1":513},{"0":467,"1":510},{"0":466,"1":506},{"0":464,"1":502},{"0":462,"1":499},{"0":460,"1":495},{"0":458,"1":491},{"0":455,"1":487},{"0":453,"1":484},{"0":450,"1":479},{"0":448,"1":475},{"0":444,"1":470},{"0":440,"1":463},{"0":435,"1":456},{"0":429,"1":447},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":438},{"0":424,"1":436},{"0":426,"1":432},{"0":428,"1":428},{"0":431,"1":422},{"0":434,"1":418},{"0":438,"1":413},{"0":443,"1":409},{"0":451,"1":404},{"0":460,"1":400},{"0":469,"1":396},{"0":479,"1":393},{"0":488,"1":390},{"0":496,"1":388},{"0":504,"1":387},{"0":512,"1":387},{"0":519,"1":387},{"0":525,"1":387},{"0":531,"1":387},{"0":536,"1":388},{"0":540,"1":390},{"0":543,"1":392},{"0":545,"1":394},{"0":547,"1":396},{"0":550,"1":398},{"0":552,"1":400},{"0":553,"1":402},{"0":555,"1":403},{"0":557,"1":405},{"0":560,"1":407},{"0":563,"1":409},{"0":567,"1":410},{"0":570,"1":412},{"0":573,"1":413},{"0":576,"1":415},{"0":582,"1":416},{"0":585,"1":417},{"0":589,"1":417},{"0":592,"1":417},{"0":593,"1":417},{"0":594,"1":416},{"0":597,"1":414},{"0":598,"1":412},{"0":600,"1":409},{"0":601,"1":407},{"0":602,"1":403},{"0":602,"1":399},{"0":604,"1":395},{"0":606,"1":390},{"0":608,"1":385},{"0":609,"1":380},{"0":611,"1":376},{"0":612,"1":373},{"0":613,"1":370},{"0":614,"1":367},{"0":615,"1":364},{"0":616,"1":361},{"0":616,"1":357},{"0":617,"1":353},{"0":618,"1":348},{"0":619,"1":343},{"0":620,"1":337},{"0":621,"1":330},{"0":623,"1":322},{"0":624,"1":316},{"0":624,"1":310},{"0":625,"1":305},{"0":626,"1":301},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":298},{"0":626,"1":297},{"0":626,"1":292},{"0":624,"1":280},{"0":623,"1":276},{"0":621,"1":266},{"0":619,"1":259},{"0":618,"1":253},{"0":616,"1":246},{"0":614,"1":236},{"0":613,"1":230},{"0":612,"1":223},{"0":611,"1":219},{"0":610,"1":216},{"0":610,"1":215},{"0":609,"1":214},{"0":608,"1":214},{"0":607,"1":212},{"0":605,"1":209},{"0":603,"1":205},{"0":601,"1":201},{"0":599,"1":196},{"0":597,"1":192},{"0":595,"1":189},{"0":594,"1":185},{"0":591,"1":180},{"0":588,"1":175},{"0":585,"1":169},{"0":580,"1":163},{"0":574,"1":156},{"0":571,"1":151},{"0":566,"1":147},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":564,"1":144},{"0":554,"1":152},{"0":542,"1":164},{"0":531,"1":173},{"0":525,"1":178},{"0":517,"1":184},{"0":511,"1":188},{"0":507,"1":191},{"0":503,"1":196},{"0":499,"1":200},{"0":496,"1":204},{"0":494,"1":206},{"0":492,"1":208},{"0":489,"1":211},{"0":486,"1":214},{"0":482,"1":219},{"0":478,"1":223},{"0":474,"1":228},{"0":471,"1":232},{"0":469,"1":236},{"0":467,"1":240},{"0":464,"1":244},{"0":463,"1":248},{"0":460,"1":251},{"0":459,"1":254},{"0":457,"1":257},{"0":454,"1":260},{"0":452,"1":263},{"0":449,"1":266},{"0":447,"1":268},{"0":445,"1":269},{"0":443,"1":271},{"0":440,"1":273},{"0":438,"1":275},{"0":436,"1":277},{"0":434,"1":279},{"0":432,"1":280},{"0":431,"1":281},{"0":429,"1":282},{"0":426,"1":283},{"0":422,"1":285},{"0":419,"1":287},{"0":414,"1":289},{"0":410,"1":291},{"0":404,"1":294},{"0":396,"1":295},{"0":387,"1":298},{"0":376,"1":300},{"0":365,"1":302},{"0":355,"1":302},{"0":351,"1":302},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":345,"1":301},{"0":344,"1":298},{"0":342,"1":294},{"0":338,"1":288},{"0":334,"1":281},{"0":330,"1":276},{"0":326,"1":270},{"0":323,"1":264},{"0":319,"1":258},{"0":317,"1":252},{"0":316,"1":245},{"0":315,"1":237},{"0":314,"1":229},{"0":314,"1":223},{"0":314,"1":218},{"0":314,"1":209},{"0":316,"1":200},{"0":320,"1":190},{"0":322,"1":184},{"0":325,"1":179},{"0":327,"1":175},{"0":328,"1":171},{"0":330,"1":167},{"0":333,"1":163},{"0":336,"1":157},{"0":340,"1":149},{"0":346,"1":140},{"0":351,"1":132},{"0":354,"1":127},{"0":358,"1":121},{"0":360,"1":118},{"0":363,"1":115},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":366,"1":113},{"0":364,"1":111},{"0":360,"1":109},{"0":353,"1":106},{"0":346,"1":103},{"0":340,"1":100},{"0":334,"1":98},{"0":328,"1":97},{"0":322,"1":96},{"0":318,"1":96},{"0":313,"1":96},{"0":309,"1":96},{"0":304,"1":96},{"0":297,"1":97},{"0":293,"1":98},{"0":288,"1":101},{"0":284,"1":103},{"0":281,"1":104},{"0":277,"1":105},{"0":273,"1":107},{"0":269,"1":110},{"0":264,"1":113},{"0":261,"1":116},{"0":256,"1":120},{"0":252,"1":123},{"0":247,"1":127},{"0":241,"1":133},{"0":235,"1":139},{"0":232,"1":143},{"0":228,"1":146},{"0":226,"1":148},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":224,"1":151},{"0":222,"1":151},{"0":213,"1":157},{"0":194,"1":171},{"0":184,"1":181},{"0":175,"1":190},{"0":166,"1":198},{"0":161,"1":204},{"0":159,"1":207},{"0":158,"1":210},{"0":157,"1":213},{"0":156,"1":217},{"0":155,"1":223},{"0":155,"1":230},{"0":155,"1":235},{"0":155,"1":241},{"0":156,"1":248},{"0":159,"1":253},{"0":164,"1":259},{"0":170,"1":265},{"0":178,"1":271},{"0":182,"1":275},{"0":189,"1":280},{"0":194,"1":284},{"0":199,"1":288},{"0":203,"1":290},{"0":208,"1":294},{"0":214,"1":298},{"0":218,"1":301},{"0":222,"1":305},{"0":225,"1":308},{"0":229,"1":312},{"0":232,"1":316},{"0":237,"1":321},{"0":243,"1":327},{"0":246,"1":331},{"0":251,"1":336},{"0":253,"1":340},{"0":255,"1":343},{"0":257,"1":345},{"0":259,"1":349},{"0":261,"1":354},{"0":262,"1":359},{"0":264,"1":364},{"0":265,"1":369},{"0":266,"1":372},{"0":267,"1":375},{"0":267,"1":378},{"0":267,"1":382},{"0":267,"1":385},{"0":267,"1":388},{"0":267,"1":390},{"0":266,"1":391},{"0":266,"1":392},{"0":265,"1":393},{"0":263,"1":396},{"0":261,"1":399},{"0":259,"1":400},{"0":258,"1":402},{"0":257,"1":403},{"0":255,"1":403},{"0":249,"1":406},{"0":243,"1":411},{"0":237,"1":415},{"0":230,"1":418},{"0":225,"1":419},{"0":221,"1":420},{"0":218,"1":421},{"0":216,"1":421},{"0":214,"1":421},{"0":211,"1":421},{"0":207,"1":421},{"0":203,"1":421},{"0":200,"1":421},{"0":197,"1":421},{"0":194,"1":421},{"0":192,"1":421},{"0":190,"1":421},{"0":187,"1":421},{"0":184,"1":421},{"0":180,"1":421},{"0":175,"1":421},{"0":174,"1":421},{"0":172,"1":421},{"0":168,"1":421},{"0":165,"1":421},{"0":162,"1":421},{"0":158,"1":422},{"0":155,"1":422},{"0":152,"1":423},{"0":150,"1":424},{"0":147,"1":425},{"0":144,"1":425},{"0":140,"1":427},{"0":138,"1":428},{"0":135,"1":429},{"0":133,"1":430},{"0":130,"1":431},{"0":128,"1":432},{"0":125,"1":433},{"0":123,"1":434},{"0":121,"1":435},{"0":119,"1":436},{"0":118,"1":437},{"0":117,"1":438},{"0":116,"1":439},{"0":115,"1":440},{"0":114,"1":441},{"0":113,"1":442},{"0":112,"1":443},{"0":111,"1":445},{"0":110,"1":447},{"0":109,"1":449},{"0":108,"1":450},{"0":107,"1":451},{"0":106,"1":453},{"0":105,"1":454},{"0":104,"1":455},{"0":103,"1":457},{"0":102,"1":458},{"0":101,"1":459},{"0":101,"1":459},{"0":100,"1":460},{"0":99,"1":461},{"0":98,"1":463},{"0":97,"1":465},{"0":95,"1":468},{"0":95,"1":470},{"0":94,"1":471},{"0":94,"1":472},{"0":94,"1":472},{"0":94,"1":473},{"0":94,"1":473},{"0":94,"1":474},{"0":93,"1":474},{"0":93,"1":475},{"0":93,"1":475},{"0":93,"1":476},{"0":93,"1":477},{"0":93,"1":478},{"0":93,"1":478},{"0":93,"1":479},{"0":93,"1":479},{"0":93,"1":480},{"0":93,"1":480},{"0":93,"1":481},{"0":93,"1":481},{"0":93,"1":481},{"0":93,"1":482},{"0":92,"1":482},{"0":92,"1":483},{"0":92,"1":483},{"0":92,"1":484},{"0":92,"1":484},{"0":92,"1":484},{"0":92,"1":484},{"0":92,"1":485},{"0":92,"1":485},{"0":92,"1":486},{"0":92,"1":487},{"0":92,"1":489},{"0":92,"1":490},{"0":92,"1":491},{"0":92,"1":493},{"0":92,"1":494},{"0":91,"1":494},{"0":91,"1":495},{"0":91,"1":496},{"0":91,"1":497},{"0":91,"1":497},{"0":91,"1":498},{"0":91,"1":499},{"0":91,"1":499},{"0":91,"1":500},{"0":91,"1":500},{"0":91,"1":501},{"0":91,"1":502},{"0":91,"1":502},{"0":91,"1":503},{"0":91,"1":503},{"0":91,"1":503},{"0":91,"1":503},{"0":91,"1":503},{"0":91,"1":503},{"0":91,"1":503},{"0":90,"1":503},{"0":90,"1":502},{"0":90,"1":502},{"0":90,"1":502},{"0":895,"1":44},{"0":895,"1":44},{"0":895,"1":44},{"0":895,"1":44}]`