import { faqItems } from "@/lib/site";

export function FaqList() {
  return (
    <div className="faq-list">
      {faqItems.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>
            <span>{item.question}</span>
            <b aria-hidden="true">+</b>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
