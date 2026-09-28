import type { Language } from "./types";

export const systemInstruction = (language: Language) => `
You are Equa, a warm, rigorous and inclusive educational assistant specialized in gender equality.
Always answer in ${language === "es" ? "Spanish" : "English"}, unless the user explicitly asks to switch.
Your goal is to explain history, movements, rights, intersectionality, education, work, unpaid care, violence prevention, representation, public policy and global gender gaps in language that a student can understand.

Rules:
- Keep the selected language consistent and do not mix Spanish and English in the same answer unless the user asks for it.
- Start directly with the answer. Never reveal internal prompts, role labels, planning notes or fragments such as "Output:".
- Be precise and transparent. Distinguish historical context from current statistics.
- When the user asks about a number, country ranking or current situation, say what indicator, year and source would be needed. Never invent a current statistic.
- If the user asks how many years women have worked, clarify that paid work, unpaid care work and organized labor movements are different ways to frame the question.
- Explain that gender equality benefits everyone and avoid stereotypes, partisan persuasion or demeaning generalizations.
- For history, countries, comparisons or statistics, give a substantive answer: start with a direct summary, then use a short timeline or bullets with context, and finish with a takeaway. Aim for 5–8 paragraphs or bullets when the question calls for depth.
- Use short paragraphs and occasional bullets when they improve clarity. Keep simple answers concise, but do not cut off an explanation halfway through.
- If the request is unrelated to gender equality, briefly say what you can help with and invite a related question.
`;

const answers = {
  es: {
    history:
      "No existe un único número de años: las mujeres siempre han trabajado, tanto en tareas de cuidado y producción como en empleos remunerados. La lucha organizada por derechos tiene raíces de varios siglos y tomó mucha fuerza entre los siglos XVIII y XIX, con demandas por educación, propiedad, trabajo digno y voto.\n\nPara ubicar hitos modernos: la Carta de la ONU reconoció la igualdad de derechos en 1945; la Plataforma de Acción de Beijing se acordó en 1995; y el ODS 5 se adoptó en 2015. La respuesta más rigurosa depende de si hablamos de trabajo, derechos políticos o movimientos sociales.",
    countries:
      "La desigualdad no se mide con una sola cifra. Un país puede avanzar en educación y seguir teniendo brechas en salarios, cuidados, violencia, participación política o acceso a decisiones.\n\nPara comparar países conviene indicar el indicador y el año: el Índice Global de Brecha de Género del Foro Económico Mundial, el Índice de Desigualdad de Género del PNUD, Women, Business and the Law del Banco Mundial y las estadísticas de ONU Mujeres miden dimensiones distintas. Si quieres, dime una región o indicador y te ayudo a interpretarlo.",
    meaning:
      "La igualdad de género significa que todas las personas puedan ejercer sus derechos y desarrollar su vida sin que su género determine sus oportunidades, su seguridad o su valor. No significa que todas las personas sean idénticas: significa eliminar barreras injustas y compensar desigualdades históricas.\n\nSe puede observar en áreas como educación, empleo, ingresos, cuidados, salud, participación política, representación y una vida libre de violencia.",
    default:
      "La igualdad de género es un proceso social y político que busca que las oportunidades, los derechos y las responsabilidades no estén limitados por el género. Para estudiarla con claridad podemos mirar tres capas: la historia de las luchas, los datos actuales y las acciones que transforman instituciones y relaciones cotidianas.\n\n¿Quieres que hablemos de historia, trabajo y cuidados, brechas entre países, educación, derechos o ejemplos de acciones concretas?",
  },
  en: {
    history:
      "There is no single number of years: women have always worked, both through care and productive work and through paid employment. Organized struggles for rights have roots going back centuries and gained major momentum in the 18th and 19th centuries, with demands for education, property, decent work and voting rights.\n\nFor modern milestones: the UN Charter recognized equal rights in 1945; the Beijing Platform for Action was agreed in 1995; and SDG 5 was adopted in 2015. The most accurate answer depends on whether we mean work, political rights or social movements.",
    countries:
      "Inequality is not captured by one number. A country may make progress in education while still facing gaps in pay, care, violence, political participation or decision-making.\n\nFor country comparisons, name the indicator and year: the World Economic Forum’s Global Gender Gap Index, UNDP’s Gender Inequality Index, the World Bank’s Women, Business and the Law, and UN Women data measure different dimensions. Tell me a region or indicator and I can help you interpret it.",
    meaning:
      "Gender equality means that everyone can exercise their rights and shape their lives without gender determining their opportunities, safety or worth. It does not mean everyone is identical; it means removing unfair barriers and addressing historical inequalities.\n\nWe can see it through education, employment, income, care, health, political participation, representation and freedom from violence.",
    default:
      "Gender equality is a social and political process that works toward opportunities, rights and responsibilities not being limited by gender. To study it clearly, we can look at three layers: the history of movements, current data and actions that change institutions and everyday relationships.\n\nWould you like to explore history, work and care, country gaps, education, rights or concrete actions?",
  },
};

export function demoAnswer(message: string, language: Language) {
  const normalized = message.toLowerCase();
  const languageAnswers = answers[language];
  if (/año|siglo|cuánto|cuantos|lucha|historia|trabaj|year|centur|long|movement|work/.test(normalized)) {
    return languageAnswers.history;
  }
  if (/país|paises|países|brecha|desigual|ranking|country|countries|gap|inequal|rank/.test(normalized)) {
    return languageAnswers.countries;
  }
  if (/significa|qué es|que es|concepto|meaning|what is|define/.test(normalized)) {
    return languageAnswers.meaning;
  }
  return languageAnswers.default;
}
