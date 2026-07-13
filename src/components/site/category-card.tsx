import Link from "next/link";
import { ArrowUpRightIcon, ClockIcon } from "@/components/ui/icons";

type Category = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  meta: string;
  price: string;
  status: string;
  featured: boolean;
  accent: string;
};

export function CategoryCard({ item }: { item: Category }) {
  const content = (
    <>
      <div className="category-card-top">
        <p className="eyebrow">{item.eyebrow}</p>
        <span>{item.status}</span>
      </div>
      <div className="category-orb" aria-hidden="true">
        <span>{item.title.split(" ").map((word) => word[0]).join("")}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.description}</p>
      <div className="category-meta">
        <span><ClockIcon /> {item.meta}</span>
        <strong>{item.price}</strong>
      </div>
      <div className="category-action">
        Start assessment
        <ArrowUpRightIcon />
      </div>
    </>
  );

  return (
    <Link
      id={item.featured ? "personality-dna" : undefined}
      href={`/assessments/${item.id}`}
      className={`category-card category-${item.accent} ${item.featured ? "category-featured" : ""}`}
    >
      {content}
    </Link>
  );
}
