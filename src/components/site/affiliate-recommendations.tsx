import { ArrowUpRightIcon } from "@/components/ui/icons";

const recommendations = {
  relationships: [
    { slug: "relationship-book", label: "Communication workbook", description: "A structured resource for clearer needs, boundaries and repair conversations." },
    { slug: "relationship-course", label: "Relationship skills course", description: "A guided learning option for communication and emotional maturity." }
  ],
  career: [
    { slug: "career-course", label: "Career skills course", description: "Build a practical, marketable skill aligned with your strongest work pattern." },
    { slug: "career-book", label: "Career clarity workbook", description: "Turn strengths and values into a focused career decision process." }
  ],
  growth: [
    { slug: "growth-book", label: "Habit design workbook", description: "A practical system for consistency, recovery and environment design." },
    { slug: "growth-course", label: "Personal growth course", description: "A guided program for building repeatable behaviour change." }
  ]
} as const;

export function AffiliateRecommendations({
  category
}: {
  category: keyof typeof recommendations;
}) {
  return (
    <section className="affiliate-block">
      <div>
        <p className="eyebrow">Recommended next steps</p>
        <h2>Resources matched to your result.</h2>
        <p>Only explore a recommendation if it supports a real goal. These links may be affiliate links.</p>
      </div>
      <div className="affiliate-grid">
        {recommendations[category].map((item) => (
          <a href={`/go/${item.slug}`} key={item.slug} rel="sponsored nofollow">
            <div><strong>{item.label}</strong><p>{item.description}</p></div>
            <ArrowUpRightIcon />
          </a>
        ))}
      </div>
    </section>
  );
}
