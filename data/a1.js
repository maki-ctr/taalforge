// TaalForge v5: A1 everyday track, following the order of Zo gezegd 1.1 (parts 1–4).
// Every sentence and exercise here is original. Nothing is copied from the book:
// the book's own audio and exercises are linked through the Pelckmans portal.
// Personal answers are never stored here: they come from the "Over mij" form,
// saved only in the learner's own browser.
window.TF = window.TF || {};
TF.a1 = {
  portal: "https://methodeportaal.pelckmans.be/zogezegd/startpagina/zo-gezegd-1-1-breakthrough-a1/",
  extras: [
    { title: "PCVO Moderne Talen NT2, module 1.1", url: "https://sites.google.com/modernetalen.be/nt2/niveau/module-1-1", note: "H5P and Quizlet drills by topic. Its page numbers follow an older edition of the book." },
    { title: "KlasCement (Kenniscentrum Digisprong)", url: "https://www.vlaanderen.be/kenniscentrum-digisprong/themas/digitale-leermiddelen", note: "Free Flemish learning resources. Search for NT2 and the unit's topic." }
  ],

  // Speaking test question bank (teacher's list). "answer" names a template in js/a1.js.
  questions: {
    howAreYou: { q: "Hoe gaat het?", en: "How are you?", answer: "howAreYou" },
    name:      { q: "Wat is je voornaam en je familienaam?", en: "What is your first name and surname?", answer: "name" },
    spell:     { q: "Hoe spel je dat?", en: "How do you spell that?", answer: "spell" },
    country:   { q: "Uit welk land kom jij?", en: "Which country are you from?", answer: "country" },
    languages: { q: "Welke talen spreek jij?", en: "Which languages do you speak?", answer: "languages" },
    town:      { q: "Waar woon jij?", en: "Where do you live?", answer: "town" },
    age:       { q: "Hoe oud ben jij?", en: "How old are you?", answer: "age" },
    married:   { q: "Ben jij getrouwd?", en: "Are you married?", answer: "married" },
    children:  { q: "Heb jij kinderen?", en: "Do you have children?", answer: "children" },
    toSchool:  { q: "Hoe kom jij naar school?", en: "How do you get to school?", answer: "toSchool" },
    toShop:    { q: "Hoe ga jij naar de supermarkt?", en: "How do you go to the supermarket?", answer: "toShop" },
    belgium:   { q: "Hoelang woon jij al in België?", en: "How long have you lived in Belgium?", answer: "belgium" },
    weather:   { q: "Hoe is het weer vandaag?", en: "What is the weather like today?", answer: "weather" },
    time:      { q: "Hoe laat is het?", en: "What time is it?", answer: "time" }
  },

  units: [
    // ───────────────────────────── Part 1
    {
      id: "a1-01", num: 1, title: "Wie ben jij?", titleEn: "Who are you?",
      summary: "Greetings, how are you, your name, country, languages and town.",
      learn: [
        { h: "Greetings", rows: [
          ["Goeiemorgen!", "Good morning"], ["Goeiemiddag!", "Good afternoon"], ["Goeienavond!", "Good evening"],
          ["Dag!", "Hello / goodbye (any time of day)"], ["Aangenaam.", "Nice to meet you"],
          ["Wablief?", "Sorry, what did you say? (Flemish)"] ] },
        { h: "Hoe gaat het?", rows: [
          ["Prima!", "Great"], ["Goed, dank je.", "Fine, thanks"], ["Het gaat wel.", "So-so"],
          ["Niet zo goed.", "Not so good"], ["En met jou?", "And you?"] ] },
        { h: "Questions about you", rows: [
          ["Hoe heet jij? / Wie ben jij?", "What's your name? / Who are you?"],
          ["Uit welk land kom jij?", "Which country are you from?"],
          ["Welke talen spreek jij?", "Which languages do you speak?"],
          ["Waar woon jij?", "Where do you live?"] ] },
        { h: "Five verbs", rows: [
          ["zijn: ik ben, jij bent, u bent, hij/zij is", "to be"],
          ["heten: ik heet, jij heet, hij/zij heet", "to be called"],
          ["komen: ik kom, jij komt, hij/zij komt", "to come"],
          ["spreken: ik spreek, jij spreekt, hij/zij spreekt", "to speak"],
          ["wonen: ik woon, jij woont, hij/zij woont", "to live"] ],
          note: "In a question, jij comes after the verb and the -t falls away: jij woont, but Waar woon jij?" },
        { h: "mijn / jouw", rows: [
          ["Mijn naam is Sara.", "My name is Sara."], ["Wat is jouw naam?", "What is your name?"] ] },
        { h: "Sounds: short and long", rows: [
          ["de man / de maan", "a / aa"], ["de zon / de zoon", "o / oo"] ],
          note: "One vowel letter is short, two are long. Listen in the Pronounce block." }
      ],
      listen: [
        { target: "Goeiemorgen! Hoe gaat het?", en: "Good morning! How are you?" },
        { target: "Prima, dank je. En met jou?", en: "Great, thanks. And you?" },
        { target: "Het gaat wel.", en: "So-so." },
        { target: "Hoe heet jij?", en: "What's your name?" },
        { target: "Ik heet Sara. Aangenaam.", en: "My name is Sara. Nice to meet you." },
        { target: "Uit welk land kom jij?", en: "Which country are you from?" },
        { target: "Ik kom uit Marokko.", en: "I'm from Morocco." },
        { target: "Welke talen spreek jij?", en: "Which languages do you speak?" },
        { target: "Ik spreek Arabisch, Frans en een beetje Nederlands.", en: "I speak Arabic, French and a little Dutch." },
        { target: "Waar woon jij?", en: "Where do you live?" },
        { target: "Ik woon in Leuven.", en: "I live in Leuven." },
        { target: "Wablief? Kan je dat herhalen, alsjeblieft?", en: "Sorry? Can you repeat that, please?" },
        { target: "Dag! Tot morgen.", en: "Bye! See you tomorrow." }
      ],
      practise: [
        { type: "fill", title: "Verbs", items: [
          { s: "Ik ___ Sara.", a: ["heet"], hint: "heten", en: "My name is Sara." },
          { s: "Ik ___ Nadia.", a: ["ben", "heet"], hint: "zijn", en: "I am Nadia." },
          { s: "Jij ___ uit Portugal.", a: ["komt"], hint: "komen", en: "You come from Portugal." },
          { s: "Ik ___ uit Brazilië.", a: ["kom"], hint: "komen", en: "I come from Brazil." },
          { s: "Ik ___ in Leuven.", a: ["woon"], hint: "wonen", en: "I live in Leuven." },
          { s: "Waar ___ jij?", a: ["woon"], hint: "wonen", en: "Where do you live?", tip: "In a question, jij loses the -t." },
          { s: "___ jij Engels?", a: ["spreek"], hint: "spreken", en: "Do you speak English?", tip: "In a question, jij loses the -t." },
          { s: "Hij ___ Frans.", a: ["spreekt"], hint: "spreken", en: "He speaks French." },
          { s: "Zij ___ mevrouw Peeters.", a: ["is"], hint: "zijn", en: "She is Mrs Peeters." },
          { s: "Hoe ___ jij?", a: ["heet"], hint: "heten", en: "What's your name?" }
        ] },
        { type: "fill", title: "Question words and mijn / jouw", items: [
          { s: "___ heet jij?", a: ["hoe"], hint: "how", en: "What's your name?" },
          { s: "___ woon jij?", a: ["waar"], hint: "where", en: "Where do you live?" },
          { s: "___ talen spreek jij?", a: ["welke"], hint: "which", en: "Which languages do you speak?" },
          { s: "Uit ___ land kom jij?", a: ["welk"], hint: "which", en: "Which country are you from?", tip: "het land: welk, without -e." },
          { s: "Ik heet Tom. ___ naam is Tom.", a: ["mijn"], hint: "my", en: "My name is Tom." },
          { s: "Wat is ___ naam?", a: ["jouw", "je"], hint: "your", en: "What is your name?" }
        ] },
        { type: "choice", title: "Answer the question", items: [
          { q: "Hoe gaat het?", options: ["Prima, dank je.", "Ik heet Tom.", "In Leuven.", "Uit Spanje."], a: 0, say: true },
          { q: "Hoe heet jij?", options: ["Ik woon in Gent.", "Ik heet Lies.", "Het gaat wel.", "Nederlands."], a: 1, say: true },
          { q: "Uit welk land kom jij?", options: ["Ik spreek Turks.", "Goed, dank je.", "Ik kom uit Turkije.", "Ik woon in Genk."], a: 2, say: true },
          { q: "Welke talen spreek jij?", options: ["Ik kom uit Polen.", "Pools en een beetje Nederlands.", "In Brussel.", "Aangenaam."], a: 1, say: true },
          { q: "Waar woon jij?", options: ["Ik woon in Mechelen.", "Ik ben Sara.", "Prima!", "Engels."], a: 0, say: true },
          { q: "Goeienavond! You say this…", options: ["in the morning", "in the afternoon", "in the evening", "at night, going to bed"], a: 2 }
        ] }
      ],
      pronounce: { pairs: [["de man", "de maan"], ["de zon", "de zoon"]],
        questions: ["howAreYou", "name", "spell", "country", "languages", "town"] },
      check: [ { from: "fill", n: 5 }, { from: "choice", n: 5 } ]
    },

    // ───────────────────────────── Part 2
    {
      id: "a1-02", num: 2, title: "Wie is dat? Hoe spel je dat?", titleEn: "Who is that? How do you spell that?",
      summary: "The alphabet, hij / zij, zijn / haar, family, transport and the registration form.",
      learn: [
        { h: "The alphabet (the book's letter names)", rows: [
          ["A aa · B bee · C see · D dee · E ee · F ef · G gee", ""],
          ["H haa · I ie · J jee · K kaa · L el · M em · N en", ""],
          ["O oo · P pee · Q kuu · R er · S es · T tee · U uu", ""],
          ["V vee · W wee · X iks · Y ipsilon · Z zet", ""] ],
          note: "Traps: E (ee) and I (ie) sound alike to new ears; so do G (gee) and J (jee), and V (vee) and W (wee). The Practise block drills exactly these." },
        { h: "hij / zij take -t", rows: [
          ["Hij woont in Gent.", "He lives in Ghent."], ["Zij spreekt Engels.", "She speaks English."],
          ["Hij is getrouwd.", "He is married."] ] },
        { h: "zijn / haar", rows: [
          ["Dat is Tom. Zijn vrouw heet Lies.", "That's Tom. His wife is called Lies."],
          ["Dat is Nadia. Haar man heet Karim.", "That's Nadia. Her husband is called Karim."] ] },
        { h: "Checking", rows: [["Dat klopt.", "That's right."], ["Dat klopt niet.", "That's not right."]] },
        { h: "Family and transport", rows: [
          ["getrouwd / alleenstaand / gescheiden / samenwonend", "married / single / divorced / living together"],
          ["Ik heb twee kinderen: een jongen en een meisje.", "I have two children: a boy and a girl."],
          ["met de auto / met de bus / met de fiets / met de trein", "by car / bus / bike / train"],
          ["te voet", "on foot"] ] },
        { h: "The registration form", rows: [
          ["voornaam, familienaam", "first name, surname"], ["land, talen", "country, languages"],
          ["burgerlijke staat", "marital status"], ["jongen(s), meisje(s)", "boy(s), girl(s)"] ] },
        { h: "A short e-mail", rows: [
          ["Beste Lies,", "Dear Lies,"], ["Bedankt voor je e-mail.", "Thanks for your e-mail."], ["Groetjes, Sara", "Best wishes, Sara"] ] },
        { h: "Sounds", rows: [["de pen / de peen", "e / ee"], ["de bus / de muur", "u / uu"]] }
      ],
      listen: [
        { target: "Wie is dat?", en: "Who is that?" },
        { target: "Dat is Tom. Hij woont in Gent.", en: "That's Tom. He lives in Ghent." },
        { target: "Zijn vrouw heet Lies.", en: "His wife is called Lies." },
        { target: "Hoe spel je dat?", en: "How do you spell that?" },
        { target: "Lies: el, ie, ee, es.", en: "Lies: L, I, E, S." },
        { target: "Is zij getrouwd?", en: "Is she married?" },
        { target: "Nee, dat klopt niet. Zij is gescheiden.", en: "No, that's not right. She is divorced." },
        { target: "Hij heeft twee kinderen: een jongen en een meisje.", en: "He has two children: a boy and a girl." },
        { target: "Hoe kom jij naar school?", en: "How do you get to school?" },
        { target: "Ik kom met de bus. Mijn man komt met de fiets.", en: "I come by bus. My husband comes by bike." },
        { target: "Ik ga te voet naar de supermarkt.", en: "I walk to the supermarket." }
      ],
      practise: [
        { type: "dictation", mode: "spell", title: "Hear the spelling, type the name", n: 8 },
        { type: "form", title: "Fill in the registration form" },
        { type: "fill", title: "hij / zij, zijn / haar", items: [
          { s: "Hij ___ in Gent.", a: ["woont"], hint: "wonen", en: "He lives in Ghent." },
          { s: "Zij ___ Engels en Frans.", a: ["spreekt"], hint: "spreken", en: "She speaks English and French." },
          { s: "Hij ___ Jef.", a: ["heet"], hint: "heten", en: "He is called Jef.", tip: "heten already ends in t: hij heet, not heett." },
          { s: "Zij ___ uit Polen.", a: ["komt"], hint: "komen", en: "She comes from Poland." },
          { s: "Dat is Tom. ___ vrouw heet Lies.", a: ["zijn"], hint: "his", en: "That's Tom. His wife is Lies." },
          { s: "Dat is Nadia. ___ man heet Karim.", a: ["haar"], hint: "her", en: "That's Nadia. Her husband is Karim." },
          { s: "Ik kom ___ de fiets.", a: ["met"], hint: "by", en: "I come by bike." },
          { s: "Ik kom ___ voet.", a: ["te"], hint: "on (foot)", en: "I come on foot." },
          { s: "Is zij getrouwd? Nee, dat ___ niet.", a: ["klopt"], hint: "kloppen", en: "Is she married? No, that's not right." },
          { s: "Hoe ___ je dat?", a: ["spel"], hint: "spellen", en: "How do you spell that?" },
          { s: "___ Lies, bedankt voor je e-mail.", a: ["beste"], hint: "Dear", en: "Dear Lies, thanks for your e-mail." }
        ] },
        { type: "choice", title: "Which letter do you hear?", items: [
          { q: "ee", say: "ee", hideQ: true, options: ["E", "I"], a: 0 },
          { q: "ie", say: "ie", hideQ: true, options: ["E", "I"], a: 1 },
          { q: "gee", say: "gee", hideQ: true, options: ["G", "J"], a: 0 },
          { q: "jee", say: "jee", hideQ: true, options: ["G", "J"], a: 1 },
          { q: "vee", say: "vee", hideQ: true, options: ["V", "W"], a: 0 },
          { q: "wee", say: "wee", hideQ: true, options: ["V", "W"], a: 1 },
          { q: "Ben jij getrouwd? Nee, ik woon samen met mijn vriend. Burgerlijke staat:", options: ["getrouwd", "alleenstaand", "gescheiden", "samenwonend"], a: 3 },
          { q: "Ik heb drie kinderen: twee jongens en een meisje. How many girls?", options: ["0", "1", "2", "3"], a: 1 }
        ] }
      ],
      pronounce: { pairs: [["de pen", "de peen"], ["de bus", "de muur"]],
        questions: ["age", "married", "children", "toSchool", "toShop", "belgium"] },
      check: [ { from: "spell", n: 4 }, { from: "fill", n: 3 }, { from: "choice", n: 3 } ]
    },

    // ───────────────────────────── Part 3
    {
      id: "a1-03", num: 3, title: "Hoeveel?", titleEn: "How much? How many?",
      summary: "Numbers 0–100, prices, kost / kosten, shop words and the weather.",
      learn: [
        { h: "0–20", rows: [
          ["nul, een, twee, drie, vier, vijf, zes, zeven, acht, negen, tien", "0–10"],
          ["elf, twaalf, dertien, veertien, vijftien, zestien, zeventien, achttien, negentien, twintig", "11–20"] ] },
        { h: "Tens: -tig", rows: [
          ["twintig, dertig, veertig, vijftig, zestig, zeventig, tachtig, negentig, honderd", "20–100"] ],
          note: "-tien is 13–19, -tig is the tens: dertien (13) but dertig (30). Listen for the end of the word." },
        { h: "Units first", rows: [
          ["eenentwintig", "21: one-and-twenty"], ["vierendertig", "34"], ["zevenenveertig", "47"],
          ["tweeëntwintig, drieënvijftig", "22, 53: trema on the e after twee and drie"] ] },
        { h: "Prices", rows: [
          ["een halve euro", "€0,50"], ["anderhalve euro", "€1,50"],
          ["drie euro en half / drie euro vijftig", "€3,50"], ["twee euro vijfentwintig", "€2,25"],
          ["Hoeveel kost dat?", "How much is that?"] ] },
        { h: "kost / kosten", rows: [
          ["De paraplu kost tien euro.", "One thing: kost"], ["De schoenen kosten veertig euro.", "More things: kosten"] ] },
        { h: "In the shop", rows: [
          ["de paraplu, het horloge, de portefeuille", "umbrella, watch, wallet"],
          ["de sjaal, de muts, de handschoenen", "scarf, hat, gloves"] ] },
        { h: "The weather", rows: [
          ["Het is mooi weer. / Het is slecht weer.", "The weather is nice / bad."],
          ["Het regent. Het vriest.", "It's raining. It's freezing."],
          ["Het is bewolkt. Het is zonnig.", "It's cloudy. It's sunny."],
          ["Het is vijftien graden.", "It's fifteen degrees."] ] },
        { h: "Sound", rows: [["de teen / tien", "ee / ie"]] }
      ],
      listen: [
        { target: "Hoeveel kost de paraplu?", en: "How much is the umbrella?" },
        { target: "Hij kost twaalf euro vijftig.", en: "It costs twelve euros fifty." },
        { target: "En de handschoenen?", en: "And the gloves?" },
        { target: "Ze kosten achttien euro.", en: "They cost eighteen euros." },
        { target: "Het horloge kost vijfenzeventig euro.", en: "The watch costs seventy-five euros." },
        { target: "Dat is duur!", en: "That's expensive!" },
        { target: "Een koffie kost anderhalve euro.", en: "A coffee costs one euro fifty." },
        { target: "Ik woon op nummer drieëntwintig.", en: "I live at number twenty-three." },
        { target: "Hoe is het weer vandaag?", en: "What's the weather like today?" },
        { target: "Het is bewolkt en het regent.", en: "It's cloudy and it's raining." },
        { target: "Het is maar vier graden.", en: "It's only four degrees." }
      ],
      practise: [
        { type: "dictation", mode: "number", title: "Hear a number, type it", n: 10 },
        { type: "dictation", mode: "price", title: "Hear a price, type it", n: 8 },
        { type: "fill", title: "kost / kosten and number words", items: [
          { s: "Hoeveel ___ de paraplu?", a: ["kost"], hint: "one thing", en: "How much is the umbrella?" },
          { s: "De schoenen ___ zestig euro.", a: ["kosten"], hint: "more things", en: "The shoes cost sixty euros." },
          { s: "Het horloge ___ honderd euro.", a: ["kost"], hint: "one thing", en: "The watch costs a hundred euros." },
          { s: "Hoeveel ___ de handschoenen?", a: ["kosten"], hint: "more things", en: "How much are the gloves?" },
          { s: "21 = ___", a: ["eenentwintig"], hint: "units first", en: "twenty-one" },
          { s: "22 = ___", a: ["tweeëntwintig"], near: { "tweeentwintig": "Almost: add the trema, tweeëntwintig." }, hint: "trema", en: "twenty-two" },
          { s: "13 = ___", a: ["dertien"], hint: "-tien or -tig?", en: "thirteen" },
          { s: "30 = ___", a: ["dertig"], hint: "-tien or -tig?", en: "thirty" },
          { s: "€1,50 = ___ euro", a: ["anderhalve"], hint: "one and a half", en: "one euro fifty" },
          { s: "€0,50 = een ___ euro", a: ["halve"], hint: "half", en: "fifty cents" }
        ] },
        { type: "choice", title: "Hoe is het weer?", items: [
          { q: "🌧️", options: ["Het regent.", "Het vriest.", "Het is zonnig.", "Het is warm."], a: 0, big: true },
          { q: "☀️", options: ["Het is bewolkt.", "Het is zonnig.", "Het regent.", "Het vriest."], a: 1, big: true },
          { q: "☁️", options: ["Het is zonnig.", "Het vriest.", "Het is bewolkt.", "Het is mooi weer."], a: 2, big: true },
          { q: "❄️ −3°", options: ["Het regent.", "Het is zonnig.", "Het is bewolkt.", "Het vriest."], a: 3, big: true },
          { q: "Het is vijfentwintig graden.", say: true, hideQ: true, options: ["5°", "15°", "25°", "52°"], a: 2 },
          { q: "Het is dertien graden.", say: true, hideQ: true, options: ["3°", "13°", "30°", "31°"], a: 1 }
        ] }
      ],
      pronounce: { pairs: [["de teen", "tien"]], questions: ["weather", "age"] },
      check: [ { from: "spell", n: 3 }, { from: "price", n: 4 }, { from: "number", n: 3 } ]
    },

    // ───────────────────────────── Part 4
    {
      id: "a1-04", num: 4, title: "Hoe laat is het?", titleEn: "What time is it?",
      summary: "Telling the time the book's way, 24-hour timetables, parts of the day and departure boards.",
      learn: [
        { h: "The clock, the book's way", rows: [
          ["Het is drie uur.", "3:00"], ["kwart over drie", "3:15"], ["twintig over drie", "3:20"],
          ["half vier", "3:30: half towards four"], ["twintig voor vier", "3:40"], ["kwart voor vier", "3:45"] ],
          note: "Half looks forward: half twaalf is 11:30, not 12:30. Twintig voor also counts towards the next hour." },
        { h: "Five-minute steps", rows: [
          ["vijf over, tien over", ":05, :10"], ["vijf voor half, vijf over half", ":25, :35"],
          ["tien voor, vijf voor", ":50, :55"] ] },
        { h: "Timetables use 24 hours", rows: [
          ["14.30 uur: veertien uur dertig", "2:30 pm"], ["De trein vertrekt om 8.12 uur.", "The train leaves at 8:12."] ] },
        { h: "Parts of the day", rows: [
          ["'s morgens, 's middags", "in the morning, in the afternoon"], ["'s avonds, 's nachts", "in the evening, at night"] ] },
        { h: "The departure board", rows: [
          ["vertrek, aankomst", "departure, arrival"], ["bestemming, spoor", "destination, platform"], ["vertraging", "delay"] ] },
        { h: "Asking politely", rows: [
          ["Hoe laat is het, alsjeblieft?", "What time is it, please?"],
          ["Het spijt me, ik weet het niet.", "Sorry, I don't know."] ] },
        { h: "Sounds", rows: [["de pet / de pit", "e / i"], ["hij zit / hij ziet", "i / ie"]] }
      ],
      listen: [
        { target: "Hoe laat is het, alsjeblieft?", en: "What time is it, please?" },
        { target: "Het is kwart over elf.", en: "It's quarter past eleven." },
        { target: "Het is half twaalf.", en: "It's half past eleven." },
        { target: "Het is twintig voor negen.", en: "It's twenty to nine." },
        { target: "Het spijt me, ik weet het niet.", en: "Sorry, I don't know." },
        { target: "De les begint om kwart voor zeven 's avonds.", en: "The class starts at quarter to seven in the evening." },
        { target: "De trein naar Leuven vertrekt om veertien uur tweeëndertig.", en: "The train to Leuven leaves at 14:32." },
        { target: "Hij vertrekt van spoor drie.", en: "It leaves from platform three." },
        { target: "De trein heeft tien minuten vertraging.", en: "The train is ten minutes late." },
        { target: "Ik werk 's morgens en 's middags.", en: "I work in the morning and the afternoon." }
      ],
      practise: [
        { type: "clock", title: "Read the clock", n: 10 },
        { type: "dictation", mode: "time", title: "Hear a time, type it", n: 8 },
        { type: "choice", title: "Read the departure board", items: [
          { board: true, q: "Hoe laat vertrekt de trein naar Leuven?", options: ["14.32 uur", "14.45 uur", "15.10 uur", "13.32 uur"], a: 0 },
          { board: true, q: "Van welk spoor vertrekt de trein naar Gent?", options: ["Spoor 1", "Spoor 3", "Spoor 5", "Spoor 7"], a: 2 },
          { board: true, q: "Welke trein heeft vertraging?", options: ["Leuven", "Gent", "Antwerpen", "Hasselt"], a: 2 },
          { q: "Het is 19.00 uur. Het is…", options: ["'s morgens", "'s middags", "'s avonds", "'s nachts"], a: 2 },
          { q: "Het is 03.00 uur. Het is…", options: ["'s morgens", "'s middags", "'s avonds", "'s nachts"], a: 3 }
        ] },
        { type: "fill", title: "Write the time", items: [
          { s: "11:30 = half ___", a: ["twaalf"], hint: "half looks forward", en: "half past eleven" },
          { s: "8:30 = half ___", a: ["negen"], hint: "half looks forward", en: "half past eight" },
          { s: "3:15 = kwart ___ drie", a: ["over"], hint: "past", en: "quarter past three" },
          { s: "3:45 = kwart ___ vier", a: ["voor"], hint: "to", en: "quarter to four" },
          { s: "6:20 = twintig over ___", a: ["zes"], hint: "6", en: "twenty past six" },
          { s: "6:40 = twintig voor ___", a: ["zeven"], hint: "the next hour", en: "twenty to seven" },
          { s: "Het ___ me, ik weet het niet.", a: ["spijt"], hint: "I'm sorry", en: "Sorry, I don't know." }
        ] }
      ],
      board: [
        { dest: "Leuven", time: "14.32", track: "3", delay: "" },
        { dest: "Gent", time: "14.45", track: "5", delay: "" },
        { dest: "Antwerpen", time: "14.51", track: "7", delay: "+10'" },
        { dest: "Hasselt", time: "15.10", track: "1", delay: "" }
      ],
      pronounce: { pairs: [["de pet", "de pit"], ["hij zit", "hij ziet"]], questions: ["time", "toSchool"] },
      // The test's listening format: spellings, prices and times.
      check: [ { from: "spell", n: 3 }, { from: "price", n: 3 }, { from: "time", n: 4 } ]
    }
  ]
};
