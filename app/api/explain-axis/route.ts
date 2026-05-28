import { NextResponse } from 'next/server';
import { callOpenAIJson, hasOpenAIKey } from '@/lib/ai/openai';
import { getDish } from '@/lib/data/dishes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Axis = 'salt' | 'acid' | 'richness' | 'heat' | 'aroma';
type Locale = 'en' | 'hi' | 'te';

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hi: 'Hindi',
  te: 'Telugu',
};

const AXIS_LABELS: Record<Axis, string> = {
  salt: 'salt',
  acid: 'acid (lime / tamarind / yogurt)',
  richness: 'richness (fat / cream / ghee body)',
  heat: 'heat (chilli / pepper kick)',
  aroma: 'aroma (whole spices, garnish, tempering)',
};

const FALLBACKS: Record<Axis, Record<Locale, { guide: string; justRightHint: string; quickFix: string }>> = {
  salt: {
    en: {
      guide: 'Taste a small spoonful from two different spots — the bottom and the top of the dish. Salt should feel even, not patchy.',
      justRightHint: "Flavours should 'pop' but you shouldn't taste salt on its own.",
      quickFix: 'If under-salted, sprinkle fine salt and stir gently. If over-salted, add a splash of water or a wedge of potato.',
    },
    hi: {
      guide: 'दो जगह से थोड़ा-थोड़ा चखें — नीचे से और ऊपर से। नमक एक जैसा लगना चाहिए।',
      justRightHint: 'स्वाद उभरे लेकिन सिर्फ नमक का स्वाद न आए।',
      quickFix: 'कम हो तो थोड़ा बारीक नमक डाल कर हल्के हाथ से चलाएँ। ज़्यादा हो तो पानी या आलू का टुकड़ा डालें।',
    },
    te: {
      guide: 'రెండు చోట్ల నుండి కొంచెం రుచి చూడండి — కింది, పైనుండి. ఉప్పు ఒకేలా ఉండాలి.',
      justRightHint: 'రుచి బాగా వచ్చాలి కానీ ఉప్పు మాత్రమే తెలియకూడదు.',
      quickFix: 'తక్కువైతే కొద్దిగా చల్లి కలపండి. ఎక్కువైతే నీళ్లు లేదా ఒక బంగాళదుంప ముక్క వేయండి.',
    },
  },
  acid: {
    en: {
      guide: 'Take a spoonful with both gravy and a starch (rice/roti). A pinch of acid should brighten the flavour, not pucker your mouth.',
      justRightHint: 'You should taste a light lift on the tongue — bright, never sour-first.',
      quickFix: 'Too flat? Add a few drops of lime. Too sour? Stir in a pinch of sugar or a splash of cream.',
    },
    hi: {
      guide: 'थोड़ी ग्रेवी और चावल/रोटी एक साथ चखें। खटास हल्की चमक देनी चाहिए, मुँह कसैला नहीं होना चाहिए।',
      justRightHint: 'जीभ पर हल्का ताज़गी का अहसास — खट्टापन सबसे पहले नहीं।',
      quickFix: 'फीका हो तो नीबू की कुछ बूँदें डालें। ज़्यादा खट्टा हो तो चुटकी भर चीनी या थोड़ी क्रीम मिलाएँ।',
    },
    te: {
      guide: 'కొంచెం గ్రేవీ, అన్నం/రోటీతో కలిపి రుచి చూడండి. పులుపు తేలికగా రుచిని పెంచాలి, నోటిని పులవకూడదు.',
      justRightHint: 'నాలుకపై తేలికపాటి తాజాదనం రావాలి — పులుపు ముందుగా రాకూడదు.',
      quickFix: 'తక్కువైతే నిమ్మ చుక్కలు వేయండి. ఎక్కువైతే చిటికెడు చక్కెర లేదా క్రీం వేయండి.',
    },
  },
  richness: {
    en: {
      guide: 'Coat the back of a spoon with the gravy. It should cling lightly and leave a glossy film, not feel oily on the lips.',
      justRightHint: 'Full mouthfeel with a clean finish — not heavy on the throat.',
      quickFix: 'Thin? Whisk in a small knob of butter or a spoon of cream. Greasy? Skim oil from the top with a paper towel.',
    },
    hi: {
      guide: 'चम्मच की पीठ पर ग्रेवी की हल्की परत बननी चाहिए। होंठों पर तेल नहीं लगना चाहिए।',
      justRightHint: 'मुँह में भरपूर लगे लेकिन गले पर भारी न हो।',
      quickFix: 'पतला हो तो थोड़ा मक्खन या मलाई डालें। चिकनाई ज़्यादा हो तो ऊपर का तेल टिशू से सोख लें।',
    },
    te: {
      guide: 'చెంచా వెనుక గ్రేవీ తేలికగా అంటుకోవాలి, మెరిసే పొర ఉండాలి. పెదాలపై నూనెగా ఉండకూడదు.',
      justRightHint: 'నోటిలో సంపూర్ణ రుచి, గొంతుకు బరువు రాకూడదు.',
      quickFix: 'తేలికగా ఉంటే వెన్న ముక్క లేదా క్రీం వేయండి. ఎక్కువ నూనె ఉంటే పేపర్ టవల్‌తో పైన నూనె తీయండి.',
    },
  },
  heat: {
    en: {
      guide: 'Wait 3–4 seconds after swallowing. Real heat builds slowly at the back of the throat — sharp tongue burn means raw chilli.',
      justRightHint: 'A warm, slow tail of heat — not a spike that masks other flavours.',
      quickFix: 'Too hot? Stir in cream/yogurt or a pinch of sugar. Too mild? Bloom a little red chilli powder in hot ghee and swirl in.',
    },
    hi: {
      guide: 'निगलने के 3–4 सेकंड बाद देखें। असली तीखापन गले के पीछे धीरे-धीरे चढ़ता है।',
      justRightHint: 'गर्म, धीमी पूँछ जैसा तीखापन — दूसरे स्वाद दबने नहीं चाहिए।',
      quickFix: 'ज़्यादा तीखा हो तो क्रीम/दही या चुटकी चीनी डालें। कम हो तो थोड़ी लाल मिर्च घी में भूनकर डालें।',
    },
    te: {
      guide: 'మింగిన 3–4 సెకన్ల తర్వాత చూడండి. నిజమైన కారం గొంతు వెనుక నెమ్మదిగా పెరుగుతుంది.',
      justRightHint: 'వెచ్చని, నెమ్మదిగా వచ్చే కారం — మిగతా రుచులను దాచకూడదు.',
      quickFix: 'ఎక్కువైతే క్రీం/పెరుగు లేదా చిటికెడు చక్కెర వేయండి. తక్కువైతే నెయ్యిలో ఎర్ర కారం పొడి వేసి కలపండి.',
    },
  },
  aroma: {
    en: {
      guide: 'Smell the dish first, then taste. You should notice fresh, distinct top notes (whole spice, ghee, garnish) — not just cooked-down base.',
      justRightHint: 'Aromas hit the nose before flavours hit the tongue.',
      quickFix: 'Flat? Crush a pinch of kasuri methi between your palms over it, or finish with a tempering of ghee + whole spice.',
    },
    hi: {
      guide: 'पहले सूँघें, फिर चखें। ताज़ी, अलग खुशबू (साबुत मसाला, घी, गार्निश) महसूस होनी चाहिए।',
      justRightHint: 'खुशबू जीभ से पहले नाक तक पहुँचे।',
      quickFix: 'फीका हो तो हथेलियों के बीच कसूरी मेथी रगड़ कर डालें, या घी + साबुत मसाले का तड़का लगाएँ।',
    },
    te: {
      guide: 'ముందు వాసన చూసి తరువాత రుచి చూడండి. తాజా, ప్రత్యేక సుగంధం రావాలి (ధనియాలు, నెయ్యి, గార్నిష్).',
      justRightHint: 'రుచి కంటే ముందు సుగంధం ముక్కుకు తగలాలి.',
      quickFix: 'తేలికగా ఉంటే కసూరి మేథి చేతుల్లో నలిపి పైన చల్లండి, లేదా నెయ్యి + ధనియాల పోపు వేయండి.',
    },
  },
};

type ExplainAxisData = {
  guide: string;
  justRightHint: string;
  quickFix: string;
};

export async function POST(request: Request) {
  let body: { dishId?: string; axis?: Axis; locale?: Locale };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json_body' });
  }

  const dishId = typeof body.dishId === 'string' ? body.dishId : '';
  const axis = body.axis as Axis | undefined;
  const locale: Locale = body.locale === 'hi' || body.locale === 'te' ? body.locale : 'en';

  if (!dishId || !axis || !(axis in AXIS_LABELS)) {
    return NextResponse.json({ ok: false, error: 'invalid_request' });
  }

  const dish = getDish(dishId);
  if (!dish) {
    return NextResponse.json({ ok: false, error: 'dish_not_found' }, { status: 404 });
  }

  const fallback = FALLBACKS[axis][locale];

  if (!hasOpenAIKey()) {
    return NextResponse.json({
      ok: true,
      source: 'fallback' as const,
      ...fallback,
      warning: 'missing_api_key',
    });
  }

  const localeName = LOCALE_NAMES[locale];
  const axisLabel = AXIS_LABELS[axis];

  const systemPrompt = [
    'You are ChefSense AI, a chef coach for Indian cooking.',
    `The user just finished cooking ${dish.dishName}. They want to self-rate the '${axisLabel}' axis of their dish.`,
    "Give a SHORT (3-4 sentences max), specific guide for how to taste-check this axis FOR THIS DISH. Include: 1) what to taste from where in the dish (e.g. a grain from the bottom vs top, a spoonful of gravy), 2) what 'just right' tastes like for this dish style, 3) a quick fix if it tastes off.",
    `Reply in the requested locale (${localeName}).`,
    `Avoid generic answers — make it specific to ${dish.dishName}.`,
    'Return JSON: { guide: string, justRightHint: string, quickFix: string }.',
  ].join('\n');

  const result = await callOpenAIJson<ExplainAxisData>({
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: `Dish: ${dish.dishName}. Cuisine: ${dish.cuisine}. Axis to taste-check: ${axis}. Reply in ${localeName}.`,
      },
    ],
    temperature: 0.4,
  });

  if (!result.ok) {
    return NextResponse.json({
      ok: true,
      source: 'fallback' as const,
      ...fallback,
      warning: result.error,
    });
  }

  const data = result.data;
  const guide = typeof data?.guide === 'string' && data.guide.trim() ? data.guide.trim() : fallback.guide;
  const justRightHint =
    typeof data?.justRightHint === 'string' && data.justRightHint.trim()
      ? data.justRightHint.trim()
      : fallback.justRightHint;
  const quickFix =
    typeof data?.quickFix === 'string' && data.quickFix.trim() ? data.quickFix.trim() : fallback.quickFix;

  return NextResponse.json({
    ok: true,
    source: 'openai' as const,
    guide,
    justRightHint,
    quickFix,
  });
}
