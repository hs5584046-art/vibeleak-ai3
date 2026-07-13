export const learningArticles = [
  {
    slug:"how-personality-tests-work", title:"How personality tests work—and what they cannot tell you",
    description:"Understand scoring, interpretation limits and how to use a personality result responsibly.", category:"Personality",
    sections:[
      ["A score is a model, not an identity","Assessments compress answers into patterns. They can create useful language, but cannot capture every context, relationship or life stage."],
      ["Look for observable behaviour","Useful interpretation connects a score to choices, habits and reactions. Vague praise feels good but rarely improves a decision."],
      ["Retest with context","A changed result may reflect stress, confidence, environment or genuine development. Compare behaviour before judging which result is correct."]
    ]
  },
  {
    slug:"healthy-relationship-communication", title:"Healthy relationship communication: needs, boundaries and repair",
    description:"Use direct language, healthy boundaries and post-conflict repair to build stronger connection.", category:"Relationships",
    sections:[
      ["Clarity is kinder than guessing","Healthy communication makes needs understandable without hints, tests, threats or withdrawal."],
      ["Boundaries protect connection","A boundary explains what you will do to protect wellbeing, time or dignity. It is not a tool for controlling another person."],
      ["Repair matters more than perfection","Strong relationships still contain conflict. The difference is whether impact is acknowledged and behaviour changes."]
    ]
  },
  {
    slug:"choose-a-career-that-fits", title:"How to choose a career that fits your working style",
    description:"Evaluate autonomy, mastery, impact and structure before making a career decision.", category:"Career",
    sections:[
      ["Job titles hide the environment","The same role can differ dramatically in autonomy, pace, management and customer contact."],
      ["Motivation needs a system","Interest starts effort, but sustainable performance depends on feedback, role clarity, energy and a realistic learning path."],
      ["Test assumptions cheaply","Use small projects, interviews, shadowing or freelance work before committing to a major change."]
    ]
  },
  {
    slug:"build-habits-that-survive-bad-days", title:"How to build habits that survive bad days",
    description:"Design consistency around minimum actions, recovery and environment—not perfect motivation.", category:"Growth",
    sections:[
      ["Make the minimum action obvious","A useful habit needs a version small enough for low-energy days."],
      ["Recovery is part of consistency","Consistency is not an unbroken streak. It is the ability to return before one miss becomes a pattern."],
      ["Change the environment","Reduce friction for desired behaviour and increase friction for automatic distractions."]
    ]
  },
  {
    slug:"attachment-styles-without-labels", title:"Attachment styles without turning them into permanent labels",
    description:"Use attachment concepts to notice patterns without diagnosing yourself or your partner.", category:"Relationships",
    sections:[
      ["Attachment is context-sensitive","People can feel secure in one relationship and activated in another. A style is not a fixed personality type."],
      ["Name the protective strategy","Anxiety seeks certainty; avoidance seeks distance. Both strategies usually attempt to reduce emotional risk."],
      ["Practice direct repair","Ask for reassurance, boundaries or time explicitly instead of testing, chasing or disappearing."]
    ]
  },
  {
    slug:"improve-emotional-intelligence", title:"How to improve emotional intelligence in everyday situations",
    description:"Strengthen emotional recognition, regulation, empathy and expression through practical habits.", category:"Self awareness",
    sections:[
      ["Name emotion precisely","Specific language—disappointed, anxious, excluded—creates more useful choices than simply good or bad."],
      ["Pause without suppressing","Regulation means creating enough space to choose a response, not pretending the emotion does not exist."],
      ["Check empathy against evidence","Understanding another perspective requires curiosity, not certainty about what someone secretly feels."]
    ]
  },
  {
    slug:"communicate-assertively", title:"How to communicate assertively without becoming aggressive",
    description:"State needs and boundaries clearly while preserving respect and choice.", category:"Communication",
    sections:[
      ["Describe the behaviour","Focus on what happened rather than attacking personality or motives."],
      ["State the impact and request","Explain why it matters and what specific change would help."],
      ["Allow a real answer","Assertiveness protects your choice while respecting that another person also has agency."]
    ]
  },
  {
    slug:"leadership-styles-and-team-trust", title:"Leadership styles that build performance and team trust",
    description:"Balance direction, coaching, decisiveness and psychological safety.", category:"Leadership",
    sections:[
      ["Clarity reduces hidden work","Teams perform better when priorities, ownership and decision rights are explicit."],
      ["Coaching is not avoiding standards","Development includes useful feedback and accountability, not endless encouragement."],
      ["Trust needs consistent behaviour","Safety grows when problems can be raised without humiliation and standards are applied fairly."]
    ]
  },
  {
    slug:"decision-making-under-stress", title:"How to make better decisions under stress",
    description:"Reduce emotional urgency, separate reversible choices and protect clear thinking.", category:"Decisions",
    sections:[
      ["Lower the immediate intensity","Sleep, food, movement and time can change what appears urgent or impossible."],
      ["Separate reversible decisions","Many choices can be tested or adjusted. Treating every decision as permanent increases unnecessary pressure."],
      ["Define the next evidence","Ask what information would materially change the decision instead of collecting endless reassurance."]
    ]
  },
  {
    slug:"self-awareness-without-overthinking", title:"Self-awareness without getting trapped in overthinking",
    description:"Turn reflection into usable insight and action instead of repeated mental analysis.", category:"Growth",
    sections:[
      ["Ask a behavioural question","Replace 'What is wrong with me?' with 'What happened before this pattern and what did I do next?'"],
      ["Limit reflection time","Insight should lead to an experiment, conversation or boundary—not another hour of circular thought."],
      ["Use outside perspective carefully","Trusted feedback can reveal blind spots, but it should not replace your responsibility for the final decision."]
    ]
  }
] as const;

export const seoLandingPages = [
  ["free-personality-test","Free Personality Test with Detailed Preview","Explore personality traits through a structured assessment and optional premium report.","personality-dna"],
  ["ai-personality-test","AI Personality Test for Practical Self-Discovery","Understand how modern scoring turns answers into strengths, cautions and actions.","personality-dna"],
  ["personality-test-india","Personality Test for Indian Users","A mobile-friendly personality assessment with transparent pricing in INR.","personality-dna"],
  ["relationship-compatibility-test","Relationship Compatibility and Communication Test","Explore communication, boundaries, security and conflict repair.","relationship-intelligence"],
  ["relationship-intelligence-test","Relationship Intelligence Test","Measure the practical skills behind emotionally mature relationships.","relationship-intelligence"],
  ["attachment-style-test","Attachment Style Test","Explore closeness, reassurance sensitivity, distance and repair patterns.","attachment-style"],
  ["emotional-intelligence-test","Emotional Intelligence Test","Assess emotional recognition, regulation, empathy and expression.","emotional-intelligence"],
  ["communication-style-test","Communication Style Test","Discover your balance of directness, listening, context and assertiveness.","communication-style"],
  ["career-personality-test","Career Personality Test","Connect autonomy, mastery, impact and structure to better career choices.","career-alignment"],
  ["career-alignment-test","Career Alignment Assessment","Identify the work environment that supports sustainable performance.","career-alignment"],
  ["leadership-style-test","Leadership Style Test","Explore direction-setting, coaching, decisiveness and team trust.","leadership-style"],
  ["work-style-assessment","Work Style Assessment","Understand how you perform, collaborate and stay motivated at work.","career-alignment"],
  ["personal-growth-assessment","Personal Growth Assessment","Measure consistency, awareness, recovery and environment design.","growth-systems"],
  ["self-awareness-test","Self-Awareness Test","Explore emotional patterns, triggers and practical reflection skills.","emotional-intelligence"],
  ["habit-building-assessment","Habit Building Assessment","Find the system that can make useful behaviour easier to repeat.","growth-systems"]
].map(([slug,title,description,assessmentId]) => ({
  slug, title, description, assessmentId,
  benefits:[
    "Complete the assessment free before deciding whether to purchase.",
    "See a useful personal preview rather than a generic score.",
    "Unlock a detailed report with strengths, watchouts and practical next steps."
  ],
  faqs:[
    ["Is this a diagnosis?","No. It is an educational self-reflection tool and does not provide medical or psychological diagnosis."],
    ["Do I have to pay?","No. Completing the assessment and viewing the preview are free. The detailed report is optional."],
    ["Can the result change?","Yes. Context, stress, experience and behaviour can influence how a pattern appears."]
  ]
})) as readonly {
  slug:string; title:string; description:string; assessmentId:string;
  benefits:readonly string[]; faqs:readonly (readonly [string,string])[];
}[];

export function getLearningArticle(slug:string) {
  return learningArticles.find((article) => article.slug === slug);
}
export function getSeoLandingPage(slug:string) {
  return seoLandingPages.find((page) => page.slug === slug);
}
