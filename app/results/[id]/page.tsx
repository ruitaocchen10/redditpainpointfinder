import { notFound } from "next/navigation";
import ResultsView, { ResultData } from "./ResultsView";

const MOCK_DATA: Record<string, ResultData> = {
  "1": {
    subreddits: ["startups"],
    date: "Jan 2026",
    postCount: 100,
    timeRange: "Last month",
    painPoints: [
      {
        id: "1-1",
        title: "No clear onboarding path after signup",
        severity: "high",
        frequency: 11,
        topQuote:
          "I signed up, got to a blank dashboard, and had absolutely no idea what to do first. Closed the tab and never came back.",
        categories: ["Onboarding", "UX", "Retention"],
        aiSummary:
          "Users consistently describe landing on empty dashboards with no guidance after signup. Without sample data, a structured tour, or clear next-step prompts, new users never reach an 'aha moment' and abandon the product early. Founders who added even a minimal onboarding checklist reported significant drops in early churn.",
        posts: [
          {
            title: "Why are so many SaaS apps terrible at onboarding?",
            upvotes: 847,
            excerpt:
              "Every time I sign up for a new tool the experience is the same — blank screen, maybe a tooltip tour I click through without reading, then I'm on my own.",
            url: "https://reddit.com/r/startups/comments/example1",
          },
          {
            title: "We cut churn by 40% just by adding an onboarding checklist",
            upvotes: 1240,
            excerpt:
              "Turns out our users weren't churning because they didn't like the product — they churned because they never figured out how to use it in the first place.",
            url: "https://reddit.com/r/startups/comments/example2",
          },
          {
            title: "What makes a great SaaS onboarding experience?",
            upvotes: 392,
            excerpt:
              "Looking for examples of apps that nail onboarding. Most of what I've seen is either overwhelming or completely absent.",
            url: "https://reddit.com/r/startups/comments/example3",
          },
        ],
      },
      {
        id: "1-2",
        title: "Cofounder equity splits cause late-stage conflicts",
        severity: "high",
        frequency: 9,
        topQuote:
          "We split equity 50/50 on day one because we were friends. Two years later one of us was doing 80% of the work and it destroyed the company.",
        categories: ["Cofounders", "Legal", "Equity"],
        aiSummary:
          "Many founders report that informal or equal equity splits negotiated early in the relationship lead to serious conflicts once workloads diverge. The recurring advice is to use vesting schedules with a cliff, document contributions in writing, and revisit splits before taking investment. Teams that skip this step frequently cite it as the core reason their startup failed.",
        posts: [
          {
            title: "50/50 equity split is killing our startup — what do we do?",
            upvotes: 2100,
            excerpt:
              "My cofounder and I are deadlocked on every major decision and we both own exactly half. We didn't think we'd need a tiebreaker clause.",
            url: "https://reddit.com/r/startups/comments/example4",
          },
          {
            title: "Lessons from a cofounder breakup",
            upvotes: 876,
            excerpt:
              "We shook hands on equity on day one. No vesting, no cliff, no documentation. When he left after 6 months he walked away with 40%.",
            url: "https://reddit.com/r/startups/comments/example5",
          },
          {
            title: "How to structure a cofounder agreement the right way",
            upvotes: 543,
            excerpt:
              "Use a 4-year vest with a 1-year cliff. Get a lawyer. Have the awkward conversation before you're too emotionally invested.",
            url: "https://reddit.com/r/startups/comments/example6",
          },
        ],
      },
      {
        id: "1-3",
        title: "Investor cold emails rarely get responses",
        severity: "medium",
        frequency: 8,
        topQuote:
          "Sent 200 cold emails to VCs over two months. Got 3 replies. All three were no. It's nearly impossible to break through without a warm intro.",
        categories: ["Fundraising", "Networking", "Outreach"],
        aiSummary:
          "First-time founders without existing VC networks find cold outreach almost completely ineffective. Experienced founders advise focusing on building relationships before you need money — through accelerators, angel syndicates, and introductions from other founders. The signal-to-noise ratio of cold VC emails is so poor that many now consider it a waste of time.",
        posts: [
          {
            title: "Cold emailing VCs — does it ever actually work?",
            upvotes: 641,
            excerpt:
              "Everyone says 'get a warm intro' but nobody explains how to get warm intros when you're completely new to the ecosystem.",
            url: "https://reddit.com/r/startups/comments/example7",
          },
          {
            title: "How I raised my seed round without a single warm intro",
            upvotes: 1890,
            excerpt:
              "It took 14 months and I talked to 87 investors. The cold email conversion rate was under 2%. Here's what eventually worked.",
            url: "https://reddit.com/r/startups/comments/example8",
          },
        ],
      },
      {
        id: "1-4",
        title: "Unclear signals for product-market fit",
        severity: "medium",
        frequency: 7,
        topQuote:
          "People say they love it in interviews but nobody buys. How do you know when you actually have PMF vs. when people are just being polite?",
        categories: ["Validation", "PMF", "Customer Research"],
        aiSummary:
          "Founders struggle to distinguish genuine product-market fit from polite user feedback. The clearest indicators cited are organic word-of-mouth growth, users who would be 'very disappointed' if the product disappeared, and retention curves that flatten rather than decline to zero. Many teams over-index on qualitative compliments and under-index on actual retention and referral data.",
        posts: [
          {
            title: "How do you know when you have PMF vs. just happy early users?",
            upvotes: 1120,
            excerpt:
              "My users tell me they love the product and use it weekly. But I still feel like I'm pushing a boulder uphill to grow. Is that normal?",
            url: "https://reddit.com/r/startups/comments/example9",
          },
          {
            title: "The only PMF test that matters",
            upvotes: 734,
            excerpt:
              "Ask users: 'How would you feel if you could no longer use this product?' If fewer than 40% say 'very disappointed', you don't have PMF yet.",
            url: "https://reddit.com/r/startups/comments/example10",
          },
        ],
      },
      {
        id: "1-5",
        title: "Technical founders struggle to price their product",
        severity: "low",
        frequency: 5,
        topQuote:
          "I genuinely have no idea what to charge. I'm terrified of pricing too high and scaring people off, so I've been giving it away almost for free.",
        categories: ["Pricing", "Revenue", "Strategy"],
        aiSummary:
          "Technical founders commonly underprice out of fear rather than data. The pattern is to start too low, attract cost-sensitive customers who churn anyway, then struggle to raise prices later. Value-based pricing — anchored to the outcome the product delivers rather than cost — is consistently cited as the right framework, but most first-timers learn this lesson only after leaving money on the table.",
        posts: [
          {
            title: "How do you figure out what to charge for your B2B SaaS?",
            upvotes: 490,
            excerpt:
              "I've been charging $9/month because it felt safe. My users all say it's worth way more but I can't bring myself to raise prices.",
            url: "https://reddit.com/r/startups/comments/example11",
          },
        ],
      },
    ],
  },

  "2": {
    subreddits: ["SaaS"],
    date: "Feb 2026",
    postCount: 100,
    timeRange: "Last month",
    painPoints: [
      {
        id: "2-1",
        title: "Pricing pages make it impossible to estimate real cost",
        severity: "high",
        frequency: 9,
        topQuote:
          "I spent 20 minutes on the pricing page and still couldn't figure out what I'd actually pay each month. I gave up and bought from a competitor.",
        categories: ["Pricing", "UX", "Conversion"],
        aiSummary:
          "Users report that complex, seat-based, or usage-based pricing with no cost calculator causes them to abandon evaluation entirely. The frustration is not with the price itself but with opacity — when customers can't estimate their bill, they default to 'no'. Simple pricing pages with a cost estimator or concrete examples consistently outperform tiered grid layouts in conversion.",
        posts: [
          {
            title: "Your pricing page is costing you customers — here's why",
            upvotes: 2340,
            excerpt:
              "If I can't figure out what I'll pay in under 60 seconds, I close the tab. You're not mysterious, you're just frustrating.",
            url: "https://reddit.com/r/SaaS/comments/example1",
          },
          {
            title: "We simplified our pricing and conversion went up 28%",
            upvotes: 1100,
            excerpt:
              "Removed the 5-tier plan grid. Went to two plans with a cost calculator. Trials went up, support tickets about billing went down.",
            url: "https://reddit.com/r/SaaS/comments/example2",
          },
          {
            title: "Usage-based pricing is great for vendors, terrible for buyers",
            upvotes: 870,
            excerpt:
              "I can't budget for a tool when every month's bill is a surprise. I'd rather pay more upfront for predictability.",
            url: "https://reddit.com/r/SaaS/comments/example3",
          },
        ],
      },
      {
        id: "2-2",
        title: "Feature bloat makes the product exhausting to use daily",
        severity: "high",
        frequency: 8,
        topQuote:
          "The app started simple and fast. Now it takes 4 clicks to do what used to take 1. Every update adds features nobody asked for.",
        categories: ["Product", "UX", "Churn"],
        aiSummary:
          "Long-tenured users frequently cite feature accumulation as the primary reason they consider switching. Each new feature adds cognitive load for users who don't need it. The pattern — adding features to attract new customers while eroding the experience for existing ones — is described as a common SaaS death spiral. Users want settings that let them hide unused features.",
        posts: [
          {
            title: "Why I'm leaving [tool] after 3 years — feature creep",
            upvotes: 1890,
            excerpt:
              "I became a power user because it was fast and focused. Now the team keeps shipping features that make it slower and more confusing.",
            url: "https://reddit.com/r/SaaS/comments/example4",
          },
          {
            title: "The best SaaS products I use haven't changed much in years",
            upvotes: 960,
            excerpt:
              "Stability is underrated. The tools I rely on most are ones that do one thing extremely well and resist the urge to expand.",
            url: "https://reddit.com/r/SaaS/comments/example5",
          },
        ],
      },
      {
        id: "2-3",
        title: "API documentation is outdated or missing key examples",
        severity: "medium",
        frequency: 6,
        topQuote:
          "The docs show me the endpoints but not how to actually use them together. I spent two days figuring out an integration that should have taken two hours.",
        categories: ["Developer Experience", "API", "Documentation"],
        aiSummary:
          "Developer-focused SaaS tools lose integrations and enterprise deals because their API docs lack practical, real-world examples. Listing endpoints is not enough — developers need end-to-end tutorials showing common workflows. Tools that invest in runnable examples, Postman collections, and up-to-date SDKs report dramatically faster developer onboarding and fewer support escalations.",
        posts: [
          {
            title: "Good API docs are a competitive moat — most teams ignore this",
            upvotes: 1450,
            excerpt:
              "I've walked away from otherwise excellent APIs because the documentation was clearly written by the engineers who built it and assumes knowledge I don't have.",
            url: "https://reddit.com/r/SaaS/comments/example6",
          },
          {
            title: "How we rewrote our API docs and halved integration support tickets",
            upvotes: 728,
            excerpt:
              "Added a 'Getting started in 5 minutes' guide with real code examples. The change was dramatic.",
            url: "https://reddit.com/r/SaaS/comments/example7",
          },
        ],
      },
      {
        id: "2-4",
        title: "Customer support disappears after initial onboarding",
        severity: "medium",
        frequency: 5,
        topQuote:
          "Sales was incredibly attentive. We signed. Then we had a problem and the support queue was 5 days. That's when we started evaluating competitors.",
        categories: ["Support", "Retention", "Customer Success"],
        aiSummary:
          "A recurring pattern: white-glove sales attention followed by near-absent post-sale support. Users feel misled and are more likely to churn than customers who received average-but-consistent support throughout their lifecycle. Startups that invest in customer success infrastructure — even lightweight automated check-ins — see meaningfully higher retention.",
        posts: [
          {
            title: "The bait-and-switch of B2B SaaS support",
            upvotes: 1670,
            excerpt:
              "Amazing demos, attentive AEs, quick responses pre-sale. Then you sign and you're directed to a knowledge base article.",
            url: "https://reddit.com/r/SaaS/comments/example8",
          },
        ],
      },
    ],
  },

  "3": {
    subreddits: ["productivity", "getdisciplined"],
    date: "Feb 2026",
    postCount: 150,
    timeRange: "Last month",
    painPoints: [
      {
        id: "3-1",
        title: "Apps keep adding features until they become unusable",
        severity: "high",
        frequency: 16,
        topQuote:
          "I've switched productivity apps four times this year. They all start simple and clean and then get absolutely buried in settings, AI features, and integrations I don't need.",
        categories: ["Product", "Overwhelm", "Tool Fatigue"],
        aiSummary:
          "The most upvoted frustration across both subreddits: productivity tools that chase power users by adding complexity end up alienating their core audience. Users want the 2020 version of their app, not the 2026 version. Apps that offer a 'simple mode' or resist feature creep are consistently recommended in threads about switching. The demand for focused, minimal tools is unmet.",
        posts: [
          {
            title: "Why I use a text file instead of Notion, Obsidian, or any other app",
            upvotes: 8900,
            excerpt:
              "Every tool I've tried eventually becomes its own job to maintain. A text file doesn't have a changelog.",
            url: "https://reddit.com/r/productivity/comments/example1",
          },
          {
            title: "Productivity app recommendations that are still simple in 2026?",
            upvotes: 3400,
            excerpt:
              "Looking for something that won't turn into a second-brain project management system. Just want to capture tasks and do them.",
            url: "https://reddit.com/r/productivity/comments/example2",
          },
          {
            title: "I evaluated 12 task managers. Here's why I went back to paper.",
            upvotes: 2100,
            excerpt:
              "Paper doesn't have a premium tier. Paper doesn't send me push notifications. Paper doesn't have an AI copilot I didn't ask for.",
            url: "https://reddit.com/r/getdisciplined/comments/example3",
          },
        ],
      },
      {
        id: "3-2",
        title: "Digital distractions sabotage deep work sessions",
        severity: "high",
        frequency: 15,
        topQuote:
          "I'll sit down to focus for two hours and end up spending 40 minutes on Reddit and YouTube without even consciously choosing to open them.",
        categories: ["Focus", "Deep Work", "Habits"],
        aiSummary:
          "Habitual context-switching — often triggered by micro-boredom during hard cognitive tasks — is cited as the single biggest obstacle to productive work. Solutions users have tried include website blockers, phone-in-another-room, and schedule-based focus blocks, but compliance breaks down within weeks. The gap in the market is tools or systems that make distraction genuinely harder without requiring constant willpower.",
        posts: [
          {
            title: "I can't focus for more than 20 minutes. How do people actually do deep work?",
            upvotes: 5600,
            excerpt:
              "I've read Deep Work, I've tried the Pomodoro technique, I've installed every blocker app. Nothing sticks longer than a few weeks.",
            url: "https://reddit.com/r/getdisciplined/comments/example4",
          },
          {
            title: "The only thing that helped my focus was radical environment design",
            upvotes: 2900,
            excerpt:
              "I got a second laptop with no social media accounts, no browser saved passwords, and no entertainment apps. It's annoying to set up but it works.",
            url: "https://reddit.com/r/productivity/comments/example5",
          },
          {
            title: "Website blockers don't work for people with no impulse control (like me)",
            upvotes: 1800,
            excerpt:
              "I disable the blocker within minutes of it getting in my way. I need something I literally cannot override.",
            url: "https://reddit.com/r/getdisciplined/comments/example6",
          },
        ],
      },
      {
        id: "3-3",
        title: "Motivation drops sharply after the first week",
        severity: "high",
        frequency: 13,
        topQuote:
          "Day 1 through 5 I'm unstoppable. Day 7 I miss once. Day 10 I've completely stopped and feel guilty about it.",
        categories: ["Motivation", "Habits", "Consistency"],
        aiSummary:
          "The post-first-week motivation cliff is one of the most-discussed phenomena in both communities. Initial motivation is driven by novelty and resolve, both of which fade quickly. Users who sustain habits long-term cite external accountability (accountability partners, public commitments, coaches) and identity-level framing ('I am someone who exercises' rather than 'I am trying to exercise') as the most effective interventions.",
        posts: [
          {
            title: "Why does motivation always die around day 7-10?",
            upvotes: 7200,
            excerpt:
              "This is so consistent for me it's almost predictable. I start strong, something disrupts the streak, and I can't restart.",
            url: "https://reddit.com/r/getdisciplined/comments/example7",
          },
          {
            title: "Accountability partner changed my life — how to find one",
            upvotes: 3100,
            excerpt:
              "I failed solo for 3 years. Found a stranger online to check in with daily. Haven't missed a day in 8 months.",
            url: "https://reddit.com/r/getdisciplined/comments/example8",
          },
          {
            title: "The 'never miss twice' rule is the only habit advice I still follow",
            upvotes: 1950,
            excerpt:
              "Perfection kills habits. Missing once is human. Missing twice is starting a new (bad) habit.",
            url: "https://reddit.com/r/productivity/comments/example9",
          },
        ],
      },
      {
        id: "3-4",
        title: "Habit tracking systems collapse without accountability",
        severity: "medium",
        frequency: 9,
        topQuote:
          "I've built beautiful habit trackers in Notion, Obsidian, and custom spreadsheets. I use them for three weeks and then they gather dust.",
        categories: ["Habit Tracking", "Systems", "Accountability"],
        aiSummary:
          "Users invest significant time building elaborate self-tracking systems, but the systems themselves become the project rather than the habits they're meant to support. Solo tracking without external accountability consistently fails. Apps with social or accountability features outperform identical apps without them for long-term retention. The insight gap is between knowing what to do and having structural reasons to do it.",
        posts: [
          {
            title: "I've wasted hundreds of hours designing productivity systems that I never use",
            upvotes: 4100,
            excerpt:
              "The meta-work of organizing my work has become a way to avoid the actual work. Sound familiar?",
            url: "https://reddit.com/r/productivity/comments/example10",
          },
          {
            title: "Do habit trackers actually help or do they just feel productive?",
            upvotes: 1700,
            excerpt:
              "I track my habits more carefully than I do the habits themselves. That can't be right.",
            url: "https://reddit.com/r/getdisciplined/comments/example11",
          },
        ],
      },
      {
        id: "3-5",
        title: "Note-taking tools create more friction than they reduce",
        severity: "medium",
        frequency: 7,
        topQuote:
          "I spend more time filing, tagging, and linking notes than I do actually using them. My second brain is a graveyard of ideas I never revisit.",
        categories: ["Note-taking", "PKM", "Tool Friction"],
        aiSummary:
          "The personal knowledge management (PKM) space is saturated with tools that require ongoing maintenance. Users who adopt complex systems report diminishing returns — the energy required to maintain the system exceeds the value extracted from it. Simpler systems with lower capture friction (voice memos, plain text files) are consistently cited as more sustainable despite being less powerful.",
        posts: [
          {
            title: "My Obsidian vault has 3,000 notes I have never read again",
            upvotes: 5400,
            excerpt:
              "Capturing everything felt productive. Retrieving anything feels impossible. I'm starting to think the whole second-brain thing is a scam.",
            url: "https://reddit.com/r/productivity/comments/example12",
          },
          {
            title: "The problem with every note-taking app is the same",
            upvotes: 2200,
            excerpt:
              "They're all optimized for input, not retrieval. Notes only have value when you can find and use them.",
            url: "https://reddit.com/r/productivity/comments/example13",
          },
        ],
      },
      {
        id: "3-6",
        title: "Productivity advice assumes unlimited free time",
        severity: "low",
        frequency: 4,
        topQuote:
          "Every productivity system I've tried was clearly designed by someone with no kids, no commute, and flexible work hours. My life doesn't have 4-hour focus blocks.",
        categories: ["Work-Life Balance", "Advice", "Realism"],
        aiSummary:
          "A niche but vocal segment of both communities pushes back against mainstream productivity advice as being written for a narrow demographic. Parents, caregivers, and people with rigid 9-5 schedules find most systems impractical. There's demand for productivity frameworks designed around constraints: 20-minute windows, interrupted attention, and limited energy.",
        posts: [
          {
            title: "Can we talk about productivity advice for people with actual lives?",
            upvotes: 6800,
            excerpt:
              "I don't have a morning routine because my toddler wakes up at 5am in a bad mood. I work in the gaps, not in scheduled deep work blocks.",
            url: "https://reddit.com/r/getdisciplined/comments/example14",
          },
        ],
      },
    ],
  },
};

export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = MOCK_DATA[id];

  if (!data) notFound();

  return <ResultsView data={data} />;
}
