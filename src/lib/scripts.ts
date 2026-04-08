export interface EmailScript {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const emailScripts: EmailScript[] = [
  {
    id: "script_1",
    name: "Premier contact",
    subject: "Collaboration avec {{company}}",
    body: `<p>Bonjour {{name}},</p>
<p>Je vois que <strong>{{company}}</strong> est basé en {{country}} et je serais ravi d'échanger avec vous sur une potentielle collaboration.</p>
<p>Seriez-vous disponible pour un bref appel cette semaine ?</p>
<p>Cordialement</p>`,
  },
  {
    id: "script_2",
    name: "Relance 1",
    subject: "Re: Collaboration avec {{company}}",
    body: `<p>Bonjour {{name}},</p>
<p>Je me permets de relancer mon précédent message concernant une collaboration avec <strong>{{company}}</strong>.</p>
<p>N'hésitez pas à me faire signe si vous êtes intéressé.</p>
<p>Cordialement</p>`,
  },
  {
    id: "script_3",
    name: "Relance 2 (dernière)",
    subject: "Dernière tentative — {{company}}",
    body: `<p>Bonjour {{name}},</p>
<p>C'est ma dernière tentative pour vous joindre. Si le timing n'est pas bon, je comprendrai tout à fait.</p>
<p>Si vous souhaitez en discuter plus tard, n'hésitez pas à revenir vers moi.</p>
<p>Bonne continuation à <strong>{{company}}</strong>.</p>
<p>Cordialement</p>`,
  },
];

export function getScriptByFollowUpCount(count: number): EmailScript {
  if (count >= emailScripts.length) {
    return emailScripts[emailScripts.length - 1];
  }
  return emailScripts[count];
}
