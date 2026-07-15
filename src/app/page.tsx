import type { Route } from "next";
import { ButtonLink } from "@/components/ui/button-link";
import {
  ArrowRightIcon,
  ArrowUpRightIcon,
  ChartIcon,
  CheckIcon,
  ClockIcon,
  LockIcon,
  ShieldIcon,
  SparklesIcon
} from "@/components/ui/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { CategoryCard } from "@/components/site/category-card";
import { FaqList } from "@/components/site/faq-list";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { JsonLd } from "@/components/site/json-ld";
import { ScorePreview } from "@/components/site/score-preview";
import { assessmentCategories } from "@/lib/site";
import { learningArticles } from "@/lib/content";
import { revenueProducts } from "@/lib/products";

const trustedPrinciples = [
  {
    icon: ShieldIcon,
    title: "Clear boundaries",
    description: "No diagnosis, mind reading or guaranteed predictions disguised as certainty."
  },
  {
    icon: LockIcon,
    title: "Privacy by design",
    description: "Minimal data collection and server-only handling for sensitive credentials."
  },
  {
    icon: ChartIcon,
    title: "Explainable scoring",
    description: "Reports explain the themes and answer patterns behind each conclusion."
  }
];

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Header />

      <main id="main-content">
        <section className="hero shell">
          <div className="hero-copy">
            <div className="hero-proof">
              <span><SparklesIcon /> Built for thoughtful self-discovery</span>
              <span>Eight assessments · One-time premium reports</span>
            </div>
            <h1>
              Understand the pattern behind <span className="text-gradient">who you are.</span>
            </h1>
            <p>
              Premium assessments that turn your answers into practical insight across personality,
              relationships, career and personal growth.
            </p>
            <div className="hero-actions">
              <ButtonLink href="#personality-dna">
                Explore Personality DNA <ArrowRightIcon />
              </ButtonLink>
              <ButtonLink href="#how-it-works" variant="secondary">
                See how it works
              </ButtonLink>
            </div>
            <div className="hero-trust">
              <span><CheckIcon /> Free result preview</span>
              <span><CheckIcon /> No fake certainty</span>
              <span><CheckIcon /> Private by default</span>
            </div>
          </div>

          <div className="hero-visual">
            <ScorePreview />
            <div className="floating-note floating-note-one">
              <span>Emotional depth</span><strong>92%</strong>
            </div>
            <div className="floating-note floating-note-two">
              <span>Best fit</span><strong>Reflective Builder</strong>
            </div>
          </div>
        </section>

        <section className="signal-strip" aria-label="Platform qualities">
          <div className="shell">
            {[
              "Personality insight",
              "Relationship intelligence",
              "Career alignment",
              "Growth systems",
              "Private reports"
            ].map((item) => <span key={item}>{item}</span>)}
          </div>
        </section>

        <section className="section shell" id="discover">
          <SectionHeading
            eyebrow="Explore VibeLytix"
            title="Start with the question that matters now."
            description="One coherent platform with eight focused assessments across personality, relationships, career, communication, leadership, and personal growth."
          />
          <div className="category-grid">
            {assessmentCategories.map((item) => <CategoryCard item={item} key={item.id} />)}
          </div>
        </section>



        <section className="section shell" id="products">
          <SectionHeading
            eyebrow="Personalised outcome products"
            title="Move from insight to a complete action system."
            description="Four premium products turn assessment direction and four planning answers into practical career, life, founder and relationship roadmaps."
          />
          <div className="product-grid">
            {revenueProducts.map((product) => (
              <article key={product.slug} className="product-card">
                <p className="eyebrow">{product.eyebrow}</p>
                <h3>{product.title}</h3>
                <p>{product.description}</p>
                <ul>{product.features.slice(0, 4).map((feature) => <li key={feature}><CheckIcon /> {feature}</li>)}</ul>
                <div><strong>₹{product.pricePaise / 100}</strong><ButtonLink href={`/products/${product.slug}` as Route}>Explore <ArrowRightIcon /></ButtonLink></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section shell value-section" id="free-vs-premium">
          <SectionHeading
            eyebrow="Know what you get"
            title="Start free. Unlock depth only when the preview feels useful."
            description="Every assessment gives genuine value before payment. Premium reports add the detailed interpretation, scenarios and action systems that make the result practical."
            align="center"
          />
          <div className="value-compare">
            <article className="value-card">
              <div className="value-card-head">
                <span>Free</span>
                <strong>₹0</strong>
              </div>
              <h3>Personal result preview</h3>
              <ul>
                {[
                  "Complete the full assessment",
                  "Personal profile or result type",
                  "Short personalised summary",
                  "Top two dimension scores",
                  "A clear sense of whether the result fits",
                  "No card and no subscription"
                ].map((item) => <li key={item}><CheckIcon /> {item}</li>)}
              </ul>
              <ButtonLink href="#discover" variant="secondary">Explore free assessments</ButtonLink>
            </article>
            <article className="value-card value-card-premium">
              <div className="value-card-head">
                <span>Premium</span>
                <strong>₹79–₹149</strong>
              </div>
              <h3>Deep, personalised report</h3>
              <ul>
                {[
                  "All four score interpretations",
                  "Strengths, blind spots and overused patterns",
                  "Behaviour under stress",
                  "Relationship, work or leadership scenarios",
                  "7-day practical reset plan",
                  "30-day growth roadmap",
                  "Save to account and print as branded PDF",
                  "One-time payment—no subscription"
                ].map((item) => <li key={item}><CheckIcon /> {item}</li>)}
              </ul>
              <ButtonLink href="#personality-dna">See the flagship assessment <ArrowRightIcon /></ButtonLink>
            </article>
          </div>
        </section>

        <section className="section section-soft life-stage-section">
          <div className="shell">
            <SectionHeading
              eyebrow="Built for different life stages"
              title="Useful questions change with age, work and responsibility."
              description="VibeLytix is designed for self-reflection across different stages of life—not as a one-size-fits-all diagnosis."
              align="center"
            />
            <div className="life-stage-grid">
              {[
                ["Teenagers & students", "Study preferences, identity, confidence, communication and early career direction."],
                ["Gen Z", "Relationships, boundaries, emotional intelligence, work fit and growth habits."],
                ["Working professionals", "Career alignment, communication, stress patterns, leadership and decision-making."],
                ["Millennials", "Sustainable growth, relationship patterns, career transitions and personal priorities."],
                ["Older adults", "Reflection, communication, changing roles, strengths and meaningful next chapters."],
                ["Entrepreneurs & business owners", "Leadership, decision ownership, communication, resilience and work style."]
              ].map(([title, description]) => (
                <article key={title}>
                  <span><SparklesIcon /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <p className="audience-disclaimer">
              Results are educational reflection tools. They do not replace medical, psychological,
              career, legal or financial advice.
            </p>
          </div>
        </section>

        <section className="section section-soft" id="how-it-works">
          <div className="shell">
            <SectionHeading
              eyebrow="How it works"
              title="Less horoscope. More structured reflection."
              description="The experience is designed to be useful before, during and after the final score."
              align="center"
            />

            <div className="process-grid">
              {[
                {
                  number: "01",
                  title: "Answer with context",
                  description: "Questions focus on real choices, habits and reactions rather than vague labels."
                },
                {
                  number: "02",
                  title: "See your pattern",
                  description: "Your answers are grouped into understandable traits, needs, tensions and strengths."
                },
                {
                  number: "03",
                  title: "Use the insight",
                  description: "The full report translates patterns into practical communication and decision guidance."
                }
              ].map((step) => (
                <article key={step.number}>
                  <span>{step.number}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section trust-section" id="trust">
          <div className="shell">
            <SectionHeading
              eyebrow="Science, safety & trust"
              title="Built to earn trust before asking for payment."
              description="VibeLytix clearly separates educational assessment insight from clinical advice, while keeping product limits and pricing visible."
              align="center"
            />

            <div className="trust-grid">
              {trustedPrinciples.map(({ icon: Icon, title, description }) => (
                <article key={title}>
                  <span><Icon /></span>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>

            <div className="trust-callout">
              <div>
                <p className="eyebrow"><ShieldIcon /> Product principle</p>
                <h3>We never promise “100% accurate” personality insight.</h3>
              </div>
              <p>
                Honest positioning improves user trust and reduces harmful overreliance. The goal is
                clarity and reflection—not authority over someone’s identity or future.
              </p>
            </div>
          </div>
        </section>

        <section className="section shell audience-section">
          <div className="audience-card audience-card-primary">
            <p className="eyebrow">For individuals</p>
            <h2>Know what energises you, drains you and helps you decide well.</h2>
            <p>Use the report privately, share selected insights, or return to compare how your patterns evolve.</p>
            <ButtonLink href="#personality-dna" variant="secondary">
              Start with Personality DNA <ArrowUpRightIcon />
            </ButtonLink>
          </div>
          <div className="audience-card">
            <p className="eyebrow">For better conversations</p>
            <h2>Turn vague feelings into language you can actually discuss.</h2>
            <p>Relationship assessments focus on communication, needs, boundaries, and repair—not manipulation or mind reading.</p>
          </div>
        </section>


        <section className="section section-soft" id="learning">
          <div className="shell">
            <SectionHeading
              eyebrow="Learning hub"
              title="Search-friendly guides with practical depth."
              description="Assessment pages answer a personal question. These guides answer the broader questions people search before making a decision."
            />
            <div className="learning-grid">
              {learningArticles.map((article) => (
                <a href={`/learn/${article.slug}`} key={article.slug}>
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                  <b>Read guide <ArrowUpRightIcon /></b>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section shell faq-section" id="faq">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Useful answers before you begin."
            description="These principles apply across every assessment, premium report and payment experience."
          />
          <FaqList />
        </section>

        <section className="final-cta shell">
          <div>
            <p className="eyebrow"><ClockIcon /> VibeLytix platform</p>
            <h2>Eight assessments, premium reports, and practical learning in one experience.</h2>
            <p>Start free, use the insight carefully and choose only the next step that genuinely fits.</p>
          </div>
          <ButtonLink href="#personality-dna">
            Start Personality DNA <ArrowRightIcon />
          </ButtonLink>
        </section>
      </main>

      <Footer />
    </>
  );
}
