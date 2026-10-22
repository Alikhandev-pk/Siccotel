import type { StaticImageData } from "next/image";
import transsionDelegation from "@/assets/news/transsion-distributor-delegation.jpg";
import transsionWelcome from "@/assets/news/transsion-delegation-welcome.jpg";
import pta5g from "@/assets/news/pta-5g-device-meeting.jpg";
import milestoneSigning from "@/assets/news/zte-nubia-milestone-signing.jpg";
import milestoneTeam from "@/assets/news/zte-nubia-milestone-team.jpg";
import milestoneAward from "@/assets/news/zte-nubia-milestone-award.jpg";
import milestoneCelebration from "@/assets/news/zte-nubia-milestone-celebration.jpg";
import zteHq from "@/assets/news/zte-corporation-hq-visit.jpg";
import zteHqMeeting from "@/assets/news/zte-nubia-hq-meeting.jpg";
import partnershipHandshake from "@/assets/news/zte-nubia-partnership-handshake.jpg";
import partnershipCeremony from "@/assets/news/zte-nubia-partnership-ceremony.jpg";
import partnershipSigning from "@/assets/news/zte-nubia-partnership-signing.jpg";
import partnershipLaunch from "@/assets/news/zte-nubia-partnership-launch.jpg";
import launchEvent from "@/assets/news/zte-nubia-launch-event.jpg";
import mwcHmd from "@/assets/news/mwc-barcelona-2025-hmd-booth.jpg";
import mwc02 from "@/assets/news/mwc-barcelona-2025-meeting-02.jpg";
import mwc03 from "@/assets/news/mwc-barcelona-2025-meeting-03.jpg";
import mwcTecno from "@/assets/news/mwc-barcelona-2025-tecno-booth.jpg";
import hmdMeeting from "@/assets/news/hmd-global-meeting-china.jpg";
import tourFrankfurt from "@/assets/news/dealers-tour-frankfurt-group.jpg";
import tourRiver from "@/assets/news/dealers-tour-frankfurt-river.jpg";
import tourGroup from "@/assets/news/dealers-tour-europe-group.jpg";
import tourArcade from "@/assets/news/dealers-tour-europe-arcade.jpg";
import itcnVisit from "@/assets/news/itcn-asia-2023-pavilion-visit.jpg";
import itcnPavilion from "@/assets/news/itcn-asia-2023-mobile-pavilion.jpg";

export type NewsImage = { src: StaticImageData; alt: string; objectPosition?: string };

export type NewsArticle = {
  slug: string;
  title: string;
  /**
   * The original News & Media page publishes no dates. This field is only set
   * when the article text itself names the event or period.
   */
  context?: string;
  summary: string;
  body: (string | { list: string[] } | { quote: string })[];
  images: NewsImage[];
};

/** Ordered as on https://siccotel.com/news-media/ (most recent first). */
export const news: NewsArticle[] = [
  {
    slug: "transsion-hosts-distributors-from-pakistan",
    title: "Transsion Hosts Its Distributors from Pakistan",
    summary:
      "Transsion hosted its distributors from Pakistan in China for a special delegation visit focused on deeper collaboration.",
    body: [
      "Fresh beginnings, deeper collaborations and greater possibilities ahead.",
      "Transsion hosted its distributors from Pakistan in China for a special delegation visit — strengthening connections and working together to build the future.",
    ],
    images: [
      { src: transsionDelegation, alt: "The Pakistan distributor delegation outside Transsion’s headquarters in China" },
      { src: transsionWelcome, alt: "The delegation in front of a welcome screen inside Transsion’s offices" },
    ],
  },
  {
    slug: "accelerating-5g-device-adoption-in-pakistan",
    title: "Accelerating 5G Device Adoption in Pakistan",
    summary:
      "A Siccotel delegation met the PTA Chairman to discuss 5G smart device adoption and device financing plans.",
    body: [
      "A Siccotel delegation met PTA Chairman Major General (R) Hafeezur Rehman to discuss accelerating the adoption of 5G smart devices in Pakistan.",
      "Chairman Siccotel Usman Sultan, CRO Col (R) Asad Ullah Ghauri and Head of Commercial Abdul Samad Khattak represented the company.",
      "Discussions focused on BNPL (EMI) mobile device financing plans and on expanding consumer access to 5G smart devices.",
    ],
    images: [{ src: pta5g, alt: "Siccotel’s delegation during the meeting on 5G smart device adoption", objectPosition: "50% 0%" }],
  },
  {
    slug: "zte-nubia-and-siccotel-celebrate-a-major-milestone",
    title: "ZTE nubia and Siccotel Celebrate a Major Milestone",
    context: "Q4 2025",
    summary:
      "ZTE nubia Pakistan and its distributor Siccotel marked the import of over 400,000 smartphones in the last quarter of 2025.",
    body: [
      "ZTE nubia Pakistan, in collaboration with its distributor Siccotel, celebrated a major milestone: importing over 400,000 smartphones in the last quarter of 2025.",
      "The event was attended by global nubia leaders and Siccotel management, including Mr. Usman Sultan, CEO, and Mr. Hamood Ahmed Salar, Commercial Director, highlighting the company’s growth in 2025.",
      "Looking ahead to 2026, the teams discussed strategic plans and targets to support continued expansion in the Pakistani market. The achievement reflects a strong partnership and a shared commitment to delivering innovative technology to consumers.",
    ],
    images: [
      { src: milestoneSigning, alt: "Siccotel and ZTE nubia representatives signing documents at the milestone event" },
      { src: milestoneTeam, alt: "Siccotel and ZTE teams together at ZTE’s Pakistan office" },
      { src: milestoneAward, alt: "A commemorative award being presented at the ZTE nubia milestone event" },
      { src: milestoneCelebration, alt: "Siccotel and ZTE nubia teams cutting a cake together" },
    ],
  },
  {
    slug: "siccotel-at-zte-nubia-headquarters",
    title: "Future Locked: Siccotel at ZTE nubia Headquarters",
    summary:
      "Siccotel’s Chairman visited ZTE nubia headquarters in China to celebrate device success in Pakistan and align on new launches.",
    body: [
      "Siccotel Chairman Usman Sultan was invited to ZTE nubia’s headquarters in China.",
      "The visit celebrated the success of the A35e, A36, A56 and V60D in Pakistan, and both sides aligned on upcoming launches and plans.",
      "The ZTE nubia and Siccotel partnership is strong — and new technology is on the way.",
    ],
    images: [
      { src: zteHq, alt: "Siccotel visitors outside ZTE Corporation headquarters beneath a welcome banner" },
      { src: zteHqMeeting, alt: "A Siccotel representative and a ZTE executive exchanging gifts at the headquarters meeting" },
    ],
  },
  {
    slug: "siccotel-joins-hands-with-zte-nubia",
    title: "Siccotel Joins Hands with ZTE nubia",
    summary:
      "Siccotel became ZTE nubia’s exclusive distributor and strategic partner in Pakistan.",
    body: [
      "Siccotel has joined hands with ZTE nubia as its exclusive distributor and strategic partner.",
      "The alliance marks a milestone for Siccotel and a significant moment for Pakistan’s telecom industry.",
      "With a shared vision of innovation, quality and value, the partnership aims to bring advanced technology and premium smartphones within reach of consumers across the country.",
    ],
    images: [
      { src: partnershipSigning, alt: "Siccotel and ZTE nubia teams at the partnership signing table" },
      { src: partnershipHandshake, alt: "Representatives of ZTE nubia and Siccotel shaking hands" },
      { src: partnershipCeremony, alt: "Siccotel and ZTE nubia teams at the partnership ceremony" },
      { src: partnershipLaunch, alt: "Siccotel and ZTE nubia representatives marking the partnership" },
    ],
  },
  {
    slug: "siccotel-x-zte-nubia-launch-event",
    title: "Siccotel × ZTE nubia Launch Event",
    summary:
      "The launch of ZTE nubia in collaboration with Siccotel celebrated innovation with device demos and presentations.",
    body: [
      "The launch of ZTE nubia in collaboration with Siccotel was a true celebration of innovation and technology.",
      "From the design of the device to the demos and presentations, every detail reflected the occasion, and the atmosphere was full of anticipation and enthusiasm.",
      "The launch marks a bold step forward in mobile innovation.",
    ],
    images: [{ src: launchEvent, alt: "Siccotel and ZTE nubia representatives with guests at the launch event" }],
  },
  {
    slug: "strategic-collaborations-at-mwc-barcelona-2025",
    title: "Strategic Collaborations at MWC Barcelona 2025",
    context: "MWC Barcelona 2025",
    summary:
      "Siccotel met Transsion Holdings and officials from leading device brands at one of the world’s largest mobile technology events.",
    body: [
      "Siccotel President Mr. Usman Sultan and Inovi Telecom CEO Mr. Zeeshan Mianoor attended MWC Barcelona 2025, one of the world’s largest and most influential events in the mobile technology industry. The event served as a platform to foster collaborations and explore future avenues in the telecom sector.",
      "During the event, they held a productive meeting with Transsion Holdings along with key brand officials from Infinix, Nokia-HMD, Honor, itel, Villaon and Tecno Mobile. The discussions focused on strengthening strategic partnerships and exploring collaborative ventures to enhance the mobile technology landscape in Pakistan and beyond.",
      "The meeting marks a significant milestone in collaborative innovation for the mobile technology sector in the years ahead.",
    ],
    images: [
      { src: mwcHmd, alt: "Siccotel representatives with industry executives at the HMD stand, MWC Barcelona 2025" },
      { src: mwcTecno, alt: "Siccotel representatives at the Tecno stand, MWC Barcelona 2025" },
      { src: mwc02, alt: "Siccotel representatives meeting a brand official at MWC Barcelona 2025" },
      { src: mwc03, alt: "Two Siccotel representatives at MWC Barcelona 2025" },
    ],
  },
  {
    slug: "strategic-partnership-for-innovation-and-growth-hmd",
    title: "A Strategic Partnership for Innovation and Growth",
    summary:
      "Siccotel met HMD Global’s leadership in China to discuss distribution, retail and potential manufacturing collaboration.",
    body: [
      "Siccotel MD Mr. Usman Sultan held a productive meeting in China with HMD Global’s Chief Operating Officer, Mr. Alain Lejeune, and Vice President of Product, Mr. KC Chang, to discuss future collaboration and strategies to establish HMD as the No. 1 smartphone brand in Pakistan.",
      "The discussion covered:",
      {
        list: [
          "Strengthening HMD’s presence in Pakistan’s growing smartphone market",
          "Enhancing local distribution and retail strategies",
          "Bringing Nokia and HMD devices to Pakistani consumers",
          "Exploring potential manufacturing and after-sales support opportunities",
        ],
      },
      "The meeting marks a significant step towards affordable, reliable and innovative mobile technology for Pakistan.",
    ],
    images: [{ src: hmdMeeting, alt: "Siccotel and HMD Global representatives at HMD’s offices" }],
  },
  {
    slug: "dealers-europe-tour",
    title: "Dealers Europe Tour",
    summary:
      "Dealers joined the Inovi Telecom and Siccotel teams on a tour of Frankfurt, Germany.",
    body: [
      {
        quote:
          "Exploring Frankfurt with the amazing team at Inovi Telecom & Siccotel! Dealer tour vibes: business by day, fun and chill by night. Creating memories and forging connections in the heart of Germany!",
      },
    ],
    images: [
      { src: tourFrankfurt, alt: "Dealers and team members gathered on a rooftop overlooking Frankfurt" },
      { src: tourRiver, alt: "Tour participants on a river boat in Frankfurt" },
      { src: tourGroup, alt: "The dealer tour group in front of a historic building in Europe" },
      { src: tourArcade, alt: "Tour participants in a decorated shopping arcade" },
    ],
  },
  {
    slug: "dr-umar-saif-meets-mobile-manufacturers",
    title: "Dr. Umar Saif Chairs a Meeting with Manufacturers",
    context: "ITCN Asia 2023",
    summary:
      "The IT Minister met mobile manufacturers to address industry challenges and promote “Made in Pakistan” products.",
    body: [
      "Dr. Umar Saif met manufacturers to underline the Government’s commitment to the industry’s growth and development, working with them to address industry-specific challenges and create an environment conducive to growth.",
      "The overarching objective of ITCN Asia 2023 was to strengthen the industry in Pakistan and promote “Made in Pakistan” products globally. The event gave industry players a unique platform to showcase innovative solutions and forge collaborations.",
      "The Pakistan Phone Manufacturers Association expressed gratitude to all stakeholders for their role in the success of ITCN Asia 2023. With 33 dedicated members, the association is committed to local mobile manufacturing, economic growth and advancing Pakistan’s technological capabilities.",
    ],
    images: [{ src: itcnVisit, alt: "Officials visiting a stand in the Mobile Phone Pavilion at ITCN Asia 2023" }],
  },
  {
    slug: "promoting-locally-manufactured-products",
    title: "Promoting Locally Manufactured Products",
    context: "ITCN Asia 2023",
    summary:
      "Government and industry collaborated at ITCN Asia 2023 to advance locally manufactured mobile phones.",
    body: [
      "Collaboration between government bodies and the private sector was pivotal in driving forward the agenda of promoting locally manufactured products.",
      "The Honourable Dr. Umar Saif, Minister of IT & Telecom, played a pivotal role in spearheading this initiative. Dr. Saif and his team — Mr. Faysal Ratyal (DG Telecom) and Dr. Khawar Siddique Khokhar (PTA) — visited the Mobile Phone Pavilion and held fruitful discussions with industry stakeholders. Their commitment to addressing industry challenges and bridging gaps was evident.",
    ],
    images: [{ src: itcnPavilion, alt: "Industry representatives at the Mobile Phone Pavilion, ITCN Asia 2023" }],
  },
  {
    slug: "itcn-asia-2023-milestone-for-mobile-manufacturing",
    title: "ITCN Asia 2023: A Milestone for Mobile Phone Manufacturing in Pakistan",
    context: "30 August – 2 September 2023",
    summary:
      "ITCN Asia 2023 debuted a Mobile Phone Pavilion showcasing Pakistan’s domestic mobile phone manufacturers.",
    body: [
      "ITCN Asia 2023, held at the Karachi Expo Centre from 30 August to 2 September 2023, had a significant influence on the promotion of domestic mobile phone manufacturing in Pakistan.",
      "This year’s exhibition included the debut of the Mobile Phone Pavilion, showcasing the nation’s technological capabilities. One of the most noteworthy aspects was the participation of 13 licence holders who took the stage for the first time — signalling a new era of collaboration and innovation within the Pakistani telecom sector.",
      "The event also saw the active involvement of 25 local and international brands, including Samsung Mobile, Nokia, Infinix, Vivo, Oppo, Sparx, itel, Tecno and Xiaomi. Their presence underscored their commitment to strengthening Pakistan’s technology industry.",
      "The event was made possible through the cooperation of the Ministry of Information Technology and the Pakistan Telecommunication Authority.",
    ],
    images: [],
  },
];

export const getArticle = (slug: string) => news.find((a) => a.slug === slug);
