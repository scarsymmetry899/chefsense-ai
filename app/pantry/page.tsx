'use client';

import { CircleHelp } from 'lucide-react';
import { AppShell } from '@/components/shell/app-shell';
import { Header } from '@/components/shell/header';
import { ScreenCard, SectionEyebrow } from '@/components/dish/screen-kit';
import { ROUTES } from '@/lib/constants/routes';
import { ALL_DISHES } from '@/lib/data/dishes';
import { getToolReference } from '@/lib/dish-flow';
import { useLanguage } from '@/lib/i18n/language-context';

const PANTRY_COPY = {
  en: {
    title: 'Tools',
    eyebrow: 'Kitchen reference',
    headline: 'Pans, appliances, and prep tools used in your guided dishes.',
    body: 'Tap any tool to open a quick reference image so you know exactly what to grab from the kitchen.',
  },
  hi: {
    title: 'टूल्स',
    eyebrow: 'किचन संदर्भ',
    headline: 'आपके गाइडेड डिशेज़ में उपयोग होने वाले पैन, उपकरण और प्रेप टूल्स।',
    body: 'किसी भी टूल पर टैप करें ताकि एक क्विक रेफरेंस इमेज खुले और आप जानें कि किचन से क्या उठाना है।',
  },
  te: {
    title: 'టూల్స్',
    eyebrow: 'వంటగది సందర్భం',
    headline: 'మీ గైడెడ్ డిష్‌లలో ఉపయోగించే పాన్‌లు, పరికరాలు మరియు ప్రెప్ టూల్స్.',
    body: 'ఏదైనా టూల్ నొక్కితే ఒక క్విక్ రిఫరెన్స్ ఇమేజ్ తెరుచుకుంటుంది — వంటగదిలో నుండి ఏమి తీసుకోవాలో అర్థమవుతుంది.',
  },
} as const;

// Static name translations for common kitchen tools.
const TOOL_NAMES: Record<string, { hi: string; te: string }> = {
  'Kadhai or heavy pan': { hi: 'कढ़ाई या भारी पैन', te: 'కడాయి లేదా భారీ పాన్' },
  'Blender / mixer': { hi: 'ब्लेंडर / मिक्सर', te: 'బ్లెండర్ / మిక్సర్' },
  'Fine strainer': { hi: 'महीन छन्नी', te: 'సన్నని జల్లెడ' },
  'Heavy-bottomed pot': { hi: 'भारी तले वाला बर्तन', te: 'బరువైన అడుగున్న పాత్ర' },
  'Pressure cooker': { hi: 'प्रेशर कुकर', te: 'ప్రెజర్ కుకర్' },
  'Tadka pan': { hi: 'तड़का पैन', te: 'తాలింపు పాన్' },
  'Tawa': { hi: 'तवा', te: 'తవా' },
  'Wok or large frying pan': { hi: 'वोक या बड़ा फ्राइंग पैन', te: 'వాక్ లేదా పెద్ద ఫ్రైయింగ్ పాన్' },
  'Mixing bowls': { hi: 'मिक्सिंग बाउल्स', te: 'మిక్సింగ్ బౌల్స్' },
  'Wooden spoon': { hi: 'लकड़ी का चम्मच', te: 'చెక్క చెంచా' },
  'Ladle': { hi: 'करछी', te: 'గరిటె' },
  'Sharp knife': { hi: 'तेज़ चाकू', te: 'పదునైన కత్తి' },
  'Cutting board': { hi: 'चॉपिंग बोर्ड', te: 'కటింగ్ బోర్డ్' },
  'Microwave oven': { hi: 'माइक्रोवेव ओवन', te: 'మైక్రోవేవ్ ఓవెన్' },
  'Salt and pepper shaker': { hi: 'नमक-मिर्च शेकर', te: 'ఉప్పు-మిరియాల షేకర్' },
  'Measuring spoons': { hi: 'माप के चम्मच', te: 'కొలిచే చెంచాలు' },
  'Tasting spoon set': { hi: 'चखने के चम्मच', te: 'రుచి చూసే చెంచాల సెట్' },
};

const TOOL_DESCRIPTIONS: Record<string, { hi: string; te: string }> = {
  'A deep, heavy Indian pan used for gravies, frying, and masala cooking.': {
    hi: 'ग्रेवी, फ्राइंग और मसाला पकाने के लिए उपयोग होने वाला एक गहरा, भारी भारतीय पैन।',
    te: 'గ్రేవీ, ఫ్రైయింగ్ మరియు మసాలా వంటకు ఉపయోగించే లోతైన, భారీ భారతీయ పాన్.',
  },
  'Used to turn soaked nuts, tomatoes, and onion base into a smooth gravy.': {
    hi: 'भिगोए हुए मेवे, टमाटर और प्याज़ बेस को मुलायम ग्रेवी में बदलने के लिए।',
    te: 'నానిన గింజలు, టమాటో మరియు ఉల్లిపాయ బేస్‌ను మృదువైన గ్రేవీగా మార్చడానికి.',
  },
};

export default function PantryPage() {
  const { lang } = useLanguage();
  const copy = PANTRY_COPY[lang];

  const dishTools = Array.from(
    new Map(
      ALL_DISHES.flatMap((dish) => dish.tools.map((tool) => [tool.name, tool])),
    ).values(),
  );

  const extraEssentials = [
    'Microwave oven',
    'Salt and pepper shaker',
    'Measuring spoons',
    'Tasting spoon set',
  ];

  const allTools = [
    ...dishTools.map((tool) => tool.name),
    ...extraEssentials.filter((item) => !dishTools.some((tool) => tool.name === item)),
  ];

  function localToolName(name: string): string {
    if (lang === 'en') return name;
    return TOOL_NAMES[name]?.[lang] ?? name;
  }

  function localToolDesc(desc: string): string {
    if (lang === 'en') return desc;
    return TOOL_DESCRIPTIONS[desc]?.[lang] ?? desc;
  }

  return (
    <AppShell>
      <Header backHref={ROUTES.home} title={copy.title} />

      <ScreenCard>
        <SectionEyebrow label={copy.eyebrow} />
        <div className="h-section">{copy.headline}</div>
        <div className="mt-3 t-body text-muted-foreground">{copy.body}</div>
      </ScreenCard>

      <div className="mt-5 space-y-3">
        {allTools.map((item) => {
          const ref = getToolReference(item);
          return (
            <ScreenCard key={item} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="h-card text-[18px]">{localToolName(item)}</div>
                  <div className="mt-1 t-body text-muted-foreground">{localToolDesc(ref.description)}</div>
                </div>
                <a
                  href={ref.infoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-card text-primary shadow-soft"
                  aria-label={`Learn more about ${item}`}
                >
                  <CircleHelp className="h-4 w-4" />
                </a>
              </div>
            </ScreenCard>
          );
        })}
      </div>
    </AppShell>
  );
}
